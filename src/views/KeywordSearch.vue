<template>
  <div class="keyword-search">
    <!-- 헤더 - 페이지와 함께 스크롤됨 -->
    <Header />
    
    <!-- 히어로 섹션 -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">여행지 키워드 검색</h1>
        <p class="hero-subtitle">원하는 여행지 키워드로 이미지를 검색해보세요</p>
      </div>
    </div>
    
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
                v-for="result in searchResults" 
                :key="result._id"
                class="result-card"
              >
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
                  <div class="result-tags" v-if="result._source.image_tags && result._source.image_tags.length > 0">
                    <div class="tags-container">
                      <span 
                        v-for="(tag, tagIndex) in result._source.image_tags" 
                        :key="tagIndex"
                        class="result-tag"
                        @click="applyKeyword(tag)"
                      >
                        #{{ tag }}
                      </span>
                    </div>
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
  </div>
</template>

<script>
import { ref, computed } from "vue";
import Header from "@/components/Header.vue";
import { searchImagesByKeyword } from "@/services/api";

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
      applyKeyword
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

/* 히어로 섹션 */
.hero-section {
  position: relative;
  height: 320px;
  background-image: url('https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1470');
  background-size: cover;
  background-position: center;
  margin-bottom: 0;
  padding-top: 7rem;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7));
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
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.08);
}

.result-image-container {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.result-card:hover .result-image {
  transform: scale(1.05);
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
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .hero-section {
    height: 250px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
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
</style> 