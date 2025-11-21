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
  
  /** Set plugin state */
  setState(pluginId: string, state: PluginState): void;
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

/**
 * Unified Plugin Manifest (like VS Code package.json)
 */
export interface PluginManifest {
  /** Unique plugin identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Version (semver) */
  version: string;
  
  /** Display name for UI */
  displayName?: string;
  
  /** Description */
  description?: string;
  
  /** Publisher/Author */
  publisher?: string;
  
  /** Categories */
  categories?: string[];
  
  /** Engine compatibility */
  engines: {
    enxp: string;
  };
  
  /** Activation events (when to load plugin) */
  activationEvents?: ActivationEvent[];
  
  /** Main entry point */
  main: string;
  
  /** Contribution points */
  contributes?: PluginContributions;
  
  /** Dependencies */
  dependencies?: Record<string, string>;
  
  /** Dev dependencies */
  devDependencies?: Record<string, string>;
}

/**
 * Activation events (when plugin should be activated)
 */
export type ActivationEvent =
  | 'onStartup'
  | `onCommand:${string}`
  | `onView:${string}`
  | `onLanguage:${string}`
  | `onUri:${string}`;

/**
 * Plugin contribution points
 */
export interface PluginContributions {
  /** Command contributions */
  commands?: CommandContribution[];
  
  /** View contributions */
  views?: ViewContributions;
  
  /** Menu contributions */
  menus?: MenuContributions;
  
  /** Route contributions (frontend) */
  routes?: RouteContribution[];
  
  /** API route contributions (backend) */
  api?: APIContributions;
  
  /** Configuration contributions */
  configuration?: ConfigurationContribution[];
}

/**
 * Command contribution
 */
export interface CommandContribution {
  command: string;
  title: string;
  category?: string;
  icon?: string;
  enablement?: string;
}

/**
 * View contributions
 */
export interface ViewContributions {
  [containerId: string]: ViewContribution[];
}

export interface ViewContribution {
  id: string;
  name: string;
  when?: string;
}

/**
 * Menu contributions
 */
export interface MenuContributions {
  [menuId: string]: MenuItemContribution[];
}

export interface MenuItemContribution {
  command: string;
  when?: string;
  group?: string;
}

/**
 * Route contribution (frontend)
 */
export interface RouteContribution {
  path: string;
  title: string;
  icon?: string;
  exact?: boolean;
}

/**
 * API contributions (backend)
 */
export interface APIContributions {
  basePath: string;
  routes: APIRouteContribution[];
}

export interface APIRouteContribution {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string;
  description?: string;
}

/**
 * Configuration contribution
 */
export interface ConfigurationContribution {
  title: string;
  properties: Record<string, ConfigurationProperty>;
}

export interface ConfigurationProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default?: any;
  description?: string;
  enum?: any[];
}

/**
 * Extended Plugin Context for modern plugins
 */
export interface ExtendedPluginContext extends PluginContext {
  /** Environment: client or server */
  environment: 'client' | 'server';
  
  /** Plugin manifest */
  manifest: PluginManifest;
  
  /** Contribution registry */
  contributions?: {
    registerCommand?(id: string, handler: Function): void;
    registerView?(id: string, view: any): void;
    registerRoute?(route: RouteContribution): void;
    registerAPIRoute?(route: APIRouteContribution): void;
  };
}

/**
 * Modern Plugin Interface
 */
export interface IModernPlugin extends Omit<IPlugin, 'activate'> {
  /** Activate with environment context */
  activatePlugin(context: ExtendedPluginContext): Promise<void> | void;
  
  /** Set manifest */
  setManifest(manifest: PluginManifest): void;
  
  /** Get manifest */
  getManifest(): PluginManifest | undefined;
}
