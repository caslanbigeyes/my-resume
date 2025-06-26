'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy, RefreshCw } from 'lucide-react'

/**
 * Lorem Ipsum生成工具组件
 * 生成占位文本内容
 */
export default function LoremIpsumTool() {
  const [options, setOptions] = useState({
    type: 'paragraphs',
    count: 3,
    startWithLorem: true,
    language: 'latin'
  })

  // 拉丁文单词库
  const latinWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
    'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
    'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo',
    'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'aut',
    'odit', 'fugit', 'sed', 'quia', 'consequuntur', 'magni', 'dolores', 'ratione',
    'sequi', 'nesciunt', 'neque', 'porro', 'quisquam', 'dolorem', 'adipisci',
    'numquam', 'eius', 'modi', 'tempora', 'incidunt', 'magnam', 'quaerat'
  ]

  // 中文词汇库
  const chineseWords = [
    '这是', '一个', '测试', '文本', '内容', '用于', '展示', '页面', '布局', '效果',
    '我们', '可以', '使用', '这些', '文字', '来', '填充', '空白', '区域', '直到',
    '真正', '内容', '准备', '完成', '为止', '这样', '能够', '帮助', '设计师',
    '开发者', '更好', '预览', '最终', '效果', '同时', '避免', '因为', '缺少',
    '内容', '而', '影响', '整体', '视觉', '呈现', '质量', '标准', '规范',
    '流程', '方案', '系统', '平台', '服务', '产品', '功能', '特性', '优势',
    '价值', '体验', '界面', '交互', '操作', '简单', '便捷', '高效', '稳定',
    '安全', '可靠', '专业', '创新', '领先', '优质', '完善', '全面', '丰富'
  ]

  /**
   * 生成随机单词
   */
  const getRandomWord = (wordList: string[]) => {
    return wordList[Math.floor(Math.random() * wordList.length)]
  }

  /**
   * 生成句子
   */
  const generateSentence = (wordList: string[], minWords = 8, maxWords = 20) => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
    const words = []
    
    for (let i = 0; i < wordCount; i++) {
      words.push(getRandomWord(wordList))
    }
    
    // 首字母大写
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    
    return words.join(' ') + '.'
  }

  /**
   * 生成段落
   */
  const generateParagraph = (wordList: string[], minSentences = 3, maxSentences = 8) => {
    const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences
    const sentences = []
    
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(wordList))
    }
    
    return sentences.join(' ')
  }

  /**
   * 生成文本内容
   */
  const generatedText = useMemo(() => {
    const wordList = options.language === 'latin' ? latinWords : chineseWords
    const results = []

    switch (options.type) {
      case 'words':
        const words = []
        if (options.startWithLorem && options.language === 'latin') {
          words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet')
          for (let i = 5; i < options.count; i++) {
            words.push(getRandomWord(wordList))
          }
        } else {
          for (let i = 0; i < options.count; i++) {
            words.push(getRandomWord(wordList))
          }
        }
        return words.join(' ')

      case 'sentences':
        for (let i = 0; i < options.count; i++) {
          if (i === 0 && options.startWithLorem && options.language === 'latin') {
            results.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
          } else {
            results.push(generateSentence(wordList))
          }
        }
        return results.join(' ')

      case 'paragraphs':
        for (let i = 0; i < options.count; i++) {
          if (i === 0 && options.startWithLorem && options.language === 'latin') {
            results.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.')
          } else {
            results.push(generateParagraph(wordList))
          }
        }
        return results.join('\n\n')

      default:
        return ''
    }
  }, [options])

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText)
      alert('已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 重新生成
   */
  const regenerate = () => {
    // 通过改变key来强制重新渲染
    setOptions(prev => ({ ...prev }))
  }

  return (
    <ToolLayout
      title="Lorem Ipsum"
      description="生成占位文本内容"
      category="文本处理"
      icon="📄"
    >
      <div className="space-y-6">
        {/* 配置选项 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">生成选项</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 类型选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生成类型
              </label>
              <select
                value={options.type}
                onChange={(e) => setOptions(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="words">单词</option>
                <option value="sentences">句子</option>
                <option value="paragraphs">段落</option>
              </select>
            </div>

            {/* 数量 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数量
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={options.count}
                onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 语言选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语言
              </label>
              <select
                value={options.language}
                onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="latin">拉丁文</option>
                <option value="chinese">中文</option>
              </select>
            </div>

            {/* Lorem开头选项 */}
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.startWithLorem}
                  onChange={(e) => setOptions(prev => ({ ...prev, startWithLorem: e.target.checked }))}
                  disabled={options.language !== 'latin'}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm">以"Lorem ipsum"开头</span>
              </label>
            </div>
          </div>
        </div>

        {/* 生成结果 */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-900">生成的文本</h3>
              <p className="text-sm text-gray-500">
                {options.count} 个{options.type === 'words' ? '单词' : options.type === 'sentences' ? '句子' : '段落'}
                · {generatedText.length} 字符
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={regenerate}
                className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                title="重新生成"
              >
                <RefreshCw className="w-4 h-4" />
                重新生成
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
                复制
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="bg-gray-50 p-4 rounded border min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed">
              {generatedText || '生成的文本将显示在这里...'}
            </div>
          </div>
        </div>

        {/* 快速预设 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-3">快速预设</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setOptions({ type: 'words', count: 50, startWithLorem: true, language: 'latin' })}
              className="p-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              50个单词
            </button>
            <button
              onClick={() => setOptions({ type: 'sentences', count: 5, startWithLorem: true, language: 'latin' })}
              className="p-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              5个句子
            </button>
            <button
              onClick={() => setOptions({ type: 'paragraphs', count: 3, startWithLorem: true, language: 'latin' })}
              className="p-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              3个段落
            </button>
            <button
              onClick={() => setOptions({ type: 'paragraphs', count: 2, startWithLorem: false, language: 'chinese' })}
              className="p-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              中文段落
            </button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 支持生成单词、句子或段落形式的占位文本</li>
            <li>• 提供拉丁文和中文两种语言选项</li>
            <li>• 可选择是否以经典的"Lorem ipsum"开头</li>
            <li>• 适用于网页设计、印刷排版等需要占位文本的场景</li>
            <li>• 生成的文本长度和结构可自定义</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
