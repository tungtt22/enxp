import 'reflect-metadata';
import 'dotenv/config';
import express, { Express, Router } from 'express';
import { PluginManager } from '@enxp/core';
import { BackendPlugin, APIRoute } from './BackendPlugin';
import { databaseService } from './database';

/**
 * Backend Server - Express-based server with plugin support
 */
export class BackendServer {
  private app: Express;
  private pluginManager: PluginManager;
  private port: number;
  private routers: Map<string, Router> = new Map();

  constructor(port: number = 3000, config?: Record<string, any>) {
    this.app = express();
    this.port = port;
    this.pluginManager = new PluginManager(config);
    
    this.setupMiddleware();
    this.setupPluginEventHandlers();
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
   * Setup plugin event handlers
   */
  private setupPluginEventHandlers(): void {
    const events = this.pluginManager.getEvents();

    events.on('plugin:activated', (plugin) => {
      if (plugin.type === 'backend') {
        this.registerPluginRoutes(plugin as BackendPlugin);
        this.registerPluginMiddleware(plugin as BackendPlugin);
      }
    });

    events.on('plugin:deactivated', (plugin) => {
      if (plugin.type === 'backend') {
        this.unregisterPluginRoutes(plugin.id);
      }
    });
  }

  /**
   * Register plugin routes
   */
  private registerPluginRoutes(plugin: BackendPlugin): void {
    if (!plugin.registerRoutes) return;

    const router = Router();
    plugin.registerRoutes(router);
    
    // Mount router at plugin path
    const basePath = `/api/plugins/${plugin.id}`;
    this.app.use(basePath, router);
    this.routers.set(plugin.id, router);
    
    console.log(`[BackendServer] Registered routes for plugin ${plugin.id} at ${basePath}`);
  }

  /**
   * Register plugin middleware
   */
  private registerPluginMiddleware(plugin: BackendPlugin): void {
    if (plugin.registerMiddleware) {
      plugin.registerMiddleware(this.app);
      console.log(`[BackendServer] Registered middleware for plugin ${plugin.id}`);
    }
  }

  /**
   * Unregister plugin routes
   */
  private unregisterPluginRoutes(pluginId: string): void {
    this.routers.delete(pluginId);
    // Note: Express doesn't support route removal, would need to restart
    console.log(`[BackendServer] Unregistered routes for plugin ${pluginId}`);
  }

  /**
   * Load a plugin
   */
  async loadPlugin(pluginPath: string): Promise<void> {
    await this.pluginManager.loadPlugin(pluginPath);
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginId: string): Promise<void> {
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
      console.error('Failed to connect to database:', error);
      // You can choose to exit or continue without database
      // process.exit(1);
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
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error', message: err.message });
    });

    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`[BackendServer] Server started on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Shutdown the server gracefully
   */
  async shutdown(): Promise<void> {
    console.log('[BackendServer] Shutting down...');
    
    // Close database connection
    try {
      await databaseService.disconnect();
    } catch (error) {
      console.error('Error disconnecting database:', error);
    }
    
    console.log('[BackendServer] Shutdown complete');
  }
}
