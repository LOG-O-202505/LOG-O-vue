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

    <!-- 컨텐츠 영역 - 히어로 섹션과 겹치지 않게 여백 추가 -->
    <div class="content-wrapper">
      <!-- 로딩 중일 때 로딩 스피너 표시 -->
      
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
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>이미지를 선택하면 여기에 표시됩니다</p>
              </div>
            </div>

            <!-- 버튼 영역 -->
            <div class="button-group">
              <button v-if="isLoading" @click="cancelAnalysis" class="btn btn-danger btn-cancel-analysis">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                분석 취소하기
              </button>

              <button v-if="!analysisResult && !isLoading" @click="triggerFileInput" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                이미지 선택하기
              </button>

              <button v-if="imageFile && !analysisResult && !isLoading" @click="analyzeCurrentImage"
                class="btn btn-analyze">
                이미지 분석하기
              </button>

              <button v-if="(imageFile || analysisResult) && !isLoading" @click="reset" class="btn btn-secondary">
                초기화
              </button>

              <!-- 분석 시간 정보 추가 -->
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
              </div>
            </div>

            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden-input">
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
            <!-- 로딩 중일 때 - 로딩 스피너 -->
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner-container">
                <LoadingSpinner 
                  :currentPhase="loadingPhase"
                  :imageAnalysisDuration="imageAnalysisDuration"
                  :meaningAnalysisDuration="meaningAnalysisDuration"
                  :searchDuration="searchDuration"
                />
              </div>
            </div>

            <!-- 분석 결과가 없을 때 -->
            <div v-else-if="!analysisResult" class="guide-state">
              <div class="guide-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
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
                  <!-- Array format (p_vector) -->
                  <template v-if="Array.isArray(dimensionResults)">
                    <tr v-for="(score, index) in dimensionResults" :key="'dim-'+index">
                      <td class="dimension-name">{{ getDimensionHeader(index) }}</td>
                      <td class="dimension-score">{{ typeof score === 'number' ? score.toFixed(1) : score }}</td>
                      <td class="dimension-bar">
                        <div class="bar-container">
                          <div class="bar" :style="{ width: `${typeof score === 'number' ? score * 100 : 0}%` }"></div>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <!-- Object format (old style) -->
                  <template v-else>
                    <tr v-for="(score, dimension) in dimensionResults" :key="dimension">
                      <td class="dimension-name">{{ getDimensionHeader(dimension) }}</td>
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
              <div v-for="(result, index) in sortedSearchResults" :key="result._id" class="result-card"
                @click="openDetailModal(result)">
                <div class="result-rank" :class="{ 'with-heart': isInWishlist(result._id) }">
                  <span v-if="isInWishlist(result._id)" class="heart-indicator active">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </span>
                  <span class="rank-number">{{ index + 1 }}</span>
                </div>
                <div class="result-image-container">
                  <img v-if="result._source.p_image" :src="`data:image/jpeg;base64,${result._source.p_image}`" :alt="result._source.p_name"
                    class="result-image">
                  <div v-else class="placeholder-image">이미지 없음</div>
                </div>
                <div class="result-info">
                  <h4 class="result-name">{{ result._source.p_name }}</h4>
                  <div class="result-location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ result._source.p_address }}
                  </div>
                  <div class="result-similarity">
                    <span>유사도:</span>
                    <div class="similarity-bar">
                      <div class="similarity-fill"
                        :style="{ width: `${formatSimilarityScore(result._score).percentage}%` }"></div>
                    </div>
                    <div class="similarity-info">
                      <span class="similarity-percentage">{{ formatSimilarityScore(result._score).percentage }}%</span>
                      <span class="similarity-description">{{ formatSimilarityScore(result._score).description }}</span>
                    </div>
                  </div>
                  <!-- 키워드 표시 영역 -->
                  <div v-if="result._source.p_tags && result._source.p_tags.length > 0" class="result-tags">
                    <span v-for="(tag, tagIndex) in result._source.p_tags.slice(0, 5)" :key="tagIndex" class="result-tag">
                      {{ tag }}
                    </span>
                  </div>
                  <!-- 이미지 설명 -->
                  <div v-if="result._source.p_description" class="result-description">
                    <div class="description-title">설명:</div>
                    <p class="description-text">{{ result._source.p_description }}</p>
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

    <!-- 장소 상세 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="place-detail-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-location">
            <h3>{{ selectedDetail.p_name }}</h3>
            <div class="modal-location">{{ selectedDetail.p_address }}</div>
          </div>
          <div class="modal-actions">
            <button class="heart-btn" :class="{ 'active': isInWishlist(selectedDetail._id) }"
              @click="toggleWishlist(selectedDetail)" title="여행 계획에 추가">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                </path>
              </svg>
            </button>
            <button class="close-btn" @click="closeDetailModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
                
        <div class="modal-content">
          <!-- 이미지와 지도 섹션 (수평 레이아웃) -->
          <div class="visual-section">
            <div class="detail-image-container">
              <img v-if="selectedDetail.p_image" :src="`data:image/jpeg;base64,${selectedDetail.p_image}`" :alt="selectedDetail.p_name"
                class="detail-image">
              <div v-else class="placeholder-image">이미지 없음</div>
            </div>
                
            <!-- 지도 영역 -->
            <div class="detail-map-container">
              <div id="detailMap" class="detail-map"></div>
            </div>
          </div>
          
          <!-- 태그 섹션 -->
          <div v-if="selectedDetail.p_tags && selectedDetail.p_tags.length > 0" class="detail-section">
            <h4>태그</h4>
            <div class="tag-list">
              <span v-for="(tag, index) in selectedDetail.p_tags" :key="index" class="tag">{{ tag }}</span>
            </div>
          </div>

          <!-- 설명 섹션 -->
          <div v-if="selectedDetail.p_description" class="detail-section">
            <h4>설명</h4>
            <p class="detail-description">{{ selectedDetail.p_description }}</p>
          </div>
          
          <!-- 특성 분석 섹션 -->
          <div v-if="selectedDetail.p_vector" class="detail-section">
            <h4>특성 분석</h4>
            <div class="detail-dimensions">
              <div v-for="(value, index) in selectedDetail.p_vector" :key="index" class="dimension-item">
                <span class="dimension-name">{{ getDimensionHeader(index) }}</span>
                <div class="dimension-bar-small">
                  <div class="dimension-fill" :style="{ width: `${value * 100}%` }"></div>
                </div>
                <span class="dimension-value">{{ value.toFixed(1) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 리뷰 섹션 (더미 데이터로 추가) -->
          <div v-if="selectedDetail.reviews && selectedDetail.reviews.length > 0" class="detail-section">
            <h4>방문자 리뷰 ({{ selectedDetail.reviews.length }})</h4>
            <div class="reviews-container">
              <div v-for="(review, index) in selectedDetail.reviews" :key="index" class="review-item">
                <div class="review-header">
                  <div class="reviewer-info">
                    <div class="reviewer-name">{{ review.userName }}</div>
                    <div class="review-date">{{ formatReviewDate(review.date) }}</div>
                  </div>
                  <div class="review-rating">
                    <span v-for="star in 5" :key="star" 
                      :class="{'star-filled': star <= review.rating, 'star-empty': star > review.rating}">
                      ★
                    </span>
                  </div>
                </div>
                <div class="review-content">
                  {{ review.comment }}
                </div>
              </div>
            </div>
          </div>
        </div>
    
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeDetailModal">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useStore } from "vuex";
import Header from "@/components/Header.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {
  searchSimilarImages,
  createFeaturesVector,
  imageToEngDescription,
  EngDescriptionToVector
} from "@/services/api";
import config from "@/config.js";

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
    const isScrolled = ref(false);
    
    // 추가된 헤더/히어로 섹션 속성
    const showHero = ref(true);
    const heroImageSrc = ref('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1470');
    const heroTitle = ref('여행 이미지 분석');
    const heroSubtitle = ref('찾고 있는 분위기의 여행지를 발견하세요');
    const heroHeight = ref('320px');

    // 추가된 API 단계 및 타이밍 상태
    const loadingPhase = ref('analysis');
    const imageAnalysisDuration = ref(null);
    const meaningAnalysisDuration = ref(null);
    const searchDuration = ref(null);

    // 카카오 지도 관련 변수
    let kakaoMap = null;
    
    // 카카오 지도 API 로드 함수
    const loadKakaoMapsScript = () => {
      return new Promise((resolve, reject) => {
        // 이미 로드된 경우
        if (window.kakao && window.kakao.maps) {
          console.log("카카오 맵 API가 이미 로드되어 있습니다");
          resolve();
          return;
        }

        console.log("카카오 맵 API 로드 시작...");
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${config.KAKAO_MAPS_API_KEY}&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            console.log("카카오 맵 API 로드 완료!");
            resolve();
          });
        };
        script.onerror = (error) => {
          console.error("카카오 맵 API 로드 실패:", error);
          reject(error);
        };

        document.head.appendChild(script);
      });
    };
    
    // 분석 결과에서 차원 데이터만 필터링
    const dimensionResults = computed(() => {
      if (!analysisResult.value) return null;

      // 새 버전: p_vector 배열이 존재하는 경우
      if (Array.isArray(analysisResult.value.p_vector)) {
        return analysisResult.value.p_vector;
      }
      
      // 기존 버전: 차원 데이터가 개별 키로 존재하는 경우
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
    const dimensionLabels = [
      "자연 요소",
      "도시 특성",
      "수경 요소",
      "계절적 매력",
      "휴식 잠재력",
      "로맨틱한 분위기",
      "활동 기회",
      "역사/문화적 가치",
      "식도락 경험",
      "쇼핑 잠재력"
    ];

    // 차원 헤더 생성 - 이제 인덱스를 받아 해당 레이블 반환
    const getDimensionHeader = (index) => {
      if (typeof index === 'number') {
        return dimensionLabels[index] || `차원 ${index + 1}`;
      } else {
        // 기존 차원 이름이 "Natural Elements" 같은 문자열인 경우 호환성 유지
        const oldMapping = {
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
        
        return oldMapping[index] || index;
      }
    };

    // 더미 리뷰 데이터
    const dummyReviews = [
      {
        userName: "여행자김",
        rating: 5,
        date: "2025-03-15T09:30:00",
        comment: "정말 아름다운 장소였습니다. 사진으로 보는 것보다 실제로 보면 훨씬 더 멋있어요. 특히 일몰 때 분위기가 환상적이었습니다."
      },
      {
        userName: "배낭여행러",
        rating: 4,
        date: "2025-02-20T14:45:00",
        comment: "전체적으로 좋은 경험이었습니다. 다만 주변에 음식점이 많지 않아서 식사 계획은 미리 세우는 것이 좋을 것 같아요."
      },
      {
        userName: "사진작가이준",
        rating: 5,
        date: "2025-01-05T10:15:00",
        comment: "사진 찍기에 최고의 장소입니다. 맑은 날 방문하시면 환상적인 풍경 사진을 얻을 수 있어요. 개인적으로는 아침 일찍 방문하는 것을 추천합니다."
      }
    ];

    // 리뷰 날짜 포맷팅
    const formatReviewDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // 유사도 점수를 사용자 친화적인 형태로 변환 (0-100% 및 텍스트 설명 추가)
    const formatSimilarityScore = (score) => {
      // 0-1 사이의 점수를 0-100% 사이로 변환
      const percentage = Math.round(score * 100);

      // 점수에 따른 텍스트 설명 추가
      let description = "";
      if (percentage >= 90) {
        description = "매우 높음";
      } else if (percentage >= 75) {
        description = "높음";
      } else if (percentage >= 60) {
        description = "중상";
      } else if (percentage >= 40) {
        description = "중간";
      } else if (percentage >= 25) {
        description = "중하";
      } else {
        description = "낮음";
      }

      return {
        percentage,
        description,
      };
    };

    // 현재 단계에 따른 로딩 메시지
    const getLoadingMessage = () => {
      switch (loadingPhase.value) {
        case "imageAnalysis":
          return "이미지 분석 중";
        case "meaningAnalysis":
          return "의미 분석 중";
        case "search":
          return "유사한 여행지 검색 중";
        case "completed":
          return "분석 완료";
        default:
          return "처리 중";
      }
    };

    // 단계 활성화 여부 확인
    const isPhaseActive = (phase) => {
      return loadingPhase.value === phase;
    };

    // 단계 완료 여부 확인
    const isPhaseCompleted = (phase) => {
      const phases = ["imageAnalysis", "meaningAnalysis", "search", "completed"];
      const currentIndex = phases.indexOf(loadingPhase.value);
      const phaseIndex = phases.indexOf(phase);

      return phaseIndex < currentIndex || loadingPhase.value === "completed";
    };

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 100;
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
    onMounted(async () => {
      console.log("LogoSearch 컴포넌트 마운트");
      
      // 스크롤 이벤트 리스너 등록
      window.addEventListener("scroll", handleScroll);

      // 위시리스트 복원
      const savedWishlist = localStorage.getItem('logo_wishlist');
      if (savedWishlist) {
        try {
          const wishlistIds = JSON.parse(savedWishlist);
          console.log('저장된 위시리스트 ID:', wishlistIds);
          
          // 위시리스트 ID만 있는 경우 기본 객체로 변환하여 wishlistItems에 저장
          wishlistItems.value = wishlistIds.map(id => ({
            _id: id,
            _source: {} // 기본 빈 객체 (검색 결과에서 매칭될 때 실제 데이터가 채워질 수 있음)
          }));
        } catch (error) {
          console.error('위시리스트 데이터 로드 오류:', error);
        }
      }

      // 카카오 지도 API 미리 로드
      try {
        await loadKakaoMapsScript();
        console.log("카카오 지도 API 준비 완료");
      } catch (error) {
        console.error("카카오 지도 API 로드 실패:", error);
      }
    });
    
    // 컴포넌트 언마운트 시 실행 - 이벤트 리스너 제거
    watch(() => {
      return () => {
        // 스크롤 이벤트 리스너 제거
        window.removeEventListener("scroll", handleScroll);
        
        // 진행 중인 API 요청 취소
        if (abortController.value) {
          abortController.value.abort();
        }
      };
    });

    // 이미지 선택 시 자동으로 파일명을 이미지 이름으로 설정
    watch(imageFile, (newFile) => {
      if (newFile) {
        // 기존 분석 결과 초기화 (새 이미지 선택 시)
        analysisResult.value = null;
        searchResults.value = [];
      }
    });

    // 상세 모달 관련 상태
    const showDetailModal = ref(false);
    const selectedDetail = ref({});
    const wishlistItems = ref([]);

    // 검색 결과에서 차원 데이터 추출
    const dimensionsFromDetail = computed(() => {
      if (!selectedDetail.value || !selectedDetail.value.dimensions) return {};
      return selectedDetail.value.dimensions;
    });

    // 상세 모달 열기
    const openDetailModal = (result) => {
      // 리뷰 데이터 추가
      const detailWithReviews = {
        _id: result._id,
        _score: result._score,
        ...result._source,
        reviews: dummyReviews,
        p_image: result._source.p_image || ''
      };
      
      selectedDetail.value = detailWithReviews;
      showDetailModal.value = true;

      // 모달이 열린 후 지도 초기화를 위해 nextTick 사용
      nextTick(() => {
        // 약간의 지연 추가로 모달 애니메이션 완료 후 지도 초기화
        setTimeout(() => {
          initDetailMap();
        }, 300);
      });
    };

    // 상세 모달의 지도 초기화
    const initDetailMap = async () => {
      console.log('지도 초기화 함수 호출됨');
  
      const mapContainer = document.getElementById('detailMap');
      if (!mapContainer) {
        console.error('지도 컨테이너를 찾을 수 없습니다');
        return;
      }
      
      try {
        // 카카오맵 API 로드 확인
        if (!window.kakao || !window.kakao.maps) {
          console.log('카카오 맵 API 로드 필요');
          await loadKakaoMapsScript();
        }
        
        // 선택된 장소의 위치 정보 확인
        let lat = 37.5665; // 기본값: 서울
        let lng = 126.9780;
        
        if (selectedDetail.value && selectedDetail.value.location_data) {
          // 위치 데이터가 있는 경우 실제 위치 표시
          const locationData = selectedDetail.value.location_data;
          lat = locationData.latitude || lat;
          lng = locationData.longitude || lng;
        }
        
        // 지도 옵션
        const mapOption = {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3 // 확대 레벨
        };
        
        // 지도 생성
        kakaoMap = new kakao.maps.Map(mapContainer, mapOption);
        
        // 마커 생성
        const markerPosition = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({
          position: markerPosition
        });
        
        // 마커 지도에 표시
        marker.setMap(kakaoMap);
        
        // 인포윈도우 추가
        const infoContent = `
          <div style="padding: 5px; text-align: center;">
            <span style="font-weight: bold;">${selectedDetail.value.p_name || '여행지'}</span>
          </div>
        `;
        
        const infoWindow = new kakao.maps.InfoWindow({
          content: infoContent
        });
        
        // 마커에 마우스 오버 시 인포윈도우 표시
        kakao.maps.event.addListener(marker, 'mouseover', function() {
          infoWindow.open(kakaoMap, marker);
        });
        
        // 마커에 마우스 아웃 시 인포윈도우 숨김
        kakao.maps.event.addListener(marker, 'mouseout', function() {
          infoWindow.close();
        });
        
        console.log('카카오 지도 초기화 완료');
      } catch (error) {
        console.error('지도 초기화 오류:', error);
        mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #f0f0f0; color: #666; text-align: center; padding: 20px;">지도를 로드할 수 없습니다.</div>';
      }
    };

    // 상세 모달 닫기
    const closeDetailModal = () => {
      showDetailModal.value = false;
    };

    // 위시리스트 관리 함수
    const isInWishlist = (id) => {
      return wishlistItems.value.some(item => item._id === id);
    };

    const toggleWishlist = (item) => {
      // Get the name safely from either _source or directly
      const itemName = item._source ? item._source.p_name : item.p_name;
      
      if (isInWishlist(item._id)) {
        // 위시리스트에서 제거
        wishlistItems.value = wishlistItems.value.filter(i => i._id !== item._id);
        showActionStatus(`${itemName}이(가) 위시리스트에서 제거되었습니다.`, "success");
      } else {
        // 위시리스트에 추가
        wishlistItems.value.push(item);
        showActionStatus(`${itemName}이(가) 위시리스트에 추가되었습니다.`, "success");
      }

      // 로컬 스토리지에 저장
      localStorage.setItem('logo_wishlist', JSON.stringify(wishlistItems.value.map(i => i._id)));
    };

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

    // 이미지 분석 처리 - 각 단계별 시간 측정
    const analyzeCurrentImage = async () => {
      if (!imageFile.value) {
        alert("먼저 이미지를 선택해주세요.");
        return;
      }

      try {
        // 상태 초기화 및 로딩 시작
        isLoading.value = true;
        loadingPhase.value = 'imageAnalysis';
        imageAnalysisDuration.value = null;
        meaningAnalysisDuration.value = null;
        searchDuration.value = null;

        // AbortController 설정
        abortController.value = new AbortController();

        console.log("이미지 분석 시작:", imageFile.value.name);

        try {
          // 1단계: 이미지 → 영어 설명 (light_2 모델)
          const imageAnalysisStartTime = performance.now();
          const engDescription = await imageToEngDescription(
            imageFile.value, 
            abortController.value.signal
          );
          const imageAnalysisEndTime = performance.now();
          imageAnalysisDuration.value = ((imageAnalysisEndTime - imageAnalysisStartTime) / 1000).toFixed(1);
          
          // 단계 업데이트
          loadingPhase.value = 'meaningAnalysis';
          
          // 2단계: 영어 설명 → 10차원 벡터 (ko_2 모델)
          const meaningAnalysisStartTime = performance.now();
          const result = await EngDescriptionToVector(
            engDescription, 
            abortController.value.signal
          );
          const meaningAnalysisEndTime = performance.now();
          meaningAnalysisDuration.value = ((meaningAnalysisEndTime - meaningAnalysisStartTime) / 1000).toFixed(1);
          
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
            imageAnalysisDuration.value = '0.3'; // 가상 시간
            meaningAnalysisDuration.value = '0.2'; // 가상 시간

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
        let featuresVector;
        
        // 새 버전: p_vector 배열이 있는 경우 그대로 사용
        if (Array.isArray(analysisResult.value.p_vector)) {
          console.log("p_vector 배열 사용:", analysisResult.value.p_vector);
          featuresVector = analysisResult.value.p_vector;
        } 
        // 기존 버전: dimensions 객체로부터 벡터 생성
        else {
          console.log("createFeaturesVector 함수로 벡터 생성");
          featuresVector = createFeaturesVector(analysisResult.value);
        }

        // Elasticsearch에서 유사 이미지 검색
        const results = await searchSimilarImages(featuresVector, 10);
        searchResults.value = results;

        // 검색 결과 전체를 콘솔에 출력
        console.log('===== Elasticsearch 검색 결과 시작 =====');
        console.log('결과 수:', results.length);
        console.log(results);
        console.log('===== Elasticsearch 검색 결과 끝 =====');

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
      imageAnalysisDuration,
      meaningAnalysisDuration,
      searchDuration,
      triggerFileInput,
      handleFileChange,
      analyzeCurrentImage,
      reset,
      getDimensionHeader,
      dimensionResults,
      cancelAnalysis,
      showDetailModal,
      selectedDetail,
      wishlistItems,
      dimensionsFromDetail,
      openDetailModal,
      closeDetailModal,
      isInWishlist,
      toggleWishlist,
      initDetailMap,
      formatReviewDate,
      formatSimilarityScore,
      isScrolled,
      showHero,
      heroImageSrc,
      heroTitle,
      heroSubtitle,
      heroHeight,
      getLoadingMessage,
      isPhaseActive,
      isPhaseCompleted
    };
  }
};
</script>

<style>
/* Base styles */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.logo-search {
  min-height: 100vh;
  position: relative;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  overflow-x: hidden;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* 컨텐츠 영역 */
.content-wrapper {
  position: relative;
  padding: 2rem 0.5rem 3rem;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  width: 95%;
  margin-top: 10px; /* 헤더 높이만큼 여백 추가 - 줄임 */
  flex: 1; /* 남은 공간 모두 차지하도록 */
  background-color: #f8f9fa;
}

/* 상단 두 컬럼 레이아웃 */
.top-section {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 중간 및 하단 섹션 */
.middle-section {
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out 0.2s forwards;
}

/* 패널 공통 스타일 - OnboardingPage 스타일로 업데이트 */
.upload-panel,
.analysis-panel,
.results-panel,
.details-panel {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.upload-panel:hover,
.analysis-panel:hover,
.results-panel:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 1.2rem 1.5rem;
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.panel-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #4285f4, #34a853);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.upload-panel:hover .panel-header::after,
.analysis-panel:hover .panel-header::after,
.results-panel:hover .panel-header::after {
  transform: scaleX(1);
}

.panel-title {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.3rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
  color: #2d3748;
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

.panel-title::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #4285f4, #34a853);
  transform: scaleX(0.3);
  transform-origin: center;
  transition: transform 0.3s ease;
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

/* 이미지 업로드 패널 - 개선된 디자인 */
.image-container {
  background-color: #f8f9fa;
  border-radius: 12px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 2px dashed #ced4da;
  transition: all 0.3s ease;
  position: relative;
}

.image-container:hover {
  border-color: #4285f4;
  background-color: rgba(66, 133, 244, 0.05);
}

.image-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(52, 168, 83, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.image-container:hover::before {
  opacity: 1;
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
  color: #4285f4;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.image-container:hover .upload-placeholder svg {
  transform: scale(1.1);
}

.upload-placeholder p {
  margin: 0;
  font-size: 0.9rem;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease;
}

.image-container:hover .preview-image {
  transform: scale(1.03);
}

/* 버튼 스타일 - 개선된 디자인 */
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
  border-radius: 50px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.btn:hover svg {
  transform: scale(1.2);
}

.btn-primary {
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #3367d6, #2e8b47);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
}

.btn-analyze {
  background: linear-gradient(135deg, #34a853, #4285f4);
  color: white;
  box-shadow: 0 2px 5px rgba(52, 168, 83, 0.3);
}

.btn-analyze:hover {
  background: linear-gradient(135deg, #2e8b47, #3367d6);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 168, 83, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 1px solid #ced4da;
  color: #495057;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ea4335, #fbbc05);
  color: white;
  box-shadow: 0 2px 5px rgba(234, 67, 53, 0.3);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #d33426, #e8ae00);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(234, 67, 53, 0.4);
}

.hidden-input {
  display: none;
}

/* 분석 패널 - 로딩 상태 */
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

/* 로딩 스피너 스타일 */
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 300px;
  padding: 2rem;
}

.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(66, 133, 244, 0.3);
  border-radius: 50%;
  border-top-color: #4285f4;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

/* 진행 상태 표시 스타일 */
.progress-container {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  width: 100%;
  max-width: 500px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-indicator {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.step-label {
  font-size: 0.85rem;
  color: #6c757d;
  text-align: center;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.step-timing {
  font-size: 0.75rem;
  color: #4285f4;
  margin-top: 0.25rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.progress-connector {
  height: 2px;
  background-color: #e9ecef;
  flex-grow: 1;
  margin: 0 -5px;
  margin-bottom: 2rem;
  transition: background-color 0.3s ease;
}

/* 활성 단계 스타일 */
.progress-step.active .step-indicator {
  background-color: #4285f4;
  color: white;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
}

.progress-step.active .step-label {
  color: #4285f4;
  font-weight: 600;
}

/* 완료된 단계 스타일 */
.progress-step.completed .step-indicator {
  background-color: #34a853;
  color: white;
}

.progress-step.completed .step-label {
  color: #34a853;
}

.progress-step.completed + .progress-connector,
.progress-step.active + .progress-connector {
  background-color: #4285f4;
}

.progress-step.completed + .progress-connector {
  background-color: #34a853;
}

/* 분석 시간 정보 스타일 - 개선된 디자인 */
.analysis-timing {
  margin-top: 1.5rem;
  padding: 1.2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.timing-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #e9ecef;
}

.timing-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.timing-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.timing-value {
  font-weight: 600;
  color: #4285f4;
  background: linear-gradient(135deg, #4285f4, #34a853);
  background-clip: text; /* 표준 속성 추가 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 가이드 상태 - 개선된 디자인 */
.guide-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  min-height: 250px;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.03), rgba(52, 168, 83, 0.03));
  border-radius: 12px;
}

.guide-icon {
  color: #4285f4;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.guide-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #495057;
  margin: 0 0 1.5rem 0;
  max-width: 400px;
}

.steps-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  color: #495057;
  font-size: 0.95rem;
  position: relative;
}

.step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 12px;
  right: -1.5rem;
  width: 1rem;
  height: 1px;
  background: linear-gradient(to right, #4285f4, transparent);
}

.step span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  border-radius: 50%;
  margin-right: 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
}

/* 분석 결과 표 - 개선된 디자인 */
.analysis-table-container {
  overflow: auto;
  border-radius: 12px;
  height: 100%;
  min-height: 250px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
}

.analysis-table th {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  color: #495057;
  text-align: left;
  padding: 0.85rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
}

.analysis-table td {
  padding: 0.85rem 1.2rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
  color: #495057;
  transition: background-color 0.2s ease;
}

.analysis-table tr:hover td {
  background-color: rgba(66, 133, 244, 0.03);
}

.analysis-table tr:last-child td {
  border-bottom: none;
}

.dimension-name {
  font-weight: 500;
  width: 20%;
}

.dimension-score {
  color: #4285f4;
  font-weight: 600;
  text-align: center;
  width: 10%;
  background: linear-gradient(135deg, #4285f4, #34a853);
  background-clip: text; /* 표준 속성 추가 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #4285f4, #34a853);
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  transition: width 1s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 결과 그리드 - 개선된 디자인 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
  padding: 0.5rem;
}

.result-card {
  position: relative;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.result-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.result-image-container {
  height: 200px;
  width: 100%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  position: relative;
}

.result-image-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.5));
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-card:hover .result-image-container::before {
  opacity: 1;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.result-card:hover .result-image {
  transform: scale(1.1);
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  color: #666;
  font-size: 0.9rem;
}

/* 등수 아이콘 스타일 - 개선된 디자인 */
.result-rank {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 3px 10px;
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.result-rank.with-heart {
  padding-left: 10px;
  gap: 7px;
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 14px;
  text-align: center;
  line-height: 1;
}

.heart-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.heart-indicator.active {
  color: #ea4335;
  animation: heartbeat 1s ease-in-out;
}

.heart-indicator svg {
  fill: transparent;
  transition: fill 0.3s ease;
}

.heart-indicator.active svg {
  fill: #ea4335;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.result-info {
  padding: 1.2rem;
  position: relative;
}

.result-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.result-card:hover .result-name {
  color: #4285f4;
}

.result-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
}

.result-location svg {
  flex-shrink: 0;
  color: #6c757d;
}

/* 유사도 표시 개선 */
.result-similarity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.similarity-bar {
  flex-grow: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.similarity-fill {
  height: 100%;
  background: linear-gradient(90deg, #4285f4, #34a853);
  border-radius: 4px;
  transition: width 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.similarity-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.similarity-percentage {
  font-weight: 600;
  color: #4285f4;
}

.similarity-description {
  color: #6c757d;
  font-size: 0.8rem;
}

/* 결과 카드 태그 스타일 */
.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.result-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background-color: rgba(66, 133, 244, 0.1);
  color: #4285f4;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.result-tag:hover {
  background-color: #4285f4;
  color: white;
}

/* 결과 설명 스타일 */
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
  max-height: 4.2em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 푸터 */
.footer {
  background: linear-gradient(135deg, #2d3748, #1a202c);
  padding: 2rem;
  text-align: center;
  margin-top: auto;
  border-top: 1px solid #2d3748;
}

.footer p {
  margin: 0;
  color: white;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #a0aec0;
  text-align: center;
}

.no-results p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.no-results .hint {
  font-size: 0.9rem;
  color: #cbd5e0;
}

/* 모달 오버레이 및 공통 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem 0;
  backdrop-filter: blur(5px);
}

.place-detail-modal {
  background-color: white;
  border-radius: 16px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.3s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.modal-title-location {
  display: flex;
  align-items: center;
  flex: 1;
}

.modal-title-location h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.modal-location {
  margin-left: 1.5rem;
  color: #718096;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.close-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f7fafc;
  color: #4a5568;
}

.heart-btn {
  background: none;
  border: none;
  color: #cbd5e0;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.heart-btn:hover {
  color: #ea4335;
  transform: scale(1.1);
}

.heart-btn.active {
  color: #ea4335;
  animation: heartbeat 1s ease-in-out;
}

/* 모달 콘텐츠 영역 */
.modal-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 이미지와 지도를 수평으로 나란히 배치 */
.visual-section {
  display: flex;
  gap: 20px;
  margin-bottom: 1.5rem;
}

.detail-image-container, .detail-map-container {
  flex: 1;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.detail-image, .detail-map {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 각 섹션 스타일 */
.detail-section {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  background-color: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem 0;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

/* 태그 리스트 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tag {
  background-color: rgba(66, 133, 244, 0.1);
  color: #4285f4;
  font-size: 0.9rem;
  padding: 0.35rem 0.85rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: #4285f4;
  color: white;
}

/* 설명 텍스트 */
.detail-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #4a5568;
  margin: 0;
}

/* 특성 분석 */
.detail-dimensions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dimension-name {
  width: 140px;
  font-size: 0.95rem;
  color: #4a5568;
}

.dimension-bar-small {
  flex: 1;
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
}

.dimension-fill {
  height: 100%;
  background: linear-gradient(90deg, #4285f4, #34a853);
  border-radius: 5px;
}

.dimension-value {
  width: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  text-align: right;
}

/* 리뷰 섹션 */
.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  padding: 1.25rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.reviewer-info {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.review-date {
  font-size: 0.85rem;
  color: #718096;
}

.review-rating {
  color: #a0aec0;
  font-size: 1.25rem;
}

.star-filled {
  color: #fbbc05;
}

.star-empty {
  color: #e2e8f0;
}

.review-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #4a5568;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background-color: #f7fafc;
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

/* 반응형 조정 */
@media (max-width: 1100px) {
  .visual-section {
    flex-direction: column;
  }
  
  .detail-image-container, 
  .detail-map-container {
    width: 100%;
    height: 350px;
  }
  
  .dimension-name {
    width: 120px;
  }
}

@media (max-width: 900px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .nav-center {
    position: relative;
    left: 0;
    transform: none;
    margin-bottom: 1rem;
    order: -1;
  }
  
  .nav-group {
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .logo-text {
    font-size: 1.8rem;
  }
  
  .top-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .modal-title-location {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .modal-location {
    margin: 0.25rem 0 0 0;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .dimension-name {
    width: 100px;
    font-size: 0.85rem;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 600px) {
  .navbar {
    padding: 2rem 0;
  }
  
  .navbar.scrolled {
    padding: 1rem 0;
  }
  
  .nav-group {
    gap: 1rem;
  }
  
  .nav-item {
    font-size: 0.9rem;
  }
  
  .logo-text {
    font-size: 1.6rem;
  }
  
  .hero-title-internal {
    font-size: 2.5rem;
  }
  
  .hero-subtitle-internal {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .dimension-item {
    flex-wrap: wrap;
  }
  
  .dimension-name {
    width: 100%;
    margin-bottom: 0.25rem;
  }
  
  .dimension-value {
    width: 40px;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>