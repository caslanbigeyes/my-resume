'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Upload, Download, FileText, Search, Filter, BarChart3, Eye } from 'lucide-react'

interface CSVData {
  headers: string[]
  rows: string[][]
  totalRows: number
  totalColumns: number
}

/**
 * CSV 预览工具组件
 * 上传和预览 CSV 文件数据
 */
export default function CsvPreviewPage() {
  const [csvData, setCsvData] = useState<CSVData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [error, setError] = useState('')

  // 解析 CSV 内容
  const parseCSV = useCallback((content: string): CSVData => {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length === 0) {
      throw new Error('CSV 文件为空')
    }

    // 简单的 CSV 解析（处理逗号分隔和引号包围的字段）
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0])
    const rows = lines.slice(1).map(line => parseCSVLine(line))

    // 确保所有行都有相同的列数
    const maxColumns = Math.max(headers.length, ...rows.map(row => row.length))
    const normalizedRows = rows.map(row => {
      const normalizedRow = [...row]
      while (normalizedRow.length < maxColumns) {
        normalizedRow.push('')
      }
      return normalizedRow
    })

    return {
      headers,
      rows: normalizedRows,
      totalRows: normalizedRows.length,
      totalColumns: headers.length
    }
  }, [])

  // 处理文件上传
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('请选择 CSV 文件')
      return
    }

    try {
      const content = await file.text()
      const data = parseCSV(content)
      setCsvData(data)
      setError('')
      setCurrentPage(1)
      setSearchTerm('')
      setSelectedColumn('')
      setSortColumn('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败')
      setCsvData(null)
    }
  }, [parseCSV])

  // 过滤和搜索数据
  const filteredData = useMemo(() => {
    if (!csvData) return null

    let filtered = csvData.rows

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.some(cell =>
          cell.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // 列过滤
    if (selectedColumn) {
      const columnIndex = csvData.headers.indexOf(selectedColumn)
      if (columnIndex !== -1) {
        filtered = filtered.filter(row => row[columnIndex] && row[columnIndex].trim())
      }
    }

    // 排序
    if (sortColumn) {
      const columnIndex = csvData.headers.indexOf(sortColumn)
      if (columnIndex !== -1) {
        filtered = [...filtered].sort((a, b) => {
          const aVal = a[columnIndex] || ''
          const bVal = b[columnIndex] || ''
          
          // 尝试数字排序
          const aNum = parseFloat(aVal)
          const bNum = parseFloat(bVal)
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
          }
          
          // 字符串排序
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        })
      }
    }

    return {
      ...csvData,
      rows: filtered,
      totalRows: filtered.length
    }
  }, [csvData, searchTerm, selectedColumn, sortColumn, sortDirection])

  // 分页数据
  const paginatedData = useMemo(() => {
    if (!filteredData) return null

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedRows = filteredData.rows.slice(startIndex, endIndex)

    return {
      ...filteredData,
      rows: paginatedRows,
      currentPage,
      totalPages: Math.ceil(filteredData.totalRows / rowsPerPage),
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, filteredData.totalRows)
    }
  }, [filteredData, currentPage, rowsPerPage])

  // 列统计信息
  const columnStats = useMemo(() => {
    if (!csvData) return null

    return csvData.headers.map((header, index) => {
      const values = csvData.rows.map(row => row[index]).filter(val => val && val.trim())
      const uniqueValues = new Set(values)
      const numericValues = values.map(val => parseFloat(val)).filter(val => !isNaN(val))
      
      return {
        name: header,
        totalValues: values.length,
        uniqueValues: uniqueValues.size,
        emptyValues: csvData.rows.length - values.length,
        isNumeric: numericValues.length > values.length * 0.8,
        min: numericValues.length > 0 ? Math.min(...numericValues) : null,
        max: numericValues.length > 0 ? Math.max(...numericValues) : null,
        avg: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : null
      }
    })
  }, [csvData])

  // 处理排序
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // 下载过滤后的数据
  const downloadFilteredCSV = () => {
    if (!filteredData) return

    const csvContent = [
      filteredData.headers.join(','),
      ...filteredData.rows.map(row => 
        row.map(cell => cell.includes(',') ? `"${cell}"` : cell).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'filtered-data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 示例 CSV 数据
  const loadExample = () => {
    const exampleCSV = `姓名,年龄,城市,职业,薪资
张三,28,北京,软件工程师,15000
李四,32,上海,产品经理,18000
王五,25,广州,设计师,12000
赵六,30,深圳,数据分析师,16000
钱七,27,杭州,前端开发,14000
孙八,35,南京,项目经理,20000
周九,29,武汉,后端开发,15500
吴十,26,成都,UI设计师,11000`

    try {
      const data = parseCSV(exampleCSV)
      setCsvData(data)
      setError('')
      setCurrentPage(1)
    } catch (err) {
      setError('示例数据加载失败')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📊 CSV 预览工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            上传和预览 CSV 文件数据，支持搜索、过滤和排序
          </p>
        </div>

        {/* 文件上传区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              文件上传
            </h3>
            <button
              onClick={loadExample}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              加载示例
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <label className="cursor-pointer">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                点击选择 CSV 文件或拖拽文件到此处
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* 数据控制面板 */}
        {csvData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 搜索 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  搜索
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索数据..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 列过滤 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  列过滤
                </label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">所有列</option>
                  {csvData.headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              {/* 每页行数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  每页行数
                </label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>

              {/* 下载 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  操作
                </label>
                <button
                  onClick={downloadFilteredCSV}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载过滤数据
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 数据统计 */}
        {csvData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredData?.totalRows || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">总行数</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {csvData.totalColumns}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">总列数</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {paginatedData?.totalPages || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">总页数</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {paginatedData?.currentPage || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">当前页</div>
            </div>
          </div>
        )}

        {/* 数据表格 */}
        {paginatedData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  数据预览
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  显示 {paginatedData.startIndex}-{paginatedData.endIndex} 条，共 {filteredData?.totalRows} 条
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {paginatedData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort(header)}
                      >
                        <div className="flex items-center gap-2">
                          {header}
                          {sortColumn === header && (
                            <span className="text-blue-500">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate"
                          title={cell}
                        >
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页控件 */}
            {paginatedData.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  上一页
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  第 {currentPage} 页，共 {paginatedData.totalPages} 页
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, currentPage + 1))}
                  disabled={currentPage === paginatedData.totalPages}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}

        {/* 列统计信息 */}
        {columnStats && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                列统计信息
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columnStats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{stat.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>总值: {stat.totalValues}</div>
                      <div>唯一值: {stat.uniqueValues}</div>
                      <div>空值: {stat.emptyValues}</div>
                      {stat.isNumeric && (
                        <>
                          <div>最小值: {stat.min?.toFixed(2)}</div>
                          <div>最大值: {stat.max?.toFixed(2)}</div>
                          <div>平均值: {stat.avg?.toFixed(2)}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!csvData && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            请上传 CSV 文件或加载示例数据
          </div>
        )}
      </div>
    </div>
  )
}
