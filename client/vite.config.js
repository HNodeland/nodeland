import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path            from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // now you can do: import RainChart from 'components/RainChart'
      'components': path.resolve(__dirname, 'src/components'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://backend:4000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      '/api': {
        target: 'http://backend:4000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
})
