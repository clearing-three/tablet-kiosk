import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    // Input will be configured when src structure is created in task 1.7
  },
  server: {
    port: 3000,
    open: true,
  },
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
