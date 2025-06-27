'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { RefreshCw, Copy, Download, Palette, Heart, Settings } from 'lucide-react'

interface ColorInfo {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  hsv: { h: number; s: number; v: number }
  name?: string
  luminance: number
  isLight: boolean
}

interface GeneratorOptions {
  count: number
  colorSpace: 'random' | 'warm' | 'cool' | 'pastel' | 'vibrant' | 'monochrome'
  format: 'hex' | 'rgb' | 'hsl' | 'hsv'
  includeNames: boolean
}

/**
 * 随机颜色生成器组件
 * 生成各种风格的随机颜色
 */
export default function RandomColorPage() {
  const [colors, setColors] = useState<ColorInfo[]>([])
  const [favorites, setFavorites] = useState<ColorInfo[]>([])
  const [options, setOptions] = useState<GeneratorOptions>({
    count: 12,
    colorSpace: 'random',
    format: 'hex',
    includeNames: false
  })

  // 颜色名称数据库（简化版）
  const colorNames = [
    { name: '玫瑰红', hex: '#FF69B4' },
    { name: '天空蓝', hex: '#87CEEB' },
    { name: '薄荷绿', hex: '#98FB98' },
    { name: '柠檬黄', hex: '#FFFACD' },
    { name: '薰衣草紫', hex: '#E6E6FA' },
    { name: '珊瑚橙', hex: '#FF7F50' },
    { name: '海洋蓝', hex: '#006994' },
    { name: '森林绿', hex: '#228B22' },
    { name: '日落橙', hex: '#FF8C00' },
    { name: '深紫色', hex: '#9400D3' }
  ]

  // RGB 转 HSL
  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }, [])

  // RGB 转 HSV
  const rgbToHsv = useCallback((r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    const v = max
    const s = max === 0 ? 0 : (max - min) / max

    if (max !== min) {
      const d = max - min
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    }
  }, [])

  // 计算亮度
  const calculateLuminance = useCallback((r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }, [])

  // 查找最接近的颜色名称
  const findClosestColorName = useCallback((hex: string): string | undefined => {
    if (!options.includeNames) return undefined

    const targetRgb = {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    }

    let minDistance = Infinity
    let closestName = undefined

    for (const color of colorNames) {
      const rgb = {
        r: parseInt(color.hex.slice(1, 3), 16),
        g: parseInt(color.hex.slice(3, 5), 16),
        b: parseInt(color.hex.slice(5, 7), 16)
      }

      const distance = Math.sqrt(
        Math.pow(targetRgb.r - rgb.r, 2) +
        Math.pow(targetRgb.g - rgb.g, 2) +
        Math.pow(targetRgb.b - rgb.b, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        closestName = color.name
      }
    }

    return minDistance < 100 ? closestName : undefined
  }, [options.includeNames, colorNames])

  // 生成随机颜色
  const generateRandomColor = useCallback((): ColorInfo => {
    let r: number, g: number, b: number

    switch (options.colorSpace) {
      case 'warm':
        // 暖色调：红、橙、黄
        r = Math.floor(Math.random() * 100) + 155
        g = Math.floor(Math.random() * 150) + 50
        b = Math.floor(Math.random() * 100) + 20
        break

      case 'cool':
        // 冷色调：蓝、绿、紫
        r = Math.floor(Math.random() * 100) + 20
        g = Math.floor(Math.random() * 150) + 50
        b = Math.floor(Math.random() * 100) + 155
        break

      case 'pastel':
        // 柔和色调：高亮度、低饱和度
        const hue = Math.floor(Math.random() * 360)
        const saturation = Math.floor(Math.random() * 30) + 20
        const lightness = Math.floor(Math.random() * 20) + 70
        
        // HSL 转 RGB
        const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1))
        const m = lightness / 100 - c / 2
        
        let r1 = 0, g1 = 0, b1 = 0
        if (hue < 60) { r1 = c; g1 = x; b1 = 0 }
        else if (hue < 120) { r1 = x; g1 = c; b1 = 0 }
        else if (hue < 180) { r1 = 0; g1 = c; b1 = x }
        else if (hue < 240) { r1 = 0; g1 = x; b1 = c }
        else if (hue < 300) { r1 = x; g1 = 0; b1 = c }
        else { r1 = c; g1 = 0; b1 = x }
        
        r = Math.round((r1 + m) * 255)
        g = Math.round((g1 + m) * 255)
        b = Math.round((b1 + m) * 255)
        break

      case 'vibrant':
        // 鲜艳色调：高饱和度
        const vibrantHue = Math.floor(Math.random() * 360)
        const vibrantSat = Math.floor(Math.random() * 30) + 70
        const vibrantLight = Math.floor(Math.random() * 40) + 40
        
        // 简化的 HSL 转 RGB
        const a = vibrantSat / 100 * Math.min(vibrantLight / 100, 1 - vibrantLight / 100)
        const f = (n: number) => {
          const k = (n + vibrantHue / 30) % 12
          return vibrantLight / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        }
        r = Math.round(f(0) * 255)
        g = Math.round(f(8) * 255)
        b = Math.round(f(4) * 255)
        break

      case 'monochrome':
        // 单色调：灰度
        const gray = Math.floor(Math.random() * 256)
        r = g = b = gray
        break

      default:
        // 完全随机
        r = Math.floor(Math.random() * 256)
        g = Math.floor(Math.random() * 256)
        b = Math.floor(Math.random() * 256)
        break
    }

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase()
    const hsl = rgbToHsl(r, g, b)
    const hsv = rgbToHsv(r, g, b)
    const luminance = calculateLuminance(r, g, b)
    const isLight = luminance > 0.5
    const name = findClosestColorName(hex)

    return {
      hex,
      rgb: { r, g, b },
      hsl,
      hsv,
      name,
      luminance,
      isLight
    }
  }, [options.colorSpace, rgbToHsl, rgbToHsv, calculateLuminance, findClosestColorName])

  // 生成颜色组
  const generateColors = useCallback(() => {
    const newColors = Array.from({ length: options.count }, () => generateRandomColor())
    setColors(newColors)
  }, [options.count, generateRandomColor])

  // 格式化颜色值
  const formatColor = useCallback((color: ColorInfo): string => {
    switch (options.format) {
      case 'rgb':
        return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
      case 'hsl':
        return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`
      case 'hsv':
        return `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`
      default:
        return color.hex
    }
  }, [options.format])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 添加到收藏
  const toggleFavorite = useCallback((color: ColorInfo) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav.hex === color.hex)
      if (exists) {
        return prev.filter(fav => fav.hex !== color.hex)
      } else {
        return [...prev, color]
      }
    })
  }, [])

  // 检查是否已收藏
  const isFavorite = useCallback((color: ColorInfo): boolean => {
    return favorites.some(fav => fav.hex === color.hex)
  }, [favorites])

  // 导出调色板
  const exportPalette = () => {
    const paletteData = {
      colors: colors.map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl,
        hsv: color.hsv,
        name: color.name
      })),
      options,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'color-palette.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 生成 CSS 变量
  const generateCSSVariables = useMemo(() => {
    return colors.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join('\n')
  }, [colors])

  // 初始生成
  React.useEffect(() => {
    generateColors()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎨 随机颜色生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            生成各种风格的随机颜色调色板
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 颜色数量 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                颜色数量: {options.count}
              </label>
              <input
                type="range"
                min="4"
                max="24"
                value={options.count}
                onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>4</span>
                <span>24</span>
              </div>
            </div>

            {/* 色彩空间 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                色彩风格
              </label>
              <select
                value={options.colorSpace}
                onChange={(e) => setOptions(prev => ({ ...prev, colorSpace: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="random">随机</option>
                <option value="warm">暖色调</option>
                <option value="cool">冷色调</option>
                <option value="pastel">柔和色</option>
                <option value="vibrant">鲜艳色</option>
                <option value="monochrome">单色调</option>
              </select>
            </div>

            {/* 格式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                颜色格式
              </label>
              <select
                value={options.format}
                onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
                <option value="hsv">HSV</option>
              </select>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-2">
              <button
                onClick={generateColors}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                生成新颜色
              </button>
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={options.includeNames}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeNames: e.target.checked }))}
                  className="mr-2"
                />
                显示颜色名称
              </label>
            </div>
          </div>
        </div>

        {/* 颜色网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {colors.map((color, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 颜色块 */}
              <div
                className="h-24 cursor-pointer relative"
                style={{ backgroundColor: color.hex }}
                onClick={() => copyToClipboard(formatColor(color))}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                  <Copy className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(color)
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite(color) ? 'text-red-500 fill-current' : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>

              {/* 颜色信息 */}
              <div className="p-3">
                <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {formatColor(color)}
                </div>
                {color.name && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {color.name}
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {color.isLight ? '浅色' : '深色'} • 亮度 {Math.round(color.luminance * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 收藏夹 */}
        {favorites.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              收藏的颜色 ({favorites.length})
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {favorites.map((color, index) => (
                <div
                  key={index}
                  className="aspect-square rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(formatColor(color))}
                  title={`${formatColor(color)}${color.name ? ` (${color.name})` : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 导出选项 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CSS 变量 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                CSS 变量
              </h3>
              <button
                onClick={() => copyToClipboard(`:root {\n${generateCSSVariables}\n}`)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
              <code className="text-gray-700 dark:text-gray-300">
                {`:root {\n${generateCSSVariables}\n}`}
              </code>
            </pre>
          </div>

          {/* 导出选项 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              导出调色板
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={exportPalette}
                disabled={colors.length === 0}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载 JSON 格式
              </button>
              
              <button
                onClick={() => copyToClipboard(colors.map(c => formatColor(c)).join('\n'))}
                disabled={colors.length === 0}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                复制颜色列表
              </button>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 多种色彩风格选择</li>
                <li>• 支持多种颜色格式</li>
                <li>• 颜色收藏和管理</li>
                <li>• CSS 变量自动生成</li>
                <li>• 调色板导出功能</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 点击颜色块复制颜色值</li>
                <li>• 使用心形按钮收藏喜欢的颜色</li>
                <li>• 选择不同风格生成主题色</li>
                <li>• 导出 JSON 文件保存调色板</li>
                <li>• 复制 CSS 变量直接使用</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
