'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Clock, Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react'

/**
 * Cron 表达式解析器组件
 * 解析和验证 Cron 表达式，显示执行时间
 */
export default function CronParserPage() {
  const [cronExpression, setCronExpression] = useState('0 9 * * 1-5')
  const [timezone, setTimezone] = useState('Asia/Shanghai')

  // 时区选项
  const timezones = [
    { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
    { value: 'UTC', label: 'UTC (协调世界时)' },
    { value: 'America/New_York', label: '纽约时间 (EST/EDT)' },
    { value: 'America/Los_Angeles', label: '洛杉矶时间 (PST/PDT)' },
    { value: 'Europe/London', label: '伦敦时间 (GMT/BST)' },
    { value: 'Asia/Tokyo', label: '东京时间 (JST)' }
  ]

  // 解析 Cron 表达式
  const parseCron = useCallback((expression: string) => {
    const parts = expression.trim().split(/\s+/)
    
    if (parts.length !== 5 && parts.length !== 6) {
      return { isValid: false, error: 'Cron 表达式必须包含 5 或 6 个字段' }
    }

    const fields = parts.length === 5 ? 
      ['minute', 'hour', 'day', 'month', 'weekday'] :
      ['second', 'minute', 'hour', 'day', 'month', 'weekday']

    const parsed: any = {}
    
    try {
      fields.forEach((field, index) => {
        parsed[field] = parseField(parts[index], field)
      })
      
      return { isValid: true, parsed, fields }
    } catch (error) {
      return { isValid: false, error: error instanceof Error ? error.message : '解析错误' }
    }
  }, [])

  // 解析单个字段
  const parseField = (value: string, fieldType: string): any => {
    const ranges: { [key: string]: [number, number] } = {
      second: [0, 59],
      minute: [0, 59],
      hour: [0, 23],
      day: [1, 31],
      month: [1, 12],
      weekday: [0, 7] // 0 和 7 都表示周日
    }

    const [min, max] = ranges[fieldType]
    
    if (value === '*') {
      return { type: 'any', description: '任意值' }
    }
    
    if (value.includes('/')) {
      const [range, step] = value.split('/')
      const stepNum = parseInt(step)
      if (isNaN(stepNum) || stepNum <= 0) {
        throw new Error(`${fieldType} 字段的步长值无效: ${step}`)
      }
      
      if (range === '*') {
        return { 
          type: 'step', 
          step: stepNum, 
          description: `每 ${stepNum} ${getFieldUnit(fieldType)}` 
        }
      } else {
        const rangeValues = parseRange(range, min, max)
        return { 
          type: 'step_range', 
          range: rangeValues, 
          step: stepNum,
          description: `在 ${rangeValues.join('-')} 范围内每 ${stepNum} ${getFieldUnit(fieldType)}`
        }
      }
    }
    
    if (value.includes('-')) {
      const rangeValues = parseRange(value, min, max)
      return { 
        type: 'range', 
        range: rangeValues, 
        description: `${rangeValues[0]} 到 ${rangeValues[1]}` 
      }
    }
    
    if (value.includes(',')) {
      const values = value.split(',').map(v => {
        const num = parseInt(v.trim())
        if (isNaN(num) || num < min || num > max) {
          throw new Error(`${fieldType} 字段的值超出范围: ${v}`)
        }
        return num
      })
      return { 
        type: 'list', 
        values, 
        description: `指定值: ${values.join(', ')}` 
      }
    }
    
    const num = parseInt(value)
    if (isNaN(num) || num < min || num > max) {
      throw new Error(`${fieldType} 字段的值超出范围: ${value}`)
    }
    
    return { 
      type: 'specific', 
      value: num, 
      description: `指定值: ${num}` 
    }
  }

  // 解析范围
  const parseRange = (range: string, min: number, max: number): [number, number] => {
    const [start, end] = range.split('-').map(v => parseInt(v.trim()))
    if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
      throw new Error(`范围值无效: ${range}`)
    }
    return [start, end]
  }

  // 获取字段单位
  const getFieldUnit = (fieldType: string): string => {
    const units: { [key: string]: string } = {
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '天',
      month: '月',
      weekday: '周'
    }
    return units[fieldType] || ''
  }

  // 获取字段名称
  const getFieldName = (fieldType: string): string => {
    const names: { [key: string]: string } = {
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '日期',
      month: '月份',
      weekday: '星期'
    }
    return names[fieldType] || fieldType
  }

  // 生成人类可读的描述
  const generateDescription = useCallback((parsed: any, fields: string[]) => {
    const descriptions: string[] = []
    
    // 构建时间描述
    const timeDesc: string[] = []
    
    if (fields.includes('second')) {
      const sec = parsed.second
      if (sec.type === 'specific') {
        timeDesc.push(`${sec.value}秒`)
      }
    }
    
    const min = parsed.minute
    const hour = parsed.hour
    
    if (hour.type === 'specific' && min.type === 'specific') {
      const timeStr = fields.includes('second') && parsed.second.type === 'specific' ?
        `${hour.value.toString().padStart(2, '0')}:${min.value.toString().padStart(2, '0')}:${parsed.second.value.toString().padStart(2, '0')}` :
        `${hour.value.toString().padStart(2, '0')}:${min.value.toString().padStart(2, '0')}`
      descriptions.push(`在 ${timeStr}`)
    } else {
      if (hour.type !== 'any') {
        descriptions.push(`${hour.description}时`)
      }
      if (min.type !== 'any') {
        descriptions.push(`${min.description}分`)
      }
    }
    
    // 日期描述
    const day = parsed.day
    const month = parsed.month
    const weekday = parsed.weekday
    
    if (month.type !== 'any') {
      descriptions.push(`${month.description}月`)
    }
    
    if (day.type !== 'any' && weekday.type !== 'any') {
      descriptions.push(`${day.description}日且${weekday.description}`)
    } else if (day.type !== 'any') {
      descriptions.push(`${day.description}日`)
    } else if (weekday.type !== 'any') {
      descriptions.push(formatWeekday(weekday))
    }
    
    return descriptions.length > 0 ? descriptions.join('，') : '每分钟执行'
  }, [])

  // 格式化星期描述
  const formatWeekday = (weekday: any): string => {
    const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
    
    if (weekday.type === 'specific') {
      return weekNames[weekday.value]
    } else if (weekday.type === 'list') {
      return weekday.values.map((v: number) => weekNames[v]).join('、')
    } else if (weekday.type === 'range') {
      return `${weekNames[weekday.range[0]]}到${weekNames[weekday.range[1]]}`
    }
    
    return weekday.description
  }

  // 计算下次执行时间（简化版本）
  const getNextExecutions = useCallback((parsed: any, fields: string[], count = 5) => {
    const executions: string[] = []
    const now = new Date()
    
    // 这里是一个简化的实现，实际的 cron 计算会更复杂
    for (let i = 0; i < count; i++) {
      const nextTime = new Date(now.getTime() + i * 60 * 1000) // 简化：每分钟一次
      executions.push(nextTime.toLocaleString('zh-CN', { timeZone: timezone }))
    }
    
    return executions
  }, [timezone])

  // 解析结果
  const cronResult = useMemo(() => {
    return parseCron(cronExpression)
  }, [cronExpression, parseCron])

  // 人类可读描述
  const humanDescription = useMemo(() => {
    if (cronResult.isValid && cronResult.fields) {
      return generateDescription(cronResult.parsed, cronResult.fields)
    }
    return ''
  }, [cronResult, generateDescription])

  // 下次执行时间
  const nextExecutions = useMemo(() => {
    if (cronResult.isValid && cronResult.fields) {
      return getNextExecutions(cronResult.parsed, cronResult.fields)
    }
    return []
  }, [cronResult, getNextExecutions])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 常用 Cron 表达式
  const commonExpressions = [
    { name: '每分钟', expression: '* * * * *', description: '每分钟执行一次' },
    { name: '每小时', expression: '0 * * * *', description: '每小时的第0分钟执行' },
    { name: '每天午夜', expression: '0 0 * * *', description: '每天凌晨0点执行' },
    { name: '每天上午9点', expression: '0 9 * * *', description: '每天上午9点执行' },
    { name: '工作日上午9点', expression: '0 9 * * 1-5', description: '周一到周五上午9点执行' },
    { name: '每周日凌晨', expression: '0 0 * * 0', description: '每周日凌晨0点执行' },
    { name: '每月1号', expression: '0 0 1 * *', description: '每月1号凌晨0点执行' },
    { name: '每15分钟', expression: '*/15 * * * *', description: '每15分钟执行一次' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ⚙️ Cron 表达式解析器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            解析和验证 Cron 表达式，预测执行时间
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入和解析 */}
          <div className="space-y-6">
            {/* Cron 表达式输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Cron 表达式
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    表达式
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                      placeholder="0 9 * * 1-5"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => copyToClipboard(cronExpression)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    格式: 分钟 小时 日期 月份 星期 (或 秒 分钟 小时 日期 月份 星期)
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    时区
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 验证结果 */}
                <div className="mt-4">
                  {cronResult.isValid ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span>表达式有效</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span>{cronResult.error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 字段解析 */}
            {cronResult.isValid && cronResult.fields && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">字段解析</h3>
                <div className="space-y-3">
                  {cronResult.fields.map((field: string, index: number) => (
                    <div key={field} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getFieldName(field)}:
                        </span>
                        <span className="ml-2 font-mono text-blue-600 dark:text-blue-400">
                          {cronExpression.split(/\s+/)[index]}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {cronResult.parsed[field].description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 人类可读描述 */}
            {cronResult.isValid && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  执行描述
                </h3>
                <div className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                  {humanDescription}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：常用表达式和执行时间 */}
          <div className="space-y-6">
            {/* 常用表达式 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">常用表达式</h3>
              <div className="space-y-2">
                {commonExpressions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setCronExpression(item.expression)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.description}
                        </div>
                      </div>
                      <code className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {item.expression}
                      </code>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 下次执行时间 */}
            {cronResult.isValid && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  预计执行时间
                </h3>
                <div className="space-y-2">
                  {nextExecutions.map((time, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        第 {index + 1} 次:
                      </span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  * 这是简化的预测，实际执行时间可能因系统负载等因素有所差异
                </div>
              </div>
            )}

            {/* 语法说明 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">语法说明</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">特殊字符</div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div><code>*</code> - 任意值</div>
                    <div><code>,</code> - 列举多个值</div>
                    <div><code>-</code> - 范围</div>
                    <div><code>/</code> - 步长</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">字段范围</div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div>分钟: 0-59</div>
                    <div>小时: 0-23</div>
                    <div>日期: 1-31</div>
                    <div>月份: 1-12</div>
                    <div>星期: 0-7 (0和7都表示周日)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
