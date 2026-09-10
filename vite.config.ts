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
  build: {
    outDir: process.env.OUT_DIR || 'dist',
    // Never inline a font, whatever its size.
    //
    // Vite inlines any asset under 4 kB as a base64 data: URI, and one font
    // subset slipped under that line — JetBrains Mono's Cyrillic-Ext cut is
    // 2,028 bytes. The CSP this site ships is `font-src 'self'`, which a data:
    // URI is not, so the browser blocked that one @font-face and logged it on
    // every page that renders code. Every other subset is larger than 4 kB and
    // stayed a real file, which is why it was exactly one font and easy to miss.
    //
    // A callback rather than `assetsInlineLimit: 0`: small SVGs and images are
    // still worth inlining, and `undefined` falls through to the default limit
    // for everything that is not a font.
    assetsInlineLimit: (filePath) =>
      /\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined,
  },
  server: { port: 5180, host: true },
})
