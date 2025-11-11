# Getting Started with ENXP

This guide will walk you through setting up the ENXP platform and creating your first plugin.

## Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url> enxp
cd enxp

# Install dependencies
npm install

# Build all packages
npm run build
```

### 2. Verify Installation

```bash
# Check CLI is working
npm run plugin -- --help

# Should output available commands
```

## Creating Your First Plugin

Let's create a simple "Hello World" backend plugin.

### Step 1: Generate Plugin

```bash
npm run plugin create hello-world -- --type backend --description "My first plugin"
```

This creates:
```
plugins/hello-world/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

### Step 2: Edit Plugin Code

Open `plugins/hello-world/src/index.ts`:

```typescript
import { BackendPlugin } from '@enxp/backend';
import { Router } from 'express';

export default class HelloWorldPlugin extends BackendPlugin {
  constructor() {
    super('hello-world', 'Hello World', '1.0.0', {
      description: 'My first plugin',
    });
  }

  async onInitialize(): Promise<void> {
    this.log('info', '🚀 Hello World plugin initializing...');
  }

  async onActivate(): Promise<void> {
    this.log('info', '✅ Hello World plugin activated!');
  }

  registerRoutes(router: Router): void {
    // Simple GET endpoint
    router.get('/hello', (req, res) => {
      res.json({ 
        message: 'Hello, World!',
        timestamp: new Date().toISOString()
      });
    });

    // Endpoint with parameters
    router.get('/hello/:name', (req, res) => {
      res.json({
        message: `Hello, ${req.params.name}!`,
        timestamp: new Date().toISOString()
      });
    });

    // POST endpoint
    router.post('/greet', (req, res) => {
      const { name, language } = req.body;
      
      const greetings: Record<string, string> = {
        en: 'Hello',
        es: 'Hola',
        fr: 'Bonjour',
        de: 'Guten Tag',
      };

      const greeting = greetings[language] || greetings.en;
      
      res.json({
        message: `${greeting}, ${name}!`
      });
    });
  }
}
```

### Step 3: Install Dependencies

```bash
cd plugins/hello-world
npm install
cd ../..
```

### Step 4: Build the Plugin

```bash
npm run plugin build hello-world
```

### Step 5: Create Backend Server

Create `server.ts` in the root:

```typescript
import { BackendServer } from '@enxp/backend';
import path from 'path';

async function main() {
  // Create server instance
  const server = new BackendServer(3000, {
    name: 'ENXP Platform',
    version: '1.0.0',
  });

  // Load plugins
  const helloWorldPlugin = path.join(__dirname, 'plugins/hello-world/dist/index.js');
  
  try {
    await server.loadPlugin(helloWorldPlugin);
    await server.activatePlugin('hello-world');
    
    // Start server
    await server.start();
    
    console.log('✅ Server started successfully!');
    console.log('🔌 Plugins loaded:');
    server.getPluginManager().getPlugins().forEach(plugin => {
      console.log(`   - ${plugin.name} (${plugin.id}) v${plugin.version}`);
    });
    console.log('\n📡 API Endpoints:');
    console.log('   - GET  http://localhost:3000/health');
    console.log('   - GET  http://localhost:3000/api/plugins/hello-world/hello');
    console.log('   - GET  http://localhost:3000/api/plugins/hello-world/hello/:name');
    console.log('   - POST http://localhost:3000/api/plugins/hello-world/greet');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
```

### Step 6: Run the Server

```bash
# Compile and run
npx ts-node server.ts
```

### Step 7: Test Your Plugin

Open another terminal:

```bash
# Test basic endpoint
curl http://localhost:3000/api/plugins/hello-world/hello

# Test with parameter
curl http://localhost:3000/api/plugins/hello-world/hello/Alice

# Test POST endpoint
curl -X POST http://localhost:3000/api/plugins/hello-world/greet \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","language":"es"}'
```

## Creating a Frontend Plugin

### Step 1: Generate Plugin

```bash
npm run plugin create my-dashboard -- --type frontend --description "Dashboard plugin"
```

### Step 2: Edit Plugin Code

Edit `plugins/my-dashboard/src/index.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { FrontendPlugin, RouteDefinition, MenuItem, Widget } from '@enxp/frontend';

export default class MyDashboardPlugin extends FrontendPlugin {
  constructor() {
    super('my-dashboard', 'My Dashboard', '1.0.0', {
      description: 'Dashboard plugin',
    });
  }

  registerRoutes(): RouteDefinition[] {
    return [
      {
        path: '/dashboard',
        component: this.DashboardPage,
        meta: {
          title: 'Dashboard',
        },
      },
    ];
  }

  registerMenuItems(): MenuItem[] {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: '📊',
        order: 1,
      },
    ];
  }

  registerWidgets(): Widget[] {
    return [
      {
        id: 'stats-widget',
        name: 'Statistics',
        component: this.StatsWidget,
        size: { width: 400, height: 300 },
      },
    ];
  }

  private DashboardPage: React.FC = () => {
    return (
      <div style={{ padding: '20px' }}>
        <h1>📊 Dashboard</h1>
        <p>Welcome to your dashboard!</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
            <h3>Total Users</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>1,234</p>
          </div>
          <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
            <h3>Active Sessions</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>56</p>
          </div>
          <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
            <h3>Revenue</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>$12,345</p>
          </div>
        </div>
      </div>
    );
  };

  private StatsWidget: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, sessions: 0 });

    useEffect(() => {
      // Fetch stats from API
      fetch('/api/stats')
        .then(res => res.json())
        .then(setStats)
        .catch(console.error);
    }, []);

    return (
      <div style={{ padding: '20px' }}>
        <h3>Live Statistics</h3>
        <div>Users: {stats.users}</div>
        <div>Sessions: {stats.sessions}</div>
      </div>
    );
  };
}
```

### Step 3: Build and Install

```bash
# Build
npm run plugin build my-dashboard

# Install
npm run plugin install ./plugins/my-dashboard
```

## Next Steps

### Explore Examples

Check out the `docs/EXAMPLES.md` for more plugin examples:
- REST API Plugin
- Authentication Plugin
- Database Plugin
- Notification Plugin
- Theme Plugin

### Read Documentation

- [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md)
- [API Reference](./API.md)
- [Best Practices](./BEST_PRACTICES.md)

### Development Workflow

1. **Create Plugin**: Use CLI to scaffold
2. **Develop**: Edit code with TypeScript
3. **Build**: Compile with `npm run plugin build`
4. **Test**: Run platform and test endpoints
5. **Debug**: Use `npm run plugin dev` for watch mode
6. **Deploy**: Install to production platform

### Hot Reload Development

For rapid development:

```bash
# Terminal 1: Watch and rebuild plugin
npm run plugin dev hello-world

# Terminal 2: Run server with nodemon
npx nodemon --watch plugins/hello-world/dist server.ts
```

## Common Patterns

### Environment Configuration

```typescript
async onInitialize(): Promise<void> {
  // Load from plugin config
  const apiKey = this.context.config.settings.apiKey;
  
  // Or from environment
  const dbUrl = process.env.DATABASE_URL || 'localhost';
}
```

### Inter-Plugin Communication

```typescript
// Plugin A: Emit event
this.emit('order:created', orderData);

// Plugin B: Listen to event
this.context.events.on('plugin:orders:order:created', (order) => {
  // Handle the order
});
```

### Error Handling

```typescript
registerRoutes(router: Router): void {
  router.get('/data', async (req, res) => {
    try {
      const data = await this.fetchData();
      res.json({ data });
    } catch (error) {
      this.log('error', 'Failed to fetch data', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
```

## Troubleshooting

### Plugin Not Loading

```bash
# Check if plugin is built
ls -la plugins/hello-world/dist/

# Rebuild if needed
npm run plugin build hello-world

# Check for errors
npm run plugin build hello-world -- --verbose
```

### TypeScript Errors

```bash
# Install dependencies
cd plugins/hello-world
npm install

# Check tsconfig
cat tsconfig.json
```

### Runtime Errors

Check server logs for detailed error messages. Enable debug mode:

```typescript
const server = new BackendServer(3000, {
  debug: true,
  logLevel: 'debug',
});
```

## What's Next?

- Create more complex plugins
- Add database integration
- Implement authentication
- Build dashboard UI
- Deploy to production

Happy coding! 🚀
