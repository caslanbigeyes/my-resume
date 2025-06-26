'use client'

import React, { useState } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { RefreshCw, Copy, Dices } from 'lucide-react'

/**
 * 随机数生成工具组件
 * 生成指定范围的随机数
 */
export default function RandomNumberTool() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [count, setCount] = useState(1)
  const [allowDuplicates, setAllowDuplicates] = useState(true)
  const [results, setResults] = useState<number[]>([])
  const [history, setHistory] = useState<number[][]>([])

  /**
   * 生成随机数
   */
  const generateNumbers = () => {
    if (min > max) {
      alert('最小值不能大于最大值')
      return
    }

    if (!allowDuplicates && (max - min + 1) < count) {
      alert('在不允许重复的情况下，数字范围不足以生成指定数量的随机数')
      return
    }

    const newResults: number[] = []
    const used = new Set<number>()

    for (let i = 0; i < count; i++) {
      let randomNum: number

      if (allowDuplicates) {
        randomNum = Math.floor(Math.random() * (max - min + 1)) + min
      } else {
        do {
          randomNum = Math.floor(Math.random() * (max - min + 1)) + min
        } while (used.has(randomNum))
        used.add(randomNum)
      }

      newResults.push(randomNum)
    }

    setResults(newResults)
    setHistory(prev => [newResults, ...prev.slice(0, 9)]) // 保留最近10次结果
  }

  /**
   * 复制结果
   */
  const copyResults = async () => {
    try {
      const text = results.join(', ')
      await navigator.clipboard.writeText(text)
      alert('结果已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 快速设置
   */
  const quickSets = [
    { name: '1-6 (骰子)', min: 1, max: 6, count: 1 },
    { name: '1-10', min: 1, max: 10, count: 1 },
    { name: '1-100', min: 1, max: 100, count: 1 },
    { name: '彩票号码', min: 1, max: 49, count: 6 },
    { name: '0-1 (概率)', min: 0, max: 1, count: 1 },
    { name: '1-1000', min: 1, max: 1000, count: 1 }
  ]

  /**
   * 应用快速设置
   */
  const applyQuickSet = (preset: typeof quickSets[0]) => {
    setMin(preset.min)
    setMax(preset.max)
    setCount(preset.count)
    setAllowDuplicates(preset.name !== '彩票号码')
  }

  /**
   * 统计信息
   */
  const getStats = () => {
    if (results.length === 0) return null

    const sum = results.reduce((a, b) => a + b, 0)
    const avg = sum / results.length
    const sortedResults = [...results].sort((a, b) => a - b)
    const median = sortedResults.length % 2 === 0
      ? (sortedResults[sortedResults.length / 2 - 1] + sortedResults[sortedResults.length / 2]) / 2
      : sortedResults[Math.floor(sortedResults.length / 2)]

    return {
      sum,
      average: avg,
      median,
      min: Math.min(...results),
      max: Math.max(...results)
    }
  }

  const stats = getStats()

  return (
    <ToolLayout
      title="随机数生成"
      description="生成指定范围随机数"
      category="数学单位"
      icon="🎲"
    >
      <div className="space-y-6">
        {/* 配置区域 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">生成设置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最小值
              </label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大值
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                生成数量
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowDuplicates}
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">允许重复数字</span>
            </label>
          </div>

          <button
            onClick={generateNumbers}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Dices className="w-5 h-5" />
            生成随机数
          </button>
        </div>

        {/* 快速设置 */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">快速设置</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickSets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyQuickSet(preset)}
                className="p-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 结果显示 */}
        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">生成结果</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={generateNumbers}
                  className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新生成
                </button>
                <button
                  onClick={copyResults}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex flex-wrap gap-2">
                {results.map((num, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-2 bg-blue-500 text-white rounded-lg font-mono text-lg"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* 统计信息 */}
            {stats && results.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{stats.sum}</div>
                  <div className="text-gray-600">总和</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{stats.average.toFixed(2)}</div>
                  <div className="text-gray-600">平均值</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{stats.median}</div>
                  <div className="text-gray-600">中位数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{stats.min}</div>
                  <div className="text-gray-600">最小值</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{stats.max}</div>
                  <div className="text-gray-600">最大值</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">历史记录</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((record, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {record.map((num, numIndex) => (
                        <span
                          key={numIndex}
                          className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm font-mono"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setResults(record)}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      恢复
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 设置最小值和最大值范围</li>
            <li>• 选择要生成的随机数数量</li>
            <li>• 可选择是否允许重复数字</li>
            <li>• 提供常用场景的快速设置</li>
            <li>• 显示统计信息（总和、平均值、中位数等）</li>
            <li>• 保存最近10次生成的历史记录</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
