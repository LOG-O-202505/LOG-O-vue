import { createRouter, createWebHistory } from 'vue-router'
import LogoSearch from '../views/LogoSearch.vue'
import OnboardingPage from '../views/OnboardingPage.vue'
import LookAround from '../views/LookAround.vue'
import KeywordSearch from '../views/KeywordSearch.vue'
import MyTravel from '../views/MyTravel.vue'
import TripPlan from '../views/TripPlan.vue'

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
  {
    path: '/keyword',
    name: 'KeywordSearch',
    component: KeywordSearch
  },
  {
    path: '/mytravel',
    name: 'MyTravel',
    component: MyTravel
  },
  {
    path: '/plan',
    name: 'TripPlan',
    component: TripPlan
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router