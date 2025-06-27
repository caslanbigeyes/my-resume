'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Clock, Globe, RefreshCw, Plus, Minus } from 'lucide-react'

interface TimeZoneInfo {
  id: string
  name: string
  timezone: string
  offset: string
}

/**
 * 时区转换工具组件
 * 不同时区时间换算
 */
export default function TimezoneConvertPage() {
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date()
    return now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm format
  })
  const [sourceTimezone, setSourceTimezone] = useState('Asia/Shanghai')
  const [targetTimezones, setTargetTimezones] = useState([
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo'
  ])

  // 常用时区列表
  const commonTimezones = [
    { value: 'UTC', label: 'UTC (协调世界时)', city: '格林威治' },
    { value: 'Asia/Shanghai', label: 'CST (中国标准时间)', city: '北京/上海' },
    { value: 'Asia/Tokyo', label: 'JST (日本标准时间)', city: '东京' },
    { value: 'Asia/Seoul', label: 'KST (韩国标准时间)', city: '首尔' },
    { value: 'Asia/Hong_Kong', label: 'HKT (香港时间)', city: '香港' },
    { value: 'Asia/Singapore', label: 'SGT (新加坡时间)', city: '新加坡' },
    { value: 'Asia/Dubai', label: 'GST (海湾标准时间)', city: '迪拜' },
    { value: 'Europe/London', label: 'GMT/BST (格林威治时间)', city: '伦敦' },
    { value: 'Europe/Paris', label: 'CET/CEST (中欧时间)', city: '巴黎' },
    { value: 'Europe/Berlin', label: 'CET/CEST (中欧时间)', city: '柏林' },
    { value: 'Europe/Moscow', label: 'MSK (莫斯科时间)', city: '莫斯科' },
    { value: 'America/New_York', label: 'EST/EDT (东部时间)', city: '纽约' },
    { value: 'America/Chicago', label: 'CST/CDT (中部时间)', city: '芝加哥' },
    { value: 'America/Denver', label: 'MST/MDT (山地时间)', city: '丹佛' },
    { value: 'America/Los_Angeles', label: 'PST/PDT (太平洋时间)', city: '洛杉矶' },
    { value: 'America/Sao_Paulo', label: 'BRT (巴西时间)', city: '圣保罗' },
    { value: 'Australia/Sydney', label: 'AEST/AEDT (澳东时间)', city: '悉尼' },
    { value: 'Australia/Melbourne', label: 'AEST/AEDT (澳东时间)', city: '墨尔本' },
    { value: 'Pacific/Auckland', label: 'NZST/NZDT (新西兰时间)', city: '奥克兰' }
  ]

  // 获取时区信息
  const getTimezoneInfo = useCallback((timezone: string, date: Date): TimeZoneInfo => {
    const formatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(date)
    const formattedTime = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value} ${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`

    // 计算时区偏移
    const utcTime = date.getTime()
    const localTime = new Date(formattedTime.replace(' ', 'T')).getTime()
    const offset = (localTime - utcTime) / (1000 * 60 * 60)
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`

    const timezoneData = commonTimezones.find(tz => tz.value === timezone)
    
    return {
      id: timezone,
      name: timezoneData?.label || timezone,
      timezone: formattedTime,
      offset: `UTC${offsetStr}`
    }
  }, [])

  // 转换时间
  const convertedTimes = useMemo(() => {
    const sourceDate = new Date(selectedTime)
    
    // 创建一个在源时区的时间
    const tempDate = new Date(selectedTime)
    
    return targetTimezones.map(timezone => {
      return getTimezoneInfo(timezone, tempDate)
    })
  }, [selectedTime, targetTimezones, getTimezoneInfo])

  // 获取当前时间
  const getCurrentTime = () => {
    const now = new Date()
    setSelectedTime(now.toISOString().slice(0, 16))
  }

  // 添加时区
  const addTimezone = (timezone: string) => {
    if (!targetTimezones.includes(timezone)) {
      setTargetTimezones([...targetTimezones, timezone])
    }
  }

  // 移除时区
  const removeTimezone = (timezone: string) => {
    setTargetTimezones(targetTimezones.filter(tz => tz !== timezone))
  }

  // 复制时间
  const copyTime = async (timeStr: string) => {
    try {
      await navigator.clipboard.writeText(timeStr)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 获取时区标签
  const getTimezoneLabel = (timezone: string) => {
    const found = commonTimezones.find(tz => tz.value === timezone)
    return found ? found.label : timezone
  }

  // 获取城市名称
  const getCityName = (timezone: string) => {
    const found = commonTimezones.find(tz => tz.value === timezone)
    return found ? found.city : timezone.split('/').pop()
  }

  // 计算时差
  const getTimeDifference = (timezone1: string, timezone2: string) => {
    const date = new Date(selectedTime)
    const time1 = new Date(date.toLocaleString('en-US', { timeZone: timezone1 }))
    const time2 = new Date(date.toLocaleString('en-US', { timeZone: timezone2 }))
    const diffHours = (time2.getTime() - time1.getTime()) / (1000 * 60 * 60)
    return diffHours
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🌍 时区转换工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            不同时区时间换算和对比
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：时间输入 */}
          <div className="space-y-6">
            {/* 时间设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                时间设置
              </h3>
              
              <div className="space-y-4">
                {/* 源时区 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    源时区
                  </label>
                  <select
                    value={sourceTimezone}
                    onChange={(e) => setSourceTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {commonTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.city} - {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 时间输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    日期时间
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={getCurrentTime}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="当前时间"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 源时区显示 */}
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {getCityName(sourceTimezone)} 时间
                  </div>
                  <div className="text-lg font-mono text-gray-900 dark:text-gray-100">
                    {getTimezoneInfo(sourceTimezone, new Date(selectedTime)).timezone}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {getTimezoneInfo(sourceTimezone, new Date(selectedTime)).offset}
                  </div>
                </div>
              </div>
            </div>

            {/* 添加时区 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">添加时区</h3>
              <div className="space-y-2">
                {commonTimezones
                  .filter(tz => !targetTimezones.includes(tz.value))
                  .slice(0, 8)
                  .map((tz) => (
                    <button
                      key={tz.value}
                      onClick={() => addTimezone(tz.value)}
                      className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                    >
                      <span>{tz.city}</span>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* 中间和右侧：转换结果 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  时区转换结果
                </h3>
              </div>
              <div className="p-4">
                {targetTimezones.length > 0 ? (
                  <div className="space-y-4">
                    {convertedTimes.map((timeInfo, index) => {
                      const timeDiff = getTimeDifference(sourceTimezone, timeInfo.id)
                      return (
                        <div key={timeInfo.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {getCityName(timeInfo.id)}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getTimezoneLabel(timeInfo.id)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                {timeDiff >= 0 ? `+${timeDiff}h` : `${timeDiff}h`}
                              </span>
                              <button
                                onClick={() => removeTimezone(timeInfo.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xl font-mono text-gray-900 dark:text-gray-100 mb-1">
                                {timeInfo.timezone}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {timeInfo.offset}
                              </div>
                            </div>
                            <button
                              onClick={() => copyTime(timeInfo.timezone)}
                              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Copy className="w-4 h-4 inline mr-1" />
                              复制
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    请添加要转换的时区
                  </div>
                )}
              </div>
            </div>

            {/* 时差对比表 */}
            {targetTimezones.length > 1 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">时差对比</h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">时区</th>
                          {targetTimezones.map(tz => (
                            <th key={tz} className="text-center py-2 text-gray-600 dark:text-gray-400 min-w-20">
                              {getCityName(tz)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {targetTimezones.map(tz1 => (
                          <tr key={tz1} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 font-medium text-gray-900 dark:text-gray-100">
                              {getCityName(tz1)}
                            </td>
                            {targetTimezones.map(tz2 => {
                              const diff = getTimeDifference(tz1, tz2)
                              return (
                                <td key={tz2} className="text-center py-2">
                                  {tz1 === tz2 ? (
                                    <span className="text-gray-400">-</span>
                                  ) : (
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      diff === 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                                      diff > 0 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    }`}>
                                      {diff >= 0 ? `+${diff}h` : `${diff}h`}
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 支持全球主要时区转换</li>
                <li>• 实时显示时差对比</li>
                <li>• 自动处理夏令时</li>
                <li>• 可添加多个目标时区</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 点击"当前时间"快速设置</li>
                <li>• 时差表格显示相对时差</li>
                <li>• 支持一键复制时间</li>
                <li>• 绿色表示时间超前，红色表示滞后</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
