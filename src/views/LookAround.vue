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
            <!-- 맵 뷰 선택 탭 -->
            <div class="map-view-tabs">
                <button class="tab-button active">
                    D3 지도
                </button>
            </div>

            <!-- 지도 섹션 -->
            <div class="map-section">
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
    name: 'LookAround2',

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
                top: `${mousePosition.value.y - 30}px`
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

            // 모든 지역 선택 상태 초기화
            map.selectAll('.region')
                .classed('selected', false)
                .attr('fill', '#eaeaea')
                .attr('stroke-width', 0.5);

            // 선택된 지역 강조
            if (activeRegion.value) {
                map.select(`#region-${activeRegion.value}`)
                    .classed('selected', true)
                    .attr('fill', '#76b39d')
                    .attr('stroke-width', 1.5);
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

            // 지도 그룹 요소
            const g = svg.append('g');
            map = g; // 전역 참조 저장

            // 지도 투영법 설정
            const projection = d3.geoMercator()
                .center([127.5, 35.8]) // 한국 중심 좌표
                .scale(width * 4.5) // 스케일 조정
                .translate([width / 2, height / 2]);

            // 경로 생성기
            const path = d3.geoPath().projection(projection);

            // 지도 데이터 로드 및 그리기
            const regions = g.selectAll('path')
                .data(koreaGeoJson.features)
                .enter()
                .append('path')
                .attr('class', d => activeRegion.value === d.properties.code ? 'region selected' : 'region')
                .attr('id', d => `region-${d.properties.code}`)
                .attr('data-name', d => d.properties.name)
                .attr('d', path)
                .attr('fill', '#eaeaea') // 기본 색상 - 연한 회색
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 0.5)
                .style('cursor', 'pointer');

            // 지역 호버 이벤트
            regions.on('mouseover', function (event, d) {  // event와 d 매개변수 모두 유지
                console.log("Hover detected on:", d.properties.name);

                const regionCode = d.properties.code;
                hoveredRegion.value = regionCode;
            });

            // 지역 호버 아웃 이벤트
            regions.on('mouseout', function () {  // 매개변수가 필요 없으면 생략 가능
                hoveredRegion.value = null;
            });

            // 지역 클릭 이벤트
            regions.on('click', function (event, d) {  // event와 d 매개변수 모두 유지
                console.log("Click detected on:", d.properties.name);

                const regionCode = d.properties.code;
                selectRegion(regionCode);
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

                regions.attr('d', path);
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
    /* 변경된 배경색 - 밝은 회색 */
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
    /* 변경된 그라디언트 색상 */
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
    /* 변경된 버튼 색상 - 로고 그린 */
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
    /* 호버 시 색상 - 로고 틸 */
    transform: translateY(-2px);
}

/* 지도 섹션 - 높이 증가 */
.map-section {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 650px;
    /* 높이 증가 */
    background-color: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    margin-bottom: 2rem;
}

.map-component {
    width: 100%;
    height: 100%;
    position: relative;
}

/* 지역 호버 및 선택 효과 */
:deep(.region) {
    transition: transform 0.3s ease, fill 0.3s ease, filter 0.3s ease, stroke-width 0.2s ease;
    cursor: pointer;
    transform-origin: center center;
}

:deep(.region:hover:not(.selected)) {
    transform: translate(0, -4px) scale(1.02);
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
}

:deep(.region.selected) {
    fill: #76b39d !important;
    /* 선택된 상태는 여전히 색상 변경 */
    filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.3));
}

/* 지역 툴팁 */
.region-tooltip {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    pointer-events: none;
    z-index: 1000;
    transform: translate(-50%, -100%);
    white-space: nowrap;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
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
    /* 크기 증가 - 콘텐츠 증가에 따라 */
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
    /* 변경된 색상 - 로고 그린 */
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
    /* 로고 블루 색상 */
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
    /* 플레이스홀더 색상 */
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
    /* 별 색상 - 로고 옐로우 */
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
    /* 로고 블루 색상 */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.destination-button:hover {
    background-color: #3283ad;
    /* 더 진한 블루 색상 */
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