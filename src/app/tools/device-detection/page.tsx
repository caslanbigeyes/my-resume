'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Smartphone, Monitor, Cpu, HardDrive, Wifi, Battery, Copy, Download } from 'lucide-react'

interface DeviceInfo {
  // 基本信息
  userAgent: string
  platform: string
  language: string
  languages: string[]

  // 屏幕信息
  screenWidth: number
  screenHeight: number
  screenColorDepth: number
  screenPixelDepth: number
  availWidth: number
  availHeight: number
  devicePixelRatio: number

  // 浏览器信息
  browserName: string
  browserVersion: string
  engineName: string

  // 设备类型
  deviceType: 'desktop' | 'tablet' | 'mobile' | 'unknown'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean

  // 操作系统
  osName: string
  osVersion: string

  // 网络信息
  connectionType?: string
  connectionSpeed?: string
  isOnline: boolean

  // 硬件信息
  hardwareConcurrency: number
  maxTouchPoints: number

  // 其他特性
  cookieEnabled: boolean
  javaEnabled: boolean
  doNotTrack: string | null
  timezone: string

  // 传感器支持
  hasAccelerometer: boolean
  hasGyroscope: boolean
  hasGeolocation: boolean
  hasCamera: boolean
  hasMicrophone: boolean

  // 存储信息
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean

  // 电池信息
  batteryLevel?: number
  batteryCharging?: boolean
  batteryChargingTime?: number
  batteryDischargingTime?: number
}

/**
 * 设备特性检测工具组件
 * 检测设备的硬件和软件特性
 */
export default function DeviceDetectionPage() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 检测浏览器信息
  const detectBrowser = useCallback((): { name: string; version: string; engine: string } => {
    const userAgent = navigator.userAgent
    let name = 'Unknown'
    let version = 'Unknown'
    let engine = 'Unknown'

    // Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'Chrome'
      version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown'
      engine = 'Blink'
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      name = 'Firefox'
      version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown'
      engine = 'Gecko'
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari'
      version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown'
      engine = 'WebKit'
    }
    // Edge
    else if (userAgent.includes('Edg')) {
      name = 'Edge'
      version = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown'
      engine = 'Blink'
    }

    return { name, version, engine }
  }, [])

  // 检测操作系统
  const detectOS = useCallback((): { name: string; version: string } => {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    let name = 'Unknown'
    let version = 'Unknown'

    if (userAgent.includes('Windows NT')) {
      name = 'Windows'
      const match = userAgent.match(/Windows NT ([0-9.]+)/)
      if (match) {
        const ntVersion = match[1]
        switch (ntVersion) {
          case '10.0': version = '10/11'; break
          case '6.3': version = '8.1'; break
          case '6.2': version = '8'; break
          case '6.1': version = '7'; break
          default: version = ntVersion
        }
      }
    } else if (userAgent.includes('Mac OS X')) {
      name = 'macOS'
      version = userAgent.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown'
    } else if (userAgent.includes('Linux')) {
      name = 'Linux'
      if (userAgent.includes('Android')) {
        name = 'Android'
        version = userAgent.match(/Android ([0-9.]+)/)?.[1] || 'Unknown'
      }
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      name = 'iOS'
      version = userAgent.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown'
    }

    return { name, version }
  }, [])

  // 检测设备类型
  const detectDeviceType = useCallback((): { type: DeviceInfo['deviceType']; isMobile: boolean; isTablet: boolean; isDesktop: boolean } => {
    const userAgent = navigator.userAgent
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?=.*Tablet)|Tablet/i.test(userAgent)
    const isDesktop = !isMobile && !isTablet

    let type: DeviceInfo['deviceType'] = 'unknown'
    if (isDesktop) type = 'desktop'
    else if (isTablet) type = 'tablet'
    else if (isMobile) type = 'mobile'

    return { type, isMobile, isTablet, isDesktop }
  }, [])

  // 检测传感器支持
  const detectSensors = useCallback(async (): Promise<{
    hasAccelerometer: boolean
    hasGyroscope: boolean
    hasGeolocation: boolean
    hasCamera: boolean
    hasMicrophone: boolean
  }> => {
    const result = {
      hasAccelerometer: false,
      hasGyroscope: false,
      hasGeolocation: false,
      hasCamera: false,
      hasMicrophone: false
    }

    // 检测地理位置
    result.hasGeolocation = 'geolocation' in navigator

    // 检测加速度计和陀螺仪
    if ('DeviceMotionEvent' in window) {
      try {
        // @ts-ignore
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          result.hasAccelerometer = true
          result.hasGyroscope = true
        } else {
          result.hasAccelerometer = true
          result.hasGyroscope = true
        }
      } catch (e) {
        // 权限被拒绝或不支持
      }
    }

    // 检测摄像头和麦克风
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        result.hasCamera = devices.some(device => device.kind === 'videoinput')
        result.hasMicrophone = devices.some(device => device.kind === 'audioinput')
      } catch (e) {
        // 权限被拒绝或不支持
      }
    }

    return result
  }, [])

  // 检测存储支持
  const detectStorage = useCallback((): { localStorage: boolean; sessionStorage: boolean; indexedDB: boolean } => {
    const result = {
      localStorage: false,
      sessionStorage: false,
      indexedDB: false
    }

    try {
      result.localStorage = 'localStorage' in window && window.localStorage !== null
    } catch (e) {
      result.localStorage = false
    }

    try {
      result.sessionStorage = 'sessionStorage' in window && window.sessionStorage !== null
    } catch (e) {
      result.sessionStorage = false
    }

    result.indexedDB = 'indexedDB' in window

    return result
  }, [])

  // 检测电池信息
  const detectBattery = useCallback(async (): Promise<{
    batteryLevel?: number
    batteryCharging?: boolean
    batteryChargingTime?: number
    batteryDischargingTime?: number
  }> => {
    const result: any = {}

    try {
      // @ts-ignore
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery()
        result.batteryLevel = Math.round(battery.level * 100)
        result.batteryCharging = battery.charging
        result.batteryChargingTime = battery.chargingTime
        result.batteryDischargingTime = battery.dischargingTime
      }
    } catch (e) {
      // 不支持或权限被拒绝
    }

    return result
  }, [])

  // 获取网络信息
  const getNetworkInfo = useCallback((): { connectionType?: string; connectionSpeed?: string; isOnline: boolean } => {
    const result = {
      isOnline: navigator.onLine
    } as any

    // @ts-ignore
    if ('connection' in navigator) {
      // @ts-ignore
      const connection = navigator.connection as any
      result.connectionType = connection?.effectiveType || connection?.type
      result.connectionSpeed = connection?.downlink ? `${connection.downlink} Mbps` : undefined
    }

    return result
  }, [])

  // 收集所有设备信息
  const collectDeviceInfo = useCallback(async (): Promise<DeviceInfo> => {
    const browser = detectBrowser()
    const os = detectOS()
    const device = detectDeviceType()
    const sensors = await detectSensors()
    const storage = detectStorage()
    const battery = await detectBattery()
    const network = getNetworkInfo()

    const info: DeviceInfo = {
      // 基本信息
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: Array.from(navigator.languages),

      // 屏幕信息
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenColorDepth: screen.colorDepth,
      screenPixelDepth: screen.pixelDepth,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      devicePixelRatio: window.devicePixelRatio,

      // 浏览器信息
      browserName: browser.name,
      browserVersion: browser.version,
      engineName: browser.engine,

      // 设备类型
      deviceType: device.type,
      isMobile: device.isMobile,
      isTablet: device.isTablet,
      isDesktop: device.isDesktop,

      // 操作系统
      osName: os.name,
      osVersion: os.version,

      // 网络信息
      ...network,

      // 硬件信息
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,

      // 其他特性
      cookieEnabled: navigator.cookieEnabled,
      javaEnabled: false, // Java 插件已被废弃
      doNotTrack: navigator.doNotTrack,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      // 传感器支持
      ...sensors,

      // 存储信息
      ...storage,

      // 电池信息
      ...battery
    }

    return info
  }, [detectBrowser, detectOS, detectDeviceType, detectSensors, detectStorage, detectBattery, getNetworkInfo])

  // 初始化检测
  useEffect(() => {
    const initDetection = async () => {
      setIsLoading(true)
      try {
        const info = await collectDeviceInfo()
        setDeviceInfo(info)
      } catch (error) {
        console.error('设备检测失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initDetection()
  }, [collectDeviceInfo])

  // 复制信息到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 生成设备报告
  const generateReport = useCallback(() => {
    if (!deviceInfo) return ''

    const report = [
      '# 设备特性检测报告',
      '',
      `检测时间: ${new Date().toLocaleString()}`,
      '',
      '## 基本信息',
      `- 设备类型: ${deviceInfo.deviceType}`,
      `- 操作系统: ${deviceInfo.osName} ${deviceInfo.osVersion}`,
      `- 浏览器: ${deviceInfo.browserName} ${deviceInfo.browserVersion}`,
      `- 渲染引擎: ${deviceInfo.engineName}`,
      `- 平台: ${deviceInfo.platform}`,
      `- 语言: ${deviceInfo.language}`,
      `- 时区: ${deviceInfo.timezone}`,
      '',
      '## 屏幕信息',
      `- 屏幕分辨率: ${deviceInfo.screenWidth} × ${deviceInfo.screenHeight}`,
      `- 可用区域: ${deviceInfo.availWidth} × ${deviceInfo.availHeight}`,
      `- 设备像素比: ${deviceInfo.devicePixelRatio}`,
      `- 颜色深度: ${deviceInfo.screenColorDepth} 位`,
      '',
      '## 硬件信息',
      `- CPU 核心数: ${deviceInfo.hardwareConcurrency}`,
      `- 最大触摸点: ${deviceInfo.maxTouchPoints}`,
      `- 电池电量: ${deviceInfo.batteryLevel ? deviceInfo.batteryLevel + '%' : '不支持'}`,
      `- 充电状态: ${deviceInfo.batteryCharging !== undefined ? (deviceInfo.batteryCharging ? '充电中' : '未充电') : '不支持'}`,
      '',
      '## 网络信息',
      `- 在线状态: ${deviceInfo.isOnline ? '在线' : '离线'}`,
      `- 连接类型: ${deviceInfo.connectionType || '未知'}`,
      `- 连接速度: ${deviceInfo.connectionSpeed || '未知'}`,
      '',
      '## 传感器支持',
      `- 地理位置: ${deviceInfo.hasGeolocation ? '支持' : '不支持'}`,
      `- 加速度计: ${deviceInfo.hasAccelerometer ? '支持' : '不支持'}`,
      `- 陀螺仪: ${deviceInfo.hasGyroscope ? '支持' : '不支持'}`,
      `- 摄像头: ${deviceInfo.hasCamera ? '支持' : '不支持'}`,
      `- 麦克风: ${deviceInfo.hasMicrophone ? '支持' : '不支持'}`,
      '',
      '## 存储支持',
      `- Local Storage: ${deviceInfo.localStorage ? '支持' : '不支持'}`,
      `- Session Storage: ${deviceInfo.sessionStorage ? '支持' : '不支持'}`,
      `- IndexedDB: ${deviceInfo.indexedDB ? '支持' : '不支持'}`,
      '',
      '## 其他特性',
      `- Cookie: ${deviceInfo.cookieEnabled ? '启用' : '禁用'}`,
      `- Do Not Track: ${deviceInfo.doNotTrack || '未设置'}`,
      '',
      '## User Agent',
      deviceInfo.userAgent
    ].join('\n')

    return report
  }, [deviceInfo])

  // 下载报告
  const downloadReport = () => {
    const report = generateReport()
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'device-detection-report.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">正在检测设备特性...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!deviceInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-red-600 dark:text-red-400">设备检测失败</p>
          </div>
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
            📱 设备特性检测
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            检测当前设备的硬件和软件特性
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => copyToClipboard(generateReport())}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              复制报告
            </button>
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              下载报告
            </button>
          </div>
        </div>

        {/* 设备概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">设备类型</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 capitalize">
              {deviceInfo.deviceType}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {deviceInfo.isMobile && '移动设备'}
              {deviceInfo.isTablet && '平板设备'}
              {deviceInfo.isDesktop && '桌面设备'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">屏幕</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {deviceInfo.screenWidth}×{deviceInfo.screenHeight}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              像素比: {deviceInfo.devicePixelRatio}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-8 h-8 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">处理器</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {deviceInfo.hardwareConcurrency}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              核心数
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Battery className="w-8 h-8 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">电池</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {deviceInfo.batteryLevel !== undefined ? `${deviceInfo.batteryLevel}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {deviceInfo.batteryCharging !== undefined
                ? (deviceInfo.batteryCharging ? '充电中' : '未充电')
                : '不支持'
              }
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 系统信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">系统信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">操作系统:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.osName} {deviceInfo.osVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">浏览器:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.browserName} {deviceInfo.browserVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">渲染引擎:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.engineName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">平台:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">语言:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">时区:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.timezone}</span>
              </div>
            </div>
          </div>

          {/* 屏幕信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">屏幕信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">分辨率:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.screenWidth} × {deviceInfo.screenHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">可用区域:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.availWidth} × {deviceInfo.availHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">设备像素比:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.devicePixelRatio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">颜色深度:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.screenColorDepth} 位</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">像素深度:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.screenPixelDepth} 位</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">最大触摸点:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.maxTouchPoints}</span>
              </div>
            </div>
          </div>

          {/* 网络信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              网络信息
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">在线状态:</span>
                <span className={`${deviceInfo.isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.isOnline ? '在线' : '离线'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">连接类型:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.connectionType || '未知'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">连接速度:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.connectionSpeed || '未知'}</span>
              </div>
            </div>
          </div>

          {/* 传感器支持 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">传感器支持</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">地理位置:</span>
                <span className={`${deviceInfo.hasGeolocation ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.hasGeolocation ? '支持' : '不支持'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">加速度计:</span>
                <span className={`${deviceInfo.hasAccelerometer ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.hasAccelerometer ? '支持' : '不支持'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">陀螺仪:</span>
                <span className={`${deviceInfo.hasGyroscope ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.hasGyroscope ? '支持' : '不支持'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">摄像头:</span>
                <span className={`${deviceInfo.hasCamera ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.hasCamera ? '支持' : '不支持'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">麦克风:</span>
                <span className={`${deviceInfo.hasMicrophone ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.hasMicrophone ? '支持' : '不支持'}
                </span>
              </div>
            </div>
          </div>

          {/* 存储支持 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              存储支持
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Local Storage:</span>
                <span className={`${deviceInfo.localStorage ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.localStorage ? '支持' : '不支持'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Session Storage:</span>
                <span className={`${deviceInfo.sessionStorage ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.sessionStorage ? '支持' : '不支持'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">IndexedDB:</span>
                <span className={`${deviceInfo.indexedDB ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.indexedDB ? '支持' : '不支持'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cookie:</span>
                <span className={`${deviceInfo.cookieEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {deviceInfo.cookieEnabled ? '启用' : '禁用'}
                </span>
              </div>
            </div>
          </div>

          {/* 其他特性 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">其他特性</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Do Not Track:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.doNotTrack || '未设置'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">支持语言:</span>
                <span className="text-gray-900 dark:text-gray-100">{deviceInfo.languages.length} 种</span>
              </div>
              {deviceInfo.batteryLevel !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">电池电量:</span>
                    <span className="text-gray-900 dark:text-gray-100">{deviceInfo.batteryLevel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">充电状态:</span>
                    <span className={`${deviceInfo.batteryCharging ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {deviceInfo.batteryCharging ? '充电中' : '未充电'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Agent */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Agent</h3>
            <button
              onClick={() => copyToClipboard(deviceInfo.userAgent)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <code className="text-sm text-gray-700 dark:text-gray-300 break-all">
              {deviceInfo.userAgent}
            </code>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">检测内容</h4>
              <ul className="space-y-1">
                <li>• 设备类型和操作系统信息</li>
                <li>• 浏览器和渲染引擎版本</li>
                <li>• 屏幕分辨率和显示特性</li>
                <li>• 硬件传感器支持情况</li>
                <li>• 网络连接和存储支持</li>
                <li>• 电池状态（如果支持）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 某些信息可能需要用户授权</li>
                <li>• 不同浏览器支持的特性不同</li>
                <li>• 隐私设置可能影响检测结果</li>
                <li>• 检测结果仅供参考</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}