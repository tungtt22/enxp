import { ExtendedPluginContext } from '@enxp/core';
import { ProjectsDashboard } from './ProjectsDashboard';

/**
 * Client-side activation for Projects plugin
 */
export async function activateClient(context: ExtendedPluginContext): Promise<void> {
  context.logger.info('Activating Projects plugin (client)');

  // Register routes from manifest
  if (context.manifest.contributes?.routes) {
    context.manifest.contributes.routes.forEach((route) => {
      context.contributions?.registerRoute?.({
        path: route.path,
        title: route.title,
        icon: route.icon,
        exact: route.exact,
      });

      context.logger.info(`Registered route: ${route.path}`);
    });
  }

  // Register view/component
  context.contributions?.registerView?.('projectsDashboard', {
    component: ProjectsDashboard,
    title: 'Projects Dashboard',
  });

  // Register commands
  if (context.manifest.contributes?.commands) {
    context.manifest.contributes.commands.forEach((cmd) => {
      context.contributions?.registerCommand?.(cmd.command, async () => {
        context.logger.info(`Executing command: ${cmd.command}`);
        // Command implementation
      });
    });
  }

  context.logger.info('Projects plugin (client) activated successfully');
}
