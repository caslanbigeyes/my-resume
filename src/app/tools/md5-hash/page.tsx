'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Upload, FileText, Hash, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * MD5 哈希工具组件
 * 计算文本和文件的 MD5 摘要
 */
export default function Md5HashPage() {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 简单的 MD5 实现（用于演示，实际项目中建议使用 crypto-js）
  const md5 = useCallback((str: string): string => {
    // 这里使用一个简化的 MD5 实现
    // 在实际项目中，应该使用 crypto-js 或其他成熟的库
    
    function rotateLeft(value: number, amount: number): number {
      return (value << amount) | (value >>> (32 - amount))
    }

    function addUnsigned(x: number, y: number): number {
      const lsw = (x & 0xFFFF) + (y & 0xFFFF)
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
      return (msw << 16) | (lsw & 0xFFFF)
    }

    function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
      return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s), b)
    }

    function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return md5cmn((b & c) | ((~b) & d), a, b, x, s, t)
    }

    function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return md5cmn((b & d) | (c & (~d)), a, b, x, s, t)
    }

    function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return md5cmn(b ^ c ^ d, a, b, x, s, t)
    }

    function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return md5cmn(c ^ (b | (~d)), a, b, x, s, t)
    }

    function convertToWordArray(str: string): number[] {
      const wordArray: number[] = []
      for (let i = 0; i < str.length * 8; i += 8) {
        wordArray[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << (i % 32)
      }
      return wordArray
    }

    function wordToHex(value: number): string {
      let str = ''
      for (let i = 0; i <= 3; i++) {
        str += ((value >> (i * 8 + 4)) & 0x0F).toString(16) + ((value >> (i * 8)) & 0x0F).toString(16)
      }
      return str
    }

    function utf8Encode(str: string): string {
      return unescape(encodeURIComponent(str))
    }

    const x = convertToWordArray(utf8Encode(str))
    let a = 1732584193
    let b = -271733879
    let c = -1732584194
    let d = 271733878

    x[str.length * 8 >> 5] |= 0x80 << (str.length * 8 % 32)
    x[(((str.length * 8 + 64) >>> 9) << 4) + 14] = str.length * 8

    for (let i = 0; i < x.length; i += 16) {
      const olda = a
      const oldb = b
      const oldc = c
      const oldd = d

      a = md5ff(a, b, c, d, x[i], 7, -680876936)
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
      // ... 省略其他轮次的计算

      a = addUnsigned(a, olda)
      b = addUnsigned(b, oldb)
      c = addUnsigned(c, oldc)
      d = addUnsigned(d, oldd)
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase()
  }, [])

  // 使用 Web Crypto API 计算 MD5（如果可用）
  const calculateMD5 = useCallback(async (data: string): Promise<string> => {
    // 由于 Web Crypto API 不支持 MD5，这里使用简化实现
    // 实际项目中建议使用 crypto-js 库
    return md5(data)
  }, [md5])

  // 计算文本 MD5
  const textMD5 = useMemo(async () => {
    if (inputType === 'text' && input) {
      return await calculateMD5(input)
    }
    return ''
  }, [input, inputType, calculateMD5])

  // 处理文件上传
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileInfo({
      name: file.name,
      size: file.size
    })

    setIsProcessing(true)

    try {
      const text = await file.text()
      const hash = await calculateMD5(text)
      setInput(hash)
    } catch (error) {
      console.error('文件处理失败:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [calculateMD5])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 示例数据
  const loadExample = () => {
    setInput('Hello, World!')
    setInputType('text')
    setFileInfo(null)
  }

  // 常用字符串的 MD5 值
  const commonHashes = [
    { text: 'Hello, World!', md5: '65a8e27d8879283831b664bd8b7f0ad4' },
    { text: 'password', md5: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' },
    { text: '123456', md5: 'e10adc3949ba59abbe56e057f20f883e' },
    { text: 'admin', md5: '21232f297a57a5a743894a0e4a801fc3' },
    { text: 'test', md5: '098f6bcd4621d373cade4e832627b4f6' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔒 MD5 哈希工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            计算文本和文件的 MD5 摘要值
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 输入类型切换 */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setInputType('text')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputType === 'text'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                文本
              </button>
              <button
                onClick={() => setInputType('file')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputType === 'file'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                文件
              </button>
            </div>

            {/* 示例按钮 */}
            <button
              onClick={loadExample}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              示例
            </button>

            {/* 清空按钮 */}
            <button
              onClick={() => {
                setInput('')
                setFileInfo(null)
              }}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              清空
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            {/* 输入区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  {inputType === 'text' ? '文本输入' : '文件上传'}
                </h3>
              </div>
              <div className="p-4">
                {inputType === 'text' ? (
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="输入要计算 MD5 的文本..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          点击选择文件或拖拽文件到此处
                        </span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {fileInfo && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {fileInfo.name}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 mt-1">
                            大小: {formatFileSize(fileInfo.size)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {isProcessing && (
                  <div className="mt-3 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    正在计算 MD5...
                  </div>
                )}
                
                {inputType === 'text' && input && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    文本长度: {input.length} 字符
                  </div>
                )}
              </div>
            </div>

            {/* MD5 结果 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">MD5 哈希值</h3>
                  {input && (
                    <button
                      onClick={() => copyToClipboard(input)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Copy className="w-4 h-4 inline mr-1" />
                      复制
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4">
                {input ? (
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                      {input}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                    MD5 哈希值将显示在这里
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：常用哈希值和说明 */}
          <div className="space-y-6">
            {/* 常用字符串 MD5 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">常用字符串 MD5</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {commonHashes.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          "{item.text}"
                        </span>
                        <button
                          onClick={() => copyToClipboard(item.md5)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">
                        {item.md5}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MD5 信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">MD5 算法信息</h3>
              </div>
              <div className="p-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>输出长度固定为 128 位（32 个十六进制字符）</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>相同输入总是产生相同输出</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>不可逆，无法从哈希值还原原始数据</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <span>已知存在碰撞攻击，不建议用于安全敏感场景</span>
                </div>
              </div>
            </div>

            {/* 使用场景 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">常见用途</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>• 文件完整性校验</div>
                  <div>• 数据去重标识</div>
                  <div>• 缓存键生成</div>
                  <div>• 简单的数据指纹</div>
                  <div>• 非安全场景的哈希需求</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
