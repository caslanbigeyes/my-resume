'use client'

import { useState, useEffect, useCallback } from 'react'
import { Comment, CommentFormData } from '@/types/comment'
import { useAuth } from '@/contexts/AuthContext'

/**
 * 评论管理 Hook
 */
export function useComments(articleSlug: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  /**
   * 获取本地存储的评论数据
   */
  const getStoredComments = useCallback((): Comment[] => {
    try {
      const stored = localStorage.getItem('article_comments')
      if (stored) {
        const allComments = JSON.parse(stored)
        return allComments.filter((comment: Comment) => comment.articleSlug === articleSlug)
      }
    } catch (error) {
      console.error('获取评论数据失败:', error)
    }
    return []
  }, [articleSlug])

  /**
   * 保存评论到本地存储
   */
  const saveComments = useCallback((newComments: Comment[]) => {
    try {
      const stored = localStorage.getItem('article_comments')
      let allComments: Comment[] = []
      
      if (stored) {
        allComments = JSON.parse(stored)
      }

      // 移除当前文章的旧评论
      allComments = allComments.filter(comment => comment.articleSlug !== articleSlug)
      
      // 添加新评论
      allComments.push(...newComments)
      
      localStorage.setItem('article_comments', JSON.stringify(allComments))
    } catch (error) {
      console.error('保存评论失败:', error)
    }
  }, [articleSlug])

  /**
   * 加载评论
   */
  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const storedComments = getStoredComments()
      
      // 构建评论树结构
      const commentMap = new Map<string, Comment>()
      const rootComments: Comment[] = []

      // 先添加所有评论到 map
      storedComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] })
      })

      // 构建树结构
      storedComments.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId)
          if (parent) {
            parent.replies!.push(commentMap.get(comment.id)!)
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!)
        }
      })

      // 按时间排序
      rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      rootComments.forEach(comment => {
        if (comment.replies) {
          comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        }
      })

      setComments(rootComments)
    } catch (error) {
      console.error('加载评论失败:', error)
    } finally {
      setLoading(false)
    }
  }, [articleSlug, getStoredComments])

  /**
   * 添加评论
   */
  const addComment = useCallback(async (formData: CommentFormData): Promise<Comment> => {
    if (!user) {
      throw new Error('请先登录')
    }

    setSubmitting(true)
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800))

      const newComment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: formData.content,
        author: user,
        articleSlug,
        parentId: formData.parentId,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false
      }

      // 获取所有评论并添加新评论
      const allComments = getStoredComments()
      allComments.push(newComment)
      saveComments(allComments)

      // 重新加载评论
      await loadComments()

      return newComment
    } catch (error) {
      console.error('添加评论失败:', error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [user, articleSlug, getStoredComments, saveComments, loadComments])

  /**
   * 点赞/取消点赞评论
   */
  const toggleLike = useCallback(async (commentId: string) => {
    if (!user) {
      throw new Error('请先登录')
    }

    try {
      const allComments = getStoredComments()
      const commentIndex = allComments.findIndex(c => c.id === commentId)
      
      if (commentIndex === -1) {
        throw new Error('评论不存在')
      }

      const comment = allComments[commentIndex]
      const hasLiked = comment.likedBy.includes(user.id)

      if (hasLiked) {
        // 取消点赞
        comment.likedBy = comment.likedBy.filter(id => id !== user.id)
        comment.likes = Math.max(0, comment.likes - 1)
      } else {
        // 点赞
        comment.likedBy.push(user.id)
        comment.likes += 1
      }

      comment.updatedAt = new Date().toISOString()
      allComments[commentIndex] = comment

      saveComments(allComments)
      await loadComments()

      return !hasLiked
    } catch (error) {
      console.error('点赞操作失败:', error)
      throw error
    }
  }, [user, getStoredComments, saveComments, loadComments])

  /**
   * 删除评论
   */
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) {
      throw new Error('请先登录')
    }

    try {
      const allComments = getStoredComments()
      const comment = allComments.find(c => c.id === commentId)
      
      if (!comment) {
        throw new Error('评论不存在')
      }

      if (comment.author.id !== user.id) {
        throw new Error('只能删除自己的评论')
      }

      // 删除评论及其所有回复
      const toDelete = new Set<string>()
      
      const collectReplies = (parentId: string) => {
        allComments.forEach(c => {
          if (c.parentId === parentId) {
            toDelete.add(c.id)
            collectReplies(c.id)
          }
        })
      }

      toDelete.add(commentId)
      collectReplies(commentId)

      const filteredComments = allComments.filter(c => !toDelete.has(c.id))
      saveComments(filteredComments)
      await loadComments()
    } catch (error) {
      console.error('删除评论失败:', error)
      throw error
    }
  }, [user, getStoredComments, saveComments, loadComments])

  /**
   * 编辑评论
   */
  const editComment = useCallback(async (commentId: string, newContent: string) => {
    if (!user) {
      throw new Error('请先登录')
    }

    try {
      const allComments = getStoredComments()
      const commentIndex = allComments.findIndex(c => c.id === commentId)
      
      if (commentIndex === -1) {
        throw new Error('评论不存在')
      }

      const comment = allComments[commentIndex]
      
      if (comment.author.id !== user.id) {
        throw new Error('只能编辑自己的评论')
      }

      comment.content = newContent
      comment.updatedAt = new Date().toISOString()
      comment.isEdited = true

      allComments[commentIndex] = comment
      saveComments(allComments)
      await loadComments()
    } catch (error) {
      console.error('编辑评论失败:', error)
      throw error
    }
  }, [user, getStoredComments, saveComments, loadComments])

  /**
   * 获取评论统计
   */
  const getCommentCount = useCallback(() => {
    const allComments = getStoredComments()
    return allComments.length
  }, [getStoredComments])

  // 初始加载评论
  useEffect(() => {
    loadComments()
  }, [loadComments])

  return {
    comments,
    loading,
    submitting,
    addComment,
    toggleLike,
    deleteComment,
    editComment,
    loadComments,
    getCommentCount
  }
}
