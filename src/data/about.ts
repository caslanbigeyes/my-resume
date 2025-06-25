import { AboutContent, AboutSection, TimelineItem, Skill, Project } from '@/types';

export const aboutContent: AboutContent = {
  id: 'about-me',
  title: '关于我',
  content: '我是一名热爱技术的全栈开发者，专注于现代 Web 技术栈的研究与实践。',
  lastUpdated: '2024-02-15',
  sections: [
    {
      id: 'intro',
      title: '个人简介',
      content: `你好！我是张三，一名充满激情的全栈开发者。我热爱编程，享受解决复杂问题的过程，
      并且始终保持对新技术的好奇心。我相信技术能够改变世界，让生活变得更美好。
      
      在过去的几年里，我专注于 React、Next.js、Node.js 等现代技术栈的学习和实践。
      我喜欢分享知识，经常在技术博客上发表文章，希望能够帮助更多的开发者成长。`,
      type: 'text',
      order: 1
    },
    {
      id: 'timeline',
      title: '个人经历',
      content: '我的学习和工作经历时间线',
      type: 'timeline',
      order: 2
    },
    {
      id: 'skills',
      title: '技能专长',
      content: '我掌握的技术栈和技能水平',
      type: 'skills',
      order: 3
    },
    {
      id: 'projects',
      title: '项目作品',
      content: '我参与或独立完成的一些项目',
      type: 'projects',
      order: 4
    }
  ]
};

export const timeline: TimelineItem[] = [
  {
    id: '1',
    title: '开始学习编程',
    description: '开始接触 HTML、CSS 和 JavaScript，对前端开发产生浓厚兴趣',
    date: '2020-03',
    type: 'education',
    location: '自学'
  },
  {
    id: '2',
    title: '掌握 React 框架',
    description: '深入学习 React 生态系统，包括 Redux、React Router 等',
    date: '2020-08',
    type: 'education',
    technologies: ['React', 'Redux', 'JavaScript']
  },
  {
    id: '3',
    title: '前端开发实习生',
    description: '在一家初创公司担任前端开发实习生，参与多个项目开发',
    date: '2021-01',
    type: 'work',
    company: 'TechStart 科技',
    location: '北京',
    technologies: ['React', 'TypeScript', 'Ant Design']
  },
  {
    id: '4',
    title: '学习后端技术',
    description: '开始学习 Node.js、Express 和数据库技术，成为全栈开发者',
    date: '2021-06',
    type: 'education',
    technologies: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL']
  },
  {
    id: '5',
    title: '全栈开发工程师',
    description: '晋升为全栈开发工程师，负责完整的产品开发周期',
    date: '2022-01',
    type: 'work',
    company: 'TechStart 科技',
    location: '北京',
    technologies: ['React', 'Next.js', 'Node.js', 'TypeScript']
  },
  {
    id: '6',
    title: '开源项目贡献',
    description: '开始为开源项目贡献代码，参与社区建设',
    date: '2022-06',
    type: 'achievement',
    technologies: ['React', 'TypeScript', 'Open Source']
  },
  {
    id: '7',
    title: '技术博客写作',
    description: '开始在个人博客上分享技术文章，累计阅读量超过 10 万',
    date: '2023-01',
    type: 'achievement'
  },
  {
    id: '8',
    title: '高级全栈工程师',
    description: '加入新公司担任高级全栈工程师，负责架构设计和团队技术指导',
    date: '2023-08',
    type: 'work',
    company: 'InnovateTech 创新科技',
    location: '上海',
    technologies: ['React', 'Next.js', 'Node.js', 'TypeScript', 'AWS']
  }
];

export const skills: Skill[] = [
  // 前端技能
  { id: '1', name: 'JavaScript', category: '前端', level: 5, description: '熟练掌握 ES6+ 语法和异步编程' },
  { id: '2', name: 'TypeScript', category: '前端', level: 4, description: '熟悉类型系统和高级类型' },
  { id: '3', name: 'React', category: '前端', level: 5, description: '深度理解 React 生态系统' },
  { id: '4', name: 'Next.js', category: '前端', level: 4, description: '熟练使用 SSR/SSG 和 App Router' },
  { id: '5', name: 'Vue.js', category: '前端', level: 3, description: '了解 Vue 3 Composition API' },
  { id: '6', name: 'CSS/Sass', category: '前端', level: 4, description: '熟练使用现代 CSS 技术' },
  { id: '7', name: 'Tailwind CSS', category: '前端', level: 4, description: '熟练使用原子化 CSS 框架' },
  
  // 后端技能
  { id: '8', name: 'Node.js', category: '后端', level: 4, description: '熟练开发 RESTful API 和微服务' },
  { id: '9', name: 'Express.js', category: '后端', level: 4, description: '熟练使用 Express 框架' },
  { id: '10', name: 'NestJS', category: '后端', level: 3, description: '了解企业级 Node.js 框架' },
  { id: '11', name: 'Python', category: '后端', level: 3, description: '能够编写自动化脚本和简单 API' },
  
  // 数据库
  { id: '12', name: 'MongoDB', category: '数据库', level: 4, description: '熟练使用 NoSQL 数据库' },
  { id: '13', name: 'PostgreSQL', category: '数据库', level: 3, description: '了解关系型数据库设计' },
  { id: '14', name: 'Redis', category: '数据库', level: 3, description: '熟悉缓存和会话管理' },
  
  // 工具和其他
  { id: '15', name: 'Git', category: '工具', level: 4, description: '熟练使用版本控制' },
  { id: '16', name: 'Docker', category: '工具', level: 3, description: '了解容器化部署' },
  { id: '17', name: 'AWS', category: '云服务', level: 3, description: '熟悉基本的云服务使用' },
  { id: '18', name: 'Three.js', category: '前端', level: 3, description: '能够创建基本的 3D 图形应用' }
];

export const projects: Project[] = [
  {
    id: '1',
    title: '个人技术博客',
    description: '使用 Next.js 和 Contentlayer 构建的现代化技术博客，支持 MDX、代码高亮、标签分类等功能。',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Contentlayer', 'MDX'],
    githubUrl: 'https://github.com/username/tech-blog',
    liveUrl: 'https://myblog.com',
    imageUrl: '/projects/blog.jpg',
    featured: true,
    startDate: '2023-10',
    endDate: '2024-01'
  },
  {
    id: '2',
    title: 'E-commerce 全栈应用',
    description: '完整的电商平台，包括用户认证、商品管理、购物车、支付集成等功能。',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe', 'JWT'],
    githubUrl: 'https://github.com/username/ecommerce-app',
    liveUrl: 'https://mystore.com',
    imageUrl: '/projects/ecommerce.jpg',
    featured: true,
    startDate: '2023-03',
    endDate: '2023-08'
  },
  {
    id: '3',
    title: '3D 数据可视化平台',
    description: '使用 Three.js 构建的交互式 3D 数据可视化平台，支持多种图表类型和实时数据更新。',
    technologies: ['Three.js', 'React', 'TypeScript', 'WebGL', 'D3.js'],
    githubUrl: 'https://github.com/username/3d-visualization',
    liveUrl: 'https://viz3d.com',
    imageUrl: '/projects/3d-viz.jpg',
    featured: true,
    startDate: '2022-12',
    endDate: '2023-02'
  },
  {
    id: '4',
    title: '任务管理应用',
    description: '团队协作的任务管理工具，支持项目管理、时间跟踪、团队沟通等功能。',
    technologies: ['Vue.js', 'Node.js', 'Socket.io', 'PostgreSQL', 'Redis'],
    githubUrl: 'https://github.com/username/task-manager',
    imageUrl: '/projects/task-manager.jpg',
    featured: false,
    startDate: '2022-06',
    endDate: '2022-11'
  }
];
