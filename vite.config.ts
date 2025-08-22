import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',
      dts: true,
      extensions: ['.vue'],
      exclude: ['**/components/**'],
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3001,
  },
})
