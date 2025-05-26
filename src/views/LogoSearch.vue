<template>
  <div class="logo-search">
    <!-- Header 컴포넌트 사용 -->
    <Header 
      :showHero="showHero" 
      :heroImageSrc="heroImageSrc"
      :heroTitle="heroTitle"
      :heroSubtitle="heroSubtitle"
      :heroHeight="heroHeight"
    />

    <!-- 컨텐츠 영역 -->
    <div class="content-wrapper">
      <!-- 상단 두 컬럼 레이아웃: 이미지 업로드 | 분석 차트 -->
      <div class="top-section">
        <!-- 왼쪽: 이미지 업로드 패널 -->
        <div class="upload-panel panel-style"> <!-- Added panel-style for common styling -->
          <div class="panel-content">
            <!-- ImageUpload 컴포넌트 사용 -->
            <div class="image-upload-wrapper">
              <ImageUpload
                :currentFile="imageFile"
                :acceptedFileTypes="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
                :maxFileSize="10 * 1024 * 1024"
                :isAnalyzing="isLoading"
                @upload-success="handleUploadSuccess"
                @upload-error="handleUploadError"
                @file-remove="handleFileRemove"
                @analyze-start="analyzeCurrentImage"
                @analyze-cancel="cancelAnalysis"
              />
            </div>
          </div>
        </div>

        <!-- 오른쪽: 분석 차트 패널 -->
        <div class="analysis-panel panel-style"> <!-- Added panel-style -->
          <div v-if="isLoading || analysisResult" class="panel-header">
            <h3 class="panel-title">
              {{ isLoading ? '이미지 분석 중...' : (analysisResult ? '이미지 분석 결과' : '분석 데이터') }}
            </h3>
          </div>
          <div class="panel-content" :class="{ 'no-padding': false, 'no-header': !isLoading && !analysisResult }">
            <div class="guide-state">
              <!-- 분석 소개 섹션 - 항상 표시하되 분석 중일 때 위로 이동 -->
              <div 
                class="analysis-intro-section" 
                :class="{ 'slide-up': isLoading || analysisResult }"
              >
                <div class="analysis-intro-left">
                  <h3 class="analysis-intro-heading">
                    Llava와 Llama로 사진으로 여행지를 찾아보세요!
                  </h3>
                  <div class="analysis-intro-description">
                    고급 AI 기술을 활용하여 이미지를 분석하고, 당신이 찾는 완벽한 여행지를 추천해드립니다. <br />
                    단순히 이미지를 업로드하는 것만으로도 숨겨진 여행지의 매력을 발견할 수 있습니다.
                  </div>
                </div>
                <div class="analysis-intro-right">
                  <div class="analysis-features">
                    <div class="analysis-feature-item">
                      <div class="analysis-feature-image">
                        <img src="@/assets/img/llava-color.png" alt="Llava" class="analysis-feature-logo" />
                      </div>
                      <div class="analysis-feature-text">
                        <div class="analysis-feature-title">Llava 이미지 분석</div>
                        <div class="analysis-feature-desc">
                          최신 멀티모달 AI가 이미지의 구성 요소, 색상, 분위기, 건축 양식 등을 종합적으로 분석하여 
                          정확한 시각적 특성을 파악합니다.
                        </div>
                      </div>
                    </div>
                    <div class="analysis-feature-item">
                      <div class="analysis-feature-image">
                        <img src="@/assets/img/meta.png" alt="Llama" class="analysis-feature-logo" />
                      </div>
                      <div class="analysis-feature-text">
                        <div class="analysis-feature-title">Llama 의미 분석</div>
                        <div class="analysis-feature-desc">
                          이미지에서 추출된 정보를 바탕으로 여행지의 특성과 분위기를 이해하고, 
                          10차원 벡터 공간에서 정확한 위치를 찾아 검색을 위한 벡터를 생성합니다.
                        </div>
                      </div>
                    </div>
                    <div class="analysis-feature-item">
                      <div class="analysis-feature-image">
                        <img src="@/assets/img/elasticsearch.png" alt="ElasticSearch" class="analysis-feature-logo" />
                      </div>
                      <div class="analysis-feature-text">
                        <div class="analysis-feature-title">ElasticSearch 벡터 검색</div>
                        <div class="analysis-feature-desc">
                          생성된 차원 벡터를 이용하여 KNN(K-Nearest Neighbors) 기반 유사도 검색을 수행하고, 
                          가장 유사한 특성을 가진 여행지들을 정확도 순으로 추천합니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- ProcessSpinner (분석 시작 후에만 표시) -->
              <div 
                v-if="isLoading || analysisResult" 
                class="process-spinner-container"
                :class="{ 'fade-in': isLoading || analysisResult }"
              >
                <ProcessSpinner 
                  :currentPhase="loadingPhase"
                  :imageAnalysisDuration="imageAnalysisDuration"
                  :meaningAnalysisDuration="meaningAnalysisDuration"
                  :searchDuration="searchDuration"
                  :processingResultsDuration="processingResultsDuration"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 분석 결과 섹션 (분석 완료 후 표시) -->
      <div v-if="analysisResult && !isLoading" class="analysis-results-container">
        <!-- 왼쪽 패널: 분석 결과 테이블 -->
        <div class="analysis-results-left-panel panel-style">
          <div class="panel-header">
            <h3 class="panel-title">상세 분석 결과</h3>
          </div>
          <div class="panel-content">
            <div class="analysis-table-container">
              <table class="analysis-table">
                <thead>
                  <tr>
                    <th>분석 항목</th>
                    <th style="text-align: center;">점수</th>
                    <th>그래프</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="Array.isArray(dimensionResults)">
                    <tr v-for="(score, index) in dimensionResults" :key="'dim-'+index">
                      <td class="dimension-name">{{ getDimensionLabel(index) }}</td>
                      <td class="dimension-score">{{ typeof score === 'number' ? score.toFixed(1) : score }}</td>
                      <td class="dimension-bar">
                        <div class="bar-container">
                          <div class="bar" :style="{ width: `${typeof score === 'number' ? score * 100 : 0}%` }"></div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 오른쪽 패널: 지역별 검색 지도 -->
        <div class="analysis-results-right-panel panel-style">
          <div class="panel-header">
            <h3 class="panel-title">지역별 검색</h3>
          </div>
          <div class="panel-content">
            <div class="map-search-container">
              <p class="map-search-description">
                지도에서 지역을 클릭하여 해당 지역의 유사한 여행지를 찾아보세요.
              </p>
              
              <!-- 지도 컨테이너 -->
              <div class="map-container-wrapper">
                <!-- 뒤로가기 버튼 - 왼쪽 위로 이동 -->
                <div v-if="currentMapLevel === 'sig'" class="map-back-button-overlay">
                  <button @click="goBackMap" class="back-btn-overlay">
                    <span class="back-icon">←</span>
                    전체 지도로
                  </button>
                </div>
                
                <!-- 광역시구 지도 -->
                <div v-show="currentMapLevel === 'ctprvn'" class="map-container" ref="mainMapContainer"></div>
                
                <!-- 시군구 상세 지도 -->
                <div v-show="currentMapLevel === 'sig'" class="map-container" ref="detailMapContainer"></div>
                
                <!-- 현재 선택된 지역 표시 - 왼쪽 하단 -->
                <div class="selected-location-display">
                  <span class="location-label">📍 선택됨:</span>
                  <span class="location-name" v-if="selectedSig">{{ getSelectedSigName() }}</span>
                  <span class="location-name" v-else-if="selectedRegion">{{ getSelectedRegionName() }}</span>
                  <span class="location-name" v-else>대한민국</span>
                </div>
                
                <!-- 호버된 지역 표시 - 오른쪽 위 -->
                <div v-if="(hoveredRegion && !hoveredSig) || hoveredSig" class="hover-location-display">
                  <span class="location-label">👀 미리보기:</span>
                  <span class="location-name" v-if="hoveredSig">{{ hoveredSigName }}</span>
                  <span class="location-name" v-else-if="hoveredRegion">{{ hoveredRegionName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 결과 영역 (전체 너비) - SearchResultPanel 사용 -->
      <SearchResultPanel
        v-if="analysisResult && !isLoading && searchResults.length > 0"
        :title="`유사 여행지 추천 (${searchResults.length}건)`"
        :destinations="formattedSearchResults"
        :isLoading="false"
        :showAll="true"
        @open-detail="openDetailModal"
      />
      <div v-else-if="analysisResult && !isLoading && searchResults.length === 0" class="results-panel-container">
        <div class="results-panel panel-style">
          <div class="panel-header">
              <h3 class="panel-title">유사 여행지 추천</h3>
          </div>
          <div class="panel-content">
              <div class="no-results">
                <div class="no-results-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </div>
                <p class="no-results-text">추천할 만한 유사 여행지가 없습니다.</p>
                <p class="no-results-hint">다른 이미지로 다시 시도해보세요.</p>
                </div>
                  </div>
        </div>
      </div>
    </div>

    <!-- 푸터 -->
    <footer class="footer">
      <p>© 2025 LOG:O - 당신의 여행을 기록하다</p>
    </footer>

    <!-- 장소 상세 모달 (PlaceDetailModal 컴포넌트로 대체) -->
    <PlaceDetailModal
      :show="showDetailModal"
      :detail="selectedDetail"
      :isInWishlist="selectedDetail._id ? isInWishlist(selectedDetail._id) : false"
      :ageStats="ageStats"
      :genderStats="genderStats"
      :totalStatsVisits="totalStatsVisits"
      :isLoadingStats="isLoadingStats"
      @close="closeDetailModal"
      @toggle-wishlist="toggleWishlist"
      @apply-keyword="applyKeyword"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useStore } from "vuex";
import Header from "@/components/Header.vue";
import ProcessSpinner from "@/components/ProcessSpinner.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import Chart from 'chart.js/auto'; // Import Chart.js
import PlaceDetailModal from "@/components/PlaceDetailModal.vue";
import SearchResultPanel from "@/components/SearchResultPanel.vue";
// Add D3.js and GeoJSON imports
import * as d3 from 'd3';
import ctprvnGeoJson from '@/assets/ctprvn.json';
import sigGeoJson from '@/assets/sig.json';
import regionMapping from '@/data/regionMapping.js';
import {
  searchSimilarImages,
  createFeaturesVector, // Import createFeaturesVector
  imageToEngDescription,
  EngDescriptionToVector
} from "@/services/api";
import config from "@/config.js";

export default {
  name: "LogoSearch",

  components: {
    Header,
    ProcessSpinner,
    ImageUpload,
    PlaceDetailModal,
    SearchResultPanel
  },

  setup() {
    const store = useStore();
    const fileInput = ref(null);

    // Core state
    const imageFile = computed(() => store.state.image.file);
    const imagePreview = computed(() => store.state.image.preview);
    const isLoading = ref(false);
    const analysisResult = ref(null); // Stores { p_vector: [...] }
    const searchResults = ref([]);
    const abortController = ref(null);
    const actionStatus = ref({ message: "", type: "" }); // For user feedback
    
    // Drag and drop state - not needed anymore with ImageUpload component
    // const isDragOver = ref(false);
    
    // Hero section properties
    const showHero = ref(true);
    const heroImageSrc = ref('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1470');
    const heroTitle = ref('여행 이미지 분석');
    const heroSubtitle = ref('찾고 있는 분위기의 여행지를 발견하세요');
    const heroHeight = ref('320px');

    // Analysis timing
    const loadingPhase = ref('analysis');
    const imageAnalysisDuration = ref(null);
    const meaningAnalysisDuration = ref(null);
    const searchDuration = ref(null);
    const processingResultsDuration = ref(null);

    // Modal related state (from KeywordSearch.vue)
    const showDetailModal = ref(false);
    const selectedDetail = ref({});
    const wishlistItems = ref([]);
    let kakaoMap = null;
    
    // Stats related reactive variables (from KeywordSearch.vue)
    const ageStats = ref([]);
    const genderStats = ref([]);
    const totalStatsVisits = ref(0);
    const isLoadingStats = ref(false);
    const ageChartCanvas = ref(null);
    let ageChart = null;

    // Dimension labels (consistent with KeywordSearch)
    const dimensionLabels = [
      "자연 요소", "도시 특성", "수경 요소", "계절적 매력", "휴식 잠재력",
      "로맨틱한 분위기", "활동 기회", "역사/문화적 가치", "식도락 경험", "쇼핑 잠재력"
    ];

    const getDimensionLabel = (index) => {
      return dimensionLabels[index] || `차원 ${index + 1}`;
    };
    
    const dimensionResults = computed(() => { // Renamed from getDimensionHeader
      if (!analysisResult.value || !analysisResult.value.p_vector) return null;
      return analysisResult.value.p_vector; // Expect p_vector to be an array
    });

    const sortedSearchResults = computed(() => {
      return [...searchResults.value].sort((a, b) => b._score - a._score);
    });

    // SearchResultPanel 컴포넌트에 전달할 데이터 형식으로 변환
    const formattedSearchResults = computed(() => {
      return sortedSearchResults.value.map((result, index) => {
        return {
          id: result._id,
          name: result._source.p_name,
          address: result._source.p_address,
          region: result._source.p_region,
          sig: result._source.p_sig,
          description: result._source.p_description,
          tags: result._source.p_tags || [], 
          p_image: result._source.p_image,
          location_data: result._source.location_data,
          visitCount: result._source.visitCount || 0,
          avgRating: result._source.avgRating || 0,
          displayRank: index + 1,
          _score: result._score, // 유사도 점수 보존
          _source: result._source // 원본 데이터 보존
        };
      });
    });

    const dummyReviews = [
      { userName: "여행자김", rating: 5, date: "2025-03-15T09:30:00", comment: "정말 아름다운 장소였습니다." },
      { userName: "배낭여행러", rating: 4, date: "2025-02-20T14:45:00", comment: "좋은 경험이었습니다." }
    ];

    const formatReviewDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const formatSimilarityScore = (score) => {
      const percentage = Math.max(0, Math.min(100, Math.round(score * 100)));
      let description = "";
      if (percentage >= 90) description = "매우 높음";
      else if (percentage >= 75) description = "높음";
      else if (percentage >= 60) description = "중상";
      else if (percentage >= 40) description = "중간";
      else if (percentage >= 25) description = "중하";
      else description = "낮음";
      return { percentage, description };
    };

    const loadKakaoMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
          resolve(); return;
        }
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${config.KAKAO_MAPS_API_KEY}&autoload=false`;
        script.onload = () => window.kakao.maps.load(resolve);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    onMounted(async () => {
      console.log("LogoSearch 컴포넌트 마운트");
      const savedWishlist = localStorage.getItem('logo_wishlist');
      if (savedWishlist) {
        try {
          wishlistItems.value = JSON.parse(savedWishlist).map(id => ({ _id: id, _source: {} }));
        } catch (e) { console.error('위시리스트 로드 오류:', e); }
      }
      try {
        await loadKakaoMapsScript();
        console.log("카카오 맵 API 준비 완료 (LogoSearch)");
      } catch (error) {
        console.error("카카오 맵 API 로드 실패 (LogoSearch):", error);
      }
    });
    
    watch(imageFile, (newFile) => {
      if (newFile) {
        analysisResult.value = null;
        searchResults.value = [];
      }
    });

    const openDetailModal = (destination) => {
      console.log('상세 모달 열기 요청된 데이터:', destination);

      // SearchResultPanel에서 넘어온 데이터인 경우 (id, name 등의 형태) vs 직접 result에서 열 경우 (_id, _score 등의 형태)
      let detailData;
      
      if (destination.id !== undefined) {
        // SearchResultPanel에서 넘어온 데이터 처리
        detailData = {
          _id: destination.id,
          _score: destination._score,
          ...destination._source, // SearchResultPanel에서 원본 _source를 전달
          reviews: dummyReviews
        };
      } else {
        // 직접 result에서 열 경우 (이전 방식)
        detailData = {
          _id: destination._id,
          _score: destination._score,
          ...destination._source,
          reviews: dummyReviews
      };
      }
      
      selectedDetail.value = detailData;
      showDetailModal.value = true;

      // p_id 기반으로 통계 로드
      if (detailData.p_id) {
        loadDestinationStats(detailData.p_id);
      } else {
        console.warn("p_id is missing for selectedDetail, cannot load stats:", detailData);
        // Reset stats if p_id is missing
        ageStats.value = [];
        genderStats.value = [];
        totalStatsVisits.value = 0;
        isLoadingStats.value = false;
      }
      
      nextTick(() => {
        setTimeout(() => initDetailMap(), 300);
      });
    };

    const initDetailMap = async () => {
      const mapContainer = document.getElementById('detailMap');
      if (!mapContainer) return;
      try {
        if (!window.kakao || !window.kakao.maps) await loadKakaoMapsScript();
        
        let lat = 37.5665; let lng = 126.9780; // Default
        if (selectedDetail.value?.location_data) {
          lat = selectedDetail.value.location_data.latitude || lat;
          lng = selectedDetail.value.location_data.longitude || lng;
        }
        
        const mapOption = { center: new kakao.maps.LatLng(lat, lng), level: 3 };
        kakaoMap = new kakao.maps.Map(mapContainer, mapOption);
        const marker = new kakao.maps.Marker({ position: new kakao.maps.LatLng(lat, lng) });
        marker.setMap(kakaoMap);
        // InfoWindow can be added if needed
      } catch (error) {
        console.error('지도 초기화 오류 (LogoSearch):', error);
        mapContainer.innerHTML = '<div class="kakao-map-error">지도를 로드할 수 없습니다.</div>';
      }
    };

    const closeDetailModal = () => {
      showDetailModal.value = false;
      ageStats.value = [];
      genderStats.value = [];
      totalStatsVisits.value = 0;
      if (ageChart) {
        ageChart.destroy();
        ageChart = null;
      }
    };

    const isInWishlist = (id) => wishlistItems.value.some(item => item._id === id);

    const toggleWishlist = (item) => {
      // const itemName = item.p_name || item._source?.p_name || '장소';
      if (isInWishlist(item._id)) {
        wishlistItems.value = wishlistItems.value.filter(i => i._id !== item._id);
        // showActionStatus(`${itemName}이(가) 위시리스트에서 제거되었습니다.`, "success"); // Assuming showActionStatus exists
      } else {
        wishlistItems.value.push({ _id: item._id, _source: item }); // Store the whole item for consistency
        // showActionStatus(`${itemName}이(가) 위시리스트에 추가되었습니다.`, "success");
      }
      localStorage.setItem('logo_wishlist', JSON.stringify(wishlistItems.value.map(i => i._id)));
    };

    const applyKeyword = (keyword) => {
      // This is a stub function for PlaceDetailModal component compatibility
      console.log("Apply keyword not implemented in LogoSearch:", keyword);
    };

    // ImageUpload component event handlers
    const handleUploadSuccess = (file) => {
      store.commit("image/setFile", file);
      console.log("파일 업로드 성공:", file.name);
    };

    const handleUploadError = (error) => {
      console.error("파일 업로드 오류:", error);
      // showActionStatus(`업로드 오류: ${error}`, "error");
    };

    const handleFileRemove = () => {
      store.commit("image/reset");
      analysisResult.value = null;
      searchResults.value = [];
      // 시간 정보와 loadingPhase는 유지하여 ProcessSpinner가 보이도록 함
    };

    const analyzeCurrentImage = async () => {
      if (!imageFile.value) return;
        isLoading.value = true;
        loadingPhase.value = 'imageAnalysis';
        imageAnalysisDuration.value = null;
        meaningAnalysisDuration.value = null;
        searchDuration.value = null;
        processingResultsDuration.value = null;
        abortController.value = new AbortController();

        try {
          const imageAnalysisStartTime = performance.now();
        const engDescription = await imageToEngDescription(imageFile.value, abortController.value.signal);
        imageAnalysisDuration.value = ((performance.now() - imageAnalysisStartTime) / 1000).toFixed(1);
          
          loadingPhase.value = 'meaningAnalysis';
          const meaningAnalysisStartTime = performance.now();
        // EngDescriptionToVector is expected to return { "Natural Elements": 0.7, ... }
        const vectorResultObject = await EngDescriptionToVector(engDescription, abortController.value.signal);
        meaningAnalysisDuration.value = ((performance.now() - meaningAnalysisStartTime) / 1000).toFixed(1);
          
        // Convert the object to a flat vector array
        const featuresVector = createFeaturesVector(vectorResultObject);

            analysisResult.value = {
          p_vector: featuresVector, // Now an array [0.7, 0.3, ...]
          imageDescription: vectorResultObject.imageDescription // Preserve description if needed
        };

            loadingPhase.value = 'search';
            const searchStartTime = performance.now();
        await searchSimilarHandler(); // Uses analysisResult.value.p_vector
        searchDuration.value = ((performance.now() - searchStartTime) / 1000).toFixed(1);
          
        // 검색 결과 처리 상태 - 자동으로 즉시 완료
        loadingPhase.value = 'processingResults';
        const processingResultsStartTime = performance.now();
        // 1.5초 지연 제거 - 즉시 완료
        processingResultsDuration.value = ((performance.now() - processingResultsStartTime) / 1000).toFixed(1);
        loadingPhase.value = 'completed';

      } catch (error) {
        if (error.name === "AbortError") console.log("분석 취소됨");
        else console.error("분석 오류:", error);
        // Fallback or error display logic
      } finally {
        isLoading.value = false;
        abortController.value = null;
      }
    };

    const reset = () => {
      store.commit("image/reset");
      analysisResult.value = null;
      searchResults.value = [];
      loadingPhase.value = 'idle'; // loadingPhase도 리셋
      imageAnalysisDuration.value = null;
      meaningAnalysisDuration.value = null;
      searchDuration.value = null;
      processingResultsDuration.value = null;
      // actionStatus.value = { message: "", type: "" };
    };

    const searchSimilarHandler = async () => {
      if (!analysisResult.value || !analysisResult.value.p_vector) {
        // showActionStatus("분석된 이미지 특성이 없습니다.", "error");
        return;
      }
      try {
        // showActionStatus("유사 여행지 검색 중...", "pending");
        // searchSimilarImages expects a flat array for featuresVector
        const results = await searchSimilarImages(analysisResult.value.p_vector, 30); // 30개 결과 요청으로 변경
        searchResults.value = results; // 이제 ES 레벨에서 중복 제거된 결과 반환
        console.log(`검색 완료: ${results.length}개 결과, 첫번째 결과:`, 
          results.length > 0 ? {
            id: results[0]._id,
            p_id: results[0]._source.p_id,
            name: results[0]._source.p_name,
            score: results[0]._score,
            visitCount: results[0]._source.visitCount || 0
          } : null);
      } catch (error) {
        // showActionStatus(`검색 오류: ${error.message}`, "error");
        console.error("유사 이미지 검색 오류:", error);
      }
    };

    const cancelAnalysis = () => {
      if (abortController.value) abortController.value.abort();
      reset(); // 취소 시에만 완전히 리셋
    };

    // --- Statistics Functions (adapted from KeywordSearch.vue) ---
    const totalAgeVisits = computed(() => ageStats.value.reduce((sum, stat) => sum + stat.value, 0));
    const malePercentage = computed(() => {
      if (totalStatsVisits.value === 0) return 0;
      const maleCount = genderStats.value.find(s => s.gender === 'M')?.value || 0;
      return Math.round((maleCount / totalStatsVisits.value) * 100);
    });
    const femalePercentage = computed(() => {
      if (totalStatsVisits.value === 0) return 0;
      const femaleCount = genderStats.value.find(s => s.gender === 'F')?.value || 0;
      return Math.round((femaleCount / totalStatsVisits.value) * 100);
    });
    
    const getColorForAge = (age) => {
      const colorMap = {
        10: '#f8b195', 20: '#f67280', 30: '#c06c84', 40: '#6c5b7c',
        50: '#355c7d', 60: '#a8e6cf', 70: '#dcedc2', 80: '#ffd3b5', 90: '#ffaaa6'
      };
      return colorMap[age] || `hsl(${210 + age}, 70%, 60%)`;
    };

    const renderAgeChart = () => {
      const canvas = ageChartCanvas.value;
      if (!canvas || totalAgeVisits.value === 0) {
        if (ageChart) { ageChart.destroy(); ageChart = null; }
        return;
      }
      if (ageChart) ageChart.destroy();
      
      const filteredAgeStats = ageStats.value.filter(stat => stat.value > 0);
      const data = filteredAgeStats.map(stat => stat.value);
      const labels = filteredAgeStats.map(stat => `${stat.age}대`);
      const colors = filteredAgeStats.map(stat => getColorForAge(stat.age));
      const percentages = filteredAgeStats.map(stat => 
        totalAgeVisits.value > 0 ? ((stat.value / totalAgeVisits.value) * 100).toFixed(1) : '0.0'
      );
      
      ageChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{ data: data, backgroundColor: colors, borderColor: '#ffffff', borderWidth: 2, hoverOffset: 15 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '50%',
          plugins: {
            legend: {
              position: 'right', labels: { font: { size: 12 }, padding: 25,
                generateLabels: (chart) => chart.data.labels.map((label, i) => ({
                  text: `${label} (${percentages[i]}%)`, fillStyle: chart.data.datasets[0].backgroundColor[i],
                  strokeStyle: chart.data.datasets[0].borderColor, lineWidth: chart.data.datasets[0].borderWidth,
                  hidden: false, index: i
                }))
      }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const percentage = totalAgeVisits.value > 0 ? ((context.raw / totalAgeVisits.value) * 100).toFixed(1) : '0.0';
                  return `${context.label}: ${context.raw}명 (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    };

    watch([ageStats, totalAgeVisits], () => { nextTick(renderAgeChart); }, { deep: true });

    const loadDestinationStats = async (placeId) => {
      if (!placeId) return;
      isLoadingStats.value = true;
      try {
        const query = {
          size: 0, query: { term: { p_id: parseInt(placeId) } },
          aggs: {
            age_distribution: { terms: { field: "u_age", size: 10, order: { "_key": "asc" } } },
            gender_distribution: { terms: { field: "u_gender", size: 2 } },
            total_visits: { value_count: { field: "p_id" } }
          }
        };
        const response = await fetch(`${config.ES_API}/travel_places/_search`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query)
        });
        if (!response.ok) throw new Error(`Elasticsearch API 오류: ${response.status}`);
        const data = await response.json();
        
        if (data?.aggregations?.age_distribution?.buckets) {
          ageStats.value = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(age => {
            const bucket = data.aggregations.age_distribution.buckets.find(b => b.key === age);
            return { age: age, value: bucket ? bucket.doc_count : 0 };
          });
        } else { ageStats.value = []; }
        
        if (data?.aggregations?.gender_distribution?.buckets) {
          genderStats.value = data.aggregations.gender_distribution.buckets.map(b => ({ gender: b.key, value: b.doc_count }));
        } else { genderStats.value = []; }
        
        totalStatsVisits.value = data?.aggregations?.total_visits?.value || 0;
      } catch (error) {
        console.error('방문 통계 로드 오류 (LogoSearch):', error);
        ageStats.value = []; genderStats.value = []; totalStatsVisits.value = 0;
      } finally { isLoadingStats.value = false; }
    };

    const totalProcessingTime = computed(() => {
      if (!imageAnalysisDuration.value || !meaningAnalysisDuration.value || !searchDuration.value || !processingResultsDuration.value) return null;
      const total = parseFloat(imageAnalysisDuration.value) + 
                   parseFloat(meaningAnalysisDuration.value) + 
                   parseFloat(searchDuration.value) +
                   parseFloat(processingResultsDuration.value);
      return total.toFixed(1);
    });

    // D3.js 지도 관련 상태 및 함수
    const mainMapContainer = ref(null);
    const detailMapContainer = ref(null);
    const currentMapLevel = ref('ctprvn'); // 'ctprvn' or 'sig'
    const hoveredRegion = ref(null);
    const hoveredRegionName = ref('');
    const hoveredSig = ref(null);
    const hoveredSigName = ref('');
    const selectedRegion = ref(null);
    const selectedSig = ref(null);
    const showDetailMap = ref(false);

    // 툴팁 스타일 계산 함수 제거 - hover-location-display 사용

    const getSelectedRegionName = () => {
      if (!selectedRegion.value) {
        return '';
      }
      // selectedRegion.value를 2자리 문자열로 변환하여 regionMapping에서 찾기
      const regionCode = String(selectedRegion.value).padStart(2, '0');
      const regionData = regionMapping[regionCode];
      return regionData ? regionData.name : '';
    };

    const getSelectedSigName = () => {
      if (!selectedSig.value) {
        return '';
      }
      
      // selectedSig.value에서 앞 2자리로 region 찾기
      const sigCode = String(selectedSig.value);
      const regionCode = sigCode.substring(0, 2);
      const regionData = regionMapping[regionCode];
      
      if (!regionData || !regionData.children) {
        return '';
      }
      
      // children 배열에서 해당 sig 찾기
      const sigData = regionData.children.find(child => child.code === sigCode);
      return sigData ? sigData.name : '';
    };

    const goBackMap = () => {
      if (currentMapLevel.value === 'sig') {
        // 시군구에서 전체 지도로 돌아가기
        currentMapLevel.value = 'ctprvn';
        selectedRegion.value = null;
        selectedSig.value = null;
        showDetailMap.value = false;
        // 전체 검색 수행
        searchSimilarHandler();
        // 메인 지도 다시 렌더링
        nextTick(() => {
          renderMap();
        });
      }
    };

    const handleRegionClick = (region) => {
      selectedRegion.value = region;
      selectedSig.value = null; // 시군구 선택 초기화
      currentMapLevel.value = 'sig';
      showDetailMap.value = true;
      // Filter search results by region
      searchSimilarHandlerWithRegion(region);
      // Render detailed map
      nextTick(() => {
        renderDetailMap(region);
      });
    };

    const handleSigClick = (sig) => {
      // 이미 선택된 시군구를 다시 클릭하면 광역시도 레벨로 돌아감
      if (selectedSig.value === sig) {
        selectedSig.value = null;
        searchSimilarHandlerWithRegion(selectedRegion.value);
        return;
      }
      
        selectedSig.value = sig;
      // Filter search results by sig
        searchSimilarHandlerWithSig(sig);
    };

    // D3.js map data and state
    // regionMapping은 일반 객체로 사용
    // Remove unused variables
    // const regionDataMap = ref(propertiesData);
    // const sigDataMap = ref(sigPropertiesData);

    // Main map rendering function
    const renderMap = () => {
      const container = mainMapContainer.value;
      if (!container) {
        console.warn("Map container element not found");
        return;
      }

      // ResizeObserver를 사용하여 컨테이너 크기 변경 감지
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            observer.disconnect(); // 관찰 중지
            renderMapContent(container, width, height);
          }
        }
      });

      // 컨테이너 관찰 시작
      observer.observe(container);
    };

    // 실제 지도 렌더링 로직을 별도 함수로 분리
    const renderMapContent = (container, width, height) => {
      // Clear existing SVG
      d3.select(container).selectAll("svg").remove();

      // 최소 크기 확보
      const minWidth = Math.max(width, 300);
      const minHeight = Math.max(height, 300);

      // Create SVG
      const svg = d3.select(container)
        .append('svg')
        .attr('width', minWidth)
        .attr('height', minHeight)
        .attr('viewBox', [0, 0, minWidth, minHeight])
        .style('width', '100%')
        .style('height', '100%');

      // Create map group
      const g = svg.append('g').attr('class', 'map-group');

      try {
        // Set up projection
        const projection = d3.geoIdentity()
          .reflectY(true)
          .fitSize([minWidth * 0.85, minHeight * 0.85], ctprvnGeoJson);
        
        const path = d3.geoPath().projection(projection);
        
        // Center the map
        g.attr("transform", `translate(${minWidth * 0.075}, ${minHeight * 0.075})`);

        // Draw regions
        const regionPaths = g.selectAll('path')
          .data(ctprvnGeoJson.features)
          .enter()
          .append('path')
          .attr('class', 'region')
          .attr('d', path)
          .attr('fill', d => parseInt(d.properties.CTPRVN_CD, 10) === selectedRegion.value ? '#4299E1' : '#EDF2F7')
          .attr('stroke', d => parseInt(d.properties.CTPRVN_CD, 10) === selectedRegion.value ? '#2B6CB0' : '#CBD5E0')
          .attr('stroke-width', d => parseInt(d.properties.CTPRVN_CD, 10) === selectedRegion.value ? 1.5 : 0.7);

        // Add hover events
        regionPaths.on('mouseover', function (event, d) {
          const regionCode = d.properties.CTPRVN_CD;
          // regionMapping에서 지역명 찾기
          const regionCodeStr = String(regionCode).padStart(2, '0');
          const regionData = regionMapping[regionCodeStr];
          
          hoveredRegion.value = regionCode;
          hoveredRegionName.value = regionData ? regionData.name : '';
          
          // 선택된 지역이 아닌 경우에만 호버 효과 적용
          if (parseInt(regionCode, 10) !== selectedRegion.value) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#E2E8F0')
              .attr('stroke', '#A0AEC0')
              .attr('stroke-width', 1.5);
          }
        });

        regionPaths.on('mouseout', function (event, d) {
          hoveredRegion.value = null;
          hoveredRegionName.value = '';
          
          // 선택된 지역이 아닌 경우에만 원래 색상으로 복원
          const regionCode = parseInt(d.properties.CTPRVN_CD, 10);
          if (regionCode !== selectedRegion.value) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#EDF2F7')
              .attr('stroke', '#CBD5E0')
              .attr('stroke-width', 0.7);
          }
        });

        // Add click events
        regionPaths.on('click', function (event, d) {
          const regionCode = parseInt(d.properties.CTPRVN_CD, 10);
          
          // 이전에 선택된 지역의 스타일 초기화
          if (selectedRegion.value !== null && selectedRegion.value !== regionCode) {
            g.selectAll('path')
              .filter(function(d) {
                return parseInt(d.properties.CTPRVN_CD, 10) === selectedRegion.value;
              })
              .attr('fill', '#EDF2F7')
              .attr('stroke', '#CBD5E0')
              .attr('stroke-width', 0.7);
          }
          
          // 새로운 지역 선택 및 스타일 적용
          d3.select(this)
            .attr('fill', '#4299E1')
            .attr('stroke', '#2B6CB0')
            .attr('stroke-width', 1.5);
          
          handleRegionClick(regionCode);
        });

        console.log("Map rendered successfully");

      } catch (error) {
        console.error("지도 렌더링 중 오류 발생:", error);
      }
    };

    // Detail map rendering function
    const renderDetailMap = (regionCode) => {
      const container = detailMapContainer.value;
      if (!container) {
        console.warn("Detail map container element not found");
        return;
      }

      // ResizeObserver를 사용하여 컨테이너 크기 변경 감지
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            observer.disconnect(); // 관찰 중지
            renderDetailMapContent(container, width, height, regionCode);
          }
        }
      });

      // 컨테이너 관찰 시작
      observer.observe(container);
    };

    // 실제 상세 지도 렌더링 로직을 별도 함수로 분리
    const renderDetailMapContent = (container, width, height, regionCode) => {
      // Clear existing SVG
      d3.select(container).selectAll("svg").remove();

      // 최소 크기 확보
      const minWidth = Math.max(width, 300);
      const minHeight = Math.max(height, 300);

      // Create SVG
      const svg = d3.select(container)
        .append('svg')
        .attr('width', minWidth)
        .attr('height', minHeight)
        .attr('viewBox', [0, 0, minWidth, minHeight])
        .style('width', '100%')
        .style('height', '100%');

      // Create map group
      const g = svg.append('g').attr('class', 'map-group');

      try {
        // Filter features for the selected region
        const filteredFeatures = sigGeoJson.features.filter(feature => {
          if (!feature.properties || !feature.properties.SIG_CD) return false;
          const sigCode = feature.properties.SIG_CD;
          const sigCodePrefix = sigCode.toString().substring(0, 2);
          const regionCodeStr = regionCode.toString().padStart(2, '0'); // 지역 코드를 2자리 문자열로 변환
          return sigCodePrefix === regionCodeStr;
        });

        if (filteredFeatures.length === 0) {
          g.append('text')
            .attr('x', minWidth / 2)
            .attr('y', minHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#333')
            .text('이 지역의 상세 지도는 준비중입니다.');
          return;
        }

        const filteredGeoJson = {
          type: "FeatureCollection",
          features: filteredFeatures
        };

        // Set up projection
        const projection = d3.geoIdentity()
          .reflectY(true)
          .fitSize([minWidth * 0.85, minHeight * 0.85], filteredGeoJson);
        
        const path = d3.geoPath().projection(projection);
        
        // Center the map
        g.attr("transform", `translate(${minWidth * 0.075}, ${minHeight * 0.075})`);

        // Draw sig regions
        const sigPaths = g.selectAll('path')
          .data(filteredFeatures)
          .enter()
          .append('path')
          .attr('class', 'sig')
          .attr('d', path)
          .attr('fill', d => parseInt(d.properties.SIG_CD, 10) === selectedSig.value ? '#4299E1' : '#EDF2F7')
          .attr('stroke', d => parseInt(d.properties.SIG_CD, 10) === selectedSig.value ? '#2B6CB0' : '#CBD5E0')
          .attr('stroke-width', d => parseInt(d.properties.SIG_CD, 10) === selectedSig.value ? 1.5 : 0.7);

        // Add hover events
        sigPaths.on('mouseover', function (event, d) {
          const sigCode = d.properties.SIG_CD;
          // regionMapping에서 시군구명 찾기
          const regionCode = String(sigCode).substring(0, 2);
          const regionData = regionMapping[regionCode];
          let sigName = '';
          
          if (regionData && regionData.children) {
            const sigData = regionData.children.find(child => child.code === String(sigCode));
            sigName = sigData ? sigData.name : '';
          }
          
          hoveredSig.value = sigCode;
          hoveredSigName.value = sigName;
          
          // 선택된 지역이 아닌 경우에만 호버 효과 적용
          if (parseInt(sigCode, 10) !== selectedSig.value) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#E2E8F0')
              .attr('stroke', '#A0AEC0')
              .attr('stroke-width', 1.5);
          }
        });

        sigPaths.on('mouseout', function (event, d) {
          hoveredSig.value = null;
          hoveredSigName.value = '';
          
          // 선택된 지역이 아닌 경우에만 원래 색상으로 복원
          const sigCode = parseInt(d.properties.SIG_CD, 10);
          if (sigCode !== selectedSig.value) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#EDF2F7')
              .attr('stroke', '#CBD5E0')
              .attr('stroke-width', 0.7);
          }
        });

        // Add click events
        sigPaths.on('click', function (event, d) {
          const sigCode = parseInt(d.properties.SIG_CD, 10);
          
          // 이전에 선택된 시군구의 스타일 초기화
          if (selectedSig.value !== null && selectedSig.value !== sigCode) {
            g.selectAll('path')
              .filter(function(d) {
                return parseInt(d.properties.SIG_CD, 10) === selectedSig.value;
              })
              .attr('fill', '#EDF2F7')
              .attr('stroke', '#CBD5E0')
              .attr('stroke-width', 0.7);
          }
          
          // 새로운 시군구 선택 및 스타일 적용
          if (selectedSig.value === sigCode) {
            // 같은 시군구를 다시 클릭한 경우
            d3.select(this)
              .attr('fill', '#EDF2F7')
              .attr('stroke', '#CBD5E0')
              .attr('stroke-width', 0.7);
          } else {
            // 새로운 시군구를 선택한 경우
            d3.select(this)
              .attr('fill', '#4299E1')
              .attr('stroke', '#2B6CB0')
              .attr('stroke-width', 1.5);
          }
          
          handleSigClick(sigCode);
        });

      } catch (error) {
        console.error("상세 지도 렌더링 중 오류 발생:", error);
      }
    };

    // Search functions with region filtering
    const searchSimilarHandlerWithRegion = async (regionCode) => {
      if (!analysisResult.value || !analysisResult.value.p_vector) {
        return;
      }
      
      try {
        // regionCode를 정수로 변환
        const regionInt = parseInt(regionCode, 10);
        
        const results = await searchSimilarImages(
          analysisResult.value.p_vector, 
          30, 
          null, 
          null,
          regionInt  // p_region 필드 직접 사용
        );
        searchResults.value = results;
        console.log(`[LogoSearch] 지역 필터 검색 완료 (region: ${regionInt}): ${results.length}개 결과`);
      } catch (error) {
        console.error("[LogoSearch] 지역별 검색 오류:", error);
      }
    };

    const searchSimilarHandlerWithSig = async (sigCode) => {
      if (!analysisResult.value || !analysisResult.value.p_vector) return;
      
      try {
        // sigCode를 정수로 변환
        const sigInt = parseInt(sigCode, 10);
        
        const results = await searchSimilarImages(
          analysisResult.value.p_vector, 
          30, 
          null, 
          null,
          null, // region
          sigInt  // p_sig 필드 직접 사용
        );
        searchResults.value = results;
        console.log(`[LogoSearch] 시군구 필터 검색 완료 (sig: ${sigInt}): ${results.length}개 결과`);
      } catch (error) {
        console.error("[LogoSearch] 시군구별 검색 오류:", error);
      }
    };

    // Initialize maps when analysis results are available
    watch(analysisResult, (newResult) => {
      if (newResult && !isLoading.value) {
        // 충분한 지연 후 지도 렌더링
        setTimeout(() => {
          nextTick(() => {
            renderMap();
          });
        }, 500);
      }
    });

    // Initialize map on mount
    onMounted(() => {
      // 컴포넌트 마운트 후 지도 초기화
      setTimeout(() => {
        nextTick(() => {
          if (analysisResult.value) {
            renderMap();
          }
        });
      }, 300);
    });

    // 추가: 지도 컨테이너 크기 변경 감지 및 재렌더링
    const resizeObserver = new ResizeObserver(() => {
      if (analysisResult.value && !isLoading.value) {
        setTimeout(() => {
          nextTick(() => {
            renderMap();
          });
        }, 100);
      }
    });

    // ResizeObserver 등록
    watch(mainMapContainer, (newContainer) => {
      if (newContainer) {
        resizeObserver.observe(newContainer);
      }
    });

    watch(detailMapContainer, (newContainer) => {
      if (newContainer) {
        resizeObserver.observe(newContainer);
      }
    });

    return {
      // Core
      imageFile, imagePreview, isLoading, analysisResult, searchResults, sortedSearchResults, formattedSearchResults,
      fileInput, loadingPhase, imageAnalysisDuration, meaningAnalysisDuration, searchDuration, processingResultsDuration, totalProcessingTime,
      analyzeCurrentImage, reset, searchSimilarHandler, cancelAnalysis,
      // ImageUpload handlers
      handleUploadSuccess, handleUploadError, handleFileRemove,
      // Hero
      showHero, heroImageSrc, heroTitle, heroSubtitle, heroHeight,
      // Dimensions
      dimensionResults, getDimensionLabel,
      // Modal
      showDetailModal, selectedDetail, wishlistItems, openDetailModal, closeDetailModal, 
      isInWishlist, toggleWishlist, initDetailMap, formatReviewDate,
      // Stats
      ageStats, genderStats, totalStatsVisits, isLoadingStats, ageChartCanvas,
      totalAgeVisits, malePercentage, femalePercentage, getColorForAge,
      // D3.js Map related
      mainMapContainer, detailMapContainer, currentMapLevel, hoveredRegion, hoveredRegionName,
      hoveredSig, hoveredSigName, selectedRegion, selectedSig, showDetailMap,
      getSelectedRegionName, getSelectedSigName, goBackMap,
      renderMap, renderDetailMap, handleRegionClick, handleSigClick,
      // Misc
      formatSimilarityScore, actionStatus,
      applyKeyword
    };
  }
};
</script>

<style scoped>
/* Base styles from KeywordSearch.vue (with .keyword-search changed to .logo-search) */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Nunito:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.logo-search { /* Changed from .keyword-search */
  min-height: 100vh;
  position: relative;
  font-family: 'Noto Sans KR', 'Nunito', sans-serif;
  color: #333;
  overflow-x: hidden;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  position: relative;
  padding: 2rem 0.5rem 3rem;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  width: 95%;
  margin-top: 10px;
  flex: 1;
  /* auto height로 변경 */
  min-height: auto;
}

/* Panel common styles from KeywordSearch.vue (using .panel-style as a common class) */
.panel-style { /* This class will be added to upload-panel, analysis-panel, results-panel */
  background-color: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid #f0f2f7;
}

.panel-style:hover { /* Apply hover to .panel-style */
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.panel-header {
  padding: 1.2rem 1.5rem;
  background: #fff;
  border-bottom: 2px solid #eef2f7;
  position: relative;
  height: 60px; /* header 높이 명시 */
  flex-shrink: 0;
}

.panel-title {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
  color: #34495e;
  letter-spacing: 0.3px;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

.panel-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  /* auto height로 변경 */
  height: auto;
  min-height: 400px; /* 최소 높이만 설정 */
  overflow-y: auto;
}
.panel-content.no-padding { padding: 0; }
.panel-content.no-header { 
  /* header가 없을 때 */
  height: auto;
  min-height: 450px; /* 약간 더 높게 */
}

@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }


/* Styles for .top-section, .upload-panel, .analysis-panel from original LogoSearch */
.top-section {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
  /* auto height로 변경 */
  height: auto;
  min-height: 500px; /* 최소 높이만 설정 */
}

.image-upload-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

/* ImageUpload 컴포넌트 크기 조정 */
.image-upload-wrapper :deep(.file-upload-container) {
  max-width: 100%;
  margin: 0;
  height: 100%;
}

.image-upload-wrapper :deep(.file-upload-card) {
  max-width: 100%;
  min-height: 100%;
  height: 100%;
  box-shadow: none;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fdff 0%, #f0f8ff 100%);
}

.image-upload-wrapper :deep(.file-upload-content) {
  min-height: 100%;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.image-upload-wrapper :deep(.gradient-background) {
  background: linear-gradient(135deg, rgba(72, 176, 228, 0.05) 0%, rgba(255, 255, 255, 0) 50%, rgba(118, 179, 157, 0.05) 100%);
}

/* 기존 image-container 관련 스타일들은 제거하거나 주석 처리 */
/*
.image-container {
  background: linear-gradient(135deg, #f8fdff 0%, #f0f8ff 100%);
  border-radius: 16px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 2px dashed #d1d8e0;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.image-container:hover {
  border-color: var(--logo-blue, #48b0e4);
  background: linear-gradient(135deg, #f0f8ff 0%, #e8f4ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(72, 176, 228, 0.15);
}

.image-container.drag-over {
  border-color: var(--logo-green, #76b39d);
  background: linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%);
  border-style: solid;
  transform: scale(1.02);
  box-shadow: 0 12px 35px rgba(118, 179, 157, 0.2);
}

.image-container.has-image {
  border-style: solid;
  border-color: var(--logo-blue, #48b0e4);
  background: white;
  cursor: default;
}

.image-container.has-image:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(72, 176, 228, 0.1);
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #7f8c8d;
}

.upload-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Noto Sans KR', sans-serif;
}

.upload-content svg {
  color: var(--logo-blue, #48b0e4);
  margin-bottom: 1.5rem;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.image-container:hover .upload-content svg {
  opacity: 1;
  transform: scale(1.1);
}

.upload-main-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.upload-sub-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
  opacity: 0.8;
}

.preview-image { 
  max-width: 100%; 
  max-height: 100%; 
  object-fit: contain;
  border-radius: 12px;
}
*/

.button-group { 
  display: flex; 
  flex-direction: column; 
  gap: 0.75rem; 
}

.btn { /* General button styling from KS */
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 0.5rem;
  padding: 0.75rem 1.25rem; 
  border: none; 
  border-radius: 25px; /* Pill shape */
  font-family: 'Nunito', 'Noto Sans KR', sans-serif; 
  font-weight: 600; 
  font-size: 0.9rem;
  cursor: pointer; 
  transition: all 0.3s ease; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.btn:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 8px rgba(0,0,0,0.15); 
}

.btn-primary { 
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d)); 
  color: white; 
}

.btn-primary:hover { 
  background: linear-gradient(135deg, #3a9cd1, #67a58d); 
}

.btn-analyze { /* Specific for analyze if needed, or use primary */
  background: linear-gradient(135deg, var(--logo-green, #76b39d), var(--logo-blue, #48b0e4)); 
  color: white;
}

.btn-analyze:hover { 
  background: linear-gradient(135deg, #67a58d, #3a9cd1); 
}

.btn-secondary { 
  background-color: #e9ecef; 
  color: #495057; 
  border: 1px solid #ced4da; 
}

.btn-secondary:hover { 
  background-color: #dde2e6; 
}

.btn-danger { 
  background-color: #e74c3c; 
  color: white; 
}

.btn-danger:hover { 
  background-color: #c0392b; 
}

.hidden-input { 
  display: none; 
}


/* Analysis Panel Specifics (from original LogoSearch, adapt to KS panel style) */
.loading-state { display: flex; align-items: stretch; justify-content: center; height: 100%; width: 100%; min-height: 300px; }
.loading-spinner-container { display: flex; width: 100%; height: 100%; }
.guide-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; padding: 2rem; }
.guide-description { font-size: 1rem; line-height: 1.6; color: #495057; margin-bottom: 1.5rem; }
.analysis-table-container { overflow: auto; border-radius: 8px; height: 100%; border: 1px solid #eef2f7; }
.analysis-table { width: 100%; border-collapse: collapse; }
.analysis-table th { background-color: #f8f9fa; color: #34495e; text-align: left; padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: 600; border-bottom: 1px solid #dde2e7; }
.analysis-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #eef2f7; font-size: 0.85rem; }
.analysis-table tr:last-child td { border-bottom: none; }
.dimension-name { font-weight: 500; color: #5f6b7a; }
.dimension-score { font-weight: 600; color: var(--logo-blue, #48b0e4); text-align: center; }
.dimension-bar .bar-container { height: 10px; background-color: #e8eaed; border-radius: 5px; overflow: hidden; }
.dimension-bar .bar { height: 100%; background: linear-gradient(90deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d)); border-radius: 5px; transition: width 0.6s ease-out; }

/* Results Panel Container and Panel (from KeywordSearch.vue) */
.results-panel-container {
  margin-top: 1.5rem; /* Spacing from top section */
    opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out 0.2s forwards; /* Delay this animation */
}
/* .results-panel is covered by .panel-style */

/* No Results (from KeywordSearch.vue) */
.no-results {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4rem 1rem; color: #a0aec0; text-align: center;
  background-color: #f9fafb; border-radius: 12px; margin: 1rem 0;
}
.no-results-icon svg { width: 50px; height: 50px; color: #cbd5e0; margin-bottom: 1.25rem; }
.no-results-text { font-size: 1.1rem; color: #4a5568; margin: 0 0 0.5rem 0; font-weight: 500; }
.no-results-hint { font-size: 0.9rem; color: #718096; margin: 0; }


/* Result Grid & Card styles from KeywordSearch.vue */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
  padding: 0.5rem;
}
.result-card {
  position: relative; background-color: white; border-radius: 12px; overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer; border: 1px solid #eef2f7;
}
.result-card:hover { transform: translateY(-6px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
.result-image-container {
  height: 200px; width: 100%; overflow: hidden; background-color: #f0f0f0;
  display: flex; align-items: center; justify-content: center; color: #666; position: relative;
}
.result-image-container::before {
  content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.6));
  z-index: 1; opacity: 0; transition: opacity 0.3s ease;
}
.result-card:hover .result-image-container::before { opacity: 1; }
.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.result-card:hover .result-image { transform: scale(1.07); }

/* 이미지 없을 때 표시할 플레이스홀더 */
.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
  color: #95a5a6;
  font-size: 1rem;
  font-weight: 500;
}

.result-rank { /* from KS */
  position: absolute; top: 12px; right: 12px; display: flex; align-items: center; justify-content: center;
  gap: 5px; padding: 4px 10px; background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white; border-radius: 16px; font-size: 0.75rem; font-weight: 600; z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}
.result-rank.with-heart { padding-left: 10px; gap: 7px; }
.result-info { padding: 1rem 1.2rem; }
.result-name {
  font-size: 1.05rem; font-weight: 600; color: #34495e; margin: 0 0 0.4rem 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.3s ease;
}
.result-card:hover .result-name { color: var(--logo-blue, #48b0e4); }
.result-location { display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: #7f8c8d; margin-bottom: 0.6rem; }
.result-similarity { /* from KS, .similarity-bar-container, .similarity-bar, .similarity-value */
  display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #7f8c8d; margin-bottom: 0.75rem;
}
.similarity-label { font-weight: 500; color: #7f8c8d; }
.similarity-bar-container { flex-grow: 1; height: 7px; background-color: #e8eaed; border-radius: 4px; overflow: hidden; }
.similarity-bar { height: 100%; background: linear-gradient(90deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d)); border-radius: 4px; transition: width 1s cubic-bezier(0.25, 0.8, 0.25, 1); }
.similarity-value { font-weight: 600; color: var(--logo-blue, #48b0e4); font-size: 0.85rem; }

/* Visit count style from KeywordSearch.vue */
.result-visit-count {
  font-size: 0.8rem;
  color: #27ae60; /* Greener */
  font-weight: 500;
  margin-bottom: 0.5rem;
  background-color: #eafaf1;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

/* Footer from KeywordSearch.vue */
.footer {
  background: #2c3e50; padding: 1.8rem 1rem; text-align: center; margin-top: auto; border-top: none;
}
.footer p { margin: 0; color: #ecf0f1; font-size: 0.9rem; letter-spacing: 0.3px; }

/* Modal styles from KeywordSearch.vue */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(30, 40, 50, 0.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; overflow-y: auto; padding: 2rem;
  backdrop-filter: blur(4px);
}
.place-detail-modal {
  background-color: #ffffff; border-radius: 12px;
  width: 95%; max-width: 1100px; max-height: calc(100vh - 4rem);
  overflow-y: auto; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex; flex-direction: column;
  animation: modalFadeIn 0.3s ease-out; border: none;
}
@keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.75rem; border-bottom: 1px solid #eef2f7;
  position: sticky; top: 0; background-color: #ffffff; z-index: 10;
}
.modal-title-location {
  display: flex; flex-direction: row; align-items: baseline;
  flex: 1; margin-right: 1rem; gap: 0.75rem;
}
.modal-title-location h3 {
  margin: 0; font-size: 1.4rem; font-weight: 600; color: #2c3e50;
  font-family: 'Noto Sans KR', sans-serif; line-height: 1.3;
}
.modal-location {
  color: #7f8c8d; font-size: 0.9rem; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}
.modal-actions { display: flex; align-items: center; gap: 0.75rem; }
.close-btn, .heart-btn {
  background: none; border: none; cursor: pointer; padding: 0.6rem;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; transition: all 0.25s ease; color: #95a5a6;
}
.close-btn:hover, .heart-btn:hover { background-color: #f4f6f8; color: #52616B; }
.heart-btn svg { width: 22px; height: 22px; }
.close-btn svg { width: 20px; height: 20px; }
.heart-btn.active { color: var(--logo-coral, #ff715e); }
.heart-btn.active:hover { background-color: #fff0ee; }

.modal-content {
  padding: 1.75rem; display: flex; flex-direction: column;
  gap: 1.75rem; overflow-y: auto;
}
.visual-section { display: flex; gap: 1.75rem; }
.detail-image-container, .detail-map-container {
  flex: 1; height: 380px; border-radius: 10px; overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); background-color: #f0f2f5;
}
.detail-image, .detail-map { width: 100%; height: 100%; object-fit: cover; }

.detail-section {
  padding: 1.5rem; border-radius: 10px; background-color: #fdfdfe;
  border: 1px solid #eef2f7;
}
.detail-section:last-child { margin-bottom: 0; }
.detail-section h4 {
  font-size: 1.15rem; font-weight: 600; color: #34495e;
  margin: 0 0 1rem 0; border-bottom: 1px solid #dde2e7;
  padding-bottom: 0.75rem; font-family: 'Noto Sans KR', sans-serif;
}
.tag-list { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.tag {
  background-color: #eaf6ff; color: #2979ff; font-size: 0.85rem;
  padding: 0.4rem 0.9rem; border-radius: 16px; cursor: pointer;
  transition: all 0.2s ease; font-weight: 500;
}
.tag:hover { background-color: #d1e7fd; color: #1a63d4; transform: translateY(-1px); }
.detail-description { font-size: 0.95rem; line-height: 1.75; color: #52616B; margin: 0; }

/* Dimension styles from KeywordSearch.vue modal */
.detail-dimensions { display: flex; flex-direction: column; gap: 0.8rem; }
.dimension-item { display: flex; align-items: center; gap: 1rem; }
.dimension-name { width: 130px; font-size: 0.9rem; color: #52616B; font-weight: 500; }
.dimension-bar-small { flex: 1; height: 8px; background-color: #e8eaed; border-radius: 4px; overflow: hidden; }
.dimension-fill { height: 100%; background: linear-gradient(90deg, var(--logo-blue, #4fc3f7), var(--logo-green, #81c784)); border-radius: 4px; transition: width 0.6s ease-out; }
.dimension-value { width: 35px; font-size: 0.85rem; font-weight: 500; color: #52616B; text-align: right; }

/* Review styles from KeywordSearch.vue modal */
.reviews-container { display: flex; flex-direction: column; gap: 1.25rem; }
.review-item { padding: 1.25rem; background-color: #ffffff; border-radius: 8px; border: 1px solid #eef2f7; }
.review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem; }
.reviewer-info { display: flex; flex-direction: column; }
.reviewer-name { font-weight: 600; color: #34495e; font-size: 0.95rem; margin-bottom: 0.1rem; }
.review-date { font-size: 0.8rem; color: #95a5a6; }
.review-rating { font-size: 1.1rem; line-height: 1; }
.star-filled { color: var(--logo-yellow, #fbc02d); }
.star-empty { color: #e0e0e0; }
.review-content { font-size: 0.9rem; line-height: 1.65; color: #52616B; }

.modal-footer {
  padding: 1.25rem 1.75rem; border-top: 1px solid #eef2f7;
  display: flex; justify-content: flex-end; gap: 0.75rem;
  position: sticky; bottom: 0; background-color: #f9fafb; z-index: 1;
}
.cancel-btn {
  padding: 0.6rem 1.25rem; border-radius: 20px; font-size: 0.9rem;
  font-weight: 500; cursor: pointer; transition: all 0.2s ease;
  background-color: #e9ecef; color: #495057; border: none;
}
.cancel-btn:hover { background-color: #dee2e6; color: #343a40; }

/* Stats section styles from KeywordSearch.vue */
.stats-section h4 { text-align: left; }
.stats-charts { display: flex; gap: 1.75rem; justify-content: space-around; align-items: flex-start; padding: 0.5rem 0 0; flex-wrap: wrap; }
.chart-container {
  flex: 1 1 45%; min-width: 280px; display: flex; flex-direction: column; align-items: center;
  padding: 1rem; background-color: transparent; border-radius: 8px; min-height: 372px;
}
.chart-container h5 { font-size: 0.95rem; font-weight: 500; color: #495057; margin-bottom: 1rem; text-align: center; }
.age-chart-wrapper { width: 100%; max-width: 308px; height: 308px; position: relative; }
.age-chart-wrapper canvas { width: 100% !important; height: 100% !important; }
.no-age-data, .no-gender-data, .no-stats-data {
  display: flex; justify-content: center; align-items: center; height: 120px; width: 100%;
  color: #7f8c8d; font-size: 0.85rem; background-color: #f0f2f5;
  border-radius: 6px; padding: 1rem; text-align: center; margin-top: 0.5rem;
}
.gender-chart-container { display: flex; flex-direction: column; align-items: center; width: 100%; padding-top: 40px; }
.gender-icons-wrapper { display: flex; justify-content: center; gap: 2rem; margin-bottom: 1.25rem; width: 100%; }
.gender-figure-container { display: flex; gap: 1.5rem; }
.gender-icon { display: flex; flex-direction: column; align-items: center; text-align: center; }
.icon-container { width: 80px; height: auto; margin-bottom: 0.5rem; }
.icon-container svg { width: 100%; height: auto; }
.male-icon-svg .icon-background, .female-icon-svg .icon-background { fill: #eef2f7; }
.gender-label-percent { font-size: 0.85rem; font-weight: 500; color: #343a40; }
.gender-label-percent .percent-value { font-weight: 700; }
.gender-percentage-bar {
  width: 100%; max-width: 250px; height: 10px; display: flex;
  border-radius: 5px; overflow: hidden; background-color: #eef2f7;
}
.male-percentage { background-color: #4c7bd8; height: 100%; transition: width 0.5s ease-in-out; }
.female-percentage { background-color: #e5518d; height: 100%; transition: width 0.5s ease-in-out; }
.stats-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; color: #6c757d; }


/* Responsive adjustments from KeywordSearch.vue (simplified) */
@media (max-width: 1100px) {
  .top-section { grid-template-columns: 1fr; } /* Stack top sections earlier */
  .visual-section { flex-direction: column; gap: 1.5rem; }
  .detail-image-container, .detail-map-container { width: 100%; height: 320px; }
  .dimension-name { width: 110px; }
}
@media (max-width: 768px) {
  .modal-header { padding: 1rem 1.25rem; }
  .modal-title-location h3 { font-size: 1.25rem; }
  .modal-location { font-size: 0.85rem; }
  .modal-content, .detail-section { padding: 1.25rem; gap: 1.25rem; }
  .visual-section { gap: 1.25rem; }
  .detail-image-container, .detail-map-container { height: 280px; }
  .detail-section h4 { font-size: 1.1rem; padding-bottom: 0.6rem; margin-bottom: 0.8rem; }
  .tag { font-size: 0.8rem; padding: 0.35rem 0.8rem; }
  .dimension-name { width: 100px; font-size: 0.85rem; }
  .results-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  .stats-charts { flex-direction: column; align-items: center; gap: 1.25rem; }
  .chart-container { flex-basis: 100%; max-width: 100%; padding: 0.75rem; min-height: 342px; }
  .age-chart-wrapper { max-width: 286px; height: 286px; }
}
@media (max-width: 600px) {
  .results-grid { grid-template-columns: 1fr; }
  .modal-overlay { padding: 1rem; }
  .place-detail-modal { max-height: calc(100vh - 2rem); }
  .modal-header { padding: 0.75rem 1rem; }
  .modal-title-location h3 { font-size: 1.1rem; }
  .modal-content, .detail-section { padding: 1rem; gap: 1rem; }
  .visual-section { gap: 1rem; }
  .detail-image-container, .detail-map-container { height: 220px; }
  .dimension-item { flex-direction: column; align-items: flex-start; gap: 0.3rem; }
  .dimension-name { width: auto; margin-bottom: 0.2rem; }
  .dimension-bar-small { width: 100%; }
  .dimension-value { width: auto; text-align: left; margin-top: 0.1rem; }
}

/* Original LogoSearch specific responsive (keep if needed, or merge) */
/* @media (max-width: 900px) { ... } */
/* @media (max-width: 480px) { ... } */

/* Ensure active hearts are filled red */
.heart-indicator.active svg {
  fill: #e53e3e; /* Red fill for active card heart */
  stroke: #e53e3e; /* Red stroke for active card heart */
}

.heart-btn.active svg {
  fill: #e53e3e; /* Red fill for active modal heart */
  stroke: #e53e3e; /* Red stroke for active modal heart */
}

/* AI Intro Section Styles - Inspired by OnboardingPage.vue feature-section */
.ai-intro-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 3rem;
  min-height: 350px;
    opacity: 0;
  transform: translateY(30px);
  animation: fadeInUpDelayed 1s ease-out 0.3s forwards;
  }

@keyframes fadeInUpDelayed {
  to {
    opacity: 1;
    transform: translateY(0); 
  }
}

/* Analysis Panel Intro Styles */
/* Styles moved to end of file - see improved analysis-intro-section styles below */

/* 분석 테이블 컨테이너 개선 */
.analysis-table-container {
  overflow: auto;
  border-radius: 8px;
  height: 100%;
  border: 1px solid #eef2f7;
  flex: 1;
  min-height: 300px; /* 최소 높이 보장 */
}

/* 반응형 디자인 개선 */
@media (max-width: 1024px) {
  .analysis-results-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    min-height: 350px;
  }
  
  .results-right {
    min-height: 200px;
    padding: 1.5rem;
  }
  
  .process-spinner-container {
    height: 160px;
    transform: translateY(-10px); /* -40px에서 -10px로 줄임 */
  }
  
  .process-spinner-container.fade-in {
    transform: translateY(-20px); /* -60px에서 -20px로 줄임 */
  }
  
  .analysis-intro-section.slide-up .analysis-intro-right {
    transform: translateY(-60px); /* -80px에서 -60px로 줄임 */
    transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  
  .analysis-intro-section {
    flex-direction: column;
    gap: 1.5rem;
    min-height: 300px;
    padding: 1.5rem;
  }
  
  .analysis-intro-left {
    text-align: center;
  }
  
  .analysis-intro-heading {
    font-size: 1.6rem;
  }
  
  .analysis-features {
    flex-direction: column;
  }
  
  .analysis-feature-item {
    min-width: auto;
    flex-direction: row;
    text-align: left;
  }
  
  .analysis-feature-image {
    margin-right: 1rem;
    margin-bottom: 0;
    align-self: flex-start;
  }
  
  .analysis-feature-text {
    align-items: flex-start;
  }
  
  .analysis-feature-title {
    text-align: left;
  }
  
  .analysis-feature-desc {
    text-align: left;
  }
}

@media (max-width: 768px) {
  .analysis-results-content {
    gap: 1rem;
    min-height: 300px;
  }
  
  .results-right {
    min-height: 150px;
    padding: 1rem;
  }
  
  .coming-soon-title {
    font-size: 1.1rem;
  }
  
  .coming-soon-description {
    font-size: 0.9rem;
  }
  
  .process-spinner-container {
    height: 140px;
    transform: translateY(-5px); /* -20px에서 -5px로 줄임 */
  }
  
  .process-spinner-container.fade-in {
    transform: translateY(-15px); /* -40px에서 -15px로 줄임 */
  }
  
  .analysis-intro-section.slide-up .analysis-intro-right {
    transform: translateY(-60px); /* -100px에서 -60px로 줄임 */
  }
  
  .analysis-intro-section {
    padding: 1rem;
    min-height: 300px;
    gap: 1rem;
  }
  
  .analysis-intro-tag {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    padding-left: 1rem;
  }
  
  .analysis-intro-tag::before {
    width: 4px;
    height: 14px;
  }
  
  .analysis-intro-heading {
    font-size: 1.4rem;
  }
  
  .analysis-features {
    gap: 1rem;
  }
  
  .analysis-feature-item {
    padding: 1rem;
  }
  
  .analysis-feature-image {
    width: 48px;
    height: 48px;
    margin-right: 1rem;
  }
  
  .analysis-feature-title {
    font-size: 1rem;
  }
  
  .analysis-feature-desc {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .analysis-results-content {
    min-height: 250px;
  }
  
  .results-right {
    min-height: 120px;
    padding: 0.75rem;
  }
  
  .coming-soon-icon svg {
    width: 36px;
    height: 36px;
  }
  
  .coming-soon-title {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .coming-soon-description {
    font-size: 0.85rem;
  }
  
  .analysis-intro-heading {
    font-size: 1.2rem;
  }
}

/* Analysis Panel Intro Styles */
/* Styles moved to end of file - see improved analysis-intro-section styles below */

/* analysis-intro-section 슬라이드 애니메이션 개선 */
.analysis-intro-section {
  padding: 2rem;
  display: flex;
  gap: 2rem;
  align-items: stretch;
  min-height: 300px;
  flex-direction: column; /* 상하 배치로 변경 */
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(0);
}

.analysis-intro-section.slide-up {
  min-height: 200px;
}

.analysis-intro-section.slide-up .analysis-intro-left {
  opacity: 0;
  transform: translateY(-50px);
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  pointer-events: none;
  display: none; /* 완전히 숨김 */
}

.analysis-intro-section.slide-up .analysis-intro-right {
  transform: translateY(-60px); /* -80px에서 -60px로 줄임 */
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.analysis-intro-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #666;
  margin-top: 1.5rem;
  font-family: 'Noto Sans KR', sans-serif;
}

.analysis-intro-left {
  flex: none; /* flex 제거 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center; /* 중앙 정렬로 변경 */
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.analysis-intro-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.panel-content.no-header {
  padding: 0;
}

.analysis-intro-tag {
  display: inline-block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--logo-blue, #48b0e4);
  margin-bottom: 1.5rem;
  font-family: 'Noto Sans KR', sans-serif;
  position: relative;
  padding-left: 1.2rem;
}

.analysis-intro-tag::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 18px;
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  border-radius: 3px;
}

.analysis-intro-heading {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
  line-height: 1.3;
  font-family: 'Noto Sans KR', sans-serif;
  background: linear-gradient(270deg,
      #48b0e4 0%,
      #76b39d 15%,
      #3a9cd1 25%,
      #48b0e4 35%,
      #48b0e4 65%,
      #76b39d 75%,
      #3a9cd1 85%,
      #48b0e4 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: analysisWaveAnimation 6s linear infinite;
}

@keyframes analysisWaveAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.analysis-features {
  display: flex;
  flex-direction: row; /* 좌우 배치로 변경 */
  gap: 1.2rem;
  flex-wrap: wrap; /* 반응형을 위해 wrap 추가 */
}

.analysis-feature-item {
  display: flex;
  align-items: center;
  text-align: left;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fdff 0%, #f0f8ff 100%);
  border-radius: 12px;
  border: 1px solid rgba(72, 176, 228, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(72, 176, 228, 0.05);
  flex: 1; /* 동일한 너비로 배치 */
  min-width: 280px; /* 최소 너비 설정 */
  flex-direction: column; /* 내부 요소들을 세로로 배치 */
  text-align: center; /* 텍스트 중앙 정렬 */
}

.analysis-feature-item:hover {
  transform: translateX(6px);
  box-shadow: 0 6px 20px rgba(72, 176, 228, 0.2);
  border-color: rgba(72, 176, 228, 0.3);
}

.analysis-feature-image {
  margin-right: 0; /* 마진 제거 */
  margin-bottom: 1rem; /* 하단 마진 추가 */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(72, 176, 228, 0.15), rgba(118, 179, 157, 0.15));
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(72, 176, 228, 0.1);
  align-self: center; /* 중앙 정렬 */
}

.analysis-feature-logo {
  width: 70%;
  height: 70%;
  object-fit: contain;
  border-radius: 4px;
}

.analysis-feature-svg {
  width: 70%;
  height: 70%;
  color: var(--logo-blue, #48b0e4);
}

.analysis-feature-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center; /* 중앙 정렬 */
}

.analysis-feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 1.4;
  text-align: center; /* 중앙 정렬 */
}

.analysis-feature-desc {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  font-family: 'Noto Sans KR', sans-serif;
  text-align: center; /* 중앙 정렬 */
}

.process-spinner-container {
  margin-top: 1rem; /* 0.5rem에서 1rem으로 늘림 */
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: visible;
  opacity: 0;
  transform: translateY(-10px); /* -30px에서 -10px로 줄임 */
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.process-spinner-container.fade-in {
  opacity: 1;
  transform: translateY(-50px); /* 더 위로 이동한 최종 위치 */
}

/* 분석 결과 섹션 스타일 */
.analysis-results-container {
  margin-top: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out 0.3s forwards;
  display: grid;
  grid-template-columns: 1fr 1fr; /* 두 패널을 동일한 너비로 배치 */
  gap: 2rem;
  min-height: 500px;
}

/* 왼쪽 패널 스타일 */
.analysis-results-left-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 오른쪽 패널 스타일 */
.analysis-results-right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 분석 테이블 컨테이너 개선 */
.analysis-table-container {
  overflow: auto;
  border-radius: 8px;
  height: 100%;
  border: 1px solid #eef2f7;
  flex: 1;
  min-height: 400px; /* 최소 높이 보장 */
}

/* 지도 검색 컨테이너 스타일 개선 */
.map-search-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1; /* 부모 컨테이너를 가득 채움 */
}

.map-container-wrapper {
  flex: 1;
  position: relative;
  min-height: 350px; /* 높이 증가 */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eef2f7;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 350px; /* 높이 증가 */
  background: #fcfcfa; /* LookAround.vue와 동일한 배경색 */
  position: relative;
  z-index: 2;
}

/* 반응형 디자인 개선 */
@media (max-width: 1024px) {
  .analysis-results-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    min-height: 700px; /* 세로 배치 시 높이 조정 */
  }
  
  .map-container-wrapper {
    min-height: 300px;
  }
  
  .map-container {
    min-height: 300px;
  }
  
  .analysis-table-container {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .analysis-results-container {
    gap: 1rem;
    min-height: 600px;
  }
  
  .map-container-wrapper {
    min-height: 250px;
  }
  
  .map-container {
    min-height: 250px;
  }
  
  .analysis-table-container {
    min-height: 250px;
  }
}

.coming-soon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.coming-soon-icon {
  color: var(--logo-blue, #48b0e4);
  opacity: 0.7;
  margin-bottom: 0.5rem;
}

.coming-soon-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
}

.coming-soon-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
}

/* D3.js Map Styles - MyTravel 스타일 적용 */
.map-search-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-family: 'Noto Sans KR', sans-serif;
}

.map-search-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.map-back-button {
  margin-bottom: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.back-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

/* 새로운 오버레이 뒤로가기 버튼 스타일 */
.map-back-button-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  pointer-events: none; /* 컨테이너는 마우스 이벤트 차단 */
}

.back-btn-overlay {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  pointer-events: auto; /* 버튼 자체는 클릭 가능 */
}

.back-btn-overlay:hover {
  background-color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 선택된 지역 표시 - 왼쪽 하단 */
.selected-location-display {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #2d3748;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  pointer-events: none;
  border: 2px solid rgba(76, 175, 80, 0.3); /* 초록색 테두리로 선택됨 강조 */
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 호버된 지역 표시 - 오른쪽 위 */
.hover-location-display {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(72, 176, 228, 0.95);
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  color: white;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  pointer-events: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 2px solid rgba(255, 255, 255, 0.3); /* 흰색 테두리로 호버 강조 */
}

/* 라벨과 지역명 스타일 */
.location-label {
  font-weight: 500;
  opacity: 0.8;
  font-size: 0.85rem;
}

.location-name {
  font-weight: 700;
  font-size: 0.95rem;
}

/* 기존 selected-region-info 스타일 제거 */
.selected-region-info {
  display: none;
}

.region-badge {
  display: none;
}

.map-container-wrapper {
  flex: 1;
  position: relative;
  min-height: 350px; /* 높이 증가 */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eef2f7;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 350px; /* 높이 증가 */
  background: #fcfcfa; /* LookAround.vue와 동일한 배경색 */
  position: relative;
  z-index: 2;
}

/* Map SVG styles - LookAround.vue와 동일한 스타일 적용 */
.map-container svg {
  width: 100%;
  height: 100%;
  pointer-events: all; /* SVG가 마우스 이벤트를 받도록 보장 */
}

/* 지역 호버 및 선택 효과 - LookAround.vue와 동일 */
.region, .sig {
  transition: all 0.3s ease;
  cursor: pointer;
  pointer-events: all; /* path 요소가 마우스 이벤트를 받도록 보장 */
}

.region:hover, .sig:hover {
  filter: brightness(1.05);
}

.region.selected, .sig.selected {
  stroke-width: 1.5px;
  filter: brightness(1.05);
}

.map-container .region,
.map-container .sig-region,
.map-container .sig {
  cursor: pointer;
  pointer-events: all;
}

/* 기존 툴팁 스타일 제거 - hover-location-display로 대체 */

/* Map responsive styles */
@media (max-width: 1024px) {
  .map-container-wrapper {
    min-height: 250px;
  }
  
  .map-container {
    min-height: 250px;
  }
}

@media (max-width: 768px) {
  .map-search-title {
    font-size: 1.1rem;
  }
  
  .map-search-description {
    font-size: 0.85rem;
  }
  
  .map-container-wrapper {
    min-height: 200px;
  }
  
  .map-container {
    min-height: 200px;
  }
  
  .back-btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
  
  .region-badge {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
  
  /* 모바일에서 display 크기 조정 */
  .selected-location-display,
  .hover-location-display {
    font-size: 0.8rem;
    padding: 8px 12px;
    gap: 4px;
  }
  
  .selected-location-display .location-label,
  .hover-location-display .location-label {
    font-size: 0.75rem;
  }
  
  .selected-location-display .location-name,
  .hover-location-display .location-name {
    font-size: 0.85rem;
  }
}
</style>