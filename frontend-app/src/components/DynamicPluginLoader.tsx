import React, { useEffect, useState } from 'react';
import { pluginRuntimeLoader } from '@enxp/core';
import { REMOTE_PLUGIN_CONFIGS } from '../config/plugins.config';

/**
 * Dynamic Plugin Loader Component
 */
export const DynamicPluginLoader: React.FC<{
  onPluginsLoaded?: (plugins: any[]) => void;
}> = ({ onPluginsLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadRemotePlugins();
  }, []);

  const loadRemotePlugins = async () => {
    console.log('[DynamicPluginLoader] Loading remote plugins...');
    const loadedPlugins: any[] = [];
    const loadErrors: string[] = [];

    for (const config of REMOTE_PLUGIN_CONFIGS) {
      try {
        console.log(`[DynamicPluginLoader] Loading plugin: ${config.id}`);
        const pluginModule = await pluginRuntimeLoader.loadRemote(config);
        
        // Get the plugin class
        const PluginClass = pluginModule.default || pluginModule.Plugin;
        if (!PluginClass) {
          throw new Error(`Plugin ${config.id} does not export default or Plugin class`);
        }

        // Instantiate if needed
        const plugin = typeof PluginClass === 'function' ? new PluginClass() : PluginClass;
        
        loadedPlugins.push({
          id: config.id,
          plugin,
          config,
        });

        console.log(`[DynamicPluginLoader] Successfully loaded: ${config.id}`);
      } catch (error) {
        const errorMsg = `Failed to load plugin ${config.id}: ${error}`;
        console.error(errorMsg);
        loadErrors.push(errorMsg);
      }
    }

    setPlugins(loadedPlugins);
    setErrors(loadErrors);
    setLoading(false);

    if (onPluginsLoaded) {
      onPluginsLoaded(loadedPlugins);
    }

    console.log(
      `[DynamicPluginLoader] Loaded ${loadedPlugins.length}/${REMOTE_PLUGIN_CONFIGS.length} plugins`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading remote plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Remote Plugins ({plugins.length}/{REMOTE_PLUGIN_CONFIGS.length} loaded)
        </h3>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="text-red-800 font-medium mb-2">Plugin Load Errors:</h4>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {plugins.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-green-800 font-medium mb-2">Loaded Plugins:</h4>
          <ul className="list-disc list-inside text-green-700 text-sm">
            {plugins.map((p) => (
              <li key={p.id}>
                {p.plugin.name || p.id} (v{p.plugin.version || '1.0.0'})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
