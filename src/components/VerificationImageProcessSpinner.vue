<template>
  <div class="verification-process-container">
    
    <!-- 프로세스 리스트 -->
    <div class="verification-process-list">
      <!-- 단계 1: AI 이미지 분석 -->
      <div
        class="verification-process-item"
        :class="{ 
          'process-active': currentPhase === 'imageAnalysis', 
          'process-completed': isPhaseCompleted('imageAnalysis'),
          'process-waiting': currentPhase === 'idle' || (!isPhaseCompleted('imageAnalysis') && currentPhase !== 'imageAnalysis')
        }"
      >
        <div class="verification-process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'imageAnalysis'" class="verification-loading-spinner">
            <img src="../assets/flight.gif" alt="Loading" class="verification-flight-spinner" />
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="isPhaseCompleted('imageAnalysis')" class="verification-check-icon-container">
            <svg viewBox="0 0 24 24" class="verification-check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="verification-waiting-spinner">
            <div class="verification-spinner-circle-gray"></div>
          </div>
        </div>
        
        <div class="verification-process-info">
          <div 
            :class="[
              'verification-process-name',
              {
                'completed': isPhaseCompleted('imageAnalysis'),
                'active': currentPhase === 'imageAnalysis',
                'pending': !isPhaseCompleted('imageAnalysis') && currentPhase !== 'imageAnalysis'
              }
            ]"
          >
            AI 이미지 분석
          </div>
          <!-- 단일 정보 표시: 상태 또는 시간 -->
          <div class="verification-process-status-or-time">
            <div v-if="currentPhase === 'imageAnalysis'" class="verification-current-time">
              {{ getCurrentDuration('imageAnalysis') }}
            </div>
            <div v-else-if="isPhaseCompleted('imageAnalysis')" class="verification-completed-time">
              {{ formattedDuration(imageAnalysisDuration) }}
            </div>
            <div v-else class="verification-waiting-status">
              대기중
            </div>
          </div>
        </div>
        
        <div class="verification-process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'verification-status-text',
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
        class="verification-process-item"
        :class="{ 
          'process-active': currentPhase === 'meaningAnalysis', 
          'process-completed': isPhaseCompleted('meaningAnalysis'),
          'process-waiting': currentPhase === 'idle' || (!isPhaseCompleted('meaningAnalysis') && currentPhase !== 'meaningAnalysis')
        }"
      >
        <div class="verification-process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'meaningAnalysis'" class="verification-loading-spinner">
            <img src="../assets/flight.gif" alt="Loading" class="verification-flight-spinner" />
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="isPhaseCompleted('meaningAnalysis')" class="verification-check-icon-container">
            <svg viewBox="0 0 24 24" class="verification-check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="verification-waiting-spinner">
            <div class="verification-spinner-circle-gray"></div>
          </div>
        </div>
        
        <div class="verification-process-info">
          <div 
            :class="[
              'verification-process-name',
              {
                'completed': isPhaseCompleted('meaningAnalysis'),
                'active': currentPhase === 'meaningAnalysis',
                'pending': !isPhaseCompleted('meaningAnalysis') && currentPhase !== 'meaningAnalysis'
              }
            ]"
          >
            AI 의미 분석
          </div>
          <!-- 단일 정보 표시: 상태 또는 시간 -->
          <div class="verification-process-status-or-time">
            <div v-if="currentPhase === 'meaningAnalysis'" class="verification-current-time">
              {{ getCurrentDuration('meaningAnalysis') }}
            </div>
            <div v-else-if="isPhaseCompleted('meaningAnalysis')" class="verification-completed-time">
              {{ formattedDuration(meaningAnalysisDuration) }}
            </div>
            <div v-else class="verification-waiting-status">
              대기중
            </div>
          </div>
        </div>
        
        <div class="verification-process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'verification-status-text',
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
        class="verification-process-item"
        :class="{ 
          'process-active': currentPhase === 'keywordExtraction', 
          'process-completed': isPhaseCompleted('keywordExtraction'),
          'process-waiting': currentPhase === 'idle' || (!isPhaseCompleted('keywordExtraction') && currentPhase !== 'keywordExtraction')
        }"
      >
        <div class="verification-process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'keywordExtraction'" class="verification-loading-spinner">
            <img src="../assets/flight.gif" alt="Loading" class="verification-flight-spinner" />
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="isPhaseCompleted('keywordExtraction')" class="verification-check-icon-container">
            <svg viewBox="0 0 24 24" class="verification-check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="verification-waiting-spinner">
            <div class="verification-spinner-circle-gray"></div>
          </div>
        </div>
        
        <div class="verification-process-info">
          <div 
            :class="[
              'verification-process-name',
              {
                'completed': isPhaseCompleted('keywordExtraction'),
                'active': currentPhase === 'keywordExtraction',
                'pending': !isPhaseCompleted('keywordExtraction') && currentPhase !== 'keywordExtraction'
              }
            ]"
          >
            AI 키워드 추출
          </div>
          <!-- 단일 정보 표시: 상태 또는 시간 -->
          <div class="verification-process-status-or-time">
            <div v-if="currentPhase === 'keywordExtraction'" class="verification-current-time">
              {{ getCurrentDuration('keywordExtraction') }}
            </div>
            <div v-else-if="isPhaseCompleted('keywordExtraction')" class="verification-completed-time">
              {{ formattedDuration(keywordExtractionDuration) }}
            </div>
            <div v-else class="verification-waiting-status">
              대기중
            </div>
          </div>
        </div>
        
        <div class="verification-process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'verification-status-text',
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
        class="verification-process-item"
        :class="{ 
          'process-active': currentPhase === 'search' || currentPhase === 'vectorSaving', 
          'process-completed': isPhaseCompleted('search'),
          'process-waiting': currentPhase === 'idle' || !isPhaseCompleted('search') && currentPhase !== 'search' && currentPhase !== 'vectorSaving'
        }"
      >
        <div class="verification-process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'search' || currentPhase === 'vectorSaving'" class="verification-loading-spinner">
            <img src="../assets/flight.gif" alt="Loading" class="verification-flight-spinner" />
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="isPhaseCompleted('search')" class="verification-check-icon-container">
            <svg viewBox="0 0 24 24" class="verification-check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="verification-waiting-spinner">
            <div class="verification-spinner-circle-gray"></div>
          </div>
        </div>
        
        <div class="verification-process-info">
          <div 
            :class="[
              'verification-process-name',
              {
                'completed': isPhaseCompleted('search'),
                'active': currentPhase === 'search' || currentPhase === 'vectorSaving',
                'pending': !isPhaseCompleted('search') && currentPhase !== 'search' && currentPhase !== 'vectorSaving'
              }
            ]"
          >
            {{ showExtendedPhases ? '벡터 저장' : '벡터 검색' }}
          </div>
          <!-- 단일 정보 표시: 상태 또는 시간 -->
          <div class="verification-process-status-or-time">
            <div v-if="currentPhase === 'search' || currentPhase === 'vectorSaving'" class="verification-current-time">
              {{ getCurrentDuration('search') }}
            </div>
            <div v-else-if="isPhaseCompleted('search')" class="verification-completed-time">
              {{ formattedDuration(searchDuration) }}
            </div>
            <div v-else class="verification-waiting-status">
              대기중
            </div>
          </div>
        </div>
        
        <div class="verification-process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'verification-status-text',
              {
                'completed': isPhaseCompleted('search'),
                'processing': currentPhase === 'search' || currentPhase === 'vectorSaving',
                'pending': !isPhaseCompleted('search') && currentPhase !== 'search' && currentPhase !== 'vectorSaving'
              }
            ]"
          >
            {{ 
              isPhaseCompleted('search') ? '완료' : 
              currentPhase === 'search' || currentPhase === 'vectorSaving' ? '처리중' : '대기중' 
            }}
          </div>
        </div>
      </div>
          
      <!-- 결과 처리 단계 -->
      <div
        class="verification-process-item"
        :class="{ 
          'process-active': currentPhase === 'processingResults', 
          'process-completed': currentPhase === 'completed',
          'process-waiting': currentPhase === 'idle' || !['processingResults', 'completed'].includes(currentPhase),
          'total-time-display': currentPhase === 'completed'
        }"
      >
        <div class="verification-process-icon-container">
          <!-- 진행 중인 프로세스 -->
          <div v-if="currentPhase === 'processingResults'" class="verification-loading-spinner">
            <img src="../assets/flight.gif" alt="Loading" class="verification-flight-spinner" />
          </div>
          
          <!-- 완료된 프로세스 -->
          <div v-else-if="currentPhase === 'completed'" class="verification-check-icon-container">
            <svg viewBox="0 0 24 24" class="verification-check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 -->
          <div v-else class="verification-waiting-spinner">
            <div class="verification-spinner-circle-gray"></div>
          </div>
        </div>
        
        <div class="verification-process-info">
          <div 
            :class="[
              'verification-process-name',
              {
                'completed': currentPhase === 'completed',
                'active': currentPhase === 'processingResults',
                'pending': !['processingResults', 'completed'].includes(currentPhase),
                'total-time-title': currentPhase === 'completed'
              }
            ]"
          >
            {{ currentPhase === 'completed' ? '총 처리 시간' : '인증 결과 처리' }}
          </div>
          <!-- 단일 정보 표시: 상태 또는 시간 -->
          <div class="verification-process-status-or-time">
            <div v-if="currentPhase === 'processingResults'" class="verification-current-time">
              {{ getCurrentDuration('processingResults') }}
            </div>
            <div v-else-if="currentPhase === 'completed'" class="verification-total-time-value">
              {{ formattedTotalTime }}
            </div>
            <div v-else class="verification-waiting-status">
              대기중
            </div>
          </div>
        </div>
        
        <div class="verification-process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'verification-status-text',
              {
                'completed': currentPhase === 'completed',
                'processing': currentPhase === 'processingResults',
                'pending': !['processingResults', 'completed'].includes(currentPhase),
                'total-status': currentPhase === 'completed'
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
    <div class="verification-progress-container">
      <div class="verification-progress-bar">
        <div 
          class="verification-progress-fill" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="verification-progress-text">
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
  name: 'VerificationImageProcessSpinner',
  props: {
    currentPhase: {
      type: String,
      default: 'idle',
      validator: (value) => ['idle', 'imageAnalysis', 'meaningAnalysis', 'keywordExtraction', 'search', 'vectorSaving', 'processingResults', 'completed'].includes(value)
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
    processingResultsDuration: {
      type: [Number, String],
      default: null
    },
    showExtendedPhases: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      startTimes: {
        imageAnalysis: null,
        meaningAnalysis: null,
        keywordExtraction: null,
        search: null,
        processingResults: null
      },
      currentDurations: {
        imageAnalysis: 0,
        meaningAnalysis: 0,
        keywordExtraction: 0,
        search: 0,
        processingResults: 0
      },
      timerInterval: null
    };
  },
  watch: {
    currentPhase: {
      immediate: true,
      handler(newPhase, oldPhase) {
        // Start timer for the new phase
        if (newPhase !== 'completed' && newPhase !== oldPhase) {
          this.startTimes[newPhase] = Date.now();
          
          // Clear previous interval if exists
          if (this.timerInterval) {
            clearInterval(this.timerInterval);
          }
          
          // Start new interval for the current phase
          this.timerInterval = setInterval(() => {
            if (this.startTimes[newPhase]) {
              const elapsed = (Date.now() - this.startTimes[newPhase]) / 1000;
              this.currentDurations[newPhase] = elapsed.toFixed(1);
            }
          }, 100);
        }
        
        // Clear interval when completed
        if (newPhase === 'completed' && this.timerInterval) {
          clearInterval(this.timerInterval);
        }
      }
    }
  },
  beforeUnmount() {
    // Clean up interval when component is destroyed
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
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
        return '인증 결과를 처리하는 중입니다';
      } else if (this.currentPhase === 'completed') {
        return '인증이 완료되었습니다';
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
        if (!duration) return '0.0초';
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
    },
    formattedTotalTime() {
      const imageTime = parseFloat(this.imageAnalysisDuration) || 0;
      const meaningTime = parseFloat(this.meaningAnalysisDuration) || 0;
      const keywordTime = parseFloat(this.keywordExtractionDuration) || 0;
      const searchTime = parseFloat(this.searchDuration) || 0;
      const processTime = parseFloat(this.processingResultsDuration) || 0;
      
      const totalTime = imageTime + meaningTime + (this.showExtendedPhases ? keywordTime : 0) + searchTime + processTime;
      return `${totalTime.toFixed(1)}초`;
    }
  },
  methods: {
    getCurrentDuration(phase) {
      return `${this.currentDurations[phase]}초`;
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

.verification-process-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: transparent;
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.verification-process-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  width: 100%;
  max-width: 100%;
}

.verification-process-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  transition: all 0.5s ease;
  background-color: transparent;
  position: relative;
  overflow: visible;
  min-height: 80px;
  width: 100%;
}

.verification-process-item.process-active {
  background-color: rgba(255, 255, 255, 0.7);
  border-color: #3b82f6;
  border-width: 2px;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.1);
  transition: all 0.5s ease;
}

.verification-process-item.process-completed {
  background-color: rgba(16, 185, 129, 0.05);
  border-color: #10b981;
  border-width: 2px;
  transition: all 0.5s ease;
}

.verification-process-item.process-waiting {
  background-color: rgba(255, 255, 255, 0.7);
  border-color: #9ca3af;
  border-width: 2px;
  transition: all 0.5s ease;
}

/* 아이콘 스타일 */
.verification-process-icon-container {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* gif 스피너를 위한 특별한 컨테이너 */
.verification-process-icon-container .verification-loading-spinner {
  width: 80px;
  height: 80px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 로딩 스피너 */
.verification-loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 대기 스피너 (회색) */
.verification-waiting-spinner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verification-spinner-circle-gray {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #9ca3af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Flight GIF 스피너 */
.verification-flight-spinner {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

/* 체크 아이콘 */
.verification-check-icon-container {
  width: 30px;
  height: 30px;
  background-color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verification-check-icon {
  width: 18px;
  height: 18px;
  fill: white;
  animation: checkAppear 0.5s ease forwards;
}

/* 프로세스 정보 */
.verification-process-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: left;
  min-width: 0;
}

.verification-process-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.verification-process-name.completed {
  color: #10b981;
}

.verification-process-name.active {
  color: #48b0e4;
}

.verification-process-name.pending {
  color: #9ca3af;
}

/* 새로운 상태/시간 표시 스타일 */
.verification-process-status-or-time {
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.2;
  min-height: 1rem;
}

.verification-current-time {
  color: #48b0e4;
  font-weight: 600;
}

.verification-completed-time {
  color: #10b981;
  font-weight: 600;
}

.verification-waiting-status {
  color: #9ca3af;
  font-style: italic;
}

/* 상태 표시 */
.verification-process-status {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 60px;
}

.verification-status-text {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.verification-status-text.completed {
  color: #10b981;
}

.verification-status-text.processing {
  color: #3b82f6;
}

.verification-status-text.pending {
  color: #9ca3af;
}

/* 진행 상태 표시 */
.verification-progress-container {
  margin-top: 16px;
  width: 100%;
}

.verification-progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.verification-progress-fill {
  height: 100%;
  background-color: #10b981;
  border-radius: 9999px;
  transition: width 0.8s ease;
}

.verification-progress-text {
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

/* 총 시간 표시를 위한 특별한 스타일 */
.verification-process-item.total-time-display {
  background-color: rgba(59, 130, 246, 0.05);
  border-color: #3b82f6;
  border-width: 3px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
  transform: scale(1.01);
  transition: all 0.5s ease;
}

.verification-process-item.total-time-display .verification-check-icon-container {
  background-color: #3b82f6;
}

.verification-total-time-value {
  color: #3b82f6;
  font-weight: 700;
  font-size: 0.9rem;
}

.verification-process-name.total-time-title {
  color: #3b82f6;
  font-weight: 700;
}

.verification-status-text.total-status {
  color: #3b82f6;
  font-weight: 600;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .verification-process-item {
    padding: 12px;
    min-height: 70px;
  }
  
  .verification-process-name {
    font-size: 0.9rem;
  }
  
  .verification-process-status-or-time {
    font-size: 0.75rem;
  }
  
  .verification-status-text {
    font-size: 12px;
  }
  
  .verification-process-icon-container {
    width: 40px;
    height: 40px;
  }
  
  .verification-flight-spinner {
    width: 60px;
    height: 60px;
  }
  
  .verification-check-icon-container {
    width: 24px;
    height: 24px;
  }
  
  .verification-check-icon {
    width: 14px;
    height: 14px;
  }
  
  .verification-spinner-circle-gray {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .verification-process-item {
    padding: 10px;
    min-height: 60px;
  }
  
  .verification-process-name {
    font-size: 0.8rem;
  }
  
  .verification-process-status-or-time {
    font-size: 0.7rem;
  }
  
  .verification-status-text {
    font-size: 10px;
  }
}
</style> 