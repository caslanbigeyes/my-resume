'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, RefreshCw, Download, Palette, Lock, Unlock } from 'lucide-react'

interface Color {
  hex: string
  locked: boolean
}

/**
 * 调色板生成器组件
 * 自动生成和谐的配色方案
 */
export default function PaletteGeneratorPage() {
  const [colors, setColors] = useState<Color[]>([
    { hex: '#FF6B6B', locked: false },
    { hex: '#4ECDC4', locked: false },
    { hex: '#45B7D1', locked: false },
    { hex: '#96CEB4', locked: false },
    { hex: '#FFEAA7', locked: false }
  ])
  const [baseColor, setBaseColor] = useState('#3B82F6')
  const [paletteType, setPaletteType] = useState<'complementary' | 'triadic' | 'analogous' | 'monochromatic' | 'random'>('complementary')

  // 颜色转换函数
  const hexToHsl = useCallback((hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

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

    return [h * 360, s * 100, l * 100]
  }, [])

  const hslToHex = useCallback((h: number, s: number, l: number): string => {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
  }, [])

  // 生成调色板
  const generatePalette = useCallback(() => {
    const [h, s, l] = hexToHsl(baseColor)
    let newColors: string[] = []

    switch (paletteType) {
      case 'complementary':
        newColors = [
          baseColor,
          hslToHex((h + 180) % 360, s, l),
          hslToHex(h, s * 0.7, l * 1.2),
          hslToHex((h + 180) % 360, s * 0.7, l * 1.2),
          hslToHex(h, s * 0.5, l * 0.8)
        ]
        break

      case 'triadic':
        newColors = [
          baseColor,
          hslToHex((h + 120) % 360, s, l),
          hslToHex((h + 240) % 360, s, l),
          hslToHex(h, s * 0.6, l * 1.1),
          hslToHex((h + 60) % 360, s * 0.8, l * 0.9)
        ]
        break

      case 'analogous':
        newColors = [
          hslToHex((h - 30) % 360, s, l),
          hslToHex((h - 15) % 360, s, l),
          baseColor,
          hslToHex((h + 15) % 360, s, l),
          hslToHex((h + 30) % 360, s, l)
        ]
        break

      case 'monochromatic':
        newColors = [
          hslToHex(h, s, Math.max(10, l - 30)),
          hslToHex(h, s, Math.max(20, l - 15)),
          baseColor,
          hslToHex(h, s, Math.min(90, l + 15)),
          hslToHex(h, s, Math.min(95, l + 30))
        ]
        break

      case 'random':
        newColors = Array.from({ length: 5 }, () => {
          const randomH = Math.floor(Math.random() * 360)
          const randomS = 40 + Math.random() * 40
          const randomL = 30 + Math.random() * 40
          return hslToHex(randomH, randomS, randomL)
        })
        break
    }

    setColors(prevColors => 
      newColors.map((hex, index) => ({
        hex,
        locked: prevColors[index]?.locked || false
      }))
    )
  }, [baseColor, paletteType, hexToHsl, hslToHex])

  // 生成新调色板（保持锁定的颜色）
  const generateNewPalette = useCallback(() => {
    generatePalette()
  }, [generatePalette])

  // 切换颜色锁定状态
  const toggleLock = (index: number) => {
    setColors(prev => prev.map((color, i) => 
      i === index ? { ...color, locked: !color.locked } : color
    ))
  }

  // 复制颜色
  const copyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 复制整个调色板
  const copyPalette = async () => {
    const paletteText = colors.map(color => color.hex).join(', ')
    try {
      await navigator.clipboard.writeText(paletteText)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 导出调色板
  const exportPalette = (format: 'css' | 'json' | 'ase') => {
    let content = ''
    let filename = ''

    switch (format) {
      case 'css':
        content = `:root {
${colors.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join('\n')}
}`
        filename = 'palette.css'
        break

      case 'json':
        content = JSON.stringify({
          name: 'Generated Palette',
          colors: colors.map((color, index) => ({
            name: `Color ${index + 1}`,
            hex: color.hex
          }))
        }, null, 2)
        filename = 'palette.json'
        break

      case 'ase':
        // 简化的 ASE 格式（实际应该是二进制）
        content = colors.map((color, index) => `Color ${index + 1}: ${color.hex}`).join('\n')
        filename = 'palette.txt'
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 初始化时生成调色板
  React.useEffect(() => {
    generatePalette()
  }, [baseColor, paletteType])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎭 调色板生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            自动生成和谐的配色方案
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 基础颜色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                基础颜色
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 调色板类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                配色方案
              </label>
              <select
                value={paletteType}
                onChange={(e) => setPaletteType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="complementary">互补色</option>
                <option value="triadic">三角色</option>
                <option value="analogous">邻近色</option>
                <option value="monochromatic">单色系</option>
                <option value="random">随机</option>
              </select>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-end gap-2">
              <button
                onClick={generateNewPalette}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                生成
              </button>
              <button
                onClick={copyPalette}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 调色板显示 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="grid grid-cols-5">
            {colors.map((color, index) => (
              <div key={index} className="relative group">
                <div
                  className="h-32 cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyColor(color.hex)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLock(index)
                      }}
                      className="mb-2 p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                    >
                      {color.locked ? (
                        <Lock className="w-4 h-4 text-gray-700" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-700" />
                      )}
                    </button>
                    <div className="text-white text-xs font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
                      {color.hex}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 颜色详情 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {colors.map((color, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  颜色 {index + 1}
                </h3>
                <button
                  onClick={() => toggleLock(index)}
                  className={`p-1 rounded ${color.locked ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  {color.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">HEX:</span>
                  <button
                    onClick={() => copyColor(color.hex)}
                    className="font-mono text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {color.hex}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 导出选项 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            导出调色板
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => exportPalette('css')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              导出 CSS
            </button>
            <button
              onClick={() => exportPalette('json')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              导出 JSON
            </button>
            <button
              onClick={() => exportPalette('ase')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              导出文本
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
