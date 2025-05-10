import { createRouter, createWebHistory } from 'vue-router'
import LogoSearch from '../views/LogoSearch.vue'
import OnboardingPage from '../views/OnboardingPage.vue'
import LookAround from '../views/LookAround.vue'
const routes = [
  {
    path: '/',
    name: 'OnboardingPage',
    component: OnboardingPage
  },
  {
    path: '/llamasearch',
    name: 'LogoSearch',
    component: LogoSearch
  },
  {
    path: '/lookAround',
    name: 'LookAround',
    component: LookAround
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router