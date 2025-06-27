'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Monitor, CheckCircle, XCircle, AlertTriangle, Copy, Download } from 'lucide-react'

interface FeatureTest {
  name: string
  category: string
  description: string
  test: () => boolean
  supported: boolean | null
  details?: string
}

interface BrowserInfo {
  name: string
  version: string
  engine: string
  platform: string
  mobile: boolean
}

/**
 * 浏览器兼容性检测工具组件
 * 检测浏览器对各种 Web 技术的支持情况
 */
export default function BrowserCompatibilityPage() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [features, setFeatures] = useState<FeatureTest[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // 获取浏览器信息
  const getBrowserInfo = useCallback((): BrowserInfo => {
    const userAgent = navigator.userAgent
    let name = 'Unknown'
    let version = 'Unknown'
    let engine = 'Unknown'

    // 检测浏览器
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'Chrome'
      version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown'
      engine = 'Blink'
    } else if (userAgent.includes('Firefox')) {
      name = 'Firefox'
      version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown'
      engine = 'Gecko'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari'
      version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown'
      engine = 'WebKit'
    } else if (userAgent.includes('Edg')) {
      name = 'Edge'
      version = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown'
      engine = 'Blink'
    }

    return {
      name,
      version,
      engine,
      platform: navigator.platform,
      mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    }
  }, [])

  // 定义特性测试
  const defineFeatureTests = useCallback((): FeatureTest[] => {
    return [
      // HTML5 特性
      {
        name: 'Canvas',
        category: 'HTML5',
        description: 'HTML5 Canvas 2D 绘图支持',
        test: () => {
          const canvas = document.createElement('canvas')
          return !!(canvas.getContext && canvas.getContext('2d'))
        },
        supported: null
      },
      {
        name: 'WebGL',
        category: 'HTML5',
        description: '3D 图形渲染支持',
        test: () => {
          const canvas = document.createElement('canvas')
          try {
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
          } catch (e) {
            return false
          }
        },
        supported: null
      },
      {
        name: 'Video',
        category: 'HTML5',
        description: 'HTML5 视频播放支持',
        test: () => {
          const video = document.createElement('video')
          return !!(video.canPlayType)
        },
        supported: null
      },
      {
        name: 'Audio',
        category: 'HTML5',
        description: 'HTML5 音频播放支持',
        test: () => {
          const audio = document.createElement('audio')
          return !!(audio.canPlayType)
        },
        supported: null
      },
      {
        name: 'Local Storage',
        category: 'HTML5',
        description: '本地存储支持',
        test: () => {
          try {
            return 'localStorage' in window && window.localStorage !== null
          } catch (e) {
            return false
          }
        },
        supported: null
      },
      {
        name: 'Session Storage',
        category: 'HTML5',
        description: '会话存储支持',
        test: () => {
          try {
            return 'sessionStorage' in window && window.sessionStorage !== null
          } catch (e) {
            return false
          }
        },
        supported: null
      },

      // CSS3 特性
      {
        name: 'CSS Grid',
        category: 'CSS3',
        description: 'CSS Grid 布局支持',
        test: () => {
          return CSS.supports('display', 'grid')
        },
        supported: null
      },
      {
        name: 'Flexbox',
        category: 'CSS3',
        description: 'CSS Flexbox 布局支持',
        test: () => {
          return CSS.supports('display', 'flex')
        },
        supported: null
      },
      {
        name: 'CSS Variables',
        category: 'CSS3',
        description: 'CSS 自定义属性支持',
        test: () => {
          return CSS.supports('color', 'var(--test)')
        },
        supported: null
      },
      {
        name: 'CSS Animations',
        category: 'CSS3',
        description: 'CSS 动画支持',
        test: () => {
          return CSS.supports('animation', 'test 1s')
        },
        supported: null
      },
      {
        name: 'CSS Transforms',
        category: 'CSS3',
        description: 'CSS 变换支持',
        test: () => {
          return CSS.supports('transform', 'translateX(1px)')
        },
        supported: null
      },

      // JavaScript 特性
      {
        name: 'ES6 Classes',
        category: 'JavaScript',
        description: 'ES6 类语法支持',
        test: () => {
          try {
            eval('class Test {}')
            return true
          } catch (e) {
            return false
          }
        },
        supported: null
      },
      {
        name: 'Arrow Functions',
        category: 'JavaScript',
        description: 'ES6 箭头函数支持',
        test: () => {
          try {
            eval('() => {}')
            return true
          } catch (e) {
            return false
          }
        },
        supported: null
      },
      {
        name: 'Promises',
        category: 'JavaScript',
        description: 'Promise 异步编程支持',
        test: () => {
          return typeof Promise !== 'undefined'
        },
        supported: null
      },
      {
        name: 'Async/Await',
        category: 'JavaScript',
        description: 'ES2017 async/await 支持',
        test: () => {
          try {
            eval('async function test() { await 1; }')
            return true
          } catch (e) {
            return false
          }
        },
        supported: null
      },
      {
        name: 'Modules',
        category: 'JavaScript',
        description: 'ES6 模块支持',
        test: () => {
          const script = document.createElement('script')
          return 'noModule' in script
        },
        supported: null
      },

      // Web APIs
      {
        name: 'Geolocation',
        category: 'Web APIs',
        description: '地理位置 API 支持',
        test: () => {
          return 'geolocation' in navigator
        },
        supported: null
      },
      {
        name: 'Web Workers',
        category: 'Web APIs',
        description: 'Web Workers 多线程支持',
        test: () => {
          return typeof Worker !== 'undefined'
        },
        supported: null
      },
      {
        name: 'Service Workers',
        category: 'Web APIs',
        description: 'Service Workers 支持',
        test: () => {
          return 'serviceWorker' in navigator
        },
        supported: null
      },
      {
        name: 'WebSockets',
        category: 'Web APIs',
        description: 'WebSocket 实时通信支持',
        test: () => {
          return typeof WebSocket !== 'undefined'
        },
        supported: null
      },
      {
        name: 'Fetch API',
        category: 'Web APIs',
        description: 'Fetch API 网络请求支持',
        test: () => {
          return typeof fetch !== 'undefined'
        },
        supported: null
      },
      {
        name: 'Notifications',
        category: 'Web APIs',
        description: '浏览器通知 API 支持',
        test: () => {
          return 'Notification' in window
        },
        supported: null
      },

      // 媒体特性
      {
        name: 'WebRTC',
        category: 'Media',
        description: '实时通信支持',
        test: () => {
          return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        },
        supported: null
      },
      {
        name: 'Web Audio API',
        category: 'Media',
        description: 'Web Audio API 支持',
        test: () => {
          return typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'
        },
        supported: null
      },
      {
        name: 'Media Recorder',
        category: 'Media',
        description: '媒体录制 API 支持',
        test: () => {
          return typeof MediaRecorder !== 'undefined'
        },
        supported: null
      }
    ]
  }, [])

  // 运行特性测试
  const runFeatureTests = useCallback(async () => {
    setIsLoading(true)
    const tests = defineFeatureTests()
    
    // 模拟异步测试过程
    for (let i = 0; i < tests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50))
      
      try {
        tests[i].supported = tests[i].test()
      } catch (error) {
        tests[i].supported = false
        tests[i].details = error instanceof Error ? error.message : 'Test failed'
      }
      
      setFeatures([...tests])
    }
    
    setIsLoading(false)
  }, [defineFeatureTests])

  // 获取分类列表
  const categories = React.useMemo(() => {
    const cats = ['all', ...new Set(features.map(f => f.category))]
    return cats
  }, [features])

  // 过滤特性
  const filteredFeatures = React.useMemo(() => {
    if (selectedCategory === 'all') return features
    return features.filter(f => f.category === selectedCategory)
  }, [features, selectedCategory])

  // 计算统计信息
  const stats = React.useMemo(() => {
    const total = features.length
    const supported = features.filter(f => f.supported === true).length
    const unsupported = features.filter(f => f.supported === false).length
    const supportRate = total > 0 ? Math.round((supported / total) * 100) : 0

    return { total, supported, unsupported, supportRate }
  }, [features])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 生成报告
  const generateReport = () => {
    const report = [
      '# 浏览器兼容性检测报告',
      '',
      `检测时间: ${new Date().toLocaleString()}`,
      '',
      '## 浏览器信息',
      `- 浏览器: ${browserInfo?.name} ${browserInfo?.version}`,
      `- 引擎: ${browserInfo?.engine}`,
      `- 平台: ${browserInfo?.platform}`,
      `- 移动设备: ${browserInfo?.mobile ? '是' : '否'}`,
      '',
      '## 兼容性统计',
      `- 总特性数: ${stats.total}`,
      `- 支持特性: ${stats.supported}`,
      `- 不支持特性: ${stats.unsupported}`,
      `- 支持率: ${stats.supportRate}%`,
      '',
      '## 详细结果',
      ''
    ]

    categories.slice(1).forEach(category => {
      const categoryFeatures = features.filter(f => f.category === category)
      if (categoryFeatures.length > 0) {
        report.push(`### ${category}`)
        categoryFeatures.forEach(feature => {
          const status = feature.supported ? '✅' : '❌'
          report.push(`- ${status} ${feature.name}: ${feature.description}`)
        })
        report.push('')
      }
    })

    return report.join('\n')
  }

  // 下载报告
  const downloadReport = () => {
    const report = generateReport()
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'browser-compatibility-report.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 获取支持状态图标
  const getSupportIcon = (supported: boolean | null) => {
    if (supported === null) {
      return <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
    }
    return supported ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  // 初始化
  useEffect(() => {
    setBrowserInfo(getBrowserInfo())
    runFeatureTests()
  }, [getBrowserInfo, runFeatureTests])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🌐 浏览器兼容性检测
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            检测当前浏览器对各种 Web 技术的支持情况
          </p>
        </div>

        {/* 浏览器信息 */}
        {browserInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Monitor className="w-6 h-6" />
              浏览器信息
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {browserInfo.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">浏览器</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {browserInfo.version}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">版本</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {browserInfo.engine}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">引擎</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {browserInfo.mobile ? '移动' : '桌面'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">设备类型</div>
              </div>
            </div>
          </div>
        )}

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">总特性数</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.supported}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">支持特性</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.unsupported}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">不支持特性</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.supportRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">支持率</div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 分类筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">分类:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => copyToClipboard(generateReport())}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                复制报告
              </button>
              <button
                onClick={downloadReport}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                下载报告
              </button>
            </div>
          </div>
        </div>

        {/* 特性检测结果 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              特性检测结果
              {isLoading && (
                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">检测中...</span>
              )}
            </h2>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {filteredFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex-shrink-0">
                    {getSupportIcon(feature.supported)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {feature.name}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {feature.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                    {feature.details && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {feature.details}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      feature.supported === true
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : feature.supported === false
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {feature.supported === true ? '支持' : feature.supported === false ? '不支持' : '检测中'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">检测内容</h4>
              <ul className="space-y-1">
                <li>• HTML5 新特性支持</li>
                <li>• CSS3 样式和布局</li>
                <li>• JavaScript ES6+ 语法</li>
                <li>• Web APIs 接口</li>
                <li>• 媒体和图形技术</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 检测结果基于当前浏览器环境</li>
                <li>• 某些特性可能需要用户授权</li>
                <li>• 不同版本浏览器支持度不同</li>
                <li>• 建议定期检测以获取最新信息</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
