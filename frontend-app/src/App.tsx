import { lazy, Suspense } from 'react';
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
    minHeight: '400px' 
  }}>
    <Spin size="large" tip="Loading..." />
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

// Plugin registration (ready for future use)
const registerPlugins = async () => {
  try {
    // const registry = pluginManager.getRegistry();
    // Register your plugins here
    // Example:
    // await registry.registerPlugin(myPlugin);
  } catch (error) {
    console.error('Failed to register plugins:', error);
  }
};

// Uncomment when plugins are ready
// registerPlugins();

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
