import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'frontend',
    name: '前端开发',
    slug: 'frontend',
    description: '前端技术、框架和最佳实践',
    color: '#FF6B6B',
    count: 15
  },
  {
    id: 'backend',
    name: '后端开发',
    slug: 'backend',
    description: '后端技术、API 设计和服务器开发',
    color: '#4ECDC4',
    count: 8
  },
  {
    id: 'fullstack',
    name: '全栈开发',
    slug: 'fullstack',
    description: '全栈项目和技术栈整合',
    color: '#45B7D1',
    count: 6
  },
  {
    id: 'mobile',
    name: '移动开发',
    slug: 'mobile',
    description: 'React Native 和移动端开发',
    color: '#96CEB4',
    count: 4
  },
  {
    id: 'devtools',
    name: '开发工具',
    slug: 'devtools',
    description: '开发工具、IDE 和效率提升',
    color: '#FFEAA7',
    count: 7
  },
  {
    id: 'algorithms',
    name: '算法与数据结构',
    slug: 'algorithms',
    description: '算法学习和数据结构实现',
    color: '#DDA0DD',
    count: 5
  },
  {
    id: 'design',
    name: 'UI/UX 设计',
    slug: 'design',
    description: '用户界面和用户体验设计',
    color: '#FDA7DF',
    count: 3
  },
  {
    id: 'career',
    name: '职业发展',
    slug: 'career',
    description: '技术职业规划和成长经验',
    color: '#74B9FF',
    count: 4
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(category => category.slug === slug);
};
