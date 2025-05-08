<template>
    <div class="search-guide-container">
      <div class="guide-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </div>
      
      <h2 class="guide-title">사진으로 여행지를 검색해보세요</h2>
      
      <p class="guide-description">
        원하는 분위기의 이미지를 업로드하면 AI가 분석하여 유사한 여행지를 추천해드립니다
      </p>
      
      <div class="steps-container">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">이미지 선택</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">분석 실행</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">여행지 추천 확인</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SearchGuide'
  }
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
  
  .search-guide-container {
    background-color: #1c1c1c;
    border-radius: 8px;
    padding: 2.5rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: white;
    height: 100%;
  }
  
  .guide-icon {
    color: #4299e1;
    margin-bottom: 1.5rem;
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .guide-title {
    font-family: 'Playfair Display', 'Noto Sans KR', serif;
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: white;
    letter-spacing: 0.5px;
  }
  
  .guide-description {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 1rem;
    line-height: 1.6;
    color: #e2e8f0;
    margin: 0 0 2rem 0;
    max-width: 500px;
  }
  
  .steps-container {
    display: flex;
    gap: 2rem;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #4299e1, #3182ce);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(66, 153, 225, 0.3);
    transition: all 0.3s ease;
  }
  
  .step:hover .step-number {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(66, 153, 225, 0.4);
  }
  
  .step-text {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 0.9rem;
    color: #a0aec0;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .steps-container {
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .search-guide-container {
      padding: 2rem 1.5rem;
    }
    
    .guide-title {
      font-size: 1.5rem;
    }
  }
  </style>