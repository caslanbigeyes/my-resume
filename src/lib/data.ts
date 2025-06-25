import { allArticles, allTags, allCategories, allAuthors, allPages, allProjects } from 'contentlayer/generated';
import type { Article, Tag, Category, Author, Page, Project } from 'contentlayer/generated';

// 导出所有数据
export const articles = allArticles;
export const tags = allTags;
export const categories = allCategories;
export const authors = allAuthors;
export const pages = allPages;
export const projects = allProjects;

// 文章相关函数
export function getArticleById(id: string): Article | undefined {
  return allArticles.find(article => article._id === id);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return allArticles.find(article => article.slug === slug);
}

export function getArticlesByTag(tagSlug: string): Article[] {
  return allArticles.filter(article =>
    article.published && article.tags && article.tags.includes(tagSlug)
  );
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return allArticles.filter(article =>
    article.published && article.category === categorySlug
  );
}

export function getFeaturedArticles(): Article[] {
  return allArticles.filter(article => article.featured && article.published);
}

export function getPublishedArticles(): Article[] {
  return allArticles.filter(article => article.published);
}

// 标签相关函数
export function getTagById(id: string): Tag | undefined {
  return allTags.find(tag => tag._id === id);
}

export function getTagBySlug(slug: string): Tag | undefined {
  return allTags.find(tag => tag.slug === slug);
}

// 分类相关函数
export function getCategoryById(id: string): Category | undefined {
  return allCategories.find(category => category._id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return allCategories.find(category => category.slug === slug);
}

// 作者相关函数
export function getAuthorBySlug(slug: string): Author | undefined {
  return allAuthors.find(author => author.slug === slug);
}

// 页面相关函数
export function getPageBySlug(slug: string): Page | undefined {
  return allPages.find(page => page.slug === slug);
}

// 项目相关函数
export function getProjectBySlug(slug: string): Project | undefined {
  return allProjects.find(project => project.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return allProjects.filter(project => project.featured);
}

// 搜索功能
export function searchArticles(query: string): Article[] {
  const lowercaseQuery = query.toLowerCase();
  return allArticles.filter(article =>
    article.published && (
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.excerpt.toLowerCase().includes(lowercaseQuery) ||
      article.body.raw.toLowerCase().includes(lowercaseQuery)
    )
  );
}

// 获取相关文章
export function getRelatedArticles(articleSlug: string, limit: number = 3): Article[] {
  const article = getArticleBySlug(articleSlug);
  if (!article) return [];

  const relatedArticles = allArticles.filter(a =>
    a.slug !== articleSlug &&
    a.published &&
    (a.category === article.category || a.tags.some(tag => article.tags.includes(tag)))
  );

  return relatedArticles.slice(0, limit);
}

// 获取最新文章
export function getLatestArticles(limit: number = 5): Article[] {
  return getPublishedArticles()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

// 获取热门标签
export function getPopularTags(limit: number = 10): Tag[] {
  // 计算每个标签的文章数量
  const tagCounts = allTags.map(tag => ({
    ...tag,
    count: getArticlesByTag(tag.slug).length
  }));

  return tagCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 获取热门分类
export function getPopularCategories(limit: number = 5): Category[] {
  // 计算每个分类的文章数量
  const categoryCounts = allCategories.map(category => ({
    ...category,
    count: getArticlesByCategory(category.slug).length
  }));

  return categoryCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 统计数据
export function getStats() {
  const totalArticles = getPublishedArticles().length;
  const totalTags = allTags.length;
  const totalCategories = allCategories.length;
  const totalViews = getPublishedArticles().reduce((sum, article) => sum + (article.readingTime.minutes * 100), 0); // 模拟浏览量

  return {
    totalArticles,
    totalTags,
    totalCategories,
    totalViews
  };
}

// 按年份分组文章
export function getArticlesByYear(): Record<string, Article[]> {
  const articlesByYear: Record<string, Article[]> = {};

  getPublishedArticles().forEach(article => {
    const year = new Date(article.publishedAt).getFullYear().toString();
    if (!articlesByYear[year]) {
      articlesByYear[year] = [];
    }
    articlesByYear[year].push(article);
  });

  // 按年份降序排序
  const sortedYears = Object.keys(articlesByYear).sort((a, b) => parseInt(b) - parseInt(a));
  const sortedArticlesByYear: Record<string, Article[]> = {};

  sortedYears.forEach(year => {
    sortedArticlesByYear[year] = articlesByYear[year].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  return sortedArticlesByYear;
}

// 计算阅读时间
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // 平均阅读速度
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 生成文章摘要
export function generateExcerpt(content: string, maxLength: number = 150): string {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 移除标题
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/`(.*?)`/g, '$1') // 移除行内代码
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/\n+/g, ' ') // 替换换行为空格
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}
