import { ExtendedPluginContext } from '@enxp/core';

export { CicdDashboard } from './CicdDashboard';
export { App } from './App';

/**
 * Client-side activation for CICD plugin
 */
export async function activateClient(context: ExtendedPluginContext): Promise<void> {
  context.logger.info('CICD plugin (client) activated');
  // Routes are registered via registerRoutes() method
  // Additional client-side initialization can go here
}
