'use client'

import React, { useState } from 'react'
import { Send, X } from 'lucide-react'
import { CommentFormData } from '@/types/comment'
import { useAuth } from '@/contexts/AuthContext'

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<any>
  onCancel?: () => void
  parentId?: string
  placeholder?: string
  submitText?: string
  autoFocus?: boolean
}

export default function CommentForm({
  onSubmit,
  onCancel,
  parentId,
  placeholder = '写下你的想法...',
  submitText = '发表评论',
  autoFocus = false
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || submitting) return

    try {
      setSubmitting(true)
      await onSubmit({
        content: content.trim(),
        parentId
      })
      setContent('')
      onCancel?.()
    } catch (error) {
      console.error('提交评论失败:', error)
      alert(error instanceof Error ? error.message : '提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  if (!user) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 用户信息 */}
      <div className="flex items-center gap-3">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
          }}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.name}
        </span>
        {parentId && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 输入框 */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          rows={parentId ? 3 : 4}
          disabled={submitting}
        />
        
        {/* 字符计数 */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/1000
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          支持 Ctrl+Enter 快速发送
        </div>
        
        <div className="flex gap-2">
          {parentId && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              disabled={submitting}
            >
              取消
            </button>
          )}
          
          <button
            type="submit"
            disabled={!content.trim() || submitting || content.length > 1000}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{submitting ? '发送中...' : submitText}</span>
          </button>
        </div>
      </div>

      {/* 提示信息 */}
      {content.length > 900 && (
        <div className={`text-xs ${content.length > 1000 ? 'text-red-500' : 'text-yellow-500'}`}>
          {content.length > 1000 ? '内容过长，请控制在1000字以内' : '内容较长，建议精简'}
        </div>
      )}
    </form>
  )
}
