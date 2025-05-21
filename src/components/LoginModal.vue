<template>
  <div class="login-modal-container">
    <!-- 로그인 버튼 - 네비게이션 바에 맞게 스타일 조정 -->
    <button @click="openModal" class="nav-login-button">
      LOGIN
    </button>

    <!-- 성공 토스트 메시지 -->
    <transition name="toast">
      <div
        v-if="showSuccessToast"
        class="success-toast"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>로그인에 성공했습니다!</span>
      </div>
    </transition>

    <!-- 모달 배경 -->
    <div v-if="isOpen" class="modal-overlay" @click="closeModal"></div>

    <!-- 모달 -->
    <div v-if="isOpen" class="modal-container">
      <div class="modal-content">
        <!-- 왼쪽 로그인 폼 섹션 -->
        <div class="login-section">
          <button @click="closeModal" class="close-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span class="sr-only">닫기</span>
          </button>

          <div class="login-form-container">
            <div class="text-center" :class="{ 'header-margin': true, 'header-margin-large': showLogoLogin }">
              <h2 class="header-text">당신만의 여행을 기록해보세요 : )</h2>
            </div>

            <div 
              ref="socialButtonsRef"
              class="social-buttons"
              :style="{
                height: socialButtonsHeight,
                opacity: showLogoLogin ? 0 : 1,
                marginBottom: showLogoLogin ? 0 : undefined,
                overflow: 'hidden',
                transition: 'all 0.5s ease-in-out'
              }"
            >
              <!-- 구글 로그인 버튼 -->
              <button class="social-button google-button" @click="handleGoogleLogin">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                GOOGLE로 계속하기
              </button>

              <!-- 네이버 로그인 버튼 -->
              <button class="social-button naver-button" @click="handleNaverLogin">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13.5 3H6.5C4.567 3 3 4.567 3 6.5V13.5C3 15.433 4.567 17 6.5 17H13.5C15.433 17 17 15.433 17 13.5V6.5C17 4.567 15.433 3 13.5 3Z"
                    fill="white"
                  />
                  <path d="M11.5 10.8L8.5 6.5H6.5V13.5H8.5V9.2L11.5 13.5H13.5V6.5H11.5V10.8Z" fill="#03C75A" />
                </svg>
                NAVER로 계속하기
              </button>

              <!-- 카카오 로그인 버튼 -->
              <button class="social-button kakao-button" @click="handleKakaoLogin">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 3C5.58172 3 2 5.69471 2 9.0625C2 11.1869 3.42328 13.0461 5.5 14.0938L4.375 17.5L8.15625 14.9062C8.75 14.9688 9.375 15 10 15C14.4183 15 18 12.3053 18 9.0625C18 5.69471 14.4183 3 10 3Z"
                    fill="#3A1D1D"
                  />
                </svg>
                KAKAO로 계속하기
              </button>

              <!-- LOG:O 로그인 버튼 -->
              <button class="social-button logo-button" @click="handleLogoLogin">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="white" />
                  <path
                    d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM8 6H12V8H8V6ZM13 14H7V12H13V14ZM13 11H7V9H13V11Z"
                    fill="currentColor"
                  />
                </svg>
                LOG:O로 계속하기
              </button>
            </div>

            <div 
              ref="dividerRef"
              class="divider"
              :style="{
                opacity: showLogoLogin ? 0 : 1,
                height: showLogoLogin ? 0 : 'auto',
                overflow: 'hidden',
                marginBottom: showLogoLogin ? 0 : undefined,
                transition: 'all 0.5s ease-in-out'
              }"
            >
              <span>간편하게 가입해보세요 : )</span>
            </div>

            <form @submit.prevent="handleFormSubmit" class="login-form" :style="{
              transform: showLogoLogin ? 'translateY(-60px)' : 'translateY(0)',
              transition: 'transform 0.5s ease-in-out',
            }">
              <div class="form-group">
                <label for="email" class="form-label">이메일</label>
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  class="form-input"
                  :class="{ 'error-input': loginError }"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div v-if="showLogoLogin" class="form-group password-field">
                <label for="password" class="form-label">비밀번호</label>
                <input
                  id="password"
                  type="password"
                  v-model="password"
                  class="form-input"
                  :class="{ 'error-input': loginError }"
                  required
                />
              </div>

              <div v-if="loginError" class="error-message">
                이메일과 비밀번호를 확인 후 다시 시도해주세요.
              </div>

              <button type="submit" :class="['submit-button', { 'gradient-button': showLogoLogin }]">
                {{ showLogoLogin ? "LOGIN" : "이메일로 시작하기" }}
              </button>

              <button
                v-if="showLogoLogin"
                type="button"
                class="back-button"
                @click="handleBackToSocial"
              >
                이전으로
              </button>
            </form>
          </div>
        </div>

        <!-- 오른쪽 이미지 섹션 -->
        <div class="image-section">
          <!-- 배경 이미지 -->
          <div class="gradient-background" :style="{ opacity: imageOpacity }">
            <canvas ref="waveCanvas" class="wave-canvas"></canvas>
          </div>

          <!-- 회원가입 폼 -->
          <div class="signup-form-container" :class="{ 'show-signup': showSignup }">
            <div class="signup-form">
              <h3 class="signup-header">회원 가입</h3>

              <div class="form-group">
                <label for="signup-password" class="form-label">비밀번호</label>
                <input
                  id="signup-password"
                  type="password"
                  v-model="signupPassword"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="confirm-password" class="form-label">비밀번호 확인</label>
                <input
                  id="confirm-password"
                  type="password"
                  v-model="confirmPassword"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="nickname" class="form-label">닉네임</label>
                <input
                  id="nickname"
                  type="text"
                  v-model="nickname"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="birthdate" class="form-label">생일</label>
                <input
                  id="birthdate"
                  type="date"
                  v-model="birthdate"
                  class="form-input"
                  required
                />
              </div>

              <button class="signup-button" @click="handleSignup">회원 가입</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoginModal',
  data() {
    return {
      isOpen: false,
      email: '',
      password: '',
      signupPassword: '',
      confirmPassword: '',
      nickname: '',
      birthdate: '',
      showSignup: false,
      imageOpacity: 1,
      showLogoLogin: false,
      loginError: false,
      showSuccessToast: false,
      socialButtonsHeight: 'auto',
      backendUrl: 'http://localhost:8080',
      animationId: null,
    }
  },
  
  mounted() {
    const token = this.getCookie('accessToken');
    if (token) {
       // If you have a local validation or a /me endpoint that relies on the cookie
       // this.checkAuth(token); // This method would now only be for local state if needed
    } else {
      // No token cookie found, proceed as unauthenticated
    }
  },
  
  methods: {
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },

    // 소셜 로그인 메소드
    handleGoogleLogin() {
      console.log('Google 로그인 시도...');
      const redirectUri = `${window.location.origin}/oauth2/redirect`;
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      window.location.href = `${this.backendUrl}/oauth2/authorization/google?redirect_uri=${encodedRedirectUri}`;
    },
    
    handleNaverLogin() {
      console.log('Naver 로그인 시도...');
      const redirectUri = `${window.location.origin}/oauth2/redirect`;
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      window.location.href = `${this.backendUrl}/oauth2/authorization/naver?redirect_uri=${encodedRedirectUri}`;
    },
    
    handleKakaoLogin() {
      console.log('Kakao 로그인 시도...');
      const redirectUri = `${window.location.origin}/oauth2/redirect`;
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      window.location.href = `${this.backendUrl}/oauth2/authorization/kakao?redirect_uri=${encodedRedirectUri}`;
    },
    
    openModal() {
      this.isOpen = true;
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (currentPath !== '/' && !currentPath.startsWith('/login') && !currentPath.startsWith('/oauth2/redirect')) {
        localStorage.setItem('returnToPath', currentPath);
        console.log('Set returnToPath:', currentPath);
      }
      
      this.$nextTick(() => {
        this.initWaveAnimation();
      });
    },
    
    closeModal() {
      this.isOpen = false
      this.resetForm()
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    },
    
    resetForm() {
      this.email = ''
      this.password = ''
      this.signupPassword = ''
      this.confirmPassword = ''
      this.nickname = ''
      this.birthdate = ''
      this.showSignup = false
      this.imageOpacity = 1
      this.showLogoLogin = false
      this.loginError = false
      this.socialButtonsHeight = 'auto'
    },
    
    handleFormSubmit() {
      if (this.showLogoLogin) {
        this.handleLogin()
      } else {
        this.handleGetStarted()
      }
    },
    
    handleGetStarted() {
      if (this.email) {
        this.showSignup = true
        this.fadeOutBackground()
      }
    },
    
    handleLogin() {
      fetch(`${this.backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.email,
          password: this.password
        }),
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
            return response.json().then(errData => { 
                throw { status: response.status, data: errData }; 
            });
        }
        return response.json();
      })
      .then(data => {
        console.log('일반 로그인 성공 응답:', data);
        this.loginError = false;
        this.isOpen = false;
        this.showSuccessToast = true;
        
        this.resetForm();
        
        setTimeout(() => {
          this.showSuccessToast = false;
          const returnTo = localStorage.getItem('returnToPath');
          window.location.href = returnTo || '/';
        }, 3000);
        
      })
      .catch(error => {
        this.loginError = true;
        console.error('일반 로그인 실패:', error.status, error.data ? error.data.message : error.message);
      });
    },
    
    handleSignup() {
      if (this.signupPassword !== this.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      fetch(`${this.backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.email,
          password: this.signupPassword,
          nickname: this.nickname,
          birthday: this.birthdate
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          this.isOpen = false
          this.showSuccessToast = true
          
          this.resetForm()
          
          setTimeout(() => {
            this.showSuccessToast = false
          }, 3000)
        } else {
          alert(data.message || '회원가입에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류가 발생했습니다.');
      });
    },
    
    fadeOutBackground() {
      const fadeOut = setInterval(() => {
        this.imageOpacity = Math.max(this.imageOpacity - 0.05, 0.4)
        if (this.imageOpacity <= 0.4) clearInterval(fadeOut)
      }, 30)
    },
    
    handleLogoLogin() {
      this.showLogoLogin = true
      this.loginError = false
      
      this.$nextTick(() => {
        if (this.$refs.socialButtonsRef) {
          const height = this.$refs.socialButtonsRef.scrollHeight
          this.socialButtonsHeight = `${height}px`
          
          setTimeout(() => {
            this.socialButtonsHeight = '0px'
          }, 50)
        }
      })
    },
    
    handleBackToSocial() {
      this.showLogoLogin = false
      this.password = ''
      this.loginError = false
      this.socialButtonsHeight = 'auto'
    },
    
    initWaveAnimation() {
      const canvas = this.$refs.waveCanvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
      }
      
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      const drawWave = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(255, 255, 255, 0)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const time = Date.now() * 0.001
        const waves = 10
        
        const waveColors = [
          'rgba(165, 214, 167, ',
          'rgba(197, 225, 165, ',
          'rgba(230, 238, 156, ',
          'rgba(255, 245, 157, ',
          'rgba(255, 224, 130, ',
          'rgba(255, 204, 128, ',
          'rgba(255, 171, 145, ',
          'rgba(188, 170, 164, ',
          'rgba(238, 238, 238, ',
          'rgba(179, 229, 252, '
        ]

        for (let i = 0; i < waves; i++) {
          ctx.beginPath()
          const alpha = 0.05 + i * 0.01
          ctx.fillStyle = waveColors[i % waveColors.length] + alpha + ')'

          for (let x = 0; x < canvas.width; x += 5) {
            const y =
              Math.sin(x * 0.01 + time + i * 0.5) * 20 +
              Math.sin(x * 0.02 + time + i * 0.3) * 15 +
              canvas.height / 2 -
              i * 15

            if (x === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }

          ctx.lineTo(canvas.width, canvas.height)
          ctx.lineTo(0, canvas.height)
          ctx.closePath()
          ctx.fill()
        }

        this.animationId = requestAnimationFrame(drawWave)
      }

      drawWave()
    },
  },
  
  beforeUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.removeEventListener('resize', this.resizeCanvas)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.login-modal-container {
  font-family: 'Noto Sans KR', sans-serif;
}

.nav-login-button {
  font-family: 'Playfair Display', serif;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  padding: 0;
  opacity: 0.9;
}

.nav-login-button:hover {
  opacity: 1;
}

.nav-login-button::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: white;
  transition: width 0.3s ease;
}

.nav-login-button:hover::after {
  width: 100%;
}

.success-toast {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background-color: #e8f5e9;
  border: 1px solid #66bb6a;
  color: #2e7d32;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

.modal-container {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  position: relative;
  padding: 0;
  overflow: hidden;
  max-width: 80rem;
  width: 95vw;
  height: 80vh;
  max-height: 50rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 768px) {
  .modal-content {
    grid-template-columns: 1fr;
    height: auto;
    max-height: 90vh;
  }
  
  .image-section {
    display: none;
  }
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  box-shadow: none;
}

.close-button:hover {
  color: #4b5563;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.login-section {
  padding: 2.5rem;
  position: relative;
  display: flex;
  align-items: center;
  overflow-y: auto;
}

.login-form-container {
  max-width: 28rem;
  margin: 0 auto;
  width: 100%;
}

.text-center {
  text-align: center;
}

.header-margin {
  margin-bottom: 3rem;
}

.header-margin-large {
  margin-bottom: 5rem;
}

.header-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.social-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.google-button {
  background-color: white;
  color: #4b5563;
}

.google-button:hover {
  background-color: #f9fafb;
}

.naver-button {
  background-color: #03C75A;
  color: white;
  border-color: #03C75A;
}

.naver-button:hover {
  background-color: #02b350;
}

.kakao-button {
  background-color: #FEE500;
  color: #3A1D1D;
  border-color: #FEE500;
}

.kakao-button:hover {
  background-color: #FFDC3C;
}
.logo-button {
  background: linear-gradient(
    to right,
    #ffcdd2,
    #f8bbd0,
    #e1bee7,
    #d1c4e9,
    #c5cae9,
    #bbdefb,
    #b3e5fc,
    #b2dfdb
  );
  background-size: 200% 100%;
  animation: horizontalGradient 8s ease infinite;
  color: white;
  border: none;
}

@keyframes horizontalGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.divider {
  position: relative;
  margin: 1.5rem 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  border-top: 1px solid #e5e7eb;
}

.divider span {
  position: relative;
  padding: 0 0.5rem;
  background-color: white;
  color: #6b7280;
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.password-field {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.5rem 0.75rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.error-input {
  border-color: #ef4444;
}

.error-input:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}

.submit-button {
  padding: 0.5rem 1rem;
  background-color: #111827;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #000000;
}

.gradient-button {
  background: linear-gradient(
    -45deg,
    #ffcdd2,
    #ef9a9a,
    #f48fb1,
    #ce93d8,
    #b39ddb,
    #9fa8da,
    #90caf9,
    #81d4fa
  );
  background-size: 400% 400%;
  animation: shimmerGradient 15s ease infinite;
  color: white;
  border: none;
}

@keyframes shimmerGradient {
  0% {
    background-position: 0% 0%;
  }
  25% {
    background-position: 100% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 0% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.back-button {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #6b7280;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.back-button:hover {
  color: #374151;
}

.image-section {
  position: relative;
}

.gradient-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    #a5d6a7,
    #c5e1a5,
    #e6ee9c,
    #fff59d,
    #ffe082,
    #ffcc80,
    #ffab91,
    #bcaaa4,
    #eeeeee,
    #b3e5fc
  );
  background-size: 400% 400%;
  animation: gradientShift 18s ease infinite;
  transition: opacity 0.5s;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 0%;
  }
  25% {
    background-position: 50% 100%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 100% 0%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.wave-canvas {
  width: 100%;
  height: 100%;
}

.signup-form-container {
  position: absolute;
  inset: 0;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s;
}

.signup-form-container.show-signup {
  opacity: 1;
  pointer-events: auto;
}

.signup-form {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 28rem;
  backdrop-filter: blur(4px);
}

.signup-header {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #111827;
}

.signup-button {
  width: 100%;
  padding: 0.5rem 1rem;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    #b2ebf2,
    #80deea,
    #4dd0e1,
    #b39ddb,
    #9fa8da,
    #90caf9,
    #81d4fa,
    #80cbc4
  );
  background-size: 300% 300%;
  animation: diagonalGradient 12s ease infinite;
}

@keyframes diagonalGradient {
  0% {
    background-position: 0% 0%;
  }
  25% {
    background-position: 50% 50%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 50% 50%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.hidden {
  display: none;
}
</style>