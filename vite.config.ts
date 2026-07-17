import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        onstart: (args) => args.startup(),
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist/main',
            rollupOptions: {
              external: ['better-sqlite3', 'koffi'],
            },
          },
        },
      },
      {
        entry: 'src/main/preload.ts',
        onstart: (args) => args.reload(),
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist/preload',
            lib: {
              formats: ['cjs'],
            },
          },
        },
      },
    ]),
  ],
  build: {
    outDir: 'dist/renderer',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
});
