'use client'

import React, { useState, useCallback } from 'react'
import { Upload, Copy, Download, Image as ImageIcon, Eye, EyeOff, Info } from 'lucide-react'

interface ImageData {
  file: File
  base64: string
  dataUrl: string
  size: number
  dimensions: { width: number; height: number }
  type: string
}

/**
 * 图片转 Base64 工具组件
 * 将图片文件转换为 Base64 编码
 */
export default function ImageToBase64Page() {
  const [images, setImages] = useState<ImageData[]>([])
  const [showPreview, setShowPreview] = useState(true)
  const [outputFormat, setOutputFormat] = useState<'base64' | 'dataurl'>('base64')
  const [error, setError] = useState('')

  // 获取图片尺寸
  const getImageDimensions = useCallback((file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // 处理文件上传
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return

    setError('')
    
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    const invalidFiles = files.filter(file => !validImageTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      setError(`不支持的文件类型: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      setError(`文件过大 (>10MB): ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    try {
      const imageDataPromises = files.map(async (file): Promise<ImageData> => {
        const dimensions = await getImageDimensions(file)
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            const base64 = dataUrl.split(',')[1]
            
            resolve({
              file,
              base64,
              dataUrl,
              size: file.size,
              dimensions,
              type: file.type
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      const newImages = await Promise.all(imageDataPromises)
      setImages(prev => [...prev, ...newImages])
    } catch (err) {
      setError('文件处理失败')
    }
  }, [getImageDimensions])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)

    if (files.length === 0) return

    setError('')

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    const invalidFiles = files.filter(file => !validImageTypes.includes(file.type))

    if (invalidFiles.length > 0) {
      setError(`不支持的文件类型: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      setError(`文件过大 (>10MB): ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    try {
      const results: ImageData[] = []

      for (const file of files) {
        const dimensions = await getImageDimensions(file)

        const result = await new Promise<ImageData>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            const base64 = dataUrl.split(',')[1]

            resolve({
              file,
              base64,
              dataUrl,
              size: file.size,
              dimensions,
              type: file.type
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        results.push(result)
      }

      setImages(prev => [...results, ...prev])
    } catch (err) {
      setError('转换失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }, [getImageDimensions])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载文件
  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取输出内容
  const getOutputContent = (image: ImageData): string => {
    return outputFormat === 'base64' ? image.base64 : image.dataUrl
  }

  // 清空所有图片
  const clearAll = () => {
    setImages([])
    setError('')
  }

  // 移除单个图片
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // 下载所有结果
  const downloadAll = () => {
    if (images.length === 0) return

    const content = images.map((image, index) => {
      const output = getOutputContent(image)
      return `// ${image.file.name}\n${output}\n`
    }).join('\n')

    downloadText(content, 'images-base64.txt')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🖼️ 图片转 Base64 工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            将图片文件转换为 Base64 编码字符串
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 输出格式 */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setOutputFormat('base64')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  outputFormat === 'base64'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Base64
              </button>
              <button
                onClick={() => setOutputFormat('dataurl')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  outputFormat === 'dataurl'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Data URL
              </button>
            </div>

            {/* 预览切换 */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? '隐藏预览' : '显示预览'}
            </button>

            {/* 操作按钮 */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={downloadAll}
                disabled={images.length === 0}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4 inline mr-1" />
                下载全部
              </button>
              <button
                onClick={clearAll}
                disabled={images.length === 0}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="text-lg text-gray-600 dark:text-gray-400 mb-2 block">
                点击选择图片或拖拽图片到此处
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                支持 JPG、PNG、GIF、WebP、SVG 格式，最大 10MB
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* 图片列表 */}
        {images.length > 0 && (
          <div className="space-y-6">
            {images.map((image, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* 图片信息头部 */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {image.file.name}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {image.dimensions.width} × {image.dimensions.height} • {formatFileSize(image.size)} • {image.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(getOutputContent(image))}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <Copy className="w-4 h-4 inline mr-1" />
                        复制
                      </button>
                      <button
                        onClick={() => downloadText(getOutputContent(image), `${image.file.name}.txt`)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <Download className="w-4 h-4 inline mr-1" />
                        下载
                      </button>
                      <button
                        onClick={() => removeImage(index)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
                  {/* 图片预览 */}
                  {showPreview && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">图片预览</h4>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                        <img
                          src={image.dataUrl}
                          alt={image.file.name}
                          className="max-w-full max-h-64 mx-auto object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Base64 输出 */}
                  <div className={showPreview ? '' : 'lg:col-span-2'}>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {outputFormat === 'base64' ? 'Base64 编码' : 'Data URL'}
                    </h4>
                    <div className="relative">
                      <textarea
                        value={getOutputContent(image)}
                        readOnly
                        className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-xs resize-none"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => copyToClipboard(getOutputContent(image))}
                          className="p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      长度: {getOutputContent(image).length} 字符
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            请上传图片文件开始转换
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">支持格式</h4>
              <ul className="space-y-1">
                <li>• JPEG/JPG - 有损压缩图片</li>
                <li>• PNG - 无损压缩图片</li>
                <li>• GIF - 动画图片</li>
                <li>• WebP - 现代图片格式</li>
                <li>• SVG - 矢量图形</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">输出格式</h4>
              <ul className="space-y-1">
                <li>• <strong>Base64:</strong> 纯 Base64 编码字符串</li>
                <li>• <strong>Data URL:</strong> 包含 MIME 类型的完整 Data URL</li>
                <li>• 支持批量处理多个图片</li>
                <li>• 可单独复制或批量下载</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>注意:</strong> Base64 编码会增加约 33% 的文件大小。大图片转换后的字符串会很长，建议用于小图标或小图片。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
