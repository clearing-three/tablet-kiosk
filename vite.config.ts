import { resolve } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  envDir: '../', // Look for .env files in project root
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    copyPublicDir: true,
  },
  base: './', // Use relative paths instead of absolute
  server: {
    port: 3000,
    open: true,
  },
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
