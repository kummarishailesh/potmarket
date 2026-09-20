import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicHost = String(env.VITE_PUBLIC_HOST || '').trim()
  const backendTarget = String(env.BACKEND_URL || `http://127.0.0.1:${env.BACKEND_PORT || 3001}`).replace(/\/$/, '')

  return {
  logLevel: 'info',
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    open: false,
    allowedHosts: ['localhost', '127.0.0.1', ...(publicHost ? [publicHost] : [])],
    // Run Vite dev server on 3000 (so the terminal shows Local: http://localhost:3000)
    port: 3000,
    // Allow network access (bind to all addresses). This makes the dev server reachable
    // from other devices in the LAN (e.g. http://172.20.101.175:3000).
    // Use `true` to let Vite resolve an appropriate host, including IPv6 where available.
    host: true,
    proxy: {
      // Proxy API requests to backend which will run on 3001 in development
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/health': {
        target: backendTarget,
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
  }
  }
})
