#!/bin/bash

# 部署脚本 - 将本地代码推送到阿里云服务器
# 使用方法: ./deploy-to-server-fixed.sh

set -e

SERVER="47.116.219.238"
USER="root"
PASSWORD="li%@!1314"
REMOTE_DIR="/root/my-resume"
LOCAL_DIR="."

function log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "开始部署到阿里云服务器..."

# 检查本地目录
if [ ! -f "package.json" ]; then
    log "错误: 当前目录不是一个有效的Node.js项目"
    exit 1
fi

# 创建临时排除文件
EXCLUDE_FILE=$(mktemp)
cat > "$EXCLUDE_FILE" << 'EOF'
node_modules/
.next/
.git/
*.log
.env.local
.env.development.local
.env.test.local
.env.production.local
dist/
build/
coverage/
.nyc_output/
.DS_Store
Thumbs.db
*.swp
*.swo
*~
EOF

log "同步代码到服务器..."

# 检查服务器上是否安装了rsync
if sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "which rsync" >/dev/null 2>&1; then
    # 使用rsync同步代码
    sshpass -p "$PASSWORD" rsync -avz --delete --exclude-from="$EXCLUDE_FILE" \
        -e "ssh -o StrictHostKeyChecking=no" \
        "$LOCAL_DIR/" "$USER@$SERVER:$REMOTE_DIR/"
else
    log "警告: 服务器上未安装rsync，使用tar和scp替代"
    
    # 在本地创建压缩包
    TEMP_TAR=$(mktemp -u).tar.gz
    tar --exclude-from="$EXCLUDE_FILE" -czf "$TEMP_TAR" -C "$LOCAL_DIR" .
    
    # 上传压缩包到服务器
    sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no "$TEMP_TAR" "$USER@$SERVER:/tmp/my-resume.tar.gz"
    
    # 在服务器上解压
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" \
        "mkdir -p $REMOTE_DIR && tar -xzf /tmp/my-resume.tar.gz -C $REMOTE_DIR && rm -f /tmp/my-resume.tar.gz"
    
    # 清理本地临时文件
    rm -f "$TEMP_TAR"
fi

# 清理临时文件
rm -f "$EXCLUDE_FILE"

log "代码同步完成，开始远程部署..."

# 执行远程部署脚本
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" \
    "cd /root && ./post-deploy.sh"

log "部署完成！"

# 触发webhook（可选）
log "触发webhook通知..."
curl -X POST "http://$SERVER:9000/deploy" \
    -H "Content-Type: application/json" \
    -d '{"manual": true}' || log "webhook触发失败，但部署已完成"

log "所有操作完成！访问 http://$SERVER:3000 查看应用"