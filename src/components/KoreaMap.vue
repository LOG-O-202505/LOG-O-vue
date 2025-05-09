<template>
    <div class="korea-map-container">
      <svg
        class="korea-map"
        viewBox="0 0 300 350"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 서울 -->
        <path
          :class="['region', { active: activeRegion === 'seoul' }]"
          d="M111.84 61.03L113.06 61.02L114.11 60.64L115.02 60.63L115.36 61.45L115.24 62.29L114.62 62.6L113.94 63.05L113.95 64.07L114.31 64.48L113.55 65.52L113.12 66.26L111.97 66.95L110.69 67.24L109.38 67.9L108.87 66.73L107.75 66.98L106.64 67.33L105.86 67.78L105.04 67.91L103.13 67.85L101.82 66.12L100.53 65.73L99.64 65.15L99.4 63.53L98.51 62.27L97.46 60.97L98.13 59.53L99.38 59.61L100.81 60.49L101.87 60.13L102.82 59.55L102.89 58.58L103.15 57.69L105.15 57.49L106.18 56.18L106.81 54.85L107.7 53.9L109.09 53.56L110.7 53.69L111.46 55.02L111.76 56.81L112.22 58.06L112.25 59.44L111.84 61.03z"
          @click="selectRegion('seoul')"
          @mouseover="hoverRegion('seoul')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'seoul' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 인천 -->
        <path
          :class="['region', { active: activeRegion === 'incheon' }]"
          d="<!-- 인천 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('incheon')"
          @mouseover="hoverRegion('incheon')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'incheon' ? '#bc5151' : '#a3a3a3'"
        />
  
        <!-- 경기도 -->
        <path
          :class="['region', { active: activeRegion === 'gyeonggi' }]"
          d="M161.96,213.36l.13-.17-.03-.38.23-.12h.48l.18-.29-.25-.42-.67-.75-.56-.13-.6.45-.31.5-.05.29.28.42.49.34.26.13.42.12ZM154.11,212.26l-1.5-.25-1.04.22-1.1.43-.86.15-.54-.96-.96-.32-.38-.27-.25-.5-.21-.95-.18-.38,1-1.05.39-.68.06-.72-.35-.68-.59-.53-.68-.21-.59.29-.72.56-.26.34-.21,1.2-.27.18-.35.06-.34.25-.51.98-.12.96.16.97,1.23,4.02.1.69v.48s.08.4.08.4l.28.49.41.27.67.23.63-.02.27-.48.15-1.13.4-.92.58-.4.73.4.5,2.2.44,1.05.73-.1.83-.38.7.31.65.39.69-.13.19-.55-.38-1.1.36-.2.25-.28.04-.64-.12-1.12.13-.71.25-.58.13-.54-.23-.62-.31-.12ZM163.63,222.32l-.2-.02v-.34s-1.42-.76-1.42-.76l-.3.08-.18.17-.02.3-.12.25-.02.27.2.15.17.04.2.2.04.28-.16.35.04.2.27-.06.23-.22.48-.24.35-.05.42.09.29-.04.19-.13.43-.53.07-.29-.11-.12-.84.42ZM154.56,210.74l-.26-.36-.25-.9-.1-.65-.22-.12-.23-.22-.13-.38-.43.07-.52.83-.26.59-.24-.16-.04-.5.16-.6.31-.88-.23-.6-.71.19-.41.52-.39.74-.61.79-.31.84.39.77.66.41.65.08,1.1-.36,2.02.53.47-.12-.25-.37-.18-.14ZM207.78,184.91l-1.27-.45-.97-.96-.3-1.52-1.02-.8-2.3-1.27-1.93-2.21-1.16-.88-2.75-.42-.67-1.35,1.12-2.25-.19-2.18-1.25.42-1.32-.62-1.72-.43-1.61.66-.51.66-.61.53-.65.08-.64.24-1.45,1.15-1.67-.05-1.39-.73-1.46-.45-1.67.3-1.62.18-1.4-.89-1.13-1.38-.37-3.04-1.03.8-1.1,1.57-1.22-.25-2.39,1.23-1.27-.26-1.14-.86-1.21-.58-1.29-.22-1.35.19-2.75-.12-.7-2.54.54-1.24.03-1.3-.6-.7-.69-.43-.15-.47-.25-.51-.99-.7-.6-1.13-.85-.92-1.15-.39h-1.26s-1.28-.09-1.28-.09l-.72-.49-.59-.49-1.35-.11-.36-.12-.36-.16-.18-.45-.04-.44-.41-.35-.42-.31-.9-.53-.36-1.22-1.63,1.76-.43,1.16-2.22,1.18-1.1.34-.61-.07-.44.28-.84,1.82-.96,1.01-1.02.91-.5,1.44-.13,1.69-.56,1.23-.69,1.3-.52,1.66-.38,1.71-.62,1.27-.05,1.38,1.14.48.17.61.08.69.49,1.29-.08,1.4.46,1.03.64.43-.27,1.5-1.86,2.23-.3,1.46-.06,1.35-.94.96-.24,1.19.92,1.08.45,1.4.19,2.9.6,1.09,1.1.8,1,1.05.39,1.15.48,1.01,2.78,3.03.6,1.48v1.01s.11.24.11.24h0s.47.13.47.13l.66.55.27-.26.35-.04.43.11.48.19,1.19-.11.93-.84.48-1.39.13-1.76.5.39.28.53.47,1.31,1.16-.73,1.21.03.56-.38-.82-1.93,1.07-.09.71-.73.57-.98.7-.84-.05.67-.2.52-.23.4-.13.3-.07.65.07,4.04-.07.37-.11.41-.02.43.21.44.37.2,1.05.09.64.15.5-.09.21.05.05.21v.8s.11.29.11.29l.82.46,2.07-.09.94.16-.02-.81.09-.84.25-.66.45-.27,1.01.1.49.32.94,1.27,1.04-.07.73-1.42.73-.72,1.01,2.04-1.03.4-.46.29.09.45.64.89.58.23,2.77.31-.22.37-.37.07h-.86s-.02.84-.02.84l1.34.09,1-.3,1.13-1.47.62-1.12-.6-.71-.14.54-.31.43-.39.13-.41-.39.33-2.23.06-1.13v-.41s-.06-.28-.06-.28l-.3-.47-.4-.23-.21-.26.3-.53.58.24.87.04.87-.15.57-.32.36-.73-.09-.63-.27-.7-.15-.96-.76.05-4.45,2.37v-.37l.48-.49.09-.75.23-.69,1.75-.48,1.53-.77.83-.17-.52-.73-.03-.38.4-.2,1.48-.28.68.04,2.41.85.31.25.43.45.15.35.02.36.13.29.48.11h.9s.39-.11.39-.11l.39-.26-.32-.08-.55-.24-.35-.05.21-.73-.11-.51-.74-1.01-.38-.66-.19-.51-.32-1.44-.57-1.18v-.58s.57-.88.57-.88l.51-.47.26.15.45,1.44-.17.41.37,1.1-.2.77.9-.36.61.5.55.8.71.56.03-.84.32-.5.38-.16.19.2v2.39l.69-.53.53.06.49.91,1.04.47.45-.21.41-1.51.3.53.17,1,2.94-.05,1.11.13.32-1.31.39-.87.3.04-.04,1.04.04,1.11.62-.04,1.36-2.41.4-.6.21.19.37-.68.68-.84.64-.97.47-3.23.64-.79.85-.62,1.05-.42,1.13.04.88.56.25,1.2.8,1.11,1.02.83.81,1.04.9.92.09.2.08-.16.43-.89.79-.96.71-1.51.51-1.03v-.31s-.27-.75-.27-.75l.3-.45.26-.52.08-1.01.21-.73-.18-.16ZM188.21,198.91l-.51.05-.47.27-.12.39.24.43.15.45-.05.39.12.28.34.35.22.95.11.24.23-.08.29-.4.2-1.13.02-1.38-.31-.69-.45-.13ZM184.54,208.42l-.43.3-.9.32.7-1.85.18-.65v-.72s-.19-.53-.19-.53l-.27-.51-.21-.64-.02-.32.29-2.02v-.53s-.21-.45-.21-.45l-.79-.31-.69.55-.25.99.53,1-3.13,1.78-.59-.07.05.87.21.93.47.81.83.54v.34l-.83-.06-.6-.29-.58-.38-.73-.31h-.46s-1.67.34-1.67.34l-.58.25-.68.44-.59.58-.29.62.14,1.04.52.78.64.7.51.79.71-.58,1.6-.71.46-.57.61.37-.24.96-.02.85-.32.6-1.11.23-.28.29-.03.63.2.63.41.29,1.38-.71-.23.8-.04.65.24.48.63.3-1.53,1.11.97-.07,3.23-1,.7-.61-.37-.42-.73-.31-.53-.41.25-.71.77-.9.14-.41.14-.76.51.37.84.44.78.27.34-.13-.12-.84-.58-1.23-.25-.73.61.26.39-.38.2-.68.05-.64-.04-.92-.15-.11ZM170.87,212.13l-.44-.43-.78.05-.69.17-.43.18-.3-.15-.53-.4-.69-.28-.52.13-.36.4.1.36.3.02.51-.16.8.28.43.34-.08.41-.43.34.21.17.58.09.12.36-.09.36h.37s.17.44.17.44l.32.41h.74s.46-.58.46-.58l.18-.33-.37-.3-.37-.07v-.14s.16-.11.16-.11l.45.18.19-.33-.16-.26.24-.44-.12-.7Z"
          @click="selectRegion('gyeonggi')"
          @mouseover="hoverRegion('gyeonggi')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'gyeonggi' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 강원도 -->
        <path
          :class="['region', { active: activeRegion === 'gangwon' }]"
          d="<!-- 강원도 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('gangwon')"
          @mouseover="hoverRegion('gangwon')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'gangwon' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 충청북도 -->
        <path
          :class="['region', { active: activeRegion === 'chungbuk' }]"
          d="<!-- 충청북도 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('chungbuk')"
          @mouseover="hoverRegion('chungbuk')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'chungbuk' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 충청남도 -->
        <path
          :class="['region', { active: activeRegion === 'chungnam' }]"
          d="<!-- 충청남도 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('chungnam')"
          @mouseover="hoverRegion('chungnam')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'chungnam' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 대전 -->
        <path
          :class="['region', { active: activeRegion === 'daejeon' }]"
          d="<!-- 대전 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('daejeon')"
          @mouseover="hoverRegion('daejeon')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'daejeon' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 전라북도 -->
        <path
          :class="['region', { active: activeRegion === 'jeonbuk' }]"
          d="<!-- 전라북도 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('jeonbuk')"
          @mouseover="hoverRegion('jeonbuk')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'jeonbuk' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 광주 -->
        <path
          :class="['region', { active: activeRegion === 'gwangjucity' }]"
          d="<!-- 광주 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('gwangjucity')"
          @mouseover="hoverRegion('gwangjucity')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'gwangjucity' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 전라남도 -->
        <path
          :class="['region', { active: activeRegion === 'gwangju' }]"
          d="<!-- 전라남도 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('gwangju')"
          @mouseover="hoverRegion('gwangju')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'gwangju' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 대구 -->
        <path
          :class="['region', { active: activeRegion === 'daegucity' }]"
          d="M184.41 155.8L184.07 155.7L183.65 155.74L183.68 156.1L183.62 156.57L183.2 157.67L183.19 158.02L183.06 158.54L182.06 159.14L179.48 158.47L178.04 158.32L177.4 158.83L176.76 159.94L176.42 160.23L176.01 159.89L175.46 159.54L174.67 158.9L174.14 157.87L173.49 157.23L172.8 156.96L172.53 155.94L173.15 155.08L173.82 155.08L174.54 154.96L174.73 154.44L174.81 153.89L174.42 153.74L173.99 153.67L174.47 152.59L175.24 151.75L174.96 149.23L177.06 147.49L179.9 147.11L182.26 146.95L184.05 148.27L184.62 149.26L184.59 149.69L184.38 150.06L184.39 151.45L184.75 151.99L185.23 152.4L185.32 153.28L185.35 154.21L185.11 155.08L184.41 155.8z"
          @click="selectRegion('daegucity')"
          @mouseover="hoverRegion('daegucity')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'daegucity' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 경상북도 -->
        <path
          :class="['region', { active: activeRegion === 'daegu' }]"
          d="<!-- 경상북도 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('daegu')"
          @mouseover="hoverRegion('daegu')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'daegu' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 울산 -->
        <path
          :class="['region', { active: activeRegion === 'ulsan' }]"
          d="M208.73 168.79L212.88 168.04L216.41 168.9L216.45 168.89L216.52 168.97L216.82 169.5L216.65 170.7L216.56 172.12L216.25 174.25L215.8 175.15L215.07 176.14L214.39 176.5L214.1 175.54L213.83 174.28L213.26 173.33L212.64 173.17L212.26 174.25L212.87 174.39L213.24 174.85L213.41 175.52L213.45 176.3L213.26 177.04L212.8 177.21L212.29 177.26L211.93 177.61L212 178.01L212.05 179.03L212.23 180.08L211.82 180.75L211.44 181.42L211.81 181.95L212.11 182.25L212.05 182.99L211.13 183.3L210.27 183.82L209.03 185.05L207.98 185.01L207.96 185.07L207.78 184.91L206.51 184.46L205.54 183.5L205.24 181.98L204.21 181.18L201.92 179.91L199.99 177.7L198.83 176.82L196.08 176.4L195.41 175.05L196.53 172.79L196.34 170.61L197.41 169.74L198.56 169.07L199.25 169.05L199.53 168.51L199.1 167.8L198.86 167.03L200.36 165.86L202.25 165.2L203.79 164.97L205.31 165.29L206.88 165.97L207.29 166.64L207.31 167.46L207.42 168.19L207.98 168.59L208.73 168.79z"
          @click="selectRegion('ulsan')"
          @mouseover="hoverRegion('ulsan')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'ulsan' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 부산 -->
        <path
          :class="['region', { active: activeRegion === 'busan' }]"
          d="<!-- 부산 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('busan')"
          @mouseover="hoverRegion('busan')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'busan' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 경상남도 -->
        <path
          :class="['region', { active: activeRegion === 'gyeongnam' }]"
          d="<!-- 경상남도 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('gyeongnam')"
          @mouseover="hoverRegion('gyeongnam')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'gyeongnam' ? '#bc5151' : '#a3a3a3'"
        />
        
        <!-- 제주도 -->
        <path
          :class="['region', { active: activeRegion === 'jeju' }]"
          d="<!-- 제주도 path 데이터 여기에 넣으세요 -->"
          @click="selectRegion('jeju')"
          @mouseover="hoverRegion('jeju')"
          @mouseleave="resetHover"
          :fill="activeRegion === 'jeju' ? '#bc5151' : '#a3a3a3'"
        />
      </svg>
      
      <!-- 지역 이름 호버 표시 -->
      <div v-if="hoveredRegion" class="region-tooltip" :style="tooltipStyle">
        {{ getRegionName(hoveredRegion) }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'KoreaMap',
    
    props: {
      activeRegion: {
        type: String,
        default: null
      }
    },
    
    emits: ['region-selected'],
    
    data() {
      return {
        hoveredRegion: null,
        mousePosition: { x: 0, y: 0 },
        regionNames: {
          seoul: '서울',
          incheon: '인천',
          gyeonggi: '경기도',
          gangwon: '강원도',
          chungbuk: '충청북도',
          chungnam: '충청남도',
          daejeon: '대전',
          jeonbuk: '전라북도',
          gwangju: '전라남도',
          gwangjucity: '광주',
          daegu: '경상북도',
          daegucity: '대구',
          gyeongnam: '경상남도',
          busan: '부산',
          ulsan: '울산',
          jeju: '제주도'
        }
      };
    },
    
    computed: {
      tooltipStyle() {
        return {
          left: `${this.mousePosition.x}px`,
          top: `${this.mousePosition.y}px`
        };
      }
    },
    
    mounted() {
      // 마우스 이동 감지 이벤트 리스너
      document.addEventListener('mousemove', this.updateMousePosition);
    },
    
    beforeUnmount() {
      // 컴포넌트 제거 전 이벤트 리스너 정리
      document.removeEventListener('mousemove', this.updateMousePosition);
    },
    
    methods: {
      selectRegion(regionId) {
        this.$emit('region-selected', regionId);
      },
      
      hoverRegion(regionId) {
        this.hoveredRegion = regionId;
      },
      
      resetHover() {
        this.hoveredRegion = null;
      },
      
      getRegionName(regionId) {
        return this.regionNames[regionId] || regionId;
      },
      
      updateMousePosition(event) {
        this.mousePosition = {
          x: event.clientX,
          y: event.clientY - 50  // 툴팁이 커서 위에 표시되도록 약간 위로 조정
        };
      }
    }
  };
  </script>
  
  <style scoped>
  .korea-map-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .korea-map {
    width: 100%;
    max-width: 500px;
    height: auto;
    transition: transform 0.3s ease;
  }
  
  .region {
    transition: all 0.3s ease;
    cursor: pointer;
    stroke: #fff;
    stroke-width: 0.5;
  }
  
  .region:hover {
    fill: #bc5151 !important;
    filter: drop-shadow(0 0 5px rgba(188, 81, 81, 0.5));
    transform: translateY(-2px);
  }
  
  .region.active {
    fill: #bc5151 !important;
    stroke: #fff;
    stroke-width: 1;
    filter: drop-shadow(0 0 8px rgba(188, 81, 81, 0.7));
  }
  
  .region-tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    pointer-events: none;
    z-index: 10;
    transform: translate(-50%, -100%);
    margin-top: -10px;
    white-space: nowrap;
  }
  
  .region-tooltip::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid rgba(0, 0, 0, 0.7);
  }
  
  /* 3D 효과 */
  .korea-map {
    filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2));
  }
  
  /* 애니메이션 효과 */
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.005);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .region.active {
    animation: pulse 2s infinite ease-in-out;
  }
  
  /* 반응형 스타일 */
  @media (max-width: 768px) {
    .korea-map {
      max-width: 400px;
    }
    
    .region-tooltip {
      font-size: 0.75rem;
      padding: 4px 8px;
    }
  }
  
  @media (max-width: 480px) {
    .korea-map {
      max-width: 300px;
    }
  }
  </style>