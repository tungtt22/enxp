import * as fs from 'fs-extra';
import * as path from 'path';

export interface PluginOptions {
  type: 'backend' | 'frontend' | 'shared';
  description?: string;
  author?: string;
}

export class PluginGenerator {
  private templatesDir: string;
  private pluginsDir: string;

  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.pluginsDir = path.join(process.cwd(), 'plugins');
  }

  async createPlugin(name: string, options: PluginOptions): Promise<void> {
    const pluginId = this.toKebabCase(name);
    const className = this.toPascalCase(name);
    const pluginPath = path.join(this.pluginsDir, pluginId);

    // Check if plugin already exists
    if (await fs.pathExists(pluginPath)) {
      throw new Error(`Plugin '${pluginId}' already exists`);
    }

    // Create plugin directory
    await fs.ensureDir(pluginPath);

    // Generate based on type
    switch (options.type) {
      case 'backend':
        await this.generateBackendPlugin(pluginPath, pluginId, className, options);
        break;
      case 'frontend':
        await this.generateFrontendPlugin(pluginPath, pluginId, className, options);
        break;
      case 'shared':
        await this.generateSharedPlugin(pluginPath, pluginId, className, options);
        break;
    }

    // Generate common files
    await this.generateCommonFiles(pluginPath, pluginId, className, options);
  }

  private async generateBackendPlugin(
    pluginPath: string,
    pluginId: string,
    className: string,
    options: PluginOptions
  ): Promise<void> {
    const srcDir = path.join(pluginPath, 'src');
    await fs.ensureDir(srcDir);

    // Generate main plugin file
    const pluginContent = `import { BackendPlugin } from '@enxp/backend';
import { Router } from 'express';

export default class ${className}Plugin extends BackendPlugin {
  constructor() {
    super(
      '${pluginId}',
      '${className}',
      '1.0.0',
      {
        description: '${options.description || 'A backend plugin'}',
      }
    );
  }

  async onInitialize(): Promise<void> {
    this.log('info', 'Initializing ${className} plugin');
  }

  async onActivate(): Promise<void> {
    this.log('info', '${className} plugin activated');
  }

  registerRoutes(router: Router): void {
    // Example route
    router.get('/hello', (req, res) => {
      res.json({ message: 'Hello from ${className} plugin!' });
    });

    // Add your routes here
  }

  registerMiddleware(app: any): void {
    // Register middleware if needed
  }
}
`;

    await fs.writeFile(path.join(srcDir, 'index.ts'), pluginContent);
  }

  private async generateFrontendPlugin(
    pluginPath: string,
    pluginId: string,
    className: string,
    options: PluginOptions
  ): Promise<void> {
    const srcDir = path.join(pluginPath, 'src');
    await fs.ensureDir(srcDir);

    // Generate main plugin file
    const pluginContent = `import React from 'react';
import { FrontendPlugin, RouteDefinition, MenuItem } from '@enxp/frontend';

export default class ${className}Plugin extends FrontendPlugin {
  constructor() {
    super(
      '${pluginId}',
      '${className}',
      '1.0.0',
      {
        description: '${options.description || 'A frontend plugin'}',
      }
    );
  }

  async onInitialize(): Promise<void> {
    this.log('info', 'Initializing ${className} plugin');
  }

  async onActivate(): Promise<void> {
    this.log('info', '${className} plugin activated');
  }

  registerRoutes(): RouteDefinition[] {
    return [
      {
        path: '/${pluginId}',
        component: this.MainComponent,
        meta: {
          title: '${className}',
        },
      },
    ];
  }

  registerMenuItems(): MenuItem[] {
    return [
      {
        id: '${pluginId}',
        label: '${className}',
        path: '/${pluginId}',
        order: 100,
      },
    ];
  }

  private MainComponent: React.FC = () => {
    return (
      <div>
        <h1>${className} Plugin</h1>
        <p>This is a frontend plugin.</p>
      </div>
    );
  };
}
`;

    await fs.writeFile(path.join(srcDir, 'index.tsx'), pluginContent);
  }

  private async generateSharedPlugin(
    pluginPath: string,
    pluginId: string,
    className: string,
    options: PluginOptions
  ): Promise<void> {
    const srcDir = path.join(pluginPath, 'src');
    await fs.ensureDir(srcDir);

    const pluginContent = `import { BasePlugin } from '@enxp/core';

export default class ${className}Plugin extends BasePlugin {
  constructor() {
    super(
      '${pluginId}',
      '${className}',
      '1.0.0',
      'shared',
      {
        description: '${options.description || 'A shared plugin'}',
      }
    );
  }

  async onInitialize(): Promise<void> {
    this.log('info', 'Initializing ${className} plugin');
  }

  async onActivate(): Promise<void> {
    this.log('info', '${className} plugin activated');
  }
}
`;

    await fs.writeFile(path.join(srcDir, 'index.ts'), pluginContent);
  }

  private async generateCommonFiles(
    pluginPath: string,
    pluginId: string,
    className: string,
    options: PluginOptions
  ): Promise<void> {
    // package.json
    const packageJson = {
      name: `@enxp-plugin/${pluginId}`,
      version: '1.0.0',
      description: options.description || `${className} plugin`,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        dev: 'tsc --watch',
        clean: 'rm -rf dist',
      },
      dependencies: {
        '@enxp/core': '^1.0.0',
        ...(options.type === 'backend' ? { '@enxp/backend': '^1.0.0' } : {}),
        ...(options.type === 'frontend' ? { '@enxp/frontend': '^1.0.0' } : {}),
      },
      devDependencies: {
        typescript: '^5.3.2',
      },
      author: options.author || '',
      license: 'MIT',
    };

    await fs.writeJSON(path.join(pluginPath, 'package.json'), packageJson, { spaces: 2 });

    // tsconfig.json
    const tsConfig = {
      extends: '../../tsconfig.json',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
        ...(options.type === 'frontend' ? { jsx: 'react' } : {}),
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };

    await fs.writeJSON(path.join(pluginPath, 'tsconfig.json'), tsConfig, { spaces: 2 });

    // README.md
    const readme = `# ${className} Plugin

${options.description || 'A plugin for ENXP platform'}

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Usage

This is a ${options.type} plugin that provides...

## API

Document your plugin's API here.
`;

    await fs.writeFile(path.join(pluginPath, 'README.md'), readme);

    // .gitignore
    const gitignore = `node_modules/
dist/
*.log
.DS_Store
`;

    await fs.writeFile(path.join(pluginPath, '.gitignore'), gitignore);
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, (c) => c.toUpperCase());
  }
}
