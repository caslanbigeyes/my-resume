'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Play, Pause, RotateCcw, Clock, Calendar } from 'lucide-react'

/**
 * 倒计时器工具组件
 * 倒计时计时器
 */
export default function CountdownTimerTool() {
  const [targetDate, setTargetDate] = useState('')
  const [targetTime, setTargetTime] = useState('')
  const [title, setTitle] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })

  /**
   * 计算剩余时间
   */
  const calculateTimeLeft = useCallback(() => {
    if (!targetDate || !targetTime) return

    const target = new Date(`${targetDate}T${targetTime}`)
    const now = new Date()
    const difference = target.getTime() - now.getTime()

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, total: difference })
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
      setIsActive(false)
      
      // 倒计时结束提醒
      if (difference <= 0 && isActive) {
        alert(`倒计时结束！${title || '目标时间已到达'}`)
      }
    }
  }, [targetDate, targetTime, title, isActive])

  /**
   * 定时器效果
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(calculateTimeLeft, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, calculateTimeLeft])

  /**
   * 初始计算
   */
  useEffect(() => {
    calculateTimeLeft()
  }, [calculateTimeLeft])

  /**
   * 开始/暂停倒计时
   */
  const toggleTimer = () => {
    if (!targetDate || !targetTime) {
      alert('请先设置目标日期和时间')
      return
    }
    setIsActive(!isActive)
  }

  /**
   * 重置倒计时
   */
  const resetTimer = () => {
    setIsActive(false)
    calculateTimeLeft()
  }

  /**
   * 设置快速时间
   */
  const setQuickTime = (minutes: number) => {
    const now = new Date()
    const target = new Date(now.getTime() + minutes * 60 * 1000)
    
    setTargetDate(target.toISOString().split('T')[0])
    setTargetTime(target.toTimeString().slice(0, 5))
    setIsActive(false)
  }

  /**
   * 常用倒计时预设
   */
  const presets = [
    { name: '5分钟', minutes: 5 },
    { name: '10分钟', minutes: 10 },
    { name: '15分钟', minutes: 15 },
    { name: '30分钟', minutes: 30 },
    { name: '1小时', minutes: 60 },
    { name: '2小时', minutes: 120 },
    { name: '番茄工作法', minutes: 25 },
    { name: '短休息', minutes: 5 }
  ]

  /**
   * 重要节日预设
   */
  const holidays = [
    { name: '春节', date: '2024-02-10' },
    { name: '清明节', date: '2024-04-04' },
    { name: '劳动节', date: '2024-05-01' },
    { name: '端午节', date: '2024-06-10' },
    { name: '中秋节', date: '2024-09-17' },
    { name: '国庆节', date: '2024-10-01' },
    { name: '元旦', date: '2025-01-01' },
    { name: '情人节', date: '2024-02-14' }
  ]

  /**
   * 设置节日倒计时
   */
  const setHolidayCountdown = (holiday: typeof holidays[0]) => {
    setTargetDate(holiday.date)
    setTargetTime('00:00')
    setTitle(`距离${holiday.name}`)
    setIsActive(false)
  }

  /**
   * 格式化时间显示
   */
  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0')
  }

  /**
   * 获取进度百分比
   */
  const getProgress = (): number => {
    if (!targetDate || !targetTime) return 0
    
    const target = new Date(`${targetDate}T${targetTime}`)
    const start = new Date() // 可以改为设置开始时间
    const now = new Date()
    
    const total = target.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    
    return Math.max(0, Math.min(100, (elapsed / total) * 100))
  }

  const progress = getProgress()

  return (
    <ToolLayout
      title="倒计时器"
      description="倒计时计时器"
      category="日期时间"
      icon="⏳"
    >
      <div className="space-y-6">
        {/* 目标设置 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">设置倒计时目标</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                倒计时标题（可选）
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：考试倒计时、生日倒计时..."
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标日期
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标时间
                </label>
                <input
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 倒计时显示 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg text-center">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
          )}
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{formatTime(timeLeft.days)}</div>
              <div className="text-sm text-gray-600">天</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">{formatTime(timeLeft.hours)}</div>
              <div className="text-sm text-gray-600">时</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{formatTime(timeLeft.minutes)}</div>
              <div className="text-sm text-gray-600">分</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-orange-600">{formatTime(timeLeft.seconds)}</div>
              <div className="text-sm text-gray-600">秒</div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* 控制按钮 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isActive ? '暂停' : '开始'}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              重置
            </button>
          </div>

          {/* 状态提示 */}
          {timeLeft.total <= 0 && targetDate && targetTime && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">🎉 倒计时已结束！</p>
            </div>
          )}
        </div>

        {/* 快速设置 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            快速设置
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => setQuickTime(preset.minutes)}
                className="p-2 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 节日倒计时 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            节日倒计时
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {holidays.map((holiday, index) => (
              <button
                key={index}
                onClick={() => setHolidayCountdown(holiday)}
                className="p-2 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                {holiday.name}
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 设置目标日期和时间，开始倒计时</li>
            <li>• 支持暂停、重置等操作</li>
            <li>• 提供常用时间段的快速设置</li>
            <li>• 包含重要节日的倒计时预设</li>
            <li>• 倒计时结束时会有提醒通知</li>
            <li>• 显示进度条和详细的时间分解</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
