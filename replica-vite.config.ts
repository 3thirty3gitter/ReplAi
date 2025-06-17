import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'replica-client',
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './replica-client/src'),
      '@assets': path.resolve(__dirname, './attached_assets')
    }
  },
  build: {
    outDir: '../replica-dist',
    emptyOutDir: true
  }
})