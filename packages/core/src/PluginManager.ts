import EventEmitter from 'eventemitter3';
import {
  IPlugin,
  IPluginRegistry,
  PluginMetadata,
  PluginState,
  IEventEmitter,
  ILogger,
  PluginContext,
  IPluginLoader,
  IPlatformAPI,
  PluginError,
} from './types';

/**
 * Plugin Registry - manages all loaded plugins
 */
export class PluginRegistry implements IPluginRegistry {
  private plugins: Map<string, IPlugin> = new Map();
  private metadata: Map<string, PluginMetadata> = new Map();
  private states: Map<string, PluginState> = new Map();

  register(plugin: IPlugin, metadata: PluginMetadata): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    this.plugins.set(plugin.id, plugin);
    this.metadata.set(plugin.id, metadata);
    this.states.set(plugin.id, PluginState.LOADED);
  }

  unregister(pluginId: string): void {
    this.plugins.delete(pluginId);
    this.metadata.delete(pluginId);
    this.states.delete(pluginId);
  }

  get(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getMetadata(pluginId: string): PluginMetadata | undefined {
    return this.metadata.get(pluginId);
  }

  getAll(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  getByType(type: 'backend' | 'frontend' | 'shared'): IPlugin[] {
    return this.getAll().filter((p) => p.type === type);
  }

  has(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  getState(pluginId: string): PluginState {
    return this.states.get(pluginId) || PluginState.UNLOADED;
  }

  setState(pluginId: string, state: PluginState): void {
    this.states.set(pluginId, state);
  }
}

/**
 * Console Logger implementation
 */
export class ConsoleLogger implements ILogger {
  constructor(private prefix: string = '[ENXP]') {}

  debug(message: string, ...args: any[]): void {
    console.debug(`${this.prefix} DEBUG:`, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    console.info(`${this.prefix} INFO:`, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} WARN:`, message, ...args);
  }

  error(message: string, error?: Error, ...args: any[]): void {
    console.error(`${this.prefix} ERROR:`, message, error, ...args);
  }
}

/**
 * Platform Event Emitter wrapper
 */
export class PlatformEventEmitter implements IEventEmitter {
  private emitter = new EventEmitter();

  on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.emitter.off(event, listener);
  }

  emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }

  once(event: string, listener: (...args: any[]) => void): void {
    this.emitter.once(event, listener);
  }
}

/**
 * Plugin Loader - loads plugins from filesystem
 */
export class BasicPluginLoader implements IPluginLoader {
  constructor(
    private registry: IPluginRegistry,
    private logger: ILogger
  ) {}

  async load(pluginPath: string): Promise<IPlugin> {
    try {
      this.logger.info(`Loading plugin from: ${pluginPath}`);
      
      // Dynamic import of the plugin
      const pluginModule = await import(pluginPath);
      const PluginClass = pluginModule.default || pluginModule.Plugin;

      if (!PluginClass) {
        throw new Error('Plugin must export a default class or Plugin class');
      }

      // Check if it's already an instance or a class
      let plugin: IPlugin;
      if (typeof PluginClass === 'function') {
        // It's a class, instantiate it
        plugin = new PluginClass();
      } else if (typeof PluginClass === 'object' && PluginClass.id) {
        // It's already an instance
        plugin = PluginClass;
      } else {
        throw new Error('Plugin must be a class or an instance with an id property');
      }

      // Load metadata
      const metadataPath = pluginPath.replace(/\.js$/, '.json');
      let metadata: PluginMetadata;
      
      try {
        metadata = await import(metadataPath);
      } catch {
        // Generate default metadata from plugin
        metadata = {
          id: plugin.id,
          name: plugin.name,
          version: plugin.version,
          description: plugin.description,
          type: plugin.type,
          dependencies: plugin.dependencies?.map(id => ({ id })),
        };
      }

      // Register the plugin
      this.registry.register(plugin, metadata);
      this.logger.info(`Plugin ${plugin.name} (${plugin.id}) loaded successfully`);

      return plugin;
    } catch (error) {
      this.logger.error('Failed to load plugin', error as Error);
      throw error;
    }
  }

  async unload(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    await plugin.destroy();
    this.registry.unregister(pluginId);
    this.logger.info(`Plugin ${pluginId} unloaded`);
  }

  async reload(pluginId: string): Promise<void> {
    const metadata = this.registry.getMetadata(pluginId);
    if (!metadata) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Store the plugin path (would need to be tracked)
    await this.unload(pluginId);
    // await this.load(pluginPath); // Would need the path
  }
}

/**
 * Platform API implementation
 */
export class PlatformAPI implements IPlatformAPI {
  private version = '1.0.0';
  private config: Record<string, any> = {};
  private services: Map<string, any> = new Map();

  constructor(
    private registry: IPluginRegistry,
    config?: Record<string, any>
  ) {
    if (config) {
      this.config = config;
    }
  }

  getVersion(): string {
    return this.version;
  }

  getConfig(): Record<string, any> {
    return { ...this.config };
  }

  async callPlugin(pluginId: string, method: string, ...args: any[]): Promise<any> {
    const plugin = this.registry.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (typeof (plugin as any)[method] !== 'function') {
      throw new Error(`Method ${method} not found on plugin ${pluginId}`);
    }

    return (plugin as any)[method](...args);
  }

  getService<T>(serviceName: string): T | undefined {
    return this.services.get(serviceName);
  }

  registerService(serviceName: string, service: any): void {
    this.services.set(serviceName, service);
  }

  unregisterService(serviceName: string): void {
    this.services.delete(serviceName);
  }
}

/**
 * Plugin Manager - coordinates plugin lifecycle
 */
export class PluginManager {
  private registry: PluginRegistry;
  private loader: BasicPluginLoader;
  private events: PlatformEventEmitter;
  private logger: ILogger;
  private api: PlatformAPI;

  constructor(config?: Record<string, any>) {
    this.logger = new ConsoleLogger('[PluginManager]');
    this.registry = new PluginRegistry();
    this.events = new PlatformEventEmitter();
    this.api = new PlatformAPI(this.registry, config);
    this.loader = new BasicPluginLoader(this.registry, this.logger);
  }

  /**
   * Load and initialize a plugin
   */
  async loadPlugin(pluginPath: string): Promise<IPlugin> {
    const plugin = await this.loader.load(pluginPath);
    
    // Create plugin context
    const context: PluginContext = {
      logger: new ConsoleLogger(`[${plugin.id}]`),
      events: this.events,
      config: { enabled: true, settings: {} },
      registry: this.registry,
      api: this.api,
    };

    // Initialize plugin
    await plugin.initialize(context);
    this.registry.setState(plugin.id, PluginState.INITIALIZED);
    
    this.events.emit('plugin:loaded', plugin);
    return plugin;
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId);
    if (!plugin) {
      throw new PluginError(`Plugin ${pluginId} not found`, 'PLUGIN_NOT_FOUND', pluginId);
    }

    // Check dependencies
    const metadata = this.registry.getMetadata(pluginId);
    if (metadata?.dependencies) {
      // Resolve dependency activation order via DFS topo sort
      const visited = new Set<string>();
      const stack: string[] = [];
      const temp = new Set<string>();
      const dependencyMap: Record<string, string[]> = {};
      const loadDeps = (id: string) => {
        if (temp.has(id)) {
          throw new PluginError(`Circular dependency detected at ${id}`, 'PLUGIN_CIRCULAR_DEP', pluginId);
        }
        if (visited.has(id)) return;
        temp.add(id);
        const meta = this.registry.getMetadata(id);
        const deps = meta?.dependencies?.filter(d => !d.optional).map(d => d.id) || [];
        dependencyMap[id] = deps;
        for (const d of deps) {
          if (!this.registry.has(d)) {
            throw new PluginError(`Required dependency ${d} missing for ${id}`, 'PLUGIN_DEP_MISSING', pluginId);
          }
          loadDeps(d);
        }
        temp.delete(id);
        visited.add(id);
        stack.push(id);
      };
      loadDeps(pluginId);
      // Activate dependencies in order except the plugin itself (last element is pluginId)
      for (const depId of stack) {
        if (depId === pluginId) continue;
        const state = this.registry.getState(depId);
        if (state !== PluginState.ACTIVE) {
          await this.activatePlugin(depId); // recursive safe due to visited set
        }
      }
    }
    const start = performance.now?.() || Date.now();
    await plugin.activate();
    const end = performance.now?.() || Date.now();
    this.logger.info(`Activated plugin ${pluginId} in ${(end - start).toFixed(1)}ms`);
    this.registry.setState(pluginId, PluginState.ACTIVE);
    this.events.emit('plugin:activated', plugin);
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    await plugin.deactivate();
    this.registry.setState(pluginId, PluginState.INACTIVE);
    this.events.emit('plugin:deactivated', plugin);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    await this.loader.unload(pluginId);
    this.events.emit('plugin:unloaded', pluginId);
  }

  /**
   * Get all plugins
   */
  getPlugins(): IPlugin[] {
    return this.registry.getAll();
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): IPlugin | undefined {
    return this.registry.get(pluginId);
  }

  /**
   * Register a pre-loaded plugin (for external loaders like PluginLoader)
   */
  registerPlugin(plugin: IPlugin, metadata?: PluginMetadata): void {
    this.registry.register(plugin, metadata || {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      type: plugin.type,
      dependencies: []
    });
  }

  /**
   * Get the registry
   */
  getRegistry(): IPluginRegistry {
    return this.registry;
  }

  /**
   * Get the event emitter
   */
  getEvents(): IEventEmitter {
    return this.events;
  }

  /**
   * Get the logger
   */
  getLogger(): ILogger {
    return this.logger;
  }

  /**
   * Get the platform API
   */
  getAPI(): IPlatformAPI {
    return this.api;
  }
}
