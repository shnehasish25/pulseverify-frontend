import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: [
      'prop-types',
      'react-is',
      'react-simple-maps',
      'recharts',
    ],
  },
  server: {
    // Proxy all /api requests to the Express backend.
    // This eliminates CORS issues entirely during development.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
