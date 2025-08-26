# 大模型应用开发学习笔记系统

## 功能概述

这是一个专为大模型应用开发学习而设计的笔记管理系统，支持：

- ✅ 每日学习笔记记录
- ✅ Markdown 格式支持
- ✅ 图片内容展示
- ✅ 标签分类管理
- ✅ 搜索和过滤功能
- ✅ 响应式设计
- ✅ 美观的UI界面

## 系统结构

```
src/app/learning-notes/
├── page.tsx                 # 学习笔记列表页面
├── [slug]/
│   └── page.tsx            # 笔记详情页面
└── new/
    └── page.tsx            # 创建新笔记页面

content/learning-notes/      # 笔记内容存储目录
├── 2024-08-26-getting-started.md
├── 2024-08-25-transformer-architecture.md
└── ...

public/images/learning-notes/ # 笔记图片存储目录
├── README.md
└── ...
```

## 使用方法

### 1. 访问学习笔记

- 主页导航：点击导航栏中的"学习笔记"
- 直接访问：`/learning-notes`

### 2. 查看笔记列表

学习笔记列表页面提供：
- 📊 统计信息（总笔记数、学习时长、标签数、图片数）
- 🔍 搜索功能（支持标题、内容、标签搜索）
- 🏷️ 标签过滤
- 📝 笔记卡片展示

### 3. 阅读笔记详情

点击笔记标题或"阅读笔记"按钮进入详情页面：
- 📖 完整的Markdown内容渲染
- 🖼️ 图片支持
- 🏷️ 标签展示
- 📅 日期和阅读时长信息
- 🔗 相关笔记推荐

### 4. 创建新笔记

点击"添加新的学习笔记"按钮进入创建页面：
- 📝 基本信息填写（标题、日期、标签等）
- ✍️ Markdown编辑器
- 👁️ 实时预览
- 💾 保存功能

## 笔记格式规范

### Markdown 前置元数据

```yaml
---
title: "笔记标题"
date: "YYYY-MM-DD"
summary: "笔记摘要"
tags: ["标签1", "标签2", "标签3"]
readingTime: 5
hasImages: true
slug: "YYYY-MM-DD-slug"
---
```

### 建议的笔记结构

```markdown
# 笔记标题

## 今日学习目标
- 目标1
- 目标2

## 学习内容

### 1. 主要概念
内容描述...

### 2. 代码实践
```python
# 代码示例
def example():
    pass
```

### 3. 重要图片
![图片描述](/images/learning-notes/image.png)

## 今日收获
1. **理论基础**：...
2. **实践能力**：...

## 明日计划
- [ ] 任务1
- [ ] 任务2

## 参考资料
- [链接1](url)
- [链接2](url)

---
**学习心得**：...
```

## 图片使用指南

### 1. 图片存储
- 路径：`public/images/learning-notes/`
- 命名：`YYYY-MM-DD-描述.png/jpg`

### 2. 图片引用
```markdown
![图片描述](/images/learning-notes/your-image.png)
```

### 3. 支持格式
- PNG, JPG/JPEG, GIF, WebP, SVG

## 标签管理

### 建议标签分类
- **技术类**：大模型、Transformer、LangChain、RAG等
- **难度类**：入门、进阶、高级
- **类型类**：理论、实践、项目
- **工具类**：Python、PyTorch、OpenAI等

### 标签使用技巧
- 每篇笔记建议3-5个标签
- 使用一致的标签命名
- 定期整理和合并相似标签

## 搜索功能

支持以下搜索方式：
- 📝 标题搜索
- 📄 内容搜索  
- 🏷️ 标签搜索
- 🔍 组合搜索

## 样式特性

### 响应式设计
- 📱 移动端适配
- 💻 桌面端优化
- 📊 自适应布局

### 视觉效果
- 🎨 渐变色彩
- ✨ 玻璃态效果
- 🌊 平滑动画
- 🎯 悬浮交互

### 代码高亮
- 🌙 深色代码块
- 🎨 语法高亮
- 📋 代码复制

## 扩展功能

### 未来可添加的功能
- [ ] 笔记导出（PDF、Word）
- [ ] 学习进度统计
- [ ] 笔记分享功能
- [ ] 评论和讨论
- [ ] 笔记版本管理
- [ ] 全文搜索优化
- [ ] 标签云展示
- [ ] 学习路径规划

## 技术栈

- **前端框架**：Next.js 15
- **样式方案**：Tailwind CSS
- **Markdown渲染**：react-markdown + remark-gfm
- **图标库**：Lucide React
- **字体**：LXGW WenKai Lite

## 开发说明

### 本地开发
```bash
npm run dev
```

### 构建部署
```bash
npm run build
npm start
```

### 添加新笔记
1. 在 `content/learning-notes/` 目录下创建新的 `.md` 文件
2. 按照格式规范填写前置元数据和内容
3. 如需图片，将图片放入 `public/images/learning-notes/` 目录

---

**开始你的大模型学习之旅吧！** 🚀