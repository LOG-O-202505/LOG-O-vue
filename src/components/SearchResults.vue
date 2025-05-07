<template>
    <div class="search-results container">
      <h3>검색 결과</h3>
      <div class="results-container">
        <div 
          v-if="results.length === 0" 
          class="no-results"
        >
          검색 결과가 없습니다.
        </div>
        
        <div 
          v-for="result in results" 
          :key="result._id"
          class="result-card"
        >
          <img 
            :src="`data:image/jpeg;base64,${result._source.image_data}`" 
            :alt="result._source.image_name"
            class="result-image"
          >
          <div class="result-info">
            <h4 class="result-title">{{ result._source.image_name }}</h4>
            <p class="result-location">{{ result._source.image_location }}</p>
            <p class="result-score">유사도: {{ (Math.round(result._score * 100) / 100).toFixed(2) }}</p>
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
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  .search-results {
    margin-top: 30px;
  }
  
  .search-results h3 {
    margin-top: 0;
    color: var(--logo-blue);
    font-size: 1.2rem;
    margin-bottom: 18px;
  }
  
  .results-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .no-results {
    grid-column: 1 / -1;
    padding: 20px;
    text-align: center;
    color: var(--gray-500);
    font-style: italic;
    background-color: var(--gray-100);
    border-radius: 10px;
  }
  
  .result-card {
    background-color: white;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .result-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
  }
  
  .result-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  
  .result-info {
    padding: 15px;
  }
  
  .result-title {
    font-weight: 600;
    font-size: 1.05rem;
    margin: 0 0 5px 0;
    color: var(--gray-800);
  }
  
  .result-location {
    font-size: 0.9rem;
    color: var(--gray-600);
    margin: 0 0 8px 0;
  }
  
  .result-score {
    font-size: 0.85rem;
    color: var(--logo-blue);
    font-weight: 500;
  }
  
  @media (max-width: 600px) {
    .results-container {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }
  </style>