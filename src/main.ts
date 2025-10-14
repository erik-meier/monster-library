import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import design system
import './assets/design-tokens.css'
import './assets/components.css'
import './assets/base.css'

// Import your views
import MonsterView from './views/MonsterView.vue'
import MonsterList from './views/MonsterList.vue'
import Home from './views/Home.vue'
import MonsterCreate from './views/MonsterCreate.vue'
import MyMonsters from './views/MyMonsters.vue'
import MyEncounters from './views/MyEncounters.vue'
import About from './views/About.vue'
import MonsterRandom from './views/MonsterRandom.vue'
import EncounterBuilder from './views/EncounterBuilder.vue'
import MaliceView from './views/MaliceView.vue'

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
    path: '/monster/create',
    name: 'MonsterCreate',
    component: MonsterCreate
  },
  {
    path: '/monster-random',
    name: 'MonsterRandom',
    component: MonsterRandom
  },
  {
    path: '/monster/:monsterId',
    name: 'Monster',
    component: MonsterView,
    props: true // This passes the route params as props
  },
  {
    path: '/malice/:maliceId',
    name: 'Malice',
    component: MaliceView,
    props: true // This passes the route params as props
  },
  {
    path: '/my-monsters',
    name: 'MyMonsters',
    component: MyMonsters
  },
  {
    path: '/my-encounters',
    name: 'MyEncounters',
    component: MyEncounters
  },
  {
    path: '/encounter-builder',
    name: 'EncounterBuilder',
    component: EncounterBuilder
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating between routes
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Create and mount the app
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')