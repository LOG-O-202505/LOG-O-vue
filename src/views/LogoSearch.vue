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
          <div class="panel-header">
            <h3 class="panel-title">이미지 분석 요청</h3>
          </div>
          <div class="panel-content">
            <div class="image-container">
              <img v-if="imagePreview" :src="imagePreview" alt="이미지 미리보기" class="preview-image">
              <div v-else class="upload-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>이미지를 선택하면 여기에 표시됩니다</p>
              </div>
            </div>
            <div class="button-group">
              <button v-if="isLoading" @click="cancelAnalysis" class="btn btn-danger btn-cancel-analysis">
                <!-- SVG for cancel -->
                분석 취소하기
              </button>
              <button v-if="!analysisResult && !isLoading" @click="triggerFileInput" class="btn btn-primary">
                <!-- SVG for upload -->
                이미지 선택하기
              </button>
              <button v-if="imageFile && !analysisResult && !isLoading" @click="analyzeCurrentImage"
                class="btn btn-analyze">
                이미지 분석하기
              </button>
              <button v-if="(imageFile || analysisResult) && !isLoading" @click="reset" class="btn btn-secondary">
                초기화
              </button>
              <div v-if="analysisResult && !isLoading" class="analysis-timing">
                <div class="timing-item">
                  <span class="timing-label">AI 이미지 분석:</span>
                  <span class="timing-value">{{ imageAnalysisDuration }}초</span>
                </div>
                <div class="timing-item">
                  <span class="timing-label">AI 의미 분석:</span>
                  <span class="timing-value">{{ meaningAnalysisDuration }}초</span>
                </div>
                <div class="timing-item">
                  <span class="timing-label">벡터 검색:</span>
                  <span class="timing-value">{{ searchDuration }}초</span>
                </div>
                <div class="timing-divider"></div>
                <div class="timing-total">
                  <span class="timing-label">처리 시간:</span>
                  <span class="timing-value">{{ totalProcessingTime }}초</span>
              </div>
            </div>
            </div>
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden-input">
          </div>
        </div>

        <!-- 오른쪽: 분석 차트 패널 -->
        <div class="analysis-panel panel-style"> <!-- Added panel-style -->
          <div class="panel-header">
            <h3 class="panel-title">
              {{ isLoading ? '이미지 분석 중...' : (analysisResult ? '이미지 분석 결과' : '분석 데이터') }}
            </h3>
          </div>
          <div class="panel-content" :class="{ 'no-padding': isLoading }">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner-container">
                <ProcessSpinner 
                  :currentPhase="loadingPhase"
                  :imageAnalysisDuration="imageAnalysisDuration"
                  :meaningAnalysisDuration="meaningAnalysisDuration"
                  :searchDuration="searchDuration"
                  :processingResultsDuration="processingResultsDuration"
                />
              </div>
            </div>
            <div v-else-if="!analysisResult" class="guide-state">
              <div class="guide-icon">
                <!-- SVG for guide -->
              </div>
              <p class="guide-description">
                원하는 분위기의 이미지를 업로드하면 AI가 분석하여 유사한 여행지를 추천해드립니다
              </p>
              <div class="steps-container">
                <!-- Style for steps -->
              </div>
            </div>
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
                  <!-- Legacy object format can be removed if p_vector is always array -->
                </tbody>
              </table>
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
import Chart from 'chart.js/auto'; // Import Chart.js
import PlaceDetailModal from "@/components/PlaceDetailModal.vue";
import SearchResultPanel from "@/components/SearchResultPanel.vue";
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

    const triggerFileInput = () => fileInput.value.click();
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) store.commit("image/setFile", file);
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
          
        // 검색 결과 처리 상태를 1.5초간 표시
        loadingPhase.value = 'processingResults';
        const processingResultsStartTime = performance.now();
        await new Promise(resolve => setTimeout(resolve, 1500));
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
      reset();
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

    return {
      // Core
      imageFile, imagePreview, isLoading, analysisResult, searchResults, sortedSearchResults, formattedSearchResults,
      fileInput, loadingPhase, imageAnalysisDuration, meaningAnalysisDuration, searchDuration, processingResultsDuration, totalProcessingTime,
      triggerFileInput, handleFileChange, analyzeCurrentImage, reset, searchSimilarHandler, cancelAnalysis,
      // Hero
      showHero, heroImageSrc, heroTitle, heroSubtitle, heroHeight,
      // Dimensions
      dimensionResults, getDimensionLabel, // Keep getDimensionLabel from KeywordSearch
      // Modal
      showDetailModal, selectedDetail, wishlistItems, openDetailModal, closeDetailModal, 
      isInWishlist, toggleWishlist, initDetailMap, formatReviewDate,
      // Stats
      ageStats, genderStats, totalStatsVisits, isLoadingStats, ageChartCanvas,
      totalAgeVisits, malePercentage, femalePercentage, getColorForAge, // renderAgeChart is called by watch
      // Misc
      formatSimilarityScore, actionStatus, // showActionStatus can be added if needed
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
}

/* Panel common styles from KeywordSearch.vue (using .panel-style as a common class) */
.panel-style { /* This class will be added to upload-panel, analysis-panel, results-panel */
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid #eef2f7;
}

.panel-style:hover { /* Apply hover to .panel-style */
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 1.2rem 1.5rem;
  background: #fff;
  border-bottom: 2px solid #eef2f7;
  position: relative;
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
}
.panel-content.no-padding { padding: 0; }


/* Styles for .top-section, .upload-panel, .analysis-panel from original LogoSearch */
.top-section {
  display: grid;
  grid-template-columns: 400px 1fr; /* Original: 400px 1fr */
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }


/* Image Upload Panel Specifics (from original LogoSearch, ensure they blend) */
.image-container {
  background-color: #f0f2f5; /* Slightly different from KS for distinction if needed */
  border-radius: 12px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 2px dashed #d1d8e0; /* Softer dash */
  transition: all 0.3s ease;
  position: relative;
}
.image-container:hover {
  border-color: var(--logo-blue, #48b0e4);
  background-color: rgba(var(--logo-blue-rgb, 72, 176, 228), 0.05);
}
.upload-placeholder { display: flex; flex-direction: column; align-items: center; color: #6c757d; text-align: center; }
.upload-placeholder svg { margin-bottom: 1rem; color: var(--logo-blue, #48b0e4); }
.upload-placeholder p { margin: 0; font-size: 0.9rem; }
.preview-image { max-width: 100%; max-height: 100%; object-fit: contain; }

.button-group { display: flex; flex-direction: column; gap: 0.75rem; }
.btn { /* General button styling from KS */
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.25rem; border: none; border-radius: 25px; /* Pill shape */
  font-family: 'Nunito', 'Noto Sans KR', sans-serif; font-weight: 600; font-size: 0.9rem;
  cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
.btn-primary { background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d)); color: white; }
.btn-primary:hover { background: linear-gradient(135deg, #3a9cd1, #67a58d); }
.btn-analyze { /* Specific for analyze if needed, or use primary */
  background: linear-gradient(135deg, var(--logo-green, #76b39d), var(--logo-blue, #48b0e4)); color: white;
}
.btn-analyze:hover { background: linear-gradient(135deg, #67a58d, #3a9cd1); }
.btn-secondary { background-color: #e9ecef; color: #495057; border: 1px solid #ced4da; }
.btn-secondary:hover { background-color: #dde2e6; }
.btn-danger { background-color: #e74c3c; color: white; }
.btn-danger:hover { background-color: #c0392b; }
.hidden-input { display: none; }

.analysis-timing { 
  margin-top: 1rem;
  padding: 1rem; 
  border-radius: 8px; 
  background-color: #f8f9fa; 
  border: 1px solid #eef2f7; 
}
.timing-item { 
  display: flex;
  justify-content: space-between; 
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}
.timing-item:last-of-type {
  margin-bottom: 0.75rem; /* 마지막 항목 아래 여백 추가 */
}
.timing-divider {
  height: 1px;
  background-color: #eef2f7;
  margin: 0.75rem 0;
}
.timing-total {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}
.timing-label { color: #5f6b7a; }
.timing-value {
  font-weight: 600;
  color: var(--logo-blue, #48b0e4); 
}
.timing-total .timing-value {
  color: #10b981; /* 총 처리 시간은 녹색으로 표시 */
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

</style>