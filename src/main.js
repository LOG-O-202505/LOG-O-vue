import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import googleLogin from 'vue3-google-login'

// Vue 3 feature flags 설정
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false

// 앱 생성
const app = createApp(App)

// Google OAuth 플러그인 등록 - 환경 변수 사용
app.use(googleLogin, {
  clientId: "417523631224-docm0ruhb42ehd19lppf0vf8u524u6hf.apps.googleusercontent.com"
})

// 라우터, 스토어 등록 및 마운트
app.use(store)
   .use(router)
   .mount('#app')