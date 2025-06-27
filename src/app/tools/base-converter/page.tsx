'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Calculator, Copy, RefreshCw, Hash, AlertCircle } from 'lucide-react'

interface ConversionResult {
  base: number
  value: string
  label: string
}

/**
 * 进制转换器组件
 * 支持 2-36 进制之间的数字转换
 */
export default function BaseConverterPage() {
  const [inputValue, setInputValue] = useState('255')
  const [inputBase, setInputBase] = useState(10)
  const [error, setError] = useState('')

  // 常用进制
  const commonBases = [
    { base: 2, label: '二进制', prefix: '0b' },
    { base: 8, label: '八进制', prefix: '0o' },
    { base: 10, label: '十进制', prefix: '' },
    { base: 16, label: '十六进制', prefix: '0x' }
  ]

  // 验证输入是否有效
  const isValidInput = useCallback((value: string, base: number): boolean => {
    if (!value.trim()) return false
    
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base)
    return value.toUpperCase().split('').every(char => validChars.includes(char))
  }, [])

  // 转换为十进制
  const toDecimal = useCallback((value: string, fromBase: number): number => {
    return parseInt(value, fromBase)
  }, [])

  // 从十进制转换到指定进制
  const fromDecimal = useCallback((decimal: number, toBase: number): string => {
    return decimal.toString(toBase).toUpperCase()
  }, [])

  // 计算所有进制的转换结果
  const conversionResults = useMemo((): ConversionResult[] => {
    if (!inputValue.trim()) {
      setError('')
      return []
    }

    if (!isValidInput(inputValue, inputBase)) {
      setError(`输入值包含无效字符，${inputBase}进制只能包含: ${
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, inputBase)
      }`)
      return []
    }

    try {
      const decimal = toDecimal(inputValue, inputBase)
      
      if (decimal < 0 || !isFinite(decimal)) {
        setError('无效的数值')
        return []
      }

      setError('')

      const results: ConversionResult[] = []
      
      // 常用进制
      commonBases.forEach(({ base, label }) => {
        results.push({
          base,
          value: fromDecimal(decimal, base),
          label
        })
      })

      // 其他进制（如果当前输入不是常用进制）
      if (!commonBases.some(b => b.base === inputBase)) {
        results.push({
          base: inputBase,
          value: inputValue.toUpperCase(),
          label: `${inputBase}进制`
        })
      }

      return results
    } catch (err) {
      setError('转换失败')
      return []
    }
  }, [inputValue, inputBase, isValidInput, toDecimal, fromDecimal])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 设置输入值和进制
  const setInput = (value: string, base: number) => {
    setInputValue(value)
    setInputBase(base)
  }

  // 清空输入
  const clearInput = () => {
    setInputValue('')
    setError('')
  }

  // 示例数据
  const examples = [
    { value: '255', base: 10, description: '十进制 255' },
    { value: 'FF', base: 16, description: '十六进制 FF' },
    { value: '11111111', base: 2, description: '二进制 11111111' },
    { value: '377', base: 8, description: '八进制 377' },
    { value: '1000', base: 10, description: '十进制 1000' },
    { value: '3E8', base: 16, description: '十六进制 3E8' }
  ]

  // 获取进制字符集
  const getBaseCharset = (base: number): string => {
    return '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base)
  }

  // 计算数值信息
  const getNumberInfo = (): { decimal: number; binary: string; hex: string } | null => {
    if (!inputValue.trim() || error) return null
    
    try {
      const decimal = toDecimal(inputValue, inputBase)
      return {
        decimal,
        binary: fromDecimal(decimal, 2),
        hex: fromDecimal(decimal, 16)
      }
    } catch {
      return null
    }
  }

  const numberInfo = getNumberInfo()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔢 进制转换器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            支持 2-36 进制之间的数字转换
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：输入面板 */}
          <div className="space-y-6">
            {/* 数值输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                数值输入
              </h3>
              
              <div className="space-y-4">
                {/* 输入值 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    数值
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                    placeholder="输入数值..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 输入进制 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输入进制
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {commonBases.map(({ base, label }) => (
                      <button
                        key={base}
                        onClick={() => setInputBase(base)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          inputBase === base
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="2"
                    max="36"
                    value={inputBase}
                    onChange={(e) => setInputBase(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 可用字符 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {inputBase}进制可用字符
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
                    {getBaseCharset(inputBase)}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={clearInput}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    清空
                  </button>
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* 示例 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                示例
              </h3>
              
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(example.value, example.base)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-mono text-gray-900 dark:text-gray-100">
                      {example.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {example.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：转换结果 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 转换结果 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">转换结果</h3>
              </div>
              <div className="p-4">
                {conversionResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conversionResults.map((result) => (
                      <div key={result.base} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {result.label}
                          </span>
                          <button
                            onClick={() => copyToClipboard(result.value)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="font-mono text-lg text-blue-600 dark:text-blue-400 break-all">
                          {commonBases.find(b => b.base === result.base)?.prefix}{result.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {result.base}进制
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    输入数值开始转换
                  </div>
                )}
              </div>
            </div>

            {/* 数值信息 */}
            {numberInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">数值信息</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {numberInfo.decimal.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">十进制值</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-lg font-mono text-green-600 dark:text-green-400">
                        {numberInfo.binary.length} 位
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">二进制位数</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-lg font-mono text-purple-600 dark:text-purple-400">
                        0x{numberInfo.hex}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">十六进制</div>
                    </div>
                  </div>

                  {/* 二进制分组显示 */}
                  {numberInfo.binary.length > 8 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        二进制分组显示
                      </div>
                      <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg break-all">
                        {numberInfo.binary.match(/.{1,8}/g)?.join(' ') || numberInfo.binary}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 进制对照表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">进制对照表 (0-15)</h3>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">十进制</th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">二进制</th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">八进制</th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">十六进制</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 16 }, (_, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-1 font-mono text-gray-900 dark:text-gray-100">{i}</td>
                          <td className="py-1 font-mono text-gray-900 dark:text-gray-100">{i.toString(2).padStart(4, '0')}</td>
                          <td className="py-1 font-mono text-gray-900 dark:text-gray-100">{i.toString(8)}</td>
                          <td className="py-1 font-mono text-gray-900 dark:text-gray-100">{i.toString(16).toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">支持进制</h4>
              <ul className="space-y-1">
                <li>• 二进制 (0-1)</li>
                <li>• 八进制 (0-7)</li>
                <li>• 十进制 (0-9)</li>
                <li>• 十六进制 (0-9, A-F)</li>
                <li>• 任意 2-36 进制</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 输入时自动转换为大写</li>
                <li>• 支持复制转换结果</li>
                <li>• 实时验证输入有效性</li>
                <li>• 显示二进制分组便于阅读</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
