'use client'

import React, { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download, RotateCcw, Lock, Unlock } from 'lucide-react'

/**
 * 图片尺寸调整工具组件
 * 调整图片尺寸大小
 */
export default function ImageResizeTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const [newWidth, setNewWidth] = useState<number>(0)
  const [newHeight, setNewHeight] = useState<number>(0)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true)
  const [resizedDataUrl, setResizedDataUrl] = useState<string>('')
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
    setResizedDataUrl('')

    // 获取图片尺寸
    const img = new Image()
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height })
      setNewWidth(img.width)
      setNewHeight(img.height)
    }
    img.src = URL.createObjectURL(file)
  }, [])

  /**
   * 处理宽度变化
   */
  const handleWidthChange = useCallback((width: number) => {
    setNewWidth(width)
    if (maintainAspectRatio && originalDimensions.width > 0) {
      const aspectRatio = originalDimensions.height / originalDimensions.width
      setNewHeight(Math.round(width * aspectRatio))
    }
  }, [maintainAspectRatio, originalDimensions])

  /**
   * 处理高度变化
   */
  const handleHeightChange = useCallback((height: number) => {
    setNewHeight(height)
    if (maintainAspectRatio && originalDimensions.height > 0) {
      const aspectRatio = originalDimensions.width / originalDimensions.height
      setNewWidth(Math.round(height * aspectRatio))
    }
  }, [maintainAspectRatio, originalDimensions])

  /**
   * 重置尺寸
   */
  const resetDimensions = useCallback(() => {
    setNewWidth(originalDimensions.width)
    setNewHeight(originalDimensions.height)
  }, [originalDimensions])

  /**
   * 应用预设尺寸
   */
  const applyPreset = useCallback((width: number, height: number) => {
    if (maintainAspectRatio) {
      const originalRatio = originalDimensions.width / originalDimensions.height
      const presetRatio = width / height
      
      if (originalRatio > presetRatio) {
        // 原图更宽，以宽度为准
        setNewWidth(width)
        setNewHeight(Math.round(width / originalRatio))
      } else {
        // 原图更高，以高度为准
        setNewHeight(height)
        setNewWidth(Math.round(height * originalRatio))
      }
    } else {
      setNewWidth(width)
      setNewHeight(height)
    }
  }, [maintainAspectRatio, originalDimensions])

  /**
   * 调整图片尺寸
   */
  const resizeImage = useCallback(async () => {
    if (!originalFile || newWidth <= 0 || newHeight <= 0) return

    setIsProcessing(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = newWidth
        canvas.height = newHeight

        // 使用高质量缩放
        ctx!.imageSmoothingEnabled = true
        ctx!.imageSmoothingQuality = 'high'
        
        ctx?.drawImage(img, 0, 0, newWidth, newHeight)
        
        const dataUrl = canvas.toDataURL('image/png')
        setResizedDataUrl(dataUrl)
        setIsProcessing(false)
      }

      img.onerror = () => {
        alert('图片加载失败')
        setIsProcessing(false)
      }

      img.src = URL.createObjectURL(originalFile)

    } catch (error) {
      console.error('调整失败:', error)
      alert('调整失败，请重试')
      setIsProcessing(false)
    }
  }, [originalFile, newWidth, newHeight])

  /**
   * 下载调整后的图片
   */
  const downloadResized = useCallback(() => {
    if (!resizedDataUrl) return

    const link = document.createElement('a')
    link.download = `resized_${newWidth}x${newHeight}_${originalFile?.name || 'image.png'}`
    link.href = resizedDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [resizedDataUrl, newWidth, newHeight, originalFile])

  // 常用尺寸预设
  const presets = [
    { name: 'HD', width: 1920, height: 1080 },
    { name: '4K', width: 3840, height: 2160 },
    { name: 'Instagram正方形', width: 1080, height: 1080 },
    { name: 'Instagram故事', width: 1080, height: 1920 },
    { name: 'Facebook封面', width: 1200, height: 630 },
    { name: 'Twitter头像', width: 400, height: 400 },
    { name: '微信头像', width: 640, height: 640 },
    { name: '网站横幅', width: 1200, height: 300 }
  ]

  return (
    <ToolLayout
      title="图片尺寸调整"
      description="调整图片尺寸大小"
      category="图片多媒体"
      icon="📏"
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
                  支持所有常见图片格式
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
                <span className="text-gray-600">尺寸:</span>
                <div className="font-medium">
                  {originalDimensions.width} × {originalDimensions.height} px
                </div>
              </div>
              <div>
                <span className="text-gray-600">宽高比:</span>
                <div className="font-medium">
                  {originalDimensions.width > 0 ? 
                    (originalDimensions.width / originalDimensions.height).toFixed(2) : 
                    '0'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 尺寸调整设置 */}
        {originalFile && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">尺寸设置</h3>
            
            <div className="space-y-4">
              {/* 宽高输入 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    宽度 (px)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    高度 (px)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      maintainAspectRatio 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    title={maintainAspectRatio ? '已锁定宽高比' : '未锁定宽高比'}
                  >
                    {maintainAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    锁定比例
                  </button>
                  <button
                    onClick={resetDimensions}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重置
                  </button>
                </div>
              </div>

              {/* 预设尺寸 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">常用尺寸</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {presets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPreset(preset.width, preset.height)}
                      className="p-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-left"
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-gray-500">
                        {preset.width} × {preset.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 调整按钮 */}
              <div>
                <button
                  onClick={resizeImage}
                  disabled={isProcessing || newWidth <= 0 || newHeight <= 0}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '处理中...' : '调整尺寸'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 调整结果 */}
        {resizedDataUrl && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">调整结果</h3>
              <button
                onClick={downloadResized}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                下载
              </button>
            </div>

            {/* 对比信息 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">
                  {originalDimensions.width} × {originalDimensions.height}
                </div>
                <div className="text-sm text-blue-800">原始尺寸</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  {newWidth} × {newHeight}
                </div>
                <div className="text-sm text-green-800">调整后尺寸</div>
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">调整后图片</h4>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <img
                    src={resizedDataUrl}
                    alt="调整后图片"
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
            <li>• 支持所有常见图片格式的尺寸调整</li>
            <li>• 可选择是否保持原始宽高比</li>
            <li>• 提供常用尺寸预设，适用于社交媒体等场景</li>
            <li>• 使用高质量缩放算法，保证图片清晰度</li>
            <li>• 所有处理都在浏览器端完成，保护隐私</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
