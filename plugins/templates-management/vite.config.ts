import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

// Read plugin manifest
const pluginManifest = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './plugin.json'), 'utf-8')
);

const port = parseInt(process.env.PORT || '4003');

export default defineConfig({
  plugins: [],
  server: {
    port,
    host: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['express', '@enxp/core'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@enxp/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@enxp/frontend': path.resolve(__dirname, '../../packages/frontend/src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@enxp/core', '@enxp/frontend'],
  },
});
