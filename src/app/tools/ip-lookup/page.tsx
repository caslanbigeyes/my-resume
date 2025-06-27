'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Search, Globe, MapPin, Wifi, Copy, RefreshCw, AlertCircle } from 'lucide-react'

interface IPInfo {
  ip: string
  country: string
  region: string
  city: string
  timezone: string
  isp: string
  org: string
  as: string
  lat?: number
  lon?: number
  query: string
  status: string
}

/**
 * IP 地址查询工具组件
 * 查询 IP 地址的地理位置和网络信息
 */
export default function IpLookupPage() {
  const [ipInput, setIpInput] = useState('')
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [myIP, setMyIP] = useState<IPInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 验证 IP 地址格式
  const isValidIP = useCallback((ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }, [])

  // 查询 IP 信息
  const queryIPInfo = useCallback(async (ip?: string): Promise<IPInfo | null> => {
    try {
      const url = ip ? `http://ip-api.com/json/${ip}` : 'http://ip-api.com/json/'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('查询失败')
      }

      const data = await response.json()
      
      if (data.status === 'fail') {
        throw new Error(data.message || '无效的 IP 地址')
      }

      return {
        ip: data.query,
        country: data.country || 'Unknown',
        region: data.regionName || 'Unknown',
        city: data.city || 'Unknown',
        timezone: data.timezone || 'Unknown',
        isp: data.isp || 'Unknown',
        org: data.org || 'Unknown',
        as: data.as || 'Unknown',
        lat: data.lat,
        lon: data.lon,
        query: data.query,
        status: data.status
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '查询失败')
    }
  }, [])

  // 查询指定 IP
  const handleIPLookup = useCallback(async () => {
    if (!ipInput.trim()) {
      setError('请输入 IP 地址')
      return
    }

    if (!isValidIP(ipInput.trim())) {
      setError('请输入有效的 IP 地址')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const info = await queryIPInfo(ipInput.trim())
      setIpInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败')
      setIpInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [ipInput, isValidIP, queryIPInfo])

  // 查询我的 IP
  const getMyIP = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const info = await queryIPInfo()
      setMyIP(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取本机 IP 失败')
    } finally {
      setIsLoading(false)
    }
  }, [queryIPInfo])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 预设 IP 地址
  const presetIPs = [
    { name: 'Google DNS', ip: '8.8.8.8' },
    { name: 'Cloudflare DNS', ip: '1.1.1.1' },
    { name: 'OpenDNS', ip: '208.67.222.222' },
    { name: 'Quad9 DNS', ip: '9.9.9.9' },
    { name: 'Level3 DNS', ip: '4.2.2.2' },
    { name: 'Comodo DNS', ip: '8.26.56.26' }
  ]

  // 生成地图链接
  const getMapLink = (lat?: number, lon?: number): string => {
    if (lat && lon) {
      return `https://www.google.com/maps?q=${lat},${lon}`
    }
    return ''
  }

  // 初始化获取本机 IP
  useEffect(() => {
    getMyIP()
  }, [getMyIP])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🌐 IP 地址查询工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            查询 IP 地址的地理位置和网络信息
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：查询面板 */}
          <div className="space-y-6">
            {/* IP 查询 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                IP 地址查询
              </h3>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    placeholder="输入 IP 地址，如：8.8.8.8"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleIPLookup()}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleIPLookup}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    查询
                  </button>
                  <button
                    onClick={getMyIP}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    我的IP
                  </button>
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* 预设 IP */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                常用 IP 地址
              </h3>
              
              <div className="space-y-2">
                {presetIPs.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setIpInput(preset.ip)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {preset.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {preset.ip}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：查询结果 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 我的 IP 信息 */}
            {myIP && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    我的 IP 信息
                  </h3>
                </div>
                <div className="p-4">
                  <IPInfoDisplay ipInfo={myIP} onCopy={copyToClipboard} />
                </div>
              </div>
            )}

            {/* 查询结果 */}
            {ipInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    查询结果
                  </h3>
                </div>
                <div className="p-4">
                  <IPInfoDisplay ipInfo={ipInfo} onCopy={copyToClipboard} />
                </div>
              </div>
            )}

            {!myIP && !ipInfo && !isLoading && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                输入 IP 地址开始查询，或点击"我的IP"查看本机信息
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 支持 IPv4 和 IPv6 地址查询</li>
                <li>• 显示地理位置信息</li>
                <li>• 查看 ISP 和组织信息</li>
                <li>• 获取时区和坐标信息</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 地理位置可能存在误差</li>
                <li>• 私有 IP 地址无法查询位置</li>
                <li>• 查询结果来自第三方服务</li>
                <li>• 部分信息可能不完整</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// IP 信息显示组件
function IPInfoDisplay({ ipInfo, onCopy }: { ipInfo: IPInfo; onCopy: (text: string) => void }) {
  const getMapLink = (lat?: number, lon?: number): string => {
    if (lat && lon) {
      return `https://www.google.com/maps?q=${lat},${lon}`
    }
    return ''
  }

  return (
    <div className="space-y-4">
      {/* IP 地址 */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">IP 地址</div>
          <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
            {ipInfo.ip}
          </div>
        </div>
        <button
          onClick={() => onCopy(ipInfo.ip)}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* 地理位置 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">国家</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{ipInfo.country}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">地区</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{ipInfo.region}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">城市</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{ipInfo.city}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">时区</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{ipInfo.timezone}</div>
          </div>
          {ipInfo.lat && ipInfo.lon && (
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">坐标</div>
              <div className="font-mono text-gray-900 dark:text-gray-100">
                {ipInfo.lat.toFixed(4)}, {ipInfo.lon.toFixed(4)}
              </div>
              <a
                href={getMapLink(ipInfo.lat, ipInfo.lon)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                在地图中查看
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 网络信息 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">网络信息</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">ISP:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{ipInfo.isp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">组织:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{ipInfo.org}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">AS:</span>
            <span className="font-mono text-gray-900 dark:text-gray-100">{ipInfo.as}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
