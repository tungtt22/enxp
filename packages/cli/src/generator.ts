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
    const serverDir = path.join(srcDir, 'server');
    await fs.ensureDir(srcDir);
    await fs.ensureDir(serverDir);

    // Generate plugin manifest
    const manifest = {
      id: pluginId,
      name: pluginId,
      displayName: className,
      version: '1.0.0',
      description: options.description || 'A backend plugin',
      publisher: options.author || 'ENXP',
      main: './dist/index.js',
      activationEvents: ['onStartup'],
      contributes: {
        api: {
          basePath: `/api/plugins/${pluginId}`
        }
      }
    };

    await fs.writeJSON(path.join(pluginPath, 'plugin.json'), manifest, { spaces: 2 });

    // Generate main plugin file
    const pluginContent = `import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateServer } from './server';

/**
 * ${className} Plugin
 */
export class ${className}Plugin extends Plugin {
  constructor() {
    super('${pluginId}', '${className}', '1.0.0', {
      description: '${options.description || 'A backend plugin'}',
    });
  }

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info(\`Activating \${this.name} in \${context.environment} environment\`);

    if (context.environment === 'server') {
      await activateServer(context);
    }

    context.logger.info(\`\${this.name} activated successfully\`);
  }

  /**
   * OpenAPI specification for Swagger documentation
   */
  getOpenAPISpec(): any {
    return {
      paths: {
        '/hello': {
          get: {
            summary: 'Hello endpoint',
            description: 'Returns a greeting message',
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Hello from ${className}!' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }
}

export default ${className}Plugin;
`;

    // Generate server activation file
    const serverContent = `import { ExtendedPluginContext } from '@enxp/core';
import { Router } from 'express';

export function activateServer(context: ExtendedPluginContext): void {
  const router = Router();

  // Example route
  router.get('/hello', async (req, res) => {
    res.json({ 
      success: true,
      message: 'Hello from ${className}!' 
    });
  });

  // Get basePath from manifest
  const basePath = context.manifest.contributes?.api?.basePath || \`/api/plugins/\${context.manifest.id}\`;

  // Register router with the platform
  context.events.emit('plugin:register-router', {
    pluginId: context.manifest.id,
    basePath,
    router,
  });

  context.logger.info(\`Registered API routes at \${basePath}\`);
}
`;

    await fs.writeFile(path.join(srcDir, 'index.ts'), pluginContent);
    await fs.writeFile(path.join(serverDir, 'index.ts'), serverContent);
  }

  private async generateFrontendPlugin(
    pluginPath: string,
    pluginId: string,
    className: string,
    options: PluginOptions
  ): Promise<void> {
    const srcDir = path.join(pluginPath, 'src');
    const clientDir = path.join(srcDir, 'client');
    await fs.ensureDir(srcDir);
    await fs.ensureDir(clientDir);

    // Generate plugin manifest
    const manifest = {
      id: pluginId,
      name: pluginId,
      displayName: className,
      version: '1.0.0',
      description: options.description || 'A frontend plugin',
      publisher: options.author || 'ENXP',
      main: './dist/index.js',
      activationEvents: ['onStartup'],
      contributes: {
        views: [
          {
            id: `${pluginId}-view`,
            name: className,
            icon: '🎨'
          }
        ]
      }
    };

    await fs.writeJSON(path.join(pluginPath, 'plugin.json'), manifest, { spaces: 2 });

    // Generate main plugin file
    const pluginContent = `import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateClient } from './client';

/**
 * ${className} Plugin
 */
export class ${className}Plugin extends Plugin {
  constructor() {
    super('${pluginId}', '${className}', '1.0.0', {
      description: '${options.description || 'A frontend plugin'}',
    });
  }

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info(\`Activating \${this.name} in \${context.environment} environment\`);

    if (context.environment === 'client') {
      await activateClient(context);
    }

    context.logger.info(\`\${this.name} activated successfully\`);
  }
}

export default ${className}Plugin;
`;

    // Generate client activation file
    const clientContent = `import { ExtendedPluginContext } from '@enxp/core';

export function activateClient(context: ExtendedPluginContext): void {
  context.logger.info('Client-side plugin activated');
  
  // Register UI components, routes, etc.
  // Example: context.ui.registerComponent('${className}Component', ${className}Component);
}
`;

    await fs.writeFile(path.join(srcDir, 'index.ts'), pluginContent);
    await fs.writeFile(path.join(clientDir, 'index.ts'), clientContent);
  }

  private async generateSharedPlugin(
    pluginPath: string,
    pluginId: string,
    className: string,
    options: PluginOptions
  ): Promise<void> {
    const srcDir = path.join(pluginPath, 'src');
    const sharedDir = path.join(srcDir, 'shared');
    await fs.ensureDir(srcDir);
    await fs.ensureDir(sharedDir);

    // Generate plugin manifest
    const manifest = {
      id: pluginId,
      name: pluginId,
      displayName: className,
      version: '1.0.0',
      description: options.description || 'A shared plugin',
      publisher: options.author || 'ENXP',
      main: './dist/index.js',
      activationEvents: ['onStartup']
    };

    await fs.writeJSON(path.join(pluginPath, 'plugin.json'), manifest, { spaces: 2 });

    const pluginContent = `import { Plugin, ExtendedPluginContext } from '@enxp/core';

/**
 * ${className} Plugin
 * Shared utilities and types
 */
export class ${className}Plugin extends Plugin {
  constructor() {
    super('${pluginId}', '${className}', '1.0.0', {
      description: '${options.description || 'A shared plugin'}',
    });
  }

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info(\`Activating \${this.name}\`);
    
    // Register shared utilities, types, or helpers
    
    context.logger.info(\`\${this.name} activated successfully\`);
  }
}

export default ${className}Plugin;
`;

    // Generate shared types file
    const typesContent = `/**
 * Shared types for ${className} plugin
 */

export interface Example {
  id: number;
  name: string;
}
`;

    await fs.writeFile(path.join(srcDir, 'index.ts'), pluginContent);
    await fs.writeFile(path.join(sharedDir, 'types.ts'), typesContent);
  }

  private async generateCommonFiles(
    pluginPath: string,
    pluginId: string,
    className: string,
    options: PluginOptions
  ): Promise<void> {
    // package.json
    const packageJson = {
      name: `@enxp/plugin-${pluginId}`,
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
        '@enxp/core': 'workspace:*',
        ...(options.type === 'backend' ? { 
          'express': '^4.18.2',
          'react-router-dom': '^6.20.0'
        } : {}),
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        ...(options.type === 'backend' ? { '@types/express': '^4.17.17' } : {}),
        typescript: '^5.0.0',
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
        composite: false
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };

    await fs.writeJSON(path.join(pluginPath, 'tsconfig.json'), tsConfig, { spaces: 2 });

    // vite.config.ts (for build configuration)
    const viteConfig = `import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

// Read plugin manifest
const pluginManifest = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './plugin.json'), 'utf-8')
);

const port = parseInt(process.env.PORT || '4001');

export default defineConfig({
  plugins: [],
  server: {
    port,
    host: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['express', '@enxp/core'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@enxp/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@enxp/frontend': path.resolve(__dirname, '../../packages/frontend/src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@enxp/core', '@enxp/frontend'],
  },
});
`;

    await fs.writeFile(path.join(pluginPath, 'vite.config.ts'), viteConfig);

    // README.md
    const readmeLines = [
      `# ${className} Plugin`,
      '',
      options.description || 'A plugin for ENXP platform',
      '',
      '## Installation',
      '',
      '```bash',
      'npm install',
      'npm run build',
      '```',
      '',
      '## Development',
      '',
      '```bash',
      'npm run dev',
      '```',
      '',
      `## Usage`,
      '',
      `This is a ${options.type} plugin that provides...`,
      ''
    ];

    if (options.type === 'backend') {
      readmeLines.push(
        '## API Endpoints',
        '',
        `- \`GET /api/plugins/${pluginId}/hello\` - Example endpoint`,
        '',
        '## Swagger Documentation',
        '',
        'API documentation is available at `http://localhost:3000/api-docs`',
        ''
      );
    }

    readmeLines.push(
      '## Structure',
      '',
      '```',
      `${pluginId}/`,
      '├── plugin.json          # Plugin manifest',
      '├── package.json',
      '├── tsconfig.json',
      '├── vite.config.ts',
      '└── src/',
      '    ├── index.ts         # Main plugin class'
    );

    if (options.type === 'backend') {
      readmeLines.push('    └── server/         # Server-side code');
    } else if (options.type === 'frontend') {
      readmeLines.push('    └── client/         # Client-side code');
    } else if (options.type === 'shared') {
      readmeLines.push('    └── shared/         # Shared utilities');
    }

    readmeLines.push('```');

    const readme = readmeLines.join('\n');
    await fs.writeFile(path.join(pluginPath, 'README.md'), readme);

    // .gitignore
    const gitignore = `node_modules/
dist/
*.log
.DS_Store
.env
.env.local
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
