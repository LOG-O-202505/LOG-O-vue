<template>
  <div class="header">
    <div class="header-container">
      <!-- 왼쪽에 로고 배치 -->
      <div class="logo-container">
        <img src="../assets/logo.png" alt="로고" class="logo-image">
        <span class="logo-title">| 당신의 여행을 기록하다</span>
      </div>
      
      <!-- 오른쪽에 네비게이션과 로그인 버튼 배치 -->
      <div class="nav-container">
        <nav class="main-nav">
          <button class="nav-btn active">홈</button>
          <button class="nav-btn">갤러리</button>
          <button class="nav-btn">도움말</button>
        </nav>
        <button class="login-btn">로그인</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>

<style scoped>
.header {
  margin-bottom: 25px;
  position: relative;
  background-color: var(--white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px 25px;
  width: 100%;
  border-bottom: 1px solid var(--gray-200);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1440px;
  margin: 0 auto;
  height: 50px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-image {
  width: 140px;
  height: 50px;
  object-fit: contain;
}

.logo-title {
  color: var(--gray-800);
  font-size: 1.25rem;
  font-weight: 600;
  white-space: nowrap;
}

.nav-container {
  display: flex;
  align-items: center;
  gap: 25px;
}

.main-nav {
  display: flex;
  gap: 10px;
}

.nav-btn {
  background: none;
  border: none;
  color: var(--gray-700);
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 4px;
  transition: all 0.2s ease;
  box-shadow: none;
}

.nav-btn:hover, .nav-btn.active {
  background-color: var(--gray-100);
  color: var(--logo-blue);
}

.login-btn {
  background-color: var(--logo-blue);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background-color: var(--primary-dark);
}

@media (max-width: 600px) {
  .header-container {
    flex-direction: column;
    gap: 15px;
    height: auto;
  }
  
  .nav-container {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
