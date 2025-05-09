<template>
    <div class="map-container">
      <div class="korea-map-3d" :class="{ 'with-hover': hoveredRegion !== null }">
        <!-- 한반도 기본 형태 -->
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 400 600" 
          class="korea-svg"
          @mouseleave="resetHover"
        >
          <!-- 북한 영역 -->
          <path 
            class="north-korea region-path"
            d="M180,50 L240,70 L290,120 L280,150 L260,170 L210,180 L190,190 L170,180 L150,190 L130,160 L100,150 L120,130 L150,120 L160,100 Z"
            @mouseover="hoverRegion('north')"
            @click="selectRegion('north')"
          />
  
          <!-- 서울/경기 영역 -->
          <path 
            class="seoul-gyeonggi region-path"
            d="M150,190 L170,180 L190,190 L190,210 L170,220 L150,220 L140,210 Z"
            @mouseover="hoverRegion('seoul')"
            @click="selectRegion('seoul')"
          />
          
          <!-- 강원도 영역 -->
          <path 
            class="gangwon region-path"
            d="M190,190 L210,180 L260,170 L270,200 L260,230 L240,240 L200,230 L190,210 Z"
            @mouseover="hoverRegion('gangwon')"
            @click="selectRegion('gangwon')"
          />
          
          <!-- 충청도 영역 -->
          <path 
            class="chungcheong region-path"
            d="M140,210 L150,220 L170,220 L190,210 L200,230 L190,260 L160,270 L130,260 L130,240 Z"
            @mouseover="hoverRegion('chungcheong')"
            @click="selectRegion('chungcheong')"
          />
          
          <!-- 전라도 영역 -->
          <path 
            class="jeolla region-path"
            d="M130,260 L160,270 L190,260 L190,280 L170,310 L120,320 L100,300 L90,280 L110,270 Z"
            @mouseover="hoverRegion('jeolla')"
            @click="selectRegion('jeolla')"
          />
          
          <!-- 경상도 영역 -->
          <path 
            class="gyeongsang region-path"
            d="M190,260 L200,230 L240,240 L260,230 L280,250 L270,290 L240,320 L210,330 L190,320 L170,310 L190,280 Z"
            @mouseover="hoverRegion('gyeongsang')"
            @click="selectRegion('gyeongsang')"
          />
          
          <!-- 제주도 영역 -->
          <ellipse 
            class="jeju region-path"
            cx="140" cy="370" rx="40" ry="20"
            @mouseover="hoverRegion('jeju')"
            @click="selectRegion('jeju')"
          />
          
          <!-- 지역 경계선 (도 경계) -->
          <path 
            class="region-border"
            d="M180,50 L240,70 L290,120 L280,150 L260,170 L210,180 L190,190 L170,180 L150,190 L130,160 L100,150 L120,130 L150,120 L160,100 Z
               M150,190 L170,180 M190,190 L190,210 M170,180 L190,190 M150,190 L140,210 
               M210,180 L260,170 M190,190 L210,180 M270,200 L260,230 M240,240 L200,230 M190,210 L200,230
               M140,210 L150,220 M170,220 L190,210 M200,230 L190,260 M160,270 L130,260 M130,240 L140,210
               M130,260 L160,270 M190,260 L190,280 M170,310 L120,320 M100,300 L90,280 M110,270 L130,260
               M190,260 L200,230 M240,240 L260,230 M280,250 L270,290 M240,320 L210,330 M190,320 L170,310 M190,280 L190,260"
            fill="none"
            stroke="#999"
            stroke-width="1.5"
          />
        </svg>
  
        <!-- 지역명 라벨 -->
        <div v-if="hoveredRegion" class="region-label">{{ getRegionName(hoveredRegion) }}</div>
        
        <!-- 3D 효과를 위한 그림자 -->
        <div class="map-shadow"></div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'KoreaMap3D',
    
    emits: ['region-selected'],
    
    setup(props, { emit }) {
      const hoveredRegion = ref(null);
      const selectedRegion = ref(null);
      
      // 지역에 마우스 오버시
      const hoverRegion = (region) => {
        hoveredRegion.value = region;
      };
      
      // 마우스 리셋
      const resetHover = () => {
        hoveredRegion.value = null;
      };
      
      // 지역 선택시
      const selectRegion = (region) => {
        selectedRegion.value = region;
        emit('region-selected', region);
      };
      
      // 지역명 반환
      const getRegionName = (regionId) => {
        const regionNames = {
          'north': '북한',
          'seoul': '서울/경기',
          'gangwon': '강원도',
          'chungcheong': '충청도',
          'jeolla': '전라도',
          'gyeongsang': '경상도',
          'jeju': '제주도'
        };
        
        return regionNames[regionId] || '';
      };
      
      return {
        hoveredRegion,
        selectedRegion,
        hoverRegion,
        resetHover,
        selectRegion,
        getRegionName
      };
    }
  };
  </script>
  
  <style scoped>
  .map-container {
    width: 100%;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
    margin: 2rem 0;
  }
  
  .korea-map-3d {
    position: relative;
    width: 300px;
    height: 450px;
    transform-style: preserve-3d;
    transform: rotateX(60deg) rotateZ(-5deg) rotateY(5deg);
    transition: transform 0.8s ease;
  }
  
  .korea-svg {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateZ(10px);
  }
  
  .region-path {
    fill: #ffffff;
    stroke: #e0e0e0;
    stroke-width: 0.5;
    transition: all 0.3s ease;
    transform: translateZ(10px);
    cursor: pointer;
  }
  
  .region-path:hover {
    fill: #f0f0f0;
    transform: translateZ(20px);
    filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2));
  }
  
  .north-korea.region-path {
    fill: #f0f0f0;
    stroke: #e0e0e0;
  }
  
  .region-border {
    pointer-events: none;
  }
  
  .korea-map-3d.with-hover {
    transform: rotateX(55deg) rotateZ(-5deg) rotateY(10deg);
  }
  
  .map-shadow {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    filter: blur(20px);
    transform: translateZ(-20px);
    z-index: -1;
    border-radius: 50%;
  }
  
  .region-label {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%) translateZ(50px);
    background-color: rgba(255, 255, 255, 0.9);
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    pointer-events: none;
  }
  
  /* 애니메이션 효과 */
  @keyframes float {
    0%, 100% {
      transform: translateZ(10px);
    }
    50% {
      transform: translateZ(15px);
    }
  }
  
  .korea-map-3d {
    animation: float 6s infinite ease-in-out;
  }
  </style>