import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@netmap3d': path.resolve(__dirname, 'src/netmap3d'),
    },
  },
  base: process.env.GITHUB_PAGES === 'true' ? '/Sample-React-Project/' : '/',
  server: {
    port: 5173,
    host: 'localhost',
    open: false,
  },
})

