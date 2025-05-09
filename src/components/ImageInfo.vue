<template>
  <div class="form-group">
    <h3>이미지 정보 입력</h3>
    
    <div class="layout-container">
      <!-- 왼쪽 영역: 이름, 태그, 설명 (세로로 나열) -->
      <div class="left-column">
        <!-- 이미지 이름 -->
        <div class="input-group name-input">
          <label for="image-name">이미지 이름</label>
          <input 
            type="text" 
            id="image-name"
            v-model="imageInfo.name"
            placeholder="이미지의 이름을 입력하세요"
          >
        </div>
        
        <!-- 태그 -->
        <div class="input-group tags-input">
          <label for="image-tags">태그</label>
          <input 
            type="text" 
            id="image-tags"
            v-model="imageInfo.tags"
            placeholder="쉼표로 구분된 태그를 입력하세요 (예: 바다,산,휴양지)"
          >
        </div>
        
        <!-- 이미지 설명 (더 큰 크기) -->
        <div class="input-group description-input">
          <label for="image-description">이미지 설명</label>
          <textarea 
            id="image-description"
            v-model="imageInfo.description"
            placeholder="이미지에 대한 간단한 설명을 입력하세요"
          ></textarea>
        </div>
      </div>
      
      <!-- 오른쪽 영역: 오직 위치 정보 (지도)만 -->
      <div class="right-column">
        <div class="input-group location-group">
          <label for="image-location">위치 정보</label>
          <LocationSearch @location-selected="onLocationSelected" class="location-search" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'
import LocationSearch from './LocationSearch.vue'

export default {
  name: 'ImageInfo',
  
  components: {
    LocationSearch
  },
  
  emits: ['info-updated'],
  
  setup(props, { emit }) {
    // 이미지 정보 상태
    const imageInfo = reactive({
      name: '',
      location: '',
      tags: '',
      description: ''
    })
    
    // 위치 선택 처리
    const onLocationSelected = (location) => {
      imageInfo.location = location
    }
    
    // 정보 변경 감지 및 이벤트 발생
    watch(imageInfo, (newValue) => {
      emit('info-updated', { ...newValue })
    }, { deep: true })
    
    return {
      imageInfo,
      onLocationSelected
    }
  }
}
</script>

<style scoped>
/* 레이아웃 구조 */
.layout-container {
  display: flex;
  gap: 24px;
}

.left-column {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.right-column {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

/* 입력 필드 간격과 크기 조정 */
.name-input, .tags-input {
  margin-bottom: 16px;
}

/* 설명 필드 확장 */
.description-input {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.description-input textarea {
  flex-grow: 1;
  min-height: 200px; /* 더 긴 텍스트 영역 */
}

/* 위치 검색 컨테이너 - 세로로 확장 */
.location-group {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.location-search {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 입력 폼 스타일 */
.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 1rem;
  color: var(--gray-700);
}

.input-group input, 
.input-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  font-family: 'Nunito', 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  background-color: var(--white);
  color: var(--gray-800); /* 텍스트 색상 명시적 지정 */
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus, 
.input-group textarea:focus {
  outline: none;
  border-color: var(--logo-blue);
  box-shadow: 0 0 0 3px rgba(72, 176, 228, 0.15);
  transform: translateY(-1px);
}

.input-group textarea {
  resize: vertical;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .layout-container {
    flex-direction: column-reverse; /* 모바일에서는 지도가 위로 오게 */
  }
  
  .description-input textarea {
    min-height: 150px; /* 모바일에서는 설명 영역 높이 줄임 */
  }
}
</style>