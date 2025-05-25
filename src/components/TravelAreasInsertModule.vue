<template>
  <!-- 장소 검색 모달 -->
  <div class="modal-overlay" v-if="isOpen" @click="handleOverlayClick">
    <div class="modals-container" :class="{ 'with-detail': selectedPlace }">
      <!-- 검색 모달 -->
      <div class="place-search-modal" :class="{ 'slide-left': selectedPlace }" @click.stop>
        <div class="modal-header">
          <h3>장소 검색</h3>
          <button class="close-btn" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <!-- 검색 섹션 -->
          <div class="search-section">
            <div class="search-box">
              <input type="text" v-model="placeSearchKeyword" placeholder="검색할 장소를 입력하세요"
                @keyup.enter="searchPlaces">
              <button class="search-btn" @click="searchPlaces">검색</button>
            </div>


            <div class="search-results">
              <div v-if="isSearching" class="searching-indicator">
                <div class="spinner"></div>
                <p>검색 중...</p>
              </div>
              <div v-else-if="searchResults.length === 0 && !hasSearched" class="no-results">
                <p>검색어를 입력하여 장소를 검색해보세요.</p>
              </div>
              <div v-else-if="searchResults.length === 0 && hasSearched" class="no-results">
                <p>검색 결과가 없습니다.</p>
              </div>
              <div v-else class="place-list">
                <div v-for="(place, index) in searchResults" :key="index" class="place-item">
                  <div class="place-info" @click="openPlaceDetails(place)">
                    <h4>{{ place.place_name }}</h4>
                    <p class="place-address">{{ place.road_address_name || place.address_name }}</p>
                    <p class="place-category">{{ place.category_name }}</p>
                  </div>
                  <div class="place-actions">
                    <button class="wishlist-btn" @click="addToWishlist(place)"
                      :class="{ 'active': isInWishlist(place) }">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                        </path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 수직 구분선 -->
          <div class="modal-divider"></div>

          <!-- 위시리스트 섹션 -->
          <div class="wishlist-section">
            <h3 class="modal-section-title">나의 찜 목록</h3>
            <div class="wishlist-items">
              <div v-if="wishlistPlaces.length === 0" class="no-wishlist">
                <p>저장한 장소가 없습니다.</p>
              </div>
              <div v-else class="place-list">
                <div v-for="(place, index) in wishlistPlaces" :key="index" class="place-item">
                  <div class="place-info" @click="openPlaceDetails(place)">
                    <h4>{{ place.place_name }}</h4>
                    <p class="place-address">{{ place.road_address_name || place.address_name }}</p>
                  </div>
                  <div class="place-actions">
                    <button class="remove-btn" @click="removeFromWishlist(index)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <p class="powered-by">Powered by Kakao Maps API</p>
        </div>
      </div>

      <!-- 장소 상세 정보 모달 (선택 시에만 표시) -->
      <div v-if="selectedPlace" class="place-detail-modal" :class="{ 'slide-in': selectedPlace }" @click.stop>
        <div class="modal-header">
          <h3>장소 추가</h3>
          <button class="close-btn" @click="cancelPlaceDetails">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="detail-content">
          <div class="selected-place-info">
            <h4>{{ selectedPlace.place_name }}</h4>
            <p>{{ selectedPlace.road_address_name || selectedPlace.address_name }}</p>
          </div>

          <!-- 미니 지도 표시 -->
          <div class="mini-map-container">
            <div id="detail-map" ref="detailMapContainer"></div>
          </div>

          <div class="form-group">
            <label for="visitTime">방문 시간</label>
            <div class="time-input-wrapper">
              <input type="time" id="visitTime" v-model="visitTime">
            </div>
          </div>

          <div class="form-group">
            <label for="placeMemo">메모</label>
            <textarea id="placeMemo" v-model="placeMemo" placeholder="장소에 대한 메모를 입력하세요"
              @input="autoResizeTextarea" ref="memoTextarea"></textarea>
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="cancelPlaceDetails">취소</button>
            <button class="add-btn" @click="addSelectedPlace" :disabled="isAdding">
              {{ isAdding ? '추가 중...' : '일정에 추가' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue';
import { apiPost } from '@/services/auth';
import { reverseGeocode, getLocationCodes } from '@/services/api';

export default {
  name: 'TravelAreasInsertModule',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    selectedDay: {
      type: Number,
      required: true
    },
    tripStartDate: {
      type: String,
      required: true
    },
    travelId: {
      type: Number,
      default: 1
    }
  },
  emits: ['close', 'place-added', 'show-toast'],
  setup(props, { emit }) {
    // 장소 검색 관련 상태
    const placeSearchKeyword = ref('');
    const searchResults = ref([]);
    const isSearching = ref(false);
    const hasSearched = ref(false);
    const isAdding = ref(false);

    // 위시리스트 및 선택한 장소 관련 상태
    const wishlistPlaces = ref([]);
    const selectedPlace = ref(null);
    const visitTime = ref('');
    const placeMemo = ref('');

    // 지도 관련
    const detailMapInstance = ref(null);
    const detailMapContainer = ref(null);
    const memoTextarea = ref(null);

    // 로컬 스토리지에서 위시리스트 로드
    onMounted(() => {
      const savedWishlist = localStorage.getItem('wishlistPlaces');
      if (savedWishlist) {
        try {
          wishlistPlaces.value = JSON.parse(savedWishlist);
        } catch (error) {
          console.error('위시리스트 로드 실패:', error);
          wishlistPlaces.value = [];
        }
      }
    });

    // 장소 검색 실행
    const searchPlaces = () => {
      console.log('searchPlaces 함수 호출됨');
      console.log('검색어:', placeSearchKeyword.value);
      
      if (!placeSearchKeyword.value.trim()) {
        emit('show-toast', '검색어를 입력해주세요', 'error');
        return;
      }

      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        emit('show-toast', '카카오맵 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
        console.error('카카오 지도 SDK가 로드되지 않았습니다');
        return;
      }

      console.log('장소 검색 시작...');
      isSearching.value = true;
      hasSearched.value = true;
      searchResults.value = [];

      // 카카오 장소 검색 API 사용
      const places = new window.kakao.maps.services.Places();

      // 검색 옵션 - 지역 제한 없이 전국 검색
      const searchOptions = {
        size: 15 // 최대 15개 결과
      };

      // 키워드로 검색
      const keyword = placeSearchKeyword.value;

      places.keywordSearch(keyword, (result, status) => {
        console.log('검색 완료, 상태:', status);
        isSearching.value = false;

        if (status === window.kakao.maps.services.Status.OK) {
          console.log('검색 결과:', result);
          searchResults.value = result;
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          console.log('검색 결과가 없습니다.');
        } else {
          emit('show-toast', '검색 중 오류가 발생했습니다.', 'error');
          console.error('Kakao Places API Error:', status);
        }
      }, searchOptions);
    };

    // 위시리스트에 추가
    const addToWishlist = (place) => {
      if (!isInWishlist(place)) {
        wishlistPlaces.value.push(place);
        localStorage.setItem('wishlistPlaces', JSON.stringify(wishlistPlaces.value));
        emit('show-toast', '찜 목록에 추가되었습니다.', 'success');
      } else {
        emit('show-toast', '이미 찜 목록에 있는 장소입니다.', 'success');
      }
    };

    // 위시리스트에서 제거
    const removeFromWishlist = (index) => {
      wishlistPlaces.value.splice(index, 1);
      localStorage.setItem('wishlistPlaces', JSON.stringify(wishlistPlaces.value));
      emit('show-toast', '찜 목록에서 제거되었습니다.', 'success');
    };

    // 위시리스트에 있는지 확인
    const isInWishlist = (place) => {
      return wishlistPlaces.value.some(p => p.id === place.id);
    };

    // 장소 상세 정보 열기
    const openPlaceDetails = (place) => {
      selectedPlace.value = place;
      visitTime.value = '';
      placeMemo.value = '';
      
      // 다음 틱에서 지도 초기화
      nextTick(() => {
        initDetailMap();
      });
    };

    // 장소 상세 정보 닫기
    const cancelPlaceDetails = () => {
      selectedPlace.value = null;
      visitTime.value = '';
      placeMemo.value = '';
      
      // 지도 정리
      if (detailMapInstance.value) {
        detailMapInstance.value = null;
      }
    };

    // 미니 지도 초기화
    const initDetailMap = () => {
      if (!selectedPlace.value || !detailMapContainer.value) return;
      
      try {
        const lat = parseFloat(selectedPlace.value.y);
        const lng = parseFloat(selectedPlace.value.x);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.error('Invalid coordinates:', selectedPlace.value);
          return;
        }

        const mapOption = {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 3
        };

        detailMapInstance.value = new window.kakao.maps.Map(detailMapContainer.value, mapOption);

        // 마커 추가
        const markerPosition = new window.kakao.maps.LatLng(lat, lng);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(detailMapInstance.value);

      } catch (error) {
        console.error('지도 초기화 오류:', error);
      }
    };

    // 선택한 장소 일정에 추가
    const addSelectedPlace = async () => {
      if (!selectedPlace.value) return;

      // 시간 파싱 및 검증
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(visitTime.value)) {
        emit('show-toast', '시간은 HH:MM 형식으로 입력해 주세요.', 'error');
        return;
      }

      try {
        isAdding.value = true;
        emit('show-toast', '일정을 추가하는 중...', 'processing');

        // 좌표 추출
        const latitude = parseFloat(selectedPlace.value.y);
        const longitude = parseFloat(selectedPlace.value.x);

        // reverse geocoding을 통해 region과 sig 추출
        console.log('역지오코딩 시작...', { latitude, longitude });
        const geoData = await reverseGeocode(latitude, longitude);
        console.log('역지오코딩 결과:', geoData);

        if (!geoData) {
          throw new Error('위치 정보를 가져올 수 없습니다.');
        }

        const locationCodes = getLocationCodes(geoData);
        console.log('추출된 지역 코드:', locationCodes);

        if (!locationCodes.province_code || !locationCodes.city_code) {
          throw new Error('지역 코드를 추출할 수 없습니다.');
        }

        // 여행 시작 날짜 + 선택된 날짜로 실제 날짜 계산
        const startDate = new Date(props.tripStartDate);
        const travelDate = new Date(startDate);
        travelDate.setDate(startDate.getDate() + props.selectedDay);
        
        // 시간 정보 추가
        const [hours, minutes] = visitTime.value.split(':');
        travelDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // API 요청 데이터 구성
        const requestData = {
          travel_id: props.travelId,
          travel_day_id: props.selectedDay + 1, // 1-based index
          region: locationCodes.province_code,
          sig: locationCodes.city_code,
          start: travelDate.toISOString(),
          memo: placeMemo.value || '',
          address: selectedPlace.value.address_name || selectedPlace.value.road_address_name || '',
          name: selectedPlace.value.place_name,
          latitude: latitude,
          longitude: longitude
        };

        console.log('서버에 전송할 데이터:', requestData);

        // 서버 API 호출
        const result = await apiPost('/travel-areas/add', requestData);
        console.log('서버 응답:', result);

        // 새 일정 아이템 데이터 구성
        const newItem = {
          id: result.data?.tauid || Date.now(),
          time: visitTime.value,
          activity: selectedPlace.value.place_name,
          location: selectedPlace.value.address_name || selectedPlace.value.road_address_name,
          memo: placeMemo.value,
          coords: {
            lat: latitude,
            lng: longitude
          },
          tauid: result.data?.tauid,
          place: {
            name: selectedPlace.value.place_name,
            address: selectedPlace.value.address_name || selectedPlace.value.road_address_name,
            latitude: latitude,
            longitude: longitude
          }
        };

        // 부모 컴포넌트에 일정 추가 알림
        emit('place-added', {
          dayIndex: props.selectedDay,
          newItem: newItem
        });

        // 성공 메시지
        emit('show-toast', `${newItem.activity}이(가) 일정에 추가되었습니다.`, 'success');

        // 모달 닫기
        closeModal();

      } catch (error) {
        console.error('일정 추가 실패:', error);
        emit('show-toast', `일정 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
      } finally {
        isAdding.value = false;
      }
    };

    // 텍스트 영역 자동 크기 조절
    const autoResizeTextarea = () => {
      if (!memoTextarea.value) return;

      // Reset height to calculate based on content
      memoTextarea.value.style.height = 'auto';

      // Set height based on scrollHeight (content height)
      memoTextarea.value.style.height = `${memoTextarea.value.scrollHeight}px`;

      // Add 'expanded' class if content exceeds max-height
      if (memoTextarea.value.scrollHeight > 200) {
        memoTextarea.value.classList.add('expanded');
      } else {
        memoTextarea.value.classList.remove('expanded');
      }
    };

    // 모달 닫기
    const closeModal = () => {
      // 상태 초기화
      selectedPlace.value = null;
      visitTime.value = '';
      placeMemo.value = '';
      placeSearchKeyword.value = '';
      searchResults.value = [];
      hasSearched.value = false;
      
      // 지도 정리
      if (detailMapInstance.value) {
        detailMapInstance.value = null;
      }
      
      emit('close');
    };

    // 오버레이 클릭 핸들러
    const handleOverlayClick = () => {
      closeModal();
    };

    // selectedPlace가 변경될 때 지도 초기화
    watch(selectedPlace, (newPlace) => {
      if (newPlace) {
        nextTick(() => {
          initDetailMap();
        });
      }
    });

    return {
      // 상태
      placeSearchKeyword,
      searchResults,
      isSearching,
      hasSearched,
      isAdding,
      wishlistPlaces,
      selectedPlace,
      visitTime,
      placeMemo,
      detailMapContainer,
      memoTextarea,
      
      // 메서드
      searchPlaces,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      openPlaceDetails,
      cancelPlaceDetails,
      addSelectedPlace,
      autoResizeTextarea,
      closeModal,
      handleOverlayClick
    };
  }
};
</script>

<style scoped>
/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 0;
}

.modals-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1400px;
  width: 90%;
  position: relative;
  transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  perspective: 1200px;
}

.modals-container.with-detail {
  justify-content: space-between;
  gap: 12px;
}

/* 검색 모달 */
.place-search-modal {
  background-color: white;
  border-radius: 12px;
  width: 65%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  transform: translateX(0) scale(1);
  transform-origin: center;
  backface-visibility: hidden;
  will-change: transform, box-shadow;
}

.place-search-modal.slide-left {
  transform: translateX(-3%) scale(0.99);
  box-shadow: 15px 0 25px rgba(0, 0, 0, 0.1);
}

/* 장소 상세 모달 */
.place-detail-modal {
  background-color: white;
  border-radius: 12px;
  width: 35%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(50px);
  opacity: 0;
  backface-visibility: hidden;
  will-change: transform, opacity, box-shadow;
}

.place-detail-modal.slide-in {
  transform: translateX(0);
  opacity: 1;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #4a5568;
}

/* 모달 콘텐츠 */
.modal-content {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  height: calc(90vh - 110px);
}

.search-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wishlist-section {
  flex: 2;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-divider {
  width: 1px;
  background-color: #e2e8f0;
  margin: 0;
}

/* 검색 박스 */
.search-box {
  display: flex;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.search-box input {
  flex: 1;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px 0 0 6px;
  font-size: 1rem;
  color: #2d3748;
}

.search-box input:focus {
  outline: none;
  border-color: #4299e1;
}

.search-btn {
  padding: 1rem 1.5rem;
  background-color: #4299e1;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.search-btn:hover {
  background-color: #3182ce;
}

/* 섹션 제목 */
.modal-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

/* 검색 결과 및 위시리스트 */
.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-height: 100%;
}

.wishlist-items {
  flex: 1;
  overflow-y: auto;
}

.searching-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-results,
.no-wishlist {
  text-align: center;
  padding: 2rem;
  color: #a0aec0;
  font-size: 0.95rem;
}

/* 장소 리스트 */
.place-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.place-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.place-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.place-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.place-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-address {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  color: #718096;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-category {
  margin: 0;
  font-size: 0.8rem;
  color: #a0aec0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-actions {
  flex-shrink: 0;
  margin-left: 1rem;
}

.wishlist-btn,
.remove-btn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #a0aec0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wishlist-btn:hover,
.remove-btn:hover {
  border-color: #cbd5e0;
  color: #718096;
}

.wishlist-btn.active {
  background-color: #fef5e7;
  border-color: #f6ad55;
  color: #dd6b20;
}

/* 모달 푸터 */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  flex-shrink: 0;
}

.powered-by {
  margin: 0;
  font-size: 0.8rem;
  color: #a0aec0;
}

/* 장소 상세 정보 */
.detail-content {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: calc(90vh - 110px);
  gap: 1.5rem;
}

.selected-place-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.selected-place-info p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

/* 미니 지도 */
.mini-map-container {
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

#detail-map {
  width: 100%;
  height: 100%;
}

/* 폼 그룹 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.time-input-wrapper input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.time-input-wrapper input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-group textarea {
  min-height: 80px;
  max-height: 200px;
  resize: none;
  overflow-y: hidden;
  transition: min-height 0.2s ease;
}

.form-group textarea.expanded {
  overflow-y: auto;
}

/* 폼 액션 */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.cancel-btn,
.add-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.cancel-btn {
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background-color: #edf2f7;
}

.add-btn {
  background-color: #4299e1;
  color: white;
}

.add-btn:hover:not(:disabled) {
  background-color: #3182ce;
}

.add-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

/* 반응형 */
@media (max-width: 1024px) {
  .modals-container.with-detail {
    width: 95%;
    max-width: 900px;
  }
  
  .place-search-modal,
  .place-detail-modal {
    width: 100%;
    max-width: 450px;
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 1rem;
  }
  
  .modals-container {
    flex-direction: column;
    width: 95%;
    max-width: 500px;
  }
  
  .modals-container.with-detail {
    width: 95%;
  }
  
  .place-search-modal,
  .place-detail-modal {
    width: 100%;
    height: 80vh;
    max-width: none;
    transform: none !important;
  }
  
  .modal-content {
    flex-direction: column;
    height: calc(80vh - 110px);
  }
  
  .modal-divider {
    width: 100%;
    height: 1px;
  }
  
  .search-section,
  .wishlist-section {
    flex: 1;
  }
  
  .detail-content {
    height: calc(80vh - 110px);
  }
}
</style> 