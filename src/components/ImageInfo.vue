<template>
    <div class="form-group">
      <h3>이미지 정보 입력</h3>
      
      <!-- 이미지 이름 -->
      <div class="input-group">
        <label for="image-name">이미지 이름</label>
        <input 
          type="text" 
          id="image-name"
          v-model="imageInfo.name"
          placeholder="이미지의 이름을 입력하세요"
        >
      </div>
      
      <!-- 위치 정보 -->
      <div class="input-group">
        <label for="image-location">위치 정보</label>
        <LocationSearch @location-selected="onLocationSelected" />
      </div>
      
      <!-- 태그 -->
      <div class="input-group">
        <label for="image-tags">태그</label>
        <input 
          type="text" 
          id="image-tags"
          v-model="imageInfo.tags"
          placeholder="쉼표로 구분된 태그를 입력하세요 (예: 바다,산,휴양지)"
        >
      </div>
      
      <!-- 이미지 설명 -->
      <div class="input-group">
        <label for="image-description">이미지 설명</label>
        <textarea 
          id="image-description"
          v-model="imageInfo.description"
          placeholder="이미지에 대한 간단한 설명을 입력하세요"
        ></textarea>
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
  /* 입력 폼 스타일 */
  .input-group {
    margin-bottom: 18px;
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
    max-width: 100%;
    padding: 12px;
    border: 1px solid var(--gray-300);
    border-radius: 10px;
    font-family: 'Nunito', 'Noto Sans KR', sans-serif;
    font-size: 1rem;
    background-color: var(--white);
    transition: all 0.3s ease;
    box-sizing: border-box;
  }
  
  .input-group input:focus, .input-group textarea:focus {
    outline: none;
    border-color: var(--logo-blue);
    box-shadow: 0 0 0 3px rgba(72, 176, 228, 0.15);
    transform: translateY(-1px);
  }
  
  .input-group textarea {
    min-height: 80px;
    resize: vertical;
  }
  </style>