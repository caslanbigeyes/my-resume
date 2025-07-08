'use client' // 错误边界必须是客户端组件

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 将错误记录到错误报告服务
    console.error('全局错误:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">严重错误</h2>
              <p className="text-gray-600 mb-6">
                应用程序遇到了一个严重错误。请尝试刷新页面。
              </p>
              <button
                onClick={() => reset()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                重试
              </button>
              {error.message && process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-left">
                  <p className="text-sm font-mono text-gray-800">{error.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}