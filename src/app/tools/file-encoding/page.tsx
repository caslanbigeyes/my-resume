'use client'

import React, { useState, useCallback } from 'react'
import { Upload, FileText, Copy, Download, AlertCircle, CheckCircle } from 'lucide-react'

interface EncodingResult {
  file: File
  detectedEncoding: string
  confidence: number
  content: string
  byteLength: number
  charLength: number
  hasInvalidChars: boolean
  bomDetected: boolean
}

/**
 * 文件编码检测工具组件
 * 检测文件的字符编码格式
 */
export default function FileEncodingPage() {
  const [results, setResults] = useState<EncodingResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // 常见编码格式
  const encodings = [
    { name: 'UTF-8', description: '通用Unicode编码，支持所有字符' },
    { name: 'UTF-16', description: 'Unicode编码，使用16位编码单元' },
    { name: 'UTF-32', description: 'Unicode编码，使用32位编码单元' },
    { name: 'ASCII', description: '7位字符编码，仅支持英文' },
    { name: 'ISO-8859-1', description: '西欧字符编码' },
    { name: 'Windows-1252', description: 'Windows西欧字符编码' },
    { name: 'GBK', description: '中文字符编码扩展' },
    { name: 'GB2312', description: '简体中文字符编码' },
    { name: 'Big5', description: '繁体中文字符编码' },
    { name: 'Shift_JIS', description: '日文字符编码' }
  ]

  // 检测 BOM (Byte Order Mark)
  const detectBOM = useCallback((bytes: Uint8Array): { encoding: string; bomLength: number } | null => {
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return { encoding: 'UTF-8', bomLength: 3 }
    }
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
      return { encoding: 'UTF-16LE', bomLength: 2 }
    }
    if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
      return { encoding: 'UTF-16BE', bomLength: 2 }
    }
    if (bytes.length >= 4 && bytes[0] === 0xFF && bytes[1] === 0xFE && bytes[2] === 0x00 && bytes[3] === 0x00) {
      return { encoding: 'UTF-32LE', bomLength: 4 }
    }
    if (bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0xFE && bytes[3] === 0xFF) {
      return { encoding: 'UTF-32BE', bomLength: 4 }
    }
    return null
  }, [])

  // 简化的编码检测算法
  const detectEncoding = useCallback((bytes: Uint8Array): { encoding: string; confidence: number } => {
    // 检查 BOM
    const bom = detectBOM(bytes)
    if (bom) {
      return { encoding: bom.encoding, confidence: 1.0 }
    }

    // 检查是否为纯 ASCII
    let isAscii = true
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] > 127) {
        isAscii = false
        break
      }
    }
    if (isAscii) {
      return { encoding: 'ASCII', confidence: 1.0 }
    }

    // 检查 UTF-8 有效性
    let utf8Valid = true
    let utf8Score = 0
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i]
      if (byte < 0x80) {
        // ASCII 字符
        continue
      } else if ((byte >> 5) === 0x06) {
        // 110xxxxx - 2字节序列
        if (i + 1 >= bytes.length || (bytes[i + 1] >> 6) !== 0x02) {
          utf8Valid = false
          break
        }
        utf8Score += 2
        i += 1
      } else if ((byte >> 4) === 0x0E) {
        // 1110xxxx - 3字节序列
        if (i + 2 >= bytes.length || (bytes[i + 1] >> 6) !== 0x02 || (bytes[i + 2] >> 6) !== 0x02) {
          utf8Valid = false
          break
        }
        utf8Score += 3
        i += 2
      } else if ((byte >> 3) === 0x1E) {
        // 11110xxx - 4字节序列
        if (i + 3 >= bytes.length || (bytes[i + 1] >> 6) !== 0x02 || (bytes[i + 2] >> 6) !== 0x02 || (bytes[i + 3] >> 6) !== 0x02) {
          utf8Valid = false
          break
        }
        utf8Score += 4
        i += 3
      } else {
        utf8Valid = false
        break
      }
    }

    if (utf8Valid && utf8Score > 0) {
      const confidence = Math.min(utf8Score / bytes.length * 2, 0.95)
      return { encoding: 'UTF-8', confidence }
    }

    // 检查中文编码特征
    let gbkScore = 0
    let big5Score = 0
    
    for (let i = 0; i < bytes.length - 1; i++) {
      const byte1 = bytes[i]
      const byte2 = bytes[i + 1]
      
      // GBK 范围检查
      if (byte1 >= 0x81 && byte1 <= 0xFE && byte2 >= 0x40 && byte2 <= 0xFE && byte2 !== 0x7F) {
        gbkScore++
      }
      
      // Big5 范围检查
      if (byte1 >= 0xA1 && byte1 <= 0xFE && 
          ((byte2 >= 0x40 && byte2 <= 0x7E) || (byte2 >= 0xA1 && byte2 <= 0xFE))) {
        big5Score++
      }
    }

    if (gbkScore > big5Score && gbkScore > bytes.length * 0.1) {
      return { encoding: 'GBK', confidence: Math.min(gbkScore / (bytes.length / 2), 0.8) }
    }
    
    if (big5Score > gbkScore && big5Score > bytes.length * 0.1) {
      return { encoding: 'Big5', confidence: Math.min(big5Score / (bytes.length / 2), 0.8) }
    }

    // 默认返回 UTF-8（低置信度）
    return { encoding: 'UTF-8', confidence: 0.3 }
  }, [detectBOM])

  // 尝试解码文本
  const decodeText = useCallback((bytes: Uint8Array, encoding: string): { content: string; hasInvalidChars: boolean } => {
    try {
      let decoder: TextDecoder
      
      // 处理编码名称映射
      const encodingMap: { [key: string]: string } = {
        'ASCII': 'ascii',
        'UTF-8': 'utf-8',
        'UTF-16LE': 'utf-16le',
        'UTF-16BE': 'utf-16be',
        'UTF-32LE': 'utf-32le',
        'UTF-32BE': 'utf-32be',
        'GBK': 'gbk',
        'Big5': 'big5',
        'ISO-8859-1': 'iso-8859-1',
        'Windows-1252': 'windows-1252'
      }

      const mappedEncoding = encodingMap[encoding] || 'utf-8'
      
      try {
        decoder = new TextDecoder(mappedEncoding, { fatal: true })
      } catch {
        // 如果编码不支持，回退到 UTF-8
        decoder = new TextDecoder('utf-8', { fatal: false })
      }

      const content = decoder.decode(bytes)
      const hasInvalidChars = content.includes('\uFFFD') // 替换字符表示解码失败
      
      return { content, hasInvalidChars }
    } catch (error) {
      // 解码失败，尝试用 UTF-8 非严格模式
      const decoder = new TextDecoder('utf-8', { fatal: false })
      const content = decoder.decode(bytes)
      return { content, hasInvalidChars: true }
    }
  }, [])

  // 处理文件上传
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setError('')

    try {
      const newResults: EncodingResult[] = []

      for (const file of Array.from(files)) {
        // 只处理文本文件
        if (file.size > 10 * 1024 * 1024) { // 限制10MB
          continue
        }

        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        
        // 检测 BOM
        const bom = detectBOM(bytes)
        const bomDetected = !!bom
        
        // 检测编码
        const { encoding, confidence } = detectEncoding(bytes)
        
        // 解码文本
        const { content, hasInvalidChars } = decodeText(bytes, encoding)
        
        newResults.push({
          file,
          detectedEncoding: encoding,
          confidence,
          content: content.substring(0, 5000), // 只显示前5000字符
          byteLength: bytes.length,
          charLength: content.length,
          hasInvalidChars,
          bomDetected
        })
      }

      setResults(prev => [...newResults, ...prev.slice(0, 9)]) // 保留最近10个结果
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败')
    } finally {
      setIsProcessing(false)
    }
  }, [detectBOM, detectEncoding, decodeText])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }, [handleFileUpload])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载转换后的文件
  const downloadConverted = (result: EncodingResult, targetEncoding: string) => {
    try {
      let content = result.content
      
      // 如果目标编码是 UTF-8 with BOM
      if (targetEncoding === 'UTF-8-BOM') {
        const bom = '\uFEFF'
        content = bom + content
        targetEncoding = 'UTF-8'
      }

      const blob = new Blob([content], { type: 'text/plain;charset=' + targetEncoding.toLowerCase() })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${result.file.name.replace(/\.[^/.]+$/, '')}_${targetEncoding.toLowerCase()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('下载失败:', err)
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

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📄 文件编码检测
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            检测文本文件的字符编码格式并进行转换
          </p>
        </div>

        {/* 文件上传区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="text-lg text-gray-600 dark:text-gray-400 mb-2 block">
                拖拽文本文件到此处或点击上传
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                支持 TXT、CSV、JSON、XML 等文本格式，最大 10MB
              </span>
              <input
                type="file"
                multiple
                accept=".txt,.csv,.json,.xml,.log,.md,.js,.css,.html,.py,.java,.cpp,.c,.h"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              正在检测文件编码...
            </div>
          )}
        </div>

        {/* 编码说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">常见编码格式</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {encodings.map((encoding, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 min-w-20">
                  {encoding.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {encoding.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 检测结果 */}
        {results.length > 0 && (
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* 文件信息头部 */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {result.file.name}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(result.byteLength)} • {result.charLength.toLocaleString()} 字符
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.bomDetected && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                          BOM
                        </span>
                      )}
                      {result.hasInvalidChars && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                          乱码
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 检测结果 */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {result.detectedEncoding}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">检测编码</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>
                        {Math.round(result.confidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">置信度</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-center gap-2">
                        {result.hasInvalidChars ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {result.hasInvalidChars ? '可能有误' : '正常'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">解码状态</div>
                    </div>
                  </div>

                  {/* 文件内容预览 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">内容预览</h4>
                      <button
                        onClick={() => copyToClipboard(result.content)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg max-h-32 overflow-y-auto">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {result.content}
                      </pre>
                    </div>
                  </div>

                  {/* 转换选项 */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">编码转换</h4>
                    <div className="flex flex-wrap gap-2">
                      {['UTF-8', 'UTF-8-BOM', 'UTF-16', 'GBK', 'ASCII'].map(encoding => (
                        <button
                          key={encoding}
                          onClick={() => downloadConverted(result, encoding)}
                          disabled={encoding === result.detectedEncoding}
                          className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          {encoding}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !isProcessing && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            上传文本文件开始检测编码格式
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">检测原理</h4>
              <ul className="space-y-1">
                <li>• 检测 BOM (字节顺序标记)</li>
                <li>• 分析字节序列模式</li>
                <li>• 验证编码有效性</li>
                <li>• 计算检测置信度</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 检测结果仅供参考</li>
                <li>• 短文本检测准确度较低</li>
                <li>• 建议人工确认重要文件</li>
                <li>• 转换前请备份原文件</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
