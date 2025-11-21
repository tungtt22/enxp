import { ExtendedPluginContext } from '@enxp/core';
import { Router } from 'express';
import { ProjectsController } from './ProjectsController';

/**
 * Server-side activation for Projects plugin
 */
export async function activateServer(context: ExtendedPluginContext): Promise<void> {
  context.logger.info('Activating Projects plugin (server)');

  const controller = new ProjectsController();

  // Register API routes from manifest
  if (context.manifest.contributes?.api) {
    const { basePath } = context.manifest.contributes.api;
    
    context.logger.info(`Setting up router for basePath: ${basePath}`);
    
    // Create router for this plugin
    const router = Router();
    controller.registerRoutes(router);

    context.logger.info(`Emitting plugin:register-router event`);
    
    // Emit event to register router with base path
    context.events.emit('plugin:register-router', {
      pluginId: context.manifest.id,
      basePath,
      router,
    });

    context.logger.info(`Registered API routes at ${basePath}`);
  }

  // Register commands
  if (context.manifest.contributes?.commands) {
    context.manifest.contributes.commands.forEach((cmd) => {
      context.contributions?.registerCommand?.(cmd.command, async () => {
        context.logger.info(`Executing command: ${cmd.command}`);
      });
    });
  }

  context.logger.info('Projects plugin (server) activated successfully');
}
