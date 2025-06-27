'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Upload, Download, FileText, RefreshCw, Copy } from 'lucide-react'

interface FileItem {
  id: string
  file: File
  originalName: string
  newName: string
  extension: string
}

interface RenameRule {
  type: 'prefix' | 'suffix' | 'replace' | 'sequence' | 'case' | 'date' | 'custom'
  value: string
  searchValue?: string
  replaceValue?: string
  startNumber?: number
  caseType?: 'upper' | 'lower' | 'title'
  dateFormat?: string
}

/**
 * 批量文件重命名工具组件
 * 批量重命名文件并生成重命名脚本
 */
export default function BatchRenamePage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [rules, setRules] = useState<RenameRule[]>([])
  const [previewMode, setPreviewMode] = useState(true)

  // 添加规则
  const addRule = useCallback((type: RenameRule['type']) => {
    const newRule: RenameRule = {
      type,
      value: '',
      startNumber: 1,
      caseType: 'lower',
      dateFormat: 'YYYY-MM-DD'
    }
    setRules(prev => [...prev, newRule])
  }, [])

  // 更新规则
  const updateRule = useCallback((index: number, updates: Partial<RenameRule>) => {
    setRules(prev => prev.map((rule, i) => i === index ? { ...rule, ...updates } : rule))
  }, [])

  // 删除规则
  const removeRule = useCallback((index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 应用单个规则
  const applyRule = useCallback((fileName: string, rule: RenameRule, index: number): string => {
    switch (rule.type) {
      case 'prefix':
        return rule.value + fileName

      case 'suffix':
        const lastDot = fileName.lastIndexOf('.')
        if (lastDot === -1) {
          return fileName + rule.value
        }
        return fileName.substring(0, lastDot) + rule.value + fileName.substring(lastDot)

      case 'replace':
        if (rule.searchValue && rule.replaceValue !== undefined) {
          return fileName.replace(new RegExp(rule.searchValue, 'g'), rule.replaceValue)
        }
        return fileName

      case 'sequence':
        const number = (rule.startNumber || 1) + index
        const paddedNumber = number.toString().padStart(3, '0')
        return rule.value ? `${rule.value}_${paddedNumber}` : paddedNumber

      case 'case':
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
        const ext = fileName.substring(fileName.lastIndexOf('.')) || ''
        let transformedName = nameWithoutExt
        
        switch (rule.caseType) {
          case 'upper':
            transformedName = nameWithoutExt.toUpperCase()
            break
          case 'lower':
            transformedName = nameWithoutExt.toLowerCase()
            break
          case 'title':
            transformedName = nameWithoutExt.replace(/\w\S*/g, (txt) => 
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            )
            break
        }
        return transformedName + ext

      case 'date':
        const now = new Date()
        const dateStr = rule.dateFormat
          ?.replace('YYYY', now.getFullYear().toString())
          ?.replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
          ?.replace('DD', now.getDate().toString().padStart(2, '0'))
          ?.replace('HH', now.getHours().toString().padStart(2, '0'))
          ?.replace('mm', now.getMinutes().toString().padStart(2, '0'))
          ?.replace('ss', now.getSeconds().toString().padStart(2, '0'))
        return rule.value ? `${dateStr}_${fileName}` : `${dateStr}.${fileName.split('.').pop()}`

      case 'custom':
        // 支持变量替换
        return rule.value
          .replace('{name}', fileName.substring(0, fileName.lastIndexOf('.')) || fileName)
          .replace('{ext}', fileName.substring(fileName.lastIndexOf('.') + 1) || '')
          .replace('{index}', (index + 1).toString())
          .replace('{index3}', (index + 1).toString().padStart(3, '0'))

      default:
        return fileName
    }
  }, [])

  // 应用所有规则
  const applyAllRules = useCallback((originalName: string, index: number): string => {
    return rules.reduce((name, rule) => applyRule(name, rule, index), originalName)
  }, [rules, applyRule])

  // 更新文件名预览
  const updateFileNames = useCallback(() => {
    setFiles(prev => prev.map((file, index) => ({
      ...file,
      newName: applyAllRules(file.originalName, index)
    })))
  }, [applyAllRules])

  // 处理文件上传
  const handleFileUpload = useCallback((fileList: FileList) => {
    const newFiles: FileItem[] = Array.from(fileList).map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      originalName: file.name,
      newName: file.name,
      extension: file.name.split('.').pop() || ''
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  // 移除文件
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }, [])

  // 清空文件列表
  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  // 生成重命名脚本
  const generateScript = useCallback((scriptType: 'batch' | 'bash' | 'powershell') => {
    let script = ''
    
    switch (scriptType) {
      case 'batch':
        script = '@echo off\n'
        script += 'echo Starting batch rename...\n'
        files.forEach(file => {
          if (file.originalName !== file.newName) {
            script += `ren "${file.originalName}" "${file.newName}"\n`
          }
        })
        script += 'echo Batch rename completed.\npause'
        break

      case 'bash':
        script = '#!/bin/bash\n'
        script += 'echo "Starting batch rename..."\n'
        files.forEach(file => {
          if (file.originalName !== file.newName) {
            script += `mv "${file.originalName}" "${file.newName}"\n`
          }
        })
        script += 'echo "Batch rename completed."'
        break

      case 'powershell':
        script = '# PowerShell Batch Rename Script\n'
        script += 'Write-Host "Starting batch rename..."\n'
        files.forEach(file => {
          if (file.originalName !== file.newName) {
            script += `Rename-Item -Path "${file.originalName}" -NewName "${file.newName}"\n`
          }
        })
        script += 'Write-Host "Batch rename completed."'
        break
    }

    return script
  }, [files])

  // 下载脚本
  const downloadScript = useCallback((scriptType: 'batch' | 'bash' | 'powershell') => {
    const script = generateScript(scriptType)
    const extensions = { batch: '.bat', bash: '.sh', powershell: '.ps1' }
    const mimeTypes = { batch: 'text/plain', bash: 'text/plain', powershell: 'text/plain' }
    
    const blob = new Blob([script], { type: mimeTypes[scriptType] })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rename_script${extensions[scriptType]}`
    a.click()
    URL.revokeObjectURL(url)
  }, [generateScript])

  // 复制脚本到剪贴板
  const copyScript = useCallback(async (scriptType: 'batch' | 'bash' | 'powershell') => {
    const script = generateScript(scriptType)
    try {
      await navigator.clipboard.writeText(script)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [generateScript])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = e.dataTransfer.files
    handleFileUpload(droppedFiles)
  }, [handleFileUpload])

  // 自动更新文件名
  React.useEffect(() => {
    updateFileNames()
  }, [updateFileNames])

  // 统计信息
  const stats = useMemo(() => {
    const totalFiles = files.length
    const changedFiles = files.filter(file => file.originalName !== file.newName).length
    return { totalFiles, changedFiles }
  }, [files])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📝 批量文件重命名
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            批量重命名文件并生成重命名脚本
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：规则设置 */}
          <div className="space-y-6">
            {/* 添加规则 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">重命名规则</h3>
              
              <div className="space-y-2 mb-4">
                {[
                  { type: 'prefix', label: '添加前缀' },
                  { type: 'suffix', label: '添加后缀' },
                  { type: 'replace', label: '查找替换' },
                  { type: 'sequence', label: '序号命名' },
                  { type: 'case', label: '大小写转换' },
                  { type: 'date', label: '添加日期' },
                  { type: 'custom', label: '自定义模式' }
                ].map(rule => (
                  <button
                    key={rule.type}
                    onClick={() => addRule(rule.type as RenameRule['type'])}
                    className="w-full text-left px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    {rule.label}
                  </button>
                ))}
              </div>

              {/* 规则列表 */}
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {rule.type === 'prefix' && '前缀'}
                        {rule.type === 'suffix' && '后缀'}
                        {rule.type === 'replace' && '替换'}
                        {rule.type === 'sequence' && '序号'}
                        {rule.type === 'case' && '大小写'}
                        {rule.type === 'date' && '日期'}
                        {rule.type === 'custom' && '自定义'}
                      </span>
                      <button
                        onClick={() => removeRule(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </div>

                    {/* 规则配置 */}
                    {(rule.type === 'prefix' || rule.type === 'suffix') && (
                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => updateRule(index, { value: e.target.value })}
                        placeholder="输入文本"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                      />
                    )}

                    {rule.type === 'replace' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={rule.searchValue || ''}
                          onChange={(e) => updateRule(index, { searchValue: e.target.value })}
                          placeholder="查找文本"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                        />
                        <input
                          type="text"
                          value={rule.replaceValue || ''}
                          onChange={(e) => updateRule(index, { replaceValue: e.target.value })}
                          placeholder="替换为"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                        />
                      </div>
                    )}

                    {rule.type === 'sequence' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          placeholder="前缀（可选）"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                        />
                        <input
                          type="number"
                          value={rule.startNumber || 1}
                          onChange={(e) => updateRule(index, { startNumber: parseInt(e.target.value) || 1 })}
                          placeholder="起始数字"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                        />
                      </div>
                    )}

                    {rule.type === 'case' && (
                      <select
                        value={rule.caseType || 'lower'}
                        onChange={(e) => updateRule(index, { caseType: e.target.value as any })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                      >
                        <option value="lower">小写</option>
                        <option value="upper">大写</option>
                        <option value="title">标题格式</option>
                      </select>
                    )}

                    {rule.type === 'date' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          placeholder="前缀（可选）"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                        />
                        <select
                          value={rule.dateFormat || 'YYYY-MM-DD'}
                          onChange={(e) => updateRule(index, { dateFormat: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                        >
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          <option value="YYYY_MM_DD">YYYY_MM_DD</option>
                          <option value="YYYYMMDD">YYYYMMDD</option>
                          <option value="YYYY-MM-DD_HH-mm-ss">YYYY-MM-DD_HH-mm-ss</option>
                        </select>
                      </div>
                    )}

                    {rule.type === 'custom' && (
                      <div>
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          placeholder="{name}_{index3}.{ext}"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                        />
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          变量: {'{name}'} {'{ext}'} {'{index}'} {'{index3}'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 统计信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">统计信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">总文件数:</span>
                  <span className="text-gray-900 dark:text-gray-100">{stats.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">将被重命名:</span>
                  <span className="text-blue-600 dark:text-blue-400">{stats.changedFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">规则数量:</span>
                  <span className="text-gray-900 dark:text-gray-100">{rules.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：文件列表和脚本 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文件上传 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <label className="cursor-pointer">
                  <span className="text-lg text-gray-600 dark:text-gray-400 mb-2 block">
                    拖拽文件到此处或点击选择
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    支持多文件选择
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={clearFiles}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    清空文件
                  </button>
                  <button
                    onClick={updateFileNames}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    刷新预览
                  </button>
                </div>
              )}
            </div>

            {/* 文件列表 */}
            {files.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">文件预览</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {files.map(file => (
                      <div key={file.id} className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">原文件名</div>
                          <div className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                            {file.originalName}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">新文件名</div>
                          <div className={`font-mono text-sm break-all ${
                            file.originalName !== file.newName 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {file.newName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 脚本生成 */}
            {files.length > 0 && stats.changedFiles > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">生成重命名脚本</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { type: 'batch', label: 'Windows Batch (.bat)', icon: '🪟' },
                    { type: 'bash', label: 'Linux/Mac Bash (.sh)', icon: '🐧' },
                    { type: 'powershell', label: 'PowerShell (.ps1)', icon: '💙' }
                  ].map(script => (
                    <div key={script.type} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <div className="text-2xl mb-2">{script.icon}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {script.label}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => downloadScript(script.type as any)}
                          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          下载
                        </button>
                        <button
                          onClick={() => copyScript(script.type as any)}
                          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          复制
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">重命名规则</h4>
              <ul className="space-y-1">
                <li>• <strong>前缀/后缀</strong>: 在文件名前后添加文本</li>
                <li>• <strong>查找替换</strong>: 替换文件名中的指定文本</li>
                <li>• <strong>序号命名</strong>: 按序号重新命名文件</li>
                <li>• <strong>大小写转换</strong>: 转换文件名大小写</li>
                <li>• <strong>添加日期</strong>: 在文件名中添加日期</li>
                <li>• <strong>自定义模式</strong>: 使用变量自定义命名</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">注意事项</h4>
              <ul className="space-y-1">
                <li>• 规则按添加顺序依次应用</li>
                <li>• 生成的脚本需要在文件所在目录运行</li>
                <li>• 建议先备份重要文件</li>
                <li>• 检查预览结果确保命名正确</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
