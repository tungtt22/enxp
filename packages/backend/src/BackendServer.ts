import 'reflect-metadata';
import 'dotenv/config';
import express, { Express, Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs/promises';
import { PluginManager, PluginLoader } from '@enxp/core';
import { BackendPlugin } from './BackendPlugin';
import { databaseService } from './database';

/**
 * Backend Server - Express-based server with plugin support
 */
export class BackendServer {
  private app: Express;
  private pluginManager: PluginManager;
  private pluginLoader: PluginLoader;
  private port: number;
  private routers: Map<string, Router> = new Map();
  private swaggerCache: { spec: any; lastBuilt: number } | null = null;
  private swaggerTTL = 10_000; // 10s TTL for spec regeneration
  private get logger() { return this.pluginManager.getLogger(); }

  constructor(port: number = 3000, config?: Record<string, any>) {
    this.app = express();
    this.port = port;
    this.pluginManager = new PluginManager(config);
    
    // Initialize plugin loader for server environment
    this.pluginLoader = new PluginLoader(
      this.pluginManager.getRegistry(),
      this.pluginManager.getLogger(),
      this.pluginManager.getEvents(),
      this.pluginManager.getAPI(),
      'server'
    );
    
    this.setupMiddleware();
    this.setupSwagger();
    this.setupPluginEventHandlers();
    this.setupPluginLoaderEventHandlers();
  }

  /**
   * Setup base middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
  }

  /**
   * Setup Swagger API documentation
   */
  private setupSwagger(): void {
    // Serve Swagger UI at /api-docs
    this.app.use('/api-docs', swaggerUi.serve);
    this.app.get('/api-docs', (req, res, next) => {
      const swaggerSpec = this.getCachedSwaggerSpec();
      const setup = swaggerUi.setup(swaggerSpec);
      setup(req, res, next);
    });
    
    // Serve raw OpenAPI spec at /api-docs/json
    this.app.get('/api-docs/json', (req, res) => {
      const swaggerSpec = this.getCachedSwaggerSpec();
      res.json(swaggerSpec);
    });
  }

  /**
   * Generate dynamic Swagger specification
   */
  private generateSwaggerSpec(): any {
    // Build fresh spec (internal use only)
    const paths: any = {};
    const tags: any[] = [];
    const schemas: any = {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' }
        }
      }
    };

    // Collect specs from all plugins
    this.routers.forEach((router, pluginId) => {
      const plugin = this.pluginManager.getPlugin(pluginId);
      if (!plugin) return;

      // Get manifest to find custom basePath
      const manifest = (plugin as any).getManifest?.();
      const customBasePath = manifest?.contributes?.api?.basePath;
      
      // Remove -backend suffix from plugin ID for cleaner API paths
      const cleanPluginId = pluginId.replace(/-backend$/, '').replace(/-management$/, '-management');
      const basePath = customBasePath || `/api/plugins/${pluginId}`;
      
      // Add plugin tag
      tags.push({
        name: pluginId,
        description: plugin.description || `API endpoints for ${plugin.name}`
      });

      // Get OpenAPI spec from plugin (check for both BackendPlugin and Plugin types)
      const getOpenAPISpec = (plugin as any).getOpenAPISpec;
      if (getOpenAPISpec && typeof getOpenAPISpec === 'function') {
        const pluginSpec = getOpenAPISpec.call(plugin);
        
        // Merge paths
        if (pluginSpec.paths) {
          Object.keys(pluginSpec.paths).forEach(path => {
            const fullPath = basePath + path;
            paths[fullPath] = pluginSpec.paths[path];
            
            // Add plugin tag to all operations
            Object.keys(paths[fullPath]).forEach(method => {
              if (!paths[fullPath][method].tags) {
                paths[fullPath][method].tags = [];
              }
              if (!paths[fullPath][method].tags.includes(pluginId)) {
                paths[fullPath][method].tags.push(pluginId);
              }
            });
          });
        }
        
        // Merge schemas
        if (pluginSpec.components && pluginSpec.components.schemas) {
          Object.assign(schemas, pluginSpec.components.schemas);
        }
      }
    });

    return {
      openapi: '3.0.0',
      info: {
        title: 'ENXP Platform API',
        version: '1.0.0',
        description: 'RESTful API documentation for ENXP Platform backend plugins',
        contact: {
          name: 'ENXP Team',
        },
      },
      servers: [
        {
          url: `http://localhost:${this.port}`,
          description: 'Development server',
        },
      ],
      tags,
      paths,
      components: {
        schemas
      }
    };
  }

  /**
   * Return cached swagger spec or regenerate if TTL expired
   */
  private getCachedSwaggerSpec(): any {
    const now = Date.now();
    if (!this.swaggerCache || now - this.swaggerCache.lastBuilt > this.swaggerTTL) {
      this.swaggerCache = { spec: this.generateSwaggerSpec(), lastBuilt: now };
    }
    return this.swaggerCache.spec;
  }

  /**
   * Setup plugin event handlers
   */
  private setupPluginEventHandlers(): void {
    const events = this.pluginManager.getEvents();

    events.on('plugin:activated', (plugin) => {
      if (plugin.type === 'backend') {
        this.registerPluginRoutes(plugin as BackendPlugin);
        this.registerPluginMiddleware(plugin as BackendPlugin);
        this.swaggerCache = null; // invalidate cache
      }
    });

    events.on('plugin:deactivated', (plugin) => {
      if (plugin.type === 'backend') {
        this.unregisterPluginRoutes(plugin.id);
        this.swaggerCache = null; // invalidate cache
      }
    });
  }

  /**
   * Setup unified plugin event handlers
   */
  private setupPluginLoaderEventHandlers(): void {
    const events = this.pluginManager.getEvents();

    // Handle router registration from plugins
    events.on('plugin:register-router', (data: any) => {
      const { pluginId, basePath, router } = data;
      this.app.use(basePath, router);
      this.routers.set(pluginId, router);
      this.logger.info(`Registered plugin routes: ${basePath}`);
    });
  }

  /**
   * Register plugin routes
   */
  private registerPluginRoutes(plugin: BackendPlugin): void {
    if (!plugin.registerRoutes) return;

    const router = Router();
    plugin.registerRoutes(router);
    
    // Mount router at plugin path (remove -backend suffix if exists)
    const cleanPluginId = plugin.id.replace(/-backend$/, '');
    const basePath = `/api/plugins/${cleanPluginId}`;
    this.app.use(basePath, router);
    this.routers.set(plugin.id, router);
    
    this.logger.info(`Registered routes for plugin ${plugin.id} at ${basePath}`);
  }

  /**
   * Register plugin middleware
   */
  private registerPluginMiddleware(plugin: BackendPlugin): void {
    if (plugin.registerMiddleware) {
      plugin.registerMiddleware(this.app);
      this.logger.info(`Registered middleware for plugin ${plugin.id}`);
    }
  }

  /**
   * Unregister plugin routes
   */
  private unregisterPluginRoutes(pluginId: string): void {
    this.routers.delete(pluginId);
    // Note: Express doesn't support route removal, would need to restart
    this.logger.info(`Unregistered routes (logical) for plugin ${pluginId}`);
  }

  /**
   * Load a plugin with manifest
   */
  async loadPlugin(pluginPath: string): Promise<void> {
    // Check if it's a manifest-based plugin (has plugin.json)
    try {
      const manifestPath = path.join(pluginPath, 'plugin.json');
      await fs.access(manifestPath);
      // It's a manifest-based plugin, use PluginLoader
      // PluginLoader already registers the plugin with the registry
      const plugin = await this.pluginLoader.load(pluginPath);
      this.logger.info(`Loaded plugin: ${plugin.id}`);
    } catch {
      // Traditional plugin, use PluginManager
      await this.pluginManager.loadPlugin(pluginPath);
    }
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.pluginManager.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Check if it's a manifest-based plugin
    const manifestPlugin = plugin as any;
    if (manifestPlugin.getManifest) {
      // It's a manifest-based plugin
      const manifest = manifestPlugin.getManifest();
      if (manifest) {
        const context = this.pluginLoader.createContext(manifest, plugin);
        await plugin.initialize(context);
        await plugin.activate();
        this.logger.info(`Activated plugin: ${pluginId}`);
        return;
      }
    }

    // Traditional plugin
    await this.pluginManager.activatePlugin(pluginId);
  }

  /**
   * Get the Express app
   */
  getApp(): Express {
    return this.app;
  }

  /**
   * Get the plugin manager
   */
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    // Initialize database connection
    try {
      await databaseService.connect();
    } catch (error) {
      this.logger.error('Database connection failed', error as Error);
      // Server continues without database (using in-memory data)
    }

    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      const dbHealth = await databaseService.healthCheck();
      
      res.json({
        status: dbHealth ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: {
          connected: databaseService.isReady(),
          healthy: dbHealth,
        },
        plugins: this.pluginManager.getPlugins().map(p => ({
          id: p.id,
          name: p.name,
          version: p.version,
          type: p.type,
        })),
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    this.app.use((err: Error, req: any, res: any, next: any) => {
      this.logger.error('Server error', err as Error);
      res.status(500).json({ error: 'Internal server error', message: err.message });
    });

    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        this.logger.info(`Server started on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Shutdown the server gracefully
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down...');
    
    // Close database connection
    try {
      await databaseService.disconnect();
    } catch (error) {
      this.logger.error('Error disconnecting database', error as Error);
    }
    
    this.logger.info('Shutdown complete');
  }
}
