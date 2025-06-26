---
title: "GitHub Webhook 实现服务器自动化部署"
excerpt: "详细介绍如何使用 GitHub Webhook 实现代码推送后的自动化部署，包括服务器配置、脚本编写和 PM2 进程管理。"
publishedAt: "2024-02-01"
author: "li-lingfeng"
category: "devops"
tags: ["webhook", "deployment", "github", "pm2", "automation"]
featured: true
published: true
image: "/images/articles/webhook-deploy.jpg"
seoTitle: "GitHub Webhook 自动化部署完全指南 - 从配置到实践"
seoDescription: "学习如何配置 GitHub Webhook 实现自动化部署，包括服务器设置、安全配置和故障排除"
seoKeywords: ["GitHub Webhook", "自动化部署", "CI/CD", "服务器部署", "PM2"]
---

# GitHub Webhook 实现服务器自动化部署

## 概述

自动化部署是现代软件开发中的重要环节，通过 GitHub Webhook 可以实现代码推送后的自动部署，大大提高开发效率。本文将详细介绍如何从零开始配置一个完整的自动化部署系统。

## 部署架构

```
GitHub Repository → Webhook → 服务器接收 → 执行部署脚本 → 重启应用
```

## 第一步：服务器准备

### 1. 购买和配置服务器

#### 服务器选择
- **推荐配置**: 2核4G内存，40G硬盘（适合中小型项目）
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 7+
- **云服务商**: 阿里云、腾讯云、AWS、DigitalOcean 等

#### 基础环境安装
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js (使用 NodeSource 仓库)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Git
sudo apt install git -y

# 安装 PM2 (进程管理器)
sudo npm install -g pm2

# 安装 Nginx (可选，用于反向代理)
sudo apt install nginx -y
```

### 2. 域名配置

#### DNS 解析设置
```bash
# A 记录配置示例
Type: A
Name: @
Value: 你的服务器IP地址
TTL: 600

# 子域名配置 (可选)
Type: A
Name: api
Value: 你的服务器IP地址
TTL: 600
```

#### SSL 证书配置 (推荐使用 Let's Encrypt)
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. 安全组配置

#### 开放必要端口
```bash
# 开放 SSH (22)
sudo ufw allow 22

# 开放 HTTP (80) 和 HTTPS (443)
sudo ufw allow 80
sudo ufw allow 443

# 开放 Webhook 端口 (3001)
sudo ufw allow 3001

# 开放应用端口 (3000)
sudo ufw allow 3000

# 启用防火墙
sudo ufw enable
```

#### 云服务商安全组设置
在云服务商控制台中配置安全组规则：
- 入方向：开放 22, 80, 443, 3000, 3001 端口
- 出方向：允许所有流量

## 第二步：GitHub Webhook 配置

### 1. 创建部署脚本

#### 创建脚本目录
```bash
# 创建 hooks 目录
sudo mkdir -p /var/www/hooks
sudo chown $USER:$USER /var/www/hooks

# 创建项目目录
sudo mkdir -p /var/www/my-resume
sudo chown $USER:$USER /var/www/my-resume
```

#### 部署脚本 (`/var/www/hooks/github-webhook.sh`)
```bash
#!/bin/bash

# 设置错误时退出
set -e

# 日志文件
LOG_FILE="/var/www/hooks/deploy.log"
PROJECT_DIR="/var/www/my-resume"

# 记录日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "=== 开始部署 ==="

# 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    log "项目目录不存在，正在克隆仓库..."
    git clone https://github.com/your-username/my-resume.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
else
    cd "$PROJECT_DIR" || { log "进入项目目录失败"; exit 1; }
fi

log "拉取最新代码..."
git fetch || { log "git fetch 失败"; exit 1; }
git reset --hard origin/main || { log "git reset 失败"; exit 1; }
git pull origin main || { log "git pull 失败"; exit 1; }

log "安装依赖..."
npm install --legacy-peer-deps || { log "npm install 失败"; exit 1; }

log "构建项目..."
npm run build || { log "npm run build 失败"; exit 1; }

log "重启 PM2 服务..."
pm2 restart my-resume || {
    log "PM2 重启失败，尝试启动新实例..."
    pm2 start npm --name my-resume -- run start
}

log "清理旧的构建文件..."
find "$PROJECT_DIR" -name "node_modules" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

log "=== 部署完成 ==="
```

#### 设置脚本权限
```bash
chmod +x /var/www/hooks/github-webhook.sh
```
### 2. Webhook 服务器

#### 创建 Webhook 服务 (`/var/www/hooks/webhook.js`)
```javascript
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const LOG_FILE = '/var/www/hooks/webhook.log';

// 中间件
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 日志函数
const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(LOG_FILE, logMessage);
};

// 验证 GitHub Webhook 签名
const verifySignature = (payload, signature) => {
    if (!signature) return false;

    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest)
    );
};

// Webhook 端点
app.post('/webhook', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);

    // 验证签名（生产环境必须）
    if (SECRET && !verifySignature(payload, signature)) {
        log('❌ 签名验证失败');
        return res.status(401).send('Unauthorized');
    }

    // 检查是否是 push 事件到 main 分支
    if (req.body.ref !== 'refs/heads/main') {
        log(`ℹ️ 忽略非 main 分支的推送: ${req.body.ref}`);
        return res.status(200).send('Ignored: Not main branch');
    }

    log('🚀 收到 GitHub Webhook，开始部署...');

    // 执行部署脚本
    const deployScript = '/var/www/hooks/github-webhook.sh';
    const child = exec(`bash ${deployScript}`, {
        cwd: '/var/www/hooks',
        timeout: 300000 // 5分钟超时
    });

    let output = '';

    child.stdout.on('data', (data) => {
        output += data;
        log(`📝 ${data.trim()}`);
    });

    child.stderr.on('data', (data) => {
        output += data;
        log(`⚠️ ${data.trim()}`);
    });

    child.on('close', (code) => {
        if (code === 0) {
            log('✅ 部署成功完成');
            res.status(200).send('Deployment successful');
        } else {
            log(`❌ 部署失败，退出码: ${code}`);
            res.status(500).send('Deployment failed');
        }
    });

    child.on('error', (error) => {
        log(`❌ 执行脚本时出错: ${error.message}`);
        res.status(500).send('Script execution error');
    });
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 查看部署日志端点（可选）
app.get('/logs', (req, res) => {
    try {
        const logs = fs.readFileSync(LOG_FILE, 'utf8');
        res.type('text/plain').send(logs);
    } catch (error) {
        res.status(404).send('Log file not found');
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    log(`❌ 服务器错误: ${error.message}`);
    res.status(500).send('Internal Server Error');
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    log(`🌐 Webhook 服务器运行在端口 ${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    log('📴 收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('📴 收到 SIGINT 信号，正在关闭服务器...');
    process.exit(0);
});
```

#### 安装依赖
```bash
cd /var/www/hooks
npm init -y
npm install express
```


### 3. GitHub 仓库配置

#### 在 GitHub 中设置 Webhook
1. 进入你的 GitHub 仓库
2. 点击 `Settings` → `Webhooks` → `Add webhook`
3. 配置 Webhook：
   ```
   Payload URL: http://your-domain.com:3001/webhook
   Content type: application/json
   Secret: your-webhook-secret (与服务器中的 SECRET 一致)
   Events: Just the push event
   Active: ✓
   ```

#### 生成访问令牌（如果是私有仓库）
```bash
# 在服务器上配置 Git 凭据
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# 使用 Personal Access Token
git config --global credential.helper store
echo "https://username:token@github.com" > ~/.git-credentials
```

## 第三步：启动服务

### 1. 启动 Webhook 服务
```bash
cd /var/www/hooks

# 设置环境变量
export WEBHOOK_SECRET="your-webhook-secret"
export PORT=3001

# 使用 PM2 启动 Webhook 服务
pm2 start webhook.js --name webhook --env production

# 查看服务状态
pm2 status
pm2 logs webhook
```

### 2. 启动 Next.js 应用

#### 首次部署
```bash
# 克隆项目（如果还没有）
cd /var/www
git clone https://github.com/your-username/my-resume.git

# 进入项目目录
cd my-resume

# 安装依赖
npm install --legacy-peer-deps

# 构建项目
npm run build

# 使用 PM2 启动应用
pm2 start npm --name my-resume -- run start

# 设置开机自启
pm2 startup
pm2 save
```

#### PM2 配置文件（推荐）
创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [
    {
      name: 'my-resume',
      script: 'npm',
      args: 'run start',
      cwd: '/var/www/my-resume',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/logs/my-resume-error.log',
      out_file: '/var/www/logs/my-resume-out.log',
      log_file: '/var/www/logs/my-resume.log'
    },
    {
      name: 'webhook',
      script: '/var/www/hooks/webhook.js',
      cwd: '/var/www/hooks',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        WEBHOOK_SECRET: 'your-webhook-secret'
      },
      error_file: '/var/www/logs/webhook-error.log',
      out_file: '/var/www/logs/webhook-out.log',
      log_file: '/var/www/logs/webhook.log'
    }
  ]
};
```

使用配置文件启动：
```bash
# 创建日志目录
sudo mkdir -p /var/www/logs
sudo chown $USER:$USER /var/www/logs

# 启动所有服务
pm2 start ecosystem.config.js

# 保存配置
pm2 save
```

## 第四步：Nginx 反向代理配置（推荐）

### Nginx 配置文件
创建 `/etc/nginx/sites-available/my-resume`：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 主应用代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook 代理
    location /webhook {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 限制访问（可选）
        # allow 140.82.112.0/20;  # GitHub IP 范围
        # deny all;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
```

### 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/my-resume /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 第五步：监控和日志

### 1. 日志管理
```bash
# 查看应用日志
pm2 logs my-resume

# 查看 Webhook 日志
pm2 logs webhook

# 查看部署日志
tail -f /var/www/hooks/deploy.log

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 监控脚本
创建 `/var/www/hooks/monitor.sh`：
```bash
#!/bin/bash

# 检查服务状态
check_service() {
    local service_name=$1
    local port=$2

    if pm2 list | grep -q "$service_name.*online"; then
        echo "✅ $service_name 运行正常"
    else
        echo "❌ $service_name 未运行，正在重启..."
        pm2 restart "$service_name"
    fi

    if netstat -tuln | grep -q ":$port "; then
        echo "✅ 端口 $port 正常监听"
    else
        echo "❌ 端口 $port 未监听"
    fi
}

echo "=== 服务监控报告 $(date) ==="
check_service "my-resume" 3000
check_service "webhook" 3001

# 检查磁盘空间
df -h | grep -E "(/$|/var)" | awk '{print "💾 磁盘使用: " $5 " (" $1 ")"}'

# 检查内存使用
free -h | grep Mem | awk '{print "🧠 内存使用: " $3 "/" $2}'

echo "=========================="
```

设置定时监控：
```bash
chmod +x /var/www/hooks/monitor.sh

# 添加到 crontab
crontab -e
# 添加以下行（每5分钟检查一次）
*/5 * * * * /var/www/hooks/monitor.sh >> /var/www/logs/monitor.log 2>&1
```

## 故障排除

### 常见问题及解决方案

#### 1. Webhook 未触发
```bash
# 检查 Webhook 服务状态
pm2 status webhook
pm2 logs webhook

# 检查端口是否开放
sudo ufw status
netstat -tuln | grep 3001

# 测试 Webhook 端点
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

#### 2. 部署脚本失败
```bash
# 手动执行部署脚本
bash /var/www/hooks/github-webhook.sh

# 检查权限
ls -la /var/www/hooks/github-webhook.sh
chmod +x /var/www/hooks/github-webhook.sh

# 检查 Git 配置
cd /var/www/my-resume
git status
git remote -v
```

#### 3. 应用无法启动
```bash
# 检查应用日志
pm2 logs my-resume

# 手动启动测试
cd /var/www/my-resume
npm run build
npm run start

# 检查端口占用
netstat -tuln | grep 3000
lsof -i :3000
```

#### 4. 内存不足
```bash
# 检查内存使用
free -h
pm2 monit

# 重启应用释放内存
pm2 restart all

# 增加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 调试技巧

#### 1. 启用详细日志
```javascript
// 在 webhook.js 中添加更多日志
app.use((req, res, next) => {
    log(`📥 ${req.method} ${req.path} - ${req.ip}`);
    next();
});
```

#### 2. 测试部署流程
```bash
# 创建测试脚本
cat > /var/www/hooks/test-deploy.sh << 'EOF'
#!/bin/bash
echo "测试开始: $(date)"
echo "当前用户: $(whoami)"
echo "当前目录: $(pwd)"
echo "Git 状态:"
cd /var/www/my-resume && git status
echo "Node 版本: $(node --version)"
echo "NPM 版本: $(npm --version)"
echo "PM2 状态:"
pm2 status
echo "测试结束: $(date)"
EOF

chmod +x /var/www/hooks/test-deploy.sh
bash /var/www/hooks/test-deploy.sh
```

## 安全最佳实践

### 1. 访问控制
```bash
# 限制 SSH 访问
sudo vim /etc/ssh/sshd_config
# 添加或修改：
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# 重启 SSH 服务
sudo systemctl restart ssh
```

### 2. 防火墙配置
```bash
# 只开放必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. 定期备份
```bash
# 创建备份脚本
cat > /var/www/hooks/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/my-resume"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# 备份代码
tar -czf "$BACKUP_DIR/code_$DATE.tar.gz" -C /var/www my-resume

# 备份配置
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" -C /var/www hooks

# 清理旧备份（保留7天）
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $DATE"
EOF

chmod +x /var/www/hooks/backup.sh

# 添加到定时任务（每天凌晨2点备份）
crontab -e
# 添加：0 2 * * * /var/www/hooks/backup.sh >> /var/www/logs/backup.log 2>&1
```

### 4. 环境变量管理
```bash
# 创建环境变量文件
cat > /var/www/hooks/.env << 'EOF'
NODE_ENV=production
WEBHOOK_SECRET=your-super-secret-key
PORT=3001
LOG_LEVEL=info
EOF

# 设置权限
chmod 600 /var/www/hooks/.env

# 在 webhook.js 中使用
require('dotenv').config();
```

## 性能优化

### 1. 应用优化
```javascript
// 在 next.config.js 中添加
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}
```

### 2. 服务器优化
```bash
# 调整系统参数
echo 'net.core.somaxconn = 65535' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 65535' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# PM2 集群模式
pm2 start ecosystem.config.js --env production
```

## 总结

通过以上配置，你已经建立了一个完整的自动化部署系统：

1. ✅ **服务器环境** - Node.js、Git、PM2、Nginx
2. ✅ **Webhook 服务** - 接收 GitHub 推送事件
3. ✅ **部署脚本** - 自动拉取代码、构建、重启
4. ✅ **反向代理** - Nginx 配置 SSL 和负载均衡
5. ✅ **监控日志** - 完整的日志记录和监控
6. ✅ **安全配置** - 防火墙、访问控制、备份

### 下一步建议

- 考虑使用 Docker 容器化部署
- 集成 CI/CD 工具如 GitHub Actions
- 添加自动化测试流程
- 实现蓝绿部署或滚动更新
- 配置监控告警系统

这套方案适用于中小型项目的自动化部署，可以根据实际需求进行调整和扩展。
