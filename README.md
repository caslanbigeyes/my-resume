# 🛠️ 工具集 - 100款实用小工具

一个基于 Next.js 14 + TypeScript 构建的在线工具集合，包含100个实用的小工具，所有功能均在浏览器端运行，无需服务器支持。

## ✨ 特性

- 🚀 **Next.js 14** - 使用最新的 App Router
- 💎 **TypeScript** - 完整的类型支持
- 🎨 **TailwindCSS** - 现代化的样式框架
- 📱 **响应式设计** - 完美适配移动端
- 🌙 **主题切换** - 支持浅色/深色模式
- 🔧 **100个工具** - 涵盖文本、颜色、图片、编码等多个分类
- 🏠 **本地运行** - 所有工具均在浏览器端运行，保护隐私

## 🛠️ 工具分类

### 📝 文本处理 (10个)
- 字数统计、大小写转换、Slug生成、Lorem Ipsum生成
- Markdown预览、JSON格式化、YAML转换、HTML提取
- 正则表达式测试、文本差异对比

### 🎨 颜色设计 (10个)
- 颜色选择器、HEX/RGB转换、调色板生成、对比度检测
- CSS渐变生成、阴影生成器、圆角预览、Favicon生成
- CSS Clamp计算、Tailwind速查表

### 🖼️ 图片多媒体 (10个)
- 图片压缩、尺寸调整、格式转换、图片裁剪
- EXIF查看器、SVG压缩、GIF拆分、视频剪辑
- 音频转换、SVG雪碧图生成

### ⏰ 日期时间 (10个)
- 时间戳转换、Cron解析、年龄计算、时间差计算
- 时区转换、周数计算、倒计时器、日期加减
- 工作日计算、日历生成器

### 🔢 数学单位 (10个)
- 单位换算、百分比计算、三角形求解、质数检测
- 二次方程求解、矩阵运算、汇率换算、罗马数字转换
- 进制转换、随机数生成

### 🔐 编码加密 (10个)
- Base64编码、URL编码、JWT解码、MD5哈希
- SHA256哈希、UUID生成、Bcrypt哈希、二维码生成
- 条形码生成、密码强度检测

### 🌐 Web开发 (10个)
- JSON转TS接口、HTTP状态码查询、User Agent解析
- MIME类型搜索、DNS查询、IP信息查询
- JWT生成器、UUID v5生成、正则速查表、JSON对比

### 🎲 随机生成 (10个)
- 占位图片、虚拟用户生成、随机颜色、名字生成器
- 名言生成器、密码生成器、UUID批量生成、骰子模拟器
- 抽奖器、写作灵感生成

### 📄 文件文档 (10个)
- CSV/JSON互转、Markdown目录生成、文本转PDF
- PDF合并拆分、Excel转JSON、ZIP解压
- 图片转PDF、文件校验和计算

### 📊 数据可视化 (10个)
- CSV预览器、JSON图表、Mermaid预览、GeoJSON地图
- Base64图片预览、HTML预览、表格排序筛选
- URL解析器、邮箱验证、信用卡验证

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
npm run start
```

## 📁 项目结构

```
src/
├── app/
│   ├── tools/                 # 工具页面
│   │   ├── page.tsx          # 工具集首页
│   │   ├── layout.tsx        # 工具页面布局
│   │   ├── word-count/       # 字数统计工具
│   │   ├── color-picker/     # 颜色选择器
│   │   └── ...               # 其他工具
│   ├── Components/           # 公共组件
│   └── globals.css          # 全局样式
├── components/
│   └── ToolLayout.tsx       # 工具页面通用布局
└── lib/                     # 工具函数
```

## 🎯 使用说明

1. **浏览工具**: 访问 `/tools` 查看所有可用工具
2. **搜索功能**: 使用搜索框快速找到需要的工具
3. **分类筛选**: 按分类浏览相关工具
4. **响应式**: 支持桌面端和移动端使用
5. **隐私保护**: 所有处理均在本地进行，不上传数据

## 🤝 贡献指南

欢迎贡献新的工具或改进现有功能！

### 添加新工具
1. 在 `src/app/tools/` 下创建新的工具目录
2. 创建 `page.tsx` 文件实现工具功能
3. 在 `src/app/tools/page.tsx` 中添加工具信息
4. 确保工具符合设计规范和用户体验标准

### 开发规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 添加适当的 JSDoc 注释
- 确保移动端兼容性
- 所有功能必须在浏览器端运行

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [Lucide React](https://lucide.dev/) - 图标库
- [Radix UI](https://www.radix-ui.com/) - UI 组件

---

**🛠️ 工具集** - 让工作更高效，让开发更简单！
