'use client'
import React, { useState } from 'react';
import Layout from '../../Components/Layout';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Upload, Tag, Calendar } from 'lucide-react';

export default function NewLearningNotePage() {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    content: '',
    tags: '',
    readingTime: 5,
    hasImages: false
  });

  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // 模拟保存过程
    setTimeout(() => {
      setSaving(false);
      alert('学习笔记已保存！');
      // 实际项目中这里会调用API保存到文件系统或数据库
    }, 1000);
  };

  const generateSlug = () => {
    const date = formData.date;
    const title = formData.title.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `${date}-${title}`;
  };

  const previewContent = `---
title: "${formData.title}"
date: "${formData.date}"
summary: "${formData.summary}"
tags: [${formData.tags.split(',').map(tag => `"${tag.trim()}"`).join(', ')}]
readingTime: ${formData.readingTime}
hasImages: ${formData.hasImages}
slug: "${generateSlug()}"
---

${formData.content}`;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/learning-notes"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回笔记列表
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">创建新的学习笔记</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                preview 
                  ? 'bg-gray-500 text-white hover:bg-gray-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Eye className="w-4 h-4" />
              {preview ? '编辑模式' : '预览模式'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 编辑表单 */}
          <div className={`space-y-6 ${preview ? 'hidden lg:block' : ''}`}>
            <div className="glass-effect rounded-2xl p-6 card-shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    标题
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="例如：测试0826今天"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">阅读时长(分钟)</label>
                    <input
                      type="number"
                      name="readingTime"
                      value={formData.readingTime}
                      onChange={handleInputChange}
                      min="1"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    标签 (用逗号分隔)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="例如：大模型,入门,环境搭建"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="简要描述这篇学习笔记的主要内容..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasImages"
                    checked={formData.hasImages}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">包含图片</label>
                </div>
              </form>
            </div>

            <div className="glass-effect rounded-2xl p-6 card-shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">笔记内容</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">支持 Markdown 格式</span>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    上传图片
                  </button>
                </div>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={20}
                  placeholder="# 学习笔记标题

## 今日学习目标
- 目标1
- 目标2

## 学习内容

### 1. 主要概念

这里写学习的主要内容...

```python
# 代码示例
def hello_world():
    print('Hello, World!')
```

![图片描述](图片链接)

## 今日收获

1. **理论基础**：...
2. **实践能力**：...

## 明日计划

- [ ] 任务1
- [ ] 任务2

---

**学习心得**：..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                保存草稿
              </button>
              <button
                type="submit"
                disabled={saving}
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '发布笔记'}
              </button>
            </div>
          </div>

          {/* 预览区域 */}
          <div className={`${preview ? '' : 'hidden lg:block'}`}>
            <div className="glass-effect rounded-2xl p-6 card-shadow sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">实时预览</h2>
              <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-[600px] overflow-y-auto">
                <div className="space-y-4">
                  {/* 预览头部信息 */}
                  <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                      {formData.title || '未命名笔记'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>📅 {formData.date}</span>
                      <span>⏱️ {formData.readingTime} 分钟</span>
                      {formData.hasImages && <span>🖼️ 包含图片</span>}
                    </div>
                    <p className="text-gray-700 mb-3">
                      {formData.summary || '暂无摘要'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* 预览内容 */}
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {formData.content || '开始编写你的学习笔记内容...'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 帮助提示 */}
        <div className="glass-effect rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 写作提示</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Markdown 语法</h4>
              <ul className="space-y-1">
                <li><code># 标题</code> - 一级标题</li>
                <li><code>## 标题</code> - 二级标题</li>
                <li><code>**粗体**</code> - 粗体文字</li>
                <li><code>`代码`</code> - 行内代码</li>
                <li><code>```python</code> - 代码块</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">建议结构</h4>
              <ul className="space-y-1">
                <li>• 学习目标</li>
                <li>• 主要内容</li>
                <li>• 代码示例</li>
                <li>• 今日收获</li>
                <li>• 明日计划</li>
                <li>• 学习心得</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}