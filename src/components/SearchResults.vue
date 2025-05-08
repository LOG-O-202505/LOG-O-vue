<template>
  <div class="search-results-container">
    <h3 class="section-title">검색 결과</h3>
    
    <div v-if="results.length === 0" class="no-results">
      <div class="no-results-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </div>
      <p class="no-results-text">검색 결과가 없습니다</p>
      <p class="no-results-hint">다른 이미지로 다시 시도해보세요</p>
    </div>
    
    <div v-else class="results-list">
      <div 
        v-for="(result, index) in results" 
        :key="result.id"
        class="result-item"
      >
        <div class="result-rank">{{ index + 1 }}</div>
        <div class="result-card">
          <div class="result-image-container">
            <img :src="result.imageUrl" :alt="result.name" class="result-image">
          </div>
          <div class="result-info">
            <h4 class="result-name">{{ result.name }}</h4>
            <div class="result-location">
              <span class="location-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              {{ result.location }}
            </div>
            <div class="result-similarity">
              <span class="similarity-label">유사도:</span>
              <div class="similarity-bar-container">
                <div class="similarity-bar" :style="{ width: (result.similarity * 100) + '%' }"></div>
              </div>
              <span class="similarity-value">{{ (result.similarity * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  props: {
    results: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.search-results-container {
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  color: white;
  height: 100%;
}

.section-title {
  font-family: 'Playfair Display', 'Noto Sans KR', serif;
  font-size: 1.3rem;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  color: white;
  letter-spacing: 0.5px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #4299e1, #76b39d);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.no-results-icon {
  color: #a0aec0;
  margin-bottom: 1rem;
}

.no-results-text {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  color: #e2e8f0;
  margin: 0 0 0.5rem 0;
}

.no-results-hint {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.85rem;
  color: #a0aec0;
  margin: 0;
  font-style: italic;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.results-list::-webkit-scrollbar {
  width: 6px;
}

.results-list::-webkit-scrollbar-track {
  background: #2d3748;
  border-radius: 10px;
}

.results-list::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 10px;
}

.results-list::-webkit-scrollbar-thumb:hover {
  background: #4299e1;
}

.result-item {
  position: relative;
  padding-left: 2rem;
}

.result-rank {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(66, 153, 225, 0.3);
  z-index: 1;
}

.result-item:nth-child(1) .result-rank {
  background: linear-gradient(135deg, #f6e05e, #d69e2e);
}

.result-item:nth-child(2) .result-rank {
  background: linear-gradient(135deg, #e2e8f0, #a0aec0);
}

.result-item:nth-child(3) .result-rank {
  background: linear-gradient(135deg, #ed8936, #c05621);
}

.result-card {
  display: flex;
  background-color: #2d3748;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.result-image-container {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
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

.result-info {
  flex-grow: 1;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-name {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.4rem 0;
  color: white;
}

.result-location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.8rem;
  color: #a0aec0;
  margin-bottom: 0.5rem;
}

.location-icon {
  color: #4299e1;
}

.result-similarity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.similarity-label {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.75rem;
  color: #a0aec0;
}

.similarity-bar-container {
  flex-grow: 1;
  height: 6px;
  background-color: #4a5568;
  border-radius: 3px;
  overflow: hidden;
}

.similarity-bar {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #76b39d);
  border-radius: 3px;
  transition: width 1s ease;
}

.similarity-value {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #e2e8f0;
  min-width: 30px;
  text-align: right;
}

@media (max-width: 768px) {
  .search-results-container {
    padding: 1.5rem;
  }
  
  .result-image-container {
    width: 60px;
    height: 60px;
  }
  
  .result-info {
    padding: 0.5rem 0.75rem;
  }
}
</style>