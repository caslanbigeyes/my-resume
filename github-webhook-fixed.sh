#!/bin/bash

# 修复后的GitHub Webhook脚本
# 不再尝试从GitHub拉取代码，而是基于已有代码进行重新构建和部署

set -e

# 配置
PROJECT_DIR="/root/my-resume"
LOG_FILE="/root/webhook-deploy.log"
NODE_ENV="production"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Webhook触发的部署开始 ==="

# 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    log "错误: 项目目录 $PROJECT_DIR 不存在"
    log "请先使用推送部署方式将代码上传到服务器"
    exit 1
fi

cd "$PROJECT_DIR"

# 检查是否是有效的Node.js项目
if [ ! -f "package.json" ]; then
    log "错误: $PROJECT_DIR 不是有效的Node.js项目"
    exit 1
fi

log "项目目录: $PROJECT_DIR"

# 安装依赖（如果需要）
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    log "安装/更新依赖..."
    npm install --production=false
    if [ $? -ne 0 ]; then
        log "错误: npm install 失败"
        exit 1
    fi
else
    log "依赖已是最新，跳过安装"
fi

# 构建项目
log "构建项目..."
npm run build
if [ $? -ne 0 ]; then
    log "错误: 项目构建失败"
    exit 1
fi

# 停止现有的应用进程
log "停止现有应用..."
pkill -f "next start" || log "没有找到运行中的应用进程"
pm2 stop my-resume || log "PM2中没有找到my-resume进程"

# 启动应用
log "启动应用..."
if command -v pm2 >/dev/null 2>&1; then
    # 使用PM2启动
    pm2 start npm --name "my-resume" -- start
    pm2 save
    log "应用已通过PM2启动"
else
    # 直接启动
    nohup npm start > /root/app.log 2>&1 &
    log "应用已直接启动"
fi

# 等待应用启动
sleep 5

# 检查应用是否正常运行
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    log "✅ 应用部署成功，运行在端口3000"
else
    log "⚠️  应用可能启动失败，请检查日志"
fi

log "=== Webhook部署完成 ==="

# 清理旧的日志文件（保留最近100行）
tail -n 100 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"