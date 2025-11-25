import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateClient } from './client';

/**
 * Templates Management Plugin - Client Entry Point
 * This is the client-only version that doesn't import server dependencies
 */
export class TemplatesPluginClient extends Plugin {
  constructor() {
    super('templates-management', 'Templates Management', '1.0.0', {
      description: 'Architecture templates management plugin with categorization and usage tracking',
    });
  }

  /**
   * Activate in client environment only
   */
  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info(`Activating Templates plugin in client environment`);
    await activateClient(context);
    context.logger.info('Templates plugin activated successfully');
  }
}

// Default export for class-based loading
export default TemplatesPluginClient;
