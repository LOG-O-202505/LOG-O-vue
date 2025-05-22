<template>
  <div class="popular-destinations-section">
    <h3 class="section-title">{{ title }}</h3>
    
    <!-- 로딩 표시 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>인기 여행지 정보를 가져오는 중...</p>
    </div>
    
    <!-- 결과가 없을 때 -->
    <div v-else-if="destinations.length === 0" class="no-results">
      <p>해당 지역에 인기 여행지 데이터가 없습니다.</p>
    </div>
    
    <!-- 결과 표시 -->
    <div v-else class="destinations-grid">
      <div 
        v-for="destination in displayDestinations" 
        :key="destination.id" 
        class="destination-card"
        @click="$emit('open-detail', destination)"
      >
        <div class="destination-rank" :class="{ 'with-heart': isInWishlist(destination.id) }">
          <span v-if="isInWishlist(destination.id)" class="heart-indicator active">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </span>
          <span class="rank-number">{{ destination.displayRank }}</span>
        </div>
        <div class="destination-image"> <!-- This div is now a container -->
          <img 
            v-if="destination.p_image" 
            :src="`data:image/jpeg;base64,${destination.p_image}`" 
            :alt="destination.name || '여행지 이미지'" 
            class="destination-actual-image"
          >
          <div v-else class="destination-placeholder">
            <svg class="placeholder-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span class="placeholder-text">이미지 준비중</span>
          </div>
        </div>
        <div class="destination-content">
          <h4>{{ destination.name }}</h4>
          <div class="destination-location">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{{ destination.address }}</span>
          </div>
          <div class="visit-count">
            <span class="count-label">방문 인증:</span>
            <span class="count-value">{{ destination.visitCount }}회</span>
          </div>
          <div class="destination-tags">
            <span v-for="tag in getVisibleTags(destination.tags)" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 더 많은 여행지 버튼 추가 -->
    <div class="view-more-container" v-if="destinations.length > 30 && !showAll">
      <button class="view-more-button" @click="$emit('show-all')">
        모든 인기 여행지 {{ destinations.length }}개 보기
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResultPanel',
  
  props: {
    title: {
      type: String,
      required: true
    },
    destinations: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    showAll: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    // 표시할 여행지 목록 (showAll에 따라 전체 또는 30개만 표시)
    displayDestinations() {
      const maxItems = 30;
      if (this.showAll) {
        return this.destinations;
      }
      return this.destinations.slice(0, maxItems);
    }
  },
  
  methods: {
    isInWishlist(id) {
      return this.$parent.isInWishlist(id);
    },
    
    getVisibleTags(tags) {
      if (!tags || tags.length === 0) {
        return [];
      }
      const tagThresholdLength = 7; // Adjust this threshold as needed
      const potentialTags = tags.slice(0, 3);

      if (potentialTags.length === 3) {
        if (potentialTags.some(tag => tag.length > tagThresholdLength)) {
          return tags.slice(0, 2);
        }
      }
      return potentialTags; // Returns 1, 2, or 3 tags based on checks and availability
    }
  }
}
</script>

<style scoped>
/* 인기 여행지 섹션 */
.popular-destinations-section {
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  margin-bottom: 3rem; /* 추가된 하단 여백 */
}

/* 섹션 타이틀 공통 스타일 */
.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
  color: #48b0e4;
  position: relative;
  padding-left: 12px;
  border-left: 4px solid #48b0e4;
}

.section-title span {
  font-size: 0.9rem;
  font-weight: 400;
  margin-left: 0.5rem;
  color: #777;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 0.5rem;
}

.destination-card {
  position: relative;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 460px; /* Increased to accommodate larger image */
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.destination-rank {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--logo-blue, #48b0e4), var(--logo-green, #76b39d));
  color: white;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

/* 등수 랭킹 컬러 */
.destination-card:nth-child(1) .destination-rank {
  background: linear-gradient(135deg, #ffca2c, #ffab00);
}

.destination-card:nth-child(2) .destination-rank {
  background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
}

.destination-card:nth-child(3) .destination-rank {
  background: linear-gradient(135deg, #d98936, #b0732f);
}

.destination-image {
  height: 360px;
  overflow: hidden;
  position: relative;
  background-color: #f8f9fa; /* Default background for the container */
  transition: transform 0.5s ease; /* Keep this for the hover effect */
}

.destination-actual-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.destination-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  text-align: center;
}

.destination-placeholder .placeholder-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  stroke: #ced4da;
}

.destination-placeholder .placeholder-text {
  font-size: 0.9rem;
  color: #6c757d;
}

.destination-card:hover .destination-image {
  transform: scale(1.05);
}

.destination-content {
  padding: 1.2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.destination-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.7rem 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.destination-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 방문 카운트 스타일 */
.visit-count {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  margin-bottom: 0.7rem;
}

.count-label {
  font-size: 0.85rem;
  color: #666;
  margin-right: 0.5rem;
}

.count-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4299e1;
}

/* 태그 스타일 */
.destination-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  margin-top: 0.8rem;
}

.tag {
  background-color: rgba(72, 176, 228, 0.1);
  border-radius: 50px;
  color: #48b0e4;
  padding: 0.3rem 0.9rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: #48b0e4;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

/* 로딩 컨테이너 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
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

.loading-container p {
  color: #718096;
  font-size: 0.9rem;
}

/* 결과 없음 메시지 스타일 */
.no-results {
  text-align: center;
  padding: 3rem 0;
  color: #718096;
  font-style: italic;
}

/* 더 많은 여행지 보기 버튼 */
.view-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.view-more-button, .view-less-button {
  background-color: #f5f5f5;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.view-more-button:hover, .view-less-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* 추가된 하트 표시 스타일 */
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

.destination-rank.with-heart {
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

/* 반응형 디자인 */
@media (max-width: 1400px) {
  .destinations-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .destinations-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .destinations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .destinations-grid {
    grid-template-columns: 1fr;
  }
}
</style> 