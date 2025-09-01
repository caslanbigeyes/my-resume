const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

const PORT = 3001;
const PROJECT_DIR = '/root/my-resume';
const LOG_FILE = '/root/webhook-deploy.log';

// 日志函数
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    
    // 确保日志目录存在
    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (error) {
        console.error('写入日志文件失败:', error.message);
    }
}

// 验证GitHub webhook签名（可选）
function verifyGitHubSignature(payload, signature, secret) {
    if (!secret || !signature) return true; // 如果没有设置密钥，跳过验证
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const calculatedSignature = 'sha256=' + hmac.digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature)
    );
}

// 执行部署脚本
function executeDeployment(source = 'unknown', callback) {
    log(`开始执行部署 (触发源: ${source})`);
    
    const deployScript = `
        set -e
        cd ${PROJECT_DIR}
        
        # 检查项目目录
        if [ ! -f "package.json" ]; then
            echo "错误: 项目目录无效"
            exit 1
        fi
        
        # 拉取最新代码（如果是git仓库）
        if [ -d ".git" ]; then
            echo "拉取最新代码..."
            git fetch origin
            git reset --hard origin/main || git reset --hard origin/master
        fi
        
        # 安装依赖
        echo "安装依赖..."
        npm install --legacy-peer-deps
        
        # 构建项目
        echo "构建项目..."
        npm run build
        
        # 重启应用
        echo "重启应用..."
        pm2 restart my-resume-80 || {
            echo "PM2重启失败，尝试重新启动..."
            pm2 delete my-resume-80 || true
            PORT=80 pm2 start npm --name 'my-resume-80' -- start
        }
        
        # 保存PM2配置
        pm2 save
        
        echo "部署完成"
    `;
    
    exec(deployScript, { shell: '/bin/bash' }, (error, stdout, stderr) => {
        if (error) {
            log(`部署失败: ${error.message}`);
            if (callback) callback(false, error.message);
            return;
        }
        
        if (stderr) {
            log(`部署警告: ${stderr}`);
        }
        
        if (stdout) {
            log(`部署输出: ${stdout}`);
        }
        
        log('部署成功完成');
        if (callback) callback(true, '部署成功');
    });
}

// 检查应用状态
function checkAppStatus(callback) {
    exec('curl -f http://localhost:80 -o /dev/null -s', (error) => {
        const isRunning = !error;
        callback(isRunning);
    });
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256');
    
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    log(`收到请求: ${method} ${url} from ${req.connection.remoteAddress}`);
    
    if (url === '/webhook' && method === 'POST') {
        // GitHub webhook处理
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                // 验证签名（如果设置了WEBHOOK_SECRET环境变量）
                const signature = req.headers['x-hub-signature-256'];
                const secret = process.env.WEBHOOK_SECRET;
                
                if (secret && !verifyGitHubSignature(body, signature, secret)) {
                    log('Webhook签名验证失败');
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        status: 'error', 
                        message: 'Invalid signature' 
                    }));
                    return;
                }
                
                const payload = JSON.parse(body);
                log(`GitHub webhook事件: ${req.headers['x-github-event'] || 'unknown'}`);
                
                // 只处理push事件到main或master分支
                if (payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master') {
                    log(`检测到${payload.ref}分支推送，开始部署...`);
                    
                    executeDeployment('github', (success, message) => {
                        const response = {
                            status: success ? 'success' : 'error',
                            message: message,
                            timestamp: new Date().toISOString(),
                            commit: payload.head_commit ? payload.head_commit.id.substring(0, 7) : 'unknown'
                        };
                        
                        res.writeHead(success ? 200 : 500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response, null, 2));
                    });
                } else {
                    log(`忽略非主分支推送: ${payload.ref}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        status: 'ignored', 
                        message: 'Not a main/master branch push',
                        ref: payload.ref
                    }));
                }
                
            } catch (error) {
                log(`解析webhook payload错误: ${error.message}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'error', 
                    message: 'Invalid JSON payload' 
                }));
            }
        });
        
    } else if (url === '/deploy' && method === 'POST') {
        // 手动部署触发
        log('收到手动部署请求');
        
        executeDeployment('manual', (success, message) => {
            const response = {
                status: success ? 'success' : 'error',
                message: message,
                timestamp: new Date().toISOString()
            };
            
            res.writeHead(success ? 200 : 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response, null, 2));
        });
        
    } else if (url === '/status' && method === 'GET') {
        // 状态检查
        checkAppStatus((isRunning) => {
            const status = {
                webhook_server: 'running',
                application_status: isRunning ? 'running' : 'stopped',
                timestamp: new Date().toISOString(),
                project_dir: PROJECT_DIR,
                project_exists: fs.existsSync(PROJECT_DIR),
                port: PORT,
                endpoints: {
                    webhook: 'POST /webhook - GitHub webhook处理',
                    deploy: 'POST /deploy - 手动部署触发',
                    status: 'GET /status - 状态检查',
                    logs: 'GET /logs - 查看部署日志'
                }
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(status, null, 2));
        });
        
    } else if (url === '/logs' && method === 'GET') {
        // 查看日志
        try {
            if (fs.existsSync(LOG_FILE)) {
                const logs = fs.readFileSync(LOG_FILE, 'utf8');
                const lines = logs.split('\\n').slice(-50); // 最近50行
                
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(lines.join('\\n'));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('日志文件不存在');
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`读取日志失败: ${error.message}`);
        }
        
    } else if (url === '/' && method === 'GET') {
        // 根路径 - 显示帮助信息
        const help = `
Webhook服务器运行中

可用端点:
- POST /webhook - GitHub webhook处理
- POST /deploy - 手动部署触发
- GET /status - 状态检查
- GET /logs - 查看部署日志

服务器信息:
- 端口: ${PORT}
- 项目目录: ${PROJECT_DIR}
- 日志文件: ${LOG_FILE}

使用示例:
curl http://47.116.219.238:${PORT}/status
curl -X POST http://47.116.219.238:${PORT}/deploy
`;
        
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(help);
        
    } else {
        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'error', 
            message: 'Not found',
            available_endpoints: ['/webhook', '/deploy', '/status', '/logs', '/']
        }));
    }
});

// 启动服务器
server.listen(PORT, '0.0.0.0', () => {
    log(`🚀 Webhook服务器启动成功`);
    log(`📍 监听地址: http://0.0.0.0:${PORT}`);
    log(`🌐 外部访问: http://47.116.219.238:${PORT}`);
    log(`📁 项目目录: ${PROJECT_DIR}`);
    log(`📝 日志文件: ${LOG_FILE}`);
    log('');
    log('支持的端点:');
    log('  POST /webhook - GitHub webhook处理');
    log('  POST /deploy - 手动部署触发');
    log('  GET /status - 状态检查');
    log('  GET /logs - 查看部署日志');
    log('  GET / - 帮助信息');
    log('');
    log('GitHub webhook URL: http://47.116.219.238:3001/webhook');
});

// 错误处理
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        log(`❌ 端口 ${PORT} 已被占用`);
        log('请检查是否有其他服务在使用此端口，或修改PORT变量');
    } else {
        log(`❌ 服务器错误: ${error.message}`);
    }
    process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', () => {
    log('收到SIGTERM信号，正在关闭服务器...');
    server.close(() => {
        log('Webhook服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log('收到SIGINT信号，正在关闭服务器...');
    server.close(() => {
        log('Webhook服务器已关闭');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    log(`❌ 未捕获的异常: ${error.message}`);
    log(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`❌ 未处理的Promise拒绝: ${reason}`);
});