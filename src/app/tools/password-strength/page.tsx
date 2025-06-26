'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

/**
 * 密码强度检测工具组件
 * 检测密码安全强度
 */
export default function PasswordStrengthTool() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  /**
   * 密码强度分析
   */
  const passwordAnalysis = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        strength: 'none',
        strengthText: '请输入密码',
        strengthColor: 'gray',
        checks: [],
        suggestions: [],
        entropy: 0,
        crackTime: ''
      }
    }

    const checks = [
      {
        name: '长度至少8位',
        passed: password.length >= 8,
        weight: 1
      },
      {
        name: '包含小写字母',
        passed: /[a-z]/.test(password),
        weight: 1
      },
      {
        name: '包含大写字母',
        passed: /[A-Z]/.test(password),
        weight: 1
      },
      {
        name: '包含数字',
        passed: /\d/.test(password),
        weight: 1
      },
      {
        name: '包含特殊字符',
        passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        weight: 1
      },
      {
        name: '长度至少12位',
        passed: password.length >= 12,
        weight: 1
      },
      {
        name: '无常见模式',
        passed: !hasCommonPatterns(password),
        weight: 2
      },
      {
        name: '无重复字符',
        passed: !hasRepeatingChars(password),
        weight: 1
      }
    ]

    const passedChecks = checks.filter(check => check.passed)
    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0)
    const passedWeight = passedChecks.reduce((sum, check) => sum + check.weight, 0)
    
    const score = Math.round((passedWeight / totalWeight) * 100)
    
    let strength: string
    let strengthText: string
    let strengthColor: string

    if (score < 30) {
      strength = 'weak'
      strengthText = '弱'
      strengthColor = 'red'
    } else if (score < 60) {
      strength = 'fair'
      strengthText = '一般'
      strengthColor = 'orange'
    } else if (score < 80) {
      strength = 'good'
      strengthText = '良好'
      strengthColor = 'yellow'
    } else {
      strength = 'strong'
      strengthText = '强'
      strengthColor = 'green'
    }

    // 生成建议
    const suggestions = generateSuggestions(checks, password)
    
    // 计算熵值
    const entropy = calculateEntropy(password)
    
    // 估算破解时间
    const crackTime = estimateCrackTime(entropy)

    return {
      score,
      strength,
      strengthText,
      strengthColor,
      checks,
      suggestions,
      entropy,
      crackTime
    }
  }, [password])

  /**
   * 检查常见模式
   */
  const hasCommonPatterns = (pwd: string): boolean => {
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /monkey/i,
      /dragon/i,
      /(\w)\1{2,}/, // 连续重复字符
      /012345/,
      /987654/
    ]
    
    return commonPatterns.some(pattern => pattern.test(pwd))
  }

  /**
   * 检查重复字符
   */
  const hasRepeatingChars = (pwd: string): boolean => {
    for (let i = 0; i < pwd.length - 2; i++) {
      if (pwd[i] === pwd[i + 1] && pwd[i] === pwd[i + 2]) {
        return true
      }
    }
    return false
  }

  /**
   * 生成改进建议
   */
  const generateSuggestions = (checks: any[], pwd: string): string[] => {
    const suggestions: string[] = []
    
    if (pwd.length < 8) {
      suggestions.push('增加密码长度至少到8位')
    } else if (pwd.length < 12) {
      suggestions.push('建议使用12位或更长的密码')
    }
    
    if (!/[a-z]/.test(pwd)) {
      suggestions.push('添加小写字母')
    }
    
    if (!/[A-Z]/.test(pwd)) {
      suggestions.push('添加大写字母')
    }
    
    if (!/\d/.test(pwd)) {
      suggestions.push('添加数字')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      suggestions.push('添加特殊字符 (!@#$%^&* 等)')
    }
    
    if (hasCommonPatterns(pwd)) {
      suggestions.push('避免使用常见的密码模式')
    }
    
    if (hasRepeatingChars(pwd)) {
      suggestions.push('避免连续重复的字符')
    }
    
    return suggestions
  }

  /**
   * 计算密码熵值
   */
  const calculateEntropy = (pwd: string): number => {
    let charsetSize = 0
    
    if (/[a-z]/.test(pwd)) charsetSize += 26
    if (/[A-Z]/.test(pwd)) charsetSize += 26
    if (/\d/.test(pwd)) charsetSize += 10
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) charsetSize += 32
    
    return pwd.length * Math.log2(charsetSize)
  }

  /**
   * 估算破解时间
   */
  const estimateCrackTime = (entropy: number): string => {
    const combinations = Math.pow(2, entropy)
    const guessesPerSecond = 1e9 // 假设每秒10亿次尝试
    const secondsToCrack = combinations / (2 * guessesPerSecond) // 平均需要一半时间
    
    if (secondsToCrack < 1) {
      return '瞬间'
    } else if (secondsToCrack < 60) {
      return `${Math.round(secondsToCrack)} 秒`
    } else if (secondsToCrack < 3600) {
      return `${Math.round(secondsToCrack / 60)} 分钟`
    } else if (secondsToCrack < 86400) {
      return `${Math.round(secondsToCrack / 3600)} 小时`
    } else if (secondsToCrack < 31536000) {
      return `${Math.round(secondsToCrack / 86400)} 天`
    } else if (secondsToCrack < 31536000000) {
      return `${Math.round(secondsToCrack / 31536000)} 年`
    } else {
      return '数千年以上'
    }
  }

  /**
   * 生成安全密码示例
   */
  const generateSecurePassword = (): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = lowercase + uppercase + numbers + symbols
    let password = ''
    
    // 确保包含每种类型的字符
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    
    // 填充到16位
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // 打乱顺序
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  /**
   * 常见弱密码列表
   */
  const commonWeakPasswords = [
    '123456', 'password', '123456789', '12345678', '12345',
    '1234567', '1234567890', 'qwerty', 'abc123', 'Password',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]

  return (
    <ToolLayout
      title="密码强度检测"
      description="检测密码安全强度"
      category="编码加密"
      icon="🛡️"
    >
      <div className="space-y-6">
        {/* 密码输入 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            密码强度检测
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                输入密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入要检测的密码..."
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 强度指示器 */}
            {password && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">密码强度</span>
                    <span className={`text-sm font-medium text-${passwordAnalysis.strengthColor}-600`}>
                      {passwordAnalysis.strengthText} ({passwordAnalysis.score}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 bg-${passwordAnalysis.strengthColor}-500`}
                      style={{ width: `${passwordAnalysis.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* 详细信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">密码长度:</span>
                    <span className="ml-2 font-medium">{password.length} 位</span>
                  </div>
                  <div>
                    <span className="text-gray-600">熵值:</span>
                    <span className="ml-2 font-medium">{passwordAnalysis.entropy.toFixed(1)} bits</span>
                  </div>
                  <div>
                    <span className="text-gray-600">估算破解时间:</span>
                    <span className="ml-2 font-medium">{passwordAnalysis.crackTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">字符类型:</span>
                    <span className="ml-2 font-medium">
                      {passwordAnalysis.checks.filter(c => c.passed && c.name.includes('包含')).length}/4
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 安全检查项 */}
        {password && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">安全检查项</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {passwordAnalysis.checks.map((check, index) => (
                <div key={index} className="flex items-center gap-3">
                  {check.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${check.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {check.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 改进建议 */}
        {password && passwordAnalysis.suggestions.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              改进建议
            </h3>
            <ul className="space-y-1">
              {passwordAnalysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-orange-800">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 密码生成器 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">安全密码生成</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPassword(generateSecurePassword())}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              生成安全密码
            </button>
            <button
              onClick={() => setPassword('')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              清空
            </button>
          </div>
        </div>

        {/* 常见弱密码警告 */}
        {commonWeakPasswords.includes(password.toLowerCase()) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-900">⚠️ 危险密码</h3>
                <p className="text-sm text-red-800 mt-1">
                  您输入的密码是常见的弱密码，极易被破解。请立即更换为更安全的密码。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 密码安全提示 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">密码安全提示</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 使用至少12位字符，包含大小写字母、数字和特殊字符</li>
            <li>• 避免使用个人信息（姓名、生日、电话等）</li>
            <li>• 不要使用常见的密码模式（123456、qwerty等）</li>
            <li>• 为不同的账户使用不同的密码</li>
            <li>• 定期更换重要账户的密码</li>
            <li>• 考虑使用密码管理器来生成和存储复杂密码</li>
            <li>• 启用双因素认证增加安全性</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
