# Micro Frontend Architecture Guide

## Overview

The ENXP platform now supports a **micro frontend architecture** using **Module Federation**. This allows plugins to run in three modes:

1. **Integrated Mode**: Plugin bundled with the host application
2. **Remote Mode**: Plugin loaded dynamically at runtime from remote URL
3. **Standalone Mode**: Plugin runs as independent application

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Host Application                       │
│                  (frontend-app)                         │
│  ┌───────────────────────────────────────────────┐     │
│  │         Plugin Runtime Loader                  │     │
│  │  - Dynamic remote module loading               │     │
│  │  - Shared dependency management                │     │
│  └───────────────────────────────────────────────┘     │
│                        ↓                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Plugin A   │  │  Plugin B   │  │  Plugin C   │    │
│  │  (Remote)   │  │  (Remote)   │  │  (Local)    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘

     ↓ OR ↓             ↓ OR ↓             ↓ OR ↓

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Plugin A   │  │  Plugin B   │  │  Plugin C   │
│ (Standalone)│  │ (Standalone)│  │ (Standalone)│
│    :4001    │  │    :4002    │  │    :4003    │
└─────────────┘  └─────────────┘  └─────────────┘
```

## Plugin Modes

### 1. Integrated Mode
Plugin is compiled and bundled with the host application.

**Use when:**
- Core functionality required at startup
- Need guaranteed availability
- Optimize for initial load performance

**Build:**
```bash
cd plugins/projects-management
pnpm run build
```

### 2. Remote Mode
Plugin is loaded dynamically from a remote URL at runtime.

**Use when:**
- Plugin can be loaded on-demand
- Want to deploy plugins independently
- Need version flexibility
- Reduce initial bundle size

**Development:**
```bash
# Terminal 1: Host app
cd frontend-app
pnpm run dev

# Terminal 2: Remote plugin
cd plugins/projects-management
pnpm run dev
```

**Production:**
```bash
# Build plugin for remote deployment
cd plugins/projects-management
pnpm run build

# Deploy dist/assets/remoteEntry.js to CDN
# Update host app config with remote URL
```

### 3. Standalone Mode
Plugin runs as a complete, independent application.

**Use when:**
- Testing plugin in isolation
- Developing without host app
- Deploying as separate microservice
- Plugin needs to work independently

**Run:**
```bash
cd plugins/projects-management
pnpm run dev:standalone
```

Access at: `http://localhost:4001`

## Configuration

### Plugin Configuration (`vite.config.ts`)

```typescript
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'projects-management',
      filename: 'remoteEntry.js',
      exposes: {
        './Plugin': './src/index.ts',
        './Client': './src/client/index.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@enxp/core': { singleton: true },
      },
    }),
  ],
  server: {
    port: 4001,
    cors: true,
  },
});
```

### Host Configuration (`plugins.config.ts`)

```typescript
export const REMOTE_PLUGIN_CONFIGS: RemotePluginConfig[] = [
  {
    id: 'projects-management',
    url: 'http://localhost:4001/assets/remoteEntry.js',
    scope: 'projects-management',
    module: './Plugin',
  },
];
```

## Development Workflow

### Option 1: All-in-One Development

Start everything with one command:

```bash
chmod +x scripts/dev-microfrontend.sh
./scripts/dev-microfrontend.sh
```

This starts:
- Backend API (port 3000)
- Host App (port 3001)
- All plugins (ports 4001-4003)

### Option 2: Selective Development

Start only what you need:

```bash
# Backend
cd packages/backend && pnpm run dev

# Host app
cd frontend-app && pnpm run dev

# Specific plugin(s)
cd plugins/projects-management && pnpm run dev
```

### Option 3: Standalone Plugin Development

Develop plugin without host app:

```bash
cd plugins/projects-management
pnpm run dev:standalone
```

## Creating a New Micro Frontend Plugin

### 1. Create Plugin Structure

```bash
mkdir -p plugins/my-plugin/src/{client,server,shared}
cd plugins/my-plugin
```

### 2. Add Configuration Files

**package.json:**
```json
{
  "name": "@enxp/plugin-my-plugin",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "dev:standalone": "vite --mode standalone",
    "build": "tsc && vite build",
    "build:standalone": "vite build --mode standalone"
  },
  "dependencies": {
    "@enxp/core": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "^1.3.5",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

**plugin.json:**
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "engines": { "enxp": "^1.0.0" },
  "activationEvents": ["onStartup"],
  "main": "./dist/index.js",
  "contributes": {
    "routes": [
      { "path": "/my-plugin", "title": "My Plugin" }
    ]
  }
}
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'my-plugin',
      filename: 'remoteEntry.js',
      exposes: {
        './Plugin': './src/index.ts',
        './Client': './src/client/index.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@enxp/core': { singleton: true },
      },
    }),
  ],
  server: {
    port: 4004, // Use next available port
    cors: true,
  },
});
```

### 3. Implement Plugin

**src/index.ts:**
```typescript
import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateClient } from './client';
import { activateServer } from './server';

export class MyPlugin extends Plugin {
  constructor() {
    super('my-plugin', 'My Plugin', '1.0.0');
  }

  async activatePlugin(context: ExtendedPluginContext) {
    if (context.environment === 'client') {
      await activateClient(context);
    } else {
      await activateServer(context);
    }
  }
}

export default MyPlugin;
```

**src/standalone.tsx:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { bootstrapStandalone } from '@enxp/core';
import MyPlugin from './index';
import { App } from './client/App';
import manifest from '../plugin.json';

async function bootstrap() {
  const plugin = new MyPlugin();
  const runtime = await bootstrapStandalone(plugin, {
    environment: 'client',
    manifest,
    apiBaseUrl: '/api',
  });

  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <BrowserRouter>
      <App context={runtime.getContext()} />
    </BrowserRouter>
  );
}

bootstrap();
```

### 4. Register with Host

Add to `frontend-app/src/config/plugins.config.ts`:

```typescript
{
  id: 'my-plugin',
  url: 'http://localhost:4004/assets/remoteEntry.js',
  scope: 'my-plugin',
  module: './Plugin',
}
```

## Shared Dependencies

Shared dependencies are loaded once and reused across host and all plugins.

**Always share:**
- `react` (singleton: true)
- `react-dom` (singleton: true)
- `react-router-dom` (singleton: true)
- `@enxp/core` (singleton: true)
- `@enxp/frontend` (singleton: true)

**Version Management:**
- Use `requiredVersion` for strict version requirements
- Use `singleton: true` to ensure single instance
- Set `eager: true` for critical dependencies

## Deployment

### Development
```bash
./scripts/dev-microfrontend.sh
```

### Production

**Build all plugins:**
```bash
./scripts/build-plugin.sh projects-management
./scripts/build-plugin.sh activity-management
./scripts/build-plugin.sh templates-management
```

**Deploy:**
1. Upload plugin `dist/` folders to CDN
2. Update `plugins.config.ts` with production URLs
3. Build and deploy host app

## Troubleshooting

### Plugin fails to load
- Check CORS headers are enabled
- Verify remote URL is accessible
- Check browser console for Module Federation errors
- Ensure shared dependencies versions match

### Shared dependency conflicts
- Check all plugins use same major version
- Enable `singleton: true` for conflicting packages
- Review Vite build output for warnings

### Development server issues
- Ensure unique ports for each plugin
- Check firewall allows local network access
- Verify no port conflicts with other services

## Best Practices

1. **Version Discipline**: Keep shared dependencies aligned
2. **Lazy Loading**: Load plugins on-demand when possible
3. **Error Boundaries**: Wrap remote components in error boundaries
4. **Loading States**: Show loading UI while fetching remotes
5. **Fallbacks**: Provide fallback UI if remote fails
6. **Type Safety**: Share types between plugins via `@enxp/core`
7. **Testing**: Test plugins in all three modes

## Examples

See `plugins/projects-management/` for a complete reference implementation.

## Resources

- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [Vite Plugin Federation](https://github.com/originjs/vite-plugin-federation)
- [Micro Frontend Patterns](https://micro-frontends.org/)
