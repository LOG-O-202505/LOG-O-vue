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
                  <LocationSearch @location-selected="onLocationSelected" ref="locationSearchRef" />
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
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { 
  analyzeImage as callAnalyzeImage, 
  saveToElasticsearch as callSaveToElasticsearch,
  searchSimilarImages,
  createFeaturesVector
} from "@/services/api";

export default {
  name: "LogoSearch",
  
  components: {
    Header,
    LocationSearch,
    LoadingSpinner
  },
  
  setup() {
    const store = useStore();
    const fileInput = ref(null);
    
    // LocationSearch 컴포넌트 참조
    const locationSearchRef = ref(null);
    
    // 상태 관리
    const imageFile = computed(() => store.state.image.file);
    const imagePreview = computed(() => store.state.image.preview);
    const isLoading = ref(false);
    const analysisResult = ref(null);
    const searchResults = ref([]);
    const abortController = ref(null);
    const actionStatus = ref({ message: "", type: "" });
    const mapInitialized = ref(false);
    
    // 추가된 API 단계 및 타이밍 상태
    const loadingPhase = ref('analysis');
    const analysisDuration = ref(null);
    const searchDuration = ref(null);
    
    // 이미지 정보 관리
    const imageDetails = reactive({
      name: '',
      location: '', // 사용자에게 보이는 주소 문자열
      locationData: null, // 지역 정보 데이터 (province_code, city_code 등)
      tags: '',
      description: ''
    });
    
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
    const onLocationSelected = (locationData) => {
      console.log('=== onLocationSelected 호출 ===');
      console.log('locationData 전체:', locationData);
      
      if (!locationData) {
        // 위치 초기화된 경우
        console.log('위치 초기화됨');
        imageDetails.location = '';
        imageDetails.locationData = null;
        return;
      }
      
      // 새로운 형식: { formatted_address, region_info }
      imageDetails.location = locationData.formatted_address;
      imageDetails.locationData = locationData.region_info;
      
      console.log("위치 정보 선택됨:", imageDetails.location);
      console.log("지역 정보:", JSON.stringify(imageDetails.locationData, null, 2));
      
      // 위치가 수동으로 선택된 경우에만 지도 업데이트
      // 분석 결과에서 자동으로 설정된 경우에는 이미 updateMapFromGeoLocation에서 처리됨
      if (locationData.manuallySelected && locationData.formatted_address && mapInitialized.value) {
        if (locationSearchRef.value && locationSearchRef.value.displayMapFromAddress) {
          locationSearchRef.value.displayMapFromAddress(locationData.formatted_address);
        }
      }
    };
    
    // 위치 정보에서 지도 업데이트 함수 개선
    const updateMapFromGeoLocation = (geoLocation) => {
      if (!geoLocation || !geoLocation.coordinates || !mapInitialized.value) {
        console.warn("지도 업데이트를 위한 위치 정보가 없거나 지도가 초기화되지 않았습니다");
        return;
      }
      
      // 약간의 지연을 두어 컴포넌트가 렌더링될 시간을 확보
      setTimeout(() => {
        // 컴포넌트 메서드를 직접 호출하여 지도 설정
        if (locationSearchRef.value && locationSearchRef.value.setMapFromCoordinates) {
          locationSearchRef.value.setMapFromCoordinates(
            geoLocation.coordinates.latitude,
            geoLocation.coordinates.longitude
          );
          console.log("위치 정보 기반 지도 업데이트 성공");
        } else {
          console.warn("LocationSearch 컴포넌트를 찾을 수 없거나 setMapFromCoordinates 메서드가 없습니다");
        }
      }, 500);
    };
    
    // 분석 결과를 기반으로 태그 제안
    const generateSuggestedTags = () => {
      if (!analysisResult.value) return;
      
      // 태그가 이미 설정되어 있으면 건너뜀
      if (imageDetails.tags) return;
      
      const result = analysisResult.value;
      const tags = [];
      
      // 자연 요소가 높은 경우
      if (result["Natural Elements"] > 0.6) {
        tags.push("자연", "풍경");
      }
      
      // 도시 특성이 높은 경우
      if (result["Urban Character"] > 0.6) {
        tags.push("도시", "건축물");
      }
      
      // 수경 요소가 높은 경우
      if (result["Water Features"] > 0.6) {
        tags.push("물", "바다", "강");
      }
      
      // 계절적 매력이 높은 경우
      if (result["Seasonal Appeal"] > 0.6) {
        // 현재 계절 파악
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) tags.push("봄");
        else if (month >= 6 && month <= 8) tags.push("여름");
        else if (month >= 9 && month <= 11) tags.push("가을");
        else tags.push("겨울");
      }
      
      // 휴식 잠재력이 높은 경우
      if (result["Relaxation Potential"] > 0.6) {
        tags.push("휴식", "힐링");
      }
      
      // 로맨틱한 분위기가 높은 경우
      if (result["Romantic Atmosphere"] > 0.6) {
        tags.push("로맨틱", "데이트");
      }
      
      // 액티비티 기회가 높은 경우
      if (result["Activity Opportunities"] > 0.6) {
        tags.push("액티비티", "활동");
      }
      
      // 역사/문화적 가치가 높은 경우
      if (result["Historical/Cultural Value"] > 0.6) {
        tags.push("역사", "문화");
      }
      
      // 식도락 경험이 높은 경우
      if (result["Food Experience"] > 0.6) {
        tags.push("맛집", "음식");
      }
      
      // 쇼핑 잠재력이 높은 경우
      if (result["Shopping Potential"] > 0.6) {
        tags.push("쇼핑");
      }
      
      // 위치 정보에서 태그 추가
      if (result.geoLocation && result.geoLocation.address) {
        if (result.geoLocation.address.province) {
          tags.push(result.geoLocation.address.province);
        }
        if (result.geoLocation.address.city) {
          tags.push(result.geoLocation.address.city);
        }
      }
      
      // 중복 제거 및 최대 5개 태그만 사용
      const uniqueTags = [...new Set(tags)].slice(0, 5);
      imageDetails.tags = uniqueTags.join(", ");
      console.log("자동 생성된 태그:", imageDetails.tags);
    };
    
    // 분석 결과를 기반으로 설명 생성
    const generateSuggestedDescription = () => {
      if (!analysisResult.value) return;
      
      // 설명이 이미 설정되어 있으면 건너뜀
      if (imageDetails.description) return;
      
      const result = analysisResult.value;
      let description = '';
      let locationText = '';
      
      // 위치 정보에서 설명 시작 문구 생성
      if (result.geoLocation && result.geoLocation.address) {
        const address = result.geoLocation.address;
        if (address.province || address.city) {
          const location = [address.province, address.city]
            .filter(Boolean)
            .join(' ');
          
          if (location) {
            locationText = `${location}에서 `;
          }
        }
      }
      
      // 특성 기반 설명 생성
      const features = [];
      
      // 주요 특성 확인 (0.7 이상이면 주요 특성으로 간주)
      if (result["Natural Elements"] > 0.7) features.push("자연 풍경");
      if (result["Urban Character"] > 0.7) features.push("도시 경관");
      if (result["Water Features"] > 0.7) features.push("수변 공간");
      if (result["Relaxation Potential"] > 0.7) features.push("휴식 공간");
      if (result["Romantic Atmosphere"] > 0.7) features.push("로맨틱한 분위기");
      if (result["Food Experience"] > 0.7) features.push("맛집 체험");
      if (result["Shopping Potential"] > 0.7) features.push("쇼핑 장소");
      
      // 주요 특성으로 문장 구성
      if (features.length > 0) {
        description = `${locationText}촬영한 ${features.join(', ')} 사진입니다.`;
      } else {
        // 주요 특성이 없으면 간단히 구성
        description = `${locationText}촬영한 여행 사진입니다.`;
      }
      
      // URL은 별도 description에 추가하지 않음 (이미 geoLocation.googleMapsUrl로 저장됨)
      
      imageDetails.description = description;
      console.log("자동 생성된 설명:", description);
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
        
        // 직접 API 호출
        try {
          const analysisStartTime = performance.now();
          
          // 이미지 분석 API 호출
          const result = await callAnalyzeImage(
            imageFile.value, 
            abortController.value.signal
          );
          
          // 분석 시간 계산
          const analysisEndTime = performance.now();
          analysisDuration.value = ((analysisEndTime - analysisStartTime) / 1000).toFixed(1);
          
          // 결과 저장
          analysisResult.value = result;
          console.log("분석 결과:", result);
          
          // 위치 정보가 있다면 이미지 이름과 위치정보 자동 설정
          if (result.geoLocation) {
            // 제안된 이름이 있으면 이미지 이름으로 설정
            if (result.suggestedName) {
              imageDetails.name = result.suggestedName;
            }
            
            // 위치 정보가 있는 경우 위치 정보 설정
            if (result.geoLocation.address) {
              const address = result.geoLocation.address;
              // 위치 정보 텍스트 구성
              const locationText = [
                address.province, 
                address.city, 
                address.district, 
                address.road
              ].filter(Boolean).join(' ');
              
              // 위치 정보 및 지역 데이터 설정
              imageDetails.location = locationText || address.display_name;
              imageDetails.locationData = address.regionInfo;
              
              // 위치 정보가 있으면 지도 업데이트를 위한 별도 함수 사용
              if (result.geoLocation) {
                updateMapFromGeoLocation(result.geoLocation);
              }
            }
          }
          
          // 분석 결과를 기반으로 태그 제안
          generateSuggestedTags();
          
          // 분석 결과를 기반으로 설명 제안
          generateSuggestedDescription();
          
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
      
      // 이미지 정보 초기화
      imageDetails.name = '';
      imageDetails.location = '';
      imageDetails.locationData = null;
      imageDetails.tags = '';
      imageDetails.description = '';
      
      // LocationSearch 컴포넌트의 지도 초기화
      if (locationSearchRef.value && locationSearchRef.value.clearLocation) {
        locationSearchRef.value.clearLocation();
      }
    };
    
    // Elasticsearch에 저장 핸들러
    const saveToElasticsearchHandler = async () => {
      console.log('=== saveToElasticsearchHandler 호출 ===');
      console.log('현재 이미지 정보:', {
        name: imageDetails.name || "무제",
        location: imageDetails.location || "미지정",
        locationData: imageDetails.locationData,
        tags: imageDetails.tags
            ? imageDetails.tags.split(",").map((tag) => tag.trim())
            : [],
        description: imageDetails.description || ""
      });
      
      if (!analysisResult.value) {
        showActionStatus("이미지를 먼저 분석해주세요.", "error");
        return;
      }
      
      try {
        showActionStatus("사진을 서버에 저장 중...", "pending");
        
        // 특성 벡터 생성
        const featuresVector = createFeaturesVector(analysisResult.value);
        console.log('생성된 특성 벡터:', featuresVector);
        
        // 이미지를 Base64로 변환
        const imageBase64 = imagePreview.value;
        console.log('이미지 Base64 길이:', imageBase64?.split(',')[1]?.length || 0, '자');
        
        // 고유 ID 생성
        const imageId = generateUniqueId();
        console.log('생성된 이미지 ID:', imageId);
        
        const locationVal = imageDetails.location || "미지정";
        const tagsArray = imageDetails.tags
          ? imageDetails.tags.split(",").map((tag) => tag.trim())
          : [];
        
        console.log('Elasticsearch 저장 직전 데이터:');
        console.log('- 이미지 ID:', imageId);
        console.log('- 이미지 이름:', imageDetails.name || "무제");
        console.log('- 위치 정보:', locationVal);
        console.log('- 태그:', tagsArray);
        console.log('- 설명:', imageDetails.description || "");
        console.log('- 지역 데이터:', imageDetails.locationData);
        
        // Elasticsearch에 저장
        await callSaveToElasticsearch(
          imageId,
          imageDetails.name || "무제",
          locationVal,
          tagsArray,
          imageDetails.description || "",
          imageBase64,
          analysisResult.value,
          featuresVector,
          imageDetails.locationData
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
      loadingPhase, // 추가된 상태
      analysisDuration, // 추가된 상태
      searchDuration, // 추가된 상태
      triggerFileInput,
      handleFileChange,
      onLocationSelected,
      analyzeCurrentImage,
      reset,
      saveToElasticsearchHandler,
      searchSimilarHandler,
      getDimensionHeader,
      dimensionResults,
      locationSearchRef // LocationSearch 컴포넌트 참조 노출
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
  vertical-align: middle;
}

.analysis-table tr:last-child td {
  border-bottom: none;
}

.dimension-name {
  color: #e2e8f0;
  font-weight: 500;
  width: 20%;
}

.dimension-score {
  color: #4299e1;
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
  background-color: rgba(5, 14, 30, 0.2);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #3182ce, #63b3ed);
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.5s ease;
}

/* 나머지 글로벌 스타일은 LogoSearch.css에서 임포트 */
@import '../styles/LogoSearch.css';
</style>