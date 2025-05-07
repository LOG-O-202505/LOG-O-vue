<template>
  <div class="image-upload">
    <div class="image-preview">
      <img 
        v-if="previewUrl" 
        :src="previewUrl" 
        alt="이미지 미리보기" 
        class="preview-image"
      >
      <div v-else class="empty-preview">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>이미지를 선택하면 여기에 표시됩니다</span>
      </div>
    </div>
    
    <!-- 이미지 선택 버튼 추가 -->
    <div class="select-button-container">
      <button 
        type="button" 
        class="select-image-button"
        @click="triggerFileInput"
      >
        이미지 선택하기
      </button>
      
      <div class="file-input-container">
        <input 
          type="file" 
          id="image" 
          ref="fileInput"
          accept="image/*"
          @change="handleFileChange"
        >
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ImageUpload',
  
  emits: ['image-selected'],
  
  setup(props, { emit }) {
    const store = useStore()
    const fileInput = ref(null)
    
    // Vuex 스토어에서 이미지 미리보기 가져오기
    const previewUrl = computed(() => store.state.image.preview)
    
    // 파일 선택 창 열기
    const triggerFileInput = () => {
      fileInput.value.click()
    }
    
    // 파일 선택 처리
    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        emit('image-selected', file)
      }
    }
    
    return {
      previewUrl,
      fileInput,
      triggerFileInput,
      handleFileChange
    }
  }
}
</script>

<style scoped>
.image-upload {
  margin-bottom: 20px;
}

/* 이미지 미리보기 영역 */
.image-preview {
  margin-bottom: 12px;
  text-align: center;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px var(--shadow);
  background-color: var(--gray-200);
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gray-300);
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
}

.empty-preview {
  padding: 30px 20px;
  color: var(--gray-500);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-preview svg {
  width: 50px;
  height: 50px;
  color: var(--gray-400);
}

/* 파일 선택 버튼 */
.select-button-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.select-image-button {
  width: 100%;
  background-color: var(--logo-coral);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(72, 176, 228, 0.2);
}

.select-image-button:hover {
  background-color: var(--logo-coral);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(1, 1, 1, 0.3);
}

.select-image-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(72, 176, 228, 0.2);
}

/* 숨겨진 파일 입력 */
.file-input-container {
  display: none;
}

.file-input-container input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>