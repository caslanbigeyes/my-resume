'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Grid, List, Filter } from 'lucide-react'

/**
 * 工具数据类型定义
 */
interface Tool {
  id: string
  slug: string
  name: string
  description: string
  category: string
  icon: string
  featured?: boolean
}

/**
 * 工具分类定义
 */
const categories = [
  { id: 'all', name: '全部工具', color: 'bg-gray-100 text-gray-800' },
  { id: 'text', name: '文本处理', color: 'bg-blue-100 text-blue-800' },
  { id: 'color', name: '颜色设计', color: 'bg-purple-100 text-purple-800' },
  { id: 'image', name: '图片多媒体', color: 'bg-green-100 text-green-800' },
  { id: 'datetime', name: '日期时间', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'math', name: '数学单位', color: 'bg-red-100 text-red-800' },
  { id: 'encode', name: '编码加密', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'web', name: 'Web开发', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'random', name: '随机生成', color: 'bg-pink-100 text-pink-800' },
  { id: 'file', name: '文件文档', color: 'bg-orange-100 text-orange-800' },
  { id: 'data', name: '数据可视化', color: 'bg-teal-100 text-teal-800' }
]

/**
 * 100个工具的完整列表
 */
const tools: Tool[] = [
  // 文本处理 (1-10)
  { id: '1', slug: 'word-count', name: '字数统计', description: '实时统计文本字数、字符数、段落数', category: 'text', icon: '📝' },
  { id: '2', slug: 'char-case', name: '大小写转换', description: '转换文本大小写格式', category: 'text', icon: '🔤' },
  { id: '3', slug: 'slugify', name: 'URL Slug生成', description: '生成URL友好的slug字符串', category: 'text', icon: '🔗' },
  { id: '4', slug: 'lorem-ipsum', name: 'Lorem Ipsum', description: '生成占位文本内容', category: 'text', icon: '📄' },
  { id: '5', slug: 'markdown-preview', name: 'Markdown预览', description: 'Markdown转HTML实时预览', category: 'text', icon: '📋' },
  { id: '6', slug: 'json-pretty', name: 'JSON格式化', description: 'JSON美化和压缩工具', category: 'text', icon: '📊' },
  { id: '7', slug: 'yaml-to-json', name: 'YAML转JSON', description: 'YAML和JSON格式互转', category: 'text', icon: '🔄' },
  { id: '8', slug: 'html-to-text', name: 'HTML提取文本', description: '从HTML中提取纯文本', category: 'text', icon: '🏷️' },
  { id: '9', slug: 'regex-tester', name: '正则表达式测试', description: '正则表达式实时匹配测试', category: 'text', icon: '🎯' },
  { id: '10', slug: 'diff-viewer', name: '文本差异对比', description: '比较两段文本的差异', category: 'text', icon: '🔍' },

  // 颜色设计 (11-20)
  { id: '11', slug: 'color-picker', name: '颜色选择器', description: '取色并复制十六进制值', category: 'color', icon: '🎨' },
  { id: '12', slug: 'hex-rgb', name: 'HEX/RGB转换', description: '颜色格式互相转换', category: 'color', icon: '🌈' },
  { id: '13', slug: 'palette-generator', name: '调色板生成', description: '自动生成配色方案', category: 'color', icon: '🎭' },
  { id: '14', slug: 'contrast-checker', name: '对比度检测', description: '检查颜色对比度是否符合标准', category: 'color', icon: '⚖️' },
  { id: '15', slug: 'gradient-maker', name: 'CSS渐变生成', description: '可视化生成CSS渐变代码', category: 'color', icon: '🌅' },
  { id: '16', slug: 'shadow-generator', name: '阴影生成器', description: 'CSS盒阴影可视化调配', category: 'color', icon: '🌑' },
  { id: '17', slug: 'border-radius', name: '圆角预览', description: 'CSS圆角效果可视化', category: 'color', icon: '⭕' },
  { id: '18', slug: 'favicon-generator', name: 'Favicon生成', description: '生成多尺寸网站图标', category: 'color', icon: '🏠' },
  { id: '19', slug: 'css-clamp', name: 'CSS Clamp计算', description: '响应式尺寸计算工具', category: 'color', icon: '📐' },
  { id: '20', slug: 'tailwind-cheatsheet', name: 'Tailwind速查', description: 'Tailwind CSS类名速查表', category: 'color', icon: '💨' },

  // 图片多媒体 (21-30)
  { id: '21', slug: 'image-compress', name: '图片压缩', description: '客户端压缩JPG/PNG/WebP', category: 'image', icon: '🗜️' },
  { id: '22', slug: 'image-resize', name: '图片缩放', description: '调整图片尺寸大小', category: 'image', icon: '📏' },
  { id: '23', slug: 'image-convert', name: '格式转换', description: 'PNG/WebP/JPG格式互转', category: 'image', icon: '🔄' },
  { id: '24', slug: 'image-crop', name: '图片裁剪', description: '裁剪图片并导出', category: 'image', icon: '✂️' },
  { id: '25', slug: 'exif-viewer', name: 'EXIF查看器', description: '查看和移除图片元数据', category: 'image', icon: '📷' },
  { id: '26', slug: 'svg-minify', name: 'SVG压缩', description: '压缩优化SVG文件', category: 'image', icon: '🎨' },
  { id: '27', slug: 'gif-split', name: 'GIF帧拆分', description: '将GIF拆分为单独帧', category: 'image', icon: '🎬' },
  { id: '28', slug: 'video-trim', name: '视频剪辑', description: '浏览器端视频剪辑', category: 'image', icon: '🎥' },
  { id: '29', slug: 'audio-convert', name: '音频转换', description: '音频格式转换工具', category: 'image', icon: '🎵' },
  { id: '30', slug: 'icon-spriter', name: 'SVG雪碧图', description: '生成SVG雪碧图', category: 'image', icon: '🧩' },

  // 日期时间 (31-40)
  { id: '31', slug: 'unix-timestamp', name: '时间戳转换', description: '时间戳与日期互相转换', category: 'datetime', icon: '⏰' },
  { id: '32', slug: 'cron-parser', name: 'Cron解析器', description: '解析Cron表达式', category: 'datetime', icon: '⚙️' },
  { id: '33', slug: 'age-calculator', name: '年龄计算器', description: '精确计算年龄', category: 'datetime', icon: '🎂' },
  { id: '34', slug: 'time-diff', name: '时间差计算', description: '计算两个日期间隔', category: 'datetime', icon: '📅' },
  { id: '35', slug: 'timezone-convert', name: '时区转换', description: '不同时区时间换算', category: 'datetime', icon: '🌍' },
  { id: '36', slug: 'week-number', name: '周数计算', description: '计算ISO周数', category: 'datetime', icon: '📆' },
  { id: '37', slug: 'countdown-timer', name: '倒计时器', description: '倒计时计时器', category: 'datetime', icon: '⏳' },
  { id: '38', slug: 'date-add', name: '日期加减', description: '日期加减计算', category: 'datetime', icon: '➕' },
  { id: '39', slug: 'working-days', name: '工作日计算', description: '计算工作日天数', category: 'datetime', icon: '💼' },
  { id: '40', slug: 'calendar-maker', name: '日历生成', description: '生成月历PNG图片', category: 'datetime', icon: '📋' },

  // 数学单位 (41-50)
  { id: '41', slug: 'unit-convert', name: '单位换算', description: '长度重量等单位换算', category: 'math', icon: '📏' },
  { id: '42', slug: 'percentage-calc', name: '百分比计算', description: '百分比相关计算', category: 'math', icon: '💯' },
  { id: '43', slug: 'triangle-solver', name: '三角形求解', description: '根据边角求三角形', category: 'math', icon: '📐' },
  { id: '44', slug: 'prime-checker', name: '质数检测', description: '判断数字是否为质数', category: 'math', icon: '🔢' },
  { id: '45', slug: 'quadratic-solver', name: '二次方程求解', description: '解一元二次方程', category: 'math', icon: '📊' },
  { id: '46', slug: 'matrix-math', name: '矩阵运算', description: '矩阵加减乘除运算', category: 'math', icon: '🔢' },
  { id: '47', slug: 'currency-convert', name: '汇率换算', description: '货币汇率换算', category: 'math', icon: '💱' },
  { id: '48', slug: 'roman-numeral', name: '罗马数字转换', description: '阿拉伯数字与罗马数字互转', category: 'math', icon: '🏛️' },
  { id: '49', slug: 'base-n', name: '进制转换', description: '各种进制数字转换', category: 'math', icon: '🔄' },
  { id: '50', slug: 'random-number', name: '随机数生成', description: '生成指定范围随机数', category: 'math', icon: '🎲' },

  // 编码加密 (51-60)
  { id: '51', slug: 'base64-encode', name: 'Base64编码', description: 'Base64编码解码', category: 'encode', icon: '🔐' },
  { id: '52', slug: 'url-encode', name: 'URL编码', description: 'URL编码解码', category: 'encode', icon: '🌐' },
  { id: '53', slug: 'jwt-decode', name: 'JWT解码器', description: '解析JWT令牌', category: 'encode', icon: '🎫' },
  { id: '54', slug: 'md5-hash', name: 'MD5哈希', description: '计算MD5摘要', category: 'encode', icon: '🔒' },
  { id: '55', slug: 'sha256-hash', name: 'SHA256哈希', description: '计算SHA256摘要', category: 'encode', icon: '🔐' },
  { id: '56', slug: 'uuid-generator', name: 'UUID生成器', description: '生成UUID v4', category: 'encode', icon: '🆔' },
  { id: '57', slug: 'bcrypt-hash', name: 'Bcrypt哈希', description: 'Bcrypt密码哈希', category: 'encode', icon: '🔑' },
  { id: '58', slug: 'qr-generator', name: '二维码生成', description: '生成二维码图片', category: 'encode', icon: '📱' },
  { id: '59', slug: 'barcode-generator', name: '条形码生成', description: '生成条形码图片', category: 'encode', icon: '📊' },
  { id: '60', slug: 'password-strength', name: '密码强度检测', description: '检测密码安全强度', category: 'encode', icon: '🛡️' },

  // Web开发 (61-70)
  { id: '61', slug: 'json-to-ts', name: 'JSON转TS接口', description: 'JSON转TypeScript接口', category: 'web', icon: '📝' },
  { id: '62', slug: 'http-status', name: 'HTTP状态码', description: 'HTTP状态码查询', category: 'web', icon: '🌐' },
  { id: '63', slug: 'user-agent', name: 'User Agent解析', description: '解析User Agent字符串', category: 'web', icon: '🕵️' },
  { id: '64', slug: 'mime-search', name: 'MIME类型查询', description: '文件MIME类型查询', category: 'web', icon: '📄' },
  { id: '65', slug: 'dns-lookup', name: 'DNS查询', description: 'DNS记录查询工具', category: 'web', icon: '🔍' },
  { id: '66', slug: 'ip-info', name: 'IP信息查询', description: '查询IP地址信息', category: 'web', icon: '🌍' },
  { id: '67', slug: 'jwt-generator', name: 'JWT生成器', description: '生成JWT令牌', category: 'web', icon: '🎫' },
  { id: '68', slug: 'uuid-namespace', name: 'UUID v5生成', description: '基于命名空间生成UUID', category: 'web', icon: '🆔' },
  { id: '69', slug: 'regex-cheatsheet', name: '正则速查表', description: '正则表达式速查手册', category: 'web', icon: '📖' },
  { id: '70', slug: 'json-diff', name: 'JSON对比', description: 'JSON差异对比工具', category: 'web', icon: '🔍' },

  // 随机生成 (71-80)
  { id: '71', slug: 'lorem-image', name: '占位图片', description: '生成占位图片', category: 'random', icon: '🖼️' },
  { id: '72', slug: 'fake-user', name: '虚拟用户', description: '生成虚拟用户资料', category: 'random', icon: '👤' },
  { id: '73', slug: 'random-color', name: '随机颜色', description: '生成随机颜色', category: 'random', icon: '🎨' },
  { id: '74', slug: 'name-generator', name: '名字生成器', description: '随机生成姓名', category: 'random', icon: '👶' },
  { id: '75', slug: 'quote-generator', name: '名言生成器', description: '随机显示名人名言', category: 'random', icon: '💬' },
  { id: '76', slug: 'password-generator', name: '密码生成器', description: '生成安全密码', category: 'random', icon: '🔑' },
  { id: '77', slug: 'uuid-batch', name: 'UUID批量生成', description: '批量生成UUID', category: 'random', icon: '🆔' },
  { id: '78', slug: 'dice-roller', name: '骰子模拟器', description: 'RPG骰子投掷', category: 'random', icon: '🎲' },
  { id: '79', slug: 'lottery-picker', name: '抽奖器', description: '随机抽奖工具', category: 'random', icon: '🎰' },
  { id: '80', slug: 'story-prompt', name: '写作灵感', description: '随机写作提示', category: 'random', icon: '✍️' },

  // 文件文档 (81-90)
  { id: '81', slug: 'csv-to-json', name: 'CSV转JSON', description: 'CSV与JSON互转', category: 'file', icon: '📊' },
  { id: '82', slug: 'json-to-csv', name: 'JSON转CSV', description: 'JSON转CSV格式', category: 'file', icon: '📋' },
  { id: '83', slug: 'markdown-toc', name: 'Markdown目录', description: '生成Markdown目录', category: 'file', icon: '📑' },
  { id: '84', slug: 'text-to-pdf', name: '文本转PDF', description: '将文本转换为PDF', category: 'file', icon: '📄' },
  { id: '85', slug: 'merge-pdf', name: 'PDF合并', description: '合并多个PDF文件', category: 'file', icon: '📚' },
  { id: '86', slug: 'split-pdf', name: 'PDF拆分', description: '拆分PDF文件', category: 'file', icon: '📄' },
  { id: '87', slug: 'excel-to-json', name: 'Excel转JSON', description: 'Excel转JSON格式', category: 'file', icon: '📊' },
  { id: '88', slug: 'zip-extract', name: 'ZIP解压', description: '在线解压ZIP文件', category: 'file', icon: '📦' },
  { id: '89', slug: 'image-to-pdf', name: '图片转PDF', description: '将图片转换为PDF', category: 'file', icon: '🖼️' },
  { id: '90', slug: 'file-hash', name: '文件校验', description: '计算文件哈希值', category: 'file', icon: '🔐' },

  // 数据可视化 (91-100)
  { id: '91', slug: 'csv-preview', name: 'CSV预览器', description: '预览CSV文件内容', category: 'data', icon: '📊' },
  { id: '92', slug: 'json-plot', name: 'JSON图表', description: '将JSON数据可视化', category: 'data', icon: '📈' },
  { id: '93', slug: 'markdown-mermaid', name: 'Mermaid预览', description: 'Mermaid图表预览', category: 'data', icon: '📊' },
  { id: '94', slug: 'geojson-viewer', name: 'GeoJSON地图', description: 'GeoJSON地图可视化', category: 'data', icon: '🗺️' },
  { id: '95', slug: 'base64-image', name: 'Base64图片预览', description: 'Base64图片解码预览', category: 'data', icon: '🖼️' },
  { id: '96', slug: 'html-preview', name: 'HTML预览', description: '实时HTML预览', category: 'data', icon: '🌐' },
  { id: '97', slug: 'table-sorter', name: '表格排序', description: '表格数据排序筛选', category: 'data', icon: '📋' },
  { id: '98', slug: 'url-parser', name: 'URL解析器', description: '解析URL各个组成部分', category: 'data', icon: '🔗' },
  { id: '99', slug: 'email-validator', name: '邮箱验证', description: '验证邮箱格式', category: 'data', icon: '📧' },
  { id: '100', slug: 'credit-card-check', name: '信用卡验证', description: 'Luhn算法验证信用卡', category: 'data', icon: '💳' },

  // 扩展工具 (101+)
  { id: '101', slug: 'webp-converter', name: 'WebP转换器', description: '将WebP转换为JPG/PNG格式', category: 'image', icon: '🔄' },
  { id: '102', slug: 'logo-generator', name: 'Logo生成器', description: '创建个性化的Logo设计', category: 'image', icon: '🎨' }
]

/**
 * 工具集主页组件
 */
export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // 筛选工具
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  // 获取分类信息
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🛠️ 工具集</h1>
            <p className="text-lg text-gray-600 mb-8">100款实用小工具，全部在浏览器端运行</p>
            
            {/* 搜索栏 */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 工具栏 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? category.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 视图切换 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mb-6">
          <p className="text-gray-600">
            找到 <span className="font-semibold text-gray-900">{filteredTools.length}</span> 个工具
            {selectedCategory !== 'all' && (
              <span> · 分类: <span className="font-semibold">{getCategoryInfo(selectedCategory).name}</span></span>
            )}
          </p>
        </div>

        {/* 工具网格/列表 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map(tool => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {tool.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="mt-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryInfo(tool.category).color}`}>
                      {getCategoryInfo(tool.category).name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTools.map(tool => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 group flex items-center gap-4"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tool.description}
                  </p>
                </div>
                <div>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryInfo(tool.category).color}`}>
                    {getCategoryInfo(tool.category).name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 无结果提示 */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到相关工具</h3>
            <p className="text-gray-600 mb-4">尝试调整搜索关键词或选择其他分类</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重置筛选
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
