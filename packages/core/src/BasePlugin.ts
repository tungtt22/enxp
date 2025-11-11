import { IPlugin, PluginContext, PluginState } from './types';

/**
 * Base plugin class that provides common functionality
 */
export abstract class BasePlugin implements IPlugin {
  public readonly id: string;
  public readonly name: string;
  public readonly version: string;
  public readonly description?: string;
  public readonly type: 'backend' | 'frontend' | 'shared';
  public readonly dependencies?: string[];
  
  protected context?: PluginContext;
  protected state: PluginState = PluginState.UNLOADED;

  constructor(
    id: string,
    name: string,
    version: string,
    type: 'backend' | 'frontend' | 'shared',
    options?: {
      description?: string;
      dependencies?: string[];
    }
  ) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.type = type;
    this.description = options?.description;
    this.dependencies = options?.dependencies;
  }

  /**
   * Initialize the plugin with context
   */
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.state = PluginState.INITIALIZED;
    this.log('info', `Plugin ${this.name} initialized`);
    await this.onInitialize(context);
  }

  /**
   * Activate the plugin
   */
  async activate(): Promise<void> {
    if (this.state !== PluginState.INITIALIZED && this.state !== PluginState.INACTIVE) {
      throw new Error(`Cannot activate plugin in state: ${this.state}`);
    }
    
    this.state = PluginState.ACTIVE;
    this.log('info', `Plugin ${this.name} activated`);
    await this.onActivate();
  }

  /**
   * Deactivate the plugin
   */
  async deactivate(): Promise<void> {
    if (this.state !== PluginState.ACTIVE) {
      throw new Error(`Cannot deactivate plugin in state: ${this.state}`);
    }
    
    this.state = PluginState.INACTIVE;
    this.log('info', `Plugin ${this.name} deactivated`);
    await this.onDeactivate();
  }

  /**
   * Destroy the plugin and cleanup resources
   */
  async destroy(): Promise<void> {
    this.log('info', `Plugin ${this.name} destroyed`);
    await this.onDestroy();
    this.context = undefined;
    this.state = PluginState.UNLOADED;
  }

  /**
   * Get the current state
   */
  getState(): PluginState {
    return this.state;
  }

  /**
   * Hook: Called during initialization
   */
  protected async onInitialize(context: PluginContext): Promise<void> {
    // Override in subclass
  }

  /**
   * Hook: Called during activation
   */
  protected async onActivate(): Promise<void> {
    // Override in subclass
  }

  /**
   * Hook: Called during deactivation
   */
  protected async onDeactivate(): Promise<void> {
    // Override in subclass
  }

  /**
   * Hook: Called during destruction
   */
  protected async onDestroy(): Promise<void> {
    // Override in subclass
  }

  /**
   * Helper to log messages
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (this.context?.logger) {
      this.context.logger[level](`[${this.id}] ${message}`, ...args);
    }
  }

  /**
   * Helper to emit events
   */
  protected emit(event: string, ...args: any[]): void {
    if (this.context?.events) {
      this.context.events.emit(`plugin:${this.id}:${event}`, ...args);
    }
  }

  /**
   * Helper to call another plugin
   */
  protected async callPlugin(pluginId: string, method: string, ...args: any[]): Promise<any> {
    if (!this.context?.api) {
      throw new Error('Platform API not available');
    }
    return this.context.api.callPlugin(pluginId, method, ...args);
  }

  /**
   * Helper to get a service
   */
  protected getService<T>(serviceName: string): T | undefined {
    return this.context?.api.getService<T>(serviceName);
  }
}
