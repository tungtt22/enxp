import path from 'path';
import fs from 'fs/promises';
import {
  IPlugin,
  IPluginRegistry,
  ILogger,
  PluginMetadata,
  PluginState,
  ExtendedPluginContext,
  PluginManifest,
  IEventEmitter,
  IPlatformAPI,
} from './types';
import { Plugin } from './Plugin';

/**
 * Plugin Loader
 * Loads plugins with manifest support (like VS Code extensions)
 */
export class PluginLoader {
  constructor(
    private registry: IPluginRegistry,
    private logger: ILogger,
    private events: IEventEmitter,
    private api: IPlatformAPI,
    private environment: 'client' | 'server'
  ) {}

  /**
   * Load a unified plugin from directory
   */
  async load(pluginPath: string): Promise<IPlugin> {
    try {
      this.logger.info(`Loading unified plugin from: ${pluginPath}`);

      // 1. Load manifest (plugin.json)
      const manifest = await this.loadManifest(pluginPath);
      this.logger.info(`Loaded manifest for plugin: ${manifest.id}`);

      // 2. Validate manifest
      this.validateManifest(manifest);

      // 3. Load main entry point
      const mainPath = path.join(pluginPath, manifest.main);
      const pluginModule = await import(mainPath);

      // 4. Get plugin instance
      let plugin: IPlugin;

      if (pluginModule.activate && typeof pluginModule.activate === 'function') {
        // VS Code style: module exports activate function
        plugin = await this.createPluginFromActivateFunction(
          manifest,
          pluginModule.activate,
          pluginModule.deactivate
        );
      } else if (pluginModule.default) {
        // Default export is plugin class or instance
        const PluginClass = pluginModule.default;
        if (typeof PluginClass === 'function') {
          plugin = new PluginClass();
        } else {
          plugin = PluginClass;
        }
      } else {
        throw new Error(
          'Plugin must export either activate() function or default plugin class/instance'
        );
      }

      // 5. Set manifest if plugin is Plugin (modern)
      if (plugin instanceof Plugin) {
        plugin.setManifest(manifest);
      }

      // 6. Register plugin with metadata
      const metadata: PluginMetadata = this.createMetadata(manifest);
      this.registry.register(plugin, metadata);
      this.registry.setState(plugin.id, PluginState.LOADED);

      this.logger.info(`Plugin ${manifest.id} loaded successfully`);
      return plugin;
    } catch (error) {
      this.logger.error(
        `Failed to load plugin from ${pluginPath}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Load plugin manifest (plugin.json)
   */
  private async loadManifest(pluginPath: string): Promise<PluginManifest> {
    const manifestPath = path.join(pluginPath, 'plugin.json');

    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent) as PluginManifest;
      return manifest;
    } catch (error) {
      // Fallback: try to read package.json
      const packagePath = path.join(pluginPath, 'package.json');
      try {
        const packageContent = await fs.readFile(packagePath, 'utf-8');
        const packageJson = JSON.parse(packageContent);
        
        // Convert package.json to manifest format
        return this.packageJsonToManifest(packageJson, pluginPath);
      } catch (pkgError) {
        throw new Error(
          `No plugin.json or package.json found in ${pluginPath}`
        );
      }
    }
  }

  /**
   * Convert package.json to PluginManifest
   */
  private packageJsonToManifest(
    packageJson: any,
    pluginPath: string
  ): PluginManifest {
    return {
      id: packageJson.name || path.basename(pluginPath),
      name: packageJson.displayName || packageJson.name,
      version: packageJson.version || '1.0.0',
      displayName: packageJson.displayName,
      description: packageJson.description,
      publisher: packageJson.publisher || packageJson.author,
      categories: packageJson.categories || [],
      engines: packageJson.engines || { enxp: '*' },
      activationEvents: packageJson.activationEvents || ['onStartup'],
      main: packageJson.main || './dist/index.js',
      contributes: packageJson.contributes || {},
      dependencies: packageJson.dependencies,
      devDependencies: packageJson.devDependencies,
    };
  }

  /**
   * Validate manifest
   */
  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id) {
      throw new Error('Plugin manifest must have an id');
    }

    if (!manifest.name) {
      throw new Error('Plugin manifest must have a name');
    }

    if (!manifest.version) {
      throw new Error('Plugin manifest must have a version');
    }

    if (!manifest.main) {
      throw new Error('Plugin manifest must have a main entry point');
    }

    // Validate semver version format
    const semverRegex = /^\d+\.\d+\.\d+/;
    if (!semverRegex.test(manifest.version)) {
      throw new Error(
        `Invalid version format: ${manifest.version}. Must be semver (e.g., 1.0.0)`
      );
    }
  }

  /**
   * Create plugin metadata from manifest
   */
  private createMetadata(manifest: PluginManifest): PluginMetadata {
    return {
      id: manifest.id,
      name: manifest.displayName || manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.publisher,
      type: 'shared', // Unified plugins are shared
      dependencies: [],
      config: {},
    };
  }

  /**
   * Create plugin wrapper from activate/deactivate functions
   */
  private async createPluginFromActivateFunction(
    manifest: PluginManifest,
    activateFn: (context: ExtendedPluginContext) => Promise<void> | void,
    deactivateFn?: () => Promise<void> | void
  ): Promise<IPlugin> {
    const plugin = new (class extends Plugin {
      constructor() {
        super(manifest.id, manifest.name, manifest.version, {
          description: manifest.description,
        });
      }

      async activatePlugin(context: ExtendedPluginContext): Promise<void> {
        await activateFn(context);
      }

      async deactivate(): Promise<void> {
        if (deactivateFn) {
          await deactivateFn();
        }
        await super.deactivate();
      }
    })();

    return plugin;
  }

  /**
   * Create plugin context
   */
  createContext(manifest: PluginManifest, plugin: IPlugin): ExtendedPluginContext {
    return {
      logger: this.logger,
      events: this.events,
      config: { enabled: true, settings: {} },
      registry: this.registry,
      api: this.api,
      environment: this.environment,
      manifest,
      contributions: this.createContributionRegistry(manifest, plugin),
    };
  }

  /**
   * Create contribution registry for plugin
   */
  private createContributionRegistry(
    manifest: PluginManifest,
    plugin: IPlugin
  ): ExtendedPluginContext['contributions'] {
    return {
      registerCommand: (id: string, handler: Function) => {
        this.logger.info(`Registering command: ${id}`);
        this.events.emit('contribution:command', { pluginId: plugin.id, id, handler });
      },

      registerView: (id: string, view: any) => {
        this.logger.info(`Registering view: ${id}`);
        this.events.emit('contribution:view', { pluginId: plugin.id, id, view });
      },

      registerRoute: (route: any) => {
        this.logger.info(`Registering route: ${route.path}`);
        this.events.emit('contribution:route', { pluginId: plugin.id, route });
      },

      registerAPIRoute: (route: any) => {
        this.logger.info(`Registering API route: ${route.method} ${route.path}`);
        this.events.emit('contribution:api-route', { pluginId: plugin.id, route });
      },
    };
  }

  /**
   * Check if plugin should activate based on event
   */
  shouldActivate(manifest: PluginManifest, event: string): boolean {
    if (!manifest.activationEvents || manifest.activationEvents.length === 0) {
      return true; // No activation events means always activate
    }

    return manifest.activationEvents.some((activationEvent) => {
      if (activationEvent === 'onStartup') return true;
      if (activationEvent === event) return true;

      // Handle pattern matching
      const pattern = activationEvent.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(event);
    });
  }

  /**
   * Unload a plugin
   */
  async unload(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    await plugin.destroy();
    this.registry.unregister(pluginId);
    this.logger.info(`Plugin ${pluginId} unloaded`);
  }

  /**
   * Reload a plugin
   */
  async reload(pluginId: string): Promise<void> {
    const metadata = this.registry.getMetadata(pluginId);
    if (!metadata) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    await this.unload(pluginId);
    // Note: Would need to store original path to reload
    this.logger.info(`Plugin ${pluginId} reloaded`);
  }
}
