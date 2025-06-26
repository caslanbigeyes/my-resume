'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { ArrowRightLeft, Download, Upload, FileText, Database } from 'lucide-react'

/**
 * CSV/JSON互转工具组件
 * CSV和JSON格式互相转换
 */
export default function CsvJsonConvertTool() {
  const [inputData, setInputData] = useState('')
  const [inputFormat, setInputFormat] = useState<'csv' | 'json'>('csv')
  const [csvOptions, setCsvOptions] = useState({
    delimiter: ',',
    hasHeader: true,
    quote: '"'
  })

  /**
   * 转换数据
   */
  const convertedData = useMemo(() => {
    if (!inputData.trim()) return ''

    try {
      if (inputFormat === 'csv') {
        return csvToJson(inputData, csvOptions)
      } else {
        return jsonToCsv(inputData, csvOptions)
      }
    } catch (error) {
      return `转换错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }, [inputData, inputFormat, csvOptions])

  /**
   * CSV转JSON
   */
  const csvToJson = (csvData: string, options: typeof csvOptions): string => {
    const lines = csvData.trim().split('\n')
    if (lines.length === 0) return '[]'

    const delimiter = options.delimiter
    const result: any[] = []

    // 解析CSV行
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]
        
        if (char === options.quote) {
          if (inQuotes && nextChar === options.quote) {
            current += char
            i++ // 跳过下一个引号
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current.trim())
      return result
    }

    let headers: string[] = []
    let startIndex = 0

    if (options.hasHeader) {
      headers = parseCSVLine(lines[0])
      startIndex = 1
    } else {
      // 如果没有标题，使用 column1, column2, ... 作为键名
      const firstLine = parseCSVLine(lines[0])
      headers = firstLine.map((_, index) => `column${index + 1}`)
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = parseCSVLine(line)
      const obj: any = {}

      headers.forEach((header, index) => {
        const value = values[index] || ''
        // 尝试转换数字
        const numValue = Number(value)
        if (!isNaN(numValue) && value !== '') {
          obj[header] = numValue
        } else if (value.toLowerCase() === 'true') {
          obj[header] = true
        } else if (value.toLowerCase() === 'false') {
          obj[header] = false
        } else {
          obj[header] = value
        }
      })

      result.push(obj)
    }

    return JSON.stringify(result, null, 2)
  }

  /**
   * JSON转CSV
   */
  const jsonToCsv = (jsonData: string, options: typeof csvOptions): string => {
    const data = JSON.parse(jsonData)
    
    if (!Array.isArray(data)) {
      throw new Error('JSON数据必须是数组格式')
    }

    if (data.length === 0) {
      return ''
    }

    // 获取所有可能的键名
    const allKeys = new Set<string>()
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key))
      }
    })

    const headers = Array.from(allKeys)
    const delimiter = options.delimiter
    const quote = options.quote

    // 转义CSV值
    const escapeCSVValue = (value: any): string => {
      let str = String(value)
      
      // 如果包含分隔符、引号或换行符，需要用引号包围
      if (str.includes(delimiter) || str.includes(quote) || str.includes('\n') || str.includes('\r')) {
        // 转义引号
        str = str.replace(new RegExp(quote, 'g'), quote + quote)
        str = quote + str + quote
      }
      
      return str
    }

    let csv = ''

    // 添加标题行
    if (options.hasHeader) {
      csv += headers.map(header => escapeCSVValue(header)).join(delimiter) + '\n'
    }

    // 添加数据行
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item && typeof item === 'object' ? item[header] : ''
        return escapeCSVValue(value ?? '')
      })
      csv += row.join(delimiter) + '\n'
    })

    return csv.trim()
  }

  /**
   * 切换输入格式
   */
  const toggleFormat = () => {
    setInputFormat(prev => prev === 'csv' ? 'json' : 'csv')
    setInputData('')
  }

  /**
   * 下载结果
   */
  const downloadResult = () => {
    if (!convertedData) return

    const outputFormat = inputFormat === 'csv' ? 'json' : 'csv'
    const mimeType = outputFormat === 'json' ? 'application/json' : 'text/csv'
    const extension = outputFormat === 'json' ? 'json' : 'csv'

    const blob = new Blob([convertedData], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted-data.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 处理文件上传
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputData(content)
    }
    reader.readAsText(file)
  }

  /**
   * 示例数据
   */
  const loadExample = (type: 'csv' | 'json') => {
    if (type === 'csv') {
      setInputFormat('csv')
      setInputData(`name,age,city,active
John Doe,30,New York,true
Jane Smith,25,Los Angeles,false
Bob Johnson,35,Chicago,true`)
    } else {
      setInputFormat('json')
      setInputData(`[
  {
    "name": "John Doe",
    "age": 30,
    "city": "New York",
    "active": true
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "city": "Los Angeles",
    "active": false
  },
  {
    "name": "Bob Johnson",
    "age": 35,
    "city": "Chicago",
    "active": true
  }
]`)
    }
  }

  const outputFormat = inputFormat === 'csv' ? 'JSON' : 'CSV'

  return (
    <ToolLayout
      title="CSV/JSON互转"
      description="CSV和JSON格式互相转换"
      category="文件文档"
      icon="🔄"
    >
      <div className="space-y-6">
        {/* 格式切换 */}
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            inputFormat === 'csv' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <Database className="w-5 h-5" />
            <span className="font-medium">CSV</span>
          </div>
          
          <button
            onClick={toggleFormat}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="切换格式"
          >
            <ArrowRightLeft className="w-6 h-6" />
          </button>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            inputFormat === 'json' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <FileText className="w-5 h-5" />
            <span className="font-medium">JSON</span>
          </div>
        </div>

        {/* CSV选项 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">CSV选项</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分隔符
              </label>
              <select
                value={csvOptions.delimiter}
                onChange={(e) => setCsvOptions(prev => ({ ...prev, delimiter: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value=",">逗号 (,)</option>
                <option value=";">分号 (;)</option>
                <option value="\t">制表符 (\t)</option>
                <option value="|">竖线 (|)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                引号字符
              </label>
              <select
                value={csvOptions.quote}
                onChange={(e) => setCsvOptions(prev => ({ ...prev, quote: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value='"'>双引号 (")</option>
                <option value="'">单引号 (')</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={csvOptions.hasHeader}
                  onChange={(e) => setCsvOptions(prev => ({ ...prev, hasHeader: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">包含标题行</span>
              </label>
            </div>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">
              输入 {inputFormat.toUpperCase()} 数据
            </h3>
            <div className="flex gap-2">
              <input
                type="file"
                accept={inputFormat === 'csv' ? '.csv' : '.json'}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                上传文件
              </label>
              <button
                onClick={() => loadExample('csv')}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                CSV示例
              </button>
              <button
                onClick={() => loadExample('json')}
                className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                JSON示例
              </button>
            </div>
          </div>
          
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder={`粘贴或输入${inputFormat.toUpperCase()}数据...`}
            className="w-full h-64 p-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 输出区域 */}
        {convertedData && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                转换为 {outputFormat}
              </h3>
              <button
                onClick={downloadResult}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                下载 {outputFormat}
              </button>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border max-h-64 overflow-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {convertedData}
              </pre>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 支持CSV和JSON格式的双向转换</li>
            <li>• 可自定义CSV分隔符、引号字符等选项</li>
            <li>• 自动检测和转换数据类型（数字、布尔值）</li>
            <li>• 支持文件上传和结果下载</li>
            <li>• 处理包含特殊字符的CSV字段</li>
            <li>• 提供示例数据快速开始</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
