import { BasePlugin } from './BasePlugin';
import { IModernPlugin, ExtendedPluginContext, PluginManifest } from './types';

/**
 * Plugin base class
 * Supports both client and server-side activation in a single plugin
 */
export abstract class Plugin extends BasePlugin implements IModernPlugin {
  protected manifest?: PluginManifest;

  constructor(
    id: string,
    name: string,
    version: string,
    options?: {
      description?: string;
      dependencies?: string[];
    }
  ) {
    // Unified plugins are marked as 'shared' but activate differently based on environment
    super(id, name, version, 'shared', options);
  }

  /**
   * Base activate method (from BasePlugin)
   * Routes to unified activation
   */
  async activate(): Promise<void> {
    // This will be called after initialize with context
    if (this.context && 'environment' in this.context) {
      await this.activatePlugin(this.context as ExtendedPluginContext);
    } else {
      throw new Error('Plugin requires ExtendedPluginContext');
    }
  }

  /**
   * Activate plugin with context
   * Override this method in your plugin implementation
   */
  abstract activatePlugin(context: ExtendedPluginContext): Promise<void> | void;

  /**
   * Initialize with manifest
   */
  setManifest(manifest: PluginManifest): void {
    this.manifest = manifest;
  }

  /**
   * Get manifest
   */
  getManifest(): PluginManifest | undefined {
    return this.manifest;
  }

  /**
   * Check if should activate based on activation events
   */
  shouldActivate(event: string): boolean {
    if (!this.manifest?.activationEvents) {
      return true; // No activation events means always activate
    }

    return this.manifest.activationEvents.some((activationEvent) => {
      if (activationEvent === 'onStartup') return true;
      if (activationEvent === event) return true;
      
      // Handle pattern matching (e.g., "onCommand:*")
      const pattern = activationEvent.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(event);
    });
  }

  /**
   * Activate for client environment
   * Override this if plugin has client-side functionality
   */
  protected async activateClient(context: ExtendedPluginContext): Promise<void> {
    this.log('info', 'No client-side activation defined');
  }

  /**
   * Activate for server environment
   * Override this if plugin has server-side functionality
   */
  protected async activateServer(context: ExtendedPluginContext): Promise<void> {
    this.log('info', 'No server-side activation defined');
  }

  /**
   * Helper to check current environment
   */
  protected isClient(context: ExtendedPluginContext): boolean {
    return context.environment === 'client';
  }

  /**
   * Helper to check current environment
   */
  protected isServer(context: ExtendedPluginContext): boolean {
    return context.environment === 'server';
  }
}

/**
 * Helper function to create activation function (VS Code style)
 */
export function createActivationFunction(
  PluginClass: new () => Plugin
): (context: ExtendedPluginContext) => Promise<void> {
  return async (context: ExtendedPluginContext) => {
    const plugin = new PluginClass();
    await plugin.initialize(context);
    await plugin.activate();
  };
}

/**
 * Export type for plugin module
 */
export interface PluginModule {
  activate(context: ExtendedPluginContext): Promise<void> | void;
  deactivate?(): Promise<void> | void;
}
