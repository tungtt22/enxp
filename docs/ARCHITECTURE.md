# ENXP Platform Architecture

## Overview

ENXP is a plugin-based engineering platform that enables plug-and-play extensibility for both backend and frontend components.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ENXP Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐           ┌──────────────┐              │
│  │   Frontend   │           │   Backend    │              │
│  │   Plugins    │           │   Plugins    │              │
│  └──────┬───────┘           └──────┬───────┘              │
│         │                          │                       │
│         ├─ React Components        ├─ API Routes          │
│         ├─ Routes/Pages            ├─ Middleware          │
│         ├─ Widgets                 ├─ Services            │
│         ├─ Themes                  ├─ Models              │
│         └─ Hooks                   └─ Event Handlers      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Plugin Manager                           │
│  ┌───────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  ├─ Plugin Registry (plugins storage)              │    │
│  │  ├─ Plugin Loader (dynamic loading)                │    │
│  │  ├─ Lifecycle Manager (init/activate/deactivate)   │    │
│  │  ├─ Event System (inter-plugin communication)      │    │
│  │  └─ Platform API (services & utilities)            │    │
│  │                                                     │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Core Layer                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  ├─ Plugin Interfaces (IPlugin, IBackendPlugin)    │    │
│  │  ├─ Base Classes (BasePlugin, BackendPlugin)       │    │
│  │  ├─ Type Definitions (PluginContext, Metadata)     │    │
│  │  └─ Common Utilities (Logger, Events)              │    │
│  │                                                     │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                            │
                            │
                            ▼

        ┌───────────────────────────────────┐
        │         Plugin CLI Tool           │
        ├───────────────────────────────────┤
        │  ├─ create  - Generate plugin     │
        │  ├─ build   - Compile plugin      │
        │  ├─ install - Install plugin      │
        │  ├─ list    - List plugins        │
        │  └─ dev     - Watch mode          │
        └───────────────────────────────────┘
```

## Component Breakdown

### 1. Core Package (@enxp/core)

**Purpose**: Foundation for all plugins

**Key Components**:
- `IPlugin` - Base plugin interface
- `BasePlugin` - Abstract plugin class
- `PluginManager` - Central plugin orchestrator
- `PluginRegistry` - Plugin storage and lookup
- `PluginLoader` - Dynamic plugin loading
- `EventEmitter` - Event system for communication
- `Logger` - Logging infrastructure

**Responsibilities**:
- Define plugin contracts
- Manage plugin lifecycle
- Provide inter-plugin communication
- Handle plugin dependencies

### 2. Backend Package (@enxp/backend)

**Purpose**: Server-side plugin infrastructure

**Key Components**:
- `BackendPlugin` - Backend plugin base class
- `BackendServer` - Express-based server with plugin support
- `APIRoute` - Route definition interface
- `IService` - Service interface
- `IModel` - Database model interface

**Features**:
- Express.js integration
- Automatic route registration
- Middleware support
- Service injection
- Database model registration

### 3. Frontend Package (@enxp/frontend)

**Purpose**: Client-side plugin infrastructure

**Key Components**:
- `FrontendPlugin` - Frontend plugin base class
- `PluginProvider` - React context provider
- `usePlugins` - Hook to access plugins
- `usePluginRoutes` - Hook for routes
- `usePluginWidgets` - Hook for widgets

**Features**:
- React integration
- Component registration
- Route management
- Widget system
- Theme support
- Menu integration

### 4. CLI Package (@enxp/cli)

**Purpose**: Developer tools for plugin management

**Key Components**:
- `PluginGenerator` - Scaffold new plugins
- `PluginBuilder` - Compile plugins
- `PluginInstaller` - Install/uninstall plugins

**Commands**:
- `create` - Generate plugin structure
- `build` - Compile TypeScript
- `install` - Install to platform
- `uninstall` - Remove plugin
- `list` - Show installed plugins
- `dev` - Development mode with watch

## Plugin Lifecycle

```
┌──────────┐
│ UNLOADED │ ──┐
└──────────┘   │
               │ load()
               ▼
┌──────────┐
│  LOADED  │ ──┐
└──────────┘   │
               │ initialize(context)
               ▼
┌──────────────┐
│ INITIALIZED  │ ──┐
└──────────────┘   │
                   │ activate()
                   ▼
┌──────────┐       ┌────────────┐
│  ACTIVE  │ ◄──── │  INACTIVE  │
└──────────┘       └────────────┘
     │                   ▲
     │ deactivate()      │
     └───────────────────┘
     │
     │ destroy()
     ▼
┌──────────┐
│ UNLOADED │
└──────────┘
```

## Data Flow

### Backend Plugin Request Flow

```
Client Request
     │
     ▼
┌─────────────────┐
│ Express Server  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Plugin Route        │
│ /api/plugins/{id}/  │
└────────┬────────────┘
         │
         ▼
┌─────────────────┐
│ Plugin Handler  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Response       │
└─────────────────┘
```

### Frontend Plugin Rendering Flow

```
React App
    │
    ▼
┌──────────────────┐
│ PluginProvider   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ usePlugins()     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Component        │
│ Registration     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Render           │
└──────────────────┘
```

## Plugin Communication

### Event-Based Communication

```typescript
// Plugin A emits event
pluginA.emit('data:updated', { id: 123, value: 'new' });

// Plugin B listens
context.events.on('plugin:pluginA:data:updated', (data) => {
  // Handle the update
});
```

### Direct Plugin Calls

```typescript
// Plugin A exposes method
class PluginA extends BackendPlugin {
  async getData(id: string) {
    return this.database.find(id);
  }
}

// Plugin B calls Plugin A
const data = await this.callPlugin('pluginA', 'getData', '123');
```

### Shared Services

```typescript
// Plugin registers service
context.api.registerService('cache', cacheService);

// Other plugin uses service
const cache = this.getService('cache');
await cache.set('key', 'value');
```

## Security Considerations

1. **Plugin Isolation**: Each plugin runs in the same process but has isolated context
2. **API Access Control**: Middleware can protect routes
3. **Event Namespacing**: Events are namespaced by plugin ID
4. **Dependency Validation**: Dependencies checked before activation
5. **Configuration Validation**: Plugin configs validated on load

## Scalability

1. **Lazy Loading**: Plugins loaded on-demand
2. **Modular Architecture**: Independent plugin development
3. **Horizontal Scaling**: Backend server can be replicated
4. **Plugin Caching**: Compiled plugins cached
5. **Event Debouncing**: High-frequency events can be throttled

## Extension Points

Developers can extend the platform by:

1. **Custom Plugin Types**: Create new base classes
2. **Platform Services**: Register global services
3. **Middleware**: Add request/response processors
4. **Event Handlers**: React to platform events
5. **CLI Commands**: Add custom CLI tools

## Technology Stack

- **Language**: TypeScript
- **Backend**: Express.js, Node.js
- **Frontend**: React 18.2, Ant Design 5.28
- **Database**: PostgreSQL 16, TypeORM 0.3.19
- **Build**: TypeScript Compiler, Vite 5.4
- **CLI**: Commander.js
- **Events**: EventEmitter3
- **Package Manager**: npm workspaces
- **Deployment**: Docker, docker-compose
- **CI/CD**: GitHub Actions (4 workflows)

## Deployment Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    Production Deployment                   │
├───────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │   Frontend  │   │   Backend   │   │  PostgreSQL │     │
│  │   (nginx)   │   │  (Node.js)  │   │  Database   │     │
│  │   :80       │   │   :3000     │   │   :5432     │     │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘     │
│         │                 │                 │             │
│         │ /api/* proxy    │  TypeORM        │             │
│         └────────►────────┴────────►────────┘             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Docker Compose Network                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Features:                                                  │
│  ✅ Multi-stage Docker builds (optimized size)             │
│  ✅ Health checks (all services)                           │
│  ✅ Volume persistence (PostgreSQL data)                   │
│  ✅ Auto-restart policies                                  │
│  ✅ Non-root containers (security)                         │
│                                                             │
└───────────────────────────────────────────────────────────┘

                            │
                            │ GitHub Actions CI/CD
                            ▼

┌───────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline                         │
├───────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣ Build & Test (backend, frontend)                      │
│  2️⃣ Code Quality (ESLint, TypeScript, Prettier)           │
│  3️⃣ Security Scan (Trivy, CodeQL, Dependencies)           │
│  4️⃣ Docker Build (multi-arch: amd64, arm64)               │
│  5️⃣ Publish (GHCR - GitHub Container Registry)            │
│  6️⃣ Deploy (production on main branch)                    │
│                                                             │
└───────────────────────────────────────────────────────────┘
```

### Database Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Database Layer                          │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  DatabaseService (Singleton)                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  ├─ Connection Management (pooling)                 │  │
│  │  ├─ Lifecycle (initialize, destroy)                 │  │
│  │  ├─ Health Checks                                   │  │
│  │  └─ Migration Support                               │  │
│  │                                                      │  │
│  └────────────────────────────────────────────────────┘  │
│                        │                                  │
│                        │ TypeORM                          │
│                        ▼                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │              PostgreSQL 16                         │  │
│  │  ├─ User authentication                            │  │
│  │  ├─ Plugin data                                    │  │
│  │  ├─ Configuration                                  │  │
│  │  └─ Application state                              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

> For complete deployment details, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)  
> For CI/CD pipeline details, see [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md)

## Performance Considerations

1. **Plugin Loading**: Asynchronous with parallel capability
2. **Route Registration**: Cached after initial load
3. **Event System**: Optimized with EventEmitter3
4. **Build Process**: Incremental compilation
5. **Bundle Size**: Tree-shaking for unused code

## Future Enhancements

- Hot module replacement (HMR) for plugins
- Plugin marketplace
- Version management and updates
- Plugin permissions and sandboxing
- GraphQL support for backend plugins
- WebSocket support for real-time features
- Plugin testing framework
- Performance monitoring
- Plugin documentation generator
