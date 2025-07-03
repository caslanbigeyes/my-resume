/**
 * 评论系统类型定义
 */

export interface User {
  id: string
  name: string
  avatar: string
  email?: string
  provider: 'github' | 'qq'
  providerId: string
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  author: User
  articleSlug: string
  parentId?: string // 用于回复评论
  replies?: Comment[]
  likes: number
  likedBy: string[] // 用户ID数组
  createdAt: string
  updatedAt: string
  isEdited: boolean
}

export interface CommentFormData {
  content: string
  parentId?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

export interface CommentStats {
  total: number
  byArticle: Record<string, number>
}
