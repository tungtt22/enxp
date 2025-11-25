import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
