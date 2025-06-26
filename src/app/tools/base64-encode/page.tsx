'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy, ArrowUpDown, FileText, Image } from 'lucide-react'

/**
 * Base64编码工具组件
 * Base64编码解码
 */
export default function Base64EncodeTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [fileContent, setFileContent] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')

  /**
   * Base64编码
   */
  const encodeBase64 = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)))
    } catch (error) {
      return '编码失败：输入包含无效字符'
    }
  }

  /**
   * Base64解码
   */
  const decodeBase64 = (base64: string): string => {
    try {
      return decodeURIComponent(escape(atob(base64.replace(/\s/g, ''))))
    } catch (error) {
      return '解码失败：输入不是有效的Base64字符串'
    }
  }

  /**
   * 处理结果
   */
  const result = useMemo(() => {
    const sourceText = inputType === 'file' ? fileContent : input
    
    if (!sourceText.trim()) return ''

    if (mode === 'encode') {
      return encodeBase64(sourceText)
    } else {
      return decodeBase64(sourceText)
    }
  }, [input, fileContent, mode, inputType])

  /**
   * 处理文件上传
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    if (file.type.startsWith('image/')) {
      // 图片文件转为Base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFileContent(result)
      }
      reader.readAsDataURL(file)
    } else {
      // 文本文件
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFileContent(result)
      }
      reader.readAsText(file)
    }
  }

  /**
   * 复制结果
   */
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result)
      alert('结果已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 切换模式
   */
  const toggleMode = () => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode')
    // 如果有结果，将结果作为新的输入
    if (result && inputType === 'text') {
      setInput(result)
    }
  }

  /**
   * 清空输入
   */
  const clearInput = () => {
    setInput('')
    setFileContent('')
    setFileName('')
  }

  /**
   * 下载结果
   */
  const downloadResult = () => {
    if (!result) return

    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `base64-${mode}-result.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 检测是否为Base64
   */
  const isValidBase64 = (str: string): boolean => {
    try {
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

  return (
    <ToolLayout
      title="Base64编码"
      description="Base64编码解码"
      category="编码加密"
      icon="🔐"
    >
      <div className="space-y-6">
        {/* 模式选择 */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setMode('encode')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'encode' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            编码
          </button>
          <button
            onClick={toggleMode}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="切换模式"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'decode' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            解码
          </button>
        </div>

        {/* 输入类型选择 */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setInputType('text')}
            className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
              inputType === 'text' 
                ? 'bg-green-100 text-green-800' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            文本输入
          </button>
          <button
            onClick={() => setInputType('file')}
            className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
              inputType === 'file' 
                ? 'bg-green-100 text-green-800' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Image className="w-4 h-4" />
            文件上传
          </button>
        </div>

        {/* 输入区域 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {mode === 'encode' ? '原始内容' : 'Base64内容'}
            </label>
            <button
              onClick={clearInput}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              清空
            </button>
          </div>

          {inputType === 'text' ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的Base64字符串...'}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept="*/*"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="text-4xl">📁</div>
                <div className="text-sm text-gray-600">
                  点击选择文件或拖拽文件到此处
                </div>
                {fileName && (
                  <div className="text-sm text-blue-600 font-medium">
                    已选择: {fileName}
                  </div>
                )}
              </label>
            </div>
          )}
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">
                  {mode === 'encode' ? 'Base64编码结果' : '解码结果'}
                </h3>
                <span className="text-xs text-gray-500">
                  {result.length} 字符
                </span>
                {mode === 'decode' && inputType === 'text' && !isValidBase64(input) && (
                  <span className="text-xs text-red-500">⚠️ 输入可能不是有效的Base64</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyResult}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
                <button
                  onClick={downloadResult}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  下载
                </button>
              </div>
            </div>
            <div className="p-3">
              <div className="bg-gray-50 p-3 rounded border max-h-64 overflow-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                  {result}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 示例 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-3">示例</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-blue-800 font-medium">原始文本:</span>
              <span className="ml-2 font-mono">Hello, World!</span>
            </div>
            <div>
              <span className="text-blue-800 font-medium">Base64编码:</span>
              <span className="ml-2 font-mono">SGVsbG8sIFdvcmxkIQ==</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                setInputType('text')
                setMode('encode')
                setInput('Hello, World!')
              }}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              试试编码
            </button>
            <button
              onClick={() => {
                setInputType('text')
                setMode('decode')
                setInput('SGVsbG8sIFdvcmxkIQ==')
              }}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              试试解码
            </button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 支持文本和文件的Base64编码/解码</li>
            <li>• 自动检测Base64格式的有效性</li>
            <li>• 支持中文等Unicode字符</li>
            <li>• 可以上传图片等文件进行编码</li>
            <li>• 提供一键复制和下载功能</li>
            <li>• 显示字符数统计信息</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
