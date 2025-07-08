import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import readingTime from 'reading-time'

// 作者类型
export const Author = defineDocumentType(() => ({
  name: 'Author',
  filePathPattern: `authors/**/*.md`,
  contentType: 'markdown',
  fields: {
    name: {
      type: 'string',
      description: '作者姓名',
      required: true,
    },
    avatar: {
      type: 'string',
      description: '头像 URL',
      required: false,
    },
    bio: {
      type: 'string',
      description: '个人简介',
      required: false,
    },
    email: {
      type: 'string',
      description: '邮箱地址',
      required: false,
    },
    website: {
      type: 'string',
      description: '个人网站',
      required: false,
    },
    github: {
      type: 'string',
      description: 'GitHub 用户名',
      required: false,
    },
    twitter: {
      type: 'string',
      description: 'Twitter 用户名',
      required: false,
    },
    linkedin: {
      type: 'string',
      description: 'LinkedIn 用户名',
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, ''),
    },
  },
}))

// 标签类型
export const Tag = defineDocumentType(() => ({
  name: 'Tag',
  filePathPattern: `tags/**/*.md`,
  contentType: 'markdown',
  fields: {
    name: {
      type: 'string',
      description: '标签名称',
      required: true,
    },
    slug: {
      type: 'string',
      description: '标签URL路径',
      required: true,
    },
    color: {
      type: 'string',
      description: '标签颜色',
      required: true,
    },
    description: {
      type: 'string',
      description: '标签描述',
      required: false,
    },
    featured: {
      type: 'boolean',
      description: '是否为精选标签',
      default: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, ''),
    },
  },
}))

// 分类类型
export const Category = defineDocumentType(() => ({
  name: 'Category',
  filePathPattern: `categories/**/*.md`,
  contentType: 'markdown',
  fields: {
    name: {
      type: 'string',
      description: '分类名称',
      required: true,
    },
    color: {
      type: 'string',
      description: '分类颜色',
      required: true,
    },
    description: {
      type: 'string',
      description: '分类描述',
      required: false,
    },
    order: {
      type: 'number',
      description: '排序权重',
      default: 0,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, ''),
    },
  },
}))

// 技术文章类型
export const Article = defineDocumentType(() => ({
  name: 'Article',
  filePathPattern: `articles/**/*.md`,
  contentType: 'markdown',
  fields: {
    title: {
      type: 'string',
      description: '文章标题',
      required: true,
    },
    excerpt: {
      type: 'string',
      description: '文章摘要',
      required: true,
    },
    publishedAt: {
      type: 'date',
      description: '发布日期',
      required: true,
    },
    updatedAt: {
      type: 'date',
      description: '更新日期',
      required: false,
    },
    author: {
      type: 'string',
      description: '作者 slug',
      required: true,
    },
    category: {
      type: 'string',
      description: '分类 slug',
      required: true,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: '标签 slugs',
      default: [],
    },
    featured: {
      type: 'boolean',
      description: '是否为精选文章',
      default: false,
    },
    published: {
      type: 'boolean',
      description: '是否已发布',
      default: true,
    },
    image: {
      type: 'string',
      description: '封面图片 URL',
      required: false,
    },
    seoTitle: {
      type: 'string',
      description: 'SEO 标题',
      required: false,
    },
    seoDescription: {
      type: 'string',
      description: 'SEO 描述',
      required: false,
    },
    seoKeywords: {
      type: 'list',
      of: { type: 'string' },
      description: 'SEO 关键词',
      required: false,
    },
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
    url: {
      type: 'string',
      resolve: (doc) => `/articles/${doc._raw.sourceFileName.replace(/\.md$/, '')}`,
    },
  },
}))

// 页面类型（关于页面等静态页面）
export const Page = defineDocumentType(() => ({
  name: 'Page',
  filePathPattern: `pages/**/*.md`,
  contentType: 'markdown',
  fields: {
    title: {
      type: 'string',
      description: '页面标题',
      required: true,
    },
    description: {
      type: 'string',
      description: '页面描述',
      required: false,
    },
    lastUpdated: {
      type: 'date',
      description: '最后更新时间',
      required: false,
    },
    layout: {
      type: 'enum',
      options: ['default', 'about', 'contact'],
      description: '页面布局类型',
      default: 'default',
    },
    seoTitle: {
      type: 'string',
      description: 'SEO 标题',
      required: false,
    },
    seoDescription: {
      type: 'string',
      description: 'SEO 描述',
      required: false,
    },
    seoKeywords: {
      type: 'list',
      of: { type: 'string' },
      description: 'SEO 关键词',
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/${doc._raw.sourceFileName.replace(/\.md$/, '')}`,
    },
  },
}))

// 项目类型
export const Project = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: `projects/**/*.md`,
  contentType: 'markdown',
  fields: {
    title: {
      type: 'string',
      description: '项目标题',
      required: true,
    },
    description: {
      type: 'string',
      description: '项目描述',
      required: true,
    },
    technologies: {
      type: 'list',
      of: { type: 'string' },
      description: '使用的技术栈',
      default: [],
    },
    githubUrl: {
      type: 'string',
      description: 'GitHub 仓库地址',
      required: false,
    },
    liveUrl: {
      type: 'string',
      description: '在线预览地址',
      required: false,
    },
    imageUrl: {
      type: 'string',
      description: '项目截图 URL',
      required: false,
    },
    featured: {
      type: 'boolean',
      description: '是否为精选项目',
      default: false,
    },
    startDate: {
      type: 'date',
      description: '项目开始时间',
      required: true,
    },
    endDate: {
      type: 'date',
      description: '项目结束时间',
      required: false,
    },
    status: {
      type: 'enum',
      options: ['planning', 'in-progress', 'completed', 'archived'],
      description: '项目状态',
      default: 'completed',
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/projects/${doc._raw.sourceFileName.replace(/\.md$/, '')}`,
    },
  },
}))

export default makeSource({
  contentDirPath: './content',
  documentTypes: [Author, Tag, Category, Article, Page, Project],
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})
