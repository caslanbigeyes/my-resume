# 阿里云服务器部署解决方案

## 问题分析

您的阿里云服务器无法访问GitHub，这是因为：
1. 网络策略限制了对GitHub的访问
2. SSH连接到git@github.com被阻止
3. HTTPS连接到github.com也被阻止

## 解决方案

由于无法从服务器直接拉取GitHub代码，我们改用**推送部署**的方式：

### 1. 服务器端配置

已在服务器上配置了以下组件：

#### Webhook监听器 (`webhook-listener-fixed.cjs`)
- 监听端口：9000
- 路径：
  - `POST /webhook` - 接收GitHub webhook
  - `POST /deploy` - 手动触发部署
  - `GET /status` - 检查状态

#### 部署脚本
- `deploy-from-local.sh` - 准备部署目录
- `post-deploy.sh` - 执行部署后处理（安装依赖、构建、启动服务）

### 2. 本地部署脚本

已创建 `deploy-to-server.sh` 脚本，用于：
1. 将本地代码同步到服务器
2. 执行远程部署
3. 触发webhook通知

## 使用方法

### 方法一：使用自动部署脚本（推荐）

```bash
# 在本地项目根目录执行
./deploy-to-server.sh
```

### 方法二：手动部署

```bash
# 1. 同步代码到服务器
rsync -avz --delete --exclude='node_modules' --exclude='.git' --exclude='.next' \
  -e "ssh -o StrictHostKeyChecking=no" \
  ./ root@47.116.219.238:/root/my-resume/

# 2. 登录服务器执行部署
ssh root@47.116.219.238
cd /root
./post-deploy.sh
```

### 方法三：使用SCP

```bash
# 压缩本地代码
tar --exclude='node_modules' --exclude='.git' --exclude='.next' -czf my-resume.tar.gz .

# 上传到服务器
scp my-resume.tar.gz root@47.116.219.238:/root/

# 登录服务器解压并部署
ssh root@47.116.219.238
cd /root
tar -xzf my-resume.tar.gz -C my-resume/
./post-deploy.sh
```

## 服务器状态检查

### 检查Webhook监听器状态
```bash
curl http://47.116.219.238:9000/status
```

### 检查应用状态
```bash
curl http://47.116.219.238:3000
```

### 查看部署日志
```bash
ssh root@47.116.219.238
tail -f /root/deploy.log
tail -f /root/webhook.log
```

## 自动化部署流程

1. **本地开发** → 代码修改
2. **执行部署脚本** → `./deploy-to-server.sh`
3. **代码同步** → rsync/scp 推送到服务器
4. **自动部署** → 服务器执行构建和重启
5. **服务更新** → 应用在端口3000上运行

## 故障排除

### 如果部署失败：

1. **检查网络连接**
   ```bash
   ping 47.116.219.238
   ```

2. **检查SSH连接**
   ```bash
   ssh root@47.116.219.238
   ```

3. **检查服务器磁盘空间**
   ```bash
   ssh root@47.116.219.238 "df -h"
   ```

4. **检查Node.js和PM2状态**
   ```bash
   ssh root@47.116.219.238 "node --version && pm2 list"
   ```

5. **重启Webhook监听器**
   ```bash
   ssh root@47.116.219.238
   pkill -f webhook
   nohup node webhook-listener-fixed.cjs > webhook.out 2>&1 &
   ```

## 安全建议

1. **更改默认密码**：建议修改服务器root密码
2. **使用SSH密钥**：配置SSH密钥认证替代密码
3. **防火墙配置**：确保只开放必要的端口
4. **定期备份**：设置自动备份机制

## 端口说明

- **3000**: Next.js应用端口
- **9000**: Webhook监听器端口
- **22**: SSH端口

现在您的部署系统已经配置完成，可以正常进行自动化部署了！