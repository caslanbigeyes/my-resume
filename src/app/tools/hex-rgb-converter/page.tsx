'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Palette, RefreshCw, Eye } from 'lucide-react'

/**
 * HEX RGB 颜色转换工具组件
 * 支持 HEX、RGB、HSL 等颜色格式互相转换
 */
export default function HexRgbConverterPage() {
  const [hexInput, setHexInput] = useState('#3B82F6')
  const [rgbInput, setRgbInput] = useState({ r: 59, g: 130, b: 246 })

  // HEX 转 RGB
  const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }, [])

  // RGB 转 HEX
  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
  }, [])

  // RGB 转 HSL
  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255

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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }, [])

  // 计算颜色信息
  const colorInfo = useMemo(() => {
    const rgb = hexToRgb(hexInput)
    if (!rgb) return null

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    const isLight = brightness > 128

    return {
      hex: hexInput.toUpperCase(),
      rgb,
      hsl,
      brightness: Math.round(brightness),
      isLight,
      textColor: isLight ? '#000000' : '#FFFFFF'
    }
  }, [hexInput, hexToRgb, rgbToHsl])

  // 从 RGB 输入更新 HEX
  const updateFromRgb = useCallback(() => {
    const hex = rgbToHex(rgbInput.r, rgbInput.g, rgbInput.b)
    setHexInput(hex)
  }, [rgbInput, rgbToHex])

  // 从 HEX 输入更新 RGB
  const updateFromHex = useCallback((hex: string) => {
    setHexInput(hex)
    const rgb = hexToRgb(hex)
    if (rgb) {
      setRgbInput(rgb)
    }
  }, [hexToRgb])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 生成随机颜色
  const generateRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()
    updateFromHex(randomHex)
  }

  // 预设颜色
  const presetColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FF8000', '#8000FF', '#0080FF', '#80FF00', '#FF0080', '#00FF80',
    '#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#44FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎨 颜色转换工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            HEX、RGB、HSL 颜色格式互相转换
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：颜色输入和转换 */}
          <div className="space-y-6">
            {/* 颜色预览 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  颜色预览
                </h3>
              </div>
              <div className="p-6">
                <div
                  className="w-full h-32 rounded-lg border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-lg font-semibold"
                  style={{
                    backgroundColor: hexInput,
                    color: colorInfo?.textColor
                  }}
                >
                  {hexInput}
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={generateRandomColor}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    随机颜色
                  </button>
                </div>
              </div>
            </div>

            {/* HEX 输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">HEX 颜色</h3>
              </div>
              <div className="p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => updateFromHex(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="color"
                    value={hexInput}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={() => copyToClipboard(hexInput)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* RGB 输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">RGB 颜色</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {(['r', 'g', 'b'] as const).map((channel) => (
                    <div key={channel}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {channel.toUpperCase()}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbInput[channel]}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                          setRgbInput(prev => ({ ...prev, [channel]: value }))
                        }}
                        onBlur={updateFromRgb}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`rgb(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b})`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(`rgb(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b})`)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：颜色信息和预设 */}
          <div className="space-y-6">
            {/* 颜色信息 */}
            {colorInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">颜色信息</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        HEX
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={colorInfo.hex}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(colorInfo.hex)}
                          className="px-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        RGB
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={`${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b}`}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(`rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})`)}
                          className="px-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      HSL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(`hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`)}
                        className="px-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">亮度:</span>
                      <span className="ml-2 font-mono">{colorInfo.brightness}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">类型:</span>
                      <span className="ml-2">{colorInfo.isLight ? '浅色' : '深色'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 预设颜色 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  预设颜色
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateFromHex(color)}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CSS 代码示例 */}
            {colorInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS 代码</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {[
                      { label: 'background-color', value: colorInfo.hex },
                      { label: 'color', value: `rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})` },
                      { label: 'border-color', value: `hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)` }
                    ].map((css, index) => (
                      <div key={index} className="flex gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm">
                          {css.label}: {css.value};
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${css.label}: ${css.value};`)}
                          className="px-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
