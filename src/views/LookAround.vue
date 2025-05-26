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
        
        <!-- 인기 여행지 섹션 (SearchResultPanel 컴포넌트 사용) -->
        <SearchResultPanel
          :title="popularDestinationsTitle"
          :destinations="popularDestinations"
          :isLoading="isLoadingDestinations"
          :showAll="showAllDestinations"
          @open-detail="openDetailModal"
          @show-all="showAllDestinations = true"
        />
      </div>
  
      <!-- 푸터 -->
      <footer class="footer">
        <p>©  {{$store.state.appName}} - 당신의 여행을 기록하다</p>
      </footer>
    </div>
  
    <!-- 장소 상세 모달 수정 -->
    <PlaceDetailModal
      :show="showDetailModal"
      :detail="selectedDetail"
      :isInWishlist="selectedDetail._source ? isInWishlist(selectedDetail._source.p_id) : false"
      :ageStats="ageStats"
      :genderStats="genderStats"
      :totalStatsVisits="totalStatsVisits"
      :isLoadingStats="isLoadingStats"
      :userLikes="userLikes"
      @close="closeDetailModal"
      @toggle-wishlist="toggleWishlist"
      @apply-keyword="applyKeyword"
    />
  </template>
  
  <script>
  import Header from '@/components/Header.vue';
  import PlaceDetailModal from '@/components/PlaceDetailModal.vue';
  import SearchResultPanel from '@/components/SearchResultPanel.vue';
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
  import { getUserLikes, addUserLike, removeUserLikeByAddress, getPlaceDetails, reverseGeocode, getLocationCodes } from '@/services/api.js';
  
  export default {
    name: 'LookAroundAll',
  
    components: {
      Header,
      PlaceDetailModal,
      SearchResultPanel
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
      const userLikes = ref([]); // API 기반 관심 장소 데이터로 변경
      
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
        if (ageChart) {
          ageChart.destroy();
          ageChart = null;
        }
        if (!ageChartCanvas.value || !showDetailModal.value) return;
        if (totalAgeVisits.value === 0) return; // Don't render if no data

        const ctx = ageChartCanvas.value.getContext('2d');
        if (!ctx) return;

        const labels = ageStats.value.map(stat => stat.label);
        const data = ageStats.value.map(stat => stat.value);
        
        ageChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              label: '방문자 연령대',
              data: data,
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
                '#FF9F40', '#E7E9ED', '#8C8C8C', '#C45850'
              ],
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let label = context.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed !== null) {
                      label += context.parsed + '명';
                    }
                    return label;
                  }
                }
              }
            }
          }
        });
      };
      
      // 차트 canvas 참조
      const ageChartCanvas = ref(null);
      const detailMapModalContainerRef = ref(null); // Ref for detail map in modal
      
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
      
      // Method to determine visible tags based on length
      const getVisibleTags = (tags) => {
        if (!tags || tags.length === 0) {
          return [];
        }
        const tagThresholdLength = 7; // Adjust this threshold as needed
        const potentialTags = tags.slice(0, 3);

        if (potentialTags.length === 3) {
          if (potentialTags.some(tag => tag.length > tagThresholdLength)) {
            return tags.slice(0, 2);
          }
        }
        return potentialTags; // Returns 1, 2, or 3 tags based on checks and availability
      };
      
      // 마우스 이벤트 처리
      const updateMousePosition = (event) => {
        mousePosition.value = {
          x: event.clientX,
          y: event.clientY
        };
      };
      
      // API에서 관심 장소 데이터 로드
      const loadUserLikes = async () => {
        try {
          console.log('사용자 관심 장소 로드 중... (LookAround)');
          const response = await getUserLikes();
          
          console.log('getUserLikes API 응답 (LookAround):', response);
          
          if (response && response.status === 'success' && response.data) {
            userLikes.value = response.data;
            console.log('관심 장소 로드 완료 (LookAround):', userLikes.value.length, '개');
          } else {
            console.log('관심 장소가 없거나 응답 형식이 올바르지 않습니다 (LookAround):', response);
            userLikes.value = [];
          }
        } catch (error) {
          console.error('관심 장소 로드 오류 (LookAround):', error);
          userLikes.value = [];
        }
      };

      // 위시리스트 관리 함수 (API 기반)
      const isInWishlist = (id) => {
        // 검색 결과에서 해당 id를 가진 아이템 찾기
        const foundItem = popularDestinations.value.find(result => result.id === id || result._source?.p_id === id);
        if (!foundItem) return false;
        
        const address = foundItem.address || foundItem._source?.p_address;
        return userLikes.value.some(like => like.place && like.place.address === address);
      };

      const toggleWishlist = async (item) => {
        try {
          console.log('=== toggleWishlist 함수 시작 (LookAround) ===');
          console.log('입력된 item:', JSON.stringify(item, null, 2));
          
          // 이벤트 전파 중지 (모달 닫힘 방지)
          if (event) {
            event.stopPropagation();
          }
          
          // 아이템 이름과 주소 추출
          const itemName = item.name || item._source?.p_name;
          const address = item.address || item._source?.p_address;
          
          console.log('추출된 데이터 (LookAround):', { itemName, address });
          
          // 기본 데이터 검증
          if (!itemName) {
            throw new Error('장소 이름이 없습니다.');
          }
          
          if (!address) {
            throw new Error('장소 주소가 없습니다.');
          }
          
          if (isInWishlist(item.id)) {
            // 선호 장소에서 제거 - address 기반 삭제 API 사용
            console.log('선호 장소 삭제 요청 (LookAround):', address);
            
            const response = await removeUserLikeByAddress(address);
            
            if (response.status === 'success') {
              // 로컬 데이터 업데이트
              userLikes.value = response.data || [];
              console.log(`${itemName}이(가) 선호 장소에서 제거되었습니다. (LookAround)`);
            } else {
              throw new Error('선호 장소 삭제에 실패했습니다.');
            }
            
          } else {
            // 선호 장소에 추가 - TripPlan.vue 패턴 적용
            console.log('선호 장소 추가 요청 시작 (LookAround)');
            
            // 좌표 추출 - location_data를 우선적으로 사용
            let latitude, longitude;
            
            // 1. _source.location_data에서 시도 (가장 안정적)
            if (item._source?.location_data?.latitude && item._source?.location_data?.longitude) {
              latitude = parseFloat(item._source.location_data.latitude);
              longitude = parseFloat(item._source.location_data.longitude);
              console.log('좌표 소스: _source.location_data (LookAround)');
            }
            // 2. item.location_data에서 시도
            else if (item.location_data?.latitude && item.location_data?.longitude) {
              latitude = parseFloat(item.location_data.latitude);
              longitude = parseFloat(item.location_data.longitude);
              console.log('좌표 소스: item.location_data (LookAround)');
            }
            // 3. getPlaceDetails API를 사용하여 정확한 좌표 가져오기
            else if (item._source?.p_id || item.p_id || item.id) {
              try {
                console.log('getPlaceDetails API 호출로 좌표 조회... (LookAround)');
                const puid = item._source?.p_id || item.p_id || item.id;
                const response = await getPlaceDetails(puid, address);
                
                if (response.status === 'success' && response.data && response.data.latitude && response.data.longitude) {
                  latitude = parseFloat(response.data.latitude);
                  longitude = parseFloat(response.data.longitude);
                  console.log('좌표 소스: getPlaceDetails API (LookAround)');
                } else {
                  console.warn('getPlaceDetails API에서 좌표를 가져올 수 없음 (LookAround):', response);
                }
              } catch (detailError) {
                console.warn('getPlaceDetails 호출 실패 (LookAround):', detailError);
              }
            }
            
            // 좌표 검증
            if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
              console.error('좌표 검증 실패 (LookAround):', { latitude, longitude });
              throw new Error('위치 정보를 찾을 수 없습니다. 정확한 좌표가 필요합니다.');
            }
            
            console.log('추출된 좌표 (LookAround):', { latitude, longitude });
            
            // reverse geocoding을 통해 region과 sig 추출 (TripPlan.vue와 동일한 방식)
            console.log('역지오코딩 시작... (LookAround)', { latitude, longitude });
            const geoData = await reverseGeocode(latitude, longitude);
            console.log('역지오코딩 결과 (LookAround):', geoData);

            if (!geoData) {
              throw new Error('위치 정보를 가져올 수 없습니다.');
            }

            const locationCodes = getLocationCodes(geoData);
            console.log('추출된 지역 코드 (LookAround):', locationCodes);

            if (!locationCodes.province_code || !locationCodes.city_code) {
              throw new Error('지역 코드를 추출할 수 없습니다.');
            }

            // API 요청 데이터 구성 (TripPlan.vue와 동일한 형식)
            const placeData = {
              address: address,
              region: parseInt(locationCodes.province_code, 10),
              sig: parseInt(locationCodes.city_code, 10),
              name: itemName,
              latitude: latitude,
              longitude: longitude
            };

            console.log('=== API 요청 데이터 (LookAround) ===');
            console.log(JSON.stringify(placeData, null, 2));

            // API 호출
            console.log('addUserLike API 호출 시작... (LookAround)');
            const response = await addUserLike(placeData);
            console.log('addUserLike API 응답 (LookAround):', response);
            
            if (response.status === 'success' && response.data) {
              // 로컬 데이터 업데이트
              userLikes.value = response.data;
              console.log(`${itemName}이(가) 선호 장소에 추가되었습니다. (LookAround)`);
              console.log('관심 장소 추가 완료, 목록 업데이트 (LookAround):', userLikes.value);
            } else {
              console.error('API 응답 상태 오류 (LookAround):', response);
              throw new Error('선호 장소 추가에 실패했습니다.');
            }
          }
          
        } catch (error) {
          console.error('=== 선호 장소 토글 오류 (LookAround) ===');
          console.error('오류 상세:', error);
          console.error('오류 스택:', error.stack);
          alert(`오류가 발생했습니다: ${error.message}`);
        }
      };
      
      // PlaceDetailModal 컴포넌트 호환성을 위한 함수
      const applyKeyword = (keyword) => {
        console.log("LookAround에서는 키워드 적용 기능이 구현되지 않았습니다:", keyword);
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
      
      // 현재 표시할 인기 여행지 데이터 가져오기 - Elasticsearch 직접 호출 방식으로 개선된 방식
      const loadPopularDestinations = async () => {
        try {
          isLoadingDestinations.value = true;
          
          // 조회할 최대 결과 수
          const size = 30;
          
          // 필터 쿼리 생성 - 시군구 또는 지역으로 필터링
          let filterQuery = {};
          if (currentMapLevel.value === 'sig' && activeSig.value) {
            filterQuery = { term: { p_sig: activeSig.value } };
          } else if (activeRegion.value) {
            filterQuery = { term: { p_region: activeRegion.value } };
          }
          
                     // ES 쿼리 구성 - 개선된 중복 제거 및 정렬 방식 (빈도 + 평점 기준)
           const query = {
             size: size,
             query: filterQuery.term ? {
               bool: {
                 must: [filterQuery]
               }
             } : {
               match_all: {}
             },
             // p_id 기준으로 결과 접기 (ES 레벨에서 중복 제거)
             collapse: {
               field: "p_id",
               inner_hits: {
                 name: "most_recent",
                      size: 1,
                 sort: [{ "upload_date": { "order": "desc" } }], // 최신 데이터 먼저
                      _source: [
                   "p_id", "p_name", "p_address", "p_region", "p_sig", 
                   "p_description", "p_tags", "p_image", "location_data"
                 ]
                    }
             },
             // p_id 별 전체 문서 수 집계 및 평균 평점 계산
             aggs: {
               "popular_places": {
                 terms: {
                   field: "p_id",
                   size: size * 2, // 충분한 후보군 확보
                   order: { "_count": "desc" } // 1차: 방문 횟수 기준 내림차순 정렬
                 },
                 aggs: {
                   "avg_rating": {
                     avg: {
                       field: "p_stars"
                     }
                   }
                 }
               }
             },
             // 실제 결과는 내부 집계로 정렬 (엔진이 더 효율적으로 처리)
             track_total_hits: true, // 총 히트 수 추적
             _source: ["p_id"] // 최소한의 소스 필드만 가져오기
          };
          
          console.log('개선된 인기 여행지 조회 쿼리:', JSON.stringify(query, null, 2));
          
          // Elasticsearch 직접 호출
          const response = await fetch(`${config.ES_API}/travel_places/_search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('검색 응답 에러 내용:', errorData);
            throw new Error(`Elasticsearch API 오류: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('ES 검색 결과:', data);
          
          // 방문 횟수 및 평균 평점 집계 맵 생성
          const visitCountsMap = new Map();
          const avgRatingsMap = new Map();
          
          if (data.aggregations && data.aggregations.popular_places && data.aggregations.popular_places.buckets) {
            data.aggregations.popular_places.buckets.forEach(bucket => {
              const placeId = bucket.key;
              const visitCount = bucket.doc_count;
              const avgRating = bucket.avg_rating.value || 0; // null인 경우 0으로 처리
              
              visitCountsMap.set(placeId, visitCount);
              avgRatingsMap.set(placeId, avgRating);
            });
          }
          
          // p_id 기준으로 정렬된 배열 생성 (1차: 방문 횟수, 2차: 평균 평점, 3차: 등수 가중치)
          const sortedIds = Array.from(visitCountsMap.entries())
            .map(([placeId, visitCount]) => ({
              placeId,
              visitCount,
              avgRating: avgRatingsMap.get(placeId) || 0
            }))
            .sort((a, b) => {
              // 1차 정렬: 방문 횟수 내림차순
              if (a.visitCount !== b.visitCount) {
                return b.visitCount - a.visitCount;
              }
              // 2차 정렬: 평균 평점 내림차순
              return b.avgRating - a.avgRating;
            })
            .map((item, index) => {
              // 등수별 가중치 적용 (상위 10위까지 가중치 부여)
              const rank = index + 1;
              const rankWeight = rank <= 10 ? (11 - rank) * 0.1 : 0; // 1위: 1.0, 2위: 0.9, ..., 10위: 0.1
              
              return {
                ...item,
                rank,
                rankWeight,
                // 최종 점수 = 방문횟수 + (평점 * 2) + 등수가중치
                finalScore: item.visitCount + (item.avgRating * 2) + rankWeight
              };
            })
            .sort((a, b) => b.finalScore - a.finalScore) // 최종 점수로 재정렬
            .map(item => item.placeId);
            
          console.log('정렬된 장소 ID 배열 (상위 10개):', sortedIds.slice(0, 10));
          console.log('방문 횟수 맵:', Object.fromEntries(visitCountsMap));
          console.log('평균 평점 맵:', Object.fromEntries(avgRatingsMap));
          
          // 결과 처리
          if (data && data.hits && data.hits.hits && data.hits.hits.length > 0) {
            const results = data.hits.hits.map((hit, index) => {
              // 기본 반환값 준비
              let placeObj = null;
              
              try {
                // inner_hits에서 장소 세부 정보 가져오기
                if (!hit.inner_hits?.most_recent?.hits?.hits?.[0]) {
                  console.error('inner_hits 데이터 누락:', hit);
                  return null; // 필요한 데이터가 없는 경우 처리
                }
                
                const innerHit = hit.inner_hits.most_recent.hits.hits[0];
                const placeDetails = innerHit._source;
                const p_id = parseInt(hit.fields?.p_id?.[0] || innerHit._source.p_id);
              
              // 지역명 및 시군구명 조회
              const regionName = getRegionNameByCode(placeDetails.p_region);
              const sigName = getSigNameByCode(placeDetails.p_sig);
              
                // 장소 객체 생성
                placeObj = {
                  id: p_id,
                name: placeDetails.p_name,
                address: placeDetails.p_address,
                region: placeDetails.p_region,
                regionName,
                sig: placeDetails.p_sig,
                sigName,
                description: placeDetails.p_description,
                tags: placeDetails.p_tags || [],
                p_image: placeDetails.p_image,
                  location_data: placeDetails.location_data,
                  // 집계된 방문 횟수 및 평균 평점 사용
                  visitCount: visitCountsMap.get(p_id) || 0,
                  avgRating: avgRatingsMap.get(p_id) || 0,
                displayRank: index + 1
              };
              } catch (err) {
                console.error('장소 데이터 처리 오류:', err, hit);
                return null;
              }
              
              return placeObj;
            }).filter(item => item !== null); // null 항목 제거
            
            console.log(`인기 여행지 ${results.length}개 기본 로드 완료`);
            
            // 집계 기반 정렬: 방문 횟수 기준 내림차순 정렬
            // 1. sortedIds 기반으로 정확한 순서 유지
            // 2. 집계에 없는 결과는 방문 횟수 0으로 맨 뒤에 배치
            const sortedResults = [];
            
            // 먼저 정렬된 ID 순서대로 결과 추가
            sortedIds.forEach(id => {
              const found = results.find(item => item.id === id);
              if (found) {
                sortedResults.push(found);
              }
            });
            
            // 집계에 없는 결과 추가 (방문 횟수 0)
            results.forEach(item => {
              if (!sortedIds.includes(item.id)) {
                sortedResults.push(item);
              }
            });
            
            // 순위 재설정
            sortedResults.forEach((item, idx) => {
              item.displayRank = idx + 1;
            });
            
            console.log(`최종 정렬된 인기 여행지 ${sortedResults.length}개 처리 완료`);
            popularDestinations.value = sortedResults;
            
            // 인기 여행지 데이터를 기반으로 지역 인기도 점수 계산
            // 전국 데이터인 경우 지역별 인기도 계산
            if (!activeRegion.value && !activeSig.value) {
              calculateRegionScoresFromData(sortedResults);
            } 
            // 특정 지역 선택 시 해당 지역의 시군구별 인기도 계산
            else if (activeRegion.value && !activeSig.value) {
              calculateSigScoresFromData(sortedResults);
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
      onMounted(async () => {
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
        
        // API에서 관심 장소 데이터 로드
        await loadUserLikes();
        
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
        
        // SearchResultPanel에서 넘어온 데이터인 경우 (id, name 등의 형태) vs 직접 result에서 열 경우 (_id, _score 등의 형태)
        let detailData;
        
        if (destination.id !== undefined) {
          // SearchResultPanel에서 넘어온 데이터 처리
          detailData = {
            _id: destination.id,
            _score: destination._score || 1.0,
            _source: destination._source || {
              p_id: destination.id,
              p_name: destination.name,
              p_address: destination.address,
              p_description: destination.description,
              p_tags: destination.tags || [],
              p_image: destination.p_image,
              location_data: destination.location_data
            }
          };
        } else {
          // 직접 검색 결과에서 온 데이터 처리
          detailData = destination;
        }
        
        selectedDetail.value = detailData;
        showDetailModal.value = true;
        
        // 통계 데이터 로드
        const placeId = detailData._source ? detailData._source.p_id : detailData.p_id;
        loadDestinationStats(placeId);
        
        nextTick(() => {
          // Render charts after modal is visible and data is likely loading/loaded
          renderAgeChart(); 
        });
      };
      
      // 연령별 방문 통계 로드 후 차트 렌더링
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

          // Data is ready, re-render chart if modal is still open
          if (showDetailModal.value) {
            nextTick(() => {
                renderAgeChart();
            });
          }
          
        } catch (error) {
          console.error('연령별 방문 통계 로드 오류:', error);
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
        ageStats.value = [];
        genderStats.value = [];
        totalStatsVisits.value = 0;
        if (ageChart) {
          ageChart.destroy();
          ageChart = null;
        }
        if (kakaoMap) { // kakaoMap for modal
          // Kakao maps don't have a direct destroy. 
          // Setting the container to null or removing it is usually enough.
          // Ensure no further operations are done on this map instance.
          kakaoMap = null; 
        }
      };
      

      return {
        activeRegion,
        hoveredRegion,
        hoveredRegionName,
        tooltipStyle,
        mapContainer,
        detailMapContainer,
        detailMapModalContainerRef,
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
        userLikes,
        isInWishlist,
        toggleWishlist,
        // 리뷰 관련
        formatReviewDate,
        // 태그 길이 기반 표시 로직
        getVisibleTags,
        // 키워드 적용 관련 (PlaceDetailModal 호환용)
        applyKeyword
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
    display: flex; /* Add flex display */
    flex-direction: column; /* Stack children vertically */
    height: 100%; /* Make .region-info fill .region-info-panel */
  }
  
  .region-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #48b0e4;
    flex-shrink: 0; /* Prevent title from shrinking */
  }
  
  .region-description {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 0.5rem;
    color: #555;
    flex-grow: 1; /* Allow description to take available space */
    overflow-y: auto; /* Add scroll if content overflows */
    min-height: 100px; /* Ensure a minimum height, adjust as needed */
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
    flex-shrink: 0; /* Prevent specialties section from shrinking */
    /* Adjust padding-bottom if necessary for minimal gap, or ensure parent has no extra padding */
    padding-bottom: 0.5rem; /* Example: minimal bottom padding */
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
  
  /* 섹션 타이틀 공통 스타일 (필요한 부분만 남김) */
  .section-title span {
    font-size: 0.9rem;
    font-weight: 400;
    margin-left: 0.5rem;
    color: #777;
  }
  
  /* 별점 관련 스타일 (컴포넌트에 포함되지 않은 부분만 남김) */
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
  
  /* 반응형 디자인 */
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
  }
  
  @media (max-width: 768px) {
    .specialties-grid {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 576px) {
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
    background-color: rgba(30, 40, 50, 0.65); /* Slightly darker overlay */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    overflow-y: auto;
    padding: 2rem; /* Add padding for smaller screens */
    backdrop-filter: blur(4px); /* Softer blur */
  }

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
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
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
    width: 130px; /* Adjusted width */
    font-size: 0.9rem;
    color: #52616B;
    font-weight: 500;
  }

  .info-value {
    font-size: 0.95rem;
    color: #2d3748;
  }

  /* 모달 푸터 영역 */
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

  /* 통계 섹션 스타일 */
  .stats-section {
    background-color: #fdfdfe;
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

  /* 반응형 조정 */
  @media (max-width: 1100px) {
    .visual-section {
      flex-direction: column;
      gap: 1.5rem; /* Gap when stacked */
    }
    
    .detail-image-container, 
    .detail-map-container {
      width: 100%;
      height: 320px; /* Adjust height when stacked */
  }
  
    .info-label {
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
    .info-label {
      width: 100px;
      font-size: 0.85rem;
  }
    .visit-info-item {
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
    .review-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
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
    .info-label {
      width: auto; /* Allow full width */
      margin-bottom: 0.2rem;
    }
    .visit-info-item {
      flex-direction: column; /* Stack dimension items */
      align-items: flex-start;
      gap: 0.3rem;
    }
  }
  </style> 