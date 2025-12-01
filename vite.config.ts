import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function htmlEnvPlugin(): Plugin {
  return {
    name: 'html-env',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const mode = ctx.server?.config.mode || 'production';
        const env = loadEnv(mode, process.cwd(), '');
        
        return html
          .replace(/%VITE_APP_TITLE%/g, env.VITE_APP_TITLE || 'Dashboard de KPIs - Grupo Blue')
          .replace(/%VITE_APP_LOGO%/g, env.VITE_APP_LOGO || '')
          .replace(/%VITE_ANALYTICS_ENDPOINT%/g, env.VITE_ANALYTICS_ENDPOINT || '')
          .replace(/%VITE_ANALYTICS_WEBSITE_ID%/g, env.VITE_ANALYTICS_WEBSITE_ID || '');
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), htmlEnvPlugin()],
  root: 'client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
