'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Download, Palette, Type, Sparkles, RefreshCw, Copy, Brain, Zap } from 'lucide-react'
import { styleRecommender, type StyleRecommendation } from '@/lib/styleRecommender'

/**
 * Logo生成工具组件
 * 创建个性化的Logo设计
 */
export default function LogoGeneratorTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [logoConfig, setLogoConfig] = useState({
    text: 'LOGO',
    fontSize: 48,
    fontFamily: 'Arial',
    textColor: '#2563eb',
    backgroundColor: '#ffffff',
    shape: 'circle',
    gradientStart: '#3b82f6',
    gradientEnd: '#8b5cf6',
    useGradient: false,
    shadowBlur: 10,
    shadowColor: '#00000040',
    borderWidth: 0,
    borderColor: '#e5e7eb',
    iconType: 'none',
    iconColor: '#6366f1'
  })

  const [logoHistory, setLogoHistory] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<StyleRecommendation[]>([])
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  /**
   * 初始化样式推荐器
   */
  useEffect(() => {
    const initializeRecommender = async () => {
      try {
        setIsModelLoading(true)
        await styleRecommender.initialize()
        console.log('🎨 样式推荐器已就绪')

        // 生成初始推荐
        await generateStyleRecommendations()
      } catch (error) {
        console.error('样式推荐器初始化失败:', error)
      } finally {
        setIsModelLoading(false)
      }
    }

    initializeRecommender()

    // 清理函数
    return () => {
      styleRecommender.dispose()
    }
  }, [])

  /**
   * 生成样式推荐
   */
  const generateStyleRecommendations = useCallback(async () => {
    if (isModelLoading) return

    try {
      setIsGeneratingRecommendations(true)

      // 提取当前设计特征
      const features = styleRecommender.extractFeatures(logoConfig)

      // 获取推荐
      const newRecommendations = await styleRecommender.getRecommendations(features)
      setRecommendations(newRecommendations)

      console.log('🎯 生成了', newRecommendations.length, '个样式推荐')
    } catch (error) {
      console.error('生成样式推荐失败:', error)
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }, [logoConfig, isModelLoading])

  /**
   * 应用推荐样式
   */
  const applyRecommendation = useCallback((recommendation: StyleRecommendation) => {
    setLogoConfig(prev => ({
      ...prev,
      textColor: recommendation.colors.primary,
      backgroundColor: recommendation.colors.secondary,
      gradientStart: recommendation.colors.primary,
      gradientEnd: recommendation.colors.accent,
      fontFamily: recommendation.fonts.primary,
      useGradient: true
    }))
  }, [])

  /**
   * 字体选项
   */
  const fontOptions = [
    { value: 'Arial', label: 'Arial - 经典' },
    { value: 'Helvetica', label: 'Helvetica - 现代' },
    { value: 'Georgia', label: 'Georgia - 优雅' },
    { value: 'Times New Roman', label: 'Times - 传统' },
    { value: 'Courier New', label: 'Courier - 等宽' },
    { value: 'Impact', label: 'Impact - 粗体' },
    { value: 'Comic Sans MS', label: 'Comic Sans - 活泼' },
    { value: 'Trebuchet MS', label: 'Trebuchet - 友好' }
  ]

  /**
   * 形状选项
   */
  const shapeOptions = [
    { value: 'circle', label: '圆形', icon: '●' },
    { value: 'square', label: '方形', icon: '■' },
    { value: 'rounded', label: '圆角', icon: '▢' },
    { value: 'hexagon', label: '六边形', icon: '⬡' },
    { value: 'diamond', label: '菱形', icon: '◆' },
    { value: 'none', label: '无背景', icon: '○' }
  ]

  /**
   * 图标选项
   */
  const iconOptions = [
    { value: 'none', label: '无图标', symbol: '' },
    { value: 'star', label: '星星', symbol: '★' },
    { value: 'heart', label: '爱心', symbol: '♥' },
    { value: 'diamond', label: '钻石', symbol: '♦' },
    { value: 'crown', label: '皇冠', symbol: '♔' },
    { value: 'lightning', label: '闪电', symbol: '⚡' },
    { value: 'leaf', label: '叶子', symbol: '🍃' },
    { value: 'rocket', label: '火箭', symbol: '🚀' },
    { value: 'gear', label: '齿轮', symbol: '⚙' },
    { value: 'shield', label: '盾牌', symbol: '🛡' }
  ]

  /**
   * 预设颜色方案
   */
  const colorSchemes = [
    { name: '经典蓝', bg: '#ffffff', text: '#2563eb', gradient: ['#3b82f6', '#1d4ed8'] },
    { name: '优雅紫', bg: '#ffffff', text: '#7c3aed', gradient: ['#8b5cf6', '#6d28d9'] },
    { name: '活力橙', bg: '#ffffff', text: '#ea580c', gradient: ['#f97316', '#c2410c'] },
    { name: '自然绿', bg: '#ffffff', text: '#059669', gradient: ['#10b981', '#047857'] },
    { name: '热情红', bg: '#ffffff', text: '#dc2626', gradient: ['#ef4444', '#b91c1c'] },
    { name: '深邃黑', bg: '#000000', text: '#ffffff', gradient: ['#374151', '#111827'] },
    { name: '渐变彩虹', bg: '#ffffff', text: '#6366f1', gradient: ['#f59e0b', '#ef4444'] },
    { name: '科技蓝', bg: '#0f172a', text: '#38bdf8', gradient: ['#0ea5e9', '#0284c7'] }
  ]

  /**
   * 绘制Logo
   */
  const drawLogo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸
    canvas.width = 300
    canvas.height = 300
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const size = Math.min(canvas.width, canvas.height) * 0.8

    // 绘制背景形状
    if (logoConfig.shape !== 'none') {
      ctx.save()
      
      // 设置阴影
      if (logoConfig.shadowBlur > 0) {
        ctx.shadowBlur = logoConfig.shadowBlur
        ctx.shadowColor = logoConfig.shadowColor
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
      }

      // 设置填充样式
      if (logoConfig.useGradient) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, logoConfig.gradientStart)
        gradient.addColorStop(1, logoConfig.gradientEnd)
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = logoConfig.backgroundColor
      }

      // 绘制形状
      ctx.beginPath()
      switch (logoConfig.shape) {
        case 'circle':
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2)
          break
        case 'square':
          ctx.rect(centerX - size / 2, centerY - size / 2, size, size)
          break
        case 'rounded':
          const radius = size * 0.1
          const x = centerX - size / 2
          const y = centerY - size / 2
          ctx.roundRect(x, y, size, size, radius)
          break
        case 'hexagon':
          const hexRadius = size / 2
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const x = centerX + hexRadius * Math.cos(angle)
            const y = centerY + hexRadius * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          break
        case 'diamond':
          ctx.moveTo(centerX, centerY - size / 2)
          ctx.lineTo(centerX + size / 2, centerY)
          ctx.lineTo(centerX, centerY + size / 2)
          ctx.lineTo(centerX - size / 2, centerY)
          ctx.closePath()
          break
      }
      
      ctx.fill()

      // 绘制边框
      if (logoConfig.borderWidth > 0) {
        ctx.strokeStyle = logoConfig.borderColor
        ctx.lineWidth = logoConfig.borderWidth
        ctx.stroke()
      }

      ctx.restore()
    }

    // 绘制图标
    if (logoConfig.iconType !== 'none') {
      const iconOption = iconOptions.find(opt => opt.value === logoConfig.iconType)
      if (iconOption && iconOption.symbol) {
        ctx.save()
        ctx.fillStyle = logoConfig.iconColor
        ctx.font = `${logoConfig.fontSize * 0.6}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(iconOption.symbol, centerX, centerY - logoConfig.fontSize * 0.3)
        ctx.restore()
      }
    }

    // 绘制文字
    if (logoConfig.text) {
      ctx.save()
      ctx.fillStyle = logoConfig.textColor
      ctx.font = `bold ${logoConfig.fontSize}px ${logoConfig.fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const textY = logoConfig.iconType !== 'none' ? centerY + logoConfig.fontSize * 0.4 : centerY
      ctx.fillText(logoConfig.text, centerX, textY)
      ctx.restore()
    }
  }, [logoConfig])

  /**
   * 更新配置
   */
  const updateConfig = (key: string, value: any) => {
    setLogoConfig(prev => ({ ...prev, [key]: value }))
  }

  /**
   * 应用颜色方案
   */
  const applyColorScheme = (scheme: typeof colorSchemes[0]) => {
    setLogoConfig(prev => ({
      ...prev,
      backgroundColor: scheme.bg,
      textColor: scheme.text,
      gradientStart: scheme.gradient[0],
      gradientEnd: scheme.gradient[1]
    }))
  }

  /**
   * 随机生成Logo
   */
  const generateRandomLogo = () => {
    const randomScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
    const randomShape = shapeOptions[Math.floor(Math.random() * shapeOptions.length)]
    const randomIcon = iconOptions[Math.floor(Math.random() * iconOptions.length)]
    const randomFont = fontOptions[Math.floor(Math.random() * fontOptions.length)]

    setLogoConfig(prev => ({
      ...prev,
      backgroundColor: randomScheme.bg,
      textColor: randomScheme.text,
      gradientStart: randomScheme.gradient[0],
      gradientEnd: randomScheme.gradient[1],
      shape: randomShape.value,
      iconType: randomIcon.value,
      fontFamily: randomFont.value,
      useGradient: Math.random() > 0.5,
      fontSize: 32 + Math.floor(Math.random() * 32),
      shadowBlur: Math.floor(Math.random() * 20)
    }))
  }

  /**
   * 下载Logo
   */
  const downloadLogo = (format: 'png' | 'svg' = 'png') => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (format === 'png') {
      const link = document.createElement('a')
      link.download = `logo-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  /**
   * 保存到历史记录
   */
  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    setLogoHistory(prev => [dataUrl, ...prev.slice(0, 9)]) // 保留最近10个
  }

  // 实时绘制Logo
  React.useEffect(() => {
    drawLogo()
  }, [drawLogo])

  // 当配置改变时，重新生成推荐
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateStyleRecommendations()
    }, 1000) // 1秒防抖

    return () => clearTimeout(debounceTimer)
  }, [logoConfig.textColor, logoConfig.backgroundColor, logoConfig.fontFamily, logoConfig.shape, generateStyleRecommendations])

  return (
    <ToolLayout
      title="Logo生成器"
      description="创建个性化的Logo设计"
      category="图片多媒体"
      icon="🎨"
    >
      <div className="space-y-6">
        {/* Logo预览区域 */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 画布预览 */}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Logo预览
              </h3>
              
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={generateRandomLogo}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4" />
                  随机生成
                </button>

                <button
                  onClick={generateStyleRecommendations}
                  disabled={isModelLoading || isGeneratingRecommendations}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingRecommendations ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  AI推荐
                </button>

                <button
                  onClick={saveToHistory}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  保存设计
                </button>

                <button
                  onClick={() => downloadLogo('png')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载PNG
                </button>
              </div>
            </div>

            {/* AI 样式推荐 */}
            <div className="lg:w-80">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100">AI 样式推荐</h4>
                {isModelLoading && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {isModelLoading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">AI 模型加载中...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <button
                      key={index}
                      onClick={() => applyRecommendation(rec)}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 group hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {rec.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-500">
                            {Math.round(rec.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: rec.colors.primary }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: rec.colors.secondary }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: rec.colors.accent }}
                        ></div>
                        <span className="text-xs text-gray-500 ml-auto">
                          {rec.fonts.primary}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {rec.characteristics.slice(0, 2).map((char, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">暂无推荐</p>
                </div>
              )}

              {/* 快速颜色方案 */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">快速配色</h4>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.slice(0, 4).map((scheme, index) => (
                    <button
                      key={index}
                      onClick={() => applyColorScheme(scheme)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: scheme.bg }}
                        ></div>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: scheme.text }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">
                        {scheme.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 设计控制面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 文字设置 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              文字设置
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo文字
                </label>
                <input
                  type="text"
                  value={logoConfig.text}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入Logo文字..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  字体: {logoConfig.fontFamily}
                </label>
                <select
                  value={logoConfig.fontFamily}
                  onChange={(e) => updateConfig('fontFamily', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {fontOptions.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  字体大小: {logoConfig.fontSize}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="80"
                  value={logoConfig.fontSize}
                  onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文字颜色
                </label>
                <input
                  type="color"
                  value={logoConfig.textColor}
                  onChange={(e) => updateConfig('textColor', e.target.value)}
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 背景与形状设置 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              背景与形状
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  背景形状
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {shapeOptions.map(shape => (
                    <button
                      key={shape.value}
                      onClick={() => updateConfig('shape', shape.value)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        logoConfig.shape === shape.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-lg mb-1">{shape.icon}</div>
                      <div className="text-xs">{shape.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useGradient"
                  checked={logoConfig.useGradient}
                  onChange={(e) => updateConfig('useGradient', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="useGradient" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  使用渐变背景
                </label>
              </div>

              {logoConfig.useGradient ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">起始色</label>
                    <input
                      type="color"
                      value={logoConfig.gradientStart}
                      onChange={(e) => updateConfig('gradientStart', e.target.value)}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">结束色</label>
                    <input
                      type="color"
                      value={logoConfig.gradientEnd}
                      onChange={(e) => updateConfig('gradientEnd', e.target.value)}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    背景颜色
                  </label>
                  <input
                    type="color"
                    value={logoConfig.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  图标装饰
                </label>
                <select
                  value={logoConfig.iconType}
                  onChange={(e) => updateConfig('iconType', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>
                      {icon.symbol} {icon.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 历史记录 */}
        {logoHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">设计历史</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {logoHistory.map((logoUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={logoUrl}
                    alt={`Logo ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.download = `logo-history-${index + 1}.png`
                        link.href = logoUrl
                        link.click()
                      }}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI 功能介绍 */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-6 h-6 text-blue-500" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">🤖 AI 智能推荐</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">智能分析</h4>
              <ul className="space-y-1">
                <li>• 基于 TensorFlow.js 深度学习模型</li>
                <li>• 分析色彩、字体、形状等设计特征</li>
                <li>• 实时生成个性化样式推荐</li>
                <li>• 学习设计规律和美学原则</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">推荐类型</h4>
              <ul className="space-y-1">
                <li>• 现代简约 - 简洁线条，高对比度</li>
                <li>• 经典优雅 - 传统美感，温和色调</li>
                <li>• 创意活力 - 鲜艳色彩，动感设计</li>
                <li>• 极简主义 - 留白艺术，纯净色彩</li>
                <li>• 商务专业 - 稳重可信，清晰易读</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>使用提示：</strong>每次修改设计后，AI 会自动分析并更新推荐。点击推荐卡片即可一键应用样式！
            </p>
          </div>
        </div>

        {/* 设计技巧 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">✨ 设计技巧</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <ul className="space-y-2">
              <li>• 选择简洁易读的字体，避免过于复杂</li>
              <li>• 使用对比度高的颜色组合提升可读性</li>
              <li>• 圆形和圆角矩形更显现代感</li>
              <li>• 渐变色彩能增加视觉层次感</li>
            </ul>
            <ul className="space-y-2">
              <li>• 图标装饰要与品牌调性匹配</li>
              <li>• 保持设计简洁，避免元素过多</li>
              <li>• 考虑Logo在不同尺寸下的显示效果</li>
              <li>• 结合 AI 推荐获取专业设计灵感</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
