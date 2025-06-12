import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env vars from one level up (monorepo root)
  const env = loadEnv(mode, path.resolve(__dirname, '..'));

  return {
    root: __dirname,
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: parseInt(process.env.PORT || '4173'),
      host: '0.0.0.0',
    },
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/components/**/*.test.{ts,tsx}'],
      setupFiles: ['vitest.setup.ts'],
      isolate: true,
      coverage: {
        exclude: ['**/*.config.ts'],
      },
    },
  };
});