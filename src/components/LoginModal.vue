<template>
  <div class="relative">
    <button @click="open = true" class="gradient-button text-white px-4 py-2 rounded-md">
      로그인
    </button>

    <!-- 성공 토스트 메시지 -->
    <transition name="toast">
      <div
        v-if="showSuccessToast"
        class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>로그인에 성공했습니다!</span>
      </div>
    </transition>

    <!-- 모달 -->
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
      <div class="relative p-0 overflow-hidden max-w-6xl w-[95vw] h-[80vh] max-h-[800px] bg-white rounded-lg shadow-xl">
        <div class="grid grid-cols-1 md:grid-cols-2 h-full">
          <!-- 왼쪽 로그인 폼 섹션 -->
          <div class="p-10 relative flex items-center">
            <button
              @click="closeModal"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span class="sr-only">닫기</span>
            </button>

            <div class="space-y-8 max-w-md mx-auto w-full">
              <div class="text-center">
                <h2 class="text-2xl font-semibold">당신만의 여행을 기록해보세요 : )</h2>
              </div>

              <div
                ref="socialButtonsRef"
                class="space-y-4 overflow-hidden transition-all duration-500 ease-in-out"
                :style="{
                  height: socialButtonsHeight,
                  opacity: showLogoLogin ? 0 : 1,
                  marginBottom: showLogoLogin ? 0 : undefined,
                }"
              >
                <!-- 구글 로그인 버튼 -->
                <button
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  GOOGLE로 계속하기
                </button>

                <!-- 네이버 로그인 버튼 -->
                <button
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-[#03C75A] text-white hover:bg-[#02b350]"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M13.5 3H6.5C4.567 3 3 4.567 3 6.5V13.5C3 15.433 4.567 17 6.5 17H13.5C15.433 17 17 15.433 17 13.5V6.5C17 4.567 15.433 3 13.5 3Z"
                      fill="white"
                    />
                    <path d="M11.5 10.8L8.5 6.5H6.5V13.5H8.5V9.2L11.5 13.5H13.5V6.5H11.5V10.8Z" fill="#03C75A" />
                  </svg>
                  NAVER로 계속하기
                </button>

                <!-- 카카오 로그인 버튼 -->
                <button
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-[#FEE500] text-[#3A1D1D] hover:bg-[#FFDC3C]"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10 3C5.58172 3 2 5.69471 2 9.0625C2 11.1869 3.42328 13.0461 5.5 14.0938L4.375 17.5L8.15625 14.9062C8.75 14.9688 9.375 15 10 15C14.4183 15 18 12.3053 18 9.0625C18 5.69471 14.4183 3 10 3Z"
                      fill="#3A1D1D"
                    />
                  </svg>
                  KAKAO로 계속하기
                </button>

                <!-- LOG:O 로그인 버튼 - 그라데이션 색상 적용 -->
                <button
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-white gradient-button"
                  @click="handleLogoLogin"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" fill="white" />
                    <path
                      d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM8 6H12V8H8V6ZM13 14H7V12H13V14ZM13 11H7V9H13V11Z"
                      fill="currentColor"
                    />
                  </svg>
                  LOG:O로 계속하기
                </button>
              </div>

              <div
                ref="dividerRef"
                class="relative transition-all duration-500 ease-in-out"
                :style="{
                  opacity: showLogoLogin ? 0 : 1,
                  height: showLogoLogin ? 0 : 'auto',
                  overflow: 'hidden',
                  marginBottom: showLogoLogin ? 0 : undefined,
                }"
              >
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">간편하게 가입해보세요 : )</span>
                </div>
              </div>

              <form
                @submit.prevent="showLogoLogin ? handleLogin : handleGetStarted"
                class="space-y-4"
                :style="{
                  transform: showLogoLogin ? 'translateY(-60px)' : 'translateY(0)',
                  transition: 'transform 0.5s ease-in-out',
                }"
              >
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <input
                    id="email"
                    type="email"
                    v-model="email"
                    @input="loginError = false"
                    :class="[
                      'mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-offset-0',
                      loginError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500',
                    ]"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div
                  v-if="showLogoLogin"
                  class="transition-all duration-500 ease-in-out"
                  style="opacity: 1; height: auto"
                >
                  <label for="loginPassword" class="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    v-model="loginPassword"
                    @input="loginError = false"
                    :class="[
                      'mt-1 block w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-offset-0',
                      loginError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500',
                    ]"
                    required
                  />
                </div>

                <div v-if="loginError" class="text-red-500 text-sm">
                  이메일과 비밀번호를 확인 후 다시 시도해주세요.
                </div>

                <button
                  type="submit"
                  class="w-full px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md"
                >
                  {{ showLogoLogin ? "LOGIN" : "이메일로 시작하기" }}
                </button>

                <button
                  v-if="showLogoLogin"
                  type="button"
                  class="w-full px-4 py-2 text-gray-500 hover:text-gray-700 bg-transparent"
                  @click="handleBackToSocial"
                >
                  이전으로
                </button>
              </form>
            </div>
          </div>

          <!-- 오른쪽 이미지 섹션 - 그라데이션 배경 적용 -->
          <div class="relative">
            <!-- 배경 이미지 -->
            <div class="absolute inset-0 transition-opacity duration-500" :style="{ opacity: imageOpacity }">
              <div class="w-full h-full gradient-background">
                <canvas ref="canvasRef" class="w-full h-full"></canvas>
              </div>
            </div>

            <!-- 회원가입 폼 -->
            <div
              class="absolute inset-0 p-10 flex items-center justify-center transition-opacity duration-500"
              :class="showSignup ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >
              <div class="bg-white/90 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6 backdrop-blur-sm">
                <h3 class="text-xl font-semibold text-center">회원 가입</h3>

                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    v-model="password"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    required
                  />
                </div>

                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    v-model="confirmPassword"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    required
                  />
                </div>

                <div>
                  <label for="nickname" class="block text-sm font-medium text-gray-700">
                    닉네임
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    v-model="nickname"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    required
                  />
                </div>

                <div>
                  <label for="birthdate" class="block text-sm font-medium text-gray-700">
                    생일
                  </label>
                  <input
                    id="birthdate"
                    type="date"
                    v-model="birthdate"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    required
                  />
                </div>

                <button class="w-full px-4 py-2 text-white gradient-button rounded-md">회원 가입</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

// 가상의 사용자 데이터 (실제로는 API 호출로 대체)
const MOCK_USER = {
  email: 'test@example.com',
  password: 'password123',
}

// 상태 관리
const open = ref(false)
const email = ref('')
const password = ref('')
const loginPassword = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const birthdate = ref('')
const showSignup = ref(false)
const imageOpacity = ref(1)
const showLogoLogin = ref(false)
const socialButtonsHeight = ref('auto')
const loginError = ref(false)
const showSuccessToast = ref(false)

// refs
const socialButtonsRef = ref(null)
const dividerRef = ref(null)
const canvasRef = ref(null)

// 회원가입 폼 표시 애니메이션
watch(showSignup, (newValue) => {
  if (newValue) {
    const fadeOut = setInterval(() => {
      imageOpacity.value = Math.max(imageOpacity.value - 0.05, 0.2)
      if (imageOpacity.value <= 0.2) clearInterval(fadeOut)
    }, 30)
  } else {
    imageOpacity.value = 1
  }
})

// LOG:O 로그인 애니메이션
watch(showLogoLogin, async (newValue) => {
  if (newValue && socialButtonsRef.value) {
    await nextTick()
    const height = socialButtonsRef.value.scrollHeight
    socialButtonsHeight.value = `${height}px`

    // 애니메이션 시작
    setTimeout(() => {
      socialButtonsHeight.value = '0px'
    }, 50)
  } else {
    socialButtonsHeight.value = 'auto'
  }
})

// 성공 토스트 메시지 타이머
watch(showSuccessToast, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  }
})

// 캔버스 파도 애니메이션
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  const drawWave = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 배경 그라데이션은 CSS로 처리하므로 여기서는 투명하게 설정
    ctx.fillStyle = 'rgba(255, 255, 255, 0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 파도 효과 그리기
    const time = Date.now() * 0.001
    const waves = 10

    for (let i = 0; i < waves; i++) {
      ctx.beginPath()
      // 파도 색상을 약간 밝게 설정
      const alpha = 0.05 + i * 0.01
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`

      for (let x = 0; x < canvas.width; x += 5) {
        const y =
          Math.sin(x * 0.01 + time + i * 0.5) * 20 +
          Math.sin(x * 0.02 + time + i * 0.3) * 15 +
          canvas.height / 2 -
          i * 15

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.closePath()
      ctx.fill()
    }
  }

  const animate = () => {
    drawWave()
    requestAnimationFrame(animate)
  }

  animate()

  const handleResize = () => {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }

  window.addEventListener('resize', handleResize)
  
  // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

// 이벤트 핸들러
const handleGetStarted = () => {
  if (email.value) {
    showSignup.value = true
  }
}

const handleLogoLogin = () => {
  showLogoLogin.value = true
  loginError.value = false
}

const handleBackToSocial = () => {
  showLogoLogin.value = false
  loginPassword.value = ''
  loginError.value = false
}

const handleLogin = () => {
  // 간단한 로그인 검증 (실제로는 API 호출로 대체)
  if (email.value === MOCK_USER.email && loginPassword.value === MOCK_USER.password) {
    // 로그인 성공
    loginError.value = false
    open.value = false
    showSuccessToast.value = true
    resetForm()
  } else {
    // 로그인 실패
    loginError.value = true
  }
}

const closeModal = () => {
  open.value = false
  resetForm()
}

const resetForm = () => {
  email.value = ''
  password.value = ''
  loginPassword.value = ''
  confirmPassword.value = ''
  nickname.value = ''
  birthdate.value = ''
  showSignup.value = false
  showLogoLogin.value = false
  imageOpacity.value = 1
  socialButtonsHeight.value = 'auto'
  loginError.value = false
}
</script>

<style scoped>
/* 토스트 메시지 애니메이션 */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* 그라데이션 배경 애니메이션 */
.gradient-background {
  background: linear-gradient(
    132deg,
    #f8bbd0,
    #d1c4e9,
    #b3e5fc,
    #b2dfdb,
    #c8e6c9,
    #fff9c4,
    #ffccbc,
    #d1c4e9,
    #c5cae9,
    #ffcdd2,
    #f8bbd0
  );
  background-size: 1000% 1000%;
  animation: gradient 30s ease infinite;
}

.gradient-button {
  background: linear-gradient(
    132deg,
    #f06292,
    #9575cd,
    #4fc3f7,
    #4db6ac,
    #81c784,
    #fff176,
    #ff8a65,
    #9575cd,
    #7986cb,
    #ef5350,
    #f06292
  );
  background-size: 1000% 1000%;
  animation: gradient 30s ease infinite;
  border: none;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>