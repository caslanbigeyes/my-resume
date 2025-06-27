'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, TestTube, BookOpen, Wand2, CheckCircle, XCircle } from 'lucide-react'

interface RegexPattern {
  name: string
  pattern: string
  description: string
  examples: string[]
}

interface TestResult {
  text: string
  matches: boolean
  matchedGroups?: string[]
}

/**
 * 正则表达式生成器组件
 * 生成常用正则表达式并提供测试功能
 */
export default function RegexGeneratorPage() {
  const [selectedCategory, setSelectedCategory] = useState('basic')
  const [customPattern, setCustomPattern] = useState('')
  const [testText, setTestText] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false
  })

  // 正则表达式模式库
  const regexPatterns: { [key: string]: RegexPattern[] } = {
    basic: [
      {
        name: '数字',
        pattern: '\\d+',
        description: '匹配一个或多个数字',
        examples: ['123', '456789', '0']
      },
      {
        name: '字母',
        pattern: '[a-zA-Z]+',
        description: '匹配一个或多个字母',
        examples: ['hello', 'World', 'ABC']
      },
      {
        name: '字母数字',
        pattern: '[a-zA-Z0-9]+',
        description: '匹配一个或多个字母或数字',
        examples: ['abc123', 'test1', 'Hello2World']
      },
      {
        name: '空白字符',
        pattern: '\\s+',
        description: '匹配一个或多个空白字符',
        examples: [' ', '\\t', '\\n']
      }
    ],
    validation: [
      {
        name: '邮箱地址',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        description: '验证邮箱地址格式',
        examples: ['user@example.com', 'test.email@domain.org', 'name+tag@site.co.uk']
      },
      {
        name: '手机号码',
        pattern: '^1[3-9]\\d{9}$',
        description: '验证中国大陆手机号码',
        examples: ['13812345678', '15987654321', '18666888999']
      },
      {
        name: 'URL 地址',
        pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
        description: '验证 HTTP/HTTPS URL',
        examples: ['https://www.example.com', 'http://site.org/path', 'https://domain.com/page?id=1']
      },
      {
        name: 'IP 地址',
        pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
        description: '验证 IPv4 地址',
        examples: ['192.168.1.1', '10.0.0.1', '255.255.255.255']
      },
      {
        name: '身份证号',
        pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
        description: '验证中国身份证号码',
        examples: ['110101199003077777', '320101198001011234']
      }
    ],
    extraction: [
      {
        name: '提取数字',
        pattern: '\\d+',
        description: '从文本中提取所有数字',
        examples: ['价格：99元', '电话：12345', '年份：2023']
      },
      {
        name: '提取邮箱',
        pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        description: '从文本中提取邮箱地址',
        examples: ['联系我：user@example.com', '邮箱：test@domain.org']
      },
      {
        name: '提取 URL',
        pattern: 'https?:\\/\\/[^\\s]+',
        description: '从文本中提取 URL 链接',
        examples: ['访问 https://www.example.com 了解更多', '链接：http://site.org']
      },
      {
        name: '提取中文',
        pattern: '[\\u4e00-\\u9fa5]+',
        description: '从文本中提取中文字符',
        examples: ['Hello 世界', '中文 English 混合']
      }
    ],
    formatting: [
      {
        name: '日期格式',
        pattern: '\\d{4}-\\d{2}-\\d{2}',
        description: '匹配 YYYY-MM-DD 日期格式',
        examples: ['2023-12-25', '2024-01-01', '1999-05-20']
      },
      {
        name: '时间格式',
        pattern: '\\d{2}:\\d{2}(:\\d{2})?',
        description: '匹配 HH:MM 或 HH:MM:SS 时间格式',
        examples: ['14:30', '09:15:30', '23:59']
      },
      {
        name: '货币金额',
        pattern: '\\$?\\d{1,3}(,\\d{3})*(\\.\\d{2})?',
        description: '匹配货币金额格式',
        examples: ['$1,234.56', '999.99', '$10,000']
      },
      {
        name: '十六进制颜色',
        pattern: '#[0-9a-fA-F]{6}',
        description: '匹配十六进制颜色代码',
        examples: ['#FF0000', '#00ff00', '#0000FF']
      }
    ]
  }

  // 分类标签
  const categories = {
    basic: '基础模式',
    validation: '数据验证',
    extraction: '内容提取',
    formatting: '格式匹配'
  }

  // 测试正则表达式
  const testRegex = useCallback((pattern: string, text: string) => {
    try {
      const flagsStr = `${flags.global ? 'g' : ''}${flags.ignoreCase ? 'i' : ''}${flags.multiline ? 'm' : ''}`
      const regex = new RegExp(pattern, flagsStr)
      
      if (flags.global) {
        const matches = text.match(regex)
        return {
          text,
          matches: !!matches,
          matchedGroups: matches || []
        }
      } else {
        const match = regex.exec(text)
        return {
          text,
          matches: !!match,
          matchedGroups: match ? [match[0]] : []
        }
      }
    } catch (error) {
      return {
        text,
        matches: false,
        matchedGroups: []
      }
    }
  }, [flags])

  // 批量测试
  const runTests = useCallback(() => {
    if (!testText.trim()) return

    const lines = testText.split('\n').filter(line => line.trim())
    const pattern = customPattern || (regexPatterns[selectedCategory]?.[0]?.pattern || '')
    
    const results = lines.map(line => testRegex(pattern, line.trim()))
    setTestResults(results)
  }, [testText, customPattern, selectedCategory, testRegex, regexPatterns])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 选择模式
  const selectPattern = (pattern: RegexPattern) => {
    setCustomPattern(pattern.pattern)
    setTestText(pattern.examples.join('\n'))
  }

  // 生成正则表达式代码
  const generateCode = useMemo(() => {
    const pattern = customPattern || ''
    const flagsStr = `${flags.global ? 'g' : ''}${flags.ignoreCase ? 'i' : ''}${flags.multiline ? 'm' : ''}`
    
    return {
      javascript: `const regex = /${pattern}/${flagsStr};\nconst result = text.match(regex);`,
      python: `import re\npattern = r'${pattern}'\nresult = re.findall(pattern, text${flags.ignoreCase ? ', re.IGNORECASE' : ''})`,
      java: `Pattern pattern = Pattern.compile("${pattern}"${flags.ignoreCase ? ', Pattern.CASE_INSENSITIVE' : ''});\nMatcher matcher = pattern.matcher(text);`,
      php: `$pattern = '/${pattern}/${flagsStr}';\npreg_match_all($pattern, $text, $matches);`
    }
  }, [customPattern, flags])

  // 自动运行测试
  React.useEffect(() => {
    if (testText && (customPattern || regexPatterns[selectedCategory]?.[0])) {
      runTests()
    }
  }, [testText, customPattern, selectedCategory, flags, runTests, regexPatterns])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔧 正则表达式生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            生成常用正则表达式并提供测试功能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：模式库 */}
          <div className="space-y-6">
            {/* 分类选择 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                模式库
              </h3>
              
              <div className="space-y-2">
                {Object.entries(categories).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 模式列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {categories[selectedCategory as keyof typeof categories]}
              </h3>
              
              <div className="space-y-3">
                {regexPatterns[selectedCategory]?.map((pattern, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{pattern.name}</h4>
                      <button
                        onClick={() => selectPattern(pattern)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <Wand2 className="w-3 h-3 inline mr-1" />
                        使用
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{pattern.description}</p>
                    <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded break-all">
                      {pattern.pattern}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 中间：编辑器和测试 */}
          <div className="space-y-6">
            {/* 正则表达式编辑器 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">正则表达式</h3>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                    placeholder="输入或选择正则表达式..."
                    className="w-full h-20 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 标志选项 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    标志选项
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={flags.global}
                        onChange={(e) => setFlags(prev => ({ ...prev, global: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">全局 (g)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={flags.ignoreCase}
                        onChange={(e) => setFlags(prev => ({ ...prev, ignoreCase: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">忽略大小写 (i)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={flags.multiline}
                        onChange={(e) => setFlags(prev => ({ ...prev, multiline: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">多行 (m)</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(customPattern)}
                  disabled={!customPattern}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  复制正则表达式
                </button>
              </div>
            </div>

            {/* 测试文本 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                测试文本
              </h3>
              
              <div className="space-y-4">
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="输入测试文本，每行一个测试用例..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <button
                  onClick={runTests}
                  disabled={!testText.trim() || !customPattern}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  运行测试
                </button>
              </div>
            </div>

            {/* 测试结果 */}
            {testResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">测试结果</h3>
                
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      {result.matches ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate">
                          {result.text}
                        </div>
                        {result.matchedGroups && result.matchedGroups.length > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            匹配: {result.matchedGroups.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：代码生成 */}
          <div className="space-y-6">
            {/* 代码生成 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">代码生成</h3>
              
              <div className="space-y-4">
                {Object.entries(generateCode).map(([language, code]) => (
                  <div key={language}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">{language}</h4>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                      <code className="text-gray-700 dark:text-gray-300">{code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* 快速参考 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">快速参考</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">字符类</h4>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.</code> - 任意字符</div>
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">\d</code> - 数字</div>
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">\w</code> - 字母数字下划线</div>
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">\s</code> - 空白字符</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">量词</h4>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">*</code> - 0次或多次</div>
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">+</code> - 1次或多次</div>
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">?</code> - 0次或1次</div>
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{`{n,m}`}</code> - n到m次</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">锚点</h4>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">^</code> - 行开始</div>
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">$</code> - 行结束</div>
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">\b</code> - 单词边界</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 丰富的正则表达式模式库</li>
                <li>• 实时测试和验证功能</li>
                <li>• 多语言代码生成</li>
                <li>• 可视化匹配结果</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 从模式库选择常用正则</li>
                <li>• 使用标志选项控制匹配行为</li>
                <li>• 在测试区域验证表达式</li>
                <li>• 复制生成的代码到项目中</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
