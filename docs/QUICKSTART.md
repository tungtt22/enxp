# Quick Start Guide

Get started with ENXP in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Basic TypeScript knowledge

## Installation

```bash
# 1. Clone and install
git clone <repo-url> enxp
cd enxp
npm install

# 2. Build platform
npm run build

# 3. Verify installation
npm run plugin -- --help
```

## Create Your First Plugin

```bash
# Create a backend plugin
npm run plugin create my-first-plugin -- --type backend

# Navigate to plugin
cd plugins/my-first-plugin

# Install dependencies
npm install

# Go back to root
cd ../..
```

## Build and Run

```bash
# Build the plugin
npm run plugin build my-first-plugin

# Create a simple server (server.ts)
cat > server.ts << 'EOF'
import { BackendServer } from './packages/backend/src';
import path from 'path';

async function main() {
  const server = new BackendServer(3000);
  
  await server.loadPlugin(
    path.join(__dirname, 'plugins/my-first-plugin/dist/index.js')
  );
  await server.activatePlugin('my-first-plugin');
  await server.start();
  
  console.log('Server running on http://localhost:3000');
}

main();
EOF

# Run the server
npx ts-node server.ts
```

## Test Your Plugin

```bash
# In another terminal
curl http://localhost:3000/health
curl http://localhost:3000/api/plugins/my-first-plugin/hello
```

## What's Next?

- Read the [Getting Started Guide](./GETTING_STARTED.md) for detailed tutorial
- Check [Plugin Development](./PLUGIN_DEVELOPMENT.md) for best practices
- Explore [Examples](./EXAMPLES.md) for common patterns

## Development Workflow

```bash
# Watch mode for plugin development
npm run plugin dev my-first-plugin

# In another terminal, run server with auto-restart
npx nodemon --watch plugins/my-first-plugin/dist server.ts
```

## Common Commands

```bash
# Plugin Management
npm run plugin create <name>          # Create new plugin
npm run plugin build [name]           # Build plugin(s)
npm run plugin dev <name>             # Watch mode
npm run plugin list                   # List installed plugins
npm run plugin install <path>         # Install plugin
npm run plugin uninstall <id>         # Uninstall plugin

# Platform
npm run build                         # Build all packages
npm run dev                           # Dev mode (backend + frontend)
npm run clean                         # Clean build artifacts
```

That's it! You're ready to build plugins! 🚀
