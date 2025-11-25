import { ExtendedPluginContext } from '@enxp/core';
import { ActivityDashboard } from './ActivityDashboard';

export { ActivityDashboard } from './ActivityDashboard';
export { App } from './App';

/**
 * Client-side activation for Activity plugin
 */
export async function activateClient(context: ExtendedPluginContext): Promise<void> {
  context.logger.info('Activating Activity plugin (client)');

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
  context.contributions?.registerView?.('activityDashboard', {
    component: ActivityDashboard,
    title: 'Activity Dashboard',
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

  context.logger.info('Activity plugin (client) activated successfully');
}
