import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/start-port': 'https://port-your-bond-backend.onrender.com',
      '/job': 'https://port-your-bond-backend.onrender.com'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios']
  }
})
