'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Download, RefreshCw, Settings, Code, FileText } from 'lucide-react'

interface CleaningOptions {
  removeComments: boolean
  removeEmptyLines: boolean
  removeExtraSpaces: boolean
  removeInlineStyles: boolean
  removeScriptTags: boolean
  removeStyleTags: boolean
  removeAttributes: string[]
  allowedTags: string[]
  minifyOutput: boolean
  preserveFormatting: boolean
}

/**
 * HTML 标签清理工具组件
 * 清理和优化 HTML 代码
 */
export default function HtmlCleanerPage() {
  const [inputHtml, setInputHtml] = useState('')
  const [outputHtml, setOutputHtml] = useState('')
  const [options, setOptions] = useState<CleaningOptions>({
    removeComments: true,
    removeEmptyLines: true,
    removeExtraSpaces: true,
    removeInlineStyles: false,
    removeScriptTags: false,
    removeStyleTags: false,
    removeAttributes: [],
    allowedTags: [],
    minifyOutput: false,
    preserveFormatting: false
  })

  // 常用的不安全属性
  const unsafeAttributes = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset'
  ]

  // 常用的允许标签
  const commonTags = [
    'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
    'strong', 'em', 'b', 'i', 'u', 'br', 'hr'
  ]

  // 清理 HTML
  const cleanHtml = useCallback((html: string, cleaningOptions: CleaningOptions): string => {
    let cleaned = html

    // 移除注释
    if (cleaningOptions.removeComments) {
      cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')
    }

    // 移除脚本标签
    if (cleaningOptions.removeScriptTags) {
      cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    }

    // 移除样式标签
    if (cleaningOptions.removeStyleTags) {
      cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    }

    // 移除内联样式
    if (cleaningOptions.removeInlineStyles) {
      cleaned = cleaned.replace(/\sstyle\s*=\s*["'][^"']*["']/gi, '')
    }

    // 移除指定属性
    if (cleaningOptions.removeAttributes.length > 0) {
      cleaningOptions.removeAttributes.forEach(attr => {
        const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
        cleaned = cleaned.replace(regex, '')
      })
    }

    // 只保留允许的标签
    if (cleaningOptions.allowedTags.length > 0) {
      const allowedTagsSet = new Set(cleaningOptions.allowedTags.map(tag => tag.toLowerCase()))
      
      // 移除不允许的标签
      cleaned = cleaned.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tagName) => {
        if (allowedTagsSet.has(tagName.toLowerCase())) {
          return match
        }
        return ''
      })
    }

    // 移除多余空格
    if (cleaningOptions.removeExtraSpaces) {
      cleaned = cleaned.replace(/\s+/g, ' ')
      cleaned = cleaned.replace(/>\s+</g, '><')
    }

    // 移除空行
    if (cleaningOptions.removeEmptyLines) {
      cleaned = cleaned.replace(/^\s*[\r\n]/gm, '')
    }

    // 压缩输出
    if (cleaningOptions.minifyOutput) {
      cleaned = cleaned.replace(/\s+/g, ' ')
      cleaned = cleaned.replace(/>\s+</g, '><')
      cleaned = cleaned.trim()
    }

    // 格式化输出
    if (cleaningOptions.preserveFormatting && !cleaningOptions.minifyOutput) {
      cleaned = formatHtml(cleaned)
    }

    return cleaned.trim()
  }, [])

  // 格式化 HTML
  const formatHtml = useCallback((html: string): string => {
    let formatted = ''
    let indent = 0
    const indentSize = 2

    const tokens = html.match(/<\/?[^>]+>|[^<]+/g) || []

    tokens.forEach(token => {
      if (token.trim()) {
        if (token.startsWith('</')) {
          // 结束标签
          indent = Math.max(0, indent - indentSize)
          formatted += ' '.repeat(indent) + token.trim() + '\n'
        } else if (token.startsWith('<') && !token.endsWith('/>')) {
          // 开始标签
          formatted += ' '.repeat(indent) + token.trim() + '\n'
          if (!token.includes('</')) {
            indent += indentSize
          }
        } else if (token.startsWith('<') && token.endsWith('/>')) {
          // 自闭合标签
          formatted += ' '.repeat(indent) + token.trim() + '\n'
        } else {
          // 文本内容
          const text = token.trim()
          if (text) {
            formatted += ' '.repeat(indent) + text + '\n'
          }
        }
      }
    })

    return formatted.trim()
  }, [])

  // 处理清理
  const handleClean = useCallback(() => {
    if (!inputHtml.trim()) {
      setOutputHtml('')
      return
    }

    try {
      const cleaned = cleanHtml(inputHtml, options)
      setOutputHtml(cleaned)
    } catch (error) {
      console.error('清理失败:', error)
      setOutputHtml('清理失败，请检查 HTML 格式')
    }
  }, [inputHtml, options, cleanHtml])

  // 自动清理
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputHtml.trim()) {
        handleClean()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [inputHtml, options, handleClean])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载文件
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 加载示例
  const loadExample = () => {
    const exampleHtml = `<!DOCTYPE html>
<html>
<head>
    <title>示例页面</title>
    <style>
        body { margin: 0; padding: 20px; }
        .container { max-width: 800px; }
    </style>
</head>
<body>
    <!-- 这是一个注释 -->
    <div class="container" style="background: #f0f0f0;">
        <h1 onclick="alert('Hello')">标题</h1>
        <p>这是一个段落。</p>
        
        <script>
            console.log('这是脚本');
        </script>
        
        <ul>
            <li>列表项 1</li>
            <li>列表项 2</li>
        </ul>
    </div>
</body>
</html>`
    setInputHtml(exampleHtml)
  }

  // 统计信息
  const stats = useMemo(() => {
    const inputSize = new Blob([inputHtml]).size
    const outputSize = new Blob([outputHtml]).size
    const reduction = inputSize > 0 ? ((inputSize - outputSize) / inputSize * 100).toFixed(1) : '0'
    
    return {
      inputSize,
      outputSize,
      reduction: parseFloat(reduction)
    }
  }, [inputHtml, outputHtml])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🧹 HTML 标签清理
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            清理和优化 HTML 代码，移除不需要的标签和属性
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：清理选项 */}
          <div className="space-y-6">
            {/* 基本选项 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                清理选项
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.removeComments}
                    onChange={(e) => setOptions(prev => ({ ...prev, removeComments: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">移除注释</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.removeEmptyLines}
                    onChange={(e) => setOptions(prev => ({ ...prev, removeEmptyLines: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">移除空行</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.removeExtraSpaces}
                    onChange={(e) => setOptions(prev => ({ ...prev, removeExtraSpaces: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">移除多余空格</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.removeInlineStyles}
                    onChange={(e) => setOptions(prev => ({ ...prev, removeInlineStyles: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">移除内联样式</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.removeScriptTags}
                    onChange={(e) => setOptions(prev => ({ ...prev, removeScriptTags: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">移除脚本标签</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.removeStyleTags}
                    onChange={(e) => setOptions(prev => ({ ...prev, removeStyleTags: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">移除样式标签</span>
                </label>
              </div>
            </div>

            {/* 格式化选项 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">格式化</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.minifyOutput}
                    onChange={(e) => setOptions(prev => ({ ...prev, minifyOutput: e.target.checked, preserveFormatting: e.target.checked ? false : prev.preserveFormatting }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">压缩输出</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.preserveFormatting}
                    onChange={(e) => setOptions(prev => ({ ...prev, preserveFormatting: e.target.checked, minifyOutput: e.target.checked ? false : prev.minifyOutput }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">格式化输出</span>
                </label>
              </div>
            </div>

            {/* 快速设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">快速设置</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setOptions(prev => ({ ...prev, removeAttributes: unsafeAttributes }))}
                  className="w-full text-left px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
                >
                  移除不安全属性
                </button>
                
                <button
                  onClick={() => setOptions(prev => ({ ...prev, allowedTags: commonTags }))}
                  className="w-full text-left px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
                >
                  只保留常用标签
                </button>
                
                <button
                  onClick={() => setOptions({
                    removeComments: true,
                    removeEmptyLines: true,
                    removeExtraSpaces: true,
                    removeInlineStyles: true,
                    removeScriptTags: true,
                    removeStyleTags: true,
                    removeAttributes: unsafeAttributes,
                    allowedTags: [],
                    minifyOutput: true,
                    preserveFormatting: false
                  })}
                  className="w-full text-left px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                >
                  深度清理
                </button>
              </div>
            </div>

            {/* 统计信息 */}
            {outputHtml && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">统计信息</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">原始大小:</span>
                    <span className="text-gray-900 dark:text-gray-100">{stats.inputSize} 字节</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">清理后:</span>
                    <span className="text-gray-900 dark:text-gray-100">{stats.outputSize} 字节</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">减少:</span>
                    <span className={`${stats.reduction > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {stats.reduction}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：输入输出区域 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 输入区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    HTML 输入
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={loadExample}
                      className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                    >
                      加载示例
                    </button>
                    <button
                      onClick={handleClean}
                      className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      清理
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <textarea
                  value={inputHtml}
                  onChange={(e) => setInputHtml(e.target.value)}
                  placeholder="粘贴或输入 HTML 代码..."
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 输出区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    清理结果
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(outputHtml)}
                      disabled={!outputHtml}
                      className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                    <button
                      onClick={() => downloadFile(outputHtml, 'cleaned.html')}
                      disabled={!outputHtml}
                      className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <textarea
                  value={outputHtml}
                  readOnly
                  placeholder="清理后的 HTML 代码将显示在这里..."
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">清理功能</h4>
              <ul className="space-y-1">
                <li>• 移除 HTML 注释和空行</li>
                <li>• 清理多余的空格和格式</li>
                <li>• 移除不安全的属性和标签</li>
                <li>• 过滤指定的标签和属性</li>
                <li>• 压缩或格式化输出</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用场景</h4>
              <ul className="space-y-1">
                <li>• 清理从其他来源复制的 HTML</li>
                <li>• 移除潜在的安全风险</li>
                <li>• 优化 HTML 代码大小</li>
                <li>• 标准化 HTML 格式</li>
                <li>• 准备用于邮件或 CMS 的内容</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
