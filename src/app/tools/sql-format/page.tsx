'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Download, Database, Code, Settings, AlertCircle } from 'lucide-react'

interface FormatOptions {
  indentSize: number
  keywordCase: 'upper' | 'lower' | 'capitalize'
  lineBreakAfter: string[]
  indentAfter: string[]
  maxLineLength: number
}

/**
 * SQL 格式化工具组件
 * 格式化和美化 SQL 语句
 */
export default function SqlFormatPage() {
  const [sqlInput, setSqlInput] = useState('')
  const [options, setOptions] = useState<FormatOptions>({
    indentSize: 2,
    keywordCase: 'upper',
    lineBreakAfter: ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT'],
    indentAfter: ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN'],
    maxLineLength: 80
  })
  const [error, setError] = useState('')

  // SQL 关键字列表
  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'PROCEDURE', 'FUNCTION', 'TRIGGER',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'USING',
    'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT',
    'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'TRUE', 'FALSE',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'DISTINCT', 'ALL', 'ANY', 'SOME',
    'AS', 'ASC', 'DESC', 'INTO', 'VALUES', 'SET', 'DEFAULT', 'PRIMARY', 'KEY', 'FOREIGN',
    'REFERENCES', 'UNIQUE', 'CHECK', 'CONSTRAINT', 'AUTO_INCREMENT', 'IDENTITY'
  ]

  // 格式化关键字大小写
  const formatKeywordCase = useCallback((keyword: string): string => {
    switch (options.keywordCase) {
      case 'upper':
        return keyword.toUpperCase()
      case 'lower':
        return keyword.toLowerCase()
      case 'capitalize':
        return keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
      default:
        return keyword
    }
  }, [options.keywordCase])

  // 简单的 SQL 格式化函数
  const formatSQL = useCallback((sql: string): string => {
    if (!sql.trim()) return ''

    try {
      // 移除多余的空白字符
      let formatted = sql.replace(/\s+/g, ' ').trim()

      // 处理关键字
      sqlKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        formatted = formatted.replace(regex, formatKeywordCase(keyword))
      })

      // 添加换行符
      options.lineBreakAfter.forEach(keyword => {
        const formattedKeyword = formatKeywordCase(keyword)
        const regex = new RegExp(`\\b${formattedKeyword}\\b`, 'g')
        formatted = formatted.replace(regex, `\n${formattedKeyword}`)
      })

      // 处理逗号后的换行
      formatted = formatted.replace(/,\s*/g, ',\n')

      // 处理括号
      formatted = formatted.replace(/\(\s*/g, '(\n')
      formatted = formatted.replace(/\s*\)/g, '\n)')

      // 分割成行并处理缩进
      const lines = formatted.split('\n').filter(line => line.trim())
      let indentLevel = 0
      const indentString = ' '.repeat(options.indentSize)

      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        
        // 减少缩进
        if (trimmedLine === ')' || trimmedLine.startsWith(')')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }

        const indentedLine = indentString.repeat(indentLevel) + trimmedLine

        // 增加缩进
        if (trimmedLine === '(' || trimmedLine.endsWith('(')) {
          indentLevel++
        } else if (options.indentAfter.some(keyword => 
          trimmedLine.toUpperCase().startsWith(formatKeywordCase(keyword).toUpperCase())
        )) {
          indentLevel++
        }

        return indentedLine
      })

      // 处理特殊情况的缩进调整
      const finalLines = formattedLines.map((line, index) => {
        const trimmedLine = line.trim()
        
        // 如果是逗号开头的行，减少一级缩进
        if (trimmedLine.startsWith(',')) {
          const currentIndent = line.length - line.trimStart().length
          const newIndent = Math.max(0, currentIndent - options.indentSize)
          return ' '.repeat(newIndent) + trimmedLine
        }
        
        return line
      })

      return finalLines.join('\n')
    } catch (err) {
      throw new Error('SQL 格式化失败')
    }
  }, [options, formatKeywordCase, sqlKeywords])

  // 格式化后的 SQL
  const formattedSQL = useMemo(() => {
    if (!sqlInput.trim()) {
      return ''
    }

    try {
      return formatSQL(sqlInput)
    } catch (err) {
      return ''
    }
  }, [sqlInput, formatSQL])

  // 处理错误状态
  React.useEffect(() => {
    if (!sqlInput.trim()) {
      setError('')
      return
    }

    try {
      formatSQL(sqlInput)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SQL 格式化失败'
      setError(errorMessage)
    }
  }, [sqlInput, formatSQL])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载文件
  const downloadSQL = () => {
    if (!formattedSQL) return

    const blob = new Blob([formattedSQL], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.sql'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 示例 SQL
  const loadExample = () => {
    const exampleSQL = `select u.id,u.name,u.email,p.title,p.content,c.name as category from users u left join posts p on u.id=p.user_id inner join categories c on p.category_id=c.id where u.status='active' and p.published_at is not null and c.slug in('tech','business') group by u.id,c.id having count(p.id)>5 order by u.created_at desc,p.published_at desc limit 10 offset 20;`
    setSqlInput(exampleSQL)
  }

  // 清空内容
  const clearContent = () => {
    setSqlInput('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🗄️ SQL 格式化工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            格式化和美化 SQL 语句，提高代码可读性
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 缩进大小 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                缩进大小
              </label>
              <select
                value={options.indentSize}
                onChange={(e) => setOptions(prev => ({ ...prev, indentSize: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 空格</option>
                <option value={4}>4 空格</option>
                <option value={8}>8 空格</option>
              </select>
            </div>

            {/* 关键字大小写 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                关键字大小写
              </label>
              <select
                value={options.keywordCase}
                onChange={(e) => setOptions(prev => ({ ...prev, keywordCase: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="upper">大写</option>
                <option value="lower">小写</option>
                <option value="capitalize">首字母大写</option>
              </select>
            </div>

            {/* 示例按钮 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                操作
              </label>
              <button
                onClick={loadExample}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                加载示例
              </button>
            </div>

            {/* 清空按钮 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                &nbsp;
              </label>
              <button
                onClick={clearContent}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：SQL 输入 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Database className="w-5 h-5" />
                SQL 输入
              </h3>
            </div>
            <div className="p-4">
              <textarea
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                placeholder="输入 SQL 语句..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              {sqlInput && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  输入长度: {sqlInput.length} 字符
                </div>
              )}
            </div>
          </div>

          {/* 右侧：格式化输出 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  格式化输出
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(formattedSQL)}
                    disabled={!formattedSQL}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    复制
                  </button>
                  <button
                    onClick={downloadSQL}
                    disabled={!formattedSQL}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    下载
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={formattedSQL}
                readOnly
                placeholder="格式化的 SQL 将显示在这里..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none"
              />
              
              {formattedSQL && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  输出长度: {formattedSQL.length} 字符 • 行数: {formattedSQL.split('\n').length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 格式化规则说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            格式化规则
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">基本规则</h4>
              <ul className="space-y-1">
                <li>• 关键字统一大小写格式</li>
                <li>• 主要子句独占一行</li>
                <li>• 字段列表换行对齐</li>
                <li>• 括号内容适当缩进</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">支持特性</h4>
              <ul className="space-y-1">
                <li>• SELECT、INSERT、UPDATE、DELETE 语句</li>
                <li>• JOIN 子句格式化</li>
                <li>• 子查询缩进</li>
                <li>• 条件表达式对齐</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 自动识别 SQL 关键字</li>
                <li>• 智能缩进和换行</li>
                <li>• 可自定义格式化选项</li>
                <li>• 支持复杂查询格式化</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 粘贴压缩的 SQL 语句</li>
                <li>• 调整缩进和大小写偏好</li>
                <li>• 复制格式化结果</li>
                <li>• 下载为 .sql 文件</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
