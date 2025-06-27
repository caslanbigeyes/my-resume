'use client'

import React, { useState, useCallback } from 'react'
import { Copy, Download, RefreshCw, FileText, Code } from 'lucide-react'

/**
 * YAML 转 JSON 工具组件
 * 支持 YAML 和 JSON 格式互相转换
 */
export default function YamlToJsonPage() {
  const [yamlInput, setYamlInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json')

  // 简单的 YAML 解析器（支持基本格式）
  const parseYaml = useCallback((yamlStr: string): any => {
    const lines = yamlStr.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
    const result: any = {}
    let currentIndent = 0
    let stack: any[] = [result]

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const indent = line.length - line.trimStart().length
      const colonIndex = trimmed.indexOf(':')
      
      if (colonIndex === -1) continue

      const key = trimmed.substring(0, colonIndex).trim()
      const value = trimmed.substring(colonIndex + 1).trim()

      // 处理缩进层级
      while (stack.length > 1 && indent <= currentIndent) {
        stack.pop()
        currentIndent -= 2
      }

      const current = stack[stack.length - 1]

      if (value === '') {
        // 对象开始
        current[key] = {}
        stack.push(current[key])
        currentIndent = indent
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // 数组
        try {
          current[key] = JSON.parse(value)
        } catch {
          current[key] = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        }
      } else if (value === 'true' || value === 'false') {
        current[key] = value === 'true'
      } else if (!isNaN(Number(value))) {
        current[key] = Number(value)
      } else {
        current[key] = value.replace(/^["']|["']$/g, '')
      }
    }

    return result
  }, [])

  // 简单的 JSON 转 YAML
  const jsonToYaml = useCallback((obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent)
    let result = ''

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result += `${spaces}${key}:\n`
        result += jsonToYaml(value, indent + 1)
      } else if (Array.isArray(value)) {
        result += `${spaces}${key}: [${value.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')}]\n`
      } else if (typeof value === 'string') {
        result += `${spaces}${key}: "${value}"\n`
      } else {
        result += `${spaces}${key}: ${value}\n`
      }
    }

    return result
  }, [])

  // 转换处理
  const handleConvert = useCallback(() => {
    setError('')
    
    try {
      if (mode === 'yaml-to-json') {
        if (!yamlInput.trim()) {
          setJsonOutput('')
          return
        }
        const parsed = parseYaml(yamlInput)
        setJsonOutput(JSON.stringify(parsed, null, 2))
      } else {
        if (!yamlInput.trim()) {
          setJsonOutput('')
          return
        }
        const parsed = JSON.parse(yamlInput)
        setJsonOutput(jsonToYaml(parsed))
      }
    } catch (err) {
      setError(mode === 'yaml-to-json' ? 'YAML 格式错误' : 'JSON 格式错误')
      setJsonOutput('')
    }
  }, [yamlInput, mode, parseYaml, jsonToYaml])

  // 实时转换
  React.useEffect(() => {
    handleConvert()
  }, [yamlInput, mode, handleConvert])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载文件
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 示例数据
  const loadExample = () => {
    if (mode === 'yaml-to-json') {
      setYamlInput(`name: "John Doe"
age: 30
email: "john@example.com"
address:
  street: "123 Main St"
  city: "New York"
  country: "USA"
hobbies: ["reading", "swimming", "coding"]
active: true`)
    } else {
      setYamlInput(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "swimming", "coding"],
  "active": true
}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔄 YAML ↔ JSON 转换器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            YAML 和 JSON 格式互相转换工具
          </p>
        </div>

        {/* 模式切换 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('yaml-to-json')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'yaml-to-json'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              YAML → JSON
            </button>
            <button
              onClick={() => setMode('json-to-yaml')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'json-to-yaml'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              JSON → YAML
            </button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {mode === 'yaml-to-json' ? 'YAML 输入' : 'JSON 输入'}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={loadExample}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    示例
                  </button>
                  <button
                    onClick={() => setYamlInput('')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                placeholder={mode === 'yaml-to-json' ? '输入 YAML 内容...' : '输入 JSON 内容...'}
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 输出区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {mode === 'yaml-to-json' ? 'JSON 输出' : 'YAML 输出'}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(jsonOutput)}
                    disabled={!jsonOutput}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    复制
                  </button>
                  <button
                    onClick={() => downloadFile(jsonOutput, mode === 'yaml-to-json' ? 'output.json' : 'output.yaml')}
                    disabled={!jsonOutput}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    下载
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              {error ? (
                <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <textarea
                  value={jsonOutput}
                  readOnly
                  placeholder={mode === 'yaml-to-json' ? 'JSON 输出将显示在这里...' : 'YAML 输出将显示在这里...'}
                  className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">YAML → JSON</h4>
              <ul className="space-y-1">
                <li>• 支持基本的 YAML 语法</li>
                <li>• 自动识别数据类型</li>
                <li>• 支持嵌套对象和数组</li>
                <li>• 忽略注释行</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">JSON → YAML</h4>
              <ul className="space-y-1">
                <li>• 标准 JSON 格式转换</li>
                <li>• 保持数据结构</li>
                <li>• 自动格式化缩进</li>
                <li>• 支持复杂嵌套结构</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
