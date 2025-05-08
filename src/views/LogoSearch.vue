<template>
  <div class="logo-search">
    <!-- 헤더 - 페이지와 함께 스크롤됨 -->
    <Header />
    
    <!-- 히어로 섹션 -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">여행 이미지 분석</h1>
        <p class="hero-subtitle">찾고 있는 분위기의 여행지를 발견하세요</p>
      </div>
    </div>
    
    <!-- 컨텐츠 영역 - 히어로 섹션과 겹치지 않게 여백 추가 -->
    <div class="content-wrapper">
      <!-- 상단 두 컬럼 레이아웃: 이미지 업로드 | 분석 차트 -->
      <div class="top-section">
        <!-- 왼쪽: 이미지 업로드 패널 -->
        <div class="upload-panel">
          <div class="panel-header">
            <h3 class="panel-title">검색을 위한 이미지</h3>
          </div>
          
          <div class="panel-content">
            <!-- 이미지 미리보기 또는 업로드 안내 -->
            <div class="image-container">
              <img v-if="imagePreview" :src="imagePreview" alt="이미지 미리보기" class="preview-image">
              <div v-else class="upload-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>이미지를 선택하면 여기에 표시됩니다</p>
              </div>
            </div>
            
            <!-- 버튼 영역 -->
            <div class="button-group">
              <button @click="triggerFileInput" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                이미지 선택하기
              </button>
              
              <button v-if="imageFile && !isLoading" @click="analyzeCurrentImage" class="btn btn-analyze">
                이미지 분석하기
              </button>
              
              <button v-if="imageFile && !isLoading" @click="reset" class="btn btn-secondary">
                초기화
              </button>
            </div>
            
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept="image/*"
              class="hidden-input"
            >
          </div>
        </div>
        
        <!-- 오른쪽: 분석 차트 패널 -->
        <div class="analysis-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              {{ isLoading ? '이미지 분석 중...' : (analysisResult ? '이미지 분석 결과' : '분석 데이터') }}
            </h3>
          </div>
          
          <div class="panel-content">
            <!-- 로딩 중일 때 -->
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p class="loading-text">이미지를 분석 중입니다<span>.</span><span>.</span><span>.</span></p>
            </div>
            
            <!-- 분석 결과가 없을 때 -->
            <div v-else-if="!analysisResult" class="guide-state">
              <div class="guide-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              
              <p class="guide-description">
                원하는 분위기의 이미지를 업로드하면 AI가 분석하여 유사한 여행지를 추천해드립니다
              </p>
              
              <div class="steps-container">
                <div class="step"><span>1</span> 이미지 선택</div>
                <div class="step"><span>2</span> 분석 실행</div>
                <div class="step"><span>3</span> 여행지 추천 확인</div>
              </div>
            </div>
            
            <!-- 분석 결과 표 -->
            <div v-else class="analysis-table-container">
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
          </div>
        </div>
      </div>
      
      <!-- 중간 섹션: 분석 결과 (전체 너비) -->
      <div v-if="analysisResult && !isLoading" class="middle-section">
        <div class="results-panel">
          <div class="panel-header">
            <h3 class="panel-title">유사한 여행지 추천</h3>
          </div>
          
          <div class="panel-content">
            <div v-if="searchResults.length === 0" class="no-results">
              <p>검색 결과가 없습니다</p>
              <p class="hint">다른 이미지로 다시 시도해보세요</p>
            </div>
            
            <div v-else class="results-grid">
              <div 
                v-for="(result, index) in sortedSearchResults" 
                :key="result._id"
                class="result-card"
              >
                <div class="result-rank">{{ index + 1 }}</div>
                <div class="result-image-container">
                  <img :src="`data:image/jpeg;base64,${result._source.image_data}`" :alt="result._source.image_name" class="result-image">
                </div>
                <div class="result-info">
                  <h4 class="result-name">{{ result._source.image_name }}</h4>
                  <div class="result-location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ result._source.image_location }}
                  </div>
                  <div class="result-similarity">
                    <span>유사도:</span>
                    <div class="similarity-bar">
                      <div class="similarity-fill" :style="{ width: `${Math.round(result._score * 100) / 100 * 100}%` }"></div>
                    </div>
                    <span class="similarity-value">{{ (Math.round(result._score * 100) / 100).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 하단 섹션: 이미지 정보 입력 (전체 너비) -->
      <div v-if="analysisResult && !isLoading" class="bottom-section">
        <div class="details-panel">
          <div class="panel-header">
            <h3 class="panel-title">이미지 정보 입력</h3>
          </div>
          
          <div class="panel-content">
            <div class="details-form">
              <div class="form-grid">
                <div class="form-group">
                  <label for="image-name">이미지 이름</label>
                  <input 
                    type="text" 
                    id="image-name"
                    v-model="imageDetails.name"
                    placeholder="이미지 이름을 입력하세요"
                  >
                </div>
                
                <div class="form-group">
                  <label for="image-location">위치 정보</label>
                  <LocationSearch @location-selected="onLocationSelected" />
                </div>
                
                <div class="form-group">
                  <label for="image-tags">태그</label>
                  <input 
                    type="text" 
                    id="image-tags"
                    v-model="imageDetails.tags"
                    placeholder="쉼표로 구분된 태그를 입력하세요 (예: 바다,산,휴양지)"
                  >
                </div>
                
                <div class="form-group">
                  <label for="image-description">이미지 설명</label>
                  <textarea 
                    id="image-description"
                    v-model="imageDetails.description"
                    placeholder="이미지에 대한 간단한 설명을 입력하세요"
                  ></textarea>
                </div>
              </div>
              
              <div class="form-actions">
                <button 
                  @click="saveToElasticsearchHandler" 
                  class="btn btn-save"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
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
        </div>
      </div>
    </div>
    
    <!-- 푸터 -->
    <footer class="footer">
      <p>© 2025 LOG:O - 당신의 여행을 기록하다</p>
    </footer>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import Header from "@/components/Header.vue";
import LocationSearch from "@/components/LocationSearch.vue";
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
    LocationSearch
  },
  
  setup() {
    const store = useStore();
    const fileInput = ref(null);
    
    // 상태 관리
    const imageFile = computed(() => store.state.image.file);
    const imagePreview = computed(() => store.state.image.preview);
    const isLoading = ref(false);
    const analysisResult = ref(null);
    const searchResults = ref([]);
    const abortController = ref(null);
    const actionStatus = ref({ message: "", type: "" });
    const mapInitialized = ref(false);
    
    // 이미지 정보 관리
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
    
    // 파일 선택 창 열기
    const triggerFileInput = () => {
      fileInput.value.click();
    };
    
    // 파일 선택 처리
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        store.commit("image/setFile", file);
      }
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
      fileInput,
      triggerFileInput,
      handleFileChange,
      onLocationSelected,
      analyzeCurrentImage,
      reset,
      saveToElasticsearchHandler,
      searchSimilarHandler,
      getDimensionHeader
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.logo-search {
  font-family: 'Noto Sans KR', sans-serif;
  min-height: 100vh;
  background-color: #121212;
  color: white;
  display: flex;
  flex-direction: column;
}

/* 히어로 섹션 */
.hero-section {
  position: relative;
  height: 320px;
  background-image: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470');
  background-size: cover;
  background-position: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7));
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.hero-subtitle {
  font-size: 1.3rem;
  font-weight: 300;
  margin: 0;
  opacity: 0.9;
}

/* 컨텐츠 영역 */
.content-wrapper {
  position: relative;
  padding: 2rem 0.5rem 3rem; /* 좌우 패딩을 1rem에서 0.5rem으로 줄임 */
  z-index: 2;
  max-width: 1600px; /* 최대 너비를 1400px에서 1600px로 증가 */
  margin: 0 auto;
  width: 95%; /* 화면 너비의 95%를 사용하도록 설정 */
}

/* 상단 두 컬럼 레이아웃 */
.top-section {
  display: grid;
  grid-template-columns: 400px 1fr; /* 왼쪽 컬럼 고정, 오른쪽 컬럼 확장 */
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* 중간 및 하단 섹션 */
.middle-section,
.bottom-section {
  margin-bottom: 1.5rem;
}

/* 패널 공통 스타일 */
.upload-panel, 
.analysis-panel, 
.results-panel, 
.details-panel {
  background-color: #1c1c1c;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1rem 1.5rem;
  background-color: #1c1c1c;
  border-bottom: 1px solid #2d3748;
}

.panel-title {
  font-family: 'Playfair Display', 'Noto Sans KR', serif;
  font-size: 1.3rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
  color: white;
  letter-spacing: 0.5px;
}

.panel-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 이미지 업로드 패널 */
.image-container {
  background-color: #2d3748;
  border-radius: 8px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 1px dashed #4a5568;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #a0aec0;
  padding: 2rem;
  text-align: center;
}

.upload-placeholder svg {
  margin-bottom: 1rem;
  color: #4299e1;
}

.upload-placeholder p {
  margin: 0;
  font-size: 0.9rem;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 버튼 스타일 */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn svg {
  flex-shrink: 0;
}

.btn-primary {
  background-color: #4299e1;
  color: white;
}

.btn-primary:hover {
  background-color: #3182ce;
  transform: translateY(-2px);
}

.btn-analyze {
  background-color: #38a169;
  color: white;
}

.btn-analyze:hover {
  background-color: #2f855a;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid #a0aec0;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background-color: rgba(160, 174, 192, 0.1);
}

.btn-save {
  background-color: #38a169;
  color: white;
  margin-bottom: 1rem;
}

.btn-save:hover {
  background-color: #2f855a;
  transform: translateY(-2px);
}

.hidden-input {
  display: none;
}

/* 분석 패널 - 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  min-height: 250px; /* 최소 높이 설정 */
}

.loading-spinner {
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

/* 가이드 상태 */
.guide-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  min-height: 250px;
}

.guide-icon {
  color: #4299e1;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.guide-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #e2e8f0;
  margin: 0 0 1.5rem 0;
  max-width: 400px;
}

.steps-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.step {
  display: flex;
  align-items: center;
  color: #a0aec0;
  font-size: 0.9rem;
}

.step span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border-radius: 50%;
  margin-right: 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
}

/* 분석 결과 표 */
.analysis-table-container {
  overflow: auto;
  border-radius: 8px;
  height: 100%;
  min-height: 250px;
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
}

.analysis-table th {
  background-color: #2d3748;
  color: white;
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.analysis-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #2d3748;
}

.analysis-table tr:last-child td {
  border-bottom: none;
}

.dimension-name {
  color: #e2e8f0;
  font-weight: 500;
}

.dimension-score {
  color: #4299e1;
  font-weight: 600;
  text-align: center;
}

.dimension-bar {
  width: 50%;
}

.bar-container {
  height: 10px;
  background-color: #2d3748;
  border-radius: 5px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #76b39d);
  border-radius: 5px;
  transition: width 1s ease;
}

/* 결과 그리드 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem;
}

.result-card {
  position: relative;
  background-color: #2d3748;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.result-rank {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.result-card:nth-child(1) .result-rank {
  background: linear-gradient(135deg, #f6e05e, #d69e2e);
}

.result-card:nth-child(2) .result-rank {
  background: linear-gradient(135deg, #e2e8f0, #a0aec0);
}

.result-card:nth-child(3) .result-rank {
  background: linear-gradient(135deg, #ed8936, #c05621);
}

.result-image-container {
  height: 180px;
  width: 100%;
  overflow: hidden;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.result-card:hover .result-image {
  transform: scale(1.1);
}

.result-info {
  padding: 1rem;
}

.result-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: white;
}

.result-location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #a0aec0;
  margin-bottom: 0.75rem;
}

.result-location svg {
  color: #4299e1;
  flex-shrink: 0;
}

.result-similarity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #a0aec0;
}

.similarity-bar {
  flex-grow: 1;
  height: 6px;
  background-color: #4a5568;
  border-radius: 3px;
  overflow: hidden;
}

.similarity-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #76b39d);
  border-radius: 3px;
  transition: width 1s ease;
}

.similarity-value {
  color: #e2e8f0;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
}

/* 이미지 정보 입력 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #e2e8f0;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background-color: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 4px;
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
  outline: none;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  grid-column: span 2;
}

.status-message {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 1rem;
  display: inline-block;
}

.status-success {
  background-color: rgba(56, 161, 105, 0.2);
  border: 1px solid rgba(56, 161, 105, 0.3);
  color: #9ae6b4;
}

.status-error {
  background-color: rgba(229, 62, 62, 0.2);
  border: 1px solid rgba(229, 62, 62, 0.3);
  color: #feb2b2;
}

/* 푸터 */
.footer {
  margin-top: auto;
  background-color: #121212;
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #2d3748;
}

.footer p {
  font-size: 0.9rem;
  color: #a0aec0;
  margin: 0;
}

/* 반응형 스타일 */
@media (max-width: 900px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    grid-column: span 1;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 600px) {
  .hero-section {
    height: 250px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .content-wrapper {
    padding: 1.5rem 1rem;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>