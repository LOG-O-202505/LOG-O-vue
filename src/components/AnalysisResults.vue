<template>
  <div id="jsonResult" class="container">
    <h2>당신의 여행 이미지 분석 결과</h2>

    <!-- 테이블 형식의 분석 결과 표시 -->
    <div class="analysis-table-container">
      <table class="analysis-table">
        <thead>
          <tr>
            <th>분석 항목</th>
            <th>점수</th>
            <th>그래프</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(score, dimension) in result" :key="dimension">
            <td class="dimension-name">{{ getDimensionHeader(dimension) }}</td>
            <td class="dimension-score">{{ score.toFixed(1) }}</td>
            <td class="dimension-bar">
              <div class="bar-container">
                <div class="bar" :style="{ width: `${score * 100}%` }"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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

.analysis-table-container {
  margin: 20px 0;
  overflow-x: auto;
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: white;
}

.analysis-table th {
  background-color: var(--logo-blue);
  color: white;
  text-align: left;
  padding: 15px;
  font-weight: 600;
}

.analysis-table tr:nth-child(even) {
  background-color: var(--gray-100);
}

.analysis-table td {
  padding: 12px 15px;
  border-bottom: 1px solid var(--gray-200);
}

.analysis-table tr:last-child td {
  border-bottom: none;
}

.dimension-name {
  font-weight: 600;
  color: var(--gray-800);
  width: 30%;
}

.dimension-score {
  text-align: center;
  font-weight: 700;
  color: var(--logo-blue);
  width: 10%;
}

.dimension-bar {
  width: 60%;
}

.bar-container {
  width: 100%;
  height: 20px;
  background-color: var(--gray-200);
  border-radius: 10px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, var(--logo-blue), var(--primary-light));
  border-radius: 10px;
  transition: width 1s cubic-bezier(0.25, 1, 0.5, 1);
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
  
  .dimension-name {
    width: 40%;
  }
  
  .dimension-score {
    width: 15%;
  }
  
  .dimension-bar {
    width: 45%;
  }
}
</style>