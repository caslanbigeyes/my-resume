import { articles, getArticleById, getArticleBySlug, getArticlesByTag, getArticlesByCategory, getFeaturedArticles, getPublishedArticles } from '@/data/articles';
import { tags, getTagById, getTagBySlug } from '@/data/tags';
import { categories, getCategoryById, getCategoryBySlug } from '@/data/categories';
import { aboutContent, timeline, skills, projects } from '@/data/about';
import { TechArticle, Tag, Category } from '@/types';

// 文章相关函数
export {
  articles,
  getArticleById,
  getArticleBySlug,
  getArticlesByTag,
  getArticlesByCategory,
  getFeaturedArticles,
  getPublishedArticles
};

// 标签相关函数
export {
  tags,
  getTagById,
  getTagBySlug
};

// 分类相关函数
export {
  categories,
  getCategoryById,
  getCategoryBySlug
};

// 关于页面相关数据
export {
  aboutContent,
  timeline,
  skills,
  projects
};

// 搜索功能
export function searchArticles(query: string): TechArticle[] {
  const lowercaseQuery = query.toLowerCase();
  return articles.filter(article => 
    article.published && (
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.excerpt.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery)
    )
  );
}

// 获取相关文章
export function getRelatedArticles(articleId: string, limit: number = 3): TechArticle[] {
  const article = getArticleById(articleId);
  if (!article) return [];

  const relatedArticles = articles.filter(a => 
    a.id !== articleId && 
    a.published && 
    (a.category === article.category || a.tags.some(tag => article.tags.includes(tag)))
  );

  return relatedArticles.slice(0, limit);
}

// 获取最新文章
export function getLatestArticles(limit: number = 5): TechArticle[] {
  return getPublishedArticles()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

// 获取热门标签
export function getPopularTags(limit: number = 10): Tag[] {
  return tags
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 获取热门分类
export function getPopularCategories(limit: number = 5): Category[] {
  return categories
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 统计数据
export function getStats() {
  const totalArticles = getPublishedArticles().length;
  const totalTags = tags.length;
  const totalCategories = categories.length;
  const totalViews = getPublishedArticles().reduce((sum, article) => sum + (article.readingTime * 100), 0); // 模拟浏览量

  return {
    totalArticles,
    totalTags,
    totalCategories,
    totalViews
  };
}

// 按年份分组文章
export function getArticlesByYear(): Record<string, TechArticle[]> {
  const articlesByYear: Record<string, TechArticle[]> = {};
  
  getPublishedArticles().forEach(article => {
    const year = new Date(article.publishedAt).getFullYear().toString();
    if (!articlesByYear[year]) {
      articlesByYear[year] = [];
    }
    articlesByYear[year].push(article);
  });

  // 按年份降序排序
  const sortedYears = Object.keys(articlesByYear).sort((a, b) => parseInt(b) - parseInt(a));
  const sortedArticlesByYear: Record<string, TechArticle[]> = {};
  
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
