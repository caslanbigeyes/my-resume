'use client'

import React, { useState, useEffect } from 'react'
import { Share2, MessageCircle, Users, Copy, ChevronUp } from 'lucide-react'

/**
 * 浮动分享按钮组件
 * 在用户滚动时显示，提供快速分享功能
 */
interface FloatingShareButtonProps {
  title: string
  description: string
  url: string
}

export default function FloatingShareButton({ title, description, url }: FloatingShareButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  /**
   * 监听滚动事件，控制按钮显示
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 滚动超过一屏时显示
      setIsVisible(scrollTop > windowHeight * 0.3)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * 检测是否在微信浏览器中
   */
  const isWeChatBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    return userAgent.includes('micromessenger')
  }

  /**
   * 分享到微信朋友圈
   */
  const shareToMoments = () => {
    if (isWeChatBrowser()) {
      alert('请点击右上角的"..."按钮，选择"分享到朋友圈"')
    } else {
      // 尝试使用原生分享API
      if (typeof window !== 'undefined' && 'share' in navigator) {
        navigator.share({
          title,
          text: description,
          url
        }).catch(console.error)
      } else {
        // 降级到复制链接
        copyLink()
      }
    }
    setIsExpanded(false)
  }

  /**
   * 分享给微信好友
   */
  const shareToFriends = () => {
    if (isWeChatBrowser()) {
      alert('请点击右上角的"..."按钮，选择"发送给朋友"')
    } else {
      // 尝试使用原生分享API
      if (typeof window !== 'undefined' && 'share' in navigator) {
        navigator.share({
          title,
          text: description,
          url
        }).catch(console.error)
      } else {
        // 降级到复制链接
        copyLink()
      }
    }
    setIsExpanded(false)
  }

  /**
   * 复制链接
   */
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
    setIsExpanded(false)
  }

  /**
   * 回到顶部
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsExpanded(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* 浮动按钮容器 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* 展开的分享选项 */}
        {isExpanded && (
          <div className="flex flex-col gap-2 mb-2 animate-fade-in">
            {/* 分享到朋友圈 */}
            <button
              onClick={shareToMoments}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
              title="分享到朋友圈"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm whitespace-nowrap">朋友圈</span>
            </button>

            {/* 分享给好友 */}
            <button
              onClick={shareToFriends}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
              title="分享给好友"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm whitespace-nowrap">微信好友</span>
            </button>

            {/* 复制链接 */}
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 ${
                copySuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
              title="复制链接"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm whitespace-nowrap">
                {copySuccess ? '已复制' : '复制链接'}
              </span>
            </button>

            {/* 回到顶部 */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
              title="回到顶部"
            >
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm whitespace-nowrap">顶部</span>
            </button>
          </div>
        )}

        {/* 主分享按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
            isExpanded ? 'rotate-45' : ''
          }`}
          title="分享文章"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* 点击遮罩关闭 */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* 复制成功提示 */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ 链接已复制到剪贴板
        </div>
      )}
    </>
  )
}

/**
 * 简化版浮动分享按钮（仅显示主按钮）
 */
export function SimpleFloatingShare({ title, description, url }: FloatingShareButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsVisible(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleShare = async () => {
    if (typeof window !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text: description, url })
      } catch (err) {
        console.log('分享取消')
      }
    } else {
      // 降级到复制链接
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(url)
          alert('链接已复制到剪贴板')
        } else {
          alert('请手动复制链接：' + url)
        }
      } catch (err) {
        alert('请手动复制链接：' + url)
      }
    }
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-6 right-6 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 flex items-center justify-center z-50"
      title="分享文章"
    >
      <Share2 className="w-5 h-5" />
    </button>
  )
}
