<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="place-detail-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-title-location">
          <h3>{{ getPlaceName }}</h3>
          <div class="modal-location">{{ getPlaceAddress }}</div>
        </div>
        <div class="modal-actions">
          <button class="heart-btn" :class="{ 'active': isCurrentPlaceInWishlist }"
            @click="handleHeartClick" title="여행 계획에 추가">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
              </path>
            </svg>
          </button>
          <button class="close-btn" @click="closeModal">
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
            <img v-if="displayImageUrl" :src="displayImageUrl" :alt="getPlaceName || '여행지 이미지'"
              class="detail-image">
            <div v-else class="placeholder-image">이미지 없음</div>
          </div>
              
          <!-- 지도 영역 -->
          <div class="detail-map-container">
            <div id="detailMap" ref="detailMapContainer" class="detail-map"></div>
          </div>
        </div>
        
        <!-- 태그 섹션 -->
        <div v-if="getPlaceTags && getPlaceTags.length > 0" class="detail-section">
          <h4>태그</h4>
          <div class="tag-list">
            <span 
              v-for="(tag, index) in getPlaceTags" 
              :key="index" 
              class="tag" 
              @click="$emit('apply-keyword', tag); closeModal();"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 설명 섹션 -->
        <div v-if="getPlaceDescription" class="detail-section">
          <h4>설명</h4>
          <p class="detail-description">{{ getPlaceDescription }}</p>
        </div>
        
        <!-- 특성 분석 섹션 -->
        <div v-if="dimensionValues.length > 0" class="detail-section">
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

        <!-- 연령대별 방문 통계 섹션 -->
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
                          <g :style="{ mask: 'url(#male-mask-' + getMaskId + ')' }">
                            <path d="M123.25,82.17H35.42C13.84,82.17-2.72,101.3.37,122.66l11.55,79.69c1.17,8.06,8.07,14.03,16.21,14.03h2.43l14.06,116.16h69.42l14.06-116.16h2.51c8.11,0,14.99-5.96,16.15-13.98l11.56-79.94c2.97-21.29-13.57-40.29-35.07-40.29Z" fill="#4c7bd8"/>
                            <circle cx="79.33" cy="37.42" r="37.42" transform="translate(-3.23 67.06) rotate(-45)" fill="#4c7bd8"/>
                          </g>
                          <mask :id="`male-mask-${getMaskId}`">
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
                          <g :style="{ mask: 'url(#female-mask-' + getMaskId + ')' }">
                            <circle cx="78.68" cy="37.42" r="37.42" transform="translate(24.18 105.4) rotate(-76.72)" fill="#e5518d"/>
                            <path d="M156.76,187.25l-24.97-94.01c-.03-.1-.06-.2-.09-.29-2.35-6.46-8.49-10.77-15.37-10.77H41.02c-6.89,0-13.03,4.31-15.37,10.77-.03.1-.06.19-.09.29L.59,187.25s-5.18,20.11,15.14,23.87h.31l-6.41,33.76h24.91l12.45,87.66h63.38l12.45-87.66h24.91l-6.41-33.76h.3c19.58-3.22,15.15-23.87,15.15-23.87Z" fill="#e5518d"/>
                          </g>
                          <mask :id="`female-mask-${getMaskId}`">
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
        
        <!-- 리뷰 섹션 -->
        <div class="detail-section">
          <h4>방문자 리뷰 ({{ totalReviews }})</h4>
          
          <!-- 로딩 중 -->
          <div v-if="isLoadingReviews && reviews.length === 0" class="reviews-loading">
            <div class="spinner"></div>
            <p>후기를 불러오는 중...</p>
          </div>
          
          <!-- 후기가 없는 경우 -->
          <div v-else-if="!isLoadingReviews && reviews.length === 0" class="no-reviews">
            <p>아직 등록된 후기가 없습니다.</p>
          </div>
          
          <!-- 후기 목록 -->
          <div v-else class="reviews-container">
            <div v-for="(review, index) in reviews" :key="index" class="review-item">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-name">{{ review.userName }}</div>
                  <div class="review-date">{{ formatReviewDate(review.date) }}</div>
                  <div class="reviewer-details">
                    {{ review.userAge }}세 {{ review.userGender === 'M' ? '남성' : '여성' }}
                  </div>
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
            
            <!-- 더보기 버튼 -->
            <div v-if="hasMoreReviews" class="load-more-container">
              <button 
                @click="loadMoreReviews" 
                :disabled="isLoadingReviews"
                class="load-more-btn"
              >
                <span v-if="isLoadingReviews">로딩 중...</span>
                <span v-else>더보기 ({{ totalReviews - reviews.length }}개 더)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import Chart from 'chart.js/auto';
import config from "@/config.js";
import { getPlaceDetails, getPlaceReviews } from "@/services/api.js";

export default {
  name: "PlaceDetailModal",
  
  props: {
    show: Boolean,
    detail: Object,
    isInWishlist: Boolean,
    ageStats: Array,
    genderStats: Array,
    totalStatsVisits: Number,
    isLoadingStats: Boolean,
    userLikes: Array
  },
  
  setup(props, { emit }) {
    // 차트 관련 변수
    const ageChartCanvas = ref(null);
    let ageChart = null;
    const detailMapContainer = ref(null);
    
    // API 응답 데이터를 저장할 상태 변수들
    const placeDetailsData = ref(null);
    const isLoadingPlaceDetails = ref(false);
    
    // 후기 관련 상태 변수들
    const reviews = ref([]);
    const totalReviews = ref(0);
    const isLoadingReviews = ref(false);
    const hasMoreReviews = ref(false);
    const reviewsPage = ref(0);
    const reviewsPerPage = 5;
    
    const displayImageUrl = computed(() => {
      if (!props.detail) {
        return null;
      }
      
      let imageUrl = null;
      
      // LogoSearch(searchSimilarImages)와 KeywordSearch(searchImagesByKeyword) 양쪽 모두 처리
      if (props.detail._source && props.detail._source.p_image) {
        // Elasticsearch _source 직접 포함된 경우 (searchSimilarImages 형식)
        imageUrl = props.detail._source.p_image;
      } else if (props.detail.p_image) {
        // _source가 추출된 경우 (일반 형식)
        imageUrl = props.detail.p_image;
      }
      
      // base64 이미지 처리 (prefix가 없는 경우 추가)
      if (imageUrl) {
        // 이미 "data:image/" 접두어가 있는지 확인
        if (!imageUrl.startsWith('data:image/')) {
          // base64 문자열만 있는 경우 적절한 접두어 추가
          imageUrl = `data:image/jpeg;base64,${imageUrl}`;
        }
        console.log("이미지 URL 처리 완료:", imageUrl.substring(0, 50) + "...");
      }
      
      return imageUrl;
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

    // 차원 라벨 생성 - 인덱스로 접근
    const getDimensionLabel = (index) => {
      return dimensionLabels[index] || `차원 ${index + 1}`;
    };
    
    // p_vector 배열에서 차원 값 가져오기
    const dimensionValues = computed(() => {
      if (!props.detail) {
        return [];
      }
      
      // LogoSearch(searchSimilarImages)와 KeywordSearch(searchImagesByKeyword) 양쪽 모두 처리
      if (props.detail._source && props.detail._source.p_vector) {
        // Elasticsearch _source 직접 포함된 경우 (searchSimilarImages 형식)
        return props.detail._source.p_vector;
      } else if (props.detail.p_vector) {
        // _source가 추출된 경우 (일반 형식)
        return props.detail.p_vector;
      }
      
      return [];
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
    
    // 연령대별 방문 통계 관련 computed 속성
    const totalAgeVisits = computed(() => {
      return props.ageStats.reduce((sum, stat) => sum + stat.value, 0);
    });

    const malePercentage = computed(() => {
      if (props.totalStatsVisits === 0) return 0;
      const maleCount = props.genderStats.find(s => s.gender === 'M')?.value || 0;
      return Math.round((maleCount / props.totalStatsVisits) * 100);
    });

    const femalePercentage = computed(() => {
      if (props.totalStatsVisits === 0) return 0;
      const femaleCount = props.genderStats.find(s => s.gender === 'F')?.value || 0;
      return Math.round((femaleCount / props.totalStatsVisits) * 100);
    });
    
    // 차트 관련 함수들
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
      
      const filteredAgeStats = props.ageStats.filter(stat => stat.value > 0);
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
    
    // 장소 상세 정보를 API에서 가져오는 함수
    const fetchPlaceDetails = async () => {
      if (!props.detail) return;
      
      try {
        isLoadingPlaceDetails.value = true;
        
        // ElasticSearch 결과에서 p_id와 p_address 추출
        let puid, address;
        
        if (props.detail._source) {
          // Elasticsearch _source 직접 포함된 경우
          puid = props.detail._source.p_id;
          address = props.detail._source.p_address;
        } else {
          // _source가 추출된 경우
          puid = props.detail.p_id;
          // 다양한 address 필드 확인 (우선순위: p_address > address)
          address = props.detail.p_address || props.detail.address;
        }
        
        // getPlaceAddress computed 값도 fallback으로 사용
        if (!address) {
          address = getPlaceAddress.value;
        }
        
        console.log(`장소 상세 정보 API 호출: puid=${puid}, address=${address}`);
        console.log('detail 객체 전체:', props.detail);
        
        if (!puid || !address) {
          console.warn('puid 또는 address가 없어 API 호출을 건너뜁니다:', { puid, address });
          return;
        }
        
        const response = await getPlaceDetails(puid, address);
        
        if (response && response.status === 'success' && response.data) {
          placeDetailsData.value = response.data;
          console.log('장소 상세 정보 로드 완료:', response.data);
        } else {
          console.warn('API 응답이 예상 형식과 다릅니다:', response);
        }
        
      } catch (error) {
        console.error('장소 상세 정보 로드 오류:', error);
        // API 오류가 발생해도 기존 데이터로 지도를 표시할 수 있도록 함
      } finally {
        isLoadingPlaceDetails.value = false;
      }
    };
    
    // 후기 데이터를 로드하는 함수
    const loadReviews = async (reset = false) => {
      if (!props.detail) return;
      
      try {
        isLoadingReviews.value = true;
        
        // ElasticSearch 결과에서 p_id 추출
        let placeId;
        
        if (props.detail._source) {
          // Elasticsearch _source 직접 포함된 경우
          placeId = props.detail._source.p_id;
        } else {
          // _source가 추출된 경우
          placeId = props.detail.p_id;
        }
        
        if (!placeId) {
          console.warn('placeId가 없어 후기 로드를 건너뜁니다:', placeId);
          return;
        }
        
        // 리셋인 경우 페이지를 0으로 초기화
        if (reset) {
          reviewsPage.value = 0;
          reviews.value = [];
        }
        
        const from = reviewsPage.value * reviewsPerPage;
        console.log(`후기 로드: placeId=${placeId}, from=${from}, size=${reviewsPerPage}`);
        
        const response = await getPlaceReviews(placeId, reviewsPerPage, from);
        
        if (response) {
          if (reset) {
            // 새로 로드하는 경우
            reviews.value = response.reviews;
          } else {
            // 더보기인 경우 기존 후기에 추가
            reviews.value = [...reviews.value, ...response.reviews];
          }
          
          totalReviews.value = response.total;
          hasMoreReviews.value = response.hasMore;
          
          console.log(`후기 로드 완료: ${response.reviews.length}개 로드, 총 ${response.total}개, 더보기 가능: ${response.hasMore}`);
        }
        
      } catch (error) {
        console.error('후기 로드 오류:', error);
      } finally {
        isLoadingReviews.value = false;
      }
    };
    
    // 더 많은 후기 로드
    const loadMoreReviews = async () => {
      if (!hasMoreReviews.value || isLoadingReviews.value) return;
      
      reviewsPage.value += 1;
      await loadReviews(false);
    };
    
    // 카카오맵 초기화
    const initDetailMap = async () => {
      console.log('지도 초기화 함수 호출됨');
  
      const mapContainer = detailMapContainer.value;
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
        
        // 1순위: API에서 받은 위도/경도 사용
        if (placeDetailsData.value && placeDetailsData.value.latitude && placeDetailsData.value.longitude) {
          lat = placeDetailsData.value.latitude;
          lng = placeDetailsData.value.longitude;
          console.log('API에서 받은 좌표 사용:', { lat, lng });
        } else {
          // 2순위: 기존 ElasticSearch location_data 사용
          let locationData = null;
          
          if (props.detail._source && props.detail._source.location_data) {
            // Elasticsearch _source 직접 포함된 경우 (searchSimilarImages 형식)
            locationData = props.detail._source.location_data;
          } else if (props.detail.location_data) {
            // _source가 추출된 경우 (일반 형식)
            locationData = props.detail.location_data;
          }
          
          if (locationData) {
            lat = locationData.latitude || lat;
            lng = locationData.longitude || lng;
            console.log('ElasticSearch location_data 사용:', { lat, lng });
          } else {
            console.log('기본 좌표 사용 (서울시청):', { lat, lng });
          }
        }
        
        // 지도 옵션
        const mapOption = {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3 // 확대 레벨
        };
        
        // 지도 생성
        const kakaoMap = new kakao.maps.Map(mapContainer, mapOption);
        
        // 마커 생성
        const markerPosition = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({
          position: markerPosition
        });
        
        // 마커 지도에 표시
        marker.setMap(kakaoMap);
        
        // 인포윈도우 추가
        // LogoSearch와 KeywordSearch 형식 모두 처리
        let placeName = '여행지';
        if (props.detail._source) {
          placeName = props.detail._source.p_name || placeName;
        } else {
          placeName = props.detail.name || props.detail.p_name || placeName;
        }
        
        const infoContent = `
          <div style="padding: 5px; text-align: center;">
            <span style="font-weight: bold;">${placeName}</span>
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
    
    // 모달 닫기
    const closeModal = () => {
      emit('close');
    };
    
    // 컴포넌트 라이프사이클 훅
    watch(() => props.show, (newVal) => {
      if (newVal) {
        nextTick(async () => {
          // 모달이 열릴 때 먼저 API에서 장소 상세 정보를 가져옴
          await fetchPlaceDetails();
          
          // 후기 데이터도 함께 로드
          await loadReviews(true);
          
          // 약간의 지연 추가로 모달 애니메이션 완료 후 지도 초기화
          setTimeout(() => {
            console.log("모달 표시 후 지도 초기화 시작");
            console.log("장소 상세 데이터 형식:", props.detail._source ? "ElasticSearch 직접 포맷" : "추출된 포맷");
            initDetailMap();
          }, 300);
        });
      } else {
        // 모달이 닫힐 때 데이터 초기화
        placeDetailsData.value = null;
        reviews.value = [];
        totalReviews.value = 0;
        hasMoreReviews.value = false;
        reviewsPage.value = 0;
      }
    });
    
    watch([() => props.ageStats, totalAgeVisits], () => {
      nextTick(() => {
        renderAgeChart();
      });
    }, { deep: true });
    
    onMounted(() => {
      if (props.show) {
        nextTick(async () => {
          // 초기 마운트 시에도 API 호출 후 지도 초기화
          await fetchPlaceDetails();
          
          // 후기 데이터도 함께 로드
          await loadReviews(true);
          
          setTimeout(() => {
            console.log("초기 마운트 시 지도 초기화 시작");
            console.log("장소 상세 데이터 형식:", props.detail._source ? "ElasticSearch 직접 포맷" : "추출된 포맷");
            initDetailMap();
          }, 300);
        });
      }
    });
    
    // 컴포넌트 속성과 데이터 추출을 위한 computed 속성 추가
    const getPlaceName = computed(() => {
      if (!props.detail) return "";
      
      if (props.detail._source) {
        return props.detail._source.p_name || "";
      }
      
      return props.detail.name || props.detail.p_name || "";
    });

    const getPlaceAddress = computed(() => {
      if (!props.detail) return "";
      
      if (props.detail._source) {
        return props.detail._source.p_address || "";
      }
      
      return props.detail.address || props.detail.p_address || "";
    });

    const getPlaceTags = computed(() => {
      if (!props.detail) return [];
      
      if (props.detail._source && props.detail._source.p_tags) {
        return props.detail._source.p_tags;
      }
      
      return props.detail.p_tags || [];
    });

    const getPlaceDescription = computed(() => {
      if (!props.detail) return "";
      
      if (props.detail._source) {
        return props.detail._source.p_description || "";
      }
      
      return props.detail.p_description || "";
    });
    
    // SVG 마스크를 위한 안전한 ID 생성
    const getMaskId = computed(() => {
      if (props.detail && props.detail._id) {
        return props.detail._id;
      } else if (props.detail && props.detail._source && props.detail._source.p_id) {
        return `p${props.detail._source.p_id}`;
      }
      return 'place' + Math.floor(Math.random() * 1000000); // 안전한 랜덤 ID
    });
    
    // 현재 장소가 관심 장소에 있는지 확인하는 computed 속성
    const isCurrentPlaceInWishlist = computed(() => {
      console.log('=== isCurrentPlaceInWishlist 체크 시작 ===');
      console.log('props.detail:', props.detail);
      console.log('props.userLikes:', props.userLikes);
      
      if (!props.detail || !props.userLikes || props.userLikes.length === 0) {
        console.log('조건 실패: detail이나 userLikes가 없음');
        return false;
      }
      
      // getPlaceAddress computed 속성에서 가져온 주소 사용
      const currentAddress = getPlaceAddress.value;
      console.log('현재 주소:', currentAddress);
      
      if (!currentAddress) {
        console.log('현재 주소가 없음');
        return false;
      }
      
      // userLikes 배열에서 address가 일치하는 항목이 있는지 확인
      const isInLikes = props.userLikes.some(like => {
        const likeAddress = like.place && like.place.address;
        console.log('비교 중:', { currentAddress, likeAddress, match: likeAddress === currentAddress });
        return likeAddress === currentAddress;
      });
      
      console.log('최종 결과:', isInLikes);
      return isInLikes;
    });
    
    const handleHeartClick = () => {
      // address 정보를 다양한 소스에서 추출
      let address = '';
      
      if (props.detail._source) {
        // ElasticSearch _source에서 추출
        address = props.detail._source.p_address || '';
      } else {
        // 직접 속성에서 추출
        address = props.detail.address || props.detail.p_address || '';
      }
      
      // PlaceDetails API 응답에서도 확인
      if (!address && placeDetailsData.value && placeDetailsData.value.address) {
        address = placeDetailsData.value.address;
      }
      
      console.log('하트 클릭 - 추출된 address:', address);
      console.log('하트 클릭 - detail 객체:', props.detail);
      
      // address 정보가 포함된 객체를 emit
      const itemWithAddress = {
        ...props.detail,
        address: address,
        p_address: address // 백업용
      };
      
      emit('toggle-wishlist', itemWithAddress);
    };
    
    return {
      closeModal,
      formatReviewDate,
      ageChartCanvas,
      getDimensionLabel,
      dimensionValues,
      totalAgeVisits,
      malePercentage,
      femalePercentage,
      renderAgeChart,
      getColorForAge,
      detailMapContainer,
      displayImageUrl,
      getPlaceName,
      getPlaceAddress,
      getPlaceTags,
      getPlaceDescription,
      getMaskId,
      placeDetailsData,
      isLoadingPlaceDetails,
      fetchPlaceDetails,
      reviews,
      totalReviews,
      isLoadingReviews,
      hasMoreReviews,
      loadReviews,
      loadMoreReviews,
      handleHeartClick,
      isCurrentPlaceInWishlist
    };
  }
};
</script>

<style scoped>
/* 전체 모달에 Noto Sans KR 폰트 적용 */
.place-detail-modal {
  font-family: 'Noto Sans KR', sans-serif;
}

.place-detail-modal * {
  font-family: 'Noto Sans KR', sans-serif;
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

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  flex-direction: row; /* Stack title and location horizontally */
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
  color: #7f8c8d; /* Softer grey */
  font-size: 0.9rem; /* Adjusted size */
  font-family: 'Noto Sans KR', sans-serif;
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
  fill: none; /* Keep fill as none to show only outline */
  transition: all 0.3s ease; /* Smooth transition */
}
.close-btn svg {
  width: 20px; /* Consistent icon size */
  height: 20px;
}

.heart-btn.active {
  color: #ff8e7f; /* Same color as heart-indicator.active */
  animation: heartbeat 0.8s ease-in-out; /* Same animation as heart-indicator */
}

.heart-btn.active svg {
  stroke: #ff8e7f; /* Only change stroke color to pink */
  fill: none; /* Keep fill transparent - only outline shows */
}

.heart-btn:hover {
  color: rgba(255, 142, 127, 0.8); /* Hover effect like heart-indicator */
  transform: scale(1.1); /* Scale effect like heart-indicator */
}

.heart-btn.active:hover {
  background-color: rgba(255, 142, 127, 0.1); /* Light background on hover when active */
}

/* Add heartbeat animation like heart-indicator */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(1.1); }
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

/* 카카오 맵 오류 메시지 스타일 */
.detail-map .kakao-map-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f0f2f5;
  color: #666;
  text-align: center;
  padding: 20px;
  font-size: 0.9rem;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 이미지 플레이스홀더 스타일 */
.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
  color: #95a5a6;
  font-size: 1rem;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
}

/* 각 섹션 스타일 */
.detail-section {
  padding: 1.5rem; /* Consistent padding */
  border-radius: 10px; /* Softer radius */
  background-color: #fdfdfe; /* Slightly off-white background */
  border: 1px solid #eef2f7; /* Subtle border */
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
  font-family: 'Noto Sans KR', sans-serif;
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
  font-family: 'Noto Sans KR', sans-serif;
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
  font-family: 'Noto Sans KR', sans-serif;
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
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  color: #52616B;
  text-align: right;
}

/* 리뷰 섹션 */
.reviews-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.review-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-left: 3px solid #007bff;
  transition: all 0.2s ease;
}

.review-item:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.reviewer-info {
  flex: 1;
}

.reviewer-name {
  font-weight: 600;
  font-family: 'Noto Sans KR', sans-serif;
  color: #2c3e50;
  font-size: 0.9rem;
}

.review-date {
  color: #6c757d;
  font-size: 0.8rem;
  font-family: 'Noto Sans KR', sans-serif;
  margin-top: 2px;
}

.reviewer-details {
  color: #6c757d;
  font-size: 0.75rem;
  font-family: 'Noto Sans KR', sans-serif;
  margin-top: 2px;
  font-style: italic;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.star-filled {
  color: #ffc107;
  font-size: 1rem;
}

.star-empty {
  color: #e9ecef;
  font-size: 1rem;
}

.review-content {
  color: #495057;
  line-height: 1.5;
  font-size: 0.9rem;
  font-family: 'Noto Sans KR', sans-serif;
  margin-top: 0.5rem;
}

/* 후기 로딩 및 빈 상태 스타일 */
.reviews-loading,
.no-reviews {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-family: 'Noto Sans KR', sans-serif;
}

.reviews-loading .spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* 더보기 버튼 스타일 */
.load-more-container {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.load-more-btn {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.load-more-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.load-more-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  font-family: 'Noto Sans KR', sans-serif;
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

/* 스피너 스타일 */
.spinner {
  width: 50px; /* Adjusted size */
  height: 50px;
  border: 4px solid rgba(72, 176, 228, 0.15); /* Thicker border, adjusted color */
  border-radius: 50%;
  border-top-color: #48b0e4;
  animation: spin 0.8s linear infinite; /* Faster spin */
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 차트 스타일 */
.stats-section h4 {
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
  background-color: transparent;
  border-radius: 8px;
  min-height: 372px; /* Equalize height with sibling chart container */
}

.chart-container h5 {
  font-size: 0.95rem; /* Adjusted size */
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
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
  font-family: 'Noto Sans KR', sans-serif;
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
  font-family: 'Noto Sans KR', sans-serif;
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
  font-family: 'Noto Sans KR', sans-serif;
}

/* Responsive styles */
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
</style> 