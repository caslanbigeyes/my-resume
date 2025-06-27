'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Search, Copy, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * 正则表达式测试工具组件
 * 实时测试正则表达式匹配
 */
export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState('')
  const [error, setError] = useState('')

  // 正则表达式匹配结果
  const matchResult = useMemo(() => {
    if (!pattern || !testText) {
      setError('')
      return { matches: [], isValid: true }
    }

    try {
      const regex = new RegExp(pattern, flags)
      const matches = Array.from(testText.matchAll(regex))
      setError('')
      
      return {
        matches: matches.map((match, index) => ({
          index,
          match: match[0],
          groups: match.slice(1),
          start: match.index || 0,
          end: (match.index || 0) + match[0].length
        })),
        isValid: true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '正则表达式语法错误')
      return { matches: [], isValid: false }
    }
  }, [pattern, flags, testText])

  // 高亮显示匹配文本
  const highlightedText = useMemo(() => {
    if (!testText || !matchResult.isValid || matchResult.matches.length === 0) {
      return testText
    }

    let result = ''
    let lastIndex = 0

    matchResult.matches.forEach((match, index) => {
      // 添加匹配前的文本
      result += testText.slice(lastIndex, match.start)
      // 添加高亮的匹配文本
      result += `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" data-match="${index}">${match.match}</mark>`
      lastIndex = match.end
    })

    // 添加最后的文本
    result += testText.slice(lastIndex)

    return result
  }, [testText, matchResult])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 常用正则表达式示例
  const examples = [
    {
      name: '邮箱地址',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      testText: '联系我们：admin@example.com 或 support@test.org',
      flags: 'g'
    },
    {
      name: '手机号码',
      pattern: '1[3-9]\\d{9}',
      testText: '我的手机号是 13812345678，备用号码：15987654321',
      flags: 'g'
    },
    {
      name: 'URL 链接',
      pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?',
      testText: '访问 https://www.example.com 或 http://test.org/path?id=123',
      flags: 'g'
    },
    {
      name: 'IP 地址',
      pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b',
      testText: '服务器IP：192.168.1.1，备用IP：10.0.0.1',
      flags: 'g'
    },
    {
      name: '日期格式',
      pattern: '\\d{4}-\\d{2}-\\d{2}',
      testText: '项目开始日期：2024-01-15，结束日期：2024-12-31',
      flags: 'g'
    }
  ]

  // 加载示例
  const loadExample = (example: typeof examples[0]) => {
    setPattern(example.pattern)
    setFlags(example.flags)
    setTestText(example.testText)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎯 正则表达式测试器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            实时测试和验证正则表达式匹配
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：正则表达式输入 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 正则表达式输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  正则表达式
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    模式 (Pattern)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
                      /
                    </span>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="输入正则表达式..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md">
                      /{flags}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    标志 (Flags)
                  </label>
                  <div className="flex gap-4">
                    {[
                      { flag: 'g', name: '全局匹配' },
                      { flag: 'i', name: '忽略大小写' },
                      { flag: 'm', name: '多行模式' },
                      { flag: 's', name: '单行模式' }
                    ].map(({ flag, name }) => (
                      <label key={flag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={flags.includes(flag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFlags(prev => prev + flag)
                            } else {
                              setFlags(prev => prev.replace(flag, ''))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {flag} - {name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {!error && pattern && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    正则表达式语法正确
                  </div>
                )}
              </div>
            </div>

            {/* 测试文本输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">测试文本</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="输入要测试的文本..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 匹配结果显示 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    匹配结果 ({matchResult.matches.length} 个匹配)
                  </h3>
                  {highlightedText && (
                    <button
                      onClick={() => copyToClipboard(highlightedText.replace(/<[^>]*>/g, ''))}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Copy className="w-4 h-4 inline mr-1" />
                      复制
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4">
                {highlightedText ? (
                  <div
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm whitespace-pre-wrap font-mono"
                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                  />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                    输入正则表达式和测试文本以查看匹配结果
                  </div>
                )}
              </div>
            </div>

            {/* 匹配详情 */}
            {matchResult.matches.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">匹配详情</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {matchResult.matches.map((match, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            匹配 #{index + 1}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            位置: {match.start}-{match.end}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className="mb-1">
                            <span className="text-gray-600 dark:text-gray-400">匹配内容: </span>
                            <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                              {match.match}
                            </code>
                          </div>
                          {match.groups.length > 0 && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">捕获组: </span>
                              {match.groups.map((group, groupIndex) => (
                                <code key={groupIndex} className="bg-blue-100 dark:bg-blue-900 px-1 rounded mr-1">
                                  ${groupIndex + 1}: {group}
                                </code>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：示例和帮助 */}
          <div className="space-y-6">
            {/* 常用示例 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  常用示例
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => loadExample(example)}
                      className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {example.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        /{example.pattern}/{example.flags}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 语法帮助 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">语法参考</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">字符类</div>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <div><code>.</code> - 任意字符</div>
                      <div><code>\d</code> - 数字</div>
                      <div><code>\w</code> - 字母数字下划线</div>
                      <div><code>\s</code> - 空白字符</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">量词</div>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <div><code>*</code> - 0次或多次</div>
                      <div><code>+</code> - 1次或多次</div>
                      <div><code>?</code> - 0次或1次</div>
                      <div><code>{`{n,m}`}</code> - n到m次</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">锚点</div>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <div><code>^</code> - 行开始</div>
                      <div><code>$</code> - 行结束</div>
                      <div><code>\b</code> - 单词边界</div>
                    </div>
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
