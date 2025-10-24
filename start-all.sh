#!/bin/bash
# Sora Web UI 一键启动脚本

echo "🚀 启动 Sora Web UI..."
echo ""

# Redis 不再需要 - 已移除依赖

# 进入后端目录并启动
echo ""
echo "🔧 启动后端服务器..."
cd "$(dirname "$0")/src/backend"
npm run dev &
BACKEND_PID=$!
echo "  后端 PID: $BACKEND_PID"

# 等待后端启动
sleep 5

# 进入前端目录并启动
echo ""
echo "🎨 启动前端服务器..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "  前端 PID: $FRONTEND_PID"

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 显示服务信息
echo ""
echo "✅ 所有服务已启动！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 服务地址:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌐 前端界面: http://localhost:5173"
echo "  🔌 后端 API:  http://localhost:8080"
echo "  ❤️  健康检查: http://localhost:8080/api/health"
echo "  📋 任务 API:  http://localhost:8080/api/tasks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示:"
echo "  - 在浏览器中打开 http://localhost:5173 使用应用"
echo "  - 按 Ctrl+C 停止所有服务"
echo ""
echo "📝 日志位置:"
echo "  - 后端: src/backend/backend-output.log"
echo "  - 前端: src/frontend/frontend-output.log"
echo ""

# 等待用户中断
wait
