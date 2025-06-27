'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Monitor, Cpu, HardDrive, Wifi, Globe, Smartphone, RefreshCw, Copy } from 'lucide-react'

interface SystemInfo {
  browser: {
    name: string
    version: string
    userAgent: string
    language: string
    platform: string
    cookieEnabled: boolean
    onLine: boolean
  }
  screen: {
    width: number
    height: number
    availWidth: number
    availHeight: number
    colorDepth: number
    pixelDepth: number
    devicePixelRatio: number
  }
  device: {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    touchSupport: boolean
    maxTouchPoints: number
  }
  performance: {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
    timing?: {
      navigationStart: number
      loadEventEnd: number
      domContentLoadedEventEnd: number
    }
  }
  network: {
    connection?: {
      effectiveType: string
      downlink: number
      rtt: number
      saveData: boolean
    }
  }
  location: {
    href: string
    protocol: string
    host: string
    hostname: string
    port: string
    pathname: string
    search: string
    hash: string
  }
}

/**
 * 系统信息查看器组件
 * 显示浏览器、设备和系统相关信息
 */
export default function SystemInfoPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 检测设备类型
  const detectDevice = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
    const isDesktop = !isMobile && !isTablet
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const maxTouchPoints = navigator.maxTouchPoints || 0

    return {
      isMobile,
      isTablet,
      isDesktop,
      touchSupport,
      maxTouchPoints
    }
  }, [])

  // 获取浏览器信息
  const getBrowserInfo = useCallback(() => {
    const userAgent = navigator.userAgent
    let browserName = 'Unknown'
    let browserVersion = 'Unknown'

    // 检测浏览器类型
    if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome'
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox'
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari'
      browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown'
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge'
      browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown'
    }

    return {
      name: browserName,
      version: browserVersion,
      userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    }
  }, [])

  // 获取性能信息
  const getPerformanceInfo = useCallback(() => {
    const performanceInfo: SystemInfo['performance'] = {}

    // 内存信息（仅在支持的浏览器中可用）
    if ('memory' in performance) {
      const memory = (performance as any).memory
      performanceInfo.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
    }

    // 页面加载时间
    if (performance.timing) {
      performanceInfo.timing = {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd
      }
    }

    return performanceInfo
  }, [])

  // 获取网络信息
  const getNetworkInfo = useCallback(() => {
    const networkInfo: SystemInfo['network'] = {}

    // 网络连接信息（仅在支持的浏览器中可用）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      networkInfo.connection = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      }
    }

    return networkInfo
  }, [])

  // 收集系统信息
  const collectSystemInfo = useCallback(() => {
    setIsLoading(true)

    const info: SystemInfo = {
      browser: getBrowserInfo(),
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio
      },
      device: detectDevice(),
      performance: getPerformanceInfo(),
      network: getNetworkInfo(),
      location: {
        href: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        hostname: window.location.hostname,
        port: window.location.port,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      }
    }

    setSystemInfo(info)
    setIsLoading(false)
  }, [getBrowserInfo, detectDevice, getPerformanceInfo, getNetworkInfo])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 复制所有信息
  const copyAllInfo = () => {
    if (!systemInfo) return
    const infoText = JSON.stringify(systemInfo, null, 2)
    copyToClipboard(infoText)
  }

  // 格式化字节大小
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  // 计算页面加载时间
  const getLoadTime = (): string => {
    if (!systemInfo?.performance.timing) return 'N/A'
    const { navigationStart, loadEventEnd, domContentLoadedEventEnd } = systemInfo.performance.timing
    
    if (loadEventEnd && navigationStart) {
      const loadTime = loadEventEnd - navigationStart
      return `${loadTime}ms`
    }
    
    if (domContentLoadedEventEnd && navigationStart) {
      const domLoadTime = domContentLoadedEventEnd - navigationStart
      return `${domLoadTime}ms (DOM)`
    }
    
    return 'N/A'
  }

  // 初始化
  useEffect(() => {
    collectSystemInfo()
  }, [collectSystemInfo])

  if (isLoading || !systemInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在收集系统信息...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            💻 系统信息查看器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            查看浏览器、设备和系统相关信息
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={collectSystemInfo}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新信息
            </button>
            <button
              onClick={copyAllInfo}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              复制全部
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 浏览器信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                浏览器信息
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">浏览器:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {systemInfo.browser.name} {systemInfo.browser.version}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">语言:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{systemInfo.browser.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">平台:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{systemInfo.browser.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cookie:</span>
                <span className={`font-mono ${systemInfo.browser.cookieEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {systemInfo.browser.cookieEnabled ? '启用' : '禁用'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">在线状态:</span>
                <span className={`font-mono ${systemInfo.browser.onLine ? 'text-green-600' : 'text-red-600'}`}>
                  {systemInfo.browser.onLine ? '在线' : '离线'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm">User Agent:</span>
                <p className="font-mono text-xs text-gray-700 dark:text-gray-300 mt-1 break-all">
                  {systemInfo.browser.userAgent}
                </p>
              </div>
            </div>
          </div>

          {/* 屏幕信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                屏幕信息
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">分辨率:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {systemInfo.screen.width} × {systemInfo.screen.height}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">可用区域:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {systemInfo.screen.availWidth} × {systemInfo.screen.availHeight}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">颜色深度:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{systemInfo.screen.colorDepth} 位</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">像素深度:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{systemInfo.screen.pixelDepth} 位</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">设备像素比:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{systemInfo.screen.devicePixelRatio}</span>
              </div>
            </div>
          </div>

          {/* 设备信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                设备信息
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">设备类型:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {systemInfo.device.isMobile ? '移动设备' : 
                   systemInfo.device.isTablet ? '平板设备' : '桌面设备'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">触摸支持:</span>
                <span className={`font-mono ${systemInfo.device.touchSupport ? 'text-green-600' : 'text-red-600'}`}>
                  {systemInfo.device.touchSupport ? '支持' : '不支持'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">最大触摸点:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{systemInfo.device.maxTouchPoints}</span>
              </div>
            </div>
          </div>

          {/* 性能信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                性能信息
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {systemInfo.performance.memory ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">已用内存:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {formatBytes(systemInfo.performance.memory.usedJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总内存:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {formatBytes(systemInfo.performance.memory.totalJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">内存限制:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {formatBytes(systemInfo.performance.memory.jsHeapSizeLimit)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  内存信息不可用
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">页面加载时间:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{getLoadTime()}</span>
              </div>
            </div>
          </div>

          {/* 网络信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                网络信息
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {systemInfo.network.connection ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">连接类型:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {systemInfo.network.connection.effectiveType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">下行速度:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {systemInfo.network.connection.downlink} Mbps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">往返时间:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {systemInfo.network.connection.rtt} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">省流模式:</span>
                    <span className={`font-mono ${systemInfo.network.connection.saveData ? 'text-green-600' : 'text-gray-600'}`}>
                      {systemInfo.network.connection.saveData ? '开启' : '关闭'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  网络信息不可用
                </div>
              )}
            </div>
          </div>

          {/* 位置信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                页面位置
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">协议:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{systemInfo.location.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">主机:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{systemInfo.location.host}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">路径:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100 break-all">{systemInfo.location.pathname}</span>
              </div>
              {systemInfo.location.search && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">查询参数:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100 break-all">{systemInfo.location.search}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
