import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 앱 생성 및 마운트
createApp(App)
  .use(store)
  .use(router)
  .mount('#app')