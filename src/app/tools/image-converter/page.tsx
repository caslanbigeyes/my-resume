'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, Settings, RefreshCw } from 'lucide-react'

interface ConversionTask {
  id: string
  file: File
  originalFormat: string
  targetFormat: string
  quality: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  result?: Blob
  error?: string
  originalSize: number
  convertedSize?: number
}

interface ConversionOptions {
  format: 'jpeg' | 'png' | 'webp' | 'bmp'
  quality: number
  width?: number
  height?: number
  maintainAspectRatio: boolean
}

/**
 * 图片格式转换工具组件
 * 转换图片格式并调整质量
 */
export default function ImageConverterPage() {
  const [tasks, setTasks] = useState<ConversionTask[]>([])
  const [options, setOptions] = useState<ConversionOptions>({
    format: 'jpeg',
    quality: 90,
    maintainAspectRatio: true
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 支持的格式
  const supportedFormats = [
    { value: 'jpeg', label: 'JPEG', description: '有损压缩，适合照片' },
    { value: 'png', label: 'PNG', description: '无损压缩，支持透明' },
    { value: 'webp', label: 'WebP', description: '现代格式，压缩率高' },
    { value: 'bmp', label: 'BMP', description: '位图格式，无压缩' }
  ]

  // 获取文件格式
  const getFileFormat = useCallback((file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg'
      case 'png':
        return 'png'
      case 'webp':
        return 'webp'
      case 'bmp':
        return 'bmp'
      case 'gif':
        return 'gif'
      default:
        return 'unknown'
    }
  }, [])

  // 转换图片
  const convertImage = useCallback(async (task: ConversionTask): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) {
          reject(new Error('Canvas not available'))
          return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // 计算目标尺寸
        let { width, height } = img
        if (options.width || options.height) {
          if (options.maintainAspectRatio) {
            const aspectRatio = width / height
            if (options.width && options.height) {
              // 如果同时指定宽高，选择较小的缩放比例
              const scaleX = options.width / width
              const scaleY = options.height / height
              const scale = Math.min(scaleX, scaleY)
              width = width * scale
              height = height * scale
            } else if (options.width) {
              width = options.width
              height = width / aspectRatio
            } else if (options.height) {
              height = options.height
              width = height * aspectRatio
            }
          } else {
            width = options.width || width
            height = options.height || height
          }
        }

        // 设置画布尺寸
        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换格式
        const mimeType = `image/${task.targetFormat}`
        const quality = task.quality / 100

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert image'))
            }
          },
          mimeType,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = URL.createObjectURL(task.file)
    })
  }, [options])

  // 处理文件上传
  const handleFileUpload = useCallback((files: FileList) => {
    const newTasks: ConversionTask[] = []

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const originalFormat = getFileFormat(file)
        if (originalFormat !== 'unknown') {
          const task: ConversionTask = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            originalFormat,
            targetFormat: options.format,
            quality: options.quality,
            status: 'pending',
            originalSize: file.size
          }
          newTasks.push(task)
        }
      }
    })

    setTasks(prev => [...newTasks, ...prev])
  }, [getFileFormat, options.format, options.quality])

  // 处理单个任务
  const processTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'processing' } : task
    ))

    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')

      const result = await convertImage(task)
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: 'completed', 
          result,
          convertedSize: result.size
        } : t
      ))
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Conversion failed'
        } : t
      ))
    }
  }, [tasks, convertImage])

  // 处理所有任务
  const processAllTasks = useCallback(async () => {
    setIsProcessing(true)
    const pendingTasks = tasks.filter(task => task.status === 'pending')
    
    for (const task of pendingTasks) {
      await processTask(task.id)
    }
    
    setIsProcessing(false)
  }, [tasks, processTask])

  // 下载转换后的文件
  const downloadFile = useCallback((task: ConversionTask) => {
    if (!task.result) return

    const url = URL.createObjectURL(task.result)
    const a = document.createElement('a')
    a.href = url
    a.download = `${task.file.name.replace(/\.[^/.]+$/, '')}.${task.targetFormat}`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // 下载所有文件
  const downloadAll = useCallback(() => {
    const completedTasks = tasks.filter(task => task.status === 'completed' && task.result)
    completedTasks.forEach(task => downloadFile(task))
  }, [tasks, downloadFile])

  // 清空任务列表
  const clearTasks = useCallback(() => {
    setTasks([])
  }, [])

  // 移除任务
  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }, [])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }, [handleFileUpload])

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 计算压缩率
  const getCompressionRatio = (original: number, converted: number): string => {
    if (!converted) return '-'
    const ratio = ((original - converted) / original) * 100
    return ratio > 0 ? `-${ratio.toFixed(1)}%` : `+${Math.abs(ratio).toFixed(1)}%`
  }

  // 获取状态颜色
  const getStatusColor = (status: ConversionTask['status']): string => {
    switch (status) {
      case 'pending': return 'text-gray-500'
      case 'processing': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  // 获取状态文本
  const getStatusText = (status: ConversionTask['status']): string => {
    switch (status) {
      case 'pending': return '等待中'
      case 'processing': return '转换中'
      case 'completed': return '已完成'
      case 'error': return '转换失败'
      default: return '未知'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🖼️ 图片格式转换
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            转换图片格式并调整质量和尺寸
          </p>
        </div>

        {/* 设置面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            转换设置
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 目标格式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                目标格式
              </label>
              <select
                value={options.format}
                onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {supportedFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {supportedFormats.find(f => f.value === options.format)?.description}
              </p>
            </div>

            {/* 质量 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                质量: {options.quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={options.quality}
                onChange={(e) => setOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>低</span>
                <span>高</span>
              </div>
            </div>

            {/* 宽度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                宽度 (px)
              </label>
              <input
                type="number"
                value={options.width || ''}
                onChange={(e) => setOptions(prev => ({ ...prev, width: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="自动"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 高度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                高度 (px)
              </label>
              <input
                type="number"
                value={options.height || ''}
                onChange={(e) => setOptions(prev => ({ ...prev, height: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="自动"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.maintainAspectRatio}
                onChange={(e) => setOptions(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">保持宽高比</span>
            </label>
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
                拖拽图片到此处或点击上传
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                支持 JPG、PNG、WebP、BMP 格式
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 任务列表 */}
        {tasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  转换任务 ({tasks.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={processAllTasks}
                    disabled={isProcessing || !tasks.some(t => t.status === 'pending')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                    {isProcessing ? '转换中...' : '开始转换'}
                  </button>
                  <button
                    onClick={downloadAll}
                    disabled={!tasks.some(t => t.status === 'completed')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    下载全部
                  </button>
                  <button
                    onClick={clearTasks}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {task.file.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {task.originalFormat.toUpperCase()} → {task.targetFormat.toUpperCase()} • 
                        {formatFileSize(task.originalSize)}
                        {task.convertedSize && (
                          <span>
                            {' → '}{formatFileSize(task.convertedSize)}
                            <span className="ml-1 text-blue-600 dark:text-blue-400">
                              ({getCompressionRatio(task.originalSize, task.convertedSize)})
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </div>

                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => processTask(task.id)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          转换
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <button
                          onClick={() => downloadFile(task)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          下载
                        </button>
                      )}
                      <button
                        onClick={() => removeTask(task.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 隐藏的 canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">支持格式</h4>
              <ul className="space-y-1">
                <li>• <strong>JPEG:</strong> 适合照片，有损压缩</li>
                <li>• <strong>PNG:</strong> 支持透明，无损压缩</li>
                <li>• <strong>WebP:</strong> 现代格式，压缩率高</li>
                <li>• <strong>BMP:</strong> 位图格式，无压缩</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 质量设置仅对 JPEG 和 WebP 有效</li>
                <li>• 转换为 JPEG 会丢失透明度</li>
                <li>• 建议备份原始文件</li>
                <li>• 批量转换可能需要较长时间</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
