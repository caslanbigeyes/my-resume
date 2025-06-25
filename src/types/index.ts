// 标签类型
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  count: number; // 关联文章数量
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  count: number; // 关联文章数量
}

// 技术文章类型
export interface TechArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[]; // tag ids
  category: string; // category id
  readingTime: number; // 阅读时间（分钟）
  featured: boolean;
  published: boolean;
  author: {
    name: string;
    avatar?: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// 关于页面内容类型
export interface AboutContent {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  sections: AboutSection[];
}

export interface AboutSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'timeline' | 'skills' | 'projects';
  order: number;
}

// 时间线项目类型
export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'work' | 'education' | 'project' | 'achievement';
  company?: string;
  location?: string;
  technologies?: string[];
}

// 技能类型
export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 1-5
  description?: string;
}

// 项目类型
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
  startDate: string;
  endDate?: string;
}
