'use client'

import React, { useState, useCallback } from 'react'
import { Copy, Download, RefreshCw, Code, Settings } from 'lucide-react'

interface FormatOptions {
  indentSize: number
  indentType: 'spaces' | 'tabs'
  maxLineLength: number
  insertFinalNewline: boolean
  trimTrailingWhitespace: boolean
}

/**
 * 代码格式化工具组件
 * 格式化多种编程语言的代码
 */
export default function CodeFormatterPage() {
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [options, setOptions] = useState<FormatOptions>({
    indentSize: 2,
    indentType: 'spaces',
    maxLineLength: 80,
    insertFinalNewline: true,
    trimTrailingWhitespace: true
  })

  // 支持的语言
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'sql', label: 'SQL' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ]

  // 获取缩进字符串
  const getIndent = useCallback((level: number): string => {
    const unit = options.indentType === 'spaces' ? ' '.repeat(options.indentSize) : '\t'
    return unit.repeat(level)
  }, [options.indentSize, options.indentType])

  // 格式化 JSON
  const formatJSON = useCallback((code: string): string => {
    try {
      const parsed = JSON.parse(code)
      return JSON.stringify(parsed, null, options.indentType === 'spaces' ? options.indentSize : '\t')
    } catch (error) {
      throw new Error('无效的 JSON 格式')
    }
  }, [options.indentSize, options.indentType])

  // 格式化 HTML
  const formatHTML = useCallback((code: string): string => {
    let formatted = ''
    let indent = 0
    const tokens = code.match(/<\/?[^>]+>|[^<]+/g) || []

    tokens.forEach(token => {
      const trimmed = token.trim()
      if (!trimmed) return

      if (trimmed.startsWith('</')) {
        // 结束标签
        indent = Math.max(0, indent - 1)
        formatted += getIndent(indent) + trimmed + '\n'
      } else if (trimmed.startsWith('<') && !trimmed.endsWith('/>')) {
        // 开始标签
        formatted += getIndent(indent) + trimmed + '\n'
        if (!trimmed.includes('</')) {
          indent++
        }
      } else if (trimmed.startsWith('<') && trimmed.endsWith('/>')) {
        // 自闭合标签
        formatted += getIndent(indent) + trimmed + '\n'
      } else {
        // 文本内容
        formatted += getIndent(indent) + trimmed + '\n'
      }
    })

    return formatted.trim()
  }, [getIndent])

  // 格式化 CSS
  const formatCSS = useCallback((code: string): string => {
    let formatted = code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/,\s*/g, ',\n')

    const lines = formatted.split('\n')
    let indent = 0
    const result: string[] = []

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) return

      if (trimmed === '}') {
        indent = Math.max(0, indent - 1)
        result.push(getIndent(indent) + trimmed)
      } else if (trimmed.endsWith('{')) {
        result.push(getIndent(indent) + trimmed)
        indent++
      } else {
        result.push(getIndent(indent) + trimmed)
      }
    })

    return result.join('\n')
  }, [getIndent])

  // 格式化 JavaScript/TypeScript
  const formatJavaScript = useCallback((code: string): string => {
    let formatted = code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/,\s*/g, ', ')

    const lines = formatted.split('\n')
    let indent = 0
    const result: string[] = []

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) return

      if (trimmed === '}' || trimmed.startsWith('}')) {
        indent = Math.max(0, indent - 1)
        result.push(getIndent(indent) + trimmed)
      } else if (trimmed.endsWith('{')) {
        result.push(getIndent(indent) + trimmed)
        indent++
      } else {
        result.push(getIndent(indent) + trimmed)
      }
    })

    return result.join('\n')
  }, [getIndent])

  // 格式化 SQL
  const formatSQL = useCallback((code: string): string => {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
      'ALTER', 'DROP', 'INDEX', 'TABLE', 'DATABASE', 'AND', 'OR', 'NOT', 'IN',
      'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'DISTINCT', 'COUNT', 'SUM',
      'AVG', 'MAX', 'MIN', 'AS', 'ON', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
    ]

    let formatted = code.toUpperCase()
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, `\n${keyword}`)
    })

    return formatted
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n')
  }, [])

  // 格式化 Python
  const formatPython = useCallback((code: string): string => {
    const lines = code.split('\n')
    let indent = 0
    const result: string[] = []

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) {
        result.push('')
        return
      }

      if (trimmed.startsWith('except') || trimmed.startsWith('elif') || 
          trimmed.startsWith('else') || trimmed.startsWith('finally')) {
        result.push(getIndent(Math.max(0, indent - 1)) + trimmed)
      } else {
        result.push(getIndent(indent) + trimmed)
      }

      if (trimmed.endsWith(':')) {
        indent++
      }
    })

    return result.join('\n')
  }, [getIndent])

  // 主格式化函数
  const formatCode = useCallback((code: string, lang: string): string => {
    if (!code.trim()) return ''

    let formatted = ''

    try {
      switch (lang) {
        case 'json':
          formatted = formatJSON(code)
          break
        case 'html':
        case 'xml':
          formatted = formatHTML(code)
          break
        case 'css':
          formatted = formatCSS(code)
          break
        case 'javascript':
        case 'typescript':
          formatted = formatJavaScript(code)
          break
        case 'sql':
          formatted = formatSQL(code)
          break
        case 'python':
          formatted = formatPython(code)
          break
        default:
          // 基本格式化
          formatted = code.split('\n').map(line => line.trim()).join('\n')
      }

      // 应用通用选项
      if (options.trimTrailingWhitespace) {
        formatted = formatted.replace(/[ \t]+$/gm, '')
      }

      if (options.insertFinalNewline && !formatted.endsWith('\n')) {
        formatted += '\n'
      }

      return formatted
    } catch (error) {
      throw error
    }
  }, [formatJSON, formatHTML, formatCSS, formatJavaScript, formatSQL, formatPython, options])

  // 处理格式化
  const handleFormat = useCallback(() => {
    if (!inputCode.trim()) {
      setOutputCode('')
      return
    }

    try {
      const formatted = formatCode(inputCode, language)
      setOutputCode(formatted)
    } catch (error) {
      setOutputCode(`格式化失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }, [inputCode, language, formatCode])

  // 自动格式化
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputCode.trim()) {
        handleFormat()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [inputCode, language, options, handleFormat])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载文件
  const downloadFile = (content: string) => {
    const extensions: { [key: string]: string } = {
      javascript: '.js',
      typescript: '.ts',
      html: '.html',
      css: '.css',
      json: '.json',
      xml: '.xml',
      sql: '.sql',
      python: '.py',
      java: '.java',
      cpp: '.cpp'
    }

    const extension = extensions[language] || '.txt'
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted_code${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 加载示例
  const loadExample = () => {
    const examples: { [key: string]: string } = {
      javascript: `function hello(name){if(name){console.log("Hello, "+name+"!");}else{console.log("Hello, World!");}}`,
      json: `{"name":"John","age":30,"city":"New York","hobbies":["reading","swimming"],"address":{"street":"123 Main St","zip":"10001"}}`,
      html: `<div class="container"><h1>Title</h1><p>This is a paragraph.</p><ul><li>Item 1</li><li>Item 2</li></ul></div>`,
      css: `body{margin:0;padding:0;font-family:Arial,sans-serif;}.container{max-width:800px;margin:0 auto;padding:20px;}h1{color:#333;font-size:24px;}`,
      sql: `select u.name, u.email, p.title from users u inner join posts p on u.id = p.user_id where u.active = 1 and p.published = 1 order by p.created_at desc;`,
      python: `def fibonacci(n):
if n <= 1:
return n
else:
return fibonacci(n-1) + fibonacci(n-2)
for i in range(10):
print(fibonacci(i))`
    }

    setInputCode(examples[language] || examples.javascript)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎨 代码格式化
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            格式化和美化多种编程语言的代码
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：设置面板 */}
          <div className="space-y-6">
            {/* 语言选择 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">语言选择</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            {/* 格式化选项 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                格式化选项
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    缩进类型
                  </label>
                  <select
                    value={options.indentType}
                    onChange={(e) => setOptions(prev => ({ ...prev, indentType: e.target.value as 'spaces' | 'tabs' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="spaces">空格</option>
                    <option value="tabs">制表符</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    缩进大小: {options.indentSize}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={options.indentSize}
                    onChange={(e) => setOptions(prev => ({ ...prev, indentSize: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大行长度: {options.maxLineLength}
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={options.maxLineLength}
                    onChange={(e) => setOptions(prev => ({ ...prev, maxLineLength: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.insertFinalNewline}
                      onChange={(e) => setOptions(prev => ({ ...prev, insertFinalNewline: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">文件末尾插入换行</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.trimTrailingWhitespace}
                      onChange={(e) => setOptions(prev => ({ ...prev, trimTrailingWhitespace: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">删除行尾空格</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">快速操作</h3>
              <div className="space-y-2">
                <button
                  onClick={loadExample}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  加载示例
                </button>
                <button
                  onClick={handleFormat}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新格式化
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：代码编辑区域 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 输入区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  代码输入
                </h3>
              </div>
              
              <div className="p-4">
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="粘贴或输入代码..."
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 输出区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">格式化结果</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(outputCode)}
                      disabled={!outputCode}
                      className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                    <button
                      onClick={() => downloadFile(outputCode)}
                      disabled={!outputCode}
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
                  value={outputCode}
                  readOnly
                  placeholder="格式化后的代码将显示在这里..."
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
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">支持语言</h4>
              <ul className="space-y-1">
                <li>• JavaScript/TypeScript 代码格式化</li>
                <li>• HTML/XML 标签格式化</li>
                <li>• CSS 样式格式化</li>
                <li>• JSON 数据格式化</li>
                <li>• SQL 查询格式化</li>
                <li>• Python 代码格式化</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">格式化选项</h4>
              <ul className="space-y-1">
                <li>• 自定义缩进类型和大小</li>
                <li>• 控制最大行长度</li>
                <li>• 自动删除行尾空格</li>
                <li>• 文件末尾插入换行符</li>
                <li>• 实时预览格式化结果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
