import { Tag } from '@/types';

export const tags: Tag[] = [
  {
    id: 'react',
    name: 'React',
    slug: 'react',
    description: 'React.js 相关技术文章',
    color: '#61DAFB',
    count: 8
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    slug: 'nextjs',
    description: 'Next.js 框架相关文章',
    color: '#000000',
    count: 6
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript 开发技巧',
    color: '#3178C6',
    count: 10
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'JavaScript 基础与进阶',
    color: '#F7DF1E',
    count: 12
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    slug: 'nodejs',
    description: 'Node.js 后端开发',
    color: '#339933',
    count: 7
  },
  {
    id: 'css',
    name: 'CSS',
    slug: 'css',
    description: 'CSS 样式与布局技巧',
    color: '#1572B6',
    count: 5
  },
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    slug: 'tailwindcss',
    description: 'Tailwind CSS 实用技巧',
    color: '#06B6D4',
    count: 4
  },
  {
    id: 'threejs',
    name: 'Three.js',
    slug: 'threejs',
    description: '3D 图形与动画',
    color: '#000000',
    count: 3
  },
  {
    id: 'webgl',
    name: 'WebGL',
    slug: 'webgl',
    description: 'WebGL 图形编程',
    color: '#990000',
    count: 2
  },
  {
    id: 'performance',
    name: '性能优化',
    slug: 'performance',
    description: 'Web 性能优化技巧',
    color: '#FF6B6B',
    count: 6
  },
  {
    id: 'database',
    name: '数据库',
    slug: 'database',
    description: '数据库设计与优化',
    color: '#4ECDC4',
    count: 4
  },
  {
    id: 'devops',
    name: 'DevOps',
    slug: 'devops',
    description: '开发运维相关',
    color: '#45B7D1',
    count: 3
  }
];

export const getTagById = (id: string): Tag | undefined => {
  return tags.find(tag => tag.id === id);
};

export const getTagBySlug = (slug: string): Tag | undefined => {
  return tags.find(tag => tag.slug === slug);
};
