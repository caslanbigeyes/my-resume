'use client'

import React, { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy } from 'lucide-react'

/**
 * 大小写转换工具组件
 * 提供多种文本大小写转换功能
 */
export default function CharCaseTool() {
  const [inputText, setInputText] = useState('')

  /**
   * 转换为大写
   */
  const toUpperCase = (text: string) => text.toUpperCase()

  /**
   * 转换为小写
   */
  const toLowerCase = (text: string) => text.toLowerCase()

  /**
   * 转换为标题格式（每个单词首字母大写）
   */
  const toTitleCase = (text: string) => {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }

  /**
   * 转换为句子格式（首字母大写）
   */
  const toSentenceCase = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  /**
   * 转换为驼峰命名（camelCase）
   */
  const toCamelCase = (text: string) => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase()
      })
      .replace(/\s+/g, '')
  }

  /**
   * 转换为帕斯卡命名（PascalCase）
   */
  const toPascalCase = (text: string) => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, '')
  }

  /**
   * 转换为蛇形命名（snake_case）
   */
  const toSnakeCase = (text: string) => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_')
  }

  /**
   * 转换为短横线命名（kebab-case）
   */
  const toKebabCase = (text: string) => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-')
  }

  /**
   * 反转大小写
   */
  const toggleCase = (text: string) => {
    return text
      .split('')
      .map(char => 
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
      )
      .join('')
  }

  /**
   * 复制文本到剪贴板
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 转换选项配置
  const conversions = [
    { name: '大写', func: toUpperCase, description: 'HELLO WORLD' },
    { name: '小写', func: toLowerCase, description: 'hello world' },
    { name: '标题格式', func: toTitleCase, description: 'Hello World' },
    { name: '句子格式', func: toSentenceCase, description: 'Hello world' },
    { name: '驼峰命名', func: toCamelCase, description: 'helloWorld' },
    { name: '帕斯卡命名', func: toPascalCase, description: 'HelloWorld' },
    { name: '蛇形命名', func: toSnakeCase, description: 'hello_world' },
    { name: '短横线命名', func: toKebabCase, description: 'hello-world' },
    { name: '反转大小写', func: toggleCase, description: 'hELLO wORLD' }
  ]

  return (
    <ToolLayout
      title="大小写转换"
      description="转换文本大小写格式"
      category="文本处理"
      icon="🔤"
    >
      <div className="space-y-6">
        {/* 输入区域 */}
        <div>
          <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
            输入文本
          </label>
          <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入要转换的文本..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              支持中英文混合文本转换
            </p>
            <button
              onClick={() => setInputText('')}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              清空
            </button>
          </div>
        </div>

        {/* 转换结果 */}
        <div className="grid gap-4">
          {conversions.map((conversion, index) => {
            const result = inputText ? conversion.func(inputText) : ''
            return (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{conversion.name}</h3>
                    <p className="text-xs text-gray-500">示例: {conversion.description}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result)}
                    disabled={!result}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="复制结果"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-white p-3 rounded border min-h-[2.5rem] font-mono text-sm">
                  {result || (
                    <span className="text-gray-400 italic">转换结果将显示在这里...</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 批量操作 */}
        {inputText && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">批量操作</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyToClipboard(inputText)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                复制原文
              </button>
              {conversions.map((conversion, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(conversion.func(inputText))}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  复制{conversion.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• <strong>大写/小写</strong>：转换所有字符的大小写</li>
            <li>• <strong>标题格式</strong>：每个单词首字母大写</li>
            <li>• <strong>句子格式</strong>：只有第一个字母大写</li>
            <li>• <strong>驼峰命名</strong>：适用于变量命名，首字母小写</li>
            <li>• <strong>帕斯卡命名</strong>：适用于类名，首字母大写</li>
            <li>• <strong>蛇形命名</strong>：用下划线连接单词</li>
            <li>• <strong>短横线命名</strong>：用短横线连接单词</li>
            <li>• <strong>反转大小写</strong>：大写变小写，小写变大写</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
