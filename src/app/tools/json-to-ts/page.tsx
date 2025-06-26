'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy, Code, FileText, Settings } from 'lucide-react'

/**
 * JSON转TypeScript接口工具组件
 * JSON转TypeScript接口
 */
export default function JsonToTsTool() {
  const [jsonInput, setJsonInput] = useState('')
  const [interfaceName, setInterfaceName] = useState('MyInterface')
  const [options, setOptions] = useState({
    optional: false,
    readonly: false,
    export: true,
    camelCase: true,
    arrayType: 'bracket' as 'bracket' | 'generic'
  })

  /**
   * 转换JSON为TypeScript接口
   */
  const generateInterface = useMemo(() => {
    if (!jsonInput.trim()) return ''

    try {
      const jsonObj = JSON.parse(jsonInput)
      return jsonToInterface(jsonObj, interfaceName, options, 0)
    } catch (error) {
      return `// JSON格式错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }, [jsonInput, interfaceName, options])

  /**
   * 递归生成TypeScript接口
   */
  const jsonToInterface = (obj: any, name: string, opts: typeof options, depth: number): string => {
    const indent = '  '.repeat(depth)
    const exportKeyword = opts.export && depth === 0 ? 'export ' : ''
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return `${exportKeyword}type ${name} = any[]`
      }
      const itemType = getTypeFromValue(obj[0], `${name}Item`, opts, depth + 1)
      return opts.arrayType === 'bracket' 
        ? `${exportKeyword}type ${name} = ${itemType}[]`
        : `${exportKeyword}type ${name} = Array<${itemType}>`
    }

    if (typeof obj !== 'object' || obj === null) {
      return `${exportKeyword}type ${name} = ${getTypeFromValue(obj, name, opts, depth)}`
    }

    let result = `${exportKeyword}interface ${name} {\n`
    const entries = Object.entries(obj)
    
    entries.forEach(([key, value], index) => {
      const propertyName = opts.camelCase ? toCamelCase(key) : key
      const optional = opts.optional ? '?' : ''
      const readonly = opts.readonly ? 'readonly ' : ''
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 嵌套对象，生成子接口
        const subInterfaceName = capitalize(propertyName)
        const subInterface = jsonToInterface(value, subInterfaceName, { ...opts, export: false }, depth + 1)
        result = subInterface + '\n\n' + result
        result += `${indent}  ${readonly}${propertyName}${optional}: ${subInterfaceName}\n`
      } else {
        const type = getTypeFromValue(value, propertyName, opts, depth + 1)
        result += `${indent}  ${readonly}${propertyName}${optional}: ${type}\n`
      }
    })
    
    result += `${indent}}`
    return result
  }

  /**
   * 获取值的TypeScript类型
   */
  const getTypeFromValue = (value: any, name: string, opts: typeof options, depth: number): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    
    const type = typeof value
    
    switch (type) {
      case 'string':
        return 'string'
      case 'number':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'object':
        if (Array.isArray(value)) {
          if (value.length === 0) return 'any[]'
          const itemType = getTypeFromValue(value[0], `${name}Item`, opts, depth)
          return opts.arrayType === 'bracket' ? `${itemType}[]` : `Array<${itemType}>`
        }
        return 'object'
      default:
        return 'any'
    }
  }

  /**
   * 转换为驼峰命名
   */
  const toCamelCase = (str: string): string => {
    return str.replace(/[_-](.)/g, (_, char) => char.toUpperCase())
  }

  /**
   * 首字母大写
   */
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * 复制结果
   */
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(generateInterface)
      alert('TypeScript接口已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 示例JSON
   */
  const loadExample = (example: string) => {
    const examples = {
      simple: `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "active": true
}`,
      nested: `{
  "user": {
    "id": 1,
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "age": 30
    },
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  },
  "posts": [
    {
      "id": 1,
      "title": "Hello World",
      "content": "This is my first post",
      "tags": ["javascript", "typescript"]
    }
  ]
}`,
      array: `[
  {
    "id": 1,
    "name": "Product 1",
    "price": 99.99,
    "inStock": true
  },
  {
    "id": 2,
    "name": "Product 2", 
    "price": 149.99,
    "inStock": false
  }
]`
    }
    
    setJsonInput(examples[example as keyof typeof examples])
  }

  return (
    <ToolLayout
      title="JSON转TS接口"
      description="JSON转TypeScript接口"
      category="Web开发"
      icon="📝"
    >
      <div className="space-y-6">
        {/* 配置选项 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            生成选项
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                接口名称
              </label>
              <input
                type="text"
                value={interfaceName}
                onChange={(e) => setInterfaceName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数组类型格式
              </label>
              <select
                value={options.arrayType}
                onChange={(e) => setOptions(prev => ({ ...prev, arrayType: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bracket">Type[] (方括号)</option>
                <option value="generic">Array&lt;Type&gt; (泛型)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.optional}
                onChange={(e) => setOptions(prev => ({ ...prev, optional: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">可选属性</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.readonly}
                onChange={(e) => setOptions(prev => ({ ...prev, readonly: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">只读属性</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.export}
                onChange={(e) => setOptions(prev => ({ ...prev, export: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">导出接口</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.camelCase}
                onChange={(e) => setOptions(prev => ({ ...prev, camelCase: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">驼峰命名</span>
            </label>
          </div>
        </div>

        {/* JSON输入 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              JSON输入
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => loadExample('simple')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                简单示例
              </button>
              <button
                onClick={() => loadExample('nested')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                嵌套示例
              </button>
              <button
                onClick={() => loadExample('array')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                数组示例
              </button>
            </div>
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="粘贴或输入JSON数据..."
            className="w-full h-64 p-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* TypeScript输出 */}
        {generateInterface && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Code className="w-5 h-5" />
                TypeScript接口
              </h3>
              <button
                onClick={copyResult}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
                复制代码
              </button>
            </div>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
              <pre className="text-sm">
                <code>{generateInterface}</code>
              </pre>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 粘贴JSON数据，自动生成对应的TypeScript接口</li>
            <li>• 支持嵌套对象和数组类型的转换</li>
            <li>• 可配置属性为可选、只读等修饰符</li>
            <li>• 支持驼峰命名转换和导出设置</li>
            <li>• 自动处理复杂的嵌套结构</li>
            <li>• 提供多种示例模板快速开始</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
