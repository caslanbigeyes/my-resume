---
title: "个人技术博客"
description: "使用 Next.js 和 Contentlayer 构建的现代化技术博客，支持 Markdown 写作、代码高亮、标签分类等功能"
technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Contentlayer", "MDX", "Vercel"]
githubUrl: "https://github.com/zhangsan/tech-blog"
liveUrl: "https://zhangsan.dev"
imageUrl: "/images/projects/tech-blog.jpg"
featured: true
startDate: "2023-10-01"
endDate: "2024-01-15"
status: "completed"
---

# 个人技术博客

这是我的个人技术博客项目，用于分享学习心得、技术文章和项目经验。项目采用现代化的技术栈，注重性能、SEO 和用户体验。

## 项目背景

作为一名开发者，我一直想要一个属于自己的技术博客来记录学习过程和分享技术心得。市面上虽然有很多博客平台，但都有各自的限制。因此，我决定从零开始构建一个完全符合自己需求的技术博客。

## 技术选型

### 前端框架
- **Next.js 14**: 选择 Next.js 是因为它提供了出色的 SSR/SSG 支持，对 SEO 友好
- **App Router**: 使用最新的 App Router 来获得更好的开发体验
- **TypeScript**: 提供类型安全，减少运行时错误

### 内容管理
- **Contentlayer**: 将 Markdown 文件转换为类型安全的数据
- **MDX**: 支持在 Markdown 中使用 React 组件
- **Gray Matter**: 解析 Frontmatter 元数据

### 样式系统
- **Tailwind CSS**: 快速构建响应式 UI
- **Headless UI**: 无样式的可访问组件
- **Lucide Icons**: 现代化的图标库

### 部署和托管
- **Vercel**: 零配置部署，完美支持 Next.js
- **GitHub**: 代码托管和版本控制

## 核心功能

### 1. 文章管理系统
- 支持 Markdown 和 MDX 格式
- 自动生成文章摘要和阅读时间
- 标签和分类系统
- 文章搜索和筛选

### 2. 响应式设计
- 移动端优先的设计理念
- 适配各种屏幕尺寸
- 暗色模式支持

### 3. SEO 优化
- 自动生成 sitemap
- 结构化数据标记
- Open Graph 和 Twitter Card 支持
- 页面性能优化

### 4. 代码高亮
- 支持多种编程语言
- 自定义主题
- 代码复制功能
- 行号显示

## 项目架构

```
tech-blog/
├── app/                    # Next.js App Router
│   ├── (blog)/            # 博客路由组
│   │   ├── articles/      # 文章页面
│   │   ├── tags/          # 标签页面
│   │   └── categories/    # 分类页面
│   ├── components/        # React 组件
│   └── globals.css        # 全局样式
├── content/               # Markdown 内容
│   ├── articles/          # 文章
│   ├── pages/             # 页面
│   └── authors/           # 作者信息
├── lib/                   # 工具函数
├── public/                # 静态资源
└── contentlayer.config.ts # Contentlayer 配置
```

## 开发过程

### 第一阶段：基础架构 (2023.10 - 2023.11)
- 搭建 Next.js 项目基础结构
- 配置 Contentlayer 和 MDX
- 实现基本的文章展示功能
- 设计响应式布局

### 第二阶段：功能完善 (2023.11 - 2023.12)
- 实现标签和分类系统
- 添加搜索和筛选功能
- 优化 SEO 和性能
- 添加代码高亮和复制功能

### 第三阶段：用户体验优化 (2023.12 - 2024.01)
- 实现暗色模式
- 添加阅读进度条
- 优化移动端体验
- 添加评论系统集成

## 技术亮点

### 1. 类型安全的内容管理
使用 Contentlayer 将 Markdown 文件转换为 TypeScript 类型：

```typescript
export const Article = defineDocumentType(() => ({
  name: 'Article',
  filePathPattern: `articles/**/*.md`,
  contentType: 'markdown',
  fields: {
    title: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' } },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, ''),
    },
    readingTime: {
      type: 'json',
      resolve: (doc) => readingTime(doc.body.raw),
    },
  },
}))
```

### 2. 性能优化
- 使用 Next.js 的 Image 组件优化图片加载
- 实现代码分割和懒加载
- 静态生成 (SSG) 提升页面加载速度
- 使用 ISR (Incremental Static Regeneration) 更新内容

### 3. 可访问性
- 语义化 HTML 结构
- 键盘导航支持
- 屏幕阅读器友好
- 颜色对比度优化

## 性能指标

通过 Lighthouse 测试，网站在各项指标上都达到了优秀水平：

- **Performance**: 98/100
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

## 遇到的挑战

### 1. Contentlayer 版本兼容性
在项目初期，Contentlayer 与 Next.js 14 存在兼容性问题。通过研究源码和社区讨论，最终找到了解决方案。

### 2. MDX 组件样式
在 MDX 中使用自定义组件时，样式隔离是一个挑战。通过使用 CSS Modules 和 Tailwind CSS 的组合解决了这个问题。

### 3. 搜索功能实现
最初考虑使用 Algolia 等第三方搜索服务，但考虑到成本和复杂性，最终选择了客户端搜索的方案。

## 学到的经验

1. **内容优先**: 好的内容是博客成功的关键
2. **性能重要**: 快速的加载速度直接影响用户体验
3. **SEO 基础**: 良好的 SEO 实践有助于内容传播
4. **持续迭代**: 根据用户反馈不断改进产品

## 未来计划

- **评论系统**: 集成 Giscus 或 Utterances
- **RSS 订阅**: 生成 RSS feed
- **全文搜索**: 使用 Algolia 或 Elasticsearch
- **数据分析**: 集成 Google Analytics
- **多语言支持**: 支持中英文切换
- **PWA 支持**: 添加离线阅读功能

## 总结

这个技术博客项目不仅是我技术能力的展示，更是我学习和成长的记录。通过构建这个项目，我深入学习了 Next.js、Contentlayer、TypeScript 等技术，也对现代 Web 开发有了更深的理解。

项目的成功不仅在于技术实现，更在于它真正解决了我的需求——拥有一个完全可控、性能优秀、用户体验良好的技术博客平台。

如果你对这个项目感兴趣，欢迎查看源码或与我交流讨论！
