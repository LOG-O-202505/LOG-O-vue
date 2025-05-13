<template>
  <div class="logo-search">
    <!-- 헤더 - 페이지와 함께 스크롤됨 -->
    <Header 
      :showHero="true"
      heroImageSrc="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1470"
      heroTitle="여행 이미지 분석"
      heroSubtitle="찾고 있는 분위기의 여행지를 발견하세요"
      heroHeight="320px"
    />
    
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
              <button 
                v-if="isLoading"
                @click="cancelAnalysis" 
                class="btn btn-danger btn-cancel-analysis"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                분석 취소하기
              </button>
              
              <button 
                v-if="!analysisResult && !isLoading" 
                @click="triggerFileInput" 
                class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                이미지 선택하기
              </button>
              
              <button 
                v-if="imageFile && !analysisResult && !isLoading" 
                @click="analyzeCurrentImage" 
                class="btn btn-analyze">
                이미지 분석하기
              </button>
              
              <button 
                v-if="(imageFile || analysisResult) && !isLoading" 
                @click="reset" 
                class="btn btn-secondary">
                초기화
              </button>
              
              <!-- 분석 시간 정보 추가 -->
              <div v-if="analysisResult && !isLoading" class="analysis-timing">
                <div class="timing-item">
                  <span class="timing-label">이미지 분석 시간:</span>
                  <span class="timing-value">{{ analysisDuration }}초</span>
                </div>
                <div class="timing-item">
                  <span class="timing-label">이미지 검색 시간:</span>
                  <span class="timing-value">{{ searchDuration }}초</span>
                </div>
              </div>
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
          
          <div class="panel-content" :class="{ 'no-padding': isLoading }">
            <!-- 로딩 중일 때 - 업데이트된 LoadingSpinner 사용 -->
            <div v-if="isLoading" class="loading-state">
              <LoadingSpinner 
                :current-phase="loadingPhase" 
                :analysis-duration="analysisDuration" 
                :search-duration="searchDuration" 
              />
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
                  <tr v-for="(score, dimension) in dimensionResults" :key="dimension">
                    <td class="dimension-name">{{ getDimensionHeader(dimension) }}</td>
                    <td class="dimension-score">{{ typeof score === 'number' ? score.toFixed(1) : score }}</td>
                    <td class="dimension-bar">
                      <div class="bar-container">
                        <div class="bar" :style="{ width: `${typeof score === 'number' ? score * 100 : 0}%` }"></div>
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
                  <!-- 이미지 설명 추가 -->
                  <div v-if="result._source.image_description" class="result-description">
                    <div class="description-title">설명:</div>
                    <p class="description-text">{{ result._source.image_description }}</p>
                  </div>
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
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import Header from "@/components/Header.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { 
  searchSimilarImages,
  createFeaturesVector,
  fileToBase64
} from "@/services/api";

export default {
  name: "LogoSearch",
  
  components: {
    Header,
    LoadingSpinner
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
    
    // 추가된 API 단계 및 타이밍 상태
    const loadingPhase = ref('analysis');
    const analysisDuration = ref(null);
    const searchDuration = ref(null);

    // 분석 결과에서 차원 데이터만 필터링
    const dimensionResults = computed(() => {
      if (!analysisResult.value) return null;
      
      const dimensionKeys = [
        "Natural Elements",
        "Urban Character",
        "Water Features",
        "Seasonal Appeal",
        "Relaxation Potential",
        "Romantic Atmosphere",
        "Activity Opportunities",
        "Historical/Cultural Value",
        "Food Experience",
        "Shopping Potential"
      ];
      
      // 차원 데이터만 추출
      const result = {};
      dimensionKeys.forEach(key => {
        if (key in analysisResult.value) {
          result[key] = analysisResult.value[key];
        }
      });
      
      return result;
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
    });
    
    // 이미지 선택 시 자동으로 파일명을 이미지 이름으로 설정
    watch(imageFile, (newFile) => {
      if (newFile) {
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
    
    // 이미지 분석 처리 - 업데이트됨
    const analyzeCurrentImage = async () => {
      if (!imageFile.value) {
        alert("먼저 이미지를 선택해주세요.");
        return;
      }
      
      try {
        // 상태 초기화 및 로딩 시작
        isLoading.value = true;
        loadingPhase.value = 'analysis';
        analysisDuration.value = null;
        searchDuration.value = null;
        
        // AbortController 설정
        abortController.value = new AbortController();
        
        console.log("이미지 분석 시작:", imageFile.value.name);
        
        // ImgSearch.vue에서 가져온 분석 로직 적용
        try {
          const analysisStartTime = performance.now();
          
          // 이미지 압축 및 Base64 변환
          const base64Image = await fileToBase64(imageFile.value);
          console.log("이미지 압축 완료, Base64 길이:", base64Image.length);
          
          // 1단계: 영문 설명 생성
          console.log("이미지 설명 생성 API 호출 시작...");
          
          // Ollama API 형식으로 요청 구성
          const descriptionRequestBody = {
            model: 'light_2', // config.MODEL_NAME에서 가져오거나 적절한 모델 사용
            prompt: 'Describe this travel destination in detail according to your instructions.',
            images: [base64Image.split(',')[1]], // Base64 이미지 데이터만 추출
            stream: false // 스트리밍 비활성화
          };
          
          const descriptionResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(descriptionRequestBody),
            signal: abortController.value.signal
          });
          
          if (!descriptionResponse.ok) {
            console.error("API 응답 상태:", descriptionResponse.status, descriptionResponse.statusText);
            throw new Error(`이미지 설명 API 응답 오류: ${descriptionResponse.status}`);
          }
          
          const descriptionData = await descriptionResponse.json();
          console.log("이미지 설명 API 응답:", descriptionData);
          
          // 이미지 설명 추출
          const imageDescription = descriptionData.response || "이미지 설명을 얻을 수 없습니다.";
          console.log("이미지 설명 생성 완료:", imageDescription);
          
          // 2단계: 10차원 분석
          console.log("10차원 분석 API 호출 시작...");
          
          const analysisRequestBody = {
            model: 'ko_2', // config.MODEL_NAME에서 가져오거나 적절한 모델 사용
            prompt: imageDescription, // 이전 단계에서 얻은 설명을 프롬프트로 사용
            stream: false
          };
          
          const analysisResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(analysisRequestBody),
            signal: abortController.value.signal
          });
          
          if (!analysisResponse.ok) {
            console.error("API 응답 상태:", analysisResponse.status, analysisResponse.statusText);
            throw new Error(`10차원 분석 API 응답 오류: ${analysisResponse.status}`);
          }
          
          const analysisData = await analysisResponse.json();
          console.log("10차원 분석 API 응답:", analysisData);
          
          // 10차원 분석 결과 파싱
          let result = {};
          
          if (analysisData && analysisData.response) {
            try {
              // 1. JSON 형식의 문자열인 경우 파싱 시도
              if (analysisData.response.trim().startsWith('{')) {
                result = JSON.parse(analysisData.response);
                console.log("10차원 분석 파싱 결과 (JSON):", result);
              } else {
                // 2. 각 줄이 "키": 값 형태로 되어 있는 경우 정규식으로 파싱
                const dimensions = {};
                const lines = analysisData.response.split('\n');
                
                for (const line of lines) {
                  // "Natural Elements": 0.9 형태의 라인 파싱
                  const match = line.match(/"([^"]+)":\s*([0-9.]+)/);
                  if (match) {
                    const key = match[1];
                    const value = parseFloat(match[2]);
                    dimensions[key] = value;
                  }
                }
                
                // 추출된 차원이 있는지 확인
                if (Object.keys(dimensions).length > 0) {
                  console.log("10차원 분석 파싱 결과 (라인 파싱):", dimensions);
                  result = dimensions;
                } else {
                  // 3. 파싱 실패 시 테스트 데이터 제공
                  console.warn("응답 파싱 실패, 테스트 데이터 사용");
                  result = {
                    "Natural Elements": 0.7,
                    "Urban Character": 0.3,
                    "Water Features": 0.5,
                    "Seasonal Appeal": 0.8,
                    "Relaxation Potential": 0.7,
                    "Romantic Atmosphere": 0.6,
                    "Activity Opportunities": 0.4,
                    "Historical/Cultural Value": 0.5,
                    "Food Experience": 0.3,
                    "Shopping Potential": 0.2
                  };
                }
              }
            } catch (jsonError) {
              console.error("10차원 분석 파싱 오류:", jsonError, "원본 내용:", analysisData.response);
              // 파싱 실패 시 테스트 데이터 사용
              result = {
                "Natural Elements": 0.7,
                "Urban Character": 0.3,
                "Water Features": 0.5,
                "Seasonal Appeal": 0.8,
                "Relaxation Potential": 0.7,
                "Romantic Atmosphere": 0.6,
                "Activity Opportunities": 0.4,
                "Historical/Cultural Value": 0.5,
                "Food Experience": 0.3,
                "Shopping Potential": 0.2
              };
            }
          } else {
            console.warn("API에서 유효한 응답을 받지 못했습니다. 테스트 데이터 사용");
            result = {
              "Natural Elements": 0.7,
              "Urban Character": 0.3,
              "Water Features": 0.5,
              "Seasonal Appeal": 0.8,
              "Relaxation Potential": 0.7,
              "Romantic Atmosphere": 0.6,
              "Activity Opportunities": 0.4,
              "Historical/Cultural Value": 0.5,
              "Food Experience": 0.3,
              "Shopping Potential": 0.2
            };
          }
          
          // 추가 메타데이터 설정 (원래 LogoSearch에서 필요한 것들)
          result.imageDescription = imageDescription;
          
          // 분석 시간 계산
          const analysisEndTime = performance.now();
          analysisDuration.value = ((analysisEndTime - analysisStartTime) / 1000).toFixed(1);
          
          // 결과 저장
          analysisResult.value = result;
          console.log("최종 분석 결과:", result);
          
          // 검색 단계로 전환
          loadingPhase.value = 'search';
          
          // 분석이 완료되면 자동으로 유사 이미지 검색 실행
          const searchStartTime = performance.now();
          await searchSimilarHandler();
          const searchEndTime = performance.now();
          searchDuration.value = ((searchEndTime - searchStartTime) / 1000).toFixed(1);
          
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
            
            // 테스트 데이터용 시간 설정
            analysisDuration.value = '0.5'; // 가상 시간
            
            alert("API 연결 오류로 테스트 데이터를 사용합니다. 실제 서버 상태를 확인하세요.");
            
            // 검색 단계로 전환
            loadingPhase.value = 'search';
            
            // 테스트 데이터로도 유사 이미지 검색 실행
            const searchStartTime = performance.now();
            await searchSimilarHandler();
            const searchEndTime = performance.now();
            searchDuration.value = ((searchEndTime - searchStartTime) / 1000).toFixed(1);
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
        loadingPhase.value = 'completed';
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
    
    // cancelAnalysis 함수 추가
    const cancelAnalysis = () => {
      if (abortController.value) {
        abortController.value.abort();
        // analyzeCurrentImage 함수의 catch(error) 블록에서 AbortError를 처리하고
        // finally 블록에서 isLoading = false 및 abortController.value = null 등을 수행합니다.
      }
      reset(); // 상태를 초기화합니다.
    };
    
    return {
      imageFile,
      imagePreview,
      isLoading,
      analysisResult,
      searchResults,
      sortedSearchResults,
      statusMessage,
      statusClass,
      fileInput,
      loadingPhase,
      analysisDuration,
      searchDuration,
      triggerFileInput,
      handleFileChange,
      analyzeCurrentImage,
      reset,
      getDimensionHeader,
      dimensionResults,
      cancelAnalysis
    };
  }
};
</script>

<style scoped>
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
  background-color: #f8f9fa; /* 밝은 헤더 배경색 */
  color: #333; /* 어두운 헤더 글자색 */
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6; /* 헤더 하단 구분선 */
}

.analysis-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef; /* 밝은 셀 구분선 */
  vertical-align: middle;
  color: #495057; /* 셀 글자색 */
}

.analysis-table tr:last-child td {
  border-bottom: none;
}

.dimension-name {
  font-weight: 500;
  width: 20%;
}

.dimension-score {
  color: #0d6efd; /* 파란색 계열 유지 또는 변경 */
  font-weight: 600;
  text-align: center;
  width: 10%;
}

.dimension-bar {
  padding-right: 1rem;
  width: 70%;
  background-color: transparent;
}

.bar-container {
  height: 16px;
  background-color: #e9ecef; /* 밝은 막대 배경색 */
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #0d6efd, #6ebcff);
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  transition: width 1s ease;
}

/* 취소 버튼 스타일 추가 */
.btn-cancel-analysis {
  margin-top: 1.5rem;
  background-color: #dc3545; /* 부트스트랩 danger 색상 */
  color: white;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}

.btn-cancel-analysis:hover {
  background-color: #c82333; /* 더 어두운 danger 색상 */
  transform: translateY(-1px);
}

.btn-cancel-analysis svg {
  margin-right: 0.4rem;
}

/* --- src/styles/LogoSearch.css 내용 시작 --- */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.logo-search {
  font-family: 'Noto Sans KR', sans-serif;
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  display: flex;
  flex-direction: column;
}

/* 컨텐츠 영역 */
.content-wrapper {
  position: relative;
  padding: 2rem 0.5rem 3rem;
  z-index: 2;
  max-width: 1600px;
  margin: 0 auto;
  width: 95%;
}

/* 상단 두 컬럼 레이아웃 */
.top-section {
  display: grid;
  grid-template-columns: 400px 1fr;
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
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
}

.panel-title {
  font-family: 'Playfair Display', 'Noto Sans KR', serif;
  font-size: 1.3rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
  color: #2d3748;
  letter-spacing: 0.5px;
}

.panel-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 패널 콘텐츠 패딩 제거 (로딩 중일 때) */
.panel-content.no-padding {
  padding: 0;
}

/* 이미지 업로드 패널 */
.image-container {
  background-color: #e9ecef;
  border-radius: 8px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 2px dashed #ced4da;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
  padding: 2rem;
  text-align: center;
}

.upload-placeholder svg {
  margin-bottom: 1rem;
  color: #0d6efd;
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
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  transform: translateY(-2px);
}

.btn-analyze {
  background-color: #198754;
  color: white;
}

.btn-analyze:hover {
  background-color: #157347;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid #ced4da;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.btn-save {
  background-color: #198754;
  color: white;
  margin-bottom: 1rem;
}

.btn-save:hover {
  background-color: #157347;
  transform: translateY(-2px);
}

.hidden-input {
  display: none;
}

/* 분석 패널 - 로딩 상태 (수정됨) */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 0;
  min-height: 300px;
  background-color: transparent;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(13, 110, 253, 0.3);
  border-radius: 50%;
  border-top-color: #0d6efd;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1.5rem;
}

/* 분석 시간 정보 스타일 */
.analysis-timing {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.timing-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.timing-item:last-child {
  margin-bottom: 0;
}

.timing-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.timing-value {
  font-weight: 600;
  color: #0d6efd;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1rem;
  color: #6c757d;
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
  color: #0d6efd;
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
  color: #6c757d;
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
  color: #6c757d;
  font-size: 0.9rem;
}

.step span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #0d6efd, #0a58ca);
  color: white;
  border-radius: 50%;
  margin-right: 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
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
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.result-rank {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #0d6efd, #0a58ca);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.result-card:nth-child(1) .result-rank {
  background: linear-gradient(135deg, #ffca2c, #ffab00);
}

.result-card:nth-child(2) .result-rank {
  background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
}

.result-card:nth-child(3) .result-rank {
  background: linear-gradient(135deg, #d98936, #b0732f);
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
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.result-location svg {
  flex-shrink: 0;
  color: #6c757d;
}

.result-similarity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.similarity-bar {
  flex-grow: 1;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.similarity-fill {
  height: 100%;
  background: linear-gradient(90deg, #0d6efd, #4dabf7);
  border-radius: 3px;
  transition: width 1s ease;
}

.similarity-value {
  color: #333;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
}

/* 이미지 정보 입력 */
.form-grid {
  display: none;
}

.form-group {
  display: none;
}

.form-actions {
  display: none;
}

.status-message {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 1rem;
  display: inline-block;
}

.status-success {
  background-color: #d1e7dd;
  border: 1px solid #badbcc;
  color: #0f5132;
}

.status-error {
  background-color: #f8d7da;
  border: 1px solid #f5c2c7;
  color: #842029;
}

/* 푸터 */
.footer {
  margin-top: auto;
  background-color: #e9ecef;
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #dee2e6;
}

.footer p {
  font-size: 0.9rem;
  color: #333;
  margin: 0;
}

.dimension-name {
  color: #495057;
  font-weight: 500;
  width: 20%;
}

.dimension-score {
  color: #0d6efd;
  font-weight: 600;
  text-align: center;
  width: 10%;
}

.dimension-bar {
  padding-right: 1rem;
  width: 70%;
  background-color: transparent;
}

.bar-container {
  height: 16px;
  background-color: #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #0d6efd, #6ebcff);
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  transition: width 1s ease;
}

/* 반응형 스타일 */
@media (max-width: 900px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
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
  .content-wrapper {
    padding: 1.5rem 1rem;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}

/* 결과 카드의 이미지 설명 스타일 */
.result-description {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e9ecef;
}

.description-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.description-text {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
  max-height: 4.2em; /* 3줄로 제한 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
/* --- src/styles/LogoSearch.css 내용 끝 --- */
</style>