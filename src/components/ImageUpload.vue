<template>
    <div class="image-upload">
      <div class="file-input-container">
        <span class="file-input-label">클릭하여 이미지 선택</span>
        <input 
          type="file" 
          id="image" 
          accept="image/*"
          @change="handleFileChange"
        >
      </div>
      
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
    </div>
  </template>
  
  <script>
  import { computed } from 'vue'
  import { useStore } from 'vuex'
  
  export default {
    name: 'ImageUpload',
    
    emits: ['image-selected'],
    
    setup(props, { emit }) {
      const store = useStore()
      
      // Vuex 스토어에서 이미지 미리보기 가져오기
      const previewUrl = computed(() => store.state.image.preview)
      
      // 파일 선택 처리
      const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
          emit('image-selected', file)
        }
      }
      
      return {
        previewUrl,
        handleFileChange
      }
    }
  }
  </script>
  
  <style scoped>
  .image-upload {
    margin-bottom: 20px;
  }
  
  /* 파일 입력 필드용 커스텀 스타일 */
  .file-input-container {
    position: relative;
    overflow: hidden;
    border: 2px dashed var(--logo-coral);
    border-radius: 12px;
    background-color: rgba(255, 142, 127, 0.05);
    padding: 15px;
    text-align: center;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .file-input-container:hover {
    border-color: var(--logo-yellow);
    background-color: rgba(255, 209, 102, 0.1);
    transform: translateY(-2px);
  }
  
  .file-input-container input[type="file"] {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  
  .file-input-label {
    display: block;
    color: var(--logo-coral);
    font-weight: 600;
    cursor: pointer;
  }
  
  .image-preview {
    margin-top: 20px;
    text-align: center;
    border-radius: 16px;
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
    max-height: 400px;
    border-radius: 15px;
  }
  
  .empty-preview {
    padding: 40px 20px;
    color: var(--gray-500);
    font-size: 1.1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .empty-preview svg {
    width: 60px;
    height: 60px;
    color: var(--gray-400);
  }
  
  /* 애니메이션 효과 */
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  .file-input-label {
    animation: bounce 2s infinite;
  }
  </style>