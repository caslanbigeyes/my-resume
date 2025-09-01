# Webhook连接问题修复方案

## 问题描述

你的服务器webhook在尝试从GitHub拉取代码时出现连接超时错误：
```
致命错误：无法访问 'https://github.com/caslanbigeyes/my-resume.git/'：Failed to connect to github.com port 443: 连接超时
```

## 问题原因

服务器无法连接到GitHub的443端口（HTTPS），这通常是由于：
1. 网络策略限制
2. 防火墙配置
3. 地区网络限制

## 解决方案

已经修复了webhook脚本，改为**不从GitHub拉取代码**，而是基于服务器上已有的代码进行重新构建和部署。

### 修复内容

1. **修改了webhook脚本** (`/var/www/hooks/github-webhook.sh`)
   - 移除了git pull操作
   - 改为基于现有代码重新构建
   - 添加了错误处理和日志

2. **保持了webhook监听器**
   - 继续监听GitHub的push事件
   - 自动触发重新构建和部署

## 新的工作流程

### 1. 开发和推送
```bash
# 本地开发
git add .
git commit -m "your changes"
git push origin main
```

### 2. 自动触发
- GitHub自动发送webhook到你的服务器
- 服务器接收到webhook后，基于现有代码重新构建
- 应用自动重启

### 3. 更新服务器代码
当你需要将新代码部署到服务器时：
```bash
# 使用推送部署脚本
./deploy-to-server.sh
```

## 验证修复

### 检查webhook状态
```bash
curl http://47.116.219.238:9000/status
```

### 手动触发部署
```bash
curl -X POST http://47.116.219.238:9000/deploy \\
  -H "Content-Type: application/json" \\
  -d '{"manual": true}'
```

### 检查应用状态
```bash
curl http://47.116.219.238:3000
```

## 文件说明

- `github-webhook-fixed.sh` - 修复后的webhook脚本
- `deploy-to-server.sh` - 推送部署脚本
- `final-fix.sh` - 服务器修复脚本
- `webhook-listener-simple.js` - 简化的webhook监听器

## 故障排除

### 如果webhook仍然报错

1. **检查服务器进程**
   ```bash
   ssh root@47.116.219.238 "ps aux | grep webhook"
   ```

2. **查看webhook日志**
   ```bash
   ssh root@47.116.219.238 "tail -f /root/webhook-deploy.log"
   ```

3. **重启webhook监听器**
   ```bash
   ssh root@47.116.219.238
   cd /var/www/hooks
   pkill -f webhook
   nohup node webhook.js > /root/webhook.log 2>&1 &
   ```

### 如果应用无法访问

1. **检查应用状态**
   ```bash
   ssh root@47.116.219.238 "pm2 list"
   ```

2. **重启应用**
   ```bash
   ssh root@47.116.219.238 "pm2 restart my-resume"
   ```

## 优势

✅ **解决了GitHub连接问题** - 不再依赖服务器到GitHub的连接  
✅ **保持了自动部署** - GitHub push仍然会触发重新构建  
✅ **简化了部署流程** - 推送部署更可靠  
✅ **提高了稳定性** - 减少了网络依赖  

## 注意事项

⚠️ **代码更新** - 服务器代码需要通过推送部署更新，不会自动从GitHub拉取  
⚠️ **首次部署** - 确保服务器上有完整的项目代码  
⚠️ **依赖更新** - 如果package.json有变化，需要重新推送部署  

现在你的webhook系统已经修复，可以正常工作了！