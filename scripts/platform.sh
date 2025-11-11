#!/bin/bash

# ENXP Platform Management Script
# Usage: ./scripts/platform.sh [start|stop|restart|status]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Functions
start_platform() {
    echo -e "${BLUE}🚀 Starting ENXP Platform...${NC}"
    
    # Create logs directory
    mkdir -p "$PROJECT_ROOT/logs"
    
    # Start backend
    echo -e "${GREEN}Starting backend server...${NC}"
    cd "$PROJECT_ROOT"
    nohup npx ts-node server.ts > logs/backend.log 2>&1 &
    echo "Backend PID: $!"
    
    # Wait for backend
    sleep 2
    
    # Start frontend
    echo -e "${GREEN}Starting frontend...${NC}"
    cd "$PROJECT_ROOT/frontend-app"
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    echo "Frontend PID: $!"
    
    sleep 2
    echo -e "${GREEN}✅ Platform started${NC}"
    echo -e "Backend: http://localhost:3000"
    echo -e "Frontend: http://localhost:3001"
}

stop_platform() {
    echo -e "${RED}🛑 Stopping ENXP Platform...${NC}"
    
    # Stop backend
    pkill -f "ts-node server.ts" || echo "Backend not running"
    
    # Stop frontend
    pkill -f "vite" || echo "Frontend not running"
    
    echo -e "${GREEN}✅ Platform stopped${NC}"
}

restart_platform() {
    echo -e "${YELLOW}♻️  Restarting ENXP Platform...${NC}"
    stop_platform
    sleep 2
    start_platform
}

status_platform() {
    echo -e "${BLUE}📊 Platform Status${NC}"
    echo ""
    
    # Check backend
    if pgrep -f "ts-node server.ts" > /dev/null; then
        echo -e "${GREEN}✅ Backend: Running${NC}"
    else
        echo -e "${RED}❌ Backend: Stopped${NC}"
    fi
    
    # Check frontend
    if pgrep -f "vite" > /dev/null; then
        echo -e "${GREEN}✅ Frontend: Running${NC}"
    else
        echo -e "${RED}❌ Frontend: Stopped${NC}"
    fi
}

# Main
case "$1" in
    start)
        start_platform
        ;;
    stop)
        stop_platform
        ;;
    restart)
        restart_platform
        ;;
    status)
        status_platform
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
