<template>
  <div class="onboarding">
    <!-- Background container -->
    <div class="background-container">
      <div class="overlay"></div>

      <video v-if="isVideoAvailable" ref="backgroundVideoRef" class="background-video" autoplay muted loop playsinline
        @error="handleVideoError">
        <source :src="currentVideoSrc" type="video/webm" />
        비디오를 재생할 수 없습니다.
      </video>
      <div v-else class="static-background animated-bg"></div>
    </div>

    <!-- Navigation bar -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="navbar-container">
        <div class="nav-group">
          <a href="/lookAround" class="nav-item">HOT PLACE</a>
          <a href="/llamasearch" class="nav-item">SEARCH</a>
          <a href="/keyword" class="nav-item">KEYWORD</a>
        </div>

        <div class="nav-center">
          <a href="/" class="logo-text">LOG:O</a>
        </div>

        <div class="nav-group">
          <LoginModal />
          <a href="/plan" class="nav-item">PLANNER</a>
          <a href="/mytravel" class="nav-item">MY JOURNEY</a>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="onboarding-content">
      <div class="hero-section">
        <h1 class="main-title">
          <span class="travel-title" :class="{ visible: isLoaded }">Log Your Travel</span>
        </h1>

        <p class="korean-subtitle" :class="{ visible: isLoaded }">여행의 가장 아름다운 순간을 계획하고 기록합니다</p>

      </div>

      <!-- Scroll indicator -->
      <div class="scroll-indicator"></div>

      <!-- Location info -->
      <div class="location-info">
        <span class="location-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-map-pin">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <span class="location-text">{{ currentLocation }}</span>
      </div>
    </main>

    <!-- Features section - New Design -->
    <section class="features-container">
      <div class="features-intro">
        <h2 class="features-title">LOG:O와 함께하는 여행 경험</h2>
        <p class="features-subtitle">여행의 모든 단계를 더 스마트하고 즐겁게 만들어드립니다</p>
      </div>

      <!-- Feature 1: Hot Places - Text Left, Image Right -->
      <div class="feature-section" ref="featureSection1Ref" :class="{ visible: visibleSections.section1 }">
        <div class="feature-content">
          <div class="feature-tag">핫플레이스 서비스</div>
          <h3 class="feature-heading">
            한눈에 핫플레이스
            <br />
            조회로 여행 계획
          </h3>
          <p class="feature-description">
            사용자가 실제 방문한 후 인증을 거친 별점과 인증 횟수를 기반으로 D3.js를 활용한 인터랙티브 지도를 통해
            한눈에 가장 핫한 여행지를 조회할 수 있습니다. 실시간으로 업데이트되는 인기 여행지 정보로 최신 트렌드를
            놓치지 마세요.
          </p>
          <div class="tech-tags">
            <span class="tech-tag">D3.js</span>
            <span class="tech-tag">실시간 데이터</span>
            <span class="tech-tag">위치 기반</span>
          </div>
          <a href="/lookAround" class="feature-link">
            핫플레이스 살펴보기
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feature-arrow">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
        <div class="feature-device laptop-mockup">
          <div class="device-frame">
            <div class="mockup-content hotplace-mockup">
              <div class="mockup-map">
                <img src="@/assets/img/seoul_hotplace.png" alt="대한민국 핫플레이스 지도" width="450" height="300" class="korea-map" />
              </div>
              <div class="mockup-caption">대한민국 시도별 핫플레이스 한눈에 보기</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 2: AI Image Search - Image Left, Text Right -->
      <div class="feature-section" ref="featureSection2Ref" :class="{ visible: visibleSections.section2 }">
        <div class="feature-device tablet-mockup">
          <div class="device-frame">
            <div class="mockup-content ai-mockup">
              <div class="mockup-title">이미지 기반 AI 여행지 추천</div>
              <div class="mockup-ai-logos">
                <div class="ai-logo-container">
                  <img src="@/assets/img/llava-color.png" alt="Llava 마스코트" width="100" height="100"
                    style="background-color: white;" class="ai-logo" />
                  <div class="ai-name">Llava</div>
                </div>
                <div class="plus-container">
                  <div class="plus-circle">+</div>
                </div>
                <div class="ai-logo-container">
                  <img src="@/assets/img/meta.png" alt="Llama 마스코트" width="120" height="100"
                    style="background-color: white; object-fit: contain;" class="ai-logo" />
                  <div class="ai-name">Llama</div>
                </div>
              </div>
              <div class="mockup-caption">두 AI의 결합으로 정확한 이미지 분석과 여행지 추천</div>
            </div>
          </div>
        </div>
        <div class="feature-content">
          <div class="feature-tag">AI 검색 서비스</div>
          <h3 class="feature-heading">
            이미지 기반 AI
            <br />
            여행지 추천
          </h3>
          <p class="feature-description">
            원하는 분위기의 이미지를 업로드하면 Llava와 Llama AI가 이미지를 분석하여 ElasticSearch를 통해 유사한
            분위기의 여행지를 추천해드립니다. 텍스트로 설명하기 어려운 여행지의 분위기도 이미지 한 장으로 찾을 수 있는
            혁신적인 서비스입니다.
          </p>
          <div class="tech-tags">
            <span class="tech-tag">Llava</span>
            <span class="tech-tag">Llama</span>
            <span class="tech-tag">ElasticSearch</span>
          </div>
          <a href="/LogoSearch" class="feature-link">
            이미지로 여행지 찾기
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feature-arrow">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Feature 3: ElasticSearch - Text Left, Image Right -->
      <div class="feature-section" ref="featureSection3Ref" :class="{ visible: visibleSections.section3 }">
        <div class="feature-content">
          <div class="feature-tag">키워드 검색</div>
          <h3 class="feature-heading">
            스마트한 여행지
            <br />
            검색 기능
          </h3>
          <p class="feature-description">
            Llava를 이용한 영문 설명 및 영문 검색 지원, <br /> 
            Llama를 이용한 한국어 설명 및 키워드 검색 지원, <br />
            ElasticSearch를 이용한 확장된 검색 경험을 제공합니다. <br />
            AI가 생성한 정확한 키워드와 설명을 통해 <br />
            기존의 단순한 텍스트 검색을 넘어선 스마트하고 직관적인 여행지 검색을 경험하세요.
          </p>
          <div class="tech-tags">
            <span class="tech-tag">Llava 영문 분석</span>
            <span class="tech-tag">Llama 한국어 처리</span>
            <span class="tech-tag">ElasticSearch 확장 검색</span>
          </div>
          <a href="/keyword" class="feature-link">
            키워드로 검색하기
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feature-arrow">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
        <div class="feature-device laptop-mockup">
          <div class="device-frame">
            <div class="mockup-content search-mockup">
              <div class="mockup-logos">
                <img src="@/assets/img/elasticsearch.png" alt="ElasticSearch 로고" width="70" height="70"
                  style="background-color: white; object-fit: contain;" class="tech-logo" />
                <span class="plus-icon">+</span>
                <img src="@/assets/img/meta.png" alt="Llama 로고" width="80" height="80" style="background-color: white;"
                  class="tech-logo" />
              </div>
              <div class="mockup-search-flow">
                <div class="flow-item">
                  <div class="flow-title">키워드 추출</div>
                  <div class="flow-arrow">↓</div>
                </div>
                <div class="flow-item">
                  <div class="flow-title">장소 설명 분석</div>
                  <div class="flow-arrow">↓</div>
                </div>
                <div class="flow-item">
                  <div class="flow-title">통합 검색 결과</div>
                </div>
              </div>
              <div class="mockup-caption">Llama로 추출한 키워드와 장소 설명 기반 ElasticSearch 검색</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 4: Schedule and Budget - Image Left, Text Right -->
      <div class="feature-section" ref="featureSection4Ref" :class="{ visible: visibleSections.section4 }">
        <div class="feature-device tablet-mockup">
          <div class="device-frame">
            <div class="mockup-content budget-mockup">
              <div class="mockup-title">영수증 자동 분석</div>
              <div class="mockup-process">
                <div class="process-item">
                  <img src="@/assets/img/ocr.png" alt="OCR 아이콘" width="100" height="80" style="background-color: white;"
                    class="process-icon" />
                  <div class="process-name">OCR 텍스트 추출</div>
                </div>
                <div class="process-arrow">→</div>
                <div class="process-item">
                  <img src="@/assets/img/meta.png" alt="Llama 아이콘" width="80" height="80" style="background-color: white;"
                    class="process-icon" />
                  <div class="process-name">Llama 분석</div>
                </div>
              </div>
              <div class="mockup-result">
                <div class="result-title">자동 분류된 지출 내역</div>
                <div class="result-items">
                  <div class="result-item">
                    <span class="item-category">식비</span>
                    <span class="item-amount">₩25,000</span>
                  </div>
                  <div class="result-item">
                    <span class="item-category">교통비</span>
                    <span class="item-amount">₩12,500</span>
                  </div>
                  <div class="result-item">
                    <span class="item-category">관광</span>
                    <span class="item-amount">₩30,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="feature-content">
          <div class="feature-tag">일정 및 예산 관리</div>
          <h3 class="feature-heading">
            스마트한 일정 및<br />
            소비 관리
          </h3>
          <p class="feature-description">
            결제 내역과 영수증 사진을 찍으면 OCR과 Llama를 이용해서 소비 내역을 자동으로 관리할 수 있습니다. 또한 여행
            일정을 실시간으로 거리 기반으로 인증하고 방문 후기를 남길 수 있습니다. 여행 계획부터 예산 관리까지 모두
            한곳에서 해결하세요.
          </p>
          <div class="tech-tags">
            <span class="tech-tag">OCR</span>
            <span class="tech-tag">Llama</span>
            <span class="tech-tag">위치 기반 인증</span>
          </div>
          <a href="/plan" class="feature-link">
            여행 계획 세우기
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feature-arrow">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Feature 5: Travel Records - Text Left, Image Right -->
      <div class="feature-section" ref="featureSection5Ref" :class="{ visible: visibleSections.section5 }">
        <div class="feature-content">
          <div class="feature-tag">여행 기록 관리</div>
          <h3 class="feature-heading">
            당신의 여행을
            <br />
            한눈에
          </h3>
          <p class="feature-description">
            앞서 인증한 일정을 기반으로 한눈에 내가 어떤 여행지를 좋아하는지, 대한민국에서 어떤 여행지를 몇%
            방문했는지 볼 수 있습니다. 나만의 여행 취향 분석과 실제 사진 기반 여행 인증을 통해 수집 욕구를
            불러일으키는 전국 각지의 지도 모형 채우기! 당신의 여행 기록을 시각적으로 확인하고 공유하세요.
          </p>
          <div class="tech-tags">
            <span class="tech-tag">데이터 시각화</span>
            <span class="tech-tag">인터랙티브 지도</span>
            <span class="tech-tag">여행 통계</span>
          </div>
          <a href="/mytravel" class="feature-link">
            나의 여행 기록 보기
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feature-arrow">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
        <div class="feature-device laptop-mockup">
          <div class="device-frame">
            <div class="mockup-content travel-record-mockup">
              <div class="mockup-header">
                <div class="mockup-title">나의 여행 히스토리</div>
                <div class="mockup-subtitle">대한민국 방문 지역: 39%</div>
              </div>
              <div class="mockup-images-container">
                <div class="mockup-image">
                  <img src="@/assets/img/mypage_map.png" alt="대한민국 방문 지도" width="450" height="200" class="korea-visited-map" />
                </div>
              </div>
              <div class="mockup-stats">
                <div class="stat-item">
                  <div class="stat-label">방문 지역</div>
                  <div class="stat-value">38곳</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">여행 일수</div>
                  <div class="stat-value">143일</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">인증 횟수</div>
                  <div class="stat-value">217회</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="onboarding-footer">
      <div class="social-links">
        <a href="#" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-twitter">
            <path
              d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        </a>
        <a href="#" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-instagram">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>
        <a href="#" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-facebook">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>
      </div>
      <p class="copyright">© 2025 LOG:O - 당신의 여행을 기록하다</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed, watch, nextTick } from 'vue'
// LoginModal 컴포넌트 임포트
import LoginModal from '../components/LoginModal.vue';

// Video related state and refs
const isVideoAvailable = ref(true)
const currentVideoIndex = ref(0)
const backgroundVideoRef = ref(null)
const autoChangeTimerRef = ref(null)
const isLoaded = ref(false)
const isScrolled = ref(false)

// Feature section refs for animation
const featureSection1Ref = ref(null)
const featureSection2Ref = ref(null)
const featureSection3Ref = ref(null)
const featureSection4Ref = ref(null)
const featureSection5Ref = ref(null)

// Track visible sections
const visibleSections = reactive({
  section1: false,
  section2: false,
  section3: false,
  section4: false,
  section5: false
})

// Video data
const videoNames = [
  require('@/assets/videos/train.webm'),
  require('@/assets/videos/river.webm'),
  require('@/assets/videos/europe.webm'),
  require('@/assets/videos/canyon.webm'),
  require('@/assets/videos/city.webm')
]

const videoLocations = {
  [require('@/assets/videos/train.webm')]: "Interlaken, Switzerland",
  [require('@/assets/videos/river.webm')]: "Bahamas",
  [require('@/assets/videos/europe.webm')]: "Arc de Triomphe, Paris, France",
  [require('@/assets/videos/canyon.webm')]: "Sedona, Arizona",
  [require('@/assets/videos/city.webm')]: "Seville Cathedral, Spain",
}

const currentVideoSrc = computed(() => videoNames[currentVideoIndex.value])
const currentLocation = computed(() => videoLocations[videoNames[currentVideoIndex.value]] || "위치 정보 없음")

// Video handling functions
const handleVideoLoadError = () => {
  isVideoAvailable.value = false
  console.warn("비디오를 로드할 수 없어 정적 배경으로 전환합니다")
}

const checkVideoPaths = () => {
  try {
    if (videoNames.length > 0 && videoNames[0]) {
      isVideoAvailable.value = true
    } else {
      throw new Error("비디오 파일을 찾을 수 없습니다")
    }
  } catch (error) {
    console.error("비디오 경로 검증 실패:", error)
    handleVideoLoadError()
  }
}

const tryPlayVideo = () => {
  if (!backgroundVideoRef.value) {
    console.warn("비디오 요소가 아직 로드되지 않았습니다")
    return
  }

  try {
    const playPromise = backgroundVideoRef.value.play()

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("비디오 재생 오류:", error)

        // 자동 재생 정책 우회 - 사용자 인터랙션이 필요할 수 있음
        const videoElement = backgroundVideoRef.value

        document.addEventListener(
          "click",
          () => {
            if (videoElement && typeof videoElement.play === "function") {
              videoElement.play().catch((e) => console.warn("사용자 클릭 후에도 비디오 재생 실패:", e))
            }
          },
          { once: true },
        )
      })
    }
  } catch (error) {
    console.error("비디오 재생 시도 중 예외 발생:", error)
  }
}

const moveToNextVideo = () => {
  currentVideoIndex.value = (currentVideoIndex.value + 1) % videoNames.length
}

const changeVideo = () => {
  if (backgroundVideoRef.value) {
    backgroundVideoRef.value.classList.add("fade-out")
  }

  setTimeout(() => {
    if (backgroundVideoRef.value) {
      try {
        backgroundVideoRef.value.pause()
        backgroundVideoRef.value.load()
        tryPlayVideo()

        setTimeout(() => {
          if (backgroundVideoRef.value) {
            backgroundVideoRef.value.classList.remove("fade-out")
          }
        }, 50)
      } catch (error) {
        console.error("비디오 변경 중 오류:", error)
      }
    } else {
      console.warn("비디오 요소가 없어 변경할 수 없습니다")
    }
  }, 300)

  resetAutoChangeTimer()
}

const setupAutoChangeTimer = () => {
  autoChangeTimerRef.value = setInterval(() => {
    moveToNextVideo()
  }, 6000) // 6초마다 자동 전환
}

const resetAutoChangeTimer = () => {
  if (autoChangeTimerRef.value) {
    clearInterval(autoChangeTimerRef.value)
  }
  setupAutoChangeTimer()
}

const handleVideoLoaded = () => {
  console.log("비디오 로드 완료:", currentVideoSrc.value)
}

const handleVideoError = (error) => {
  console.error("비디오 로드 오류:", error)
  moveToNextVideo()
}

// Setup intersection observer for animations
const setupIntersectionObserver = () => {
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target === featureSection1Ref.value) visibleSections.section1 = true
        if (entry.target === featureSection2Ref.value) visibleSections.section2 = true
        if (entry.target === featureSection3Ref.value) visibleSections.section3 = true
        if (entry.target === featureSection4Ref.value) visibleSections.section4 = true
        if (entry.target === featureSection5Ref.value) visibleSections.section5 = true
        observer.unobserve(entry.target)
      }
    })
  }, options)

  const featureSections = [
    featureSection1Ref.value,
    featureSection2Ref.value,
    featureSection3Ref.value,
    featureSection4Ref.value,
    featureSection5Ref.value,
  ]

  featureSections.forEach((section) => {
    if (section) {
      observer.observe(section)
    }
  })
}

// Handle scroll events
const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

// Watch for video changes
watch(currentVideoIndex, () => {
  changeVideo()
})

// Lifecycle hooks
onMounted(() => {
  checkVideoPaths()

  if (backgroundVideoRef.value) {
    backgroundVideoRef.value.addEventListener("loadeddata", handleVideoLoaded)
    backgroundVideoRef.value.addEventListener("error", handleVideoError)
    tryPlayVideo()
  }

  setupAutoChangeTimer()

  // Page load animations
  setTimeout(() => {
    isLoaded.value = true
  }, 300)

  // Scroll event for navbar
  window.addEventListener("scroll", handleScroll)

  // Setup intersection observer after DOM is ready
  nextTick(() => {
    setupIntersectionObserver()
  })
})

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll)

  if (autoChangeTimerRef.value) {
    clearInterval(autoChangeTimerRef.value)
  }

  if (backgroundVideoRef.value) {
    backgroundVideoRef.value.removeEventListener("loadeddata", handleVideoLoaded)
    backgroundVideoRef.value.removeEventListener("error", handleVideoError)
  }
})
</script>

<style>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Italianno&display=swap');

/* Add custom font */
@font-face {
    font-family: 'LeferiPoint-SpecialItalicA';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/LeferiPoint-SpecialItalicA.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Cormorant Garamond', serif;
  color: white;
  overflow-x: hidden;
}

/* Onboarding styles */
.onboarding {
  min-height: 100vh;
  position: relative;
  font-family: 'Cormorant Garamond', serif;
  color: white;
  overflow-x: hidden;
}

/* Video background styles */
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.8s ease-in-out;
}

/* Video fade effect */
.background-video.fade-out {
  opacity: 0.2;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8));
  z-index: 1;
}

/* Static background styles */
.static-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("https://images.unsplash.com/photo-1465310477141-6fb93167a273?q=80&w=1470");
  background-size: cover;
  background-position: center;
}

/* Additional animation effects */
.animated-bg {
  animation: kenburns 30s infinite alternate ease-in-out;
}

@keyframes kenburns {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.1);
  }
}

/* Navigation bar styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 3.5rem 0;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
  transition: background 0.3s ease;
}

.navbar.scrolled {
  background: rgba(0, 0, 0, 0.8);
  padding: 3.5rem 0;
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
  gap: 2.5rem;
  align-items: center;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.logo-text {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0.9;
  font-family: 'Playfair Display', serif;
}

.nav-item:hover {
  opacity: 1;
}

.nav-item::after {
  content: "";
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

.nav-item.highlight {
  background-color: transparent;
  border: 1px solid white;
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
}

.nav-item.highlight:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Main content */
.onboarding-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  height: 100vh;
  text-align: center;
  position: relative;
  z-index: 5;
}

.hero-section {
  max-width: 800px;
  margin: 0 auto;
}

.travel-title {
  font-family: 'Italianno', cursive;
  font-size: 10rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  line-height: 1.2;
  display: block;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out;
  color: white;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6);
}

.travel-title.visible {
  opacity: 1;
  transform: translateY(0);
}

.korean-subtitle {
  font-family: 'Petit Formal Script', cursive;
  font-size: 1.8rem;
  margin-bottom: 3rem;
  font-weight: 400;
  line-height: 1.8;
  max-width: 700px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out 0.2s;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7), 0 4px 10px rgba(0, 0, 0, 0.5);
}

.korean-subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

.cta-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out 0.4s;
}

.cta-container.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Location info styles */
.location-info {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 5;
}

.location-info:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: translateY(-3px);
}

.location-icon {
  display: flex;
  align-items: center;
  color: white;
  animation: pulseLocation 1.5s infinite alternate ease-in-out;
}

@keyframes pulseLocation {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.2);
  }
}

.location-text {
  font-size: 1rem;
  color: white;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Scroll indicator animation */
.scroll-indicator {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 50px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

.scroll-indicator::before {
  content: "";
  width: 6px;
  height: 10px;
  border-radius: 3px;
  background: white;
  animation: scrollDown 2s infinite;
}

@keyframes scrollDown {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  70% {
    opacity: 0;
  }

  100% {
    transform: translateY(15px);
    opacity: 0;
  }
}

/* NEW FEATURES SECTION STYLES */
.features-container {
  background-color: #fff;
  color: #333;
  padding: 0;
  position: relative;
  z-index: 10;
}

.features-intro {
  padding: 8rem 2rem 4rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

.features-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
  font-family: 'Noto Sans KR', sans-serif;
}

.features-subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  font-family: 'Noto Sans KR', sans-serif;
}

/* Feature section styles */
.feature-section {
  display: flex;
  align-items: center;
  padding: 8rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  gap: 8rem;
  /* Increased spacing between content and device */
  position: relative;
}

.feature-section:nth-child(odd) {
  flex-direction: row;
}

.feature-section:nth-child(even) {
  flex-direction: row-reverse;
}

.feature-section::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 1px;
  background-color: #eee;
}

.feature-section:last-of-type::after {
  display: none;
}

.feature-content {
  flex: 1.2;
  /* Increased text area */
  padding: 2rem 0;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}

.feature-section.visible .feature-content {
  opacity: 1;
  transform: translateY(0);
}

.feature-device {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out 0.2s;
  max-width: 500px;
  /* Limit the size of device mockups */
}

.feature-section.visible .feature-device {
  opacity: 1;
  transform: translateY(0);
}

.feature-tag {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4285f4;
  margin-bottom: 1rem;
  font-family: 'Noto Sans KR', sans-serif;
  position: relative;
  padding-left: 1rem;
}

.feature-tag::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #4285f4;
}

@keyframes waveAnimation {
  0% {
    background-position: -100% 50%;
  }

  100% {
    background-position: 100% 50%;
  }
}

.feature-heading {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  font-family: 'Noto Sans KR', sans-serif;
  /* 파도 그라데이션 패턴 - 왼쪽에서 오른쪽으로 진행되도록 설정 */
  background: linear-gradient(270deg,
      #A0BBE8 0%,
      #4A90E2 15%,
      #3D7DD8 25%,
      #A0BBE8 35%,
      #A0BBE8 65%,
      #4A90E2 75%,
      #3D7DD8 85%,
      #A0BBE8 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  /* 확실히 왼쪽에서 오른쪽으로 이동하는 애니메이션 */
  animation: waveAnimation 6s linear infinite;
}

.feature-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #666;
  margin-bottom: 1.5rem;
  max-width: 90%;
  font-family: 'Noto Sans KR', sans-serif;
}

/* Tech tags */
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tech-tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: rgba(66, 133, 244, 0.1);
  color: #4285f4;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #4285f4;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  font-family: 'Noto Sans KR', sans-serif;
}

.feature-link:hover {
  gap: 0.8rem;
}

.feature-arrow {
  transition: transform 0.3s ease;
}

.feature-link:hover .feature-arrow {
  transform: translateX(3px);
}

/* Device mockups */
.device-frame {
  position: relative;
  border-radius: 12px;
  background-color: #f5f5f5;
  padding: 20px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  max-width: 450px;
  /* Smaller device mockups */
}

/* Remove hover effect on device frames */
.feature-device .device-frame {
  transform: none;
}

.laptop-mockup .device-frame {
  border-radius: 12px 12px 0 0;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  padding: 20px 20px 0;
}

.laptop-mockup .device-frame::after {
  content: "";
  position: absolute;
  bottom: -20px;
  left: -10%;
  width: 120%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 0 0 8px 8px;
}

.tablet-mockup .device-frame {
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 380px;
  /* Smaller tablet mockups */
}

.device-screen {
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
  height: auto;
}

/* Mockup content styles */
.mockup-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #333;
  font-family: 'Noto Sans KR', sans-serif;
}

/* Hot Place Mockup */
.hotplace-mockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.mockup-map {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.korea-map {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.mockup-caption {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

/* AI Mockup */
.ai-mockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.mockup-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.mockup-ai-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.ai-logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.ai-logo {
  border-radius: 50%;
  background-color: #f0f0f0;
}

.ai-name {
  font-size: 14px;
  font-weight: 500;
}

.plus-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4285f4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

/* Search Mockup */
.search-mockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.mockup-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.mockup-search-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.flow-item {
  width: 100%;
  text-align: center;
}

.flow-title {
  background-color: #f0f0f0;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
}

.flow-arrow {
  font-size: 20px;
  color: #4285f4;
  margin: 5px 0;
}

/* Budget Mockup */
.budget-mockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.mockup-process {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.process-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.process-icon {
  border-radius: 8px;
  background-color: #f0f0f0;
}

.process-name {
  font-size: 12px;
  font-weight: 500;
}

.process-arrow {
  color: #4285f4;
  font-size: 20px;
  margin: 0 5px;
}

.mockup-result {
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.result-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.item-category {
  font-weight: 500;
}

.item-amount {
  color: #4285f4;
  font-weight: 600;
}

/* Travel Record Mockup */
.travel-record-mockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.mockup-header {
  text-align: center;
  margin-bottom: 10px;
}

.mockup-subtitle {
  font-size: 14px;
  color: #4285f4;
  font-weight: 500;
}

/* New vertical layout for travel record images */
.mockup-images-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.mockup-image {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.korea-visited-map,
.character-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.mockup-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #4285f4;
}

/* Footer */
.onboarding-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 4rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 5;
  min-height: 30vh;
  justify-content: center;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-link {
  color: white;
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: translateY(-3px);
  color: #48b0e4;
}

.copyright {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .feature-section {
    gap: 4rem;
    padding: 6rem 2rem;
  }
}

@media (max-width: 1024px) {

  .feature-section,
  .feature-section:nth-child(odd),
  .feature-section:nth-child(even) {
    flex-direction: column;
    gap: 3rem;
    padding: 5rem 2rem;
  }

  .feature-content {
    text-align: center;
  }

  .feature-description {
    max-width: 100%;
  }

  .tech-tags {
    justify-content: center;
  }

  .feature-heading {
    font-size: 2rem;
  }

  .device-frame {
    max-width: 100%;
  }
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

  .travel-title {
    font-size: 4.5rem;
  }

  .korean-subtitle {
    font-size: 1.3rem;
  }
}

@media (max-width: 600px) {
  .cta-container {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 2rem auto 0;
  }

  .travel-title {
    font-size: 2.5rem;
  }

  .feature-heading {
    font-size: 1.8rem;
  }

  .mockup-process {
    flex-direction: column;
    gap: 15px;
  }

  .process-arrow {
    transform: rotate(90deg);
  }
}
</style>