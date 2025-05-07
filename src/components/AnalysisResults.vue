<template>
  <div id="jsonResult" class="container">
    <h2>당신의 여행 이미지 분석 결과</h2>

    <!-- 동적으로 카테고리가 추가될 컨테이너 -->
    <div class="dimensions-container">
      <div class="dimensions-scores">
        <div 
          v-for="(score, dimension) in result" 
          :key="dimension"
          class="score-section"
          :class="getSectionClass(dimension)"
        >
          <h3 v-html="getDimensionHeader(dimension)"></h3>
          <div class="score-item">
            <div class="score-bar-container">
              <div 
                class="score-bar" 
                :style="{ width: `${score * 100}%` }"
              ></div>
            </div>
            <div class="score-value">{{ score.toFixed(1) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 분석 이후 선택 버튼 영역 추가 -->
    <div class="action-buttons">
      <h3>이미지 분석 결과 활용</h3>
      <div class="action-button-group">
        <button 
          @click="$emit('save-to-elasticsearch')" 
          class="action-btn upload-btn"
        >
          데이터베이스에 저장하기
        </button>
        <button 
          @click="$emit('search-similar')" 
          class="action-btn search-btn"
        >
          유사한 이미지 검색하기
        </button>
      </div>
      <div 
        v-if="statusMessage" 
        class="status-message" 
        :class="statusClass"
      >
        {{ statusMessage }}
      </div>
    </div>

    <!-- 원본 응답 토글 -->
    <button 
      @click="toggleRawResponse" 
      class="toggle-raw"
    >
      {{ showRawResponse ? '원본 응답 숨기기' : '원본 응답 보기' }}
    </button>
    
    <div 
      v-if="showRawResponse" 
      class="raw-response"
    >
      {{ JSON.stringify(result, null, 2) }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'AnalysisResults',
  
  props: {
    result: {
      type: Object,
      required: true
    },
    status: {
      type: Object,
      default: () => ({ message: '', type: '' })
    }
  },
  
  emits: ['save-to-elasticsearch', 'search-similar'],
  
  setup(props) {
    // 차원 영어-한글 매핑
    const dimensionTranslations = {
      "Natural Elements": "자연 요소",
      "Urban Character": "도시 특성",
      "Water Features": "수경 요소",
      "Seasonal Appeal": "계절적 매력",
      "Relaxation Potential": "휴식 잠재력",
      "Romantic Atmosphere": "로맨틱한 분위기",
      "Activity Opportunities": "활동 기회",
      "Historical/Cultural Value": "역사/문화적 가치",
      "Food Experience": "식도락 경험",
      "Shopping Potential": "쇼핑 잠재력"
    }
    
    // 원본 응답 표시 여부
    const showRawResponse = ref(false)
    
    // 상태 메시지
    const statusMessage = computed(() => props.status?.message || '')
    
    // 상태 클래스
    const statusClass = computed(() => {
      if (props.status?.type === 'success') {
        return 'status-success'
      } else if (props.status?.type === 'error') {
        return 'status-error'
      }
      return ''
    })
    
    // 카테고리 섹션 클래스 생성
    const getSectionClass = (dimension) => {
      const index = Object.keys(props.result).indexOf(dimension)
      return `section-color-${(index % 4) + 1}`
    }
    
    // 차원 헤더 생성 - SVG 아이콘 제거
    const getDimensionHeader = (dimension) => {
      const name = dimensionTranslations[dimension] || dimension
      return name
    }
    
    // 원본 응답 토글
    const toggleRawResponse = () => {
      showRawResponse.value = !showRawResponse.value
    }
    
    return {
      showRawResponse,
      statusMessage,
      statusClass,
      getSectionClass,
      getDimensionHeader,
      toggleRawResponse
    }
  }
}
</script>

<style scoped>
#jsonResult {
  margin-top: 30px;
}

.dimensions-container {
  margin-top: 20px;
}

.score-section {
  background-color: white;
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 22px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
  border-left: 5px solid;
  animation: fadeIn 0.6s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section-color-1 {
  border-left-color: var(--logo-blue);
}

.section-color-1 h3 {
  color: var(--logo-blue);
}

.section-color-2 {
  border-left-color: var(--logo-coral);
}

.section-color-2 h3 {
  color: var(--logo-coral);
}

.section-color-3 {
  border-left-color: var(--logo-yellow);
}

.section-color-3 h3 {
  color: var(--logo-yellow);
}

.section-color-4 {
  border-left-color: var(--logo-green);
}

.section-color-4 h3 {
  color: var(--logo-green);
}

.score-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.score-section h3 {
  margin-top: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-200);
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-out;
  animation-fill-mode: both;
}

.score-bar-container {
  flex: 2;
  height: 22px;
  background-color: rgba(240, 240, 240, 0.8);
  border-radius: 12px;
  margin-right: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.score-bar {
  height: 100%;
  border-radius: 12px;
  position: relative;
  transition: width 1s cubic-bezier(0.25, 1, 0.5, 1);
  background: linear-gradient(90deg, var(--logo-blue), var(--primary-light));
}

.score-value {
  width: 40px;
  text-align: right;
  font-weight: 700;
  color: var(--primary-dark);
}

/* 액션 버튼 스타일 */
.action-buttons {
  margin-top: 30px;
  padding: 22px;
  background-color: var(--gray-100);
  border-radius: 16px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.action-buttons h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--logo-blue);
  font-size: 1.2rem;
}

.action-button-group {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  padding: 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.upload-btn {
  background-color: var(--logo-green);
  color: white;
}

.upload-btn:hover {
  background-color: #5a9d87;
  transform: translateY(-2px);
}

.search-btn {
  background-color: var(--logo-yellow);
  color: var(--gray-800);
}

.search-btn:hover {
  background-color: #e4bd5c;
  transform: translateY(-2px);
}

.status-message {
  padding: 12px;
  border-radius: 10px;
  display: block;
  margin-top: 12px;
  font-weight: 500;
}

.status-success {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: rgb(6, 95, 70);
}

.status-error {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgb(153, 27, 27);
}

/* 원본 응답 영역 */
.toggle-raw {
  background-color: var(--gray-600);
  color: white;
  padding: 8px 15px;
  border-radius: 50px;
  cursor: pointer;
  margin-top: 10px;
  width: auto;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-raw:hover {
  background-color: var(--gray-700);
}

.raw-response {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--gray-100);
  border-radius: 10px;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  max-height: 300px;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .action-button-group {
    flex-direction: column;
  }
}
</style>