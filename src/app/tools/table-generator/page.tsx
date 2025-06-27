'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Plus, Minus, Download, Copy, Table, Settings, Upload } from 'lucide-react'

interface TableData {
  headers: string[]
  rows: string[][]
}

interface TableStyle {
  theme: 'default' | 'striped' | 'bordered' | 'minimal' | 'dark'
  headerBg: string
  headerText: string
  evenRowBg: string
  oddRowBg: string
  borderColor: string
  fontSize: 'sm' | 'base' | 'lg'
  padding: 'sm' | 'md' | 'lg'
}

/**
 * 数据表格生成器组件
 * 创建和自定义数据表格
 */
export default function TableGeneratorPage() {
  const [tableData, setTableData] = useState<TableData>({
    headers: ['姓名', '年龄', '城市', '职业'],
    rows: [
      ['张三', '25', '北京', '工程师'],
      ['李四', '30', '上海', '设计师'],
      ['王五', '28', '广州', '产品经理']
    ]
  })

  const [tableStyle, setTableStyle] = useState<TableStyle>({
    theme: 'default',
    headerBg: '#f3f4f6',
    headerText: '#1f2937',
    evenRowBg: '#ffffff',
    oddRowBg: '#f9fafb',
    borderColor: '#e5e7eb',
    fontSize: 'base',
    padding: 'md'
  })

  const [csvInput, setCsvInput] = useState('')
  const [error, setError] = useState('')

  // 预设主题
  const themes = {
    default: {
      headerBg: '#f3f4f6',
      headerText: '#1f2937',
      evenRowBg: '#ffffff',
      oddRowBg: '#f9fafb',
      borderColor: '#e5e7eb'
    },
    striped: {
      headerBg: '#3b82f6',
      headerText: '#ffffff',
      evenRowBg: '#ffffff',
      oddRowBg: '#f8fafc',
      borderColor: '#e2e8f0'
    },
    bordered: {
      headerBg: '#1f2937',
      headerText: '#ffffff',
      evenRowBg: '#ffffff',
      oddRowBg: '#ffffff',
      borderColor: '#374151'
    },
    minimal: {
      headerBg: 'transparent',
      headerText: '#374151',
      evenRowBg: 'transparent',
      oddRowBg: 'transparent',
      borderColor: '#e5e7eb'
    },
    dark: {
      headerBg: '#374151',
      headerText: '#f9fafb',
      evenRowBg: '#1f2937',
      oddRowBg: '#111827',
      borderColor: '#4b5563'
    }
  }

  // 添加列
  const addColumn = useCallback(() => {
    setTableData(prev => ({
      headers: [...prev.headers, `列${prev.headers.length + 1}`],
      rows: prev.rows.map(row => [...row, ''])
    }))
  }, [])

  // 删除列
  const removeColumn = useCallback((index: number) => {
    if (tableData.headers.length <= 1) return
    
    setTableData(prev => ({
      headers: prev.headers.filter((_, i) => i !== index),
      rows: prev.rows.map(row => row.filter((_, i) => i !== index))
    }))
  }, [tableData.headers.length])

  // 添加行
  const addRow = useCallback(() => {
    setTableData(prev => ({
      ...prev,
      rows: [...prev.rows, new Array(prev.headers.length).fill('')]
    }))
  }, [])

  // 删除行
  const removeRow = useCallback((index: number) => {
    if (tableData.rows.length <= 1) return
    
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index)
    }))
  }, [tableData.rows.length])

  // 更新表头
  const updateHeader = useCallback((index: number, value: string) => {
    setTableData(prev => ({
      ...prev,
      headers: prev.headers.map((header, i) => i === index ? value : header)
    }))
  }, [])

  // 更新单元格
  const updateCell = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map((row, i) => 
        i === rowIndex 
          ? row.map((cell, j) => j === colIndex ? value : cell)
          : row
      )
    }))
  }, [])

  // 解析 CSV 数据
  const parseCSV = useCallback(() => {
    if (!csvInput.trim()) {
      setError('请输入 CSV 数据')
      return
    }

    try {
      const lines = csvInput.trim().split('\n')
      if (lines.length < 2) {
        setError('CSV 数据至少需要包含标题行和一行数据')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
      const rows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      )

      // 确保所有行都有相同的列数
      const maxCols = Math.max(headers.length, ...rows.map(row => row.length))
      const normalizedRows = rows.map(row => {
        const newRow = [...row]
        while (newRow.length < maxCols) {
          newRow.push('')
        }
        return newRow.slice(0, maxCols)
      })

      const normalizedHeaders = [...headers]
      while (normalizedHeaders.length < maxCols) {
        normalizedHeaders.push(`列${normalizedHeaders.length + 1}`)
      }

      setTableData({
        headers: normalizedHeaders.slice(0, maxCols),
        rows: normalizedRows
      })
      setError('')
    } catch (err) {
      setError('CSV 解析失败，请检查格式')
    }
  }, [csvInput])

  // 应用主题
  const applyTheme = useCallback((themeName: keyof typeof themes) => {
    const theme = themes[themeName]
    setTableStyle(prev => ({
      ...prev,
      theme: themeName,
      ...theme
    }))
  }, [])

  // 生成 HTML 表格
  const generateHTML = useMemo(() => {
    const paddingClass = {
      sm: 'padding: 8px',
      md: 'padding: 12px',
      lg: 'padding: 16px'
    }[tableStyle.padding]

    const fontSizeClass = {
      sm: 'font-size: 14px',
      base: 'font-size: 16px',
      lg: 'font-size: 18px'
    }[tableStyle.fontSize]

    const tableStyles = `
      border-collapse: collapse;
      width: 100%;
      ${fontSizeClass};
      border: 1px solid ${tableStyle.borderColor};
    `

    const headerStyles = `
      background-color: ${tableStyle.headerBg};
      color: ${tableStyle.headerText};
      ${paddingClass};
      border: 1px solid ${tableStyle.borderColor};
      font-weight: bold;
      text-align: left;
    `

    const cellStyles = (isEven: boolean) => `
      background-color: ${isEven ? tableStyle.evenRowBg : tableStyle.oddRowBg};
      ${paddingClass};
      border: 1px solid ${tableStyle.borderColor};
    `

    return `<table style="${tableStyles}">
  <thead>
    <tr>
      ${tableData.headers.map(header => `<th style="${headerStyles}">${header}</th>`).join('\n      ')}
    </tr>
  </thead>
  <tbody>
    ${tableData.rows.map((row, index) => `<tr>
      ${row.map(cell => `<td style="${cellStyles(index % 2 === 0)}">${cell}</td>`).join('\n      ')}
    </tr>`).join('\n    ')}
  </tbody>
</table>`
  }, [tableData, tableStyle])

  // 生成 CSV
  const generateCSV = useMemo(() => {
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const csvLines = [
      tableData.headers.map(escapeCSV).join(','),
      ...tableData.rows.map(row => row.map(escapeCSV).join(','))
    ]

    return csvLines.join('\n')
  }, [tableData])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载文件
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 加载示例数据
  const loadExample = () => {
    setTableData({
      headers: ['产品名称', '价格', '库存', '分类', '评分'],
      rows: [
        ['iPhone 14', '¥5999', '50', '手机', '4.8'],
        ['MacBook Pro', '¥12999', '20', '电脑', '4.9'],
        ['iPad Air', '¥4399', '30', '平板', '4.7'],
        ['AirPods Pro', '¥1899', '100', '耳机', '4.6'],
        ['Apple Watch', '¥2999', '40', '手表', '4.5']
      ]
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📊 数据表格生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            创建和自定义数据表格，支持多种样式和导出格式
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 表格操作 */}
            <div className="flex gap-2">
              <button
                onClick={addColumn}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加列
              </button>
              <button
                onClick={addRow}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加行
              </button>
              <button
                onClick={loadExample}
                className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                示例数据
              </button>
            </div>

            {/* 主题选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">主题:</span>
              <select
                value={tableStyle.theme}
                onChange={(e) => applyTheme(e.target.value as keyof typeof themes)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="default">默认</option>
                <option value="striped">条纹</option>
                <option value="bordered">边框</option>
                <option value="minimal">简约</option>
                <option value="dark">深色</option>
              </select>
            </div>

            {/* 导出按钮 */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => copyToClipboard(generateHTML)}
                className="px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                复制HTML
              </button>
              <button
                onClick={() => downloadFile(generateHTML, 'table.html', 'text/html')}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                下载HTML
              </button>
              <button
                onClick={() => downloadFile(generateCSV, 'table.csv', 'text/csv')}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                下载CSV
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：CSV 导入和样式设置 */}
          <div className="space-y-6">
            {/* CSV 导入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                CSV 导入
              </h3>
              
              <div className="space-y-4">
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="粘贴 CSV 数据...&#10;例如：&#10;姓名,年龄,城市&#10;张三,25,北京&#10;李四,30,上海"
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <button
                  onClick={parseCSV}
                  disabled={!csvInput.trim()}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  解析 CSV
                </button>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* 样式设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                样式设置
              </h3>
              
              <div className="space-y-4">
                {/* 字体大小 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    字体大小
                  </label>
                  <select
                    value={tableStyle.fontSize}
                    onChange={(e) => setTableStyle(prev => ({ ...prev, fontSize: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sm">小</option>
                    <option value="base">中</option>
                    <option value="lg">大</option>
                  </select>
                </div>

                {/* 内边距 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    内边距
                  </label>
                  <select
                    value={tableStyle.padding}
                    onChange={(e) => setTableStyle(prev => ({ ...prev, padding: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sm">紧凑</option>
                    <option value="md">标准</option>
                    <option value="lg">宽松</option>
                  </select>
                </div>

                {/* 颜色设置 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      表头背景色
                    </label>
                    <input
                      type="color"
                      value={tableStyle.headerBg}
                      onChange={(e) => setTableStyle(prev => ({ ...prev, headerBg: e.target.value }))}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      边框颜色
                    </label>
                    <input
                      type="color"
                      value={tableStyle.borderColor}
                      onChange={(e) => setTableStyle(prev => ({ ...prev, borderColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：表格编辑和预览 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 表格编辑 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Table className="w-5 h-5" />
                  表格编辑
                </h3>
              </div>
              
              <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {tableData.headers.map((header, index) => (
                        <th key={index} className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={header}
                              onChange={(e) => updateHeader(index, e.target.value)}
                              className="flex-1 px-2 py-1 border-0 bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 rounded"
                            />
                            <button
                              onClick={() => removeColumn(index)}
                              disabled={tableData.headers.length <= 1}
                              className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-gray-300 dark:border-gray-600 p-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {colIndex === 0 && (
                                <button
                                  onClick={() => removeRow(rowIndex)}
                                  disabled={tableData.rows.length <= 1}
                                  className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 表格预览 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">表格预览</h3>
              </div>
              
              <div className="p-4 overflow-x-auto">
                <div dangerouslySetInnerHTML={{ __html: generateHTML }} />
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 可视化表格编辑器</li>
                <li>• 支持 CSV 数据导入</li>
                <li>• 多种预设主题样式</li>
                <li>• 自定义颜色和样式</li>
                <li>• 导出 HTML 和 CSV 格式</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 点击单元格直接编辑内容</li>
                <li>• 使用示例数据快速开始</li>
                <li>• CSV 格式：用逗号分隔列</li>
                <li>• 支持实时预览样式效果</li>
                <li>• 可复制 HTML 代码到网页</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
