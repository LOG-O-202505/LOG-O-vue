<template>
  <div class="redirect-handler">
    <div class="gradient-background">
      <canvas ref="waveCanvas" class="wave-canvas"></canvas>
    </div>
    <div class="content-container">
      <div v-if="error" class="message-box error-message">
        <div class="message-icon error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h2 class="message-title">로그인 오류</h2>
        <p class="message-text">{{ error }}</p>
        <p class="message-text small">문제가 지속되면 관리자에게 문의해주세요.</p>
        <button @click="navigateToHome" class="nav-button error-button">
          홈으로 이동
        </button>
      </div>
      <div v-else class="airplane-view-container">
        <div class="windows-row">
          <div 
            v-for="(image, index) in windowImages" 
            :key="`window-${index}`" 
            :ref="el => { if (el) windowRefs[index] = el }"
            class="window"
            :class="{ 
              'flipped': isNewUser && showInputForms && flippedCards[index]
            }"
          >
            <div class="window-content">
              <!-- 기존 이미지 면 -->
              <div 
                :ref="el => { if (el) imageRefs[index] = el }"
                class="image-container front-face"
              >
                <img 
                  :src="image.src" 
                  :alt="image.alt" 
                  class="window-image"
                />
                <!-- 뒤집어진 상태에서 이미지 위에 오버레이 -->
                <div 
                  v-if="isNewUser && showInputForms && flippedCards[index]"
                  class="image-overlay"
                ></div>
              </div>
              
              <!-- 입력 폼 면 -->
              <div class="input-form-container back-face">
                <!-- 생년월일 입력 (첫 번째 카드) -->
                <div v-if="index === 0" class="input-form">
                  <div class="form-header">
                    <h3 class="form-title">생년월일</h3>
                  </div>
                  <div class="form-body">
                    <input 
                      v-model="formData.birthday"
                      type="date"
                      class="form-input"
                      placeholder="YYYY-MM-DD"
                      :max="maxDate"
                    />
                    <button 
                      @click="nextStep"
                      :disabled="!formData.birthday"
                      class="form-next-button"
                    >
                      다음
                    </button>
                  </div>
                </div>
                
                <!-- 닉네임 입력 (두 번째 카드) -->
                <div v-if="index === 1" class="input-form">
                  <div class="form-header">
                    <h3 class="form-title">닉네임</h3>
                  </div>
                  <div class="form-body">
                    <input 
                      v-model="formData.nickname"
                      type="text"
                      class="form-input"
                      placeholder="닉네임을 입력하세요"
                      maxlength="20"
                    />
                    <button 
                      @click="nextStep"
                      :disabled="!formData.nickname || formData.nickname.trim().length < 2"
                      class="form-next-button"
                    >
                      다음
                    </button>
                  </div>
                </div>
                
                <!-- 성별 선택 (세 번째 카드) -->
                <div v-if="index === 2" class="input-form">
                  <div class="form-header">
                    <h3 class="form-title">성별</h3>
                  </div>
                  <div class="form-body">
                    <div class="gender-buttons">
                      <button 
                        @click="selectGender('M')"
                        :class="['gender-button', { 'selected': formData.gender === 'M' }]"
                      >
                        남성
                      </button>
                      <button 
                        @click="selectGender('F')"
                        :class="['gender-button', { 'selected': formData.gender === 'F' }]"
                      >
                        여성
                      </button>
                    </div>
                    <button 
                      @click="completeForm"
                      :disabled="!formData.gender"
                      class="form-next-button"
                    >
                      완료
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="loading-info">
          <!-- 새 사용자 안내 메시지 (입력 완료 전에만 표시) -->
          <div v-if="isNewUser && isReadyToNavigate && !showInputForms && !formCompleted" class="new-user-message">
            <p class="new-user-title">LOG:O 서비스 사용을 위해서 회원님의 정보를 입력해주세요</p>
          </div>
          
          <!-- 입력 완료 후 메시지 -->
          <div v-if="isNewUser && formCompleted" class="completion-message">
            <p class="completion-title">LOG:O와의 여정을 떠나보세요</p>
          </div>
          
          <div v-if="!isReadyToNavigate" class="loading-elements">
            <p class="loading-text-message">LOG:O와의 여정을 준비중</p>
            <div class="loading-bar-container">
              <div class="loading-bar" :style="{ width: loadingProgress + '%' }"></div>
            </div>
          </div>
          
          <button 
            v-if="isReadyToNavigate && (!isNewUser || (isNewUser && formCompleted))"
            @click="handleStartClick" 
            class="continue-button button-visible"
          >
            계속하기
          </button>
          
          <button 
            v-if="isReadyToNavigate && isNewUser && !showInputForms && !formCompleted"
            @click="startInputProcess" 
            class="continue-button button-visible new-user-button"
          >
            추가 정보 입력하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import images directly
import dreamRoomImg from '../assets/img/dream-room.jpg';
import futuristicInteriorImg from '../assets/img/futuristic-interior.jpg';
import greenGrottoImg from '../assets/img/green-grotto.jpg';

export default {
  name: 'OAuth2RedirectHandler',
  data() {
    return {
      error: null,
      loadingProgress: 0,
      remainingTime: 3000, // 3초
      loadingMessage: '로그인 정보를 확인하고 있습니다',
      loadingMessages: [
        '로그인 정보를 확인하고 있습니다',
        '세션을 설정하고 있습니다',
        '사용자 정보를 불러오는 중입니다',
        '마지막 단계를 처리하고 있습니다'
      ],
      messageIndex: 0,
      loadingInterval: null,
      progressInterval: null,
      animationId: null, // For wave animation
      waveCanvasCtx: null,
      
      // For airplane window animations
      windowRefs: [],
      imageRefs: [],
      windowAnimationRunning: true,
      windowAnimationFrame: null,
      
      isReadyToNavigate: false, // Controls the button

      windowImages: [
        { src: dreamRoomImg, alt: "Surreal room with grass walls opening to a lake view" },
        { src: greenGrottoImg, alt: "Dreamlike bedroom with waterfall and green grotto" },
        { src: futuristicInteriorImg, alt: "Futuristic interior with curved architecture and night sky view" },
      ],
      // Animation timing variables from AirplaneWindows.vue
      animationDuration: 700, 
      delayBetweenWindows: 500,
      pauseBetweenCycles: 800,

      isNewUser: false,
      showInputForms: false,
      flippedCards: [false, false, false],
      formData: {
        birthday: '',
        nickname: '',
        gender: '',
      },
      maxDate: '',
      formCompleted: false,
    };
  },
  created() {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');

    if (oauthError) {
      this.error = `OAuth 인증 처리 중 오류가 발생했습니다: ${oauthError}`;
      console.error('OAuth2 Error:', oauthError);
    } else {
      console.log('OAuth2 인증 성공! 3초 후 이동 가능합니다.');
      this.checkNewUser();
      this.initMaxDate();
      this.startLoading();
    }
  },
  mounted() {
    if (!this.error) {
      this.initWaveAnimation();
      this.setupWindowAnimations(); // Initialize airplane window animations
    }
  },
  methods: {
    startLoading() {
      const startTime = Date.now();
      
      this.progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        this.remainingTime = Math.max(0, 3000 - elapsed);
        this.loadingProgress = Math.min(100, (elapsed / 3000) * 100);
        
        if (elapsed >= 3000) {
          this.isReadyToNavigate = true; // Enable the button
          clearInterval(this.progressInterval); // Stop progress once 100%
        }
      }, 50);
    },

    handleStartClick() {
      if (this.isReadyToNavigate) {
        this.navigateToPreviousPage();
      }
    },

    navigateToPreviousPage() {
      const returnTo = localStorage.getItem('returnToPath');
      console.log(`이동: ${returnTo || '/'}`);
      localStorage.removeItem('returnToPath'); // Clean up
      window.location.href = returnTo || '/';
    },
    
    navigateToHome() {
      window.location.href = '/';
    },

    // Wave Animation
    resizeCanvasForWave() {
        const canvas = this.$refs.waveCanvas;
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    },
    initWaveAnimation() {
      const canvas = this.$refs.waveCanvas;
      if (!canvas) return;
      this.waveCanvasCtx = canvas.getContext('2d');
      if (!this.waveCanvasCtx) return;
      
      this.resizeCanvasForWave();
      window.addEventListener('resize', this.resizeCanvasForWave);
      this.drawWave();
    },
    drawWave() {
      if (!this.waveCanvasCtx || !this.$refs.waveCanvas) return;
      const canvas = this.$refs.waveCanvas;
      const ctx = this.waveCanvasCtx;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // The gradient background is CSS, so canvas clear is enough.

      const time = Date.now() * 0.001;
      const waves = 10;
      // Lighter beige/white tones for the waves
      const waveColors = [
        'rgba(255, 252, 245, ', // Almost white
        'rgba(253, 250, 243, ',
        'rgba(250, 247, 240, ',
        'rgba(248, 244, 236, ',
        'rgba(245, 241, 233, ',
        'rgba(242, 238, 229, ',
        'rgba(240, 235, 226, ',
        'rgba(237, 232, 222, ',
        'rgba(235, 230, 219, ',
        'rgba(232, 227, 215, '
      ];

      for (let i = 0; i < waves; i++) {
        ctx.beginPath();
        const alpha = 0.06 + i * 0.01; // Slightly more transparent
        ctx.fillStyle = waveColors[i % waveColors.length] + alpha + ')';
        for (let x = 0; x < canvas.width; x += 5) {
          const y = Math.sin(x * 0.01 + time + i * 0.5) * 20 +
                    Math.sin(x * 0.02 + time + i * 0.3) * 15 +
                    canvas.height / 2 - i * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();
      }
      this.animationId = requestAnimationFrame(this.drawWave);
    },

    // Airplane Window Animations (from AirplaneWindows.vue)
    setupWindowAnimations() {
        this.$nextTick(() => {
            // Panning animation for images
            this.imageRefs.forEach(imageWrapper => {
                if (imageWrapper) {
                imageWrapper.animate(
                    [
                    { transform: 'translateX(0%)' },
                    { transform: 'translateX(-15%)' },
                    { transform: 'translateX(0%)' }
                    ],
                    { duration: 18000, iterations: Infinity, easing: 'linear' }
                );
                }
            });
            // Start the window scaling animations
            this.startWindowAnimations();
        });
    },
    
    startWindowAnimations() {
      this.windowAnimationFrame = requestAnimationFrame(this.animateWindows);
    },
    
    async animateWindows() {
        const windows = this.windowRefs;
        const animateSingleWindow = async (windowEl, delay = 0) => {
            if (!windowEl || !this.windowAnimationRunning) return;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            windowEl.style.transition = `transform ${this.animationDuration}ms ease-in-out`;
            windowEl.style.transform = 'scale(0.98)';
            await new Promise(resolve => setTimeout(resolve, this.animationDuration));
            
            windowEl.style.transform = 'scale(1.02)';
            await new Promise(resolve => setTimeout(resolve, this.animationDuration));
            
            windowEl.style.transform = 'scale(1)';
            await new Promise(resolve => setTimeout(resolve, this.animationDuration));
        };
        
        while (this.windowAnimationRunning) {
            for (let i = 0; i < windows.length; i++) {
                if (!windows[i]) continue; // Ensure ref is available
                animateSingleWindow(windows[i]);
                if (i < windows.length - 1 && windows[i+1]) {
                    setTimeout(() => {
                        if (this.windowAnimationRunning && windows[i + 1]) {
                            windows[i + 1].style.transition = `transform ${this.animationDuration}ms ease-in-out`;
                            windows[i + 1].style.transform = 'scale(0.99)';
                        }
                    }, this.delayBetweenWindows);
                }
                await new Promise(resolve => setTimeout(resolve, this.animationDuration * 3));
            }
            await new Promise(resolve => setTimeout(resolve, this.pauseBetweenCycles));
        }
    },

    startInputProcess() {
      this.showInputForms = true;
      setTimeout(() => {
        this.flippedCards = [true, false, false];
      }, 100);
    },

    nextStep() {
      if (this.flippedCards[0]) {
        if (this.formData.birthday) {
          this.flippedCards = [false, true, false];
        }
      } else if (this.flippedCards[1]) {
        if (this.formData.nickname && this.formData.nickname.trim().length >= 2) {
          this.flippedCards = [false, false, true];
        }
      }
    },

    async completeForm() {
      try {
        const userInfo = {
          nickname: this.formData.nickname.trim(),
          birthday: this.formData.birthday,
          gender: this.formData.gender,
        };
        
        console.log('사용자 정보 전송 중:', userInfo);
        
        // 쿠키에서 access_token 가져오기
        const accessToken = this.getAccessTokenFromCookie();
        
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // access_token이 있으면 Authorization 헤더 추가
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        // API 호출
        const response = await fetch('http://localhost:8080/api/oauth2/complete', {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: JSON.stringify(userInfo)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('API 응답 성공:', result);
        } else {
          const errorText = await response.text();
          console.error('API 응답 실패:', response.status, errorText);
        }
        
        // 쿠키 제거 및 상태 업데이트
        document.cookie = 'is_new_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        this.formCompleted = true;
        this.showInputForms = false;
        this.flippedCards = [false, false, false];
        
        console.log('사용자 정보 입력 완료');
      } catch (error) {
        console.error('API 호출 오류:', error);
        // 에러가 발생해도 폼은 완료된 것으로 처리
        this.formCompleted = true;
        this.showInputForms = false;
        this.flippedCards = [false, false, false];
      }
    },

    getAccessTokenFromCookie() {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith('access_token=')
      );
      
      if (accessTokenCookie) {
        return accessTokenCookie.split('=')[1];
      }
      
      return null;
    },

    checkNewUser() {
      const cookies = document.cookie.split(';');
      const isNewUserCookie = cookies.find(cookie => 
        cookie.trim().startsWith('is_new_user=')
      );
      
      if (isNewUserCookie) {
        this.isNewUser = true;
        console.log('신규 사용자 감지: 추가 정보 입력이 필요합니다.');
      }
    },

    initMaxDate() {
      const today = new Date();
      this.maxDate = today.toISOString().split('T')[0];
    },

    selectGender(gender) {
      this.formData.gender = gender;
    },
  },
  beforeUnmount() {
    clearInterval(this.progressInterval);
    
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeCanvasForWave);

    this.windowAnimationRunning = false;
    if (this.windowAnimationFrame) cancelAnimationFrame(this.windowAnimationFrame);
  }
};
</script>

<style scoped>
/* General Styles */
.redirect-handler {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
  position: relative;
  overflow: hidden;
  padding-top: 5vh; /* Push content down a bit */
}

.gradient-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, 
    #ffffff, #fcfaf4, #f9f6ee, 
    #f5f2e9, #f1ede3, #ede9de);
  background-size: 400% 400%;
  animation: gradientShift 18s ease infinite;
  z-index: 0; /* Behind wave canvas */
}

@keyframes gradientShift {
  0% { background-position: 0% 0%; }
  25% { background-position: 50% 100%; }
  50% { background-position: 100% 100%; }
  75% { background-position: 100% 0%; }
  100% { background-position: 0% 0%; }
}

.wave-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; /* Above gradient, behind content */
  opacity: 0.8; /* Slightly transparent waves */
}

.content-container {
  z-index: 2; /* Above wave canvas */
  width: 100%;
  max-width: 1100px; /* Wider to accommodate larger windows */
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Error Message Box Styles (from original OAuth2RedirectHandler) */
.message-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
  max-width: 500px; /* Keep error box a reasonable size */
}
.message-icon { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.success-icon { background-color: #e8f5e9; color: #2e7d32; } /* Kept for potential future use */
.error-icon { background-color: #ffebee; color: #c62828; }
.message-title { font-size: 1.6rem; margin: 10px 0; font-weight: 600; color: #333333; }
.message-text { font-size: 1rem; margin: 8px 0; color: #555555; }
.message-text.small { font-size: 0.9rem; color: #777777; margin: 15px 0; }
.nav-button { background: linear-gradient(to right, #4fc3f7, #2196f3); color: white; border: none; padding: 12px 30px; margin-top: 20px; border-radius: 30px; cursor: pointer; font-size: 1rem; font-weight: 500; transition: all 0.3s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.nav-button:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
.error-button { background: linear-gradient(to right, #ff7043, #e53935); }


/* Airplane Window Styles (adapted from AirplaneWindows.vue) */
.airplane-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.windows-row {
  display: flex;
  justify-content: center;
  gap: 100px; /* Wide spacing between windows */
  margin-bottom: 60px; /* Space before loading info */
}

.window {
  position: relative;
  width: 320px; /* Larger window size */
  height: 420px; /* Larger window size */
  border-radius: 160px; /* Rounded corners for pill shape */
  overflow: hidden;
  transform-origin: center center;
  will-change: transform;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.window-content {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.front-face, .back-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  transition: opacity 0.8s ease, visibility 0.8s ease;
}

.front-face {
  z-index: 2;
  opacity: 1;
  visibility: visible;
}

.back-face {
  z-index: 3;
  opacity: 0;
  visibility: hidden;
}

/* When flipped, show back face and hide front face */
.window.flipped .front-face {
  opacity: 0;
  visibility: hidden;
}

.window.flipped .back-face {
  opacity: 1 !important;
  visibility: visible !important;
  display: flex !important;
}

.image-container {
  position: absolute;
  width: 115%; /* Panning effect */
  height: 100%;
  left: 0;
  top: 0;
  will-change: transform;
}

.window-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Image overlay for flipped state */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
  pointer-events: none;
}

/* Input form container styles */
.input-form-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 246, 242, 0.8)) !important;
  backdrop-filter: blur(15px) !important;
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-form {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 246, 242, 0.8)) !important;
  border: none !important;
  border-radius: 160px !important;
  padding: 40px 30px !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: inset 0 0 30px rgba(165, 149, 132, 0.1) !important;
}

.form-header {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.form-title {
  color: #8B7355 !important;
  font-size: 1.4rem !important;
  margin: 0 !important;
  font-weight: 500 !important;
  text-align: center !important;
  letter-spacing: 0.5px !important;
}

.form-body {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 25px;
  width: 100%;
}

.form-input {
  width: 100%;
  max-width: 220px;
  padding: 15px 20px;
  border: 2px solid rgba(165, 149, 132, 0.3);
  border-radius: 25px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  text-align: center;
  color: #5D4E37;
  font-weight: 400;
}

.form-input:focus {
  outline: none;
  border-color: #a59584;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(165, 149, 132, 0.15);
  transform: scale(1.02);
}

.form-input::placeholder {
  color: #A0956B;
  font-weight: 300;
}

.form-next-button, .form-skip-button {
  padding: 12px 25px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.form-next-button {
  background: linear-gradient(135deg, #a59584, #94836f);
  color: white;
  min-width: 120px;
  box-shadow: 0 4px 15px rgba(165, 149, 132, 0.3);
}

.form-next-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #94836f, #85756a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(165, 149, 132, 0.4);
}

.form-next-button:disabled {
  background: linear-gradient(135deg, #ccc, #bbb);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-skip-button {
  background: rgba(255, 255, 255, 0.8);
  color: #8B7355;
  border: 2px solid rgba(165, 149, 132, 0.4);
  min-width: 100px;
}

.form-skip-button:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #a59584;
  transform: translateY(-1px);
}

.form-button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  width: 100%;
}

/* Gender buttons styles */
.gender-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  width: 100%;
  margin-bottom: 10px;
}

.gender-button {
  padding: 12px 25px;
  border: 2px solid rgba(165, 149, 132, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.8);
  color: #8B7355;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.gender-button:hover {
  border-color: #a59584;
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}

.gender-button.selected {
  background: linear-gradient(135deg, #a59584, #94836f);
  color: white;
  border-color: #a59584;
  box-shadow: 0 4px 15px rgba(165, 149, 132, 0.3);
}

.gender-button.selected:hover {
  background: linear-gradient(135deg, #94836f, #85756a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(165, 149, 132, 0.4);
}

/* New user message styles */
.new-user-message {
  margin-bottom: 20px;
  text-align: center;
}

.new-user-title {
  font-size: 1.4rem;
  font-weight: 400;
  color: #333;
  margin: 0;
  line-height: 1.5;
}

/* Completion message styles */
.completion-message {
  margin-bottom: 20px;
  text-align: center;
}

.completion-title {
  font-size: 1.6rem;
  font-weight: 500;
  color: #8B7355;
  margin: 0;
  line-height: 1.5;
  letter-spacing: 0.5px;
}

.new-user-button {
  background: linear-gradient(135deg, #a59584, #94836f);
  color: white;
}

.new-user-button:hover {
  background: linear-gradient(135deg, #94836f, #85756a);
}

/* Loading Info Styles */
.loading-info {
  text-align: center;
  color: #444; /* Darker text for better readability */
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 120px; /* Keep consistent height when content changes */
}

.loading-elements {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.loading-text-message {
  font-size: 32px; /* Large text */
  font-weight: 300;
  letter-spacing: 0.025em;
  margin-bottom: 20px;
}

.loading-bar-container {
  width: 100%;
  max-width: 300px;
  height: 8px;
  background: rgba(0, 0, 0, 0.1); /* Semi-transparent dark */
  border-radius: 4px;
  margin: 10px auto;
  overflow: hidden;
}

.loading-bar {
  height: 100%;
  background: #a59584; /* Beige-compatible color */
  border-radius: 4px;
  transition: width 0.2s ease-in-out;
}

.continue-button {
  background: #a59584; /* Beige theme */
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
  margin-top: 10px;
  opacity: 0;
  transform: translateY(10px);
}

.button-visible {
  opacity: 1;
  transform: translateY(0);
  animation: appear 0.5s ease forwards;
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background: #94836f; /* Slightly darker on hover */
}

/* Responsive adjustments */
@media (max-width: 1100px) {
  .windows-row {
    gap: 60px;
  }
  .window {
    width: 280px;
    height: 380px;
    border-radius: 140px;
  }
  .loading-text-message {
    font-size: 28px;
  }
  .new-user-title {
    font-size: 1.2rem;
  }
  .form-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 900px) {
  .windows-row {
    gap: 40px;
  }
  .window {
    width: 240px;
    height: 320px;
    border-radius: 120px;
  }
  .loading-text-message {
    font-size: 24px;
  }
  .new-user-title {
    font-size: 1.1rem;
  }
  .form-title {
    font-size: 1.2rem;
  }
  .form-input {
    max-width: 200px;
  }
  .form-header {
    padding-bottom: 15px;
    margin-bottom: 15px;
  }
}

@media (max-width: 768px) {
  .redirect-handler {
    padding-top: 0;
  }
  .windows-row {
    flex-direction: column;
    gap: 30px;
    margin-bottom: 40px;
  }
  .window {
    width: 260px;
    height: 340px;
    border-radius: 130px;
  }
  .loading-text-message {
    font-size: 22px;
  }
  .continue-button {
    padding: 12px 30px;
    font-size: 1rem;
  }
  .new-user-title {
    font-size: 1rem;
    padding: 0 20px;
  }
  .form-title {
    font-size: 1.1rem;
  }
  .form-input {
    max-width: 180px;
    font-size: 0.9rem;
  }
  .form-next-button, .form-skip-button {
    font-size: 0.8rem;
    padding: 8px 16px;
  }
  .gender-button {
    font-size: 0.9rem;
    padding: 10px 20px;
    min-width: 70px;
  }
  .gender-buttons {
    gap: 12px;
  }
  .form-header {
    padding-bottom: 12px;
    margin-bottom: 12px;
  }
}
</style> 