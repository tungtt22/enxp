# Plugin Development Guide

## Overview

This guide will help you create custom plugins for the ENXP platform using the **VS Code-style plugin architecture**. Plugins use a unified structure with manifest-based loading, supporting both client and server environments in a single codebase.

> 💡 **Using Shared Components?** See [CODE_OPTIMIZATION.md](CODE_OPTIMIZATION.md) for the complete shared component library and optimization patterns

## Plugin Architecture

### VS Code-Inspired Design

ENXP uses a **unified plugin structure** similar to VS Code extensions:

- **Single plugin folder** containing both client and server code
- **Manifest file** (`plugin.json`) defines plugin metadata and contributions
- **Environment-aware activation** - same plugin works in client and server
- **Contribution points** - declare what the plugin contributes (APIs, commands, views)
- **Activation events** - control when plugins load

### Plugin Structure

```
my-plugin/
├── plugin.json          # Plugin manifest (required)
├── package.json         # NPM package metadata
├── tsconfig.json        # TypeScript configuration
├── README.md            # Documentation
└── src/
    ├── index.ts         # Main entry point
    ├── client/          # Client-side code (optional)
    │   └── index.ts
    ├── server/          # Server-side code (optional)
    │   ├── index.ts
    │   └── routes.ts
    └── shared/          # Shared utilities (optional)
        └── types.ts
```

### Key Concepts

**1. Unified Plugin Class**
- Extends `Plugin` base class
- Implements `activatePlugin(context)` method
- Single codebase for both environments

**2. Environment-Aware Activation**
- Check `context.environment` ('client' or 'server')
- Conditionally activate features based on environment

**3. Manifest-Based Configuration**
- `plugin.json` declares capabilities
- No need to register routes/commands programmatically in manifest

## Creating Your First Plugin

### Step 1: Create Plugin Structure

```bash
mkdir -p plugins/my-plugin/src/{client,server,shared}
cd plugins/my-plugin
npm init -y
```

### Step 2: Create Plugin Manifest

Create `plugin.json`:

```json
{
  "id": "my-plugin",
  "name": "my-plugin",
  "displayName": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "A sample plugin demonstrating the unified architecture",
  "publisher": "your-name",
  "main": "./dist/index.js",
  "activationEvents": [
    "onStartup"
  ],
  "contributes": {
    "api": {
      "basePath": "/api/plugins/my-plugin"
    },
    "commands": [
      {
        "command": "myPlugin.doSomething",
        "title": "Do Something"
      }
    ]
  }
}
```

### Step 3: Create package.json

```json
{
  "name": "@enxp/plugin-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@enxp/core": "^1.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

### Step 4: Create TypeScript Config

Create `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 5: Implement Plugin Class

Create `src/index.ts`:

```typescript
import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateServer } from './server';
import { activateClient } from './client';

/**
 * My Awesome Plugin
 * Supports both client and server environments
 */
export class MyPlugin extends Plugin {
  constructor() {
    super('my-plugin', 'My Awesome Plugin', '1.0.0', {
      description: 'A sample plugin demonstrating unified architecture',
    });
  }

  /**
   * Activate based on environment
   */
  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info(`Activating ${this.name} in ${context.environment} environment`);

    if (context.environment === 'server') {
      await activateServer(context);
    } else if (context.environment === 'client') {
      await activateClient(context);
    }

    context.logger.info(`${this.name} activated successfully`);
  }

  /**
   * OpenAPI specification for Swagger documentation
   */
  getOpenAPISpec(): any {
    return {
      paths: {
        '/items': {
          get: {
            summary: 'Get all items',
            responses: {
              '200': {
                description: 'List of items',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Item' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          Item: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    };
  }
}

// Default export for class-based loading
export default MyPlugin;
```

### Step 6: Implement Server Activation

Create `src/server/index.ts`:

```typescript
import { ExtendedPluginContext } from '@enxp/core';
import { Router } from 'express';

export function activateServer(context: ExtendedPluginContext): void {
  const router = Router();

  // Define routes
  router.get('/items', async (req, res) => {
    res.json({
      success: true,
      data: [
        { id: 1, name: 'Item 1', createdAt: new Date() },
        { id: 2, name: 'Item 2', createdAt: new Date() },
      ]
    });
  });

  router.post('/items', async (req, res) => {
    const { name } = req.body;
    res.status(201).json({
      success: true,
      data: { id: 3, name, createdAt: new Date() }
    });
  });

  // Get basePath from manifest
  const basePath = context.manifest.contributes?.api?.basePath || `/api/plugins/${context.manifest.id}`;

  // Register router with the platform
  context.events.emit('plugin:register-router', {
    pluginId: context.manifest.id,
    basePath,
    router,
  });

  context.logger.info(`Registered API routes at ${basePath}`);

  // Register commands
  context.events.on('command:myPlugin.doSomething', async () => {
    context.logger.info('Doing something...');
  });
}
```

### Step 7: Implement Client Activation (Optional)

Create `src/client/index.ts`:

```typescript
import { ExtendedPluginContext } from '@enxp/core';

export function activateClient(context: ExtendedPluginContext): void {
  context.logger.info('Client-side plugin activated');
  
  // Register UI components, routes, etc.
  // Example: context.ui.registerComponent('MyComponent', MyComponent);
}
```

### Step 8: Build and Test

```bash
# Install dependencies
npm install

# Build plugin
npm run build

# Start platform (from root)
cd ../..
npm start
```

Your plugin will be automatically loaded and available at:
- API: `http://localhost:3000/api/plugins/my-plugin/items`
- Swagger: `http://localhost:3000/api-docs`

## Plugin Manifest Reference

### plugin.json Schema

```json
{
  "id": "string (required)",
  "name": "string (required)",
  "displayName": "string (optional)",
  "version": "string (required, semver)",
  "description": "string (optional)",
  "publisher": "string (optional)",
  "main": "string (required, path to entry point)",
  "activationEvents": ["string (optional)"],
  "contributes": {
    "api": {
      "basePath": "string (optional, custom API base path)"
    },
    "commands": [
      {
        "command": "string (command identifier)",
        "title": "string (display title)"
      }
    ],
    "views": [],
    "configuration": {}
  }
}
```

### Activation Events

Control when your plugin loads:

- `"onStartup"` - Load immediately when platform starts
- `"onCommand:commandId"` - Load when command is invoked
- `"onView:viewId"` - Load when view is opened
- `"onLanguage:typescript"` - Load for specific file types
- `*` - Always activate (use sparingly)

Example:

```json
{
  "activationEvents": [
    "onStartup",
    "onCommand:myPlugin.refresh"
  ]
}
```

### Contribution Points

#### API Contribution

```json
{
  "contributes": {
    "api": {
      "basePath": "/api/plugins/custom-path"
    }
  }
}
```

If not specified, defaults to `/api/plugins/{plugin-id}`.

#### Commands

```json
{
  "contributes": {
    "commands": [
      {
        "command": "myPlugin.create",
        "title": "Create New Item"
      },
      {
        "command": "myPlugin.delete",
        "title": "Delete Item"
      }
    ]
  }
}
```

Then handle in code:

```typescript
context.events.on('command:myPlugin.create', async () => {
  // Handle command
});
```

## Advanced Features

### Plugin Context API

The `ExtendedPluginContext` provides access to platform services:

```typescript
interface ExtendedPluginContext {
  logger: Logger;              // Logging service
  events: EventEmitter;        // Event bus
  config: PluginConfig;        // Plugin configuration
  environment: 'client' | 'server';  // Current environment
  manifest: PluginManifest;    // Plugin manifest
  contributions: any;          // Contribution points
}
```

### Using the Context

```typescript
async activatePlugin(context: ExtendedPluginContext): Promise<void> {
  // Logging
  context.logger.info('Plugin starting...');
  context.logger.error('Something went wrong', error);
  
  // Events - emit events
  context.events.emit('myPlugin:data-loaded', { count: 100 });
  
  // Events - listen to events
  context.events.on('user:created', (user) => {
    context.logger.info('User created:', user);
  });
  
  // Configuration
  const settings = context.config.settings;
  const apiKey = settings.apiKey || 'default-key';
  
  // Manifest
  const pluginId = context.manifest.id;
  const version = context.manifest.version;
  const customBasePath = context.manifest.contributes?.api?.basePath;
}
```

### Environment Helpers

Check which environment the plugin is running in:

```typescript
export class MyPlugin extends Plugin {
  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    if (this.isServer(context)) {
      // Server-only code
      await this.setupDatabase(context);
      await this.registerRoutes(context);
    }
    
    if (this.isClient(context)) {
      // Client-only code
      this.registerUIComponents(context);
    }
  }
  
  // Helper methods from Plugin base class
  // protected isServer(context): boolean
  // protected isClient(context): boolean
}
```

### Inter-Plugin Communication

```typescript
// Plugin A - emit event
context.events.emit('inventory:stock-updated', { 
  productId: 123, 
  newStock: 50 
});

// Plugin B - listen to Plugin A's event
context.events.on('inventory:stock-updated', (data) => {
  context.logger.info(`Stock updated for product ${data.productId}`);
  // Update UI, send notifications, etc.
});

// Cross-plugin command invocation
context.events.emit('command:analytics.trackEvent', {
  event: 'order_created',
  metadata: { orderId: 456 }
});
```

### Adding Swagger/OpenAPI Documentation

Add `getOpenAPISpec()` method to your plugin class:

```typescript
export class MyPlugin extends Plugin {
  // ... other methods ...
  
  /**
   * OpenAPI specification for Swagger documentation
   */
  getOpenAPISpec(): any {
    return {
      paths: {
        '/users': {
          get: {
            summary: 'Get all users',
            description: 'Retrieve a list of all users',
            parameters: [
              {
                name: 'role',
                in: 'query',
                schema: { type: 'string', enum: ['admin', 'user', 'guest'] }
              }
            ],
            responses: {
              '200': {
                description: 'List of users',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create user',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserInput' }
                }
              }
            },
            responses: {
              '201': {
                description: 'User created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' },
              role: { type: 'string', enum: ['admin', 'user', 'guest'] },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          UserInput: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['admin', 'user', 'guest'], default: 'user' }
            }
          }
        }
      }
    };
  }
}
```

Your API will automatically appear in Swagger UI at `http://localhost:3000/api-docs`.

## Best Practices

### 1. Use Single Plugin for Related Features

**Do:** Create one unified plugin with both client and server code
```
my-feature/
├── src/
│   ├── index.ts        # Main plugin class
│   ├── server/         # API routes, business logic
│   └── client/         # UI components
```

**Don't:** Create separate backend and frontend plugins for same feature

### 2. Always Provide OpenAPI Specs

```typescript
export class MyPlugin extends Plugin {
  // Always implement this for API documentation
  getOpenAPISpec(): any {
    return {
      paths: { /* ... */ },
      components: { schemas: { /* ... */ } }
    };
  }
}
```

### 3. Use Environment Checks

```typescript
async activatePlugin(context: ExtendedPluginContext): Promise<void> {
  // Only activate what's needed for each environment
  if (this.isServer(context)) {
    await activateServer(context);
  }
  
  if (this.isClient(context)) {
    await activateClient(context);
  }
}
```

### 4. Don't Export Both Class and Activate Function

**Do:** Export only the plugin class as default
```typescript
export class MyPlugin extends Plugin { /* ... */ }
export default MyPlugin;
```

**Don't:** Export both class and activate function (causes conflicts)
```typescript
// ❌ Don't do this - PluginLoader will use activate and lose your class methods
export async function activate(context) { /* ... */ }
export default MyPlugin;
```

### 5. Use Shared Types

Create `src/shared/types.ts` for types used by both client and server:

```typescript
// src/shared/types.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

// src/server/index.ts
import { User, CreateUserRequest } from '../shared/types';

// src/client/index.ts  
import { User } from '../shared/types';
```

### 6. Handle Errors Gracefully

```typescript
async activatePlugin(context: ExtendedPluginContext): Promise<void> {
  try {
    if (this.isServer(context)) {
      await this.initializeDatabase(context);
      context.logger.info('Database initialized');
    }
  } catch (error) {
    context.logger.error('Failed to initialize', error);
    // Don't throw - allow plugin to partially activate
  }
}
```

### 7. Use Manifest for Configuration

```json
{
  "contributes": {
    "api": {
      "basePath": "/api/plugins/custom-path"
    },
    "configuration": {
      "apiKey": {
        "type": "string",
        "default": "",
        "description": "API key for external service"
      }
    }
  }
}
```

### 8. Clean Up Resources

```typescript
export class MyPlugin extends Plugin {
  private interval?: NodeJS.Timeout;
  private connections: any[] = [];

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    if (this.isServer(context)) {
      // Start background task
      this.interval = setInterval(() => {
        this.syncData(context);
      }, 60000);
    }
  }

  async deactivate(): Promise<void> {
    // Clean up
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    for (const conn of this.connections) {
      await conn.close();
    }
    
    await super.deactivate();
  }
}
```

### 9. Use Shared Components (Frontend)

**Always use the shared component library for consistent UI:**

```typescript
import { PageHeader, Card, Badge, ProgressBar, EmptyState } from '@enxp/frontend';
import { getStatusColor, getStatusVariant } from '@enxp/frontend';

export function activateClient(context: ExtendedPluginContext): void {
  // Register component that uses shared UI
  const MyComponent: React.FC = () => (
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
  
  // Register with platform
  // context.ui.registerComponent('MyComponent', MyComponent);
}
```

**Benefits:**
- ✅ 26% less code to write
- ✅ Consistent look and feel
- ✅ Type-safe with TypeScript
- ✅ Automatic theme support

> See [CODE_OPTIMIZATION.md](CODE_OPTIMIZATION.md) for complete component library

### 10. Testing

```typescript
// tests/plugin.test.ts
import MyPlugin from '../src';
import { ExtendedPluginContext } from '@enxp/core';

describe('MyPlugin', () => {
  let plugin: MyPlugin;
  let mockContext: ExtendedPluginContext;

  beforeEach(() => {
    plugin = new MyPlugin();
    mockContext = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
      events: new EventEmitter(),
      environment: 'server',
      manifest: { id: 'test', name: 'test', version: '1.0.0' },
      config: { enabled: true, settings: {} },
    } as any;
  });

  it('should activate in server environment', async () => {
    await plugin.initialize(mockContext);
    await plugin.activate();
    
    expect(mockContext.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('activated')
    );
  });
});
```

## Real-World Examples

### Example 1: Projects Management Plugin

```typescript
// src/index.ts
import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateServer } from './server';

export class ProjectsPlugin extends Plugin {
  constructor() {
    super('projects-management', 'Project Management', '1.0.0', {
      description: 'Manage projects with full CRUD operations',
    });
  }

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    if (context.environment === 'server') {
      await activateServer(context);
    }
  }

  getOpenAPISpec(): any {
    return {
      paths: {
        '/projects': {
          get: { summary: 'Get all projects', /* ... */ },
          post: { summary: 'Create project', /* ... */ }
        },
        '/projects/{id}': {
          get: { summary: 'Get project by ID', /* ... */ },
          put: { summary: 'Update project', /* ... */ },
          delete: { summary: 'Delete project', /* ... */ }
        }
      },
      components: {
        schemas: {
          Project: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              status: { type: 'string', enum: ['active', 'completed'] }
            }
          }
        }
      }
    };
  }
}

export default ProjectsPlugin;
```

### Example 2: Activity Tracking Plugin

```typescript
// src/index.ts
import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { Router } from 'express';

export class ActivityPlugin extends Plugin {
  constructor() {
    super('activity-management', 'Activity Management', '1.0.0', {
      description: 'Track and monitor system activities',
    });
  }

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    if (!this.isServer(context)) return;

    const router = Router();

    // Get activities with filters
    router.get('/activities', async (req, res) => {
      const { type, status } = req.query;
      const activities = await this.getActivities({ type, status });
      res.json({ success: true, data: activities });
    });

    // Get activity statistics
    router.get('/stats', async (req, res) => {
      const stats = await this.getStats();
      res.json({ success: true, data: stats });
    });

    // Register router
    const basePath = `/api/plugins/${context.manifest.id}`;
    context.events.emit('plugin:register-router', {
      pluginId: context.manifest.id,
      basePath,
      router,
    });
  }

  private async getActivities(filters: any) {
    // Implementation
    return [];
  }

  private async getStats() {
    return {
      total: 100,
      byType: { deployment: 20, build: 30 },
      byStatus: { success: 80, failed: 20 }
    };
  }
}

export default ActivityPlugin;
```

### Example 3: Templates Plugin with Categories

See `plugins/templates-management/` for a full implementation example with:
- CRUD operations
- Usage tracking
- Category filtering
- Statistics aggregation
- OpenAPI documentation

## Plugin Lifecycle

```
┌─────────────────────────────────────────────┐
│          Platform Starts                    │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│    PluginLoader scans plugins/ folder       │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│    Load plugin.json manifest                │
│    - Validate required fields               │
│    - Check activation events                │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│    Import plugin module (dist/index.js)     │
│    - Get default export (Plugin class)      │
│    - Create plugin instance                 │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│    Initialize plugin                        │
│    - Set manifest                           │
│    - Create context                         │
│    - Call initialize(context)               │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│    Activate plugin                          │
│    - Check environment (client/server)      │
│    - Call activatePlugin(context)           │
│    - Register routes, commands, etc.        │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│    Plugin Running                           │
│    - Handle requests                        │
│    - Listen to events                       │
│    - Execute commands                       │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│    Platform Shuts Down                      │
│    - Call deactivate()                      │
│    - Clean up resources                     │
└─────────────────────────────────────────────┘
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

#### 1. Plugin not loading

**Symptoms:** Plugin doesn't appear in logs, routes not registered

**Solutions:**
- Check `plugin.json` exists and is valid JSON
- Verify `main` field points to correct file (e.g., `./dist/index.js`)
- Ensure plugin is built: `npm run build` in plugin directory
- Check `activationEvents` - use `"onStartup"` for immediate loading
- Look for errors in server logs

#### 2. getOpenAPISpec not working

**Symptoms:** Plugin routes work but don't appear in Swagger

**Solutions:**
- Don't export both `activate` function and class - only export class as default
- Ensure `getOpenAPISpec()` is a method of your plugin class
- Rebuild plugin: `npm run build`
- Restart server to clear module cache

```typescript
// ✅ Correct
export class MyPlugin extends Plugin {
  getOpenAPISpec() { /* ... */ }
}
export default MyPlugin;

// ❌ Wrong - causes wrapper class without getOpenAPISpec
export async function activate() { /* ... */ }
export default MyPlugin;
```

#### 3. Routes not working (404 errors)

**Symptoms:** API returns 404 for plugin endpoints

**Solutions:**
- Verify `plugin:register-router` event is emitted:
  ```typescript
  context.events.emit('plugin:register-router', {
    pluginId: context.manifest.id,
    basePath: '/api/plugins/my-plugin',
    router
  });
  ```
- Check basePath matches your API calls
- Ensure router is Express Router instance
- Verify plugin activated in server environment

#### 4. TypeScript compilation errors

**Symptoms:** `npm run build` fails with type errors

**Solutions:**
- Run `npm install` in plugin directory
- Check `tsconfig.json` has correct paths:
  ```json
  {
    "compilerOptions": {
      "outDir": "./dist",
      "rootDir": "./src"
    }
  }
  ```
- Ensure `@enxp/core` is in dependencies
- Clear `dist/` folder and rebuild

#### 5. Module not found errors

**Symptoms:** `Cannot find module '@enxp/core'` or similar

**Solutions:**
- Run `npm install` in root workspace: `npm install`
- Run `npm install` in plugin directory
- Check workspace is set up correctly in root `package.json`:
  ```json
  {
    "workspaces": ["packages/*", "plugins/*"]
  }
  ```
- Try `npm run build:core` from root

#### 6. Changes not reflected after rebuild

**Symptoms:** Code changes don't take effect

**Solutions:**
- Kill server completely: `pkill -f "tsx server.ts"`
- Clear Node.js module cache (restart terminal)
- Rebuild plugin: `cd plugins/my-plugin && npm run build`
- Rebuild core if changed: `cd packages/core && npm run build`
- Start fresh: `npm start`

### Debug Tips

#### Enable verbose logging

```typescript
async activatePlugin(context: ExtendedPluginContext): Promise<void> {
  context.logger.info(`[${this.id}] Starting activation...`);
  context.logger.info(`[${this.id}] Environment: ${context.environment}`);
  context.logger.info(`[${this.id}] Manifest:`, context.manifest);
  
  // Your code...
  
  context.logger.info(`[${this.id}] Activation complete`);
}
```

#### Check plugin loaded

```bash
# Server should log:
[PluginManager] INFO: Plugin my-plugin loaded successfully
[BackendServer] Activated plugin: my-plugin
```

#### Test API manually

```bash
# Test plugin endpoint
curl http://localhost:3000/api/plugins/my-plugin/items

# Check Swagger has your plugin
curl http://localhost:3000/api-docs/json | jq '.tags'
```

## Resources

### Documentation
- [API Reference](./API.md) - Complete platform API documentation
- [API Testing](./API_TESTING.md) - Swagger/OpenAPI and testing guide
- [Code Optimization](./CODE_OPTIMIZATION.md) - Shared components and best practices
- [Platform README](../README.md) - Getting started and architecture

### Example Plugins
- `plugins/projects-management/` - Full CRUD with custom basePath
- `plugins/activity-management/` - Filtering and statistics
- `plugins/templates-management/` - Complex features with categories

### Plugin Manifest
- OpenAPI 3.0 Specification: https://swagger.io/specification/
- VS Code Extension API: https://code.visualstudio.com/api

### Quick Reference

**Minimal plugin.json:**
```json
{
  "id": "my-plugin",
  "name": "my-plugin", 
  "version": "1.0.0",
  "main": "./dist/index.js",
  "activationEvents": ["onStartup"]
}
```

**Minimal Plugin class:**
```typescript
import { Plugin, ExtendedPluginContext } from '@enxp/core';

export class MyPlugin extends Plugin {
  constructor() {
    super('my-plugin', 'My Plugin', '1.0.0');
  }

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info('Plugin activated!');
  }
}

export default MyPlugin;
```

**Check current plugins:**
```bash
# See what's loaded
curl http://localhost:3000/api-docs/json | jq '.tags'

# Test specific plugin
curl http://localhost:3000/api/plugins/my-plugin/endpoint
```

---

**Need Help?**
- Check the example plugins in `plugins/` directory
- Review error logs in terminal
- Ensure plugin is built before testing
- Use Swagger UI at http://localhost:3000/api-docs for API testing
