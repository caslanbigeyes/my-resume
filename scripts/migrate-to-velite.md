# 迁移到 Velite 的步骤

## 1. 安装 Velite
```bash
npm uninstall contentlayer next-contentlayer
npm install velite
```

## 2. 创建 velite.config.ts
```typescript
import { defineConfig, defineCollection, s } from 'velite'

const articles = defineCollection({
  name: 'Article',
  pattern: 'articles/**/*.md',
  schema: s.object({
    title: s.string(),
    excerpt: s.string(),
    publishedAt: s.isodate(),
    updatedAt: s.isodate().optional(),
    author: s.string(),
    category: s.string(),
    tags: s.array(s.string()).default([]),
    featured: s.boolean().default(false),
    published: s.boolean().default(true),
    image: s.string().optional(),
    seoTitle: s.string().optional(),
    seoDescription: s.string().optional(),
    seoKeywords: s.array(s.string()).optional(),
    slug: s.slug('title'),
    readingTime: s.object({
      text: s.string(),
      minutes: s.number(),
      time: s.number(),
      words: s.number()
    }),
    content: s.markdown()
  })
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  },
  collections: { articles },
  mdx: {
    rehypePlugins: [],
    remarkPlugins: []
  }
})
```

## 3. 更新 package.json
```json
{
  "scripts": {
    "dev": "velite dev & next dev --turbopack",
    "build": "velite build && next build"
  }
}
```

## 4. 更新 next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 withContentlayer
}

module.exports = nextConfig
```
