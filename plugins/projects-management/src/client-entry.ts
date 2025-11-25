import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateClient } from './client';

/**
 * Projects Management Plugin - Client Entry Point
 * This is the client-only version that doesn't import server dependencies
 */
export class ProjectsPluginClient extends Plugin {
  constructor() {
    super('projects-management', 'Project Management', '1.0.0', {
      description: 'Manage projects with full CRUD operations',
    });
  }

  /**
   * Activate in client environment only
   */
  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info(`Activating Projects plugin in client environment`);
    await activateClient(context);
    context.logger.info('Projects plugin activated successfully');
  }
}

// Default export for class-based loading
export default ProjectsPluginClient;
