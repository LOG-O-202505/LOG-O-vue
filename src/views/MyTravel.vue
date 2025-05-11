<!-- eslint-disable -->
<template>
  <div class="my-travel">
    <!-- 헤더 -->
    <Header />
    
    <!-- 히어로 섹션 -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">내 여행 발자취</h1>
        <p class="hero-subtitle">당신의 특별했던 순간들을 한눈에 확인하세요</p>
      </div>
    </div>
    
    <!-- 메인 콘텐츠 -->
    <div class="content-wrapper">
      <!-- 사용자 여행 통계 요약 -->
      <div class="statistics-summary">
        <div class="statistic-card">
          <div class="statistic-value">{{ userStats.totalTrips }}</div>
          <div class="statistic-label">전체 여행</div>
        </div>
        <div class="statistic-card">
          <div class="statistic-value">{{ userStats.visitedRegions }}</div>
          <div class="statistic-label">방문 지역</div>
        </div>
        <div class="statistic-card">
          <div class="statistic-value">{{ userStats.totalImages }}</div>
          <div class="statistic-label">저장된 이미지</div>
        </div>
        <div class="statistic-card">
          <div class="statistic-value">{{ userStats.topCategory }}</div>
          <div class="statistic-label">선호 카테고리</div>
        </div>
      </div>
      
      <!-- 여행 지도 시각화 -->
      <div class="travel-map-container">
        <div class="map-controls">
          <h2>나의 여행 히트맵</h2>
          <div class="map-buttons">
            <button 
              :class="['map-view-btn', { active: mapViewMode === 'heatmap' }]" 
              @click="setMapViewMode('heatmap')"
            >
              히트맵 보기
            </button>
            <button 
              :class="['map-view-btn', { active: mapViewMode === 'images' }]" 
              @click="setMapViewMode('images')"
            >
              이미지 모자이크
            </button>
          </div>
          <div class="map-filter">
            <label for="year-filter">년도:</label>
            <select id="year-filter" v-model="selectedYear">
              <option value="all">전체</option>
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}년</option>
            </select>
            
            <label for="season-filter">계절:</label>
            <select id="season-filter" v-model="selectedSeason">
              <option value="all">전체</option>
              <option value="spring">봄</option>
              <option value="summer">여름</option>
              <option value="fall">가을</option>
              <option value="winter">겨울</option>
            </select>
          </div>
        </div>
        
        <!-- 지도 시각화 영역 -->
        <div class="map-visualization">
          <!-- 광역시도 지도 -->
          <div class="map-container" ref="mapContainer" v-show="currentMapLevel === 'ctprvn'"></div>
          
          <!-- 시군구 상세 지도 -->
          <div class="detail-map-container" ref="detailMapContainer" v-show="currentMapLevel === 'sig'">
            <div class="detail-map-header">
              <button class="back-button" @click="resetToCtprvnMap">
                <span class="back-icon">←</span> 이전 지도로 돌아가기
              </button>
            </div>
          </div>
          
          <!-- 확대/축소 컨트롤 -->
          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomIn">+</button>
            <button class="zoom-btn" @click="zoomOut">-</button>
            <button class="zoom-btn reset" @click="resetZoom">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </button>
          </div>
          
          <!-- 이미지 팝업 모달 -->
          <div v-if="selectedImage" class="image-modal" @click.self="closeImageModal">
            <div class="image-modal-content">
              <button class="close-modal-btn" @click="closeImageModal">×</button>
              <img :src="`data:image/jpeg;base64,${selectedImage.image_data}`" alt="여행 이미지">
              <div class="image-info">
                <h3>{{ selectedImage.image_name }}</h3>
                <div class="image-location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{{ selectedImage.image_location }}</span>
                </div>
                <div class="image-date">{{ formatDate(selectedImage.created_at) }}</div>
                <div class="image-tags">
                  <span v-for="(tag, index) in selectedImage.image_tags" :key="index" class="image-tag">
                    #{{ tag }}
                  </span>
                </div>
                <div class="image-dimensions" v-if="selectedImage.dimensions">
                  <h4>이미지 분석 결과</h4>
                  <div class="dimensions-grid">
                    <div v-for="(score, dimension) in selectedImage.dimensions" :key="dimension" class="dimension-item">
                      <div class="dimension-name">{{ getCategoryName(dimension) }}</div>
                      <div class="dimension-bar-container">
                        <div class="dimension-bar" :style="{ width: `${score * 100}%` }"></div>
                      </div>
                      <div class="dimension-score">{{ (score * 100).toFixed(0) }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 지역 호버 툴팁 -->
          <div v-if="hoveredRegion" class="region-tooltip" :style="tooltipStyle">
            {{ hoveredRegionName }}
          </div>
        </div>
      </div>
      
      <!-- 차원별 취향 프로필 -->
      <div class="preference-profile">
        <h2 class="section-title">내 여행 취향 프로필</h2>
        <div class="profile-content">
          <div class="radar-chart-container" ref="radarChartContainer">
            <!-- 레이더 차트가 렌더링 될 컨테이너 -->
          </div>
          <div class="profile-insight">
            <h3>당신의 여행 스타일</h3>
            <p>{{ userInsight }}</p>
            <div class="top-categories">
              <div v-for="(category, index) in topCategories" :key="index" class="category-item">
                <div class="category-name">{{ getCategoryName(category.dimension) }}</div>
                <div class="category-bar-container">
                  <div class="category-bar" :style="{ width: `${category.score * 100}%` }"></div>
                </div>
                <div class="category-score">{{ Math.round(category.score * 100) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 시간별 여행 타임라인 -->
      <div class="travel-timeline">
        <h2 class="section-title">여행 타임라인</h2>
        <div class="timeline-container">
          <div class="timeline-year" v-for="(year, yearIndex) in filteredTimeline" :key="yearIndex">
            <div class="year-label">{{ year.year }}</div>
            <div class="year-trips">
              <div 
                v-for="(trip, tripIndex) in year.trips" 
                :key="tripIndex" 
                class="trip-item"
                :class="getSeasonClass(trip.season)"
                @click="openImageModal(trip)"
              >
                <div class="trip-date">{{ formatShortDate(trip.date) }}</div>
                <div class="trip-image-preview">
                  <img :src="`data:image/jpeg;base64,${trip.image_data}`" :alt="trip.location">
                </div>
                <div class="trip-details">
                  <div class="trip-location">{{ trip.location }}</div>
                  <div class="trip-season">{{ getSeasonName(trip.season) }}</div>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as d3 from 'd3';
import Header from '@/components/Header.vue';
import ctprvnGeoJson from '@/assets/ctprvn.json';
import propertiesData from '@/assets/extracted_ctprvn.json';
import sigGeoJson from '@/assets/sig.json';
import sigPropertiesData from '@/assets/extracted_properties.json';

// 임시 서비스 함수 - 실제 구현시 API 호출로 대체
import { getUserTravelImages } from '@/services/api';

export default {
  name: 'MyTravel',
  
  components: {
    Header
  },
  
  setup() {
    // 상태 변수 선언
    const mapContainer = ref(null);
    const detailMapContainer = ref(null);
    const radarChartContainer = ref(null);
    const mapViewMode = ref('images'); // 'heatmap' 또는 'images'
    const selectedYear = ref('all');
    const selectedSeason = ref('all');
    const selectedImage = ref(null);
    const currentZoomLevel = ref(1);
    const maxZoomLevel = 8;
    const currentMapLevel = ref('ctprvn'); // 'ctprvn' 또는 'sig'
    const activeRegion = ref(null); // 활성화된 광역시도 코드
    const activeSig = ref(null); // 활성화된 시군구 코드
    const hoveredRegion = ref(null); // 호버된 지역 코드
    const mousePosition = ref({ x: 0, y: 0 }); // 마우스 위치
    
    // 지도 및 레이더 차트 인스턴스
    let mapSvg = null;
    let detailMapSvg = null;
    let mapG = null;
    let detailMapG = null;
    let mapZoom = null;
    let detailMapZoom = null;
    let radarChartSvg = null;
    
    // 사용자 통계 (실제 구현시 API로 가져와야 함)
    const userStats = reactive({
      totalTrips: 38,
      visitedRegions: 8,
      totalImages: 143,
      topCategory: '자연'
    });
    
    // 사용자 여행 데이터 (임시 데이터)
    const userTravelData = ref([]);
    
    // 사용자 취향 인사이트
    const userInsight = ref('당신은 자연 경관이 풍부한 여행지를 선호하는 "자연 친화적 탐험가" 스타일입니다. 특히 계절감이 잘 드러나는 여행지에서 휴식을 취하는 것을 즐기시는 것 같네요. 도시보다는 한적한 자연 속에서 여유를 즐기는 여행자입니다.');
    
    // 차원 데이터
    const dimensionScores = reactive({
      "Natural Elements": 0.85,      // 자연 요소
      "Urban Character": 0.42,       // 도시 특성
      "Water Features": 0.76,        // 수경 요소
      "Seasonal Appeal": 0.89,       // 계절적 매력
      "Relaxation Potential": 0.92,  // 휴식 잠재력
      "Romantic Atmosphere": 0.63,   // 로맨틱한 분위기
      "Activity Opportunities": 0.52,// 활동 기회
      "Historical/Cultural Value": 0.48, // 역사/문화적 가치
      "Food Experience": 0.72,       // 식도락 경험
      "Shopping Potential": 0.23     // 쇼핑 잠재력
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
    
    // 타임라인 데이터 (실제 구현시 API로 가져와야 함)
    const travelTimeline = reactive([
      {
        year: 2025,
        trips: [
          { 
            id: 1, 
            date: '2025-03-15', 
            location: '제주도 서귀포', 
            season: 'spring', 
            image_data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 
            image_name: '제주도 서귀포 바다', 
            image_location: '제주도 서귀포시',
            image_tags: ['바다', '제주도', '휴양'],
            created_at: '2025-03-15',
            region_info: { region_code: '50' },
            dimensions: { 
              "Natural Elements": 0.9, 
              "Water Features": 0.85,
              "Relaxation Potential": 0.88
            }
          },
          { 
            id: 2, 
            date: '2025-01-20', 
            location: '강원도 평창', 
            season: 'winter', 
            image_data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            image_name: '강원도 겨울풍경',
            image_location: '강원도 평창군',
            image_tags: ['겨울', '스키', '설경'],
            created_at: '2025-01-20',
            region_info: { region_code: '42' },
            dimensions: { 
              "Seasonal Appeal": 0.92, 
              "Relaxation Potential": 0.88,
              "Natural Elements": 0.76
            }
          }
        ]
      },
      {
        year: 2024,
        trips: [
          { 
            id: 3, 
            date: '2024-10-05', 
            location: '전라남도 담양', 
            season: 'fall', 
            image_data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            image_name: '담양 대나무숲',
            image_location: '전라남도 담양군',
            image_tags: ['가을', '단풍', '숲'],
            created_at: '2024-10-05',
            region_info: { region_code: '46' },
            dimensions: { 
              "Natural Elements": 0.88, 
              "Seasonal Appeal": 0.94,
              "Relaxation Potential": 0.82
            }
          },
          { 
            id: 4, 
            date: '2024-08-15', 
            location: '부산 해운대', 
            season: 'summer', 
            image_data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            image_name: '부산 해운대 바다',
            image_location: '부산 해운대구',
            image_tags: ['바다', '해변', '여름'],
            created_at: '2024-08-15',
            region_info: { region_code: '26' },
            dimensions: { 
              "Water Features": 0.95, 
              "Activity Opportunities": 0.85,
              "Urban Character": 0.65
            }
          },
          { 
            id: 5, 
            date: '2024-05-22', 
            location: '서울 북촌', 
            season: 'spring', 
            image_data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            image_name: '서울 북촌 한옥마을',
            image_location: '서울 종로구',
            image_tags: ['한옥', '역사', '문화'],
            created_at: '2024-05-22',
            region_info: { region_code: '11' },
            dimensions: { 
              "Urban Character": 0.82, 
              "Historical/Cultural Value": 0.78,
              "Shopping Potential": 0.65
            }
          }
        ]
      },
      {
        year: 2023,
        trips: [
          { 
            id: 6, 
            date: '2023-12-24', 
            location: '강원도 속초', 
            season: 'winter', 
            image_data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            image_name: '속초 설경',
            image_location: '강원도 속초시',
            image_tags: ['겨울', '설경', '동해'],
            created_at: '2023-12-24',
            region_info: { region_code: '42' },
            dimensions: { 
              "Natural Elements": 0.85, 
              "Relaxation Potential": 0.9,
              "Seasonal Appeal": 0.79
            }
          },
          { 
            id: 7, 
            date: '2023-07-10', 
            location: '경상북도 경주', 
            season: 'summer', 
            image_data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            image_name: '경주 불국사',
            image_location: '경상북도 경주시',
            image_tags: ['역사', '문화', '불교'],
            created_at: '2023-07-10',
            region_info: { region_code: '47' },
            dimensions: { 
              "Historical/Cultural Value": 0.94, 
              "Urban Character": 0.45,
              "Natural Elements": 0.56
            }
          }
        ]
      }
    ]);
    
    // 사용자 지역 방문 데이터 (실제로는 API에서 가져와야 함)
    const visitedRegions = reactive({
      '11': { visits: 25, lastVisit: '2024-06-15' }, // 서울
      '26': { visits: 15, lastVisit: '2024-08-20' }, // 부산
      '41': { visits: 8, lastVisit: '2024-04-05' },  // 경기도
      '42': { visits: 20, lastVisit: '2025-01-25' }, // 강원도
      '44': { visits: 5, lastVisit: '2023-09-10' },  // 충남
      '46': { visits: 12, lastVisit: '2024-10-10' }, // 전남
      '47': { visits: 10, lastVisit: '2023-07-15' }, // 경북
      '48': { visits: 7, lastVisit: '2023-05-20' },  // 경남
      '50': { visits: 18, lastVisit: '2025-03-20' }  // 제주
    });
    
    // 마우스 위치 추적
    const updateMousePosition = (event) => {
      mousePosition.value = {
        x: event.clientX,
        y: event.clientY
      };
    };
    
    // 툴팁 스타일 계산
    const tooltipStyle = computed(() => {
      return {
        left: `${mousePosition.value.x}px`,
        top: `${mousePosition.value.y - 40}px`
      };
    });
    
    // 호버된 지역 이름 계산
    const hoveredRegionName = computed(() => {
      if (!hoveredRegion.value) return '';
      
      if (currentMapLevel.value === 'ctprvn') {
        const region = propertiesData.find(r => r.CTPRVN_CD === hoveredRegion.value);
        return region ? region.CTP_KOR_NM : '';
      } else {
        const sig = sigPropertiesData.find(s => s.SIG_CD === hoveredRegion.value);
        return sig ? sig.SIG_KOR_NM : '';
      }
    });
    
    // 상위 카테고리 계산
    const topCategories = computed(() => {
      return Object.entries(dimensionScores)
        .map(([dimension, score]) => ({ dimension, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    });
    
    // 필터링된 타임라인 계산
    const filteredTimeline = computed(() => {
      // 년도 및 계절 필터 적용
      let filtered = [...travelTimeline];
      
      // 년도 필터 적용
      if (selectedYear.value !== 'all') {
        filtered = filtered.filter(year => year.year === parseInt(selectedYear.value));
      }
      
      // 각 년도의 trips 배열에 계절 필터 적용
      filtered = filtered.map(year => {
        const filteredTrips = selectedSeason.value !== 'all' 
          ? year.trips.filter(trip => trip.season === selectedSeason.value)
          : year.trips;
        
        return { ...year, trips: filteredTrips };
      });
      
      // 빈 trips 배열을 가진 년도 제거
      return filtered.filter(year => year.trips.length > 0);
    });
    
    // 년도 목록 계산
    const availableYears = computed(() => {
      return travelTimeline.map(year => year.year);
    });
    
    // 카테고리 이름 변환
    const getCategoryName = (dimension) => {
      return dimensionTranslations[dimension] || dimension;
    };
    
    // 계절 클래스 계산
    const getSeasonClass = (season) => {
      return `season-${season}`;
    };
    
    // 계절 이름 변환
    const getSeasonName = (season) => {
      const seasonMap = {
        'spring': '봄',
        'summer': '여름',
        'fall': '가을',
        'winter': '겨울'
      };
      return seasonMap[season] || season;
    };
    
    // 날짜 형식 변환
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    };
    
    // 짧은 날짜 형식 변환
    const formatShortDate = (dateString) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    };
    
    // 여행 이미지를 지역별로 그룹화하는 함수
    const groupImagesByRegion = () => {
      const grouped = {};
      
      // 타임라인에서 모든 여행 데이터 수집
      travelTimeline.forEach(year => {
        year.trips.forEach(trip => {
          if (trip.region_info && trip.region_info.region_code) {
            const regionCode = trip.region_info.region_code;
            
            // 필터 적용
            if (selectedYear.value !== 'all' && year.year !== parseInt(selectedYear.value)) {
              return;
            }
            
            if (selectedSeason.value !== 'all' && trip.season !== selectedSeason.value) {
              return;
            }
            
            if (!grouped[regionCode]) {
              grouped[regionCode] = [];
            }
            grouped[regionCode].push(trip);
          }
        });
      });
      
      return grouped;
    };
    
    // 맵뷰 모드 설정
    const setMapViewMode = (mode) => {
      mapViewMode.value = mode;
      renderMap();
    };
    
    // 지도 확대/축소 기능
    const zoomIn = () => {
      if (currentMapLevel.value === 'ctprvn' && mapZoom) {
        if (currentZoomLevel.value < maxZoomLevel) {
          currentZoomLevel.value += 0.5;
          mapSvg.transition().duration(500).call(
            mapZoom.transform,
            d3.zoomIdentity.scale(currentZoomLevel.value)
          );
          updateImagesBasedOnZoom();
        }
      } else if (currentMapLevel.value === 'sig' && detailMapZoom) {
        if (currentZoomLevel.value < maxZoomLevel) {
          currentZoomLevel.value += 0.5;
          detailMapSvg.transition().duration(500).call(
            detailMapZoom.transform,
            d3.zoomIdentity.scale(currentZoomLevel.value)
          );
          updateImagesBasedOnZoom();
        }
      }
    };
    
    const zoomOut = () => {
      if (currentMapLevel.value === 'ctprvn' && mapZoom) {
        if (currentZoomLevel.value > 1) {
          currentZoomLevel.value -= 0.5;
          mapSvg.transition().duration(500).call(
            mapZoom.transform,
            d3.zoomIdentity.scale(currentZoomLevel.value)
          );
          updateImagesBasedOnZoom();
        }
      } else if (currentMapLevel.value === 'sig' && detailMapZoom) {
        if (currentZoomLevel.value > 1) {
          currentZoomLevel.value -= 0.5;
          detailMapSvg.transition().duration(500).call(
            detailMapZoom.transform,
            d3.zoomIdentity.scale(currentZoomLevel.value)
          );
          updateImagesBasedOnZoom();
        }
      }
    };
    
    const resetZoom = () => {
      currentZoomLevel.value = 1;
      if (currentMapLevel.value === 'ctprvn' && mapZoom) {
        mapSvg.transition().duration(500).call(
          mapZoom.transform,
          d3.zoomIdentity
        );
      } else if (currentMapLevel.value === 'sig' && detailMapZoom) {
        detailMapSvg.transition().duration(500).call(
          detailMapZoom.transform,
          d3.zoomIdentity
        );
      }
      updateImagesBasedOnZoom();
    };
    
    // 지역 선택 함수
    const selectRegion = (regionCode) => {
      if (activeRegion.value === regionCode) {
        resetToCtprvnMap();
        return;
      }
      
      activeRegion.value = regionCode;
      currentMapLevel.value = 'sig';
      
      // 시군구 지도 렌더링
      nextTick(() => {
        renderDetailMap(regionCode);
      });
    };
    
    // 시군구 선택 함수
    const selectSig = (sigCode) => {
      if (activeSig.value === sigCode) {
        activeSig.value = null;
        updateDetailMapSelection();
        return;
      }
      
      activeSig.value = sigCode;
      updateDetailMapSelection();
    };
    
    // 광역시도 지도로 돌아가기
    const resetToCtprvnMap = () => {
      activeRegion.value = null;
      activeSig.value = null;
      currentMapLevel.value = 'ctprvn';
      currentZoomLevel.value = 1;
    };
    
    // 이미지 모달 열기
    const openImageModal = (image) => {
      selectedImage.value = image;
    };
    
    // 이미지 모달 닫기
    const closeImageModal = () => {
      selectedImage.value = null;
    };
    
    // 줌 레벨에 따라 이미지 표시 업데이트
    const updateImagesBasedOnZoom = () => {
      const zoomLevel = currentZoomLevel.value;
      const imageMarkers = currentMapLevel.value === 'ctprvn' 
        ? d3.select(mapContainer.value).selectAll('.travel-image-marker')
        : d3.select(detailMapContainer.value).selectAll('.travel-image-marker');
      
      if (zoomLevel > 4) {
        // 고확대: 이미지 크기 작게 조정
        imageMarkers
          .attr('width', 25)
          .attr('height', 25)
          .attr('x', function() { 
            const x = parseFloat(d3.select(this).attr('x'));
            return x + 2.5;
          })
          .attr('y', function() {
            const y = parseFloat(d3.select(this).attr('y'));
            return y + 2.5;
          });
      } else if (zoomLevel > 2) {
        // 중간 확대: 기본 이미지 크기 유지
        imageMarkers
          .attr('width', 30)
          .attr('height', 30)
          .attr('x', function() {
            const x = parseFloat(d3.select(this).attr('x'));
            return x;
          })
          .attr('y', function() {
            const y = parseFloat(d3.select(this).attr('y'));
            return y;
          });
      } else {
        // 낮은 확대: 이미지 크기 키움
        imageMarkers
          .attr('width', 35)
          .attr('height', 35)
          .attr('x', function() {
            const x = parseFloat(d3.select(this).attr('x'));
            return x - 2.5;
          })
          .attr('y', function() {
            const y = parseFloat(d3.select(this).attr('y'));
            return y - 2.5;
          });
      }
    };
    
    // 지역별 색상 계산 (방문 빈도에 따라)
    const getRegionColor = (regionCode) => {
      const region = visitedRegions[regionCode];
      
      if (!region) {
        return '#e0e0e0'; // 방문하지 않은 지역
      }
      
      // 방문 횟수를 0~1 범위로 정규화
      const maxVisits = Math.max(...Object.values(visitedRegions).map(r => r.visits));
      const normalizedVisits = region.visits / maxVisits;
      
      // 파스텔 색상 팔레트 (방문 횟수가 많을수록 짙은 색상)
      return d3.interpolateRgb('#e0f2ff', '#4299e1')(normalizedVisits);
    };
    
    // 시군구 색상 계산
    const getSigColor = (sigCode, parentRegionCode) => {
      // 실제 구현에서는 시군구별 방문 데이터 필요
      // 임시로 광역시도 색상을 약간 연하게 사용
      const regionColor = getRegionColor(parentRegionCode);
      
      if (activeSig.value === sigCode) {
        return '#4a89dc'; // 선택된 시군구
      }
      
      return d3.color(regionColor).brighter(0.3);
    };
    
    // 지도 렌더링 함수
    const renderMap = () => {
      if (!mapContainer.value) return;
      
      // 기존 SVG 제거
      d3.select(mapContainer.value).selectAll("svg").remove();
      
      const width = mapContainer.value.clientWidth;
      const height = mapContainer.value.clientHeight;
      
      // SVG 생성
      mapSvg = d3.select(mapContainer.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);
      
      // 그림자 필터 정의
      const defs = mapSvg.append('defs');
      const dropShadowFilter = defs.append('filter')
        .attr('id', 'dropshadow')
        .attr('height', '130%');
      
      dropShadowFilter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 4);
      
      dropShadowFilter.append('feOffset')
        .attr('dx', 0)
        .attr('dy', 4);
      
      // 투명도 조정
      const feComponentTransfer = dropShadowFilter.append('feComponentTransfer');
      feComponentTransfer.append('feFuncA')
        .attr('type', 'linear')
        .attr('slope', 0.3);
      
      const feMerge = dropShadowFilter.append('feMerge');
      feMerge.append('feMergeNode');
      feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');
      
      // 이미지 클리핑을 위한 원형 패턴 정의
      defs.append('clipPath')
        .attr('id', 'circleClip')
        .append('circle')
        .attr('r', 15)
        .attr('cx', 15)
        .attr('cy', 15);
      
      // 지도 그룹 요소
      mapG = mapSvg.append('g')
        .attr('class', 'map-group')
        .attr('filter', 'url(#dropshadow)');
      
      // 이미지 오버레이 그룹
      const imageOverlay = mapSvg.append('g')
        .attr('class', 'travel-images-overlay');
      
      try {
        // 지도 투영법 설정
        const projection = d3.geoIdentity()
          .reflectY(true)
          .fitSize([width * 0.9, height * 0.9], ctprvnGeoJson);
        
        // 경로 생성기
        const path = d3.geoPath().projection(projection);
        
        // 지도 그룹 요소에 변환 적용 - 중앙에 위치시키기
        mapG.attr("transform", `translate(${width * 0.05}, ${height * 0.05})`);
        
        // 확대/축소 설정
        mapZoom = d3.zoom()
          .scaleExtent([1, maxZoomLevel])
          .on('zoom', (event) => {
            // 지도와 이미지 오버레이 같이 확대/축소
            mapG.attr('transform', `translate(${width * 0.05}, ${height * 0.05}) scale(${event.transform.k})`);
            imageOverlay.attr('transform', `translate(${event.transform.x}, ${event.transform.y}) scale(${event.transform.k})`);
            
            // 현재 줌 레벨 저장
            currentZoomLevel.value = event.transform.k;
            
            // 줌 레벨에 따라 이미지 표시 방식 업데이트
            updateImagesBasedOnZoom();
          });
        
        // 지도에 줌 기능 적용
        mapSvg.call(mapZoom);
        
        // 지도 데이터 로드 및 그리기
        const regions = mapG.selectAll('path')
          .data(ctprvnGeoJson.features)
          .enter()
          .append('path')
          .attr('class', 'region')
          .attr('d', path)
          .attr('fill', d => getRegionColor(d.properties.CTPRVN_CD))
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5)
          .attr('cursor', 'pointer');
        
        // 히트맵 모드 효과
        if (mapViewMode.value === 'heatmap') {
          regions
            .attr('opacity', d => {
              const region = visitedRegions[d.properties.CTPRVN_CD];
              if (!region) return 0.3;
              
              const maxVisits = Math.max(...Object.values(visitedRegions).map(r => r.visits));
              return 0.3 + (region.visits / maxVisits) * 0.7;
            });
        }
        
        // 지역 호버 이벤트
        regions
          .on('mouseover', function(event, d) {
            hoveredRegion.value = d.properties.CTPRVN_CD;
            updateMousePosition(event);
            
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#4a89dc')
              .attr('stroke-width', 1.5);
          })
          .on('mousemove', updateMousePosition)
          .on('mouseout', function(event, d) {
            hoveredRegion.value = null;
            
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', getRegionColor(d.properties.CTPRVN_CD))
              .attr('stroke-width', 0.5);
          })
          .on('click', function(event, d) {
            selectRegion(d.properties.CTPRVN_CD);
          });
        
        // 이미지 모드일 때만 이미지 표시
        if (mapViewMode.value === 'images') {
          // 지역별로 이미지 그룹화
          const regionImages = groupImagesByRegion();
          
          // 각 지역에 이미지 표시
          Object.entries(regionImages).forEach(([regionCode, images]) => {
            // 해당 지역 중심점 찾기
            const feature = ctprvnGeoJson.features.find(f => f.properties.CTPRVN_CD === regionCode);
            if (!feature) return;
            
            const centroid = path.centroid(feature);
            if (!centroid || centroid.length !== 2) return;
            
            // 이 지역에서 가장 최근 이미지 선택
            const latestImage = images.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            // 이미지 원형 마커 추가
            imageOverlay.append('image')
              .attr('class', 'travel-image-marker')
              .attr('xlink:href', `data:image/jpeg;base64,${latestImage.image_data}`)
              .attr('x', centroid[0] - 15)
              .attr('y', centroid[1] - 15)
              .attr('width', 30)
              .attr('height', 30)
              .attr('clip-path', 'url(#circleClip)')
              .style('cursor', 'pointer')
              .style('filter', 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))')
              .on('click', () => openImageModal(latestImage))
              .on('mouseover', function() {
                d3.select(this)
                  .transition()
                  .duration(300)
                  .attr('width', 40)
                  .attr('height', 40)
                  .attr('x', centroid[0] - 20)
                  .attr('y', centroid[1] - 20);
              })
              .on('mouseout', function() {
                d3.select(this)
                  .transition()
                  .duration(300)
                  .attr('width', 30)
                  .attr('height', 30)
                  .attr('x', centroid[0] - 15)
                  .attr('y', centroid[1] - 15);
              });
            
            // 높은 확대 수준에서 표시할 추가 이미지
            if (images.length > 1 && currentZoomLevel.value > 4) {
              // 중심점 주변에 여러 이미지 배치 (방사형)
              const additionalImages = images.slice(1, Math.min(5, images.length));
              
              additionalImages.forEach((image, i) => {
                const angle = (i * Math.PI * 2) / additionalImages.length;
                const offsetX = Math.cos(angle) * 40;
                const offsetY = Math.sin(angle) * 40;
                
                imageOverlay.append('image')
                  .attr('class', 'travel-image-marker additional-marker')
                  .attr('xlink:href', `data:image/jpeg;base64,${image.image_data}`)
                  .attr('x', centroid[0] + offsetX - 12)
                  .attr('y', centroid[1] + offsetY - 12)
                  .attr('width', 24)
                  .attr('height', 24)
                  .attr('clip-path', 'url(#circleClip)')
                  .style('cursor', 'pointer')
                  .style('opacity', 0)
                  .style('filter', 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))')
                  .on('click', () => openImageModal(image));
              });
            }
          });
        }
        
        // 창 크기 변경 시 지도 크기 조정
        const resizeMap = () => {
          if (!mapContainer.value) return;
          
          const newWidth = mapContainer.value.clientWidth;
          const newHeight = mapContainer.value.clientHeight;
          
          mapSvg.attr('width', newWidth)
            .attr('height', newHeight)
            .attr('viewBox', [0, 0, newWidth, newHeight]);
          
          // 투영법 업데이트
          projection.fitSize([newWidth * 0.9, newHeight * 0.9], ctprvnGeoJson);
          
          // 그룹 요소 위치 업데이트
          mapG.attr("transform", `translate(${newWidth * 0.05}, ${newHeight * 0.05})`);
          
          // 모든 경로 업데이트
          regions.attr('d', path);
          
          // 이미지 위치 업데이트 (실제 구현 필요)
        };
        
        window.addEventListener('resize', resizeMap);
        
        return () => {
          window.removeEventListener('resize', resizeMap);
        };
      } catch (error) {
        console.error("지도 렌더링 중 오류:", error);
      }
    };
    
    // 시군구 지도 렌더링 함수
    const renderDetailMap = (regionCode) => {
      if (!detailMapContainer.value) return;
      
      // 기존 SVG 제거
      d3.select(detailMapContainer.value).selectAll("svg").remove();
      
      // 컨테이너 크기
      const width = detailMapContainer.value.clientWidth;
      const height = detailMapContainer.value.clientHeight;
      
      // SVG 생성
      detailMapSvg = d3.select(detailMapContainer.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);
      
      // 그림자 필터 정의
      const defs = detailMapSvg.append('defs');
      const dropShadowFilter = defs.append('filter')
        .attr('id', 'dropshadow-detail')
        .attr('height', '130%');
      
      dropShadowFilter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 4);
      
      dropShadowFilter.append('feOffset')
        .attr('dx', 0)
        .attr('dy', 4);
      
      // 투명도 조정
      const feComponentTransfer = dropShadowFilter.append('feComponentTransfer');
      feComponentTransfer.append('feFuncA')
        .attr('type', 'linear')
        .attr('slope', 0.3);
      
      const feMerge = dropShadowFilter.append('feMerge');
      feMerge.append('feMergeNode');
      feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');
      
      // 이미지 클리핑을 위한 원형 패턴 정의
      defs.append('clipPath')
        .attr('id', 'circleClip-detail')
        .append('circle')
        .attr('r', 15)
        .attr('cx', 15)
        .attr('cy', 15);
      
      // 지도 그룹 요소
      detailMapG = detailMapSvg.append('g')
        .attr('class', 'map-group')
        .attr('filter', 'url(#dropshadow-detail)');
      
      // 이미지 오버레이 그룹
      const imageOverlay = detailMapSvg.append('g')
        .attr('class', 'travel-images-overlay');
      
      try {
        // 지역 코드로 시군구 필터링
        const filteredFeatures = sigGeoJson.features.filter(feature => {
          if (!feature.properties || !feature.properties.SIG_CD) return false;
          
          // 시군구 코드 앞 두 자리가 광역시도 코드와 일치하는지 확인
          const sigCodePrefix = feature.properties.SIG_CD.substring(0, 2);
          return sigCodePrefix === regionCode;
        });
        
        if (filteredFeatures.length === 0) {
          console.log("선택한 지역에 대한 시군구 데이터가 없습니다");
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
          .fitSize([width * 0.9, height * 0.9], filteredGeoJson);
        
        // 경로 생성기
        const path = d3.geoPath().projection(projection);
        
        // 지도 그룹 요소에 변환 적용 - 중앙에 위치시키기
        detailMapG.attr("transform", `translate(${width * 0.05}, ${height * 0.05})`);
        
        // 확대/축소 설정
        detailMapZoom = d3.zoom()
          .scaleExtent([1, maxZoomLevel])
          .on('zoom', (event) => {
            // 지도와 이미지 오버레이 같이 확대/축소
            detailMapG.attr('transform', `translate(${width * 0.05 + event.transform.x}, ${height * 0.05 + event.transform.y}) scale(${event.transform.k})`);
            imageOverlay.attr('transform', `translate(${event.transform.x}, ${event.transform.y}) scale(${event.transform.k})`);
            
            // 현재 줌 레벨 저장
            currentZoomLevel.value = event.transform.k;
            
            // 줌 레벨에 따라 이미지 표시 방식 업데이트
            updateImagesBasedOnZoom();
          });
        
        // 지도에 줌 기능 적용
        detailMapSvg.call(detailMapZoom);
        
        // 시군구 데이터 로드 및 그리기
        const sigPaths = detailMapG.selectAll('path')
          .data(filteredFeatures)
          .enter()
          .append('path')
          .attr('class', 'region')
          .attr('d', path)
          .attr('fill', d => getSigColor(d.properties.SIG_CD, regionCode))
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5)
          .attr('cursor', 'pointer');
        
        // 시군구 호버 이벤트
        sigPaths
          .on('mouseover', function(event, d) {
            hoveredRegion.value = d.properties.SIG_CD;
            updateMousePosition(event);
            
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#4a89dc')
              .attr('stroke-width', 1.5);
          })
          .on('mousemove', updateMousePosition)
          .on('mouseout', function(event, d) {
            hoveredRegion.value = null;
            
            // 선택된 시군구는 색상 유지
            if (activeSig.value === d.properties.SIG_CD) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', '#4a89dc')
                .attr('stroke-width', 1.5);
            } else {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', getSigColor(d.properties.SIG_CD, regionCode))
                .attr('stroke-width', 0.5);
            }
          })
          .on('click', function(event, d) {
            selectSig(d.properties.SIG_CD);
          });
        
        // 이미지 모드일 때만 이미지 표시
        if (mapViewMode.value === 'images') {
          // 이 지역에 속한 시군구별 여행 데이터 그룹화
          const regionTrips = travelTimeline.flatMap(year => 
            year.trips.filter(trip => {
              // 필터 적용
              if (selectedYear.value !== 'all' && year.year !== parseInt(selectedYear.value)) {
                return false;
              }
              
              if (selectedSeason.value !== 'all' && trip.season !== selectedSeason.value) {
                return false;
              }
              
              // 이 광역시도에 속한 여행만 필터링
              if (trip.region_info && trip.region_info.region_code) {
                return trip.region_info.region_code === regionCode;
              }
              return false;
            })
          );
          
          if (regionTrips.length === 0) {
            console.log("이 지역에 대한 여행 데이터가 없습니다");
            return;
          }
          
          // 각 시군구의 중심점 계산
          filteredFeatures.forEach(feature => {
            const sigCode = feature.properties.SIG_CD;
            const centroid = path.centroid(feature);
            
            if (!centroid || centroid.length !== 2) return;
            
            // 이 시군구에 해당하는 여행 찾기 (임시로 랜덤 매핑)
            // 실제 구현에서는 시군구별 여행 데이터 필요
            const sigTrips = regionTrips.filter((_, index) => index % filteredFeatures.length === filteredFeatures.indexOf(feature));
            
            if (sigTrips.length === 0) return;
            
            // 가장 최근 여행 선택
            const latestTrip = sigTrips.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            // 이미지 마커 추가
            imageOverlay.append('image')
              .attr('class', 'travel-image-marker')
              .attr('xlink:href', `data:image/jpeg;base64,${latestTrip.image_data}`)
              .attr('x', centroid[0] - 15)
              .attr('y', centroid[1] - 15)
              .attr('width', 30)
              .attr('height', 30)
              .attr('clip-path', 'url(#circleClip-detail)')
              .style('cursor', 'pointer')
              .style('filter', 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))')
              .on('click', () => openImageModal(latestTrip))
              .on('mouseover', function() {
                d3.select(this)
                  .transition()
                  .duration(300)
                  .attr('width', 40)
                  .attr('height', 40)
                  .attr('x', centroid[0] - 20)
                  .attr('y', centroid[1] - 20);
              })
              .on('mouseout', function() {
                d3.select(this)
                  .transition()
                  .duration(300)
                  .attr('width', 30)
                  .attr('height', 30)
                  .attr('x', centroid[0] - 15)
                  .attr('y', centroid[1] - 15);
              });
          });
        }
        
        // 창 크기 변경 시 지도 크기 조정
        const resizeDetailMap = () => {
          if (!detailMapContainer.value) return;
          
          const newWidth = detailMapContainer.value.clientWidth;
          const newHeight = detailMapContainer.value.clientHeight;
          
          detailMapSvg.attr('width', newWidth)
            .attr('height', newHeight)
            .attr('viewBox', [0, 0, newWidth, newHeight]);
          
          // 투영법 업데이트
          projection.fitSize([newWidth * 0.9, newHeight * 0.9], filteredGeoJson);
          
          // 그룹 요소 위치 업데이트
          detailMapG.attr("transform", `translate(${newWidth * 0.05}, ${newHeight * 0.05})`);
          
          // 모든 경로 업데이트
          sigPaths.attr('d', path);
        };
        
        window.addEventListener('resize', resizeDetailMap);
        
        return () => {
          window.removeEventListener('resize', resizeDetailMap);
        };
      } catch (error) {
        console.error("시군구 지도 렌더링 중 오류:", error);
      }
    };
    
    // 시군구 지도 선택 상태 업데이트
    const updateDetailMapSelection = () => {
      if (!detailMapG) return;
      
      // 모든 시군구 선택 상태 초기화
      detailMapG.selectAll('.region')
        .each(function(d) {
          const selected = activeSig.value === d.properties.SIG_CD;
          
          d3.select(this)
            .classed('selected', selected)
            .transition()
            .duration(200)
            .attr('fill', selected ? '#4a89dc' : getSigColor(d.properties.SIG_CD, activeRegion.value))
            .attr('stroke-width', selected ? 1.5 : 0.5);
        });
    };
    
    // 레이더 차트 렌더링 함수
    const renderRadarChart = () => {
      if (!radarChartContainer.value) return;
      
      // 기존 SVG 제거
      d3.select(radarChartContainer.value).selectAll("svg").remove();
      
      const width = radarChartContainer.value.clientWidth;
      const height = radarChartContainer.value.clientHeight;
      const radius = Math.min(width, height) / 2 * 0.8;
      
      // 데이터 준비
      const dimensions = Object.keys(dimensionScores);
      const dimensionCount = dimensions.length;
      const angleSlice = Math.PI * 2 / dimensionCount;
      
      // SVG 생성
      radarChartSvg = d3.select(radarChartContainer.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);
      
      // 배경 원형 레벨
      const levels = 5;
      const levelFactor = radius / levels;
      
      // 배경 그리드 생성
      const grid = radarChartSvg.append('g').attr('class', 'radar-grid');
      
      // 원형 그리드
      for (let level = 0; level < levels; level++) {
        const levelRadius = levelFactor * (level + 1);
        
        grid.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', levelRadius)
          .style('fill', 'none')
          .style('stroke', '#e2e8f0')
          .style('stroke-dasharray', '3,3');
      }
      
      // 축 그리기
      const axisGrid = grid.selectAll('.axis')
        .data(dimensions)
        .enter()
        .append('g')
        .attr('class', 'axis');
      
      // 방사형 축
      axisGrid.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => radius * Math.cos(angleSlice * i - Math.PI/2))
        .attr('y2', (d, i) => radius * Math.sin(angleSlice * i - Math.PI/2))
        .style('stroke', '#e2e8f0')
        .style('stroke-width', '1px');
      
      // 축 라벨
      axisGrid.append('text')
        .attr('class', 'legend')
        .attr('text-anchor', (d, i) => {
          const angle = angleSlice * i - Math.PI/2;
          if (Math.abs(angle) < 0.1 || Math.abs(angle - Math.PI) < 0.1) return 'middle';
          return angle > 0 && angle < Math.PI ? 'start' : 'end';
        })
        .attr('dy', '0.35em')
        .attr('x', (d, i) => {
          const angle = angleSlice * i - Math.PI/2;
          const labelDistance = radius * 1.15;
          return labelDistance * Math.cos(angle);
        })
        .attr('y', (d, i) => {
          const angle = angleSlice * i - Math.PI/2;
          const labelDistance = radius * 1.15;
          return labelDistance * Math.sin(angle);
        })
        .text(d => getCategoryName(d))
        .style('font-size', '0.7rem')
        .style('fill', '#4a5568');
      
      // 데이터 영역 그리기
      const dataPoints = dimensions.map((dim, i) => {
        const angle = angleSlice * i - Math.PI/2;
        const value = dimensionScores[dim];
        return {
          x: radius * value * Math.cos(angle),
          y: radius * value * Math.sin(angle),
          value
        };
      });
      
      // 데이터 영역 경로
      const radarArea = radarChartSvg.append('path')
        .datum(dataPoints)
        .attr('class', 'radar-area')
        .attr('d', d => {
          return d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveLinearClosed)(d);
        })
        .style('fill', 'rgba(66, 153, 225, 0.6)')
        .style('stroke', '#4299e1')
        .style('stroke-width', '2px');
      
      // 데이터 포인트
      radarChartSvg.selectAll('.radar-point')
        .data(dataPoints)
        .enter()
        .append('circle')
        .attr('class', 'radar-point')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .style('fill', '#4299e1')
        .style('stroke', '#fff')
        .style('stroke-width', '2px');
      
      // 창 크기 변경 시 차트 크기 조정
      const resizeRadarChart = () => {
        renderRadarChart();
      };
      
      window.addEventListener('resize', resizeRadarChart);
      
      return () => {
        window.removeEventListener('resize', resizeRadarChart);
      };
    };
    
    // 필터 변경 시 지도 업데이트
    watch([selectedYear, selectedSeason], () => {
      if (currentMapLevel.value === 'ctprvn') {
        renderMap();
      } else if (currentMapLevel.value === 'sig' && activeRegion.value) {
        renderDetailMap(activeRegion.value);
      }
    });
    
    // 지도 레벨 변경 감지
    watch(currentMapLevel, (newLevel) => {
      // 줌 레벨 초기화
      currentZoomLevel.value = 1;
      
      if (newLevel === 'ctprvn') {
        // 광역시도 지도 표시
        nextTick(() => {
          renderMap();
        });
      }
    });
    
    // 마우스 이벤트 처리
    onMounted(() => {
      window.addEventListener('mousemove', updateMousePosition);
      
      // 사용자 데이터 로드 및 지도 렌더링
      renderMap();
      
      // 레이더 차트 렌더링
      renderRadarChart();
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('mousemove', updateMousePosition);
    });
    
    return {
      // 상태 변수
      mapContainer,
      detailMapContainer,
      radarChartContainer,
      mapViewMode,
      selectedYear,
      selectedSeason,
      selectedImage,
      currentMapLevel,
      activeRegion,
      activeSig,
      hoveredRegion,
      hoveredRegionName,
      tooltipStyle,
      userStats,
      userInsight,
      topCategories,
      filteredTimeline,
      availableYears,
      
      // 메서드
      setMapViewMode,
      zoomIn,
      zoomOut,
      resetZoom,
      selectRegion,
      resetToCtprvnMap,
      openImageModal,
      closeImageModal,
      getSeasonClass,
      getSeasonName,
      formatDate,
      formatShortDate,
      getCategoryName,
      updateMousePosition
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

.my-travel {
  font-family: 'Noto Sans KR', sans-serif;
  min-height: 100vh;
  background-color: #f6f9fc;
  color: #333;
  display: flex;
  flex-direction: column;
}

/* 히어로 섹션 */
.hero-section {
  position: relative;
  height: 200px;
  background-image: url('https://images.unsplash.com/photo-1519055548599-6d4d129508c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  margin-bottom: 0;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7));
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 300;
  margin: 0;
  opacity: 0.9;
  color: white;
}

/* 콘텐츠 영역 */
.content-wrapper {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 통계 카드 */
.statistics-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.statistic-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.statistic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.statistic-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4299e1; /* LOG:O 브랜드 파란색 */
  margin-bottom: 0.5rem;
}

.statistic-label {
  font-size: 1rem;
  color: #718096;
}

/* 지도 컨테이너 */
.travel-map-container {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.map-controls {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.map-controls h2 {
  font-size: 1.5rem;
  margin: 0;
  color: #2d3748;
}

.map-buttons {
  display: flex;
  gap: 1rem;
}

.map-view-btn {
  background-color: #e2e8f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.map-view-btn.active {
  background-color: #4299e1;
  color: white;
}

.map-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.map-filter label {
  font-size: 0.9rem;
  color: #718096;
}

.map-filter select {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  font-size: 0.9rem;
}

.map-visualization {
  position: relative;
  height: 500px;
}

.map-container,
.detail-map-container {
  width: 100%;
  height: 100%;
  background-color: #f8fafc;
}

.detail-map-header {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

.back-button {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 확대/축소 컨트롤 */
.zoom-controls {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e2e8f0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  background-color: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.zoom-btn.reset {
  font-size: 0.8rem;
}

/* 지역 툴팁 */
.region-tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -100%);
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.region-tooltip::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(0, 0, 0, 0.8);
}

/* 이미지 모달 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-modal-content {
  position: relative;
  max-width: 80%;
  max-height: 90%;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-width: 1000px;
}

.close-modal-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-modal-content img {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.image-info {
  padding: 1.5rem;
  background-color: white;
  overflow-y: auto;
}

.image-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: #2d3748;
}

.image-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #718096;
}

.image-date {
  font-size: 0.9rem;
  color: #a0aec0;
  margin-bottom: 1rem;
}

.image-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.image-tag {
  background-color: #ebf4ff;
  color: #4299e1;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.image-dimensions h4 {
  font-size: 1.1rem;
  margin: 1rem 0 0.5rem;
  color: #2d3748;
}

.dimensions-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dimension-name {
  width: 120px;
  font-size: 0.9rem;
  color: #4a5568;
}

.dimension-bar-container {
  flex-grow: 1;
  height: 8px;
  background-color: #edf2f7;
  border-radius: 4px;
  overflow: hidden;
}

.dimension-bar {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #76b39d);
  border-radius: 4px;
}

.dimension-score {
  width: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4299e1;
  text-align: right;
}

/* 취향 프로필 섹션 */
.preference-profile {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.radar-chart-container {
  height: 300px;
  width: 100%;
}

.profile-insight {
  padding: 1rem;
}

.profile-insight h3 {
  font-size: 1.3rem;
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.profile-insight p {
  line-height: 1.6;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.top-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-name {
  min-width: 120px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
}

.category-bar-container {
  flex-grow: 1;
  height: 8px;
  background-color: #edf2f7;
  border-radius: 4px;
  overflow: hidden;
}

.category-bar {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #76b39d);
  border-radius: 4px;
}

.category-score {
  min-width: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4299e1;
  text-align: right;
}

/* 여행 타임라인 섹션 */
.travel-timeline {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.timeline-container {
  padding: 1rem 0;
}

.timeline-year {
  margin-bottom: 2.5rem;
}

.timeline-year:last-child {
  margin-bottom: 0;
}

.year-label {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 2rem;
}

.year-label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background-color: #4299e1;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #4299e1;
}

.year-trips {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-left: 2.5rem;
  position: relative;
}

.year-trips::before {
  content: "";
  position: absolute;
  left: -20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e2e8f0;
}

.trip-item {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  width: calc(33.333% - 1rem);
  min-width: 250px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-top: 4px solid #4299e1;
  cursor: pointer;
}

.trip-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* 계절별 색상 */
.trip-item.season-spring {
  border-top-color: #48bb78; /* 봄 - 녹색 */
}

.trip-item.season-summer {
  border-top-color: #4299e1; /* 여름 - 파란색 */
}

.trip-item.season-fall {
  border-top-color: #ed8936; /* 가을 - 주황색 */
}

.trip-item.season-winter {
  border-top-color: #a0aec0; /* 겨울 - 회색빛 */
}

.trip-date {
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #718096;
  background-color: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.trip-image-preview {
  height: 150px;
  overflow: hidden;
}

.trip-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.trip-item:hover .trip-image-preview img {
  transform: scale(1.05);
}

.trip-details {
  padding: 1rem;
}

.trip-location {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.trip-season {
  font-size: 0.85rem;
  color: #718096;
}

/* 푸터 */
.footer {
  background-color: #2d3748;
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
  font-size: 0.9rem;
}

/* 지도 관련 스타일 */
:deep(.region) {
  transition: all 0.3s ease;
  cursor: pointer;
}

:deep(.region:hover) {
  filter: brightness(1.1);
}

:deep(.region.selected) {
  stroke-width: 1.5px !important;
  filter: drop-shadow(0 0 5px rgba(74, 137, 220, 0.6));
}

:deep(.travel-image-marker) {
  border: 2px solid white;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3));
}

:deep(.travel-image-marker:hover) {
  transform: scale(1.1) !important;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .statistics-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .radar-chart-container {
    margin: 0 auto;
    max-width: 400px;
  }
  
  .trip-item {
    width: calc(50% - 1rem);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .map-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .map-filter {
    width: 100%;
    justify-content: space-between;
  }
  
  .map-visualization {
    height: 400px;
  }
  
  .trip-item {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .statistics-summary {
    grid-template-columns: 1fr;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
}
</style>