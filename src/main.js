import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import googleLogin from 'vue3-google-login'
import config from './config'

// Vue 3 feature flags 설정
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false

// 카카오 맵 SDK 전역 로드
const loadKakaoMapSDK = () => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      console.log('Kakao Maps SDK already loaded');
      resolve();
      return;
    }

    // 스크립트 태그 생성
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${config.KAKAO_MAPS_API_KEY}&libraries=services,clusterer,drawing&autoload=false`;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log('Kakao Maps SDK loaded globally');
        window.kakaoMapsReady = true; // 전역 플래그 설정
        resolve();
      });
    };
    
    script.onerror = () => {
      console.error('Failed to load Kakao Maps SDK');
      reject(new Error('Failed to load Kakao Maps SDK'));
    };
    
    document.head.appendChild(script);
  });
};

// 앱 시작 시 카카오 맵 SDK 로드
loadKakaoMapSDK().catch(error => {
  console.error('Error loading Kakao Maps SDK:', error);
});

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