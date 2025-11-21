import { ExtendedPluginContext } from '@enxp/core';

export function activateClient(context: ExtendedPluginContext): void {
  console.log(`[${context.manifest.id}] Activating client-side plugin...`);
  // Client-side activation logic will be added here in the future
  console.log(`[${context.manifest.id}] Client-side plugin activated successfully`);
}
