'use client'

import React, { useState } from 'react'
import { Heart, Reply, Edit2, Trash2, MoreHorizontal, Github } from 'lucide-react'
import { Comment } from '@/types/comment'
import { useAuth } from '@/contexts/AuthContext'

interface CommentItemProps {
  comment: Comment
  onReply: (parentId: string) => void
  onLike: (commentId: string) => void
  onDelete: (commentId: string) => void
  onEdit: (commentId: string, content: string) => void
  depth?: number
}

export default function CommentItem({ 
  comment, 
  onReply, 
  onLike, 
  onDelete, 
  onEdit, 
  depth = 0 
}: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isLiking, setIsLiking] = useState(false)
  const { user } = useAuth()

  const isOwner = user?.id === comment.author.id
  const hasLiked = user ? comment.likedBy.includes(user.id) : false
  const maxDepth = 3 // 最大嵌套深度

  /**
   * 格式化时间
   */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  /**
   * 处理点赞
   */
  const handleLike = async () => {
    if (!user || isLiking) return
    
    try {
      setIsLiking(true)
      await onLike(comment.id)
    } catch (error) {
      console.error('点赞失败:', error)
    } finally {
      setIsLiking(false)
    }
  }

  /**
   * 处理编辑保存
   */
  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim())
    }
    setIsEditing(false)
  }

  /**
   * 取消编辑
   */
  const handleCancelEdit = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  /**
   * 获取用户头像
   */
  const getUserAvatar = () => {
    if (comment.author.provider === 'github') {
      return comment.author.avatar || `https://github.com/${comment.author.name}.png`
    } else {
      return comment.author.avatar || `https://q1.qlogo.cn/g?b=qq&nk=${comment.author.providerId}&s=100`
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} ${depth > maxDepth ? 'ml-0' : ''}`}>
      <div className="flex gap-3">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          <img
            src={getUserAvatar()}
            alt={comment.author.name}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`
            }}
          />
        </div>

        {/* 评论内容 */}
        <div className="flex-1 min-w-0">
          {/* 用户信息 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {comment.author.name}
            </span>
            
            {/* 平台标识 */}
            <div className="flex items-center gap-1">
              {comment.author.provider === 'github' ? (
                <Github className="w-3 h-3 text-gray-500" />
              ) : (
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {comment.author.provider}
              </span>
            </div>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatTime(comment.createdAt)}
            </span>

            {comment.isEdited && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                (已编辑)
              </span>
            )}

            {/* 操作菜单 */}
            {isOwner && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" />
                      编辑
                    </button>
                    <button
                      onClick={() => {
                        onDelete(comment.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 评论内容 */}
          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="编辑评论..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          {!isEditing && (
            <div className="flex items-center gap-4">
              {/* 点赞 */}
              <button
                onClick={handleLike}
                disabled={!user || isLiking}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  hasLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{comment.likes > 0 ? comment.likes : '点赞'}</span>
              </button>

              {/* 回复 */}
              {user && depth < maxDepth && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>回复</span>
                </button>
              )}
            </div>
          )}

          {/* 回复列表 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 点击外部关闭菜单 */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
