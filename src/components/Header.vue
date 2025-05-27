<template>
  <div class="header-component-wrapper" 
       :style="showHero && heroImageSrc ? { height: heroHeight } : {}"
       :class="{ 'has-hero': showHero && heroImageSrc }">

    <template v-if="showHero && heroImageSrc">
      <div class="hero-background-internal" :style="{ backgroundImage: `url(${heroImageSrc})` }"></div>
      <div class="hero-overlay-internal"></div>
      <div class="hero-content-internal">
        <h1 v-if="heroTitle" class="hero-title-internal">{{ heroTitle }}</h1>
        <p v-if="heroSubtitle" class="hero-subtitle-internal">{{ heroSubtitle }}</p>
      </div>
    </template>

    <nav class="navbar" :class="{ 'navbar-on-hero': showHero && heroImageSrc }">
      <div class="navbar-container">
        <div class="nav-group">
          <router-link to="/lookAround" class="nav-item">HOT PLACE</router-link>
          <router-link to="/llamasearch" class="nav-item">SEARCH</router-link>
          <router-link to="/keyword" class="nav-item">KEYWORD</router-link>
        </div>
        
        <div class="nav-center">
          <router-link to="/" class="logo-text">LOG:O</router-link>
        </div>
        
        <div class="nav-group">
          <!-- 로그인 상태에 따른 조건부 렌더링 -->
          <template v-if="isLoggedIn">
            <span v-if="userInfo.nickname" class="user-welcome">{{ userInfo.nickname }}님</span>
            <button @click="handleLogout" class="nav-item logout-btn">LOGOUT</button>
            <router-link to="/mytravel" class="nav-item">MY JOURNEY</router-link>
          </template>
          <template v-else>
            <LoginModal />
          </template>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
// LoginModal 컴포넌트와 auth 함수들 임포트
import LoginModal from './LoginModal.vue';
import { isAuthenticated, logout, apiGet } from '@/services/auth';

export default {
  name: 'AppHeader',
  // LoginModal 컴포넌트 등록
  components: {
    LoginModal
  },
  props: {
    showHero: {
      type: Boolean,
      default: false
    },
    heroImageSrc: {
      type: String,
      default: ''
    },
    heroTitle: {
      type: String,
      default: 'Welcome'
    },
    heroSubtitle: {
      type: String,
      default: 'Discover our amazing features.'
    },
    heroHeight: {
      type: String,
      default: '320px' // Default height for the hero section
    }
  },
  data() {
    return {
      isLoggedIn: false,
      userInfo: {}
    };
  },
  mounted() {
    // 컴포넌트 마운트 시 로그인 상태 확인
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = isAuthenticated();
      if (this.isLoggedIn) {
        this.fetchUserInfo();
      }
    },
    async handleLogout() {
      try {
        await logout();
        this.isLoggedIn = false;
        
        // 홈페이지로 리다이렉트
        this.$router.push('/');
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        // 오류가 발생해도 UI 상태는 업데이트
        this.isLoggedIn = false;
      }
    },
    async fetchUserInfo() {
      try {
        const response = await apiGet('/auth/me');
        if (response.status === 'success' && response.data) {
          this.userInfo = response.data;
        }
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
        // 인증 실패 시 로그인 상태 업데이트
        this.isLoggedIn = false;
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.header-component-wrapper {
  position: relative;
  width: 100%;
}

/* Styles for the new hero elements within Header.vue */
.hero-background-internal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.hero-overlay-internal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7));
  z-index: 2;
}

.hero-content-internal {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 5rem 5rem 0 5rem;
  color: white;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.hero-title-internal {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.hero-subtitle-internal {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.2rem;
  font-weight: 300;
  margin: 0;
  opacity: 0.9;
  color: white;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

/* Modified navbar styles */
.navbar {
  position: relative; /* Default for no hero */
  z-index: 10; 
  width: 100%;
  padding: 3.5rem 0; 
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent); /* Default, can be overridden or made conditional if needed when no hero */
  /* transition for background if needed, but might be complex with absolute/relative switch */
}

.navbar.navbar-on-hero {
  position: absolute; /* Floats over hero */
  top: 0;
  left: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent); /* Ensures transparency over hero */
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.nav-group {
  display: flex;
  gap: 2.5rem; /* 간격 조정 */
  align-items: center;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.logo-text {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem; /* 크기 조정 */
  font-weight: 600;
  color: white;
  text-decoration: none;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.nav-item {
  font-family: 'Playfair Display', serif; /* 온보딩 페이지와 동일한 폰트로 변경 */
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0.9;
}

.nav-item:hover {
  opacity: 1;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: white;
  transition: width 0.3s ease;
}

.nav-item:hover::after {
  width: 100%;
}

/* LOGOUT 버튼 스타일 */
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.logout-btn:hover {
  color: #ff6b6b;
}

.logout-btn::after {
  background-color: #ff6b6b;
}

.router-link-active {
  opacity: 1;
}

.router-link-active::after {
  width: 100%;
  background-color: var(--logo-blue, #48b0e4);
  height: 2px;
}

.user-welcome {
  font-family: 'Noto Sans KR', sans-serif;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.9;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

@media (max-width: 900px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .nav-center {
    position: relative;
    left: 0;
    transform: none;
    margin-bottom: 1rem;
    order: -1;
  }
  
  .nav-group {
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .logo-text {
    font-size: 1.8rem;
  }
}

@media (max-width: 600px) {
  .navbar {
    padding: 2rem 0;
  }
  
  .nav-group {
    gap: 1rem;
  }
  
  .nav-item {
    font-size: 0.9rem;
  }
  
  .logo-text {
    font-size: 1.6rem;
  }
}
</style>