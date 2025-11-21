import { ExtendedPluginContext } from '@enxp/core';
import { TemplatesController } from './TemplatesController';

export function activateServer(context: ExtendedPluginContext): void {
  console.log(`[${context.manifest.id}] Activating server-side plugin...`);

  const controller = new TemplatesController();
  const router = controller.getRouter();

  // Register the router with the backend server
  context.events.emit('plugin:register-router', {
    pluginId: context.manifest.id,
    router,
    basePath: `/api/plugins/${context.manifest.id}`
  });

  console.log(`[${context.manifest.id}] Server-side plugin activated successfully`);
}
