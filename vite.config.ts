import { defineConfig } from 'vite';
import { kphotoSsg } from './src/ssg/vitePlugin.ts';

export default defineConfig({
  appType: 'custom',
  plugins: [kphotoSsg()],
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        client: 'src/client/main.ts',
        styles: 'src/styles/global.css',
      },
    },
  },
});
