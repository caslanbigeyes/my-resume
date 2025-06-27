'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import ThemeToggle from '@/components/ThemeToggle'

export default function ThemeTestPage() {
  const { theme, resolvedTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">🎨 主题设计展示</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">体验精心设计的主题切换效果</p>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">主题切换控制：</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 主题信息卡片 */}
          <div className="glass-effect p-6 rounded-2xl card-shadow hover-lift">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              主题信息
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">当前主题:</span>
                <span className="font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  {theme}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">解析主题:</span>
                <span className="font-mono bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                  {resolvedTheme}
                </span>
              </div>
            </div>
          </div>

          {/* 颜色展示卡片 */}
          <div className="glass-effect p-6 rounded-2xl card-shadow hover-lift">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              颜色展示
            </h2>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg font-medium">
                Primary Gradient
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded-lg">
                Secondary Color
              </div>
              <div className="bg-gradient-to-r from-pink-400 to-orange-500 text-white p-3 rounded-lg font-medium">
                Accent Gradient
              </div>
            </div>
          </div>

          {/* 交互元素卡片 */}
          <div className="glass-effect p-6 rounded-2xl card-shadow hover-lift">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              交互元素
            </h2>
            <div className="space-y-3">
              <button className="btn-primary w-full">
                主要按钮
              </button>
              <button className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 p-3 rounded-lg transition-all duration-200 hover:scale-105">
                次要按钮
              </button>
              <input
                type="text"
                placeholder="输入框示例..."
                className="input-enhanced w-full"
              />
            </div>
          </div>
        </div>

        {/* 特效展示区域 */}
        <div className="glass-effect p-8 rounded-2xl card-shadow">
          <h2 className="text-2xl font-semibold mb-6 text-center gradient-text">✨ 视觉特效展示</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-pulse-glow"></div>
              <h3 className="font-semibold">脉冲光效</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">柔和的呼吸灯效果</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full hover-lift"></div>
              <h3 className="font-semibold">悬浮效果</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">鼠标悬停时的浮起</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-fade-in"></div>
              <h3 className="font-semibold">渐入动画</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">平滑的出现动画</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
