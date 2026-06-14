import { defineConfig } from 'vite';

// Base path depends on the host:
//   - Cloudflare Pages / local dev → domain root '/'
//   - GitHub Pages project site (kim98828.github.io/portfolio) → '/portfolio/'
// The Pages deploy workflow sets DEPLOY_TARGET=github-pages.
const base = process.env.DEPLOY_TARGET === 'github-pages' ? '/portfolio/' : '/';

export default defineConfig({
  base,
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
