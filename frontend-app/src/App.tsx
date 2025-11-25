import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PluginManager } from '@enxp/core';
import { PluginProvider, usePluginRoutes } from '@enxp/frontend';
import { Result, Button, Spin } from 'antd';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import 'antd/dist/reset.css';
import './index.css';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Loading fallback component  
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <Spin size="large" />
    <div>Loading...</div>
  </div>
);

// 404 Not Found component
const NotFound = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Button type="primary" href="/">
        Back Home
      </Button>
    }
  />
);

// Initialize plugin manager singleton
const pluginManager = new PluginManager();

// Import plugins (use named exports)
import { ProjectsPlugin } from '../../plugins/projects-management/dist/index';
import { ActivityPlugin } from '../../plugins/activity-management/dist/index';
import { TemplatesPlugin } from '../../plugins/templates-management/dist/index';
import { CicdPlugin } from '../../plugins/cicd/dist/index';

/**
 * Create plugin context for client environment
 */
function createClientContext() {
  return {
    logger: { 
      debug: console.debug, 
      info: console.info, 
      warn: console.warn, 
      error: console.error 
    },
    events: pluginManager.getEvents(),
    config: { enabled: true, settings: {} },
    registry: pluginManager.getRegistry(),
    api: pluginManager.getAPI(),
    environment: 'client' as const,
  };
}

/**
 * Load all plugins
 */
async function loadPlugins() {
  const registry = pluginManager.getRegistry();
  const plugins = [
    new ProjectsPlugin(),
    new ActivityPlugin(),
    new TemplatesPlugin(),
    new CicdPlugin(),
  ];

  for (const plugin of plugins) {
    try {
      // Skip if already registered (React StrictMode double-call protection)
      if (registry.has(plugin.id)) {
        console.log(`⏭️  Plugin ${plugin.id} already registered`);
        continue;
      }

      registry.register(plugin, {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        type: 'shared',
        dependencies: plugin.dependencies || []
      });

      const context = createClientContext();
      await plugin.initialize(context);
      await plugin.activate();
      console.log(`✅ Loaded plugin: ${plugin.id}`);
    } catch (error) {
      console.warn(`⚠️  Failed to load plugin ${plugin.id}:`, error);
    }
  }
}

/**
 * AppContent - Main routing component
 */
function AppContent() {
  const pluginRoutes = usePluginRoutes();

  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Core routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Plugin routes */}
          {pluginRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          ))}
          
          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

/**
 * App - Root component
 */
function App() {
  const [pluginsLoaded, setPluginsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPlugins().then(() => {
      if (!cancelled) setPluginsLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  if (!pluginsLoaded) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <PluginProvider pluginManager={pluginManager}>
          <AppContent />
        </PluginProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
