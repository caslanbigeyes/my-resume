'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Download, Code, Settings, Wand2, AlertCircle } from 'lucide-react'

interface CSSFormatOptions {
  indentSize: number
  indentType: 'spaces' | 'tabs'
  newlineAfterRule: boolean
  newlineAfterProperty: boolean
  spaceAroundSelector: boolean
  spaceBeforeBrace: boolean
  spaceAfterColon: boolean
  preserveComments: boolean
  sortProperties: boolean
  removeEmptyRules: boolean
}

/**
 * CSS 美化工具组件
 * 格式化和美化 CSS 代码
 */
export default function CssBeautifyPage() {
  const [cssInput, setCssInput] = useState('')
  const [options, setOptions] = useState<CSSFormatOptions>({
    indentSize: 2,
    indentType: 'spaces',
    newlineAfterRule: true,
    newlineAfterProperty: true,
    spaceAroundSelector: false,
    spaceBeforeBrace: true,
    spaceAfterColon: true,
    preserveComments: true,
    sortProperties: false,
    removeEmptyRules: true
  })
  const [error, setError] = useState('')

  // CSS 属性排序顺序
  const propertyOrder = [
    // 定位
    'position', 'top', 'right', 'bottom', 'left', 'z-index',
    // 显示
    'display', 'visibility', 'float', 'clear', 'overflow', 'overflow-x', 'overflow-y',
    // 盒模型
    'box-sizing', 'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    // 边框
    'border', 'border-width', 'border-style', 'border-color', 'border-radius',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    // 背景
    'background', 'background-color', 'background-image', 'background-repeat',
    'background-position', 'background-size', 'background-attachment',
    // 文本
    'color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style',
    'line-height', 'text-align', 'text-decoration', 'text-transform',
    // 其他
    'opacity', 'cursor', 'transition', 'transform', 'animation'
  ]

  // 解析 CSS 规则
  const parseCSS = useCallback((css: string) => {
    const rules: Array<{
      selector: string
      properties: Array<{ property: string; value: string }>
      comments: string[]
    }> = []

    // 移除多行注释但保存位置
    const comments: string[] = []
    let cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      comments.push(match)
      return `__COMMENT_${comments.length - 1}__`
    })

    // 分割规则
    const ruleBlocks = cssWithoutComments.split('}').filter(block => block.trim())

    ruleBlocks.forEach(block => {
      const trimmedBlock = block.trim()
      if (!trimmedBlock) return

      const selectorEndIndex = trimmedBlock.indexOf('{')
      if (selectorEndIndex === -1) return

      const selector = trimmedBlock.substring(0, selectorEndIndex).trim()
      const propertiesText = trimmedBlock.substring(selectorEndIndex + 1).trim()

      const properties: Array<{ property: string; value: string }> = []
      
      if (propertiesText) {
        const propertyLines = propertiesText.split(';').filter(line => line.trim())
        
        propertyLines.forEach(line => {
          const colonIndex = line.indexOf(':')
          if (colonIndex !== -1) {
            const property = line.substring(0, colonIndex).trim()
            const value = line.substring(colonIndex + 1).trim()
            if (property && value) {
              properties.push({ property, value })
            }
          }
        })
      }

      if (selector && (properties.length > 0 || !options.removeEmptyRules)) {
        rules.push({
          selector,
          properties,
          comments: []
        })
      }
    })

    return { rules, comments }
  }, [options.removeEmptyRules])

  // 格式化 CSS
  const formatCSS = useCallback((css: string): string => {
    if (!css.trim()) return ''

    try {
      const { rules, comments } = parseCSS(css)
      
      const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize)
      const formatted: string[] = []

      rules.forEach((rule, ruleIndex) => {
        // 选择器
        let selectorLine = rule.selector
        if (options.spaceAroundSelector) {
          selectorLine = selectorLine.trim()
        }
        
        if (options.spaceBeforeBrace) {
          selectorLine += ' {'
        } else {
          selectorLine += '{'
        }
        
        formatted.push(selectorLine)

        // 属性
        let properties = [...rule.properties]
        
        // 排序属性
        if (options.sortProperties) {
          properties.sort((a, b) => {
            const aIndex = propertyOrder.indexOf(a.property)
            const bIndex = propertyOrder.indexOf(b.property)
            
            if (aIndex === -1 && bIndex === -1) {
              return a.property.localeCompare(b.property)
            }
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1
            return aIndex - bIndex
          })
        }

        properties.forEach((prop, propIndex) => {
          let propertyLine = indent + prop.property
          
          if (options.spaceAfterColon) {
            propertyLine += ': ' + prop.value
          } else {
            propertyLine += ':' + prop.value
          }
          
          propertyLine += ';'
          
          formatted.push(propertyLine)
        })

        formatted.push('}')
        
        // 规则之间的换行
        if (options.newlineAfterRule && ruleIndex < rules.length - 1) {
          formatted.push('')
        }
      })

      let result = formatted.join('\n')

      // 恢复注释
      if (options.preserveComments) {
        comments.forEach((comment, index) => {
          result = result.replace(`__COMMENT_${index}__`, comment)
        })
      }

      return result
    } catch (err) {
      throw new Error('CSS 格式化失败')
    }
  }, [options, parseCSS, propertyOrder])

  // 格式化后的 CSS
  const formattedCSS = useMemo(() => {
    if (!cssInput.trim()) {
      return ''
    }

    try {
      return formatCSS(cssInput)
    } catch (err) {
      return ''
    }
  }, [cssInput, formatCSS])

  // 处理错误状态
  React.useEffect(() => {
    if (!cssInput.trim()) {
      setError('')
      return
    }

    try {
      formatCSS(cssInput)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'CSS 格式化失败'
      setError(errorMessage)
    }
  }, [cssInput, formatCSS])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载文件
  const downloadCSS = () => {
    if (!formattedCSS) return

    const blob = new Blob([formattedCSS], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.css'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 压缩 CSS
  const minifyCSS = () => {
    if (!cssInput.trim()) return

    try {
      const { rules } = parseCSS(cssInput)
      const minified = rules.map(rule => {
        const properties = rule.properties.map(prop => `${prop.property}:${prop.value}`).join(';')
        return `${rule.selector}{${properties}}`
      }).join('')
      
      setCssInput(minified)
    } catch (err) {
      setError('CSS 压缩失败')
    }
  }

  // 示例 CSS
  const loadExample = () => {
    const exampleCSS = `.container{display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f0f0f0}.card{background:white;padding:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);max-width:400px;width:100%}.title{font-size:24px;font-weight:bold;color:#333;margin-bottom:16px;text-align:center}.description{color:#666;line-height:1.5;margin-bottom:20px}.button{background:#007bff;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;transition:background 0.3s}.button:hover{background:#0056b3}`

    setCssInput(exampleCSS)
  }

  // 清空内容
  const clearContent = () => {
    setCssInput('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎨 CSS 美化工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            格式化和美化 CSS 代码，提高代码可读性
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 缩进设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                缩进类型
              </label>
              <select
                value={options.indentType}
                onChange={(e) => setOptions(prev => ({ ...prev, indentType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="spaces">空格</option>
                <option value="tabs">制表符</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                缩进大小
              </label>
              <select
                value={options.indentSize}
                onChange={(e) => setOptions(prev => ({ ...prev, indentSize: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>

            {/* 操作按钮 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                操作
              </label>
              <button
                onClick={loadExample}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                示例
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                &nbsp;
              </label>
              <button
                onClick={minifyCSS}
                disabled={!cssInput.trim()}
                className="w-full px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Wand2 className="w-4 h-4 inline mr-1" />
                压缩
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                &nbsp;
              </label>
              <button
                onClick={clearContent}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                清空
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                &nbsp;
              </label>
              <button
                onClick={downloadCSS}
                disabled={!formattedCSS}
                className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4 inline mr-1" />
                下载
              </button>
            </div>
          </div>

          {/* 格式化选项 */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { key: 'spaceBeforeBrace', label: '大括号前空格' },
                { key: 'spaceAfterColon', label: '冒号后空格' },
                { key: 'newlineAfterRule', label: '规则后换行' },
                { key: 'sortProperties', label: '属性排序' },
                { key: 'removeEmptyRules', label: '移除空规则' },
                { key: 'preserveComments', label: '保留注释' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options[key as keyof CSSFormatOptions] as boolean}
                    onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：CSS 输入 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Code className="w-5 h-5" />
                CSS 输入
              </h3>
            </div>
            <div className="p-4">
              <textarea
                value={cssInput}
                onChange={(e) => setCssInput(e.target.value)}
                placeholder="输入 CSS 代码..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              {cssInput && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  输入长度: {cssInput.length} 字符
                </div>
              )}
            </div>
          </div>

          {/* 右侧：格式化输出 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  格式化输出
                </h3>
                <button
                  onClick={() => copyToClipboard(formattedCSS)}
                  disabled={!formattedCSS}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Copy className="w-4 h-4 inline mr-1" />
                  复制
                </button>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={formattedCSS}
                readOnly
                placeholder="格式化的 CSS 将显示在这里..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none"
              />
              
              {formattedCSS && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  输出长度: {formattedCSS.length} 字符 • 行数: {formattedCSS.split('\n').length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">格式化功能</h4>
              <ul className="space-y-1">
                <li>• 自动缩进和换行</li>
                <li>• 属性按逻辑顺序排序</li>
                <li>• 移除多余的空白字符</li>
                <li>• 统一代码风格</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">高级选项</h4>
              <ul className="space-y-1">
                <li>• 可选择空格或制表符缩进</li>
                <li>• 自定义空格和换行规则</li>
                <li>• 支持 CSS 压缩</li>
                <li>• 保留或移除注释</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
