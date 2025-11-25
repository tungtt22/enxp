# 🚀 ENXP Micro Frontend - Quick Reference

## Three Ways to Run Plugins

### 🔵 Integrated Mode
```bash
# Plugin bundled with host
cd frontend-app
pnpm run dev
```

### 🟢 Remote Mode (Micro Frontend)
```bash
# Terminal 1: Host
cd frontend-app && pnpm run dev

# Terminal 2+: Plugins
cd plugins/projects-management && pnpm run dev
cd plugins/activity-management && pnpm run dev
```

### 🟡 Standalone Mode
```bash
# Run plugin independently
cd plugins/projects-management
pnpm run dev:standalone
# → http://localhost:4001
```

## One Command Development

```bash
./scripts/dev-microfrontend.sh
```

Starts:
- ✅ Backend (port 3000)
- ✅ Host App (port 3001)
- ✅ All Plugins (ports 4001-4003)

## Plugin Ports

| Plugin | Port |
|--------|------|
| projects-management | 4001 |
| activity-management | 4002 |
| templates-management | 4003 |
| Host App | 3001 |
| Backend API | 3000 |

## Create New Plugin

```bash
# 1. Copy template
cp -r plugins/projects-management plugins/my-plugin

# 2. Update config
cd plugins/my-plugin
# Edit: plugin.json (id, name)
# Edit: vite.config.ts (name, port)
# Edit: package.json (name)

# 3. Install & run
pnpm install
pnpm run dev:standalone
```

## Build Commands

```bash
# Single plugin
cd plugins/projects-management
pnpm run build              # Production build
pnpm run build:standalone   # Standalone build

# Script helper
./scripts/build-plugin.sh projects-management
```

## Plugin API

```typescript
// Load remote plugin
const plugin = await pluginRuntimeLoader.loadRemote({
  id: 'projects-management',
  url: 'http://localhost:4001/assets/remoteEntry.js',
  scope: 'projects-management',
  module: './Plugin',
});

// Bootstrap standalone
const runtime = await bootstrapStandalone(plugin, {
  environment: 'client',
  manifest: pluginManifest,
  apiBaseUrl: '/api',
});
```

## Configuration Files

```
plugin/
├── vite.config.ts          # Module Federation setup
├── plugin.json             # Plugin manifest
├── package.json            # Dependencies & scripts
├── index.html              # Standalone entry
├── .env.development        # Dev environment
└── src/
    ├── index.ts            # Plugin class
    ├── standalone.tsx      # Standalone bootstrap
    └── client/
        └── App.tsx         # Standalone UI
```

## Shared Dependencies

Always configure as `singleton: true`:
- react
- react-dom
- react-router-dom
- @enxp/core
- @enxp/frontend

## Troubleshooting

```bash
# Port in use
lsof -ti:4001 | xargs kill

# Check if plugin is accessible
curl http://localhost:4001/assets/remoteEntry.js

# View federation errors
# Open browser console → Look for Module Federation errors
```

## URLs

### Development
- Host: `http://localhost:3001`
- Plugin Remote: `http://localhost:4001/assets/remoteEntry.js`
- Plugin Standalone: `http://localhost:4001`

### Production
- Host: `https://app.example.com`
- Plugin Remote: `https://cdn.example.com/plugins/projects/remoteEntry.js`
- Plugin Standalone: `https://projects.example.com`

## File Structure

```typescript
// Host: plugins.config.ts
export const REMOTE_PLUGIN_CONFIGS = [
  {
    id: 'projects-management',
    url: 'http://localhost:4001/assets/remoteEntry.js',
    scope: 'projects-management',
    module: './Plugin',
  },
];

// Plugin: vite.config.ts
federation({
  name: 'projects-management',
  filename: 'remoteEntry.js',
  exposes: {
    './Plugin': './src/index.ts',
  },
  shared: { /* ... */ },
})
```

## Next Steps

1. ✅ Read [Complete Guide](docs/MICRO_FRONTEND_GUIDE.md)
2. ✅ Try standalone mode: `cd plugins/projects-management && pnpm run dev:standalone`
3. ✅ Try remote mode: `./scripts/dev-microfrontend.sh`
4. ✅ Create your first plugin
5. ✅ Deploy to production

---

💡 **Pro Tip**: Use standalone mode for rapid plugin development without running the full stack!
