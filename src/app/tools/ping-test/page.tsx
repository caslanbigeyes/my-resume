'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Play, Square, Wifi, Globe, Server, Clock, TrendingUp } from 'lucide-react'

interface PingResult {
  timestamp: number
  latency: number | null
  status: 'success' | 'timeout' | 'error'
  error?: string
}

interface PingStats {
  sent: number
  received: number
  lost: number
  lossRate: number
  minLatency: number
  maxLatency: number
  avgLatency: number
}

/**
 * 网络延迟测试工具组件
 * 测试网络连接延迟和稳定性
 */
export default function PingTestPage() {
  const [targetUrl, setTargetUrl] = useState('https://www.google.com')
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<PingResult[]>([])
  const [pingInterval, setPingInterval] = useState(1000)
  const [pingTimeout, setPingTimeout] = useState(5000)
  const intervalRef = useRef<number | null>(null)

  // 预设测试目标
  const presetTargets = [
    { name: 'Google', url: 'https://www.google.com', description: '全球最大搜索引擎' },
    { name: 'Cloudflare', url: 'https://1.1.1.1', description: 'Cloudflare DNS' },
    { name: 'GitHub', url: 'https://github.com', description: '代码托管平台' },
    { name: 'Baidu', url: 'https://www.baidu.com', description: '百度搜索' },
    { name: 'Alibaba', url: 'https://www.alibaba.com', description: '阿里巴巴' },
    { name: 'Tencent', url: 'https://www.qq.com', description: '腾讯' }
  ]

  // 执行单次 ping 测试
  const performPing = useCallback(async (url: string): Promise<PingResult> => {
    const startTime = performance.now()
    const timestamp = Date.now()

    try {
      // 使用 fetch 模拟 ping（实际是 HTTP 请求）
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), pingTimeout)

      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors', // 避免 CORS 问题
        signal: controller.signal,
        cache: 'no-cache'
      })

      clearTimeout(timeoutId)
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)

      return {
        timestamp,
        latency,
        status: 'success'
      }
    } catch (error) {
      const endTime = performance.now()
      const latency = endTime - startTime

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          timestamp,
          latency: null,
          status: 'timeout',
          error: '请求超时'
        }
      }

      // 对于 no-cors 模式，网络错误也可能表示连接成功
      // 因为我们无法读取响应状态
      if (latency < pingTimeout) {
        return {
          timestamp,
          latency: Math.round(latency),
          status: 'success'
        }
      }

      return {
        timestamp,
        latency: null,
        status: 'error',
        error: error instanceof Error ? error.message : '网络错误'
      }
    }
  }, [pingTimeout])

  // 开始测试
  const startTest = useCallback(() => {
    if (isRunning) return

    setIsRunning(true)
    setResults([])

    const runPing = async () => {
      const result = await performPing(targetUrl)
      setResults(prev => [...prev.slice(-99), result]) // 保留最近100条记录
    }

    // 立即执行一次
    runPing()

    // 设置定时器
    intervalRef.current = window.setInterval(runPing, pingInterval)
  }, [isRunning, targetUrl, pingInterval, performPing])

  // 停止测试
  const stopTest = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // 清空结果
  const clearResults = () => {
    setResults([])
  }

  // 计算统计信息
  const stats: PingStats = React.useMemo(() => {
    const sent = results.length
    const successful = results.filter(r => r.status === 'success' && r.latency !== null)
    const received = successful.length
    const lost = sent - received
    const lossRate = sent > 0 ? (lost / sent) * 100 : 0

    const latencies = successful.map(r => r.latency!).filter(l => l > 0)
    const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0
    const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0

    return {
      sent,
      received,
      lost,
      lossRate,
      minLatency,
      maxLatency,
      avgLatency
    }
  }, [results])

  // 获取延迟状态颜色
  const getLatencyColor = (latency: number | null) => {
    if (latency === null) return 'text-red-500'
    if (latency < 50) return 'text-green-500'
    if (latency < 100) return 'text-yellow-500'
    if (latency < 200) return 'text-orange-500'
    return 'text-red-500'
  }

  // 获取延迟状态描述
  const getLatencyStatus = (latency: number | null) => {
    if (latency === null) return '失败'
    if (latency < 50) return '优秀'
    if (latency < 100) return '良好'
    if (latency < 200) return '一般'
    return '较差'
  }

  // 组件卸载时清理定时器
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📡 网络延迟测试
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            测试网络连接延迟和稳定性
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：设置面板 */}
          <div className="space-y-6">
            {/* 测试设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                测试设置
              </h3>
              
              <div className="space-y-4">
                {/* 目标地址 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    目标地址
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 测试间隔 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    测试间隔 (毫秒)
                  </label>
                  <select
                    value={pingInterval}
                    onChange={(e) => setPingInterval(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={500}>500ms</option>
                    <option value={1000}>1秒</option>
                    <option value={2000}>2秒</option>
                    <option value={5000}>5秒</option>
                  </select>
                </div>

                {/* 超时时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    超时时间 (毫秒)
                  </label>
                  <select
                    value={pingTimeout}
                    onChange={(e) => setPingTimeout(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={3000}>3秒</option>
                    <option value={5000}>5秒</option>
                    <option value={10000}>10秒</option>
                    <option value={15000}>15秒</option>
                  </select>
                </div>

                {/* 控制按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={isRunning ? stopTest : startTest}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isRunning
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Square className="w-4 h-4" />
                        停止
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        开始
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearResults}
                    disabled={results.length === 0}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>

            {/* 预设目标 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                预设目标
              </h3>
              
              <div className="space-y-2">
                {presetTargets.map((target, index) => (
                  <button
                    key={index}
                    onClick={() => setTargetUrl(target.url)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {target.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {target.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                      {target.url}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：测试结果 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 统计信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.sent}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">已发送</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.received}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">已接收</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.lossRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">丢包率</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.avgLatency.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">平均延迟</div>
              </div>
            </div>

            {/* 详细统计 */}
            {stats.sent > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  延迟统计
                </h3>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {stats.minLatency}ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">最小延迟</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {stats.avgLatency.toFixed(1)}ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">平均延迟</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {stats.maxLatency}ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">最大延迟</div>
                  </div>
                </div>
              </div>
            )}

            {/* 测试结果列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  测试结果
                  {isRunning && (
                    <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </h3>
              </div>
              
              <div className="p-4">
                {results.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.slice().reverse().map((result, index) => (
                      <div key={result.timestamp} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {result.latency !== null ? (
                            <>
                              <span className={`font-mono font-bold ${getLatencyColor(result.latency)}`}>
                                {result.latency}ms
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${getLatencyColor(result.latency)} bg-opacity-10`}>
                                {getLatencyStatus(result.latency)}
                              </span>
                            </>
                          ) : (
                            <span className="text-red-500 text-sm">
                              {result.error || '失败'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    点击"开始"按钮开始测试网络延迟
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">延迟等级</h4>
              <ul className="space-y-1">
                <li>• <span className="text-green-500">优秀</span>: &lt; 50ms</li>
                <li>• <span className="text-yellow-500">良好</span>: 50-100ms</li>
                <li>• <span className="text-orange-500">一般</span>: 100-200ms</li>
                <li>• <span className="text-red-500">较差</span>: &gt; 200ms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 测试结果受网络环境影响</li>
                <li>• 使用 HTTP 请求模拟 ping</li>
                <li>• 某些网站可能阻止此类请求</li>
                <li>• 建议测试多个目标进行对比</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
