#!/bin/bash

# 超低内存服务器构建脚本
# 适用于 1GB 或更少内存的服务器

echo "🔥 超低内存模式构建..."

# 检查可用内存
AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
echo "可用内存: ${AVAILABLE_MEM}MB"

if [ "$AVAILABLE_MEM" -lt 500 ]; then
    echo "⚠️  警告：可用内存不足500MB，构建可能失败"
fi

# 极限内存设置
export NODE_OPTIONS="--max-old-space-size=1024 --max-semi-space-size=64 --optimize-for-size"
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# 禁用一些 Next.js 功能以节省内存
export NEXT_PRIVATE_STANDALONE=true

echo "🧹 激进清理..."
# 停止可能占用内存的服务
pkill -f node 2>/dev/null || true
sleep 2

# 清理所有可能的缓存
rm -rf .next .contentlayer node_modules/.cache ~/.npm/_cacache /tmp/next-* /tmp/npm-*
find /tmp -name "*next*" -type d -exec rm -rf {} + 2>/dev/null || true

# 强制垃圾回收
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true

echo "📝 分步构建 Contentlayer..."
# 使用更小的内存限制
timeout 180 node --max-old-space-size=512 ./node_modules/.bin/contentlayer build

if [ $? -ne 0 ]; then
    echo "❌ Contentlayer 构建失败"
    echo "尝试手动清理后重试..."
    rm -rf .contentlayer
    sleep 5
    timeout 180 node --max-old-space-size=512 ./node_modules/.bin/contentlayer build
    
    if [ $? -ne 0 ]; then
        echo "❌ Contentlayer 构建仍然失败"
        exit 1
    fi
fi

echo "✅ Contentlayer 完成，等待内存释放..."
sleep 10

# 再次清理
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true

echo "⚡ 构建 Next.js（极限模式）..."

# 创建临时的 Next.js 配置以减少内存使用
cat > next.config.temp.js << 'EOF'
const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
    turbo: false, // 禁用 Turbo 以节省内存
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 减少并发构建
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      }
    }
    return config
  },
  // 禁用一些功能以节省内存
  swcMinify: false,
  images: {
    unoptimized: true,
  },
}

module.exports = withContentlayer(nextConfig)
EOF

# 备份原配置
if [ -f "next.config.js" ]; then
    mv next.config.js next.config.backup.js
fi
mv next.config.temp.js next.config.js

# 使用极限内存设置构建
timeout 900 node --max-old-space-size=1024 --max-semi-space-size=64 ./node_modules/.bin/next build

BUILD_EXIT_CODE=$?

# 恢复原配置
if [ -f "next.config.backup.js" ]; then
    mv next.config.backup.js next.config.js
else
    rm -f next.config.js
fi

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ 极限模式构建成功！"
    
    # 清理构建缓存以节省空间
    rm -rf .next/cache
    rm -rf .next/static/chunks/*.map 2>/dev/null || true
    
    echo "📊 最终状态:"
    free -h
    du -sh .next 2>/dev/null || echo "无法获取构建大小"
    
elif [ $BUILD_EXIT_CODE -eq 124 ]; then
    echo "❌ 构建超时（15分钟）"
    exit 1
else
    echo "❌ 构建失败"
    echo "💾 内存状态:"
    free -h
    echo "📁 磁盘状态:"
    df -h /
    exit 1
fi
