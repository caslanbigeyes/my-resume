#!/bin/bash

# 启动Webhook服务器脚本
# 使用方法: ./start-webhook.sh

set -e

WEBHOOK_SERVER="webhook-server.js"
PM2_NAME="webhook-server"
PROJECT_DIR="/root/my-resume"

function log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 启动Webhook服务器..."

# 检查是否在正确的目录
if [ ! -f "$WEBHOOK_SERVER" ]; then
    log "❌ 错误: 找不到 $WEBHOOK_SERVER 文件"
    log "请确保在项目根目录运行此脚本"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node >/dev/null 2>&1; then
    log "❌ 错误: Node.js 未安装"
    exit 1
fi

# 检查PM2是否安装
if ! command -v pm2 >/dev/null 2>&1; then
    log "⚠️  警告: PM2 未安装，将直接运行Node.js"
    USE_PM2=false
else
    USE_PM2=true
fi

# 停止现有的webhook服务
if [ "$USE_PM2" = true ]; then
    log "🛑 停止现有的webhook服务..."
    pm2 stop "$PM2_NAME" 2>/dev/null || log "没有找到运行中的webhook服务"
    pm2 delete "$PM2_NAME" 2>/dev/null || true
else
    log "🛑 停止现有的webhook进程..."
    pkill -f "node.*webhook-server.js" || log "没有找到运行中的webhook进程"
fi

# 等待端口释放
sleep 2

# 检查端口3001是否被占用
if netstat -tlnp 2>/dev/null | grep -q ":3001 "; then
    log "⚠️  警告: 端口3001仍被占用，尝试强制终止..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 启动webhook服务
if [ "$USE_PM2" = true ]; then
    log "🚀 使用PM2启动webhook服务..."
    pm2 start "$WEBHOOK_SERVER" --name "$PM2_NAME" --log-date-format="YYYY-MM-DD HH:mm:ss"
    pm2 save
    log "✅ Webhook服务已通过PM2启动"
    
    # 显示PM2状态
    pm2 list
else
    log "🚀 直接启动webhook服务..."
    nohup node "$WEBHOOK_SERVER" > /root/webhook-server.log 2>&1 &
    WEBHOOK_PID=$!
    log "✅ Webhook服务已启动，PID: $WEBHOOK_PID"
fi

# 等待服务启动
log "⏳ 等待服务启动..."
sleep 3

# 检查服务是否正常运行
if curl -f http://localhost:3001/status >/dev/null 2>&1; then
    log "✅ Webhook服务启动成功！"
    log "🌐 访问地址: http://47.116.219.238:3001"
    log "📊 状态检查: http://47.116.219.238:3001/status"
    log "📝 查看日志: http://47.116.219.238:3001/logs"
    log ""
    log "🔗 GitHub Webhook URL: http://47.116.219.238:3001/webhook"
    log ""
    log "📋 可用端点:"
    log "  POST /webhook - GitHub webhook处理"
    log "  POST /deploy - 手动部署触发"
    log "  GET /status - 状态检查"
    log "  GET /logs - 查看部署日志"
    log "  GET / - 帮助信息"
else
    log "❌ Webhook服务启动失败"
    log "请检查日志文件: /root/webhook-server.log"
    exit 1
fi

log "🎉 Webhook服务配置完成！"