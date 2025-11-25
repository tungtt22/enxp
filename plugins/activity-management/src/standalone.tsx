import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { bootstrapStandalone } from '@enxp/core';
import ActivityPluginClient from './client-entry';
import { App } from './client/App';
import pluginManifest from '../plugin.json';
import './styles.css';

/**
 * Standalone entry point
 * This file is used when the plugin runs as an independent application
 */

async function bootstrap() {
  console.log('[Activity Plugin] Starting in standalone mode...');

  try {
    // Create plugin instance (client-only version)
    const plugin = new ActivityPluginClient();
    console.log('[Activity Plugin] Plugin instance created:', plugin);

    // Bootstrap with standalone runtime
    const runtime = await bootstrapStandalone(plugin, {
      environment: 'client',
      manifest: pluginManifest as any,
      apiBaseUrl: '/api',
      loggerPrefix: '[Activity Standalone]',
    });
    
    console.log('[Activity Plugin] Runtime bootstrapped:', runtime);

    // Mount React app
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App context={runtime.getContext()} />
        </BrowserRouter>
      </React.StrictMode>
    );

    console.log('[Activity Plugin] Standalone mode started successfully');
  } catch (error) {
    console.error('[Activity Plugin] Bootstrap failed:', error);
    // Show error on page
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: system-ui;">
          <h1 style="color: red;">❌ Failed to start plugin</h1>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto;">
${error instanceof Error ? error.message : String(error)}

${error instanceof Error && error.stack ? error.stack : ''}
          </pre>
        </div>
      `;
    }
    throw error;
  }
}

// Start bootstrap
bootstrap();
