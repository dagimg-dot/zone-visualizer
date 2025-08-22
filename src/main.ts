import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { requireZones } from '@/utils/router'
import App from './App.vue'

import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Add route guards
router.beforeEach((to, from, next) => {
  // Protect map route - require zones to be loaded
  if (to.path === '/map') {
    requireZones(to, from, next)
  }
  else {
    next()
  }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
