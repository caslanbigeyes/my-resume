'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, Music, Play, Pause, Volume2, Download, Copy } from 'lucide-react'

interface AudioInfo {
  file: File
  duration: number
  bitrate?: number
  sampleRate?: number
  channels?: number
  format: string
  size: number
  title?: string
  artist?: string
  album?: string
  year?: string
  genre?: string
  waveformData?: number[]
}

/**
 * 音频文件信息工具组件
 * 分析音频文件的元数据和技术信息
 */
export default function AudioInfoPage() {
  const [audioFiles, setAudioFiles] = useState<AudioInfo[]>([])
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 格式化时长
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // 格式化比特率
  const formatBitrate = (bitrate?: number): string => {
    if (!bitrate) return '未知'
    return `${Math.round(bitrate / 1000)} kbps`
  }

  // 格式化采样率
  const formatSampleRate = (sampleRate?: number): string => {
    if (!sampleRate) return '未知'
    return `${(sampleRate / 1000).toFixed(1)} kHz`
  }

  // 获取音频格式
  const getAudioFormat = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'mp3': return 'MP3'
      case 'wav': return 'WAV'
      case 'flac': return 'FLAC'
      case 'aac': return 'AAC'
      case 'm4a': return 'M4A'
      case 'ogg': return 'OGG'
      case 'wma': return 'WMA'
      default: return extension?.toUpperCase() || '未知'
    }
  }

  // 生成简单波形数据
  const generateWaveform = useCallback(async (audioBuffer: AudioBuffer): Promise<number[]> => {
    const channelData = audioBuffer.getChannelData(0)
    const samples = 100 // 生成100个采样点
    const blockSize = Math.floor(channelData.length / samples)
    const waveform: number[] = []

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize
      const end = start + blockSize
      let sum = 0
      
      for (let j = start; j < end && j < channelData.length; j++) {
        sum += Math.abs(channelData[j])
      }
      
      waveform.push(sum / blockSize)
    }

    // 归一化到0-1范围
    const max = Math.max(...waveform)
    return waveform.map(value => value / max)
  }, [])

  // 分析音频文件
  const analyzeAudioFile = useCallback(async (file: File): Promise<AudioInfo> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      
      audio.onloadedmetadata = async () => {
        try {
          const audioInfo: AudioInfo = {
            file,
            duration: audio.duration,
            format: getAudioFormat(file),
            size: file.size
          }

          // 尝试获取更详细的音频信息
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const arrayBuffer = await file.arrayBuffer()
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
            
            audioInfo.sampleRate = audioBuffer.sampleRate
            audioInfo.channels = audioBuffer.numberOfChannels
            audioInfo.bitrate = (file.size * 8) / audio.duration // 估算比特率
            audioInfo.waveformData = await generateWaveform(audioBuffer)
            
            audioContext.close()
          } catch (e) {
            console.warn('无法获取详细音频信息:', e)
          }

          URL.revokeObjectURL(url)
          resolve(audioInfo)
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(error)
        }
      }

      audio.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('无法加载音频文件'))
      }

      audio.src = url
    })
  }, [generateWaveform])

  // 处理文件上传
  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsLoading(true)
    const audioFileTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/x-m4a']
    
    try {
      const validFiles = Array.from(files).filter(file => 
        audioFileTypes.some(type => file.type.startsWith('audio/')) || 
        /\.(mp3|wav|flac|aac|m4a|ogg|wma)$/i.test(file.name)
      )

      if (validFiles.length === 0) {
        alert('请选择有效的音频文件')
        return
      }

      const audioInfoPromises = validFiles.map(file => analyzeAudioFile(file))
      const audioInfos = await Promise.all(audioInfoPromises)
      
      setAudioFiles(prev => [...audioInfos, ...prev])
    } catch (error) {
      console.error('分析音频文件失败:', error)
      alert('分析音频文件失败')
    } finally {
      setIsLoading(false)
    }
  }, [analyzeAudioFile])

  // 播放/暂停音频
  const togglePlayback = useCallback((file: File) => {
    const fileName = file.name
    
    if (currentPlaying === fileName) {
      if (audioRef.current) {
        audioRef.current.pause()
        setCurrentPlaying(null)
      }
    } else {
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file)
        audioRef.current.play()
        setCurrentPlaying(fileName)
      }
    }
  }, [currentPlaying])

  // 音频播放结束
  const handleAudioEnded = useCallback(() => {
    setCurrentPlaying(null)
  }, [])

  // 移除文件
  const removeFile = useCallback((index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 清空列表
  const clearFiles = useCallback(() => {
    setAudioFiles([])
    setCurrentPlaying(null)
  }, [])

  // 生成报告
  const generateReport = useCallback(() => {
    const report = [
      '# 音频文件分析报告',
      '',
      `分析时间: ${new Date().toLocaleString()}`,
      `文件数量: ${audioFiles.length}`,
      '',
      '## 文件详情',
      ''
    ]

    audioFiles.forEach((audio, index) => {
      report.push(`### ${index + 1}. ${audio.file.name}`)
      report.push(`- 格式: ${audio.format}`)
      report.push(`- 时长: ${formatDuration(audio.duration)}`)
      report.push(`- 文件大小: ${formatFileSize(audio.size)}`)
      report.push(`- 比特率: ${formatBitrate(audio.bitrate)}`)
      report.push(`- 采样率: ${formatSampleRate(audio.sampleRate)}`)
      report.push(`- 声道数: ${audio.channels || '未知'}`)
      if (audio.title) report.push(`- 标题: ${audio.title}`)
      if (audio.artist) report.push(`- 艺术家: ${audio.artist}`)
      if (audio.album) report.push(`- 专辑: ${audio.album}`)
      report.push('')
    })

    return report.join('\n')
  }, [audioFiles])

  // 复制报告
  const copyReport = useCallback(async () => {
    const report = generateReport()
    try {
      await navigator.clipboard.writeText(report)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [generateReport])

  // 下载报告
  const downloadReport = useCallback(() => {
    const report = generateReport()
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audio-analysis-report.md'
    a.click()
    URL.revokeObjectURL(url)
  }, [generateReport])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }, [handleFileUpload])

  // 渲染波形
  const renderWaveform = useCallback((waveformData: number[]) => {
    return (
      <div className="flex items-end gap-1 h-16 bg-gray-100 dark:bg-gray-700 rounded p-2">
        {waveformData.map((value, index) => (
          <div
            key={index}
            className="bg-blue-500 dark:bg-blue-400 rounded-sm flex-1 min-w-0"
            style={{ height: `${Math.max(value * 100, 2)}%` }}
          />
        ))}
      </div>
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎵 音频文件信息
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            分析音频文件的元数据和技术信息
          </p>
        </div>

        {/* 文件上传区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Music className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="text-lg text-gray-600 dark:text-gray-400 mb-2 block">
                拖拽音频文件到此处或点击上传
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                支持 MP3、WAV、FLAC、AAC、M4A、OGG 等格式
              </span>
              <input
                type="file"
                multiple
                accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg,.wma"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {isLoading && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">正在分析音频文件...</p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {audioFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                已分析 {audioFiles.length} 个音频文件
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyReport}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  复制报告
                </button>
                <button
                  onClick={downloadReport}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载报告
                </button>
                <button
                  onClick={clearFiles}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  清空列表
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 音频文件列表 */}
        {audioFiles.length > 0 && (
          <div className="space-y-6">
            {audioFiles.map((audio, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* 文件头部 */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Music className="w-6 h-6 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {audio.file.name}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {audio.format} • {formatDuration(audio.duration)} • {formatFileSize(audio.size)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePlayback(audio.file)}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {currentPlaying === audio.file.name ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                {/* 音频信息 */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 技术信息 */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">技术信息</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">格式:</span>
                          <span className="text-gray-900 dark:text-gray-100">{audio.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">时长:</span>
                          <span className="text-gray-900 dark:text-gray-100">{formatDuration(audio.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">文件大小:</span>
                          <span className="text-gray-900 dark:text-gray-100">{formatFileSize(audio.size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">比特率:</span>
                          <span className="text-gray-900 dark:text-gray-100">{formatBitrate(audio.bitrate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">采样率:</span>
                          <span className="text-gray-900 dark:text-gray-100">{formatSampleRate(audio.sampleRate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">声道数:</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {audio.channels ? `${audio.channels} (${audio.channels === 1 ? '单声道' : audio.channels === 2 ? '立体声' : '多声道'})` : '未知'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 波形显示 */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        波形预览
                      </h4>
                      {audio.waveformData ? (
                        renderWaveform(audio.waveformData)
                      ) : (
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                          无法生成波形数据
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {audioFiles.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            上传音频文件开始分析
          </div>
        )}

        {/* 隐藏的音频播放器 */}
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          className="hidden"
        />

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">支持格式</h4>
              <ul className="space-y-1">
                <li>• <strong>MP3</strong>: 最常用的有损压缩格式</li>
                <li>• <strong>WAV</strong>: 无损音频格式</li>
                <li>• <strong>FLAC</strong>: 无损压缩格式</li>
                <li>• <strong>AAC/M4A</strong>: 高效音频编码</li>
                <li>• <strong>OGG</strong>: 开源音频格式</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">分析内容</h4>
              <ul className="space-y-1">
                <li>• 音频格式和编码信息</li>
                <li>• 时长、文件大小、比特率</li>
                <li>• 采样率和声道配置</li>
                <li>• 简单的波形可视化</li>
                <li>• 音频播放预览</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
