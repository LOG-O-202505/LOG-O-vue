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
      <div class="no-results-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </div>
      <p class="no-results-text">검색 결과가 없습니다</p>
      <p class="no-results-hint">다른 키워드로 다시 시도해보세요</p>
    </div>

    <!-- 결과 표시 -->
    <div v-else class="results-grid">
      <div v-for="destination in displayDestinations" :key="destination.id" class="result-card"
        @click="$emit('open-detail', destination)">
        <div class="result-rank" :class="{ 'with-heart': isInWishlist(destination.id) }">
          <span v-if="isInWishlist(destination.id)" class="heart-indicator active">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
              </path>
            </svg>
          </span>
          <span class="rank-number">{{ destination.displayRank }}</span>
        </div>
        <div class="result-image-container">
          <img v-if="destination.p_image" :src="`data:image/jpeg;base64,${destination.p_image}`"
            :alt="destination.name || '여행지 이미지'" class="result-image">
          <div v-else class="placeholder-image">이미지 없음</div>
        </div>
        <div class="result-info">
          <h4 class="result-name">{{ destination.name }}</h4>
          <div class="result-location">
            <span class="location-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
            {{ destination.address }}
          </div>
          <div class="result-visit-count">
            인증: {{ destination.visitCount }}회
          </div>
          <div v-if="destination._score" class="result-similarity">
            <span class="similarity-label">유사도:</span>
            <div class="similarity-bar-container">
              <div class="similarity-bar" :style="{ width: `${(destination._score * 100)}%` }"></div>
            </div>
            <span class="similarity-value">{{ (destination._score * 100).toFixed(0) }}%</span>
          </div>
          <!-- 키워드 표시 영역 -->
          <div v-if="destination.tags && destination.tags.length > 0" class="result-tags">
            <span v-for="(tag, tagIndex) in getVisibleTags(destination.tags)" :key="tagIndex" class="result-tag"
              @click.stop="$parent.applyKeyword && $parent.applyKeyword(tag)">
              {{ tag }}
            </span>
          </div>
          <!-- 이미지 설명 -->
          <div v-if="destination.description" class="result-description">
            <div class="description-title">설명:</div>
            <p class="description-text">{{ destination.description }}</p>
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
  margin-bottom: 3rem;
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
  width: 50px;
  height: 50px;
  border: 4px solid rgba(72, 176, 228, 0.15);
  border-radius: 50%;
  border-top-color: #48b0e4;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem;
  color: #495057;
  font-weight: 500;
}

/* 결과 없음 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: #a0aec0;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 12px;
  margin: 1rem 0;
}

.no-results-icon {
  color: #cbd5e0;
  margin-bottom: 1.25rem;
}

.no-results-text {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.1rem;
  color: #4a5568;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.no-results-hint {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.9rem;
  color: #718096;
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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  border: 1px solid #eef2f7;
}

.result-card:hover {
  transform: translateY(-6px);
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
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.6));
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
  transform: scale(1.07);
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
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #48b0e4, #76b39d);
  color: white;
  border-radius: 16px;
  font-size: 0.75rem;
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

/* 하트 표시 스타일 */
.heart-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.heart-indicator.active {
  color: #ff8e7f;
  animation: heartbeat 0.8s ease-in-out;
}

.heart-indicator svg {
  fill: transparent;
  transition: fill 0.3s ease;
}

.heart-indicator.active svg {
  fill: #ff8e7f;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(1.1); }
}

/* 등수 랭킹 컬러 */
.result-card:nth-child(1) .result-rank {
  background: linear-gradient(135deg, #ffdf70, #ffc107);
}

.result-card:nth-child(2) .result-rank {
  background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
}

.result-card:nth-child(3) .result-rank {
  background: linear-gradient(135deg, #e09b5b, #cd7f32);
}

/* 결과 정보 영역 */
.result-info {
  padding: 1rem 1.2rem;
  position: relative;
}

.result-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: #34495e;
  margin: 0 0 0.4rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.result-card:hover .result-name {
  color: #48b0e4;
}

.result-location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.6rem;
}

.location-icon {
  color: #48b0e4;
}

.result-visit-count {
  font-size: 0.8rem;
  color: #27ae60;
  font-weight: 500;
  margin-bottom: 0.5rem;
  background-color: #eafaf1;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

/* 유사도 표시 */
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
  height: 7px;
  background-color: #e8eaed;
  border-radius: 4px;
  overflow: hidden;
}

.similarity-bar {
  height: 100%;
  background: linear-gradient(90deg, #48b0e4, #76b39d);
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.similarity-value {
  font-weight: 600;
  color: #48b0e4;
  font-size: 0.85rem;
}

/* 장소 설명 스타일 */
.result-description {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eef2f7;
}

.description-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5f6b7a;
  margin-bottom: 0.25rem;
}

.description-text {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
  max-height: 4.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 태그 스타일 */
.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.result-tag {
  font-size: 0.7rem;
  padding: 0.25rem 0.6rem;
  background-color: #eef2f7;
  color: #5f6b7a;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.result-tag:hover {
  background-color: #dde2e7;
  color: #34495e;
  transform: translateY(-1px);
}

/* 더 많은 여행지 보기 버튼 */
.view-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.view-more-button {
  padding: 10px 24px;
  background: linear-gradient(135deg, #48b0e4, #76b39d);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(72, 176, 228, 0.2);
}

.view-more-button:hover {
  background: linear-gradient(135deg, #3a9cd1, #67a58d);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(72, 176, 228, 0.25);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 600px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>