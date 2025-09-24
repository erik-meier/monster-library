import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Enable JSON imports
  assetsInclude: ['**/*.json'],
  // Optimize build for better tree shaking
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'monster-data': ['src/data/monsters.js']
        }
      }
    }
  }
})
