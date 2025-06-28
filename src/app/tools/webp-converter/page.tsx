'use client'

import React, { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download, Image as ImageIcon, Settings, FileImage } from 'lucide-react'

/**
 * WebP图片转换工具组件
 * 将WebP格式转换为JPG或PNG格式
 */
export default function WebpConverterTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>('')
  const [convertedImage, setConvertedImage] = useState<string>('')
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg')
  const [quality, setQuality] = useState(90)
  const [isConverting, setIsConverting] = useState(false)
  const [fileInfo, setFileInfo] = useState<{
    originalSize: number
    convertedSize: number
    compressionRatio: number
  } | null>(null)

  /**
   * 处理文件上传
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.includes('webp')) {
      alert('请选择WebP格式的图片文件')
      return
    }

    setOriginalFile(file)
    
    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 重置转换结果
    setConvertedImage('')
    setFileInfo(null)
  }, [])

  /**
   * 转换图片格式
   */
  const convertImage = useCallback(async () => {
    if (!originalFile || !originalPreview) return

    setIsConverting(true)

    try {
      // 创建canvas元素
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建canvas上下文')

      // 创建图片对象
      const img = new Image()
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = originalPreview
      })

      // 设置canvas尺寸
      canvas.width = img.width
      canvas.height = img.height

      // 绘制图片到canvas
      ctx.drawImage(img, 0, 0)

      // 转换为目标格式
      const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
      const qualityValue = outputFormat === 'jpeg' ? quality / 100 : 1

      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('转换失败')
        }

        // 创建转换后的图片URL
        const convertedUrl = URL.createObjectURL(blob)
        setConvertedImage(convertedUrl)

        // 计算文件信息
        const originalSize = originalFile.size
        const convertedSize = blob.size
        const compressionRatio = ((originalSize - convertedSize) / originalSize) * 100

        setFileInfo({
          originalSize,
          convertedSize,
          compressionRatio
        })

      }, mimeType, qualityValue)

    } catch (error) {
      console.error('转换失败:', error)
      alert('图片转换失败，请重试')
    } finally {
      setIsConverting(false)
    }
  }, [originalFile, originalPreview, outputFormat, quality])

  /**
   * 下载转换后的图片
   */
  const downloadImage = useCallback(() => {
    if (!convertedImage || !originalFile) return

    const link = document.createElement('a')
    link.href = convertedImage
    
    // 生成文件名
    const originalName = originalFile.name.replace(/\.[^/.]+$/, '')
    const extension = outputFormat === 'jpeg' ? 'jpg' : 'png'
    link.download = `${originalName}_converted.${extension}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [convertedImage, originalFile, outputFormat])

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
   * 重置工具
   */
  const resetTool = () => {
    setOriginalFile(null)
    setOriginalPreview('')
    setConvertedImage('')
    setFileInfo(null)
    
    // 清理URL对象
    if (originalPreview) URL.revokeObjectURL(originalPreview)
    if (convertedImage) URL.revokeObjectURL(convertedImage)
  }

  return (
    <ToolLayout
      title="WebP图片转换"
      description="将WebP格式图片转换为JPG或PNG格式"
      category="图片多媒体"
      icon="🔄"
    >
      <div className="space-y-6">
        {/* 文件上传区域 */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            上传WebP图片
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".webp,image/webp"
              onChange={handleFileUpload}
              className="hidden"
              id="webp-upload"
            />
            <label
              htmlFor="webp-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <FileImage className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  点击选择WebP图片
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  支持 .webp 格式文件
                </p>
              </div>
            </label>
          </div>

          {originalFile && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{originalFile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    大小: {formatFileSize(originalFile.size)}
                  </p>
                </div>
                <button
                  onClick={resetTool}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  重新选择
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 转换设置 */}
        {originalFile && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              转换设置
            </h3>

            <div className="space-y-4">
              {/* 输出格式选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  输出格式
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="jpeg"
                      checked={outputFormat === 'jpeg'}
                      onChange={(e) => setOutputFormat(e.target.value as 'jpeg')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">JPG (更小文件)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="png"
                      checked={outputFormat === 'png'}
                      onChange={(e) => setOutputFormat(e.target.value as 'png')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">PNG (透明背景)</span>
                  </label>
                </div>
              </div>

              {/* 质量设置 (仅JPG格式) */}
              {outputFormat === 'jpeg' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    图片质量: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>低质量 (小文件)</span>
                    <span>高质量 (大文件)</span>
                  </div>
                </div>
              )}

              {/* 转换按钮 */}
              <button
                onClick={convertImage}
                disabled={isConverting}
                className="w-full px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isConverting ? '转换中...' : `转换为 ${outputFormat.toUpperCase()}`}
              </button>
            </div>
          </div>
        )}

        {/* 预览和结果 */}
        {originalPreview && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 原图预览 */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">原图 (WebP)</h3>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <img
                  src={originalPreview}
                  alt="原图预览"
                  className="w-full h-auto max-h-64 object-contain bg-gray-50 dark:bg-gray-700"
                />
              </div>
            </div>

            {/* 转换结果 */}
            {convertedImage && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  转换结果 ({outputFormat.toUpperCase()})
                </h3>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden mb-4">
                  <img
                    src={convertedImage}
                    alt="转换结果"
                    className="w-full h-auto max-h-64 object-contain bg-gray-50 dark:bg-gray-700"
                  />
                </div>
                
                <button
                  onClick={downloadImage}
                  className="w-full px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载图片
                </button>
              </div>
            )}
          </div>
        )}

        {/* 文件信息对比 */}
        {fileInfo && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              文件信息对比
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">原始大小</div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-300">
                  {formatFileSize(fileInfo.originalSize)}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-green-600 dark:text-green-400 mb-1">转换后大小</div>
                <div className="text-lg font-bold text-green-800 dark:text-green-300">
                  {formatFileSize(fileInfo.convertedSize)}
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                  {fileInfo.compressionRatio > 0 ? '压缩率' : '增加率'}
                </div>
                <div className="text-lg font-bold text-purple-800 dark:text-purple-300">
                  {Math.abs(fileInfo.compressionRatio).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 选择WebP格式的图片文件进行上传</li>
            <li>• 选择输出格式：JPG (文件更小) 或 PNG (支持透明)</li>
            <li>• JPG格式可调整质量，影响文件大小和图片清晰度</li>
            <li>• PNG格式保持原始质量，适合需要透明背景的图片</li>
            <li>• 转换完成后可直接下载结果图片</li>
            <li>• 所有处理都在浏览器本地完成，保护隐私安全</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
