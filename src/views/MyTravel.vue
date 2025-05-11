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
      <!-- 1. 사용자 여행 통계 요약 -->
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

      <!-- 2. 차원별 취향 프로필 -->
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

      <!-- 3. 여행 지도 시각화 -->
      <div class="travel-map-container">
        <div class="map-controls">
          <h2>나의 여행 히트맵</h2>
          <div class="map-filter">
            <label for="year-filter">년도:</label>
            <select id="year-filter" v-model="selectedYear">
              <option value="all">전체</option>
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}년</option>
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

            <!-- 방문 빈도 범례 -->
            <div class="frequency-legend">
              <div class="legend-title">방문 빈도</div>
              <div class="legend-items">
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #2B6CB0"></div>
                  <div class="frequency-label">30회 이상</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #3182CE"></div>
                  <div class="frequency-label">20-29회</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #4299E1"></div>
                  <div class="frequency-label">10-19회</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #63B3ED"></div>
                  <div class="frequency-label">5-9회</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #90CDF4"></div>
                  <div class="frequency-label">1-4회</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #EDF2F7"></div>
                  <div class="frequency-label">미방문</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 이미지 팝업 모달 -->
          <div v-if="selectedImage" class="image-modal" @click.self="closeImageModal">
            <div class="image-modal-content">
              <button class="close-modal-btn" @click="closeImageModal">×</button>
              <img :src="`data:image/jpeg;base64,${selectedImage.image_data}`" alt="여행 이미지">
              <div class="image-info">
                <h3>{{ selectedImage.image_name }}</h3>
                <div class="image-location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            {{ tooltipContent }}
          </div>

          <!-- 색상 범례 - 메인 지도(광역시도)에서만 표시 -->
          <div class="color-legend" v-if="currentMapLevel === 'ctprvn'">
            <div class="legend-title">방문 비율</div>
            <div class="legend-scale">
              <div class="legend-item" v-for="(_, index) in 10" :key="index">
                <div class="legend-color" :style="{ backgroundColor: getColorForPercentage(index * 10) }"></div>
                <div class="legend-label">{{ index * 10 }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 시간별 여행 타임라인 -->
      <div class="travel-timeline">
        <h2 class="section-title">{{ timelineTitle }}</h2>
        <div class="timeline-container">
          <div v-if="filteredTimeline.length === 0" class="no-trips">
            <p>선택한 지역의 여행 기록이 없습니다.</p>
          </div>
          <div v-else v-for="(yearData, yearIndex) in filteredTimeline" :key="yearIndex" class="timeline-year">
            <div class="year-label">{{ yearData.year }}년</div>
            <div class="trips-wrapper">
              <div v-for="(trip, tripIndex) in yearData.trips" :key="tripIndex" class="trip-item"
                :class="getSeasonClass(trip.season)" @click="openImageModal(trip)">
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
    const selectedYear = ref('all');
    const selectedImage = ref(null);
    const currentMapLevel = ref('ctprvn'); // 'ctprvn' 또는 'sig'
    const activeRegion = ref(null); // 활성화된 광역시도 코드
    const activeSig = ref(null); // 활성화된 시군구 코드
    const hoveredRegion = ref(null); // 호버된 지역 코드
    const mousePosition = ref({ x: 0, y: 0 }); // 마우스 위치
    const currentZoomLevel = ref(1); // 현재 줌 레벨

    // 지도 및 레이더 차트 인스턴스
    let mapSvg = null;
    let detailMapSvg = null;
    let mapG = null;
    let detailMapG = null;
    let radarChartSvg = null;

    // 사용자 통계 (실제 구현시 API로 가져와야 함)
    const userStats = reactive({
      totalTrips: 38,
      visitedRegions: 8,
      totalImages: 143,
      topCategory: '자연'
    });

    // 사용자 취향 인사이트
    const userInsight = ref('당신은 자연 경관이 풍부한 여행지를 선호하는 "자연 친화적 탐험가" 스타일입니다. 특히 계절감이 잘 드러나는 여행지에서 휴식을 취하는 것 같네요. 도시보다는 한적한 자연 속에서 여유를 즐기는 여행자입니다.');

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

    // 지역별 방문한 시군구 데이터 (실제로는 API에서 가져와야 함)
    const visitedDistricts = reactive({
      '11': { // 서울
        total: 25, // 총 시군구 수
        visited: ['11110', '11140', '11170', '11200', '11215'],
        visitCounts: { // 방문 빈도
          '11110': 35, // 종로구
          '11140': 28, // 중구
          '11170': 15, // 용산구
          '11200': 8,  // 성동구
          '11215': 3   // 광진구
        }
      },
      '26': { // 부산
        total: 16,
        visited: ['26110', '26140', '26170'],
        visitCounts: {
          '26110': 25, // 중구
          '26140': 18, // 서구
          '26170': 5   // 동구
        }
      },
      '41': { // 경기도
        total: 31,
        visited: ['41110', '41111', '41113', '41115', '41117', '41130', '41150', '41170', '41190'],
        visitCounts: {
          '41110': 12, // 수원시
          '41111': 8,  // 성남시
          '41113': 5,  // 의정부시
          '41115': 2,  // 안양시
          '41117': 18, // 부천시
          '41130': 42, // 광명시
          '41150': 25, // 평택시
          '41170': 55, // 동두천시
          '41190': 33  // 안산시
        }
      },
      '42': { // 강원도
        total: 18,
        visited: ['42110', '42130', '42150', '42170', '42190', '42210', '42230'],
        visitCounts: {
          '42110': 30, // 춘천시
          '42130': 22, // 원주시
          '42150': 18, // 강릉시
          '42170': 14, // 동해시
          '42190': 9,  // 태백시
          '42210': 6,  // 속초시
          '42230': 3   // 삼척시
        }
      },
      '44': { // 충남
        total: 15,
        visited: ['44131', '44150'],
        visitCounts: {
          '44131': 51, // 천안시
          '44150': 3  // 공주시
        }
      },
      '46': { // 전남
        total: 22,
        visited: ['46110', '46130', '46150', '46170', '46230'],
        visitCounts: {
          '46110': 15, // 목포시
          '46130': 12, // 여수시
          '46150': 8,  // 순천시
          '46170': 4,  // 나주시
          '46230': 2   // 광양시
        }
      },
      '47': { // 경북
        total: 23,
        visited: ['47940', '47130', '47150', '47170'],
        visitCounts: {
          '47940': 20, // 울릉군
          '47130': 12, // 경주시
          '47150': 7,  // 김천시
          '47170': 3   // 안동시
        }
      },
      '48': { // 경남
        total: 18,
        visited: ['48120', '48170', '48220'],
        visitCounts: {
          '48120': 10, // 창원시
          '48170': 6,  // 진주시
          '48220': 2   // 통영시
        }
      },
      '50': { // 제주
        total: 2,
        visited: ['50110', '50130'],
        visitCounts: {
          '50110': 45, // 제주시
          '50130': 38  // 서귀포시
        }
      }
    });

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
            region_info: {
              region_code: '50',
              sig_code: '50130'
            },
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
            region_info: {
              region_code: '42',
              sig_code: '42230'
            },
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
            region_info: {
              region_code: '46',
              sig_code: '46170'
            },
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
            region_info: {
              region_code: '26',
              sig_code: '26110'
            },
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
            region_info: {
              region_code: '11',
              sig_code: '11110'
            },
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
            region_info: {
              region_code: '42',
              sig_code: '42210'
            },
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
            region_info: {
              region_code: '47',
              sig_code: '47130'
            },
            dimensions: {
              "Historical/Cultural Value": 0.94,
              "Urban Character": 0.45,
              "Natural Elements": 0.56
            }
          }
        ]
      }
    ]);

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

    // 호버된 지역 방문 통계 계산
    const hoveredRegionStats = computed(() => {
      if (!hoveredRegion.value) return null;

      if (currentMapLevel.value === 'ctprvn') {
        const region = visitedDistricts[hoveredRegion.value];
        if (!region) return null;

        const visitedCount = region.visited.length;
        const totalCount = region.total;
        const percentage = Math.round((visitedCount / totalCount) * 100);

        return {
          visitedCount,
          totalCount,
          percentage
        };
      } else {
        // 시군구 레벨에서는 방문 빈도 표시
        const regionCode = activeRegion.value;
        const region = visitedDistricts[regionCode];
        if (!region || !region.visitCounts) return null;

        const hoveredSigCode = hoveredRegion.value.substring(0, 5);

        // 정확한 방문 여부를 확인하기 위해 방문한 시군구 목록을 먼저 확인
        let isVisited = false;
        let visitCount = 0;

        // 정확히 일치하는 경우
        if (region.visitCounts[hoveredSigCode] !== undefined) {
          isVisited = true;
          visitCount = region.visitCounts[hoveredSigCode];
        } else {
          // 다양한 코드 형식으로 매칭 시도
          for (const visitedCode of region.visited) {
            // 앞 5자리 비교
            if (visitedCode.substring(0, 5) === hoveredSigCode.substring(0, 5)) {
              isVisited = true;
              visitCount = region.visitCounts[visitedCode] || 0;
              break;
            }

            // 시군구 코드 뒷부분(3자리) 비교
            if (visitedCode.substring(2, 5) === hoveredSigCode.substring(2, 5)) {
              isVisited = true;
              visitCount = region.visitCounts[visitedCode] || 0;
              break;
            }
          }
        }

        return {
          isVisited,
          visitCount
        };
      }
    });

    // 툴팁 내용 계산
    const tooltipContent = computed(() => {
      if (!hoveredRegion.value) return '';

      let content = hoveredRegionName.value;

      if (hoveredRegionStats.value) {
        if (currentMapLevel.value === 'ctprvn') {
          const stats = hoveredRegionStats.value;
          content += ` (방문: ${stats.visitedCount}/${stats.totalCount}, ${stats.percentage}%)`;
        } else {
          const stats = hoveredRegionStats.value;
          if (stats.isVisited) {
            content += ` (방문 횟수: ${stats.visitCount}회)`;
          } else {
            content += ' (미방문)';
          }
        }
      }

      return content;
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
      // 모든 여행 목록을 날짜순으로 정렬하기 위해 먼저 평탄화
      let allTrips = [];

      travelTimeline.forEach(yearData => {
        yearData.trips.forEach(trip => {
          // 여행에 연도 정보 추가
          allTrips.push({
            ...trip,
            year: yearData.year
          });
        });
      });

      // 지역 필터 적용
      if (activeRegion.value) {
        // 특정 광역시도가 선택된 경우
        allTrips = allTrips.filter(trip =>
          trip.region_info && trip.region_info.region_code === activeRegion.value
        );

        // 시군구가 선택된 경우 추가 필터링
        if (activeSig.value && currentMapLevel.value === 'sig') {
          allTrips = allTrips.filter(trip =>
            trip.region_info &&
            trip.region_info.sig_code &&
            trip.region_info.sig_code.substring(0, 5) === activeSig.value.substring(0, 5)
          );
        }
      }

      // 년도 필터 적용
      if (selectedYear.value !== 'all') {
        allTrips = allTrips.filter(trip => trip.year === parseInt(selectedYear.value));
      }

      // 연도별로 그룹화
      const tripsByYear = {};

      allTrips.forEach(trip => {
        if (!tripsByYear[trip.year]) {
          tripsByYear[trip.year] = [];
        }
        tripsByYear[trip.year].push(trip);
      });

      // 연도별로 정렬된 배열로 변환 (연도는 내림차순)
      const result = Object.entries(tripsByYear)
        .map(([year, trips]) => ({
          year: parseInt(year),
          trips: trips.sort((a, b) => new Date(b.date) - new Date(a.date)) // 각 연도 내에서는 최신순
        }))
        .sort((a, b) => b.year - a.year); // 연도는 내림차순

      return result;
    });

    // 타임라인 제목 계산
    const timelineTitle = computed(() => {
      if (activeRegion.value) {
        // 광역시도 이름 찾기
        const region = propertiesData.find(r => r.CTPRVN_CD === activeRegion.value);
        const regionName = region ? region.CTP_KOR_NM : '전체';

        if (activeSig.value && currentMapLevel.value === 'sig') {
          // 시군구 이름 찾기
          const sig = sigPropertiesData.find(s => s.SIG_CD === activeSig.value);
          const sigName = sig ? sig.SIG_KOR_NM : '';

          return `${regionName} ${sigName} 여행 타임라인`;
        }

        return `${regionName} 여행 타임라인`;
      }

      return '전체 여행 타임라인';
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

    // 지역 색상 함수 정의 - 10단계 색상 구현
    const getRegionColor = (regionCode) => {
      if (!visitedDistricts[regionCode]) {
        return '#e2e8f0'; // 데이터가 없는 지역은 회색
      }

      // 방문한 시군구 비율 계산 (0 ~ 1)
      const region = visitedDistricts[regionCode];
      const visitedRatio = region.visited.length / region.total;

      return getColorForPercentage(visitedRatio * 100);
    };

    // 비율에 따른 색상 반환 (0~100%)
    const getColorForPercentage = (percentage) => {
      // 10단계 색상 배열 (0% ~ 100%, 파란색 계열 그라데이션)
      const colorScale = [
        '#EBF8FF', // 0-10%
        '#BEE3F8', // 10-20%
        '#90CDF4', // 20-30%
        '#63B3ED', // 30-40%
        '#4299E1', // 40-50%
        '#3182CE', // 50-60%
        '#2B6CB0', // 60-70%
        '#2C5282', // 70-80%
        '#2A4365', // 80-90%
        '#2B6CB0'  // 90-100% - 최고 가중치와 동일한 색상 적용
      ];

      // 비율에 따른 색상 인덱스 계산 (0~9)
      const colorIndex = Math.min(Math.floor(percentage / 10), 9);

      return colorScale[colorIndex];
    };

    // 시군구 방문 빈도에 따른 색상 반환
    const getFrequencyColor = (sigCode, regionCode) => {
      // 시군구 코드의 앞 5자리만 사용 (일관성을 위해)
      let lookupCode = sigCode.substring(0, 5);

      // 로깅 - 디버깅용
      console.log(`[getFrequencyColor] region=${regionCode}, sigCode=${sigCode}, lookupCode=${lookupCode}`);

      // 지역 데이터가 없는 경우
      if (!visitedDistricts[regionCode]) {
        console.log(`[getFrequencyColor] No data for region ${regionCode}`);
        return '#EDF2F7'; // 방문 기록 없음
      }

      // 방문 횟수 데이터 확인
      const visitCounts = visitedDistricts[regionCode].visitCounts;
      if (!visitCounts) {
        console.log(`[getFrequencyColor] No visit counts for region ${regionCode}`);
        return '#EDF2F7';
      }

      // 로깅 - 해당 지역 데이터가 처음 로딩될 때만 실행
      if (!window[`logged_${regionCode}`]) {
        window[`logged_${regionCode}`] = true;
        console.log(`[getFrequencyColor] Available codes for region ${regionCode}:`, Object.keys(visitCounts));
        console.log(`[getFrequencyColor] Visited districts for region ${regionCode}:`, visitedDistricts[regionCode].visited);
      }

      // 방문 횟수 조회
      let visitCount = 0;
      let matched = false;

      // 정확히 일치하는 경우 먼저 확인
      if (visitCounts[lookupCode] !== undefined) {
        visitCount = visitCounts[lookupCode];
        console.log(`[getFrequencyColor] Exact match for ${lookupCode}: ${visitCount} visits`);
        matched = true;
      } else {
        // 가능한 매칭 시도
        for (const visitedCode of visitedDistricts[regionCode].visited) {
          // 코드 앞 5자리 비교
          if (visitedCode.substring(0, 5) === lookupCode.substring(0, 5)) {
            visitCount = visitCounts[visitedCode] || 0;
            console.log(`[getFrequencyColor] Code match: ${lookupCode} -> ${visitedCode}: ${visitCount} visits`);
            matched = true;
            break;
          }

          // 시군구 코드 뒷부분(3자리) 비교
          if (visitedCode.substring(2, 5) === lookupCode.substring(2, 5)) {
            visitCount = visitCounts[visitedCode] || 0;
            console.log(`[getFrequencyColor] District part match: ${lookupCode} -> ${visitedCode}: ${visitCount} visits`);
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        console.log(`[getFrequencyColor] ⚠️ No match found for ${lookupCode} - marking as unvisited`);
        return '#EDF2F7'; // 매치되지 않으면 미방문 색상 반환
      }

      // 방문 횟수에 따른 색상 반환
      console.log(`[getFrequencyColor] Final visit count for ${lookupCode}: ${visitCount}`);

      if (visitCount >= 30) return '#2B6CB0';     // 30회 이상 - 최고 가중치
      if (visitCount >= 20) return '#3182CE';     // 20-29회
      if (visitCount >= 10) return '#4299E1';     // 10-19회
      if (visitCount >= 5) return '#63B3ED';      // 5-9회
      if (visitCount >= 1) return '#90CDF4';      // 1-4회
      return '#EDF2F7';                           // 미방문
    };

    // 시군구 색상 함수 정의
    const getSigColor = (sigCode, regionCode) => {
      // 방문 빈도에 따른 색상 반환
      return getFrequencyColor(sigCode, regionCode);
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

      try {
        // 지도 투영법 설정
        const projection = d3.geoIdentity()
          .reflectY(true)
          .fitSize([width * 0.9, height * 0.9], ctprvnGeoJson);

        // 경로 생성기
        const path = d3.geoPath().projection(projection);

        // 지도 그룹 요소에 변환 적용 - 중앙에 위치시키기
        mapG.attr("transform", `translate(${width * 0.05}, ${height * 0.05})`);

        // 지도 데이터 로드 및 그리기
        const regions = mapG.selectAll('path')
          .data(ctprvnGeoJson.features)
          .enter()
          .append('path')
          .attr('class', 'region')
          .attr('d', path)
          .attr('fill', d => getRegionColor(d.properties.CTPRVN_CD))
          .attr('stroke', '#2D3748') // 검정에 가까운 어두운 회색
          .attr('stroke-width', 0.7) // 적당한 두께로 조정
          .attr('cursor', 'pointer');

        // 히트맵 모드 효과 - 항상 적용
        regions
          .attr('opacity', d => {
            const region = visitedDistricts[d.properties.CTPRVN_CD];
            if (!region) return 0.3;

            // 방문한 시군구 비율에 따른 투명도 계산
            const visitedRatio = region.visited.length / region.total;
            return 0.3 + (visitedRatio * 0.7);
          });

        // 지역 호버 이벤트
        regions
          .on('mouseover', function (event, d) {
            hoveredRegion.value = d.properties.CTPRVN_CD;
            updateMousePosition(event);

            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#a8e6cf') // 주황색에서 파스텔톤 연두색으로 변경
              .attr('stroke', '#1A202C') // 호버 시 더 짙은 검정색
              .attr('stroke-width', 1.2);
          })
          .on('mousemove', updateMousePosition)
          .on('mouseout', function (event, d) {
            hoveredRegion.value = null;

            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', getRegionColor(d.properties.CTPRVN_CD))
              .attr('stroke', '#2D3748') // 원래 경계선 색상으로 복원
              .attr('stroke-width', 0.7);
          })
          .on('click', function (event, d) {
            selectRegion(d.properties.CTPRVN_CD);
          });

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
        };

        window.addEventListener('resize', resizeMap);

        return () => {
          window.removeEventListener('resize', resizeMap);
        };
      } catch (error) {
        console.error("지도 렌더링 중 오류:", error);
      }
    };

    // 지역 선택 함수
    const selectRegion = (regionCode) => {
      if (activeRegion.value === regionCode) {
        resetToCtprvnMap();
        return;
      }

      activeRegion.value = regionCode;
      currentMapLevel.value = 'sig';

      // 선택한 지역의 방문 데이터 로깅
      logRegionVisitData(regionCode);

      // 시군구 지도 렌더링
      nextTick(() => {
        renderDetailMap(regionCode);
      });
    };

    // 지역 방문 데이터 로깅 (디버깅용)
    const logRegionVisitData = (regionCode) => {
      const region = visitedDistricts[regionCode];
      if (!region) {
        console.log(`No data for region ${regionCode}`);
        return;
      }

      console.log(`Region ${regionCode} data:`);
      console.log(`- Total districts: ${region.total}`);
      console.log(`- Visited districts: ${region.visited.length}`);
      console.log(`- Visit counts:`, region.visitCounts);
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
    };

    // 이미지 모달 열기
    const openImageModal = (image) => {
      selectedImage.value = image;
    };

    // 이미지 모달 닫기
    const closeImageModal = () => {
      selectedImage.value = null;
    };

    // 시군구 지도 렌더링 함수
    const renderDetailMap = (regionCode) => {
      if (!detailMapContainer.value) return;

      console.log(`=== Rendering detail map for region: ${regionCode} ===`);

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

      // 지도 그룹 요소
      detailMapG = detailMapSvg.append('g')
        .attr('class', 'map-group')
        .attr('filter', 'url(#dropshadow-detail)');

      try {
        // 지역 코드로 시군구 필터링
        const filteredFeatures = sigGeoJson.features.filter(feature => {
          if (!feature.properties || !feature.properties.SIG_CD) return false;

          // 시군구 코드 앞 두 자리가 광역시도 코드와 일치하는지 확인
          const sigCodePrefix = feature.properties.SIG_CD.substring(0, 2);
          return sigCodePrefix === regionCode;
        });

        if (filteredFeatures.length === 0) {
          console.log(`[renderDetailMap] No district data found for region ${regionCode}`);
          return;
        }

        console.log(`[renderDetailMap] Found ${filteredFeatures.length} districts for region ${regionCode}`);

        // 방문 데이터 확인
        const regionData = visitedDistricts[regionCode];
        if (regionData && regionData.visitCounts) {
          console.log(`[renderDetailMap] Visit counts for region ${regionCode}:`, regionData.visitCounts);
        }

        // 각 시군구에 대한 코드 매핑 과정을 자세히 로깅
        console.log(`[renderDetailMap] District code mapping for region ${regionCode}:`);
        filteredFeatures.forEach(feature => {
          const sigCode = feature.properties.SIG_CD;
          const sigName = feature.properties.SIG_KOR_NM || '';

          console.log(`  - District: ${sigCode}, Name: ${sigName}`);

          // 방문 정보 확인
          if (regionData && regionData.visitCounts) {
            const keys = Object.keys(regionData.visitCounts);
            let matched = false;

            // 다양한 방법으로 매칭 시도
            // 1. 정확한 코드 매칭
            if (regionData.visitCounts[sigCode] !== undefined) {
              console.log(`    ✅ Exact match: ${sigCode} - ${regionData.visitCounts[sigCode]} visits`);
              matched = true;
            }
            // 2. 앞 5자리 매칭
            else if (sigCode.length > 5 && regionData.visitCounts[sigCode.substring(0, 5)] !== undefined) {
              console.log(`    ✅ 5-digit match: ${sigCode} -> ${sigCode.substring(0, 5)} - ${regionData.visitCounts[sigCode.substring(0, 5)]} visits`);
              matched = true;
            }
            // 3. 다양한 코드 형식 매칭
            else {
              for (const key of keys) {
                if (key.substring(0, 2) === regionCode &&
                  (key.substring(2, 5) === sigCode.substring(2, 5) ||
                    sigCode.includes(key.substring(2)))) {
                  console.log(`    ✅ Partial match: ${sigCode} -> ${key} - ${regionData.visitCounts[key]} visits`);
                  matched = true;
                  break;
                }
              }
            }

            if (!matched) {
              console.log(`    ❌ No match found for ${sigCode}`);
            }
          }
        });

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

        // 지도 데이터 로드 및 그리기
        const sigPaths = detailMapG.selectAll('path')
          .data(filteredFeatures)
          .enter()
          .append('path')
          .attr('class', 'region')
          .attr('d', path)
          .attr('fill', d => {
            const sigCode = d.properties.SIG_CD;
            const sigName = d.properties.SIG_KOR_NM || '';

            // 방문 여부 확인
            const regionData = visitedDistricts[regionCode];
            let isVisited = false;
            let visitCount = 0;

            if (regionData && regionData.visitCounts) {
              // 정확히 일치하는 코드 확인
              const lookupCode = sigCode.substring(0, 5);

              if (regionData.visitCounts[lookupCode] !== undefined) {
                isVisited = true;
                visitCount = regionData.visitCounts[lookupCode];
              } else {
                // 방문 코드 목록에서 매칭 확인
                for (const visitedCode of regionData.visited) {
                  // 코드 앞 5자리 비교
                  if (visitedCode.substring(0, 5) === lookupCode ||
                    // 시군구 코드(3자리) 비교
                    visitedCode.substring(2, 5) === lookupCode.substring(2, 5)) {
                    isVisited = true;
                    visitCount = regionData.visitCounts[visitedCode];
                    break;
                  }
                }
              }
            }

            // 색상 결정
            let color = '#EDF2F7'; // 기본 미방문 색상

            if (isVisited) {
              if (visitCount >= 30) color = '#2B6CB0';     // 30회 이상 - 최고 가중치
              else if (visitCount >= 20) color = '#3182CE';     // 20-29회
              else if (visitCount >= 10) color = '#4299E1';     // 10-19회
              else if (visitCount >= 5) color = '#63B3ED';      // 5-9회
              else if (visitCount >= 1) color = '#90CDF4';      // 1-4회
            }

            console.log(`[renderDetailMap] ${sigName} (${sigCode}): ${isVisited ? `방문 ${visitCount}회` : '미방문'} - 색상: ${color}`);

            return color;
          })
          .attr('stroke', '#2D3748') // 검정에 가까운 어두운 회색
          .attr('stroke-width', 0.7) // 적당한 두께로 조정
          .attr('cursor', 'pointer');

        // 시군구 호버 이벤트
        sigPaths
          .on('mouseover', function (event, d) {
            hoveredRegion.value = d.properties.SIG_CD;
            updateMousePosition(event);

            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#a8e6cf') // 주황색에서 파스텔톤 연두색으로 변경
              .attr('stroke', '#1A202C') // 호버 시 더 짙은 검정색
              .attr('stroke-width', 1.2);
          })
          .on('mousemove', updateMousePosition)
          .on('mouseout', function (event, d) {
            hoveredRegion.value = null;

            // 선택된 시군구는 강조 표시 유지
            if (activeSig.value === d.properties.SIG_CD) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', '#a8e6cf') // 주황색에서 파스텔톤 연두색으로 변경
                .attr('stroke', '#1A202C') // 호버 시 더 짙은 검정색
                .attr('stroke-width', 1.2);
            } else {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', getSigColor(d.properties.SIG_CD, activeRegion.value))
                .attr('stroke', '#2D3748') // 원래 경계선 색상으로 복원
                .attr('stroke-width', 0.7);
            }
          })
          .on('click', function (event, d) {
            selectSig(d.properties.SIG_CD);
          });

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
        console.error("[renderDetailMap] Error rendering district map:", error);
      }
    };

    // 시군구 지도 선택 상태 업데이트
    const updateDetailMapSelection = () => {
      if (!detailMapG) return;

      // 모든 시군구 선택 상태 초기화
      detailMapG.selectAll('.region')
        .each(function (d) {
          const selected = activeSig.value === d.properties.SIG_CD;

          d3.select(this)
            .classed('selected', selected)
            .transition()
            .duration(200)
            .attr('fill', selected ? '#a8e6cf' : getSigColor(d.properties.SIG_CD, activeRegion.value)) // 선택 시 파스텔톤 연두색, 아니면 원래 색상
            .attr('stroke', selected ? '#1A202C' : '#2D3748')
            .attr('stroke-width', selected ? 1.2 : 0.7);
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
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

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
        .attr('x2', (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
        .style('stroke', '#e2e8f0')
        .style('stroke-width', '1px');

      // 축 라벨
      axisGrid.append('text')
        .attr('class', 'legend')
        .attr('text-anchor', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          if (Math.abs(angle) < 0.1 || Math.abs(angle - Math.PI) < 0.1) return 'middle';
          return angle > 0 && angle < Math.PI ? 'start' : 'end';
        })
        .attr('dy', '0.35em')
        .attr('x', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelDistance = radius * 1.15;
          return labelDistance * Math.cos(angle);
        })
        .attr('y', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelDistance = radius * 1.15;
          return labelDistance * Math.sin(angle);
        })
        .text(d => getCategoryName(d))
        .style('font-size', '0.7rem')
        .style('fill', '#4a5568');

      // 데이터 영역 그리기
      const dataPoints = dimensions.map((dim, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const value = dimensionScores[dim];
        return {
          x: radius * value * Math.cos(angle),
          y: radius * value * Math.sin(angle),
          value
        };
      });

      // 데이터 영역 경로
      const radarAreaPath = radarChartSvg.append('path')
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
        .style('stroke-width', '2px')
        // Add hover events directly during creation to avoid unreachable code
        .on('mouseover', function () {
          d3.select(this).style('fill', 'rgba(66, 153, 225, 0.8)');
        })
        .on('mouseout', function () {
          d3.select(this).style('fill', 'rgba(66, 153, 225, 0.6)');
        });

      // Use radarAreaPath to make sure it's not unused
      radarAreaPath
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

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
    watch([selectedYear], () => {
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
      selectedYear,
      selectedImage,
      currentMapLevel,
      activeRegion,
      activeSig,
      hoveredRegion,
      hoveredRegionName,
      hoveredRegionStats,
      tooltipContent,
      tooltipStyle,
      userStats,
      userInsight,
      topCategories,
      filteredTimeline,
      availableYears,
      timelineTitle,

      // 메서드
      selectRegion,
      resetToCtprvnMap,
      openImageModal,
      closeImageModal,
      getSeasonClass,
      getSeasonName,
      formatDate,
      formatShortDate,
      getCategoryName,
      updateMousePosition,
      getColorForPercentage
    };
  }
};
</script>

<style scoped>
/* dimension-bar 관련 스타일을 직접 정의 (충돌 방지) */
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

/* 여행 타임라인 */
.travel-timeline {
  margin-bottom: 60px;
}

.timeline-container {
  background-color: #f7fafc;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.timeline-year {
  margin-bottom: 30px;
}

.timeline-year:last-child {
  margin-bottom: 0;
}

.year-label {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #2D3748;
  padding-bottom: 8px;
  border-bottom: 2px solid #E2E8F0;
}

.trips-wrapper {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 20px;
  padding: 10px 0;
  scroll-behavior: smooth;
}

.trip-item {
  flex: 0 0 280px;
  border-radius: 12px;
  background-color: white;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.trip-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.trip-date {
  padding: 10px 15px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  background-color: #f3f4f6;
}

.trip-image-preview {
  height: 160px;
  overflow: hidden;
}

.trip-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.trip-item:hover .trip-image-preview img {
  transform: scale(1.05);
}

.trip-details {
  padding: 15px;
}

.trip-location {
  font-weight: 600;
  margin-bottom: 5px;
}

.trip-season {
  font-size: 0.85rem;
  color: #718096;
}

/* 계절별 색상 테마 */
.season-spring {
  border-top: 4px solid #FC8181;
}

.season-summer {
  border-top: 4px solid #4FD1C5;
}

.season-fall {
  border-top: 4px solid #F6AD55;
}

.season-winter {
  border-top: 4px solid #63B3ED;
}

.no-trips {
  padding: 30px;
  text-align: center;
  color: #718096;
  font-size: 1.1rem;
}

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
  height: 320px;
  background-image: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1470');
  background-size: cover;
  background-position: center;
  margin-bottom: 0;
  padding-top: 7rem;
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
  color: #4299e1;
  /* LOG:O 브랜드 파란색 */
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

/* 색상 범례 */
.color-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.legend-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2d3748;
  text-align: center;
}

.legend-scale {
  display: flex;
  gap: 1px;
  height: 25px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.legend-color {
  width: 20px;
  height: 15px;
}

.legend-label {
  font-size: 0.7rem;
  color: #4a5568;
  margin-top: 4px;
}

/* 방문율 표시를 위한 추가 특정 색상 */
.legend-item:first-child .legend-label {
  margin-left: 0;
}

.legend-item:last-child .legend-label {
  margin-right: 0;
}

/* 방문 빈도 범례 */
.frequency-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-width: 160px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.frequency-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.frequency-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.frequency-label {
  font-size: 0.8rem;
  color: #4a5568;
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
  border-top-color: #48bb78;
  /* 봄 - 녹색 */
}

.trip-item.season-summer {
  border-top-color: #4299e1;
  /* 여름 - 파란색 */
}

.trip-item.season-fall {
  border-top-color: #ed8936;
  /* 가을 - 주황색 */
}

.trip-item.season-winter {
  border-top-color: #a0aec0;
  /* 겨울 - 회색빛 */
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