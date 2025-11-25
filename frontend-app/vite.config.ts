import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host_app',
      remotes: {
        // Remote plugins can be configured here or loaded dynamically
        // Example:
        // projects: 'http://localhost:4001/assets/remoteEntry.js',
        // activities: 'http://localhost:4002/assets/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.20.0',
        },
        '@enxp/core': {
          singleton: true,
          requiredVersion: '^1.0.0',
        },
        '@enxp/frontend': {
          singleton: true,
          requiredVersion: '^1.0.0',
        },
      },
    }),
  ],
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@enxp/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
      '@enxp/backend': path.resolve(__dirname, '../packages/backend/src/index.ts'),
      '@enxp/frontend': path.resolve(__dirname, '../packages/frontend/src/index.ts'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  optimizeDeps: {
    exclude: ['@enxp/core', '@enxp/frontend', '@enxp/backend'],
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-enxp': ['@enxp/core', '@enxp/frontend'],
        },
      },
    },
  },
});
