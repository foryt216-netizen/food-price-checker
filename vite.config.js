import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/estat': {
        target: 'https://api.e-stat.go.jp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/estat/, '')
      }
    }
  }
})
