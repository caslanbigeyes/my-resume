'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Calendar, Clock, Gift } from 'lucide-react'

/**
 * 年龄计算器工具组件
 * 精确计算年龄
 */
export default function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState('')
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])

  /**
   * 计算年龄详细信息
   */
  const ageInfo = useMemo(() => {
    if (!birthDate) return null

    const birth = new Date(birthDate)
    const target = new Date(targetDate)

    if (birth > target) {
      return { error: '出生日期不能晚于目标日期' }
    }

    // 计算精确年龄
    let years = target.getFullYear() - birth.getFullYear()
    let months = target.getMonth() - birth.getMonth()
    let days = target.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    // 计算总天数
    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    
    // 计算总小时数
    const totalHours = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60))
    
    // 计算总分钟数
    const totalMinutes = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60))
    
    // 计算总秒数
    const totalSeconds = Math.floor((target.getTime() - birth.getTime()) / 1000)

    // 计算下一个生日
    const nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday <= target) {
      nextBirthday.setFullYear(target.getFullYear() + 1)
    }
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))

    // 计算星座
    const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate())

    // 计算生肖
    const chineseZodiac = getChineseZodiac(birth.getFullYear())

    // 计算星期几
    const dayOfWeek = birth.toLocaleDateString('zh-CN', { weekday: 'long' })

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      daysToNextBirthday,
      nextBirthday: nextBirthday.toLocaleDateString('zh-CN'),
      zodiacSign,
      chineseZodiac,
      dayOfWeek,
      birthYear: birth.getFullYear(),
      isLeapYear: isLeapYear(birth.getFullYear())
    }
  }, [birthDate, targetDate])

  /**
   * 获取星座
   */
  const getZodiacSign = (month: number, day: number): string => {
    const signs = [
      { name: '水瓶座', start: [1, 20], end: [2, 18] },
      { name: '双鱼座', start: [2, 19], end: [3, 20] },
      { name: '白羊座', start: [3, 21], end: [4, 19] },
      { name: '金牛座', start: [4, 20], end: [5, 20] },
      { name: '双子座', start: [5, 21], end: [6, 21] },
      { name: '巨蟹座', start: [6, 22], end: [7, 22] },
      { name: '狮子座', start: [7, 23], end: [8, 22] },
      { name: '处女座', start: [8, 23], end: [9, 22] },
      { name: '天秤座', start: [9, 23], end: [10, 23] },
      { name: '天蝎座', start: [10, 24], end: [11, 22] },
      { name: '射手座', start: [11, 23], end: [12, 21] },
      { name: '摩羯座', start: [12, 22], end: [1, 19] }
    ]

    for (const sign of signs) {
      const [startMonth, startDay] = sign.start
      const [endMonth, endDay] = sign.end

      if (startMonth === endMonth) {
        if (month === startMonth && day >= startDay && day <= endDay) {
          return sign.name
        }
      } else {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return sign.name
        }
      }
    }

    return '未知'
  }

  /**
   * 获取生肖
   */
  const getChineseZodiac = (year: number): string => {
    const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    return animals[(year - 1900) % 12]
  }

  /**
   * 判断是否为闰年
   */
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }

  /**
   * 设置为今天
   */
  const setToday = () => {
    setTargetDate(new Date().toISOString().split('T')[0])
  }

  /**
   * 常见年龄里程碑
   */
  const milestones = [
    { age: 18, name: '成年', description: '法定成年年龄' },
    { age: 20, name: '弱冠', description: '古代男子二十岁' },
    { age: 30, name: '而立', description: '三十而立' },
    { age: 40, name: '不惑', description: '四十不惑' },
    { age: 50, name: '知天命', description: '五十知天命' },
    { age: 60, name: '花甲', description: '六十花甲' },
    { age: 70, name: '古稀', description: '七十古稀' },
    { age: 80, name: '耄耋', description: '八十耄耋' }
  ]

  return (
    <ToolLayout
      title="年龄计算器"
      description="精确计算年龄"
      category="日期时间"
      icon="🎂"
    >
      <div className="space-y-6">
        {/* 日期输入 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生日期
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              计算到日期
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={setToday}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                今天
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {ageInfo?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{ageInfo.error}</p>
          </div>
        )}

        {/* 年龄结果 */}
        {ageInfo && !ageInfo.error && (
          <div className="space-y-6">
            {/* 主要年龄信息 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {ageInfo.years} 岁
                </div>
                <div className="text-lg text-gray-600">
                  {ageInfo.months} 个月 {ageInfo.days} 天
                </div>
              </div>
            </div>

            {/* 详细统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600">{ageInfo.totalDays.toLocaleString()}</div>
                <div className="text-sm text-gray-600">总天数</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-green-600">{ageInfo.totalHours.toLocaleString()}</div>
                <div className="text-sm text-gray-600">总小时数</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600">{ageInfo.totalMinutes.toLocaleString()}</div>
                <div className="text-sm text-gray-600">总分钟数</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-orange-600">{ageInfo.totalSeconds.toLocaleString()}</div>
                <div className="text-sm text-gray-600">总秒数</div>
              </div>
            </div>

            {/* 生日信息 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-600" />
                生日信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">下次生日:</span>
                    <span className="font-medium">{ageInfo.nextBirthday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">距离生日:</span>
                    <span className="font-medium text-pink-600">{ageInfo.daysToNextBirthday} 天</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">出生星期:</span>
                    <span className="font-medium">{ageInfo.dayOfWeek}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">星座:</span>
                    <span className="font-medium">{ageInfo.zodiacSign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">生肖:</span>
                    <span className="font-medium">{ageInfo.chineseZodiac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">出生年份:</span>
                    <span className="font-medium">
                      {ageInfo.birthYear} {ageInfo.isLeapYear ? '(闰年)' : '(平年)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 年龄里程碑 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                年龄里程碑
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {milestones.map((milestone, index) => {
                  const reached = ageInfo.years >= milestone.age
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        reached 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {milestone.name} ({milestone.age}岁)
                          </div>
                          <div className="text-sm text-gray-600">
                            {milestone.description}
                          </div>
                        </div>
                        <div className={`text-2xl ${reached ? '✅' : '⏳'}`}>
                          {reached ? '✅' : '⏳'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 输入出生日期，自动计算到今天的精确年龄</li>
            <li>• 可以指定任意目标日期进行年龄计算</li>
            <li>• 显示总天数、小时数、分钟数、秒数等详细统计</li>
            <li>• 提供星座、生肖、下次生日等有趣信息</li>
            <li>• 显示人生重要年龄里程碑的达成情况</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
