'use client'

import React, { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy, Palette, Eye } from 'lucide-react'

/**
 * 颜色选择器工具组件
 * 取色并复制十六进制值
 */
export default function ColorPickerTool() {
  const [selectedColor, setSelectedColor] = useState('#3B82F6')
  const [recentColors, setRecentColors] = useState<string[]>(['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'])

  /**
   * 颜色转换函数
   */
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (!rgb) return null

    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

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
  }

  /**
   * 复制颜色值
   */
  const copyColor = async (value: string, format: string) => {
    try {
      await navigator.clipboard.writeText(value)
      alert(`${format} 颜色值已复制: ${value}`)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 添加到最近使用
   */
  const addToRecent = useCallback((color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color)
      return [color, ...filtered].slice(0, 10)
    })
  }, [])

  /**
   * 处理颜色变化
   */
  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    addToRecent(color)
  }

  /**
   * 生成调色板
   */
  const generatePalette = (baseColor: string) => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return []

    const palette = []
    
    // 生成不同明度的颜色
    for (let i = 0; i < 5; i++) {
      const factor = 0.2 + (i * 0.2)
      const r = Math.round(rgb.r * factor + 255 * (1 - factor))
      const g = Math.round(rgb.g * factor + 255 * (1 - factor))
      const b = Math.round(rgb.b * factor + 255 * (1 - factor))
      palette.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
    }

    return palette
  }

  const rgb = hexToRgb(selectedColor)
  const hsl = hexToHsl(selectedColor)
  const palette = generatePalette(selectedColor)

  return (
    <ToolLayout
      title="颜色选择器"
      description="取色并复制十六进制值"
      category="颜色设计"
      icon="🎨"
    >
      <div className="space-y-6">
        {/* 主颜色选择器 */}
        <div className="text-center">
          <div className="mb-4">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-32 h-32 rounded-lg border-4 border-white shadow-lg cursor-pointer mx-auto block"
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {selectedColor.toUpperCase()}
          </div>
          <button
            onClick={() => copyColor(selectedColor, 'HEX')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
          >
            <Copy className="w-4 h-4" />
            复制HEX值
          </button>
        </div>

        {/* 颜色值显示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">HEX</h3>
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono">{selectedColor.toUpperCase()}</code>
              <button
                onClick={() => copyColor(selectedColor, 'HEX')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">RGB</h3>
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono">
                {rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'Invalid'}
              </code>
              <button
                onClick={() => rgb && copyColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">HSL</h3>
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono">
                {hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : 'Invalid'}
              </code>
              <button
                onClick={() => hsl && copyColor(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'HSL')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 调色板 */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            基于当前颜色的调色板
          </h3>
          <div className="flex gap-2 flex-wrap">
            {palette.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorChange(color)}
                className="w-12 h-12 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 最近使用的颜色 */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">最近使用</h3>
          <div className="flex gap-2 flex-wrap">
            {recentColors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color)}
                className="w-10 h-10 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 预设颜色 */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">预设颜色</h3>
          <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
            {[
              '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
              '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
              '#800000', '#804000', '#808000', '#408000', '#008000', '#008040',
              '#008080', '#004080', '#000080', '#400080', '#800080', '#800040',
              '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF', '#FFE4E1',
              '#FFF8DC', '#F0FFF0', '#F0F8FF', '#E6E6FA', '#FDF5E6', '#FFFACD'
            ].map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorChange(color)}
                className="w-8 h-8 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 颜色预览 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            颜色预览
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">文本示例</h4>
              <div className="space-y-2">
                <div style={{ color: selectedColor }} className="text-lg font-semibold">
                  这是使用选中颜色的文本
                </div>
                <div style={{ backgroundColor: selectedColor }} className="text-white p-2 rounded">
                  这是使用选中颜色作为背景的文本
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">UI元素示例</h4>
              <div className="space-y-2">
                <button 
                  style={{ backgroundColor: selectedColor }}
                  className="px-4 py-2 text-white rounded-lg w-full"
                >
                  按钮示例
                </button>
                <div 
                  style={{ borderColor: selectedColor }}
                  className="border-2 p-2 rounded-lg text-center"
                >
                  边框示例
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 点击颜色选择器选择颜色</li>
            <li>• 支持HEX、RGB、HSL三种格式</li>
            <li>• 自动生成基于当前颜色的调色板</li>
            <li>• 记录最近使用的颜色</li>
            <li>• 提供丰富的预设颜色</li>
            <li>• 实时预览颜色在不同场景下的效果</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
