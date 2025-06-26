'use client'

import React, { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download, Image as ImageIcon, FileImage } from 'lucide-react'

/**
 * 图片压缩工具组件
 * 客户端压缩JPG/PNG/WebP
 */
export default function ImageCompressTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [compressedDataUrl, setCompressedDataUrl] = useState<string>('')
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [quality, setQuality] = useState<number>(0.8)
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  /**
   * 处理文件上传
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    setOriginalFile(file)
    setOriginalSize(file.size)
    setCompressedDataUrl('')
    setCompressedSize(0)
  }, [])

  /**
   * 压缩图片
   */
  const compressImage = useCallback(async () => {
    if (!originalFile) return

    setIsProcessing(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 设置画布尺寸
        canvas.width = img.width
        canvas.height = img.height

        // 绘制图片
        ctx?.drawImage(img, 0, 0)

        // 转换为指定格式和质量
        const mimeType = `image/${format}`
        const dataUrl = canvas.toDataURL(mimeType, quality)
        
        setCompressedDataUrl(dataUrl)
        
        // 计算压缩后大小
        const base64Length = dataUrl.split(',')[1].length
        const sizeInBytes = (base64Length * 3) / 4
        setCompressedSize(Math.round(sizeInBytes))
        
        setIsProcessing(false)
      }

      img.onerror = () => {
        alert('图片加载失败')
        setIsProcessing(false)
      }

      // 读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(originalFile)

    } catch (error) {
      console.error('压缩失败:', error)
      alert('压缩失败，请重试')
      setIsProcessing(false)
    }
  }, [originalFile, quality, format])

  /**
   * 下载压缩后的图片
   */
  const downloadCompressed = useCallback(() => {
    if (!compressedDataUrl) return

    const link = document.createElement('a')
    link.download = `compressed_${originalFile?.name?.split('.')[0] || 'image'}.${format}`
    link.href = compressedDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [compressedDataUrl, originalFile, format])

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 计算压缩率
   */
  const compressionRatio = originalSize > 0 && compressedSize > 0 
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0

  return (
    <ToolLayout
      title="图片压缩"
      description="客户端压缩JPG/PNG/WebP"
      category="图片多媒体"
      icon="🗜️"
    >
      <div className="space-y-6">
        {/* 文件上传区域 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  点击选择图片或拖拽到此处
                </p>
                <p className="text-sm text-gray-500">
                  支持 JPG、PNG、WebP 格式
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* 原始图片信息 */}
        {originalFile && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">原始图片信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">文件名:</span>
                <div className="font-medium">{originalFile.name}</div>
              </div>
              <div>
                <span className="text-gray-600">文件大小:</span>
                <div className="font-medium">{formatFileSize(originalSize)}</div>
              </div>
              <div>
                <span className="text-gray-600">文件类型:</span>
                <div className="font-medium">{originalFile.type}</div>
              </div>
            </div>
          </div>
        )}

        {/* 压缩设置 */}
        {originalFile && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">压缩设置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输出格式
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  压缩质量: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>最小</span>
                  <span>最大</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={compressImage}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileImage className="w-5 h-5" />
                {isProcessing ? '压缩中...' : '开始压缩'}
              </button>
            </div>
          </div>
        )}

        {/* 压缩结果 */}
        {compressedDataUrl && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">压缩结果</h3>
              <button
                onClick={downloadCompressed}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                下载
              </button>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">
                  {formatFileSize(originalSize)}
                </div>
                <div className="text-sm text-blue-800">原始大小</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  {formatFileSize(compressedSize)}
                </div>
                <div className="text-sm text-green-800">压缩后大小</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600">
                  {compressionRatio}%
                </div>
                <div className="text-sm text-purple-800">压缩率</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-semibold text-orange-600">
                  {format.toUpperCase()}
                </div>
                <div className="text-sm text-orange-800">输出格式</div>
              </div>
            </div>

            {/* 预览图片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">原始图片</h4>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <img
                    src={URL.createObjectURL(originalFile!)}
                    alt="原始图片"
                    className="w-full h-48 object-contain"
                  />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">压缩后图片</h4>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <img
                    src={compressedDataUrl}
                    alt="压缩后图片"
                    className="w-full h-48 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 支持 JPG、PNG、WebP 格式的图片压缩</li>
            <li>• 可调整压缩质量和输出格式</li>
            <li>• 所有处理都在浏览器端完成，保护隐私</li>
            <li>• 实时预览压缩效果和文件大小对比</li>
            <li>• 一键下载压缩后的图片</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
