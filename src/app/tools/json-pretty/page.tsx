'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy, Minimize2, Maximize2, AlertCircle } from 'lucide-react'

/**
 * JSON格式化工具组件
 * JSON美化和压缩工具
 */
export default function JsonPrettyTool() {
  const [input, setInput] = useState('')
  const [indentSize, setIndentSize] = useState(2)

  /**
   * 验证和格式化JSON
   */
  const processedJson = useMemo(() => {
    if (!input.trim()) {
      return { formatted: '', minified: '', error: null, valid: false }
    }

    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indentSize)
      const minified = JSON.stringify(parsed)
      
      return {
        formatted,
        minified,
        error: null,
        valid: true,
        size: {
          original: input.length,
          formatted: formatted.length,
          minified: minified.length
        }
      }
    } catch (error) {
      return {
        formatted: '',
        minified: '',
        error: error instanceof Error ? error.message : '未知错误',
        valid: false
      }
    }
  }, [input, indentSize])

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${type}已复制到剪贴板`)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 清空输入
   */
  const clearInput = () => {
    setInput('')
  }

  /**
   * 示例JSON
   */
  const loadExample = () => {
    const example = {
      "name": "张三",
      "age": 30,
      "city": "北京",
      "skills": ["JavaScript", "React", "Node.js"],
      "address": {
        "street": "中关村大街1号",
        "zipCode": "100080"
      },
      "isActive": true,
      "projects": [
        {
          "name": "项目A",
          "status": "completed",
          "startDate": "2023-01-01"
        },
        {
          "name": "项目B",
          "status": "in-progress",
          "startDate": "2023-06-01"
        }
      ]
    }
    setInput(JSON.stringify(example))
  }

  return (
    <ToolLayout
      title="JSON格式化"
      description="JSON美化和压缩工具"
      category="文本处理"
      icon="📊"
    >
      <div className="space-y-6">
        {/* 输入区域 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="json-input" className="block text-sm font-medium text-gray-700">
              输入JSON
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={loadExample}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                加载示例
              </button>
              <button
                onClick={clearInput}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
          <textarea
            id="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴或输入JSON数据..."
            className="w-full h-48 p-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 配置选项 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="indent-size" className="text-sm font-medium text-gray-700">
              缩进大小:
            </label>
            <select
              id="indent-size"
              value={indentSize}
              onChange={(e) => setIndentSize(parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={2}>2空格</option>
              <option value={4}>4空格</option>
              <option value={8}>8空格</option>
            </select>
          </div>
        </div>

        {/* 错误提示 */}
        {processedJson.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-900">JSON格式错误</h3>
                <p className="text-sm text-red-700 mt-1">{processedJson.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 格式化结果 */}
        {processedJson.valid && (
          <div className="space-y-4">
            {/* 美化版本 */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-green-600" />
                  <h3 className="font-medium text-gray-900">格式化JSON</h3>
                  <span className="text-xs text-gray-500">
                    {processedJson.size?.formatted} 字符
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(processedJson.formatted, '格式化JSON')}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
              </div>
              <div className="p-3">
                <pre className="bg-gray-50 p-3 rounded border overflow-auto max-h-64 text-sm">
                  <code>{processedJson.formatted}</code>
                </pre>
              </div>
            </div>

            {/* 压缩版本 */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Minimize2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-gray-900">压缩JSON</h3>
                  <span className="text-xs text-gray-500">
                    {processedJson.size?.minified} 字符
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(processedJson.minified, '压缩JSON')}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
              </div>
              <div className="p-3">
                <div className="bg-gray-50 p-3 rounded border overflow-auto max-h-32 text-sm break-all">
                  {processedJson.minified}
                </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3">统计信息</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {processedJson.size?.original}
                  </div>
                  <div className="text-blue-800">原始大小</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {processedJson.size?.formatted}
                  </div>
                  <div className="text-green-800">格式化大小</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {processedJson.size?.minified}
                  </div>
                  <div className="text-purple-800">压缩大小</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">
                    {processedJson.size ? 
                      Math.round((1 - processedJson.size.minified / processedJson.size.original) * 100) : 0}%
                  </div>
                  <div className="text-orange-800">压缩率</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 粘贴或输入JSON数据进行格式化</li>
            <li>• 支持美化和压缩两种输出格式</li>
            <li>• 可自定义缩进大小（2、4、8空格）</li>
            <li>• 实时验证JSON格式并显示错误信息</li>
            <li>• 显示文件大小和压缩率统计</li>
            <li>• 一键复制格式化或压缩后的结果</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
