/* eslint-disable */
<template>
  <div class="trip-plan">
    <!-- 헤더 -->
    <Header 
      :showHero="true"
      heroImageSrc="https://images.unsplash.com/photo-1503221043305-f7498f8b7888?q=80&w=1470"
      heroTitle="나만의 여행 설계하기"
      heroSubtitle="나만의 특별한 여행 경험을 디자인해보세요"
      heroHeight="320px"
    />

    <!-- 메인 콘텐츠 -->
    <div class="plan-content-wrapper">
      <div class="plan-container">
        <!-- 여행 기본 정보 폼 -->
        <div class="plan-section">
          <h2 class="section-title">여행 기본 정보</h2>
          <div class="trip-summary">
            <div class="trip-summary-item">
              <span class="summary-label">여행 기간</span>
              <span class="summary-value">{{ tripNights }}박 {{ tripDays.length }}일</span>
            </div>
          </div>
          <div class="plan-form">
            <div class="form-group">
              <label for="tripTitle">여행 제목</label>
              <input type="text" id="tripTitle" v-model="tripData.title" placeholder="여행 제목을 입력하세요">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startDate">출발일</label>
                <input type="date" id="startDate" v-model="tripData.startDate" class="date-input">
              </div>
              <div class="form-group">
                <label for="endDate">도착일</label>
                <input type="date" id="endDate" v-model="tripData.endDate" class="date-input">
              </div>
            </div>

            <div class="form-group">
              <label for="destination">주요 목적지</label>
              <input type="text" id="destination" v-model="tripData.destination" placeholder="예: 서울, 제주도, 부산">
            </div>

            <div class="form-group">
              <label for="tripNotes">여행 메모</label>
              <textarea id="tripNotes" v-model="tripData.notes" placeholder="여행 준비 사항, 기대 등을 자유롭게 작성하세요"></textarea>
            </div>
          </div>
        </div>

        <!-- 일정 계획 -->
        <div class="plan-section">
          <h2 class="section-title">일정 계획</h2>
          
          <!-- 날짜별 탭 메뉴 -->
          <div class="day-tabs">
            <button 
              v-for="(day, index) in tripDays" 
              :key="index" 
              class="day-tab" 
              :class="{ 'active': activeDay === index }"
              @click="activeDay = index"
            >
              DAY {{ index + 1 }}
              <span class="tab-date">{{ formatDate(addDays(new Date(tripData.startDate), index)) }}</span>
            </button>
          </div>
          
          <!-- 일정과 지도를 포함하는 레이아웃 -->
          <div class="schedule-and-maps">
            <!-- 일정 부분 -->
            <div class="day-schedule" v-if="tripDays[activeDay]">
              <div class="schedule-items">
                <div 
                  v-for="(item, itemIndex) in sortedScheduleItems" 
                  :key="itemIndex" 
                  class="schedule-item"
                >
                  <div class="schedule-item-header">
                    <div class="time-place">
                      <template v-if="editingItem === itemIndex">
                        <input type="time" v-model="editItemTime" class="edit-time-input" />
                      </template>
                      <template v-else>
                        <span class="time">{{ item.time }} |</span>
                      </template>
                      <span class="place">{{ item.activity }}</span>
                    </div>
                    <div class="item-actions">
                      <button v-if="editingItem === itemIndex" class="save-edit-btn" @click="saveItemEdit(itemIndex)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button v-else class="edit-btn" @click="startEditItem(itemIndex)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button class="delete-btn" @click="removeScheduleItem(activeDay, itemIndex)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="schedule-item-memo">
                    <textarea 
                      v-if="editingItem === itemIndex" 
                      v-model="editItemMemo" 
                      placeholder="메모를 입력하세요"
                      @blur="saveItemEdit(itemIndex)"
                    ></textarea>
                    <textarea v-else v-model="item.location" placeholder="수하물 찾는 시간 고려하기" @blur="updateLocation(activeDay, itemIndex, item.location)"></textarea>
                  </div>
                </div>
                
                <button class="add-schedule-btn" @click="openPlaceSearch">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  일정 추가
                </button>
              </div>
            </div>

            <!-- 카카오 지도 -->
            <div class="map-container">
              <div id="kakao-map" ref="kakaoMapContainer" class="map-element"></div>
              <div class="map-legend" v-if="mapLoaded">
                <div class="legend-item">
                  <div class="legend-dot start"></div>
                  <span>출발지</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot waypoint"></div>
                  <span>경유지</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot end"></div>
                  <span>도착지</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 예산 계획 -->
        <div class="plan-section">
          <h2 class="section-title">예산 계획</h2>
          <div class="budget-container">
            <div class="budget-summary">
              <div class="budget-card">
                <div class="budget-label">총 예산</div>
                <div class="budget-amount">₩{{ formatNumber(totalBudget) }}</div>
              </div>
              <div class="budget-card">
                <div class="budget-label">계획된 지출</div>
                <div class="budget-amount">₩{{ formatNumber(calculatedExpenses) }}</div>
              </div>
              <div class="budget-card">
                <div class="budget-label">잔액</div>
                <div class="budget-amount" :class="{ 'negative': remainingBudget < 0 }">
                  ₩{{ formatNumber(remainingBudget) }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="totalBudget">총 예산 설정</label>
              <div class="input-with-icon">
                <span class="input-icon">₩</span>
                <input type="number" id="totalBudget" v-model="tripData.budget" placeholder="0">
              </div>
            </div>

            <div class="expenses-list">
              <div v-for="(expense, index) in tripData.expenses" :key="index" class="expense-item">
                <div class="expense-category">
                  <select v-model="expense.category">
                    <option value="accommodation">숙박</option>
                    <option value="transportation">교통</option>
                    <option value="food">식비</option>
                    <option value="activities">액티비티</option>
                    <option value="shopping">쇼핑</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div class="expense-description">
                  <input type="text" v-model="expense.description" placeholder="항목 설명">
                </div>
                <div class="expense-amount">
                  <div class="input-with-icon">
                    <span class="input-icon">₩</span>
                    <input type="number" v-model="expense.amount" placeholder="0">
                  </div>
                </div>
                <div class="action-column">
                  <button class="delete-btn" @click="removeExpense(index)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              
              <button class="add-expense-btn" @click="addExpense">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                지출 항목 추가
              </button>
            </div>
          </div>
        </div>

        <!-- 저장 버튼 -->
        <div class="save-section">
          <button class="save-plan-btn" @click="saveTripPlan">여행 계획 저장하기</button>
        </div>
      </div>
    </div>

    <!-- 장소 검색 모달 -->
    <div class="modal-overlay" v-if="isPlaceSearchModalOpen" @click="closePlaceSearch">
      <div class="modals-container">
        <!-- 검색 모달 -->
        <div class="place-search-modal" @click.stop>
          <div class="modal-header">
            <h3>장소 검색</h3>
            <button class="close-btn" @click="closePlaceSearch">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-content">
            <!-- 검색 섹션 -->
            <div class="search-section">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="placeSearchKeyword" 
                  placeholder="검색할 장소를 입력하세요"
                  @keyup.enter="searchPlaces"
                >
                <button class="search-btn" @click="searchPlaces">검색</button>
              </div>
              
              <h3 class="section-title">장소 검색 결과</h3>
              
              <div class="search-results">
                <div v-if="isSearching" class="searching-indicator">
                  <div class="spinner"></div>
                  <p>검색 중...</p>
                </div>
                <div v-else-if="searchResults.length === 0 && hasSearched" class="no-results">
                  <p>검색 결과가 없습니다.</p>
                </div>
                <div v-else class="place-list">
                  <div 
                    v-for="(place, index) in searchResults" 
                    :key="index" 
                    class="place-item"
                  >
                    <div class="place-info" @click="openPlaceDetails(place)">
                      <h4>{{ place.place_name }}</h4>
                      <p class="place-address">{{ place.road_address_name || place.address_name }}</p>
                      <p class="place-category">{{ place.category_name }}</p>
                    </div>
                    <div class="place-actions">
                      <button class="wishlist-btn" @click="addToWishlist(place)" :class="{ 'active': isInWishlist(place) }">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 위시리스트 섹션 -->
            <div class="wishlist-section">
              <h3 class="section-title">나의 찜 목록</h3>
              <div class="wishlist-items">
                <div v-if="wishlistPlaces.length === 0" class="no-wishlist">
                  <p>저장한 장소가 없습니다.</p>
                </div>
                <div v-else class="place-list">
                  <div 
                    v-for="(place, index) in wishlistPlaces" 
                    :key="index" 
                    class="place-item"
                  >
                    <div class="place-info" @click="openPlaceDetails(place)">
                      <h4>{{ place.place_name }}</h4>
                      <p class="place-address">{{ place.road_address_name || place.address_name }}</p>
                    </div>
                    <div class="place-actions">
                      <button class="remove-btn" @click="removeFromWishlist(index)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <div v-if="selectedPlace" class="place-detail-modal" @click.stop>
          <div class="modal-header">
            <h3>장소 추가</h3>
            <button class="close-btn" @click="cancelPlaceDetails">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                <span class="time-prefix">오후</span>
                <input type="time" id="visitTime" v-model="visitTime">
              </div>
            </div>
            
            <div class="form-group">
              <label for="placeMemo">메모</label>
              <textarea id="placeMemo" v-model="placeMemo" placeholder="장소에 대한 메모를 입력하세요"></textarea>
            </div>
            
            <div class="form-actions">
              <button class="cancel-btn" @click="cancelPlaceDetails">취소</button>
              <button class="add-btn" @click="addSelectedPlace">일정에 추가</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import config from '@/config';

export default {
  name: 'TripPlan',
  components: {
    Header
  },
  setup() {
    // 카카오 맵 관련 변수
    const kakaoMapContainer = ref(null);
    const kakaoMap = ref(null);
    const kakaoMarkers = ref([]);
    const kakaoPolyline = ref(null);
    const mapLoaded = ref(false);
    const geocoder = ref(null);
    
    // 장소 검색 관련 상태
    const isPlaceSearchModalOpen = ref(false);
    const placeSearchKeyword = ref('');
    const searchResults = ref([]);
    const isSearching = ref(false);
    const hasSearched = ref(false);
    const selectedDay = ref(0); // 장소 검색 시 선택된 날짜
    
    // 위시리스트 및 선택한 장소 관련 상태
    const wishlistPlaces = ref([]);
    const selectedPlace = ref(null);
    const visitTime = ref('');
    const placeMemo = ref('');
    
    // 여행 데이터 - 이미 데이터가 차있는 상태로 초기화
    const tripData = ref({
      title: '제주도 봄 여행',
      startDate: '2025-05-15',
      endDate: '2025-05-18',
      destination: '제주도',
      notes: '첫 제주 여행, 올레길 걷기, 해변에서 휴식, 맛집 탐방 계획',
      budget: 800000,
      expenses: [
        {
          category: 'accommodation',
          description: '에어비앤비 숙소',
          amount: 300000
        },
        {
          category: 'transportation',
          description: '항공권',
          amount: 180000
        },
        {
          category: 'food',
          description: '식비 예산',
          amount: 120000
        }
      ]
    });

    // 현재 활성화된 일정 날짜 (DAY 탭)
    const activeDay = ref(0);

    // 여행 일수 계산
    const tripDays = computed(() => {
      if (!tripData.value.startDate || !tripData.value.endDate) {
        return [{ 
          items: [{ time: '09:00', activity: '조식', location: '호텔 레스토랑', coords: { lat: 33.4890113, lng: 126.4983023 } }],
        }]; // 기본값: 1일
      }

      const start = new Date(tripData.value.startDate);
      const end = new Date(tripData.value.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // 이미 존재하는 일정 유지하면서 필요한 일수만큼 배열 생성
      const days = [];
      for (let i = 0; i < diffDays; i++) {
        // 기본 일정 데이터 추가 (날짜별 샘플 데이터)
        if (i === 0) {
          days.push({ 
            items: [
              { time: '09:00', activity: '제주공항 도착', location: '제주국제공항', coords: { lat: 33.5066778, lng: 126.4931069 } },
              { time: '10:30', activity: '렌터카 픽업', location: '공항 렌터카 센터', coords: { lat: 33.5066778, lng: 126.4931069 } },
              { time: '12:00', activity: '점심 식사', location: '제주 흑돼지 맛집', coords: { lat: 33.4890113, lng: 126.4983023 } }
            ] 
          });
        } else if (i === 1) {
          days.push({ 
            items: [
              { time: '08:00', activity: '아침 식사', location: '숙소 근처 카페', coords: { lat: 33.4648938, lng: 126.3312657 } },
              { time: '10:00', activity: '성산일출봉 관광', location: '성산일출봉', coords: { lat: 33.458031, lng: 126.942652 } }
            ] 
          });
        } else if (i === 2) {
          days.push({ 
            items: [
              { time: '09:00', activity: '아침 산책', location: '한라산 둘레길', coords: { lat: 33.3616758, lng: 126.5292231 } },
              { time: '13:00', activity: '점심 식사', location: '제주 해물 전문점', coords: { lat: 33.2541205, lng: 126.5630755 } }
            ] 
          });
        } else if (i === 3) {
          days.push({ 
            items: [
              { time: '10:00', activity: '마지막 관광', location: '카멜리아 힐', coords: { lat: 33.2895471, lng: 126.3721352 } },
              { time: '14:00', activity: '공항 이동', location: '제주국제공항', coords: { lat: 33.5066778, lng: 126.4931069 } }
            ] 
          });
        } else {
          days.push({ items: [] });
        }
      }
      
      return days;
    });

    // 몇박 계산
    const tripNights = computed(() => {
      if (!tripData.value.startDate || !tripData.value.endDate) {
        return 0;
      }
      
      const start = new Date(tripData.value.startDate);
      const end = new Date(tripData.value.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    });

    // 예산 계산
    const totalBudget = computed(() => Number(tripData.value.budget) || 0);
    
    const calculatedExpenses = computed(() => {
      return tripData.value.expenses.reduce((total, expense) => {
        return total + Number(expense.amount || 0);
      }, 0);
    });
    
    const remainingBudget = computed(() => {
      return totalBudget.value - calculatedExpenses.value;
    });

    // 수정 관련 상태
    const editingItem = ref(null);
    const editItemTime = ref('');
    const editItemMemo = ref('');

    // 정렬된 일정 항목 가져오기
    const sortedScheduleItems = computed(() => {
      if (!tripDays.value[activeDay.value]?.items || tripDays.value[activeDay.value].items.length === 0) {
        return [];
      }
      
      // 시간 기준으로 정렬된 배열 반환
      return [...tripDays.value[activeDay.value].items].sort((a, b) => {
        // 빈 시간은 가장 뒤로
        if (!a.time) return 1;
        if (!b.time) return -1;
        
        // 시간 비교 (HH:MM 형식)
        return a.time.localeCompare(b.time);
      });
    });
    
    // 아이템 수정 시작
    const startEditItem = (index) => {
      const item = tripDays.value[activeDay.value].items[index];
      editingItem.value = index;
      editItemTime.value = item.time;
      editItemMemo.value = item.location;
    };
    
    // 아이템 수정 저장
    const saveItemEdit = (index) => {
      if (editingItem.value !== null) {
        const item = tripDays.value[activeDay.value].items[index];
        item.time = editItemTime.value;
        item.location = editItemMemo.value;
        
        // 위치 정보 업데이트
        updateLocation(activeDay.value, index, editItemMemo.value);
        
        // 수정 모드 종료
        editingItem.value = null;
        
        // 지도 마커 업데이트 (시간 순서대로 정렬된 마커로)
        nextTick(() => {
          updateMapMarkers();
        });
      }
    };

    // 카카오 맵 초기화
    const initializeMap = () => {
      console.log("Initializing Kakao Map...");
      
      // 카카오 지도 API 로드
      const kakaoMapsApiKey = config.KAKAO_MAPS_API_KEY;
      console.log("Kakao Maps API Key:", kakaoMapsApiKey);
      
      // 스크립트가 이미 있는지 확인
      const existingScript = document.getElementById('kakao-maps-sdk');
      if (existingScript) {
        existingScript.remove();
      }
      
      // 스크립트 생성
      const script = document.createElement('script');
      script.id = 'kakao-maps-sdk';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapsApiKey}&libraries=services,clusterer,drawing&autoload=false`;
      script.onload = () => {
        console.log("Kakao Maps SDK loaded");
        window.kakao.maps.load(() => {
          console.log("Kakao Maps initialized");
          nextTick(() => {
            loadMap();
          });
        });
      };
      document.head.appendChild(script);
    };

    // 카카오 맵 로드 및 초기화
    const loadMap = () => {
      console.log("Loading Kakao Map...");
      if (!window.kakao || !window.kakao.maps) {
        console.error("Kakao Maps SDK not loaded");
        return;
      }
      
      if (!kakaoMapContainer.value) {
        console.error("Kakao Map container not found");
        return;
      }
      
      try {
        // 제주도 중심 좌표
        const jejuCenter = new kakao.maps.LatLng(33.3846, 126.5535);
        
        // 맵 생성
        const options = {
          center: jejuCenter,
          level: 9 // 확대 레벨 (숫자가 작을수록 확대)
        };
        
        kakaoMap.value = new kakao.maps.Map(kakaoMapContainer.value, options);
        console.log("Kakao Map created:", kakaoMap.value);
        
        // 확대 축소 컨트롤러 추가
        const zoomControl = new kakao.maps.ZoomControl();
        kakaoMap.value.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
        
        // Geocoder 초기화
        geocoder.value = new kakao.maps.services.Geocoder();
        
        // 마커와 경로 표시
        updateMapMarkers();
        
        mapLoaded.value = true;
      } catch (error) {
        console.error("Error initializing Kakao Map:", error);
      }
    };

    // 카카오 지도 마커와 경로 업데이트
    const updateMapMarkers = () => {
      console.log("Updating Kakao Map markers...");
      
      // 카카오 맵이 로드되지 않았다면 무시
      if (!kakaoMap.value || !window.kakao) {
        console.error("Kakao Map not loaded yet");
        return;
      }
      
      try {
        console.log("Current active day:", activeDay.value);
        
        // 기존 마커 제거
        kakaoMarkers.value.forEach(marker => marker.setMap(null));
        kakaoMarkers.value = [];
        
        // 기존 경로 제거
        if (kakaoPolyline.value) {
          kakaoPolyline.value.setMap(null);
        }
        
        // 현재 선택된 날짜의 일정 가져오기 (시간순 정렬)
        const dayItems = sortedScheduleItems.value;
        console.log(`Found ${dayItems.length} items for day ${activeDay.value}:`, dayItems);
        
        if (dayItems.length === 0) {
          console.log("No items for this day");
          return;
        }
        
        // 지도 재배치 (가끔 맵이 제대로 표시되지 않는 문제 해결)
        kakaoMap.value.relayout();
        
        const linePath = [];
        const bounds = new kakao.maps.LatLngBounds();
        
        // 마커 추가
        dayItems.forEach((item, index) => {
          if (!item.coords) {
            console.log("No coordinates for item:", item);
            return;
          }
          
          const position = new kakao.maps.LatLng(item.coords.lat, item.coords.lng);
          linePath.push(position);
          bounds.extend(position);
          
          // 마커 색상 설정
          let markerColor;
          if (index === 0) {
            markerColor = '#4CAF50';  // 첫 위치 (초록색)
          } else if (index === dayItems.length - 1) {
            markerColor = '#1A5276';  // 마지막 위치 (짙은 파란색)
          } else {
            markerColor = '#3498DB';  // 중간 위치 (파란색)
          }
          
          // 커스텀 오버레이 생성 (원형 마커 + 숫자)
          const content = `
            <div class="custom-marker" style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: ${markerColor};
              color: white;
              display: flex;
              justify-content: center;
              align-items: center;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>
          `;
          
          // 커스텀 오버레이 생성
          const customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: content,
            yAnchor: 1,
            zIndex: 3
          });
          
          // 지도에 커스텀 오버레이 표시
          customOverlay.setMap(kakaoMap.value);
          kakaoMarkers.value.push(customOverlay);
          
          // 인포윈도우 생성
          const infoContent = `
            <div style="
              padding: 8px 12px; 
              background: white; 
              border-radius: 6px; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              font-size: 13px;
              max-width: 200px;
              text-align: center;
            ">
              <div style="font-weight: bold; margin-bottom: 4px;">${item.time} ${item.activity}</div>
              <div style="color: #666;">${item.location}</div>
            </div>
          `;
          
          const infoWindow = new kakao.maps.CustomOverlay({
            position: position,
            content: infoContent,
            yAnchor: 2.2,
            zIndex: 2
          });
          
          // 마커 클릭 이벤트 - 인포윈도우 표시 (2초 후 자동으로 닫힘)
          kakao.maps.event.addListener(customOverlay, 'click', function() {
            infoWindow.setMap(kakaoMap.value);
            
            // 2초 후 인포윈도우 닫기
            setTimeout(() => {
              infoWindow.setMap(null);
            }, 2000);
          });
          
          kakaoMarkers.value.push(infoWindow);
        });
        
        // 경로 표시 (2개 이상의 위치가 있을 경우)
        if (linePath.length >= 2) {
          kakaoPolyline.value = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 3,
            strokeColor: '#db4040',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
          });
          
          kakaoPolyline.value.setMap(kakaoMap.value);
        }
        
        // 지도 범위 조정
        if (kakaoMarkers.value.length > 0) {
          kakaoMap.value.setBounds(bounds);
        }
      } catch (error) {
        console.error("Error updating Kakao Map markers:", error);
      }
    };

    // 카카오 지도에서 주소를 좌표로 변환하는 함수
    const geocodeAddress = (address, callback) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error("Kakao Maps Services not loaded");
        return;
      }
      
      // geocoder가 없으면 새로 생성
      if (!geocoder.value) {
        try {
          console.log("Creating new Geocoder instance");
          geocoder.value = new kakao.maps.services.Geocoder();
        } catch (error) {
          console.error("Failed to create Geocoder:", error);
          return;
        }
      }
      
      try {
        console.log(`Geocoding address: ${address}`);
        // 제주도 지역 검색을 위해 주소에 제주도를 포함
        const searchAddress = `${address}, 제주도`;
        
        geocoder.value.addressSearch(searchAddress, (result, status) => {
          if (status === kakao.maps.services.Status.OK && result.length > 0) {
            const coords = {
              lat: parseFloat(result[0].y),
              lng: parseFloat(result[0].x)
            };
            console.log(`Geocoded coordinates:`, coords);
            callback(coords);
          } else {
            console.warn(`Geocoding failed for: ${searchAddress}, status: ${status}`);
            // 실패 시 제주도 중심 근처 랜덤 좌표 반환
            const fallbackCoords = {
              lat: 33.3846 + (Math.random() * 0.2 - 0.1),  // 제주도 중심 ±0.1도 랜덤
              lng: 126.5535 + (Math.random() * 0.2 - 0.1)
            };
            console.log("Using fallback coordinates:", fallbackCoords);
            callback(fallbackCoords);
          }
        });
      } catch (error) {
        console.error("Error during geocoding:", error);
        // 오류 발생 시 랜덤 좌표 반환
        const errorCoords = {
          lat: 33.3846 + (Math.random() * 0.2 - 0.1),
          lng: 126.5535 + (Math.random() * 0.2 - 0.1)
        };
        callback(errorCoords);
      }
    };

    // 위치 업데이트 함수
    const updateLocation = (dayIndex, itemIndex, location) => {
      if (!location || location.trim() === '') return;
      
      console.log(`Updating location for day ${dayIndex}, item ${itemIndex}: ${location}`);
      
      // 카카오 지도에서 좌표 변환
      geocodeAddress(location, (coords) => {
        // 좌표 업데이트
        tripDays.value[dayIndex].items[itemIndex].coords = coords;
        
        // 지도 마커 업데이트 (현재 선택된 날짜인 경우)
        if (dayIndex === activeDay.value && mapLoaded.value) {
          console.log("Updating map markers after location change");
          nextTick(() => {
            updateMapMarkers();
          });
        }
      });
    };

    // 일정 항목 추가
    const addScheduleItem = (dayIndex) => {
      tripDays.value[dayIndex].items.push({
        time: '',
        activity: '',
        location: '',
        coords: null
      });
    };

    // 일정 항목 삭제
    const removeScheduleItem = (dayIndex, itemIndex) => {
      tripDays.value[dayIndex].items.splice(itemIndex, 1);
      updateMapMarkers();
    };

    // 지출 항목 추가
    const addExpense = () => {
      tripData.value.expenses.push({
        category: 'food',
        description: '',
        amount: 0
      });
    };

    // 지출 항목 삭제
    const removeExpense = (index) => {
      tripData.value.expenses.splice(index, 1);
    };

    // 날짜 포맷팅
    const formatDate = (date) => {
      if (!date) return '';
      
      const options = { month: 'short', day: 'numeric', weekday: 'short' };
      return date.toLocaleDateString('ko-KR', options);
    };

    // 날짜 더하기
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    // 숫자 포맷팅 (천 단위 콤마)
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 여행 계획 저장
    const saveTripPlan = () => {
      // 실제 구현에서는 여기에 API 호출이나 Vuex store에 저장하는 로직이 필요
      console.log('여행 계획 저장:', tripData.value);
      alert('여행 계획이 업데이트되었습니다.');
    };

    // 장소 검색 모달 열기
    const openPlaceSearch = () => {
      selectedDay.value = activeDay.value;
      isPlaceSearchModalOpen.value = true;
      placeSearchKeyword.value = '';
      searchResults.value = [];
      hasSearched.value = false;
      selectedPlace.value = null;
      
      // 로컬 스토리지에서 위시리스트 불러오기
      const savedWishlist = localStorage.getItem('wishlistPlaces');
      if (savedWishlist) {
        wishlistPlaces.value = JSON.parse(savedWishlist);
      }
    };
    
    // 장소 검색 모달 닫기
    const closePlaceSearch = () => {
      isPlaceSearchModalOpen.value = false;
      selectedPlace.value = null;
      placeSearchKeyword.value = '';
      searchResults.value = [];
      hasSearched.value = false;
    };
    
    // 장소 상세 정보 열기
    const openPlaceDetails = (place) => {
      selectedPlace.value = place;
      
      // 현재 시간을 기본값으로 설정
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      visitTime.value = `${hours}:${minutes}`;
      placeMemo.value = '';
      
      // 다음 렌더링 주기에서 상세 지도 초기화
      nextTick(() => {
        initDetailMap();
      });
    };
    
    // 상세 지도 초기화
    const initDetailMap = () => {
      if (!selectedPlace.value) return;
      
      // 지도 컨테이너 요소가 있는지 확인
      const detailMapContainer = document.getElementById('detail-map');
      if (!detailMapContainer) return;
      
      // 카카오맵 API가 로드되었는지 확인
      if (!window.kakao || !window.kakao.maps) {
        console.error("Kakao Maps SDK not loaded");
        return;
      }
      
      try {
        // 선택한 장소의 좌표
        const placePosition = new kakao.maps.LatLng(
          selectedPlace.value.y,
          selectedPlace.value.x
        );
        
        // 지도 옵션
        const mapOptions = {
          center: placePosition,
          level: 3 // 확대 레벨
        };
        
        // 지도 생성
        const detailMap = new kakao.maps.Map(detailMapContainer, mapOptions);
        
        // 마커 생성
        new kakao.maps.Marker({
          position: placePosition,
          map: detailMap
        });
        
        // 1초 후 지도 리사이즈 (모달 애니메이션 완료 후)
        setTimeout(() => {
          detailMap.relayout();
        }, 100);
      } catch (error) {
        console.error("Error initializing detail map:", error);
      }
    };
    
    // 장소 상세 취소
    const cancelPlaceDetails = () => {
      selectedPlace.value = null;
    };
    
    // 위시리스트에 장소 추가
    const addToWishlist = (place) => {
      // 이미 위시리스트에 있는지 확인
      const existingIndex = wishlistPlaces.value.findIndex(p => p.id === place.id);
      
      if (existingIndex >= 0) {
        // 이미 있으면 제거 (토글)
        wishlistPlaces.value.splice(existingIndex, 1);
      } else {
        // 없으면 추가
        wishlistPlaces.value.push(place);
      }
      
      // 로컬 스토리지에 저장
      localStorage.setItem('wishlistPlaces', JSON.stringify(wishlistPlaces.value));
    };
    
    // 위시리스트에서 장소 제거
    const removeFromWishlist = (index) => {
      wishlistPlaces.value.splice(index, 1);
      localStorage.setItem('wishlistPlaces', JSON.stringify(wishlistPlaces.value));
    };
    
    // 위시리스트에 있는지 확인
    const isInWishlist = (place) => {
      return wishlistPlaces.value.some(p => p.id === place.id);
    };
    
    // 선택한 장소 일정에 추가
    const addSelectedPlace = () => {
      if (!selectedPlace.value) return;
      
      // 좌표 추출
      const coords = {
        lat: parseFloat(selectedPlace.value.y),
        lng: parseFloat(selectedPlace.value.x)
      };
      
      // 새 일정 아이템 생성
      const newItem = {
        time: visitTime.value,
        activity: selectedPlace.value.place_name,
        location: placeMemo.value || selectedPlace.value.road_address_name || selectedPlace.value.address_name,
        coords: coords
      };
      
      // 선택한 날짜의 일정에 추가
      if (!tripDays.value[selectedDay.value].items) {
        tripDays.value[selectedDay.value].items = [];
      }
      
      tripDays.value[selectedDay.value].items.push(newItem);
      
      // 모달 닫기
      closePlaceSearch();
      
      // 활성 날짜를 선택한 날짜로 변경 (다른 날짜에 일정을 추가한 경우)
      if (selectedDay.value !== activeDay.value) {
        activeDay.value = selectedDay.value;
      }
      
      // 추가한 날짜가 현재 활성화된 날짜와 같다면 지도 업데이트
      if (mapLoaded.value) {
        nextTick(() => {
          updateMapMarkers();
        });
      }
    };
    
    // 장소 검색 실행
    const searchPlaces = () => {
      if (!placeSearchKeyword.value.trim()) {
        alert('검색어를 입력해주세요');
        return;
      }
      
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        alert('카카오맵 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      
      isSearching.value = true;
      hasSearched.value = true;
      searchResults.value = [];
      
      // 카카오 장소 검색 API 사용
      const places = new kakao.maps.services.Places();
      
      // 현재 지도의 중심 좌표 (제주도)
      const center = new kakao.maps.LatLng(33.3846, 126.5535);
      
      // 검색 옵션
      const searchOptions = {
        location: center,
        radius: 20000, // 20km 반경 내 검색
        size: 15 // 최대 15개 결과
      };
      
      // 키워드 + 제주도로 검색 범위 좁히기
      const keyword = `${placeSearchKeyword.value} 제주도`;
      
      places.keywordSearch(keyword, (result, status) => {
        isSearching.value = false;
        
        if (status === kakao.maps.services.Status.OK) {
          console.log('검색 결과:', result);
          searchResults.value = result;
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          console.log('검색 결과가 없습니다.');
        } else {
          alert('검색 중 오류가 발생했습니다.');
          console.error('Kakao Places API Error:', status);
        }
      }, searchOptions);
    };
    
    // 장소 선택 및 일정 추가
    const selectPlace = (place) => {
      openPlaceDetails(place);
    };
    
    // 거리 포맷팅 (미터 -> km 또는 m)
    const formatDistance = (distance) => {
      const dist = parseInt(distance);
      if (dist >= 1000) {
        return `${(dist / 1000).toFixed(1)}km`;
      }
      return `${dist}m`;
    };

    // 컴포넌트 마운트 시 지도 초기화
    onMounted(() => {
      console.log("Component mounted");
      nextTick(() => {
        // DOM이 완전히 렌더링된 후 카카오 맵 초기화
        console.log("Next tick after mount - initializing Kakao Map");
        setTimeout(() => {
          initializeMap();
        }, 500); // 더 긴 딜레이로 DOM이 완전히 렌더링되도록 기다림
      });
    });

    // 활성 날짜가 변경될 때 지도 업데이트
    watch(activeDay, (newDay, oldDay) => {
      console.log(`Active day changed from ${oldDay} to ${newDay}`);
      if (mapLoaded.value && kakaoMap.value) {
        console.log(`Updating map for day ${newDay} with ${tripDays.value[newDay]?.items?.length || 0} items`);
        
        // 지도 업데이트를 약간 지연시켜 UI 업데이트 후 실행
        setTimeout(() => {
          updateMapMarkers();
        }, 100);
      }
    });

    // 맵 로드 상태 감시
    watch(mapLoaded, (isLoaded) => {
      if (isLoaded && kakaoMap.value) {
        console.log("Map is now loaded, updating markers for active day:", activeDay.value);
        updateMapMarkers();
      }
    });

    // 맵 크기 재조정 - 창 크기 변경 시
    window.addEventListener('resize', () => {
      if (mapLoaded.value && kakaoMap.value) {
        nextTick(() => {
          kakaoMap.value.relayout();
          updateMapMarkers();
        });
      }
    });

    return {
      tripData,
      tripDays,
      tripNights,
      activeDay,
      totalBudget,
      calculatedExpenses,
      remainingBudget,
      kakaoMapContainer,
      mapLoaded,
      addScheduleItem,
      removeScheduleItem,
      addExpense,
      removeExpense,
      formatDate,
      addDays,
      formatNumber,
      saveTripPlan,
      updateLocation,
      isPlaceSearchModalOpen,
      placeSearchKeyword,
      searchResults,
      isSearching,
      hasSearched,
      selectedDay,
      openPlaceSearch,
      closePlaceSearch,
      searchPlaces,
      selectPlace,
      formatDistance,
      wishlistPlaces,
      selectedPlace,
      visitTime,
      placeMemo,
      openPlaceDetails,
      cancelPlaceDetails,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      addSelectedPlace,
      initDetailMap,
      sortedScheduleItems,
      editingItem,
      editItemTime,
      editItemMemo,
      startEditItem,
      saveItemEdit
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.trip-plan {
  font-family: 'Noto Sans KR', sans-serif;
  color: #2d3748;
  background-color: #f7fafc;
  min-height: 100vh;
}

.plan-content-wrapper {
  padding: 2rem 0;
}

.plan-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 95%;
}

.plan-section {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 1rem 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

/* 여행 요약 정보 스타일 */
.trip-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #ebf8ff;
  border-radius: 8px;
  padding: 1rem;
}

.trip-summary-item {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.summary-label {
  font-size: 0.85rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2b6cb0;
}

/* 날짜 탭 스타일 */
.day-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.day-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.day-tab {
  padding: 0.75rem 1.5rem;
  background-color: #e2e8f0;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.day-tab.active {
  background-color: #4299e1;
  color: white;
}

.tab-date {
  font-size: 0.8rem;
  font-weight: 400;
  margin-top: 0.25rem;
}

/* 일정 및 지도 레이아웃 */
.schedule-and-maps {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.day-schedule {
  flex: 1;
  min-width: 0; /* 필요하면 줄어들 수 있도록 */
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  padding: 1rem;
}

/* 지도 컨테이너 스타일 */
.map-container {
  flex: 1;
  min-width: 0;
  height: 400px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.map-element {
  width: 100%;
  height: 100%;
}

.map-legend {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  font-size: 0.8rem;
  z-index: 2;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 3px 0;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
}

.legend-dot.start {
  background-color: #f03e3e; /* 출발지 - 빨간색 */
}

.legend-dot.waypoint {
  background-color: #f59f00; /* 경유지 - 노란색 */
}

.legend-dot.end {
  background-color: #1971c2; /* 도착지 - 파란색 */
}

/* 폼 스타일 */
.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #2d3748;
  transition: all 0.3s ease;
}

/* 날짜 입력 필드 수정 */
.date-input {
  min-width: 150px;
  width: 100%;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

/* 일정 계획 스타일 */
.schedule-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule-item {
  display: flex;
  flex-direction: column;
  background-color: #f7fafc;
  border-radius: 8px;
  transition: all 0.2s ease;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  margin-bottom: 0.5rem;
}

.schedule-item:hover {
  background-color: #edf2f7;
}

.schedule-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.edit-btn, .save-edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  color: #4299e1;
  background-color: rgba(66, 153, 225, 0.1);
}

.save-edit-btn {
  color: #48bb78;
}

.save-edit-btn:hover {
  color: #38a169;
  background-color: rgba(72, 187, 120, 0.1);
}

.edit-time-input {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.25rem;
  font-size: 0.9rem;
  width: 110px;
  margin-right: 0.5rem;
}

.time {
  font-weight: 500;
  color: #4a5568;
  margin-right: 0.5rem;
}

.place {
  font-weight: 500;
  color: #2d3748;
}

.schedule-item-memo {
  padding: 0 1rem 0.75rem 1rem;
}

.schedule-item-memo textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  color: #718096;
  padding: 0;
  min-height: 40px;
  resize: none;
}

.schedule-item-memo textarea:focus {
  outline: none;
  box-shadow: none;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #e53e3e;
  background-color: rgba(229, 62, 62, 0.1);
}

.add-schedule-btn, .add-expense-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #ebf8ff;
  border: 1px dashed #4299e1;
  border-radius: 6px;
  color: #4299e1;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.add-schedule-btn:hover, .add-expense-btn:hover {
  background-color: #bee3f8;
}

/* 예산 계획 스타일 */
.budget-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.budget-card {
  flex: 1;
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.budget-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.budget-label {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.budget-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.budget-amount.negative {
  color: #e53e3e;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.input-with-icon input {
  padding-left: 2rem;
}

.expenses-list {
  margin-top: 1.5rem;
}

.expense-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
}
.expense-category {
  width: 150px;
}

.expense-description {
  flex: 2;
}

.expense-amount {
  width: 150px;
}
/* 저장 버튼 */
.save-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 3rem;
}

.save-plan-btn {
  padding: 1rem 2.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.save-plan-btn:hover {
  background-color: #3182ce;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(66, 153, 225, 0.4);
}

/* 반응형 스타일 */
@media (max-width: 1024px) {
  .schedule-and-maps {
    flex-direction: column;
  }
  
  .map-container {
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .budget-summary {
    flex-direction: column;
  }
  
  .schedule-item, .expense-item {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .time-column, .activity-column, .location-column,
  .expense-category, .expense-description, .expense-amount {
    width: 100%;
  }
  
  .action-column {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .tab-panel {
    padding: 0.5rem;
  }
  
  .budget-summary-grid {
    grid-template-columns: 1fr;
  }
}

/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modals-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  max-width: 1400px;
  width: 100%;
}

.place-search-modal {
  background-color: white;
  border-radius: 12px;
  width: 65%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.place-detail-modal {
  background-color: white;
  border-radius: 12px;
  width: 35%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.modal-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(90vh - 110px);
}

.detail-content {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  height: calc(90vh - 110px);
}

.search-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  overflow: hidden;
}

.wishlist-section {
  flex: 1;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wishlist-section .section-title {
  margin: 0 0 1rem 0;
}

.wishlist-items {
  flex: 1;
  overflow-y: auto;
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

.search-box .search-btn {
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

.search-box .search-btn:hover {
  background-color: #3182ce;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-height: 100%;
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
  to { transform: rotate(360deg); }
}

.no-results, .no-wishlist {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.place-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.place-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.place-item:hover {
  background-color: #ebf8ff;
}

.place-info {
  flex: 1;
  cursor: pointer;
}

.place-info h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: #2d3748;
}

.place-address {
  margin: 0 0 0.25rem;
  font-size: 0.85rem;
  color: #4a5568;
}

.place-category {
  margin: 0;
  font-size: 0.75rem;
  color: #718096;
}

.place-actions {
  display: flex;
  gap: 0.5rem;
}

.wishlist-btn, .remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.wishlist-btn:hover, .remove-btn:hover {
  background-color: #f7fafc;
  color: #4299e1;
}

.wishlist-btn.active {
  color: #f56565;
}

.wishlist-btn.active svg {
  fill: #f56565;
}

.place-distance {
  font-size: 0.85rem;
  color: #4299e1;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 1rem;
}

/* 장소 상세 폼 */
.place-details-form {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.place-details-form h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2d3748;
}

.selected-place-info {
  background-color: #f7fafc;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.selected-place-info h4 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.selected-place-info p {
  margin: 0;
  font-size: 0.95rem;
  color: #4a5568;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn, .add-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.cancel-btn {
  background-color: #e2e8f0;
  color: #4a5568;
}

.add-btn {
  background-color: #4299e1;
  color: white;
}

.cancel-btn:hover {
  background-color: #cbd5e0;
}

.add-btn:hover {
  background-color: #3182ce;
}

.modal-footer {
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.powered-by {
  margin: 0;
  font-size: 0.75rem;
  color: #a0aec0;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .modal-content {
    flex-direction: column;
  }
  
  .search-section {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .search-results {
    max-height: 300px;
  }
  
  .wishlist-section {
    max-height: 200px;
  }
}

.no-place-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #718096;
  text-align: center;
  height: 100%;
}

.no-place-selected p {
  margin-bottom: 2rem;
}

.wishlist-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d3748;
}

.time-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 1rem;
}

.time-prefix {
  color: #4a5568;
  margin-right: 0.5rem;
}

.time-input-wrapper input[type="time"] {
  border: none;
  padding: 1rem 0;
  width: 100%;
}

.time-input-wrapper input[type="time"]:focus {
  outline: none;
  box-shadow: none;
}

.mini-map-container {
  width: 100%;
  height: 300px;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
#detail-map {
  width: 100%;
  height: 100%;
}</style>



