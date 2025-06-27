'use client'

import React, { useState, useCallback } from 'react'
import { Copy, RefreshCw, Download, Key, Settings, Shield } from 'lucide-react'

interface PassphraseOptions {
  wordCount: number
  separator: string
  includeNumbers: boolean
  includeSymbols: boolean
  capitalize: 'none' | 'first' | 'all' | 'random'
  language: 'en' | 'zh'
}

/**
 * 随机密码短语生成器组件
 * 生成易记忆但安全的密码短语
 */
export default function PassphraseGeneratorPage() {
  const [options, setOptions] = useState<PassphraseOptions>({
    wordCount: 4,
    separator: '-',
    includeNumbers: true,
    includeSymbols: false,
    capitalize: 'first',
    language: 'en'
  })
  const [passphrases, setPassphrases] = useState<string[]>([])

  // 英文词库
  const englishWords = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'house',
    'island', 'jungle', 'kitten', 'lemon', 'mountain', 'nature', 'ocean', 'planet',
    'queen', 'river', 'sunset', 'tiger', 'umbrella', 'valley', 'winter', 'yellow',
    'zebra', 'bridge', 'castle', 'diamond', 'engine', 'flower', 'guitar', 'hammer',
    'iceberg', 'jacket', 'keyboard', 'laptop', 'mirror', 'notebook', 'orange', 'pencil',
    'rabbit', 'silver', 'table', 'unicorn', 'violin', 'window', 'crystal', 'thunder',
    'rainbow', 'butterfly', 'elephant', 'dolphin', 'penguin', 'giraffe', 'kangaroo',
    'octopus', 'starfish', 'seahorse', 'firefly', 'dragonfly', 'ladybug', 'spider',
    'rocket', 'satellite', 'telescope', 'microscope', 'compass', 'anchor', 'lighthouse',
    'treasure', 'adventure', 'journey', 'discovery', 'mystery', 'magic', 'wonder'
  ]

  // 中文词库
  const chineseWords = [
    '苹果', '香蕉', '樱桃', '龙', '老鹰', '森林', '花园', '房子',
    '岛屿', '丛林', '小猫', '柠檬', '山', '自然', '海洋', '星球',
    '女王', '河流', '日落', '老虎', '雨伞', '山谷', '冬天', '黄色',
    '斑马', '桥', '城堡', '钻石', '引擎', '花朵', '吉他', '锤子',
    '冰山', '夹克', '键盘', '笔记本', '镜子', '笔记本', '橙子', '铅笔',
    '兔子', '银色', '桌子', '独角兽', '小提琴', '窗户', '水晶', '雷声',
    '彩虹', '蝴蝶', '大象', '海豚', '企鹅', '长颈鹿', '袋鼠',
    '章鱼', '海星', '海马', '萤火虫', '蜻蜓', '瓢虫', '蜘蛛',
    '火箭', '卫星', '望远镜', '显微镜', '指南针', '锚', '灯塔',
    '宝藏', '冒险', '旅程', '发现', '神秘', '魔法', '奇迹'
  ]

  // 数字和符号
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const symbols = ['!', '@', '#', '$', '%', '&', '*', '+', '=', '?']

  // 随机选择
  const randomChoice = useCallback(<T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }, [])

  // 处理单词大小写
  const processCapitalization = useCallback((word: string, index: number, total: number): string => {
    switch (options.capitalize) {
      case 'first':
        return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      case 'all':
        return word.charAt(0).toUpperCase() + word.slice(1)
      case 'random':
        return Math.random() > 0.5 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      default:
        return word
    }
  }, [options.capitalize])

  // 生成单个密码短语
  const generateSinglePassphrase = useCallback((): string => {
    const wordList = options.language === 'zh' ? chineseWords : englishWords
    const words: string[] = []

    // 选择单词
    for (let i = 0; i < options.wordCount; i++) {
      let word = randomChoice(wordList)
      word = processCapitalization(word, i, options.wordCount)
      words.push(word)
    }

    // 添加数字
    if (options.includeNumbers) {
      const numberCount = Math.floor(Math.random() * 2) + 1 // 1-2个数字
      for (let i = 0; i < numberCount; i++) {
        words.push(randomChoice(numbers))
      }
    }

    // 添加符号
    if (options.includeSymbols) {
      const symbolCount = Math.floor(Math.random() * 2) + 1 // 1-2个符号
      for (let i = 0; i < symbolCount; i++) {
        words.push(randomChoice(symbols))
      }
    }

    return words.join(options.separator)
  }, [options, randomChoice, processCapitalization, englishWords, chineseWords, numbers, symbols])

  // 生成多个密码短语
  const generatePassphrases = useCallback(() => {
    const newPassphrases = Array.from({ length: 10 }, () => generateSinglePassphrase())
    setPassphrases(newPassphrases)
  }, [generateSinglePassphrase])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 下载密码短语
  const downloadPassphrases = () => {
    const content = [
      '# 随机密码短语',
      '',
      `生成时间: ${new Date().toLocaleString()}`,
      `单词数量: ${options.wordCount}`,
      `分隔符: ${options.separator}`,
      `包含数字: ${options.includeNumbers ? '是' : '否'}`,
      `包含符号: ${options.includeSymbols ? '是' : '否'}`,
      `大小写: ${options.capitalize}`,
      `语言: ${options.language === 'zh' ? '中文' : '英文'}`,
      '',
      '## 生成的密码短语:',
      '',
      ...passphrases.map((phrase, index) => `${index + 1}. ${phrase}`)
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passphrases.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 计算密码强度
  const calculateStrength = (passphrase: string): { score: number; level: string; color: string } => {
    let score = 0
    
    // 长度评分
    score += Math.min(passphrase.length * 2, 50)
    
    // 字符类型评分
    if (/[a-z]/.test(passphrase)) score += 10
    if (/[A-Z]/.test(passphrase)) score += 10
    if (/[0-9]/.test(passphrase)) score += 10
    if (/[^a-zA-Z0-9]/.test(passphrase)) score += 20
    
    // 单词数量评分
    const wordCount = passphrase.split(options.separator).length
    score += wordCount * 5

    let level = '弱'
    let color = 'text-red-500'
    
    if (score >= 80) {
      level = '很强'
      color = 'text-green-500'
    } else if (score >= 60) {
      level = '强'
      color = 'text-blue-500'
    } else if (score >= 40) {
      level = '中等'
      color = 'text-yellow-500'
    }

    return { score: Math.min(score, 100), level, color }
  }

  // 初始生成
  React.useEffect(() => {
    generatePassphrases()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔐 密码短语生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            生成易记忆但安全的密码短语
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
                {/* 单词数量 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    单词数量: {options.wordCount}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={options.wordCount}
                    onChange={(e) => setOptions(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>2</span>
                    <span>8</span>
                  </div>
                </div>

                {/* 分隔符 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分隔符
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['-', '_', '.', ' '].map(sep => (
                      <button
                        key={sep}
                        onClick={() => setOptions(prev => ({ ...prev, separator: sep }))}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          options.separator === sep
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {sep === ' ' ? '空格' : sep}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 大小写 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    大小写
                  </label>
                  <select
                    value={options.capitalize}
                    onChange={(e) => setOptions(prev => ({ ...prev, capitalize: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="none">全小写</option>
                    <option value="first">首单词大写</option>
                    <option value="all">全部大写</option>
                    <option value="random">随机大写</option>
                  </select>
                </div>

                {/* 语言 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    语言
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOptions(prev => ({ ...prev, language: 'en' }))}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        options.language === 'en'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setOptions(prev => ({ ...prev, language: 'zh' }))}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        options.language === 'zh'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      中文
                    </button>
                  </div>
                </div>

                {/* 附加选项 */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeNumbers}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">包含数字</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeSymbols}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">包含符号</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <button
                onClick={generatePassphrases}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                生成密码短语
              </button>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={downloadPassphrases}
                  disabled={passphrases.length === 0}
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  生成的密码短语
                </h3>
              </div>
              
              <div className="p-4">
                {passphrases.length > 0 ? (
                  <div className="space-y-3">
                    {passphrases.map((passphrase, index) => {
                      const strength = calculateStrength(passphrase)
                      return (
                        <div
                          key={index}
                          className="group bg-gray-50 dark:bg-gray-900 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <span className={`text-sm font-medium ${strength.color}`}>
                                {strength.level}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({strength.score}/100)
                              </span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(passphrase)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div 
                            className="font-mono text-lg text-gray-900 dark:text-gray-100 break-all cursor-pointer"
                            onClick={() => copyToClipboard(passphrase)}
                            title="点击复制"
                          >
                            {passphrase}
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            长度: {passphrase.length} 字符
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    点击"生成密码短语"按钮开始生成
                  </div>
                )}
              </div>
            </div>

            {/* 使用说明 */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">密码短语优势</h4>
                  <ul className="space-y-1">
                    <li>• 比传统密码更容易记忆</li>
                    <li>• 长度更长，安全性更高</li>
                    <li>• 抗字典攻击能力强</li>
                    <li>• 符合人类记忆习惯</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">安全建议</h4>
                  <ul className="space-y-1">
                    <li>• 建议使用4个或更多单词</li>
                    <li>• 添加数字和符号增强安全性</li>
                    <li>• 不同账户使用不同密码短语</li>
                    <li>• 定期更换重要账户密码</li>
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
