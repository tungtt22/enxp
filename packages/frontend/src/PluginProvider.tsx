import React, { createContext, useContext, useEffect, useState } from 'react';
import { PluginManager } from '@enxp/core';
import { FrontendPlugin } from './FrontendPlugin';

/**
 * Plugin context for React
 */
interface PluginContextValue {
  pluginManager: PluginManager;
  plugins: FrontendPlugin[];
  loading: boolean;
}

const PluginContext = createContext<PluginContextValue | undefined>(undefined);

/**
 * Plugin Provider component
 */
export const PluginProvider: React.FC<{
  pluginManager: PluginManager;
  children: React.ReactNode;
}> = ({ pluginManager, children }) => {
  const [plugins, setPlugins] = useState<FrontendPlugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load frontend plugins
    const loadPlugins = () => {
      const frontendPlugins = pluginManager
        .getPlugins()
        .filter((p) => p.type === 'frontend') as FrontendPlugin[];
      setPlugins(frontendPlugins);
      setLoading(false);
    };

    loadPlugins();

    // Listen for plugin changes
    const events = pluginManager.getEvents();
    events.on('plugin:activated', loadPlugins);
    events.on('plugin:deactivated', loadPlugins);

    return () => {
      events.off('plugin:activated', loadPlugins);
      events.off('plugin:deactivated', loadPlugins);
    };
  }, [pluginManager]);

  return (
    <PluginContext.Provider value={{ pluginManager, plugins, loading }}>
      {children}
    </PluginContext.Provider>
  );
};

/**
 * Hook to use plugin context
 */
export function usePluginContext(): PluginContextValue {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePluginContext must be used within PluginProvider');
  }
  return context;
}
