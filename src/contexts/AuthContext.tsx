'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthState } from '@/types/comment'

interface AuthContextType extends AuthState {
  login: (provider: 'github' | 'qq') => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  })

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('comment_user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false
          })
        } else {
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    initAuth()
  }, [])

  /**
   * GitHub OAuth 登录
   */
  const loginWithGitHub = async (): Promise<User> => {
    // 模拟 GitHub OAuth 流程
    return new Promise((resolve, reject) => {
      // 在实际应用中，这里会打开 GitHub OAuth 窗口
      const popup = window.open(
        'about:blank',
        'github-login',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        reject(new Error('无法打开登录窗口，请检查浏览器弹窗设置'))
        return
      }

      // 模拟用户授权过程
      popup.document.write(`
        <html>
          <head><title>GitHub 登录</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2>🐙 GitHub 登录</h2>
            <p>这是一个模拟的 GitHub 登录界面</p>
            <button onclick="authorize()" style="background: #24292e; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              授权登录
            </button>
            <script>
              function authorize() {
                const user = {
                  id: 'github_' + Date.now(),
                  name: 'GitHub User',
                  avatar: 'https://github.com/github.png',
                  email: 'user@github.com',
                  provider: 'github',
                  providerId: 'github_123456',
                  createdAt: new Date().toISOString()
                };
                window.opener.postMessage({ type: 'AUTH_SUCCESS', user }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `)

      // 监听消息
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage)
          resolve(event.data.user)
        }
      }

      window.addEventListener('message', handleMessage)

      // 监听窗口关闭
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          reject(new Error('用户取消了登录'))
        }
      }, 1000)
    })
  }

  /**
   * QQ 登录
   */
  const loginWithQQ = async (): Promise<User> => {
    // 模拟 QQ 登录流程
    return new Promise((resolve, reject) => {
      const popup = window.open(
        'about:blank',
        'qq-login',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        reject(new Error('无法打开登录窗口，请检查浏览器弹窗设置'))
        return
      }

      // 模拟 QQ 登录界面
      popup.document.write(`
        <html>
          <head><title>QQ 登录</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2>🐧 QQ 登录</h2>
            <p>这是一个模拟的 QQ 登录界面</p>
            <button onclick="authorize()" style="background: #1296db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              QQ 授权登录
            </button>
            <script>
              function authorize() {
                const user = {
                  id: 'qq_' + Date.now(),
                  name: 'QQ用户',
                  avatar: 'https://q1.qlogo.cn/g?b=qq&nk=123456&s=100',
                  provider: 'qq',
                  providerId: 'qq_123456',
                  createdAt: new Date().toISOString()
                };
                window.opener.postMessage({ type: 'AUTH_SUCCESS', user }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `)

      // 监听消息
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage)
          resolve(event.data.user)
        }
      }

      window.addEventListener('message', handleMessage)

      // 监听窗口关闭
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          reject(new Error('用户取消了登录'))
        }
      }, 1000)
    })
  }

  /**
   * 登录
   */
  const login = async (provider: 'github' | 'qq') => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))

      let user: User
      if (provider === 'github') {
        user = await loginWithGitHub()
      } else {
        user = await loginWithQQ()
      }

      // 保存用户信息
      localStorage.setItem('comment_user', JSON.stringify(user))

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false
      })
    } catch (error) {
      console.error('登录失败:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
      throw error
    }
  }

  /**
   * 登出
   */
  const logout = () => {
    localStorage.removeItem('comment_user')
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    })
  }

  /**
   * 更新用户信息
   */
  const updateUser = (user: User) => {
    localStorage.setItem('comment_user', JSON.stringify(user))
    setAuthState(prev => ({
      ...prev,
      user
    }))
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
