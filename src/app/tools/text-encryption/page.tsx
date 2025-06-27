'use client'

import React, { useState, useCallback } from 'react'
import { Lock, Unlock, Copy, RefreshCw, Key, Eye, EyeOff } from 'lucide-react'

interface EncryptionOptions {
  method: 'caesar' | 'base64' | 'rot13' | 'reverse' | 'atbash' | 'simple'
  key: string
  shift: number
}

/**
 * 文本加密解密工具组件
 * 提供多种文本加密和解密方法
 */
export default function TextEncryptionPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [options, setOptions] = useState<EncryptionOptions>({
    method: 'caesar',
    key: 'secret',
    shift: 3
  })
  const [showKey, setShowKey] = useState(false)

  // 加密方法
  const encryptionMethods = [
    { value: 'caesar', label: '凯撒密码', description: '字母位移加密' },
    { value: 'base64', label: 'Base64', description: '编码转换' },
    { value: 'rot13', label: 'ROT13', description: '字母旋转13位' },
    { value: 'reverse', label: '反转', description: '字符串反转' },
    { value: 'atbash', label: 'Atbash', description: '字母表反向映射' },
    { value: 'simple', label: '简单替换', description: '基于密钥的字符替换' }
  ]

  // 凯撒密码加密
  const caesarCipher = useCallback((text: string, shift: number, encrypt: boolean): string => {
    const actualShift = encrypt ? shift : -shift
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97
      const code = char.charCodeAt(0)
      let shifted = ((code - start + actualShift) % 26 + 26) % 26
      return String.fromCharCode(shifted + start)
    })
  }, [])

  // Base64 编码/解码
  const base64Transform = useCallback((text: string, encrypt: boolean): string => {
    try {
      if (encrypt) {
        return btoa(unescape(encodeURIComponent(text)))
      } else {
        return decodeURIComponent(escape(atob(text)))
      }
    } catch (error) {
      return '解码失败：无效的 Base64 格式'
    }
  }, [])

  // ROT13 转换
  const rot13Transform = useCallback((text: string): string => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97
      const code = char.charCodeAt(0)
      const shifted = ((code - start + 13) % 26 + 26) % 26
      return String.fromCharCode(shifted + start)
    })
  }, [])

  // 字符串反转
  const reverseText = useCallback((text: string): string => {
    return text.split('').reverse().join('')
  }, [])

  // Atbash 密码
  const atbashCipher = useCallback((text: string): string => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      if (char <= 'Z') {
        return String.fromCharCode(90 - (char.charCodeAt(0) - 65))
      } else {
        return String.fromCharCode(122 - (char.charCodeAt(0) - 97))
      }
    })
  }, [])

  // 简单替换密码
  const simpleSubstitution = useCallback((text: string, key: string, encrypt: boolean): string => {
    if (!key) return text
    
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    const keyAlphabet = key.toLowerCase().split('').filter((char, index, arr) => 
      alphabet.includes(char) && arr.indexOf(char) === index
    ).join('')
    
    const remainingChars = alphabet.split('').filter(char => !keyAlphabet.includes(char))
    const substitutionAlphabet = keyAlphabet + remainingChars.join('')
    
    return text.replace(/[a-zA-Z]/g, (char) => {
      const isUpper = char === char.toUpperCase()
      const lowerChar = char.toLowerCase()
      const index = alphabet.indexOf(lowerChar)
      
      if (index === -1) return char
      
      let newChar
      if (encrypt) {
        newChar = substitutionAlphabet[index] || char
      } else {
        const subIndex = substitutionAlphabet.indexOf(lowerChar)
        newChar = subIndex !== -1 ? alphabet[subIndex] : char
      }
      
      return isUpper ? newChar.toUpperCase() : newChar
    })
  }, [])

  // 执行加密/解密
  const processText = useCallback((text: string, method: string, encrypt: boolean): string => {
    if (!text) return ''

    switch (method) {
      case 'caesar':
        return caesarCipher(text, options.shift, encrypt)
      case 'base64':
        return base64Transform(text, encrypt)
      case 'rot13':
        return rot13Transform(text)
      case 'reverse':
        return reverseText(text)
      case 'atbash':
        return atbashCipher(text)
      case 'simple':
        return simpleSubstitution(text, options.key, encrypt)
      default:
        return text
    }
  }, [options, caesarCipher, base64Transform, rot13Transform, reverseText, atbashCipher, simpleSubstitution])

  // 处理转换
  const handleTransform = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('')
      return
    }

    try {
      const result = processText(inputText, options.method, mode === 'encrypt')
      setOutputText(result)
    } catch (error) {
      setOutputText('处理失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }, [inputText, options.method, mode, processText])

  // 自动转换
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        handleTransform()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputText, options, mode, handleTransform])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 交换输入输出
  const swapInputOutput = useCallback(() => {
    const temp = inputText
    setInputText(outputText)
    setOutputText(temp)
    setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt')
  }, [inputText, outputText, mode])

  // 生成随机密钥
  const generateRandomKey = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setOptions(prev => ({ ...prev, key: result }))
  }, [])

  // 加载示例
  const loadExample = () => {
    setInputText('Hello, World! This is a secret message.')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔐 文本加密解密
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            使用多种方法对文本进行加密和解密
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：设置面板 */}
          <div className="space-y-6">
            {/* 模式选择 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">操作模式</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('encrypt')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    mode === 'encrypt'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  加密
                </button>
                <button
                  onClick={() => setMode('decrypt')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    mode === 'decrypt'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  解密
                </button>
              </div>
            </div>

            {/* 加密方法 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">加密方法</h3>
              <select
                value={options.method}
                onChange={(e) => setOptions(prev => ({ ...prev, method: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              >
                {encryptionMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {encryptionMethods.find(m => m.value === options.method)?.description}
              </p>
            </div>

            {/* 参数设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">参数设置</h3>
              
              {options.method === 'caesar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    位移量: {options.shift}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={options.shift}
                    onChange={(e) => setOptions(prev => ({ ...prev, shift: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1</span>
                    <span>25</span>
                  </div>
                </div>
              )}

              {options.method === 'simple' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    密钥
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={options.key}
                      onChange={(e) => setOptions(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="输入密钥"
                      className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={generateRandomKey}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {['rot13', 'reverse', 'atbash', 'base64'].includes(options.method) && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  此方法不需要额外参数
                </div>
              )}
            </div>

            {/* 快速操作 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">快速操作</h3>
              <div className="space-y-2">
                <button
                  onClick={loadExample}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  加载示例
                </button>
                <button
                  onClick={swapInputOutput}
                  disabled={!outputText}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  交换输入输出
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：文本处理区域 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 输入区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {mode === 'encrypt' ? '原始文本' : '加密文本'}
                </h3>
              </div>
              
              <div className="p-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`输入要${mode === 'encrypt' ? '加密' : '解密'}的文本...`}
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 输出区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {mode === 'encrypt' ? '加密结果' : '解密结果'}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(outputText)}
                    disabled={!outputText}
                    className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <textarea
                  value={outputText}
                  readOnly
                  placeholder={`${mode === 'encrypt' ? '加密' : '解密'}结果将显示在这里...`}
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg resize-none"
                />
              </div>
            </div>

            {/* 方法说明 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">加密方法说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {encryptionMethods.map(method => (
                  <div key={method.value} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {method.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {method.value === 'caesar' && '安全性: 低 | 适用: 学习演示'}
                      {method.value === 'base64' && '安全性: 无 | 适用: 数据编码'}
                      {method.value === 'rot13' && '安全性: 低 | 适用: 简单混淆'}
                      {method.value === 'reverse' && '安全性: 极低 | 适用: 简单变换'}
                      {method.value === 'atbash' && '安全性: 低 | 适用: 古典密码'}
                      {method.value === 'simple' && '安全性: 低 | 适用: 教学目的'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 支持多种经典加密算法</li>
                <li>• 实时加密解密预览</li>
                <li>• 可自定义加密参数</li>
                <li>• 支持输入输出交换</li>
                <li>• 一键复制结果</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">安全提醒</h4>
              <ul className="space-y-1">
                <li>• 这些方法仅适用于学习和演示</li>
                <li>• 不要用于保护敏感信息</li>
                <li>• 现代加密请使用专业工具</li>
                <li>• 密钥请妥善保管</li>
                <li>• 定期更换密钥</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>安全警告:</strong> 此工具提供的加密方法安全性较低，仅适用于教学和演示目的。对于真正的数据保护，请使用现代加密标准如 AES。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
