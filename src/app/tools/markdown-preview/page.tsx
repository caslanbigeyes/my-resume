'use client'

import React, { useState, useMemo } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Copy, Eye, Code, Download } from 'lucide-react'

/**
 * Markdown预览工具组件
 * Markdown转HTML实时预览
 */
export default function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState(`# Markdown 预览工具

这是一个 **Markdown** 预览工具，支持实时预览。

## 功能特性

- 实时预览
- 语法高亮
- 支持表格
- 支持代码块
- 支持链接和图片

### 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### 表格示例

| 功能 | 状态 | 描述 |
|------|------|------|
| 预览 | ✅ | 实时预览 |
| 导出 | ✅ | 导出HTML |
| 语法 | ✅ | 完整支持 |

### 列表示例

1. 有序列表项1
2. 有序列表项2
   - 无序子项
   - 另一个子项

- 无序列表项
- **粗体文本**
- *斜体文本*
- \`行内代码\`

> 这是一个引用块
> 可以包含多行内容

[链接示例](https://example.com)`)

  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'edit'>('split')

  /**
   * 简单的Markdown转HTML解析器
   */
  const parseMarkdown = (text: string): string => {
    let html = text

    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
    })

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // 标题
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

    // 粗体和斜体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')

    // 引用
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

    // 表格
    const tableRegex = /(\|.*\|[\r\n]+\|.*\|[\r\n]+(\|.*\|[\r\n]*)*)/g
    html = html.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n')
      if (lines.length < 2) return match

      const headers = lines[0].split('|').map(h => h.trim()).filter(h => h)
      const separator = lines[1]
      const rows = lines.slice(2).map(line => 
        line.split('|').map(cell => cell.trim()).filter(cell => cell)
      )

      let table = '<table class="table-auto w-full border-collapse border border-gray-300">'
      table += '<thead><tr>'
      headers.forEach(header => {
        table += `<th class="border border-gray-300 px-4 py-2 bg-gray-100">${header}</th>`
      })
      table += '</tr></thead><tbody>'
      
      rows.forEach(row => {
        table += '<tr>'
        row.forEach(cell => {
          table += `<td class="border border-gray-300 px-4 py-2">${cell}</td>`
        })
        table += '</tr>'
      })
      table += '</tbody></table>'
      
      return table
    })

    // 有序列表
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ol>$1</ol>')

    // 无序列表
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>')
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')

    // 段落
    html = html.replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'

    // 清理空段落
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p>(<h[1-6]>)/g, '$1')
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    html = html.replace(/<p>(<pre>)/g, '$1')
    html = html.replace(/(<\/pre>)<\/p>/g, '$1')
    html = html.replace(/<p>(<table)/g, '$1')
    html = html.replace(/(<\/table>)<\/p>/g, '$1')
    html = html.replace(/<p>(<blockquote>)/g, '$1')
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1')
    html = html.replace(/<p>(<[ou]l>)/g, '$1')
    html = html.replace(/(<\/[ou]l>)<\/p>/g, '$1')

    return html
  }

  /**
   * HTML转义
   */
  const escapeHtml = (text: string): string => {
    if (typeof document === 'undefined') {
      // 服务端渲染时的简单转义
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 生成HTML
   */
  const htmlOutput = useMemo(() => {
    return parseMarkdown(markdown)
  }, [markdown])

  /**
   * 复制Markdown
   */
  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      alert('Markdown已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 复制HTML
   */
  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput)
      alert('HTML已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 下载HTML文件
   */
  const downloadHtml = () => {
    if (typeof document === 'undefined') return

    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
${htmlOutput}
</body>
</html>`

    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown-preview.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="Markdown预览"
      description="Markdown转HTML实时预览"
      category="文本处理"
      icon="📋"
    >
      <div className="space-y-4">
        {/* 工具栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                viewMode === 'edit' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Code className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                viewMode === 'split' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="w-4 h-4 border border-current"></div>
              分屏
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                viewMode === 'preview' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Copy className="w-4 h-4" />
              复制MD
            </button>
            <button
              onClick={copyHtml}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Copy className="w-4 h-4" />
              复制HTML
            </button>
            <button
              onClick={downloadHtml}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              下载HTML
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {viewMode === 'edit' && (
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="在此输入Markdown内容..."
            />
          )}

          {viewMode === 'split' && (
            <div className="flex h-96">
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-1/2 h-full p-4 font-mono text-sm resize-none focus:outline-none border-r border-gray-200"
                placeholder="在此输入Markdown内容..."
              />
              <div 
                className="w-1/2 h-full p-4 overflow-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </div>
          )}

          {viewMode === 'preview' && (
            <div 
              className="h-96 p-4 overflow-auto prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">支持的语法</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <ul className="space-y-1">
                <li>• 标题：# ## ###</li>
                <li>• 粗体：**文本**</li>
                <li>• 斜体：*文本*</li>
                <li>• 行内代码：`代码`</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-1">
                <li>• 链接：[文本](URL)</li>
                <li>• 图片：![alt](URL)</li>
                <li>• 引用：&gt; 文本</li>
                <li>• 列表：- 或 1.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
