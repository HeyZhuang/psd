import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import analyzer from 'vite-bundle-analyzer';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'polotno',
      project: 'polotno-studio',
    }),
    analyzer(),
  ],

  // 显式指定 public 目录
  publicDir: 'public',

  server: {
    host: '0.0.0.0',
    port: 3002,
    strictPort: true, // 强制使用 3002，不自动切换端口
    hmr: {
      protocol: 'ws',
      host: '54.189.143.120', // 使用外网 IP 以支持远程访问
      port: 3002,
    },
  },

  build: {
    sourcemap: true,
  },
});
