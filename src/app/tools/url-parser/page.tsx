'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Link, Copy, Globe, Lock, Unlock } from 'lucide-react'

/**
 * URL解析器工具组件
 * 解析URL各个组成部分
 */
export default function UrlParserTool() {
  const [url, setUrl] = useState('')

  /**
   * 解析URL
   */
  const parsedUrl = useMemo(() => {
    if (!url.trim()) return null

    try {
      const urlObj = new URL(url)
      
      // 解析查询参数
      const searchParams: Record<string, string> = {}
      urlObj.searchParams.forEach((value, key) => {
        searchParams[key] = value
      })

      // 解析路径段
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment !== '')

      // 检测URL类型
      const isSecure = urlObj.protocol === 'https:'
      const isLocalhost = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1'
      const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)
      
      // 获取顶级域名
      const domainParts = urlObj.hostname.split('.')
      const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : ''
      const domain = domainParts.length > 1 ? domainParts.slice(-2).join('.') : urlObj.hostname
      const subdomain = domainParts.length > 2 ? domainParts.slice(0, -2).join('.') : ''

      return {
        original: url,
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        username: urlObj.username,
        password: urlObj.password,
        origin: urlObj.origin,
        href: urlObj.href,
        searchParams,
        pathSegments,
        isSecure,
        isLocalhost,
        isIP,
        tld,
        domain,
        subdomain
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : '无效的URL格式'
      }
    }
  }, [url])

  /**
   * 复制值到剪贴板
   */
  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      alert(`${label}已复制到剪贴板`)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * URL编码/解码
   */
  const encodeUrl = (str: string): string => {
    try {
      return encodeURIComponent(str)
    } catch {
      return str
    }
  }

  const decodeUrl = (str: string): string => {
    try {
      return decodeURIComponent(str)
    } catch {
      return str
    }
  }

  /**
   * 示例URL
   */
  const exampleUrls = [
    'https://www.example.com:8080/path/to/page?param1=value1&param2=value2#section',
    'http://subdomain.example.com/api/v1/users?limit=10&offset=20',
    'https://user:pass@secure.example.com/dashboard',
    'ftp://files.example.com:21/documents/file.pdf',
    'mailto:user@example.com?subject=Hello&body=World'
  ]

  return (
    <ToolLayout
      title="URL解析器"
      description="解析URL各个组成部分"
      category="数据可视化"
      icon="🔗"
    >
      <div className="space-y-6">
        {/* URL输入 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Link className="w-5 h-5" />
              URL输入
            </h3>
          </div>
          
          <div className="space-y-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="输入要解析的URL..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* 示例URL */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">示例URL</h4>
              <div className="space-y-1">
                {exampleUrls.map((exampleUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setUrl(exampleUrl)}
                    className="block w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors font-mono"
                  >
                    {exampleUrl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 解析结果 */}
        {parsedUrl && (
          <div className="space-y-4">
            {parsedUrl.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">
                  <strong>解析错误:</strong> {parsedUrl.error}
                </div>
              </div>
            ) : (
              <>
                {/* 基本信息 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    基本信息
                    {parsedUrl.isSecure ? (
                      <Lock className="w-4 h-4 text-green-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-orange-500" />
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">协议:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {parsedUrl.protocol}
                          </code>
                          <button
                            onClick={() => copyToClipboard(parsedUrl.protocol || '', '协议')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">主机名:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {parsedUrl.hostname}
                          </code>
                          <button
                            onClick={() => copyToClipboard(parsedUrl.hostname || '', '主机名')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">端口:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {parsedUrl.port}
                          </code>
                          <button
                            onClick={() => copyToClipboard(parsedUrl.port || '', '端口')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">路径:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm max-w-48 truncate">
                            {parsedUrl.pathname || '/'}
                          </code>
                          <button
                            onClick={() => copyToClipboard(parsedUrl.pathname || '/', '路径')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">查询字符串:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm max-w-48 truncate">
                            {parsedUrl.search || '无'}
                          </code>
                          {parsedUrl.search && (
                            <button
                              onClick={() => copyToClipboard(parsedUrl.search || '', '查询字符串')}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">锚点:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm max-w-48 truncate">
                            {parsedUrl.hash || '无'}
                          </code>
                          {parsedUrl.hash && (
                            <button
                              onClick={() => copyToClipboard(parsedUrl.hash || '', '锚点')}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 域名分析 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">域名分析</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">子域名</div>
                      <div className="font-mono text-blue-800">
                        {parsedUrl.subdomain || '无'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">主域名</div>
                      <div className="font-mono text-green-800">
                        {parsedUrl.domain}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-600 mb-1">顶级域名</div>
                      <div className="font-mono text-purple-800">
                        {parsedUrl.tld || '无'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${parsedUrl.isSecure ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{parsedUrl.isSecure ? 'HTTPS安全连接' : 'HTTP非安全连接'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${parsedUrl.isLocalhost ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                      <span>{parsedUrl.isLocalhost ? '本地主机' : '远程主机'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${parsedUrl.isIP ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                      <span>{parsedUrl.isIP ? 'IP地址' : '域名'}</span>
                    </div>
                  </div>
                </div>

                {/* 查询参数 */}
                {parsedUrl.searchParams && Object.keys(parsedUrl.searchParams).length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">查询参数</h3>
                    
                    <div className="space-y-2">
                      {Object.entries(parsedUrl.searchParams || {}).map(([key, value], index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{key}</div>
                            <div className="text-sm text-gray-600 font-mono break-all">{value}</div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => copyToClipboard(key, '参数名')}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="复制参数名"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => copyToClipboard(value, '参数值')}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="复制参数值"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 路径段 */}
                {parsedUrl.pathSegments && parsedUrl.pathSegments.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">路径段</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {(parsedUrl.pathSegments || []).map((segment, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                          <span className="font-mono text-sm">{segment}</span>
                          <button
                            onClick={() => copyToClipboard(segment, `路径段 ${index + 1}`)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 编码/解码 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">URL编码/解码</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        原始URL
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono break-all">
                          {parsedUrl.original}
                        </code>
                        <button
                          onClick={() => copyToClipboard(parsedUrl.original || '', '原始URL')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        编码后URL
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono break-all">
                          {encodeUrl(parsedUrl.original || '')}
                        </code>
                        <button
                          onClick={() => copyToClipboard(encodeUrl(parsedUrl.original || ''), '编码URL')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 输入完整的URL进行解析</li>
            <li>• 支持HTTP、HTTPS、FTP等多种协议</li>
            <li>• 自动分析域名结构和安全性</li>
            <li>• 详细解析查询参数和路径段</li>
            <li>• 提供URL编码/解码功能</li>
            <li>• 一键复制各个组成部分</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
