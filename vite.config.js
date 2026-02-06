import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  
  // ✅ Résoudre les problèmes de modules Node.js
  resolve: {
    alias: {
      global: 'globalThis',
    },
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'build',
  }
})
