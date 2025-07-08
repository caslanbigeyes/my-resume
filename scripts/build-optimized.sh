#!/bin/bash

# 优化构建脚本
# 减少内存使用，增加稳定性

echo "🚀 开始优化构建..."

# 设置 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 清理缓存
echo "🧹 清理缓存..."
rm -rf .next
rm -rf .contentlayer
rm -rf node_modules/.cache

# 分步构建
echo "📝 构建 Contentlayer..."
npx contentlayer build

if [ $? -ne 0 ]; then
    echo "❌ Contentlayer 构建失败"
    exit 1
fi

echo "⚡ 构建 Next.js..."
npx next build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功完成！"
else
    echo "❌ Next.js 构建失败"
    exit 1
fi
