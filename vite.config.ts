import { fileURLToPath, URL } from 'node:url';
import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { mdxOptions } from './scripts/mdx-options';

export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx(mdxOptions) },
    react({ include: /\.(mdx|md|jsx|js|tsx|ts)$/ }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, host: '127.0.0.1' },
  preview: { port: 4173, host: '127.0.0.1' },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          flow: ['@xyflow/react'],
        },
      },
    },
  },
});
