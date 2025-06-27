'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

/**
 * 对比度检测工具组件
 * 检查颜色对比度是否符合 WCAG 标准
 */
export default function ContrastCheckerPage() {
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')

  // 计算相对亮度
  const getLuminance = useCallback((hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }, [])

  // 计算对比度
  const contrastRatio = useMemo(() => {
    const l1 = getLuminance(foregroundColor)
    const l2 = getLuminance(backgroundColor)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  }, [foregroundColor, backgroundColor, getLuminance])

  // WCAG 等级检查
  const wcagResults = useMemo(() => {
    return {
      aa: {
        normal: contrastRatio >= 4.5,
        large: contrastRatio >= 3
      },
      aaa: {
        normal: contrastRatio >= 7,
        large: contrastRatio >= 4.5
      }
    }
  }, [contrastRatio])

  // 获取等级状态
  const getGradeStatus = (passed: boolean) => {
    if (passed) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: '通过',
        color: 'text-green-600 dark:text-green-400'
      }
    } else {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        text: '未通过',
        color: 'text-red-600 dark:text-red-400'
      }
    }
  }

  // 获取整体评级
  const getOverallGrade = () => {
    if (wcagResults.aaa.normal) return { grade: 'AAA', color: 'text-green-600 dark:text-green-400' }
    if (wcagResults.aa.normal) return { grade: 'AA', color: 'text-blue-600 dark:text-blue-400' }
    if (wcagResults.aa.large) return { grade: 'AA Large', color: 'text-yellow-600 dark:text-yellow-400' }
    return { grade: 'Fail', color: 'text-red-600 dark:text-red-400' }
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 交换颜色
  const swapColors = () => {
    const temp = foregroundColor
    setForegroundColor(backgroundColor)
    setBackgroundColor(temp)
  }

  // 预设颜色组合
  const presetCombinations = [
    { fg: '#000000', bg: '#FFFFFF', name: '黑白' },
    { fg: '#FFFFFF', bg: '#000000', name: '白黑' },
    { fg: '#0066CC', bg: '#FFFFFF', name: '蓝白' },
    { fg: '#FFFFFF', bg: '#0066CC', name: '白蓝' },
    { fg: '#CC0000', bg: '#FFFFFF', name: '红白' },
    { fg: '#FFFFFF', bg: '#CC0000', name: '白红' },
    { fg: '#006600', bg: '#FFFFFF', name: '绿白' },
    { fg: '#FFFFFF', bg: '#006600', name: '白绿' }
  ]

  const overallGrade = getOverallGrade()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ⚖️ 对比度检测工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            检查颜色对比度是否符合 WCAG 无障碍标准
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：颜色输入和预览 */}
          <div className="space-y-6">
            {/* 颜色输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">颜色设置</h3>
              
              <div className="space-y-4">
                {/* 前景色 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    前景色（文字颜色）
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => copyToClipboard(foregroundColor)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 背景色 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    背景色
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => copyToClipboard(backgroundColor)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 交换按钮 */}
                <div className="flex justify-center">
                  <button
                    onClick={swapColors}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    🔄 交换颜色
                  </button>
                </div>
              </div>
            </div>

            {/* 预览区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                效果预览
              </h3>
              
              <div className="space-y-4">
                {/* 大文本预览 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    大文本 (18pt+)
                  </label>
                  <div
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: backgroundColor, color: foregroundColor }}
                  >
                    <div className="text-xl font-semibold">这是大号文本示例</div>
                    <div className="text-lg">Large text example</div>
                  </div>
                </div>

                {/* 普通文本预览 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    普通文本 (14pt)
                  </label>
                  <div
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: backgroundColor, color: foregroundColor }}
                  >
                    <div className="text-base">这是普通文本示例，用于测试可读性。</div>
                    <div className="text-base">Normal text example for readability testing.</div>
                  </div>
                </div>

                {/* 小文本预览 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    小文本 (12pt)
                  </label>
                  <div
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: backgroundColor, color: foregroundColor }}
                  >
                    <div className="text-sm">这是小号文本示例，通常用于注释或说明。</div>
                    <div className="text-sm">Small text example, usually for notes or descriptions.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：对比度结果 */}
          <div className="space-y-6">
            {/* 对比度数值 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">对比度结果</h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {contrastRatio.toFixed(2)}:1
                </div>
                <div className={`text-lg font-semibold ${overallGrade.color}`}>
                  {overallGrade.grade}
                </div>
              </div>

              <div className="space-y-4">
                {/* WCAG AA 标准 */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">WCAG AA 标准</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">普通文本 (4.5:1)</span>
                      <div className="flex items-center gap-2">
                        {getGradeStatus(wcagResults.aa.normal).icon}
                        <span className={`text-sm font-medium ${getGradeStatus(wcagResults.aa.normal).color}`}>
                          {getGradeStatus(wcagResults.aa.normal).text}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">大文本 (3:1)</span>
                      <div className="flex items-center gap-2">
                        {getGradeStatus(wcagResults.aa.large).icon}
                        <span className={`text-sm font-medium ${getGradeStatus(wcagResults.aa.large).color}`}>
                          {getGradeStatus(wcagResults.aa.large).text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WCAG AAA 标准 */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">WCAG AAA 标准</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">普通文本 (7:1)</span>
                      <div className="flex items-center gap-2">
                        {getGradeStatus(wcagResults.aaa.normal).icon}
                        <span className={`text-sm font-medium ${getGradeStatus(wcagResults.aaa.normal).color}`}>
                          {getGradeStatus(wcagResults.aaa.normal).text}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">大文本 (4.5:1)</span>
                      <div className="flex items-center gap-2">
                        {getGradeStatus(wcagResults.aaa.large).icon}
                        <span className={`text-sm font-medium ${getGradeStatus(wcagResults.aaa.large).color}`}>
                          {getGradeStatus(wcagResults.aaa.large).text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 预设组合 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">预设组合</h3>
              <div className="grid grid-cols-2 gap-3">
                {presetCombinations.map((combo, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setForegroundColor(combo.fg)
                      setBackgroundColor(combo.bg)
                    }}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    style={{ backgroundColor: combo.bg, color: combo.fg }}
                  >
                    <div className="text-sm font-medium">{combo.name}</div>
                    <div className="text-xs opacity-75">{combo.fg} / {combo.bg}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 使用建议 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                使用建议
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">AA 级别:</strong> 
                  适用于大多数网站和应用，是法律要求的最低标准
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">AAA 级别:</strong> 
                  更高的无障碍标准，适用于政府网站和重要服务
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">大文本:</strong> 
                  18pt 以上或 14pt 粗体文本可以使用较低的对比度要求
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
