// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import readingTime from "reading-time";
var Author = defineDocumentType(() => ({
  name: "Author",
  filePathPattern: `authors/**/*.md`,
  contentType: "markdown",
  fields: {
    name: {
      type: "string",
      description: "\u4F5C\u8005\u59D3\u540D",
      required: true
    },
    avatar: {
      type: "string",
      description: "\u5934\u50CF URL",
      required: false
    },
    bio: {
      type: "string",
      description: "\u4E2A\u4EBA\u7B80\u4ECB",
      required: false
    },
    email: {
      type: "string",
      description: "\u90AE\u7BB1\u5730\u5740",
      required: false
    },
    website: {
      type: "string",
      description: "\u4E2A\u4EBA\u7F51\u7AD9",
      required: false
    },
    github: {
      type: "string",
      description: "GitHub \u7528\u6237\u540D",
      required: false
    },
    twitter: {
      type: "string",
      description: "Twitter \u7528\u6237\u540D",
      required: false
    },
    linkedin: {
      type: "string",
      description: "LinkedIn \u7528\u6237\u540D",
      required: false
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, "")
    }
  }
}));
var Tag = defineDocumentType(() => ({
  name: "Tag",
  filePathPattern: `tags/**/*.md`,
  contentType: "markdown",
  fields: {
    name: {
      type: "string",
      description: "\u6807\u7B7E\u540D\u79F0",
      required: true
    },
    slug: {
      type: "string",
      description: "\u6807\u7B7EURL\u8DEF\u5F84",
      required: true
    },
    color: {
      type: "string",
      description: "\u6807\u7B7E\u989C\u8272",
      required: true
    },
    description: {
      type: "string",
      description: "\u6807\u7B7E\u63CF\u8FF0",
      required: false
    },
    featured: {
      type: "boolean",
      description: "\u662F\u5426\u4E3A\u7CBE\u9009\u6807\u7B7E",
      default: false
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, "")
    }
  }
}));
var Category = defineDocumentType(() => ({
  name: "Category",
  filePathPattern: `categories/**/*.md`,
  contentType: "markdown",
  fields: {
    name: {
      type: "string",
      description: "\u5206\u7C7B\u540D\u79F0",
      required: true
    },
    color: {
      type: "string",
      description: "\u5206\u7C7B\u989C\u8272",
      required: true
    },
    description: {
      type: "string",
      description: "\u5206\u7C7B\u63CF\u8FF0",
      required: false
    },
    order: {
      type: "number",
      description: "\u6392\u5E8F\u6743\u91CD",
      default: 0
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, "")
    }
  }
}));
var Article = defineDocumentType(() => ({
  name: "Article",
  filePathPattern: `articles/**/*.md`,
  contentType: "markdown",
  fields: {
    title: {
      type: "string",
      description: "\u6587\u7AE0\u6807\u9898",
      required: true
    },
    excerpt: {
      type: "string",
      description: "\u6587\u7AE0\u6458\u8981",
      required: true
    },
    publishedAt: {
      type: "date",
      description: "\u53D1\u5E03\u65E5\u671F",
      required: true
    },
    updatedAt: {
      type: "date",
      description: "\u66F4\u65B0\u65E5\u671F",
      required: false
    },
    author: {
      type: "string",
      description: "\u4F5C\u8005 slug",
      required: true
    },
    category: {
      type: "string",
      description: "\u5206\u7C7B slug",
      required: true
    },
    tags: {
      type: "list",
      of: { type: "string" },
      description: "\u6807\u7B7E slugs",
      default: []
    },
    featured: {
      type: "boolean",
      description: "\u662F\u5426\u4E3A\u7CBE\u9009\u6587\u7AE0",
      default: false
    },
    published: {
      type: "boolean",
      description: "\u662F\u5426\u5DF2\u53D1\u5E03",
      default: true
    },
    image: {
      type: "string",
      description: "\u5C01\u9762\u56FE\u7247 URL",
      required: false
    },
    seoTitle: {
      type: "string",
      description: "SEO \u6807\u9898",
      required: false
    },
    seoDescription: {
      type: "string",
      description: "SEO \u63CF\u8FF0",
      required: false
    },
    seoKeywords: {
      type: "list",
      of: { type: "string" },
      description: "SEO \u5173\u952E\u8BCD",
      required: false
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, "")
    },
    readingTime: {
      type: "json",
      resolve: (doc) => readingTime(doc.body.raw)
    },
    url: {
      type: "string",
      resolve: (doc) => `/articles/${doc._raw.sourceFileName.replace(/\.md$/, "")}`
    }
  }
}));
var Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `pages/**/*.md`,
  contentType: "markdown",
  fields: {
    title: {
      type: "string",
      description: "\u9875\u9762\u6807\u9898",
      required: true
    },
    description: {
      type: "string",
      description: "\u9875\u9762\u63CF\u8FF0",
      required: false
    },
    lastUpdated: {
      type: "date",
      description: "\u6700\u540E\u66F4\u65B0\u65F6\u95F4",
      required: false
    },
    layout: {
      type: "enum",
      options: ["default", "about", "contact"],
      description: "\u9875\u9762\u5E03\u5C40\u7C7B\u578B",
      default: "default"
    },
    seoTitle: {
      type: "string",
      description: "SEO \u6807\u9898",
      required: false
    },
    seoDescription: {
      type: "string",
      description: "SEO \u63CF\u8FF0",
      required: false
    },
    seoKeywords: {
      type: "list",
      of: { type: "string" },
      description: "SEO \u5173\u952E\u8BCD",
      required: false
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, "")
    },
    url: {
      type: "string",
      resolve: (doc) => `/${doc._raw.sourceFileName.replace(/\.md$/, "")}`
    }
  }
}));
var Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: `projects/**/*.md`,
  contentType: "markdown",
  fields: {
    title: {
      type: "string",
      description: "\u9879\u76EE\u6807\u9898",
      required: true
    },
    description: {
      type: "string",
      description: "\u9879\u76EE\u63CF\u8FF0",
      required: true
    },
    technologies: {
      type: "list",
      of: { type: "string" },
      description: "\u4F7F\u7528\u7684\u6280\u672F\u6808",
      default: []
    },
    githubUrl: {
      type: "string",
      description: "GitHub \u4ED3\u5E93\u5730\u5740",
      required: false
    },
    liveUrl: {
      type: "string",
      description: "\u5728\u7EBF\u9884\u89C8\u5730\u5740",
      required: false
    },
    imageUrl: {
      type: "string",
      description: "\u9879\u76EE\u622A\u56FE URL",
      required: false
    },
    featured: {
      type: "boolean",
      description: "\u662F\u5426\u4E3A\u7CBE\u9009\u9879\u76EE",
      default: false
    },
    startDate: {
      type: "date",
      description: "\u9879\u76EE\u5F00\u59CB\u65F6\u95F4",
      required: true
    },
    endDate: {
      type: "date",
      description: "\u9879\u76EE\u7ED3\u675F\u65F6\u95F4",
      required: false
    },
    status: {
      type: "enum",
      options: ["planning", "in-progress", "completed", "archived"],
      description: "\u9879\u76EE\u72B6\u6001",
      default: "completed"
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.md$/, "")
    },
    url: {
      type: "string",
      resolve: (doc) => `/projects/${doc._raw.sourceFileName.replace(/\.md$/, "")}`
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "./content",
  documentTypes: [Author, Tag, Category, Article, Page, Project],
  markdown: {
    remarkPlugins: [],
    rehypePlugins: []
  }
});
export {
  Article,
  Author,
  Category,
  Page,
  Project,
  Tag,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-4BDH3FTF.mjs.map
