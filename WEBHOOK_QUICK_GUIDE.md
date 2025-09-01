# 🚀 Webhook自动部署服务 - 快速指南

## ✅ 服务状态

Webhook服务已成功部署并运行在：**http://47.116.219.238:3001**

## 🔗 GitHub Webhook配置

### 1. 在GitHub仓库中添加Webhook

1. 打开你的GitHub仓库
2. 进入 `Settings` → `Webhooks`
3. 点击 `Add webhook`
4. 填写以下信息：

```
Payload URL: http://47.116.219.238:3001/webhook
Content type: application/json
Secret: (可选，留空即可)
Events: Just the push event
Active: ✅ 勾选
```

5. 点击 `Add webhook`

### 2. 测试自动部署

推送代码到 `main` 或 `master` 分支，webhook会自动触发部署。

## 📋 可用端点

| 端点 | 方法 | 功能 | 示例 |
|------|------|------|------|
| `/webhook` | POST | GitHub webhook处理 | GitHub自动调用 |
| `/deploy` | POST | 手动触发部署 | `curl -X POST http://47.116.219.238:3001/deploy` |
| `/status` | GET | 查看服务状态 | `curl http://47.116.219.238:3001/status` |
| `/logs` | GET | 查看部署日志 | `curl http://47.116.219.238:3001/logs` |
| `/` | GET | 帮助信息 | `curl http://47.116.219.238:3001/` |

## 🧪 快速测试

```bash
# 检查服务状态
curl http://47.116.219.238:3001/status

# 手动触发部署
curl -X POST http://47.116.219.238:3001/deploy

# 查看部署日志
curl http://47.116.219.238:3001/logs
```

## 🔄 部署流程

当收到GitHub推送时，系统会自动：

1. ✅ 验证是否为main/master分支
2. 📥 拉取最新代码
3. 📦 安装依赖 (`npm install`)
4. 🏗️ 构建项目 (`npm run build`)
5. 🔄 重启应用 (PM2)
6. ✅ 验证部署成功

## 🛠️ 服务管理

### 查看服务状态
```bash
ssh root@47.116.219.238
pm2 list
```

### 重启webhook服务
```bash
pm2 restart webhook-server
```

### 查看日志
```bash
pm2 logs webhook-server
```

## 🎯 使用场景

- ✅ 推送到main分支 → 自动部署
- ✅ 手动触发部署 → 调用 `/deploy` 端点
- ✅ 监控服务状态 → 调用 `/status` 端点
- ✅ 查看部署日志 → 调用 `/logs` 端点

## 🔒 安全说明

- 服务运行在端口3001，已配置防火墙
- 支持GitHub webhook签名验证（可选）
- 只处理main/master分支的推送事件

## 📞 故障排除

如果webhook不工作，请检查：

1. **GitHub webhook配置是否正确**
2. **服务是否运行**: `curl http://47.116.219.238:3001/status`
3. **查看错误日志**: `curl http://47.116.219.238:3001/logs`
4. **PM2进程状态**: SSH到服务器运行 `pm2 list`

---

🎉 **恭喜！** 你的自动部署系统已经配置完成，现在可以享受代码推送即部署的便利了！