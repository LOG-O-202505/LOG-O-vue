<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p class="loading-text">{{ loadingText }}<span>.</span><span>.</span><span>.</span></p>
    
    <!-- Progress indicators -->
    <div class="progress-steps">
      <div class="step" :class="{ 'active': currentPhase === 'analysis', 'completed': currentPhase === 'search' || currentPhase === 'completed' }">
        <div class="step-circle">1</div>
        <div class="step-label">이미지 분석</div>
        <div v-if="analysisDuration" class="step-time">{{ analysisDuration }}초</div>
      </div>
      <div class="step" :class="{ 'active': currentPhase === 'search', 'completed': currentPhase === 'completed' }">
        <div class="step-circle">2</div>
        <div class="step-label">유사도 검색</div>
        <div v-if="searchDuration" class="step-time">{{ searchDuration }}초</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    currentPhase: {
      type: String,
      default: 'analysis',
      validator: (value) => ['analysis', 'search', 'completed'].includes(value)
    },
    analysisDuration: {
      type: Number,
      default: null
    },
    searchDuration: {
      type: Number,
      default: null
    }
  },
  computed: {
    loadingText() {
      if (this.currentPhase === 'analysis') {
        return '이미지를 분석 중입니다';
      } else if (this.currentPhase === 'search') {
        return '유사한 이미지 검색 중입니다';
      }
      return '처리 중입니다';
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  /* 그림자와 배경색 제거 */
}

.spinner {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(72, 176, 228, 0.3);
  border-radius: 50%;
  border-top-color: #4299e1;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.2rem;
  color: #e2e8f0;
  margin: 0 0 2rem 0;
  text-align: center;
}

.loading-text span {
  display: inline-block;
  animation: dots 1.5s infinite;
}

.loading-text span:nth-child(2) {
  animation-delay: 0.3s;
}

.loading-text span:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes dots {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* Progress steps styles */
.progress-steps {
  display: flex;
  justify-content: center;
  gap: 35px;
  margin-top: 10px;
  position: relative;
  width: 90%;
  max-width: 400px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 15px;
  right: -32px;
  width: 30px;
  height: 2px;
  background-color: rgba(72, 176, 228, 0.3);
}

.step.completed:not(:last-child)::after {
  background-color: #38a169;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(72, 176, 228, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.step.active .step-circle {
  background-color: #4299e1;
  animation: pulse 1.5s infinite;
}

.step.completed .step-circle {
  background-color: #38a169;
}

.step-label {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
}

.step.active .step-label {
  color: white;
  font-weight: 500;
}

.step-time {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>