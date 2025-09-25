import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import your views
import MonsterView from './views/MonsterView.vue'
import MonsterList from './views/MonsterList.vue'
import Home from './views/Home.vue'

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/monsters',
    name: 'MonsterList',
    component: MonsterList
  },
  {
    path: '/monster/:monsterId',
    name: 'Monster',
    component: MonsterView,
    props: true // This passes the route params as props
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create and mount the app
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')