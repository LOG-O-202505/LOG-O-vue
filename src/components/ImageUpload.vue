<template>
  <div class="upload-container">
    <h3 class="section-title">검색을 위한 이미지</h3>
    
    <div class="image-upload-area">
      <div v-if="!previewUrl" class="empty-upload">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <p class="upload-text">이미지를 선택하면 여기에 표시됩니다</p>
        <p class="upload-hint">고품질 여행 사진을 선택하세요</p>
      </div>
      
      <div v-else class="preview-container">
        <img :src="previewUrl" alt="이미지 미리보기" class="preview-image">
      </div>
    </div>
    
    <div class="button-group">
      <button @click="triggerFileInput" class="upload-button">
        <span class="button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </span>
        이미지 선택하기
      </button>
      <button v-if="previewUrl" @click="analyzeImage" class="analyze-button">이미지 분석하기</button>
      <button v-if="previewUrl" @click="resetImage" class="reset-button">초기화</button>
    </div>
    
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      accept="image/*"
      class="hidden-input"
    >
  </div>
</template>

<script>
export default {
  name: 'ImageUpload',
  
  data() {
    return {
      previewUrl: null
    }
  },
  
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.previewUrl = URL.createObjectURL(file);
        this.$emit('image-selected', file);
      }
    },
    
    analyzeImage() {
      this.$emit('analyze-image');
    },
    
    resetImage() {
      this.previewUrl = null;
      this.$refs.fileInput.value = '';
      this.$emit('reset');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.upload-container {
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  color: white;
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

.image-upload-area {
  background-color: #2d3748;
  border: 1px dashed #4a5568;
  border-radius: 8px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.image-upload-area:hover {
  border-color: #4299e1;
  box-shadow: 0 0 15px rgba(66, 153, 225, 0.2);
}

.empty-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
}

.icon-container {
  color: #4299e1;
  margin-bottom: 1rem;
}

.upload-text {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.95rem;
  color: #e2e8f0;
  margin: 0 0 0.5rem 0;
}

.upload-hint {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.8rem;
  color: #a0aec0;
  margin: 0;
  font-style: italic;
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-button, .analyze-button, .reset-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-button {
  background-color: #4299e1;
  color: white;
}

.upload-button:hover {
  background-color: #3182ce;
  transform: translateY(-2px);
}

.analyze-button {
  background-color: #38a169;
  color: white;
}

.analyze-button:hover {
  background-color: #2f855a;
  transform: translateY(-2px);
}

.reset-button {
  background-color: transparent;
  border: 1px solid #a0aec0;
  color: #e2e8f0;
}

.reset-button:hover {
  background-color: rgba(160, 174, 192, 0.1);
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden-input {
  display: none;
}
</style>