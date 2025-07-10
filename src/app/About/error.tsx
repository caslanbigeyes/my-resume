'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AboutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('关于页面错误:', error)
  }, [error])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">关于页面加载错误</h1>
      <p className="text-gray-600 mb-6">
        加载关于页面时发生错误。这可能是暂时性的问题。
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}