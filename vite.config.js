import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' + hash routing = the build works from any sub-path (GitHub Pages, Netlify, Vercel, a USB stick).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { manifest: 'asset-manifest.json', chunkSizeWarningLimit: 900 },
});
