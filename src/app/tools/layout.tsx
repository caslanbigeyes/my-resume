import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

/**
 * 工具页面布局组件
 */
export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 左侧导航 */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">首页</span>
              </Link>
              <span className="text-gray-300">/</span>
              <Link
                href="/tools"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>🛠️</span>
                <span>工具集</span>
              </Link>
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center gap-4">
              {/* 可以在这里添加其他操作按钮 */}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main>
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">🛠️ 工具集 - 100款实用小工具</p>
            <p className="text-sm">所有工具均在浏览器端运行，无需服务器支持</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
