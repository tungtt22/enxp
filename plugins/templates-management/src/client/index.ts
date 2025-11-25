import { ExtendedPluginContext } from '@enxp/core';
import { TemplatesDashboard } from './TemplatesDashboard';

export { TemplatesDashboard } from './TemplatesDashboard';
export { App } from './App';

/**
 * Client-side activation for Templates plugin
 */
export async function activateClient(context: ExtendedPluginContext): Promise<void> {
  context.logger.info('Activating Templates plugin (client)');

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
  context.contributions?.registerView?.('templatesDashboard', {
    component: TemplatesDashboard,
    title: 'Templates Dashboard',
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

  context.logger.info('Templates plugin (client) activated successfully');
}
