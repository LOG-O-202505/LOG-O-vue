import { createRouter, createWebHistory } from 'vue-router'
import LogoSearch from '../views/LogoSearch.vue'
import OnboardingPage from '../views/OnboardingPage.vue'
import LookAround from '../views/LookAround.vue'
import KeywordSearch from '../views/KeywordSearch.vue'
import MyTravel from '../views/MyTravel.vue'
import TripPlan from '../views/TripPlan.vue'
import ImgSearch from '../views/ImgSearch.vue'
import Login from '../components/LoginModal.vue'
import OAuth2RedirectHandler from '../components/OAuth2RedirectHandler.vue'

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
  },
  {
    path: '/imgsearch',
    name: 'ImgSearch',
    component: ImgSearch
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/oauth2/redirect',
    name: 'OAuth2Redirect',
    component: OAuth2RedirectHandler
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Global navigation guard to save returnToPath
router.beforeEach((to, from, next) => {
  // Define paths that should not be saved as returnToPath
  const authPaths = ['/login', '/oauth2/redirect'];
  
  // If the path we are navigating TO is not an auth path,
  // save it as the intended return path.
  if (!authPaths.includes(to.path)) {
    localStorage.setItem('returnToPath', to.fullPath);
    console.log('Router Guard: Set returnToPath:', to.fullPath);
  }
  next(); // Continue with the navigation
});

export default router