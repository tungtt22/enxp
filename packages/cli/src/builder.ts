import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';

export interface BuildOptions {
  watch?: boolean;
}

export class PluginBuilder {
  private pluginsDir: string;

  constructor() {
    this.pluginsDir = path.join(process.cwd(), 'plugins');
  }

  async build(pluginName?: string, options: BuildOptions = {}): Promise<void> {
    if (pluginName) {
      await this.buildPlugin(pluginName, options);
    } else {
      await this.buildAllPlugins(options);
    }
  }

  private async buildPlugin(pluginName: string, options: BuildOptions): Promise<void> {
    const pluginPath = path.join(this.pluginsDir, pluginName);

    if (!(await fs.pathExists(pluginPath))) {
      throw new Error(`Plugin '${pluginName}' not found`);
    }

    console.log(`Building plugin: ${pluginName}`);

    return new Promise((resolve, reject) => {
      const args = options.watch ? ['--watch'] : [];
      const tsc = spawn('tsc', args, {
        cwd: pluginPath,
        stdio: 'inherit',
        shell: true,
      });

      if (!options.watch) {
        tsc.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Build failed with code ${code}`));
          }
        });
      } else {
        console.log(`Watching plugin: ${pluginName}`);
        // In watch mode, we don't resolve
      }

      tsc.on('error', reject);
    });
  }

  private async buildAllPlugins(options: BuildOptions): Promise<void> {
    const pluginDirs = await fs.readdir(this.pluginsDir);

    for (const pluginName of pluginDirs) {
      const pluginPath = path.join(this.pluginsDir, pluginName);
      const stat = await fs.stat(pluginPath);

      if (stat.isDirectory() && (await fs.pathExists(path.join(pluginPath, 'package.json')))) {
        await this.buildPlugin(pluginName, options);
      }
    }
  }
}
