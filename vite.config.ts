import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7217', // ← ajusta al puerto de tu .NET
        secure: false,
        changeOrigin: true
      }
    }
  }
})