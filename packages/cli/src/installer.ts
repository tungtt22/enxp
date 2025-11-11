import * as fs from 'fs-extra';
import * as path from 'path';

export interface InstallOptions {
  global?: boolean;
}

export interface PluginInfo {
  name: string;
  version: string;
  type: string;
  description?: string;
}

export class PluginInstaller {
  private installedPluginsPath: string;

  constructor() {
    const platformRoot = process.cwd();
    this.installedPluginsPath = path.join(platformRoot, '.plugins', 'installed.json');
  }

  async install(pluginPath: string, options: InstallOptions = {}): Promise<void> {
    // Resolve plugin path
    const absolutePath = path.resolve(pluginPath);

    // Check if plugin exists
    if (!(await fs.pathExists(absolutePath))) {
      throw new Error(`Plugin not found at: ${absolutePath}`);
    }

    // Read plugin package.json
    const packageJsonPath = path.join(absolutePath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error('Invalid plugin: package.json not found');
    }

    const packageJson = await fs.readJSON(packageJsonPath);

    // Check if dist exists
    const distPath = path.join(absolutePath, 'dist');
    if (!(await fs.pathExists(distPath))) {
      throw new Error('Plugin not built. Run "npm run build" first.');
    }

    // Add to installed plugins list
    await this.addToInstalledList({
      name: packageJson.name,
      version: packageJson.version,
      type: this.getPluginType(packageJson),
      description: packageJson.description,
      path: absolutePath,
    });

    console.log(`Plugin ${packageJson.name} installed successfully`);
  }

  async uninstall(pluginId: string): Promise<void> {
    const installedPlugins = await this.getInstalledPlugins();
    const filtered = installedPlugins.filter((p: any) => !p.name.includes(pluginId));

    if (filtered.length === installedPlugins.length) {
      throw new Error(`Plugin ${pluginId} not found in installed plugins`);
    }

    await this.saveInstalledPlugins(filtered);
    console.log(`Plugin ${pluginId} uninstalled successfully`);
  }

  async list(): Promise<PluginInfo[]> {
    const installedPlugins = await this.getInstalledPlugins();
    return installedPlugins.map((p: any) => ({
      name: p.name,
      version: p.version,
      type: p.type,
      description: p.description,
    }));
  }

  private async addToInstalledList(pluginInfo: any): Promise<void> {
    const installedPlugins = await this.getInstalledPlugins();

    // Check if already installed
    const existingIndex = installedPlugins.findIndex((p: any) => p.name === pluginInfo.name);

    if (existingIndex >= 0) {
      // Update existing
      installedPlugins[existingIndex] = pluginInfo;
    } else {
      // Add new
      installedPlugins.push(pluginInfo);
    }

    await this.saveInstalledPlugins(installedPlugins);
  }

  private async getInstalledPlugins(): Promise<any[]> {
    if (await fs.pathExists(this.installedPluginsPath)) {
      return await fs.readJSON(this.installedPluginsPath);
    }
    return [];
  }

  private async saveInstalledPlugins(plugins: any[]): Promise<void> {
    await fs.ensureDir(path.dirname(this.installedPluginsPath));
    await fs.writeJSON(this.installedPluginsPath, plugins, { spaces: 2 });
  }

  private getPluginType(packageJson: any): string {
    const dependencies = packageJson.dependencies || {};
    if (dependencies['@enxp/backend']) return 'backend';
    if (dependencies['@enxp/frontend']) return 'frontend';
    return 'shared';
  }
}
