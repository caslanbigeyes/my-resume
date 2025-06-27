'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, ExternalLink } from 'lucide-react'

/**
 * 工具详情页布局组件的属性接口
 */
interface ToolLayoutProps {
  /** 工具名称 */
  title: string
  /** 工具描述 */
  description: string
  /** 工具分类 */
  category: string
  /** 工具图标 */
  icon: string
  /** 子组件 */
  children: React.ReactNode
}

/**
 * 工具详情页通用布局组件
 * 提供统一的页面结构、导航和样式
 */
export default function ToolLayout({
  title,
  description,
  category,
  icon,
  children
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 工具头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 面包屑导航 */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              首页
            </Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-gray-900 transition-colors">
              工具集
            </Link>
            <span>/</span>
            <span className="text-gray-900">{title}</span>
          </nav>

          {/* 工具信息 */}
          <div className="flex items-start gap-4">
            <div className="text-4xl">{icon}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600 mb-3">{description}</p>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {category}
                </span>
                <span className="text-xs text-gray-500">浏览器端运行</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 工具内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {children}
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="fixed bottom-6 left-6">
        <Link
          href="/tools"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">返回工具集</span>
        </Link>
      </div>
    </div>
  )
}
