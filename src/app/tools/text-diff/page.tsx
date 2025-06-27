'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Download, FileText, GitCompare, Eye, Settings } from 'lucide-react'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified'
  oldLineNumber?: number
  newLineNumber?: number
  content: string
  oldContent?: string
  newContent?: string
}

interface DiffOptions {
  ignoreWhitespace: boolean
  ignoreCase: boolean
  showLineNumbers: boolean
  contextLines: number
}

/**
 * 文本差异对比工具组件
 * 比较两个文本的差异并高亮显示
 */
export default function TextDiffPage() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [options, setOptions] = useState<DiffOptions>({
    ignoreWhitespace: false,
    ignoreCase: false,
    showLineNumbers: true,
    contextLines: 3
  })
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side')

  // 简单的文本差异算法
  const computeDiff = useCallback((text1: string, text2: string, opts: DiffOptions): DiffLine[] => {
    let lines1 = text1.split('\n')
    let lines2 = text2.split('\n')

    // 预处理
    if (opts.ignoreWhitespace) {
      lines1 = lines1.map(line => line.trim())
      lines2 = lines2.map(line => line.trim())
    }
    
    if (opts.ignoreCase) {
      lines1 = lines1.map(line => line.toLowerCase())
      lines2 = lines2.map(line => line.toLowerCase())
    }

    const result: DiffLine[] = []
    let i = 0, j = 0

    while (i < lines1.length || j < lines2.length) {
      if (i >= lines1.length) {
        // 右侧有剩余行（新增）
        result.push({
          type: 'added',
          newLineNumber: j + 1,
          content: text2.split('\n')[j] || ''
        })
        j++
      } else if (j >= lines2.length) {
        // 左侧有剩余行（删除）
        result.push({
          type: 'removed',
          oldLineNumber: i + 1,
          content: text1.split('\n')[i] || ''
        })
        i++
      } else if (lines1[i] === lines2[j]) {
        // 相同行
        result.push({
          type: 'unchanged',
          oldLineNumber: i + 1,
          newLineNumber: j + 1,
          content: text1.split('\n')[i] || ''
        })
        i++
        j++
      } else {
        // 寻找匹配的行
        let found = false
        
        // 在接下来的几行中寻找匹配
        for (let k = 1; k <= 5 && j + k < lines2.length; k++) {
          if (lines1[i] === lines2[j + k]) {
            // 找到匹配，中间的行是新增的
            for (let l = 0; l < k; l++) {
              result.push({
                type: 'added',
                newLineNumber: j + l + 1,
                content: text2.split('\n')[j + l] || ''
              })
            }
            j += k
            found = true
            break
          }
        }

        if (!found) {
          for (let k = 1; k <= 5 && i + k < lines1.length; k++) {
            if (lines1[i + k] === lines2[j]) {
              // 找到匹配，中间的行是删除的
              for (let l = 0; l < k; l++) {
                result.push({
                  type: 'removed',
                  oldLineNumber: i + l + 1,
                  content: text1.split('\n')[i + l] || ''
                })
              }
              i += k
              found = true
              break
            }
          }
        }

        if (!found) {
          // 没找到匹配，标记为修改
          result.push({
            type: 'modified',
            oldLineNumber: i + 1,
            newLineNumber: j + 1,
            content: text2.split('\n')[j] || '',
            oldContent: text1.split('\n')[i] || '',
            newContent: text2.split('\n')[j] || ''
          })
          i++
          j++
        }
      }
    }

    return result
  }, [])

  // 计算差异
  const diffLines = useMemo(() => {
    if (!leftText && !rightText) return []
    return computeDiff(leftText, rightText, options)
  }, [leftText, rightText, options, computeDiff])

  // 统计信息
  const stats = useMemo(() => {
    const added = diffLines.filter(line => line.type === 'added').length
    const removed = diffLines.filter(line => line.type === 'removed').length
    const modified = diffLines.filter(line => line.type === 'modified').length
    const unchanged = diffLines.filter(line => line.type === 'unchanged').length

    return { added, removed, modified, unchanged, total: diffLines.length }
  }, [diffLines])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 生成差异报告
  const generateDiffReport = () => {
    const report = [
      '# 文本差异报告',
      '',
      '## 统计信息',
      `- 新增行: ${stats.added}`,
      `- 删除行: ${stats.removed}`,
      `- 修改行: ${stats.modified}`,
      `- 未变行: ${stats.unchanged}`,
      '',
      '## 详细差异',
      ''
    ]

    diffLines.forEach((line, index) => {
      const lineNum = options.showLineNumbers ? `${line.oldLineNumber || '-'}:${line.newLineNumber || '-'} ` : ''
      
      switch (line.type) {
        case 'added':
          report.push(`+ ${lineNum}${line.content}`)
          break
        case 'removed':
          report.push(`- ${lineNum}${line.content}`)
          break
        case 'modified':
          report.push(`- ${lineNum}${line.oldContent}`)
          report.push(`+ ${lineNum}${line.newContent}`)
          break
        case 'unchanged':
          report.push(`  ${lineNum}${line.content}`)
          break
      }
    })

    return report.join('\n')
  }

  // 下载差异报告
  const downloadReport = () => {
    const report = generateDiffReport()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'text-diff-report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 加载示例
  const loadExample = () => {
    setLeftText(`function hello() {
  console.log("Hello World");
  return true;
}

const name = "John";
const age = 25;`)

    setRightText(`function hello() {
  console.log("Hello Universe");
  console.log("Welcome!");
  return true;
}

const name = "Jane";
const age = 30;
const city = "New York";`)
  }

  // 清空内容
  const clearAll = () => {
    setLeftText('')
    setRightText('')
  }

  // 获取行的样式类
  const getLineClass = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
      case 'removed':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
      case 'modified':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500'
      default:
        return 'bg-white dark:bg-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📝 文本差异对比
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            比较两个文本的差异并高亮显示变更
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 视图模式 */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                并排
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <GitCompare className="w-4 h-4 inline mr-1" />
                统一
              </button>
            </div>

            {/* 选项 */}
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.ignoreWhitespace}
                  onChange={(e) => setOptions(prev => ({ ...prev, ignoreWhitespace: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">忽略空白</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={(e) => setOptions(prev => ({ ...prev, ignoreCase: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">忽略大小写</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.showLineNumbers}
                  onChange={(e) => setOptions(prev => ({ ...prev, showLineNumbers: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">显示行号</span>
              </label>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={loadExample}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                示例
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                清空
              </button>
              <button
                onClick={() => copyToClipboard(generateDiffReport())}
                disabled={diffLines.length === 0}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Copy className="w-4 h-4 inline mr-1" />
                复制
              </button>
              <button
                onClick={downloadReport}
                disabled={diffLines.length === 0}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4 inline mr-1" />
                下载
              </button>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        {diffLines.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.added}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">新增行</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.removed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">删除行</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.modified}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">修改行</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {stats.unchanged}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">未变行</div>
            </div>
          </div>
        )}

        {viewMode === 'side-by-side' ? (
          /* 并排视图 */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧文本 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  原始文本
                </h3>
              </div>
              <div className="p-4">
                <textarea
                  value={leftText}
                  onChange={(e) => setLeftText(e.target.value)}
                  placeholder="输入原始文本..."
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 右侧文本 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  对比文本
                </h3>
              </div>
              <div className="p-4">
                <textarea
                  value={rightText}
                  onChange={(e) => setRightText(e.target.value)}
                  placeholder="输入对比文本..."
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ) : (
          /* 统一视图 */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <GitCompare className="w-5 h-5" />
                文本输入
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <textarea
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                placeholder="输入原始文本..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                placeholder="输入对比文本..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* 差异结果 */}
        {diffLines.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">差异结果</h3>
            </div>
            <div className="p-4">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {diffLines.map((line, index) => (
                  <div key={index} className={`p-2 rounded ${getLineClass(line.type)}`}>
                    <div className="flex items-start gap-2">
                      {options.showLineNumbers && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono min-w-16">
                          {line.oldLineNumber || '-'}:{line.newLineNumber || '-'}
                        </div>
                      )}
                      <div className="flex-1 font-mono text-sm">
                        {line.type === 'modified' ? (
                          <div>
                            <div className="text-red-600 dark:text-red-400">- {line.oldContent}</div>
                            <div className="text-green-600 dark:text-green-400">+ {line.newContent}</div>
                          </div>
                        ) : (
                          <div className={
                            line.type === 'added' ? 'text-green-600 dark:text-green-400' :
                            line.type === 'removed' ? 'text-red-600 dark:text-red-400' :
                            'text-gray-700 dark:text-gray-300'
                          }>
                            {line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}
                            {line.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">颜色说明</h4>
              <ul className="space-y-1">
                <li>• <span className="text-green-600">绿色</span>: 新增的行</li>
                <li>• <span className="text-red-600">红色</span>: 删除的行</li>
                <li>• <span className="text-yellow-600">黄色</span>: 修改的行</li>
                <li>• 白色: 未变化的行</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 支持忽略空白和大小写</li>
                <li>• 并排和统一两种视图模式</li>
                <li>• 显示详细的统计信息</li>
                <li>• 可导出差异报告</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
