<template>
  <div class="keyword-search">
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
      <!-- 검색 패널 (전체 너비) -->
      <div class="search-panel-container">
        <div class="search-panel">
          <div class="panel-header">
            <h3 class="panel-title">키워드 검색</h3>
          </div>
          
          <div class="panel-content">
            <div class="search-form">
              <div class="search-input-container">
                <input 
                  type="text" 
                  v-model="searchKeyword" 
                  placeholder="검색할 키워드를 입력하세요 (예: 제주도, 바다, 산, 서울)"
                  @keyup.enter="performSearch"
                  class="search-input"
                >
                <button @click="performSearch" class="btn btn-search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  검색
                </button>
              </div>
              
              <div class="search-tags">
                <div class="search-tag-title">인기 검색어:</div>
                <div class="tag-chips">
                  <span class="tag-chip" @click="applyKeyword('제주도')">제주도</span>
                  <span class="tag-chip" @click="applyKeyword('바다')">바다</span>
                  <span class="tag-chip" @click="applyKeyword('산')">산</span>
                  <span class="tag-chip" @click="applyKeyword('서울')">서울</span>
                  <span class="tag-chip" @click="applyKeyword('부산')">부산</span>
                  <span class="tag-chip" @click="applyKeyword('카페')">카페</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 로딩 중일 때 로딩 스피너 표시 -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">검색 중<span>.</span><span>.</span><span>.</span></p>
      </div>
      
      <!-- 결과 영역 (전체 너비) -->
      <div v-else-if="searchPerformed" class="results-panel-container">
        <div class="results-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              '{{ lastSearchKeyword }}' 검색 결과 ({{ searchResults.length }}건 중 {{ totalResults }} 개)
            </h3>
          </div>
          
          <div class="panel-content">
            <div v-if="searchResults.length === 0" class="no-results">
              <div class="no-results-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <p class="no-results-text">검색 결과가 없습니다</p>
              <p class="no-results-hint">다른 키워드로 다시 시도해보세요</p>
            </div>
            
            <div v-else class="results-grid">
              <div 
                v-for="(result, index) in sortedSearchResults" 
                :key="result._id"
                class="result-card"
                @click="openDetailModal(result)"
              >
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
                  <img v-if="result._source.p_image" :src="`data:image/jpeg;base64,${result._source.p_image}`" :alt="result._source.p_name" class="result-image">
                  <div v-else class="placeholder-image">이미지 없음</div>
                </div>
                <div class="result-info">
                  <h4 class="result-name">{{ result._source.p_name }}</h4>
                  <div class="result-location">
                    <span class="location-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </span>
                    {{ result._source.p_address }}
                  </div>
                  <div class="result-visit-count">
                    인증: {{ result._source.visitCount }}회
                  </div>
                  <div class="result-similarity">
                    <span class="similarity-label">유사도:</span>
                    <div class="similarity-bar-container">
                      <div class="similarity-bar" :style="{ width: `${(result._score * 100)}%` }"></div>
                    </div>
                    <span class="similarity-value">{{ (result._score * 100).toFixed(0) }}%</span>
                  </div>
                  <!-- 키워드 표시 영역 -->
                  <div v-if="result._source.p_tags && result._source.p_tags.length > 0" class="result-tags">
                    <span 
                      v-for="(tag, tagIndex) in result._source.p_tags.slice(0, 5)" 
                      :key="tagIndex" 
                      class="result-tag"
                      @click.stop="applyKeyword(tag)"
                    >
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
            
            <div v-if="searchResults.length > 0" class="load-more-container">
              <button v-if="hasMoreResults" @click="loadMoreResults" class="primary-btn load-more-btn">
                더 보기 ({{ searchResults.length }}/{{ totalResults }})
              </button>
              <p v-else class="no-more-results">모든 결과를 불러왔습니다 ({{ searchResults.length }}건)</p>
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
              <span 
                v-for="(tag, index) in selectedDetail.p_tags" 
                :key="index" 
                class="tag" 
                @click="applyKeyword(tag); closeDetailModal();"
              >
                {{ tag }}
              </span>
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
              <div v-for="(value, index) in dimensionValues" :key="index" class="dimension-item">
                <span class="dimension-name">{{ getDimensionLabel(index) }}</span>
                <div class="dimension-bar-small">
                  <div class="dimension-fill" :style="{ width: `${value * 100}%` }"></div>
                </div>
                <span class="dimension-value">{{ value.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <!-- 연령대별 방문 통계 섹션 (LookAround.vue 참조) -->
          <div v-if="!isLoadingStats" class="detail-section stats-section">
            <h4>연령대별 방문 통계 (총 {{ totalStatsVisits }}건 인증)</h4>
            <div v-if="ageStats.length > 0 || genderStats.length > 0" class="stats-charts">
              <!-- 연령대별 원형 그래프 -->
              <div class="chart-container">
                <h5>연령대별 방문 비율</h5>
                <div class="age-chart-wrapper">
                  <div v-if="totalAgeVisits === 0" class="no-age-data">
                    <p>연령대 데이터가 없습니다</p>
                  </div>
                  <canvas v-else ref="ageChartCanvas"></canvas>
                </div>
              </div>
              
              <!-- 성별 아이콘 그래프 -->
              <div class="chart-container">
                <h5>성별 방문 비율</h5>
                <div v-if="totalStatsVisits > 0" class="gender-chart-container">
                  <div class="gender-icons-wrapper">
                    <div class="gender-figure-container">
                      <!-- 남성 아이콘 -->
                      <div class="gender-icon male">
                        <div class="icon-container">
                          <svg viewBox="0 0 158.66 332.54" class="male-icon-svg">
                            <g>
                              <path class="icon-background" d="M123.25,82.17H35.42C13.84,82.17-2.72,101.3.37,122.66l11.55,79.69c1.17,8.06,8.07,14.03,16.21,14.03h2.43l14.06,116.16h69.42l14.06-116.16h2.51c8.11,0,14.99-5.96,16.15-13.98l11.56-79.94c2.97-21.29-13.57-40.29-35.07-40.29Z" />
                              <circle class="icon-background" cx="79.33" cy="37.42" r="37.42" transform="translate(-3.23 67.06) rotate(-45)" />
                            </g>
                            <g :style="{ mask: 'url(#male-mask-' + selectedDetail._id + ')' }">
                              <path d="M123.25,82.17H35.42C13.84,82.17-2.72,101.3.37,122.66l11.55,79.69c1.17,8.06,8.07,14.03,16.21,14.03h2.43l14.06,116.16h69.42l14.06-116.16h2.51c8.11,0,14.99-5.96,16.15-13.98l11.56-79.94c2.97-21.29-13.57-40.29-35.07-40.29Z" fill="#4c7bd8"/>
                              <circle cx="79.33" cy="37.42" r="37.42" transform="translate(-3.23 67.06) rotate(-45)" fill="#4c7bd8"/>
                            </g>
                            <!-- Path with fill="#fff" for male icon removed -->
                            <mask :id="`male-mask-${selectedDetail._id}`">
                              <rect x="0" y="0" width="100%" height="100%" fill="white"/>
                              <rect x="0" y="0" :height="`calc(100% * (1 - (${malePercentage} / 100)))`" width="100%" fill="black"/>
                            </mask>
                          </svg>
                        </div>
                        <div class="gender-label-percent">남성 <span class="percent-value">{{ malePercentage }}%</span></div>
                      </div>
                      <!-- 여성 아이콘 -->
                      <div class="gender-icon female">
                        <div class="icon-container">
                          <svg viewBox="0 0 157.19 332.54" class="female-icon-svg">
                            <g>
                              <circle class="icon-background" cx="78.68" cy="37.42" r="37.42" transform="translate(24.18 105.4) rotate(-76.72)" />
                              <path class="icon-background" d="M156.76,187.25l-24.97-94.01c-.03-.1-.06-.2-.09-.29-2.35-6.46-8.49-10.77-15.37-10.77H41.02c-6.89,0-13.03,4.31-15.37,10.77-.03.1-.06.19-.09.29L.59,187.25s-5.18,20.11,15.14,23.87h.31l-6.41,33.76h24.91l12.45,87.66h63.38l12.45-87.66h24.91l-6.41-33.76h.3c19.58-3.22,15.15-23.87,15.15-23.87Z" />
                            </g>
                            <g :style="{ mask: 'url(#female-mask-' + selectedDetail._id + ')' }">
                              <circle cx="78.68" cy="37.42" r="37.42" transform="translate(24.18 105.4) rotate(-76.72)" fill="#e5518d"/>
                              <path d="M156.76,187.25l-24.97-94.01c-.03-.1-.06-.2-.09-.29-2.35-6.46-8.49-10.77-15.37-10.77H41.02c-6.89,0-13.03,4.31-15.37,10.77-.03.1-.06.19-.09.29L.59,187.25s-5.18,20.11,15.14,23.87h.31l-6.41,33.76h24.91l12.45,87.66h63.38l12.45-87.66h24.91l-6.41-33.76h.3c19.58-3.22,15.15-23.87,15.15-23.87Z" fill="#e5518d"/>
                            </g>
                            <!-- Path with fill="#fff" for female icon removed -->
                            <mask :id="`female-mask-${selectedDetail._id}`">
                              <rect x="0" y="0" width="100%" height="100%" fill="white"/>
                              <rect x="0" y="0" :height="`calc(100% * (1 - (${femalePercentage} / 100)))`" width="100%" fill="black"/>
                            </mask>
                          </svg>
                        </div>
                        <div class="gender-label-percent">여성 <span class="percent-value">{{ femalePercentage }}%</span></div>
                      </div>
                    </div>
                  </div>
                  <div class="gender-percentage-bar">
                    <div class="male-percentage" :style="{ width: `${malePercentage}%` }"></div>
                    <div class="female-percentage" :style="{ width: `${femalePercentage}%` }"></div>
                  </div>
                </div>
                <div v-else class="no-gender-data"><p>성별 데이터가 없습니다</p></div>
              </div>
            </div>
            <div v-else class="no-stats-data"><p>방문 통계 데이터가 없습니다.</p></div>
          </div>
          <!-- 통계 로딩 중 -->
          <div v-if="isLoadingStats" class="detail-section stats-section">
            <h4>연령대별 방문 통계</h4>
            <div class="stats-loading">
              <div class="spinner"></div>
              <p>통계 데이터를 불러오는 중...</p>
            </div>
          </div>
          
          <!-- 리뷰 섹션 (더미 데이터) -->
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
import { ref, computed, onMounted, nextTick, watch } from "vue";
import Header from "@/components/Header.vue";
import { searchImagesByKeyword } from "@/services/api";
import config from "@/config.js";
import Chart from 'chart.js/auto';

export default {
  name: "KeywordSearch",
  
  components: {
    Header
  },
  
  setup() {
    // 상태 관리
    const searchKeyword = ref('');
    const lastSearchKeyword = ref('');
    const searchResults = ref([]);
    const isLoading = ref(false);
    const searchPerformed = ref(false);
    const currentPage = ref(1);
    const resultsPerPage = ref(12);
    const totalResults = ref(0);
    const actionStatus = ref({ message: "", type: "" });
    const showDetailModal = ref(false);
    const selectedDetail = ref({});
    const wishlistItems = ref([]);

    // Stats related reactive variables (copied from LookAround.vue)
    const ageStats = ref([]);
    const genderStats = ref([]);
    const totalStatsVisits = ref(0);
    const isLoadingStats = ref(false);
    const ageChartCanvas = ref(null);
    let ageChart = null; // Chart instance
    
    // 히어로 섹션 속성
    const showHero = ref(true);
    const heroImageSrc = ref('https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1470');
    const heroTitle = ref('여행지 키워드 검색');
    const heroSubtitle = ref('원하는 여행지 키워드로 이미지를 검색해보세요');
    const heroHeight = ref('320px');
    
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

    // 차원 라벨 생성 - 인덱스로 접근
    const getDimensionLabel = (index) => {
      return dimensionLabels[index] || `차원 ${index + 1}`;
    };
    
    // p_vector 배열에서 차원 값 가져오기
    const dimensionValues = computed(() => {
      if (!selectedDetail.value || !selectedDetail.value.p_vector) {
        return [];
      }
      return selectedDetail.value.p_vector;
    });
    
    // 리뷰 날짜 포맷팅
    const formatReviewDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // 검색 결과를 유사도 순으로 정렬
    const sortedSearchResults = computed(() => {
      return [...searchResults.value].sort((a, b) => b._score - a._score);
    });
    
    // 더 많은 결과 있는지 확인
    const hasMoreResults = computed(() => {
      return searchResults.value.length < totalResults.value;
    });
    
    // 카카오 지도 변수
    let kakaoMap = null;
    
    // 컴포넌트 마운트 시 실행
    onMounted(async () => {
      console.log("KeywordSearch 컴포넌트 마운트");
      
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
      
      // 카카오 맵 API 로드
      try {
        await loadKakaoMapsScript();
        console.log("카카오 맵 API 준비 완료");
      } catch (error) {
        console.error("카카오 맵 API 로드 실패:", error);
      }
    });
    
    // 카카오 맵 API 로드 함수
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
    
    // 키워드 검색 실행
    const performSearch = async () => {
      if (!searchKeyword.value.trim()) {
        showActionStatus("검색어를 입력해주세요.", "error");
        return;
      }
      
      try {
        // 검색 시작
        isLoading.value = true;
        searchPerformed.value = true;
        lastSearchKeyword.value = searchKeyword.value;
        currentPage.value = 1;
        
        // 키워드로 검색 실행
        const response = await searchImagesByKeyword(searchKeyword.value, resultsPerPage.value, 0);
        console.log(response);
        
        // 결과 저장
        searchResults.value = response.hits;
        totalResults.value = response.total;
        
        if (response.hits.length === 0) {
          showActionStatus("검색 결과가 없습니다.", "info");
        } else {
          showActionStatus(`${response.hits.length}개의 결과를 찾았습니다. (총 ${response.total}개)`, "success");
        }
      } catch (error) {
        showActionStatus(`검색 중 오류가 발생했습니다: ${error.message}`, "error");
        console.error("검색 오류:", error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // 더 많은 결과 로드
    const loadMoreResults = async () => {
      if (!hasMoreResults.value) return;
      
      try {
        isLoading.value = true;
        
        // 다음 페이지 계산
        const nextPage = currentPage.value + 1;
        const from = (nextPage - 1) * resultsPerPage.value;
        
        // 추가 결과 로드
        const response = await searchImagesByKeyword(
          lastSearchKeyword.value, 
          resultsPerPage.value,
          from
        );
        
        // 현재 페이지 업데이트
        currentPage.value = nextPage;
        
        // 결과 추가
        searchResults.value = [...searchResults.value, ...response.hits];
        
        // 표시할 더 많은 결과가 없는 경우, 총 결과 수를 현재 결과 수로 설정
        if (response.hits.length === 0) {
          totalResults.value = searchResults.value.length;
        }
        
        showActionStatus(`추가 결과를 불러왔습니다. (${searchResults.value.length}/${totalResults.value})`, "success");
      } catch (error) {
        showActionStatus(`추가 결과 로드 중 오류가 발생했습니다: ${error.message}`, "error");
        console.error("추가 로드 오류:", error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // 태그 키워드 적용
    const applyKeyword = (keyword) => {
      searchKeyword.value = keyword;
      performSearch();
    };
    
    // 상태 메시지 표시 함수
    const showActionStatus = (message, type) => {
      actionStatus.value = { message, type };
      
      // 3초 후 메시지 자동 제거
      setTimeout(() => {
        if (actionStatus.value.message === message) {
          actionStatus.value = { message: "", type: "" };
        }
      }, 3000);
    };
    
    // 상세 모달 열기
    const openDetailModal = (result) => {
      // _source 필드를 최상위 레벨로 풀어서 저장
      const detailData = {
        _id: result._id,
        _score: result._score,
        ...result._source,
        reviews: dummyReviews
      };
      
      selectedDetail.value = detailData;
      showDetailModal.value = true;
      
      // Load stats for the selected place
      if (result._source && result._source.p_id) {
        loadDestinationStats(result._source.p_id);
      }
      
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
        let lat = 37.5665; // 기본값: 서울시청
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
      // Reset stats when modal closes
      ageStats.value = [];
      genderStats.value = [];
      totalStatsVisits.value = 0;
      if (ageChart) {
        ageChart.destroy();
        ageChart = null;
      }
    };

    // --- Statistics Functions (adapted from LookAround.vue) ---

    const totalAgeVisits = computed(() => {
      return ageStats.value.reduce((sum, stat) => sum + stat.value, 0);
    });

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
    
    const getColorObject = (age) => {
      const colorMap = {
        10: { color: '#f8b195', isDark: false }, 20: { color: '#f67280', isDark: false },
        30: { color: '#c06c84', isDark: true },  40: { color: '#6c5b7c', isDark: true },
        50: { color: '#355c7d', isDark: true },  60: { color: '#a8e6cf', isDark: false },
        70: { color: '#dcedc2', isDark: false }, 80: { color: '#ffd3b5', isDark: false },
        90: { color: '#ffaaa6', isDark: false }
      };
      return colorMap[age] || { color: `hsl(${210 + age}, 70%, 60%)`, isDark: false };
    };

    const getColorForAge = (age) => {
      return getColorObject(age).color;
    };

    const renderAgeChart = () => {
      const canvas = ageChartCanvas.value;
      if (!canvas || totalAgeVisits.value === 0) {
        if (ageChart) {
          ageChart.destroy();
          ageChart = null;
        }
        return;
      }
      
      if (ageChart) {
        ageChart.destroy();
      }
      
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
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 15
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '50%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: { size: 12 },
                padding: 25, // Increase space between doughnut and legend
                generateLabels: (chart) => {
                  const datasets = chart.data.datasets;
                  return chart.data.labels.map((label, i) => ({
                    text: `${label} (${percentages[i]}%)`,
                    fillStyle: datasets[0].backgroundColor[i],
                    strokeStyle: datasets[0].borderColor,
                    lineWidth: datasets[0].borderWidth,
                    hidden: false, index: i
                  }));
                }
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

    watch([ageStats, totalAgeVisits], () => {
      nextTick(() => {
        renderAgeChart();
      });
    }, { deep: true });

    const loadDestinationStats = async (placeId) => {
      if (!placeId) return;
      try {
        isLoadingStats.value = true;
        const query = {
          size: 0,
          query: { term: { p_id: parseInt(placeId) } },
          aggs: {
            age_distribution: {
              terms: { field: "u_age", size: 10, order: { "_key": "asc" } }
            },
            gender_distribution: {
              terms: { field: "u_gender", size: 2 }
            },
            total_visits: { value_count: { field: "p_id" } }
          }
        };
        
        const response = await fetch(`${config.ES_API}/travel_places/_search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query)
        });
        
        if (!response.ok) throw new Error(`Elasticsearch API 오류: ${response.status}`);
        
        const data = await response.json();
        
        if (data?.aggregations?.age_distribution?.buckets) {
          const allAgeBuckets = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(age => {
            const foundBucket = data.aggregations.age_distribution.buckets.find(b => b.key === age);
            return { age: age, label: `${age}대`, value: foundBucket ? foundBucket.doc_count : 0 };
          });
          ageStats.value = allAgeBuckets;
        } else {
          ageStats.value = [];
        }
        
        if (data?.aggregations?.gender_distribution?.buckets) {
          genderStats.value = data.aggregations.gender_distribution.buckets.map(bucket => ({
            gender: bucket.key,
            label: bucket.key === 'M' ? '남성' : '여성',
            value: bucket.doc_count
          }));
        } else {
          genderStats.value = [{ gender: 'M', label: '남성', value: 0 }, { gender: 'F', label: '여성', value: 0 }];
        }
        
        totalStatsVisits.value = data?.aggregations?.total_visits?.value || 0;
        
      } catch (error) {
        console.error('연령별 방문 통계 로드 오류:', error);
        ageStats.value = [];
        genderStats.value = [];
        totalStatsVisits.value = 0;
      } finally {
        isLoadingStats.value = false;
      }
    };
    
    return {
      searchKeyword,
      lastSearchKeyword,
      searchResults,
      isLoading,
      searchPerformed,
      hasMoreResults,
      totalResults,
      actionStatus,
      showHero,
      heroImageSrc,
      heroTitle,
      heroSubtitle,
      heroHeight,
      performSearch,
      loadMoreResults,
      applyKeyword,
      openDetailModal,
      closeDetailModal,
      isInWishlist,
      toggleWishlist,
      wishlistItems,
      showDetailModal,
      selectedDetail,
      sortedSearchResults,
      getDimensionLabel,
      dimensionValues,
      formatReviewDate,
      initDetailMap,
      // Stats related
      ageStats,
      genderStats,
      totalStatsVisits,
      isLoadingStats,
      ageChartCanvas,
      totalAgeVisits,
      malePercentage,
      femalePercentage,
      getColorForAge,
    };
  }
};
</script>

<style scoped>
/* Base styles */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Nunito:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.keyword-search {
  min-height: 100vh;
  position: relative;
  font-family: 'Noto Sans KR', 'Nunito', sans-serif;
  color: #333;
  overflow-x: hidden;
  background-color: #f8f9fa; /* Softer background */
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
  margin-top: 10px;
  flex: 1;
  /* background-color: #f8f9fa; Remove if keyword-search has it */
}

/* 검색 패널 및 결과 패널 컨테이너 */
.search-panel-container,
.results-panel-container {
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
}

.results-panel-container {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 패널 공통 스타일 */
.search-panel,
.results-panel {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); /* Softer shadow */
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid #eef2f7; /* Lighter border */
}

.search-panel:hover,
.results-panel:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 1.2rem 1.5rem;
  background: #fff; /* Clean white background */
  border-bottom: 1px solid #eef2f7; /* Lighter border */
  position: relative;
}

.panel-header::after {
  content: "";
  position: absolute;
  bottom: -1px; /* Align with border */
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.search-panel:hover .panel-header::after,
.results-panel:hover .panel-header::after {
  transform: scaleX(1);
}

.panel-title {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.2rem; /* Adjusted size */
  font-weight: 600; /* Slightly bolder */
  margin: 0;
  text-align: center;
  color: #34495e; /* Darker, more neutral color */
  letter-spacing: 0.3px;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

.panel-title::after {
  /* Optional: remove this if the header ::after is preferred */
  content: "";
  position: absolute;
  bottom: -6px; /* Adjusted position */
  left: 10%; /* Shorter underline */
  width: 80%;
  height: 2.5px;
  background: var(--logo-blue, #48b0e4);
  border-radius: 1px;
  transform: scaleX(0.5);
  transform-origin: center;
  transition: transform 0.3s ease-out;
}

.panel-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 검색 폼 */
.search-form {
  width: 100%;
}

.search-input-container {
  display: flex;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-input-container:focus-within {
  box-shadow: 0 5px 15px rgba(var(--logo-blue-rgb, 72, 176, 228), 0.2);
}

.search-input {
  flex: 1;
  padding: 12px 15px; /* Increased padding */
  border: 1px solid #dde2e7; /* Softer border */
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-family: 'Nunito', 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  background-color: white;
  color: #495057;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--logo-blue, #48b0e4);
  background-color: #fcfdff;
}

.btn-search {
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-search:hover {
  background: linear-gradient(135deg, #3a9cd1, #67a58d); /* Darken on hover */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-search:active {
  transform: translateY(0);
}

/* 검색 태그 */
.search-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
}

.search-tag-title {
  font-size: 0.9rem; /* Adjusted size */
  font-weight: 500;
  color: #5f6b7a;
  margin-right: 0.75rem;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-chip {
  background-color: #edf6ff; /* Lighter, softer blue */
  color: #3a8bcd; /* Darker blue text for contrast */
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem; /* Adjusted size */
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #d0e6f8; /* Subtle border */
}

.tag-chip:hover {
  background-color: var(--logo-blue, #48b0e4);
  color: white;
  border-color: var(--logo-blue, #48b0e4);
  transform: translateY(-2px);
  box-shadow: 0 3px 7px rgba(var(--logo-blue-rgb, 72, 176, 228), 0.25);
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #6c757d;
  text-align: center;
}

.spinner {
  width: 50px; /* Adjusted size */
  height: 50px;
  border: 4px solid rgba(var(--logo-blue-rgb, 72, 176, 228), 0.15); /* Thicker border, adjusted color */
  border-radius: 50%;
  border-top-color: var(--logo-blue, #48b0e4);
  animation: spin 0.8s linear infinite; /* Faster spin */
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem; /* Adjusted size */
  color: #495057;
  font-weight: 500;
}

.loading-text span {
  animation: dots 1.4s infinite;
  opacity: 0;
}

.loading-text span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-text span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dots {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

/* 결과 없음 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem; /* Added horizontal padding */
  color: #a0aec0;
  text-align: center;
  background-color: #f9fafb; /* Light background */
  border-radius: 12px;
  margin: 1rem 0;
}

.no-results-icon {
  color: #cbd5e0; /* Lighter icon color */
  margin-bottom: 1.25rem;
}
.no-results-icon svg {
  width: 50px; /* Adjusted size */
  height: 50px;
}

.no-results-text {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.1rem; /* Slightly larger */
  color: #4a5568; /* Darker text */
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.no-results-hint {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.9rem;
  color: #718096; /* Slightly darker hint */
  margin: 0;
}

/* 결과 그리드 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
  padding: 0.5rem;
}

.result-card {
  position: relative;
  background-color: white;
  border-radius: 12px; /* Softer radius */
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07); /* Refined shadow */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  border: 1px solid #eef2f7; /* Lighter border */
}

.result-card:hover {
  transform: translateY(-6px); /* Subtler lift */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.6)); /* Darker gradient */
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
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.result-card:hover .result-image {
  transform: scale(1.07); /* Subtler zoom */
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

/* 등수 아이콘 스타일 */
.result-rank {
  position: absolute;
  top: 12px; /* Adjusted position */
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 10px; /* Adjusted padding */
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white;
  border-radius: 16px; /* More rounded */
  font-size: 0.75rem; /* Adjusted size */
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
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
  color: rgba(255, 255, 255, 0.7); /* Slightly more visible */
  transition: all 0.3s ease;
}

.heart-indicator.active {
  color: var(--logo-coral, #ff8e7f);
  animation: heartbeat 0.8s ease-in-out;
}

.heart-indicator svg {
  fill: transparent;
  transition: fill 0.3s ease;
}

.heart-indicator.active svg {
  fill: var(--logo-coral, #ff8e7f);
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(1.1); }
}

.result-info {
  padding: 1rem 1.2rem; /* Adjusted padding */
  position: relative;
}

.result-name {
  font-size: 1.05rem; /* Adjusted size */
  font-weight: 600;
  color: #34495e; /* Darker, more neutral */
  margin: 0 0 0.4rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.result-card:hover .result-name {
  color: var(--logo-blue, #48b0e4);
}

.result-location {
  display: flex;
  align-items: center;
  gap: 0.3rem; /* Adjusted gap */
  font-size: 0.8rem; /* Adjusted size */
  color: #7f8c8d; /* Softer grey */
  margin-bottom: 0.6rem;
}

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

.location-icon {
  color: var(--logo-blue, #48b0e4);
}

/* 유사도 표시 개선 */
.result-similarity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.similarity-label {
  font-weight: 500;
  color: #7f8c8d;
}

.similarity-bar-container {
  flex-grow: 1;
  height: 7px; /* Slightly thinner */
  background-color: #e8eaed; /* Lighter background */
  border-radius: 4px;
  overflow: hidden;
  /* box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05); Removed for flatter look */
}

.similarity-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.similarity-value {
  font-weight: 600;
  color: var(--logo-blue, #48b0e4);
  font-size: 0.85rem;
}

/* 결과 카드 태그 */
.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem; /* Adjusted margin */
}

.result-tag {
  font-size: 0.7rem; /* Smaller tags */
  padding: 0.25rem 0.6rem;
  background-color: #eef2f7; /* Lighter grey */
  color: #5f6b7a; /* Darker grey text */
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.result-tag:hover {
  background-color: #dde2e7;
  color: #34495e;
  transform: translateY(-1px);
}

/* 더 불러오기 버튼 */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  padding: 10px 24px; /* Adjusted padding */
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white;
  border: none;
  border-radius: 25px; /* More rounded */
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(var(--logo-blue-rgb, 72, 176, 228), 0.2);
}

.load-more-btn:hover {
  background: linear-gradient(135deg, #3a9cd1, #67a58d);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(var(--logo-blue-rgb, 72, 176, 228), 0.25);
}

.no-more-results {
  color: #95a5a6; /* Softer grey */
  font-size: 0.9rem;
}

/* 결과 카드 설명 영역 */
.result-description {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eef2f7; /* Lighter border */
}

.description-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5f6b7a; /* Darker grey */
  margin-bottom: 0.25rem;
}

.description-text {
  font-size: 0.8rem;
  color: #7f8c8d; /* Softer grey */
  margin: 0;
  line-height: 1.5; /* Improved line height */
  max-height: 4.5em; /* 3 lines with 1.5 line height */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 푸터 */
.footer {
  background: #2c3e50; /* Solid dark color */
  padding: 1.8rem 1rem; /* Adjusted padding */
  text-align: center;
  margin-top: auto;
  border-top: none; /* Removed border */
}

.footer p {
  margin: 0;
  color: #ecf0f1; /* Lighter text */
  font-size: 0.9rem;
  letter-spacing: 0.3px;
}

/* 모달 오버레이 및 공통 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(30, 40, 50, 0.65); /* Slightly darker overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem; /* Add padding for smaller screens */
  backdrop-filter: blur(4px); /* Softer blur */
}

/* --- START: place-detail-modal CSS Refactor --- */
.place-detail-modal {
  background-color: #ffffff;
  border-radius: 12px; /* Softer radius */
  width: 95%;
  max-width: 1100px; /* Slightly reduced max-width for better proportions */
  max-height: calc(100vh - 4rem); /* Ensure padding is respected */
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); /* Refined shadow */
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.3s ease-out;
  border: none; /* Removed border for a cleaner look */
}

.modal-header {
  display: flex;
  justify-content: space-between; /* Ensure actions are to the right */
  align-items: center;
  padding: 1.25rem 1.75rem; /* Adjusted padding */
  border-bottom: 1px solid #eef2f7; /* Lighter border */
  position: sticky;
  top: 0;
  background-color: #ffffff;
  z-index: 10;
}

.modal-title-location {
  display: flex;
  /* flex-direction: column; */ /* Changed from column */
  flex-direction: row; /* Stack title and location horizontally */
  /* align-items: flex-start; */ /* Changed from flex-start */
  align-items: baseline; /* Align to baseline of text */
  flex: 1;
  margin-right: 1rem; /* Space before action buttons */
  gap: 0.75rem; /* Add gap between title and address */
}

.modal-title-location h3 {
  margin: 0;
  font-size: 1.4rem; /* Slightly larger title */
  font-weight: 600;
  color: #2c3e50; /* Dark blue-grey */
  font-family: 'Noto Sans KR', sans-serif; /* Consistent font */
  line-height: 1.3;
}

.modal-location {
  /* margin-left: 0; Removed as it's stacked now */
  /* margin-top: 0.25rem; */ /* Removed top margin, gap will handle spacing */
  color: #7f8c8d; /* Softer grey */
  font-size: 0.9rem; /* Adjusted size */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%; /* Allow full width within its container */
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Reduced gap */
}

.close-btn, .heart-btn { /* Combined common styles */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.6rem; /* Uniform padding */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.25s ease;
  color: #95a5a6; /* Muted icon color */
}

.close-btn:hover, .heart-btn:hover {
  background-color: #f4f6f8; /* Subtle hover background */
  color: #52616B; /* Darker icon on hover */
}

.heart-btn svg {
  width: 22px; /* Consistent icon size */
  height: 22px;
}
.close-btn svg {
  width: 20px; /* Consistent icon size */
  height: 20px;
}

.heart-btn.active {
  color: var(--logo-coral, #ff715e); /* Brighter coral */
  /* animation: heartbeat 1s ease-in-out; Already defined elsewhere */
}
.heart-btn.active:hover {
  background-color: #fff0ee; /* Light coral background on hover when active */
}


/* 모달 콘텐츠 영역 */
.modal-content {
  padding: 1.75rem; /* Increased padding */
  display: flex;
  flex-direction: column;
  gap: 1.75rem; /* Consistent gap between sections */
  overflow-y: auto;
}

/* 이미지와 지도를 수평으로 나란히 배치 */
.visual-section {
  display: flex;
  gap: 1.75rem; /* Consistent gap */
  /* margin-bottom: 1.5rem; Removed, using gap in modal-content */
}

.detail-image-container, .detail-map-container {
  flex: 1;
  height: 380px; /* Adjusted height */
  border-radius: 10px; /* Softer radius */
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); /* Softer shadow */
  background-color: #f0f2f5; /* Placeholder background */
}

.detail-image, .detail-map {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-map .kakao-map-error { /* Style for map error message */
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f0f2f5;
  color: #666;
  text-align: center;
  padding: 20px;
  font-size: 0.9rem;
}


/* 각 섹션 스타일 */
.detail-section {
  padding: 1.5rem; /* Consistent padding */
  /* margin-bottom: 1.5rem; Removed, using gap in modal-content */
  border-radius: 10px; /* Softer radius */
  background-color: #fdfdfe; /* Slightly off-white background */
  border: 1px solid #eef2f7; /* Subtle border */
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03); Removed for a flatter look, border is enough */
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 1.15rem; /* Adjusted size */
  font-weight: 600;
  color: #34495e; /* Dark blue-grey */
  margin: 0 0 1rem 0;
  border-bottom: 1px solid #dde2e7; /* Lighter, thinner border */
  padding-bottom: 0.75rem; /* Adjusted padding */
  font-family: 'Noto Sans KR', sans-serif;
}

/* 태그 리스트 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tag {
  background-color: #eaf6ff; /* Lighter blue */
  color: #2979ff; /* Brighter blue text */
  font-size: 0.85rem; /* Adjusted size */
  padding: 0.4rem 0.9rem; /* Adjusted padding */
  border-radius: 16px; /* Pill shape */
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.tag:hover {
  background-color: #d1e7fd;
  color: #1a63d4;
  transform: translateY(-1px);
}

/* 설명 텍스트 */
.detail-description {
  font-size: 0.95rem; /* Adjusted size */
  line-height: 1.75; /* Improved readability */
  color: #52616B; /* Softer black */
  margin: 0;
}

/* 특성 분석 */
.detail-dimensions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem; /* Reduced gap */
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dimension-name {
  width: 130px; /* Adjusted width */
  font-size: 0.9rem;
  color: #52616B;
  font-weight: 500;
}

.dimension-bar-small {
  flex: 1;
  height: 8px; /* Thinner bar */
  background-color: #e8eaed; /* Lighter grey */
  border-radius: 4px;
  overflow: hidden;
}

.dimension-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--logo-blue, #4fc3f7), var(--logo-green, #81c784)); /* Lighter gradient */
  border-radius: 4px;
  transition: width 0.6s ease-out;
}

.dimension-value {
  width: 35px; /* Adjusted width */
  font-size: 0.85rem;
  font-weight: 500;
  color: #52616B;
  text-align: right;
}

/* 리뷰 섹션 */
.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Adjusted gap */
}

.review-item {
  padding: 1.25rem;
  background-color: #ffffff; /* White background for reviews */
  border-radius: 8px; /* Softer radius */
  border: 1px solid #eef2f7; /* Subtle border */
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);  Removed shadow */
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align items to top for multi-line names */
  margin-bottom: 0.6rem; /* Reduced margin */
}

.reviewer-info {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-weight: 600;
  color: #34495e; /* Dark blue-grey */
  font-size: 0.95rem; /* Adjusted size */
  margin-bottom: 0.1rem;
}

.review-date {
  font-size: 0.8rem; /* Adjusted size */
  color: #95a5a6; /* Muted grey */
}

.review-rating {
  font-size: 1.1rem; /* Adjusted star size */
  line-height: 1; /* Ensure stars align well */
}

.star-filled {
  color: var(--logo-yellow, #fbc02d); /* Brighter yellow */
}

.star-empty {
  color: #e0e0e0; /* Lighter empty star */
}

.review-content {
  font-size: 0.9rem; /* Adjusted size */
  line-height: 1.65; /* Improved readability */
  color: #52616B; /* Softer black */
}

.modal-footer {
  padding: 1.25rem 1.75rem; /* Consistent padding */
  border-top: 1px solid #eef2f7; /* Lighter border */
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem; /* Adjusted gap */
  position: sticky;
  bottom: 0;
  background-color: #f9fafb; /* Slightly off-white footer */
  z-index: 1;
}

.cancel-btn {
  padding: 0.6rem 1.25rem; /* Adjusted padding */
  border-radius: 20px; /* Pill shape */
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #e9ecef; /* Light grey button */
  color: #495057; /* Darker text */
  border: none;
}

.cancel-btn:hover {
  background-color: #dee2e6; /* Darken on hover */
  color: #343a40;
}
/* --- END: place-detail-modal CSS Refactor --- */

/* 등수 랭킹 컬러 */
.result-card:nth-child(1) .result-rank {
  background: linear-gradient(135deg, #ffdf70, #ffc107); /* Gold */
}

.result-card:nth-child(2) .result-rank {
  background: linear-gradient(135deg, #e0e0e0, #b0b0b0); /* Silver */
}

.result-card:nth-child(3) .result-rank {
  background: linear-gradient(135deg, #e09b5b, #cd7f32); /* Bronze */
}


/* === 통계 섹션 스타일 === */
.stats-section {
  /* background-color: #ffffff; Use .detail-section style */
  /* border-radius: 12px; Use .detail-section style */
  /* box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05); Use .detail-section style */
  /* margin-top: 1.5rem; Use modal-content gap */
}

.stats-section h4 { /* Already styled by .detail-section h4 */
  /* font-family: 'Noto Sans KR', sans-serif; */
  /* font-size: 1.2rem; */
  /* font-weight: 600; */
  /* color: #343a40; */
  /* margin-bottom: 1.5rem; */
  /* padding-bottom: 0.75rem; */
  /* border-bottom: 2px solid #e9ecef; */
  text-align: left; /* Align with other section titles */
}

.stats-charts {
  display: flex;
  gap: 1.75rem; /* Consistent gap */
  justify-content: space-around;
  align-items: flex-start;
  padding: 0.5rem 0 0; /* Reduced top padding as h4 has bottom margin */
  flex-wrap: wrap;
}

.chart-container {
  flex: 1 1 45%;
  min-width: 280px; /* Adjusted min-width */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: transparent; /* Changed from #f8f9fa */
  border-radius: 8px;
  /* box-shadow: inset 0 1px 3px rgba(0,0,0,0.04); */ /* Subtle inset shadow */
  /* border: 1px solid #eef2f7; Removed border */
  min-height: 372px; /* Equalize height with sibling chart container */
}

.chart-container h5 {
  font-size: 0.95rem; /* Adjusted size */
  font-weight: 500;
  color: #495057;
  margin-bottom: 1rem; /* Adjusted margin */
  text-align: center;
}

.age-chart-wrapper {
  width: 100%;
  max-width: 308px; /* Increased from 280px by 10% */
  height: 308px; /* Increased from 280px by 10% */
  position: relative;
}

.age-chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}


.no-age-data, .no-gender-data, .no-stats-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px; /* Reduced height */
  width: 100%;
  color: #7f8c8d; /* Softer grey */
  font-size: 0.85rem;
  background-color: #f0f2f5; /* Lighter background */
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  margin-top: 0.5rem;
}

.gender-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 40px; /* Increased from 20px to push content down further */
}

.gender-icons-wrapper {
  display: flex;
  justify-content: center;
  gap: 2rem; /* Adjusted gap */
  margin-bottom: 1.25rem; /* Adjusted margin */
  width: 100%;
}

.gender-figure-container {
  display: flex;
  gap: 1.5rem; /* Adjusted gap */
}

.gender-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icon-container {
  width: 80px; /* Adjusted size */
  height: auto;
  margin-bottom: 0.5rem;
}

.icon-container svg {
  width: 100%;
  height: auto;
}

.male-icon-svg .icon-background,
.female-icon-svg .icon-background {
  fill: #eef2f7; /* Lighter background */
}

.gender-label-percent {
  font-size: 0.85rem; /* Adjusted size */
  font-weight: 500;
  color: #343a40;
}

.gender-label-percent .percent-value {
  font-weight: 700;
}

.gender-percentage-bar {
  width: 100%;
  max-width: 250px; /* Adjusted max width */
  height: 10px; /* Adjusted height */
  display: flex;
  border-radius: 5px;
  overflow: hidden;
  background-color: #eef2f7; /* Lighter background */
  /* box-shadow: inset 0 1px 2px rgba(0,0,0,0.04); */
}

.male-percentage {
  background-color: #4c7bd8;
  height: 100%;
  transition: width 0.5s ease-in-out;
}

.female-percentage {
  background-color: #e5518d;
  height: 100%;
  transition: width 0.5s ease-in-out;
}

.stats-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
}
/* === END 통계 섹션 스타일 === */


/* 반응형 조정 */
@media (max-width: 1100px) { /* Keep this for visual section and dimension name specifically */
  .visual-section {
    flex-direction: column;
    gap: 1.5rem; /* Gap when stacked */
  }
  
  .detail-image-container, 
  .detail-map-container {
    width: 100%;
    height: 320px; /* Adjust height when stacked */
  }
  
  .dimension-name {
    width: 110px; /* Further adjust for medium screens */
  }
}

/* @media (max-width: 900px) { */
  /* .top-section { */ /* This class is not in KeywordSearch.vue */
    /* grid-template-columns: 1fr; */
    /* gap: 1.5rem; */
  /* } */
/* } */

@media (max-width: 768px) {
  .modal-header {
    padding: 1rem 1.25rem; /* Smaller padding on mobile */
  }
  .modal-title-location h3 {
    font-size: 1.25rem; /* Smaller title on mobile */
  }
  .modal-location {
    font-size: 0.85rem;
  }
  .modal-content {
    padding: 1.25rem; /* Smaller padding */
    gap: 1.25rem;
  }
  .visual-section {
    gap: 1.25rem;
  }
  .detail-image-container, .detail-map-container {
    height: 280px; /* Adjust height for smaller screens */
  }
  .detail-section {
    padding: 1.25rem;
  }
  .detail-section h4 {
    font-size: 1.1rem;
    padding-bottom: 0.6rem;
    margin-bottom: 0.8rem;
  }
  .tag {
    font-size: 0.8rem;
    padding: 0.35rem 0.8rem;
  }
  .detail-description {
    font-size: 0.9rem;
  }
  .dimension-name {
    width: 100px;
    font-size: 0.85rem;
  }
  .dimension-item {
    gap: 0.75rem;
  }

  .results-grid { /* Existing rule, keep */
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* Smaller cards on mobile */
  }

  .stats-charts {
    flex-direction: column; 
    align-items: center; 
    gap: 1.25rem;
  }

  .chart-container {
    flex-basis: 100%; /* Full width for each chart container */
    max-width: 100%; /* Allow full width on mobile */
    padding: 0.75rem;
    min-height: 342px; /* Equalize height for mobile */
  }

  .age-chart-wrapper {
    max-width: 286px; /* Increased from 260px by 10% */
    height: 286px; /* Increased from 260px by 10% */
  }

  .gender-icons-wrapper {
    gap: 1.5rem; 
  }

  .icon-container {
    width: 70px; /* Smaller icons */
  }
  .modal-footer {
    padding: 1rem 1.25rem;
  }
  .cancel-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 600px) {
  .results-grid { /* Existing rule, keep */
    grid-template-columns: 1fr;
  }
  
  .search-input-container { /* Existing rule, keep */
    flex-direction: column;
  }
  
  .search-input { /* Existing rule, keep */
    border-radius: 8px;
    border-right: 1px solid #e9ecef;
  }
  
  .btn-search { /* Existing rule, keep */
    border-radius: 8px;
    margin-top: 0.5rem;
    justify-content: center; /* Center button content */
  }
  .modal-overlay {
    padding: 1rem; /* Reduce overlay padding for small screens */
  }
  .place-detail-modal {
    max-height: calc(100vh - 2rem);
  }
  .modal-header {
    padding: 0.75rem 1rem;
  }
  .modal-title-location h3 {
    font-size: 1.1rem;
  }
  .modal-location {
    font-size: 0.8rem;
  }
  .modal-content {
    padding: 1rem;
    gap: 1rem;
  }
  .visual-section {
    gap: 1rem;
  }
  .detail-image-container, .detail-map-container {
    height: 220px;
  }
  .detail-section {
    padding: 1rem;
  }
  .detail-section h4 {
    font-size: 1rem;
  }
  .dimension-item {
    flex-direction: column; /* Stack dimension items */
    align-items: flex-start;
    gap: 0.3rem;
  }
  .dimension-name {
    width: auto; /* Allow full width */
    margin-bottom: 0.2rem;
  }
  .dimension-bar-small {
    width: 100%;
  }
  .dimension-value {
    width: auto; /* Allow full width */
    text-align: left;
    margin-top: 0.1rem;
  }
}

/* @media (max-width: 480px) { */ /* Consolidated into 600px or other existing queries */
  /* .dimension-item { */
    /* flex-wrap: wrap; */
  /* } */
  
  /* .dimension-name { */
    /* width: 100%; */
    /* margin-bottom: 0.25rem; */
  /* } */
  
  /* .dimension-value { */
    /* width: 40px; */
  /* } */
/* } */
</style>