import { defineConfig } from 'vite';

// Cloudflare Pages serves from the domain root, so base = '/'.
// (GitHub Pages project sites would need base: '/portfolio/'.)
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Keep the lazy data chunks (blogData / codeData) split out — they are
    // dynamically imported in src/modules/ui.js on section entry.
    chunkSizeWarningLimit: 700,
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
