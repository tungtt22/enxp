import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@enxp/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
      '@enxp/backend': path.resolve(__dirname, '../packages/backend/src/index.ts'),
      '@enxp/frontend': path.resolve(__dirname, '../packages/frontend/src/index.ts'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  optimizeDeps: {
    exclude: ['@enxp/core', '@enxp/frontend', '@enxp/backend'],
  },
});
