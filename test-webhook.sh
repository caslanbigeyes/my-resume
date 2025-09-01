#!/bin/bash

# 测试Webhook服务脚本
# 使用方法: ./test-webhook.sh

SERVER="47.116.219.238"
PORT="3001"
BASE_URL="http://$SERVER:$PORT"

function log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

function test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    log "🧪 测试: $description"
    echo "   请求: $method $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\\n%{http_code}" -X "$method" \
            "$BASE_URL$endpoint" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "   ✅ 成功 (HTTP $http_code)"
        if [ ${#body} -lt 500 ]; then
            echo "   响应: $body"
        else
            echo "   响应: $(echo "$body" | head -c 200)..."
        fi
    else
        echo "   ❌ 失败 (HTTP $http_code)"
        echo "   响应: $body"
    fi
    echo
}

log "🚀 开始测试Webhook服务..."
log "🌐 服务地址: $BASE_URL"
echo

# 测试服务是否可达
log "🔍 检查服务连通性..."
if curl -s --connect-timeout 5 "$BASE_URL" >/dev/null; then
    log "✅ 服务可达"
else
    log "❌ 服务不可达，请检查："
    log "   1. 服务是否启动"
    log "   2. 端口$PORT是否开放"
    log "   3. 防火墙设置"
    exit 1
fi
echo

# 测试各个端点
test_endpoint "GET" "/" "获取帮助信息"

test_endpoint "GET" "/status" "检查服务状态"

test_endpoint "GET" "/logs" "查看部署日志"

test_endpoint "POST" "/deploy" "手动触发部署" '{\"manual\": true}'

# 模拟GitHub webhook
github_payload='{
  \"ref\": \"refs/heads/main\",
  \"head_commit\": {
    \"id\": \"1234567890abcdef\",
    \"message\": \"Test commit\",
    \"author\": {
      \"name\": \"Test User\",
      \"email\": \"test@example.com\"
    }
  },
  \"repository\": {
    \"name\": \"my-resume\",
    \"full_name\": \"user/my-resume\"
  }
}'

test_endpoint "POST" "/webhook" "模拟GitHub webhook" "$github_payload"

# 测试无效端点
test_endpoint "GET" "/invalid" "测试404响应"

log "🎉 测试完成！"
log ""
log "📋 如果所有测试都通过，你可以："
log "1. 在GitHub仓库中配置webhook URL: $BASE_URL/webhook"
log "2. 推送代码到main分支测试自动部署"
log "3. 使用 $BASE_URL/status 监控服务状态"