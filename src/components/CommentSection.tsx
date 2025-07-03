'use client'

import React, { useState } from 'react'
import { MessageCircle, Users, LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useComments } from '@/hooks/useComments'
import LoginModal from './LoginModal'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

interface CommentSectionProps {
  articleSlug: string
  articleTitle: string
}

export default function CommentSection({ articleSlug, articleTitle }: CommentSectionProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  const {
    comments,
    loading,
    submitting,
    addComment,
    toggleLike,
    deleteComment,
    editComment,
    getCommentCount
  } = useComments(articleSlug)

  const commentCount = getCommentCount()

  /**
   * 处理回复
   */
  const handleReply = (parentId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    setReplyingTo(parentId)
  }

  /**
   * 处理点赞
   */
  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    await toggleLike(commentId)
  }

  /**
   * 处理删除
   */
  const handleDelete = async (commentId: string) => {
    if (confirm('确定要删除这条评论吗？删除后无法恢复。')) {
      await deleteComment(commentId)
    }
  }

  /**
   * 处理编辑
   */
  const handleEdit = async (commentId: string, content: string) => {
    await editComment(commentId, content)
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            评论讨论
          </h3>
          {commentCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full">
              {commentCount}
            </span>
          )}
        </div>

        {/* 用户状态 */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <img
                src={user!.avatar}
                alt={user!.name}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user!.name)}&background=random`
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user!.name}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              登录评论
            </button>
          )}
        </div>
      </div>

      {/* 评论表单 */}
      {isAuthenticated ? (
        <div className="mb-8">
          <CommentForm
            onSubmit={addComment}
            placeholder={`对《${articleTitle}》有什么想法？`}
            submitText="发表评论"
          />
        </div>
      ) : (
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            参与讨论
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            登录后即可发表评论，与其他读者交流想法
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            立即登录
          </button>
        </div>
      )}

      {/* 评论列表 */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              加载评论中...
            </span>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {/* 评论统计 */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600 pb-4">
              <span>共 {commentCount} 条评论</span>
              <span>按时间排序</span>
            </div>

            {/* 评论项 */}
            {comments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReply={handleReply}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />

                {/* 回复表单 */}
                {replyingTo === comment.id && (
                  <div className="ml-13 mt-4">
                    <CommentForm
                      onSubmit={addComment}
                      onCancel={() => setReplyingTo(null)}
                      parentId={comment.id}
                      placeholder={`回复 @${comment.author.name}`}
                      submitText="发表回复"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              暂无评论
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isAuthenticated 
                ? '成为第一个评论的人吧！' 
                : '登录后发表第一条评论'
              }
            </p>
          </div>
        )}
      </div>

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false)
          // 如果有待回复的评论，保持回复状态
        }}
      />
    </div>
  )
}
