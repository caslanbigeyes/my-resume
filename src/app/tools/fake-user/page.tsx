'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Download, RefreshCw, Users, Settings } from 'lucide-react'

interface FakeUser {
  id: string
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  avatar: string
  birthDate: string
  age: number
  gender: 'male' | 'female'
  occupation: string
  company: string
  bio: string
  website: string
  socialMedia: {
    twitter: string
    linkedin: string
    github: string
  }
}

/**
 * 随机用户生成器组件
 * 生成虚假的用户数据用于测试
 */
export default function FakeUserPage() {
  const [userCount, setUserCount] = useState(5)
  const [locale, setLocale] = useState<'zh' | 'en'>('zh')
  const [includeAvatar, setIncludeAvatar] = useState(true)
  const [includeSocialMedia, setIncludeSocialMedia] = useState(true)
  const [users, setUsers] = useState<FakeUser[]>([])

  // 中文数据
  const zhData = {
    firstNames: {
      male: ['伟', '强', '磊', '军', '勇', '涛', '明', '超', '辉', '华', '建', '国', '峰', '鹏', '飞'],
      female: ['芳', '娜', '敏', '静', '丽', '华', '秀', '英', '慧', '巧', '美', '娟', '红', '艳', '玲']
    },
    lastNames: ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'],
    cities: ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆', '天津', '苏州', '长沙', '郑州', '青岛'],
    states: ['北京市', '上海市', '广东省', '浙江省', '江苏省', '湖北省', '四川省', '陕西省', '重庆市', '天津市'],
    occupations: ['软件工程师', '产品经理', '设计师', '销售经理', '市场专员', '财务分析师', '人力资源', '运营专员', '数据分析师', '项目经理'],
    companies: ['阿里巴巴', '腾讯', '百度', '字节跳动', '美团', '滴滴', '京东', '网易', '新浪', '搜狐', '华为', '小米']
  }

  // 英文数据
  const enData = {
    firstNames: {
      male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher'],
      female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
    },
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    states: ['California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'],
    occupations: ['Software Engineer', 'Product Manager', 'Designer', 'Sales Manager', 'Marketing Specialist', 'Financial Analyst', 'HR Manager', 'Operations Specialist', 'Data Analyst', 'Project Manager'],
    companies: ['Google', 'Apple', 'Microsoft', 'Amazon', 'Facebook', 'Tesla', 'Netflix', 'Adobe', 'Salesforce', 'Oracle']
  }

  // 随机选择函数
  const randomChoice = useCallback(<T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }, [])

  // 生成随机邮箱
  const generateEmail = useCallback((name: string): string => {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', '163.com', 'qq.com']
    const cleanName = name.toLowerCase().replace(/\s+/g, '.')
    return `${cleanName}@${randomChoice(domains)}`
  }, [randomChoice])

  // 生成随机手机号
  const generatePhone = useCallback((): string => {
    if (locale === 'zh') {
      const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189']
      const prefix = randomChoice(prefixes)
      const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
      return `${prefix}${suffix}`
    } else {
      const areaCode = Math.floor(Math.random() * 900) + 100
      const exchange = Math.floor(Math.random() * 900) + 100
      const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      return `(${areaCode}) ${exchange}-${number}`
    }
  }, [locale, randomChoice])

  // 生成随机生日
  const generateBirthDate = useCallback(() => {
    const minAge = 18
    const maxAge = 65
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge
    const birthYear = new Date().getFullYear() - age
    const birthMonth = Math.floor(Math.random() * 12) + 1
    const birthDay = Math.floor(Math.random() * 28) + 1
    
    const birthDate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`
    return { birthDate, age }
  }, [])

  // 生成随机用户
  const generateUser = useCallback((): FakeUser => {
    const data = locale === 'zh' ? zhData : enData
    const gender = randomChoice(['male', 'female'] as const)
    const firstName = randomChoice(data.firstNames[gender])
    const lastName = randomChoice(data.lastNames)
    const name = locale === 'zh' ? `${lastName}${firstName}` : `${firstName} ${lastName}`
    
    const { birthDate, age } = generateBirthDate()
    const city = randomChoice(data.cities)
    const state = randomChoice(data.states)
    
    const user: FakeUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: generateEmail(name),
      phone: generatePhone(),
      address: {
        street: locale === 'zh' ? `${city}市${randomChoice(['中山', '人民', '解放', '建设', '和平'])}路${Math.floor(Math.random() * 999) + 1}号` : `${Math.floor(Math.random() * 9999) + 1} ${randomChoice(['Main', 'Oak', 'Pine', 'Maple', 'Cedar'])} St`,
        city,
        state,
        zipCode: locale === 'zh' ? Math.floor(Math.random() * 900000 + 100000).toString() : Math.floor(Math.random() * 90000 + 10000).toString(),
        country: locale === 'zh' ? '中国' : 'United States'
      },
      avatar: includeAvatar ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9` : '',
      birthDate,
      age,
      gender,
      occupation: randomChoice(data.occupations),
      company: randomChoice(data.companies),
      bio: locale === 'zh' ? `我是一名${randomChoice(data.occupations)}，在${randomChoice(data.companies)}工作。` : `I'm a ${randomChoice(data.occupations)} working at ${randomChoice(data.companies)}.`,
      website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
      socialMedia: includeSocialMedia ? {
        twitter: `@${name.toLowerCase().replace(/\s+/g, '')}`,
        linkedin: `linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
        github: `github.com/${name.toLowerCase().replace(/\s+/g, '')}`
      } : { twitter: '', linkedin: '', github: '' }
    }

    return user
  }, [locale, includeAvatar, includeSocialMedia, randomChoice, generateEmail, generatePhone, generateBirthDate])

  // 生成多个用户
  const generateUsers = useCallback(() => {
    const newUsers = Array.from({ length: userCount }, () => generateUser())
    setUsers(newUsers)
  }, [userCount, generateUser])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 复制用户数据
  const copyUser = (user: FakeUser) => {
    const userData = JSON.stringify(user, null, 2)
    copyToClipboard(userData)
  }

  // 复制所有用户
  const copyAllUsers = () => {
    const allUsersData = JSON.stringify(users, null, 2)
    copyToClipboard(allUsersData)
  }

  // 下载 JSON 文件
  const downloadJSON = () => {
    const dataStr = JSON.stringify(users, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fake-users.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 下载 CSV 文件
  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'City', 'State', 'Country', 'Occupation', 'Company']
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        `"${user.phone}"`,
        user.age,
        user.gender,
        `"${user.address.city}"`,
        `"${user.address.state}"`,
        `"${user.address.country}"`,
        `"${user.occupation}"`,
        `"${user.company}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fake-users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 初始生成
  React.useEffect(() => {
    generateUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            👥 随机用户生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            生成虚假的用户数据用于测试和开发
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 用户数量 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                用户数量
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={userCount}
                onChange={(e) => setUserCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 语言地区 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                语言地区
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'zh' | 'en')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* 选项 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                包含选项
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeAvatar}
                    onChange={(e) => setIncludeAvatar(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">头像</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeSocialMedia}
                    onChange={(e) => setIncludeSocialMedia(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">社交媒体</span>
                </label>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-2">
              <button
                onClick={generateUsers}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                生成用户
              </button>
              <div className="flex gap-2">
                <button
                  onClick={copyAllUsers}
                  disabled={users.length === 0}
                  className="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  复制全部
                </button>
                <button
                  onClick={downloadJSON}
                  disabled={users.length === 0}
                  className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  JSON
                </button>
                <button
                  onClick={downloadCSV}
                  disabled={users.length === 0}
                  className="flex-1 px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* 用户头部 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.occupation}</p>
                  </div>
                  <button
                    onClick={() => copyUser(user)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 用户信息 */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">年龄:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{user.age}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">性别:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {user.gender === 'male' ? '男' : '女'}
                    </span>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">邮箱:</div>
                  <div className="text-gray-900 dark:text-gray-100 font-mono break-all">{user.email}</div>
                </div>

                <div className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">电话:</div>
                  <div className="text-gray-900 dark:text-gray-100 font-mono">{user.phone}</div>
                </div>

                <div className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">地址:</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {user.address.city}, {user.address.state}
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">公司:</div>
                  <div className="text-gray-900 dark:text-gray-100">{user.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            点击"生成用户"按钮开始生成虚假用户数据
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 支持中文和英文用户数据</li>
                <li>• 生成完整的用户信息</li>
                <li>• 可自定义生成数量和选项</li>
                <li>• 支持 JSON 和 CSV 格式导出</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用场景</h4>
              <ul className="space-y-1">
                <li>• 软件测试数据准备</li>
                <li>• 原型设计和演示</li>
                <li>• 数据库填充</li>
                <li>• API 接口测试</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
