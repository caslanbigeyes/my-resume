'use client'

import React, { useState, useCallback } from 'react'
import { Search, Server, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface PortScanResult {
  port: number
  status: 'open' | 'closed' | 'filtered' | 'timeout'
  service?: string
  description?: string
  responseTime?: number
}

interface ScanSession {
  id: string
  target: string
  ports: number[]
  results: PortScanResult[]
  status: 'running' | 'completed' | 'error'
  startTime: number
  endTime?: number
  error?: string
}

/**
 * 端口扫描器组件
 * 扫描目标主机的端口状态
 */
export default function PortScannerPage() {
  const [target, setTarget] = useState('')
  const [portRange, setPortRange] = useState('1-1000')
  const [scanType, setScanType] = useState<'common' | 'range' | 'custom'>('common')
  const [customPorts, setCustomPorts] = useState('')
  const [sessions, setSessions] = useState<ScanSession[]>([])
  const [isScanning, setIsScanning] = useState(false)

  // 常用端口列表
  const commonPorts = [
    { port: 21, service: 'FTP', description: '文件传输协议' },
    { port: 22, service: 'SSH', description: '安全外壳协议' },
    { port: 23, service: 'Telnet', description: '远程登录' },
    { port: 25, service: 'SMTP', description: '简单邮件传输协议' },
    { port: 53, service: 'DNS', description: '域名系统' },
    { port: 80, service: 'HTTP', description: '超文本传输协议' },
    { port: 110, service: 'POP3', description: '邮局协议版本3' },
    { port: 143, service: 'IMAP', description: '互联网消息访问协议' },
    { port: 443, service: 'HTTPS', description: 'HTTP安全版本' },
    { port: 993, service: 'IMAPS', description: 'IMAP安全版本' },
    { port: 995, service: 'POP3S', description: 'POP3安全版本' },
    { port: 3389, service: 'RDP', description: '远程桌面协议' },
    { port: 5432, service: 'PostgreSQL', description: 'PostgreSQL数据库' },
    { port: 3306, service: 'MySQL', description: 'MySQL数据库' },
    { port: 1433, service: 'MSSQL', description: 'Microsoft SQL Server' },
    { port: 6379, service: 'Redis', description: 'Redis数据库' }
  ]

  // 获取服务信息
  const getServiceInfo = useCallback((port: number) => {
    return commonPorts.find(p => p.port === port)
  }, [])

  // 模拟端口扫描
  const scanPort = useCallback(async (target: string, port: number): Promise<PortScanResult> => {
    // 模拟网络延迟
    const delay = Math.random() * 1000 + 200
    await new Promise(resolve => setTimeout(resolve, delay))

    // 模拟扫描结果
    const serviceInfo = getServiceInfo(port)
    const isCommonPort = commonPorts.some(p => p.port === port)
    
    // 常用端口更可能开放
    const openProbability = isCommonPort ? 0.3 : 0.1
    const isOpen = Math.random() < openProbability

    let status: PortScanResult['status']
    if (isOpen) {
      status = 'open'
    } else {
      // 随机分配关闭、过滤或超时状态
      const rand = Math.random()
      if (rand < 0.7) status = 'closed'
      else if (rand < 0.9) status = 'filtered'
      else status = 'timeout'
    }

    return {
      port,
      status,
      service: serviceInfo?.service,
      description: serviceInfo?.description,
      responseTime: Math.round(delay)
    }
  }, [getServiceInfo])

  // 解析端口范围
  const parsePortRange = useCallback((range: string): number[] => {
    const ports: number[] = []
    const parts = range.split(',')

    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()))
        if (start && end && start <= end && start > 0 && end <= 65535) {
          for (let i = start; i <= end; i++) {
            ports.push(i)
          }
        }
      } else {
        const port = parseInt(trimmed)
        if (port > 0 && port <= 65535) {
          ports.push(port)
        }
      }
    }

    return [...new Set(ports)].sort((a, b) => a - b)
  }, [])

  // 获取要扫描的端口列表
  const getPortsToScan = useCallback((): number[] => {
    switch (scanType) {
      case 'common':
        return commonPorts.map(p => p.port)
      case 'range':
        return parsePortRange(portRange)
      case 'custom':
        return parsePortRange(customPorts)
      default:
        return []
    }
  }, [scanType, portRange, customPorts, parsePortRange])

  // 开始扫描
  const startScan = useCallback(async () => {
    if (!target.trim()) {
      alert('请输入目标主机')
      return
    }

    const ports = getPortsToScan()
    if (ports.length === 0) {
      alert('请指定要扫描的端口')
      return
    }

    if (ports.length > 100) {
      if (!confirm(`将扫描 ${ports.length} 个端口，这可能需要较长时间。是否继续？`)) {
        return
      }
    }

    setIsScanning(true)

    const sessionId = Math.random().toString(36).substr(2, 9)
    const newSession: ScanSession = {
      id: sessionId,
      target: target.trim(),
      ports,
      results: [],
      status: 'running',
      startTime: Date.now()
    }

    setSessions(prev => [newSession, ...prev.slice(0, 9)])

    try {
      const results: PortScanResult[] = []
      
      // 批量扫描，每次扫描10个端口
      const batchSize = 10
      for (let i = 0; i < ports.length; i += batchSize) {
        const batch = ports.slice(i, i + batchSize)
        const batchPromises = batch.map(port => scanPort(target.trim(), port))
        const batchResults = await Promise.all(batchPromises)
        
        results.push(...batchResults)
        
        // 更新会话结果
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, results: [...results] }
            : session
        ))
      }

      // 完成扫描
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'completed', endTime: Date.now() }
          : session
      ))

    } catch (error) {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              status: 'error', 
              endTime: Date.now(),
              error: error instanceof Error ? error.message : '扫描失败'
            }
          : session
      ))
    } finally {
      setIsScanning(false)
    }
  }, [target, getPortsToScan, scanPort])

  // 获取状态图标
  const getStatusIcon = (status: PortScanResult['status']) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'filtered':
        return <Shield className="w-4 h-4 text-yellow-500" />
      case 'timeout':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return null
    }
  }

  // 获取状态文本
  const getStatusText = (status: PortScanResult['status']) => {
    switch (status) {
      case 'open': return '开放'
      case 'closed': return '关闭'
      case 'filtered': return '过滤'
      case 'timeout': return '超时'
      default: return '未知'
    }
  }

  // 格式化扫描时间
  const formatScanTime = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime
    return `${(duration / 1000).toFixed(1)}秒`
  }

  // 统计扫描结果
  const getResultStats = (results: PortScanResult[]) => {
    const stats = {
      total: results.length,
      open: results.filter(r => r.status === 'open').length,
      closed: results.filter(r => r.status === 'closed').length,
      filtered: results.filter(r => r.status === 'filtered').length,
      timeout: results.filter(r => r.status === 'timeout').length
    }
    return stats
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔍 端口扫描器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            扫描目标主机的端口状态和服务信息
          </p>
        </div>

        {/* 扫描配置 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            扫描配置
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 目标主机 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                目标主机
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="输入 IP 地址或域名，如：192.168.1.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 扫描类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                扫描类型
              </label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="common">常用端口</option>
                <option value="range">端口范围</option>
                <option value="custom">自定义端口</option>
              </select>
            </div>

            {/* 端口范围 */}
            {scanType === 'range' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  端口范围
                </label>
                <input
                  type="text"
                  value={portRange}
                  onChange={(e) => setPortRange(e.target.value)}
                  placeholder="如：1-1000 或 80,443,8080"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* 自定义端口 */}
            {scanType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  自定义端口
                </label>
                <input
                  type="text"
                  value={customPorts}
                  onChange={(e) => setCustomPorts(e.target.value)}
                  placeholder="如：80,443,8080,3000-3010"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={startScan}
              disabled={isScanning}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Search className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? '扫描中...' : '开始扫描'}
            </button>
          </div>
        </div>

        {/* 常用端口参考 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">常用端口参考</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonPorts.slice(0, 12).map(port => (
              <div key={port.port} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <span className="font-mono text-blue-600 dark:text-blue-400 min-w-12">
                  {port.port}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {port.service}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {port.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 扫描结果 */}
        {sessions.length > 0 && (
          <div className="space-y-6">
            {sessions.map(session => {
              const stats = getResultStats(session.results)
              return (
                <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  {/* 会话头部 */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {session.target}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          扫描 {session.ports.length} 个端口 • 
                          用时 {formatScanTime(session.startTime, session.endTime)} • 
                          状态: {session.status === 'running' ? '进行中' : session.status === 'completed' ? '已完成' : '错误'}
                        </div>
                      </div>
                      
                      {session.status === 'completed' && (
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.open}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">开放</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.closed}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">关闭</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.filtered}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">过滤</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.timeout}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">超时</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 扫描结果 */}
                  <div className="p-4">
                    {session.status === 'error' ? (
                      <div className="text-red-600 dark:text-red-400 text-center py-4">
                        扫描失败: {session.error}
                      </div>
                    ) : session.results.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {session.results
                          .filter(result => result.status === 'open')
                          .concat(session.results.filter(result => result.status !== 'open'))
                          .map((result, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-2 min-w-20">
                              {getStatusIcon(result.status)}
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                {result.port}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${
                                  result.status === 'open' ? 'text-green-600 dark:text-green-400' :
                                  result.status === 'closed' ? 'text-red-600 dark:text-red-400' :
                                  result.status === 'filtered' ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-orange-600 dark:text-orange-400'
                                }`}>
                                  {getStatusText(result.status)}
                                </span>
                                {result.service && (
                                  <span className="text-sm text-blue-600 dark:text-blue-400">
                                    {result.service}
                                  </span>
                                )}
                              </div>
                              {result.description && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {result.description}
                                </div>
                              )}
                            </div>
                            
                            {result.responseTime && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {result.responseTime}ms
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : session.status === 'running' ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        正在扫描端口...
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        暂无结果
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">端口状态</h4>
              <ul className="space-y-1">
                <li>• <span className="text-green-600">开放</span>: 端口正在监听连接</li>
                <li>• <span className="text-red-600">关闭</span>: 端口未开放</li>
                <li>• <span className="text-yellow-600">过滤</span>: 被防火墙过滤</li>
                <li>• <span className="text-orange-600">超时</span>: 连接超时</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 仅扫描您有权限的主机</li>
                <li>• 大范围扫描可能需要较长时间</li>
                <li>• 某些网络可能阻止端口扫描</li>
                <li>• 结果仅供参考，实际情况可能不同</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>免责声明:</strong> 此工具仅用于教育和测试目的。请确保您有权限扫描目标主机，并遵守相关法律法规。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
