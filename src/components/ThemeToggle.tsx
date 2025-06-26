'use client'

import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'

/**
 * 主题切换组件
 * 提供浅色/深色/系统主题切换
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { key: 'light', name: '浅色', icon: Sun },
    { key: 'dark', name: '深色', icon: Moon },
    { key: 'system', name: '系统', icon: Monitor }
  ] as const

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map(({ key, name, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            theme === key
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
          title={`切换到${name}主题`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{name}</span>
        </button>
      ))}
    </div>
  )
}
