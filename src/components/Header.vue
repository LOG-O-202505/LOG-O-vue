<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="nav-group">
        <router-link to="/lookAround" class="nav-item">LOOK AROUND</router-link>
        <router-link to="/llamasearch" class="nav-item">SEARCH</router-link>
      </div>
      
      <div class="nav-center">
        <router-link to="/" class="logo-text">LOG:O</router-link>
      </div>
      
      <div class="nav-group">
        <a href="#" class="nav-item">LOGIN</a>
        <a href="#" class="nav-item">SIGN UP</a>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

.navbar {
  background-color: #1C1C1C; /* 이미지에 맞는 짙은 검은색 */
  width: 100%;
  padding: 3.5rem 0; /* 온보딩 페이지와 동일한 패딩으로 수정 */
  position: relative; /* fixed에서 relative로 변경해 스크롤에 따라 움직이게 함 */
  z-index: 100;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.nav-group {
  display: flex;
  gap: 2.5rem; /* 간격 조정 */
  align-items: center;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.logo-text {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem; /* 크기 조정 */
  font-weight: 600;
  color: white;
  text-decoration: none;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.nav-item {
  font-family: 'Playfair Display', serif; /* 온보딩 페이지와 동일한 폰트로 변경 */
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0.9;
}

.nav-item:hover {
  opacity: 1;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: white;
  transition: width 0.3s ease;
}

.nav-item:hover::after {
  width: 100%;
}

.router-link-active {
  opacity: 1;
}

.router-link-active::after {
  width: 100%;
  background-color: var(--logo-blue, #48b0e4);
  height: 2px;
}

@media (max-width: 900px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .nav-center {
    position: relative;
    left: 0;
    transform: none;
    margin-bottom: 1rem;
    order: -1;
  }
  
  .nav-group {
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .logo-text {
    font-size: 1.8rem;
  }
}

@media (max-width: 600px) {
  .navbar {
    padding: 2rem 0;
  }
  
  .nav-group {
    gap: 1rem;
  }
  
  .nav-item {
    font-size: 0.9rem;
  }
  
  .logo-text {
    font-size: 1.6rem;
  }
}
</style>