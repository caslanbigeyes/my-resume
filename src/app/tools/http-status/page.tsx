'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Search, Globe, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

/**
 * HTTP状态码查询工具组件
 * HTTP状态码查询
 */
export default function HttpStatusTool() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  /**
   * HTTP状态码数据
   */
  const statusCodes = [
    // 1xx 信息响应
    { code: 100, name: 'Continue', category: '1xx', description: '继续。客户端应继续其请求', usage: '用于分块传输编码' },
    { code: 101, name: 'Switching Protocols', category: '1xx', description: '切换协议。服务器根据客户端的请求切换协议', usage: 'WebSocket升级' },
    { code: 102, name: 'Processing', category: '1xx', description: '处理中。服务器已收到并正在处理请求', usage: 'WebDAV扩展' },
    
    // 2xx 成功响应
    { code: 200, name: 'OK', category: '2xx', description: '请求成功。一般用于GET与POST请求', usage: '最常见的成功响应' },
    { code: 201, name: 'Created', category: '2xx', description: '已创建。成功请求并创建了新的资源', usage: 'POST请求创建资源' },
    { code: 202, name: 'Accepted', category: '2xx', description: '已接受。已经接受请求，但未处理完成', usage: '异步处理' },
    { code: 204, name: 'No Content', category: '2xx', description: '无内容。服务器成功处理，但未返回内容', usage: 'DELETE请求成功' },
    { code: 206, name: 'Partial Content', category: '2xx', description: '部分内容。服务器成功处理了部分GET请求', usage: '断点续传' },
    
    // 3xx 重定向
    { code: 300, name: 'Multiple Choices', category: '3xx', description: '多种选择。请求的资源可包括多个位置', usage: '内容协商' },
    { code: 301, name: 'Moved Permanently', category: '3xx', description: '永久移动。请求的资源已被永久的移动到新URI', usage: 'SEO友好的重定向' },
    { code: 302, name: 'Found', category: '3xx', description: '临时移动。与301类似，但资源只是临时被移动', usage: '临时重定向' },
    { code: 304, name: 'Not Modified', category: '3xx', description: '未修改。所请求的资源未修改', usage: '缓存验证' },
    { code: 307, name: 'Temporary Redirect', category: '3xx', description: '临时重定向。与302类似，但要求保持请求方法不变', usage: '保持POST方法的重定向' },
    { code: 308, name: 'Permanent Redirect', category: '3xx', description: '永久重定向。与301类似，但要求保持请求方法不变', usage: '保持POST方法的永久重定向' },
    
    // 4xx 客户端错误
    { code: 400, name: 'Bad Request', category: '4xx', description: '客户端请求的语法错误，服务器无法理解', usage: '请求参数错误' },
    { code: 401, name: 'Unauthorized', category: '4xx', description: '请求要求用户的身份认证', usage: '需要登录' },
    { code: 403, name: 'Forbidden', category: '4xx', description: '服务器理解请求，但是拒绝执行', usage: '权限不足' },
    { code: 404, name: 'Not Found', category: '4xx', description: '服务器无法根据客户端的请求找到资源', usage: '资源不存在' },
    { code: 405, name: 'Method Not Allowed', category: '4xx', description: '客户端请求中的方法被禁止', usage: 'GET/POST方法不支持' },
    { code: 409, name: 'Conflict', category: '4xx', description: '服务器完成客户端的请求时发生冲突', usage: '资源冲突' },
    { code: 410, name: 'Gone', category: '4xx', description: '客户端请求的资源已经不存在', usage: '资源已删除' },
    { code: 422, name: 'Unprocessable Entity', category: '4xx', description: '请求格式正确，但是由于含有语义错误，无法响应', usage: '表单验证失败' },
    { code: 429, name: 'Too Many Requests', category: '4xx', description: '客户端发送的请求过多', usage: '限流' },
    
    // 5xx 服务器错误
    { code: 500, name: 'Internal Server Error', category: '5xx', description: '服务器内部错误，无法完成请求', usage: '服务器代码错误' },
    { code: 501, name: 'Not Implemented', category: '5xx', description: '服务器不支持请求的功能，无法完成请求', usage: '功能未实现' },
    { code: 502, name: 'Bad Gateway', category: '5xx', description: '作为网关或者代理工作的服务器尝试执行请求时，从远程服务器接收到了一个无效的响应', usage: '上游服务器错误' },
    { code: 503, name: 'Service Unavailable', category: '5xx', description: '由于超载或系统维护，服务器暂时的无法处理客户端的请求', usage: '服务器维护' },
    { code: 504, name: 'Gateway Timeout', category: '5xx', description: '充当网关或代理的服务器，未及时从远端服务器获取请求', usage: '上游服务器超时' },
    { code: 505, name: 'HTTP Version Not Supported', category: '5xx', description: '服务器不支持请求的HTTP协议的版本', usage: 'HTTP版本不支持' }
  ]

  /**
   * 过滤状态码
   */
  const filteredStatusCodes = useMemo(() => {
    return statusCodes.filter(status => {
      const matchesSearch = searchTerm === '' || 
        status.code.toString().includes(searchTerm) ||
        status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        status.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || status.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  /**
   * 获取状态码图标
   */
  const getStatusIcon = (category: string) => {
    switch (category) {
      case '1xx': return <Info className="w-5 h-5 text-blue-500" />
      case '2xx': return <CheckCircle className="w-5 h-5 text-green-500" />
      case '3xx': return <Globe className="w-5 h-5 text-yellow-500" />
      case '4xx': return <AlertCircle className="w-5 h-5 text-orange-500" />
      case '5xx': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  /**
   * 获取状态码颜色
   */
  const getStatusColor = (category: string) => {
    switch (category) {
      case '1xx': return 'blue'
      case '2xx': return 'green'
      case '3xx': return 'yellow'
      case '4xx': return 'orange'
      case '5xx': return 'red'
      default: return 'gray'
    }
  }

  /**
   * 分类统计
   */
  const categoryStats = useMemo(() => {
    const stats = statusCodes.reduce((acc, status) => {
      acc[status.category] = (acc[status.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return [
      { key: '1xx', name: '信息响应', count: stats['1xx'] || 0, color: 'blue' },
      { key: '2xx', name: '成功响应', count: stats['2xx'] || 0, color: 'green' },
      { key: '3xx', name: '重定向', count: stats['3xx'] || 0, color: 'yellow' },
      { key: '4xx', name: '客户端错误', count: stats['4xx'] || 0, color: 'orange' },
      { key: '5xx', name: '服务器错误', count: stats['5xx'] || 0, color: 'red' }
    ]
  }, [])

  return (
    <ToolLayout
      title="HTTP状态码查询"
      description="HTTP状态码查询"
      category="Web开发"
      icon="🌐"
    >
      <div className="space-y-6">
        {/* 搜索和筛选 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜索状态码
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="输入状态码、名称或描述..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类筛选
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部分类</option>
                <option value="1xx">1xx 信息响应</option>
                <option value="2xx">2xx 成功响应</option>
                <option value="3xx">3xx 重定向</option>
                <option value="4xx">4xx 客户端错误</option>
                <option value="5xx">5xx 服务器错误</option>
              </select>
            </div>
          </div>
        </div>

        {/* 分类统计 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categoryStats.map(stat => (
            <button
              key={stat.key}
              onClick={() => setSelectedCategory(selectedCategory === stat.key ? 'all' : stat.key)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedCategory === stat.key
                  ? `border-${stat.color}-500 bg-${stat.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`text-2xl font-bold text-${stat.color}-600`}>
                {stat.count}
              </div>
              <div className="text-sm text-gray-600">{stat.name}</div>
            </button>
          ))}
        </div>

        {/* 状态码列表 */}
        <div className="space-y-3">
          {filteredStatusCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              没有找到匹配的状态码
            </div>
          ) : (
            filteredStatusCodes.map(status => {
              const color = getStatusColor(status.category)
              return (
                <div
                  key={status.code}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(status.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-2xl font-bold text-${color}-600`}>
                          {status.code}
                        </span>
                        <span className="text-lg font-medium text-gray-900">
                          {status.name}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${color}-100 text-${color}-800`}>
                          {status.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">
                        {status.description}
                      </p>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">常见用途：</span>
                        {status.usage}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 快速参考 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-3">HTTP状态码快速参考</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">常用成功状态码：</h4>
              <ul className="space-y-1">
                <li>• <strong>200 OK</strong> - 请求成功</li>
                <li>• <strong>201 Created</strong> - 资源创建成功</li>
                <li>• <strong>204 No Content</strong> - 成功但无返回内容</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">常用错误状态码：</h4>
              <ul className="space-y-1">
                <li>• <strong>400 Bad Request</strong> - 请求参数错误</li>
                <li>• <strong>401 Unauthorized</strong> - 需要身份验证</li>
                <li>• <strong>404 Not Found</strong> - 资源不存在</li>
                <li>• <strong>500 Internal Server Error</strong> - 服务器内部错误</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">使用说明</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 输入状态码数字、名称或描述进行搜索</li>
            <li>• 按分类筛选不同类型的状态码</li>
            <li>• 点击分类统计卡片快速筛选</li>
            <li>• 每个状态码都包含详细描述和使用场景</li>
            <li>• 1xx信息、2xx成功、3xx重定向、4xx客户端错误、5xx服务器错误</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
