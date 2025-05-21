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
          >
            <div class="window-content">
              <div 
                :ref="el => { if (el) imageRefs[index] = el }"
                class="image-container"
              >
                <img 
                  :src="image.src" 
                  :alt="image.alt" 
                  class="window-image"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="loading-info">
          <div v-if="!isReadyToNavigate" class="loading-elements">
            <p class="loading-text-message">LOG:O와의 여정을 준비중</p>
            <div class="loading-bar-container">
              <div class="loading-bar" :style="{ width: loadingProgress + '%' }"></div>
            </div>
          </div>
          
          <button 
            v-if="isReadyToNavigate"
            @click="handleStartClick" 
            class="continue-button button-visible"
          >
            계속하기
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
            this.windowAnimationFrame = requestAnimationFrame(this.animateWindows);
        });
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
  overflow: hidden;
  border-radius: inherit;
}

.image-container {
  position: absolute;
  width: 115%; /* Panning effect */
  height: 100%;
  left: 0;
  top: 0;
  will-change: transform;
  backface-visibility: hidden;
}

.window-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}
</style> 