const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

const PORT = 9000;
const WEBHOOK_SCRIPT = '/var/www/hooks/github-webhook.sh';
const LOG_FILE = '/root/webhook.log';

// 日志函数
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(LOG_FILE, logMessage);
}

// 执行webhook脚本
function executeWebhook(source = 'unknown') {
    log(`执行webhook脚本 (触发源: ${source})`);
    
    exec(`bash ${WEBHOOK_SCRIPT}`, (error, stdout, stderr) => {
        if (error) {
            log(`Webhook执行错误: ${error.message}`);
            return;
        }
        if (stderr) {
            log(`Webhook stderr: ${stderr}`);
        }
        if (stdout) {
            log(`Webhook stdout: ${stdout}`);
        }
        log('Webhook执行完成');
    });
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    log(`收到请求: ${method} ${url}`);
    
    if (url === '/webhook' && method === 'POST') {
        // GitHub webhook
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                log(`GitHub webhook payload: ${JSON.stringify(payload, null, 2)}`);
                
                // 执行部署脚本
                executeWebhook('github');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'success', 
                    message: 'Webhook received and deployment triggered' 
                }));
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
        executeWebhook('manual');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'success', 
            message: 'Manual deployment triggered' 
        }));
        
    } else if (url === '/status' && method === 'GET') {
        // 状态检查
        const status = {
            status: 'running',
            timestamp: new Date().toISOString(),
            webhook_script: WEBHOOK_SCRIPT,
            webhook_script_exists: fs.existsSync(WEBHOOK_SCRIPT)
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status, null, 2));
        
    } else {
        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'error', 
            message: 'Not found' 
        }));
    }
});

// 启动服务器
server.listen(PORT, () => {
    log(`Webhook监听器启动在端口 ${PORT}`);
    log(`支持的端点:`);
    log(`  POST /webhook - GitHub webhook`);
    log(`  POST /deploy - 手动部署触发`);
    log(`  GET /status - 状态检查`);
});

// 错误处理
server.on('error', (error) => {
    log(`服务器错误: ${error.message}`);
});

process.on('uncaughtException', (error) => {
    log(`未捕获的异常: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`未处理的Promise拒绝: ${reason}`);
});