import { TechArticle } from '@/types';

export const articles: TechArticle[] = [
  {
    id: '1',
    title: 'React 18 新特性深度解析：并发渲染与 Suspense',
    slug: 'react-18-concurrent-rendering-suspense',
    excerpt: '深入探讨 React 18 的并发渲染机制，以及如何使用 Suspense 来优化用户体验。本文将通过实际案例展示这些新特性的强大之处。',
    content: `# React 18 新特性深度解析：并发渲染与 Suspense

React 18 带来了许多令人兴奋的新特性，其中最重要的就是并发渲染（Concurrent Rendering）和改进的 Suspense。

## 并发渲染

并发渲染允许 React 在渲染过程中暂停和恢复工作，这意味着：

- 更好的用户体验
- 更流畅的动画
- 更快的响应时间

\`\`\`jsx
import { startTransition } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      // 这里的更新会被标记为非紧急
      setCount(count + 1);
    });
  };

  return (
    <div>
      {isPending && <Spinner />}
      <button onClick={handleClick}>更新</button>
    </div>
  );
}
\`\`\`

## Suspense 的改进

React 18 中的 Suspense 不仅支持代码分割，还支持数据获取：

\`\`\`jsx
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
      <Posts />
    </Suspense>
  );
}
\`\`\`

这些特性让我们能够构建更加流畅和响应式的用户界面。`,
    publishedAt: '2024-01-15',
    updatedAt: '2024-01-20',
    tags: ['react', 'javascript', 'performance'],
    category: 'frontend',
    readingTime: 8,
    featured: true,
    published: true,
    author: {
      name: '张三',
      avatar: '/avatars/author.jpg'
    },
    seo: {
      title: 'React 18 新特性深度解析 - 并发渲染与 Suspense',
      description: '深入了解 React 18 的并发渲染机制和 Suspense 改进，提升应用性能和用户体验',
      keywords: ['React 18', '并发渲染', 'Suspense', '性能优化']
    }
  },
  {
    id: '2',
    title: 'Next.js 14 App Router 完全指南',
    slug: 'nextjs-14-app-router-guide',
    excerpt: '全面介绍 Next.js 14 的 App Router，包括路由系统、布局、加载状态、错误处理等核心概念。',
    content: `# Next.js 14 App Router 完全指南

Next.js 14 的 App Router 是一个革命性的路由系统，基于 React Server Components 构建。

## 文件系统路由

App Router 使用文件系统来定义路由：

\`\`\`
app/
├── page.tsx          // /
├── about/
│   └── page.tsx      // /about
└── blog/
    ├── page.tsx      // /blog
    └── [slug]/
        └── page.tsx  // /blog/[slug]
\`\`\`

## 布局系统

\`\`\`tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <nav>导航栏</nav>
        {children}
        <footer>页脚</footer>
      </body>
    </html>
  );
}
\`\`\`

## 服务器组件

默认情况下，App Router 中的组件都是服务器组件：

\`\`\`tsx
// 这是一个服务器组件
async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
\`\`\`

App Router 为现代 React 应用提供了更好的性能和开发体验。`,
    publishedAt: '2024-02-01',
    tags: ['nextjs', 'react', 'typescript'],
    category: 'frontend',
    readingTime: 12,
    featured: true,
    published: true,
    author: {
      name: '张三'
    },
    seo: {
      title: 'Next.js 14 App Router 完全指南',
      description: '学习 Next.js 14 App Router 的核心概念和最佳实践',
      keywords: ['Next.js 14', 'App Router', 'React Server Components']
    }
  },
  {
    id: '3',
    title: 'TypeScript 高级类型技巧与实战',
    slug: 'typescript-advanced-types',
    excerpt: '探索 TypeScript 的高级类型系统，包括条件类型、映射类型、模板字面量类型等，提升代码的类型安全性。',
    content: `# TypeScript 高级类型技巧与实战

TypeScript 的类型系统非常强大，掌握高级类型技巧可以让我们写出更安全、更优雅的代码。

## 条件类型

条件类型允许我们根据条件选择类型：

\`\`\`typescript
type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<string>;   // false
\`\`\`

## 映射类型

映射类型可以基于现有类型创建新类型：

\`\`\`typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};
\`\`\`

## 模板字面量类型

TypeScript 4.1 引入了模板字面量类型：

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type ButtonEvents = EventName<'click' | 'hover'>;
// 'onClick' | 'onHover'
\`\`\`

## 实际应用

结合这些高级类型，我们可以创建类型安全的 API：

\`\`\`typescript
type ApiResponse<T> = {
  data: T;
  status: 'success' | 'error';
  message?: string;
};

async function fetchUser(): Promise<ApiResponse<User>> {
  // 实现
}
\`\`\`

掌握这些高级类型技巧，能让我们的 TypeScript 代码更加健壮和可维护。`,
    publishedAt: '2024-01-28',
    tags: ['typescript', 'javascript'],
    category: 'frontend',
    readingTime: 10,
    featured: false,
    published: true,
    author: {
      name: '张三'
    },
    seo: {
      title: 'TypeScript 高级类型技巧与实战',
      description: '深入学习 TypeScript 高级类型系统，提升代码质量和开发效率',
      keywords: ['TypeScript', '高级类型', '条件类型', '映射类型']
    }
  },
  {
    id: '4',
    title: 'Three.js 入门：创建你的第一个 3D 场景',
    slug: 'threejs-getting-started',
    excerpt: '从零开始学习 Three.js，创建令人惊叹的 3D 图形。本文将带你了解 Three.js 的核心概念和基本用法。',
    content: `# Three.js 入门：创建你的第一个 3D 场景

Three.js 是一个强大的 JavaScript 3D 库，让我们能够在浏览器中创建令人惊叹的 3D 图形。

## 基本概念

Three.js 的核心概念包括：

- **场景 (Scene)**: 3D 世界的容器
- **相机 (Camera)**: 观察场景的视角
- **渲染器 (Renderer)**: 将场景渲染到屏幕上
- **几何体 (Geometry)**: 3D 对象的形状
- **材质 (Material)**: 3D 对象的外观

## 创建第一个场景

\`\`\`javascript
import * as THREE from 'three';

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建立方体
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

// 添加到场景
scene.add(cube);

// 设置相机位置
camera.position.z = 5;

// 渲染循环
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
\`\`\`

这就是一个最基本的 Three.js 应用，创建了一个旋转的绿色立方体。`,
    publishedAt: '2024-02-10',
    tags: ['threejs', 'javascript', 'webgl'],
    category: 'frontend',
    readingTime: 6,
    featured: false,
    published: true,
    author: {
      name: '张三'
    },
    seo: {
      title: 'Three.js 入门教程 - 创建第一个 3D 场景',
      description: '学习 Three.js 基础知识，创建你的第一个 3D 图形应用',
      keywords: ['Three.js', '3D 图形', 'WebGL', 'JavaScript']
    }
  },
  {
    id: '5',
    title: 'Node.js 性能优化实战指南',
    slug: 'nodejs-performance-optimization',
    excerpt: '深入探讨 Node.js 应用的性能优化策略，包括内存管理、异步处理、缓存策略等关键技术。',
    content: `# Node.js 性能优化实战指南

Node.js 应用的性能优化是一个复杂但重要的话题。本文将分享一些实用的优化策略。

## 内存管理

### 避免内存泄漏

\`\`\`javascript
// 错误示例：全局变量导致内存泄漏
let cache = {};

function addToCache(key, value) {
  cache[key] = value; // 永远不会被清理
}

// 正确示例：使用 Map 和适当的清理机制
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

function addToCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}
\`\`\`

## 异步处理优化

### 使用 Worker Threads

\`\`\`javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // 主线程
  const worker = new Worker(__filename);
  worker.postMessage({ numbers: [1, 2, 3, 4, 5] });

  worker.on('message', (result) => {
    console.log('计算结果:', result);
  });
} else {
  // 工作线程
  parentPort.on('message', ({ numbers }) => {
    const sum = numbers.reduce((a, b) => a + b, 0);
    parentPort.postMessage(sum);
  });
}
\`\`\`

## 缓存策略

### Redis 缓存

\`\`\`javascript
const redis = require('redis');
const client = redis.createClient();

async function getCachedData(key) {
  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetchDataFromDatabase(key);
    await client.setex(key, 3600, JSON.stringify(data)); // 缓存1小时
    return data;
  } catch (error) {
    console.error('缓存错误:', error);
    return await fetchDataFromDatabase(key);
  }
}
\`\`\`

通过这些优化策略，可以显著提升 Node.js 应用的性能。`,
    publishedAt: '2024-02-05',
    tags: ['nodejs', 'performance', 'javascript'],
    category: 'backend',
    readingTime: 9,
    featured: true,
    published: true,
    author: {
      name: '张三'
    },
    seo: {
      title: 'Node.js 性能优化实战指南',
      description: '学习 Node.js 应用性能优化的最佳实践和策略',
      keywords: ['Node.js', '性能优化', '内存管理', '异步处理']
    }
  },
  {
    id: '6',
    title: 'CSS Grid 布局完全指南',
    slug: 'css-grid-layout-guide',
    excerpt: '深入学习 CSS Grid 布局系统，掌握现代网页布局的强大工具。从基础概念到高级技巧，全面提升布局能力。',
    content: `# CSS Grid 布局完全指南

CSS Grid 是一个强大的二维布局系统，让我们能够轻松创建复杂的网页布局。

## 基本概念

### Grid 容器和项目

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
}

.item {
  grid-column: 1 / 3;
  grid-row: 2;
}
\`\`\`

## 响应式网格

\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
\`\`\`

## 命名网格线

\`\`\`css
.named-grid {
  display: grid;
  grid-template-columns: [sidebar-start] 250px [sidebar-end main-start] 1fr [main-end];
  grid-template-rows: [header-start] auto [header-end content-start] 1fr [content-end];
}

.header {
  grid-column: sidebar-start / main-end;
  grid-row: header-start / header-end;
}
\`\`\`

CSS Grid 为现代网页布局提供了前所未有的灵活性和控制力。`,
    publishedAt: '2024-01-20',
    tags: ['css', 'frontend'],
    category: 'frontend',
    readingTime: 7,
    featured: false,
    published: true,
    author: {
      name: '张三'
    },
    seo: {
      title: 'CSS Grid 布局完全指南',
      description: '学习 CSS Grid 布局系统，掌握现代网页布局技术',
      keywords: ['CSS Grid', '布局', '响应式设计', 'CSS']
    }
  },
  {
    id: '7',
    title: 'JavaScript 异步编程深度解析',
    slug: 'javascript-async-programming',
    excerpt: '从回调函数到 Promise，再到 async/await，全面理解 JavaScript 异步编程的演进和最佳实践。',
    content: `# JavaScript 异步编程深度解析

异步编程是 JavaScript 的核心特性之一，理解它对于编写高效的 JavaScript 代码至关重要。

## 回调函数时代

最初的异步处理方式：

\`\`\`javascript
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { data: 'Hello World' });
  }, 1000);
}

fetchData((error, result) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', result.data);
  }
});
\`\`\`

## Promise 的革命

Promise 解决了回调地狱问题：

\`\`\`javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: 'Hello World' });
    }, 1000);
  });
}

fetchData()
  .then(result => console.log('Data:', result.data))
  .catch(error => console.error('Error:', error));
\`\`\`

## async/await 的优雅

最现代的异步处理方式：

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 使用
async function main() {
  try {
    const data = await fetchData();
    console.log('Data:', data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}
\`\`\`

掌握异步编程是成为优秀 JavaScript 开发者的必经之路。`,
    publishedAt: '2024-02-08',
    tags: ['javascript', 'performance'],
    category: 'frontend',
    readingTime: 9,
    featured: true,
    published: true,
    author: {
      name: '张三'
    },
    seo: {
      title: 'JavaScript 异步编程深度解析',
      description: '深入理解 JavaScript 异步编程，从回调到 Promise 再到 async/await',
      keywords: ['JavaScript', '异步编程', 'Promise', 'async/await']
    }
  },
  {
    id: '8',
    title: 'Tailwind CSS 实用技巧集合',
    slug: 'tailwind-css-tips-tricks',
    excerpt: '分享 Tailwind CSS 的实用技巧和最佳实践，提高开发效率，写出更优雅的样式代码。',
    content: `# Tailwind CSS 实用技巧集合

Tailwind CSS 是一个功能优先的 CSS 框架，这里分享一些实用的技巧和最佳实践。

## 自定义配置

### 扩展颜色系统

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
\`\`\`

## 组件化思维

### 创建可复用的组件类

\`\`\`css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
\`\`\`

## 响应式设计

### 移动优先的响应式设计

\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="p-4 bg-white rounded-lg">Card 1</div>
  <div class="p-4 bg-white rounded-lg">Card 2</div>
  <div class="p-4 bg-white rounded-lg">Card 3</div>
</div>
\`\`\`

## 性能优化

### 清除未使用的样式

\`\`\`javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  // ...
}
\`\`\`

Tailwind CSS 让我们能够快速构建美观、响应式的用户界面。`,
    publishedAt: '2024-01-25',
    tags: ['tailwindcss', 'css', 'frontend'],
    category: 'frontend',
    readingTime: 6,
    featured: false,
    published: true,
    author: {
      name: '张三'
    },
    seo: {
      title: 'Tailwind CSS 实用技巧集合',
      description: '学习 Tailwind CSS 的实用技巧和最佳实践',
      keywords: ['Tailwind CSS', 'CSS 框架', '响应式设计', '前端开发']
    }
  }
];

export const getArticleById = (id: string): TechArticle | undefined => {
  return articles.find(article => article.id === id);
};

export const getArticleBySlug = (slug: string): TechArticle | undefined => {
  return articles.find(article => article.slug === slug);
};

export const getArticlesByTag = (tagId: string): TechArticle[] => {
  return articles.filter(article => article.tags.includes(tagId));
};

export const getArticlesByCategory = (categoryId: string): TechArticle[] => {
  return articles.filter(article => article.category === categoryId);
};

export const getFeaturedArticles = (): TechArticle[] => {
  return articles.filter(article => article.featured && article.published);
};

export const getPublishedArticles = (): TechArticle[] => {
  return articles.filter(article => article.published);
};
