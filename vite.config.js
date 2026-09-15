import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  logLevel: 'silent',
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    open: false,
    // Run Vite dev server on 3000 (so the terminal shows Local: http://localhost:3000)
    port: 3000,
    // Allow network access (bind to all addresses). This makes the dev server reachable
    // from other devices in the LAN (e.g. http://172.20.101.175:3000).
    // Use `true` to let Vite resolve an appropriate host, including IPv6 where available.
    host: true,
    proxy: {
      // Proxy API requests to backend which will run on 3001 in development
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
  }
})
