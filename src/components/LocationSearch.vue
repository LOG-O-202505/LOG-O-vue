<template>
  <div class="location-search">
    <!-- 위치 검색 입력 -->
    <div class="location-search-container">
      <input 
        type="text" 
        id="location-search"
        v-model="searchQuery"
        placeholder="위치 검색..." 
        class="location-search-input"
        @input="onSearchInput"
        @focus="showResults = true"
      >
      
      <!-- 검색 결과 목록 -->
      <div 
        v-if="showResults && predictions.length > 0" 
        class="location-results"
      >
        <div 
          v-for="prediction in predictions" 
          :key="prediction.place_id"
          class="location-result-item"
          @click="selectPlace(prediction)"
        >
          {{ prediction.description }}
        </div>
      </div>
      
      <div 
        v-if="showResults && searchQuery.length > 1 && predictions.length === 0" 
        class="location-results"
      >
        <div class="no-results">검색 결과가 없습니다.</div>
      </div>
    </div>
    
    <!-- 선택된 위치 표시 -->
    <div 
      v-if="selectedLocation" 
      class="selected-location-display"
    >
      <div class="selected-location">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{{ selectedLocation }}</span>
        <button 
          class="remove-location"
          @click="clearLocation"
        >×</button>
      </div>
    </div>
    
    <!-- 지도 표시 - 세로로 길게 -->
    <div 
      v-if="selectedLocation" 
      class="location-map-container"
    >
      <div 
        ref="mapContainer" 
        class="location-map"
      ></div>
    </div>
    
    <!-- 지도가 없을 때 표시할 영역 (높이 유지) -->
    <div 
      v-else
      class="empty-map-container"
    >
      <div class="empty-map-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p>위치를 검색하면 지도가 여기에 표시됩니다</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { searchPlaces, getPlaceDetails, createMap, loadGoogleMapsScript } from '@/services/map';
import { findRegionInfoFromLocation } from '@/services/api';

export default {
  name: 'LocationSearch',
  
  emits: ['location-selected'],
  
  setup(props, { emit }) {
    // 상태 변수
    const searchQuery = ref('');
    const predictions = ref([]);
    const selectedLocation = ref(null);
    const selectedPlaceDetails = ref(null);
    const showResults = ref(false);
    const mapContainer = ref(null);
    const mapInstance = ref(null);
    const mapMarker = ref(null);
    const isLoading = ref(false);
    
    // 컴포넌트 마운트 시 Google Maps 초기화
    onMounted(() => {
      console.log('LocationSearch 컴포넌트 마운트');
      initMaps();
      
      // 검색 결과 외부 클릭 시 결과 숨기기
      const handleClickOutside = (event) => {
        const searchContainer = document.querySelector('.location-search-container');
        if (searchContainer && !searchContainer.contains(event.target)) {
          showResults.value = false;
        }
      };
      
      document.addEventListener('click', handleClickOutside);
      
      // 언마운트 시 이벤트 리스너 제거
      onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside);
      });
    });
    
    // Google Maps 초기화
    const initMaps = async () => {
      try {
        console.log('Google Maps 초기화 시작');
        await loadGoogleMapsScript();
        console.log('Google Maps 초기화 완료');
        
        // 이미 선택된 위치가 있으면 지도 표시
        if (selectedLocation.value && selectedPlaceDetails.value) {
          displayMap();
        }
      } catch (error) {
        console.error('Google Maps 초기화 오류:', error);
      }
    };
    
    // 검색 로직
    let searchTimeout = null;
    
    const onSearchInput = () => {
      // 이전 타임아웃 제거
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // 검색어가 짧으면 결과 비우기
      if (searchQuery.value.length < 2) {
        predictions.value = [];
        return;
      }
      
      // 디바운스 적용 (300ms)
      searchTimeout = setTimeout(async () => {
        try {
          console.log('장소 검색 시작:', searchQuery.value);
          isLoading.value = true;
          predictions.value = await searchPlaces(searchQuery.value);
          showResults.value = true;
          isLoading.value = false;
        } catch (error) {
          console.error('장소 검색 오류:', error);
          predictions.value = [];
          isLoading.value = false;
        }
      }, 300);
    };
    
    // 장소 선택 처리
    const selectPlace = async (prediction) => {
      try {
        console.log('장소 선택:', prediction.description);
        console.log('장소 prediction 객체:', prediction);
        isLoading.value = true;
        
        // 선택된 장소 상세 정보 가져오기
        const placeDetails = await getPlaceDetails(prediction.place_id);
        
        if (!placeDetails) {
          console.error('장소 상세 정보를 가져올 수 없습니다');
          isLoading.value = false;
          return;
        }
        
        console.log('장소 상세 정보:', placeDetails);
        
        // 검색 결과 숨기기 및 검색어 설정
        showResults.value = false;
        searchQuery.value = prediction.description;
        
        // 장소 정보 저장
        selectedLocation.value = placeDetails.formatted_address;
        selectedPlaceDetails.value = placeDetails;
        
        // 위치 문자열에서 지역 정보 찾기
        console.log('지역 정보 찾기 시작 - 주소:', placeDetails.formatted_address);
        const regionInfo = findRegionInfoFromLocation(placeDetails.formatted_address);
        console.log('지역 정보 찾기 결과:', regionInfo);
        
        // 부모에게 전달할 데이터 구성
        const locationData = {
          formatted_address: placeDetails.formatted_address,
          region_info: regionInfo
        };
        console.log('부모 컴포넌트에 전달할 locationData:', locationData);
        
        // 부모에게 위치 정보 전달 (주소와 지역 정보)
        emit('location-selected', locationData);
        
        // 즉시 지도 표시
        await nextTick();
        displayMap(); 
        isLoading.value = false;
      } catch (error) {
        console.error('장소 상세 정보 가져오기 오류:', error);
        isLoading.value = false;
      }
    };
    
    // 지도 표시 함수
    const displayMap = async () => {
      if (!selectedPlaceDetails.value) {
        console.warn('지도를 표시할 수 없음: 위치 정보 없음');
        return;
      }
      
      // 지도 컨테이너 확인
      if (!mapContainer.value) {
        console.warn('지도 컨테이너가 없습니다. 다음 틱에서 다시 시도합니다.');
        await nextTick(); // DOM 업데이트를 기다림
      }
      
      if (!mapContainer.value) {
        console.error('지도 컨테이너를 찾을 수 없습니다.');
        return;
      }
      
      try {
        console.log('지도 표시 시작');
        // 기존 지도가 있으면 정리
        if (mapInstance.value) {
          console.log('기존 지도 인스턴스 초기화');
          mapInstance.value = null;
          mapMarker.value = null;
        }
        
        const mapResult = await createMap(
          mapContainer.value,
          selectedPlaceDetails.value
        );
        
        if (mapResult) {
          // 지도 및 마커 저장
          mapInstance.value = mapResult.map;
          mapMarker.value = mapResult.marker;
          console.log('지도 표시 완료');
        } else {
          console.error('지도 생성 실패');
        }
      } catch (error) {
        console.error('지도 표시 오류:', error);
      }
    };
    
    // 위치 정보 초기화
    const clearLocation = () => {
      console.log('위치 정보 초기화');
      selectedLocation.value = null;
      selectedPlaceDetails.value = null;
      searchQuery.value = '';
      
      // 부모에게 초기화 알림
      emit('location-selected', null);
    };
    
    return {
      searchQuery,
      predictions,
      selectedLocation,
      showResults,
      mapContainer,
      isLoading,
      onSearchInput,
      selectPlace,
      clearLocation
    };
  }
};
</script>

<style scoped>
/* 위치 검색 컴포넌트 전체 스타일 */
.location-search {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

/* Google Places 검색 관련 스타일 */
.location-search-container {
  position: relative;
  margin-bottom: 12px;
}

.location-search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  font-family: 'Nunito', 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  background-color: var(--white);
  color: var(--gray-800); /* 텍스트 색상 명시적 지정 */
  transition: all 0.3s ease;
}

.location-search-input:focus {
  outline: none;
  border-color: var(--logo-blue);
  box-shadow: 0 0 0 3px rgba(72, 176, 228, 0.15);
}

.location-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid var(--gray-300);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 100%;
  max-width: 100%;
  color: var(--gray-800); /* 검색 결과 텍스트 색상 */
}

.location-result-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--gray-200);
  transition: background-color 0.2s ease;
  color: var(--gray-700); /* 검색 결과 항목 색상 */
}

.location-result-item:hover {
  background-color: rgba(72, 176, 228, 0.08);
  color: var(--gray-900);
}

.location-result-item:last-child {
  border-bottom: none;
}

.no-results {
  padding: 12px;
  color: var(--gray-500);
  text-align: center;
  font-style: italic;
}

.selected-location-display {
  margin-bottom: 12px;
}

.selected-location {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background-color: rgba(72, 176, 228, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(72, 176, 228, 0.2);
}

.selected-location svg {
  width: 18px;
  height: 18px;
  color: var(--logo-blue);
  margin-right: 10px;
  flex-shrink: 0;
}

.selected-location span {
  flex-grow: 1;
  font-size: 0.95rem;
  color: var(--gray-700);
}

.remove-location {
  background: none;
  border: none;
  color: var(--gray-500);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 5px;
  margin-left: 5px;
  box-shadow: none;
}

.remove-location:hover {
  color: var(--logo-coral);
}

/* 지도 관련 스타일 - 세로로 길게 */
.location-map-container {
  flex-grow: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--gray-300);
  width: 100%;
  max-width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.location-map {
  width: 100%;
  height: 100%;
  min-height: 400px; /* 세로로 길게 설정 */
  background-color: var(--gray-200);
  flex-grow: 1;
}

/* 빈 지도 영역 - 높이 유지 */
.empty-map-container {
  flex-grow: 1;
  border-radius: 12px;
  border: 1px dashed var(--gray-300);
  background-color: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px; /* 세로로 길게 설정 */
}

.empty-map-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  color: var(--gray-500);
}

.empty-map-message svg {
  margin-bottom: 12px;
  color: var(--gray-400);
}

.empty-map-message p {
  margin: 0;
  font-size: 0.9rem;
}
</style>