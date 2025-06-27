'use client'

import React, { useState, useCallback } from 'react'
import { Copy, RefreshCw, Download, User, Settings, Globe } from 'lucide-react'

interface NameOptions {
  locale: 'zh' | 'en' | 'jp' | 'kr'
  gender: 'male' | 'female' | 'mixed'
  count: number
  includeLastName: boolean
  style: 'traditional' | 'modern' | 'creative'
}

/**
 * 随机名字生成器组件
 * 生成不同语言和风格的随机姓名
 */
export default function NameGeneratorPage() {
  const [options, setOptions] = useState<NameOptions>({
    locale: 'zh',
    gender: 'mixed',
    count: 10,
    includeLastName: true,
    style: 'traditional'
  })
  const [generatedNames, setGeneratedNames] = useState<string[]>([])

  // 中文姓名数据
  const zhNames = {
    lastNames: ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕'],
    firstNames: {
      male: {
        traditional: ['伟', '强', '磊', '军', '勇', '涛', '明', '超', '辉', '华', '建', '国', '峰', '鹏', '飞', '志', '刚', '金', '健', '智', '浩', '嘉', '博', '文', '武', '德', '福', '贵', '安', '康'],
        modern: ['轩', '宇', '晨', '阳', '睿', '泽', '昊', '宸', '煜', '琛', '瑞', '霖', '梓', '俊', '凯', '逸', '航', '晟', '铭', '锐', '骏', '翔', '皓', '炫', '烨', '璟', '澄', '墨', '景', '弘'],
        creative: ['星河', '云帆', '天翼', '逸尘', '墨轩', '风华', '雨泽', '晨曦', '夜阑', '清风', '明月', '沧海', '青山', '白云', '紫霄', '金辉', '银河', '玉树', '琼花', '瑶池']
      },
      female: {
        traditional: ['芳', '娜', '敏', '静', '丽', '华', '秀', '英', '慧', '巧', '美', '娟', '红', '艳', '玲', '梅', '莉', '燕', '霞', '月', '凤', '洁', '琴', '素', '云', '莲', '真', '环', '雪', '荣'],
        modern: ['欣', '怡', '雅', '琪', '萱', '涵', '婷', '妍', '蕊', '薇', '晴', '悦', '诗', '语', '梦', '思', '韵', '馨', '颖', '洋', '媛', '佳', '雨', '嫣', '然', '可', '心', '若', '安', '宁'],
        creative: ['紫嫣', '雨薇', '梦琪', '诗涵', '语嫣', '若汐', '安然', '静雅', '清韵', '婉约', '柔情', '花语', '月影', '星辰', '晨露', '夕颜', '烟雨', '流云', '碧玉', '琼瑶']
      }
    }
  }

  // 英文姓名数据
  const enNames = {
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'],
    firstNames: {
      male: {
        traditional: ['James', 'Robert', 'John', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'],
        modern: ['Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Levi', 'Sebastian', 'Mateo'],
        creative: ['Zephyr', 'Phoenix', 'Atlas', 'Orion', 'Sage', 'River', 'Storm', 'Blaze', 'Kai', 'Zion', 'Axel', 'Knox', 'Ryder', 'Jaxon', 'Maverick', 'Ace', 'Cruz', 'Zander', 'Ryker', 'Titan']
      },
      female: {
        traditional: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle'],
        modern: ['Olivia', 'Emma', 'Ava', 'Charlotte', 'Sophia', 'Amelia', 'Isabella', 'Mia', 'Evelyn', 'Harper', 'Camila', 'Gianna', 'Abigail', 'Luna', 'Ella', 'Elizabeth', 'Sofia', 'Emily', 'Avery', 'Mila'],
        creative: ['Aurora', 'Luna', 'Aria', 'Nova', 'Sage', 'Willow', 'River', 'Skye', 'Phoenix', 'Iris', 'Jade', 'Raven', 'Ivy', 'Rose', 'Violet', 'Hazel', 'Autumn', 'Summer', 'Winter', 'Dawn']
      }
    }
  }

  // 日文姓名数据
  const jpNames = {
    lastNames: ['佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水'],
    firstNames: {
      male: {
        traditional: ['太郎', '次郎', '三郎', '四郎', '五郎', '一郎', '健太', '大輔', '雄太', '翔太', '拓也', '和也', '直樹', '智也', '裕太', '康太', '正樹', '秀樹', '光一', '浩二'],
        modern: ['蓮', '大翔', '陽翔', '悠真', '湊', '樹', '大和', '陽太', '悠人', '陸', '颯', '新', '蒼', '奏太', '碧', '大雅', '陽向', '結翔', '琉生', '朝陽'],
        creative: ['星空', '海斗', '風雅', '雲海', '月光', '天翔', '龍馬', '鳳凰', '銀河', '虹太', '光輝', '夢斗', '希望', '未来', '永遠', '無限', '奇跡', '伝説', '神話', '英雄']
      },
      female: {
        traditional: ['花子', '恵子', '美子', '和子', '洋子', '裕子', '智子', '由美', '真由美', '美穂', '美香', '直美', '久美子', '雅子', '典子', '良子', '幸子', '節子', '悦子', '春子'],
        modern: ['陽葵', '凛', '詩', '結愛', '杏', '莉子', '美月', '結菜', '心春', '花音', '美桜', '結衣', '咲良', '心愛', '美咲', '愛莉', '心結', '美羽', '彩花', '愛美'],
        creative: ['星花', '月姫', '雲雀', '風花', '海音', '虹色', '夢花', '希美', '未来', '永愛', '奇跡', '天使', '妖精', '女神', '姫君', '美神', '光姫', '愛星', '心月', '花音']
      }
    }
  }

  // 韩文姓名数据
  const krNames = {
    lastNames: ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '전'],
    firstNames: {
      male: {
        traditional: ['민수', '영수', '철수', '성수', '진수', '현수', '동수', '상수', '준수', '태수', '영호', '성호', '진호', '현호', '동호', '상호', '준호', '태호', '영민', '성민'],
        modern: ['지훈', '민준', '서준', '예준', '도윤', '시우', '주원', '하준', '지후', '건우', '우진', '선우', '연우', '민재', '현우', '지환', '승우', '시후', '유준', '정우'],
        creative: ['별하늘', '바다', '하늘', '구름', '바람', '달빛', '햇살', '무지개', '천사', '용사', '영웅', '전설', '신화', '기적', '희망', '꿈나무', '별빛', '은하수', '우주', '미래']
      },
      female: {
        traditional: ['영희', '순희', '미희', '정희', '은희', '경희', '수희', '현희', '지희', '민희', '영자', '순자', '미자', '정자', '은자', '경자', '수자', '현자', '지자', '민자'],
        modern: ['서연', '하은', '지우', '서윤', '지유', '채원', '지민', '소율', '윤서', '예은', '수아', '지아', '예린', '서현', '하린', '유나', '채윤', '예나', '시은', '다은'],
        creative: ['별님', '달님', '하늘님', '바다님', '꽃님', '나비', '천사', '요정', '공주', '여신', '미인', '예쁜이', '사랑이', '희망이', '기쁨이', '행복이', '평화', '자유', '꿈동이', '미래']
      }
    }
  }

  // 获取姓名数据
  const getNameData = useCallback(() => {
    switch (options.locale) {
      case 'zh': return zhNames
      case 'en': return enNames
      case 'jp': return jpNames
      case 'kr': return krNames
      default: return zhNames
    }
  }, [options.locale])

  // 随机选择
  const randomChoice = useCallback(<T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }, [])

  // 生成单个姓名
  const generateSingleName = useCallback((): string => {
    const nameData = getNameData()
    const lastName = options.includeLastName ? randomChoice(nameData.lastNames) : ''
    
    let firstNamePool: string[]
    
    if (options.gender === 'mixed') {
      const maleNames = nameData.firstNames.male[options.style]
      const femaleNames = nameData.firstNames.female[options.style]
      firstNamePool = [...maleNames, ...femaleNames]
    } else {
      firstNamePool = nameData.firstNames[options.gender][options.style]
    }
    
    const firstName = randomChoice(firstNamePool)
    
    if (options.locale === 'zh' || options.locale === 'jp' || options.locale === 'kr') {
      return lastName + firstName
    } else {
      return options.includeLastName ? `${firstName} ${lastName}` : firstName
    }
  }, [options, getNameData, randomChoice])

  // 生成多个姓名
  const generateNames = useCallback(() => {
    const names = Array.from({ length: options.count }, () => generateSingleName())
    // 去重
    const uniqueNames = Array.from(new Set(names))
    // 如果去重后数量不够，继续生成
    while (uniqueNames.length < options.count) {
      const newName = generateSingleName()
      if (!uniqueNames.includes(newName)) {
        uniqueNames.push(newName)
      }
    }
    setGeneratedNames(uniqueNames.slice(0, options.count))
  }, [options, generateSingleName])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 复制所有姓名
  const copyAllNames = () => {
    const allNames = generatedNames.join('\n')
    copyToClipboard(allNames)
  }

  // 下载姓名列表
  const downloadNames = () => {
    const content = generatedNames.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-names.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 获取语言标签
  const getLocaleLabel = (locale: string) => {
    const labels: { [key: string]: string } = {
      'zh': '中文',
      'en': 'English',
      'jp': '日本語',
      'kr': '한국어'
    }
    return labels[locale] || locale
  }

  // 获取风格标签
  const getStyleLabel = (style: string) => {
    const labels: { [key: string]: string } = {
      'traditional': '传统',
      'modern': '现代',
      'creative': '创意'
    }
    return labels[style] || style
  }

  // 初始生成
  React.useEffect(() => {
    generateNames()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎭 随机名字生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            生成不同语言和风格的随机姓名
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：设置面板 */}
          <div className="space-y-6">
            {/* 基本设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                生成设置
              </h3>
              
              <div className="space-y-4">
                {/* 语言选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    语言
                  </label>
                  <select
                    value={options.locale}
                    onChange={(e) => setOptions(prev => ({ ...prev, locale: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                    <option value="jp">日本語</option>
                    <option value="kr">한국어</option>
                  </select>
                </div>

                {/* 性别选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    性别
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'male', label: '男性' },
                      { value: 'female', label: '女性' },
                      { value: 'mixed', label: '混合' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setOptions(prev => ({ ...prev, gender: value as any }))}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          options.gender === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 风格选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    风格
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'traditional', label: '传统' },
                      { value: 'modern', label: '现代' },
                      { value: 'creative', label: '创意' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setOptions(prev => ({ ...prev, style: value as any }))}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          options.style === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 生成数量 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    生成数量: {options.count}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={options.count}
                    onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>

                {/* 包含姓氏 */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeLastName}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeLastName: e.target.checked }))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">包含姓氏</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <button
                onClick={generateNames}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                生成姓名
              </button>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={copyAllNames}
                  disabled={generatedNames.length === 0}
                  className="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  复制全部
                </button>
                <button
                  onClick={downloadNames}
                  disabled={generatedNames.length === 0}
                  className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  下载
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：生成结果 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    生成的姓名
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getLocaleLabel(options.locale)} • {getStyleLabel(options.style)} • {generatedNames.length} 个
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {generatedNames.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {generatedNames.map((name, index) => (
                      <div
                        key={index}
                        className="group bg-gray-50 dark:bg-gray-900 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => copyToClipboard(name)}
                        title="点击复制"
                      >
                        <div className="text-center">
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            点击复制
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    点击"生成姓名"按钮开始生成
                  </div>
                )}
              </div>
            </div>

            {/* 使用说明 */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                使用说明
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">支持语言</h4>
                  <ul className="space-y-1">
                    <li>• 中文：包含常见中文姓氏和名字</li>
                    <li>• 英文：包含欧美常见姓名</li>
                    <li>• 日文：包含日本传统和现代姓名</li>
                    <li>• 韩文：包含韩国常见姓名</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">风格说明</h4>
                  <ul className="space-y-1">
                    <li>• 传统：经典传统的姓名</li>
                    <li>• 现代：时尚流行的姓名</li>
                    <li>• 创意：独特有创意的姓名</li>
                    <li>• 支持性别筛选和混合生成</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
