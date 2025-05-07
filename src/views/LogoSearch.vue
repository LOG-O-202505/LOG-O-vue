<template>
  <div class="logo-search">
    <Header />
    
    <div class="main-container">
      <!-- 왼쪽 패널: 이미지 업로드 및 정보 -->
      <div class="upload-panel">
        <div class="upload-panel-content">
          <div class="form-group">
            <ImageUpload @image-selected="onImageSelected" />
          </div>
          
          <ImageInfo 
            v-if="imageFile"
            @info-updated="onInfoUpdated"
          />
          
          <div class="button-group">
            <button 
              @click="reset" 
              class="secondary-btn"
              :disabled="isLoading"
            >
              초기화
            </button>
            <button 
              v-if="isLoading" 
              @click="cancelAnalysis" 
              class="cancel-btn"
            >
              취소
            </button>
          </div>
        </div>
      </div>
      
      <!-- 중앙 패널: 분석 결과 -->
      <div class="analysis-panel" v-if="analysisResult && !isLoading">
        <div class="analysis-panel-content">
          <h3>당신의 여행 이미지 분석 결과</h3>
          
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
                <tr v-for="(score, dimension) in analysisResult" :key="dimension">
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
          
          <!-- 이미지 분석 결과 저장 버튼 -->
          <div class="save-action">
            <button 
              @click="saveToElasticsearchHandler" 
              class="save-btn"
            >
              데이터베이스에 저장하기
            </button>
            
            <div 
              v-if="statusMessage" 
              class="status-message" 
              :class="statusClass"
            >
              {{ statusMessage }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 오른쪽 패널: 검색 결과 또는 안내 메시지 -->
      <div class="results-panel">
        <div class="results-panel-content">
          <h3>검색 결과</h3>
          
          <!-- 로딩 중 스피너 표시 -->
          <div v-if="isLoading" class="loading-overlay">
            <LoadingSpinner />
          </div>
          
          <div v-else-if="searchResults.length > 0" class="search-results-grid">
            <!-- 실제 검색 결과 -->
            <div 
              v-for="result in searchResults" 
              :key="result._id"
              class="result-card"
            >
              <div class="result-image-container">
                <img 
                  :src="`data:image/jpeg;base64,${result._source.image_data}`" 
                  :alt="result._source.image_name"
                  class="result-image"
                >
              </div>
              <div class="result-info">
                <h4 class="result-title">{{ result._source.image_name }}</h4>
                <p class="result-location">{{ result._source.image_location }}</p>
                <p class="result-score">유사도: {{ (Math.round(result._score * 100) / 100).toFixed(2) }}</p>
              </div>
            </div>
          </div>
          
          <!-- 검색 전 안내 메시지 -->
          <div v-else class="search-guide">
            <div class="guide-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 class="guide-title">사진으로 여행지를 검색해보세요!!</h2>
            <p class="guide-description">왼쪽에 여행 사진을 업로드하고 분석하면 유사한 여행지 이미지를 여기에서 확인할 수 있습니다.</p>
            <div class="guide-steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-text">이미지 선택</div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-text">정보 입력</div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-text">분석 실행</div>
              </div>
            </div>
            
            <!-- 이미지 분석 버튼 추가 -->
            <button 
              v-if="imageFile && !isLoading" 
              @click="analyzeCurrentImage" 
              class="analyze-btn"
            >
              이미지 분석하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import Header from "@/components/Header.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import ImageInfo from "@/components/ImageInfo.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { 
  analyzeImage as callAnalyzeImage, 
  saveToElasticsearch as callSaveToElasticsearch,
  searchSimilarImages,
  createFeaturesVector
} from "@/services/api";
import { createMap } from "@/services/map";

export default {
  name: "LogoSearch",
  components: {
    Header,
    ImageUpload,
    ImageInfo,
    LoadingSpinner
  },
  setup() {
    const store = useStore();
    
    // 상태 관리
    const imageFile = computed(() => store.state.image.file);
    const imagePreview = computed(() => store.state.image.preview);
    const imageInfo = computed(() => store.state.image.info);
    const isLoading = ref(false);
    const analysisResult = ref(null);
    const searchResults = ref([]);
    const abortController = ref(null);
    const actionStatus = ref({ message: "", type: "" });
    const mapInitialized = ref(false);
    
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
    };
    
    // 차원 헤더 생성
    const getDimensionHeader = (dimension) => {
      return dimensionTranslations[dimension] || dimension;
    };
    
    // 상태 메시지 및 클래스
    const statusMessage = computed(() => actionStatus.value.message || '');
    const statusClass = computed(() => {
      if (actionStatus.value.type === 'success') {
        return 'status-success';
      } else if (actionStatus.value.type === 'error') {
        return 'status-error';
      }
      return '';
    });
    
    // 컴포넌트 마운트 시 실행
    onMounted(() => {
      console.log("LogoSearch 컴포넌트 마운트");
      
      // Google Maps API 로드 상태 이벤트 감시
      window.addEventListener('google_maps_loaded', () => {
        console.log("Google Maps 로드 이벤트 감지");
        mapInitialized.value = true;
      });
    });
    
    // 위치 변경 시 지도 자동 업데이트
    watch(() => imageInfo.value.location, (newLocation) => {
      if (newLocation && mapInitialized.value) {
        console.log("위치 변경 감지, 지도 업데이트: ", newLocation);
        updateMapDisplay(newLocation);
      }
    });
    
    // 지도 업데이트 함수 (구글 지도 문제 해결용)
    const updateMapDisplay = async (location) => {
      // 지도를 표시할 컨테이너 찾기
      const mapContainers = document.querySelectorAll('.map-container');
      if (mapContainers.length === 0) {
        console.warn("지도 컨테이너를 찾을 수 없습니다");
        return;
      }
      
      // 위치 정보로 가짜 장소 객체 생성
      const place = {
        name: location,
        formatted_address: location,
        geometry: {
          location: null // createMap 함수가 기본 위치(서울)를 사용하도록 null
        }
      };
      
      // 지도 생성 시도
      try {
        const mapContainer = mapContainers[0];
        await createMap(mapContainer, place);
        console.log("지도 업데이트 성공");
      } catch (error) {
        console.error("지도 업데이트 오류:", error);
      }
    };
    
    // 이미지 선택 처리
    const onImageSelected = (file) => {
      store.commit("image/setFile", file);
    };
    
    // 이미지 정보 업데이트 처리
    const onInfoUpdated = (info) => {
      store.commit("image/setInfo", info);
    };
    
    // 이미지 분석 처리 (수정됨)
    const analyzeCurrentImage = async () => {
      if (!imageFile.value) {
        alert("먼저 이미지를 선택해주세요.");
        return;
      }
      
      try {
        isLoading.value = true;
        
        // AbortController 설정
        abortController.value = new AbortController();
        
        console.log("이미지 분석 시작:", imageFile.value.name);
        
        // 직접 API 호출
        try {
          // 이미지 분석 API 호출
          const result = await callAnalyzeImage(
            imageFile.value, 
            abortController.value.signal
          );
          
          // 결과 저장
          analysisResult.value = result;
          console.log("분석 결과:", result);
          
          // 분석이 완료되면 자동으로 유사 이미지 검색 실행
          await searchSimilarHandler();
          
        } catch (apiError) {
          console.error("API 호출 오류:", apiError);
          
          // 오류 발생 시 테스트 데이터 사용
          if (!abortController.value.signal.aborted) {
            console.log("테스트 데이터 사용");
            analysisResult.value = {
              "Natural Elements": 1.0,
              "Urban Character": 0.2,
              "Water Features": 0.9,
              "Seasonal Appeal": 0.5,
              "Relaxation Potential": 0.6,
              "Romantic Atmosphere": 0.4,
              "Activity Opportunities": 0.3,
              "Historical/Cultural Value": 0.1,
              "Food Experience": 0.0,
              "Shopping Potential": 0.0
            };
            
            alert("API 연결 오류로 테스트 데이터를 사용합니다. 실제 서버 상태를 확인하세요.");
            
            // 테스트 데이터로도 유사 이미지 검색 실행
            await searchSimilarHandler();
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("사용자가 요청을 취소했습니다.");
        } else {
          console.error("오류:", error);
          alert("오류: " + error.message);
        }
      } finally {
        isLoading.value = false;
        abortController.value = null;
      }
    };
    
    // 취소 처리
    const cancelAnalysis = () => {
      if (abortController.value) {
        console.log("분석 취소");
        abortController.value.abort();
        abortController.value = null;
        isLoading.value = false;
      }
    };
    
    // 초기화 처리
    const reset = () => {
      console.log("초기화");
      store.commit("image/reset");
      analysisResult.value = null;
      searchResults.value = [];
      actionStatus.value = { message: "", type: "" };
    };
    
    // Elasticsearch에 저장 핸들러
    const saveToElasticsearchHandler = async () => {
      if (!analysisResult.value) {
        showActionStatus("이미지를 먼저 분석해주세요.", "error");
        return;
      }
      
      try {
        showActionStatus("Elasticsearch에 저장 중...", "pending");
        
        // 특성 벡터 생성
        const featuresVector = createFeaturesVector(analysisResult.value);
        
        // 이미지를 Base64로 변환
        const imageBase64 = imagePreview.value;
        
        // 고유 ID 생성
        const imageId = generateUniqueId();
        
        // Elasticsearch에 저장
        await callSaveToElasticsearch(
          imageId,
          imageInfo.value.name || "무제",
          imageInfo.value.location || "미지정",
          imageInfo.value.tags
            ? imageInfo.value.tags.split(",").map((tag) => tag.trim())
            : [],
          imageInfo.value.description || "",
          imageBase64,
          analysisResult.value,
          featuresVector
        );
        
        showActionStatus("이미지가 성공적으로 저장되었습니다!", "success");
      } catch (error) {
        showActionStatus(
          "저장 중 오류가 발생했습니다: " + error.message,
          "error"
        );
        console.error("저장 오류:", error);
      }
    };
    
    // 유사 이미지 검색 핸들러
    const searchSimilarHandler = async () => {
      if (!analysisResult.value) {
        showActionStatus("이미지를 먼저 분석해주세요.", "error");
        return;
      }
      
      try {
        showActionStatus("유사한 이미지 검색 중...", "pending");
        
        // 특성 벡터 생성
        const featuresVector = createFeaturesVector(analysisResult.value);
        
        // Elasticsearch에서 유사 이미지 검색
        const results = await searchSimilarImages(featuresVector, 10);
        searchResults.value = results;
        
        showActionStatus("검색이 완료되었습니다!", "success");
      } catch (error) {
        showActionStatus(
          "검색 중 오류가 발생했습니다: " + error.message,
          "error"
        );
        console.error("검색 오류:", error);
      }
    };
    
    // 상태 메시지 표시 함수
    const showActionStatus = (message, type) => {
      actionStatus.value = { message, type };
      
      // 자동 숨김 (성공 메시지인 경우)
      if (type === "success") {
        setTimeout(() => {
          actionStatus.value = { message: "", type: "" };
        }, 5000);
      }
    };
    
    // 고유 ID 생성 함수
    const generateUniqueId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    
    return {
      imageFile,
      imagePreview,
      imageInfo,
      isLoading,
      analysisResult,
      searchResults,
      statusMessage,
      statusClass,
      onImageSelected,
      onInfoUpdated,
      analyzeCurrentImage,
      cancelAnalysis,
      reset,
      saveToElasticsearchHandler,
      searchSimilarHandler,
      getDimensionHeader
    };
  }
};
</script>

<style lang="scss">
// 기본 레이아웃
.logo-search {
  font-family: "Nunito", "Noto Sans KR", sans-serif;
  min-height: 100vh;
  background-color: var(--gray-100);
}

// 메인 컨테이너 - 전체 패널을 감싸는 컨테이너
.main-container {
  display: flex;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 10px;
  gap: 15px;
}

// 공통 패널 스타일
.upload-panel, .analysis-panel, .results-panel {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 15px;
}

.upload-panel-content, .analysis-panel-content, .results-panel-content {
  padding: 15px;
}

// 왼쪽 패널 - 이미지 업로드
.upload-panel {
  flex: 0 0 300px;
  width: 300px;
  
  h3 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1rem;
    color: var(--gray-800);
  }
}

// 버튼 그룹
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  
  .primary-btn, .secondary-btn, .cancel-btn {
    flex: 1;
    padding: 10px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    border: none;
  }
  
  .primary-btn {
    background-color: var(--logo-blue);
    color: white;
  }
  
  .secondary-btn {
    background-color: var(--gray-300);
    color: var(--gray-700);
  }
  
  .cancel-btn {
    background-color: var(--logo-coral);
    color: white;
  }
}

// 중앙 패널 - 분석 결과
.analysis-panel {
  flex: 0 0 350px;
  width: 350px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: var(--gray-800);
  }
}

// 분석 테이블
.analysis-table-container {
  margin-bottom: 20px;
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
  
  th {
    background-color: var(--logo-blue);
    color: white;
    text-align: left;
    padding: 8px 10px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--gray-200);
    font-size: 0.85rem;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  .dimension-name {
    color: var(--gray-800);
    font-weight: 500;
  }
  
  .dimension-score {
    text-align: center;
    font-weight: 600;
    color: var(--logo-blue);
  }
  
  .bar-container {
    width: 100%;
    height: 12px;
    background-color: var(--gray-200);
    border-radius: 6px;
    overflow: hidden;
  }
  
  .bar {
    height: 100%;
    background-color: var(--logo-blue);
    border-radius: 6px;
  }
}

// 저장 버튼 영역
.save-action {
  margin-top: 15px;
  
  .save-btn {
    width: 100%;
    padding: 10px;
    background-color: var(--logo-green);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: darken(#76b39d, 10%);
    }
  }
  
  .status-message {
    margin-top: 10px;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    
    &.status-success {
      background-color: rgba(118, 179, 157, 0.1);
      border: 1px solid rgba(118, 179, 157, 0.3);
      color: darken(#76b39d, 30%);
    }
    
    &.status-error {
      background-color: rgba(255, 142, 127, 0.1);
      border: 1px solid rgba(255, 142, 127, 0.3);
      color: darken(#ff8e7f, 30%);
    }
  }
}

// 오른쪽 패널 - 검색 결과
.results-panel {
  flex: 1;
  min-height: 500px;
  position: relative;
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: var(--gray-800);
  }
}

// 로딩 오버레이
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

// 검색 결과 그리드
.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
}

// 결과 카드
.result-card {
  background-color: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
}

.result-image-container {
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-info {
  padding: 10px;
  
  .result-title {
    margin: 0 0 5px 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--gray-800);
  }
  
  .result-location {
    margin: 0 0 5px 0;
    font-size: 0.8rem;
    color: var(--gray-600);
  }
  
  .result-score {
    margin: 0;
    font-size: 0.75rem;
    color: var(--logo-blue);
    font-weight: 500;
  }
}

// 검색 안내 메시지
.search-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px 20px;
  height: 100%;
  min-height: 400px;
  
  .guide-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
    color: var(--logo-blue);
    opacity: 0.7;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  .guide-title {
    font-size: 1.5rem;
    color: var(--logo-blue);
    margin: 0 0 15px 0;
    font-weight: 700;
  }
  
  .guide-description {
    max-width: 500px;
    color: var(--gray-600);
    font-size: 1rem;
    margin-bottom: 25px;
    line-height: 1.6;
  }
  
  .guide-steps {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    margin-bottom: 30px;
    
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--logo-blue);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        margin-bottom: 10px;
      }
      
      .step-text {
        color: var(--gray-700);
        font-size: 0.9rem;
        font-weight: 500;
      }
    }
  }
  
  // 분석 버튼
  .analyze-btn {
    padding: 14px 28px;
    background-color: var(--logo-blue);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(72, 176, 228, 0.2);
    
    &:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 6px 10px rgba(72, 176, 228, 0.3);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(72, 176, 228, 0.2);
    }
  }
}

// 반응형 스타일
@media (max-width: 1200px) {
  .main-container {
    flex-wrap: wrap;
  }
  
  .upload-panel {
    flex: 0 0 350px;
    width: 350px;
  }
  
  .analysis-panel {
    flex: 1;
    min-width: 300px;
  }
  
  .results-panel {
    flex: 0 0 100%;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .upload-panel, .analysis-panel {
    flex: none;
    width: 100%;
  }
}
</style>