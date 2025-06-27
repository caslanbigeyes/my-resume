'use client'

import React, { useState, useCallback } from 'react'
import { Upload, Download, Scissors, Merge, FileText, AlertCircle } from 'lucide-react'

interface SplitTask {
  id: string
  file: File
  chunkSize: number
  chunks: Blob[]
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

interface MergeTask {
  id: string
  files: File[]
  result?: Blob
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

/**
 * 文件分割合并工具组件
 * 分割大文件或合并分片文件
 */
export default function FileSplitterPage() {
  const [mode, setMode] = useState<'split' | 'merge'>('split')
  const [splitTasks, setSplitTasks] = useState<SplitTask[]>([])
  const [mergeTasks, setMergeTasks] = useState<MergeTask[]>([])
  const [chunkSize, setChunkSize] = useState(10) // MB
  const [chunkUnit, setChunkUnit] = useState<'MB' | 'KB' | 'GB'>('MB')

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 计算分块大小（字节）
  const getChunkSizeInBytes = useCallback((): number => {
    const multipliers = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 }
    return chunkSize * multipliers[chunkUnit]
  }, [chunkSize, chunkUnit])

  // 分割文件
  const splitFile = useCallback(async (file: File): Promise<Blob[]> => {
    const chunkSizeBytes = getChunkSizeInBytes()
    const chunks: Blob[] = []
    let offset = 0

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSizeBytes)
      chunks.push(chunk)
      offset += chunkSizeBytes
    }

    return chunks
  }, [getChunkSizeInBytes])

  // 处理文件分割
  const handleFileSplit = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      const taskId = Math.random().toString(36).substr(2, 9)
      const newTask: SplitTask = {
        id: taskId,
        file,
        chunkSize: getChunkSizeInBytes(),
        chunks: [],
        status: 'pending'
      }

      setSplitTasks(prev => [newTask, ...prev])

      try {
        // 更新状态为处理中
        setSplitTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: 'processing' } : task
        ))

        const chunks = await splitFile(file)

        // 更新任务结果
        setSplitTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, chunks, status: 'completed' } : task
        ))
      } catch (error) {
        setSplitTasks(prev => prev.map(task => 
          task.id === taskId ? { 
            ...task, 
            status: 'error', 
            error: error instanceof Error ? error.message : '分割失败'
          } : task
        ))
      }
    }
  }, [splitFile, getChunkSizeInBytes])

  // 合并文件
  const mergeFiles = useCallback(async (files: File[]): Promise<Blob> => {
    // 按文件名排序
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name))
    
    const chunks: ArrayBuffer[] = []
    for (const file of sortedFiles) {
      const buffer = await file.arrayBuffer()
      chunks.push(buffer)
    }

    return new Blob(chunks)
  }, [])

  // 处理文件合并
  const handleFileMerge = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    if (fileArray.length < 2) {
      alert('请选择至少2个文件进行合并')
      return
    }

    const taskId = Math.random().toString(36).substr(2, 9)
    const newTask: MergeTask = {
      id: taskId,
      files: fileArray,
      status: 'pending'
    }

    setMergeTasks(prev => [newTask, ...prev])

    try {
      // 更新状态为处理中
      setMergeTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'processing' } : task
      ))

      const result = await mergeFiles(fileArray)

      // 更新任务结果
      setMergeTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, result, status: 'completed' } : task
      ))
    } catch (error) {
      setMergeTasks(prev => prev.map(task => 
        task.id === taskId ? { 
          ...task, 
          status: 'error', 
          error: error instanceof Error ? error.message : '合并失败'
        } : task
      ))
    }
  }, [mergeFiles])

  // 下载分片文件
  const downloadChunk = useCallback((chunk: Blob, fileName: string, index: number) => {
    const url = URL.createObjectURL(chunk)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.part${(index + 1).toString().padStart(3, '0')}`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // 下载所有分片
  const downloadAllChunks = useCallback((task: SplitTask) => {
    const baseName = task.file.name.replace(/\.[^/.]+$/, '')
    task.chunks.forEach((chunk, index) => {
      setTimeout(() => {
        downloadChunk(chunk, baseName, index)
      }, index * 100) // 延迟下载避免浏览器阻止
    })
  }, [downloadChunk])

  // 下载合并文件
  const downloadMergedFile = useCallback((task: MergeTask) => {
    if (!task.result) return

    const url = URL.createObjectURL(task.result)
    const a = document.createElement('a')
    a.href = url
    
    // 尝试从第一个文件名推断原始文件名
    const firstName = task.files[0].name
    const baseName = firstName.replace(/\.part\d+$/, '') || 'merged_file'
    a.download = baseName
    
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (mode === 'split') {
      handleFileSplit(files)
    } else {
      handleFileMerge(files)
    }
  }, [mode, handleFileSplit, handleFileMerge])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ✂️ 文件分割合并
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            分割大文件为小块或合并分片文件
          </p>
        </div>

        {/* 模式切换 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setMode('split')}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                mode === 'split'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Scissors className="w-5 h-5" />
              文件分割
            </button>
            <button
              onClick={() => setMode('merge')}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                mode === 'merge'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Merge className="w-5 h-5" />
              文件合并
            </button>
          </div>
        </div>

        {/* 分割设置 */}
        {mode === 'split' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">分割设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分块大小
                </label>
                <input
                  type="number"
                  min="1"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  单位
                </label>
                <select
                  value={chunkUnit}
                  onChange={(e) => setChunkUnit(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  分块大小: {formatFileSize(getChunkSizeInBytes())}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 文件上传区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="text-lg text-gray-600 dark:text-gray-400 mb-2 block">
                {mode === 'split' ? '拖拽文件到此处进行分割' : '拖拽多个分片文件到此处进行合并'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                {mode === 'split' ? '支持任意格式的文件' : '请选择按顺序命名的分片文件'}
              </span>
              <input
                type="file"
                multiple={mode === 'merge'}
                onChange={(e) => {
                  if (e.target.files) {
                    if (mode === 'split') {
                      handleFileSplit(e.target.files)
                    } else {
                      handleFileMerge(e.target.files)
                    }
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 分割任务列表 */}
        {mode === 'split' && splitTasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">分割任务</h3>
            </div>
            <div className="p-4 space-y-4">
              {splitTasks.map(task => (
                <div key={task.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.file.name}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        文件大小: {formatFileSize(task.file.size)} • 
                        分块大小: {formatFileSize(task.chunkSize)} • 
                        状态: {task.status === 'pending' ? '等待中' : task.status === 'processing' ? '处理中' : task.status === 'completed' ? '已完成' : '错误'}
                      </div>
                    </div>
                    {task.status === 'completed' && (
                      <button
                        onClick={() => downloadAllChunks(task)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        下载全部
                      </button>
                    )}
                  </div>

                  {task.status === 'error' && (
                    <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {task.error}
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        已分割为 {task.chunks.length} 个分片:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {task.chunks.map((chunk, index) => (
                          <button
                            key={index}
                            onClick={() => downloadChunk(chunk, task.file.name.replace(/\.[^/.]+$/, ''), index)}
                            className="text-left p-2 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="font-mono text-sm text-blue-600 dark:text-blue-400">
                              part{(index + 1).toString().padStart(3, '0')}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {formatFileSize(chunk.size)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 合并任务列表 */}
        {mode === 'merge' && mergeTasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">合并任务</h3>
            </div>
            <div className="p-4 space-y-4">
              {mergeTasks.map(task => (
                <div key={task.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        合并 {task.files.length} 个文件
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        总大小: {formatFileSize(task.files.reduce((sum, file) => sum + file.size, 0))} • 
                        状态: {task.status === 'pending' ? '等待中' : task.status === 'processing' ? '处理中' : task.status === 'completed' ? '已完成' : '错误'}
                      </div>
                    </div>
                    {task.status === 'completed' && task.result && (
                      <button
                        onClick={() => downloadMergedFile(task)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        下载文件
                      </button>
                    )}
                  </div>

                  {task.status === 'error' && (
                    <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {task.error}
                    </div>
                  )}

                  <div className="space-y-1">
                    {task.files.map((file, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-900 dark:text-gray-100">{file.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>

                  {task.status === 'completed' && task.result && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-green-800 dark:text-green-200">
                        合并完成，文件大小: {formatFileSize(task.result.size)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">文件分割</h4>
              <ul className="space-y-1">
                <li>• 将大文件分割为指定大小的小块</li>
                <li>• 支持自定义分块大小</li>
                <li>• 分片文件按序号命名</li>
                <li>• 适用于文件传输和存储</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">文件合并</h4>
              <ul className="space-y-1">
                <li>• 将分片文件合并为原始文件</li>
                <li>• 自动按文件名排序</li>
                <li>• 支持批量选择文件</li>
                <li>• 验证文件完整性</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
