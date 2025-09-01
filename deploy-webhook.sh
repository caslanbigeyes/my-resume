#!/bin/bash

# 部署Webhook服务到阿里云服务器
# 使用方法: ./deploy-webhook.sh

set -e

SERVER="47.116.219.238"
USER="root"
PASSWORD="li%@!1314"
REMOTE_DIR="/root/my-resume"

function log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 开始部署Webhook服务到阿里云服务器..."

# 检查必要文件是否存在
if [ ! -f "webhook-server.js" ]; then
    log "❌ 错误: webhook-server.js 文件不存在"
    exit 1
fi

if [ ! -f "start-webhook.sh" ]; then
    log "❌ 错误: start-webhook.sh 文件不存在"
    exit 1
fi

# 检查sshpass是否安装
if ! command -v sshpass >/dev/null 2>&1; then
    log "❌ 错误: sshpass 未安装"
    log "请安装sshpass: brew install sshpass (macOS) 或 apt-get install sshpass (Ubuntu)"
    exit 1
fi

log "📤 上传webhook文件到服务器..."

# 上传webhook服务器文件
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
    webhook-server.js "$USER@$SERVER:$REMOTE_DIR/"

# 上传启动脚本
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
    start-webhook.sh "$USER@$SERVER:$REMOTE_DIR/"

log "✅ 文件上传完成"

log "🔧 在服务器上配置webhook服务..."

# 在服务器上执行配置
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'EOF'
    cd /root/my-resume
    
    # 给启动脚本执行权限
    chmod +x start-webhook.sh
    
    # 启动webhook服务
    ./start-webhook.sh
EOF

if [ $? -eq 0 ]; then
    log "✅ Webhook服务部署成功！"
    log ""
    log "🌐 服务访问地址:"
    log "  状态检查: http://47.116.219.238:3001/status"
    log "  查看日志: http://47.116.219.238:3001/logs"
    log "  帮助信息: http://47.116.219.238:3001/"
    log ""
    log "🔗 GitHub Webhook配置:"
    log "  Payload URL: http://47.116.219.238:3001/webhook"
    log "  Content type: application/json"
    log "  Events: Just the push event"
    log ""
    log "🧪 测试webhook服务:"
    echo "curl http://47.116.219.238:3001/status"
    echo "curl -X POST http://47.116.219.238:3001/deploy"
    log ""
    log "📋 下一步操作:"
    log "1. 在GitHub仓库设置中添加webhook"
    log "2. 使用上面的Payload URL"
    log "3. 推送代码测试自动部署"
else
    log "❌ Webhook服务部署失败"
    exit 1
fi