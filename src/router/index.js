import { createRouter, createWebHistory } from 'vue-router'
import LogoSearch from '../views/LogoSearch.vue'
import OnboardingPage from '../views/OnboardingPage.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router