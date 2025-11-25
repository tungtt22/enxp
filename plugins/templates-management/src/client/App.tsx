import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ExtendedPluginContext } from '@enxp/core';
import { TemplatesDashboard } from './TemplatesDashboard';

interface AppProps {
  context: ExtendedPluginContext;
}

/**
 * Standalone App wrapper
 * Used when plugin runs as independent application
 */
export const App: React.FC<AppProps> = ({ context }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">
                📋 {context.manifest.displayName || context.manifest.name}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              v{context.manifest.version} (Standalone Mode)
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<TemplatesDashboard />} />
          <Route path="/templates" element={<TemplatesDashboard />} />
          <Route path="/templates/:id" element={<div>Template Details</div>} />
        </Routes>
      </main>
    </div>
  );
};
