'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy, Settings } from 'lucide-react'

/**
 * URL Slug生成工具组件
 * 将文本转换为URL友好的slug格式
 */
export default function SlugifyTool() {
  const [inputText, setInputText] = useState('')
  const [options, setOptions] = useState({
    lowercase: true,
    separator: '-',
    removeSpecialChars: true,
    maxLength: 0,
    transliterate: true
  })

  /**
   * 生成slug
   */
  const generateSlug = useMemo(() => {
    if (!inputText.trim()) return ''

    let slug = inputText.trim()

    // 音译处理（简单的中文转拼音映射）
    if (options.transliterate) {
      const transliterationMap: { [key: string]: string } = {
        '你好': 'nihao',
        '世界': 'shijie',
        '中国': 'zhongguo',
        '北京': 'beijing',
        '上海': 'shanghai',
        '深圳': 'shenzhen',
        '广州': 'guangzhou',
        '技术': 'jishu',
        '开发': 'kaifa',
        '程序': 'chengxu',
        '代码': 'daima',
        '网站': 'wangzhan',
        '博客': 'boke',
        '文章': 'wenzhang',
        '教程': 'jiaocheng'
      }

      // 简单的中文字符处理
      Object.entries(transliterationMap).forEach(([chinese, pinyin]) => {
        slug = slug.replace(new RegExp(chinese, 'g'), pinyin)
      })

      // 移除剩余的中文字符
      slug = slug.replace(/[\u4e00-\u9fff]/g, '')
    }

    // 转换为小写
    if (options.lowercase) {
      slug = slug.toLowerCase()
    }

    // 移除特殊字符
    if (options.removeSpecialChars) {
      slug = slug.replace(/[^\w\s-]/g, '')
    }

    // 替换空格和多个连续的分隔符
    slug = slug
      .replace(/\s+/g, options.separator)
      .replace(new RegExp(`\\${options.separator}+`, 'g'), options.separator)

    // 移除开头和结尾的分隔符
    slug = slug.replace(new RegExp(`^\\${options.separator}+|\\${options.separator}+$`, 'g'), '')

    // 限制长度
    if (options.maxLength > 0 && slug.length > options.maxLength) {
      slug = slug.substring(0, options.maxLength)
      // 确保不在单词中间截断
      const lastSeparator = slug.lastIndexOf(options.separator)
      if (lastSeparator > slug.length * 0.8) {
        slug = slug.substring(0, lastSeparator)
      }
    }

    return slug
  }, [inputText, options])

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 预设配置
   */
  const presets = [
    {
      name: '默认',
      config: { lowercase: true, separator: '-', removeSpecialChars: true, maxLength: 0, transliterate: true }
    },
    {
      name: '下划线',
      config: { lowercase: true, separator: '_', removeSpecialChars: true, maxLength: 0, transliterate: true }
    },
    {
      name: '点分隔',
      config: { lowercase: true, separator: '.', removeSpecialChars: true, maxLength: 0, transliterate: true }
    },
    {
      name: '保持大小写',
      config: { lowercase: false, separator: '-', removeSpecialChars: true, maxLength: 0, transliterate: true }
    },
    {
      name: '短链接',
      config: { lowercase: true, separator: '-', removeSpecialChars: true, maxLength: 30, transliterate: true }
    }
  ]

  return (
    <ToolLayout
      title="URL Slug生成"
      description="生成URL友好的slug字符串"
      category="文本处理"
      icon="🔗"
    >
      <div className="space-y-6">
        {/* 输入区域 */}
        <div>
          <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
            输入文本
          </label>
          <input
            id="input-text"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入要转换为slug的文本..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 结果显示 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">生成的Slug</h3>
            <button
              onClick={() => copyToClipboard(generateSlug)}
              disabled={!generateSlug}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4" />
              复制
            </button>
          </div>
          <div className="bg-white p-3 rounded border font-mono text-sm min-h-[2.5rem] flex items-center">
            {generateSlug || (
              <span className="text-gray-400 italic">slug将显示在这里...</span>
            )}
          </div>
          {generateSlug && (
            <div className="mt-2 text-xs text-gray-500">
              长度: {generateSlug.length} 字符
            </div>
          )}
        </div>

        {/* 配置选项 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">配置选项</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 基本选项 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.lowercase}
                  onChange={(e) => setOptions(prev => ({ ...prev, lowercase: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">转换为小写</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.removeSpecialChars}
                  onChange={(e) => setOptions(prev => ({ ...prev, removeSpecialChars: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">移除特殊字符</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.transliterate}
                  onChange={(e) => setOptions(prev => ({ ...prev, transliterate: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">音译处理</span>
              </label>
            </div>

            {/* 高级选项 */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分隔符
                </label>
                <select
                  value={options.separator}
                  onChange={(e) => setOptions(prev => ({ ...prev, separator: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="-">短横线 (-)</option>
                  <option value="_">下划线 (_)</option>
                  <option value=".">点号 (.)</option>
                  <option value="">无分隔符</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大长度 (0=无限制)
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={options.maxLength}
                  onChange={(e) => setOptions(prev => ({ ...prev, maxLength: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 预设配置 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">快速预设</h4>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setOptions(preset.config)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 示例 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">示例</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-800">Hello World!</span>
              <span className="font-mono text-blue-600">hello-world</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">My Blog Post Title</span>
              <span className="font-mono text-blue-600">my-blog-post-title</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">JavaScript & CSS Tips</span>
              <span className="font-mono text-blue-600">javascript-css-tips</span>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 自动处理空格、特殊字符和大小写</li>
            <li>• 支持中文音译（基础功能）</li>
            <li>• 可自定义分隔符和长度限制</li>
            <li>• 适用于URL、文件名、标识符等场景</li>
            <li>• 生成的slug符合SEO最佳实践</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
