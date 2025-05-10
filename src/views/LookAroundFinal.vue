<template>
    <div class="look-around-page">
      <!-- 헤더 -->
      <Header />
  
      <!-- 히어로 섹션 -->
      <div class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">시군구별 상세 지도</h1>
          <p class="hero-subtitle">대한민국 전역의 시군구별 행정구역을 확인하세요</p>
        </div>
      </div>
  
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
              <h3 class="detail-map-title" v-if="getActiveRegion">{{ getActiveRegion.CTP_KOR_NM }} 상세 지도</h3>
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
              <div class="region-details">
                <p v-for="(detail, index) in panelDetails" :key="index">
                  {{ detail.label }}: {{ detail.value }}
                </p>
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
  import Header from '@/components/Header.vue';
  import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
  import * as d3 from 'd3';
  import ctprvnGeoJson from '@/assets/ctprvn.json';
  import propertiesData from '@/assets/extracted_ctprvn.json';
  import sigGeoJson from '@/assets/sig.json';
  import sigPropertiesData from '@/assets/extracted_properties.json';
  
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
      
      // 시군구 관련 상태 변수
      const activeSig = ref(null); // 활성화된 시군구 코드
      const currentMapLevel = ref('ctprvn'); // 현재 지도 레벨: 'ctprvn'(광역시도) 또는 'sig'(시군구)
      
      // 상세 지도 툴팁 관련 상태
      const hoveredSig = ref(null); // 호버된 시군구 코드
      const sigTooltipContent = ref(''); // 툴팁에 표시할 내용
      const sigMousePosition = ref({ x: 0, y: 0 }); // 상세 지도에서의 마우스 위치
      const showSigTooltip = ref(false); // 시군구 툴팁 표시 여부
  
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
        console.log("찾은 지역 정보:", region);
        return region;
      });
      
      // 활성화된 시군구 정보 가져오기
      const getActiveSig = computed(() => {
        if (!activeSig.value) return null;
        
        const sigItem = sigPropertiesData.find(item => item.SIG_CD === activeSig.value);
        console.log("찾은 시군구 정보:", sigItem);
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
        if (!panelDisplayData.value && showDefaultInfo.value) {
          return 'Republic of Korea';
        }
        
        if (!panelDisplayData.value) return '';
        
        if (currentMapLevel.value === 'sig' && activeSig.value) {
          return `${panelDisplayData.value.SIG_ENG_NM} (${panelDisplayData.value.SIG_CD})`;
        }
        return `${panelDisplayData.value.CTP_ENG_NM} (${panelDisplayData.value.CTPRVN_CD})`;
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
  
      // 지역 선택 함수
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
          
          // nextTick을 사용하여 DOM이 업데이트된 후 상세 지도 렌더링
          nextTick(() => {
            console.log("상세 지도 컨테이너 확인:", detailMapContainer.value);
            if (detailMapContainer.value) {
              renderDetailMap(regionCode);
            } else {
              console.error("상세 지도 컨테이너가 없습니다!");
            }
          });
        }
      };
      
      // 시군구 선택 함수
      const selectSig = (sigCode) => {
        console.log("선택된 시군구 코드:", sigCode);
        if (activeSig.value === sigCode) {
          activeSig.value = null;
        } else {
          activeSig.value = sigCode;
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
        } else {
          // 광역시도 지도에서 선택 초기화하는 경우
          activeRegion.value = null;
          // 기본 정보 표시
          showDefaultInfo.value = true;
          updateMapSelection();
        }
      };
  
      // 지도 선택 상태 업데이트
      const updateMapSelection = () => {
        if (!map) return;
  
        // 모든 지역 선택 상태 초기화 (기본 민트색으로)
        map.selectAll('.region')
          .classed('selected', false)
          .attr('fill', '#75D7B8');
  
        // 선택된 지역 강조 (핑크색으로)
        if (activeRegion.value) {
          map.selectAll('.region')
            .filter(d => {
              return d.properties.CTPRVN_CD === activeRegion.value;
            })
            .classed('selected', true)
            .attr('fill', '#ff9d9d'); // 핑크색
        }
      };
  
      // 마우스 위치 추적
      const updateMousePosition = (event) => {
        mousePosition.value = {
          x: event.clientX,
          y: event.clientY
        };
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
          
          console.log("좌표 범위:", { minX, minY, maxX, maxY });
          
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
            .attr('fill', '#75D7B8')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 0.5)
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
                .attr('stroke-width', 0.5);
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

        console.log("상세 지도 렌더링 시작:", regionCode);

        // 기존 SVG 제거 (재렌더링 시)
        d3.select(container).selectAll("svg").remove();

        const width = container.clientWidth;
        const height = container.clientHeight;

        console.log("상세 지도 컨테이너 크기:", width, height);

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
          console.log("sigGeoJson 데이터 확인:", sigGeoJson.type, sigGeoJson.features.length);
          console.log("선택된 광역시도 코드:", regionCode, "타입:", typeof regionCode);
          
          // 지역 코드의 앞 2자리를 사용하여 해당 지역의 시군구만 필터링
          const filteredFeatures = sigGeoJson.features.filter(feature => {
            // 더 안전한 속성 접근 방식
            if (!feature.properties || !feature.properties.SIG_CD) {
              console.log("SIG_CD가 없는 feature:", feature);
              return false;
            }
            
            const sigCode = feature.properties.SIG_CD;
            console.log("비교중:", sigCode, "타입:", typeof sigCode);
            
            // 앞 2자리 추출 (문자열로 처리)
            const sigCodePrefix = sigCode.toString().substring(0, 2);
            const regionCodeStr = regionCode.toString();
            
            // 정확한 비교를 위해 문자열로 변환해서 비교
            const match = sigCodePrefix === regionCodeStr;
            
            if (match) {
              console.log("매칭된 시군구:", sigCode, feature.properties.SIG_KOR_NM);
            }
            
            return match;
          });

          console.log(`필터링된 시군구 개수: ${filteredFeatures.length}`);

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
            .attr('fill', '#87CEEB') // 상세 지도는 다른 색상(하늘색)으로 표시
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer');
            
          detailMap = g; // 전역 참조 저장

          // 지역 호버 이벤트
          regionPaths.on('mouseover', function (event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#ff9d9d')
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
                .attr('fill', '#ff9d9d')
                .attr('stroke-width', 1.5);
            } else {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', '#87CEEB')
                .attr('stroke-width', 0.5);
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
        
        // 모든 시군구 선택 상태 초기화
        detailMap.selectAll('.region')
          .classed('selected', false)
          .attr('fill', '#87CEEB');
          
        // 선택된 시군구 강조
        if (activeSig.value) {
          detailMap.selectAll('.region')
            .filter(d => d.properties.SIG_CD === activeSig.value)
            .classed('selected', true)
            .attr('fill', '#ff9d9d');
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
      watch(activeRegion, (newValue, oldValue) => {
        console.log("Active region changed to:", newValue, "from:", oldValue);
        if (newValue !== null) {
          showDetailMap.value = true;
          nextTick(() => {
            console.log("watch에서 상세 지도 컨테이너 확인:", detailMapContainer.value);
            if (detailMapContainer.value) {
              renderDetailMap(newValue);
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
  
      // 컴포넌트 마운트 시 처리
      onMounted(() => {
        // 마우스 이벤트 리스너 등록
        window.addEventListener('mousemove', updateMousePosition);
  
        // 데이터 확인을 위한 디버깅 로그
        console.log("ctprvnGeoJson 데이터 구조:", ctprvnGeoJson.type);
        console.log("첫 번째 feature 구조:", ctprvnGeoJson.features[0]);
        console.log("propertiesData 개수:", propertiesData.length);
  
        // 지도 렌더링
        renderMap();
      });
  
      // 컴포넌트 언마운트 시 처리
      onBeforeUnmount(() => {
        window.removeEventListener('mousemove', updateMousePosition);
      });
  
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
        showSigTooltip
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
  
  /* 히어로 섹션 */
  .hero-section {
    position: relative;
    height: 200px;
    background-image: url('https://images.unsplash.com/photo-1584872581419-51c239dc9537?q=80&w=1470');
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
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(118, 179, 157, 0.9));
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
    height: 600px;
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
    padding: 10px; /* 내부 여백 추가 */
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
    height: 650px;
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
  
  .region-details {
    background-color: #f5f7fa;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1.5rem;
  }
  
  .region-details p {
    margin: 0.5rem 0;
    font-size: 1rem;
    line-height: 1.5;
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
  
  .detail-map-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #48b0e4;
    flex-grow: 1;
    text-align: center;
    margin: 0;
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
  </style> 