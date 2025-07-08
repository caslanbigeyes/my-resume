#!/bin/bash

# 服务器部署脚本
# 自动化部署到服务器的完整流程

SERVER_HOST="iZuf664tvw36i3rr6rfgcyZ"
SERVER_USER="root"
SERVER_PATH="/var/www/my-resume"

echo "🚀 开始部署到服务器..."

# 1. 上传构建脚本到服务器
echo "📤 上传构建脚本..."
scp scripts/server-build.sh scripts/low-memory-build.sh next.config.server.js ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 2. 在服务器上执行构建
echo "🔨 在服务器上执行构建..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /var/www/my-resume

# 给脚本执行权限
chmod +x scripts/server-build.sh scripts/low-memory-build.sh

# 检查内存情况
echo "📊 服务器资源状态:"
free -h
df -h /

# 备份原配置
if [ -f "next.config.js" ]; then
    cp next.config.js next.config.backup.js
fi

# 使用服务器优化配置
cp next.config.server.js next.config.js

# 尝试标准构建
echo "🔄 尝试标准优化构建..."
if ./scripts/server-build.sh; then
    echo "✅ 标准构建成功"
else
    echo "⚠️  标准构建失败，尝试极限模式..."
    
    # 如果标准构建失败，尝试极限模式
    if ./scripts/low-memory-build.sh; then
        echo "✅ 极限模式构建成功"
    else
        echo "❌ 所有构建方式都失败了"
        
        # 恢复原配置
        if [ -f "next.config.backup.js" ]; then
            mv next.config.backup.js next.config.js
        fi
        
        exit 1
    fi
fi

# 构建成功后的清理
echo "🧹 构建后清理..."
rm -rf node_modules/.cache
rm -rf .next/cache
find .next -name "*.map" -delete 2>/dev/null || true

# 恢复原配置
if [ -f "next.config.backup.js" ]; then
    mv next.config.backup.js next.config.js
fi

echo "📊 最终状态:"
free -h
du -sh .next
ls -la .next/

echo "🎉 服务器构建完成！"
ENDSSH

if [ $? -eq 0 ]; then
    echo "✅ 服务器部署成功！"
else
    echo "❌ 服务器部署失败"
    exit 1
fi
