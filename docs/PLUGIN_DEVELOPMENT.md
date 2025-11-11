# Plugin Development Guide

## Overview

This guide will help you create custom plugins for the ENXP platform. Plugins can extend the platform's functionality by adding new features, APIs, UI components, and more.

> 💡 **Using Shared Components?** See [CODE_OPTIMIZATION.md](CODE_OPTIMIZATION.md) for the complete shared component library and optimization patterns

## Plugin Types

### 1. Backend Plugins
Backend plugins run on the server and can:
- Add new API endpoints
- Register middleware
- Define database models
- Create background services
- Handle events

### 2. Frontend Plugins
Frontend plugins run in the browser and can:
- Add new React components
- Register routes/pages
- Create widgets
- Define themes
- Add menu items
- **Use shared components** (PageHeader, Card, Badge, ProgressBar, EmptyState)

### 3. Shared Plugins
Shared plugins provide utilities used by both backend and frontend:
- Helper functions
- Constants
- Type definitions
- Validation logic

## Creating Your First Plugin

### Step 1: Generate Plugin Scaffold

```bash
# Backend plugin
npm run plugin create my-auth-plugin -- --type backend --description "Authentication plugin"

# Frontend plugin  
npm run plugin create my-dashboard -- --type frontend --description "Dashboard plugin"
```

### Step 2: Install Dependencies

```bash
cd plugins/my-auth-plugin
npm install
```

### Step 3: Implement Plugin Logic

Edit `src/index.ts` or `src/index.tsx`:

```typescript
import { BackendPlugin } from '@enxp/backend';
import { Router } from 'express';

export default class MyAuthPlugin extends BackendPlugin {
  constructor() {
    super('my-auth', 'My Auth', '1.0.0', {
      description: 'Custom authentication',
    });
  }

  async onInitialize(): Promise<void> {
    // Load configuration
    // Connect to database
    this.log('info', 'Auth plugin initialized');
  }

  async onActivate(): Promise<void> {
    // Start services
    this.log('info', 'Auth plugin activated');
  }

  registerRoutes(router: Router): void {
    router.post('/login', async (req, res) => {
      const { username, password } = req.body;
      // Authentication logic here
      res.json({ token: 'jwt-token' });
    });

    router.post('/logout', async (req, res) => {
      // Logout logic
      res.json({ success: true });
    });

    router.get('/me', async (req, res) => {
      // Get current user
      res.json({ user: { id: 1, name: 'John' } });
    });
  }
}
```

### Step 4: Build the Plugin

```bash
npm run build
```

### Step 5: Install and Test

```bash
# From platform root
npm run plugin install ./plugins/my-auth-plugin
```

## Plugin Structure

### Required Files

```
my-plugin/
├── src/
│   └── index.ts         # Plugin entry point
├── package.json         # Plugin metadata
├── tsconfig.json        # TypeScript config
└── README.md            # Plugin documentation
```

### package.json

```json
{
  "name": "@enxp-plugin/my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@enxp/core": "^1.0.0",
    "@enxp/backend": "^1.0.0"
  }
}
```

## Advanced Features

### Accessing Plugin Context

```typescript
class MyPlugin extends BackendPlugin {
  async onInitialize(): Promise<void> {
    // Access logger
    this.log('info', 'Hello');
    
    // Emit events
    this.emit('data:loaded', { count: 100 });
    
    // Listen to events
    this.context.events.on('user:created', (user) => {
      this.log('info', 'User created:', user);
    });
    
    // Get services
    const db = this.getService('database');
  }
}
```

### Inter-Plugin Communication

```typescript
// Plugin A
this.emit('order:created', order);

// Plugin B  
this.context.events.on('plugin:plugin-a:order:created', (order) => {
  // Handle order
});

// Call another plugin
const result = await this.callPlugin('inventory', 'checkStock', productId);
```

### Database Integration

```typescript
class MyPlugin extends BackendPlugin {
  registerModels(): void {
    // Define models
    this.models = {
      User: {
        schema: {
          name: String,
          email: String,
          createdAt: Date,
        }
      }
    };
  }

  async getUserById(id: string) {
    const db = this.getService('database');
    return db.User.findById(id);
  }
}
```

### Middleware

```typescript
registerMiddleware(app: any): void {
  // Add authentication middleware
  app.use('/api/protected', (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  });
}
```

## Frontend Plugin Development

### Component Registration

```typescript
import React from 'react';
import { FrontendPlugin } from '@enxp/frontend';

export default class MyUIPlugin extends FrontendPlugin {
  registerComponents(): Map<string, React.ComponentType> {
    const components = new Map();
    
    components.set('Button', this.ButtonComponent);
    components.set('Card', this.CardComponent);
    
    return components;
  }

  private ButtonComponent: React.FC<{ label: string }> = ({ label }) => {
    return <button className="custom-btn">{label}</button>;
  };

  private CardComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="card">{children}</div>;
  };
}
```

### Route Registration

```typescript
registerRoutes(): RouteDefinition[] {
  return [
    {
      path: '/dashboard',
      component: this.DashboardPage,
      meta: {
        title: 'Dashboard',
        protected: true,
      },
    },
    {
      path: '/settings',
      component: this.SettingsPage,
      meta: {
        title: 'Settings',
      },
    },
  ];
}
```

### Widget Registration

```typescript
registerWidgets(): Widget[] {
  return [
    {
      id: 'user-stats',
      name: 'User Statistics',
      component: this.UserStatsWidget,
      defaultProps: { refreshInterval: 30000 },
      size: { width: 400, height: 300 },
    },
  ];
}

private UserStatsWidget: React.FC = () => {
  const [stats, setStats] = React.useState(null);
  
  React.useEffect(() => {
    // Fetch stats
  }, []);

  return (
    <div className="widget">
      <h3>User Stats</h3>
      {/* Display stats */}
    </div>
  );
};
```

## Best Practices

### 1. Use Shared Components (Frontend Plugins)

**Always use the shared component library for consistent UI:**

```typescript
import { PageHeader, Card, Badge, ProgressBar, EmptyState } from '@enxp/frontend';
import { getStatusColor, getStatusVariant } from '@enxp/frontend';

const MyPlugin: React.FC = () => (
  <>
    <PageHeader 
      title="My Plugin"
      subtitle="Built with shared components"
    />
    <Card title="Example">
      <Badge status="active" text="Using Shared UI" />
    </Card>
  </>
);
```

**Benefits:**
- ✅ 26% less code to write
- ✅ Consistent look and feel
- ✅ Type-safe with TypeScript
- ✅ Automatic theme support

> See [CODE_OPTIMIZATION.md](CODE_OPTIMIZATION.md) for complete component library

### 2. Error Handling

```typescript
async onActivate(): Promise<void> {
  try {
    await this.initializeDatabase();
    this.log('info', 'Database initialized');
  } catch (error) {
    this.log('error', 'Failed to initialize database', error);
    throw error;
  }
}
```

### 3. Configuration

```typescript
async onInitialize(): Promise<void> {
  const config = this.context.config.settings;
  
  this.apiKey = config.apiKey || process.env.API_KEY;
  this.endpoint = config.endpoint || 'https://api.example.com';
}
```

### 4. Cleanup

```typescript
async onDestroy(): Promise<void> {
  // Close connections
  if (this.dbConnection) {
    await this.dbConnection.close();
  }
  
  // Clear timers
  if (this.interval) {
    clearInterval(this.interval);
  }
  
  // Remove event listeners
  this.context.events.off('data:updated', this.handleUpdate);
}
```

### 5. Testing

```typescript
// tests/plugin.test.ts
import MyPlugin from '../src';

describe('MyPlugin', () => {
  let plugin: MyPlugin;

  beforeEach(() => {
    plugin = new MyPlugin();
  });

  it('should initialize correctly', async () => {
    await plugin.initialize(mockContext);
    expect(plugin.getState()).toBe('initialized');
  });
});
```

### 5. Documentation

Always include:
- README.md with usage examples
- API documentation
- Configuration options
- Dependencies
- Version changelog

## Plugin Dependencies

### Declaring Dependencies

```json
{
  "dependencies": {
    "@enxp/core": "^1.0.0",
    "@enxp/backend": "^1.0.0",
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```

### Plugin Dependencies

In plugin metadata:

```typescript
constructor() {
  super('my-plugin', 'My Plugin', '1.0.0', {
    dependencies: ['auth-plugin', 'database-plugin'],
  });
}
```

## Publishing Your Plugin

### 1. Prepare for Release

```bash
# Update version
npm version patch|minor|major

# Build
npm run build

# Test
npm test
```

### 2. Create Package

```bash
npm pack
```

### 3. Publish to Registry

```bash
npm publish --access public
```

## Troubleshooting

### Common Issues

1. **Plugin not loading**
   - Check build output in `dist/`
   - Verify package.json is correct
   - Ensure dependencies are installed

2. **TypeScript errors**
   - Run `npm install` in plugin directory
   - Check tsconfig.json
   - Verify @enxp/* packages are available

3. **Runtime errors**
   - Check plugin logs
   - Verify initialization sequence
   - Check dependencies are loaded

## Resources

- [API Reference](./API.md)
- [Examples](./EXAMPLES.md)
- [Best Practices](./BEST_PRACTICES.md)
- [Platform Documentation](../README.md)
