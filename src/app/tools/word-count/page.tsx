'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'

/**
 * 字数统计工具组件
 * 实时统计文本的字数、字符数、段落数、行数等信息
 */
export default function WordCountTool() {
  const [text, setText] = useState('')

  // 计算文本统计信息
  const stats = useMemo(() => {
    if (!text) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTime: 0
      }
    }

    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    const lines = text.split('\n').length
    const readingTime = Math.ceil(words / 200) // 假设每分钟阅读200字

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime
    }
  }, [text])

  /**
   * 清空文本
   */
  const clearText = () => {
    setText('')
  }

  /**
   * 复制统计信息
   */
  const copyStats = async () => {
    const statsText = `文本统计信息：
字符数：${stats.characters}
字符数（不含空格）：${stats.charactersNoSpaces}
单词数：${stats.words}
句子数：${stats.sentences}
段落数：${stats.paragraphs}
行数：${stats.lines}
预计阅读时间：${stats.readingTime}分钟`

    try {
      await navigator.clipboard.writeText(statsText)
      alert('统计信息已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <ToolLayout
      title="字数统计"
      description="实时统计文本字数、字符数、段落数"
      category="文本处理"
      icon="📝"
    >
      <div className="space-y-6">
        {/* 文本输入区域 */}
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            输入或粘贴文本
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入或粘贴您要统计的文本..."
            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              实时统计，支持中英文混合文本
            </p>
            <button
              onClick={clearText}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              清空
            </button>
          </div>
        </div>

        {/* 统计结果 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.characters.toLocaleString()}</div>
            <div className="text-sm text-gray-600">字符数</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.charactersNoSpaces.toLocaleString()}</div>
            <div className="text-sm text-gray-600">字符数（不含空格）</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.words.toLocaleString()}</div>
            <div className="text-sm text-gray-600">单词数</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.sentences}</div>
            <div className="text-sm text-gray-600">句子数</div>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.paragraphs}</div>
            <div className="text-sm text-gray-600">段落数</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.lines}</div>
            <div className="text-sm text-gray-600">行数</div>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-teal-600">{stats.readingTime}</div>
            <div className="text-sm text-gray-600">预计阅读时间（分钟）</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <button
              onClick={copyStats}
              className="w-full h-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              <div className="text-lg">📋</div>
              <div className="text-sm">复制统计</div>
            </button>
          </div>
        </div>

        {/* 详细信息 */}
        {text && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">详细信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">平均每段字数：</span>
                <span className="font-medium ml-2">
                  {stats.paragraphs > 0 ? Math.round(stats.words / stats.paragraphs) : 0}
                </span>
              </div>
              <div>
                <span className="text-gray-600">平均每句字数：</span>
                <span className="font-medium ml-2">
                  {stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0}
                </span>
              </div>
              <div>
                <span className="text-gray-600">字符密度：</span>
                <span className="font-medium ml-2">
                  {stats.characters > 0 ? Math.round((stats.charactersNoSpaces / stats.characters) * 100) : 0}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">平均每行字数：</span>
                <span className="font-medium ml-2">
                  {stats.lines > 0 ? Math.round(stats.words / stats.lines) : 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 支持中英文混合文本统计</li>
            <li>• 实时更新统计结果</li>
            <li>• 预计阅读时间基于每分钟200字计算</li>
            <li>• 可复制统计信息到剪贴板</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
