'use client'

import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

/**
 * 主题切换组件
 * 提供浅色/深色/系统主题切换，采用现代化设计
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      key: 'light',
      name: '浅色',
      icon: Sun,
      gradient: 'from-amber-400 to-orange-500',
      activeColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
      hoverColor: 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
    },
    {
      key: 'dark',
      name: '深色',
      icon: Moon,
      gradient: 'from-slate-600 to-slate-800',
      activeColor: 'bg-gradient-to-r from-slate-600 to-slate-800',
      hoverColor: 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
    },
    {
      key: 'system',
      name: '系统',
      icon: Monitor,
      gradient: 'from-blue-500 to-purple-600',
      activeColor: 'bg-gradient-to-r from-blue-500 to-purple-600',
      hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    }
  ] as const

  return (
    <div className="relative">
      {/* 背景容器 */}
      <div className="flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-1 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20">
        {themes.map(({ key, name, icon: Icon, activeColor, hoverColor }) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-300 ease-out group
              ${theme === key
                ? `${activeColor} text-white shadow-lg transform scale-105`
                : `text-gray-600 dark:text-gray-400 ${hoverColor} hover:scale-102`
              }
            `}
            title={`切换到${name}主题`}
          >
            {/* 图标容器 */}
            <div className={`
              relative transition-transform duration-300
              ${theme === key ? 'rotate-12' : 'group-hover:rotate-6'}
            `}>
              <Icon className={`
                w-4 h-4 transition-all duration-300
                ${theme === key
                  ? 'drop-shadow-sm'
                  : 'group-hover:scale-110'
                }
              `} />

              {/* 活跃状态的光晕效果 */}
              {theme === key && (
                <div className="absolute inset-0 -z-10 bg-white/30 rounded-full blur-sm animate-pulse" />
              )}
            </div>

            {/* 文字标签 */}
            <span className={`
              hidden sm:inline transition-all duration-300
              ${theme === key
                ? 'font-semibold tracking-wide'
                : 'group-hover:font-medium'
              }
            `}>
              {name}
            </span>

            {/* 活跃状态指示器 */}
            {theme === key && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-bounce" />
            )}
          </button>
        ))}
      </div>

      {/* 装饰性光效 */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}
