<template>
  <div class="header">
    <div class="title-container">
      <img src="../assets/logo.png" alt="로고" class="logo-image">
      <h1>|</h1>
      <h2>당신의 여행을 기록하다</h2>
    </div>
  </div>
</template>

<script>
export default {
  // ESLint 오류 수정: 컴포넌트 이름을 두 단어 이상으로 변경
  name: 'AppHeader'
}
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.logo-image {
  margin-bottom: 5px;
  width: 200px;
  height: 100px;
  object-fit: contain;
}

h1 {
  font-family: 'Ownglyph_ParkDaHyun', 'Baloo 2', sans-serif;
  color: var(--primary);
  font-size: 3rem;
  margin: 0;
  text-shadow: 2px 2px 3px var(--shadow);
  font-weight: 700;
  line-height: 1.2;
}

h2 {
  color: var(--accent-green);
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
  font-weight: 700;
}
</style>