<template>
    <div class="look-around-page">
        <!-- 헤더 -->
        <Header />

        <!-- 히어로 섹션 -->
        <div class="hero-section">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">지역별 여행지 찾기</h1>
                <p class="hero-subtitle">대한민국 전역의 아름다운 명소를 지역별로 둘러보세요</p>
            </div>
        </div>

        <!-- 메인 콘텐츠 -->
        <div class="content-wrapper">

            <!-- 지도 섹션 -->
            <div class="map-section">
                <div class="map-background"></div>
                <div id="d3-map-container" class="map-component" ref="mapContainer"></div>

                <!-- 지역 이름 호버 툴팁 -->
                <div v-if="hoveredRegion" class="region-tooltip" :style="tooltipStyle">
                    {{ hoveredRegionName }}
                </div>
            </div>

            <!-- 지역 정보 패널 -->
            <div class="region-info-panel" :class="{ 'active': activeRegion !== null }">
                <div v-if="activeRegion" class="close-button" @click="resetActiveRegion">×</div>

                <div v-if="activeRegion && getActiveRegion" class="region-info">
                    <h2 class="region-title">{{ getActiveRegion.name }}</h2>
                    <p class="region-description">{{ getActiveRegion.description }}</p>

                    <!-- 인기 여행지 TOP 5 -->
                    <div class="popular-destinations">
                        <h3 class="section-title">인기 여행지 TOP 5</h3>
                        <div class="popular-grid">
                            <div v-for="i in 5" :key="`popular-${i}`" class="popular-item">
                                <div class="popular-image"></div>
                                <div class="popular-content">
                                    <h4 class="popular-name">인기 여행지 #{{ i }}</h4>
                                    <div class="popular-rating">
                                        <span v-for="star in 5" :key="`star-${star}`" class="star">★</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 모든 여행지 리스트 -->
                    <div class="all-destinations">
                        <h3 class="section-title">모든 여행지</h3>
                        <div class="destinations-grid">
                            <div v-for="destination in getActiveRegion.destinations" :key="destination.id"
                                class="destination-card">
                                <div class="destination-image"
                                    :style="{ backgroundImage: `url(${destination.imageUrl})` }">
                                </div>
                                <div class="destination-content">
                                    <h3 class="destination-name">{{ destination.name }}</h3>
                                    <div class="destination-location">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        <span>{{ destination.location }}</span>
                                    </div>
                                    <p class="destination-description">{{ destination.description }}</p>
                                    <button class="destination-button">자세히 보기</button>
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
import Header from '@/components/Header.vue';
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import * as d3 from 'd3';
import koreaGeoJson from '@/assets/korea.json';
import regionsData from '@/data/regionData.js'; // 지역 데이터 import

export default {
    name: 'LookAround',

    components: {
        Header
    },

    setup() {
        // 상태 변수
        const activeRegion = ref(null);
        const hoveredRegion = ref(null);
        const mousePosition = ref({ x: 0, y: 0 });
        const mapContainer = ref(null);
        let map = null; // D3 맵 인스턴스 참조 저장
        const geoData = ref(koreaGeoJson); // GeoJSON 데이터 저장
        const regions = ref(regionsData); // 지역 데이터 반응형으로 관리

        // 툴팁 위치 계산
        const tooltipStyle = computed(() => {
            return {
                left: `${mousePosition.value.x}px`,
                top: `${mousePosition.value.y - 40}px`
            };
        });

        // 호버된 지역 이름
        const hoveredRegionName = computed(() => {
            if (!hoveredRegion.value || !geoData.value) return '';

            const feature = geoData.value.features.find(f =>
                f.properties.code === hoveredRegion.value
            );

            return feature ? feature.properties.name : '';
        });

        // 코드에서 ID로 매핑 (한글 이름으로 구분)
        const regionMap = {
            '11': 'seoul',       // 서울특별시
            '21': 'busan',       // 부산광역시
            '22': 'daegu',       // 대구광역시
            '23': 'incheon',     // 인천광역시
            '24': 'gwangju',     // 광주광역시
            '25': 'daejeon',     // 대전광역시
            '26': 'ulsan',       // 울산광역시
            '29': 'sejong',      // 세종특별자치시
            '31': 'gyeonggi',    // 경기도
            '32': 'gangwon',     // 강원도
            '33': 'chungbuk',    // 충청북도
            '34': 'chungnam',    // 충청남도
            '35': 'jeonbuk',     // 전라북도
            '36': 'jeonnam',     // 전라남도
            '37': 'gyeongbuk',   // 경상북도
            '38': 'gyeongnam',   // 경상남도
            '39': 'jeju'         // 제주특별자치도
        };

        // 활성화된 지역 정보 가져오기
        const getActiveRegion = computed(() => {
            if (!activeRegion.value) return null;
            const regionId = regionMap[activeRegion.value] || activeRegion.value;
            return regions.value[regionId];
        });

        // 지역 선택 함수
        const selectRegion = (regionCode) => {
            console.log("선택된 지역 코드:", regionCode);
            if (activeRegion.value === regionCode) {
                resetActiveRegion();
            } else {
                activeRegion.value = regionCode;
                updateMapSelection();
            }
        };

        // 선택 지역 초기화
        const resetActiveRegion = () => {
            activeRegion.value = null;
            updateMapSelection();
        };

        // 지도 선택 상태 업데이트
        const updateMapSelection = () => {
            if (!map) return;

            // 모든 지역 선택 상태 초기화 (기본 민트색으로)
            map.selectAll('.region')
                .classed('selected', false)
                .attr('fill', (d) => {
                    // 북쪽은 살짝 밝게, 남쪽은 조금 진하게 (그러나 차이는 미세하게)
                    const y = d.geometry.coordinates[0][0][1] || 35; // 위도 (fallback to 35)
                    const latitude = (typeof y === 'number') ? y : 35;
                    
                    // 위도에 따른 색상 계산 (36-38도가 중부, 34-36이 남부, 38 이상이 북부)
                    if (latitude > 38) {  // 북부: 약간 더 밝은 색상
                        return '#8DE0CA';
                    } else if (latitude < 35) {  // 남부: 약간 더 진한 색상
                        return '#62CCA8';
                    } else {  // 중부: 기본 색상
                        return '#75D7B8';
                    }
                });

            // 선택된 지역 강조 (핑크색으로)
            if (activeRegion.value) {
                map.select(`#region-${activeRegion.value}`)
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

        // D3.js로 지도 렌더링 (간단한 3D 효과)
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

            // 3D 효과를 위한 정의 영역
            const defs = svg.append('defs');

            // 그림자 필터 정의
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

            // 엠보싱 효과
            const embossFilter = defs.append('filter')
                .attr('id', 'emboss')
                .attr('height', '130%');

            // 빛을 받는 면의 조명 효과
            embossFilter.append('feSpecularLighting')
                .attr('in', 'SourceAlpha')
                .attr('surfaceScale', 2)
                .attr('specularConstant', 0.8)
                .attr('specularExponent', 20)
                .attr('lighting-color', '#FFFFFF')
                .attr('result', 'specOut')
                .append('fePointLight')
                .attr('x', width * 0.3)
                .attr('y', height * 0.2)
                .attr('z', 100);

            // 조명 효과 합성
            embossFilter.append('feComposite')
                .attr('in', 'specOut')
                .attr('in2', 'SourceAlpha')
                .attr('operator', 'in')
                .attr('result', 'specOut');

            embossFilter.append('feComposite')
                .attr('in', 'SourceGraphic')
                .attr('in2', 'specOut')
                .attr('operator', 'arithmetic')
                .attr('k1', 0)
                .attr('k2', 1)
                .attr('k3', 1)
                .attr('k4', 0)
                .attr('result', 'litPaint');

            // 지도 그룹 요소
            const g = svg.append('g')
                .attr('class', 'map-group')
                .attr('filter', 'url(#dropshadow)'); // 그림자 필터 적용
            
            map = g; // 전역 참조 저장

            // 지도 투영법 설정
            const projection = d3.geoMercator()
                .center([127.5, 35.8]) // 한국 중심 좌표
                .scale(width * 4.5) // 스케일 조정
                .translate([width / 2, height / 2]);

            // 경로 생성기
            const path = d3.geoPath().projection(projection);

            // 지도 데이터 로드 및 그리기
            const regionPaths = g.selectAll('path')
                .data(koreaGeoJson.features)
                .enter()
                .append('path')
                .attr('class', d => activeRegion.value === d.properties.code ? 'region selected' : 'region')
                .attr('id', d => `region-${d.properties.code}`)
                .attr('data-name', d => d.properties.name)
                .attr('d', path)
                .attr('fill', d => {
                    // 북쪽은 살짝 밝게, 남쪽은 조금 진하게 (그러나 차이는 미세하게)
                    const y = d.geometry.coordinates[0][0][1] || 35; // 위도 (fallback to 35)
                    const latitude = (typeof y === 'number') ? y : 35;
                    
                    // 위도에 따른 색상 계산 (36-38도가 중부, 34-36이 남부, 38 이상이 북부)
                    if (latitude > 38) {  // 북부: 약간 더 밝은 색상
                        return '#8DE0CA';
                    } else if (latitude < 35) {  // 남부: 약간 더 진한 색상
                        return '#62CCA8';
                    } else {  // 중부: 기본 색상
                        return '#75D7B8';
                    }
                })
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 0.5)
                .attr('filter', 'url(#emboss)') // 엠보싱 필터 적용
                .style('cursor', 'pointer');

            // 지역 호버 이벤트
            regionPaths.on('mouseover', function (event, d) {
                hoveredRegion.value = d.properties.code;
                
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
                selectRegion(d.properties.code);
            });

            // 초기 선택된 지역이 있으면 표시
            updateMapSelection();

            // 창 크기 변경 시 지도 크기 조정
            const resizeMap = () => {
                const newWidth = container.clientWidth;
                const newHeight = container.clientHeight;

                svg.attr('width', newWidth)
                    .attr('height', newHeight)
                    .attr('viewBox', [0, 0, newWidth, newHeight]);

                projection.scale(newWidth * 4.5)
                    .translate([newWidth / 2, newHeight / 2]);

                regionPaths.attr('d', path);
            };

            window.addEventListener('resize', resizeMap);

            return () => {
                window.removeEventListener('resize', resizeMap);
            };
        };

        // activeRegion 변경 감지
        watch(activeRegion, (newValue) => {
            console.log("Active region changed to:", newValue);
        });

        // 컴포넌트 마운트 시 처리
        onMounted(() => {
            // 마우스 이벤트 리스너 등록
            window.addEventListener('mousemove', updateMousePosition);

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
            getActiveRegion,
            selectRegion,
            resetActiveRegion
        };
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

.look-around-page {
    font-family: 'Noto Sans KR', sans-serif;
    min-height: 100vh;
    background-color: #f3f4f6;
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
    position: relative;
    padding: 2rem 1rem 3rem;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* 맵 뷰 선택 탭 */
.map-view-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    position: relative;
    z-index: 5;
}

.tab-button {
    background-color: #76b39d;
    color: white;
    border: none;
    padding: 0.8rem 3rem;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: 700;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    font-family: 'Noto Sans KR', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab-button:hover {
    background-color: #40c4aa;
    transform: translateY(-2px);
}

/* 지도 섹션 */
.map-section {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 750px;
    background-color: #fcfcfa;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    margin-bottom: 2rem;
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
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    max-height: 0;
    opacity: 0;
    transition: all 0.5s ease;
    color: #333;
    margin-top: 0;
    width: 100%;
    position: relative;
}

.region-info-panel.active {
    padding: 2.5rem 2rem 2rem;
    max-height: 5000px;
    opacity: 1;
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
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #76b39d;
}

.region-description {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    color: #555;
}

/* 섹션 제목 */
.section-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
    color: #48b0e4;
    border-left: 4px solid #48b0e4;
    padding-left: 12px;
}

/* 인기 여행지 TOP 5 */
.popular-destinations {
    margin-bottom: 3rem;
}

.popular-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
}

.popular-item {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.popular-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.popular-image {
    height: 150px;
    background-color: #e5e7eb;
    background-size: cover;
    background-position: center;
}

.popular-content {
    padding: 1rem;
}

.popular-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #333;
}

.popular-rating {
    color: #ffd166;
    font-size: 0.9rem;
}

/* 여행지 그리드 */
.all-destinations {
    margin-top: 1rem;
}

.destinations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.destination-card {
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid #f3f4f6;
}

.destination-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.destination-image {
    height: 180px;
    background-size: cover;
    background-position: center;
    transition: transform 0.5s ease;
}

.destination-card:hover .destination-image {
    transform: scale(1.05);
}

.destination-content {
    padding: 1.5rem;
}

.destination-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #333;
}

.destination-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #777;
    font-size: 0.85rem;
    margin-bottom: 1rem;
}

.destination-description {
    color: #555;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
}

.destination-button {
    padding: 0.5rem 1rem;
    background-color: #48b0e4;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.destination-button:hover {
    background-color: #3283ad;
    transform: translateY(-2px);
}

/* 푸터 */
.footer {
    margin-top: auto;
    background-color: #1F2937;
    padding: 1.5rem;
    text-align: center;
}

.footer p {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
}

/* 반응형 스타일 */
@media (max-width: 1200px) {
    .map-section {
        height: 600px;
    }

    .popular-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
}

@media (max-width: 900px) {
    .hero-title {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .destinations-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }

    .map-section {
        height: 500px;
    }

    .popular-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
}

@media (max-width: 600px) {
    .hero-section {
        height: 180px;
    }

    .hero-title {
        font-size: 1.5rem;
    }

    .hero-subtitle {
        font-size: 0.9rem;
    }

    .destinations-grid {
        grid-template-columns: 1fr;
    }

    .popular-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .region-info-panel.active {
        padding: 1.5rem;
    }

    .region-title {
        font-size: 1.5rem;
    }

    .map-section {
        height: 400px;
    }

    .tab-button {
        padding: 0.6rem 2rem;
        font-size: 0.9rem;
    }
}
</style>