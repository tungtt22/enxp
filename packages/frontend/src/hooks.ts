import { useMemo } from 'react';
import { usePluginContext } from './PluginProvider';
import { FrontendPlugin, RouteDefinition, MenuItem, Widget } from './FrontendPlugin';

/**
 * Hook to get all plugins
 */
export function usePlugins(): FrontendPlugin[] {
  const { plugins } = usePluginContext();
  return plugins;
}

/**
 * Hook to get a specific plugin
 */
export function usePlugin(pluginId: string): FrontendPlugin | undefined {
  const { plugins } = usePluginContext();
  return plugins.find((p) => p.id === pluginId);
}

/**
 * Hook to get all routes from plugins
 */
export function usePluginRoutes(): RouteDefinition[] {
  const { plugins } = usePluginContext();
  
  return useMemo(() => {
    const routes: RouteDefinition[] = [];
    plugins.forEach((plugin) => {
      if (plugin.registerRoutes) {
        routes.push(...plugin.registerRoutes());
      }
    });
    return routes;
  }, [plugins]);
}

/**
 * Hook to get all menu items from plugins
 */
export function usePluginMenuItems(): MenuItem[] {
  const { plugins } = usePluginContext();
  
  return useMemo(() => {
    const items: MenuItem[] = [];
    plugins.forEach((plugin) => {
      if (plugin.registerMenuItems) {
        items.push(...plugin.registerMenuItems());
      }
    });
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [plugins]);
}

/**
 * Hook to get all widgets from plugins
 */
export function usePluginWidgets(): Widget[] {
  const { plugins } = usePluginContext();
  
  return useMemo(() => {
    const widgets: Widget[] = [];
    plugins.forEach((plugin) => {
      if (plugin.registerWidgets) {
        widgets.push(...plugin.registerWidgets());
      }
    });
    return widgets;
  }, [plugins]);
}

/**
 * Hook to get a component from a plugin
 */
export function usePluginComponent(
  pluginId: string,
  componentName: string
): React.ComponentType<any> | undefined {
  const plugin = usePlugin(pluginId);
  
  return useMemo(() => {
    if (!plugin?.registerComponents) return undefined;
    const components = plugin.registerComponents();
    return components.get(componentName);
  }, [plugin, componentName]);
}
