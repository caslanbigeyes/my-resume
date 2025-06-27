'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { BarChart3, PieChart, LineChart, Download, Upload, Settings, Palette } from 'lucide-react'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string
    fill?: boolean
  }[]
}

interface ChartOptions {
  type: 'bar' | 'line' | 'pie' | 'doughnut'
  title: string
  width: number
  height: number
  colors: string[]
  showLegend: boolean
  showGrid: boolean
}

/**
 * 图表生成器组件
 * 创建各种类型的数据图表
 */
export default function ChartGeneratorPage() {
  const [chartData, setChartData] = useState<ChartData>({
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    datasets: [{
      label: '销售额',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    }]
  })
  
  const [options, setOptions] = useState<ChartOptions>({
    type: 'bar',
    title: '月度销售数据',
    width: 800,
    height: 400,
    colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    showLegend: true,
    showGrid: true
  })

  const [csvInput, setCsvInput] = useState('')
  const [error, setError] = useState('')

  // 预设颜色方案
  const colorSchemes = {
    default: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD1FF', '#E0BBE4'],
    vibrant: ['#FF5722', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'],
    monochrome: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1'],
    warm: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C'],
    cool: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A8DADC']
  }

  // 解析 CSV 数据
  const parseCSVData = useCallback((csv: string) => {
    try {
      const lines = csv.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('CSV 数据至少需要包含标题行和一行数据')
      }

      const headers = lines[0].split(',').map(h => h.trim())
      const labels = headers.slice(1) // 第一列作为标签，其余作为数据列

      const datasets = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim())
        const label = values[0]
        const data = values.slice(1).map(v => parseFloat(v) || 0)
        
        const color = options.colors[index % options.colors.length]
        return {
          label,
          data,
          backgroundColor: [color],
          borderColor: color,
          fill: false
        }
      })

      setChartData({ labels, datasets })
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV 解析失败')
    }
  }, [options.colors])

  // 生成 Chart.js 配置
  const chartConfig = useMemo(() => {
    const config = {
      type: options.type,
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: options.type === 'pie' || options.type === 'doughnut' 
            ? options.colors 
            : options.colors[index % options.colors.length],
          borderColor: options.colors[index % options.colors.length],
          borderWidth: 2
        }))
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: !!options.title,
            text: options.title,
            font: { size: 16 }
          },
          legend: {
            display: options.showLegend
          }
        },
        scales: options.type !== 'pie' && options.type !== 'doughnut' ? {
          y: {
            beginAtZero: true,
            grid: { display: options.showGrid }
          },
          x: {
            grid: { display: options.showGrid }
          }
        } : {}
      }
    }
    return config
  }, [chartData, options])

  // 生成 SVG 图表（简化版本）
  const generateSVGChart = useCallback(() => {
    const { width, height } = options
    const padding = 60
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    if (options.type === 'bar') {
      const maxValue = Math.max(...chartData.datasets[0].data)
      const barWidth = chartWidth / chartData.labels.length * 0.8
      const barSpacing = chartWidth / chartData.labels.length * 0.2

      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${width}" height="${height}" fill="white"/>
          
          <!-- 标题 -->
          <text x="${width/2}" y="30" text-anchor="middle" font-size="16" font-weight="bold">${options.title}</text>
          
          <!-- 坐标轴 -->
          <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#333" stroke-width="2"/>
          <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#333" stroke-width="2"/>
          
          <!-- 柱状图 -->
          ${chartData.labels.map((label, index) => {
            const value = chartData.datasets[0].data[index]
            const barHeight = (value / maxValue) * chartHeight
            const x = padding + index * (barWidth + barSpacing) + barSpacing / 2
            const y = height - padding - barHeight
            const color = options.colors[index % options.colors.length]
            
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}"/>
              <text x="${x + barWidth/2}" y="${height - padding + 20}" text-anchor="middle" font-size="12">${label}</text>
              <text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="10">${value}</text>
            `
          }).join('')}
        </svg>
      `
    } else if (options.type === 'pie') {
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(chartWidth, chartHeight) / 2 * 0.8
      const total = chartData.datasets[0].data.reduce((sum, value) => sum + value, 0)
      
      let currentAngle = -Math.PI / 2
      
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${width}" height="${height}" fill="white"/>
          
          <!-- 标题 -->
          <text x="${centerX}" y="30" text-anchor="middle" font-size="16" font-weight="bold">${options.title}</text>
          
          <!-- 饼图 -->
          ${chartData.labels.map((label, index) => {
            const value = chartData.datasets[0].data[index]
            const angle = (value / total) * 2 * Math.PI
            const endAngle = currentAngle + angle
            
            const x1 = centerX + radius * Math.cos(currentAngle)
            const y1 = centerY + radius * Math.sin(currentAngle)
            const x2 = centerX + radius * Math.cos(endAngle)
            const y2 = centerY + radius * Math.sin(endAngle)
            
            const largeArcFlag = angle > Math.PI ? 1 : 0
            const color = options.colors[index % options.colors.length]
            
            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
            
            // 标签位置
            const labelAngle = currentAngle + angle / 2
            const labelX = centerX + (radius + 20) * Math.cos(labelAngle)
            const labelY = centerY + (radius + 20) * Math.sin(labelAngle)
            
            currentAngle = endAngle
            
            return `
              <path d="${path}" fill="${color}" stroke="white" stroke-width="2"/>
              <text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="12">${label}</text>
            `
          }).join('')}
        </svg>
      `
    }
    
    return '<svg><text>暂不支持此图表类型</text></svg>'
  }, [chartData, options])

  // 下载 SVG
  const downloadSVG = () => {
    const svgContent = generateSVGChart()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 下载配置
  const downloadConfig = () => {
    const config = JSON.stringify(chartConfig, null, 2)
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 加载示例数据
  const loadExample = () => {
    const examples = {
      bar: {
        labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
        datasets: [{
          label: '销售额',
          data: [12, 19, 3, 5, 2, 3]
        }]
      },
      line: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          label: '访问量',
          data: [65, 59, 80, 81, 56, 55, 40]
        }]
      },
      pie: {
        labels: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'],
        datasets: [{
          label: '浏览器占比',
          data: [45, 25, 15, 10, 5]
        }]
      },
      doughnut: {
        labels: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'],
        datasets: [{
          label: '浏览器占比',
          data: [45, 25, 15, 10, 5]
        }]
      }
    }

    setChartData(examples[options.type] || examples.bar)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📊 图表生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            创建各种类型的数据可视化图表
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：设置面板 */}
          <div className="space-y-6">
            {/* 图表类型 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                图表类型
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'bar', label: '柱状图', icon: BarChart3 },
                  { type: 'line', label: '折线图', icon: LineChart },
                  { type: 'pie', label: '饼图', icon: PieChart },
                  { type: 'doughnut', label: '环形图', icon: PieChart }
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setOptions(prev => ({ ...prev, type: type as any }))}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      options.type === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 图表设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                图表设置
              </h3>
              
              <div className="space-y-4">
                {/* 标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    图表标题
                  </label>
                  <input
                    type="text"
                    value={options.title}
                    onChange={(e) => setOptions(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 尺寸 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      宽度
                    </label>
                    <input
                      type="number"
                      value={options.width}
                      onChange={(e) => setOptions(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      高度
                    </label>
                    <input
                      type="number"
                      value={options.height}
                      onChange={(e) => setOptions(prev => ({ ...prev, height: parseInt(e.target.value) || 400 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 选项 */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.showLegend}
                      onChange={(e) => setOptions(prev => ({ ...prev, showLegend: e.target.checked }))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">显示图例</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.showGrid}
                      onChange={(e) => setOptions(prev => ({ ...prev, showGrid: e.target.checked }))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">显示网格</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 颜色方案 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                颜色方案
              </h3>
              
              <div className="space-y-3">
                {Object.entries(colorSchemes).map(([name, colors]) => (
                  <button
                    key={name}
                    onClick={() => setOptions(prev => ({ ...prev, colors }))}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {colors.slice(0, 6).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 中间和右侧：数据输入和图表预览 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 数据输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    数据输入
                  </h3>
                  <button
                    onClick={loadExample}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    加载示例
                  </button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="输入 CSV 格式数据，第一行为标题，第一列为标签&#10;例如：&#10;月份,销售额&#10;一月,12&#10;二月,19&#10;三月,3"
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => parseCSVData(csvInput)}
                    disabled={!csvInput.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    解析数据
                  </button>
                </div>

                {error && (
                  <div className="mt-3 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* 图表预览 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">图表预览</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadSVG}
                      className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      SVG
                    </button>
                    <button
                      onClick={downloadConfig}
                      className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      配置
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div 
                  className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: generateSVGChart() }}
                />
              </div>
            </div>

            {/* Chart.js 配置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chart.js 配置</h3>
              </div>
              <div className="p-4">
                <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto">
                  <code className="text-gray-900 dark:text-gray-100">
                    {JSON.stringify(chartConfig, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
