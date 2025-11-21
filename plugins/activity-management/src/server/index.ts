import { ExtendedPluginContext } from '@enxp/core';
import { ActivityController } from './ActivityController';

export function activateServer(context: ExtendedPluginContext): void {
  console.log(`[${context.manifest.id}] Activating server-side plugin...`);

  const controller = new ActivityController();
  const router = controller.getRouter();

  // Register the router with the backend server
  context.events.emit('plugin:register-router', {
    pluginId: context.manifest.id,
    router,
    basePath: `/api/plugins/${context.manifest.id}`
  });

  console.log(`[${context.manifest.id}] Server-side plugin activated successfully`);
}
