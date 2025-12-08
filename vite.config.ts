import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const buildNumber = process.env.BUILD_NUMBER || 'local';
    return {
      base: '/Hare-Krishna-Connect/',
      publicDir: 'public',
      build: {
        outDir: 'docs',
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: `assets/index-${buildNumber}.js`,
            chunkFileNames: `assets/[name]-${buildNumber}.js`,
            assetFileNames: `assets/[name]-${buildNumber}.[ext]`
          }
        }
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3000')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
