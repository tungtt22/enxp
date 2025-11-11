# ENXP Platform - Troubleshooting Guide

This document contains all issues encountered during platform development and their solutions.

---

## Issue #1: TypeScript Composite Project Configuration

**Date:** Build phase  
**Severity:** ⚠️ Build Error  
**Component:** All packages

### Problem Description
When building packages with TypeScript project references, encountered error:
```
error TS6304: Project references may not form a circular graph. 
Cycle detected: core -> backend -> core
```

Additionally, got errors about referenced projects needing `composite: true`:
```
error TS6376: Referenced project must have 'composite' setting enabled.
```

### Root Cause
- TypeScript project references require `composite: true` in tsconfig.json
- Missing configuration in package tsconfig files
- Default root configuration didn't include this setting

### Solution Applied
Added `"composite": true` to all package tsconfig.json files:

**Files Modified:**
- `packages/core/tsconfig.json`
- `packages/backend/tsconfig.json`
- `packages/frontend/tsconfig.json`
- `packages/cli/tsconfig.json`

**Example Configuration:**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### Verification
```bash
cd packages/core && npm run build     # ✅ Success
cd packages/backend && npm run build  # ✅ Success
cd packages/frontend && npm run build # ✅ Success
cd packages/cli && npm run build      # ✅ Success
```

### Prevention
- Always set `composite: true` for TypeScript projects using project references
- Use `"references"` array in tsconfig to declare dependencies
- Ensure build order respects dependency graph

---

## Issue #2: Plugin Build Root Directory Conflicts

**Date:** Plugin creation phase  
**Severity:** ⚠️ Build Error  
**Component:** plugins/hello-world

### Problem Description
When building hello-world plugin, got TypeScript error:
```
error TS6059: File is not under 'rootDir'. 
'rootDir' is expected to contain all source files.
```

The plugin tsconfig was extending root configuration which had:
```json
{
  "compilerOptions": {
    "rootDir": "./packages"
  }
}
```

### Root Cause
- Plugin located at `plugins/hello-world/` not under `packages/`
- Plugin tsconfig extended root config with incompatible rootDir
- TypeScript couldn't resolve file locations correctly

### Solution Applied
Made plugin tsconfig standalone without extending root:

**Before:**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

**After:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Verification
```bash
cd plugins/hello-world
npm run build
# ✅ Compiled successfully to dist/index.js
```

### Prevention
- Use standalone tsconfig for plugins outside main package structure
- Don't extend root tsconfig if paths are incompatible
- Explicitly set rootDir and outDir for each project

---

## Issue #3: CLI Package Not Built

**Date:** Plugin creation phase  
**Severity:** ⚠️ Runtime Error  
**Component:** @enxp/cli

### Problem Description
When trying to run `npx enxp create hello-world backend`, got error:
```
Error: Cannot find module './dist/index.js'
```

### Root Cause
- CLI package wasn't compiled before use
- No dist folder existed
- package.json "main" pointed to non-existent file

### Solution Applied
Built the CLI package:

```bash
cd packages/cli
npm run build
```

This created `dist/index.js` from `src/index.ts`

### Verification
```bash
npx enxp create hello-world backend
# ✅ Created plugin scaffold successfully
```

### Prevention
- Build all packages before using them
- Add build step to root package.json:
  ```json
  {
    "scripts": {
      "build:all": "npm run build --workspaces"
    }
  }
  ```

---

## Issue #4: Server Process Suspension During Terminal Commands

**Date:** Backend testing phase  
**Severity:** 🔴 Critical Runtime Error  
**Component:** Backend server

### Problem Description
When running backend server in terminal and then executing curl commands, server process would suspend:

```bash
# Terminal 1
npx ts-node server.ts
# Server starts...

# Terminal 2
curl http://localhost:3000/health
# No response, hangs

# Terminal 1 shows:
[1]  + 12345 suspended  npx ts-node server.ts
```

### Root Cause
- Terminal job control sent SIGTSTP signal to background process
- Server wasn't running truly in background
- Process got suspended when terminal tried to use it

### Solution Applied
Used `nohup` to run server completely detached from terminal:

```bash
# Backend
cd /Users/tungtt22/Workspace/tungtt22/enxp
nohup npx ts-node server.ts > logs/backend.log 2>&1 &

# Frontend
cd frontend-app
nohup npm run dev > /tmp/vite.log 2>&1 &
```

### Verification
```bash
curl http://localhost:3000/health
# ✅ {"status":"ok","timestamp":"...","plugins":[...]}

curl http://localhost:3000/api/plugins/hello-world/hello
# ✅ {"message":"Hello from HelloWorld plugin!"}
```

### Prevention
- Always use `nohup` for long-running background processes
- Redirect output to log files
- Use `&` to run in background
- Alternative: Use process managers like PM2 or systemd

---

## Issue #5: Frontend Blank Page (CRITICAL)

**Date:** Frontend launch phase  
**Severity:** 🔴 Critical - App Non-Functional  
**Component:** frontend-app (React + Vite)

### Problem Description
After starting frontend server on port 3001, browser showed completely blank page:
- No errors in terminal
- Vite compiled successfully
- Browser showed white screen
- No console errors initially visible

### Debug Process

#### Step 1: Verify HTML Works
Created `test.html` with simple content:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test Page</h1>
</body>
</html>
```
**Result:** ✅ HTML loads fine - Server works

#### Step 2: Verify React Works
Created `index-simple.html` with inline React:
```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script>
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement('h1', null, 'React Works!')
  );
</script>
```
**Result:** ✅ React loads and renders - React works

#### Step 3: Find Exact Error
Created `debug.html` that imports the actual app modules:
```html
<script type="module">
  import { BasePlugin } from '@enxp/core';
  import { PluginProvider } from '@enxp/frontend';
  console.log('Imports successful!');
</script>
```

**Result:** ❌ ERROR FOUND!
```
GET http://localhost:3001/@fs/Users/tungtt22/Workspace/tungtt22/enxp/packages/core/src/index.js
404 (Not Found)

Error: The requested module '/@fs/.../packages/core/src/index.js' 
does not provide an export named 'BasePlugin'
```

### Root Cause Analysis

**The Problem:**
1. TypeScript packages compiled to CommonJS format (`module: "commonjs"`)
2. Vite dev server expected ES modules for browser
3. Vite was trying to load `.js` files but sources were `.ts`
4. Path aliases pointed to directories, not specific files

**Why It Happened:**
- Root `tsconfig.json` had `"module": "commonjs"` for Node.js compatibility
- Packages inherited this setting
- Vite couldn't transform CommonJS to ESM for browser dynamically
- Browser tried to import `.js` files that didn't match TypeScript sources

### Solution Applied

Modified `frontend-app/vite.config.ts` to point directly to TypeScript source files:

**Before:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

**After:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  resolve: {
    alias: {
      '@enxp/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
      '@enxp/backend': path.resolve(__dirname, '../packages/backend/src/index.ts'),
      '@enxp/frontend': path.resolve(__dirname, '../packages/frontend/src/index.ts'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  optimizeDeps: {
    exclude: ['@enxp/core', '@enxp/frontend', '@enxp/backend'],
  }
})
```

**Key Changes:**
1. **Aliases point to `.ts` files directly** - Not directories or `.js` files
2. **Added `.ts` and `.tsx` to extensions** - Vite knows to process TypeScript
3. **Excluded packages from optimizeDeps** - Prevent pre-bundling that causes issues

### Verification

Created `working.html` test page with fixed configuration:
```html
<script type="module">
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import { BasePlugin } from '@enxp/core';
  import { PluginProvider } from '@enxp/frontend';
  
  console.log('✅ All imports successful!');
  console.log('BasePlugin:', BasePlugin);
  console.log('PluginProvider:', PluginProvider);
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement('h1', null, '✅ React Rendering Works!'));
</script>
```

**Result:** ✅ ALL GREEN
- Imports worked
- React rendered
- Console showed no errors
- Main app at http://localhost:3001 now displays correctly

### Testing Checklist Performed

- ✅ Frontend loads without blank page
- ✅ Dashboard displays with stats cards
- ✅ Navigation works between pages
- ✅ Server status indicators show "Online"
- ✅ Plugin cards display hello-world plugin
- ✅ Console shows no errors
- ✅ Hot module replacement works
- ✅ API proxy to backend functions

### Why This Solution Works

**Vite's Module Resolution:**
1. Browser requests `import { BasePlugin } from '@enxp/core'`
2. Vite sees alias: `@enxp/core` → `../packages/core/src/index.ts`
3. Vite processes TypeScript file with esbuild
4. Vite transforms to ES module format
5. Vite serves transformed JavaScript to browser

**Without the fix:**
1. Browser requests `import { BasePlugin } from '@enxp/core'`
2. Vite looks in `node_modules/@enxp/core`
3. Finds `package.json` with `"main": "dist/index.js"`
4. Tries to load `dist/index.js` (CommonJS format)
5. ❌ Can't convert CommonJS to ESM for browser
6. ❌ Browser gets error or blank page

### Lessons Learned

1. **Vite requires ES modules for browser code**
   - Can't use CommonJS in browser context
   - Must either compile to ESM or use source files

2. **Path aliases must point to actual files**
   - Not directories
   - Include file extensions (.ts, .tsx)

3. **TypeScript source files work better than dist**
   - Vite can transform TypeScript natively
   - Avoids module format issues
   - Enables better dev experience with source maps

4. **optimizeDeps exclusion prevents pre-bundling issues**
   - Packages that change frequently should be excluded
   - Prevents stale cached versions
   - Allows real-time updates

### Prevention for Future Projects

```typescript
// vite.config.ts template for monorepos
export default defineConfig({
  resolve: {
    alias: {
      // Always point to .ts/.tsx source files
      '@mypackage': path.resolve(__dirname, '../packages/mypackage/src/index.ts'),
    },
    // Always include TypeScript extensions
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  optimizeDeps: {
    // Exclude internal packages
    exclude: ['@mypackage'],
  }
})
```

### Alternative Solutions Considered

1. **Compile packages to ESM:**
   ```json
   {
     "compilerOptions": {
       "module": "esnext"
     }
   }
   ```
   **Rejected because:** Would break Node.js backend compatibility

2. **Use dual package.json exports:**
   ```json
   {
     "exports": {
       ".": {
         "import": "./dist/index.mjs",
         "require": "./dist/index.js"
       }
     }
   }
   ```
   **Rejected because:** More complex build setup, harder to debug

3. **Bundle packages with Rollup/Webpack:**
   **Rejected because:** Added complexity, slower builds, worse DX

4. **✅ Selected: Vite aliases to TypeScript sources**
   - Simple configuration
   - Fast development
   - No build step needed for dev
   - Source maps work perfectly

---

## Issue #6: Missing Root Element in Debug Pages

**Date:** Debug phase  
**Severity:** ⚠️ Testing Error  
**Component:** Test HTML files

### Problem Description
Created debug.html to test imports but forgot to include:
```html
<div id="root"></div>
```

Console showed:
```
Root element: NOT FOUND ✗
ERROR: Root element disappeared!
```

### Solution Applied
Added root div to body:
```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

### Prevention
- Always include mounting point for React apps
- Use template HTML files for consistency

---

## Common Commands Reference

### Check Port Usage
```bash
# macOS/Linux
lsof -i :3000
lsof -i :3001

# Windows
netstat -ano | findstr :3000
```

### Kill Processes
```bash
# By port
lsof -ti:3000 | xargs kill -9

# By name
pkill -f "ts-node server.ts"
pkill -f "vite"

# By PID
kill -9 <PID>
```

### View Logs
```bash
# Backend log
tail -f logs/backend.log

# Frontend log
tail -f /tmp/vite.log

# Real-time follow
tail -f -n 100 logs/backend.log
```

### Restart Services
```bash
# Complete restart
pkill -f "ts-node"
pkill -f "vite"
cd /Users/tungtt22/Workspace/tungtt22/enxp
nohup npx ts-node server.ts > logs/backend.log 2>&1 &
cd frontend-app
nohup npm run dev > /tmp/vite.log 2>&1 &
```

---

## Error Messages Quick Reference

| Error Message | Component | Solution |
|--------------|-----------|----------|
| `Cannot find module './dist/index.js'` | Build | Run `npm run build` |
| `error TS6304: Circular graph` | TypeScript | Add `composite: true` |
| `File is not under 'rootDir'` | Plugin | Use standalone tsconfig |
| `suspended` in terminal | Server | Use `nohup` command |
| Blank page in browser | Frontend | Check vite.config.ts aliases |
| `404 (Not Found)` for module | Vite | Point aliases to .ts files |
| `EADDRINUSE` | Server | Port in use, kill process |

---

## Health Check Commands

### Backend Status
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"...","plugins":[...]}
```

### Plugin API
```bash
curl http://localhost:3000/api/plugins/hello-world/hello
# Expected: {"message":"Hello from HelloWorld plugin!"}
```

### Frontend Status
```bash
# Check Vite is running
ps aux | grep vite

# Check port is listening
lsof -i :3001

# Test in browser
open http://localhost:3001
```

---

## Performance Troubleshooting

### Slow Build Times
```bash
# Use watch mode for development
npm run build -- --watch

# Build only what changed
npm run build --workspace=@enxp/core
```

### High Memory Usage
```bash
# Check Node.js memory
ps aux | grep node

# Increase Node.js heap size if needed
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

---

## Summary of All Fixes

1. ✅ **TypeScript Composite:** Added `composite: true` to all packages
2. ✅ **Plugin RootDir:** Made plugin tsconfig standalone
3. ✅ **CLI Build:** Built CLI package before use
4. ✅ **Server Suspension:** Used `nohup` for background processes
5. ✅ **Blank Page:** Fixed Vite aliases to point to TypeScript sources
6. ✅ **Module Resolution:** Added `.ts`/`.tsx` extensions to Vite config
7. ✅ **Optimization:** Excluded internal packages from `optimizeDeps`

**All Issues Resolved - Platform Fully Functional ✅**

---

*Last Updated: November 10, 2025*
