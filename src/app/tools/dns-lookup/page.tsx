'use client'

import React, { useState, useCallback } from 'react'
import { Search, Globe, Server, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl?: number
  priority?: number
}

interface DNSResult {
  domain: string
  records: DNSRecord[]
  timestamp: number
  status: 'success' | 'error'
  error?: string
}

/**
 * DNS 查询工具组件
 * 查询域名的 DNS 记录信息
 */
export default function DnsLookupPage() {
  const [domain, setDomain] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['A', 'AAAA', 'CNAME', 'MX'])
  const [results, setResults] = useState<DNSResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // DNS 记录类型
  const recordTypes = [
    { type: 'A', description: 'IPv4 地址记录' },
    { type: 'AAAA', description: 'IPv6 地址记录' },
    { type: 'CNAME', description: '别名记录' },
    { type: 'MX', description: '邮件交换记录' },
    { type: 'NS', description: '名称服务器记录' },
    { type: 'TXT', description: '文本记录' },
    { type: 'SOA', description: '授权开始记录' },
    { type: 'PTR', description: '指针记录' },
    { type: 'SRV', description: '服务记录' }
  ]

  // 预设域名
  const presetDomains = [
    'google.com',
    'github.com',
    'cloudflare.com',
    'baidu.com',
    'qq.com',
    'taobao.com'
  ]

  // 验证域名格式
  const isValidDomain = useCallback((domain: string): boolean => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
    return domainRegex.test(domain)
  }, [])

  // 模拟 DNS 查询（实际项目中需要使用 DNS API）
  const performDNSLookup = useCallback(async (domain: string, recordType: string): Promise<DNSRecord[]> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // 模拟 DNS 记录数据
    const mockRecords: { [key: string]: DNSRecord[] } = {
      'A': [
        { type: 'A', name: domain, value: '142.250.191.14', ttl: 300 },
        { type: 'A', name: domain, value: '142.250.191.46', ttl: 300 }
      ],
      'AAAA': [
        { type: 'AAAA', name: domain, value: '2404:6800:4008:c06::8e', ttl: 300 }
      ],
      'CNAME': domain.startsWith('www.') ? [] : [
        { type: 'CNAME', name: `www.${domain}`, value: domain, ttl: 3600 }
      ],
      'MX': [
        { type: 'MX', name: domain, value: 'aspmx.l.google.com', ttl: 3600, priority: 10 },
        { type: 'MX', name: domain, value: 'alt1.aspmx.l.google.com', ttl: 3600, priority: 20 },
        { type: 'MX', name: domain, value: 'alt2.aspmx.l.google.com', ttl: 3600, priority: 30 }
      ],
      'NS': [
        { type: 'NS', name: domain, value: 'ns1.google.com', ttl: 172800 },
        { type: 'NS', name: domain, value: 'ns2.google.com', ttl: 172800 },
        { type: 'NS', name: domain, value: 'ns3.google.com', ttl: 172800 }
      ],
      'TXT': [
        { type: 'TXT', name: domain, value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
        { type: 'TXT', name: domain, value: 'google-site-verification=abc123def456', ttl: 3600 }
      ],
      'SOA': [
        { type: 'SOA', name: domain, value: 'ns1.google.com hostmaster.google.com 2023120101 7200 3600 1209600 3600', ttl: 60 }
      ]
    }

    return mockRecords[recordType] || []
  }, [])

  // 执行 DNS 查询
  const handleDNSLookup = useCallback(async () => {
    if (!domain.trim()) {
      setError('请输入域名')
      return
    }

    if (!isValidDomain(domain.trim())) {
      setError('请输入有效的域名')
      return
    }

    if (selectedTypes.length === 0) {
      setError('请选择至少一种记录类型')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const allRecords: DNSRecord[] = []
      
      // 并行查询所有选中的记录类型
      const promises = selectedTypes.map(type => performDNSLookup(domain.trim(), type))
      const recordArrays = await Promise.all(promises)
      
      recordArrays.forEach(records => {
        allRecords.push(...records)
      })

      const result: DNSResult = {
        domain: domain.trim(),
        records: allRecords,
        timestamp: Date.now(),
        status: 'success'
      }

      setResults(prev => [result, ...prev.slice(0, 9)]) // 保留最近10次查询
    } catch (err) {
      const result: DNSResult = {
        domain: domain.trim(),
        records: [],
        timestamp: Date.now(),
        status: 'error',
        error: err instanceof Error ? err.message : 'DNS 查询失败'
      }
      setResults(prev => [result, ...prev.slice(0, 9)])
    } finally {
      setIsLoading(false)
    }
  }, [domain, selectedTypes, isValidDomain, performDNSLookup])

  // 切换记录类型选择
  const toggleRecordType = useCallback((type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }, [])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  // 格式化 TTL
  const formatTTL = (ttl?: number): string => {
    if (!ttl) return 'N/A'
    
    if (ttl >= 86400) {
      return `${Math.floor(ttl / 86400)}天`
    } else if (ttl >= 3600) {
      return `${Math.floor(ttl / 3600)}小时`
    } else if (ttl >= 60) {
      return `${Math.floor(ttl / 60)}分钟`
    } else {
      return `${ttl}秒`
    }
  }

  // 获取记录类型颜色
  const getRecordTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'A': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'AAAA': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'CNAME': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'MX': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'NS': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'TXT': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'SOA': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'PTR': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'SRV': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔍 DNS 查询工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            查询域名的 DNS 记录信息
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：查询面板 */}
          <div className="space-y-6">
            {/* 域名输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                域名查询
              </h3>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="输入域名，如：example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleDNSLookup()}
                  />
                </div>

                <button
                  onClick={handleDNSLookup}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {isLoading ? '查询中...' : 'DNS 查询'}
                </button>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* 记录类型选择 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                记录类型
              </h3>
              
              <div className="space-y-2">
                {recordTypes.map(({ type, description }) => (
                  <label key={type} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleRecordType(type)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{type}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 预设域名 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">常用域名</h3>
              
              <div className="space-y-2">
                {presetDomains.map((presetDomain, index) => (
                  <button
                    key={index}
                    onClick={() => setDomain(presetDomain)}
                    className="w-full text-left p-2 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-mono text-gray-900 dark:text-gray-100">{presetDomain}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：查询结果 */}
          <div className="lg:col-span-2 space-y-6">
            {results.length > 0 ? (
              results.map((result, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {result.domain}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(result.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {result.status === 'error' ? (
                      <div className="text-red-600 dark:text-red-400 text-center py-4">
                        {result.error}
                      </div>
                    ) : result.records.length > 0 ? (
                      <div className="space-y-4">
                        {recordTypes.map(({ type }) => {
                          const typeRecords = result.records.filter(record => record.type === type)
                          if (typeRecords.length === 0) return null

                          return (
                            <div key={type}>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getRecordTypeColor(type)}`}>
                                  {type}
                                </span>
                                记录 ({typeRecords.length})
                              </h4>
                              <div className="space-y-2">
                                {typeRecords.map((record, recordIndex) => (
                                  <div key={recordIndex} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                                        {record.value}
                                      </div>
                                      <button
                                        onClick={() => copyToClipboard(record.value)}
                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                      {record.ttl && (
                                        <span>TTL: {formatTTL(record.ttl)}</span>
                                      )}
                                      {record.priority && (
                                        <span>优先级: {record.priority}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        未找到 DNS 记录
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                输入域名开始 DNS 查询
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">DNS 记录类型</h4>
              <ul className="space-y-1">
                <li>• <strong>A</strong>: 域名指向 IPv4 地址</li>
                <li>• <strong>AAAA</strong>: 域名指向 IPv6 地址</li>
                <li>• <strong>CNAME</strong>: 域名别名记录</li>
                <li>• <strong>MX</strong>: 邮件服务器记录</li>
                <li>• <strong>NS</strong>: 名称服务器记录</li>
                <li>• <strong>TXT</strong>: 文本记录（SPF、验证等）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 查询结果可能因 DNS 缓存而延迟</li>
                <li>• TTL 表示记录的缓存时间</li>
                <li>• 不同 DNS 服务器可能返回不同结果</li>
                <li>• 某些记录类型可能不存在</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>注意:</strong> 此演示版本使用模拟数据。在实际项目中，请使用真实的 DNS 查询 API。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
