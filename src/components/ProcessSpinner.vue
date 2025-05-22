<template>
  <div class="process-container">
    <h2 class="process-title">처리 단계</h2>
    <div class="process-list">
      <div
        v-for="(process, index) in processes"
        :key="index"
        :class="[
          'process-item',
          {
            'process-active': process.status === 'processing' || process.status === 'completing'
          }
        ]"
      >
        <div class="process-icon-container">
          <!-- 진행 중인 프로세스 - 스피너 표시 -->
          <div v-if="process.status === 'processing'" class="loading-spinner">
            <div class="spinner-circle"></div>
          </div>
          
          <!-- 완료 중인 프로세스 - 전환 애니메이션 표시 -->
          <div v-else-if="process.status === 'completing'" class="transition-icon">
            <!-- 사라지는 스피너 -->
            <div class="spinner-fade-out">
              <div class="spinner-bg"></div>
              <div class="spinner-circle-anim"></div>
            </div>
            
            <!-- 나타나는 체크 아이콘 -->
            <div class="check-fade-in">
              <div class="check-bg">
                <svg viewBox="0 0 24 24" class="check-icon">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- 완료된 프로세스 - 체크 아이콘 표시 -->
          <div v-else-if="process.status === 'completed'" class="check-icon-container">
            <svg viewBox="0 0 24 24" class="check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
            </svg>
          </div>
          
          <!-- 대기 중인 프로세스 - 회색 원 표시 -->
          <div v-else class="pending-icon"></div>
        </div>
        
        <div class="process-info">
          <div 
            :class="[
              'process-name',
              {
                'completed': process.status === 'completed',
                'active': process.status === 'processing' || process.status === 'completing',
                'pending': process.status === 'pending'
              }
            ]"
          >
            {{ process.name }}
          </div>
          <div 
            :class="[
              'process-description',
              {
                'completed': process.status === 'completed',
                'active': process.status === 'processing' || process.status === 'completing',
                'pending': process.status === 'pending'
              }
            ]"
          >
            {{ process.description }}
          </div>
        </div>
        
        <div class="process-status">
          <!-- 상태 표시 -->
          <div 
            :class="[
              'status-text',
              {
                'completed': process.status === 'completed',
                'completing': process.status === 'completing',
                'processing': process.status === 'processing',
                'pending': process.status === 'pending'
              }
            ]"
          >
            {{ 
              process.status === 'completed' ? '완료' : 
              process.status === 'completing' ? '완료 중' : 
              process.status === 'processing' ? '처리중' : '대기중' 
            }}
          </div>
          
          <!-- 경과 시간 표시 -->
          <div class="elapsed-time">
            {{ 
              process.status === 'completed' || process.status === 'completing' 
                ? formatElapsedTime(process.startTime, process.endTime) 
                : process.status === 'processing' 
                  ? formatElapsedTime(process.startTime) 
                  : '00:00' 
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
          :style="{ width: `${Math.min((currentProcessIndex / processes.length) * 100, 100)}%` }"
        ></div>
      </div>
      <div class="progress-text">
        {{ 
          currentProcessIndex >= processes.length 
            ? '모든 작업이 완료되었습니다' 
            : `${currentProcessIndex + 1}/${processes.length} 진행 중` 
        }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcessSpinner',
  props: {
    initialProcesses: {
      type: Array,
      default: () => [
        { name: "Llava가 사진을 처리중", description: "이미지 분석 및 처리 완료" },
        { name: "Llama가 결과를 처리중", description: "텍스트 데이터 생성 진행 중..." },
        { name: "ES에 결과를 조회중", description: "데이터베이스 조회 대기 중" }
      ]
    },
    initialProcessIndex: {
      type: Number,
      default: 0
    },
    autoProgress: {
      type: Boolean,
      default: true
    },
    progressDelay: {
      type: Number,
      default: 10000 // 10초
    }
  },
  data() {
    return {
      currentProcessIndex: this.initialProcessIndex,
      processes: [],
      elapsedTimeCounter: 0,
      progressTimer: null,
      elapsedTimer: null
    }
  },
  created() {
    // 초기 프로세스 상태 설정
    this.processes = this.initialProcesses.map((process, index) => ({
      ...process,
      startTime: index === this.initialProcessIndex ? Date.now() : undefined,
      endTime: undefined,
      status: index === this.initialProcessIndex ? 'processing' : 
              index < this.initialProcessIndex ? 'completed' : 'pending'
    }));
  },
  mounted() {
    // 경과 시간 업데이트 타이머 설정
    this.elapsedTimer = setInterval(() => {
      this.elapsedTimeCounter++;
    }, 1000);
    
    // 자동 진행 타이머 설정
    this.startProgressTimer();
  },
  beforeUnmount() {
    // 타이머 정리
    this.clearTimers();
  },
  methods: {
    // 경과 시간 포맷팅
    formatElapsedTime(startTime, endTime) {
      if (!startTime) return "00:00";
      
      const end = endTime || Date.now();
      const elapsedMs = end - startTime;
      const seconds = Math.floor(elapsedMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    },
    
    // 자동 진행 타이머 시작
    startProgressTimer() {
      if (!this.autoProgress || this.currentProcessIndex >= this.processes.length) return;
      
      this.clearProgressTimer();
      
      this.progressTimer = setTimeout(() => {
        // 현재 프로세스 completing 상태로 변경
        if (this.currentProcessIndex < this.processes.length) {
          const updatedProcesses = [...this.processes];
          updatedProcesses[this.currentProcessIndex] = {
            ...updatedProcesses[this.currentProcessIndex],
            endTime: Date.now(),
            status: 'completing' // 완료 중 상태로 변경
          };
          this.processes = updatedProcesses;
          
          // 애니메이션 시간(1.5초) 후에 다음 프로세스로 이동
          setTimeout(() => {
            const newProcesses = [...this.processes];
            
            // 현재 프로세스를 completed로 변경
            newProcesses[this.currentProcessIndex] = {
              ...newProcesses[this.currentProcessIndex],
              status: 'completed'
            };
            
            // 다음 프로세스 시작 처리
            if (this.currentProcessIndex + 1 < newProcesses.length) {
              newProcesses[this.currentProcessIndex + 1] = {
                ...newProcesses[this.currentProcessIndex + 1],
                startTime: Date.now(),
                status: 'processing'
              };
            }
            
            this.processes = newProcesses;
            
            // 다음 프로세스로 이동
            this.currentProcessIndex = Math.min(this.currentProcessIndex + 1, this.processes.length);
            
            // 다음 타이머 시작
            this.startProgressTimer();
          }, 1500); // 애니메이션 시간
        }
      }, this.progressDelay);
    },
    
    // 진행 타이머 정리
    clearProgressTimer() {
      if (this.progressTimer) {
        clearTimeout(this.progressTimer);
        this.progressTimer = null;
      }
    },
    
    // 모든 타이머 정리
    clearTimers() {
      this.clearProgressTimer();
      
      if (this.elapsedTimer) {
        clearInterval(this.elapsedTimer);
        this.elapsedTimer = null;
      }
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
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
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
  flex-direction: column;
  gap: 16px;
}

.process-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.process-item.process-active {
  background-color: rgba(0, 0, 0, 0.03);
  border-color: #e0e0e0;
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

/* 전환 아이콘 */
.transition-icon {
  position: relative;
  width: 100%;
  height: 100%;
}

.spinner-fade-out {
  position: absolute;
  inset: 0;
  animation: fadeOut 1.5s ease forwards;
}

.spinner-bg {
  position: absolute;
  inset: 0;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.spinner-circle-anim {
  position: absolute;
  inset: 0;
  border: 4px solid transparent;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.check-fade-in {
  position: absolute;
  inset: 0;
  opacity: 0;
  animation: fadeIn 1.5s ease forwards;
  animation-delay: 0.3s;
}

.check-bg {
  width: 32px;
  height: 32px;
  background-color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  flex: 1;
}

.process-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
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

.process-description {
  font-size: 14px;
}

.process-description.completed {
  color: #10b981;
}

.process-description.active {
  color: #4b5563;
}

.process-description.pending {
  color: #9ca3af;
}

/* 상태 표시 */
.process-status {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.status-text.completed {
  color: #10b981;
}

.status-text.completing {
  color: #34d399;
}

.status-text.processing {
  color: #3b82f6;
}

.status-text.pending {
  color: #9ca3af;
}

.elapsed-time {
  font-size: 12px;
  margin-top: 4px;
  color: #6b7280;
}

/* 진행 상태 표시 */
.progress-container {
  margin-top: 24px;
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
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
  text-align: center;
}

/* 애니메이션 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes fadeIn {
  0% { opacity: 0; transform: scale(0.8); }
  70% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes checkAppear {
  0% { opacity: 0; transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}
</style>