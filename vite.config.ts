import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  // The deploy builds into a staging directory and swaps it in with a single
  // mv, so the document root is never half-written. An env var rather than
  // `--outDir` because the build is now several commands and CLI args would
  // only reach the last one. See deploy/rebuild.sh.
  build: { outDir: process.env.OUT_DIR || 'dist' },
  server: { port: 5180, host: true },
})
