# Quick Start Guide - Running ENXP Platform

This guide shows you how to start the ENXP platform in under 2 minutes.

> 🐳 **Production Deployment?** See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for Docker setup with PostgreSQL

---

## Prerequisites

Ensure you have:
- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ All packages built (see below if not)

> 💡 **Alternative:** Use Docker for a complete production-ready setup (see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md))

### First Time Setup (One-Time Only)

If you haven't built the packages yet:

```bash
cd /Users/tungtt22/Workspace/tungtt22/enxp

# Install dependencies
npm install

# Build all packages
cd packages/core && npm run build
cd ../backend && npm run build
cd ../frontend && npm run build
cd ../cli && npm run build

# Build demo plugin
cd ../../plugins/hello-world
npm run build

# Install frontend dependencies
cd ../../frontend-app
npm install
```

---

## Method 1: Foreground Mode (Recommended for Development)

### Terminal 1 - Backend Server

```bash
cd /Users/tungtt22/Workspace/tungtt22/enxp
npx ts-node server.ts
```

**You should see:**
```
Server running on http://localhost:3000
Plugin 'hello-world' initialized
Plugin 'hello-world' activated
```

**Leave this terminal running** ✅

### Terminal 2 - Frontend Server

```bash
cd /Users/tungtt22/Workspace/tungtt22/enxp/frontend-app
npm run dev
```

**You should see:**
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:3001/
➜  Network: use --host to expose
```

**Leave this terminal running** ✅

### Access the Platform

Open your browser to:
- **Frontend UI:** http://localhost:3001
- **Backend API:** http://localhost:3000/health

---

## Method 2: Background Mode (Clean Terminal)

### Start Both Servers

```bash
# Backend
cd /Users/tungtt22/Workspace/tungtt22/enxp
nohup npx ts-node server.ts > logs/backend.log 2>&1 &

# Frontend
cd frontend-app
nohup npm run dev > /tmp/vite.log 2>&1 &
```

### View Logs

```bash
# Backend logs
tail -f /Users/tungtt22/Workspace/tungtt22/enxp/logs/backend.log

# Frontend logs
tail -f /tmp/vite.log
```

### Stop Servers

```bash
# Stop backend
pkill -f "ts-node server.ts"

# Stop frontend
pkill -f "vite"

# Or by port
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:3001 | xargs kill -9  # Frontend
```

---

## Quick Test Commands

### Test Backend Health

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "plugins": [
    {
      "id": "hello-world",
      "name": "Hello World Plugin",
      "version": "1.0.0",
      "status": "active"
    }
  ]
}
```

### Test Plugin API

```bash
curl http://localhost:3000/api/plugins/hello-world/hello
```

**Expected Response:**
```json
{
  "message": "Hello from HelloWorld plugin!",
  "timestamp": "2025-11-10T..."
}
```

### Test Frontend

Open browser: http://localhost:3001

**You should see:**
- ✅ Purple/blue gradient header
- ✅ Dashboard with 4 stat cards
- ✅ Navigation sidebar (Dashboard, Plugins, Marketplace, Settings)
- ✅ Server status showing "Online" (green dot)

---

## Startup Script (Easiest Method)

Create a startup script for convenience:

### Create `start-platform.sh`

```bash
cat > /Users/tungtt22/Workspace/tungtt22/enxp/start-platform.sh << 'EOF'
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting ENXP Platform...${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start backend
cd /Users/tungtt22/Workspace/tungtt22/enxp
echo -e "${GREEN}Starting backend server...${NC}"
nohup npx ts-node server.ts > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 2

# Start frontend
cd frontend-app
echo -e "${GREEN}Starting frontend server...${NC}"
nohup npm run dev > /tmp/vite.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for servers to be ready
sleep 3

echo ""
echo -e "${GREEN}✅ Platform started successfully!${NC}"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To view logs:"
echo "  Backend:  tail -f logs/backend.log"
echo "  Frontend: tail -f /tmp/vite.log"
echo ""
echo "To stop:"
echo "  pkill -f 'ts-node server.ts'"
echo "  pkill -f 'vite'"
EOF

chmod +x start-platform.sh
```

### Create `stop-platform.sh`

```bash
cat > /Users/tungtt22/Workspace/tungtt22/enxp/stop-platform.sh << 'EOF'
#!/bin/bash

RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}Stopping ENXP Platform...${NC}"

# Stop backend
pkill -f "ts-node server.ts"
echo "Backend stopped"

# Stop frontend
pkill -f "vite"
echo "Frontend stopped"

echo -e "${RED}✅ Platform stopped${NC}"
EOF

chmod +x stop-platform.sh
```

### Usage

```bash
# Start platform
./start-platform.sh

# Stop platform
./stop-platform.sh
```

---

## Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Then restart servers
```

### Backend Not Starting

**Check:**
1. Are all packages built?
   ```bash
   ls packages/core/dist
   ls packages/backend/dist
   ls packages/cli/dist
   ```

2. Is the plugin built?
   ```bash
   ls plugins/hello-world/dist
   ```

3. Is Node.js version correct?
   ```bash
   node --version  # Should be 18+
   ```

**Solution:**
```bash
# Rebuild everything
cd packages/core && npm run build
cd ../backend && npm run build
cd ../cli && npm run build
cd ../../plugins/hello-world && npm run build
```

### Frontend Shows Blank Page

**Check:**
1. Is Vite running?
   ```bash
   ps aux | grep vite
   ```

2. Check browser console (F12 → Console)

3. Check vite.config.ts has correct aliases

**Solution:**
See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) Issue #5 for detailed fix

### Can't Access Frontend

**Error:** Browser shows "This site can't be reached"

**Check:**
```bash
# Is frontend server running?
lsof -i :3001

# Check logs
tail -f /tmp/vite.log
```

**Solution:**
```bash
# Restart frontend
cd frontend-app
npm run dev
```

---

## Development Workflow

### Making Changes to Backend

```bash
# Edit files in packages/backend/src/
# Rebuild package
cd packages/backend
npm run build

# Restart backend server
pkill -f "ts-node server.ts"
cd ../..
npx ts-node server.ts
```

### Making Changes to Frontend

```bash
# Edit files in frontend-app/src/
# Vite has hot module replacement - no restart needed!
# Just save the file and browser auto-refreshes
```

### Creating New Plugin

```bash
# Use CLI
npx enxp create my-plugin backend

# Build plugin
cd plugins/my-plugin
npm run build

# Restart backend to load new plugin
pkill -f "ts-node server.ts"
cd ../..
npx ts-node server.ts
```

---

## Next Steps After Starting Platform

1. **Explore the UI**
   - Dashboard: http://localhost:3001
   - Check Plugins page
   - Test Marketplace (placeholder)
   - Configure Settings

2. **Test the API**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Plugin API
   curl http://localhost:3000/api/plugins/hello-world/hello
   ```

3. **Create Your First Plugin**
   ```bash
   npx enxp create my-auth backend
   cd plugins/my-auth
   # Edit src/index.ts
   npm run build
   # Restart backend
   ```

4. **Read Documentation**
   - [PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md) - How to build plugins
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
   - [EXAMPLES.md](EXAMPLES.md) - Code examples
   - [PROJECT_HISTORY.md](PROJECT_HISTORY.md) - Complete build history

---

## Quick Reference

### Ports
- Backend: `3000`
- Frontend: `3001`

### Key URLs
- Frontend UI: http://localhost:3001
- Backend Health: http://localhost:3000/health
- Plugin API: http://localhost:3000/api/plugins/{plugin-id}/{route}

### Important Directories
- `packages/` - Core platform packages
- `plugins/` - Plugin directory
- `frontend-app/` - React UI
- `docs/` - Documentation

### Log Files
- Backend: `logs/backend.log`
- Frontend: `/tmp/vite.log`

### Useful Commands
```bash
# Check running processes
ps aux | grep "ts-node\|vite"

# Check ports
lsof -i :3000
lsof -i :3001

# View logs
tail -f logs/backend.log
tail -f /tmp/vite.log

# Stop all
pkill -f "ts-node server.ts"
pkill -f "vite"
```

---

## Production Deployment

For production deployment, see:
- [ARCHITECTURE.md](ARCHITECTURE.md) for deployment considerations

Quick tips:
- Build frontend: `cd frontend-app && npm run build`
- Serve with nginx or Apache
- Use PM2 for process management
- Set NODE_ENV=production
- Use proper environment variables

---

**Status:** ✅ Platform is ready to use!

For complete history and troubleshooting, see:
- [PROJECT_HISTORY.md](PROJECT_HISTORY.md) - Full build history
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - All issues and solutions

---

*Last Updated: November 10, 2025*
