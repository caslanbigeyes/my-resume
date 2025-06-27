'use client'

import React, { useState, useCallback } from 'react'
import { Send, Copy, Download, Clock, CheckCircle, XCircle, Code, Settings } from 'lucide-react'

interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers: { [key: string]: string }
  body: string
}

interface ApiResponse {
  status: number
  statusText: string
  headers: { [key: string]: string }
  data: string
  responseTime: number
  size: number
}

/**
 * API 测试工具组件
 * 测试 HTTP API 接口
 */
export default function ApiTesterPage() {
  const [request, setRequest] = useState<ApiRequest>({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {
      'Content-Type': 'application/json'
    },
    body: ''
  })
  
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'response'>('headers')

  // HTTP 方法选项
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

  // 预设请求示例
  const presetRequests = [
    {
      name: 'GET 用户列表',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    },
    {
      name: 'POST 创建文章',
      method: 'POST' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'foo',
        body: 'bar',
        userId: 1
      }, null, 2)
    },
    {
      name: 'GET GitHub API',
      method: 'GET' as const,
      url: 'https://api.github.com/users/octocat',
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      body: ''
    }
  ]

  // 发送请求
  const sendRequest = useCallback(async () => {
    if (!request.url.trim()) {
      setError('请输入 URL')
      return
    }

    setIsLoading(true)
    setError('')
    setResponse(null)

    const startTime = performance.now()

    try {
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: request.headers,
        mode: 'cors'
      }

      // 添加请求体（如果不是 GET 请求）
      if (request.method !== 'GET' && request.body.trim()) {
        fetchOptions.body = request.body
      }

      const res = await fetch(request.url, fetchOptions)
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      // 获取响应头
      const responseHeaders: { [key: string]: string } = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // 获取响应数据
      const contentType = res.headers.get('content-type') || ''
      let responseData: string

      if (contentType.includes('application/json')) {
        const jsonData = await res.json()
        responseData = JSON.stringify(jsonData, null, 2)
      } else {
        responseData = await res.text()
      }

      // 计算响应大小
      const size = new Blob([responseData]).size

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data: responseData,
        responseTime,
        size
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败')
    } finally {
      setIsLoading(false)
    }
  }, [request])

  // 更新请求头
  const updateHeaders = (headersText: string) => {
    try {
      const headers: { [key: string]: string } = {}
      headersText.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
          headers[key.trim()] = valueParts.join(':').trim()
        }
      })
      setRequest(prev => ({ ...prev, headers }))
    } catch (err) {
      // 忽略解析错误，保持原有状态
    }
  }

  // 获取请求头文本
  const getHeadersText = () => {
    return Object.entries(request.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载响应
  const downloadResponse = () => {
    if (!response) return

    const content = response.data
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'api-response.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 加载预设请求
  const loadPreset = (preset: typeof presetRequests[0]) => {
    // 过滤掉 undefined 的 header 值
    const filteredHeaders: { [key: string]: string } = {}
    Object.entries(preset.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredHeaders[key] = value
      }
    })

    setRequest({
      method: preset.method,
      url: preset.url,
      headers: filteredHeaders,
      body: preset.body
    })
    setResponse(null)
    setError('')
  }

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取状态码颜色
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400'
    if (status >= 500) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔧 API 测试工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            测试 HTTP API 接口，查看请求和响应详情
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：预设请求 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                预设请求
              </h3>
              
              <div className="space-y-2">
                {presetRequests.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => loadPreset(preset)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {preset.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-mono ${
                        preset.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        preset.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {preset.method}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 中间：请求配置 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 请求 URL 和方法 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex gap-3 mb-4">
                <select
                  value={request.method}
                  onChange={(e) => setRequest(prev => ({ ...prev, method: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {httpMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                
                <input
                  type="url"
                  value={request.url}
                  onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com/endpoint"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <button
                  onClick={sendRequest}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  发送
                </button>
              </div>

              {error && (
                <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* 标签页 */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="flex space-x-8">
                  {[
                    { id: 'headers', label: '请求头' },
                    { id: 'body', label: '请求体' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 请求头 */}
              {activeTab === 'headers' && (
                <div>
                  <textarea
                    value={getHeadersText()}
                    onChange={(e) => updateHeaders(e.target.value)}
                    placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* 请求体 */}
              {activeTab === 'body' && (
                <div>
                  <textarea
                    value={request.body}
                    onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                    placeholder='{"key": "value"}'
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 右侧：响应结果 */}
          <div className="space-y-6">
            {/* 响应状态 */}
            {response && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">响应状态</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {response.status >= 200 && response.status < 300 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-bold ${getStatusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{response.responseTime}ms</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    大小: {formatSize(response.size)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 响应详情 */}
        {response && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  响应详情
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(response.data)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    复制
                  </button>
                  <button
                    onClick={downloadResponse}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    下载
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* 响应头 */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">响应头</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key}>{key}: {value}</div>
                    ))}
                  </pre>
                </div>
              </div>

              {/* 响应体 */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">响应体</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                    {response.data}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 支持所有 HTTP 方法</li>
                <li>• 自定义请求头和请求体</li>
                <li>• 显示详细的响应信息</li>
                <li>• 测量响应时间和大小</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 使用预设请求快速开始</li>
                <li>• 检查 CORS 设置避免跨域问题</li>
                <li>• 复制响应数据进行进一步分析</li>
                <li>• 观察状态码判断请求是否成功</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
