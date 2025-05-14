<template>
  <div class="keyword-search">
    <!-- 헤더 - 페이지와 함께 스크롤됨 -->
    <Header 
      :showHero="true"
      heroImageSrc="https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1470"
      heroTitle="여행지 키워드 검색"
      heroSubtitle="원하는 여행지 키워드로 이미지를 검색해보세요"
      heroHeight="320px"
    />
    
    <!-- 컨텐츠 영역 - 히어로 섹션과 겹치지 않게 여백 추가 -->
    <div class="content-wrapper">
      <!-- 검색 패널 (전체 너비) -->
      <div class="search-panel-container">
        <div class="search-panel">
          <div class="panel-header">
            <h3 class="panel-title">키워드 검색</h3>
          </div>
          
          <div class="panel-content">
            <div class="search-form">
              <div class="search-input-container">
                <input 
                  type="text" 
                  v-model="searchKeyword" 
                  placeholder="검색할 키워드를 입력하세요 (예: 제주도, 바다, 산, 서울)"
                  @keyup.enter="performSearch"
                  class="search-input"
                >
                <button @click="performSearch" class="btn btn-search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  검색
                </button>
              </div>
              
              <div class="search-tags">
                <div class="search-tag-title">인기 검색어:</div>
                <div class="tag-chips">
                  <span class="tag-chip" @click="applyKeyword('제주도')">제주도</span>
                  <span class="tag-chip" @click="applyKeyword('바다')">바다</span>
                  <span class="tag-chip" @click="applyKeyword('산')">산</span>
                  <span class="tag-chip" @click="applyKeyword('서울')">서울</span>
                  <span class="tag-chip" @click="applyKeyword('부산')">부산</span>
                  <span class="tag-chip" @click="applyKeyword('카페')">카페</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 결과 영역 (전체 너비) -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">검색 중<span>.</span><span>.</span><span>.</span></p>
      </div>
      
      <div v-else-if="searchPerformed" class="results-panel-container">
        <div class="results-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              '{{ lastSearchKeyword }}' 검색 결과 ({{ searchResults.length }}건)
            </h3>
          </div>
          
          <div class="panel-content">
            <div v-if="searchResults.length === 0" class="no-results">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p>검색 결과가 없습니다</p>
              <p class="hint">다른 키워드로 다시 시도해보세요</p>
            </div>
            
            <div v-else class="results-grid">
              <div 
                v-for="(result, index) in sortedSearchResults" 
                :key="result._id"
                class="result-card"
                @click="openDetailModal(result)"
              >
                <div class="result-rank" :class="{ 'with-heart': isInWishlist(result._id) }">
                  <span v-if="isInWishlist(result._id)" class="heart-indicator active">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </span>
                  <span class="rank-number">{{ index + 1 }}</span>
                </div>
                <div class="result-image-container">
                  <img :src="`data:image/jpeg;base64,${result._source.image_data}`" :alt="result._source.image_name" class="result-image">
                </div>
                <div class="result-info">
                  <h4 class="result-name">{{ result._source.image_name }}</h4>
                  <div class="result-location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ result._source.image_location }}
                  </div>
                  <div class="result-similarity">
                    <span>유사도:</span>
                    <div class="similarity-bar">
                      <div class="similarity-fill"
                        :style="{ width: `${Math.round(result._score * 100) / 100 * 100}%` }"></div>
                    </div>
                    <span class="similarity-value">{{ (Math.round(result._score * 100) / 100).toFixed(2) }}</span>
                  </div>
                  <div v-if="result._source.image_tags && result._source.image_tags.length > 0" class="result-tags">
                    <div class="tags-container">
                      <span 
                        v-for="(tag, tagIndex) in result._source.image_tags.slice(0, 3)" 
                        :key="tagIndex"
                        class="result-tag"
                        @click.stop="applyKeyword(tag)"
                      >
                        #{{ tag }}
                      </span>
                    </div>
                  </div>
                  <!-- 이미지 설명 추가 -->
                  <div v-if="result._source.image_description" class="result-description">
                    <div class="description-title">설명:</div>
                    <p class="description-text">{{ result._source.image_description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="searchResults.length > 0" class="load-more-container">
              <button v-if="hasMoreResults" @click="loadMoreResults" class="btn btn-load-more">
                더 보기 ({{ searchResults.length }}/{{ totalResults }})
              </button>
              <p v-else class="no-more-results">모든 결과를 불러왔습니다 ({{ searchResults.length }}건)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 푸터 -->
    <footer class="footer">
      <p>© 2025 LOG:O - 당신의 여행을 기록하다</p>
    </footer>

    <!-- 장소 상세 모달 - 수정된 레이아웃 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="place-detail-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-location">
            <h3>{{ selectedDetail.image_name }}</h3>
            <div class="modal-location">{{ selectedDetail.image_location }}</div>
          </div>
          <div class="modal-actions">
            <button class="heart-btn" :class="{ 'active': isInWishlist(selectedDetail._id) }"
              @click="toggleWishlist(selectedDetail)" title="여행 계획에 추가">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                </path>
              </svg>
            </button>
            <button class="close-btn" @click="closeDetailModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
                
        <div class="modal-content">
          <!-- 이미지와 지도 섹션 (수평 레이아웃) -->
          <div class="visual-section">
            <div class="detail-image-container">
              <img :src="`data:image/jpeg;base64,${selectedDetail.image_data}`" :alt="selectedDetail.image_name"
                class="detail-image">
            </div>
                
            <!-- 지도 영역 -->
            <div class="detail-map-container">
              <div id="detailMap" class="detail-map"></div>
            </div>
          </div>
          
          <!-- 태그 섹션 -->
          <div class="detail-section" v-if="selectedDetail.image_tags && selectedDetail.image_tags.length > 0">
            <h4>태그</h4>
            <div class="tag-list">
              <span v-for="(tag, index) in selectedDetail.image_tags" :key="index" class="tag" @click="applyKeyword(tag)">{{ tag }}</span>
            </div>
          </div>

          <!-- 설명 섹션 -->
          <div class="detail-section" v-if="selectedDetail.image_description">
            <h4>설명</h4>
            <p class="detail-description">{{ selectedDetail.image_description }}</p>
          </div>
          
          <!-- 특성 분석 섹션 -->
          <div class="detail-section" v-if="selectedDetail.dimensions">
            <h4>특성 분석</h4>
            <div class="detail-dimensions">
              <div v-for="(value, dimension) in selectedDetail.dimensions" :key="dimension" class="dimension-item">
                <span class="dimension-name">{{ getDimensionHeader(dimension) }}</span>
                <div class="dimension-bar-small">
                  <div class="dimension-fill" :style="{ width: `${value * 100}%` }"></div>
                </div>
                <span class="dimension-value">{{ value.toFixed(1) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 리뷰 섹션 (더미 데이터로 추가) -->
          <div class="detail-section" v-if="selectedDetail.reviews && selectedDetail.reviews.length > 0">
            <h4>방문자 리뷰 ({{ selectedDetail.reviews.length }})</h4>
            <div class="reviews-container">
              <div v-for="(review, index) in selectedDetail.reviews" :key="index" class="review-item">
                <div class="review-header">
                  <div class="reviewer-info">
                    <div class="reviewer-name">{{ review.userName }}</div>
                    <div class="review-date">{{ formatReviewDate(review.date) }}</div>
                  </div>
                  <div class="review-rating">
                    <span v-for="star in 5" :key="star" 
                      :class="{'star-filled': star <= review.rating, 'star-empty': star > review.rating}">
                      ★
                    </span>
                  </div>
                </div>
                <div class="review-content">
                  {{ review.comment }}
                </div>
              </div>
            </div>
          </div>
        </div>
    
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeDetailModal">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import Header from "@/components/Header.vue";
import { searchImagesByKeyword } from "@/services/api";
import config from "@/config.js";

export default {
  name: "KeywordSearch",
  
  components: {
    Header
  },
  
  setup() {
    // 상태 관리
    const searchKeyword = ref('');
    const lastSearchKeyword = ref('');
    const searchResults = ref([]);
    const isLoading = ref(false);
    const searchPerformed = ref(false);
    const currentPage = ref(1);
    const resultsPerPage = ref(12);
    const totalResults = ref(0);
    const actionStatus = ref({ message: "", type: "" });
    const showDetailModal = ref(false);
    const selectedDetail = ref({});
    const wishlistItems = ref([]);
    
    // 더미 리뷰 데이터
    const dummyReviews = [
      {
        userName: "여행자김",
        rating: 5,
        date: "2025-03-15T09:30:00",
        comment: "정말 아름다운 장소였습니다. 사진으로 보는 것보다 실제로 보면 훨씬 더 멋있어요. 특히 일몰 때 분위기가 환상적이었습니다."
      },
      {
        userName: "배낭여행러",
        rating: 4,
        date: "2025-02-20T14:45:00",
        comment: "전체적으로 좋은 경험이었습니다. 다만 주변에 음식점이 많지 않아서 식사 계획은 미리 세우는 것이 좋을 것 같아요."
      },
      {
        userName: "사진작가이준",
        rating: 5,
        date: "2025-01-05T10:15:00",
        comment: "사진 찍기에 최고의 장소입니다. 맑은 날 방문하시면 환상적인 풍경 사진을 얻을 수 있어요. 개인적으로는 아침 일찍 방문하는 것을 추천합니다."
      }
    ];
    
    // 차원 영어-한글 매핑
    const dimensionTranslations = {
      "natural_elements": "자연 요소",
      "urban_character": "도시 특성",
      "water_features": "수경 요소",
      "seasonal_appeal": "계절적 매력",
      "relaxation_potential": "휴식 잠재력",
      "romantic_atmosphere": "로맨틱한 분위기",
      "activity_opportunities": "활동 기회",
      "historical_cultural_value": "역사/문화적 가치",
      "food_experience": "식도락 경험",
      "shopping_potential": "쇼핑 잠재력"
    };

    
    // 차원 헤더 생성
    const getDimensionHeader = (dimension) => {
      return dimensionTranslations[dimension] || dimension;
    };
    
    // 리뷰 날짜 포맷팅
    const formatReviewDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // 검색 결과를 유사도 순으로 정렬
    const sortedSearchResults = computed(() => {
      return [...searchResults.value].sort((a, b) => b._score - a._score);
    });
    
    // 컴포넌트 마운트 시 실행
    onMounted(async () => {
      console.log("KeywordSearch 컴포넌트 마운트");
      
      // 위시리스트 복원
      const savedWishlist = localStorage.getItem('logo_wishlist');
      if (savedWishlist) {
        try {
          const wishlistIds = JSON.parse(savedWishlist);
          console.log('저장된 위시리스트 ID:', wishlistIds);
          
          // 위시리스트 ID만 있는 경우 기본 객체로 변환하여 wishlistItems에 저장
          wishlistItems.value = wishlistIds.map(id => ({
            _id: id,
            _source: {} // 기본 빈 객체 (검색 결과에서 매칭될 때 실제 데이터가 채워질 수 있음)
          }));
        } catch (error) {
          console.error('위시리스트 데이터 로드 오류:', error);
        }
      }
      
      // 카카오 맵 API 로드
      try {
        await loadKakaoMapsScript();
        console.log("카카오 맵 API 준비 완료");
      } catch (error) {
        console.error("카카오 맵 API 로드 실패:", error);
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
    
    // 더 많은 결과 있는지 확인
    const hasMoreResults = computed(() => {
      return searchResults.value.length < totalResults.value;
    });
    
    // 상태 메시지 및 클래스
    const statusMessage = computed(() => actionStatus.value.message || '');
    const statusClass = computed(() => {
      if (actionStatus.value.type === 'success') {
        return 'status-success';
      } else if (actionStatus.value.type === 'error') {
        return 'status-error';
      }
      return '';
    });
    
    // 위시리스트 관리 함수
    const isInWishlist = (id) => {
      return wishlistItems.value.some(item => item._id === id);
    };

    const toggleWishlist = (item) => {
      if (isInWishlist(item._id)) {
        // 위시리스트에서 제거
        wishlistItems.value = wishlistItems.value.filter(i => i._id !== item._id);
        showActionStatus(`${item.image_name}이(가) 위시리스트에서 제거되었습니다.`, "success");
      } else {
        // 위시리스트에 추가
        wishlistItems.value.push(item);
        showActionStatus(`${item.image_name}이(가) 위시리스트에 추가되었습니다.`, "success");
      }

      // 로컬 스토리지에 저장
      localStorage.setItem('logo_wishlist', JSON.stringify(wishlistItems.value.map(i => i._id)));
    };
    
    // 키워드 검색 실행
    const performSearch = async () => {
      if (!searchKeyword.value.trim()) {
        showActionStatus("검색어를 입력해주세요.", "error");
        return;
      }
      
      try {
        // 검색 시작
        isLoading.value = true;
        searchPerformed.value = true;
        lastSearchKeyword.value = searchKeyword.value;
        currentPage.value = 1;
        
        // 키워드로 검색 실행
        const response = await searchImagesByKeyword(searchKeyword.value, resultsPerPage.value, 0);
        console.log(response);
        
        // 결과 저장
        searchResults.value = response.hits;
        totalResults.value = response.total;
        
        if (response.hits.length === 0) {
          showActionStatus("검색 결과가 없습니다.", "info");
        } else {
          showActionStatus(`${response.hits.length}개의 결과를 찾았습니다. (총 ${response.total}개)`, "success");
        }
      } catch (error) {
        showActionStatus(`검색 중 오류가 발생했습니다: ${error.message}`, "error");
        console.error("검색 오류:", error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // 더 많은 결과 로드
    const loadMoreResults = async () => {
      if (!hasMoreResults.value) return;
      
      try {
        isLoading.value = true;
        
        // 다음 페이지 계산
        const nextPage = currentPage.value + 1;
        const from = (nextPage - 1) * resultsPerPage.value;
        
        // 추가 결과 로드
        const response = await searchImagesByKeyword(
          lastSearchKeyword.value, 
          resultsPerPage.value,
          from
        );
        
        // 현재 페이지 업데이트
        currentPage.value = nextPage;
        
        // 결과 추가
        searchResults.value = [...searchResults.value, ...response.hits];
        
        // 표시할 더 많은 결과가 없는 경우, 총 결과 수를 현재 결과 수로 설정
        if (response.hits.length === 0) {
          totalResults.value = searchResults.value.length;
        }
        
        showActionStatus(`추가 결과를 불러왔습니다. (${searchResults.value.length}/${totalResults.value})`, "success");
      } catch (error) {
        showActionStatus(`추가 결과 로드 중 오류가 발생했습니다: ${error.message}`, "error");
        console.error("추가 로드 오류:", error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // 태그 키워드 적용
    const applyKeyword = (keyword) => {
      searchKeyword.value = keyword;
      performSearch();
    };
    
    // 상태 메시지 표시 함수
    const showActionStatus = (message, type) => {
      actionStatus.value = { message, type };
      
      // 3초 후 메시지 자동 제거
      setTimeout(() => {
        if (actionStatus.value.message === message) {
          actionStatus.value = { message: "", type: "" };
        }
      }, 3000);
    };
    
    // 상세 모달 열기
    const openDetailModal = (result) => {
      // 기존 데이터에 더미 리뷰 추가
      const detailWithReviews = {
        _id: result._id,
        _score: result._score,
        ...result._source,
        reviews: dummyReviews  // 더미 리뷰 데이터 추가
      };
      
      selectedDetail.value = detailWithReviews;
      showDetailModal.value = true;
      
      // 모달이 열린 후 지도 초기화
      setTimeout(() => {
        initDetailMap();
      }, 300);
    };
    
    // 상세 모달의 지도 초기화
    const initDetailMap = async () => {
      try {
        // API가 로드되지 않았다면 로드
        if (!window.kakao || !window.kakao.maps) {
          console.log('카카오 맵 API 로드 필요');
          await loadKakaoMapsScript();
        }

        const mapContainer = document.getElementById('detailMap');
        if (!mapContainer) {
          console.error('지도 컨테이너를 찾을 수 없습니다');
          return;
        }

        // 선택한 장소의 위치 정보가 있으면 사용, 없으면 기본값
        let lat = 37.501212; // 기본값: 역삼 멀티캠퍼스
        let lng = 127.039508;

        // selectedDetail에서 위치 정보 추출 시도
        if (selectedDetail.value && selectedDetail.value.geoLocation &&
          selectedDetail.value.geoLocation.coordinates) {
          lat = selectedDetail.value.geoLocation.coordinates.latitude || lat;
          lng = selectedDetail.value.geoLocation.coordinates.longitude || lng;
        }

        // 지도 옵션
        const mapOption = {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3
        };

        // 지도 생성
        const map = new kakao.maps.Map(mapContainer, mapOption);

        // 마커 생성
        const markerPosition = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({
          position: markerPosition
        });

        // 마커를 지도에 표시
        marker.setMap(map);

        // 인포윈도우 생성
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${selectedDetail.value.image_name || '선택한 위치'}</div>`
        });

        // 인포윈도우 표시
        infowindow.open(map, marker);

        // 지도 컨트롤 추가
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        console.log('카카오 지도 초기화 완료:', lat, lng);
      } catch (error) {
        console.error('카카오 지도 초기화 오류:', error);
      }
    };
    
    // 상세 모달 닫기
    const closeDetailModal = () => {
      showDetailModal.value = false;
    };
    
    return {
      searchKeyword,
      lastSearchKeyword,
      searchResults,
      isLoading,
      searchPerformed,
      hasMoreResults,
      totalResults,
      statusMessage,
      statusClass,
      performSearch,
      loadMoreResults,
      applyKeyword,
      openDetailModal,
      isInWishlist,
      showDetailModal,
      selectedDetail,
      toggleWishlist,
      closeDetailModal,
      wishlistItems,
      initDetailMap,
      sortedSearchResults,
      getDimensionHeader,
      formatReviewDate
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.keyword-search {
  font-family: 'Noto Sans KR', sans-serif;
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  display: flex;
  flex-direction: column;
}

/* 컨텐츠 영역 */
.content-wrapper {
  position: relative;
  padding: 2rem 0.5rem 3rem; 
  z-index: 2;
  max-width: 1600px;
  margin: 0 auto;
  width: 95%;
}

/* 검색 패널 */
.search-panel-container, 
.results-panel-container {
  margin-bottom: 1.5rem;
}

.search-panel, 
.results-panel {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
}

.panel-title {
  font-family: 'Playfair Display', 'Noto Sans KR', serif;
  font-size: 1.3rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
  color: #2d3748;
  letter-spacing: 0.5px;
}

.panel-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 검색 폼 */
.search-form {
  width: 100%;
}

.search-input-container {
  display: flex;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px 0 0 4px;
  background-color: white;
  color: #333;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-search {
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-search:hover {
  background-color: #3182ce;
}

/* 검색 태그 */
.search-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.search-tag-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
  margin-right: 0.5rem;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  background-color: #e9ecef;
  color: #333;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-chip:hover {
  background-color: #0d6efd;
  color: white;
}

/* 로딩 컨테이너 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(66, 153, 225, 0.3);
  border-radius: 50%;
  border-top-color: #4299e1;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem;
  color: #6c757d;
}

.loading-text span {
  animation: dots 1.4s infinite;
  opacity: 0;
}

.loading-text span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-text span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dots {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

/* 결과 없음 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #a0aec0;
  text-align: center;
}

.no-results svg {
  margin-bottom: 1rem;
  color: #6c757d;
}

.no-results p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.no-results .hint {
  font-size: 0.9rem;
  color: #adb5bd;
}

/* 결과 그리드 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.result-card {
  position: relative;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.result-image-container {
  height: 180px;
  width: 100%;
  overflow: hidden;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.result-card:hover .result-image {
  transform: scale(1.1);
}

/* 등수 아이콘 스타일 수정 - 중앙 정렬 개선 */
.result-rank {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center; /* 컨텐츠 중앙 정렬 추가 */
  gap: 5px;
  padding: 3px 10px; /* 패딩 균일하게 조정 */
  background: linear-gradient(135deg, #0d6efd, #0a58ca);
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* with-heart 클래스 유지 */
.result-rank.with-heart {
  padding-left: 10px;
  gap: 7px;
}

/* rank-number 클래스 수정 - 숫자 위치 중앙 정렬 */
.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 14px;
  text-align: center;
  line-height: 1; /* 줄 간격 조정으로 수직 정렬 개선 */
}

.heart-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.heart-indicator.active {
  color: #ff6b6b;
  animation: heartbeat 1s ease-in-out;
}

.heart-indicator svg {
  fill: transparent;
  transition: fill 0.3s ease;
}

.heart-indicator.active svg {
  fill: #ff6b6b;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.result-info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.result-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.result-location svg {
  flex-shrink: 0;
  color: #6c757d;
}

.result-similarity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.similarity-bar {
  flex-grow: 1;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.similarity-fill {
  height: 100%;
  background: linear-gradient(90deg, #0d6efd, #4dabf7);
  border-radius: 3px;
  transition: width 1s ease;
}

.similarity-value {
  color: #333;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
}

.result-tags {
  margin-top: 0.5rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.result-tag {
  background-color: #e9ecef;
  color: #0d6efd;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.result-tag:hover {
  background-color: #cfe2ff;
}

/* 더 보기 버튼 */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.btn-load-more {
  background-color: transparent;
  border: 1px solid #4299e1;
  color: #4299e1;
  padding: 0.6rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-load-more:hover {
  background-color: #4299e1;
  color: white;
}

.no-more-results {
  color: #a0aec0;
  font-size: 0.9rem;
}

/* 상태 메시지 */
.status-message {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
}

.status-success {
  background-color: rgba(56, 161, 105, 0.2);
  color: #68d391;
}

.status-error {
  background-color: rgba(229, 62, 62, 0.2);
  color: #fc8181;
}

/* 푸터 */
.footer {
  background-color: #343a40;
  padding: 1.5rem;
  text-align: center;
  margin-top: auto;
  border-top: 1px solid #2d3748;
}

.footer p {
  margin: 0;
  color: white;
  font-size: 0.9rem;
}

/* 반응형 디자인 */
@media (max-width: 900px) {
  .search-form {
    flex-direction: column;
  }
  
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .content-wrapper {
    width: 100%;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .search-tags {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-tag-title {
    margin-bottom: 0.5rem;
  }
}

/* 모달 오버레이 및 공통 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem 0;
}

.place-detail-modal {
  background-color: white;
  border-radius: 8px;
  width: 95%;
  max-width: 1500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.modal-title-location {
  display: flex;
  align-items: center;
  flex: 1;
}

.modal-title-location h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.modal-location {
  margin-left: 1.5rem;
  color: #718096;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.close-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f7fafc;
  color: #4a5568;
}

.heart-btn {
  background: none;
  border: none;
  color: #cbd5e0;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.heart-btn:hover {
  color: #f56565;
  transform: scale(1.1);
}

.heart-btn.active {
  color: #f56565;
  animation: heartbeat 1s ease-in-out;
}

/* 모달 콘텐츠 영역 - 새로운 레이아웃 */
.modal-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 이미지와 지도를 수평으로 나란히 배치 */
.visual-section {
  display: flex;
  gap: 20px;
  margin-bottom: 1.5rem;
}

.detail-image-container, .detail-map-container {
  flex: 1;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.detail-image, .detail-map {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 각 섹션 스타일 */
.detail-section {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  background-color: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem 0;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

/* 태그 리스트 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tag {
  background-color: #ebf5ff;
  color: #3182ce;
  font-size: 0.9rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: #3182ce;
  color: white;
}

/* 설명 텍스트 */
.detail-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #4a5568;
  margin: 0;
}

/* 특성 분석 */
.detail-dimensions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dimension-name {
  width: 140px;
  font-size: 0.95rem;
  color: #4a5568;
}

.dimension-bar-small {
  flex: 1;
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
}

.dimension-fill {
  height: 100%;
  background: linear-gradient(90deg, #3182ce, #63b3ed);
  border-radius: 5px;
}

.dimension-value {
  width: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  text-align: right;
}

/* 리뷰 섹션 */
.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  padding: 1.25rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.reviewer-info {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.review-date {
  font-size: 0.85rem;
  color: #718096;
}

.review-rating {
  color: #a0aec0;
  font-size: 1.25rem;
}

.star-filled {
  color: #f6ad55;
}

.star-empty {
  color: #e2e8f0;
}

.review-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #4a5568;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background-color: #f7fafc;
}

/* 결과 카드의 이미지 설명 스타일 */
.result-description {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e9ecef;
}

.description-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.description-text {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
  max-height: 4.2em;
  /* 3줄로 제한 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.result-card:nth-child(1) .result-rank {
  background: linear-gradient(135deg, #ffca2c, #ffab00);
}

.result-card:nth-child(2) .result-rank {
  background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
}

.result-card:nth-child(3) .result-rank {
  background: linear-gradient(135deg, #d98936, #b0732f);
}

/* 반응형 조정 */
@media (max-width: 1100px) {
  .visual-section {
    flex-direction: column;
  }
  
  .detail-image-container, 
  .detail-map-container {
    width: 100%;
    height: 350px;
  }
  
  .dimension-name {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .modal-title-location {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .modal-location {
    margin: 0.25rem 0 0 0;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .dimension-name {
    width: 100px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .dimension-item {
    flex-wrap: wrap;
  }
  
  .dimension-name {
    width: 100%;
    margin-bottom: 0.25rem;
  }
  
  .dimension-value {
    width: 40px;
  }
}
</style>