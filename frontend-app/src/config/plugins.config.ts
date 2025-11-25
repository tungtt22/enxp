/**
 * Plugin Registry Configuration
 * Centralized configuration for all available plugins (local and remote)
 */

import { RemotePluginConfig } from '@enxp/core';

/**
 * Environment-based configuration
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Remote plugin configurations
 * In production, these URLs would point to CDN or deployed plugin hosts
 */
export const REMOTE_PLUGIN_CONFIGS: RemotePluginConfig[] = [
  {
    id: 'projects-management',
    url: isDevelopment
      ? 'http://localhost:4001/remoteEntry.js'
      : 'https://cdn.example.com/plugins/projects-management/remoteEntry.js',
    scope: 'projects-management',
    module: './Plugin',
  },
  {
    id: 'activity-management',
    url: isDevelopment
      ? 'http://localhost:4002/remoteEntry.js'
      : 'https://cdn.example.com/plugins/activity-management/remoteEntry.js',
    scope: 'activity-management',
    module: './Plugin',
  },
  {
    id: 'templates-management',
    url: isDevelopment
      ? 'http://localhost:4003/remoteEntry.js'
      : 'https://cdn.example.com/plugins/templates-management/remoteEntry.js',
    scope: 'templates-management',
    module: './Plugin',
  },
];

/**
 * Plugin port mapping for development
 */
export const PLUGIN_DEV_PORTS: Record<string, number> = {
  'projects-management': 4001,
  'activity-management': 4002,
  'templates-management': 4003,
};

/**
 * Get plugin configuration by ID
 */
export function getPluginConfig(pluginId: string): RemotePluginConfig | undefined {
  return REMOTE_PLUGIN_CONFIGS.find((config) => config.id === pluginId);
}

/**
 * Get all plugin configurations
 */
export function getAllPluginConfigs(): RemotePluginConfig[] {
  return REMOTE_PLUGIN_CONFIGS;
}

/**
 * Check if plugin is available
 */
export function isPluginAvailable(pluginId: string): boolean {
  return REMOTE_PLUGIN_CONFIGS.some((config) => config.id === pluginId);
}
