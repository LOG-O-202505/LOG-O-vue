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
        <!-- A. 지도 + 요약 섹션 (가로 배치) -->
        <div class="map-summary-section">
          <!-- 지도 영역 (왼쪽 - 큰 크기) -->
          <div class="detail-map-container">
            <div id="detailMap" ref="detailMapContainer" class="detail-map"></div>
          </div>
          
          <!-- 요약 정보 (오른쪽) -->
          <div class="summary-container">
            <div class="summary-stats">
              <div class="stat-item rating-stat">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                  <div class="stat-label">평균 평점</div>
                  <div class="stat-value">
                    <span class="rating-score">{{ placeDetailsData?.averageRating?.toFixed(1) || '0.0' }}</span>
                    <div class="rating-stars">
                      <span v-for="star in 5" :key="star" 
                        :class="{'star-filled': star <= Math.round(placeDetailsData?.averageRating || 0), 'star-empty': star > Math.round(placeDetailsData?.averageRating || 0)}">
                        ★
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="stat-item review-stat">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                  <div class="stat-label">총 인증 수</div>
                  <div class="stat-value">
                    <span class="count-number">{{ placeDetailsData?.totalReviewCount || 0 }}</span>
                    <span class="count-unit">개</span>
                  </div>
                </div>
              </div>
              
              <div class="stat-item visitors-stat">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <div class="stat-label">방문자 수</div>
                  <div class="stat-value">
                    <span class="count-number">{{ totalStatsVisits || 0 }}</span>
                    <span class="count-unit">명</span>
                  </div>
                </div>
              </div>
              
              <div class="stat-item likes-stat">
                <div class="stat-icon">❤️</div>
                <div class="stat-content">
                  <div class="stat-label">관심 등록</div>
                  <div class="stat-value">
                    <span class="count-number">{{ placeDetailsData?.totalLikeCount || 0 }}</span>
                    <span class="count-unit">명</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- B. 태그 섹션 -->
        <div v-if="getPlaceTags && getPlaceTags.length > 0" class="content-section">
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

        <!-- C. 설명 섹션 -->
        <div v-if="getPlaceDescription" class="content-section">
          <h4>설명</h4>
          <p class="description-text">{{ getPlaceDescription }}</p>
        </div>
        
        <!-- D. 방문자 인증 리뷰 (방문자 사진 갤러리) -->
        <div v-if="allImages.length > 0" class="content-section">
          <h4>방문자 인증 리뷰 ({{ allImages.length }}장)</h4>
          <div class="visitor-photos-container">
            <div class="visitor-photos-scroll" ref="photosGalleryContainer">
              <div 
                v-for="(image, index) in allImages" 
                :key="index"
                class="visitor-photo-card"
                @click="openImageViewer(image.url, index)"
              >
                <div class="visitor-photo-image">
                  <img :src="image.url" :alt="`방문자 사진 ${index + 1}`" class="photo-img">
                </div>
                <div class="visitor-photo-overlay">
                  <div class="visitor-info">
                    <div class="visitor-name">{{ image.userName }}</div>
                    <div class="visitor-rating">
                      <span v-for="star in 5" :key="star" 
                        :class="{'star-filled': star <= image.rating, 'star-empty': star > image.rating}">
                        ★
                      </span>
                    </div>
                    <div v-if="image.verification && image.verification.review" class="visitor-review-preview">
                      "{{ image.verification.review.length > 30 ? image.verification.review.substring(0, 30) + '...' : image.verification.review }}"
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 스크롤 버튼 -->
            <button v-if="canScrollLeft" @click="scrollPhotosGallery('left')" class="gallery-scroll-btn left">‹</button>
            <button v-if="canScrollRight" @click="scrollPhotosGallery('right')" class="gallery-scroll-btn right">›</button>
          </div>
        </div>
        
        <!-- E. 방문 통계 2종 - 연령대별 방문 통계 | 성별 방문 비율 -->
        <div v-if="!isLoadingStats && (ageStats.length > 0 || genderStats.length > 0)" class="content-section stats-section">
          <h4>방문 통계 (총 {{ totalStatsVisits }}건 인증)</h4>
          <div class="stats-charts">
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
                          <defs>
                            <mask :id="`male-mask-${getMaskId}`">
                              <rect x="0" y="0" width="100%" height="100%" fill="white"/>
                              <rect x="0" y="0" :height="`calc(100% * (1 - (${malePercentage} / 100)))`" width="100%" fill="black"/>
                            </mask>
                          </defs>
                          <g>
                            <path class="icon-background" d="M123.25,82.17H35.42C13.84,82.17-2.72,101.3.37,122.66l11.55,79.69c1.17,8.06,8.07,14.03,16.21,14.03h2.43l14.06,116.16h69.42l14.06-116.16h2.51c8.11,0,14.99-5.96,16.15-13.98l11.56-79.94c2.97-21.29-13.57-40.29-35.07-40.29Z" />
                            <circle class="icon-background" cx="79.33" cy="37.42" r="37.42" transform="translate(-3.23 67.06) rotate(-45)" />
                          </g>
                          <g :style="{ mask: 'url(#male-mask-' + getMaskId + ')' }">
                            <path d="M123.25,82.17H35.42C13.84,82.17-2.72,101.3.37,122.66l11.55,79.69c1.17,8.06,8.07,14.03,16.21,14.03h2.43l14.06,116.16h69.42l14.06-116.16h2.51c8.11,0,14.99-5.96,16.15-13.98l11.56-79.94c2.97-21.29-13.57-40.29-35.07-40.29Z" fill="#4c7bd8"/>
                            <circle cx="79.33" cy="37.42" r="37.42" transform="translate(-3.23 67.06) rotate(-45)" fill="#4c7bd8"/>
                          </g>
                        </svg>
                      </div>
                      <div class="gender-label-percent">남성 <span class="percent-value">{{ malePercentage }}%</span></div>
                    </div>
                    <!-- 여성 아이콘 -->
                    <div class="gender-icon female">
                      <div class="icon-container">
                        <svg viewBox="0 0 157.19 332.54" class="female-icon-svg">
                          <defs>
                            <mask :id="`female-mask-${getMaskId}`">
                              <rect x="0" y="0" width="100%" height="100%" fill="white"/>
                              <rect x="0" y="0" :height="`calc(100% * (1 - (${femalePercentage} / 100)))`" width="100%" fill="black"/>
                            </mask>
                          </defs>
                          <g>
                            <circle class="icon-background" cx="78.68" cy="37.42" r="37.42" />
                            <path class="icon-background" d="M156.76,187.25l-24.97-94.01c-.03-.1-.06-.2-.09-.29-2.35-6.46-8.49-10.77-15.37-10.77H41.02c-6.89,0-13.03,4.31-15.37,10.77-.03.1-.06.19-.09.29L.59,187.25s-5.18,20.11,15.14,23.87h.31l-6.41,33.76h24.91l12.45,87.66h63.38l12.45-87.66h24.91l-6.41-33.76h.30c19.58-3.22,15.15-23.87,15.15-23.87Z" />
                          </g>
                          <g :style="{ mask: 'url(#female-mask-' + getMaskId + ')' }">
                            <circle cx="78.68" cy="37.42" r="37.42" fill="#e5518d"/>
                            <path d="M156.76,187.25l-24.97-94.01c-.03-.1-.06-.2-.09-.29-2.35-6.46-8.49-10.77-15.37-10.77H41.02c-6.89,0-13.03,4.31-15.37,10.77-.03.1-.06.19-.09.29L.59,187.25s-5.18,20.11,15.14,23.87h.31l-6.41,33.76h24.91l12.45,87.66h63.38l12.45-87.66h24.91l-6.41-33.76h.30c19.58-3.22,15.15-23.87,15.15-23.87Z" fill="#e5518d"/>
                          </g>
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
        </div>
        
        <!-- 통계 로딩 중 -->
        <div v-if="isLoadingStats" class="content-section stats-section">
          <h4>방문 통계</h4>
          <div class="stats-loading">
            <div class="spinner"></div>
            <p>통계 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
  
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">닫기</button>
      </div>
    </div>
  </div>

  <!-- 이미지 뷰어 모달 -->
  <div v-if="showImageViewer" class="image-viewer-overlay" @click="closeImageViewer">
    <div class="image-viewer-container" @click.stop>
      <button class="image-viewer-close" @click="closeImageViewer">×</button>
      <div class="image-viewer-content">
        <img :src="currentViewerImage" :alt="'확대 이미지'" class="viewer-image">
        <div v-if="currentImageInfo && !currentImageInfo.isReviewImage" class="image-viewer-info">
          <div class="viewer-user-info">
            <strong>{{ currentImageInfo.userName }}</strong>
            <div class="viewer-rating">
              <span v-for="star in 5" :key="star" 
                :class="{'star-filled': star <= currentImageInfo.rating, 'star-empty': star > currentImageInfo.rating}">
                ★
              </span>
            </div>
            <div v-if="currentImageInfo.verification && currentImageInfo.verification.review" class="viewer-review">
              "{{ currentImageInfo.verification.review }}"
            </div>
          </div>
        </div>
      </div>
      <!-- 이미지 네비게이션 (여러 이미지가 있는 경우만) -->
      <div v-if="allImages.length > 1 && !currentImageInfo?.isReviewImage" class="image-viewer-navigation">
        <button @click="previousImage" class="nav-btn prev" :disabled="currentImageIndex === 0">‹</button>
        <span class="image-counter">{{ currentImageIndex + 1 }} / {{ allImages.length }}</span>
        <button @click="nextImage" class="nav-btn next" :disabled="currentImageIndex === allImages.length - 1">›</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import Chart from 'chart.js/auto';
import config from "@/config.js";
import { apiGet } from "@/services/auth.js";

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
    
    // 이미지 관련 상태 변수들
    const photosGalleryContainer = ref(null);
    const canScrollLeft = ref(false);
    const canScrollRight = ref(false);
    
    // 이미지 뷰어 관련 상태 변수들
    const showImageViewer = ref(false);
    const currentViewerImage = ref('');
    const currentImageIndex = ref(0);
    const currentImageInfo = ref(null);

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
    
    // p_vector 배열에서 차원 값 가져오기 (ElasticSearch 데이터)
    const dimensionValues = computed(() => {
      if (!props.detail) {
        return [];
      }
      
      if (props.detail._source && props.detail._source.p_vector) {
        return props.detail._source.p_vector;
      } else if (props.detail.p_vector) {
        return props.detail.p_vector;
      }
      
      return [];
    });
    
    // 메인 이미지 URL (첫 번째 이미지 또는 기존 ElasticSearch 이미지)
    const mainImageUrl = computed(() => {
      // 1순위: 새로운 API에서 받은 첫 번째 verification 이미지
      if (placeDetailsData.value && placeDetailsData.value.verifications && placeDetailsData.value.verifications.length > 0) {
        const firstVerification = placeDetailsData.value.verifications[0];
        if (firstVerification.imageUrl) {
          return firstVerification.imageUrl;
        }
      }
      
      // 2순위: ElasticSearch 기존 base64 이미지 (fallback)
      if (!props.detail) {
        return null;
      }
      
      let imageUrl = null;
      
      if (props.detail._source && props.detail._source.p_image) {
        imageUrl = props.detail._source.p_image;
      } else if (props.detail.p_image) {
        imageUrl = props.detail.p_image;
      }
      
      // base64 이미지 처리 (prefix가 없는 경우 추가)
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:image/')) {
        imageUrl = `data:image/jpeg;base64,${imageUrl}`;
      }
      
      return imageUrl;
    });
    
    // 추가 이미지들 (첫 번째 이미지 제외)
    const additionalImages = computed(() => {
      if (!placeDetailsData.value || !placeDetailsData.value.verifications) {
        return [];
      }
      
      // 첫 번째 이미지를 제외한 나머지 이미지들
      return placeDetailsData.value.verifications.slice(1).map(verification => ({
        url: verification.imageUrl,
        userName: verification.user.nickname || verification.user.name,
        rating: verification.star,
        verification: verification // 전체 verification 객체 포함
      })).filter(image => image.url); // imageUrl이 있는 것만 필터링
    });
    
    // 전체 이미지 배열 (메인 + 추가 이미지들)
    const allImages = computed(() => {
      const images = [];
      
      // 메인 이미지 추가
      if (mainImageUrl.value) {
        const firstVerification = placeDetailsData.value?.verifications?.[0];
        images.push({
          url: mainImageUrl.value,
          userName: firstVerification?.user?.nickname || firstVerification?.user?.name || '알 수 없음',
          rating: firstVerification?.star || 0,
          verification: firstVerification, // 전체 verification 객체 포함
          isMain: true
        });
      }
      
      // 추가 이미지들 추가
      images.push(...additionalImages.value);
      
      return images;
    });
    
    // 리뷰 날짜 포맷팅 (새로운 API 구조용)
    const formatReviewDate = (createdArray) => {
      if (!createdArray || createdArray.length < 3) return '';
      
      // [2025, 5, 26, 20, 59, 22, 713589000] 형식
      const [year, month, day] = createdArray;
      const date = new Date(year, month - 1, day); // month는 0부터 시작
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // 나이 계산 함수
    const calculateAge = (birthdayArray) => {
      if (!birthdayArray || birthdayArray.length < 3) return 0;
      
      const [year, month, day] = birthdayArray;
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };
    
    // 연령대별 방문 통계 관련 computed 속성 (ElasticSearch 데이터)
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
                padding: 25,
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
    
    // 새로운 API를 사용하여 장소 상세 정보를 가져오는 함수
    const fetchPlaceDetails = async () => {
      if (!props.detail) return;
      
      try {
        isLoadingPlaceDetails.value = true;
        
        // ElasticSearch 결과에서 p_id 추출
        let puid;
        
        if (props.detail._source) {
          puid = props.detail._source.p_id;
        } else {
          puid = props.detail.p_id;
        }
        
        console.log(`새로운 장소 상세 정보 API 호출: puid=${puid}`);
        
        if (!puid) {
          console.warn('puid가 없어 API 호출을 건너뜁니다:', { puid });
          return;
        }
        
        // auth.js의 apiGet 함수를 사용하여 API 호출
        const result = await apiGet(`/places/${puid}/detail`);
        
        if (result && result.status === 'success' && result.data) {
          placeDetailsData.value = result.data;
          console.log('새로운 장소 상세 정보 로드 완료:', result.data);
          
          // 스크롤 상태 업데이트
          nextTick(() => {
            updateScrollButtons();
          });
          
        } else {
          console.warn('API 응답이 예상 형식과 다릅니다:', result);
        }
        
      } catch (error) {
        console.error('장소 상세 정보 로드 오류:', error);
      } finally {
        isLoadingPlaceDetails.value = false;
      }
    };
    
    // 추가 이미지 갤러리 스크롤 관련 함수들
    const updateScrollButtons = () => {
      const container = photosGalleryContainer.value;
      if (!container) return;
      
      canScrollLeft.value = container.scrollLeft > 0;
      canScrollRight.value = container.scrollLeft < (container.scrollWidth - container.clientWidth);
    };
    
    const scrollPhotosGallery = (direction) => {
      const container = photosGalleryContainer.value;
      if (!container) return;
      
      const scrollAmount = 200;
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      
      setTimeout(() => {
        updateScrollButtons();
      }, 300);
    };
    
    // 이미지 뷰어 관련 함수들
    const openImageViewer = (imageUrl, index, isReviewImage = false) => {
      currentViewerImage.value = imageUrl;
      currentImageIndex.value = index;
      
      if (isReviewImage) {
        currentImageInfo.value = { isReviewImage: true };
      } else if (index >= 0 && index < allImages.value.length) {
        currentImageInfo.value = {
          ...allImages.value[index],
          isReviewImage: false
        };
      } else {
        currentImageInfo.value = { isReviewImage: false };
      }
      
      showImageViewer.value = true;
    };
    
    const closeImageViewer = () => {
      showImageViewer.value = false;
      currentViewerImage.value = '';
      currentImageInfo.value = null;
    };
    
    const previousImage = () => {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
        const newImage = allImages.value[currentImageIndex.value];
        currentViewerImage.value = newImage.url;
        currentImageInfo.value = {
          ...newImage,
          isReviewImage: false
        };
      }
    };
    
    const nextImage = () => {
      if (currentImageIndex.value < allImages.value.length - 1) {
        currentImageIndex.value++;
        const newImage = allImages.value[currentImageIndex.value];
        currentViewerImage.value = newImage.url;
        currentImageInfo.value = {
          ...newImage,
          isReviewImage: false
        };
      }
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
        let placeName = '여행지';
        
        // 1순위: 새로운 API에서 받은 위도/경도 사용
        if (placeDetailsData.value && placeDetailsData.value.latitude && placeDetailsData.value.longitude) {
          lat = placeDetailsData.value.latitude;
          lng = placeDetailsData.value.longitude;
          placeName = placeDetailsData.value.name || placeName;
          console.log('새로운 API에서 받은 좌표 사용:', { lat, lng, placeName });
        } else {
          // 2순위: 기존 ElasticSearch location_data 사용
          let locationData = null;
          
          if (props.detail._source && props.detail._source.location_data) {
            locationData = props.detail._source.location_data;
            placeName = props.detail._source.p_name || placeName;
          } else if (props.detail.location_data) {
            locationData = props.detail.location_data;
            placeName = props.detail.name || props.detail.p_name || placeName;
          }
          
          if (locationData) {
            lat = locationData.latitude || lat;
            lng = locationData.longitude || lng;
            console.log('ElasticSearch location_data 사용:', { lat, lng, placeName });
          } else {
            console.log('기본 좌표 사용 (서울시청):', { lat, lng });
          }
        }
        
        // 지도 옵션
        const mapOption = {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3
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
          // 모달이 열릴 때 먼저 새로운 API에서 장소 상세 정보를 가져옴
          await fetchPlaceDetails();
          
          // 약간의 지연 추가로 모달 애니메이션 완료 후 지도 초기화
          setTimeout(() => {
            console.log("모달 표시 후 지도 초기화 시작");
            initDetailMap();
          }, 300);
        });
      } else {
        // 모달이 닫힐 때 데이터 초기화
        placeDetailsData.value = null;
        showImageViewer.value = false;
      }
    });
    
    watch([() => props.ageStats, totalAgeVisits], () => {
      nextTick(() => {
        renderAgeChart();
      });
    }, { deep: true });
    
    // 추가 이미지 갤러리 스크롤 이벤트 리스너
    watch(() => photosGalleryContainer.value, (newContainer) => {
      if (newContainer) {
        newContainer.addEventListener('scroll', updateScrollButtons);
      }
    });
    
    onMounted(() => {
      if (props.show) {
        nextTick(async () => {
          await fetchPlaceDetails();
          
          setTimeout(() => {
            console.log("초기 마운트 시 지도 초기화 시작");
            initDetailMap();
          }, 300);
        });
      }
    });
    
    // 컴포넌트 속성과 데이터 추출을 위한 computed 속성 추가
    const getPlaceName = computed(() => {
      // 1순위: 새로운 API 데이터
      if (placeDetailsData.value && placeDetailsData.value.name) {
        return placeDetailsData.value.name;
      }
      
      // 2순위: ElasticSearch 데이터
      if (!props.detail) return "";
      
      if (props.detail._source) {
        return props.detail._source.p_name || "";
      }
      
      return props.detail.name || props.detail.p_name || "";
    });

    const getPlaceAddress = computed(() => {
      // 1순위: 새로운 API 데이터
      if (placeDetailsData.value && placeDetailsData.value.address) {
        return placeDetailsData.value.address;
      }
      
      // 2순위: ElasticSearch 데이터
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
      return 'place' + Math.floor(Math.random() * 1000000);
    });
    
    // 현재 장소가 관심 장소에 있는지 확인하는 computed 속성 (LookAround 방식)
    const isCurrentPlaceInWishlist = computed(() => {
      console.log('=== isCurrentPlaceInWishlist 체크 시작 ===');
      console.log('props.detail:', props.detail);
      console.log('props.userLikes:', props.userLikes);
      
      // LookAround와 동일한 방식: 오직 userLikes prop만 확인
      if (!props.detail || !props.userLikes || props.userLikes.length === 0) {
        console.log('조건 실패: detail이나 userLikes가 없음');
        return false;
      }
      
      const currentAddress = getPlaceAddress.value;
      const currentName = getPlaceName.value;
      console.log('현재 주소:', currentAddress);
      console.log('현재 이름:', currentName);
      
      if (!currentAddress || !currentName) {
        console.log('현재 주소나 이름이 없음');
        return false;
      }
      
      // 주소와 이름이 모두 일치하는 경우에만 true
      const isInLikes = props.userLikes.some(like => {
        const likeAddress = like.place && like.place.address;
        const likeName = like.place && like.place.name;
        console.log('비교 중:', { 
          currentAddress, likeAddress, 
          currentName, likeName,
          matchAddress: likeAddress === currentAddress,
          matchName: likeName === currentName,
          matchBoth: likeAddress === currentAddress && likeName === currentName
        });
        return likeAddress === currentAddress && likeName === currentName;
      });
      
      console.log('최종 결과:', isInLikes);
      return isInLikes;
    });
    
    const handleHeartClick = () => {
      let address = '';
      
      // 1순위: 새로운 API 데이터
      if (placeDetailsData.value && placeDetailsData.value.address) {
        address = placeDetailsData.value.address;
      }
      // 2순위: ElasticSearch 데이터
      else if (props.detail._source) {
        address = props.detail._source.p_address || '';
      } else {
        address = props.detail.address || props.detail.p_address || '';
      }
      
      console.log('하트 클릭 - 추출된 address:', address);
      console.log('하트 클릭 - detail 객체:', props.detail);
      console.log('하트 클릭 - placeDetailsData:', placeDetailsData.value);
      
      const itemWithAddress = {
        ...props.detail,
        address: address,
        p_address: address
      };
      
      // 부모 컴포넌트에 이벤트 전달 (LookAround 방식과 동일)
      // 부모에서 userLikes를 업데이트하면 자동으로 반응됨
      emit('toggle-wishlist', itemWithAddress);
    };
    
    return {
      closeModal,
      formatReviewDate,
      calculateAge,
      ageChartCanvas,
      getDimensionLabel,
      dimensionValues,
      totalAgeVisits,
      malePercentage,
      femalePercentage,
      renderAgeChart,
      getColorForAge,
      detailMapContainer,
      getPlaceName,
      getPlaceAddress,
      getPlaceTags,
      getPlaceDescription,
      getMaskId,
      placeDetailsData,
      isLoadingPlaceDetails,
      fetchPlaceDetails,
      handleHeartClick,
      isCurrentPlaceInWishlist,
      // 이미지 관련
      mainImageUrl,
      additionalImages,
      allImages,
      photosGalleryContainer,
      canScrollLeft,
      canScrollRight,
      scrollPhotosGallery,
      updateScrollButtons,
      // 이미지 뷰어 관련
      showImageViewer,
      currentViewerImage,
      currentImageIndex,
      currentImageInfo,
      openImageViewer,
      closeImageViewer,
      previousImage,
      nextImage
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
  background-color: rgba(30, 40, 50, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.place-detail-modal {
  background-color: #ffffff;
  border-radius: 12px;
  width: 95%;
  max-width: 1100px;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.3s ease-out;
  border: none;
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
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #eef2f7;
  position: sticky;
  top: 0;
  background-color: #ffffff;
  z-index: 10;
}

.modal-title-location {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex: 1;
  margin-right: 1rem;
  gap: 0.75rem;
}

.modal-title-location h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 1.3;
}

.modal-location {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-family: 'Noto Sans KR', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.close-btn, .heart-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.25s ease;
  color: #95a5a6;
}

.close-btn:hover, .heart-btn:hover {
  background-color: #f4f6f8;
  color: #52616B;
}

.heart-btn svg {
  width: 22px;
  height: 22px;
  fill: none;
  transition: all 0.3s ease;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.heart-btn.active {
  color: #ff8e7f;
  animation: heartbeat 0.8s ease-in-out;
}

.heart-btn.active svg {
  stroke: #ff8e7f;
  fill: none;
}

.heart-btn:hover {
  color: rgba(255, 142, 127, 0.8);
  transform: scale(1.1);
}

.heart-btn.active:hover {
  background-color: rgba(255, 142, 127, 0.1);
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(1.1); }
}

/* 모달 콘텐츠 영역 */
.modal-content {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  overflow-y: auto;
}

/* A. 지도 + 요약 섹션 (가로 배치) */
.map-summary-section {
  display: flex;
  gap: 1.75rem;
  margin-bottom: 0;
  height: 420px;
}

.detail-map-container {
  flex: 2;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  background-color: #f0f2f5;
}

.detail-map {
  width: 100%;
  height: 100%;
}

/* 요약 정보 컨테이너 */
.summary-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.summary-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  height: 100%;
}

.stat-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.7rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 4px;
  font-family: 'Noto Sans KR', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.rating-score {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Noto Sans KR', sans-serif;
}

.count-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Noto Sans KR', sans-serif;
}

.count-unit {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
}

.rating-stars {
  display: flex;
  gap: 1px;
}

.rating-stars .star-filled {
  color: #ffc107;
  font-size: 0.8rem;
}

.rating-stars .star-empty {
  color: #e9ecef;
  font-size: 0.8rem;
}

/* 콘텐츠 섹션 공통 스타일 */
.content-section {
  padding: 1.5rem;
  border-radius: 10px;
  background-color: #fdfdfe;
  border: 1px solid #eef2f7;
}

.content-section h4 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #34495e;
  margin: 0 0 1rem 0;
  border-bottom: 1px solid #dde2e7;
  padding-bottom: 0.75rem;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 태그 리스트 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tag {
  background-color: #eaf6ff;
  color: #2979ff;
  font-size: 0.85rem;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 0.4rem 0.9rem;
  border-radius: 16px;
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
.description-text {
  font-size: 0.95rem;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 1.75;
  color: #52616B;
  margin: 0;
}

/* 방문자 인증 리뷰 (방문자 사진 갤러리) */
.visitor-photos-container {
  position: relative;
}

.visitor-photos-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px 0;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.visitor-photos-scroll::-webkit-scrollbar {
  display: none;
}

.visitor-photo-card {
  flex-shrink: 0;
  width: 280px;
  height: 200px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.visitor-photo-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.visitor-photo-image {
  width: 100%;
  height: 100%;
  position: relative;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.visitor-photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.4), transparent);
  padding: 16px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.visitor-photo-card:hover .visitor-photo-overlay {
  transform: translateY(0);
}

.visitor-info {
  color: white;
}

.visitor-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
  font-family: 'Noto Sans KR', sans-serif;
}

.visitor-rating {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}

.visitor-rating .star-filled {
  color: #ffc107;
  font-size: 0.9rem;
}

.visitor-rating .star-empty {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
}

.visitor-review-preview {
  font-size: 0.85rem;
  line-height: 1.4;
  font-style: italic;
  opacity: 0.9;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 갤러리 스크롤 버튼 */
.gallery-scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gallery-scroll-btn:hover {
  background: white;
  color: #333;
  transform: translateY(-50%) scale(1.1);
}

.gallery-scroll-btn.left {
  left: -12px;
}

.gallery-scroll-btn.right {
  right: -12px;
}

/* 통계 섹션 */
.stats-section h4 {
  text-align: left;
}

.stats-charts {
  display: flex;
  gap: 1.75rem;
  justify-content: space-around;
  align-items: flex-start;
  padding: 0.5rem 0 0;
  flex-wrap: wrap;
}

.chart-container {
  flex: 1 1 45%;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: transparent;
  border-radius: 8px;
  min-height: 372px;
}

.chart-container h5 {
  font-size: 0.95rem;
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
  color: #495057;
  margin-bottom: 1rem;
  text-align: center;
}

.age-chart-wrapper {
  width: 100%;
  max-width: 308px;
  height: 308px;
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
  height: 120px;
  width: 100%;
  color: #7f8c8d;
  font-size: 0.85rem;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f0f2f5;
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
  padding-top: 40px;
}

.gender-icons-wrapper {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.25rem;
  width: 100%;
}

.gender-figure-container {
  display: flex;
  gap: 1.5rem;
}

.gender-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icon-container {
  width: 80px;
  height: auto;
  margin-bottom: 0.5rem;
}

.icon-container svg {
  width: 100%;
  height: auto;
}

.male-icon-svg .icon-background,
.female-icon-svg .icon-background {
  fill: #eef2f7;
}

.gender-label-percent {
  font-size: 0.85rem;
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
  color: #343a40;
}

.gender-label-percent .percent-value {
  font-weight: 700;
}

.gender-percentage-bar {
  width: 100%;
  max-width: 250px;
  height: 10px;
  display: flex;
  border-radius: 5px;
  overflow: hidden;
  background-color: #eef2f7;
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

.modal-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
  background-color: #f9fafb;
  z-index: 1;
}

.cancel-btn {
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #e9ecef;
  color: #495057;
  border: none;
}

.cancel-btn:hover {
  background-color: #dee2e6;
  color: #343a40;
}

/* 스피너 스타일 */
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(72, 176, 228, 0.15);
  border-radius: 50%;
  border-top-color: #48b0e4;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.5rem;
}

/* 이미지 뷰어 모달 */
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.image-viewer-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-viewer-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.image-viewer-close:hover {
  color: #ccc;
}

.image-viewer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.viewer-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.image-viewer-info {
  margin-top: 1rem;
  text-align: center;
  color: white;
}

.viewer-user-info strong {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  display: block;
}

.viewer-rating {
  display: flex;
  justify-content: center;
  gap: 2px;
}

.viewer-rating .star-filled {
  color: #ffc107;
  font-size: 1rem;
}

.viewer-rating .star-empty {
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
}

.image-viewer-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  padding: 8px 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-counter {
  color: white;
  font-size: 0.9rem;
  font-family: 'Noto Sans KR', sans-serif;
}

/* Responsive styles */
@media (max-width: 1100px) {
  .map-summary-section {
    flex-direction: column;
    height: auto;
    gap: 1.5rem;
  }
  
  .detail-map-container {
    width: 100%;
    height: 320px;
    flex: none;
  }

  .summary-container {
    width: 100%;
    flex: none;
  }

  .summary-stats {
    height: auto;
    min-height: 200px;
  }

  .visitor-photos-container {
    width: 100%;
  }

  .visitor-photo-card {
    width: 240px;
    height: 180px;
  }
}

@media (max-width: 768px) {
  .modal-header {
    padding: 1rem 1.25rem;
  }
  .modal-title-location h3 {
    font-size: 1.25rem;
  }
  .modal-location {
    font-size: 0.85rem;
  }
  .modal-content {
    padding: 1.25rem;
    gap: 1.25rem;
  }

  .map-summary-section {
    gap: 1.25rem;
    margin-bottom: 0;
  }

  .detail-map-container {
    height: 280px;
  }

  .summary-stats {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    gap: 12px;
    min-height: auto;
  }

  .stat-item {
    padding: 16px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }

  .rating-score,
  .count-number {
    font-size: 1.2rem;
  }

  .visitor-photo-card {
    width: 200px;
    height: 150px;
  }

  .visitor-photo-overlay {
    padding: 12px;
  }

  .visitor-name {
    font-size: 0.9rem;
  }

  .visitor-rating .star-filled,
  .visitor-rating .star-empty {
    font-size: 0.8rem;
  }

  .visitor-review-preview {
    font-size: 0.8rem;
  }

  .gallery-scroll-btn {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .reviewer-avatar,
  .reviewer-avatar-placeholder {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .reviewer-profile {
    gap: 8px;
  }

  .review-image {
    max-width: 150px;
    max-height: 120px;
  }

  .content-section {
    padding: 1.25rem;
  }
  .content-section h4 {
    font-size: 1.1rem;
    padding-bottom: 0.6rem;
    margin-bottom: 0.8rem;
  }
  .tag {
    font-size: 0.8rem;
    padding: 0.35rem 0.8rem;
  }
  .description-text {
    font-size: 0.9rem;
  }

  .stats-charts {
    flex-direction: column; 
    align-items: center; 
    gap: 1.25rem;
  }

  .chart-container {
    flex-basis: 100%;
    max-width: 100%;
    padding: 0.75rem;
    min-height: 342px;
  }

  .age-chart-wrapper {
    max-width: 286px;
    height: 286px;
  }

  .gender-icons-wrapper {
    gap: 1.5rem; 
  }

  .icon-container {
    width: 70px;
  }
  .modal-footer {
    padding: 1rem 1.25rem;
  }
  .cancel-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  /* 이미지 뷰어 모바일 조정 */
  .image-viewer-overlay {
    padding: 1rem;
  }

  .image-viewer-close {
    top: -40px;
    font-size: 1.5rem;
  }

  .viewer-image {
    max-height: 60vh;
  }

  .nav-btn {
    font-size: 1.2rem;
    padding: 6px 10px;
  }
}

@media (max-width: 600px) {
  .modal-overlay {
    padding: 1rem;
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

  .map-summary-section {
    gap: 1rem;
    margin-bottom: 0;
  }

  .detail-map-container {
    height: 220px;
  }

  .summary-stats {
    gap: 10px;
  }

  .stat-item {
    padding: 12px;
    gap: 8px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .rating-score,
  .count-number {
    font-size: 1.1rem;
  }

  .count-unit {
    font-size: 0.8rem;
  }

  .rating-stars .star-filled,
  .rating-stars .star-empty {
    font-size: 0.8rem;
  }

  .visitor-photo-card {
    width: 160px;
    height: 120px;
  }

  .visitor-photo-overlay {
    padding: 10px;
  }

  .visitor-name {
    font-size: 0.85rem;
    margin-bottom: 4px;
  }

  .visitor-rating {
    margin-bottom: 6px;
  }

  .visitor-rating .star-filled,
  .visitor-rating .star-empty {
    font-size: 0.75rem;
  }

  .visitor-review-preview {
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .gallery-scroll-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .reviewer-avatar,
  .reviewer-avatar-placeholder {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }

  .review-image {
    max-width: 120px;
    max-height: 100px;
  }

  .content-section {
    padding: 1rem;
  }
  .content-section h4 {
    font-size: 1rem;
  }

  /* 이미지 뷰어 초소형 화면 조정 */
  .image-viewer-overlay {
    padding: 0.5rem;
  }

  .image-viewer-close {
    top: -30px;
    font-size: 1.25rem;
  }

  .viewer-image {
    max-height: 50vh;
  }

  .image-viewer-navigation {
    gap: 10px;
    margin-top: 15px;
  }

  .nav-btn {
    font-size: 1rem;
    padding: 4px 8px;
  }

  .image-counter {
    font-size: 0.8rem;
  }
}

.viewer-rating .star-empty {
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
}

.viewer-review {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
  font-style: italic;
  opacity: 0.9;
  font-family: 'Noto Sans KR', sans-serif;
  color: white;
  max-width: 400px;
  text-align: center;
}
</style> 