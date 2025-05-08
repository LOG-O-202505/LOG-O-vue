<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p class="loading-text">이미지를 분석 중입니다<span>.</span><span>.</span><span>.</span></p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

.loading-container {
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(72, 176, 228, 0.3);
  border-radius: 50%;
  border-top-color: #4299e1;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.1rem;
  color: #e2e8f0;
  margin: 0;
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
</style>