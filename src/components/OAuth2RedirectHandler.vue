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
      <div v-else class="message-box success-message">
        <div class="message-icon success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 class="message-title">로그인 처리 중</h2>
        <p class="message-text">{{ loadingMessage }}</p>
        <div class="loading-bar-container">
          <div class="loading-bar" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <p class="countdown">{{ Math.ceil(remainingTime / 1000) }}초 후 이동합니다...</p>
      </div>
    </div>
  </div>
</template>

<script>
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
      animationId: null,
      startTime: null
    };
  },
  created() {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');

    if (oauthError) {
      this.error = `OAuth 인증 처리 중 오류가 발생했습니다: ${oauthError}`;
      console.error('OAuth2 Error:', oauthError);
    } else {
      console.log('OAuth2 인증 성공! 1.5초 후 이동합니다.');
      this.startLoading();
    }
  },
  mounted() {
    if (!this.error) {
      this.initWaveAnimation();
    }
  },
  methods: {
    // 로딩 시작 (최소 1.5초)
    startLoading() {
      this.startTime = Date.now();
      
      // 로딩 메시지 교체 (각 메시지는 약 1초간 표시)
      this.loadingInterval = setInterval(() => {
        this.messageIndex = (this.messageIndex + 1) % this.loadingMessages.length;
        this.loadingMessage = this.loadingMessages[this.messageIndex];
      }, 800);

      // 로딩 바 업데이트 (매 50ms마다)
      this.progressInterval = setInterval(() => {
        const elapsed = Date.now() - this.startTime;
        this.remainingTime = Math.max(0, 3000 - elapsed);
        this.loadingProgress = Math.min(100, (elapsed / 3000) * 100);
        
        // 1.5초가 지나면 이동
        if (elapsed >= 1500) {
          this.navigateToPreviousPage();
          clearInterval(this.progressInterval);
          clearInterval(this.loadingInterval);
        }
      }, 50);
    },

    navigateToPreviousPage() {
      const returnTo = localStorage.getItem('returnToPath');
      console.log(`이동: ${returnTo || '/'}`);
      window.location.href = returnTo || '/';
    },
    
    navigateToHome() {
      window.location.href = '/';
    },

    // LoginModal.vue의 파도 효과 애니메이션
    initWaveAnimation() {
      const canvas = this.$refs.waveCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 캔버스 크기 설정
      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // 파도 애니메이션 그리기
      const drawWave = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.001;
        const waves = 10;
        
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
        ];

        for (let i = 0; i < waves; i++) {
          ctx.beginPath();
          const alpha = 0.05 + i * 0.01;
          ctx.fillStyle = waveColors[i % waveColors.length] + alpha + ')';

          for (let x = 0; x < canvas.width; x += 5) {
            const y =
              Math.sin(x * 0.01 + time + i * 0.5) * 20 +
              Math.sin(x * 0.02 + time + i * 0.3) * 15 +
              canvas.height / 2 -
              i * 15;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();
          ctx.fill();
        }

        this.animationId = requestAnimationFrame(drawWave);
      };

      drawWave();
    }
  },
  beforeUnmount() {
    // 타이머 및 애니메이션 정리
    clearInterval(this.loadingInterval);
    clearInterval(this.progressInterval);
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.resizeCanvas);
  }
};
</script>

<style scoped>
.redirect-handler {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
  position: relative;
  overflow: hidden;
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
  z-index: -1;
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
  position: absolute;
  z-index: -1;
}

.content-container {
  z-index: 10;
  width: 100%;
  max-width: 500px;
  padding: 0 20px;
  box-sizing: border-box;
}

.message-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.message-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.success-icon {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error-icon {
  background-color: #ffebee;
  color: #c62828;
}

.message-title {
  font-size: 1.6rem;
  margin: 10px 0;
  font-weight: 600;
  color: #333333;
}

.message-text {
  font-size: 1rem;
  margin: 8px 0;
  color: #555555;
}

.message-text.small {
  font-size: 0.9rem;
  color: #777777;
  margin: 15px 0;
}

.loading-bar-container {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 25px 0 15px;
  overflow: hidden;
}

.loading-bar {
  height: 100%;
  background: linear-gradient(to right, #4fc3f7, #2196f3, #3f51b5);
  border-radius: 3px;
  transition: width 0.2s ease;
}

.countdown {
  font-size: 0.9rem;
  color: #757575;
  margin: 5px 0;
}

.nav-button {
  background: linear-gradient(to right, #4fc3f7, #2196f3);
  color: white;
  border: none;
  padding: 12px 30px;
  margin-top: 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.error-button {
  background: linear-gradient(to right, #ff7043, #e53935);
}
</style> 