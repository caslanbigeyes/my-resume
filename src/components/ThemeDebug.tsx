'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'

/**
 * 主题调试组件
 * 用于调试主题切换问题
 */
export default function ThemeDebug() {
  const { theme, resolvedTheme } = useTheme()
  const [htmlClass, setHtmlClass] = useState('')
  const [dataTheme, setDataTheme] = useState('')

  useEffect(() => {
    const updateDebugInfo = () => {
      setHtmlClass(document.documentElement.className)
      setDataTheme(document.documentElement.getAttribute('data-theme') || '')
    }

    updateDebugInfo()
    
    // 监听类名变化
    const observer = new MutationObserver(updateDebugInfo)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-xs font-mono shadow-lg z-50">
      <div className="space-y-1">
        <div>Theme: <span className="font-bold">{theme}</span></div>
        <div>Resolved: <span className="font-bold">{resolvedTheme}</span></div>
        <div>HTML Class: <span className="font-bold">{htmlClass}</span></div>
        <div>Data Theme: <span className="font-bold">{dataTheme}</span></div>
        <div>Current BG: <span className="bg-background text-foreground px-1">Test</span></div>
      </div>
    </div>
  )
}
