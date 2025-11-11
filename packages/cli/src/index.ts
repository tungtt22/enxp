#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PluginGenerator } from './generator';
import { PluginBuilder } from './builder';
import { PluginInstaller } from './installer';

const program = new Command();

program
  .name('enxp-cli')
  .description('ENXP Platform Plugin CLI')
  .version('1.0.0');

/**
 * Create a new plugin
 */
program
  .command('create <plugin-name>')
  .description('Create a new plugin')
  .option('-t, --type <type>', 'Plugin type: backend, frontend, or shared', 'backend')
  .option('-d, --description <description>', 'Plugin description')
  .option('-a, --author <author>', 'Plugin author')
  .action(async (pluginName: string, options: any) => {
    try {
      const generator = new PluginGenerator();
      await generator.createPlugin(pluginName, {
        type: options.type,
        description: options.description,
        author: options.author,
      });
      console.log(`✅ Plugin '${pluginName}' created successfully!`);
      console.log(`\nNext steps:`);
      console.log(`  cd plugins/${pluginName}`);
      console.log(`  npm install`);
      console.log(`  npm run dev`);
    } catch (error) {
      console.error('❌ Error creating plugin:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Build a plugin
 */
program
  .command('build [plugin-name]')
  .description('Build a plugin')
  .option('-w, --watch', 'Watch mode')
  .action(async (pluginName: string | undefined, options: any) => {
    try {
      const builder = new PluginBuilder();
      await builder.build(pluginName, { watch: options.watch });
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Install a plugin
 */
program
  .command('install <plugin-path>')
  .description('Install a plugin to the platform')
  .option('-g, --global', 'Install globally')
  .action(async (pluginPath: string, options: any) => {
    try {
      const installer = new PluginInstaller();
      await installer.install(pluginPath, { global: options.global });
      console.log('✅ Plugin installed successfully!');
    } catch (error) {
      console.error('❌ Installation failed:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * List installed plugins
 */
program
  .command('list')
  .description('List all installed plugins')
  .action(async () => {
    try {
      const installer = new PluginInstaller();
      const plugins = await installer.list();
      
      if (plugins.length === 0) {
        console.log('No plugins installed.');
        return;
      }

      console.log('\nInstalled plugins:');
      plugins.forEach((plugin) => {
        console.log(`  - ${plugin.name} (${plugin.version}) [${plugin.type}]`);
        if (plugin.description) {
          console.log(`    ${plugin.description}`);
        }
      });
    } catch (error) {
      console.error('❌ Error listing plugins:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Uninstall a plugin
 */
program
  .command('uninstall <plugin-id>')
  .description('Uninstall a plugin')
  .action(async (pluginId: string) => {
    try {
      const installer = new PluginInstaller();
      await installer.uninstall(pluginId);
      console.log('✅ Plugin uninstalled successfully!');
    } catch (error) {
      console.error('❌ Uninstall failed:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Dev mode - watch and reload plugin
 */
program
  .command('dev <plugin-name>')
  .description('Run plugin in development mode')
  .action(async (pluginName: string) => {
    try {
      console.log(`🔨 Starting dev mode for plugin: ${pluginName}`);
      const builder = new PluginBuilder();
      await builder.build(pluginName, { watch: true });
    } catch (error) {
      console.error('❌ Dev mode failed:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse(process.argv);
