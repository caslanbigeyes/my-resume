'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Download, Upload, Save, Trash2, FileText, Database, Settings, Calendar } from 'lucide-react'

interface BackupData {
  id: string
  name: string
  data: any
  type: 'json' | 'csv' | 'text' | 'custom'
  size: number
  timestamp: number
  description?: string
}

interface BackupOptions {
  includeTimestamp: boolean
  compressData: boolean
  encryptData: boolean
  format: 'json' | 'csv' | 'xml' | 'txt'
  autoBackup: boolean
  backupInterval: number
}

/**
 * 数据备份工具组件
 * 备份和恢复各种类型的数据
 */
export default function DataBackupPage() {
  const [backups, setBackups] = useState<BackupData[]>([])
  const [inputData, setInputData] = useState('')
  const [backupName, setBackupName] = useState('')
  const [backupDescription, setBackupDescription] = useState('')
  const [options, setOptions] = useState<BackupOptions>({
    includeTimestamp: true,
    compressData: false,
    encryptData: false,
    format: 'json',
    autoBackup: false,
    backupInterval: 60
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 生成备份ID
  const generateBackupId = useCallback((): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }, [])

  // 检测数据类型
  const detectDataType = useCallback((data: string): 'json' | 'csv' | 'text' | 'custom' => {
    try {
      JSON.parse(data)
      return 'json'
    } catch {
      if (data.includes(',') && data.includes('\n')) {
        return 'csv'
      }
      return 'text'
    }
  }, [])

  // 压缩数据（简单的字符串压缩）
  const compressData = useCallback((data: string): string => {
    // 简单的RLE压缩示例
    return data.replace(/(.)\1+/g, (match, char) => {
      return match.length > 3 ? `${char}${match.length}` : match
    })
  }, [])

  // 解压数据
  const decompressData = useCallback((data: string): string => {
    // 简单的RLE解压
    return data.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1))
      return char.repeat(count)
    })
  }, [])

  // 简单加密（仅演示用）
  const encryptData = useCallback((data: string): string => {
    return btoa(data)
  }, [])

  // 简单解密
  const decryptData = useCallback((data: string): string => {
    try {
      return atob(data)
    } catch {
      return data
    }
  }, [])

  // 创建备份
  const createBackup = useCallback(() => {
    if (!inputData.trim() || !backupName.trim()) {
      alert('请输入数据和备份名称')
      return
    }

    let processedData = inputData
    
    // 应用压缩
    if (options.compressData) {
      processedData = compressData(processedData)
    }
    
    // 应用加密
    if (options.encryptData) {
      processedData = encryptData(processedData)
    }

    const backup: BackupData = {
      id: generateBackupId(),
      name: backupName,
      data: processedData,
      type: detectDataType(inputData),
      size: new Blob([processedData]).size,
      timestamp: Date.now(),
      description: backupDescription
    }

    setBackups(prev => [backup, ...prev])
    
    // 清空输入
    setInputData('')
    setBackupName('')
    setBackupDescription('')
  }, [inputData, backupName, backupDescription, options, compressData, encryptData, generateBackupId, detectDataType])

  // 恢复备份
  const restoreBackup = useCallback((backup: BackupData) => {
    let restoredData = backup.data
    
    // 解密
    if (options.encryptData) {
      restoredData = decryptData(restoredData)
    }
    
    // 解压
    if (options.compressData) {
      restoredData = decompressData(restoredData)
    }
    
    setInputData(restoredData)
  }, [options, decryptData, decompressData])

  // 下载备份
  const downloadBackup = useCallback((backup: BackupData) => {
    let content = backup.data
    let filename = backup.name
    let mimeType = 'text/plain'

    // 根据格式处理数据
    switch (options.format) {
      case 'json':
        try {
          const parsed = JSON.parse(backup.data)
          content = JSON.stringify(parsed, null, 2)
          filename += '.json'
          mimeType = 'application/json'
        } catch {
          content = backup.data
          filename += '.txt'
        }
        break
      case 'csv':
        filename += '.csv'
        mimeType = 'text/csv'
        break
      case 'xml':
        filename += '.xml'
        mimeType = 'application/xml'
        break
      default:
        filename += '.txt'
    }

    // 添加时间戳
    if (options.includeTimestamp) {
      const timestamp = new Date(backup.timestamp).toISOString().replace(/[:.]/g, '-')
      filename = filename.replace(/(\.[^.]+)$/, `_${timestamp}$1`)
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [options])

  // 删除备份
  const deleteBackup = useCallback((id: string) => {
    if (confirm('确定要删除这个备份吗？')) {
      setBackups(prev => prev.filter(backup => backup.id !== id))
    }
  }, [])

  // 导入备份文件
  const importBackup = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        const backup: BackupData = {
          id: generateBackupId(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          data: content,
          type: detectDataType(content),
          size: file.size,
          timestamp: Date.now(),
          description: `从文件 ${file.name} 导入`
        }
        setBackups(prev => [backup, ...prev])
      }
    }
    reader.readAsText(file)
  }, [generateBackupId, detectDataType])

  // 导出所有备份
  const exportAllBackups = useCallback(() => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      backups: backups.map(backup => ({
        ...backup,
        exportedAt: new Date().toISOString()
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all_backups_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [backups])

  // 清空所有备份
  const clearAllBackups = useCallback(() => {
    if (confirm('确定要清空所有备份吗？此操作不可恢复！')) {
      setBackups([])
    }
  }, [])

  // 获取数据类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'json': return <Database className="w-4 h-4 text-blue-500" />
      case 'csv': return <FileText className="w-4 h-4 text-green-500" />
      case 'text': return <FileText className="w-4 h-4 text-gray-500" />
      default: return <FileText className="w-4 h-4 text-purple-500" />
    }
  }

  // 统计信息
  const stats = {
    totalBackups: backups.length,
    totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
    latestBackup: backups.length > 0 ? Math.max(...backups.map(b => b.timestamp)) : 0
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            💾 数据备份工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            备份和恢复各种类型的数据，保护重要信息
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：设置和统计 */}
          <div className="space-y-6">
            {/* 统计信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">统计信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">备份数量:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{stats.totalBackups}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">总大小:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{formatFileSize(stats.totalSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">最新备份:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {stats.latestBackup ? new Date(stats.latestBackup).toLocaleDateString() : '无'}
                  </span>
                </div>
              </div>
            </div>

            {/* 备份选项 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                备份选项
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    导出格式
                  </label>
                  <select
                    value={options.format}
                    onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                    <option value="txt">文本</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeTimestamp}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeTimestamp: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">包含时间戳</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.compressData}
                      onChange={(e) => setOptions(prev => ({ ...prev, compressData: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">压缩数据</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.encryptData}
                      onChange={(e) => setOptions(prev => ({ ...prev, encryptData: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">加密数据</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 批量操作 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">批量操作</h3>
              <div className="space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  导入备份
                </button>
                <button
                  onClick={exportAllBackups}
                  disabled={backups.length === 0}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出全部
                </button>
                <button
                  onClick={clearAllBackups}
                  disabled={backups.length === 0}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  清空全部
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：数据输入和备份列表 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 数据输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">创建备份</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      备份名称
                    </label>
                    <input
                      type="text"
                      value={backupName}
                      onChange={(e) => setBackupName(e.target.value)}
                      placeholder="输入备份名称"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      描述（可选）
                    </label>
                    <input
                      type="text"
                      value={backupDescription}
                      onChange={(e) => setBackupDescription(e.target.value)}
                      placeholder="备份描述"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    数据内容
                  </label>
                  <textarea
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder="输入要备份的数据（支持 JSON、CSV、文本等格式）"
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={createBackup}
                  disabled={!inputData.trim() || !backupName.trim()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  创建备份
                </button>
              </div>
            </div>

            {/* 备份列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">备份列表</h3>
              </div>
              
              <div className="p-4">
                {backups.length > 0 ? (
                  <div className="space-y-4">
                    {backups.map(backup => (
                      <div key={backup.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(backup.type)}
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {backup.name}
                              </h4>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(backup.timestamp).toLocaleString()} • 
                                {formatFileSize(backup.size)} • 
                                {backup.type.toUpperCase()}
                              </div>
                              {backup.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {backup.description}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => restoreBackup(backup)}
                              className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              恢复
                            </button>
                            <button
                              onClick={() => downloadBackup(backup)}
                              className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              下载
                            </button>
                            <button
                              onClick={() => deleteBackup(backup.id)}
                              className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono max-h-20 overflow-y-auto">
                          {typeof backup.data === 'string' 
                            ? backup.data.substring(0, 200) + (backup.data.length > 200 ? '...' : '')
                            : JSON.stringify(backup.data).substring(0, 200) + '...'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <div>暂无备份数据</div>
                    <div className="text-sm">创建第一个备份开始使用</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv,.txt,.xml"
          onChange={importBackup}
          className="hidden"
        />

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">功能特点</h4>
              <ul className="space-y-1">
                <li>• 支持多种数据格式备份</li>
                <li>• 可选数据压缩和加密</li>
                <li>• 批量导入导出功能</li>
                <li>• 备份历史记录管理</li>
                <li>• 一键恢复数据</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">使用建议</h4>
              <ul className="space-y-1">
                <li>• 定期创建重要数据备份</li>
                <li>• 使用描述性的备份名称</li>
                <li>• 敏感数据建议启用加密</li>
                <li>• 定期导出备份到本地</li>
                <li>• 测试备份恢复功能</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>提示:</strong> 此工具的加密功能仅用于基本保护。对于高度敏感的数据，请使用专业的加密工具和安全存储方案。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
