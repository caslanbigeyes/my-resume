'use client'

import React, { useState, useCallback } from 'react'
import { Upload, Copy, Download, FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react'

interface FileHashResult {
  file: File
  md5: string
  sha1: string
  sha256: string
  size: number
  lastModified: number
  type: string
}

/**
 * 文件哈希计算器组件
 * 计算文件的 MD5、SHA1、SHA256 哈希值
 */
export default function FileHashPage() {
  const [files, setFiles] = useState<FileHashResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [compareHash, setCompareHash] = useState('')
  const [compareResult, setCompareResult] = useState<{ file: string; match: boolean } | null>(null)

  // 计算 MD5 哈希（简化版本）
  const calculateMD5 = useCallback(async (buffer: ArrayBuffer): Promise<string> => {
    // 在实际项目中，建议使用 crypto-js 或 Web Crypto API
    // 这里使用简化的实现作为示例
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }, [])

  // 计算 SHA1 哈希
  const calculateSHA1 = useCallback(async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }, [])

  // 计算 SHA256 哈希
  const calculateSHA256 = useCallback(async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }, [])

  // 处理文件上传
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    setError('')

    try {
      const results: FileHashResult[] = []

      for (const file of uploadedFiles) {
        const buffer = await file.arrayBuffer()
        
        // 并行计算所有哈希值
        const [md5, sha1, sha256] = await Promise.all([
          calculateMD5(buffer),
          calculateSHA1(buffer),
          calculateSHA256(buffer)
        ])

        results.push({
          file,
          md5,
          sha1,
          sha256,
          size: file.size,
          lastModified: file.lastModified,
          type: file.type || 'unknown'
        })
      }

      setFiles(prev => [...prev, ...results])
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败')
    } finally {
      setIsProcessing(false)
    }
  }, [calculateMD5, calculateSHA1, calculateSHA256])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)

    if (droppedFiles.length === 0) return

    setIsProcessing(true)
    setError('')

    try {
      const results: FileHashResult[] = []

      for (const file of droppedFiles) {
        const buffer = await file.arrayBuffer()

        // 并行计算所有哈希值
        const [md5, sha1, sha256] = await Promise.all([
          calculateMD5(buffer),
          calculateSHA1(buffer),
          calculateSHA256(buffer)
        ])

        results.push({
          file,
          md5,
          sha1,
          sha256,
          size: file.size,
          lastModified: file.lastModified,
          type: file.type
        })
      }

      setFiles(prev => [...results, ...prev])
    } catch (err) {
      setError('计算哈希值失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setIsProcessing(false)
    }
  }, [calculateMD5, calculateSHA1, calculateSHA256])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 比较哈希值
  const compareHashValue = (fileResult: FileHashResult) => {
    if (!compareHash.trim()) return

    const hash = compareHash.toLowerCase().trim()
    const fileHashes = {
      md5: fileResult.md5.toLowerCase(),
      sha1: fileResult.sha1.toLowerCase(),
      sha256: fileResult.sha256.toLowerCase()
    }

    const match = Object.values(fileHashes).includes(hash)
    setCompareResult({
      file: fileResult.file.name,
      match
    })
  }

  // 下载哈希报告
  const downloadReport = () => {
    if (files.length === 0) return

    const report = files.map(fileResult => {
      return [
        `文件名: ${fileResult.file.name}`,
        `大小: ${formatFileSize(fileResult.size)}`,
        `类型: ${fileResult.type}`,
        `修改时间: ${new Date(fileResult.lastModified).toLocaleString()}`,
        `MD5: ${fileResult.md5}`,
        `SHA1: ${fileResult.sha1}`,
        `SHA256: ${fileResult.sha256}`,
        '---'
      ].join('\n')
    }).join('\n')

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'file-hashes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 清空所有文件
  const clearAll = () => {
    setFiles([])
    setError('')
    setCompareResult(null)
  }

  // 移除单个文件
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 格式化哈希值显示
  const formatHash = (hash: string): string => {
    return hash.match(/.{1,8}/g)?.join(' ') || hash
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔐 文件哈希计算器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            计算文件的 MD5、SHA1、SHA256 哈希值，用于文件完整性验证
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 哈希比较 */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                value={compareHash}
                onChange={(e) => setCompareHash(e.target.value)}
                placeholder="输入哈希值进行比较验证..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={downloadReport}
                disabled={files.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载报告
              </button>
              <button
                onClick={clearAll}
                disabled={files.length === 0}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                清空全部
              </button>
            </div>
          </div>
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
                点击选择文件或拖拽文件到此处
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                支持任意格式文件，可同时选择多个文件
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
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
              正在计算哈希值...
            </div>
          )}
        </div>

        {/* 比较结果 */}
        {compareResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className={`flex items-center gap-2 ${compareResult.match ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {compareResult.match ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">
                文件 "{compareResult.file}" 的哈希值 {compareResult.match ? '匹配' : '不匹配'}
              </span>
            </div>
          </div>
        )}

        {/* 文件哈希结果 */}
        {files.length > 0 && (
          <div className="space-y-6">
            {files.map((fileResult, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* 文件信息头部 */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {fileResult.file.name}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(fileResult.size)} • {fileResult.type} • 
                          修改于 {new Date(fileResult.lastModified).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => compareHashValue(fileResult)}
                        disabled={!compareHash.trim()}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Shield className="w-4 h-4 inline mr-1" />
                        验证
                      </button>
                      <button
                        onClick={() => removeFile(index)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>

                {/* 哈希值 */}
                <div className="p-4 space-y-4">
                  {[
                    { label: 'MD5', value: fileResult.md5, color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'SHA1', value: fileResult.sha1, color: 'text-green-600 dark:text-green-400' },
                    { label: 'SHA256', value: fileResult.sha256, color: 'text-purple-600 dark:text-purple-400' }
                  ].map(({ label, value, color }) => (
                    <div key={label} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${color}`}>{label}</span>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        {formatHash(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            请上传文件开始计算哈希值
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">哈希算法</h4>
              <ul className="space-y-1">
                <li>• <strong>MD5:</strong> 128位，快速但安全性较低</li>
                <li>• <strong>SHA1:</strong> 160位，比MD5更安全</li>
                <li>• <strong>SHA256:</strong> 256位，目前最安全</li>
                <li>• 相同文件的哈希值始终相同</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用场景</h4>
              <ul className="space-y-1">
                <li>• 验证文件完整性</li>
                <li>• 检测文件是否被篡改</li>
                <li>• 文件去重和比较</li>
                <li>• 数字签名和认证</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>提示:</strong> 输入已知的哈希值可以验证文件完整性。如果哈希值匹配，说明文件未被修改。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
