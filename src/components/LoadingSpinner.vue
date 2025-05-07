<template>
    <div class="loading">
      <div class="spinner">
        <div></div>
        <div></div>
      </div>
      <p>이미지를 분석 중입니다<span>.</span><span>.</span><span>.</span></p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoadingSpinner'
  }
  </script>
  
  <style scoped>
  .loading {
    text-align: center;
    margin-top: 20px;
    padding: 20px;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 15px auto;
    position: relative;
  }
  
  .spinner div {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    height: 100%;
    border: 6px solid transparent;
    border-top-color: var(--logo-blue);
    border-radius: 50%;
    animation: spinnerOne 1.2s linear infinite;
  }
  
  .spinner div:nth-child(2) {
    border: 6px solid transparent;
    border-bottom-color: var(--logo-coral);
    animation: spinnerTwo 1.2s linear infinite;
  }
  
  @keyframes spinnerOne {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes spinnerTwo {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
  
  .loading p {
    font-size: 1.1rem;
    color: var(--logo-blue);
    font-weight: 600;
    margin: 0;
  }
  
  .loading p span {
    display: inline-block;
    animation: pulse 1.2s infinite;
  }
  
  .loading p span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .loading p span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  </style>