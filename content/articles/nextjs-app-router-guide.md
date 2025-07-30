---
title: "Next.js App Router 完全指南"
excerpt: "全面介绍 Next.js 14 的 App Router，包括路由系统、布局、加载状态、错误处理等核心概念和最佳实践。"
publishedAt: "2024-02-01"
author: "hero"
category: "frontend"
tags: ["nextjs", "react", "typescript"]
featured: true
published: true
image: "/images/articles/nextjs-app-router.jpg"
seoTitle: "Next.js App Router 完全指南 - 掌握新一代路由系统"
seoDescription: "学习 Next.js 14 App Router 的核心概念和最佳实践，包括文件系统路由、布局、服务器组件等"
seoKeywords: ["Next.js", "App Router", "React Server Components", "文件系统路由"]
---

# Next.js App Router 完全指南

Next.js 13 引入了全新的 App Router，这是基于 React Server Components 构建的下一代路由系统。本文将全面介绍 App Router 的核心概念和最佳实践。

## App Router vs Pages Router

### Pages Router (传统方式)
```
pages/
├── index.js          // /
├── about.js          // /about
└── blog/
    ├── index.js      // /blog
    └── [slug].js     // /blog/[slug]
```

### App Router (新方式)
```
app/
├── page.tsx          // /
├── about/
│   └── page.tsx      // /about
└── blog/
    ├── page.tsx      // /blog
    └── [slug]/
        └── page.tsx  // /blog/[slug]
```

## 核心概念

### 1. 文件约定

App Router 使用特殊的文件名来定义路由行为：

- `page.tsx`: 定义路由页面
- `layout.tsx`: 定义布局
- `loading.tsx`: 定义加载状态
- `error.tsx`: 定义错误页面
- `not-found.tsx`: 定义 404 页面
- `route.tsx`: 定义 API 路由

### 2. 布局系统

#### 根布局 (必需)

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <header>
          <nav>全局导航</nav>
        </header>
        <main>{children}</main>
        <footer>全局页脚</footer>
      </body>
    </html>
  );
}
```

#### 嵌套布局

```tsx
// app/blog/layout.tsx
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-container">
      <aside>
        <h2>博客侧边栏</h2>
        <nav>博客导航</nav>
      </aside>
      <div className="blog-content">
        {children}
      </div>
    </div>
  );
}
```

### 3. 页面组件

```tsx
// app/blog/page.tsx
export default function BlogPage() {
  return (
    <div>
      <h1>博客首页</h1>
      <p>欢迎来到我的博客</p>
    </div>
  );
}
```

### 4. 动态路由

#### 单个动态段

```tsx
// app/blog/[slug]/page.tsx
export default function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <h1>文章: {params.slug}</h1>
    </div>
  );
}
```

#### 多个动态段

```tsx
// app/blog/[category]/[slug]/page.tsx
export default function CategoryPost({
  params,
}: {
  params: { category: string; slug: string };
}) {
  return (
    <div>
      <h1>分类: {params.category}</h1>
      <h2>文章: {params.slug}</h2>
    </div>
  );
}
```

#### 捕获所有路由

```tsx
// app/docs/[...slug]/page.tsx
export default function DocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  return (
    <div>
      <h1>文档路径: {params.slug.join('/')}</h1>
    </div>
  );
}
```

## 服务器组件 vs 客户端组件

### 服务器组件 (默认)

```tsx
// 这是一个服务器组件
async function BlogPost({ params }: { params: { slug: string } }) {
  // 可以直接在服务器端获取数据
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### 客户端组件

```tsx
'use client'; // 标记为客户端组件

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
```

## 数据获取

### 服务器端数据获取

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    // 可以配置缓存策略
    next: { revalidate: 3600 } // 1小时后重新验证
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>文章列表</h1>
      {posts.map((post: any) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
```

### 并行数据获取

```tsx
async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

async function getUserPosts(id: string) {
  const res = await fetch(`/api/users/${id}/posts`);
  return res.json();
}

export default async function UserProfile({
  params,
}: {
  params: { id: string };
}) {
  // 并行获取数据
  const [user, posts] = await Promise.all([
    getUser(params.id),
    getUserPosts(params.id),
  ]);

  return (
    <div>
      <h1>{user.name}</h1>
      <div>
        <h2>用户文章</h2>
        {posts.map((post: any) => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    </div>
  );
}
```

## 加载状态

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>加载中...</p>
    </div>
  );
}
```

## 错误处理

```tsx
// app/blog/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>出错了！</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

## 路由组

使用括号创建路由组，不影响 URL 结构：

```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx     // /about
│   └── contact/
│       └── page.tsx     // /contact
└── (shop)/
    ├── products/
    │   └── page.tsx     // /products
    └── cart/
        └── page.tsx     // /cart
```

每个路由组可以有自己的布局：

```tsx
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-layout">
      <nav>营销页面导航</nav>
      {children}
    </div>
  );
}
```

## 拦截路由

使用 `(..)` 语法拦截路由：

```
app/
├── feed/
│   └── page.tsx
├── photo/
│   └── [id]/
│       └── page.tsx
└── @modal/
    └── (..)photo/
        └── [id]/
            └── page.tsx
```

## 并行路由

使用 `@` 语法创建并行路由：

```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <>
      {children}
      {analytics}
      {team}
    </>
  );
}
```

## 最佳实践

### 1. 合理使用服务器组件和客户端组件

```tsx
// 服务器组件负责数据获取
async function PostList() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 客户端组件负责交互
'use client';
function PostCard({ post }) {
  const [liked, setLiked] = useState(false);

  return (
    <div>
      <h3>{post.title}</h3>
      <button onClick={() => setLiked(!liked)}>
        {liked ? '❤️' : '🤍'}
      </button>
    </div>
  );
}
```

### 2. 优化数据获取

```tsx
// 使用适当的缓存策略
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: {
      revalidate: 3600, // 静态重新生成
      tags: ['posts'] // 标签重新验证
    }
  });

  return res.json();
}
```

### 3. 错误边界和加载状态

为每个路由段提供适当的错误处理和加载状态：

```
app/
├── dashboard/
│   ├── loading.tsx      // 仪表板加载状态
│   ├── error.tsx        // 仪表板错误处理
│   ├── page.tsx
│   └── analytics/
│       ├── loading.tsx  // 分析页面加载状态
│       ├── error.tsx    // 分析页面错误处理
│       └── page.tsx
```

## 总结

Next.js App Router 带来了许多强大的特性：

- **基于文件系统的路由**: 直观的路由结构
- **布局系统**: 灵活的嵌套布局
- **服务器组件**: 更好的性能和 SEO
- **流式渲染**: 改善用户体验
- **并行路由**: 复杂 UI 的解决方案

App Router 代表了 React 和 Next.js 的未来方向，值得我们深入学习和实践。
