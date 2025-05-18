<!-- eslint-disable -->
<template>
  <div class="my-travel">
    <!-- 헤더 -->
    <Header 
      :showHero="true"
      heroImageSrc="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1470"
      heroTitle="내 여행 발자취"
      heroSubtitle="당신의 특별했던 순간들을 한눈에 확인하세요"
      heroHeight="320px"
    />

    <!-- 메인 콘텐츠 -->
    <div class="content-wrapper">
      <!-- 1. 사용자 여행 통계 요약 -->
      <div class="statistics-summary">
        <div class="statistic-card">
          <div class="statistic-value">{{ totalTripsCount }}</div>
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

      <!-- 새 여행 계획 입력 배너 -->
      <div v-if="showNewTripForm" class="new-trip-form-overlay">
        <div class="new-trip-form-banner">
          <div class="banner-content">
            <div class="banner-header">
              <h3>새 여행 계획 만들기</h3>
              <button class="close-banner-btn" @click="showNewTripForm = false">×</button>
            </div>
            
            <div class="trip-info-form">
              <div class="trip-info-row">
                <div class="trip-info-field">
                  <label for="tripTitle">여행 제목</label>
                  <input type="text" id="tripTitle" v-model="newTrip.title" placeholder="여행 제목을 입력하세요">
                </div>
                <div class="trip-info-field">
                  <label for="destination">주요 목적지</label>
                  <input type="text" id="destination" v-model="newTrip.destination" placeholder="예: 서울, 제주도, 부산">
                </div>
                <div class="trip-info-field">
                  <label for="budget">총 예산</label>
                  <div class="input-with-icon">
                    <span class="input-icon">₩</span>
                    <input type="number" id="budget" v-model="newTrip.budget" placeholder="0">
                  </div>
                </div>
              </div>
              
              <div class="trip-info-row">
                <div class="trip-info-field">
                  <label for="startDate">출발일</label>
                  <input type="date" id="startDate" v-model="newTrip.startDate" class="date-input">
                </div>
                <div class="trip-info-field">
                  <label for="endDate">도착일</label>
                  <input type="date" id="endDate" v-model="newTrip.endDate" class="date-input">
                </div>
                <div class="trip-info-field">
                  <label for="tripDuration">여행 기간</label>
                  <input type="text" id="tripDuration" :value="tripDuration" disabled>
                </div>
              </div>
              
              <div class="trip-info-row">
                <div class="trip-info-field trip-notes">
                  <label for="notes">여행 메모</label>
                  <textarea id="notes" v-model="newTrip.notes" placeholder="여행 준비 사항, 기대 등을 자유롭게 작성하세요"></textarea>
                </div>
              </div>
              
              <div class="banner-actions">
                <button class="submit-trip-btn" @click="createNewTrip">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  여행 계획 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 취향 프로필 섹션 -->
      <div class="preference-profile section-container">
        <div class="section-header">
          <h2 class="section-title">내 여행 취향 프로필</h2>
        </div>
        <div class="profile-content">
          <div class="radar-chart-section">
            <div class="radar-chart-container" ref="radarChartContainer">
              <!-- 레이더 차트가 렌더링 될 컨테이너 -->
            </div>
          </div>
          <div class="profile-insight">
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

      <!-- 3. 여행 히트맵 섹션 -->
      <div class="travel-map-container section-container">
        <div class="section-header">
          <h2 class="section-title">나의 여행 히트맵</h2>
        </div>
        
        <!-- 지도 시각화 영역 -->
        <div class="map-visualization">
          <!-- 랭킹 정보 패널 -->
          <div class="ranking-panel">
            <div class="ranking-header">
              <h3>{{ currentMapLevel === 'ctprvn' ? '지역별 방문 랭킹' : '시군구별 방문 랭킹' }}</h3>
            </div>
            <div class="ranking-list">
              <!-- 광역시도 랭킹 -->
              <div v-if="currentMapLevel === 'ctprvn'">
                <div v-if="regionRankings.length === 0" class="no-ranking-data">
                  방문 데이터가 없습니다
                </div>
                <div v-else v-for="(region, index) in regionRankings" :key="index" class="ranking-item">
                  <div class="ranking-position">{{ index + 1 }}위</div>
                  <div class="ranking-name">{{ region.name }}</div>
                  <div class="ranking-score">{{ region.percentage }}%</div>
                </div>
              </div>
              
              <!-- 시군구 랭킹 -->
              <div v-else-if="currentMapLevel === 'sig' && activeRegion">
                <div v-if="sigRankings.length === 0" class="no-ranking-data">
                  방문 데이터가 없습니다
                </div>
                <div v-else v-for="(sig, index) in sigRankings" :key="index" class="ranking-item">
                  <div class="ranking-position">{{ index + 1 }}위</div>
                  <div class="ranking-name">{{ sig.name }}</div>
                  <div class="ranking-score">{{ sig.count }}회</div>
                </div>
              </div>
            </div>
          </div>
          
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

      <!-- 4. 여행 타임라인 섹션 -->
      <div class="travel-timeline section-container">
        <div class="section-header">
          <h2 class="section-title">{{ timelineTitle }}</h2>
        </div>
        <div class="timeline-container">
          <div v-if="filteredTimeline.length === 0" class="no-trips">
            <p>선택한 지역의 여행 기록이 없습니다.</p>
          </div>
          <div v-else v-for="(yearData, yearIndex) in filteredTimeline" :key="yearIndex" class="timeline-year">
            <div class="year-label">{{ yearData.year }}년</div>
            <div class="trips-wrapper">
              <div v-for="(trip, tripIndex) in yearData.trips" :key="tripIndex" class="trip-item"
                :class="getSeasonClass(trip.season)" @click="navigateToPlan()">
                <div class="trip-date">{{ formatShortDate(trip.date) }}</div>
                <div class="trip-image-preview">
                  <img :src="`data:image/jpeg;base64,${trip.image_data}`" :alt="trip.location">
                </div>
                <div class="trip-details">
                  <div class="trip-location">{{ trip.location }}</div>
                  <div class="trip-season">{{ getSeasonName(trip.season) }}</div>
                </div>
              </div>
              
              <!-- Add the New Trip button at the end of the first (most recent) year's trips -->
              <div v-if="yearIndex === 0" class="trip-item new-trip-item" @click="showNewTripForm = true">
                <div class="new-trip-content">
                  <div class="plus-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  </div>
                  <div class="new-trip-text">새 여행 계획하기</div>
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
import Chart from 'chart.js/auto';
import Header from '@/components/Header.vue';
import ctprvnGeoJson from '@/assets/ctprvn.json';
import propertiesData from '@/assets/extracted_ctprvn.json';
import sigGeoJson from '@/assets/sig.json';
import sigPropertiesData from '@/assets/extracted_properties.json';
import { useRouter } from 'vue-router';
import { getUserAverageTravelPreferences, getUserTravelStatistics } from '@/services/api';

export default {
  name: 'MyTravel',

  components: {
    Header
  },

  setup() {
    const router = useRouter();
    
    // 새 여행 계획 배너 상태
    const showNewTripForm = ref(false);
    const newTrip = reactive({
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      notes: ''
    });
    
    // 여행 기간 계산
    const tripDuration = computed(() => {
      if (!newTrip.startDate || !newTrip.endDate) return '';
      
      const start = new Date(newTrip.startDate);
      const end = new Date(newTrip.endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
      
      // 날짜 차이 계산
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const nights = diffDays;
      const days = diffDays + 1;
      
      return `${nights}박 ${days}일`;
    });
    
    // 컴포넌트 마운트 시 초기 날짜 설정
    onMounted(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // YYYY-MM-DD 형식으로 변환
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      newTrip.startDate = formatDate(today);
      newTrip.endDate = formatDate(tomorrow);
    });
    
    // 새 여행 생성
    const createNewTrip = () => {
      // 입력 데이터 검증
      if (!newTrip.title || !newTrip.destination || !newTrip.startDate || !newTrip.endDate || !newTrip.budget) {
        alert("필수 정보를 모두 입력해주세요.");
        return;
      }
      
      // 날짜 검증
      const startDate = new Date(newTrip.startDate);
      const endDate = new Date(newTrip.endDate);
      
      if (endDate < startDate) {
        alert("도착일은 출발일보다 빠를 수 없습니다.");
        return;
      }
      
      // 예산 검증
      if (parseInt(newTrip.budget) <= 0) {
        alert("예산은 0보다 커야 합니다.");
        return;
      }
      
      // 입력된 정보를 콘솔에 출력
      console.log('새 여행 계획 정보:', {
        title: newTrip.title,
        destination: newTrip.destination,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        budget: parseInt(newTrip.budget),
        notes: newTrip.notes,
        duration: tripDuration.value
      });
      
      // 계획 페이지로 이동
      router.push('/plan');
      
      // 폼 숨기기
      showNewTripForm.value = false;
    };

    // 상태 변수 선언
    const mapContainer = ref(null);
    const detailMapContainer = ref(null);
    const radarChartContainer = ref(null);
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
    let radarChart = ref(null); // Chart.js 인스턴스

    // 사용자 통계 (실제 구현시 API로 가져와야 함)
    const userStats = reactive({
      totalTrips: 0,
      visitedRegions: 0,
      totalImages: 0,
      topCategory: '' // API로부터 가져올 예정
    });

    // 사용자 취향 인사이트 메시지
    const dimensionInsights = {
      "Natural Elements": "당신은 자연 경관이 풍부한 여행지를 선호하는 '자연 친화적 탐험가'입니다. 특히 산, 숲, 자연 공원이 있는 곳에서 휴식을 취하며 힐링을 추구하는 성향이 강합니다.",
      "Urban Character": "당신은 활기찬 도시의 매력에 이끌리는 '도시 탐험가'입니다. 현대적인 건축물, 도시 특유의 에너지, 다양한 문화를 경험할 수 있는 곳을 즐기는 여행자입니다.",
      "Water Features": "당신은 '물의 여행자'로서 바다, 호수, 강과 같은 수공간이 있는 여행지에 끌립니다. 물가에서의 평온함과 아름다운 수변 경관을 감상하며 마음의 안정을 찾는 편입니다.",
      "Seasonal Appeal": "당신은 '계절의 마법사'로 특정 계절에 빛나는 여행지를 찾아다니는 여행자입니다. 벚꽃이 흐드러지는 봄, 단풍이 물드는 가을 등 계절에 따라 변화하는 풍경을 감상하기 좋아합니다.",
      "Relaxation Potential": "당신은 '휴식 추구자'로 여행을 통해 일상의 스트레스를 해소하고 진정한 휴식을 찾는 여행자입니다. 평화롭고 조용한 분위기에서 마음의 여유를 찾는 것을 중요시합니다.",
      "Romantic Atmosphere": "당신은 '로맨티스트'로 감성적이고 로맨틱한 분위기의 여행지를 선호합니다. 낭만적인 풍경, 아름다운 일몰, 특별한 순간을 만들 수 있는 장소에서 영감을 받는 여행자입니다.",
      "Activity Opportunities": "당신은 '액티브 어드벤처러'로 다양한 활동과 체험을 즐길 수 있는 곳을 찾아다닙니다. 하이킹, 수상스포츠, 레저활동 등 적극적으로 참여하며 에너지 넘치는 여행을 즐깁니다.",
      "Historical/Cultural Value": "당신은 '문화 탐험가'로 역사적 유적지, 박물관, 전통문화를 경험할 수 있는 곳을 선호합니다. 지역의 역사와 이야기에 관심이 많으며 문화적 가치가 높은 여행을 추구합니다.",
      "Food Experience": "당신은 '미식 여행가'로 맛있는 음식과 로컬 요리를 찾아다니는 여행자입니다. 현지 식문화를 체험하고 특색있는 맛집을 발견하는 것이 여행의 큰 즐거움입니다.",
      "Shopping Potential": "당신은 '쇼핑 애호가'로 특별한 상품과 기념품을 찾는 쇼핑 경험을 중요시합니다. 현지 시장, 특색있는 상점가, 브랜드 아울렛 등 쇼핑 명소를 방문하는 것을 즐기는 여행자입니다."
    };

    // 사용자 취향 인사이트
    const userInsight = ref('');

    // 차원 데이터 (초기 더미 데이터로 설정)
    const dimensionScores = reactive({
      "Natural Elements": 0,
      "Urban Character": 0,
      "Water Features": 0,
      "Seasonal Appeal": 0,
      "Relaxation Potential": 0,
      "Romantic Atmosphere": 0,
      "Activity Opportunities": 0,
      "Historical/Cultural Value": 0,
      "Food Experience": 0,
      "Shopping Potential": 0
    });

    // 사용자 데이터 로드 함수
    const loadUserData = async () => {
      try {
        // 사용자 ID 1의 데이터 가져오기 (고정)
        const userData = await getUserAverageTravelPreferences(1);
        
        // 차원 이름 배열
        const dimensionNames = [
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
        
        // 차원 데이터 업데이트
        dimensionNames.forEach((name, index) => {
          dimensionScores[name] = userData.avgVector[index];
        });
        
        // 최고 점수의 차원 찾기
        const maxDimension = dimensionNames.reduce((max, dim) => 
          dimensionScores[dim] > dimensionScores[max] ? dim : max, dimensionNames[0]);
        
        // 사용자 통계의 최고 카테고리 업데이트
        userStats.topCategory = dimensionTranslations[maxDimension];
        
        // 사용자 인사이트 메시지 업데이트
        userInsight.value = dimensionInsights[maxDimension];
        
        console.log('사용자 데이터 로드 완료:', dimensionScores);
        
        // 레이더 차트 다시 그리기
        nextTick(() => {
          renderRadarChart();
        });
        
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
      }
    };

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

    // 지역별 방문한 시군구 데이터
    const travelStats = ref({
      regions: {},
      totalVisitedRegions: 0,
      totalVisitedSigs: 0,
      totalVisits: 0
    });

    // 사용자 여행 데이터 로드 함수
    const loadUserTravelData = async () => {
      try {
        // 사용자 ID 1의 여행 통계 데이터 가져오기 (고정)
        const stats = await getUserTravelStatistics(1);
        
        // 데이터 상태 업데이트
        travelStats.value = stats;
        
        // 사용자 통계 업데이트
        userStats.totalTrips = stats.totalVisits;
        userStats.visitedRegions = stats.totalVisitedRegions;
        userStats.totalImages = stats.totalVisits; // 방문 = 이미지 인증으로 가정
        
        console.log('사용자 여행 데이터 로드 완료:', stats);
        
        // 데이터 로드 후 지도 다시 그리기
        if (currentMapLevel.value === 'ctprvn') {
          nextTick(() => {
            renderMap();
          });
        } else if (currentMapLevel.value === 'sig' && activeRegion.value) {
          nextTick(() => {
            renderDetailMap(activeRegion.value);
          });
        }
      } catch (error) {
        console.error('사용자 여행 데이터 로드 오류:', error);
      }
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
            date: '2024-06-22',
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
          },
          {
            id: 6,
            date: '2024-04-11',
            location: '경기도 이천시',
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
          },
          {
            id: 7,
            date: '2024-02-01',
            location: '서울 북촌',
            season: 'winter',
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
            id: 8,
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
            id: 9,
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
        const regionCode = hoveredRegion.value;
        const region = travelStats.value.regions[regionCode];
        
        if (!region) return {
          visitedCount: 0,
          totalCount: 0,
          percentage: 0
        };

        // 시군구 전체 수 (실제 데이터가 없으므로 기존 로직 사용)
        let totalCount = 0;
        const regionData = propertiesData.find(r => r.CTPRVN_CD === regionCode);
        if (regionData) {
          // 시군구 데이터에서 해당 지역의 시군구 수 계산
          totalCount = sigGeoJson.features.filter(f => 
            f.properties && f.properties.SIG_CD && 
            f.properties.SIG_CD.substring(0, 2) === regionCode
          ).length;
        }
        
        const visitedCount = region.visitedSigs || 0;
        const percentage = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

        return {
          visitedCount,
          totalCount,
          percentage
        };
      } else {
        // 시군구 레벨에서는 방문 빈도 표시
        const regionCode = activeRegion.value;
        const hoveredSigCode = hoveredRegion.value.substring(0, 5);
        
        const region = travelStats.value.regions[regionCode];
        if (!region) return { isVisited: false, visitCount: 0 };
        
        // 방문한 시군구 확인
        let isVisited = false;
        let visitCount = 0;
        
        // 시군구 데이터 확인
        if (region.sigs && region.sigs[hoveredSigCode]) {
          isVisited = true;
          visitCount = region.sigs[hoveredSigCode].count || 0;
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

      // 연도 필터 제거: 이제 연도로 필터링하지 않음

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
          trips: trips.sort((a, b) => new Date(a.date) - new Date(b.date)) // 각 연도 내에서는 오름차순(1월부터)
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
      const regionData = travelStats.value.regions[regionCode];
      if (!regionData) {
        return '#e2e8f0'; // 데이터가 없는 지역은 회색
      }

      // 해당 지역의 시군구 수 계산 (실제 시군구 수)
      const totalSigs = sigGeoJson.features.filter(f => 
        f.properties && f.properties.SIG_CD && 
        f.properties.SIG_CD.substring(0, 2) === regionCode
      ).length;
      
      // 방문한 시군구 비율 계산 (0~1 사이 값)
      const visitedRatio = totalSigs > 0 ? (regionData.visitedSigs / totalSigs) : 0;
      
      // 비율에 따른 색상 반환 (0~100%)
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
        '#1A365D'  // 90-100%
      ];

      // 비율에 따른 색상 인덱스 계산 (0~9)
      const colorIndex = Math.min(Math.floor(percentage / 10), 9);

      return colorScale[colorIndex];
    };

    // 시군구 방문 빈도에 따른 색상 반환
    const getFrequencyColor = (sigCode, regionCode) => {
      // 시군구 코드의 앞 5자리만 사용 (일관성을 위해)
      let lookupCode = sigCode.substring(0, 5);
      
      // 지역 데이터가 없는 경우
      if (!travelStats.value.regions[regionCode]) {
        return '#EDF2F7'; // 방문 기록 없음
      }
      
      // 시군구 방문 데이터 확인
      const region = travelStats.value.regions[regionCode];
      if (!region.sigs || !region.sigs[lookupCode]) {
        return '#EDF2F7'; // 미방문
      }
      
      // 방문 횟수 가져오기
      const visitCount = region.sigs[lookupCode].count || 0;
      
      // 방문 횟수에 따른 색상 반환
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
            const region = travelStats.value.regions[d.properties.CTPRVN_CD];
            if (!region) return 0.3;

            // 해당 지역의 시군구 수 계산
            const totalSigs = sigGeoJson.features.filter(f => 
              f.properties && f.properties.SIG_CD && 
              f.properties.SIG_CD.substring(0, 2) === d.properties.CTPRVN_CD
            ).length;
            
            // 방문 시군구 비율에 따른 투명도 계산 (0.3~1.0 범위)
            const visitedRatio = totalSigs > 0 ? (region.visitedSigs / totalSigs) : 0;
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
      const region = travelStats.value.regions[regionCode];
      if (!region) {
        console.log(`No data for region ${regionCode}`);
        return;
      }

      console.log(`Region ${regionCode} data:`);
      console.log(`- Total districts: ${region.total}`);
      console.log(`- Visited districts: ${region.visitedSigs}`);
      console.log(`- Visit counts:`, region.sigs);
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

    // 여행 계획 페이지로 이동하는 함수
    const navigateToPlan = () => {
      router.push('/plan');
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
        const regionData = travelStats.value.regions[regionCode];
        if (regionData && regionData.sigs) {
          console.log(`[renderDetailMap] Visit counts for region ${regionCode}:`, regionData.sigs);
        }

        // 각 시군구에 대한 코드 매핑 과정을 자세히 로깅
        console.log(`[renderDetailMap] District code mapping for region ${regionCode}:`);
        filteredFeatures.forEach(feature => {
          const sigCode = feature.properties.SIG_CD;
          const sigName = feature.properties.SIG_KOR_NM || '';

          console.log(`  - District: ${sigCode}, Name: ${sigName}`);

          // 방문 정보 확인
          if (regionData && regionData.sigs) {
            const keys = Object.keys(regionData.sigs);
            let matched = false;

            // 다양한 방법으로 매칭 시도
            // 1. 정확한 코드 매칭
            if (regionData.sigs[sigCode] !== undefined) {
              console.log(`    ✅ Exact match: ${sigCode} - ${regionData.sigs[sigCode]} visits`);
              matched = true;
            }
            // 2. 앞 5자리 매칭
            else if (sigCode.length > 5 && regionData.sigs[sigCode.substring(0, 5)] !== undefined) {
              console.log(`    ✅ 5-digit match: ${sigCode} -> ${sigCode.substring(0, 5)} - ${regionData.sigs[sigCode.substring(0, 5)]} visits`);
              matched = true;
            }
            // 3. 다양한 코드 형식 매칭
            else {
              for (const key of keys) {
                if (key.substring(0, 2) === regionCode &&
                  (key.substring(2, 5) === sigCode.substring(2, 5) ||
                    sigCode.includes(key.substring(2)))) {
                  console.log(`    ✅ Partial match: ${sigCode} -> ${key} - ${regionData.sigs[key]} visits`);
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
            const regionData = travelStats.value.regions[regionCode];
            let isVisited = false;
            let visitCount = 0;

            if (regionData && regionData.sigs) {
              // 정확히 일치하는 코드 확인
              const lookupCode = sigCode.substring(0, 5);

              if (regionData.sigs[lookupCode]) {
                isVisited = true;
                visitCount = regionData.sigs[lookupCode].count || 0;
              } else {
                // 코드 매칭 시도 (다른 코드 형식 처리)
                const sigKeys = Object.keys(regionData.sigs);
                for (const sigKey of sigKeys) {
                  // 앞 5자리가 같거나, 뒷부분 3자리가 동일한 경우
                  if (sigKey.substring(0, 5) === lookupCode.substring(0, 5) ||
                      sigKey.substring(2, 5) === lookupCode.substring(2, 5)) {
                    isVisited = true;
                    visitCount = regionData.sigs[sigKey].count || 0;
                    break;
                  }
                }
              }
            }

            // 색상 결정
            let color = '#EDF2F7'; // 기본 미방문 색상

            if (isVisited && visitCount) {
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

      // 기존 차트가 있다면 파괴
      if (radarChart.value) {
        radarChart.value.destroy();
      }

      // 데이터 준비
      const dimensions = Object.keys(dimensionScores);
      const dimensionLabels = dimensions.map(d => getCategoryName(d));
      const dimensionValues = dimensions.map(d => dimensionScores[d]);

      // 캔버스 컨텍스트 가져오기
      const canvas = document.createElement('canvas');
      canvas.width = radarChartContainer.value.clientWidth;
      canvas.height = radarChartContainer.value.clientHeight;
      radarChartContainer.value.innerHTML = '';
      radarChartContainer.value.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');

      // Chart.js 레이더 차트 생성
      radarChart.value = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: dimensionLabels,
          datasets: [{
            label: '취향 프로필',
            data: dimensionValues,
            backgroundColor: 'rgba(66, 153, 225, 0.5)',
            borderColor: '#4299e1',
            borderWidth: 2,
            pointBackgroundColor: '#4299e1',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#4299e1',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              suggestedMin: 0,
              suggestedMax: 1,
              ticks: {
                display: false
              },
              pointLabels: {
                font: {
                  size: 12,
                  family: "'Noto Sans KR', sans-serif"
                },
                color: '#4a5568'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${Math.round(context.raw * 100)}%`;
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: 10,
              titleFont: {
                size: 14,
                family: "'Noto Sans KR', sans-serif"
              },
              bodyFont: {
                size: 13,
                family: "'Noto Sans KR', sans-serif"
              }
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });

      // 창 크기 변경 시 차트 크기 조정
      const resizeRadarChart = () => {
        if (radarChart.value) {
          // Chart.js는 자동으로 반응형이지만, 컨테이너 크기가 변경되면 차트를 업데이트
          radarChart.value.update();
        }
      };

      window.addEventListener('resize', resizeRadarChart);

      return () => {
        window.removeEventListener('resize', resizeRadarChart);
        if (radarChart.value) {
          radarChart.value.destroy();
          radarChart.value = null;
        }
      };
    };

    // 필터 변경 시 지도 업데이트 - selectedYear 제거
    watch([activeRegion, activeSig], () => {
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

      // 사용자 데이터 로드
      loadUserData();
      
      // 사용자 여행 통계 데이터 로드
      loadUserTravelData();

      // 레이더 차트 렌더링 - 사용자 데이터 로드 후 renderRadarChart 함수가 호출되므로 여기서는 호출하지 않음
    });

    onBeforeUnmount(() => {
      window.removeEventListener('mousemove', updateMousePosition);
    });

    // 타임라인에서 총 여행 개수 계산
    const totalTripsCount = computed(() => {
      return filteredTimeline.value.reduce((sum, year) => sum + year.trips.length, 0);
    });

    // 광역시도 방문 랭킹 (전체 지도에서 표시)
    const regionRankings = computed(() => {
      // 지역별 방문 데이터 수집
      const regionData = [];

      // 각 광역시도에 대해 방문 비율 계산
      Object.entries(travelStats.value.regions || {}).forEach(([regionCode, data]) => {
        // 지역 이름 찾기
        const regionInfo = propertiesData.find(r => r.CTPRVN_CD === regionCode);
        if (!regionInfo) return;

        // 해당 지역의 시군구 수 계산
        const totalSigs = sigGeoJson.features.filter(f => 
          f.properties && f.properties.SIG_CD && 
          f.properties.SIG_CD.substring(0, 2) === regionCode
        ).length;
        
        // 방문 비율 계산
        const visitedCount = data.visitedSigs || 0;
        const percentage = totalSigs > 0 ? Math.round((visitedCount / totalSigs) * 100) : 0;

        regionData.push({
          code: regionCode,
          name: regionInfo.CTP_KOR_NM,
          visitedCount,
          totalCount: totalSigs,
          percentage
        });
      });

      // 방문 비율 기준으로 내림차순 정렬
      return regionData.sort((a, b) => b.percentage - a.percentage).slice(0, 5);
    });

    // 시군구 방문 랭킹 (시군구 지도 선택 시 표시)
    const sigRankings = computed(() => {
      // 선택된 지역이 없으면 빈 배열 반환
      if (!activeRegion.value || !travelStats.value.regions[activeRegion.value] || 
          !travelStats.value.regions[activeRegion.value].sigs) {
        return [];
      }

      const regionCode = activeRegion.value;
      const sigData = travelStats.value.regions[regionCode].sigs;
      
      // 시군구별 방문 데이터 수집
      const rankings = [];
      
      Object.entries(sigData).forEach(([sigCode, data]) => {
        // 시군구 이름 찾기
        const sigInfo = sigPropertiesData.find(s => s.SIG_CD === sigCode || s.SIG_CD.startsWith(sigCode));
        if (!sigInfo) return;
        
        rankings.push({
          code: sigCode,
          name: sigInfo.SIG_KOR_NM,
          count: data.count || 0
        });
      });
      
      // 방문 횟수 기준으로 내림차순 정렬
      return rankings.sort((a, b) => b.count - a.count).slice(0, 5);
    });

    return {
      // 기존 반환값과 함께 새로운 함수와 상태 포함
      // ...
      totalTripsCount,
      travelStats,
      loadUserTravelData,
      
      // 새 여행 계획 관련 상태 및 메서드
      showNewTripForm,
      newTrip,
      tripDuration,
      createNewTrip,
      
      // 상태 변수
      mapContainer,
      detailMapContainer,
      radarChartContainer,
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
      
      // 랭킹 데이터
      regionRankings,
      sigRankings,

      // 메서드
      selectRegion,
      resetToCtprvnMap,
      navigateToPlan,
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
/* 기본 스타일 */
.my-travel {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f8f9fa;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 랭킹 패널 스타일 */
.ranking-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 250px;
  z-index: 100;
  overflow: hidden;
}

.ranking-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.ranking-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
}

.ranking-list {
  padding: 8px 16px;
  max-height: 300px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-position {
  width: 40px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #4299e1;
}

.ranking-name {
  flex-grow: 1;
  font-size: 0.9rem;
  color: #4a5568;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-score {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2d3748;
}

.no-ranking-data {
  padding: 12px 0;
  color: #718096;
  font-style: italic;
  font-size: 0.9rem;
  text-align: center;
}

/* 콘텐츠 래퍼 */
.content-wrapper {
  padding: 2rem;
  max-width: 1600px; /* 기존 1400px에서 확장 */
  margin: 0 auto; /* 중앙 정렬 유지 */
  width: 100%;
  flex-grow: 1;
}

/* 섹션 컨테이너 공통 스타일 */
.section-container {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  padding: 1.5rem;
}

/* 섹션 헤더 공통 스타일 */
.section-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

/* 섹션 타이틀 통일 */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #2d3748;
}

/* 통계 카드 스타일 */
.statistics-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.statistic-card, .plan-trip-card {
  flex: 1;
  min-width: 150px;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.statistic-card:hover, .plan-trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.plan-trip-card {
  background-color: #4299e1;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
}

.plan-icon {
  margin-bottom: 0.5rem;
}

.plan-text {
  font-weight: 600;
  font-size: 1.1rem;
}

.statistic-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #4a5568;
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
  padding: 0;  /* 내부 padding은 map-controls에서 처리 */
}

.travel-map-container .section-header {
  padding: 1.5rem 1.5rem 1rem;
  margin-bottom: 0; /* Override the default margin to remove extra gap */
}

.map-controls {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
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
  display: flex;
  gap: 15px;
}

.map-container,
.detail-map-container {
  flex: 1;
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

/* 취향 프로필 섹션 */
.preference-profile {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

.preference-title, .style-title {
  margin: 0;
  width: 50%;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  padding: 0 1rem;
}

.preference-title {
  text-align: left;
}

.style-title {
  text-align: right;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  min-height: 320px;
}

.radar-chart-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.radar-chart-container {
  height: 280px;
  width: 100%;
  margin: 0 auto;
}

.profile-insight {
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.profile-insight p {
  line-height: 1.6;
  color: #4a5568;
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
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

/* Add this new class for the trips-wrapper */
.trips-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-left: 2.5rem;
  position: relative;
}

/* Add vertical line to the left of trips, similar to year-trips */
.trips-wrapper::before {
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
  width: calc(25% - 1.125rem); /* 한 줄에 4개 블록이 들어갈 수 있도록 수정 */
  min-width: 220px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-top: 4px solid #4299e1;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.trip-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* No-trip message styling */
.no-trips {
  margin-left: 2.5rem;
  color: #718096;
  font-style: italic;
  padding: 1rem 0;
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
  .preference-profile {
    padding: 1.5rem 1rem;
  }

  .profile-header {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .preference-title, .style-title {
    width: 100%;
    text-align: center;
    padding: 0;
  }
  
  .style-title {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
    border-bottom: none;
  }
  
  .profile-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .radar-chart-container {
    height: 250px;
    max-width: 350px;
    margin: 0 auto 1.5rem auto;
  }
  
  .profile-insight {
    padding: 0 0.75rem;
  }

  .statistics-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .trip-item {
    width: calc(33.333% - 1.125rem); /* 중간 화면에서는 한 줄에 3개 */
  }
  
  .ranking-panel {
    width: 220px;
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
    height: auto;
    min-height: 600px;
    flex-direction: column;
  }
  
  .map-container,
  .detail-map-container {
    height: 450px;
  }
  
  .ranking-panel {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    margin-bottom: 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .trip-item {
    width: calc(50% - 0.75rem); /* 작은 화면에서는 한 줄에 2개 */
    min-width: unset;
  }
  
  .trips-wrapper {
    flex-direction: row; /* 행 방향 유지 */
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .preference-profile {
    padding: 1.25rem 0.75rem;
  }
  
  .profile-header {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }

  .preference-title, .style-title {
    font-size: 1.25rem;
  }
  
  .radar-chart-container {
    height: 220px;
    margin-bottom: 1rem;
  }
  
  .profile-insight p {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .statistics-summary {
    grid-template-columns: 1fr;
  }

  .content-wrapper {
    padding: 1rem;
  }
  
  .map-container,
  .detail-map-container {
    height: 350px;
  }
  
  .ranking-panel {
    width: 100%;
  }
  
  .ranking-list {
    max-height: none;
  }
  
  .ranking-item {
    width: 100%;
    border-right: none;
    border-bottom: 1px dashed #e2e8f0;
  }
  
  .trips-wrapper {
    margin-left: 1.5rem;
    gap: 1rem;
  }
  
  .trips-wrapper::before {
    left: -15px;
  }
  
  .year-label {
    font-size: 1.1rem;
    padding-left: 1.5rem;
  }
  
  .year-label::before {
    width: 10px;
    height: 10px;
  }
  
  .no-trips {
    margin-left: 1.5rem;
  }
}

/* 새 여행 계획 배너 스타일 */
.new-trip-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.new-trip-form-banner {
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: zoomIn 0.3s ease-out;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-content {
  padding: 2rem;
}

.banner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.banner-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.close-banner-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-banner-btn:hover {
  color: #4a5568;
}

.trip-info-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.trip-info-row {
  display: flex;
  gap: 1.5rem;
}

.trip-info-field {
  flex: 1;
  min-width: 0; /* 필요한 경우 축소 가능하도록 설정 */
}

.trip-notes {
  width: 100%;
}

.trip-info-field label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.trip-info-field input, 
.trip-info-field textarea, 
.trip-info-field select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: white;
  color: #2d3748;
  transition: all 0.2s ease;
}

.trip-info-field input:focus, 
.trip-info-field textarea:focus, 
.trip-info-field select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.trip-info-field textarea {
  height: 100px;
  resize: vertical;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.input-with-icon input {
  padding-left: 1.5rem;
}

.banner-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.submit-trip-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-trip-btn:hover {
  background-color: #3182ce;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .trip-info-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .trip-info-field {
    width: 100%;
  }
}

/* 새 여행 버튼 (타임라인 내) */
.new-trip-item {
  background-color: #f0f9ff;
  border-top-color: #4299e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 222px; /* Match the height of regular trip items */
}

.new-trip-item:hover {
  background-color: #ebf8ff;
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(66, 153, 225, 0.2);
}

.new-trip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.plus-icon {
  color: #4299e1;
  margin-bottom: 1rem;
}

.new-trip-text {
  font-weight: 600;
  font-size: 1.1rem;
  color: #4299e1;
  text-align: center;
}
</style>