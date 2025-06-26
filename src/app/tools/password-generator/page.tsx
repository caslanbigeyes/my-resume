'use client'

import React, { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { RefreshCw, Copy, Shield, Eye, EyeOff, Settings } from 'lucide-react'

/**
 * 密码生成器工具组件
 * 生成安全密码
 */
export default function PasswordGeneratorTool() {
  const [passwords, setPasswords] = useState<string[]>([])
  const [options, setOptions] = useState({
    length: 16,
    count: 5,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    startWithLetter: false,
    noConsecutive: false
  })
  const [showPasswords, setShowPasswords] = useState(true)

  /**
   * 字符集定义
   */
  const charsets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O', // 相似字符
    ambiguous: '{}[]()/\\\'"`~,;.<>' // 容易混淆的字符
  }

  /**
   * 生成密码
   */
  const generatePasswords = useCallback(() => {
    let charset = ''
    
    // 构建字符集
    if (options.includeUppercase) charset += charsets.uppercase
    if (options.includeLowercase) charset += charsets.lowercase
    if (options.includeNumbers) charset += charsets.numbers
    if (options.includeSymbols) charset += charsets.symbols
    
    // 排除相似字符
    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => !charsets.similar.includes(char)).join('')
    }
    
    // 排除容易混淆的字符
    if (options.excludeAmbiguous) {
      charset = charset.split('').filter(char => !charsets.ambiguous.includes(char)).join('')
    }
    
    if (charset.length === 0) {
      alert('请至少选择一种字符类型')
      return
    }

    const newPasswords: string[] = []
    
    for (let i = 0; i < options.count; i++) {
      let password = ''
      
      // 确保包含每种选中的字符类型
      const requiredChars: string[] = []
      if (options.includeUppercase) requiredChars.push(getRandomChar(charsets.uppercase))
      if (options.includeLowercase) requiredChars.push(getRandomChar(charsets.lowercase))
      if (options.includeNumbers) requiredChars.push(getRandomChar(charsets.numbers))
      if (options.includeSymbols) requiredChars.push(getRandomChar(charsets.symbols))
      
      // 如果要求以字母开头
      if (options.startWithLetter) {
        const letters = (options.includeUppercase ? charsets.uppercase : '') + 
                       (options.includeLowercase ? charsets.lowercase : '')
        if (letters) {
          password += getRandomChar(letters)
        }
      }
      
      // 添加必需字符
      requiredChars.forEach(char => {
        if (password.length < options.length) {
          password += char
        }
      })
      
      // 填充剩余长度
      while (password.length < options.length) {
        const char = getRandomChar(charset)
        
        // 检查是否允许连续字符
        if (options.noConsecutive && password.length > 0) {
          const lastChar = password[password.length - 1]
          if (char === lastChar) {
            continue
          }
        }
        
        password += char
      }
      
      // 打乱密码字符顺序（除非要求以字母开头）
      if (!options.startWithLetter) {
        password = shuffleString(password)
      } else {
        const firstChar = password[0]
        const restChars = shuffleString(password.slice(1))
        password = firstChar + restChars
      }
      
      newPasswords.push(password)
    }
    
    setPasswords(newPasswords)
  }, [options])

  /**
   * 获取随机字符
   */
  const getRandomChar = (charset: string): string => {
    return charset[Math.floor(Math.random() * charset.length)]
  }

  /**
   * 打乱字符串
   */
  const shuffleString = (str: string): string => {
    return str.split('').sort(() => Math.random() - 0.5).join('')
  }

  /**
   * 复制密码
   */
  const copyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password)
      alert('密码已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 复制所有密码
   */
  const copyAllPasswords = async () => {
    try {
      const allPasswords = passwords.join('\n')
      await navigator.clipboard.writeText(allPasswords)
      alert('所有密码已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 计算密码强度
   */
  const calculateStrength = (password: string): { score: number; text: string; color: string } => {
    let score = 0
    
    // 长度评分
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    
    // 字符类型评分
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1
    
    if (score <= 2) return { score, text: '弱', color: 'red' }
    if (score <= 4) return { score, text: '中等', color: 'yellow' }
    if (score <= 6) return { score, text: '强', color: 'green' }
    return { score, text: '很强', color: 'green' }
  }

  /**
   * 预设配置
   */
  const presets = [
    {
      name: '高安全性',
      config: {
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: true,
        excludeAmbiguous: true
      }
    },
    {
      name: '易记忆',
      config: {
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: true,
        excludeAmbiguous: false
      }
    },
    {
      name: '数字字母',
      config: {
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: false,
        excludeAmbiguous: false
      }
    },
    {
      name: 'PIN码',
      config: {
        length: 6,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: false,
        excludeAmbiguous: false
      }
    }
  ]

  /**
   * 应用预设
   */
  const applyPreset = (preset: typeof presets[0]) => {
    setOptions(prev => ({ ...prev, ...preset.config }))
  }

  return (
    <ToolLayout
      title="密码生成器"
      description="生成安全密码"
      category="随机生成"
      icon="🔐"
    >
      <div className="space-y-6">
        {/* 生成设置 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            生成设置
          </h3>
          
          <div className="space-y-4">
            {/* 基本设置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码长度: {options.length}
                </label>
                <input
                  type="range"
                  min="4"
                  max="50"
                  value={options.length}
                  onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4</span>
                  <span>50</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生成数量
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={options.count}
                  onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 字符类型 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">包含字符类型</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeUppercase}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">大写字母 (A-Z)</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeLowercase}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">小写字母 (a-z)</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">数字 (0-9)</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeSymbols}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">特殊字符 (!@#$)</span>
                </label>
              </div>
            </div>

            {/* 高级选项 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">高级选项</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => setOptions(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">排除相似字符 (il1Lo0O)</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) => setOptions(prev => ({ ...prev, excludeAmbiguous: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">排除容易混淆字符</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.startWithLetter}
                    onChange={(e) => setOptions(prev => ({ ...prev, startWithLetter: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">以字母开头</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.noConsecutive}
                    onChange={(e) => setOptions(prev => ({ ...prev, noConsecutive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">无连续重复字符</span>
                </label>
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="flex gap-2">
              <button
                onClick={generatePasswords}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                生成密码
              </button>
              
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {showPasswords ? '隐藏' : '显示'}
              </button>
            </div>
          </div>
        </div>

        {/* 预设配置 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">快速预设</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-sm"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 生成的密码 */}
        {passwords.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                生成的密码 ({passwords.length} 个)
              </h3>
              <button
                onClick={copyAllPasswords}
                className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
                复制全部
              </button>
            </div>

            <div className="space-y-3">
              {passwords.map((password, index) => {
                const strength = calculateStrength(password)
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-mono text-lg">
                        {showPasswords ? password : '•'.repeat(password.length)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-gray-600">长度: {password.length}</span>
                        <span className={`font-medium text-${strength.color}-600`}>
                          强度: {strength.text}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyPassword(password)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="复制密码"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 调整密码长度和生成数量</li>
            <li>• 选择包含的字符类型组合</li>
            <li>• 使用高级选项提高密码安全性</li>
            <li>• 排除相似字符避免输入错误</li>
            <li>• 支持批量生成和一键复制</li>
            <li>• 实时显示密码强度评估</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
