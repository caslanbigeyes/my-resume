'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Download, Link, Code, AlertCircle, Info } from 'lucide-react'

/**
 * URL 编码解码工具组件
 * URL 编码解码和组件解析
 */
export default function UrlEncodePage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeType, setEncodeType] = useState<'component' | 'uri'>('component')
  const [error, setError] = useState('')

  // URL 编码
  const encodeUrl = useCallback((text: string, type: 'component' | 'uri'): string => {
    try {
      if (type === 'component') {
        return encodeURIComponent(text)
      } else {
        return encodeURI(text)
      }
    } catch (err) {
      throw new Error('编码失败：输入包含无效字符')
    }
  }, [])

  // URL 解码
  const decodeUrl = useCallback((text: string): string => {
    try {
      return decodeURIComponent(text)
    } catch (err) {
      throw new Error('解码失败：无效的 URL 编码格式')
    }
  }, [])

  // 处理转换
  const handleConvert = useCallback(() => {
    setError('')
    
    try {
      if (mode === 'encode') {
        const encoded = encodeUrl(input, encodeType)
        setOutput(encoded)
      } else {
        const decoded = decodeUrl(input)
        setOutput(decoded)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败')
      setOutput('')
    }
  }, [input, mode, encodeType, encodeUrl, decodeUrl])

  // 实时转换
  React.useEffect(() => {
    if (input.trim()) {
      handleConvert()
    } else {
      setOutput('')
      setError('')
    }
  }, [input, mode, encodeType, handleConvert])

  // 解析 URL 组件
  const urlComponents = useMemo(() => {
    if (mode === 'decode' && output && !error) {
      try {
        const url = new URL(output.startsWith('http') ? output : `https://${output}`)
        return {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          origin: url.origin
        }
      } catch {
        return null
      }
    }
    return null
  }, [mode, output, error])

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

  // 示例数据
  const loadExample = () => {
    if (mode === 'encode') {
      setInput('https://example.com/search?q=你好世界&type=文档#结果')
    } else {
      setInput('https%3A//example.com/search%3Fq%3D%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C%26type%3D%E6%96%87%E6%A1%A3%23%E7%BB%93%E6%9E%9C')
    }
  }

  // 常用字符编码对照
  const commonEncodings = [
    { char: ' ', encoded: '%20', name: '空格' },
    { char: '!', encoded: '%21', name: '感叹号' },
    { char: '"', encoded: '%22', name: '双引号' },
    { char: '#', encoded: '%23', name: '井号' },
    { char: '$', encoded: '%24', name: '美元符' },
    { char: '%', encoded: '%25', name: '百分号' },
    { char: '&', encoded: '%26', name: '和号' },
    { char: "'", encoded: '%27', name: '单引号' },
    { char: '(', encoded: '%28', name: '左括号' },
    { char: ')', encoded: '%29', name: '右括号' },
    { char: '+', encoded: '%2B', name: '加号' },
    { char: ',', encoded: '%2C', name: '逗号' },
    { char: '/', encoded: '%2F', name: '斜杠' },
    { char: ':', encoded: '%3A', name: '冒号' },
    { char: ';', encoded: '%3B', name: '分号' },
    { char: '=', encoded: '%3D', name: '等号' },
    { char: '?', encoded: '%3F', name: '问号' },
    { char: '@', encoded: '%40', name: '@符号' },
    { char: '[', encoded: '%5B', name: '左方括号' },
    { char: ']', encoded: '%5D', name: '右方括号' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🌐 URL 编码解码工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            URL 编码解码和组件解析工具
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 模式切换 */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setMode('encode')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'encode'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                编码
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'decode'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Link className="w-4 h-4 inline mr-2" />
                解码
              </button>
            </div>

            {/* 编码类型 */}
            {mode === 'encode' && (
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setEncodeType('component')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    encodeType === 'component'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Component
                </button>
                <button
                  onClick={() => setEncodeType('uri')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    encodeType === 'uri'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  URI
                </button>
              </div>
            )}

            {/* 示例按钮 */}
            <button
              onClick={loadExample}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              示例
            </button>

            {/* 清空按钮 */}
            <button
              onClick={() => {
                setInput('')
                setOutput('')
                setError('')
              }}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              清空
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {mode === 'encode' ? '原始 URL' : '编码后的 URL'}
              </h3>
              {mode === 'encode' && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {encodeType === 'component' ? 'encodeURIComponent - 编码所有特殊字符' : 'encodeURI - 保留 URL 结构字符'}
                </p>
              )}
            </div>
            <div className="p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? '输入要编码的 URL...' : '输入要解码的 URL...'}
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              {input && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  输入长度: {input.length} 字符
                </div>
              )}
            </div>
          </div>

          {/* 右侧：输出区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {mode === 'encode' ? '编码结果' : '解码结果'}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(output)}
                    disabled={!output}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    复制
                  </button>
                  <button
                    onClick={() => downloadFile(output, mode === 'encode' ? 'encoded-url.txt' : 'decoded-url.txt')}
                    disabled={!output}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    下载
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={output}
                readOnly
                placeholder={mode === 'encode' ? '编码结果将显示在这里...' : '解码结果将显示在这里...'}
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm resize-none"
              />
              
              {output && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  输出长度: {output.length} 字符
                </div>
              )}
            </div>
          </div>
        </div>

        {/* URL 组件解析 */}
        {urlComponents && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Info className="w-5 h-5" />
                URL 组件解析
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(urlComponents).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key}:
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                          {value}
                        </code>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 常用字符编码对照表 */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">常用字符编码对照</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {commonEncodings.map((item, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-lg font-mono mb-1">{item.char}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-mono mb-1">{item.encoded}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">编码类型</h4>
              <ul className="space-y-1">
                <li>• <strong>encodeURIComponent:</strong> 编码所有特殊字符，适用于 URL 参数</li>
                <li>• <strong>encodeURI:</strong> 保留 URL 结构字符，适用于完整 URL</li>
                <li>• 自动处理中文和特殊字符</li>
                <li>• 支持批量处理</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 实时编码解码转换</li>
                <li>• URL 组件自动解析</li>
                <li>• 常用字符编码对照</li>
                <li>• 支持复制和下载结果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
