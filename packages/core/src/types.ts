/**
 * Core plugin interface that all plugins must implement
 */
export interface IPlugin {
  /** Unique identifier for the plugin */
  id: string;
  
  /** Plugin name */
  name: string;
  
  /** Plugin version */
  version: string;
  
  /** Plugin description */
  description?: string;
  
  /** Plugin type */
  type: 'backend' | 'frontend' | 'shared';
  
  /** Plugin dependencies */
  dependencies?: string[];
  
  /** Initialize the plugin */
  initialize(context: PluginContext): Promise<void> | void;
  
  /** Activate the plugin */
  activate(): Promise<void> | void;
  
  /** Deactivate the plugin */
  deactivate(): Promise<void> | void;
  
  /** Destroy/cleanup the plugin */
  destroy(): Promise<void> | void;
}

/**
 * Plugin context provides access to platform features
 */
export interface PluginContext {
  /** Platform logger */
  logger: ILogger;
  
  /** Event emitter */
  events: IEventEmitter;
  
  /** Configuration */
  config: PluginConfig;
  
  /** Plugin registry */
  registry: IPluginRegistry;
  
  /** Platform API */
  api: IPlatformAPI;
}

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  type: 'backend' | 'frontend' | 'shared';
  dependencies?: PluginDependency[];
  provides?: string[];
  requires?: string[];
  config?: Record<string, any>;
}

/**
 * Plugin dependency definition
 */
export interface PluginDependency {
  id: string;
  version?: string;
  optional?: boolean;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
}

/**
 * Plugin lifecycle state
 */
export enum PluginState {
  UNLOADED = 'unloaded',
  LOADED = 'loaded',
  INITIALIZED = 'initialized',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error'
}

/**
 * Plugin registry interface
 */
export interface IPluginRegistry {
  /** Register a plugin */
  register(plugin: IPlugin, metadata: PluginMetadata): void;
  
  /** Unregister a plugin */
  unregister(pluginId: string): void;
  
  /** Get a plugin by ID */
  get(pluginId: string): IPlugin | undefined;
  
  /** Get plugin metadata */
  getMetadata(pluginId: string): PluginMetadata | undefined;
  
  /** Get all plugins */
  getAll(): IPlugin[];
  
  /** Get plugins by type */
  getByType(type: 'backend' | 'frontend' | 'shared'): IPlugin[];
  
  /** Check if plugin exists */
  has(pluginId: string): boolean;
  
  /** Get plugin state */
  getState(pluginId: string): PluginState;
}

/**
 * Logger interface
 */
export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: Error, ...args: any[]): void;
}

/**
 * Event emitter interface
 */
export interface IEventEmitter {
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  once(event: string, listener: (...args: any[]) => void): void;
}

/**
 * Platform API interface
 */
export interface IPlatformAPI {
  /** Get platform version */
  getVersion(): string;
  
  /** Get platform configuration */
  getConfig(): Record<string, any>;
  
  /** Call another plugin's method */
  callPlugin(pluginId: string, method: string, ...args: any[]): Promise<any>;
  
  /** Get service from platform */
  getService<T>(serviceName: string): T | undefined;
}

/**
 * Plugin loader interface
 */
export interface IPluginLoader {
  /** Load a plugin from path */
  load(pluginPath: string): Promise<IPlugin>;
  
  /** Unload a plugin */
  unload(pluginId: string): Promise<void>;
  
  /** Reload a plugin */
  reload(pluginId: string): Promise<void>;
}
