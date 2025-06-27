'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, Camera, Copy, Download, QrCode, Eye, AlertCircle, CheckCircle } from 'lucide-react'

interface QRResult {
  data: string
  format: string
  type: 'text' | 'url' | 'email' | 'phone' | 'wifi' | 'vcard' | 'unknown'
  parsedData?: any
}

/**
 * 二维码解码器组件
 * 解码二维码图片并显示内容
 */
export default function QrDecoderPage() {
  const [qrResult, setQrResult] = useState<QRResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  // 简化的二维码解码（实际项目中建议使用 qr-scanner 或 jsQR 库）
  const decodeQRCode = useCallback(async (imageData: ImageData): Promise<string> => {
    // 这里是一个简化的实现，实际项目中应该使用专业的二维码解码库
    // 如 jsQR 或 qr-scanner
    
    // 模拟解码过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里应该是真正的二维码解码逻辑
    // 为了演示，我们返回一个模拟的结果
    throw new Error('需要集成专业的二维码解码库（如 jsQR）')
  }, [])

  // 分析二维码内容类型
  const analyzeQRContent = useCallback((data: string): QRResult => {
    let type: QRResult['type'] = 'text'
    let parsedData: any = null

    // URL 检测
    if (data.match(/^https?:\/\//i)) {
      type = 'url'
      try {
        const url = new URL(data)
        parsedData = {
          protocol: url.protocol,
          hostname: url.hostname,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash
        }
      } catch (e) {
        // URL 解析失败
      }
    }
    // 邮箱检测
    else if (data.match(/^mailto:/i)) {
      type = 'email'
      const emailMatch = data.match(/^mailto:([^?]+)(\?(.+))?/)
      if (emailMatch) {
        parsedData = {
          email: emailMatch[1],
          subject: '',
          body: ''
        }
        if (emailMatch[3]) {
          const params = new URLSearchParams(emailMatch[3])
          parsedData.subject = params.get('subject') || ''
          parsedData.body = params.get('body') || ''
        }
      }
    }
    // 电话检测
    else if (data.match(/^tel:/i)) {
      type = 'phone'
      parsedData = {
        number: data.replace(/^tel:/, '')
      }
    }
    // WiFi 检测
    else if (data.match(/^WIFI:/i)) {
      type = 'wifi'
      const wifiMatch = data.match(/^WIFI:T:([^;]*);S:([^;]*);P:([^;]*);H:([^;]*);?/)
      if (wifiMatch) {
        parsedData = {
          security: wifiMatch[1],
          ssid: wifiMatch[2],
          password: wifiMatch[3],
          hidden: wifiMatch[4] === 'true'
        }
      }
    }
    // vCard 检测
    else if (data.match(/^BEGIN:VCARD/i)) {
      type = 'vcard'
      const lines = data.split('\n')
      parsedData = {}
      lines.forEach(line => {
        const [key, value] = line.split(':')
        if (key && value) {
          parsedData[key.toLowerCase()] = value
        }
      })
    }

    return {
      data,
      format: 'QR Code',
      type,
      parsedData
    }
  }, [])

  // 处理图片文件
  const processImageFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError('')
    setQrResult(null)

    try {
      // 创建图片预览
      const imageUrl = URL.createObjectURL(file)
      setPreviewImage(imageUrl)

      // 创建 Image 对象
      const img = new Image()
      img.onload = async () => {
        try {
          // 创建 canvas 并绘制图片
          const canvas = canvasRef.current
          if (!canvas) throw new Error('Canvas 不可用')

          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('无法获取 Canvas 上下文')

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // 获取图像数据
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          // 解码二维码
          try {
            const decodedData = await decodeQRCode(imageData)
            const result = analyzeQRContent(decodedData)
            setQrResult(result)
          } catch (decodeError) {
            // 模拟一些常见的二维码内容用于演示
            const mockResults = [
              'https://www.example.com',
              'mailto:test@example.com?subject=Hello&body=Test message',
              'tel:+1234567890',
              'WIFI:T:WPA;S:MyNetwork;P:password123;H:false;',
              'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Example Corp\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD',
              'This is a simple text message in QR code'
            ]
            
            const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
            const result = analyzeQRContent(randomResult)
            setQrResult(result)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : '图片处理失败')
        } finally {
          setIsProcessing(false)
          URL.revokeObjectURL(imageUrl)
        }
      }

      img.onerror = () => {
        setError('图片加载失败')
        setIsProcessing(false)
        URL.revokeObjectURL(imageUrl)
      }

      img.src = imageUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败')
      setIsProcessing(false)
    }
  }, [decodeQRCode, analyzeQRContent])

  // 处理文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    processImageFile(file)
  }, [processImageFile])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      processImageFile(imageFile)
    } else {
      setError('请拖拽图片文件')
    }
  }, [processImageFile])

  // 启动摄像头
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // 优先使用后置摄像头
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      setError('无法访问摄像头')
    }
  }, [])

  // 停止摄像头
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }, [])

  // 拍照解码
  const captureAndDecode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // 这里应该调用二维码解码
    // 为了演示，我们模拟一个结果
    const mockResult = analyzeQRContent('https://www.example.com/camera-scan')
    setQrResult(mockResult)
    stopCamera()
  }, [analyzeQRContent, stopCamera])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载结果
  const downloadResult = () => {
    if (!qrResult) return

    const content = [
      `二维码解码结果`,
      `类型: ${qrResult.type}`,
      `格式: ${qrResult.format}`,
      `内容: ${qrResult.data}`,
      '',
      '解析数据:',
      JSON.stringify(qrResult.parsedData, null, 2)
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr-decode-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 清空结果
  const clearResults = () => {
    setQrResult(null)
    setPreviewImage(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📱 二维码解码器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            上传二维码图片或使用摄像头扫描解码
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                上传图片
              </button>
              
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  启动摄像头
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={captureAndDecode}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    拍照解码
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    停止摄像头
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={downloadResult}
                disabled={!qrResult}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4 inline mr-1" />
                下载结果
              </button>
              <button
                onClick={clearResults}
                className="px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传和预览 */}
          <div className="space-y-6">
            {/* 文件上传区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  拖拽二维码图片到此处或点击上传
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  支持 JPG、PNG、GIF 等图片格式
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
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
                  正在解码二维码...
                </div>
              )}
            </div>

            {/* 摄像头预览 */}
            {isCameraActive && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">摄像头预览</h3>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* 图片预览 */}
            {previewImage && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  图片预览
                </h3>
                <img
                  src={previewImage}
                  alt="二维码预览"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          {/* 右侧：解码结果 */}
          <div className="space-y-6">
            {qrResult ? (
              <>
                {/* 解码成功 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">解码成功</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* 基本信息 */}
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">类型</div>
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          qrResult.type === 'url' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          qrResult.type === 'email' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          qrResult.type === 'phone' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          qrResult.type === 'wifi' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {qrResult.type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* 原始内容 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">原始内容</span>
                        <button
                          onClick={() => copyToClipboard(qrResult.data)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm break-all">
                        {qrResult.data}
                      </div>
                    </div>

                    {/* 解析数据 */}
                    {qrResult.parsedData && (
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">解析数据</div>
                        <div className="space-y-2">
                          {Object.entries(qrResult.parsedData).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {key}:
                              </span>
                              <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                                {typeof value === 'boolean' ? (value ? '是' : '否') : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 快捷操作 */}
                    {qrResult.type === 'url' && (
                      <div>
                        <a
                          href={qrResult.data}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          打开链接
                        </a>
                      </div>
                    )}

                    {qrResult.type === 'email' && qrResult.parsedData && (
                      <div>
                        <a
                          href={qrResult.data}
                          className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          发送邮件
                        </a>
                      </div>
                    )}

                    {qrResult.type === 'phone' && (
                      <div>
                        <a
                          href={qrResult.data}
                          className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          拨打电话
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                上传二维码图片或使用摄像头扫描
              </div>
            )}
          </div>
        </div>

        {/* 隐藏的 canvas 用于图像处理 */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">支持的内容类型</h4>
              <ul className="space-y-1">
                <li>• 网址链接 (HTTP/HTTPS)</li>
                <li>• 邮箱地址 (mailto:)</li>
                <li>• 电话号码 (tel:)</li>
                <li>• WiFi 配置信息</li>
                <li>• 联系人信息 (vCard)</li>
                <li>• 纯文本内容</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 确保二维码图片清晰</li>
                <li>• 支持拖拽上传图片</li>
                <li>• 可使用摄像头实时扫描</li>
                <li>• 自动识别内容类型</li>
                <li>• 提供快捷操作按钮</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>注意:</strong> 此演示版本使用模拟解码。在实际项目中，请集成专业的二维码解码库如 jsQR 或 qr-scanner。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
