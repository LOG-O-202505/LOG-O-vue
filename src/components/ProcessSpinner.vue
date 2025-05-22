<template>
  <div class="process-container">
    
    <!-- 프로세스 리스트 -->
    <div class="process-list">
      <!-- 단계 1: AI 이미지 분석 -->
      <div
        class="process-item"
        :class="{ 'process-active': currentPhase === 'imageAnalysis', 'process-completed': isPhaseCompleted('imageAnalysis') }"
      >
        <div class="process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'imageAnalysis'" class="loading-spinner">
            <div class="spinner-circle"></div>
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="isPhaseCompleted('imageAnalysis')" class="check-icon-container">
            <svg viewBox="0 0 24 24" class="check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="pending-icon"></div>
        </div>
        
        <div class="process-info">
          <div 
            :class="[
              'process-name',
              {
                'completed': isPhaseCompleted('imageAnalysis'),
                'active': currentPhase === 'imageAnalysis',
                'pending': !isPhaseCompleted('imageAnalysis') && currentPhase !== 'imageAnalysis'
              }
            ]"
          >
            AI 이미지 분석
          </div>
          <div v-if="imageAnalysisDuration" class="elapsed-time">
            {{ formattedDuration(imageAnalysisDuration) }}
          </div>
        </div>
        
        <div class="process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'status-text',
              {
                'completed': isPhaseCompleted('imageAnalysis'),
                'processing': currentPhase === 'imageAnalysis',
                'pending': !isPhaseCompleted('imageAnalysis') && currentPhase !== 'imageAnalysis'
              }
            ]"
          >
            {{ 
              isPhaseCompleted('imageAnalysis') ? '완료' : 
              currentPhase === 'imageAnalysis' ? '처리중' : '대기중' 
            }}
          </div>
        </div>
      </div>

      <!-- 단계 2: AI 의미 분석 -->
      <div
        class="process-item"
        :class="{ 'process-active': currentPhase === 'meaningAnalysis', 'process-completed': isPhaseCompleted('meaningAnalysis') }"
      >
        <div class="process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'meaningAnalysis'" class="loading-spinner">
            <div class="spinner-circle"></div>
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="isPhaseCompleted('meaningAnalysis')" class="check-icon-container">
            <svg viewBox="0 0 24 24" class="check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="pending-icon"></div>
        </div>
        
        <div class="process-info">
          <div 
            :class="[
              'process-name',
              {
                'completed': isPhaseCompleted('meaningAnalysis'),
                'active': currentPhase === 'meaningAnalysis',
                'pending': !isPhaseCompleted('meaningAnalysis') && currentPhase !== 'meaningAnalysis'
              }
            ]"
          >
            AI 의미 분석
          </div>
          <div v-if="meaningAnalysisDuration" class="elapsed-time">
            {{ formattedDuration(meaningAnalysisDuration) }}
          </div>
        </div>
        
        <div class="process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'status-text',
              {
                'completed': isPhaseCompleted('meaningAnalysis'),
                'processing': currentPhase === 'meaningAnalysis',
                'pending': !isPhaseCompleted('meaningAnalysis') && currentPhase !== 'meaningAnalysis'
              }
            ]"
          >
            {{ 
              isPhaseCompleted('meaningAnalysis') ? '완료' : 
              currentPhase === 'meaningAnalysis' ? '처리중' : '대기중' 
            }}
          </div>
        </div>
      </div>

      <!-- 단계 3: AI 키워드 추출 (TripPlan에서만 사용) -->
      <div
        v-if="showExtendedPhases"
        class="process-item"
        :class="{ 'process-active': currentPhase === 'keywordExtraction', 'process-completed': isPhaseCompleted('keywordExtraction') }"
      >
        <div class="process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'keywordExtraction'" class="loading-spinner">
            <div class="spinner-circle"></div>
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="isPhaseCompleted('keywordExtraction')" class="check-icon-container">
            <svg viewBox="0 0 24 24" class="check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="pending-icon"></div>
        </div>
        
        <div class="process-info">
          <div 
            :class="[
              'process-name',
              {
                'completed': isPhaseCompleted('keywordExtraction'),
                'active': currentPhase === 'keywordExtraction',
                'pending': !isPhaseCompleted('keywordExtraction') && currentPhase !== 'keywordExtraction'
              }
            ]"
          >
            AI 키워드 추출
          </div>
          <div v-if="keywordExtractionDuration" class="elapsed-time">
            {{ formattedDuration(keywordExtractionDuration) }}
          </div>
        </div>
        
        <div class="process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'status-text',
              {
                'completed': isPhaseCompleted('keywordExtraction'),
                'processing': currentPhase === 'keywordExtraction',
                'pending': !isPhaseCompleted('keywordExtraction') && currentPhase !== 'keywordExtraction'
              }
            ]"
          >
            {{ 
              isPhaseCompleted('keywordExtraction') ? '완료' : 
              currentPhase === 'keywordExtraction' ? '처리중' : '대기중' 
            }}
          </div>
        </div>
      </div>

      <!-- 마지막 단계: 벡터 검색/저장 -->
      <div
        class="process-item"
        :class="{ 'process-active': currentPhase === 'search' || currentPhase === 'vectorSaving', 'process-completed': currentPhase === 'processingResults' || currentPhase === 'completed' }"
      >
        <div class="process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'search' || currentPhase === 'vectorSaving'" class="loading-spinner">
            <div class="spinner-circle"></div>
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="currentPhase === 'processingResults' || currentPhase === 'completed'" class="check-icon-container">
            <svg viewBox="0 0 24 24" class="check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="pending-icon"></div>
        </div>
        
        <div class="process-info">
          <div 
            :class="[
              'process-name',
              {
                'completed': currentPhase === 'processingResults' || currentPhase === 'completed',
                'active': currentPhase === 'search' || currentPhase === 'vectorSaving',
                'pending': !['search', 'vectorSaving', 'processingResults', 'completed'].includes(currentPhase)
              }
            ]"
          >
            {{ showExtendedPhases ? '벡터 저장' : '벡터 검색' }}
          </div>
          <div v-if="searchDuration" class="elapsed-time">
            {{ formattedDuration(searchDuration) }}
          </div>
        </div>
        
        <div class="process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'status-text',
              {
                'completed': currentPhase === 'processingResults' || currentPhase === 'completed',
                'processing': currentPhase === 'search' || currentPhase === 'vectorSaving',
                'pending': !['search', 'vectorSaving', 'processingResults', 'completed'].includes(currentPhase)
              }
            ]"
          >
            {{ 
              currentPhase === 'completed' || currentPhase === 'processingResults' ? '완료' : 
              currentPhase === 'search' || currentPhase === 'vectorSaving' ? '처리중' : '대기중' 
            }}
          </div>
        </div>
      </div>
      
      <!-- 결과 처리 단계 -->
      <div
        class="process-item"
        :class="{ 'process-active': currentPhase === 'processingResults', 'process-completed': currentPhase === 'completed' }"
      >
        <div class="process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'processingResults'" class="loading-spinner">
            <div class="spinner-circle"></div>
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="currentPhase === 'completed'" class="check-icon-container">
            <svg viewBox="0 0 24 24" class="check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="pending-icon"></div>
        </div>
        
        <div class="process-info">
          <div 
            :class="[
              'process-name',
              {
                'completed': currentPhase === 'completed',
                'active': currentPhase === 'processingResults',
                'pending': !['processingResults', 'completed'].includes(currentPhase)
              }
            ]"
          >
            결과 처리
          </div>
        </div>
        
        <div class="process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'status-text',
              {
                'completed': currentPhase === 'completed',
                'processing': currentPhase === 'processingResults',
                'pending': !['processingResults', 'completed'].includes(currentPhase)
              }
            ]"
          >
            {{ 
              currentPhase === 'completed' ? '완료' : 
              currentPhase === 'processingResults' ? '처리중' : '대기중' 
            }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 진행 상태 표시 -->
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="progress-text">
        {{ 
          currentPhase === 'completed' 
            ? '모든 작업이 완료되었습니다' 
            : `${currentStepNumber}/${totalSteps} 진행 중` 
        }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcessSpinner',
  props: {
    currentPhase: {
      type: String,
      default: 'imageAnalysis',
      validator: (value) => ['imageAnalysis', 'meaningAnalysis', 'keywordExtraction', 'search', 'vectorSaving', 'processingResults', 'completed'].includes(value)
    },
    imageAnalysisDuration: {
      type: [Number, String],
      default: null
    },
    meaningAnalysisDuration: {
      type: [Number, String],
      default: null
    },
    keywordExtractionDuration: {
      type: [Number, String],
      default: null
    },
    searchDuration: {
      type: [Number, String],
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
      } else if (this.currentPhase === 'processingResults') {
        return '검색 결과를 처리하는 중입니다';
      } else if (this.currentPhase === 'completed') {
        return '분석이 완료되었습니다';
      }
      return '처리 중입니다';
    },
    isPhaseCompleted() {
      return (phase) => {
        const phases = ['imageAnalysis', 'meaningAnalysis', 'keywordExtraction', 'search', 'vectorSaving', 'processingResults', 'completed'];
        const currentIndex = phases.indexOf(this.currentPhase);
        const phaseIndex = phases.indexOf(phase);
        return phaseIndex < currentIndex || this.currentPhase === 'completed';
      };
    },
    // 시간 형식화 함수
    formattedDuration() {
      return (duration) => {
        if (!duration) return '';
        const parsedDuration = parseFloat(duration);
        return `${parsedDuration}초`;
      };
    },
    // 진행률 계산
    progressPercentage() {
      const phases = this.showExtendedPhases 
        ? ['imageAnalysis', 'meaningAnalysis', 'keywordExtraction', 'search', 'vectorSaving', 'processingResults', 'completed'] 
        : ['imageAnalysis', 'meaningAnalysis', 'search', 'processingResults', 'completed'];
      
      const currentIndex = phases.indexOf(this.currentPhase);
      const totalPhases = phases.length - 1; // 'completed' 상태 제외
      
      if (this.currentPhase === 'completed') return 100;
      if (currentIndex < 0) return 0;
      
      return Math.min(Math.round((currentIndex / totalPhases) * 100), 100);
    },
    // 현재 단계 번호
    currentStepNumber() {
      const phases = this.showExtendedPhases 
        ? ['imageAnalysis', 'meaningAnalysis', 'keywordExtraction', 'search', 'vectorSaving', 'processingResults'] 
        : ['imageAnalysis', 'meaningAnalysis', 'search', 'processingResults'];
      
      return phases.indexOf(this.currentPhase) + 1;
    },
    // 전체 단계 수
    totalSteps() {
      return this.showExtendedPhases ? 5 : 4;
    }
  }
}
</script>

<style scoped>
/* 기본 스타일 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.process-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: transparent;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.process-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  color: #000;
}

.process-list {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  flex: 1;
  padding: 0 10%;
}

.process-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  transition: all 0.5s ease;
  flex: 1;
  min-width: 120px;
  max-width: 180px;
  min-height: 160px;
  background-color: transparent;
  position: relative;
}

.process-item.process-active {
  background-color: rgba(255, 255, 255, 0.7);
  border-color: #10b981;
  border-width: 2px;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.1);
  transition: all 0.5s ease;
}

.process-item.process-completed {
  background-color: rgba(16, 185, 129, 0.05);
  border-color: #d1fae5;
  transition: all 0.5s ease;
}

/* 아이콘 스타일 */
.process-icon-container {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 로딩 스피너 */
.loading-spinner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-circle {
  width: 32px;
  height: 32px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #10b981; /* 에메랄드 색상 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 체크 아이콘 */
.check-icon-container {
  width: 32px;
  height: 32px;
  background-color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 20px;
  height: 20px;
  fill: white;
  animation: checkAppear 0.5s ease forwards;
}

/* 대기 중 아이콘 */
.pending-icon {
  width: 12px;
  height: 12px;
  background-color: #d1d5db;
  border-radius: 50%;
  margin: 0 auto;
}

/* 프로세스 정보 */
.process-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.process-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  text-align: center;
}

.process-name.completed {
  color: #10b981;
}

.process-name.active {
  color: #000;
}

.process-name.pending {
  color: #9ca3af;
}

/* 실시간 시간 표시 스타일 */
.elapsed-time {
  position: absolute;
  bottom: 8px;
  font-size: 12px;
  color: #6b7280;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.process-active .elapsed-time {
  opacity: 1;
  transform: translateY(0);
}

.process-completed .elapsed-time {
  opacity: 1;
  transform: translateY(0);
  color: #10b981;
}

/* 상태 표시 */
.process-status {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.status-text.completed {
  color: #10b981;
}

.status-text.processing {
  color: #3b82f6;
}

.status-text.pending {
  color: #9ca3af;
}

/* 진행 상태 표시 */
.progress-container {
  margin-top: 24px;
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #10b981;
  border-radius: 9999px;
  transition: width 0.8s ease;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
  text-align: center;
  transition: all 0.5s ease;
}

/* 애니메이션 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes checkAppear {
  0% { opacity: 0; transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .process-list {
    flex-direction: column;
    align-items: center;
    padding: 0;
  }
  
  .process-item {
    width: 100%;
    max-width: none;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .process-info {
    align-items: flex-start;
    text-align: left;
    margin-left: 12px;
  }
  
  .process-status {
    text-align: right;
  }
}

@media (max-width: 480px) {
  .process-item {
    padding: 12px;
  }
  
  .process-name {
    font-size: 12px;
  }
  
  .elapsed-time,
  .status-text {
    font-size: 10px;
  }
}

/* 분석 테이블 스타일 */
.analysis-table { width: 100%; border-collapse: collapse; }
.analysis-table th { 
  background-color: #f8f9fa; 
  color: #34495e; 
  text-align: left; 
  padding: 0.75rem 1rem; 
  font-size: 0.9rem; 
  font-weight: 600; 
  border-bottom: 1px solid #dde2e7; 
}
.analysis-table th:nth-child(2) { /* 점수 열 정렬 */
  text-align: center;
}
.analysis-table td { 
  padding: 0.75rem 1rem; 
  border-bottom: 1px solid #eef2f7; 
  font-size: 0.85rem; 
}
.dimension-name { font-weight: 500; color: #5f6b7a; }
.dimension-score { 
  font-weight: 600; 
  color: var(--logo-blue, #48b0e4); 
  text-align: center; 
}
</style>