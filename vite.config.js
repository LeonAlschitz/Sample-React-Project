import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/nexus-infrastructure/' : '/',
  server: {
    port: 5173,
    host: 'localhost',
    open: false,
  },
})

