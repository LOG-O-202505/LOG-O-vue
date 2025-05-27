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
      <!-- 사용자 프로필 섹션 -->
      <div class="user-profile-section section-container">
        <div class="section-header">
          <h2 class="section-title">내 프로필</h2>
        </div>
        <div class="profile-and-stats-container">
          <!-- 프로필 그리드 레이아웃 -->
          <div v-if="userProfile" class="profile-grid">
            <!-- 프로필 정보 영역 -->
            <div class="profile-info-area">
              <div class="profile-image-container">
              <img :src="userProfile.profileImage" :alt="userProfile.name" />
                <div class="online-indicator"></div>
            </div>
            
              <h3 class="profile-name">{{ userProfile.nickname }}</h3>
              <p class="profile-email">{{ userProfile.email }}</p>

              <div class="profile-details">
                <div class="profile-detail-item">
                  <span class="profile-detail-label">나이</span>
                  <span class="profile-detail-value">{{ calculateAge(userProfile.birthday) }}세</span>
            </div>
                <div class="profile-detail-item">
                  <span class="profile-detail-label">성별</span>
                  <span class="profile-detail-value">{{ userProfile.gender || '미설정' }}</span>
            </div>
                <div class="profile-detail-item">
                  <span class="profile-detail-label">노션 ID</span>
                  <span class="profile-detail-value">{{ userProfile.notionId || '미설정' }}</span>
            </div>
            </div>
            </div>
            
            <!-- 통계 그리드 -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📍</div>
                <div class="stat-value">{{ totalTripsCount }}</div>
                <div class="stat-label">전체 여행수</div>
            </div>
              <div class="stat-card">
                <div class="stat-icon">🗺️</div>
                <div class="stat-value">{{ userStats.visitedRegions }}</div>
                <div class="stat-label">총 방문 지역</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📷</div>
                <div class="stat-value">{{ userStats.totalImages }}</div>
                <div class="stat-label">방문 인증 횟수</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">❤️</div>
                <div class="stat-value">{{ userStats.topCategory }}</div>
                <div class="stat-label">선호 카테고리</div>
              </div>
            </div>
          </div>
          <div v-else class="loading-profile">
            프로필을 불러오는 중...
          </div>
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
                  <label for="peoples">여행 인원</label>
                  <input type="number" id="peoples" v-model="newTrip.peoples" min="1" placeholder="1">
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
            <div v-if="hasValidChartData">
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
            <div v-else class="no-data-insight">
              <p class="no-data-message">인증 데이터가 없습니다</p>
              <p class="no-data-submessage">여행지 방문을 인증하고 나만의 여행 프로필을 완성해보세요!!</p>
              <div class="default-categories">
                <div v-for="(score, dimension) in dimensionScores" :key="dimension" class="category-item">
                  <div class="category-name">{{ getCategoryName(dimension) }}</div>
                  <div class="category-bar-container">
                    <div class="category-bar" style="width: 100%"></div>
                  </div>
                  <div class="category-score">100%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 여행 히트맵 섹션 -->
      <div class="travel-map-container section-container">
        <div class="section-header">
          <h2 class="section-title">나의 여행 히트맵</h2>
          
          <!-- 오른쪽에 지역 정보 표시 -->
          <div class="region-info-container">
            <!-- hover 시 표시되는 부분 (왼쪽) -->
            <div v-if="hoveredRegion" class="hovered-region-info">
              <span class="location-icon">📌</span>
              <span class="hovered-label">보고있는 구역 :</span>
              <span class="hovered-content">{{ tooltipContent }}</span>
            </div>
            
            <!-- 선택된 지역 표시 (오른쪽) -->
            <div class="selected-region-main">
              <span class="region-icon">👀</span>
              <span class="region-label">선택된 지역 :</span>
              <span class="region-name">{{ getSelectedRegionName() }}</span>
            </div>
          </div>
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
          <div class="map-container" ref="mapContainer" v-show="currentMapLevel === 'ctprvn'">
            <!-- 색상 범례 -->
            <div class="color-legend">
              <div class="legend-title">방문율</div>
              <div class="legend-scale">
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #3b82f6"></div>
                  <div class="legend-label">0</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #fbbf24"></div>
                  <div class="legend-label">~19</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #f97316"></div>
                  <div class="legend-label">~39</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #ec4899"></div>
                  <div class="legend-label">~59</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #be185d"></div>
                  <div class="legend-label">~79</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #ea580c"></div>
                  <div class="legend-label">~99</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #dc2626"></div>
                  <div class="legend-label">100</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 시군구 상세 지도 -->
          <div class="detail-map-container" ref="detailMapContainer" v-show="currentMapLevel === 'sig'">
            <!-- 왼쪽 아래 뒤로가기 버튼 -->
            <div class="bottom-left-back-button">
              <button class="back-button-large" @click="resetToCtprvnMap">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                전체 지도로 돌아가기
              </button>
            </div>

            <!-- 방문 빈도 범례 -->
            <div class="frequency-legend">
              <div class="legend-title">방문 빈도</div>
              <div class="legend-items">
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #ff9e80"></div>
                  <div class="frequency-label">30회 이상</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #ffab91"></div>
                  <div class="frequency-label">20-29회</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #ffcdd2"></div>
                  <div class="frequency-label">10-19회</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #ffcc80"></div>
                  <div class="frequency-label">5-9회</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #fff9c4"></div>
                  <div class="frequency-label">1-4회</div>
                </div>
                <div class="frequency-item">
                  <div class="frequency-color" style="background-color: #e2f0fa"></div>
                  <div class="frequency-label">미방문</div>
                </div>
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
          <div v-if="travelTimeline.length === 0" class="no-trips">
            <!-- 현재 연도와 같은 형식으로 표시 -->
            <div class="timeline-year">
              <div class="year-label">{{ currentYear }}년</div>
              <div class="trips-wrapper">
                <!-- 여행 기록이 없음을 알리는 카드 -->
                <div class="trip-item no-trips-card">
                  <div class="trip-date">{{ currentYear }}.01.01 - {{ currentYear }}.12.31</div>
                  <div class="trip-image-preview">
                    <div class="default-image">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </div>
                  </div>
                  <div class="trip-details">
                    <div class="trip-location">여행 기록</div>
                    <div class="trip-title">아직 기록이 없습니다</div>
                    <div class="trip-budget">첫 번째 여행을 계획해보세요!</div>
                    <div class="trip-people">✨ 새로운 시작</div>
                  </div>
                </div>
                
                <!-- 새 여행 계획 버튼 -->
                <div class="trip-item new-trip-item" @click="showNewTripForm = true">
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
          <div v-else>
            <!-- 연도별 여행 그룹 -->
            <div v-for="yearGroup in groupedTravelTimeline" :key="yearGroup.year" class="timeline-year">
              <div class="year-label">{{ yearGroup.year }}년</div>
              <div class="trips-wrapper">
                <div v-for="(travel, index) in yearGroup.trips" :key="index" class="trip-item" @click="navigateToPlan(travel.tuid)">
                  <div class="trip-date">{{ formatTravelDate(travel.startDate, travel.endDate) }}</div>
                  <div class="trip-image-preview">
                    <!-- ElasticSearch에서 가져온 여행 이미지가 있으면 표시 -->
                    <img v-if="travelImages[travel.tuid]?.image" 
                         :src="getImageDataUrl(travelImages[travel.tuid].image)" 
                         :alt="travelImages[travel.tuid].name || travel.title"
                         class="travel-image" />
                    <!-- 여행 이미지가 없으면 기본 이미지 사용 -->
                    <div v-else class="default-image">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 16 4-4 4 4 5-5 5 5"/>
                        <path d="M21 12.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7"/>
                      </svg>
                    </div>
                  </div>
                  <div class="trip-details">
                    <div class="trip-location">{{ travel.location }}</div>
                    <div class="trip-title">{{ travel.title }}</div>
                    <div class="trip-budget">예산: {{ formatBudget(travel.totalBudget) }}</div>
                    <div class="trip-people">{{ travel.peoples }}명</div>
                    <div v-if="travel.memo" class="trip-memo">{{ travel.memo }}</div>
                  </div>
                </div>
                
                <!-- 현재 연도의 마지막에 새 여행 계획 버튼 추가 -->
                <div v-if="yearGroup.year === currentYear" class="trip-item new-trip-item" @click="showNewTripForm = true">
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
    </div>

    <!-- 푸터 -->
    <footer class="footer">
      <p>© 2025 LOG:O - 당신의 여행을 기록하다</p>
    </footer>

    <!-- 토스트 메시지 -->
    <ToastMessage 
      :message="toastMessage" 
      :type="toastType" 
      :show="showToast" 
      @update:show="showToast = $event" 
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as d3 from 'd3';
import Header from '@/components/Header.vue';
import ToastMessage from '@/components/ToastMessage.vue';
import ctprvnGeoJson from '@/assets/ctprvn.json';
import propertiesData from '@/assets/extracted_ctprvn.json';
import sigGeoJson from '@/assets/sig.json';
import sigPropertiesData from '@/assets/extracted_properties.json';
import { useRouter } from 'vue-router';
import { getUserAverageTravelPreferences, getUserTravelStatistics, getTravelRecentImages } from '@/services/api';
import { apiGet, apiPost } from '@/services/auth';

export default {
  name: 'MyTravel',

  components: {
    Header,
    ToastMessage
  },

  setup() {
    const router = useRouter();
    
    // 사용자 프로필 데이터
    const userProfile = ref(null);
    
    // 새 여행 계획 배너 상태
    const showNewTripForm = ref(false);
    const newTrip = reactive({
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      peoples: 1,
      notes: ''
    });
    
    // 토스트 메시지 상태
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastType = ref('success');
    
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
    
    // 여행 데이터
    const travelTimeline = ref([]);
    
    // 여행별 최근 이미지 데이터
    const travelImages = ref({});
    
    // Base64 이미지를 Data URL로 변환하는 computed 함수
    const getImageDataUrl = (base64Data) => {
      if (!base64Data) return null;
      
      // 이미 data URL 형식인지 확인
      if (base64Data.startsWith('data:')) {
        return base64Data;
      }
      
      // base64 데이터만 있는 경우 data URL 접두사 추가
      return `data:image/jpeg;base64,${base64Data}`;
    };
    
    // 디버깅용: 여행 이미지 매핑 상태 확인
    const debugTravelImages = computed(() => {
      console.log('현재 travelImages 상태:', travelImages.value);
      console.log('현재 travelTimeline:', travelTimeline.value.map(t => ({ tuid: t.tuid, title: t.title })));
      return travelImages.value;
    });
    
    // 여행 개수 계산
    const totalTripsCount = computed(() => {
      return travelTimeline.value.length;
    });
    
    // 생일 포맷팅 함수
    const formatBirthday = (birthday) => {
      if (!birthday || birthday.length < 3) return '미설정';
      return `${birthday[0]}년 ${birthday[1]}월 ${birthday[2]}일`;
    };
    
    // 나이 계산 함수
    const calculateAge = (birthday) => {
      if (!birthday || birthday.length < 3) return '미설정';
      
      const today = new Date();
      const birthDate = new Date(birthday[0], birthday[1] - 1, birthday[2]); // 월은 0부터 시작
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };
    
    // 여행 날짜 포맷팅 함수
    const formatTravelDate = (startDate, endDate) => {
      if (!startDate || startDate.length < 3) return '';
      const start = `${startDate[1]}/${startDate[2]}`;
      if (!endDate || endDate.length < 3) return start;
      const end = `${endDate[1]}/${endDate[2]}`;
      return `${start} - ${end}`;
    };
    
    // 예산 포맷팅 함수
    const formatBudget = (budget) => {
      if (!budget) return '미설정';
      return budget.toLocaleString() + '원';
    };
    
    // 사용자 프로필 로드 함수
    const loadUserProfile = async () => {
      try {
        const response = await apiGet('/users/profile');
        userProfile.value = response.data;
        
        // 여행 데이터도 함께 로드
        if (response.data.travels) {
          travelTimeline.value = response.data.travels;
        }
        
        console.log('사용자 프로필 로드 완료:', response.data);

        // 프로필 로드 완료 후 취향 데이터와 여행 통계 로드
        if (response.data.uuid) {
          await loadUserData();
          await loadUserTravelData();
          
          // 여행별 최근 이미지 로드
          await loadTravelImages(response.data.uuid);
          
          // 모든 데이터 로드 후 차트 렌더링
          await nextTick();
          if (hasValidChartData.value) {
            renderRadarChart();
          } else {
            renderDefaultRadarChart();
          }
        }
        
      } catch (error) {
        console.error('사용자 프로필 로드 오류:', error);
      }
    };
    
    // 여행별 최근 이미지 로드 함수
    const loadTravelImages = async (userId) => {
      try {
        console.log('여행별 최근 이미지 로드 시작:', userId);
        const images = await getTravelRecentImages(userId);
        travelImages.value = images;
        console.log('여행별 최근 이미지 로드 완료:', images);
      } catch (error) {
        console.error('여행별 최근 이미지 로드 실패:', error);
        travelImages.value = {};
      }
    };
    
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
      newTrip.peoples = 1; // 기본 인원 설정
      
      // 사용자 데이터 로드
      loadUserProfile();
      
      // 지도 초기 렌더링 (데이터가 없어도 기본 지도는 표시)
      nextTick(() => {
        renderMap();
      });
    });
    
    // 새 여행 생성
    const createNewTrip = async () => {
      // 입력 데이터 검증
      if (!newTrip.title || !newTrip.destination || !newTrip.startDate || !newTrip.endDate || !newTrip.budget) {
        toastMessage.value = "필수 정보를 모두 입력해주세요.";
        toastType.value = "error";
        showToast.value = true;
        return;
      }
      
      // 날짜 검증
      const startDate = new Date(newTrip.startDate);
      const endDate = new Date(newTrip.endDate);
      
      if (endDate < startDate) {
        toastMessage.value = "도착일은 출발일보다 빠를 수 없습니다.";
        toastType.value = "error";
        showToast.value = true;
        return;
      }
      
      // 예산 검증
      if (parseInt(newTrip.budget) <= 0) {
        toastMessage.value = "예산은 0보다 커야 합니다.";
        toastType.value = "error";
        showToast.value = true;
        return;
      }

      try {
        // API 요청 데이터 구성
        const tripData = {
          title: newTrip.title,
          location: newTrip.destination,
          peoples: parseInt(newTrip.peoples) || 1,
          totalBudget: parseInt(newTrip.budget),
          startDate: newTrip.startDate, // YYYY-MM-DD 형식
          endDate: newTrip.endDate,     // YYYY-MM-DD 형식
          memo: newTrip.notes || ''
        };

        console.log('새 여행 계획 생성 요청:', tripData);
        
        // API 호출
        const response = await apiPost('/travels', tripData);
        
        console.log('여행 계획 생성 성공:', response);
        
        // 성공 메시지
        toastMessage.value = '새 여행 계획이 성공적으로 생성되었습니다!';
        toastType.value = "success";
        showToast.value = true;
        
        // 폼 초기화
        Object.assign(newTrip, {
          title: '',
          destination: '',
          startDate: '',
          endDate: '',
          budget: '',
          peoples: 1,
          notes: ''
        });
        
        // 모달 닫기
        showNewTripForm.value = false;
        
        // 사용자 프로필 다시 로드하여 여행 데이터 업데이트
        await loadUserProfile();
        
      } catch (error) {
        console.error('여행 계획 생성 오류:', error);
        toastMessage.value = '여행 계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
        toastType.value = "error";
        showToast.value = true;
      }
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
    let radarSvg = null; // D3.js SVG 인스턴스

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
        // 사용자 프로필에서 UUID 가져오기
        if (!userProfile.value || !userProfile.value.uuid) {
          console.warn('사용자 UUID가 없습니다. 프로필을 먼저 로드해야 합니다.');
          return;
        }

        const userData = await getUserAverageTravelPreferences(userProfile.value.uuid);
        
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
        
        // renderRadarChart 호출 제거 - loadUserProfile에서 이미 호출함
        
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
        // 사용자 프로필에서 UUID 가져오기
        if (!userProfile.value || !userProfile.value.uuid) {
          console.warn('사용자 UUID가 없습니다. 프로필을 먼저 로드해야 합니다.');
          return;
        }

        const stats = await getUserTravelStatistics(userProfile.value.uuid);
        
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
    // 마우스 위치 추적
    const updateMousePosition = (event) => {
      // map-container 또는 detail-map-container의 위치를 기준으로 계산
      const mapElement = currentMapLevel.value === 'ctprvn' 
        ? mapContainer.value 
        : detailMapContainer.value;
      
      if (mapElement) {
        const rect = mapElement.getBoundingClientRect();
        mousePosition.value = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      } else {
        mousePosition.value = {
          x: event.clientX,
          y: event.clientY
        };
      }
    };

    // 툴팁 스타일 계산
    const tooltipStyle = computed(() => {
      const mapElement = currentMapLevel.value === 'ctprvn' 
        ? mapContainer.value 
        : detailMapContainer.value;
      
      if (mapElement) {
        const rect = mapElement.getBoundingClientRect();
        return {
          left: `${rect.left + mousePosition.value.x + 10}px`,
          top: `${rect.top + mousePosition.value.y - 30}px`,
          position: 'fixed',
          zIndex: '1000'
        };
      }
      
      return {
        left: `${mousePosition.value.x + 10}px`,
        top: `${mousePosition.value.y - 30}px`,
        position: 'fixed',
        zIndex: '1000'
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

    // 차트 데이터 유효성 검사
    const hasValidChartData = computed(() => {
      return Object.keys(dimensionScores).length > 0 && 
             Object.values(dimensionScores).some(value => value > 0);
    });

    // 필터링된 타임라인 계산
    const filteredTimeline = computed(() => {
      // 모든 여행 목록을 날짜순으로 정렬하기 위해 먼저 평탄화
      let allTrips = [];

      travelTimeline.value.forEach(yearData => {
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
      return '나의 여행 기록';
    });

    // 현재 연도 계산
    const currentYear = computed(() => {
      return new Date().getFullYear();
    });

    // 연도별 여행 그룹화
    const groupedTravelTimeline = computed(() => {
      if (!travelTimeline.value || travelTimeline.value.length === 0) {
        return [];
      }

      // 연도별로 그룹화
      const grouped = {};
      
      travelTimeline.value.forEach(travel => {
        if (travel.startDate && travel.startDate.length >= 1) {
          const year = travel.startDate[0]; // 시작 날짜의 연도
          
          if (!grouped[year]) {
            grouped[year] = [];
          }
          grouped[year].push(travel);
        }
      });

      // 연도별로 정렬하고 각 연도 내에서 날짜순 정렬
      return Object.entries(grouped)
        .map(([year, trips]) => ({
          year: parseInt(year),
          trips: trips.sort((a, b) => {
            // 시작 날짜 기준으로 정렬 (월, 일 순서)
            if (a.startDate[1] !== b.startDate[1]) {
              return a.startDate[1] - b.startDate[1]; // 월 비교
            }
            return a.startDate[2] - b.startDate[2]; // 일 비교
          })
        }))
        .sort((a, b) => b.year - a.year); // 연도는 내림차순 (최신 연도가 위에)
    });

    // 년도 목록 계산
    const availableYears = computed(() => {
      return travelTimeline.value.map(year => year.year);
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
      // 새로운 색상 구분 적용
      if (percentage === 0) return '#3b82f6'; // 파랑
      if (percentage >= 1 && percentage <= 20) return '#fbbf24'; // 노랑
      if (percentage >= 21 && percentage <= 40) return '#f97316'; // 주황
      if (percentage >= 41 && percentage <= 60) return '#ec4899'; // 핑크
      if (percentage >= 61 && percentage <= 80) return '#be185d'; // 진한 핑크
      if (percentage >= 81 && percentage <= 99) return '#ea580c'; // 진한 주황
      if (percentage === 100) return '#dc2626'; // 최종 색 (빨강)
      
      return '#e2e8f0'; // 기본값 (회색)
    };

    // 시군구 방문 빈도에 따른 색상 반환
    const getFrequencyColor = (sigCode, regionCode) => {
      // 시군구 코드의 앞 5자리만 사용 (일관성을 위해)
      let lookupCode = sigCode.substring(0, 5);
      
      // 지역 데이터가 없는 경우
      if (!travelStats.value.regions[regionCode]) {
        return '#e2f0fa'; // 방문 기록 없음 (연한 하늘색)
      }
      
      // 시군구 방문 데이터 확인
      const region = travelStats.value.regions[regionCode];
      if (!region.sigs || !region.sigs[lookupCode]) {
        return '#e2f0fa'; // 미방문 (연한 하늘색)
      }
      
      // 방문 횟수 가져오기
      const visitCount = region.sigs[lookupCode].count || 0;
      
      // 방문 횟수에 따른 색상 반환
      if (visitCount >= 30) return '#ff9e80';     // 30회 이상 - 최고 가중치 (코랄/주황빛 파스텔)
      if (visitCount >= 20) return '#ffab91';     // 20-29회 (코랄/주황빛 파스텔)
      if (visitCount >= 10) return '#ffcdd2';     // 10-19회 (파스텔 빨강)
      if (visitCount >= 5) return '#ffcc80';      // 5-9회 (파스텔 주황)
      if (visitCount >= 1) return '#fff9c4';      // 1-4회 (파스텔 노랑)
      return '#e2f0fa';                           // 미방문 (연한 하늘색)
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
    const navigateToPlan = (tuid) => {
      router.push({ name: 'TripPlan', params: { tuid } });
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

      // Use a non-reactive clone of travelStats for D3 data binding
      const currentTravelStats = JSON.parse(JSON.stringify(travelStats.value));

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

        // 방문 데이터 확인 (cloned data 사용)
        const regionData = currentTravelStats.regions[regionCode];
        if (regionData && regionData.sigs) {
          console.log(`[renderDetailMap] Visit counts for region ${regionCode}:`, regionData.sigs);
        }

        // 각 시군구에 대한 코드 매핑 과정을 자세히 로깅 (cloned data 사용)
        console.log(`[renderDetailMap] District code mapping for region ${regionCode}:`);
        filteredFeatures.forEach(feature => {
          const sigCode = feature.properties.SIG_CD;
          const sigName = feature.properties.SIG_KOR_NM || '';

          console.log(`  - District: ${sigCode}, Name: ${sigName}`);

          // 방문 정보 확인 (cloned data 사용)
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
            const regionData = currentTravelStats.regions[regionCode];
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
            let color = '#e2f0fa'; // 기본 미방문 색상 (연한 하늘색)

            if (isVisited && visitCount) {
              if (visitCount >= 30) color = '#ff9e80';     // 30회 이상 - 최고 가중치 (코랄/주황빛 파스텔)
              else if (visitCount >= 20) color = '#ffab91';     // 20-29회 (코랄/주황빛 파스텔)
              else if (visitCount >= 10) color = '#ffcdd2';     // 10-19회 (파스텔 빨강)
              else if (visitCount >= 5) color = '#ffcc80';      // 5-9회 (파스텔 주황)
              else if (visitCount >= 1) color = '#fff9c4';      // 1-4회 (파스텔 노랑)
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

    // 레이더 차트 렌더링 함수 - 완전히 새로 작성
    const renderRadarChart = () => {
      console.log('레이더 차트 렌더링 시작');
      
      // 컨테이너 체크
      if (!radarChartContainer.value) {
        console.warn("Radar chart container not found");
        return;
      }

      // 데이터 유효성 검사
      const hasData = Object.keys(dimensionScores).length > 0 && 
                           Object.values(dimensionScores).some(value => value > 0);
      
      if (!hasData) {
        console.log('차원 데이터가 유효하지 않습니다.');
        return;
      }

      // 컨테이너 크기 확인
      if (radarChartContainer.value.offsetWidth === 0 || radarChartContainer.value.offsetHeight === 0) {
        console.warn("Container has no dimensions, retrying...");
        setTimeout(() => renderRadarChart(), 100);
        return;
      }

      renderRadarChartInternal();
    };

    const renderRadarChartInternal = () => {
      console.log('D3.js 레이더 차트 렌더링 시작');

      // 기존 차트 정리
      if (radarSvg) {
        console.log('기존 차트 삭제');
        radarSvg.selectAll("*").remove();
        radarSvg = null;
      }

      // 컨테이너 정리
      radarChartContainer.value.innerHTML = '';
      
      // 차트 설정
      const width = 400;
      const height = 400;
      const margin = 60;
      const radius = Math.min(width, height) / 2 - margin;

      // SVG 생성
      radarSvg = d3.select(radarChartContainer.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('width', '100%')
        .style('height', '100%');

      // 중앙 그룹 생성
      const g = radarSvg.append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);

      // 데이터 준비
      const labels = Object.keys(dimensionScores).map(dim => dimensionTranslations[dim] || dim);
      const values = Object.values(dimensionScores).map(value => Number(value) || 0);
      const dataPoints = labels.map((label, i) => ({
        label: label,
        value: values[i],
        angle: (i * 2 * Math.PI) / labels.length
      }));

      console.log('D3 차트 데이터:', dataPoints);

      try {
        // 레벨 수 (동심원)
        const levels = 5;

        // 배경 동심원 그리기
        for (let level = 1; level <= levels; level++) {
          g.append('circle')
            .attr('r', (radius * level) / levels)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(0, 0, 0, 0.1)')
            .attr('stroke-width', 1);
      }

        // 축선 그리기
        g.selectAll('.axis-line')
          .data(dataPoints)
          .enter()
          .append('line')
          .attr('class', 'axis-line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', d => radius * Math.cos(d.angle - Math.PI / 2))
          .attr('y2', d => radius * Math.sin(d.angle - Math.PI / 2))
          .attr('stroke', 'rgba(0, 0, 0, 0.1)')
          .attr('stroke-width', 1);

        // 라벨 그리기
        const labelRadius = radius + 20;
        g.selectAll('.label')
          .data(dataPoints)
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', d => labelRadius * Math.cos(d.angle - Math.PI / 2))
          .attr('y', d => labelRadius * Math.sin(d.angle - Math.PI / 2))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('font-family', "'Noto Sans KR', sans-serif")
          .style('fill', '#2d3748')
          .style('font-weight', '500')
          .text(d => d.label);

        // 데이터 영역 (폴리곤) 그리기
        const pathData = dataPoints.map(d => {
          const x = (radius * d.value) * Math.cos(d.angle - Math.PI / 2);
          const y = (radius * d.value) * Math.sin(d.angle - Math.PI / 2);
          return [x, y];
        });

        const line = d3.line()
          .x(d => d[0])
          .y(d => d[1])
          .curve(d3.curveLinearClosed);

        // 배경 영역
        g.append('path')
          .datum(pathData)
          .attr('d', line)
          .attr('fill', 'rgba(66, 153, 225, 0.15)')
          .attr('stroke', 'rgba(66, 153, 225, 0.8)')
          .attr('stroke-width', 2);

        // 데이터 포인트 그리기
        g.selectAll('.data-point')
          .data(dataPoints)
          .enter()
          .append('circle')
          .attr('class', 'data-point')
          .attr('cx', d => (radius * d.value) * Math.cos(d.angle - Math.PI / 2))
          .attr('cy', d => (radius * d.value) * Math.sin(d.angle - Math.PI / 2))
          .attr('r', 5)
          .attr('fill', 'rgba(66, 153, 225, 1)')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);

        // 툴팁 추가
        const tooltip = d3.select('body').append('div')
          .attr('class', 'radar-tooltip')
          .style('position', 'absolute')
          .style('padding', '8px 12px')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        // 포인트에 호버 이벤트 추가
        g.selectAll('.data-point')
          .on('mouseover', function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 7);
            
            tooltip.transition()
              .duration(200)
              .style('opacity', 1);
            
            tooltip.html(`${d.label}: ${Math.round(d.value * 100)}%`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 5);
            
            tooltip.transition()
              .duration(200)
              .style('opacity', 0);
        });
        
        console.log('D3.js 레이더 차트 생성 완료');
        
      } catch (error) {
        console.error('D3.js 차트 렌더링 오류:', error);
        console.error('오류 상세:', error.stack);
        
        // 오류 발생 시 간단한 텍스트로 대체
        radarChartContainer.value.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
            차트를 불러올 수 없습니다. 데이터를 확인해주세요.
          </div>
        `;
      }
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

      // 사용자 프로필 로드 (내부에서 취향 데이터와 여행 통계도 함께 로드됨)
      loadUserProfile();
      
      // 지도 초기 렌더링 (데이터가 없어도 기본 지도는 표시)
      nextTick(() => {
        renderMap();
      });
    });

    onBeforeUnmount(() => {
      window.removeEventListener('mousemove', updateMousePosition);
      
      // D3.js 툴팁 정리
      d3.selectAll('.radar-tooltip').remove();
      
      // 레이더 차트 정리
      if (radarSvg) {
        radarSvg.selectAll("*").remove();
        radarSvg = null;
      }
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

    // 선택된 지역 이름 계산
    const getSelectedRegionName = () => {
      if (!activeRegion.value) return '대한민국';
      const region = propertiesData.find(r => r.CTPRVN_CD === activeRegion.value);
      return region ? region.CTP_KOR_NM : '대한민국';
    };

    // 기본 원형 차트 렌더링 함수 (인증 데이터가 없을 때)
    const renderDefaultRadarChart = () => {
      if (!radarChartContainer.value) return;

      console.log('기본 레이더 차트 렌더링 시작');

      // 기존 차트 정리
      if (radarSvg) {
        radarSvg.selectAll("*").remove();
        radarSvg = null;
      }

      // 컨테이너 정리
      radarChartContainer.value.innerHTML = '';
      
      // 차트 설정
      const width = 400;
      const height = 400;
      const margin = 60;
      const radius = Math.min(width, height) / 2 - margin;

      // SVG 생성
      radarSvg = d3.select(radarChartContainer.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('width', '100%')
        .style('height', '100%');

      // 중앙 그룹 생성
      const g = radarSvg.append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);

      // 기본 데이터 준비 (모든 값 0.5)
      const defaultLabels = Object.keys(dimensionScores).map(dim => dimensionTranslations[dim] || dim);
      const defaultDataPoints = defaultLabels.map((label, i) => ({
        label: label,
        value: 0.5, // 모든 값을 0.5로 설정
        angle: (i * 2 * Math.PI) / defaultLabels.length
      }));

      console.log('기본 차트 데이터:', defaultDataPoints);

      try {
        // 레벨 수 (동심원)
        const levels = 5;

        // 배경 동심원 그리기
        for (let level = 1; level <= levels; level++) {
          g.append('circle')
            .attr('r', (radius * level) / levels)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(156, 163, 175, 0.3)') // 더 연한 색상
            .attr('stroke-width', 1);
        }

        // 축선 그리기
        g.selectAll('.axis-line')
          .data(defaultDataPoints)
          .enter()
          .append('line')
          .attr('class', 'axis-line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', d => radius * Math.cos(d.angle - Math.PI / 2))
          .attr('y2', d => radius * Math.sin(d.angle - Math.PI / 2))
          .attr('stroke', 'rgba(156, 163, 175, 0.3)')
          .attr('stroke-width', 1);

        // 라벨 그리기
        const labelRadius = radius + 20;
        g.selectAll('.label')
          .data(defaultDataPoints)
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', d => labelRadius * Math.cos(d.angle - Math.PI / 2))
          .attr('y', d => labelRadius * Math.sin(d.angle - Math.PI / 2))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('font-family', "'Noto Sans KR', sans-serif")
          .style('fill', '#9ca3af') // 더 연한 색상
          .style('font-weight', '500')
          .text(d => d.label);

        // 기본 원형 데이터 영역 그리기
        const pathData = defaultDataPoints.map(d => {
          const x = (radius * d.value) * Math.cos(d.angle - Math.PI / 2);
          const y = (radius * d.value) * Math.sin(d.angle - Math.PI / 2);
          return [x, y];
        });

        const line = d3.line()
          .x(d => d[0])
          .y(d => d[1])
          .curve(d3.curveLinearClosed);

        // 배경 영역 (연한 회색톤)
        g.append('path')
          .datum(pathData)
          .attr('d', line)
          .attr('fill', 'rgba(156, 163, 175, 0.1)')
          .attr('stroke', 'rgba(156, 163, 175, 0.5)')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5'); // 점선으로 표시

        // 데이터 포인트 그리기 (연한 색상)
        g.selectAll('.data-point')
          .data(defaultDataPoints)
          .enter()
          .append('circle')
          .attr('class', 'data-point')
          .attr('cx', d => (radius * d.value) * Math.cos(d.angle - Math.PI / 2))
          .attr('cy', d => (radius * d.value) * Math.sin(d.angle - Math.PI / 2))
          .attr('r', 4)
          .attr('fill', 'rgba(156, 163, 175, 0.7)')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);

        // 중앙에 안내 텍스트 추가
        g.append('text')
          .attr('x', 0)
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '14px')
          .style('font-family', "'Noto Sans KR', sans-serif")
          .style('fill', '#9ca3af')
          .style('font-weight', '600')
          .text('기본 프로필');

        g.append('text')
          .attr('x', 0)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('font-family', "'Noto Sans KR', sans-serif")
          .style('fill', '#9ca3af')
          .style('font-weight', '400')
          .text('인증 후 개인화됩니다');
        
        console.log('기본 레이더 차트 생성 완료');
        
      } catch (error) {
        console.error('기본 차트 렌더링 오류:', error);
        
        // 오류 발생 시 간단한 텍스트로 대체
        radarChartContainer.value.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
            차트를 불러올 수 없습니다.
          </div>
        `;
      }
    };

    return {
      // 사용자 프로필 관련
      userProfile,
      formatBirthday,
      calculateAge,
      formatTravelDate,
      formatBudget,
      loadUserProfile,
      travelTimeline,
      
      // 여행 이미지 관련
      travelImages,
      loadTravelImages,
      debugTravelImages,
      getImageDataUrl,
      
      // 기존 반환값과 함께 새로운 함수와 상태 포함
      totalTripsCount,
      travelStats,
      loadUserTravelData,
      
      // 새 여행 계획 관련 상태 및 메서드
      showNewTripForm,
      newTrip,
      tripDuration,
      createNewTrip,
      
      // 토스트 메시지 관련
      showToast,
      toastMessage,
      toastType,
      
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
      hasValidChartData,
      filteredTimeline,
      availableYears,
      timelineTitle,
      currentYear,
      groupedTravelTimeline,
      
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
      getColorForPercentage,
      
      // 지도 관련 함수들
      renderMap,
      renderDetailMap,
      selectSig,
      getRegionColor,
      getSigColor,
      logRegionVisitData,
      updateDetailMapSelection,
      getSelectedRegionName,
      renderDefaultRadarChart
    };
  }
};
</script>

<style scoped>
/* 기본 스타일 */
.my-travel {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #faf5ff 100%);
  min-height: 100vh;
  color: #1f2937;
  display: flex;
  flex-direction: column;
}

/* 랭킹 패널 스타일 */
.ranking-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 250px;
  z-index: 100;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.ranking-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.ranking-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.ranking-list {
  padding: 1rem 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed rgba(226, 232, 240, 0.6);
  transition: all 0.2s ease;
}

.ranking-item:hover {
  background: rgba(248, 250, 252, 0.5);
  border-radius: 6px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-position {
  width: 40px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #3b82f6;
}

.ranking-name {
  flex-grow: 1;
  font-size: 0.9rem;
  color: #374151;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.ranking-score {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1f2937;
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
  max-width: 1400px; /* 1792px에서 1400px로 줄임 */
  margin: 0 auto; /* 중앙 정렬 유지 */
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 섹션 컨테이너 공통 스타일 */
.section-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 섹션 헤더 공통 스타일 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

/* 섹션 타이틀 통일 */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.travel-map-container .section-header {
  padding: 2rem 2rem 1rem;
  margin-bottom: 0;
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
  height: 500px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.5);
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  min-height: 450px;
}

.radar-chart-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  border-radius: 12px;
  padding: 2rem;
  min-height: 450px;
}

.radar-chart-container {
  height: 400px;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-empty-state {
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #6b7280;
}

.empty-chart-placeholder {
  margin-bottom: 1rem;
}

.empty-chart-icon {
  font-size: 2rem;
  color: #6b7280;
}

.empty-chart-grid {
  width: 200px;
  height: 200px;
}

.empty-radar-chart {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 1;
}

.profile-insight {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.profile-insight p {
  line-height: 1.7;
  color: #374151;
  margin-bottom: 2rem;
  font-size: 1.05rem;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
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
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(4px);
}

.category-name {
  min-width: 120px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.category-bar-container {
  flex-grow: 1;
  height: 8px;
  background-color: rgba(226, 232, 240, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

.category-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.category-score {
  min-width: 45px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #3b82f6;
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: calc(25% - 1.125rem);
  min-width: 220px;
  transition: all 0.3s ease;
  border-top: 4px solid #3b82f6;
  cursor: pointer;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.trip-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

/* No-trip message styling */
.no-trips {
  /* 기존 스타일 제거하고 빈 컨테이너로 만듦 */
}

.no-trips .timeline-year {
  margin-bottom: 0; /* 기본 margin-bottom 제거 */
}

.no-trips .trips-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-left: 2.5rem;
  position: relative;
}

/* no-trips의 trips-wrapper에도 세로선 추가 */
.no-trips .trips-wrapper::before {
  content: "";
  position: absolute;
  left: -20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e2e8f0;
}

/* 여행 기록 없음 카드 스타일 */
.no-trips-card {
  opacity: 0.7;
  border-top-color: #94a3b8 !important;
  cursor: default !important;
}

.no-trips-card:hover {
  transform: none !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
  background: rgba(255, 255, 255, 0.8) !important;
}

.no-trips-card .default-image {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.no-trips-message {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 16px;
  border: 2px dashed #d1d5db;
  width: 100%;
  max-width: 400px;
}

.no-trips-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.no-trips-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.no-trips-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  font-style: italic;
}

/* 계절별 색상 */
.trip-item.season-spring {
  border-top-color: #10b981;
}

.trip-item.season-summer {
  border-top-color: #3b82f6;
}

.trip-item.season-fall {
  border-top-color: #f59e0b;
}

.trip-item.season-winter {
  border-top-color: #6b7280;
}

.trip-date {
  padding: 0.875rem 1rem;
  font-size: 0.8rem;
  color: #6b7280;
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  font-weight: 500;
}

.trip-image-preview {
  height: 150px;
  overflow: hidden;
  position: relative;
}

.trip-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.travel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.trip-item:hover .trip-image-preview img,
.trip-item:hover .trip-image-preview .travel-image {
  transform: scale(1.08);
}

.trip-details {
  padding: 1.25rem;
}

.trip-location {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.trip-title {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #374151;
  line-height: 1.4;
}

.trip-budget {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.trip-people {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.trip-memo {
  font-size: 0.8rem;
  color: #9ca3af;
  font-style: italic;
  margin-top: 0.75rem;
  line-height: 1.4;
  padding: 0.5rem;
  background: rgba(249, 250, 251, 0.6);
  border-radius: 6px;
  border-left: 3px solid #e5e7eb;
}

.trip-season {
  font-size: 0.85rem;
  color: #718096;
}

/* 기본 이미지 스타일 */
.default-image {
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.default-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
}

.default-image svg {
  opacity: 0.8;
  position: relative;
  z-index: 1;
}

/* 새 여행 계획 카드 스타일 */
.new-trip-item {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-top-color: #1e40af;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.new-trip-item:hover {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.new-trip-content {
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 280px; /* trip-date(약 45px) + trip-image-preview(150px) + trip-details(약 85px) = 약 280px */
}

.plus-icon {
  margin-bottom: 1rem;
  opacity: 0.9;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-trip-text {
  font-size: 1.1rem;
  font-weight: 600;
}

/* 푸터 */
.footer {
  background: #1f2937;
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
  font-size: 0.875rem;
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

/* 프로필 그리드 레이아웃 */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  width: 100%;
  min-height: 280px;
}

/* 프로필 정보 영역 */
.profile-info-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
}

/* 프로필 사진 컨테이너 */
.profile-image-container {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 1.5rem;
}

.profile-image-container img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.online-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: #10b981;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 프로필 기본 정보 */
.profile-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.profile-email {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

/* 프로필 상세 정보 */
.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 280px;
}

.profile-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.profile-detail-item:hover {
  background: rgba(243, 244, 246, 0.9);
  transform: translateY(-1px);
}

.profile-detail-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.profile-detail-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

/* 통계 그리드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: #3b82f6;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 768px) {
  .profile-and-stats-container {
    flex-direction: column;
    gap: 1.5rem;
  }

  .profile-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 0.75rem;
    min-height: 240px;
  }

  .profile-image-grid {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }

  .profile-image-grid img {
    max-width: 100px;
    max-height: 100px;
  }

  .card-label {
    font-size: 0.7rem;
  }

  .card-value {
    font-size: 0.95rem;
  }
}

@media (max-width: 576px) {
  .profile-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 0.5rem;
    min-height: 320px;
  }

  .profile-image-grid {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }

  .profile-image-grid img {
    max-width: 80px;
    max-height: 80px;
  }

  .profile-info-card {
    padding: 0.75rem;
  }

  .card-label {
    font-size: 0.65rem;
    margin-bottom: 0.25rem;
  }

  .card-value {
    font-size: 0.9rem;
  }
}

/* 뒤로가기 버튼 왼쪽 하단 스타일 */
.bottom-left-back-button {
  position: absolute;
  bottom: 30px;
  left: 30px;
  z-index: 1000;
}

.back-button-large {
  background-color: rgba(255, 255, 255, 0.95);
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.back-button-large:hover {
  background-color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  border-color: #4299e1;
}

.back-button-large svg {
  transition: transform 0.2s ease;
}

.back-button-large:hover svg {
  transform: translateX(-2px);
}

/* 새 여행 계획 폼 스타일 */
.new-trip-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.new-trip-form-banner {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.banner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.banner-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-banner-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  line-height: 1;
}

.close-banner-btn:hover {
  color: #374151;
  background: rgba(243, 244, 246, 0.5);
}

.trip-info-form {
  padding: 1.5rem 2rem 2rem;
}

.trip-info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.trip-info-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trip-info-field.trip-notes {
  grid-column: 1 / -1;
}

.trip-info-field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.trip-info-field input,
.trip-info-field textarea {
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

.trip-info-field input:focus,
.trip-info-field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.trip-info-field input:disabled {
  background: rgba(249, 250, 251, 0.8);
  color: #6b7280;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
}

.input-with-icon input {
  padding-left: 2.5rem;
}

.banner-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
}

.submit-trip-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-trip-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* 선택된 지역 표시 스타일 - section-header 내부용 */
.region-info-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.selected-region-main {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

.region-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.region-label {
  font-weight: 600;
  color: #4a5568;
  flex-shrink: 0;
}

.region-name {
  font-weight: 700;
  color: #2d3748;
  flex-shrink: 0;
}

.hovered-region-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeInSlide 0.2s ease-out;
  white-space: nowrap;
}

.location-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.hovered-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.hovered-content {
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 툴팁 스타일 - 기존 툴팁 제거됨 */

/* 데이터가 없을 때 스타일 */
.no-data-insight {
  text-align: center;
  padding: 2rem;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.no-data-message {
  color: #6b7280;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  border: 2px dashed #d1d5db;
}

.default-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.default-categories .category-item {
  opacity: 0.5;
  background: rgba(243, 244, 246, 0.5);
}

.default-categories .category-bar {
  background: #e5e7eb;
}

.default-categories .category-score {
  color: #9ca3af;
}

.no-data-submessage {
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  border: 2px dashed #d1d5db;
}
</style>