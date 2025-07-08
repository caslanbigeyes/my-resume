#!/bin/bash

# 服务器优化构建脚本
# 专门针对低内存服务器环境优化

echo "🚀 开始服务器优化构建..."

# 检查系统资源
echo "📊 系统资源检查:"
free -h
echo "磁盘空间:"
df -h /

# 设置严格的内存限制
export NODE_OPTIONS="--max-old-space-size=2048 --max-semi-space-size=128"

# 设置环境变量
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

echo "🧹 清理缓存和临时文件..."
# 清理所有缓存
rm -rf .next
rm -rf .contentlayer
rm -rf node_modules/.cache
rm -rf /tmp/next-*
rm -rf ~/.npm/_cacache

# 清理系统缓存（如果有权限）
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || echo "无法清理系统缓存（权限不足）"

echo "📝 第一步：构建 Contentlayer..."
timeout 300 npx contentlayer build

if [ $? -ne 0 ]; then
    echo "❌ Contentlayer 构建失败或超时"
    exit 1
fi

echo "✅ Contentlayer 构建完成"

# 等待一下让内存释放
sleep 5

echo "⚡ 第二步：构建 Next.js（优化模式）..."

# 使用更严格的内存限制构建 Next.js
timeout 600 node --max-old-space-size=2048 --max-semi-space-size=128 ./node_modules/.bin/next build

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ 构建成功完成！"
    
    # 显示构建结果
    echo "📊 构建统计:"
    du -sh .next 2>/dev/null || echo "无法获取构建大小"
    
    # 清理构建缓存
    rm -rf .next/cache 2>/dev/null
    
    echo "🎉 服务器构建完成！"
    
elif [ $BUILD_EXIT_CODE -eq 124 ]; then
    echo "❌ 构建超时（10分钟）"
    exit 1
else
    echo "❌ 构建失败，退出码: $BUILD_EXIT_CODE"
    
    # 尝试获取更多信息
    echo "💾 当前内存使用:"
    free -h
    
    echo "📁 磁盘使用:"
    df -h /
    
    exit 1
fi
