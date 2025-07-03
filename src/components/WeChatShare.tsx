'use client'

import React, { useState, useEffect } from 'react'
import { Share2, MessageCircle, Users, Copy, QrCode, X } from 'lucide-react'

/**
 * 微信分享组件
 * 支持分享到朋友圈和微信好友
 */
interface WeChatShareProps {
  title: string
  description: string
  url: string
  imageUrl?: string
}

export default function WeChatShare({ title, description, url, imageUrl }: WeChatShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  /**
   * 检测是否为移动设备和客户端挂载状态
   */
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      return mobileKeywords.some(keyword => userAgent.includes(keyword))
    }

    setIsMobile(checkMobile())
    setIsMounted(true)
  }, [])

  /**
   * 生成二维码URL
   */
  useEffect(() => {
    if (isOpen) {
      // 使用免费的二维码API生成二维码
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
      setQrCodeUrl(qrApiUrl)
    }
  }, [isOpen, url])

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
      // 在微信浏览器中，显示分享提示
      alert('请点击右上角的"..."按钮，选择"分享到朋友圈"')
    } else if (isMobile) {
      // 移动端：尝试打开微信
      const wechatUrl = `weixin://dl/moments`
      window.location.href = wechatUrl
      
      // 如果微信未安装，显示二维码
      setTimeout(() => {
        setIsOpen(true)
      }, 1000)
    } else {
      // 桌面端：显示二维码
      setIsOpen(true)
    }
  }

  /**
   * 分享给微信好友
   */
  const shareToFriends = () => {
    if (isWeChatBrowser()) {
      // 在微信浏览器中，显示分享提示
      alert('请点击右上角的"..."按钮，选择"发送给朋友"')
    } else if (isMobile) {
      // 移动端：尝试打开微信
      const wechatUrl = `weixin://dl/chat`
      window.location.href = wechatUrl
      
      // 如果微信未安装，显示二维码
      setTimeout(() => {
        setIsOpen(true)
      }, 1000)
    } else {
      // 桌面端：显示二维码
      setIsOpen(true)
    }
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
  }

  /**
   * 通用分享API（如果支持）
   */
  const nativeShare = async () => {
    if (typeof window !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        })
      } catch (err) {
        console.log('分享取消或失败')
      }
    }
  }

  return (
    <>
      {/* 分享按钮组 */}
      <div className="flex items-center gap-2">
        {/* 主分享按钮 */}
        {isMounted && typeof window !== 'undefined' && 'share' in navigator ? (
          <button
            onClick={nativeShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            title="分享文章"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">分享</span>
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            title="分享到微信"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">微信分享</span>
          </button>
        )}

        {/* 快捷分享按钮 */}
        <div className="flex items-center gap-1">
          <button
            onClick={shareToMoments}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="分享到朋友圈"
          >
            <Users className="w-4 h-4" />
          </button>
          
          <button
            onClick={shareToFriends}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="分享给好友"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          
          <button
            onClick={copyLink}
            className={`p-2 rounded-lg transition-colors ${
              copySuccess 
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            title="复制链接"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 复制成功提示 */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ 链接已复制到剪贴板
        </div>
      )}

      {/* 分享弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                分享到微信
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6">
              {/* 文章信息 */}
              <div className="text-center">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  {title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {description}
                </p>
              </div>

              {/* 二维码 */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="分享二维码" 
                      className="w-48 h-48 mx-auto"
                      onError={(e) => {
                        // 二维码加载失败时的降级处理
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  使用微信扫描二维码分享
                </p>
              </div>

              {/* 分享选项 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareToMoments}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    朋友圈
                  </span>
                </button>

                <button
                  onClick={shareToFriends}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    微信好友
                  </span>
                </button>
              </div>

              {/* 复制链接 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={copyLink}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    copySuccess
                      ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? '已复制链接' : '复制链接'}
                </button>
              </div>

              {/* 使用提示 */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• 在微信中打开链接可直接分享</p>
                <p>• 扫描二维码或复制链接分享给好友</p>
                <p>• 支持分享到朋友圈和微信群聊</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * 简化版微信分享按钮
 */
export function WeChatShareButton({ title, description, url }: WeChatShareProps) {
  const [showShare, setShowShare] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowShare(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
      >
        <Share2 className="w-3 h-3" />
        微信分享
      </button>

      {showShare && (
        <WeChatShare
          title={title}
          description={description}
          url={url}
          imageUrl=""
        />
      )}
    </>
  )
}
