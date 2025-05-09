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
            2D 지도
          </button>
        </div>
        
        <div class="map-section">
          <!-- 2D 한국 지도 컴포넌트 -->
          <KoreaMap 
            :activeRegion="activeRegion" 
            @region-selected="selectRegion"
            class="map-component"
          />
        </div>
        
        <!-- 지역 정보 패널 -->
        <div class="region-info-panel" :class="{ 'active': activeRegion !== null }">
          <div class="close-button" @click="activeRegion = null">×</div>
          
          <div v-if="activeRegion" class="region-info">
            <h2 class="region-title">{{ getActiveRegion.name }}</h2>
            <p class="region-description">{{ getActiveRegion.description }}</p>
            
            <div class="destinations-grid">
              <div 
                v-for="destination in getActiveRegion.destinations" 
                :key="destination.id"
                class="destination-card"
              >
                <div class="destination-image" :style="{ backgroundImage: `url(${destination.imageUrl})` }"></div>
                <div class="destination-content">
                  <h3 class="destination-name">{{ destination.name }}</h3>
                  <div class="destination-location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      
      <!-- 푸터 -->
      <footer class="footer">
        <p>© 2025 LOG:O - 당신의 여행을 기록하다</p>
      </footer>
    </div>
  </template>
  
  <script>
  import Header from '@/components/Header.vue';
  import KoreaMap from '@/components/KoreaMap.vue';
  import { ref, computed } from 'vue';
  
  export default {
    name: 'LookAround',
    
    components: {
      Header,
      KoreaMap
    },
    
    setup() {
      // 활성화된 지역 ID
      const activeRegion = ref(null);
      
      // 지역 데이터
      const regionsData = ref({
        'north': {
          id: 'north',
          name: '북한',
          color: '#f0f0f0',
          description: '북한은 한반도의 북부에 위치한 국가입니다. 백두산, 금강산 등 자연 경관이 뛰어나며, 평양, 개성 등의 도시가 있습니다.',
          destinations: [
            {
              id: 'north-1',
              name: '금강산',
              location: '강원도 고성/금강군',
              description: '동해에 면한 태백산맥에 있는 산으로, 뛰어난 경관으로 유명한 명승지입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1588600178198-4557d08aabc9?q=80&w=600'
            },
            {
              id: 'north-2',
              name: '평양',
              location: '평안남도',
              description: '북한의 수도로, 평양 중앙동물원, 주체사상탑 등이 있습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1630355330467-a8a0358abb93?q=80&w=600'
            },
            {
              id: 'north-3',
              name: '백두산',
              location: '양강도 삼지연군',
              description: '한반도 최북단에 위치한 명산으로, 천지라 불리는 화산 호수가 있습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1548913355-d8ba9cf3193e?q=80&w=600'
            }
          ]
        },
        'seoul': {
          id: 'seoul',
          name: '서울/경기',
          color: '#ffffff',
          description: '서울은 대한민국의 수도이며, 경기도는 서울을 둘러싸고 있는 지역으로 도시와 자연이 공존하는 다양한 여행지가 있습니다.',
          destinations: [
            {
              id: 'seoul-1',
              name: '경복궁',
              location: '서울 종로구',
              description: '조선 왕조의 법궁으로, 웅장한 건축물과 아름다운 정원이 특징입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1598258710957-65212bd19773?q=80&w=600'
            },
            {
              id: 'seoul-2',
              name: '남산서울타워',
              location: '서울 용산구',
              description: '서울의 중심에 위치한 랜드마크로, 도시의 환상적인 전망을 감상할 수 있습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1546874177-9e664107314e?q=80&w=600'
            },
            {
              id: 'seoul-3',
              name: '에버랜드',
              location: '경기도 용인시',
              description: '한국 최대의 테마파크로, 다양한 놀이기구와 계절별 축제가 열립니다.',
              imageUrl: 'https://images.unsplash.com/photo-1670214993562-bbc30095bc6a?q=80&w=600'
            }
          ]
        },
        'gangwon': {
          id: 'gangwon',
          name: '강원도',
          color: '#ffffff',
          description: '한국의 대표적인 산악 지역인 강원도는 설악산과 오대산 등 아름다운 자연 경관으로 유명합니다. 겨울에는 스키장, 여름에는 해변이 인기 있는 사계절 관광지입니다.',
          destinations: [
            {
              id: 'gangwon-1',
              name: '설악산 국립공원',
              location: '강원도 속초시',
              description: '웅장한 바위 봉우리와 계곡이 있는 한국의 대표적인 국립공원입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f13fde?q=80&w=600'
            },
            {
              id: 'gangwon-2',
              name: '강릉 경포대',
              location: '강원도 강릉시',
              description: '아름다운 경포호수와 동해가 만나는 경포대는 일출 명소로 유명합니다.',
              imageUrl: 'https://images.unsplash.com/photo-1610011224685-92d8aac2752b?q=80&w=600'
            },
            {
              id: 'gangwon-3',
              name: '평창 용평리조트',
              location: '강원도 평창군',
              description: '2018 동계올림픽이 개최된 곳으로, 최고의 스키 리조트 중 하나입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600'
            }
          ]
        },
        'chungbuk': {
          id: 'chungbuk',
          name: '충청북도',
          color: '#ffffff',
          description: '충청북도는 내륙에 위치한 지역으로, 충주호와 단양의 절경, 그리고 역사적인 유적지가 많이 있습니다.',
          destinations: [
            {
              id: 'chungbuk-1',
              name: '단양 도담삼봉',
              location: '충청북도 단양군',
              description: '남한강 물줄기 가운데 우뚝 솟은 세 개의 봉우리로 유명한 명승지입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1592471047092-39223dd80995?q=80&w=600'
            },
            {
              id: 'chungbuk-2',
              name: '청남대',
              location: '충청북도 청주시',
              description: '이전 대통령의 휴양지로 사용되었던 곳으로 지금은 관광지로 개방되었습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1591208333284-4f1185a1c087?q=80&w=600'
            },
            {
              id: 'chungbuk-3',
              name: '수안보온천',
              location: '충청북도 충주시',
              description: '한국의 대표적인 온천 중 하나로, 라듐 성분을 함유한 온천수로 유명합니다.',
              imageUrl: 'https://images.unsplash.com/photo-1581154306224-8449efd38f31?q=80&w=600'
            }
          ]
        },
        'chungnam': {
          id: 'chungnam',
          name: '충청남도',
          color: '#ffffff',
          description: '충청남도는 서해안을 끼고 있으며 산과 바다가 어우러진 자연 경관이 아름다운 지역입니다.',
          destinations: [
            {
              id: 'chungnam-1',
              name: '태안 해안국립공원',
              location: '충청남도 태안군',
              description: '아름다운 해변과 소나무 숲이 어우러진 해안 국립공원입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600'
            },
            {
              id: 'chungnam-2',
              name: '공주 공산성',
              location: '충청남도 공주시',
              description: '백제 시대의 왕성으로, 유네스코 세계문화유산으로 등재되었습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?q=80&w=600'
            },
            {
              id: 'chungnam-3',
              name: '부여 궁남지',
              location: '충청남도 부여군',
              description: '백제 시대의 궁궐 연못으로, 아름다운 풍경과 함께 역사적 의미가 있는 곳입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1591289009723-somefakeurl?q=80&w=600'
            }
          ]
        },
        'jeonbuk': {
          id: 'jeonbuk',
          name: '전라북도',
          color: '#ffffff',
          description: '전라북도는 한반도 남서부에 위치하며, 전통문화와 자연환경이 잘 보존된 곳입니다.',
          destinations: [
            {
              id: 'jeonbuk-1',
              name: '전주 한옥마을',
              location: '전라북도 전주시',
              description: '700여 채의 한옥이 모여 있는 전통마을로, 한국 전통 문화를 체험할 수 있습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1604382574483-86981b92fc57?q=80&w=600'
            },
            {
              id: 'jeonbuk-2',
              name: '내장산 국립공원',
              location: '전라북도 정읍시',
              description: '가을 단풍으로 유명한 국립공원으로, 아름다운 산과 계곡이 있습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?q=80&w=600'
            },
            {
              id: 'jeonbuk-3',
              name: '무주 리조트',
              location: '전라북도 무주군',
              description: '사계절 종합 리조트로, 특히 겨울 스키장으로 인기가 많습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1551698618-8d7bfef448c7?q=80&w=600'
            }
          ]
        },
        'gwangju': {
          id: 'gwangju',
          name: '전라남도',
          color: '#ffffff',
          description: '전라남도는 한반도 남서쪽 끝에 위치하며, 아름다운 해안선과 섬, 그리고 풍부한 문화유산을 자랑합니다.',
          destinations: [
            {
              id: 'gwangju-1',
              name: '순천만 국가정원',
              location: '전라남도 순천시',
              description: '대한민국 최초의 국가정원으로, 다양한 테마 정원과 생태 습지가 있습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600'
            },
            {
              id: 'gwangju-2',
              name: '여수 해상케이블카',
              location: '전라남도 여수시',
              description: '바다 위를 지나는 케이블카로, 아름다운 여수 앞바다와 오동도를 감상할 수 있습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1544958360-d7e4c057c64d?q=80&w=600'
            },
            {
              id: 'gwangju-3',
              name: '보성 녹차밭',
              location: '전라남도 보성군',
              description: '아름다운 경관을 자랑하는 한국 최대의 녹차 재배지입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1528826013548-0428496b8c7d?q=80&w=600'
            }
          ]
        },
        'daegu': {
          id: 'daegu',
          name: '경상북도',
          color: '#ffffff',
          description: '경상북도는 한국 동북부에 위치한 지역으로, 신라의 고도 경주를 비롯한 풍부한 역사 유적이 있습니다.',
          destinations: [
            {
              id: 'daegu-1',
              name: '경주 불국사',
              location: '경상북도 경주시',
              description: '신라 시대의 대표적인 사찰로, 유네스코 세계문화유산으로 등재되었습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1597117641416-4eb2c16e79a0?q=80&w=600'
            },
            {
              id: 'daegu-2',
              name: '안동 하회마을',
              location: '경상북도 안동시',
              description: '조선 시대의 양반 마을로, 전통 가옥과 문화가 잘 보존되어 있습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1564295644023-16f14ac50b93?q=80&w=600'
            },
            {
              id: 'daegu-3',
              name: '독도',
              location: '경상북도 울릉군',
              description: '한국 동해에 위치한 섬으로, 아름다운 자연 경관을 자랑합니다.',
              imageUrl: 'https://images.unsplash.com/photo-1596097155664-4f5c49ba1b69?q=80&w=600'
            }
          ]
        },
        'gyeongnam': {
          id: 'gyeongnam',
          name: '경상남도',
          color: '#ffffff',
          description: '경상남도는 한국 남동부에 위치한, 산과 바다가 공존하는 지역입니다.',
          destinations: [
            {
              id: 'gyeongnam-1',
              name: '통영',
              location: '경상남도 통영시',
              description: '아름다운 항구도시로, 한려해상국립공원과 케이블카가 유명합니다.',
              imageUrl: 'https://images.unsplash.com/photo-1587472164775-5b8bf4d11f9e?q=80&w=600'
            },
            {
              id: 'gyeongnam-2',
              name: '지리산 국립공원',
              location: '경상남도 하동군',
              description: '한국에서 가장 큰 국립공원 중 하나로, 아름다운 자연 경관을 자랑합니다.',
              imageUrl: 'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?q=80&w=600'
            },
            {
              id: 'gyeongnam-3',
              name: '남해 독일마을',
              location: '경상남도 남해군',
              description: '독일식 건축양식의 마을로, 아름다운 풍경을 자랑합니다.',
              imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=600'
            }
          ]
        },
        'jeju': {
          id: 'jeju',
          name: '제주도',
          color: '#ffffff',
          description: '한국의 남쪽에 위치한 화산섬으로, 아름다운 자연 경관과 독특한 문화가 특징입니다. 한라산, 폭포, 용암 동굴, 그리고 아름다운 해변으로 유명한 인기 관광지입니다.',
          destinations: [
            {
              id: 'jeju-1',
              name: '성산일출봉',
              location: '제주도 서귀포시',
              description: '화산 활동으로 만들어진 봉우리로, 유네스코 세계자연유산으로 등재되었습니다.',
              imageUrl: 'https://images.unsplash.com/photo-1596450614279-fca86a7cd432?q=80&w=600'
            },
            {
              id: 'jeju-2',
              name: '한라산',
              location: '제주도 중앙',
              description: '한국에서 가장 높은 산으로, 다양한 등산로와 아름다운 경관을 자랑합니다.',
              imageUrl: 'https://images.unsplash.com/photo-1612734347103-12ca000be14c?q=80&w=600'
            },
            {
              id: 'jeju-3',
              name: '협재 해수욕장',
              location: '제주도 제주시',
              description: '에메랄드빛 바다와 하얀 모래사장이 아름다운 제주의 대표적인 해변입니다.',
              imageUrl: 'https://images.unsplash.com/photo-1540710920692-856f0e858e96?q=80&w=600'
            }
          ]
        }
      });
      
      // 지역 선택 함수
      const selectRegion = (regionId) => {
        if (activeRegion.value === regionId) {
          activeRegion.value = null; // 이미 선택된 지역을 다시 클릭하면 선택 해제
        } else {
          activeRegion.value = regionId; // 새 지역 선택
        }
      };
      
      // 활성화된 지역 정보 가져오기
      const getActiveRegion = computed(() => {
        if (!activeRegion.value) return null;
        // 선택된 지역이 어느 지도에서든 공통되도록 매핑
        let regionKey = activeRegion.value;
        
        // 충청도 지역 매핑 (KoreaMap3D는 충청도로 통합되어 있음)
        if (regionKey === 'chungcheong') {
          // 충청도가 선택되었을 때 우선 충청북도 정보 표시
          regionKey = 'chungbuk';
        }
        
        return regionsData.value[regionKey];
      });
      
      return {
        activeRegion,
        getActiveRegion,
        selectRegion
      };
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
  
  .look-around-page {
    font-family: 'Noto Sans KR', sans-serif;
    min-height: 100vh;
    background-color: #3883b5; /* 이미지와 비슷한 파란색 배경 */
    color: white;
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
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(56, 131, 181, 0.9));
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
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
    font-weight: 300;
    margin: 0;
    opacity: 0.9;
  }
  
  /* 컨텐츠 영역 */
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
    background-color: white;
    color: #3883b5;
    border: none;
    padding: 0.8rem 3rem;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: 700;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    font-family: 'Noto Sans KR', sans-serif;
  }
  
  /* 지도 섹션 - 크기 조정 */
  .map-section {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 700px; /* 지도 크기 키움 */
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    position: relative;
  }
  
  .map-component {
    width: 90%; /* 지도 크기 조정 */
    height: 90%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* 지역 정보 패널 */
  .region-info-panel {
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    max-height: 0;
    opacity: 0;
    transition: all 0.5s ease;
    color: #333;
    margin-top: -2rem; /* 지도와 패널 간격 조정 */
  }
  
  .region-info-panel.active {
    padding: 2rem;
    max-height: 2000px;
    opacity: 1;
  }
  
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 30px;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #333;
    z-index: 5;
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
    color: #3883b5;
  }
  
  .region-description {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    color: #555;
  }
  
  /* 여행지 그리드 */
  .destinations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
  .destination-card {
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .destination-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
    background-color: #3883b5;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .destination-button:hover {
    background-color: #2d6b94;
  }
  
  /* 푸터 */
  .footer {
    margin-top: auto;
    background-color: rgba(0, 0, 0, 0.2);
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