import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const buildId = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
