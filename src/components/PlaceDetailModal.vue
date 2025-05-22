<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="place-detail-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-title-location">
          <h3>{{ detail.name || detail.p_name }}</h3>
          <div class="modal-location">{{ detail.address || detail.p_address }}</div>
        </div>
        <div class="modal-actions">
          <button class="heart-btn" :class="{ 'active': isInWishlist }"
            @click="$emit('toggle-wishlist', detail)" title="여행 계획에 추가">
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
            <img v-if="detail.p_image" :src="`data:image/jpeg;base64,${detail.p_image}`" :alt="detail.name || detail.p_name || '여행지 이미지'"
              class="detail-image">
            <div v-else class="placeholder-image">이미지 없음</div>
          </div>
              
          <!-- 지도 영역 -->
          <div class="detail-map-container">
            <div id="detailMap" ref="detailMapContainer" class="detail-map"></div>
          </div>
        </div>
        
        <!-- 태그 섹션 -->
        <div v-if="detail.p_tags && detail.p_tags.length > 0" class="detail-section">
          <h4>태그</h4>
          <div class="tag-list">
            <span 
              v-for="(tag, index) in detail.p_tags" 
              :key="index" 
              class="tag" 
              @click="$emit('apply-keyword', tag); closeModal();"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 설명 섹션 -->
        <div v-if="detail.p_description" class="detail-section">
          <h4>설명</h4>
          <p class="detail-description">{{ detail.p_description }}</p>
        </div>
        
        <!-- 특성 분석 섹션 -->
        <div v-if="detail.p_vector" class="detail-section">
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
                          <g :style="{ mask: 'url(#male-mask-' + detail._id + ')' }">
                            <path d="M123.25,82.17H35.42C13.84,82.17-2.72,101.3.37,122.66l11.55,79.69c1.17,8.06,8.07,14.03,16.21,14.03h2.43l14.06,116.16h69.42l14.06-116.16h2.51c8.11,0,14.99-5.96,16.15-13.98l11.56-79.94c2.97-21.29-13.57-40.29-35.07-40.29Z" fill="#4c7bd8"/>
                            <circle cx="79.33" cy="37.42" r="37.42" transform="translate(-3.23 67.06) rotate(-45)" fill="#4c7bd8"/>
                          </g>
                          <mask :id="`male-mask-${detail._id}`">
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
                          <g :style="{ mask: 'url(#female-mask-' + detail._id + ')' }">
                            <circle cx="78.68" cy="37.42" r="37.42" transform="translate(24.18 105.4) rotate(-76.72)" fill="#e5518d"/>
                            <path d="M156.76,187.25l-24.97-94.01c-.03-.1-.06-.2-.09-.29-2.35-6.46-8.49-10.77-15.37-10.77H41.02c-6.89,0-13.03,4.31-15.37,10.77-.03.1-.06.19-.09.29L.59,187.25s-5.18,20.11,15.14,23.87h.31l-6.41,33.76h24.91l12.45,87.66h63.38l12.45-87.66h24.91l-6.41-33.76h.3c19.58-3.22,15.15-23.87,15.15-23.87Z" fill="#e5518d"/>
                          </g>
                          <mask :id="`female-mask-${detail._id}`">
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
        <div v-if="detail.reviews && detail.reviews.length > 0" class="detail-section">
          <h4>방문자 리뷰 ({{ detail.reviews.length }})</h4>
          <div class="reviews-container">
            <div v-for="(review, index) in detail.reviews" :key="index" class="review-item">
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
        <button class="cancel-btn" @click="closeModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import Chart from 'chart.js/auto';
import config from "@/config.js";

export default {
  name: "PlaceDetailModal",
  
  props: {
    show: Boolean,
    detail: Object,
    isInWishlist: Boolean,
    ageStats: Array,
    genderStats: Array,
    totalStatsVisits: Number,
    isLoadingStats: Boolean
  },
  
  setup(props, { emit }) {
    // 차트 관련 변수
    const ageChartCanvas = ref(null);
    let ageChart = null;
    const detailMapContainer = ref(null);
    
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
      if (!props.detail || !props.detail.p_vector) {
        return [];
      }
      return props.detail.p_vector;
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
        
        if (props.detail && props.detail.location_data) {
          // 위치 데이터가 있는 경우 실제 위치 표시
          const locationData = props.detail.location_data;
          lat = locationData.latitude || lat;
          lng = locationData.longitude || lng;
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
        const infoContent = `
          <div style="padding: 5px; text-align: center;">
            <span style="font-weight: bold;">${props.detail.name || props.detail.p_name || '여행지'}</span>
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
        nextTick(() => {
          // 약간의 지연 추가로 모달 애니메이션 완료 후 지도 초기화
          setTimeout(() => {
            initDetailMap();
          }, 300);
        });
      }
    });
    
    watch([() => props.ageStats, totalAgeVisits], () => {
      nextTick(() => {
        renderAgeChart();
      });
    }, { deep: true });
    
    onMounted(() => {
      if (props.show) {
        nextTick(() => {
          setTimeout(() => {
            initDetailMap();
          }, 300);
        });
      }
    });
    
    return {
      closeModal,
      dimensionValues,
      getDimensionLabel,
      formatReviewDate,
      totalAgeVisits,
      malePercentage,
      femalePercentage,
      ageChartCanvas,
      getColorForAge,
      detailMapContainer
    };
  }
};
</script>

<style scoped>
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