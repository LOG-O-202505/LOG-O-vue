<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p class="loading-text">{{ loadingText }}<span>.</span><span>.</span><span>.</span></p>
    
    <!-- Progress indicators -->
    <div class="progress-steps">
      <!-- 단계 1: AI 이미지 분석 -->
      <div class="step" :class="{ 'active': currentPhase === 'imageAnalysis', 'completed': isPhaseCompleted('imageAnalysis') }">
        <div class="step-circle">1</div>
        <div class="step-label">AI 이미지 분석</div>
        <div v-if="imageAnalysisDuration" class="step-time">{{ imageAnalysisDuration }}초</div>
      </div>
      
      <!-- 단계 2: AI 의미 분석 -->
      <div class="step" :class="{ 'active': currentPhase === 'meaningAnalysis', 'completed': isPhaseCompleted('meaningAnalysis') }">
        <div class="step-circle">2</div>
        <div class="step-label">AI 의미 분석</div>
        <div v-if="meaningAnalysisDuration" class="step-time">{{ meaningAnalysisDuration }}초</div>
      </div>
      
      <!-- 단계 3: AI 키워드 추출 (TripPlan에서만 사용) -->
      <div v-if="showExtendedPhases" class="step" :class="{ 'active': currentPhase === 'keywordExtraction', 'completed': isPhaseCompleted('keywordExtraction') }">
        <div class="step-circle">3</div>
        <div class="step-label">AI 키워드 추출</div>
        <div v-if="keywordExtractionDuration" class="step-time">{{ keywordExtractionDuration }}초</div>
      </div>
      
      <!-- 마지막 단계: 벡터 검색/저장 -->
      <div class="step" :class="{ 'active': currentPhase === 'search' || currentPhase === 'vectorSaving', 'completed': currentPhase === 'completed' }">
        <div class="step-circle">{{ showExtendedPhases ? '4' : '3' }}</div>
        <div class="step-label">{{ showExtendedPhases ? '벡터 저장' : '벡터 검색' }}</div>
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
      default: 'imageAnalysis',
      validator: (value) => ['imageAnalysis', 'meaningAnalysis', 'keywordExtraction', 'search', 'vectorSaving', 'completed'].includes(value)
    },
    imageAnalysisDuration: {
      type: Number,
      default: null
    },
    meaningAnalysisDuration: {
      type: Number,
      default: null
    },
    keywordExtractionDuration: {
      type: Number,
      default: null
    },
    searchDuration: {
      type: Number,
      default: null
    },
    showExtendedPhases: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    loadingText() {
      if (this.currentPhase === 'imageAnalysis') {
        return 'AI가 이미지를 분석 중입니다';
      } else if (this.currentPhase === 'meaningAnalysis') {
        return '이미지의 의미를 분석 중입니다';
      } else if (this.currentPhase === 'keywordExtraction') {
        return '이미지 키워드를 추출 중입니다';
      } else if (this.currentPhase === 'search') {
        return '유사한 이미지 검색 중입니다';
      } else if (this.currentPhase === 'vectorSaving') {
        return '분석 결과를 저장 중입니다';
      }
      return '처리 중입니다';
    },
    isPhaseCompleted() {
      return (phase) => {
        const phases = ['imageAnalysis', 'meaningAnalysis', 'keywordExtraction', 'search', 'vectorSaving', 'completed'];
        const currentIndex = phases.indexOf(this.currentPhase);
        const phaseIndex = phases.indexOf(phase);
        return phaseIndex < currentIndex || this.currentPhase === 'completed';
      };
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
  /* 그림자와 배경색 제거 - 이미 패널에 적용됨 */
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #d1e9ff; /* 더 밝고 연한 파랑 배경 */
  border-radius: 50%;
  border-top-color: #007bff; /* 더 진한 파란색 */
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.2rem;
  color: #495057; /* 어두운 회색으로 변경 */
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
  background-color: #adb5bd; /* 연결선 색상 변경 (연한 회색) */
}

.step.completed:not(:last-child)::after {
  background-color: #007bff; /* 완료된 연결선 (진한 파랑) */
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9ecef; /* 기본 원 배경 (매우 연한 회색) */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057; /* 기본 원 글자색 (어두운 회색) */
  font-weight: bold;
  border: 1px solid #ced4da; /* 테두리 추가 */
}

.step.active .step-circle {
  background-color: #007bff; /* 활성 원 배경 (진한 파랑) */
  color: white; /* 활성 원 글자색 (흰색) */
  border-color: #0056b3;
  animation: pulse 1.5s infinite;
}

.step.completed .step-circle {
  background-color: #28a745; /* 완료 원 배경 (초록색) */
  color: white; /* 완료 원 글자색 (흰색) */
  border-color: #1e7e34;
}

.step-label {
  font-size: 0.95rem;
  color: #6c757d; /* 기본 라벨 글자색 (회색) */
}

.step.active .step-label {
  color: #0056b3; /* 활성 라벨 글자색 (더 진한 파랑) */
  font-weight: 500;
}

.step.completed .step-label {
  color: #1e7e34; /* 완료 라벨 글자색 (더 진한 초록) */
}

.step-time {
  font-size: 0.85rem;
  color: #6c757d; /* 시간 표시 글자색 (회색) */
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