import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PluginManager } from '@enxp/core';
import { PluginProvider, usePluginRoutes } from '@enxp/frontend';
import AppLayout from './components/layout/AppLayout';
import { HomePage, ProjectsPage, TemplatesPage, ActivityPage, SettingsPage } from './pages';
import { Result, Button } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

const pluginManager = new PluginManager();

// Uncomment when plugins are ready for ESM
// const registerPlugins = async () => {
//   try {
//     const registry = pluginManager.getRegistry();
//     // Register your plugins here
//   } catch (error) {
//     console.error('Failed to register plugins:', error);
//   }
// };

// registerPlugins();

function AppContent() {
  const routes = usePluginRoutes();

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
        <Route
          path="*"
          element={
            <Result
              status="404"
              title="404"
              subTitle="Sorry, the page you visited does not exist."
              extra={<Button type="primary" href="/">Back Home</Button>}
            />
          }
        />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PluginProvider pluginManager={pluginManager}>
        <AppContent />
      </PluginProvider>
    </BrowserRouter>
  );
}

export default App;
