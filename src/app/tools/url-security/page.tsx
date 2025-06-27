'use client'

import React, { useState, useCallback } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, ExternalLink } from 'lucide-react'

interface SecurityCheck {
  name: string
  status: 'safe' | 'warning' | 'danger' | 'unknown'
  description: string
  details?: string
}

interface UrlAnalysis {
  url: string
  domain: string
  protocol: string
  isValid: boolean
  checks: SecurityCheck[]
  riskLevel: 'low' | 'medium' | 'high'
  timestamp: number
}

/**
 * 网址安全检测工具组件
 * 检测 URL 的安全性和可信度
 */
export default function UrlSecurityPage() {
  const [inputUrl, setInputUrl] = useState('')
  const [analyses, setAnalyses] = useState<UrlAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 恶意域名黑名单（示例）
  const blacklistedDomains = [
    'malware-example.com',
    'phishing-site.net',
    'suspicious-domain.org'
  ]

  // 可疑 TLD
  const suspiciousTlds = [
    '.tk', '.ml', '.ga', '.cf', '.click', '.download', '.zip'
  ]

  // 安全检查函数
  const performSecurityChecks = useCallback((url: string): SecurityCheck[] => {
    const checks: SecurityCheck[] = []
    
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.toLowerCase()
      const protocol = urlObj.protocol

      // 1. 协议检查
      if (protocol === 'https:') {
        checks.push({
          name: 'HTTPS 协议',
          status: 'safe',
          description: '使用安全的 HTTPS 协议',
          details: '数据传输已加密'
        })
      } else if (protocol === 'http:') {
        checks.push({
          name: 'HTTP 协议',
          status: 'warning',
          description: '使用不安全的 HTTP 协议',
          details: '数据传输未加密，可能被窃听'
        })
      } else {
        checks.push({
          name: '协议检查',
          status: 'danger',
          description: '使用非标准协议',
          details: `协议: ${protocol}`
        })
      }

      // 2. 域名黑名单检查
      if (blacklistedDomains.includes(domain)) {
        checks.push({
          name: '域名黑名单',
          status: 'danger',
          description: '域名在已知恶意列表中',
          details: '该域名被标记为恶意或钓鱼网站'
        })
      } else {
        checks.push({
          name: '域名黑名单',
          status: 'safe',
          description: '域名不在已知恶意列表中'
        })
      }

      // 3. 可疑 TLD 检查
      const tld = domain.substring(domain.lastIndexOf('.'))
      if (suspiciousTlds.includes(tld)) {
        checks.push({
          name: '顶级域名',
          status: 'warning',
          description: '使用可疑的顶级域名',
          details: `${tld} 域名常被用于恶意活动`
        })
      } else {
        checks.push({
          name: '顶级域名',
          status: 'safe',
          description: '使用常见的顶级域名'
        })
      }

      // 4. URL 长度检查
      if (url.length > 200) {
        checks.push({
          name: 'URL 长度',
          status: 'warning',
          description: 'URL 过长，可能用于隐藏真实目的',
          details: `长度: ${url.length} 字符`
        })
      } else {
        checks.push({
          name: 'URL 长度',
          status: 'safe',
          description: 'URL 长度正常'
        })
      }

      // 5. 可疑字符检查
      const suspiciousPatterns = [
        /[а-я]/i, // 西里尔字母
        /[αβγδε]/i, // 希腊字母
        /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP 地址
        /-{2,}/, // 多个连字符
        /[0-9]{10,}/ // 长数字串
      ]

      let hasSuspiciousChars = false
      let suspiciousDetails = []

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(domain)) {
          hasSuspiciousChars = true
          if (pattern.source.includes('а-я')) suspiciousDetails.push('包含西里尔字母')
          if (pattern.source.includes('αβγδε')) suspiciousDetails.push('包含希腊字母')
          if (pattern.source.includes('\\d{1,3}')) suspiciousDetails.push('使用 IP 地址')
          if (pattern.source.includes('-{2,}')) suspiciousDetails.push('包含多个连字符')
          if (pattern.source.includes('[0-9]{10,}')) suspiciousDetails.push('包含长数字串')
        }
      }

      if (hasSuspiciousChars) {
        checks.push({
          name: '字符检查',
          status: 'warning',
          description: '域名包含可疑字符',
          details: suspiciousDetails.join(', ')
        })
      } else {
        checks.push({
          name: '字符检查',
          status: 'safe',
          description: '域名字符正常'
        })
      }

      // 6. 子域名检查
      const subdomains = domain.split('.')
      if (subdomains.length > 4) {
        checks.push({
          name: '子域名',
          status: 'warning',
          description: '子域名层级过多',
          details: `${subdomains.length} 级子域名`
        })
      } else {
        checks.push({
          name: '子域名',
          status: 'safe',
          description: '子域名结构正常'
        })
      }

      // 7. 端口检查
      if (urlObj.port && urlObj.port !== '80' && urlObj.port !== '443') {
        checks.push({
          name: '端口检查',
          status: 'warning',
          description: '使用非标准端口',
          details: `端口: ${urlObj.port}`
        })
      } else {
        checks.push({
          name: '端口检查',
          status: 'safe',
          description: '使用标准端口'
        })
      }

      // 8. 路径检查
      const path = urlObj.pathname
      const suspiciousPathPatterns = [
        /\.(exe|bat|cmd|scr|pif|com)$/i,
        /download/i,
        /install/i,
        /update/i,
        /security/i
      ]

      let hasSuspiciousPath = false
      let pathDetails = []

      for (const pattern of suspiciousPathPatterns) {
        if (pattern.test(path)) {
          hasSuspiciousPath = true
          if (pattern.source.includes('exe|bat')) pathDetails.push('包含可执行文件扩展名')
          if (pattern.source.includes('download')) pathDetails.push('包含下载相关路径')
          if (pattern.source.includes('install')) pathDetails.push('包含安装相关路径')
          if (pattern.source.includes('update')) pathDetails.push('包含更新相关路径')
          if (pattern.source.includes('security')) pathDetails.push('包含安全相关路径')
        }
      }

      if (hasSuspiciousPath) {
        checks.push({
          name: '路径检查',
          status: 'warning',
          description: '路径包含可疑内容',
          details: pathDetails.join(', ')
        })
      } else {
        checks.push({
          name: '路径检查',
          status: 'safe',
          description: '路径内容正常'
        })
      }

    } catch (error) {
      checks.push({
        name: 'URL 格式',
        status: 'danger',
        description: 'URL 格式无效',
        details: error instanceof Error ? error.message : '未知错误'
      })
    }

    return checks
  }, [])

  // 计算风险等级
  const calculateRiskLevel = useCallback((checks: SecurityCheck[]): 'low' | 'medium' | 'high' => {
    const dangerCount = checks.filter(check => check.status === 'danger').length
    const warningCount = checks.filter(check => check.status === 'warning').length

    if (dangerCount > 0) return 'high'
    if (warningCount >= 3) return 'high'
    if (warningCount >= 1) return 'medium'
    return 'low'
  }, [])

  // 分析 URL
  const analyzeUrl = useCallback(async (url: string) => {
    setIsAnalyzing(true)

    try {
      // 标准化 URL
      let normalizedUrl = url.trim()
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl
      }

      const urlObj = new URL(normalizedUrl)
      const checks = performSecurityChecks(normalizedUrl)
      const riskLevel = calculateRiskLevel(checks)

      const analysis: UrlAnalysis = {
        url: normalizedUrl,
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        isValid: true,
        checks,
        riskLevel,
        timestamp: Date.now()
      }

      setAnalyses(prev => [analysis, ...prev.slice(0, 9)]) // 保留最近10个分析结果
    } catch (error) {
      const analysis: UrlAnalysis = {
        url,
        domain: '',
        protocol: '',
        isValid: false,
        checks: [{
          name: 'URL 验证',
          status: 'danger',
          description: 'URL 格式无效',
          details: error instanceof Error ? error.message : '未知错误'
        }],
        riskLevel: 'high',
        timestamp: Date.now()
      }

      setAnalyses(prev => [analysis, ...prev.slice(0, 9)])
    } finally {
      setIsAnalyzing(false)
    }
  }, [performSecurityChecks, calculateRiskLevel])

  // 处理分析
  const handleAnalyze = useCallback(() => {
    if (!inputUrl.trim()) return
    analyzeUrl(inputUrl.trim())
  }, [inputUrl, analyzeUrl])

  // 获取状态图标
  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'danger':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  // 获取风险等级颜色
  const getRiskLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'high': return 'text-red-600 dark:text-red-400'
    }
  }

  // 获取风险等级文本
  const getRiskLevelText = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '低风险'
      case 'medium': return '中等风险'
      case 'high': return '高风险'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🛡️ 网址安全检测
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            检测 URL 的安全性和可信度，识别潜在威胁
          </p>
        </div>

        {/* URL 输入 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="输入要检测的网址，如：https://example.com"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAnalyze}
              disabled={!inputUrl.trim() || isAnalyzing}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Search className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? '检测中...' : '检测'}
            </button>
          </div>
        </div>

        {/* 分析结果 */}
        {analyses.length > 0 && (
          <div className="space-y-6">
            {analyses.map((analysis, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* 分析头部 */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-blue-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 break-all">
                            {analysis.domain || analysis.url}
                          </h3>
                          <a
                            href={analysis.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(analysis.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getRiskLevelColor(analysis.riskLevel)}`}>
                        {getRiskLevelText(analysis.riskLevel)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        风险等级
                      </div>
                    </div>
                  </div>
                </div>

                {/* 检查结果 */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.checks.map((check, checkIndex) => (
                      <div key={checkIndex} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(check.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {check.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {check.description}
                          </div>
                          {check.details && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {check.details}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {analyses.length === 0 && !isAnalyzing && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            输入网址开始安全检测
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">检测项目</h4>
              <ul className="space-y-1">
                <li>• HTTPS 协议安全性检查</li>
                <li>• 域名黑名单匹配</li>
                <li>• 可疑顶级域名识别</li>
                <li>• URL 长度和字符分析</li>
                <li>• 子域名结构检查</li>
                <li>• 端口和路径安全性</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 检测结果仅供参考</li>
                <li>• 不能替代专业安全工具</li>
                <li>• 建议结合其他安全措施</li>
                <li>• 谨慎访问高风险网址</li>
                <li>• 定期更新安全知识</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>免责声明:</strong> 此工具仅提供基础的 URL 安全检测，不能保证 100% 准确性。请谨慎访问任何可疑网址，并使用专业的安全软件进行全面保护。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
