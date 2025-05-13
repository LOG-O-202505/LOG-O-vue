import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Vue 3 feature flags 설정
// 경고 메시지 해결을 위한 설정
// https://link.vuejs.org/feature-flags
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false

// 앱 생성 및 마운트
createApp(App)
  .use(store)
  .use(router)
  .mount('#app')