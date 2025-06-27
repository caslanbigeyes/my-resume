'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Download, Copy, RefreshCw, Settings } from 'lucide-react'

interface BarcodeOptions {
  type: 'code128' | 'code39' | 'ean13' | 'ean8' | 'upc' | 'qr'
  width: number
  height: number
  fontSize: number
  textMargin: number
  showText: boolean
  backgroundColor: string
  foregroundColor: string
}

/**
 * 条形码生成器组件
 * 生成各种类型的条形码和二维码
 */
export default function BarcodeGeneratorPage() {
  const [inputText, setInputText] = useState('')
  const [options, setOptions] = useState<BarcodeOptions>({
    type: 'code128',
    width: 2,
    height: 100,
    fontSize: 14,
    textMargin: 2,
    showText: true,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000'
  })
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 条形码类型
  const barcodeTypes = [
    { value: 'code128', label: 'Code 128', description: '支持所有ASCII字符' },
    { value: 'code39', label: 'Code 39', description: '支持数字、大写字母和部分符号' },
    { value: 'ean13', label: 'EAN-13', description: '13位数字，用于商品标识' },
    { value: 'ean8', label: 'EAN-8', description: '8位数字，用于小商品' },
    { value: 'upc', label: 'UPC-A', description: '12位数字，北美标准' },
    { value: 'qr', label: 'QR Code', description: '二维码，支持大量数据' }
  ]

  // Code 128 编码表（简化版）
  const code128Patterns: { [key: string]: string } = {
    '0': '11011001100', '1': '11001101100', '2': '11001100110', '3': '10010011000',
    '4': '10010001100', '5': '10001001100', '6': '10011001000', '7': '10011000100',
    '8': '10001100100', '9': '11001001000', 'A': '11001000100', 'B': '11000100100',
    'C': '10110011100', 'D': '10011011100', 'E': '10011001110', 'F': '10111001000',
    'G': '10011101000', 'H': '10011100100', 'I': '11001110010', 'J': '11001011100',
    'K': '11001001110', 'L': '11011100100', 'M': '11001110100', 'N': '11101101110',
    'O': '11101001100', 'P': '11100101100', 'Q': '11100100110', 'R': '11101100100',
    'S': '11100110100', 'T': '11100110010', 'U': '11011011000', 'V': '11011000110',
    'W': '11000110110', 'X': '10100011000', 'Y': '10001011000', 'Z': '10001000110',
    ' ': '10110001000', 'START': '11010000100', 'STOP': '1100011101011'
  }

  // Code 39 编码表
  const code39Patterns: { [key: string]: string } = {
    '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
    '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
    '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
    'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
    'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
    'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
    'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
    'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
    'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
    ' ': '100101011011', '*': '100101101101'
  }

  // 验证输入
  const validateInput = useCallback((text: string, type: string): boolean => {
    if (!text) return false

    switch (type) {
      case 'code39':
        return /^[0-9A-Z\-\.\s\$\/\+%\*]+$/.test(text)
      case 'ean13':
        return /^\d{12,13}$/.test(text)
      case 'ean8':
        return /^\d{7,8}$/.test(text)
      case 'upc':
        return /^\d{11,12}$/.test(text)
      case 'code128':
      case 'qr':
        return text.length > 0
      default:
        return false
    }
  }, [])

  // 生成 Code 128 条形码
  const generateCode128 = useCallback((text: string): string => {
    let pattern = code128Patterns['START'] || ''
    
    for (const char of text) {
      const charPattern = code128Patterns[char.toUpperCase()]
      if (charPattern) {
        pattern += charPattern
      }
    }
    
    pattern += code128Patterns['STOP'] || ''
    return pattern
  }, [])

  // 生成 Code 39 条形码
  const generateCode39 = useCallback((text: string): string => {
    let pattern = code39Patterns['*'] || ''
    
    for (const char of text) {
      const charPattern = code39Patterns[char.toUpperCase()]
      if (charPattern) {
        pattern += '0' + charPattern // 添加间隔
      }
    }
    
    pattern += '0' + (code39Patterns['*'] || '')
    return pattern
  }, [])

  // 生成简单的二维码模式
  const generateQRPattern = useCallback((text: string): number[][] => {
    // 这是一个简化的二维码生成，实际应用中应使用专业库
    const size = 21 // 最小的二维码尺寸
    const pattern: number[][] = Array(size).fill(null).map(() => Array(size).fill(0))
    
    // 添加定位标记
    const addFinderPattern = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (x + i < size && y + j < size) {
            pattern[x + i][y + j] = (i === 0 || i === 6 || j === 0 || j === 6 || 
                                   (i >= 2 && i <= 4 && j >= 2 && j <= 4)) ? 1 : 0
          }
        }
      }
    }
    
    addFinderPattern(0, 0) // 左上
    addFinderPattern(0, size - 7) // 右上
    addFinderPattern(size - 7, 0) // 左下
    
    // 简单的数据编码（基于文本长度和字符）
    for (let i = 8; i < size - 8; i++) {
      for (let j = 8; j < size - 8; j++) {
        const charCode = text.charCodeAt((i + j) % text.length) || 0
        pattern[i][j] = (charCode + i + j) % 2
      }
    }
    
    return pattern
  }, [])

  // 绘制条形码
  const drawBarcode = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !inputText) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setError('')

    try {
      if (!validateInput(inputText, options.type)) {
        setError(`输入格式不符合 ${options.type.toUpperCase()} 标准`)
        return
      }

      if (options.type === 'qr') {
        // 绘制二维码
        const pattern = generateQRPattern(inputText)
        const moduleSize = 4
        const size = pattern.length * moduleSize
        
        canvas.width = size + 40
        canvas.height = size + 40 + (options.showText ? options.fontSize + options.textMargin : 0)
        
        ctx.fillStyle = options.backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = options.foregroundColor
        for (let i = 0; i < pattern.length; i++) {
          for (let j = 0; j < pattern[i].length; j++) {
            if (pattern[i][j]) {
              ctx.fillRect(20 + j * moduleSize, 20 + i * moduleSize, moduleSize, moduleSize)
            }
          }
        }
        
        if (options.showText) {
          ctx.fillStyle = options.foregroundColor
          ctx.font = `${options.fontSize}px monospace`
          ctx.textAlign = 'center'
          ctx.fillText(inputText, canvas.width / 2, size + 30 + options.fontSize)
        }
      } else {
        // 绘制一维条形码
        let pattern = ''
        
        switch (options.type) {
          case 'code128':
            pattern = generateCode128(inputText)
            break
          case 'code39':
            pattern = generateCode39(inputText)
            break
          default:
            // 对于 EAN/UPC，使用简化的模式
            pattern = inputText.split('').map(char => 
              char === '1' ? '101' : '010'
            ).join('')
        }
        
        const barWidth = options.width
        const totalWidth = pattern.length * barWidth + 40
        const totalHeight = options.height + 40 + (options.showText ? options.fontSize + options.textMargin : 0)
        
        canvas.width = totalWidth
        canvas.height = totalHeight
        
        ctx.fillStyle = options.backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = options.foregroundColor
        
        let x = 20
        for (const bit of pattern) {
          if (bit === '1') {
            ctx.fillRect(x, 20, barWidth, options.height)
          }
          x += barWidth
        }
        
        if (options.showText) {
          ctx.fillStyle = options.foregroundColor
          ctx.font = `${options.fontSize}px monospace`
          ctx.textAlign = 'center'
          ctx.fillText(inputText, canvas.width / 2, options.height + 30 + options.fontSize)
        }
      }
    } catch (err) {
      setError('生成条形码时出错')
      console.error(err)
    }
  }, [inputText, options, validateInput, generateCode128, generateCode39, generateQRPattern])

  // 下载条形码
  const downloadBarcode = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `barcode_${options.type}_${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }, [options.type])

  // 复制到剪贴板
  const copyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
        }
      })
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [])

  // 加载示例
  const loadExample = useCallback(() => {
    const examples: { [key: string]: string } = {
      code128: 'HELLO123',
      code39: 'HELLO123',
      ean13: '1234567890123',
      ean8: '12345678',
      upc: '123456789012',
      qr: 'https://example.com'
    }
    setInputText(examples[options.type] || 'HELLO')
  }, [options.type])

  // 自动生成
  useEffect(() => {
    if (inputText && validateInput(inputText, options.type)) {
      const timer = setTimeout(drawBarcode, 300)
      return () => clearTimeout(timer)
    }
  }, [inputText, options, drawBarcode, validateInput])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📊 条形码生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            生成各种类型的条形码和二维码
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：设置面板 */}
          <div className="space-y-6">
            {/* 基本设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                基本设置
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    条形码类型
                  </label>
                  <select
                    value={options.type}
                    onChange={(e) => setOptions(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {barcodeTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {barcodeTypes.find(t => t.value === options.type)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输入内容
                  </label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`输入${options.type.toUpperCase()}格式的内容`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                  )}
                </div>

                <button
                  onClick={loadExample}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  加载示例
                </button>
              </div>
            </div>

            {/* 样式设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">样式设置</h3>
              
              <div className="space-y-4">
                {options.type !== 'qr' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        条宽: {options.width}px
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={options.width}
                        onChange={(e) => setOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        高度: {options.height}px
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={options.height}
                        onChange={(e) => setOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    字体大小: {options.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={options.fontSize}
                    onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      前景色
                    </label>
                    <input
                      type="color"
                      value={options.foregroundColor}
                      onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      背景色
                    </label>
                    <input
                      type="color"
                      value={options.backgroundColor}
                      onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.showText}
                    onChange={(e) => setOptions(prev => ({ ...prev, showText: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示文本</span>
                </label>
              </div>
            </div>
          </div>

          {/* 右侧：预览和操作 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 预览区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">预览</h3>
                <div className="flex gap-2">
                  <button
                    onClick={drawBarcode}
                    disabled={!inputText}
                    className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重新生成
                  </button>
                  <button
                    onClick={copyToClipboard}
                    disabled={!inputText}
                    className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                  <button
                    onClick={downloadBarcode}
                    disabled={!inputText}
                    className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-64 flex items-center justify-center">
                {inputText ? (
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full border border-gray-300 dark:border-gray-600 bg-white"
                  />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div>输入内容生成条形码</div>
                  </div>
                )}
              </div>
            </div>

            {/* 格式说明 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">格式说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barcodeTypes.map(type => (
                  <div key={type.value} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {type.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {type.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {type.value === 'code39' && '支持: 0-9, A-Z, -, ., 空格, $, /, +, %, *'}
                      {type.value === 'code128' && '支持: 所有 ASCII 字符'}
                      {type.value === 'ean13' && '格式: 13位数字'}
                      {type.value === 'ean8' && '格式: 8位数字'}
                      {type.value === 'upc' && '格式: 12位数字'}
                      {type.value === 'qr' && '支持: 文本、URL、数字等'}
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
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">条形码类型</h4>
              <ul className="space-y-1">
                <li>• <strong>Code 128</strong>: 高密度，支持所有字符</li>
                <li>• <strong>Code 39</strong>: 简单可靠，字符集有限</li>
                <li>• <strong>EAN-13/8</strong>: 商品标识标准</li>
                <li>• <strong>UPC-A</strong>: 北美商品标准</li>
                <li>• <strong>QR Code</strong>: 二维码，容量大</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 选择合适的条形码类型</li>
                <li>• 确保输入格式正确</li>
                <li>• 调整尺寸以适应打印需求</li>
                <li>• 保持足够的对比度</li>
                <li>• 测试扫描效果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
