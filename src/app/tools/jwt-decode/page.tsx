'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Key, AlertCircle, CheckCircle, Clock, User, Shield } from 'lucide-react'

interface JWTPayload {
  [key: string]: any
}

interface DecodedJWT {
  header: any
  payload: JWTPayload
  signature: string
  isValid: boolean
  isExpired?: boolean
  expiresAt?: Date
  issuedAt?: Date
  notBefore?: Date
}

/**
 * JWT 解码器组件
 * 解析和验证 JWT 令牌
 */
export default function JwtDecodePage() {
  const [jwtToken, setJwtToken] = useState('')
  const [error, setError] = useState('')

  // Base64 URL 解码
  const base64UrlDecode = useCallback((str: string): string => {
    // 添加填充
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    try {
      return atob(base64)
    } catch (err) {
      throw new Error('无效的 Base64 编码')
    }
  }, [])

  // 解码 JWT
  const decodedJWT = useMemo((): DecodedJWT | null => {
    if (!jwtToken.trim()) {
      setError('')
      return null
    }

    try {
      const parts = jwtToken.split('.')
      
      if (parts.length !== 3) {
        throw new Error('JWT 格式错误：必须包含三个部分（header.payload.signature）')
      }

      const [headerPart, payloadPart, signaturePart] = parts

      // 解码 header
      const headerJson = base64UrlDecode(headerPart)
      const header = JSON.parse(headerJson)

      // 解码 payload
      const payloadJson = base64UrlDecode(payloadPart)
      const payload = JSON.parse(payloadJson)

      // 检查时间相关字段
      const now = Math.floor(Date.now() / 1000)
      const isExpired = payload.exp ? payload.exp < now : false
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : undefined
      const issuedAt = payload.iat ? new Date(payload.iat * 1000) : undefined
      const notBefore = payload.nbf ? new Date(payload.nbf * 1000) : undefined

      setError('')
      return {
        header,
        payload,
        signature: signaturePart,
        isValid: true,
        isExpired,
        expiresAt,
        issuedAt,
        notBefore
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'JWT 解析失败'
      setError(errorMessage)
      return null
    }
  }, [jwtToken, base64UrlDecode])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 获取剩余时间
  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    
    if (diff <= 0) return '已过期'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}天 ${hours}小时`
    if (hours > 0) return `${hours}小时 ${minutes}分钟`
    return `${minutes}分钟`
  }

  // 示例 JWT
  const loadExample = () => {
    const exampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpc3MiOiJ0ZXN0LWlzc3VlciIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    setJwtToken(exampleJWT)
  }

  // 获取算法颜色
  const getAlgorithmColor = (alg: string): string => {
    const colors: { [key: string]: string } = {
      'HS256': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'HS384': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'HS512': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'RS256': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'RS384': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'RS512': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'ES256': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'ES384': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'ES512': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    }
    return colors[alg] || 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎫 JWT 解码器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            解析和验证 JSON Web Token
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：JWT 输入 */}
          <div className="space-y-6">
            {/* JWT 输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  JWT 令牌
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <textarea
                    value={jwtToken}
                    onChange={(e) => setJwtToken(e.target.value)}
                    placeholder="粘贴 JWT 令牌..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={loadExample}
                      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      示例
                    </button>
                    <button
                      onClick={() => setJwtToken('')}
                      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      清空
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {decodedJWT && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      JWT 解析成功
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 令牌状态 */}
            {decodedJWT && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    令牌状态
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">状态:</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      decodedJWT.isExpired 
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {decodedJWT.isExpired ? '已过期' : '有效'}
                    </span>
                  </div>
                  
                  {decodedJWT.issuedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">签发时间:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {formatTime(decodedJWT.issuedAt)}
                      </span>
                    </div>
                  )}
                  
                  {decodedJWT.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">过期时间:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {formatTime(decodedJWT.expiresAt)}
                      </span>
                    </div>
                  )}
                  
                  {decodedJWT.expiresAt && !decodedJWT.isExpired && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">剩余时间:</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {getTimeRemaining(decodedJWT.expiresAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 中间和右侧：解码结果 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            {decodedJWT && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Header</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getAlgorithmColor(decodedJWT.header.alg)}`}>
                        {decodedJWT.header.alg}
                      </span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(decodedJWT.header, null, 2))}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Copy className="w-4 h-4 inline mr-1" />
                        复制
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto">
                    <code className="text-gray-900 dark:text-gray-100">
                      {JSON.stringify(decodedJWT.header, null, 2)}
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* Payload */}
            {decodedJWT && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Payload
                    </h3>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2))}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="w-4 h-4 inline mr-1" />
                      复制
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto">
                    <code className="text-gray-900 dark:text-gray-100">
                      {JSON.stringify(decodedJWT.payload, null, 2)}
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* 标准声明 */}
            {decodedJWT && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    标准声明
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'iss', name: '签发者 (Issuer)', value: decodedJWT.payload.iss },
                      { key: 'sub', name: '主题 (Subject)', value: decodedJWT.payload.sub },
                      { key: 'aud', name: '受众 (Audience)', value: decodedJWT.payload.aud },
                      { key: 'exp', name: '过期时间 (Expiration)', value: decodedJWT.payload.exp ? formatTime(new Date(decodedJWT.payload.exp * 1000)) : undefined },
                      { key: 'nbf', name: '生效时间 (Not Before)', value: decodedJWT.payload.nbf ? formatTime(new Date(decodedJWT.payload.nbf * 1000)) : undefined },
                      { key: 'iat', name: '签发时间 (Issued At)', value: decodedJWT.payload.iat ? formatTime(new Date(decodedJWT.payload.iat * 1000)) : undefined },
                      { key: 'jti', name: 'JWT ID', value: decodedJWT.payload.jti }
                    ].filter(claim => claim.value !== undefined).map((claim) => (
                      <div key={claim.key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {claim.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                          {typeof claim.value === 'object' ? JSON.stringify(claim.value) : claim.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">JWT 说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">JWT 结构</h4>
              <ul className="space-y-1">
                <li>• <strong>Header:</strong> 包含令牌类型和签名算法</li>
                <li>• <strong>Payload:</strong> 包含声明（claims）信息</li>
                <li>• <strong>Signature:</strong> 用于验证令牌完整性</li>
                <li>• 三部分用点号（.）分隔</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">安全提醒</h4>
              <ul className="space-y-1">
                <li>• 此工具仅解码，不验证签名</li>
                <li>• 不要在生产环境中使用未验证的 JWT</li>
                <li>• 敏感信息不应放在 Payload 中</li>
                <li>• 始终验证 JWT 的签名和有效期</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
