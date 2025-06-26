'use client'

import React, { useState, useEffect } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy, Clock, Calendar } from 'lucide-react'

/**
 * 时间戳转换工具组件
 * 时间戳与日期互相转换
 */
export default function UnixTimestampTool() {
  const [timestamp, setTimestamp] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  /**
   * 时间戳转日期
   */
  const timestampToDate = (ts: string): string => {
    try {
      const num = parseInt(ts)
      if (isNaN(num)) return '无效的时间戳'
      
      // 判断是秒还是毫秒
      const timestamp = ts.length === 10 ? num * 1000 : num
      const date = new Date(timestamp)
      
      if (isNaN(date.getTime())) return '无效的时间戳'
      
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Shanghai'
      })
    } catch (error) {
      return '转换失败'
    }
  }

  /**
   * 日期转时间戳
   */
  const dateToTimestamp = (dateStr: string): { seconds: number; milliseconds: number } | null => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return null
      
      const milliseconds = date.getTime()
      const seconds = Math.floor(milliseconds / 1000)
      
      return { seconds, milliseconds }
    } catch (error) {
      return null
    }
  }

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${type}已复制到剪贴板`)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 获取当前时间戳
   */
  const getCurrentTimestamp = () => {
    const now = Date.now()
    setTimestamp(Math.floor(now / 1000).toString())
  }

  /**
   * 获取当前日期时间
   */
  const getCurrentDateTime = () => {
    const now = new Date()
    const formatted = now.toISOString().slice(0, 16)
    setDateTime(formatted)
  }

  // 计算转换结果
  const timestampResult = timestamp ? timestampToDate(timestamp) : ''
  const dateResult = dateTime ? dateToTimestamp(dateTime) : null

  // 常用时间戳
  const commonTimestamps = [
    { name: '当前时间', value: Math.floor(Date.now() / 1000) },
    { name: '今天开始', value: Math.floor(new Date().setHours(0, 0, 0, 0) / 1000) },
    { name: '昨天开始', value: Math.floor(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0) / 1000) },
    { name: '本周开始', value: Math.floor(new Date(Date.now() - (new Date().getDay() * 86400000)).setHours(0, 0, 0, 0) / 1000) },
    { name: '本月开始', value: Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000) },
    { name: '本年开始', value: Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000) }
  ]

  return (
    <ToolLayout
      title="时间戳转换"
      description="时间戳与日期互相转换"
      category="日期时间"
      icon="⏰"
    >
      <div className="space-y-6">
        {/* 当前时间显示 */}
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">当前时间</h3>
          </div>
          <div className="text-2xl font-mono text-blue-800 mb-2">
            {currentTime.toLocaleString('zh-CN')}
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-700">秒级时间戳:</span>
              <code className="bg-blue-100 px-2 py-1 rounded">{Math.floor(currentTime.getTime() / 1000)}</code>
              <button
                onClick={() => copyToClipboard(Math.floor(currentTime.getTime() / 1000).toString(), '秒级时间戳')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-700">毫秒时间戳:</span>
              <code className="bg-blue-100 px-2 py-1 rounded">{currentTime.getTime()}</code>
              <button
                onClick={() => copyToClipboard(currentTime.getTime().toString(), '毫秒时间戳')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 时间戳转日期 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">时间戳转日期</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                输入时间戳（支持10位秒级或13位毫秒级）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="例如: 1640995200 或 1640995200000"
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <button
                  onClick={getCurrentTimestamp}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  当前
                </button>
              </div>
            </div>
            {timestampResult && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-green-700">转换结果:</span>
                    <div className="text-lg font-mono text-green-800">{timestampResult}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(timestampResult, '日期时间')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 日期转时间戳 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">日期转时间戳</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择日期时间
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={getCurrentDateTime}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  当前
                </button>
              </div>
            </div>
            {dateResult && (
              <div className="bg-green-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-green-700">秒级时间戳:</span>
                    <div className="text-lg font-mono text-green-800">{dateResult.seconds}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(dateResult.seconds.toString(), '秒级时间戳')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-green-700">毫秒时间戳:</span>
                    <div className="text-lg font-mono text-green-800">{dateResult.milliseconds}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(dateResult.milliseconds.toString(), '毫秒时间戳')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 常用时间戳 */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            常用时间戳
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonTimestamps.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">{item.name}</div>
                    <div className="font-mono text-gray-900">{item.value}</div>
                    <div className="text-xs text-gray-500">
                      {timestampToDate(item.value.toString())}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setTimestamp(item.value.toString())}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    >
                      使用
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.value.toString(), item.name)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 支持10位秒级和13位毫秒级时间戳转换</li>
            <li>• 自动识别时间戳格式并进行相应转换</li>
            <li>• 提供常用时间点的快速时间戳</li>
            <li>• 实时显示当前时间和对应时间戳</li>
            <li>• 支持一键复制转换结果</li>
            <li>• 时区默认为中国标准时间(CST)</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
