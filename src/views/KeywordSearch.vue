<template>
  <div class="keyword-search">
    <!-- Header 컴포넌트 사용 -->
    <Header 
      :showHero="showHero" 
      :heroImageSrc="heroImageSrc"
      :heroTitle="heroTitle"
      :heroSubtitle="heroSubtitle"
      :heroHeight="heroHeight"
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
      
      <!-- 로딩 중일 때 로딩 스피너 표시 -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">검색 중<span>.</span><span>.</span><span>.</span></p>
      </div>
      
      <!-- 결과 영역 (전체 너비) -->
      <div v-else-if="searchPerformed" class="results-panel-container">
        <div class="results-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              '{{ lastSearchKeyword }}' 검색 결과 ({{ searchResults.length }}건 중 {{ totalResults }} 개)
            </h3>
          </div>
          
          <div class="panel-content">
            <div v-if="searchResults.length === 0" class="no-results">
              <div class="no-results-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <p class="no-results-text">검색 결과가 없습니다</p>
              <p class="no-results-hint">다른 키워드로 다시 시도해보세요</p>
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
                  <img v-if="result._source.p_image" :src="`data:image/jpeg;base64,${result._source.p_image}`" :alt="result._source.p_name" class="result-image">
                  <div v-else class="placeholder-image">이미지 없음</div>
                </div>
                <div class="result-info">
                  <h4 class="result-name">{{ result._source.p_name }}</h4>
                  <div class="result-location">
                    <span class="location-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </span>
                    {{ result._source.p_address }}
                  </div>
                  <div class="result-visit-count">
                    인증: {{ result._source.visitCount }}회
                  </div>
                  <div class="result-similarity">
                    <span class="similarity-label">유사도:</span>
                    <div class="similarity-bar-container">
                      <div class="similarity-bar" :style="{ width: `${(result._score * 100)}%` }"></div>
                    </div>
                    <span class="similarity-value">{{ (result._score * 100).toFixed(0) }}%</span>
                  </div>
                  <!-- 키워드 표시 영역 -->
                  <div v-if="result._source.p_tags && result._source.p_tags.length > 0" class="result-tags">
                    <span 
                      v-for="(tag, tagIndex) in result._source.p_tags.slice(0, 5)" 
                      :key="tagIndex" 
                      class="result-tag"
                      @click.stop="applyKeyword(tag)"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <!-- 이미지 설명 -->
                  <div v-if="result._source.p_description" class="result-description">
                    <div class="description-title">설명:</div>
                    <p class="description-text">{{ result._source.p_description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="searchResults.length > 0" class="load-more-container">
              <button v-if="hasMoreResults" @click="loadMoreResults" class="primary-btn load-more-btn">
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

    <!-- 장소 상세 모달 -->
    <PlaceDetailModal
      :show="showDetailModal"
      :detail="selectedDetail"
      :isInWishlist="selectedDetail._id ? isInWishlist(selectedDetail._id) : false"
      :ageStats="ageStats"
      :genderStats="genderStats"
      :totalStatsVisits="totalStatsVisits"
      :isLoadingStats="isLoadingStats"
      @close="closeDetailModal"
      @toggle-wishlist="toggleWishlist"
      @apply-keyword="applyKeyword"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import Header from "@/components/Header.vue";
import PlaceDetailModal from "@/components/PlaceDetailModal.vue";
import { searchImagesByKeyword } from "@/services/api";
import config from "@/config.js";

export default {
  name: "KeywordSearch",
  
  components: {
    Header,
    PlaceDetailModal
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

    // Stats related reactive variables (copied from LookAround.vue)
    const ageStats = ref([]);
    const genderStats = ref([]);
    const totalStatsVisits = ref(0);
    const isLoadingStats = ref(false);
    
    // 히어로 섹션 속성
    const showHero = ref(true);
    const heroImageSrc = ref('https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1470');
    const heroTitle = ref('여행지 키워드 검색');
    const heroSubtitle = ref('원하는 여행지 키워드로 이미지를 검색해보세요');
    const heroHeight = ref('320px');
    
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
    
    // 검색 결과를 유사도 순으로 정렬
    const sortedSearchResults = computed(() => {
      return [...searchResults.value].sort((a, b) => b._score - a._score);
    });
    
    // 더 많은 결과 있는지 확인
    const hasMoreResults = computed(() => {
      return searchResults.value.length < totalResults.value;
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
    });
    
    // 위시리스트 관리 함수
    const isInWishlist = (id) => {
      return wishlistItems.value.some(item => item._id === id);
    };

    const toggleWishlist = (item) => {
      // Get the name safely from either _source or directly
      const itemName = item._source ? item._source.p_name : item.p_name;
      
      if (isInWishlist(item._id)) {
        // 위시리스트에서 제거
        wishlistItems.value = wishlistItems.value.filter(i => i._id !== item._id);
        showActionStatus(`${itemName}이(가) 위시리스트에서 제거되었습니다.`, "success");
      } else {
        // 위시리스트에 추가
        wishlistItems.value.push(item);
        showActionStatus(`${itemName}이(가) 위시리스트에 추가되었습니다.`, "success");
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
      // _source 필드를 최상위 레벨로 풀어서 저장
      const detailData = {
        _id: result._id,
        _score: result._score,
        ...result._source,
        reviews: dummyReviews
      };
      
      selectedDetail.value = detailData;
      showDetailModal.value = true;
      
      // Load stats for the selected place
      if (result._source && result._source.p_id) {
        loadDestinationStats(result._source.p_id);
      }
    };
    
    // 상세 모달 닫기
    const closeDetailModal = () => {
      showDetailModal.value = false;
      // Reset stats when modal closes
      ageStats.value = [];
      genderStats.value = [];
      totalStatsVisits.value = 0;
    };

    // 장소별 통계 로드
    const loadDestinationStats = async (placeId) => {
      if (!placeId) return;
      try {
        isLoadingStats.value = true;
        const query = {
          size: 0,
          query: { term: { p_id: parseInt(placeId) } },
          aggs: {
            age_distribution: {
              terms: { field: "u_age", size: 10, order: { "_key": "asc" } }
            },
            gender_distribution: {
              terms: { field: "u_gender", size: 2 }
            },
            total_visits: { value_count: { field: "p_id" } }
          }
        };
        
        const response = await fetch(`${config.ES_API}/travel_places/_search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query)
        });
        
        if (!response.ok) throw new Error(`Elasticsearch API 오류: ${response.status}`);
        
        const data = await response.json();
        
        if (data?.aggregations?.age_distribution?.buckets) {
          const allAgeBuckets = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(age => {
            const foundBucket = data.aggregations.age_distribution.buckets.find(b => b.key === age);
            return { age: age, label: `${age}대`, value: foundBucket ? foundBucket.doc_count : 0 };
          });
          ageStats.value = allAgeBuckets;
        } else {
          ageStats.value = [];
        }
        
        if (data?.aggregations?.gender_distribution?.buckets) {
          genderStats.value = data.aggregations.gender_distribution.buckets.map(bucket => ({
            gender: bucket.key,
            label: bucket.key === 'M' ? '남성' : '여성',
            value: bucket.doc_count
          }));
        } else {
          genderStats.value = [{ gender: 'M', label: '남성', value: 0 }, { gender: 'F', label: '여성', value: 0 }];
        }
        
        totalStatsVisits.value = data?.aggregations?.total_visits?.value || 0;
        
      } catch (error) {
        console.error('연령별 방문 통계 로드 오류:', error);
        ageStats.value = [];
        genderStats.value = [];
        totalStatsVisits.value = 0;
      } finally {
        isLoadingStats.value = false;
      }
    };
    
    return {
      searchKeyword,
      lastSearchKeyword,
      searchResults,
      isLoading,
      searchPerformed,
      hasMoreResults,
      totalResults,
      actionStatus,
      showHero,
      heroImageSrc,
      heroTitle,
      heroSubtitle,
      heroHeight,
      performSearch,
      loadMoreResults,
      applyKeyword,
      openDetailModal,
      closeDetailModal,
      isInWishlist,
      toggleWishlist,
      wishlistItems,
      showDetailModal,
      selectedDetail,
      sortedSearchResults,
      // Stats related
      ageStats,
      genderStats,
      totalStatsVisits,
      isLoadingStats
    };
  }
};
</script>

<style scoped>
/* Base styles */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Nunito:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.keyword-search {
  min-height: 100vh;
  position: relative;
  font-family: 'Noto Sans KR', 'Nunito', sans-serif;
  color: #333;
  overflow-x: hidden;
  background-color: #f8f9fa; /* Softer background */
  display: flex;
  flex-direction: column;
}

/* 컨텐츠 영역 */
.content-wrapper {
  position: relative;
  padding: 2rem 0.5rem 3rem;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  width: 95%;
  margin-top: 10px;
  flex: 1;
  /* background-color: #f8f9fa; Remove if keyword-search has it */
}

/* 검색 패널 및 결과 패널 컨테이너 */
.search-panel-container,
.results-panel-container {
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
}

.results-panel-container {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 패널 공통 스타일 */
.search-panel,
.results-panel {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); /* Softer shadow */
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid #eef2f7; /* Lighter border */
}

.search-panel:hover,
.results-panel:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 1.2rem 1.5rem;
  background: #fff; /* Clean white background */
  border-bottom: 1px solid #eef2f7; /* Lighter border */
  position: relative;
}

.panel-header::after {
  content: "";
  position: absolute;
  bottom: -1px; /* Align with border */
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.search-panel:hover .panel-header::after,
.results-panel:hover .panel-header::after {
  transform: scaleX(1);
}

.panel-title {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.2rem; /* Adjusted size */
  font-weight: 600; /* Slightly bolder */
  margin: 0;
  text-align: center;
  color: #34495e; /* Darker, more neutral color */
  letter-spacing: 0.3px;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

.panel-title::after {
  /* Optional: remove this if the header ::after is preferred */
  content: "";
  position: absolute;
  bottom: -6px; /* Adjusted position */
  left: 10%; /* Shorter underline */
  width: 80%;
  height: 2.5px;
  background: var(--logo-blue, #48b0e4);
  border-radius: 1px;
  transform: scaleX(0.5);
  transform-origin: center;
  transition: transform 0.3s ease-out;
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
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-input-container:focus-within {
  box-shadow: 0 5px 15px rgba(var(--logo-blue-rgb, 72, 176, 228), 0.2);
}

.search-input {
  flex: 1;
  padding: 12px 15px; /* Increased padding */
  border: 1px solid #dde2e7; /* Softer border */
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-family: 'Nunito', 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  background-color: white;
  color: #495057;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--logo-blue, #48b0e4);
  background-color: #fcfdff;
}

.btn-search {
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-search:hover {
  background: linear-gradient(135deg, #3a9cd1, #67a58d); /* Darken on hover */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-search:active {
  transform: translateY(0);
}

/* 검색 태그 */
.search-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
}

.search-tag-title {
  font-size: 0.9rem; /* Adjusted size */
  font-weight: 500;
  color: #5f6b7a;
  margin-right: 0.75rem;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-chip {
  background-color: #edf6ff; /* Lighter, softer blue */
  color: #3a8bcd; /* Darker blue text for contrast */
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem; /* Adjusted size */
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #d0e6f8; /* Subtle border */
}

.tag-chip:hover {
  background-color: var(--logo-blue, #48b0e4);
  color: white;
  border-color: var(--logo-blue, #48b0e4);
  transform: translateY(-2px);
  box-shadow: 0 3px 7px rgba(var(--logo-blue-rgb, 72, 176, 228), 0.25);
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #6c757d;
  text-align: center;
}

.spinner {
  width: 50px; /* Adjusted size */
  height: 50px;
  border: 4px solid rgba(var(--logo-blue-rgb, 72, 176, 228), 0.15); /* Thicker border, adjusted color */
  border-radius: 50%;
  border-top-color: var(--logo-blue, #48b0e4);
  animation: spin 0.8s linear infinite; /* Faster spin */
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem; /* Adjusted size */
  color: #495057;
  font-weight: 500;
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
  padding: 4rem 1rem; /* Added horizontal padding */
  color: #a0aec0;
  text-align: center;
  background-color: #f9fafb; /* Light background */
  border-radius: 12px;
  margin: 1rem 0;
}

.no-results-icon {
  color: #cbd5e0; /* Lighter icon color */
  margin-bottom: 1.25rem;
}
.no-results-icon svg {
  width: 50px; /* Adjusted size */
  height: 50px;
}

.no-results-text {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.1rem; /* Slightly larger */
  color: #4a5568; /* Darker text */
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.no-results-hint {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.9rem;
  color: #718096; /* Slightly darker hint */
  margin: 0;
}

/* 결과 그리드 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
  padding: 0.5rem;
}

.result-card {
  position: relative;
  background-color: white;
  border-radius: 12px; /* Softer radius */
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07); /* Refined shadow */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  border: 1px solid #eef2f7; /* Lighter border */
}

.result-card:hover {
  transform: translateY(-6px); /* Subtler lift */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.result-image-container {
  height: 200px;
  width: 100%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  position: relative;
}

.result-image-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.6)); /* Darker gradient */
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-card:hover .result-image-container::before {
  opacity: 1;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.result-card:hover .result-image {
  transform: scale(1.07); /* Subtler zoom */
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  color: #666;
  font-size: 0.9rem;
}

/* 등수 아이콘 스타일 */
.result-rank {
  position: absolute;
  top: 12px; /* Adjusted position */
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 10px; /* Adjusted padding */
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white;
  border-radius: 16px; /* More rounded */
  font-size: 0.75rem; /* Adjusted size */
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.result-rank.with-heart {
  padding-left: 10px;
  gap: 7px;
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 14px;
  text-align: center;
  line-height: 1;
}

.heart-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7); /* Slightly more visible */
  transition: all 0.3s ease;
}

.heart-indicator.active {
  color: var(--logo-coral, #ff8e7f);
  animation: heartbeat 0.8s ease-in-out;
}

.heart-indicator svg {
  fill: transparent;
  transition: fill 0.3s ease;
}

.heart-indicator.active svg {
  fill: var(--logo-coral, #ff8e7f);
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(1.1); }
}

.result-info {
  padding: 1rem 1.2rem; /* Adjusted padding */
  position: relative;
}

.result-name {
  font-size: 1.05rem; /* Adjusted size */
  font-weight: 600;
  color: #34495e; /* Darker, more neutral */
  margin: 0 0 0.4rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.result-card:hover .result-name {
  color: var(--logo-blue, #48b0e4);
}

.result-location {
  display: flex;
  align-items: center;
  gap: 0.3rem; /* Adjusted gap */
  font-size: 0.8rem; /* Adjusted size */
  color: #7f8c8d; /* Softer grey */
  margin-bottom: 0.6rem;
}

.result-visit-count {
  font-size: 0.8rem;
  color: #27ae60; /* Greener */
  font-weight: 500;
  margin-bottom: 0.5rem;
  background-color: #eafaf1;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.location-icon {
  color: var(--logo-blue, #48b0e4);
}

/* 유사도 표시 개선 */
.result-similarity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.similarity-label {
  font-weight: 500;
  color: #7f8c8d;
}

.similarity-bar-container {
  flex-grow: 1;
  height: 7px; /* Slightly thinner */
  background-color: #e8eaed; /* Lighter background */
  border-radius: 4px;
  overflow: hidden;
  /* box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05); Removed for flatter look */
}

.similarity-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.similarity-value {
  font-weight: 600;
  color: var(--logo-blue, #48b0e4);
  font-size: 0.85rem;
}

/* 결과 카드 태그 */
.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem; /* Adjusted margin */
}

.result-tag {
  font-size: 0.7rem; /* Smaller tags */
  padding: 0.25rem 0.6rem;
  background-color: #eef2f7; /* Lighter grey */
  color: #5f6b7a; /* Darker grey text */
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.result-tag:hover {
  background-color: #dde2e7;
  color: #34495e;
  transform: translateY(-1px);
}

/* 더 불러오기 버튼 */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  padding: 10px 24px; /* Adjusted padding */
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white;
  border: none;
  border-radius: 25px; /* More rounded */
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(var(--logo-blue-rgb, 72, 176, 228), 0.2);
}

.load-more-btn:hover {
  background: linear-gradient(135deg, #3a9cd1, #67a58d);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(var(--logo-blue-rgb, 72, 176, 228), 0.25);
}

.no-more-results {
  color: #95a5a6; /* Softer grey */
  font-size: 0.9rem;
}

/* 결과 카드 설명 영역 */
.result-description {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eef2f7; /* Lighter border */
}

.description-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5f6b7a; /* Darker grey */
  margin-bottom: 0.25rem;
}

.description-text {
  font-size: 0.8rem;
  color: #7f8c8d; /* Softer grey */
  margin: 0;
  line-height: 1.5; /* Improved line height */
  max-height: 4.5em; /* 3 lines with 1.5 line height */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 푸터 */
.footer {
  background: #2c3e50; /* Solid dark color */
  padding: 1.8rem 1rem; /* Adjusted padding */
  text-align: center;
  margin-top: auto;
  border-top: none; /* Removed border */
}

.footer p {
  margin: 0;
  color: #ecf0f1; /* Lighter text */
  font-size: 0.9rem;
  letter-spacing: 0.3px;
}

/* 등수 랭킹 컬러 */
.result-card:nth-child(1) .result-rank {
  background: linear-gradient(135deg, #ffdf70, #ffc107); /* Gold */
}

.result-card:nth-child(2) .result-rank {
  background: linear-gradient(135deg, #e0e0e0, #b0b0b0); /* Silver */
}

.result-card:nth-child(3) .result-rank {
  background: linear-gradient(135deg, #e09b5b, #cd7f32); /* Bronze */
}

/* 반응형 조정 */
@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* Smaller cards on mobile */
  }
}

@media (max-width: 600px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .search-input-container {
    flex-direction: column;
  }
  
  .search-input {
    border-radius: 8px;
    border-right: 1px solid #e9ecef;
  }
  
  .btn-search {
    border-radius: 8px;
    margin-top: 0.5rem;
    justify-content: center; /* Center button content */
  }
}
</style>