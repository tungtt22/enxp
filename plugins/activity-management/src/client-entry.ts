import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateClient } from './client';

/**
 * Activity Management Plugin - Client Entry Point
 * This is the client-only version that doesn't import server dependencies
 */
export class ActivityPluginClient extends Plugin {
  constructor() {
    super('activity-management', 'Activity Management', '1.0.0', {
      description: 'Track and manage development activities',
    });
  }

  /**
   * Activate in client environment only
   */
  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info(`Activating Activity plugin in client environment`);
    await activateClient(context);
    context.logger.info('Activity plugin activated successfully');
  }
}

// Default export for class-based loading
export default ActivityPluginClient;
