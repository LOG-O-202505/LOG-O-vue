<template>
  <div class="logo-search">
    <Header />
    
    <div class="main-container">
      <!-- 왼쪽 패널: 이미지 업로드만 -->
      <div class="upload-panel">
        <div class="upload-panel-content">
          <h2 class="main-heading">검색을 하고싶은 소스 이미지를 입력해주세요</h2>
          <div class="form-group">
            <ImageUpload @image-selected="onImageSelected" />
          </div>
          
          <div class="button-group">
            <button 
              v-if="imageFile && !isLoading" 
              @click="analyzeCurrentImage" 
              class="analyze-btn"
            >
              이미지 분석하기
            </button>
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
          
          <LoadingSpinner v-if="isLoading" />
        </div>
      </div>
      
      <!-- 중앙 패널: 분석 결과 + 이미지 정보 입력 -->
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
          
          <!-- 이미지 상세 정보 입력 영역 -->
          <div class="image-details-section">
            <h3>이미지 정보 입력</h3>
            <div class="input-group">
              <label for="image-name">이미지 이름</label>
              <input 
                type="text" 
                id="image-name"
                v-model="imageDetails.name"
                placeholder="이미지 이름을 입력하세요"
                class="text-input"
              >
            </div>
            
            <div class="input-group">
              <label for="image-location">위치 정보</label>
              <LocationSearch @location-selected="onLocationSelected" />
            </div>
            
            <div class="input-group">
              <label for="image-tags">태그</label>
              <input 
                type="text" 
                id="image-tags"
                v-model="imageDetails.tags"
                placeholder="쉼표로 구분된 태그를 입력하세요 (예: 바다,산,휴양지)"
                class="text-input"
              >
            </div>
            
            <div class="input-group">
              <label for="image-description">이미지 설명</label>
              <textarea 
                id="image-description"
                v-model="imageDetails.description"
                placeholder="이미지에 대한 간단한 설명을 입력하세요"
                class="text-area"
              ></textarea>
            </div>
            
            <!-- 저장 버튼 -->
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
      
      <!-- 오른쪽 패널: 추천 여행지 랭킹 -->
      <div class="results-panel" v-if="analysisResult && !isLoading">
        <div class="results-panel-content">
          <h3>유사도 높은 추천 여행지 랭킹</h3>
          
          <div v-if="searchResults.length > 0" class="travel-ranking">
            <div 
              v-for="(result, index) in sortedSearchResults" 
              :key="result._id"
              class="ranking-item"
            >
              <div class="ranking-badge">{{ index + 1 }}</div>
              <div class="ranking-card">
                <div class="ranking-image-container">
                  <img 
                    :src="`data:image/jpeg;base64,${result._source.image_data}`" 
                    :alt="result._source.image_name"
                    class="ranking-image"
                  >
                </div>
                <div class="ranking-info">
                  <h4 class="ranking-title">{{ result._source.image_name }}</h4>
                  <p class="ranking-location">{{ result._source.image_location }}</p>
                  <div class="ranking-score">
                    <span class="score-label">유사도:</span>
                    <span class="score-value">{{ (Math.round(result._score * 100) / 100).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-results-message">
            검색 결과가 없습니다.
          </div>
        </div>
      </div>
      
      <!-- 초기 안내 메시지 (분석 전) -->
      <div class="guide-panel" v-if="!analysisResult && !isLoading">
        <div class="guide-panel-content">
          <div class="search-guide">
            <div class="guide-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 class="guide-title">사진으로 여행지를 검색해보세요!!</h2>
            <p class="guide-description">당신이 원하는 분위기의 여행지를 찾아드립니다.<br>
            사진을 업로드하고 분석 버튼을 클릭하면 유사한 여행지를 추천해드립니다.</p>
            <div class="guide-steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-text">이미지 선택</div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-text">분석 실행</div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-text">여행지 추천 확인</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import Header from "@/components/Header.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import LocationSearch from "@/components/LocationSearch.vue";
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
    LocationSearch,
    LoadingSpinner
  },
  setup() {
    const store = useStore();
    
    // 상태 관리
    const imageFile = computed(() => store.state.image.file);
    const imagePreview = computed(() => store.state.image.preview);
    const isLoading = ref(false);
    const analysisResult = ref(null);
    const searchResults = ref([]);
    const abortController = ref(null);
    const actionStatus = ref({ message: "", type: "" });
    const mapInitialized = ref(false);
    
    // 이미지 정보 관리 - 이제 직접 관리
    const imageDetails = reactive({
      name: '',
      location: '',
      tags: '',
      description: ''
    });
    
    // 검색 결과를 유사도 순으로 정렬
    const sortedSearchResults = computed(() => {
      return [...searchResults.value].sort((a, b) => b._score - a._score);
    });
    
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
    
    // 이미지 선택 시 자동으로 파일명을 이미지 이름으로 설정
    watch(imageFile, (newFile) => {
      if (newFile) {
        const fileName = newFile.name.replace(/\.[^/.]+$/, ""); // 확장자 제거
        imageDetails.name = fileName;
        
        // 기존 분석 결과 초기화 (새 이미지 선택 시)
        analysisResult.value = null;
        searchResults.value = [];
      }
    });
    
    // 이미지 선택 처리
    const onImageSelected = (file) => {
      store.commit("image/setFile", file);
    };
    
    // 위치 선택 처리
    const onLocationSelected = (location) => {
      imageDetails.location = location;
      
      // 위치가 선택되면 지도 업데이트
      if (location && mapInitialized.value) {
        updateMapDisplay(location);
      }
    };
    
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
    
    // 이미지 분석 처리
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
      
      // 이미지 정보 초기화
      imageDetails.name = '';
      imageDetails.location = '';
      imageDetails.tags = '';
      imageDetails.description = '';
    };
    
    // Elasticsearch에 저장 핸들러
    const saveToElasticsearchHandler = async () => {
      if (!analysisResult.value) {
        showActionStatus("이미지를 먼저 분석해주세요.", "error");
        return;
      }
      
      try {
        showActionStatus("사진을 서버에 저장 중...", "pending");
        
        // 특성 벡터 생성
        const featuresVector = createFeaturesVector(analysisResult.value);
        
        // 이미지를 Base64로 변환
        const imageBase64 = imagePreview.value;
        
        // 고유 ID 생성
        const imageId = generateUniqueId();
        
        // Elasticsearch에 저장
        await callSaveToElasticsearch(
          imageId,
          imageDetails.name || "무제",
          imageDetails.location || "미지정",
          imageDetails.tags
            ? imageDetails.tags.split(",").map((tag) => tag.trim())
            : [],
          imageDetails.description || "",
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
    };
    
    // 고유 ID 생성 함수
    const generateUniqueId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    
    return {
      imageFile,
      imagePreview,
      imageDetails,
      isLoading,
      analysisResult,
      searchResults,
      sortedSearchResults,
      statusMessage,
      statusClass,
      onImageSelected,
      onLocationSelected,
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
  padding: 0 15px;
  gap: 15px;
}

// 공통 패널 스타일
.upload-panel, .analysis-panel, .results-panel, .guide-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 15px;
  height: fit-content;
}

.upload-panel-content, .analysis-panel-content, .results-panel-content, .guide-panel-content {
  padding: 20px;
}

// 메인 헤딩 스타일
.main-heading {
  font-family: "Nunito", "Noto Sans KR", sans-serif;
  font-size: 1.4rem;
  color: var(--gray-800);
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
  line-height: 1.3;
}

// 왼쪽 패널 - 이미지 업로드
.upload-panel {
  flex: 0 0 280px;
  width: 280px;
}

// 버튼 그룹
.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
  
  .analyze-btn, .secondary-btn, .cancel-btn {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }
  
  .analyze-btn {
    background-color: var(--logo-blue);
    color: white;
    box-shadow: 0 2px 4px rgba(72, 176, 228, 0.2);
    
    &:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(72, 176, 228, 0.3);
    }
  }
  
  .secondary-btn {
    background-color: var(--gray-300);
    color: var(--gray-700);
    
    &:hover {
      background-color: var(--gray-400);
    }
  }
  
  .cancel-btn {
    background-color: var(--logo-coral);
    color: white;
    
    &:hover {
      background-color: darken(#ff8e7f, 5%);
    }
  }
}

// 중앙 패널 - 분석 결과 및 이미지 정보
.analysis-panel {
  flex: 1;
  min-width: 400px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.2rem;
    color: var(--gray-800);
    font-weight: 700;
  }
}

// 분석 테이블
.analysis-table-container {
  margin-bottom: 20px;
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  th {
    background-color: var(--logo-blue);
    color: white;
    text-align: left;
    padding: 10px 12px;
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--gray-200);
    font-size: 0.9rem;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:nth-child(even) {
    background-color: var(--gray-50);
  }
  
  .dimension-name {
    color: var(--gray-800);
    font-weight: 600;
    width: 35%;
  }
  
  .dimension-score {
    text-align: center;
    font-weight: 700;
    color: var(--logo-blue);
    width: 15%;
  }
  
  .dimension-bar {
    width: 50%;
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

// 이미지 상세 정보 영역
.image-details-section {
  background-color: var(--gray-50);
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  border: 1px solid var(--gray-200);
  
  h3 {
    margin-top: 0;
    font-size: 1.1rem;
  }
  
  .input-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: var(--gray-700);
    font-weight: 600;
  }
  
  .text-input, .text-area {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    font-size: 0.95rem;
    background-color: white;
    transition: border-color 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: var(--logo-blue);
      box-shadow: 0 0 0 2px rgba(72, 176, 228, 0.1);
    }
  }
  
  .text-area {
    min-height: 100px;
    resize: vertical;
  }
}

// 저장 버튼
.save-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--logo-green);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(118, 179, 157, 0.2);
  
  &:hover {
    background-color: darken(#76b39d, 10%);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(118, 179, 157, 0.3);
  }
}

// 상태 메시지
.status-message {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  
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

// 오른쪽 패널 - 랭킹 형식 결과
.results-panel {
  flex: 0 0 350px;
  width: 350px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.2rem;
    color: var(--gray-800);
    font-weight: 700;
    text-align: center;
  }
}

// 검색 결과 없음 메시지
.no-results-message {
  text-align: center;
  padding: 40px 20px;
  background-color: var(--gray-100);
  border-radius: 6px;
  color: var(--gray-600);
  font-style: italic;
}

// 여행지 랭킹 스타일
.travel-ranking {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ranking-item {
  position: relative;
  padding-left: 30px;
}

.ranking-badge {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background-color: var(--logo-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  
  // 상위 3개 랭킹 강조
  &:nth-child(1), &:nth-child(2), &:nth-child(3) {
    background: linear-gradient(to right, var(--logo-yellow), var(--logo-coral));
  }
}

.ranking-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
}

.ranking-image-container {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.ranking-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ranking-info {
  padding: 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ranking-title {
  margin: 0 0 5px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray-800);
  line-height: 1.2;
}

.ranking-location {
  margin: 0 0 5px 0;
  font-size: 0.8rem;
  color: var(--gray-600);
  line-height: 1.3;
}

.ranking-score {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .score-label {
    font-size: 0.75rem;
    color: var(--gray-500);
  }
  
  .score-value {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--logo-blue);
  }
}

// 가이드 패널 (초기 안내 메시지)
.guide-panel {
  flex: 1;
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
    font-size: 1.6rem;
    color: var(--logo-blue);
    margin: 0 0 15px 0;
    font-weight: 700;
  }
  
  .guide-description {
    max-width: 500px;
    color: var(--gray-600);
    font-size: 1.05rem;
    margin-bottom: 25px;
    line-height: 1.6;
  }
  
  .guide-steps {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    
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
        font-size: 0.95rem;
        font-weight: 600;
      }
    }
  }
}

// 반응형 스타일
@media (max-width: 1200px) {
  .main-container {
    flex-wrap: wrap;
  }
  
  .upload-panel {
    flex: 0 0 280px;
    width: 280px;
  }
  
  .analysis-panel {
    flex: 1;
    min-width: 400px;
  }
  
  .results-panel, .guide-panel {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 900px) {
  .main-container {
    flex-direction: column;
  }
  
  .upload-panel, .analysis-panel, .results-panel, .guide-panel {
    flex: none;
    width: 100%;
  }
}
</style>