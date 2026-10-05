import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // The react plugin enables JSX transformation and Fast Refresh (hot reload)
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to Spring Boot backend
    // This means /api/... in React will be sent to http://localhost:8080/api/...
    // This avoids CORS issues during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
