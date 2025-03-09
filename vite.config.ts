import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:8008',
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, ''),
      }
    }
  }
});