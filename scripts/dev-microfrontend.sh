#!/bin/bash

# Development script for micro frontend architecture
# Starts backend, host app, and all plugins in parallel

echo "🚀 Starting ENXP Micro Frontend Development"
echo "=========================================="

# Check if running from root
if [ ! -f "package.json" ]; then
  echo "❌ Please run this script from the workspace root"
  exit 1
fi

# Function to start a process in background
start_service() {
  local name=$1
  local command=$2
  local port=$3
  
  echo "🔵 Starting $name on port $port..."
  $command &
  echo $! > ".pid-$name"
}

# Cleanup function
cleanup() {
  echo ""
  echo "🛑 Shutting down services..."
  
  for pid_file in .pid-*; do
    if [ -f "$pid_file" ]; then
      pid=$(cat "$pid_file")
      kill $pid 2>/dev/null
      rm "$pid_file"
    fi
  done
  
  echo "✅ All services stopped"
  exit 0
}

# Trap SIGINT (Ctrl+C) and cleanup
trap cleanup SIGINT

# Start backend
start_service "backend" "cd packages/backend && pnpm run dev" 3000

# Wait for backend to be ready
sleep 3

# Start frontend host app
start_service "frontend-host" "cd frontend-app && pnpm run dev" 3001

# Start plugins
start_service "plugin-projects" "cd plugins/projects-management && pnpm run dev" 4001
start_service "plugin-activity" "cd plugins/activity-management && pnpm run dev" 4002
start_service "plugin-templates" "cd plugins/templates-management && pnpm run dev" 4003

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Access points:"
echo "  Backend API:        http://localhost:3000"
echo "  Frontend Host:      http://localhost:3001"
echo "  Projects Plugin:    http://localhost:4001"
echo "  Activity Plugin:    http://localhost:4002"
echo "  Templates Plugin:   http://localhost:4003"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background processes
wait
