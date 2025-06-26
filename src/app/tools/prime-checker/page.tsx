'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Search, List, Calculator } from 'lucide-react'

/**
 * 质数检测工具组件
 * 判断数字是否为质数
 */
export default function PrimeCheckerTool() {
  const [inputNumber, setInputNumber] = useState('')
  const [rangeStart, setRangeStart] = useState('1')
  const [rangeEnd, setRangeEnd] = useState('100')

  /**
   * 检查是否为质数
   */
  const isPrime = (num: number): boolean => {
    if (num < 2) return false
    if (num === 2) return true
    if (num % 2 === 0) return false
    
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false
    }
    return true
  }

  /**
   * 获取质因数分解
   */
  const getPrimeFactors = (num: number): number[] => {
    const factors: number[] = []
    let n = num

    // 处理2的因子
    while (n % 2 === 0) {
      factors.push(2)
      n = n / 2
    }

    // 处理奇数因子
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      while (n % i === 0) {
        factors.push(i)
        n = n / i
      }
    }

    // 如果n是大于2的质数
    if (n > 2) {
      factors.push(n)
    }

    return factors
  }

  /**
   * 生成指定范围内的质数
   */
  const getPrimesInRange = (start: number, end: number): number[] => {
    const primes: number[] = []
    for (let i = Math.max(2, start); i <= end; i++) {
      if (isPrime(i)) {
        primes.push(i)
      }
    }
    return primes
  }

  /**
   * 单个数字检测结果
   */
  const singleResult = useMemo(() => {
    const num = parseInt(inputNumber)
    if (isNaN(num) || num < 1) return null

    const isNumberPrime = isPrime(num)
    const factors = getPrimeFactors(num)
    
    return {
      number: num,
      isPrime: isNumberPrime,
      factors: factors,
      factorization: factors.length > 1 ? factors.join(' × ') : num.toString()
    }
  }, [inputNumber])

  /**
   * 范围内质数列表
   */
  const rangeResult = useMemo(() => {
    const start = parseInt(rangeStart)
    const end = parseInt(rangeEnd)
    
    if (isNaN(start) || isNaN(end) || start < 1 || end < start || end - start > 1000) {
      return null
    }

    const primes = getPrimesInRange(start, end)
    return {
      start,
      end,
      primes,
      count: primes.length,
      density: ((primes.length / (end - start + 1)) * 100).toFixed(2)
    }
  }, [rangeStart, rangeEnd])

  /**
   * 著名质数
   */
  const famousPrimes = [
    { number: 2, name: '最小质数' },
    { number: 3, name: '最小奇质数' },
    { number: 5, name: '第三个质数' },
    { number: 7, name: '幸运数字' },
    { number: 11, name: '回文质数' },
    { number: 13, name: '不吉利数字' },
    { number: 17, name: '费马质数' },
    { number: 19, name: '快乐质数' },
    { number: 23, name: '索菲热尔曼质数' },
    { number: 29, name: '孪生质数' },
    { number: 31, name: '梅森质数指数' },
    { number: 37, name: '不规则质数' },
    { number: 41, name: '欧拉质数' },
    { number: 43, name: '孪生质数' },
    { number: 47, name: '安全质数' },
    { number: 53, name: '索菲热尔曼质数' }
  ]

  /**
   * 质数趣味事实
   */
  const primeFactsForNumber = (num: number): string[] => {
    const facts: string[] = []
    
    if (num === 2) facts.push('唯一的偶数质数')
    if (num > 2 && isPrime(num)) facts.push('奇质数')
    if (isPrime(num) && isPrime(num + 2)) facts.push('孪生质数的一部分')
    if (isPrime(num) && isPrime(2 * num + 1)) facts.push('索菲热尔曼质数')
    if (num > 1 && isPrime(num) && num.toString() === num.toString().split('').reverse().join('')) {
      facts.push('回文质数')
    }
    
    return facts
  }

  return (
    <ToolLayout
      title="质数检测"
      description="判断数字是否为质数"
      category="数学单位"
      icon="🔢"
    >
      <div className="space-y-6">
        {/* 单个数字检测 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            质数检测
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                输入数字
              </label>
              <input
                type="number"
                min="1"
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value)}
                placeholder="输入要检测的数字"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {singleResult && (
              <div className={`p-4 rounded-lg ${
                singleResult.isPrime ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-2">
                    {singleResult.number}
                  </div>
                  <div className={`text-lg font-medium ${
                    singleResult.isPrime ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {singleResult.isPrime ? '✅ 是质数' : '❌ 不是质数'}
                  </div>
                </div>

                {!singleResult.isPrime && singleResult.factors.length > 0 && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">质因数分解</h4>
                    <div className="text-center">
                      <div className="text-lg font-mono">
                        {singleResult.number} = {singleResult.factorization}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        质因数: {singleResult.factors.filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {singleResult.isPrime && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">质数特性</h4>
                    <div className="space-y-1 text-sm">
                      {primeFactsForNumber(singleResult.number).map((fact, index) => (
                        <div key={index} className="text-green-700">• {fact}</div>
                      ))}
                      {primeFactsForNumber(singleResult.number).length === 0 && (
                        <div className="text-gray-600">这是一个普通质数</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 范围质数查找 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <List className="w-5 h-5" />
            范围质数查找
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  起始数字
                </label>
                <input
                  type="number"
                  min="1"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束数字
                </label>
                <input
                  type="number"
                  min="1"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {rangeResult && (
              <div className="space-y-4">
                {/* 统计信息 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{rangeResult.count}</div>
                    <div className="text-sm text-blue-800">质数个数</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{rangeResult.density}%</div>
                    <div className="text-sm text-green-800">质数密度</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {rangeResult.end - rangeResult.start + 1}
                    </div>
                    <div className="text-sm text-purple-800">总数字个数</div>
                  </div>
                </div>

                {/* 质数列表 */}
                {rangeResult.primes.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {rangeResult.start} - {rangeResult.end} 范围内的质数
                    </h4>
                    <div className="grid grid-cols-8 md:grid-cols-12 gap-2 max-h-64 overflow-y-auto">
                      {rangeResult.primes.map((prime, index) => (
                        <button
                          key={index}
                          onClick={() => setInputNumber(prime.toString())}
                          className="p-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors font-mono"
                          title={`点击检测 ${prime}`}
                        >
                          {prime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {rangeResult.primes.length === 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-yellow-800">在指定范围内没有找到质数</p>
                  </div>
                )}
              </div>
            )}

            {parseInt(rangeEnd) - parseInt(rangeStart) > 1000 && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-orange-800 text-sm">
                  ⚠️ 范围过大，请将范围限制在1000以内以获得更好的性能
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 著名质数 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            著名质数
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {famousPrimes.map((prime, index) => (
              <button
                key={index}
                onClick={() => setInputNumber(prime.number.toString())}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div className="font-bold text-lg text-blue-600">{prime.number}</div>
                <div className="text-sm text-gray-600">{prime.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 输入数字检测是否为质数</li>
            <li>• 对于合数，显示完整的质因数分解</li>
            <li>• 查找指定范围内的所有质数</li>
            <li>• 显示质数密度和统计信息</li>
            <li>• 提供著名质数的快速检测</li>
            <li>• 质数是只能被1和自身整除的大于1的自然数</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
