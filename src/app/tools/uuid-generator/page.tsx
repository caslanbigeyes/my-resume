'use client'

import React, { useState, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { RefreshCw, Copy, Download, Hash } from 'lucide-react'

/**
 * UUID生成器工具组件
 * 生成UUID v4
 */
export default function UuidGeneratorTool() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [format, setFormat] = useState<'standard' | 'uppercase' | 'nohyphens' | 'braces'>('standard')

  /**
   * 生成UUID v4
   */
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * 格式化UUID
   */
  const formatUUID = (uuid: string): string => {
    switch (format) {
      case 'uppercase':
        return uuid.toUpperCase()
      case 'nohyphens':
        return uuid.replace(/-/g, '')
      case 'braces':
        return `{${uuid}}`
      default:
        return uuid
    }
  }

  /**
   * 生成多个UUID
   */
  const generateUUIDs = useCallback(() => {
    const newUuids: string[] = []
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUUID())
    }
    setUuids(newUuids)
  }, [count])

  /**
   * 复制单个UUID
   */
  const copyUUID = async (uuid: string) => {
    try {
      const formattedUuid = formatUUID(uuid)
      await navigator.clipboard.writeText(formattedUuid)
      alert('UUID已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 复制所有UUID
   */
  const copyAllUUIDs = async () => {
    try {
      const formattedUuids = uuids.map(uuid => formatUUID(uuid)).join('\n')
      await navigator.clipboard.writeText(formattedUuids)
      alert('所有UUID已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 下载UUID文件
   */
  const downloadUUIDs = () => {
    const formattedUuids = uuids.map(uuid => formatUUID(uuid)).join('\n')
    const blob = new Blob([formattedUuids], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuids-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 验证UUID格式
   */
  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * 解析UUID信息
   */
  const parseUUID = (uuid: string) => {
    if (!validateUUID(uuid)) return null

    const cleanUuid = uuid.replace(/-/g, '')
    
    return {
      version: parseInt(cleanUuid[12], 16),
      variant: parseInt(cleanUuid[16], 16) >> 2,
      timestamp: cleanUuid.substring(0, 8) + cleanUuid.substring(8, 12) + cleanUuid.substring(12, 16),
      node: cleanUuid.substring(20),
      isValid: true
    }
  }

  /**
   * 快速生成预设
   */
  const quickGenerate = (presetCount: number) => {
    setCount(presetCount)
    const newUuids: string[] = []
    for (let i = 0; i < presetCount; i++) {
      newUuids.push(generateUUID())
    }
    setUuids(newUuids)
  }

  return (
    <ToolLayout
      title="UUID生成器"
      description="生成UUID v4"
      category="编码加密"
      icon="🆔"
    >
      <div className="space-y-6">
        {/* 生成设置 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">生成设置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                生成数量
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                输出格式
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="standard">标准格式 (小写带连字符)</option>
                <option value="uppercase">大写格式</option>
                <option value="nohyphens">无连字符</option>
                <option value="braces">带花括号</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={generateUUIDs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              生成UUID
            </button>
            {uuids.length > 0 && (
              <>
                <button
                  onClick={copyAllUUIDs}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  复制全部
                </button>
                <button
                  onClick={downloadUUIDs}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载文件
                </button>
              </>
            )}
          </div>
        </div>

        {/* 快速生成 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">快速生成</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[1, 5, 10, 25, 50].map(num => (
              <button
                key={num}
                onClick={() => quickGenerate(num)}
                className="p-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                {num} 个
              </button>
            ))}
          </div>
        </div>

        {/* UUID列表 */}
        {uuids.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                生成的UUID ({uuids.length} 个)
              </h3>
              <div className="text-sm text-gray-500">
                格式: {format === 'standard' ? '标准' : format === 'uppercase' ? '大写' : format === 'nohyphens' ? '无连字符' : '带花括号'}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uuids.map((uuid, index) => {
                const formattedUuid = formatUUID(uuid)
                const uuidInfo = parseUUID(uuid)
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-mono text-sm break-all">
                        {formattedUuid}
                      </div>
                      {uuidInfo && (
                        <div className="text-xs text-gray-500 mt-1">
                          版本: {uuidInfo.version} | 变体: {uuidInfo.variant}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => copyUUID(uuid)}
                      className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="复制UUID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* UUID验证器 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            UUID验证器
          </h3>
          
          <UUIDValidator />
        </div>

        {/* UUID信息 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">关于UUID</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>UUID (Universally Unique Identifier)</strong> 是一个128位的标识符，用于在分布式系统中唯一标识信息。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h4 className="font-medium mb-1">UUID v4 特点:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• 基于随机数生成</li>
                  <li>• 碰撞概率极低</li>
                  <li>• 不包含时间信息</li>
                  <li>• 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">常见用途:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• 数据库主键</li>
                  <li>• 文件名标识</li>
                  <li>• 会话ID</li>
                  <li>• API请求追踪</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 支持批量生成UUID，最多1000个</li>
            <li>• 提供多种输出格式选择</li>
            <li>• 可以复制单个或全部UUID</li>
            <li>• 支持下载为文本文件</li>
            <li>• 内置UUID格式验证器</li>
            <li>• 显示UUID版本和变体信息</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}

/**
 * UUID验证器组件
 */
function UUIDValidator() {
  const [inputUuid, setInputUuid] = useState('')
  
  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  const parseUUID = (uuid: string) => {
    if (!validateUUID(uuid)) return null

    const cleanUuid = uuid.replace(/-/g, '')
    
    return {
      version: parseInt(cleanUuid[12], 16),
      variant: parseInt(cleanUuid[16], 16) >> 2,
      timestamp: cleanUuid.substring(0, 8) + cleanUuid.substring(8, 12) + cleanUuid.substring(12, 16),
      node: cleanUuid.substring(20),
      isValid: true
    }
  }

  const isValid = validateUUID(inputUuid)
  const uuidInfo = parseUUID(inputUuid)

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          输入UUID进行验证
        </label>
        <input
          type="text"
          value={inputUuid}
          onChange={(e) => setInputUuid(e.target.value)}
          placeholder="例如: 123e4567-e89b-12d3-a456-426614174000"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      {inputUuid && (
        <div className={`p-3 rounded-lg ${
          isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`font-medium ${isValid ? 'text-green-800' : 'text-red-800'}`}>
            {isValid ? '✅ 有效的UUID' : '❌ 无效的UUID'}
          </div>
          
          {uuidInfo && (
            <div className="mt-2 text-sm text-green-700 space-y-1">
              <div>版本: UUID v{uuidInfo.version}</div>
              <div>变体: {uuidInfo.variant}</div>
              <div>时间戳部分: {uuidInfo.timestamp}</div>
              <div>节点部分: {uuidInfo.node}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
