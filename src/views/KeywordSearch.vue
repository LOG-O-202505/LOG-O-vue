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
      
      <!-- 결과 영역 (전체 너비) - SearchResultPanel 사용 -->
      <SearchResultPanel
        v-else-if="searchPerformed"
        :title="`'${lastSearchKeyword}' 검색 결과 (${searchResults.length}건 중 ${totalResults} 개)`"
        :destinations="formattedSearchResults"
        :isLoading="false"
        :showAll="true"
        @open-detail="openDetailModal"
      />
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
import SearchResultPanel from "@/components/SearchResultPanel.vue";
import { searchImagesByKeyword } from "@/services/api";
import config from "@/config.js";

export default {
  name: "KeywordSearch",
  
  components: {
    Header,
    PlaceDetailModal,
    SearchResultPanel
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
    
    // SearchResultPanel 컴포넌트에 전달할 데이터 형식으로 변환
    const formattedSearchResults = computed(() => {
      return sortedSearchResults.value.map((result, index) => {
        return {
          id: result._id,
          name: result._source.p_name,
          address: result._source.p_address,
          region: result._source.p_region,
          sig: result._source.p_sig,
          description: result._source.p_description,
          tags: result._source.p_tags || [],
          p_image: result._source.p_image,
          location_data: result._source.location_data,
          visitCount: result._source.visitCount || 0,
          displayRank: index + 1,
          _score: result._score, // 유사도 점수 보존
          _source: result._source // 원본 데이터 보존
        };
      });
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
    const openDetailModal = (destination) => {
      // SearchResultPanel에서 넘어온 데이터인 경우 (id, name 등의 형태) vs 직접 result에서 열 경우 (_id, _score 등의 형태)
      let detailData;
      
      if (destination.id !== undefined) {
        // SearchResultPanel에서 넘어온 데이터 처리
        detailData = {
          _id: destination.id,
          _score: destination._score,
          ...destination._source, // SearchResultPanel에서 원본 _source를 전달
        reviews: dummyReviews
      };
      } else {
        // 직접 result에서 열 경우 (이전 방식)
        detailData = {
          _id: destination._id,
          _score: destination._score,
          ...destination._source,
          reviews: dummyReviews
        };
      }
      
      selectedDetail.value = detailData;
      showDetailModal.value = true;
      
      // Load stats for the selected place
      if (detailData.p_id) {
        loadDestinationStats(detailData.p_id);
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
    
    // 이미지 URL 생성 함수
    const getImageUrl = (imageData) => {
      if (!imageData) return null;
      
      // 이미 data:image 형식이면 그대로 반환
      if (imageData.startsWith('data:image')) {
        return imageData;
      }
      
      // base64 문자열만 있으면 접두사 추가
      return `data:image/jpeg;base64,${imageData}`;
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
      formattedSearchResults,
      // Stats related
      ageStats,
      genderStats,
      totalStatsVisits,
      isLoadingStats,
      getImageUrl
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
.search-panel-container {
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
  background: #fff;
  border-bottom: 2px solid #eef2f7;
  position: relative;
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

/* 반응형 조정 */
@media (max-width: 600px) {
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