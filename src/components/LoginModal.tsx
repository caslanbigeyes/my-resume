'use client'

import React, { useState } from 'react'
import { X, Github, MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [loading, setLoading] = useState<'github' | 'qq' | null>(null)
  const { login } = useAuth()

  if (!isOpen) return null

  const handleLogin = async (provider: 'github' | 'qq') => {
    try {
      setLoading(provider)
      await login(provider)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('登录失败:', error)
      alert(error instanceof Error ? error.message : '登录失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            登录评论
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              参与讨论
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              选择一种方式登录，开始与其他读者交流
            </p>
          </div>

          {/* 登录选项 */}
          <div className="space-y-3">
            {/* GitHub 登录 */}
            <button
              onClick={() => handleLogin('github')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {loading === 'github' ? '登录中...' : '使用 GitHub 登录'}
              </span>
            </button>

            {/* QQ 登录 */}
            <button
              onClick={() => handleLogin('qq')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'qq' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Q</span>
                </div>
              )}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {loading === 'qq' ? '登录中...' : '使用 QQ 登录'}
              </span>
            </button>
          </div>

          {/* 说明 */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <p>登录即表示您同意我们的服务条款和隐私政策</p>
            <div className="flex items-center justify-center gap-4">
              <span>✓ 安全登录</span>
              <span>✓ 隐私保护</span>
              <span>✓ 随时退出</span>
            </div>
          </div>

          {/* 功能说明 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">
              登录后您可以：
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 发表评论和回复</li>
              <li>• 点赞其他用户的评论</li>
              <li>• 编辑和删除自己的评论</li>
              <li>• 参与文章讨论</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
