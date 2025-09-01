#!/bin/bash

# post-deploy.sh - 服务器端部署脚本
# 此脚本应在服务器的/root目录下执行

set -e

PROJECT_DIR="/root/my-resume"
LOG_FILE="/root/deploy.log"

function log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "开始执行部署后处理..."

# 进入项目目录
cd "$PROJECT_DIR"

# 清理node_modules目录
log "清理node_modules目录..."
rm -rf node_modules

# 安装依赖（使用--legacy-peer-deps解决依赖冲突，--omit=dev跳过开发依赖）
log "安装项目依赖..."
npm install --legacy-peer-deps --omit=dev

# 单独安装contentlayer和next-contentlayer
log "安装contentlayer和next-contentlayer..."
npm install contentlayer next-contentlayer --legacy-peer-deps

# 构建项目
log "构建项目..."
npm run build

# 检查PM2是否安装
if ! command -v pm2 >/dev/null 2>&1; then
    log "安装PM2..."
    npm install -g pm2
fi

# 停止旧的应用实例（如果存在）
log "停止旧的应用实例..."
pm2 stop my-resume || true
pm2 delete my-resume || true

# 启动新应用实例
log "启动新应用实例..."
pm2 start npm --name "my-resume" -- run start

# 保存PM2进程列表
pm2 save

log "部署完成！应用已在PM2管理下运行。"

# 显示应用状态
pm2 list