import { createRouter, createWebHistory } from 'vue-router'
import LogoSearch from '../views/LogoSearch.vue'

const routes = [
  {
    path: '/',
    redirect: '/llamasearch'
  },
  {
    path: '/llamasearch',
    name: 'LogoSearch',
    component: LogoSearch
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router