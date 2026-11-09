import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(import.meta.dirname, 'shared'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (
            normalized.includes('node_modules/react') ||
            normalized.includes('node_modules/react-dom') ||
            normalized.includes('node_modules/react-router-dom')
          ) {
            return 'vendor-react';
          }
          if (normalized.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (normalized.includes('node_modules/zod')) {
            return 'vendor-zod';
          }
          if (normalized.includes('/shared/calculators/')) {
            return 'data-calculators';
          }
          if (
            normalized.includes('/shared/trousseauEncyclopediaData') ||
            normalized.includes('/shared/finishingEncyclopediaData') ||
            normalized.includes('/shared/knowledgeGlossaryData')
          ) {
            return 'data-encyclopedias';
          }
          if (
            normalized.includes('/shared/vendorMarketplaceData') ||
            normalized.includes('/shared/productEncyclopediaData') ||
            normalized.includes('/shared/catalogSeedData') ||
            normalized.includes('/shared/cmsSeedData')
          ) {
            return 'data-marketplace';
          }
          if (
            normalized.includes('/shared/journeyWorkspaceData') ||
            normalized.includes('/shared/earlyStartData') ||
            normalized.includes('/shared/stage11Data') ||
            normalized.includes('/shared/stage10Data') ||
            normalized.includes('/shared/communityData')
          ) {
            return 'data-ecosystem';
          }
        },
      },
    },
  },
});
