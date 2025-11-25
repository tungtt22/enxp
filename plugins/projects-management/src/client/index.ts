import { ExtendedPluginContext } from '@enxp/core';

export { ProjectsDashboard } from './ProjectsDashboard';
export { App } from './App';

/**
 * Client-side activation for Projects plugin
 */
export async function activateClient(context: ExtendedPluginContext): Promise<void> {
  context.logger.info('Projects plugin (client) activated');
  // Routes are registered via registerRoutes() method
}
