<template>
    <div class="look-around-page">
      <!-- 헤더 -->
      <Header 
        :showHero="true"
        heroImageSrc="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1470"
        heroTitle="어디 갈만한데 없나?"
        heroSubtitle="현재 가장 핫한 여행지를 클릭 몃번으로 한눈에"
        heroHeight="320px"
      />
  
      <!-- 메인 콘텐츠 -->
      <div class="content-wrapper">
        <div class="content-layout" :class="{ 'region-active': true }">
          <!-- 지도 섹션 -->
          <div class="map-section" v-show="currentMapLevel === 'ctprvn'">
            <div class="map-background"></div>
            <div id="d3-map-container" class="map-component" ref="mapContainer"></div>
  
            <!-- 지역 이름 호버 툴팁 -->
            <div v-if="hoveredRegion" class="region-tooltip" :style="tooltipStyle">
              {{ hoveredRegionName }}
            </div>
          </div>
          
          <!-- 상세 지도 섹션 (같은 위치에 렌더링) -->
          <div v-if="showDetailMap" class="map-section" v-show="currentMapLevel === 'sig'">
            <div class="map-background"></div>
            <div class="detail-map-header">
              <button class="back-button" @click="resetActiveRegion">
                <span class="back-icon">←</span> 이전 지도로 돌아가기
              </button>
            </div>
            <div id="detail-map-container" class="map-component" ref="detailMapContainer"></div>
            
            <!-- 시군구 툴팁 -->
            <div v-if="showSigTooltip" class="sig-tooltip" :style="sigTooltipStyle">
              {{ sigTooltipContent }}
            </div>
          </div>
  
          <!-- 지역 정보 패널 -->
          <div class="region-info-panel active">
            <div class="region-info">
              <div v-if="!showDefaultInfo" class="close-button" @click="resetActiveRegion">×</div>
              <h2 class="region-title">{{ panelTitle }}</h2>
              <p class="region-description">
                {{ panelDescription }}
              </p>
              
              <!-- 지역 특산품 정보를 관광지 정보로 변경 -->
              <div v-if="currentRegionData" class="region-specialties">
                <h3 class="section-title">대표 관광지</h3>
                <div class="specialties-grid">
                  <div v-for="(specialty, index) in currentRegionData.specialties.slice(0, 2)" :key="index" class="specialty-item">
                    <div class="specialty-image" :style="{ backgroundImage: `url(${specialty.image})` }"></div>
                    <div class="specialty-content">
                      <h4>{{ specialty.name }}</h4>
                      <p>{{ specialty.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 인기 여행지 섹션 추가 -->
        <div class="popular-destinations-section">
          <h3 class="section-title">{{ popularDestinationsTitle }}</h3>
          
          <!-- 로딩 표시 -->
          <div v-if="isLoadingDestinations" class="loading-container">
            <div class="spinner"></div>
            <p>인기 여행지 정보를 가져오는 중...</p>
          </div>
          
          <!-- 결과가 없을 때 -->
          <div v-else-if="popularDestinations.length === 0" class="no-results">
            <p>해당 지역에 인기 여행지 데이터가 없습니다.</p>
          </div>
          
          <!-- 결과 표시 -->
          <div v-else class="destinations-grid">
            <div 
              v-for="destination in currentPopularDestinations.slice(0, 30)" 
              :key="destination.id" 
              class="destination-card"
              @click="openDetailModal(destination)"
            >
              <div class="destination-rank" :class="{ 'with-heart': isInWishlist(destination.id) }">
                <span v-if="isInWishlist(destination.id)" class="heart-indicator active">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </span>
                <span class="rank-number">{{ destination.displayRank }}</span>
              </div>
              <div class="destination-image" :style="{ backgroundImage: destination.p_image ? `url(data:image/jpeg;base64,${destination.p_image})` : 'url(https://via.placeholder.com/300x200?text=No+Image)' }"></div>
              <div class="destination-content">
                <h4>{{ destination.name }}</h4>
                <div class="destination-location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{{ destination.address }}</span>
                </div>
                <div class="visit-count">
                  <span class="count-label">방문 인증:</span>
                  <span class="count-value">{{ destination.visitCount }}회</span>
                </div>
                <div class="destination-tags">
                  <span v-for="tag in destination.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 더 많은 여행지 버튼 추가 -->
          <div class="view-more-container" v-if="popularDestinations.length > 30 && !showAllDestinations">
            <button class="view-more-button" @click="showAllDestinations = true">
              모든 인기 여행지 보기
            </button>
          </div>
        </div>
      </div>
  
      <!-- 푸터 -->
      <footer class="footer">
        <p>©  {{$store.state.appName}} - 당신의 여행을 기록하다</p>
      </footer>
    </div>
  
    <!-- 장소 상세 모달 수정 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="place-detail-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-location">
            <h3>{{ selectedDetail.name }}</h3>
            <div class="modal-location">{{ selectedDetail.address }}</div>
          </div>
          <div class="modal-actions">
            <button class="heart-btn" :class="{ 'active': isInWishlist(selectedDetail.id) }"
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
              <img v-if="selectedDetail.p_image" :src="`data:image/jpeg;base64,${selectedDetail.p_image}`" :alt="selectedDetail.name" class="detail-image">
              <div v-else class="placeholder-image">이미지 없음</div>
            </div>
              
            <!-- 지도 영역 -->
            <div class="detail-map-container">
              <div id="detailMap" class="detail-map"></div>
            </div>
          </div>
          
          <!-- 태그 섹션 -->
          <div v-if="selectedDetail.tags && selectedDetail.tags.length > 0" class="detail-section">
            <h4>태그</h4>
            <div class="tag-list">
              <span v-for="(tag, index) in selectedDetail.tags" :key="index" class="tag">{{ tag }}</span>
            </div>
          </div>
  
          <!-- 설명 섹션 -->
          <div v-if="selectedDetail.description" class="detail-section">
            <h4>설명</h4>
            <p class="detail-description">{{ selectedDetail.description }}</p>
          </div>
          
          <!-- 방문 정보 섹션 -->
          <div class="detail-section">
            <h4>방문 정보</h4>
            <div class="detail-visit-info">
              <div class="visit-info-item">
                <span class="info-label">총 방문 인증:</span>
                <span class="info-value">{{ selectedDetail.visitCount }}회</span>
              </div>
              <div class="visit-info-item">
                <span class="info-label">지역:</span>
                <span class="info-value">{{ selectedDetail.regionName }}</span>
              </div>
              <div class="visit-info-item">
                <span class="info-label">시군구:</span>
                <span class="info-value">{{ selectedDetail.sigName }}</span>
              </div>
            </div>
          </div>
          
          <!-- 연령대별 방문 통계 섹션 (새로 추가) -->
          <div v-if="!isLoadingStats" class="detail-section stats-section">
            <h4>연령대별 방문 통계 (총 {{ totalStatsVisits }}건 인증)</h4>
            <div v-if="ageStats.length > 0" class="stats-charts">
              <!-- 연령대별 원형 그래프 -->
              <div class="chart-container">
                <h5>연령대별 방문 비율</h5>
                <div class="age-chart-wrapper">
                  <div v-if="totalAgeVisits === 0" class="no-age-data">
                    <p>연령대 데이터가 없습니다</p>
                  </div>
                  <canvas v-else ref="ageChartCanvas" width="380" height="380"></canvas>
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
                          <svg viewBox="0 0 158.66 332.54" class="male-icon">
                            <!-- 배경 회색 아이콘 -->
                            <g>
                              <path class="icon-background" d="M123.25,82.17H35.42C13.84,82.17-2.72,101.3.37,122.66l11.55,79.69c1.17,8.06,8.07,14.03,16.21,14.03h2.43l14.06,116.16h69.42l14.06-116.16h2.51c8.11,0,14.99-5.96,16.15-13.98l11.56-79.94c2.97-21.29-13.57-40.29-35.07-40.29Z" fill="#d1d5db"/>
                              <circle class="icon-background" cx="79.33" cy="37.42" r="37.42" transform="translate(-3.23 67.06) rotate(-45)" fill="#d1d5db"/>
                            </g>
                            
                            <!-- 색상이 채워진 남성 아이콘 (진행률 표시) -->
                            <g style="mask: url(#male-mask)">
                              <path d="M123.25,82.17H35.42C13.84,82.17-2.72,101.3.37,122.66l11.55,79.69c1.17,8.06,8.07,14.03,16.21,14.03h2.43l14.06,116.16h69.42l14.06-116.16h2.51c8.11,0,14.99-5.96,16.15-13.98l11.56-79.94c2.97-21.29-13.57-40.29-35.07-40.29Z" fill="#4c7bd8"/>
                              <circle cx="79.33" cy="37.42" r="37.42" transform="translate(-3.23 67.06) rotate(-45)" fill="#4c7bd8"/>
                            </g>
                            
                            <!-- 남성 심볼 (항상 맨 위에 보이는 부분) -->
                            <path d="M86.77,172.23v-14.03c13.6-3.35,23.72-15.64,23.72-30.25,0-17.18-13.98-31.16-31.16-31.16s-31.16,13.98-31.16,31.16c0,14.66,10.19,26.99,23.85,30.29v14l-11.47-7.63-8.17,12.28,27.02,17.97,27.02-17.97-8.17-12.28-11.47,7.63ZM62.92,127.95c0-9.05,7.36-16.41,16.41-16.41s16.41,7.36,16.41,16.41-7.36,16.41-16.41,16.41-16.41-7.36-16.41-16.41Z" fill="#fff"/>
                            
                            <!-- 마스크 정의 - 아래에서부터 채우기 -->
                            <mask :id="`male-mask`">
                              <rect x="0" y="0" width="160" height="332.54" fill="white"/>
                              <rect x="0" y="0" :height="332.54 * (1 - malePercentage / 100)" width="160" fill="black"/>
                            </mask>
                          </svg>
                        </div>
                        <div class="gender-label-percent">남성 <span class="percent-value">{{ malePercentage }}%</span></div>
                      </div>
                      
                      <!-- 여성 아이콘 -->
                      <div class="gender-icon female">
                        <div class="icon-container">
                          <svg viewBox="0 0 157.19 332.54" class="female-icon">
                            <!-- 배경 회색 아이콘 -->
                            <g>
                              <circle class="icon-background" cx="78.68" cy="37.42" r="37.42" transform="translate(24.18 105.4) rotate(-76.72)" fill="#d1d5db"/>
                              <path class="icon-background" d="M156.76,187.25l-24.97-94.01c-.03-.1-.06-.2-.09-.29-2.35-6.46-8.49-10.77-15.37-10.77H41.02c-6.89,0-13.03,4.31-15.37,10.77-.03.1-.06.19-.09.29L.59,187.25s-5.18,20.11,15.14,23.87h.31l-6.41,33.76h24.91l12.45,87.66h63.38l12.45-87.66h24.91l-6.41-33.76h.3c19.58-3.22,15.15-23.87,15.15-23.87Z" fill="#d1d5db"/>
                            </g>
                            
                            <!-- 색상이 채워진 여성 아이콘 (진행률 표시) -->
                            <g style="mask: url(#female-mask)">
                              <circle cx="78.68" cy="37.42" r="37.42" transform="translate(24.18 105.4) rotate(-76.72)" fill="#e5518d"/>
                              <path d="M156.76,187.25l-24.97-94.01c-.03-.1-.06-.2-.09-.29-2.35-6.46-8.49-10.77-15.37-10.77H41.02c-6.89,0-13.03,4.31-15.37,10.77-.03.1-.06.19-.09.29L.59,187.25s-5.18,20.11,15.14,23.87h.31l-6.41,33.76h24.91l12.45,87.66h63.38l12.45-87.66h24.91l-6.41-33.76h.3c19.58-3.22,15.15-23.87,15.15-23.87Z" fill="#e5518d"/>
                            </g>
                            
                            <!-- 여성 심볼 (항상 맨 위에 보이는 부분) -->
                            <path d="M109.86,127.87c0-17.14-13.94-31.08-31.08-31.08s-31.08,13.94-31.08,31.08c0,14.63,10.16,26.92,23.79,30.21v11.86h-11.52v14.71h11.52v11.52h14.71v-11.52h11.52s0-14.71,0-14.71h-11.52v-11.89c13.56-3.34,23.66-15.6,23.66-30.18ZM62.41,127.87c0-9.03,7.34-16.37,16.37-16.37s16.37,7.34,16.37,16.37-7.34,16.37-16.37,16.37-16.37-7.34-16.37-16.37Z" fill="#fff"/>
                            
                            <!-- 마스크 정의 - 아래에서부터 채우기 -->
                            <mask :id="`female-mask`">
                              <rect x="0" y="0" width="160" height="332.54" fill="white"/>
                              <rect x="0" y="0" :height="332.54 * (1 - femalePercentage / 100)" width="160" fill="black"/>
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
                
                <div v-else class="no-gender-data">
                  <p>성별 데이터가 없습니다</p>
                </div>
              </div>
            </div>
            
            <div v-if="ageStats.length === 0" class="no-stats-data">
              <p>아직 연령대별 방문 통계 데이터가 없습니다.</p>
            </div>
          </div>
          
          <!-- 통계 로딩 중 -->
          <div v-if="isLoadingStats" class="detail-section stats-section">
            <h4>연령대별 방문 통계</h4>
            <div class="stats-loading">
              <div class="spinner"></div>
              <p>통계 데이터를 불러오는 중...</p>
            </div>
          </div>
          
          <!-- 리뷰 섹션 - 분리를 위해 클래스 추가 -->
          <div v-if="selectedDetail.reviews && selectedDetail.reviews.length > 0" class="detail-section reviews-section">
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
  
          <div class="modal-footer">
            <button class="cancel-btn" @click="closeDetailModal">닫기</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Header from '@/components/Header.vue';
  import { ref, computed, onMounted, watch, nextTick } from 'vue';
  import * as d3 from 'd3';
  import Chart from 'chart.js/auto';
  import ctprvnGeoJson from '@/assets/ctprvn.json';
  import propertiesData from '@/assets/extracted_ctprvn.json';
  import sigGeoJson from '@/assets/sig.json';
  import sigPropertiesData from '@/assets/extracted_properties.json';
  // 데이터 파일 가져오기
  import { regionSpecialtyData, sigSpecialtyData } from '@/data/tmpData.js';
  import config from '@/config.js';
  import regionMapping from '@/data/regionMapping.js';
  
  export default {
    name: 'LookAroundAll',
  
    components: {
      Header
    },
  
    setup() {
      // 상태 변수
      const activeRegion = ref(null); // 활성화된 광역시도 코드
      const hoveredRegion = ref(null);
      const mousePosition = ref({ x: 0, y: 0 });
      const mapContainer = ref(null);
      const detailMapContainer = ref(null); // 상세 지도 컨테이너 참조
      let map = null; // D3 맵 인스턴스 참조 저장
      // eslint-disable-next-line no-unused-vars
      let detailMap = null; // 상세 지도 인스턴스 참조 저장
      const regions = ref(propertiesData); // 지역 데이터 반응형으로 관리
      const showDetailMap = ref(false); // 상세 지도 표시 여부
      const showDefaultInfo = ref(true); // 초기 정보 패널 표시 여부
      const regionPopularityScores = ref(null); // 지역별 인기도 점수
      const sigPopularityScores = ref(null); // 시군구별 인기도 점수
      const showAllDestinations = ref(false); // 모든 여행지 표시 여부
      
      // 추가된 상태 변수 - 인기 여행지 관련
      const popularDestinations = ref([]);
      const isLoadingDestinations = ref(false);
      
      // 시군구 관련 상태 변수
      const activeSig = ref(null); // 활성화된 시군구 코드
      const currentMapLevel = ref('ctprvn'); // 현재 지도 레벨: 'ctprvn'(광역시도) 또는 'sig'(시군구)
      
      // 상세 지도 툴팁 관련 상태
      const hoveredSig = ref(null); // 호버된 시군구 코드
      const sigTooltipContent = ref(''); // 툴팁에 표시할 내용
      const sigMousePosition = ref({ x: 0, y: 0 }); // 상세 지도에서의 마우스 위치
      const showSigTooltip = ref(false); // 시군구 툴팁 표시 여부
      
      // 상세 모달 관련 상태 변수
      const showDetailModal = ref(false);
      const selectedDetail = ref({});
      const isLoadingStats = ref(false);
      
      // 위시리스트 관련 상태
      const wishlistItems = ref([]);
      
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
      
      // 통계 데이터 관련 변수
      const ageStats = ref([]);
      const genderStats = ref([]);
      const totalStatsVisits = ref(0);
      
      // 파이 차트 관련 변수
      const hoveredSegment = ref(null);
      const hoveredGenderSegment = ref(null);
      
      // 카카오 맵 변수
      let kakaoMap = null;

      // 리뷰 날짜 포맷팅
      const formatReviewDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
      
      // 연령대별 총 방문 수 계산
      const totalAgeVisits = computed(() => {
        return ageStats.value.reduce((sum, stat) => sum + stat.value, 0);
      });
      
      // Chart.js 인스턴스 참조
      let ageChart = null;
      
      // 연령대별 도넛 차트 렌더링 함수
      const renderAgeChart = () => {
        const canvas = ageChartCanvas.value;
        if (!canvas || totalAgeVisits.value === 0) return;
        
        // 기존 차트 제거
        if (ageChart) {
          ageChart.destroy();
        }
        
        // 데이터 준비 (값이 있는 연령대만 필터링)
        const filteredAgeStats = ageStats.value.filter(stat => stat.value > 0);
        
        // 차트 데이터 및 색상 배열 준비
        const data = filteredAgeStats.map(stat => stat.value);
        const labels = filteredAgeStats.map(stat => `${stat.age}대`);
        const colors = filteredAgeStats.map(stat => getColorForAge(stat.age));
        const percentages = filteredAgeStats.map(stat => 
          ((stat.value / totalAgeVisits.value) * 100).toFixed(1)
        );
        
        // Chart.js 도넛 차트 생성
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
            layout: {
              padding: 20
            },
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  font: {
                    size: 12
                  },
                  generateLabels: (chart) => {
                    const datasets = chart.data.datasets;
                    return chart.data.labels.map((label, i) => {
                      const percentage = percentages[i];
                      return {
                        text: `${label} (${percentage}%)`,
                        fillStyle: datasets[0].backgroundColor[i],
                        strokeStyle: datasets[0].borderColor,
                        lineWidth: datasets[0].borderWidth,
                        hidden: false,
                        index: i
                      };
                    });
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw;
                    const percentage = percentages[context.dataIndex];
                    return `${context.label}: ${value}명 (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      };
      
      // 차트 canvas 참조
      const ageChartCanvas = ref(null);
      
      // 연령 통계 변경 시 차트 업데이트
      watch([ageStats, totalAgeVisits], () => {
        nextTick(() => {
          renderAgeChart();
        });
      });
      
      // 연령별 파이 차트 세그먼트 계산
      const agePieSegments = computed(() => {
        if (totalAgeVisits.value === 0) return [];
        
        let segments = [];
        let startAngle = 0;
        
        // 값이 있는 연령대만 필터링
        const filteredStats = ageStats.value.filter(stat => stat.value > 0);
        
        filteredStats.forEach(stat => {
          const percentage = (stat.value / totalAgeVisits.value) * 100;
          const angle = (percentage / 100) * Math.PI * 2;
          const endAngle = startAngle + angle;
          
          // 각 세그먼트의 중간 각도
          const midAngle = startAngle + (angle / 2);
          
          // SVG 원형 경로 계산
          const radius = 100; // 증가된 반지름
          const x1 = Math.sin(startAngle) * radius;
          const y1 = -Math.cos(startAngle) * radius;
          const x2 = Math.sin(endAngle) * radius;
          const y2 = -Math.cos(endAngle) * radius;
          
          // 원호 플래그: 0=작은원호, 1=큰원호
          const largeArcFlag = angle > Math.PI ? 1 : 0;
          
          // SVG path 생성
          const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          
          // 레이블 위치 계산 (파이 조각 중앙)
          const labelRadius = 65;  // 중심에서 레이블까지의 거리
          const labelX = Math.sin(midAngle) * labelRadius;
          const labelY = -Math.cos(midAngle) * labelRadius;
          
          // 텍스트 색상 (어두운 색상에는 흰색, 밝은 색상에는 검정색)
          const colorObj = getColorObject(stat.age);
          const textColor = colorObj.isDark ? 'white' : '#333';
          
          // 지시선 위치 계산
          const midpointX = Math.sin(midAngle) * radius;
          const midpointY = -Math.cos(midAngle) * radius;
          
          // 지시선 끝점
          const pointerLength = 130; // 더 긴 지시선
          const pointerX = Math.sin(midAngle) * pointerLength;
          const pointerY = -Math.cos(midAngle) * pointerLength;
          
          // 텍스트 위치 계산 (오른쪽 또는 왼쪽 정렬)
          const isRightSide = Math.sin(midAngle) > 0;
          const pointerTextAnchor = isRightSide ? "start" : "end";
          const pointerOffsetX = isRightSide ? 5 : -5;
          
          segments.push({
            age: stat.age,
            label: stat.label,
            value: stat.value,
            percentage: percentage.toFixed(1),
            color: colorObj.color,
            startAngle,
            endAngle,
            path: pathData,
            midAngle,
            labelX,
            labelY,
            textColor,
            midpointX,
            midpointY,
            pointerX,
            pointerY,
            pointerTextAnchor,
            pointerOffsetX
          });
          
          startAngle = endAngle;
        });
        
        return segments;
      });
      
      // 성별 파이 차트 세그먼트 계산
      const genderPieSegments = computed(() => {
        if (totalStatsVisits.value === 0) return [];
        
        let segments = [];
        let startAngle = 0;
        
        // 값이 있는 성별만 필터링
        const filteredStats = genderStats.value.filter(stat => stat.value > 0);
        
        filteredStats.forEach(stat => {
          const percentage = (stat.value / totalStatsVisits.value) * 100;
          const angle = (percentage / 100) * Math.PI * 2;
          const endAngle = startAngle + angle;
          
          // SVG 원형 경로 계산
          const x1 = Math.sin(startAngle) * 80;
          const y1 = -Math.cos(startAngle) * 80;
          const x2 = Math.sin(endAngle) * 80;
          const y2 = -Math.cos(endAngle) * 80;
          
          // 원호 플래그
          const largeArcFlag = angle > Math.PI ? 1 : 0;
          
          // SVG path 생성
          const pathData = `M 0 0 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          
          segments.push({
            gender: stat.gender,
            label: stat.label,
            value: stat.value,
            percentage: percentage.toFixed(1),
            color: stat.gender === 'M' ? '#90cdf4' : '#f687b3',
            startAngle,
            endAngle,
            path: pathData
          });
          
          startAngle = endAngle;
        });
        
        return segments;
      });
      
      // 다수 성별 텍스트 계산
      const getMajorityGender = computed(() => {
        if (genderStats.value.length === 0) return '';
        
        const maleCount = genderStats.value.find(s => s.gender === 'M')?.value || 0;
        const femaleCount = genderStats.value.find(s => s.gender === 'F')?.value || 0;
        
        if (maleCount === femaleCount) return '남녀 동일';
        return maleCount > femaleCount ? '남성 다수' : '여성 다수';
      });
      
      // 파이 차트 툴팁 위치 계산
      const pieTooltipStyle = computed(() => {
        return {
          left: `${mousePosition.value.x}px`,
          top: `${mousePosition.value.y - 40}px`
        };
      });
      
      // 성별 파이 차트 툴팁 위치 계산
      const genderTooltipStyle = computed(() => {
        return {
          left: `${mousePosition.value.x}px`,
          top: `${mousePosition.value.y - 40}px`
        };
      });
      
      // 연령대별 색상 생성 함수
      const getColorForAge = (age) => {
        return getColorObject(age).color;
      };
      
      // 연령대별 색상 및 텍스트 색상 계산
      const getColorObject = (age) => {
        // 각 연령대별 다른 색상 반환
        const colorMap = {
          10: { color: '#f8b195', isDark: false }, // 연한 주황
          20: { color: '#f67280', isDark: false }, // 코랄
          30: { color: '#c06c84', isDark: true },  // 자주색
          40: { color: '#6c5b7c', isDark: true },  // 보라
          50: { color: '#355c7d', isDark: true },  // 남색
          60: { color: '#a8e6cf', isDark: false }, // 민트
          70: { color: '#dcedc2', isDark: false }, // 연한 라임
          80: { color: '#ffd3b5', isDark: false }, // 살구색
          90: { color: '#ffaaa6', isDark: false }  // 연한 핑크
        };
        
        return colorMap[age] || { color: `hsl(${210 + age}, 70%, 60%)`, isDark: false };
      };
      
      // 성별 비율 계산
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
      
      // 마우스 이벤트 처리
      const updateMousePosition = (event) => {
        mousePosition.value = {
          x: event.clientX,
          y: event.clientY
        };
      };
      
      // 위시리스트 관리 함수
      const isInWishlist = (id) => {
        return wishlistItems.value.some(item => item.id === id);
      };

      const toggleWishlist = (item) => {
        // 이벤트 전파 중지 (모달 닫힘 방지)
        event.stopPropagation();
        
        // 아이템 이름 가져오기
        const itemName = item.name;
        
        if (isInWishlist(item.id)) {
          // 위시리스트에서 제거
          wishlistItems.value = wishlistItems.value.filter(i => i.id !== item.id);
          console.log(`${itemName}이(가) 위시리스트에서 제거되었습니다.`);
        } else {
          // 위시리스트에 추가
          wishlistItems.value.push(item);
          console.log(`${itemName}이(가) 위시리스트에 추가되었습니다.`);
        }

        // 로컬 스토리지에 저장
        localStorage.setItem('logo_wishlist', JSON.stringify(wishlistItems.value.map(i => i.id)));
      };
      
      // 툴팁 위치 계산
      const tooltipStyle = computed(() => {
        return {
          left: `${mousePosition.value.x}px`,
          top: `${mousePosition.value.y - 40}px`
        };
      });
      
      // 상세 지도 툴팁 위치 계산
      const sigTooltipStyle = computed(() => {
        return {
          left: `${sigMousePosition.value.x}px`,
          top: `${sigMousePosition.value.y - 40}px`
        };
      });

      // 호버된 지역 이름
      const hoveredRegionName = computed(() => {
        if (!hoveredRegion.value) return '';
  
        const feature = regions.value.find(region => 
          region.CTPRVN_CD === hoveredRegion.value
        );
  
        return feature ? feature.CTP_KOR_NM : '';
      });

      // 활성화된 지역 정보 가져오기
      const getActiveRegion = computed(() => {
        if (!activeRegion.value) return null;
        
        const region = regions.value.find(region => region.CTPRVN_CD === activeRegion.value);
        return region;
      });
      
      // 활성화된 시군구 정보 가져오기
      const getActiveSig = computed(() => {
        if (!activeSig.value) return null;
        
        const sigItem = sigPropertiesData.find(item => item.SIG_CD === activeSig.value);
        return sigItem;
      });
      
      // 정보 패널에 표시할 데이터 결정 (광역시도 또는 시군구)
      const panelDisplayData = computed(() => {
        // 시군구가 선택되었으면 시군구 정보 반환
        if (currentMapLevel.value === 'sig' && activeSig.value) {
          return getActiveSig.value;
        }
        // 광역시도가 선택되었으면 광역시도 정보 반환
        if (activeRegion.value) {
          return getActiveRegion.value;
        }
        // 아무것도 선택되지 않았을 때 null 반환
        return null;
      });
      
      // 정보 패널 타이틀
      const panelTitle = computed(() => {
        if (!panelDisplayData.value && showDefaultInfo.value) {
          return '대한민국';
        }
        
        if (!panelDisplayData.value) return '';
        
        if (currentMapLevel.value === 'sig' && activeSig.value) {
          return panelDisplayData.value.SIG_KOR_NM;
        }
        return panelDisplayData.value.CTP_KOR_NM;
      });
      
      // 정보 패널 설명
      const panelDescription = computed(() => {
        // 기본 정보(대한민국) 표시 시
        if (!panelDisplayData.value && showDefaultInfo.value) {
          return regionSpecialtyData.default.description;
        }
        
        if (!panelDisplayData.value) return '';
        
        // 시군구 선택 시
        if (currentMapLevel.value === 'sig' && activeSig.value && sigSpecialtyData[activeSig.value]) {
          return sigSpecialtyData[activeSig.value].description;
        }
        
        // 광역시도 선택 시
        if (activeRegion.value && regionSpecialtyData[activeRegion.value]) {
          return regionSpecialtyData[activeRegion.value].description;
        }
        
        // 기본값
        return regionSpecialtyData.default.description;
      });
      
      // 정보 패널 세부 정보
      const panelDetails = computed(() => {
        if (!panelDisplayData.value && showDefaultInfo.value) {
          return [
            { label: '국가 코드', value: 'KR' },
            { label: '영문 이름', value: 'Republic of Korea' },
            { label: '한글 이름', value: '대한민국' },
            { label: '수도', value: '서울특별시' },
            { label: '행정구역', value: '17개 시/도' }
          ];
        }
        
        if (!panelDisplayData.value) return [];
        
        if (currentMapLevel.value === 'sig' && activeSig.value) {
          return [
            { label: '행정구역 코드', value: panelDisplayData.value.SIG_CD },
            { label: '영문 이름', value: panelDisplayData.value.SIG_ENG_NM },
            { label: '한글 이름', value: panelDisplayData.value.SIG_KOR_NM }
          ];
        }
        return [
          { label: '행정구역 코드', value: panelDisplayData.value.CTPRVN_CD },
          { label: '영문 이름', value: panelDisplayData.value.CTP_ENG_NM },
          { label: '한글 이름', value: panelDisplayData.value.CTP_KOR_NM }
        ];
      });
      
      // 현재 표시할 지역 데이터 가져오기 (특산품, 설명 등)
      const currentRegionData = computed(() => {
        // 시군구가 선택된 경우
        if (currentMapLevel.value === 'sig' && activeSig.value && sigSpecialtyData[activeSig.value]) {
          return sigSpecialtyData[activeSig.value];
        }
        
        // 광역시도가 선택된 경우
        if (activeRegion.value && regionSpecialtyData[activeRegion.value]) {
          return regionSpecialtyData[activeRegion.value];
        }
        
        // 아무것도 선택되지 않은 경우 (기본 정보)
        return regionSpecialtyData.default;
      });
      
      // 현재 표시할 인기 여행지 데이터 가져오기 - Elasticsearch 직접 호출 방식으로 변경
      const loadPopularDestinations = async () => {
        try {
          isLoadingDestinations.value = true;
          
          // Elasticsearch 쿼리 생성
          let query = {
            size: 0,
            aggs: {
              popular_places: {
                terms: {
                  field: "p_id",
                  size: 30,
                  order: { "_count": "desc" }
                },
                aggs: {
                  place_details: {
                    top_hits: {
                      size: 1,
                      _source: [
                        "p_id", "p_name", "p_address", 
                        "p_region", "p_sig", "p_description", "p_tags", "p_image"
                      ],
                      sort: [{ "upload_date": { "order": "desc" } }]
                    }
                  }
                }
              }
            }
          };
          
          // 필터 조건 추가 - 시군구 또는 지역으로 필터링
          if (currentMapLevel.value === 'sig' && activeSig.value) {
            query.query = { term: { p_sig: activeSig.value } };
          } else if (activeRegion.value) {
            query.query = { term: { p_region: activeRegion.value } };
          }
          
          console.log('인기 여행지 조회 쿼리:', JSON.stringify(query, null, 2));
          
          // Elasticsearch 직접 호출
          const response = await fetch(`${config.ES_API}/travel_places/_search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
          });
          
          if (!response.ok) {
            throw new Error(`Elasticsearch API 오류: ${response.status}`);
          }
          
          const data = await response.json();
          
          // 결과 처리
          if (data && data.aggregations && data.aggregations.popular_places) {
            const results = data.aggregations.popular_places.buckets.map((bucket, index) => {
              const placeDetails = bucket.place_details.hits.hits[0]._source;
              
              // 지역명 및 시군구명 조회
              const regionName = getRegionNameByCode(placeDetails.p_region);
              const sigName = getSigNameByCode(placeDetails.p_sig);
              
              return {
                id: placeDetails.p_id,
                name: placeDetails.p_name,
                address: placeDetails.p_address,
                region: placeDetails.p_region,
                regionName,
                sig: placeDetails.p_sig,
                sigName,
                description: placeDetails.p_description,
                tags: placeDetails.p_tags || [],
                p_image: placeDetails.p_image,
                visitCount: bucket.doc_count,
                displayRank: index + 1
              };
            });
            
            console.log(`인기 여행지 ${results.length}개 로드 완료`);
            popularDestinations.value = results;
            
            // 인기 여행지 데이터를 기반으로 지역 인기도 점수 계산
            // 전국 데이터인 경우 지역별 인기도 계산
            if (!activeRegion.value && !activeSig.value) {
              calculateRegionScoresFromData(results);
            } 
            // 특정 지역 선택 시 해당 지역의 시군구별 인기도 계산
            else if (activeRegion.value && !activeSig.value) {
              calculateSigScoresFromData(results);
            }
          } else {
            console.warn('인기 여행지 데이터 없음');
            popularDestinations.value = [];
          }
        } catch (error) {
          console.error('인기 여행지 로드 오류:', error);
          popularDestinations.value = [];
        } finally {
          isLoadingDestinations.value = false;
        }
      };

      // 지역 코드로 지역명 가져오기
      const getRegionNameByCode = (regionCode) => {
        if (!regionCode) return '알 수 없음';
        
        // regionMapping 활용하여 지역 이름 가져오기
        if (regionMapping && regionMapping.regions && regionCode.toString() in regionMapping.regions) {
          return regionMapping.regions[regionCode.toString()].name;
        }
        
        // 기존 방식으로 폴백
        const region = propertiesData.find(r => r.CTPRVN_CD === regionCode.toString());
        return region ? region.CTP_KOR_NM : '알 수 없음';
      };
      
      // 시군구 코드로 시군구명 가져오기
      const getSigNameByCode = (sigCode) => {
        if (!sigCode) return '알 수 없음';
        
        // regionMapping 활용하여 시군구 이름 가져오기
        const regionCode = sigCode.toString().substring(0, 2);
        if (regionMapping && regionMapping.regions && regionCode in regionMapping.regions) {
          const districts = regionMapping.regions[regionCode].districts;
          if (districts && sigCode.toString() in districts) {
            return districts[sigCode.toString()].name;
          }
        }
        
        // 기존 방식으로 폴백
        const sig = sigPropertiesData.find(s => s.SIG_CD === sigCode.toString());
        return sig ? sig.SIG_KOR_NM : '알 수 없음';
      };

      // 현재 표시할 인기 여행지 데이터 (기존 코드를 computed 속성으로 변환)
      const currentPopularDestinations = computed(() => {
        return popularDestinations.value;
      });
      
      // 실제 조회된 데이터를 기반으로 지역별 인기도 점수 계산
      const calculateRegionScoresFromData = (destinations) => {
        // 지역별 방문 횟수 합계 계산
        const regionVisits = {};
        let totalVisits = 0;
        
        // 지역별 방문 카운트 집계
        destinations.forEach(destination => {
          const regionCode = destination.region?.toString();
          if (!regionCode) return;
          
          if (!regionVisits[regionCode]) {
            regionVisits[regionCode] = 0;
          }
          regionVisits[regionCode] += destination.visitCount || 0;
          totalVisits += destination.visitCount || 0;
        });
        
        console.log('지역별 방문 카운트:', regionVisits);
        
        // 지역별 인기도 점수 계산 (0~1 사이로 정규화)
        const regionScores = {};
        const maxVisits = Math.max(...Object.values(regionVisits));
        
        Object.keys(regionVisits).forEach(regionCode => {
          // 방문 횟수를 0~1 사이로 정규화
          regionScores[regionCode] = regionVisits[regionCode] / maxVisits;
        });
        
        // 점수가 없는 지역에도 최소값 설정
        propertiesData.forEach(region => {
          const regionCode = region.CTPRVN_CD;
          if (!regionScores[regionCode]) {
            regionScores[regionCode] = 0;
          }
        });
        
        console.log('새로 계산된 지역별 인기도 점수:', regionScores);
        
        // 상태 업데이트
        regionPopularityScores.value = {
          regionScores,
          totalVisits
        };
        
        // 지도 업데이트
        nextTick(() => {
          updateMapSelection();
        });
      };
      
      // 실제 조회된 데이터를 기반으로 시군구별 인기도 점수 계산
      const calculateSigScoresFromData = (destinations) => {
        if (!activeRegion.value) return;
        
        // 시군구별 방문 횟수 합계 계산
        const sigVisits = {};
        let totalVisits = 0;
        
        // 시군구별 방문 카운트 집계
        destinations.forEach(destination => {
          const sigCode = destination.sig?.toString();
          if (!sigCode) return;
          
          if (!sigVisits[sigCode]) {
            sigVisits[sigCode] = 0;
          }
          sigVisits[sigCode] += destination.visitCount || 0;
          totalVisits += destination.visitCount || 0;
        });
        
        console.log('시군구별 방문 카운트:', sigVisits);
        
        // 시군구별 인기도 점수 계산 (0~1 사이로 정규화)
        const sigScores = {};
        const maxVisits = Math.max(...Object.values(sigVisits), 1);  // 0으로 나누기 방지
        
        Object.keys(sigVisits).forEach(sigCode => {
          // 방문 횟수를 0~1 사이로 정규화
          sigScores[sigCode] = sigVisits[sigCode] / maxVisits;
        });
        
        // 현재 선택된 지역의 모든 시군구에 대해 점수 설정 (데이터가 없는 경우 0)
        const regionPrefix = activeRegion.value.toString();
        sigPropertiesData.forEach(sig => {
          const sigCode = sig.SIG_CD;
          if (sigCode.startsWith(regionPrefix) && !sigScores[sigCode]) {
            sigScores[sigCode] = 0;
          }
        });
        
        console.log('새로 계산된 시군구별 인기도 점수:', sigScores);
        
        // 상태 업데이트
        sigPopularityScores.value = {
          sigScores,
          totalVisits
        };
        
        // 시군구 지도 업데이트
        nextTick(() => {
          updateDetailMapSelection();
        });
      };
      
      // 지역 선택 함수 수정
      const selectRegion = (regionCode) => {
        console.log("선택된 지역 코드:", regionCode);
        if (activeRegion.value === regionCode) {
          resetActiveRegion();
        } else {
          activeRegion.value = regionCode;
          updateMapSelection();
          
          // 지도 레벨 변경
          currentMapLevel.value = 'sig';
          
          // 바로 상세 지도를 표시
          showDetailMap.value = true; 
          
          // 인기 여행지 로드 (지역 기준) - API 조회 후 시군구 점수 계산
          loadPopularDestinations();
          
          // nextTick을 사용하여 DOM이 업데이트된 후 상세 지도 렌더링
          nextTick(() => {
            if (detailMapContainer.value) {
              renderDetailMap(regionCode);
            } else {
              console.error("상세 지도 컨테이너가 없습니다!");
            }
          });
        }
      };
      
      // 시군구 선택 함수 수정
      const selectSig = (sigCode) => {
        console.log("선택된 시군구 코드:", sigCode);
        if (activeSig.value === sigCode) {
          activeSig.value = null;
          // 시군구 선택 해제 시 지역 기준으로 인기 여행지 재로드
          loadPopularDestinations();
        } else {
          activeSig.value = sigCode;
          
          // 인기 여행지 로드 (시군구 기준)
          loadPopularDestinations();
          updateDetailMapSelection();
        }
      };
  
      // 선택 지역 초기화 및 이전 지도로 돌아가기
      const resetActiveRegion = () => {
        // 시군구 지도에서 돌아가는 경우
        if (currentMapLevel.value === 'sig') {
          // 시군구 선택 초기화
          activeSig.value = null;
          // 지도 레벨 변경
          currentMapLevel.value = 'ctprvn';
          // 상세 지도 숨김
          showDetailMap.value = false;
          // 광역시도 선택도 초기화 (완전 초기화)
          activeRegion.value = null;
          // 기본 정보 표시
          showDefaultInfo.value = true;
          // 광역시도 지도 선택 상태 업데이트
          updateMapSelection();
          // 인기 여행지 목록 초기화를 위해 showAllDestinations 초기화
          showAllDestinations.value = false;
          // 전국 기준 인기 여행지 재로드 - 인기도 점수도 재계산됨
          loadPopularDestinations();
        } else {
          // 광역시도 지도에서 선택 초기화하는 경우
          activeRegion.value = null;
          // 기본 정보 표시
          showDefaultInfo.value = true;
          updateMapSelection();
          // 인기 여행지 목록 초기화를 위해 showAllDestinations 초기화
          showAllDestinations.value = false;
          // 전국 기준 인기 여행지 재로드
          loadPopularDestinations();
        }
      };
  
      // 인기도 점수에 따른 색상 생성 함수
      const getColorByScore = (regionCode) => {
        // 점수 정보가 없으면 기본 색상 반환
        if (!regionPopularityScores.value || !regionPopularityScores.value.regionScores[regionCode]) {
          return '#e2f0fa'; // 매우 낮음 색상으로 변경 (연한 하늘색)
        }

        // 정규화된 점수 (0~1 범위)
        const score = regionPopularityScores.value.regionScores[regionCode];
        
        // 파스텔 색상 팔레트
        // 파스텔 빨강 -> 코랄(주황) -> 파스텔 주황 -> 파스텔 노랑 -> 연한 하늘색
        const colorScale = d3.scaleSequential()
          .domain([0, 1])
          .interpolator(d3.interpolateRgbBasis([
            '#e2f0fa', // 연한 하늘색 (매우 낮음)
            '#fff9c4', // 파스텔 노랑 (낮음)
            '#ffcc80', // 파스텔 주황 (중간)
            '#ffcdd2', // 파스텔 빨강 (높음) - 변경됨
            '#ffab91'  // 코랄(주황빛 파스텔) (매우 높음) - 변경됨
          ]));
        
        const color = colorScale(score);
        
        return color;
      };
      
      // 시군구 인기도 점수에 따른 색상 생성 함수
      const getSigColorByScore = (sigCode) => {
        // 점수 정보가 없으면 기본 색상 반환
        if (!sigPopularityScores.value || !sigPopularityScores.value.sigScores[sigCode]) {
          return '#e2f0fa'; // 매우 낮음 색상으로 변경 (연한 하늘색)
        }
        
        // 정규화된 점수 (0~1 범위)
        const score = sigPopularityScores.value.sigScores[sigCode];
        
        // 파스텔 색상 팔레트
        // 파스텔 빨강 -> 코랄(주황) -> 파스텔 주황 -> 파스텔 노랑 -> 연한 하늘색
        const colorScale = d3.scaleSequential()
          .domain([0, 1])
          .interpolator(d3.interpolateRgbBasis([
            '#e2f0fa', // 연한 하늘색 (매우 낮음)
            '#fff9c4', // 파스텔 노랑 (낮음)
            '#ffcc80', // 파스텔 주황 (중간)
            '#ffcdd2', // 파스텔 빨강 (높음) - 변경됨
            '#ffab91'  // 코랄(주황빛 파스텔) (매우 높음) - 변경됨
          ]));
        
        return colorScale(score);
      };
  
      // 지도 선택 상태 업데이트
      const updateMapSelection = () => {
        if (!map) return;
  
        // 모든 지역 데이터 가져오기
        map.selectAll('.region')
          .classed('selected', false)
          .attr('fill', function(d) {
            // 데이터가 없으면 기본 색상 반환
            if (!d || !d.properties || !d.properties.CTPRVN_CD) {
              return '#75D7B8';
            }
            
            return getColorByScore(d.properties.CTPRVN_CD);
          });
  
        // 선택된 지역 강조 (파란색으로)
        if (activeRegion.value) {
          map.selectAll('.region')
            .filter(d => {
              return d.properties.CTPRVN_CD === activeRegion.value;
            })
            .classed('selected', true)
            .attr('fill', '#4a89dc'); // 강조 색상
        }
      };
  
      // D3.js로 지도 렌더링
      const renderMap = () => {
        const container = mapContainer.value;
        if (!container) return;
  
        // 기존 SVG 제거 (재렌더링 시)
        d3.select(container).selectAll("svg").remove();
  
        const width = container.clientWidth;
        const height = container.clientHeight;
  
        // SVG 생성
        const svg = d3.select(container)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', [0, 0, width, height])
          .style('width', '100%')
          .style('height', '100%');
  
        // 그림자 필터 정의
        const defs = svg.append('defs');
        const dropShadowFilter = defs.append('filter')
          .attr('id', 'dropshadow')
          .attr('height', '130%');
  
        dropShadowFilter.append('feGaussianBlur')
          .attr('in', 'SourceAlpha')
          .attr('stdDeviation', 4)
          .attr('result', 'blur');
  
        dropShadowFilter.append('feOffset')
          .attr('in', 'blur')
          .attr('dx', 0)
          .attr('dy', 6)
          .attr('result', 'offsetBlur');
  
        const feComponentTransfer = dropShadowFilter.append('feComponentTransfer')
          .attr('in', 'offsetBlur')
          .attr('result', 'offsetBlur');
            
        feComponentTransfer.append('feFuncA')
          .attr('type', 'linear')
          .attr('slope', 0.4);
  
        const feMerge = dropShadowFilter.append('feMerge');
        feMerge.append('feMergeNode')
          .attr('in', 'offsetBlur');
        feMerge.append('feMergeNode')
          .attr('in', 'SourceGraphic');
  
        // 지도 그룹 요소
        const g = svg.append('g')
          .attr('class', 'map-group')
          .attr('filter', 'url(#dropshadow)'); // 그림자 필터 적용
        
        map = g; // 전역 참조 저장
  
        try {
          // 최소/최대 좌표 찾기 위한 초기화
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          
          // 모든 지역의 좌표를 검사하여 범위 파악
          ctprvnGeoJson.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
              // 다각형(Polygon) 타입 처리
              if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates[0].forEach(point => {
                  minX = Math.min(minX, point[0]);
                  minY = Math.min(minY, point[1]);
                  maxX = Math.max(maxX, point[0]);
                  maxY = Math.max(maxY, point[1]);
                });
              }
              // 다중 다각형(MultiPolygon) 타입도 처리
              else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => {
                  polygon[0].forEach(point => {
                    minX = Math.min(minX, point[0]);
                    minY = Math.min(minY, point[1]);
                    maxX = Math.max(maxX, point[0]);
                    maxY = Math.max(maxY, point[1]);
                  });
                });
              }
            }
          });
          
          // 지도 투영법 설정
          const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([width * 0.85, height * 0.85], ctprvnGeoJson); // 화면의 85%만 사용해서 여백 확보
          
          // 경로 생성기
          const path = d3.geoPath().projection(projection);
          
          // 지도 그룹 요소에 변환 적용 - 중앙에 위치시키기
          g.attr("transform", `translate(${width * 0.075}, ${height * 0.075})`); // 여백의 절반만큼 이동하여 중앙 정렬
  
          // 지도 데이터 로드 및 그리기
          const regionPaths = g.selectAll('path')
            .data(ctprvnGeoJson.features)
            .enter()
            .append('path')
            .attr('class', 'region')
            .attr('d', path)
            .attr('fill', function(d) {
              // 인기도 점수에 따른 색상 적용
              if (d && d.properties && d.properties.CTPRVN_CD) {
                return getColorByScore(d.properties.CTPRVN_CD);
              }
              return '#75D7B8'; // 기본 색상
            })
            .attr('stroke', '#2D3748') // 검정에 가까운 어두운 회색으로 되돌림
            .attr('stroke-width', 0.7) // 적당한 두께로 조정
            .style('cursor', 'pointer');
  
          // 지역 호버 이벤트
          regionPaths.on('mouseover', function (event, d) {
            hoveredRegion.value = d.properties.CTPRVN_CD;
            
            // 툴팁 위치 설정
            const bounds = this.getBoundingClientRect();
            mousePosition.value = {
              x: bounds.left + bounds.width / 2,
              y: bounds.top
            };
            
            // 호버 효과
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke-width', 1.5);
          });
  
          // 지역 호버 아웃 이벤트
          regionPaths.on('mouseout', function () {
            hoveredRegion.value = null;
            
            // 호버 효과 제거 (선택된 지역 제외)
            if (!d3.select(this).classed('selected')) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 0.7);
            }
          });
  
          // 지역 클릭 이벤트
          regionPaths.on('click', function (event, d) {
            selectRegion(d.properties.CTPRVN_CD);
          });
  
          // 창 크기 변경 시 지도 크기 조정
          const resizeMap = () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
  
            svg.attr('width', newWidth)
              .attr('height', newHeight)
              .attr('viewBox', [0, 0, newWidth, newHeight]);
  
            // 투영법 업데이트
            projection.fitSize([newWidth * 0.85, newHeight * 0.85], ctprvnGeoJson);
            
            // 그룹 요소 위치 업데이트
            g.attr("transform", `translate(${newWidth * 0.075}, ${newHeight * 0.075})`);
            
            // 모든 경로 업데이트
            regionPaths.attr('d', path);
          };
  
          window.addEventListener('resize', resizeMap);
  
          return () => {
            window.removeEventListener('resize', resizeMap);
          };
        } catch (error) {
          console.error("지도 렌더링 중 오류 발생:", error);
          // 오류 메시지 표시
          g.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2 - 20)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .text('지도 데이터 로드 중 오류가 발생했습니다.');
          
          g.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2 + 20)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .attr('font-size', '12px')
            .text(`오류 내용: ${error.message}`);
        }
      };
  
      // 상세 지도 렌더링 (시군구 지도)
      const renderDetailMap = (regionCode) => {
        const container = detailMapContainer.value;
        if (!container) {
          console.error("상세 지도 컨테이너가 없습니다.");
          return;
        }

        // 시군구 선택 초기화
        activeSig.value = null;

        // 시군구별 인기도 점수 초기화 (API 데이터 로드 전 기본값)
        sigPopularityScores.value = {
          sigScores: {},
          totalVisits: 0
        };

        // 기존 SVG 제거 (재렌더링 시)
        d3.select(container).selectAll("svg").remove();

        const width = container.clientWidth;
        const height = container.clientHeight;

        // SVG 생성
        const svg = d3.select(container)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', [0, 0, width, height])
          .style('width', '100%')
          .style('height', '100%');

        // 그림자 필터 정의
        const defs = svg.append('defs');
        const dropShadowFilter = defs.append('filter')
          .attr('id', 'dropshadow-detail')
          .attr('height', '130%');
  
        dropShadowFilter.append('feGaussianBlur')
          .attr('in', 'SourceAlpha')
          .attr('stdDeviation', 4)
          .attr('result', 'blur');
  
        dropShadowFilter.append('feOffset')
          .attr('in', 'blur')
          .attr('dx', 0)
          .attr('dy', 6)
          .attr('result', 'offsetBlur');
  
        const feComponentTransfer = dropShadowFilter.append('feComponentTransfer')
          .attr('in', 'offsetBlur')
          .attr('result', 'offsetBlur');
          
        feComponentTransfer.append('feFuncA')
          .attr('type', 'linear')
          .attr('slope', 0.4);
  
        const feMerge = dropShadowFilter.append('feMerge');
        feMerge.append('feMergeNode')
          .attr('in', 'offsetBlur');
        feMerge.append('feMergeNode')
          .attr('in', 'SourceGraphic');
  
        // 지도 그룹 요소
        const g = svg.append('g')
          .attr('class', 'map-group')
          .attr('filter', 'url(#dropshadow-detail)'); // 그림자 필터 적용
        
        detailMap = g; // 전역 참조 저장
  
        try {
          // 지역 코드의 앞 2자리를 사용하여 해당 지역의 시군구만 필터링
          const filteredFeatures = sigGeoJson.features.filter(feature => {
            // 더 안전한 속성 접근 방식
            if (!feature.properties || !feature.properties.SIG_CD) {
              return false;
            }
            
            const sigCode = feature.properties.SIG_CD;
            
            // 앞 2자리 추출 (문자열로 처리)
            const sigCodePrefix = sigCode.toString().substring(0, 2);
            const regionCodeStr = regionCode.toString();
            
            // 정확한 비교를 위해 문자열로 변환해서 비교
            return sigCodePrefix === regionCodeStr;
          });

          if (filteredFeatures.length === 0) {
            console.log("선택한 지역에 대한 시군구 데이터가 없습니다. 지역 코드:", regionCode);
            g.append('text')
              .attr('x', width / 2)
              .attr('y', height / 2)
              .attr('text-anchor', 'middle')
              .attr('fill', '#333')
              .text('이 지역의 상세 지도는 준비중입니다.');
            return;
          }
  
          // 필터링된 데이터로 새로운 GeoJSON 객체 생성
          const filteredGeoJson = {
            type: "FeatureCollection",
            features: filteredFeatures
          };
  
          // 지도 투영법 설정
          const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([width * 0.85, height * 0.85], filteredGeoJson); // 화면의 85%만 사용해서 여백 확보
          
          // 경로 생성기
          const path = d3.geoPath().projection(projection);
          
          // 지도 그룹 요소에 변환 적용 - 중앙에 위치시키기
          g.attr("transform", `translate(${width * 0.075}, ${height * 0.075})`); // 여백의 절반만큼 이동하여 중앙 정렬
  
          // 지도 데이터 로드 및 그리기
          const regionPaths = g.selectAll('path')
            .data(filteredFeatures)
            .enter()
            .append('path')
            .attr('class', 'region')
            .attr('d', path)
            .attr('fill', function(d) {
              // 인기도 점수에 따른 색상 적용
              if (d && d.properties && d.properties.SIG_CD) {
                return getSigColorByScore(d.properties.SIG_CD);
              }
              return '#87CEEB'; // 기본 하늘색
            })
            .attr('stroke', '#2D3748') // 검정에 가까운 어두운 회색으로 되돌림
            .attr('stroke-width', 0.7) // 적당한 두께로 조정
            .style('cursor', 'pointer');
            
          detailMap = g; // 전역 참조 저장

          // 지역 호버 이벤트
          regionPaths.on('mouseover', function (event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke-width', 1.5);

            // 시군구 정보 설정 및 툴팁 표시
            const sigCode = d.properties.SIG_CD;
            const sigItem = sigPropertiesData.find(item => item.SIG_CD === sigCode);
            
            if (sigItem) {
              hoveredSig.value = sigCode;
              sigTooltipContent.value = sigItem.SIG_KOR_NM;
              showSigTooltip.value = true;
              
              // 마우스 위치 업데이트
              const bounds = this.getBoundingClientRect();
              sigMousePosition.value = {
                x: bounds.left + bounds.width / 2,
                y: bounds.top
              };
            }
          });

          // 지역 호버 아웃 이벤트
          regionPaths.on('mouseout', function () {
            // 선택된 시군구는 색상 유지
            if (activeSig.value && d3.select(this).datum().properties.SIG_CD === activeSig.value) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', '#a8e6cf') // 파스텔톤 연두색으로 변경
                .attr('stroke-width', 1.5);
            } else {
              const sigCode = d3.select(this).datum().properties.SIG_CD;
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', getSigColorByScore(sigCode))
                .attr('stroke-width', 0.7);
            }

            // 툴팁 숨기기
            hoveredSig.value = null;
            showSigTooltip.value = false;
          });
          
          // 시군구 클릭 이벤트
          regionPaths.on('click', function (event, d) {
            selectSig(d.properties.SIG_CD);
          });
  
          // 창 크기 변경 시 지도 크기 조정
          const resizeDetailMap = () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
  
            svg.attr('width', newWidth)
              .attr('height', newHeight)
              .attr('viewBox', [0, 0, newWidth, newHeight]);
  
            // 투영법 업데이트
            projection.fitSize([newWidth * 0.85, newHeight * 0.85], filteredGeoJson);
            
            // 그룹 요소 위치 업데이트
            g.attr("transform", `translate(${newWidth * 0.075}, ${newHeight * 0.075})`);
            
            // 모든 경로 업데이트
            regionPaths.attr('d', path);
          };
  
          window.addEventListener('resize', resizeDetailMap);
  
          return () => {
            window.removeEventListener('resize', resizeDetailMap);
          };
        } catch (error) {
          console.error("상세 지도 렌더링 중 오류 발생:", error);
          // 오류 메시지 표시
          g.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2 - 20)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .text('상세 지도 데이터 로드 중 오류가 발생했습니다.');
          
          g.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2 + 20)
            .attr('text-anchor', 'middle')
            .attr('fill', 'red')
            .attr('font-size', '12px')
            .text(`오류 내용: ${error.message}`);
        }
      };
  
      // 시군구 지도 선택 상태 업데이트
      const updateDetailMapSelection = () => {
        if (!detailMap) return;
        
        // 모든 시군구 선택 상태 초기화하고 인기도에 따른 색상 적용
        detailMap.selectAll('.region')
          .classed('selected', false)
          .attr('fill', function(d) {
            // 데이터가 없으면 기본 색상 반환
            if (!d || !d.properties || !d.properties.SIG_CD) {
              return '#87CEEB';
            }
            
            return getSigColorByScore(d.properties.SIG_CD);
          });
          
        // 선택된 시군구 강조
        if (activeSig.value) {
          detailMap.selectAll('.region')
            .filter(d => d.properties.SIG_CD === activeSig.value)
            .classed('selected', true)
            .attr('fill', '#a8e6cf'); // 선택된 지역은 파스텔톤 연두색으로 강조
        }
      };
  
      // panelDisplayData 변경 감지하여 showDefaultInfo 업데이트
      watch(panelDisplayData, (newValue) => {
        // 패널 데이터가 없으면 기본 정보 표시
        showDefaultInfo.value = newValue === null;
      });
      
      // activeRegion 및 activeSig 변경 감지
      watch([activeRegion, activeSig], ([newRegion, newSig]) => {
        // 선택된 지역이 있으면 기본 정보 숨김
        if (newRegion || newSig) {
          showDefaultInfo.value = false;
        } else {
          showDefaultInfo.value = true;
        }
      });
  
      // activeRegion 변경 감지
      watch(activeRegion, (newValue) => {
        if (newValue !== null) {
          showDetailMap.value = true;
          nextTick(() => {
            if (detailMapContainer.value) {
              renderDetailMap(newValue);
              // 시군구 지도 렌더링 후 범례 추가
              nextTick(() => {
                addSigLegend();
              });
            }
          });
        } else {
          showDetailMap.value = false;
          // 시군구 선택 초기화
          activeSig.value = null;
          // 지도 레벨 초기화
          currentMapLevel.value = 'ctprvn';
        }
      });
  
      // 인기 지역 범례 추가
      const addLegend = () => {
        if (!mapContainer.value) return;
        
        const container = d3.select(mapContainer.value);
        
        // 기존 범례 삭제
        container.select('.map-legend').remove();
        
        const legend = container.append('div')
          .attr('class', 'map-legend')
          .style('position', 'absolute')
          .style('bottom', '20px')
          .style('right', '20px')
          .style('background-color', 'rgba(255, 255, 255, 0.9)')
          .style('padding', '10px')
          .style('border-radius', '5px')
          .style('box-shadow', '0 1px 4px rgba(0,0,0,0.2)')
          .style('font-size', '12px')
          .style('z-index', '10');
        
        legend.append('div')
          .style('font-weight', 'bold')
          .style('margin-bottom', '8px')
          .text('여행지 인기도');
        
        // 파스텔 색상 5단계 범례
        const gradientItems = [
          { label: '매우 높음', color: '#ffab91' }, // 코랄(주황빛 파스텔) - 변경됨
          { label: '높음', color: '#ffcdd2' },      // 파스텔 빨강 - 변경됨
          { label: '중간', color: '#ffcc80' },      // 파스텔 주황
          { label: '낮음', color: '#fff9c4' },      // 파스텔 노랑
          { label: '매우 낮음', color: '#e2f0fa' }   // 연한 하늘색
        ];
        
        gradientItems.forEach(item => {
          const itemDiv = legend.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('margin-bottom', '3px');
          
          itemDiv.append('div')
            .style('width', '15px')
            .style('height', '15px')
            .style('background-color', item.color)
            .style('margin-right', '5px')
            .style('border', '1px solid #ddd');
          
          itemDiv.append('span')
            .text(item.label);
        });
      };
      
      // 시군구 범례 추가
      const addSigLegend = () => {
        if (!detailMapContainer.value) return;
        
        const container = d3.select(detailMapContainer.value);
        
        // 기존 범례 삭제
        container.select('.sig-map-legend').remove();
        
        const legend = container.append('div')
          .attr('class', 'sig-map-legend')
          .style('position', 'absolute')
          .style('bottom', '20px')
          .style('right', '20px')
          .style('background-color', 'rgba(255, 255, 255, 0.9)')
          .style('padding', '10px')
          .style('border-radius', '5px')
          .style('box-shadow', '0 1px 4px rgba(0,0,0,0.2)')
          .style('font-size', '12px')
          .style('z-index', '10');
        
        legend.append('div')
          .style('font-weight', 'bold')
          .style('margin-bottom', '8px')
          .text('지역구별 여행지 인기도');
        
        // 파스텔 색상 5단계 범례
        const gradientItems = [
          { label: '매우 높음', color: '#ffab91' }, // 코랄(주황빛 파스텔) - 변경됨
          { label: '높음', color: '#ffcdd2' },      // 파스텔 빨강 - 변경됨
          { label: '중간', color: '#ffcc80' },      // 파스텔 주황
          { label: '낮음', color: '#fff9c4' },      // 파스텔 노랑
          { label: '매우 낮음', color: '#e2f0fa' }   // 연한 하늘색
        ];
        
        gradientItems.forEach(item => {
          const itemDiv = legend.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('margin-bottom', '3px');
          
          itemDiv.append('div')
            .style('width', '15px')
            .style('height', '15px')
            .style('background-color', item.color)
            .style('margin-right', '5px')
            .style('border', '1px solid #ddd');
          
          itemDiv.append('span')
            .text(item.label);
        });
      };
  
      // 컴포넌트 마운트 시 처리
      onMounted(() => {
        // 마우스 이벤트 리스너 등록
        window.addEventListener('mousemove', updateMousePosition);
  
        // 지도 렌더링
        renderMap();
        
        // 범례 추가
        addLegend();
        
        // 연령대별 차트 초기 렌더링
        nextTick(() => {
          renderAgeChart();
        });
        
        // 위시리스트 복원
        const savedWishlist = localStorage.getItem('logo_wishlist');
        if (savedWishlist) {
          try {
            const wishlistIds = JSON.parse(savedWishlist);
            console.log('저장된 위시리스트 ID:', wishlistIds);
            
            // 위시리스트 ID만 있는 경우 기본 객체로 변환하여 wishlistItems에 저장
            wishlistItems.value = wishlistIds.map(id => ({
              id: id
            }));
          } catch (error) {
            console.error('위시리스트 데이터 로드 오류:', error);
          }
        }
        
        // 인기 여행지 로드 (전국 기준) - 로드 후 인기도 자동 계산됨
        loadPopularDestinations();
        
        // 카카오 맵 API 로드
        try {
          loadKakaoMapsScript();
          console.log("카카오 맵 API 준비 완료");
        } catch (error) {
          console.error("카카오 맵 API 로드 실패:", error);
        }
        
        // 컴포넌트 언마운트 시 이벤트 리스너 정리
        return () => {
        window.removeEventListener('mousemove', updateMousePosition);
        };
      });

      const popularDestinationsTitle = computed(() => {
        if (currentMapLevel.value === 'sig' && activeSig.value) {
          const sig = sigPropertiesData.find(s => s.SIG_CD === activeSig.value);
          return sig ? `${sig.SIG_KOR_NM} 인기 여행지 TOP ${popularDestinations.value.length}` : '인기 여행지';
        } else if (activeRegion.value) {
          const region = propertiesData.find(r => r.CTPRVN_CD === activeRegion.value);
          return region ? `${region.CTP_KOR_NM} 인기 여행지 TOP ${popularDestinations.value.length}` : '인기 여행지';
        } else {
          return `전국 인기 여행지 TOP ${popularDestinations.value.length}`;
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

      // 상세 모달 열기 함수 - 통계 데이터 로딩 추가
      const openDetailModal = (destination) => {
        console.log('상세 모달 열기:', destination);
        
        // p_image와 같은 실제 API 필드들을 그대로 전달
        selectedDetail.value = {
          ...destination,
          name: destination.name,
          address: destination.address,
          reviews: dummyReviews // 더미 리뷰 데이터 추가
        };
        
        showDetailModal.value = true;
        
        // 통계 데이터 로드
        loadDestinationStats(destination.id);
        
        // 모달이 열린 후 지도 초기화를 위해 nextTick 사용
        nextTick(() => {
          // 약간의 지연 추가로 모달 애니메이션 완료 후 지도 초기화
          setTimeout(() => {
            initDetailMap();
          }, 300);
        });
      };
      
      // 연령별 방문 통계 로드
      const loadDestinationStats = async (placeId) => {
        if (!placeId) return;
        
        try {
          isLoadingStats.value = true;
          
          // Elasticsearch 쿼리 구성
          const query = {
            size: 0,
            query: {
              term: {
                p_id: parseInt(placeId)
              }
            },
            aggs: {
              age_distribution: {
                terms: {
                  field: "u_age",
                  size: 10,
                  order: {
                    "_key": "asc"
                  }
                }
              },
              gender_distribution: {
                terms: {
                  field: "u_gender",
                  size: 2
                }
              },
              total_visits: {
                value_count: {
                  field: "p_id"
                }
              }
            }
          };
          
          console.log('연령별 방문 통계 조회 쿼리:', JSON.stringify(query, null, 2));
          
          // Elasticsearch 직접 호출
          const response = await fetch(`${config.ES_API}/travel_places/_search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
          });
          
          if (!response.ok) {
            throw new Error(`Elasticsearch API 오류: ${response.status}`);
          }
          
          const data = await response.json();
          
          // 연령대별 통계 처리
          if (data?.aggregations?.age_distribution?.buckets) {
            // 모든 연령대 버킷 준비 (없는 데이터는 0으로)
            const allAgeBuckets = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(age => {
              // 해당 연령대의 버킷 찾기
              const foundBucket = data.aggregations.age_distribution.buckets.find(b => b.key === age);
              return {
                age: age,
                label: `${age}대`,
                value: foundBucket ? foundBucket.doc_count : 0
              };
            });
            
            ageStats.value = allAgeBuckets;
          } else {
            ageStats.value = [];
          }
          
          // 성별 통계 처리
          if (data?.aggregations?.gender_distribution?.buckets) {
            genderStats.value = data.aggregations.gender_distribution.buckets.map(bucket => ({
              gender: bucket.key,
              label: bucket.key === 'M' ? '남성' : '여성',
              value: bucket.doc_count
            }));
          } else {
            genderStats.value = [
              { gender: 'M', label: '남성', value: 0 },
              { gender: 'F', label: '여성', value: 0 }
            ];
          }
          
          // 총 방문 횟수
          if (data?.aggregations?.total_visits) {
            totalStatsVisits.value = data.aggregations.total_visits.value;
          } else {
            totalStatsVisits.value = 0;
          }
          
          console.log('연령별 방문 통계 로드 완료:', { 
            ageStats: ageStats.value, 
            genderStats: genderStats.value, 
            totalVisits: totalStatsVisits.value 
          });
          
        } catch (error) {
          console.error('연령별 방문 통계 로드 오류:', error);
          // 오류 발생 시 기본값 설정
          ageStats.value = [];
          genderStats.value = [];
          totalStatsVisits.value = 0;
        } finally {
          isLoadingStats.value = false;
        }
      };
      
      // 상세 모달 닫기 함수
      const closeDetailModal = () => {
        showDetailModal.value = false;
        // 통계 데이터 초기화
        ageStats.value = [];
        genderStats.value = [];
        totalStatsVisits.value = 0;
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
              <span style="font-weight: bold;">${selectedDetail.value.name || '여행지'}</span>
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

      return {
        activeRegion,
        hoveredRegion,
        hoveredRegionName,
        tooltipStyle,
        mapContainer,
        detailMapContainer,
        getActiveRegion,
        getActiveSig,
        selectRegion,
        resetActiveRegion,
        showDetailMap,
        showDefaultInfo,
        // 시군구 관련
        activeSig,
        currentMapLevel,
        // 패널 표시 데이터
        panelDisplayData,
        panelTitle,
        panelDescription,
        panelDetails,
        // 상세 지도 툴팁 관련 변수
        hoveredSig,
        sigTooltipContent,
        sigTooltipStyle,
        showSigTooltip,
        // 데이터 관련 추가 변수
        currentRegionData,
        currentPopularDestinations,
        showAllDestinations,
        // 추가된 변수
        popularDestinations,
        isLoadingDestinations,
        popularDestinationsTitle,
        loadPopularDestinations,
        // 상세 모달 관련
        openDetailModal,
        closeDetailModal,
        showDetailModal,
        selectedDetail,
        // 통계 관련
        ageStats,
        genderStats,
        totalStatsVisits,
        isLoadingStats,
        // 파이/도넛 차트 관련
        hoveredSegment,
        hoveredGenderSegment,
        totalAgeVisits,
        agePieSegments,
        ageChartCanvas,
        genderPieSegments,
        pieTooltipStyle,
        genderTooltipStyle,
        getMajorityGender,
        getColorForAge,
        // 성별 아이콘 관련
        malePercentage,
        femalePercentage,
        // 위시리스트 관련
        isInWishlist,
        toggleWishlist,
        // 리뷰 관련
        formatReviewDate
      };
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
  
  .look-around-page {
    font-family: 'Noto Sans KR', sans-serif;
    min-height: 100vh;
    background-color: #f8f9fa;
    color: #333;
    display: flex;
    flex-direction: column;
  }
  
  /* 콘텐츠 영역 */
  .content-wrapper {
    padding: 2rem 1rem;
    max-width: 1600px; /* 최대 너비 증가 */
    margin: 0 auto;
    width: 98%; /* 화면 너비 대비 비율 증가 */
  }
  
  /* 콘텐츠 레이아웃 */
  .content-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    gap: 1.5rem;
    margin-bottom: 2rem;
    position: relative;
    transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    justify-items: center;
  }
  
  .content-layout.region-active {
    grid-template-columns: 1.5fr 1fr;
    justify-items: stretch;
  }
  
  /* 지도 섹션 */
  .map-section {
    height: 570px; /* 지도 높이 증가 */
    width: 100%;
    max-width: 900px;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    grid-column: 1;
    grid-row: 1;
    justify-self: center;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  
  .content-layout.region-active .map-section {
    width: 100%;
    max-width: none;
    justify-self: stretch;
  }
  
  .map-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fcfcfa;
    z-index: 1;
  }
  
  .map-component {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
    flex-grow: 1;
  }
  
  /* 지역 호버 및 선택 효과 */
  .region {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .region:hover {
    filter: brightness(1.05);
  }
  
  .region.selected {
    stroke-width: 1.5px;
    filter: brightness(1.05);
  }
  
  /* 지역 툴팁 */
  .region-tooltip {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    pointer-events: none;
    z-index: 1000;
    transform: translate(-50%, -100%);
    white-space: nowrap;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.3);
    text-align: center;
    min-width: 80px;
  }
  
  .region-tooltip::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.8);
  }
  
  /* 지역 정보 패널 */
  .region-info-panel {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    color: #333;
    height: 570px; /* 정보 패널 높이 조정 */
    overflow-y: auto;
    grid-column: 2;
    grid-row: 1;
    transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    opacity: 0;
    transform: translateX(50px);
    visibility: hidden;
    width: 100%;
  }
  
  .region-info-panel.active {
    opacity: 1;
    transform: translateX(0);
    visibility: visible;
  }
  
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    z-index: 5;
    transition: all 0.3s ease;
  }
  
  .close-button:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .region-info {
    position: relative;
  }
  
  .region-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #48b0e4;
  }
  
  .region-description {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    color: #555;
  }
  
  /* 상세 지도 섹션 - 제거하고 map-section 안에 통합 */
  .detail-map-section {
    display: none; /* 더 이상 사용하지 않음 */
  }
  
  /* 상세 지도 헤더 */
  .detail-map-header {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0 10px;
  }
  
  .back-button {
    border: none;
    background-color: #f5f5f5;
    color: #333;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-right: 1rem;
  }
  
  .back-button:hover {
    background-color: #e0e0e0;
  }
  
  .back-icon {
    font-size: 1.1rem;
    margin-right: 4px;
  }
  
  /* 푸터 */
  .footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 1rem;
    margin-top: auto;
  }
  
  /* 시군구 툴팁 */
  .sig-tooltip {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    pointer-events: none;
    z-index: 1000;
    transform: translate(-50%, -100%);
    white-space: nowrap;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.3);
    text-align: center;
    min-width: 80px;
  }
  
  .sig-tooltip::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.8);
  }
  
  /* 섹션 타이틀 공통 스타일 */
  .section-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem;
    color: #48b0e4;
    position: relative;
    padding-left: 12px;
    border-left: 4px solid #48b0e4;
  }
  
  /* 지역 특산품 섹션 */
  .region-specialties {
    margin-top: 1rem; /* 여백 감소 */
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .specialties-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .specialty-item {
    background-color: #f8f9fa;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
  }
  
  .specialty-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }
  
  .specialty-image {
    height: 120px;
    background-size: cover;
    background-position: center;
  }
  
  .specialty-content {
    padding: 1rem;
  }
  
  .specialty-content h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }
  
  .specialty-content p {
    margin: 0;
    font-size: 0.85rem;
    color: #555;
    line-height: 1.4;
  }
  
  /* 인기 여행지 섹션 */
  .popular-destinations-section {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
    margin-bottom: 3rem; /* 추가된 하단 여백 */
  }
  
  .section-title span {
    font-size: 0.9rem;
    font-weight: 400;
    margin-left: 0.5rem;
    color: #777;
  }
  
  .destinations-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-top: 2rem;
    padding: 0.5rem;
  }
  
  .destination-card {
    position: relative;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 460px; /* Increased to accommodate larger image */
  }
  
  .destination-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  .destination-rank {
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px 14px;
    background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
    color: white;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 600;
    z-index: 2;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }
  
  /* 등수 랭킹 컬러 */
  .destination-card:nth-child(1) .destination-rank {
    background: linear-gradient(135deg, #ffca2c, #ffab00);
  }
  
  .destination-card:nth-child(2) .destination-rank {
    background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
  }
  
  .destination-card:nth-child(3) .destination-rank {
    background: linear-gradient(135deg, #d98936, #b0732f);
  }
  
  .destination-image {
    height: 360px; /* Doubled from 180px to 360px */
    background-size: cover;
    background-position: center;
    transition: transform 0.5s ease;
  }
  
  .destination-card:hover .destination-image {
    transform: scale(1.05);
  }
  
  .destination-content {
    padding: 1.2rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .destination-content h4 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.7rem 0;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
  }
  
  .destination-location {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.7rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .destination-rating {
    margin-top: auto;
    display: flex;
    align-items: center;
  }
  
  .star {
    color: #d0d0d0;
    font-size: 0.8rem;
    margin-right: 2px;
  }
  
  .star.filled {
    color: #ffd700;
  }
  
  .rating-value {
    color: #555;
    font-size: 0.8rem;
    margin-left: 0.5rem;
    font-weight: 500;
  }

  /* 방문 카운트 스타일 */
  .visit-count {
    display: flex;
    align-items: center;
    margin-top: 0.5rem;
    margin-bottom: 0.7rem;
  }
  
  .count-label {
    font-size: 0.85rem;
    color: #666;
    margin-right: 0.5rem;
  }
  
  .count-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #4299e1;
  }

  /* 태그 스타일 */
  .destination-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: auto;
    margin-top: 0.8rem;
  }
  
  .tag {
    background-color: rgba(72, 176, 228, 0.1);
    border-radius: 50px;
    color: #48b0e4;
    padding: 0.3rem 0.9rem;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .tag:hover {
    background-color: #48b0e4;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  /* 로딩 컨테이너 스타일 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #4299e1;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .loading-container p {
    color: #718096;
    font-size: 0.9rem;
  }

  /* 결과 없음 메시지 스타일 */
  .no-results {
    text-align: center;
    padding: 3rem 0;
    color: #718096;
    font-style: italic;
  }
  
  /* 더 많은 여행지 보기 버튼 */
  .view-more-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
  
  .view-more-button, .view-less-button {
    background-color: #f5f5f5;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
  }
  
  .view-more-button:hover, .view-less-button:hover {
    background-color: #e0e0e0;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1400px) {
    .destinations-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  @media (max-width: 1200px) {
    .destinations-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 992px) {
    .content-layout.region-active {
      grid-template-columns: 1fr;
    }
    
    .region-info-panel {
      grid-column: 1;
      grid-row: 2;
      height: auto;
      max-height: 570px; /* 최대 높이 제한 */
    }
    
    .destinations-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .destinations-grid {
      grid-template-columns: 1fr;
    }
    
    .specialties-grid {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 576px) {
    .destinations-grid {
      grid-template-columns: 1fr;
    }
    
    .hero-title {
      font-size: 1.8rem;
    }
    
    .hero-subtitle {
      font-size: 1rem;
    }
    
    .map-section {
      height: 450px; /* 모바일에서 적절한 크기로 조정 */
    }
  }
  
  /* 더 많은 여행지 표시 영역 */
  .more-destinations {
    margin-top: 2rem;
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .more-destinations-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .more-destinations-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .more-destination-item {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    border-radius: 5px;
    background-color: #f9f9f9;
    font-size: 0.9rem;
  }
  
  .more-destination-rank {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #eaeaea;
    border-radius: 50%;
    font-weight: 600;
    margin-right: 10px;
    font-size: 0.8rem;
  }
  
  .more-destination-name {
    font-weight: 600;
    margin-right: 10px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .more-destination-location {
    color: #777;
    font-size: 0.8rem;
    white-space: nowrap;
    margin-right: 10px;
    max-width: 30%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .more-destination-rating {
    background-color: #ffcc00;
    border-radius: 3px;
    padding: 2px 5px;
    color: white;
    font-weight: 600;
    font-size: 0.8rem;
  }
  
  .view-less-button {
    display: block;
    margin: 0 auto;
  }
  
  /* 지도 범례 스타일 */
  .map-legend {
    font-family: 'Noto Sans KR', sans-serif;
  }

  /* 더 많은 여행지 영역 반응형 */
  @media (max-width: 992px) {
    .more-destinations-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 576px) {
    .more-destinations-grid {
      grid-template-columns: 1fr;
    }
    
    .more-destination-location {
      display: none;
    }
  }

  /* 모달 스타일 추가 */
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
    font-family: 'Noto Sans KR', sans-serif;
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
    font-family: 'Noto Sans KR', sans-serif;
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
    font-family: 'Noto Sans KR', sans-serif;
  }

  .chart-container h5 {
    font-family: 'Noto Sans KR', sans-serif;
  }

  .reviewer-name, .review-date, .review-content {
    font-family: 'Noto Sans KR', sans-serif;
  }

  .info-label, .info-value {
    font-family: 'Noto Sans KR', sans-serif;
  }

  .modal-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .heart-btn {
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

  .heart-btn:hover {
    background-color: #f7fafc;
    color: #4a5568;
  }

  .heart-btn.active {
    color: #ffab91;
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
    font-family: 'Noto Sans KR', sans-serif;
  }

  /* 태그 리스트 */
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .tag {
    background-color: rgba(72, 176, 228, 0.1);
    color: var(--logo-blue, #48b0e4);
    font-size: 0.9rem;
    padding: 0.35rem 0.85rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tag:hover {
    background-color: var(--logo-blue, #48b0e4);
    color: white;
    transform: translateY(-2px);
  }

  /* 설명 텍스트 */
  .detail-description {
    font-size: 1rem;
    line-height: 1.7;
    color: #4a5568;
    margin: 0;
  }

  /* 방문 정보 섹션 */
  .detail-visit-info {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .visit-info-item {
    display: flex;
    align-items: center;
  }

  .info-label {
    width: 120px;
    font-size: 0.95rem;
    color: #4a5568;
    font-weight: 500;
  }

  .info-value {
    font-size: 0.95rem;
    color: #2d3748;
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

  /* 반응형 모달 조정 */
  @media (max-width: 1100px) {
    .visual-section {
      flex-direction: column;
    }
    
    .detail-image-container, 
    .detail-map-container {
      width: 100%;
      height: 350px;
    }
    
    .info-label {
      width: 100px;
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

  /* 추가된 하트 표시 스타일 */
  .heart-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
  }

  .heart-indicator.active {
    color: var(--logo-coral, #ff8e7f);
    animation: heartbeat 1s ease-in-out;
  }

  .heart-indicator svg {
    fill: transparent;
    transition: fill 0.3s ease;
  }

  .heart-indicator.active svg {
    fill: var(--logo-coral, #ff8e7f);
  }

  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  .destination-rank.with-heart {
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

  /* 하트 버튼 스타일 */
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
    color: var(--logo-coral, #ff8e7f);
    transform: scale(1.1);
  }

  .heart-btn.active {
    color: var(--logo-coral, #ff8e7f);
    animation: heartbeat 1s ease-in-out;
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
    color: var(--logo-yellow, #ffd166);
  }

  .star-empty {
    color: #e2e8f0;
  }

  .review-content {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #4a5568;
  }

  /* 반응형 조정 - 리뷰 섹션 */
  @media (max-width: 768px) {
    .review-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }

  /* 연령별 방문 통계 스타일 */
  .stats-section {
    background-color: #f8fafc;
  }
  
  .stats-charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin: 1rem 0;
  }
  
  .chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .chart-container h5 {
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .pie-chart-wrapper {
    position: relative;
    width: 320px;
    height: 320px;
    margin: 0 auto;
  }
  
  .pie-segment {
    transition: transform 0.2s;
    cursor: pointer;
  }
  
  .pie-segment:hover {
    transform: translateX(3px) translateY(-3px);
    filter: brightness(1.05);
  }
  
  .segment-label {
    pointer-events: none;
    user-select: none;
    text-shadow: 0px 0px 3px rgba(255, 255, 255, 0.5);
  }
  
  .pointer-label {
    pointer-events: none;
    user-select: none;
    text-shadow: 0px 0px 8px rgba(255, 255, 255, 0.8);
  }
  
  .pie-tooltip {
    position: fixed;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.95rem;
    pointer-events: none;
    transform: translate(-50%, -100%);
    white-space: nowrap;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
  
  .pie-tooltip::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.8);
  }
  
  /* 성별 아이콘 그래프 스타일 */
  .gender-icons-container {
    display: flex;
    justify-content: center;
    height: 260px;
    padding: 15px 0;
  }
  
  .gender-display {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: 100%;
    gap: 30px;
  }
  
  .gender-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  
  .gender-label {
    margin-top: 5px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }
  
  .gender-icon {
    transition: transform 0.3s ease;
  }
  
  .gender-item:hover .gender-icon {
    transform: translateY(-5px);
  }
  
  .gender-item.male .gender-label {
    color: #16a5a5; /* 남성 색상 */
  }
  
  .gender-item.female .gender-label {
    color: #e05d55; /* 여성 색상 */
  }
  
  .percentage {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .gender-item.male .percentage {
    color: #16a5a5;
  }
  
  .gender-item.female .percentage {
    color: #e05d55;
  }
  
  .no-gender-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #64748b;
    font-style: italic;
  }
  
  .stats-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
  }
  
  .stats-loading .spinner {
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 3px solid #4299e1;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .stats-loading p {
    color: #64748b;
    font-size: 0.9rem;
  }
  
  .no-stats-data {
    text-align: center;
    padding: 2rem 0;
    color: #64748b;
    font-style: italic;
  }
  
  /* 반응형 통계 섹션 */
  @media (max-width: 768px) {
    .stats-charts {
      grid-template-columns: 1fr;
    }
    
    .chart-container:last-child {
      margin-top: 1.5rem;
    }
  }

  /* 성별 아이콘 그래프 스타일 */
  .gender-chart-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  .gender-icons-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .gender-figure-container {
    display: flex;
    justify-content: center;
    gap: 60px;
    margin: 10px 0 20px;
  }

  .gender-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .icon-container {
    position: relative;
    width: 130px;
    height: 260px;
    overflow: hidden;
    margin-bottom: 15px;
  }

  .male-icon, .female-icon {
    height: 100%;
    width: 100%;
  }

  .gender-label-percent {
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
  }

  .gender-icon.male .gender-label-percent {
    color: #4c7bd8;
  }

  .gender-icon.female .gender-label-percent {
    color: #e5518d;
  }

  .percent-value {
    font-weight: 600;
    font-size: 0.85rem;
  }

  .gender-percentage-bar {
    display: flex;
    width: 100%;
    max-width: 320px;
    height: 8px;
    background-color: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
  }

  .male-percentage {
    height: 100%;
    background-color: #4c7bd8;
  }

  .female-percentage {
    height: 100%;
    background-color: #e5518d;
  }

  .no-gender-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #64748b;
    font-style: italic;
  }

  .pie-chart-wrapper {
    position: relative;
    width: 320px;
    height: 320px;
    margin: 0 auto;
  }
  
  .age-chart-wrapper {
    position: relative;
    width: 320px;
    height: 320px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .no-age-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    color: #64748b;
    font-style: italic;
    background-color: #f8fafc;
    border-radius: 8px;
  }

  .reviews-section {
    margin-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
    padding-top: 1.5rem;
  }
  
  .age-chart-wrapper {
    position: relative;
    width: 380px;
    height: 380px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .no-age-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    color: #64748b;
    font-style: italic;
    background-color: #f8fafc;
    border-radius: 8px;
  }
  </style> 