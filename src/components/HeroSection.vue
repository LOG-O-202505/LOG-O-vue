<template>
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">여행 이미지 분석</h1>
        <p class="hero-subtitle">찾고 있는 분위기의 여행지를 발견하세요</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HeroSection'
  }
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
  
  .hero-section {
    width: 100%;
    height: 320px;
    position: relative;
    background-image: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470');
    background-size: cover;
    background-position: center;
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 0 2rem;
    max-width: 1400px;
    margin: 0 auto;
    color: white;
  }
  
  .hero-title {
    font-size: 3rem;
    font-weight: 600;
    margin-bottom: 1rem;
    font-family: 'Noto Sans KR', sans-serif;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
    font-weight: 300;
    margin: 0;
    opacity: 0.9;
    font-family: 'Noto Sans KR', sans-serif;
  }
  
  @media (max-width: 900px) {
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-subtitle {
      font-size: 1.2rem;
    }
  }
  
  @media (max-width: 600px) {
    .hero-section {
      height: 250px;
    }
    
    .hero-title {
      font-size: 2rem;
    }
    
    .hero-subtitle {
      font-size: 1rem;
    }
  }
  </style>