'use client'

import React, { useState, useCallback } from 'react'
import { Copy, Download, FileText, Code, Settings } from 'lucide-react'

/**
 * HTML 转文本工具组件
 * 从 HTML 中提取纯文本内容
 */
export default function HtmlToTextPage() {
  const [htmlInput, setHtmlInput] = useState('')
  const [textOutput, setTextOutput] = useState('')
  const [options, setOptions] = useState({
    preserveLineBreaks: true,
    preserveSpaces: false,
    removeExtraWhitespace: true,
    convertEntities: true
  })

  // HTML 实体解码
  const decodeHtmlEntities = useCallback((text: string): string => {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™'
    }
    
    return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
      return entities[entity] || entity
    })
  }, [])

  // HTML 转文本处理
  const convertHtmlToText = useCallback((html: string): string => {
    if (!html.trim()) return ''

    let text = html

    // 移除 script 和 style 标签及其内容
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

    // 处理块级元素，添加换行
    const blockElements = [
      'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'section', 'article', 'header', 'footer', 'nav',
      'ul', 'ol', 'li', 'blockquote', 'pre'
    ]
    
    blockElements.forEach(tag => {
      const regex = new RegExp(`</${tag}>`, 'gi')
      text = text.replace(regex, `</${tag}>\n`)
    })

    // 处理 br 标签
    text = text.replace(/<br\s*\/?>/gi, '\n')

    // 移除所有 HTML 标签
    text = text.replace(/<[^>]*>/g, '')

    // 解码 HTML 实体
    if (options.convertEntities) {
      text = decodeHtmlEntities(text)
    }

    // 处理空白字符
    if (options.removeExtraWhitespace) {
      // 移除多余的空白字符
      text = text.replace(/[ \t]+/g, ' ')
      // 移除多余的换行
      text = text.replace(/\n\s*\n\s*\n/g, '\n\n')
    }

    if (!options.preserveSpaces) {
      text = text.replace(/[ \t]+/g, ' ')
    }

    if (!options.preserveLineBreaks) {
      text = text.replace(/\n+/g, ' ')
    }

    // 清理首尾空白
    text = text.trim()

    return text
  }, [options, decodeHtmlEntities])

  // 实时转换
  React.useEffect(() => {
    const result = convertHtmlToText(htmlInput)
    setTextOutput(result)
  }, [htmlInput, convertHtmlToText])

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
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 示例 HTML
  const loadExample = () => {
    setHtmlInput(`<!DOCTYPE html>
<html>
<head>
    <title>示例页面</title>
    <style>
        body { font-family: Arial, sans-serif; }
    </style>
</head>
<body>
    <header>
        <h1>欢迎来到我的网站</h1>
        <nav>
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于</a></li>
                <li><a href="#contact">联系</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section>
            <h2>关于我们</h2>
            <p>这是一个<strong>示例段落</strong>，包含了一些<em>格式化文本</em>。</p>
            <p>我们提供以下服务：</p>
            <ul>
                <li>网站开发</li>
                <li>移动应用开发</li>
                <li>UI/UX 设计</li>
            </ul>
        </section>
        
        <section>
            <h2>联系信息</h2>
            <p>邮箱：<a href="mailto:info@example.com">info@example.com</a></p>
            <p>电话：+86 123-4567-8900</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 我的公司。保留所有权利。</p>
    </footer>
    
    <script>
        console.log('这段脚本不会出现在文本中');
    </script>
</body>
</html>`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🏷️ HTML 转文本工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            从 HTML 代码中提取纯文本内容
          </p>
        </div>

        {/* 设置选项 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">转换选项</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.preserveLineBreaks}
                onChange={(e) => setOptions(prev => ({ ...prev, preserveLineBreaks: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">保留换行</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.preserveSpaces}
                onChange={(e) => setOptions(prev => ({ ...prev, preserveSpaces: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">保留空格</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.removeExtraWhitespace}
                onChange={(e) => setOptions(prev => ({ ...prev, removeExtraWhitespace: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">移除多余空白</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.convertEntities}
                onChange={(e) => setOptions(prev => ({ ...prev, convertEntities: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">转换HTML实体</span>
            </label>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HTML 输入区域 */}
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
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    示例
                  </button>
                  <button
                    onClick={() => setHtmlInput('')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="粘贴 HTML 代码..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 文本输出区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  文本输出
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(textOutput)}
                    disabled={!textOutput}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    复制
                  </button>
                  <button
                    onClick={() => downloadFile(textOutput, 'extracted-text.txt')}
                    disabled={!textOutput}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    下载
                  </button>
                </div>
              </div>
              {textOutput && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  字符数: {textOutput.length} | 行数: {textOutput.split('\n').length}
                </div>
              )}
            </div>
            <div className="p-4">
              <textarea
                value={textOutput}
                readOnly
                placeholder="提取的文本将显示在这里..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">功能特点</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">自动处理</h4>
              <ul className="space-y-1">
                <li>• 移除所有 HTML 标签</li>
                <li>• 自动移除 script 和 style 内容</li>
                <li>• 保持文本结构和换行</li>
                <li>• 转换 HTML 实体字符</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">自定义选项</h4>
              <ul className="space-y-1">
                <li>• 可选择是否保留换行符</li>
                <li>• 可控制空白字符处理</li>
                <li>• 支持移除多余空白</li>
                <li>• 灵活的格式化选项</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
