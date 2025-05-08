<template>
  <div class="onboarding">
    <!-- 배경 컨테이너 -->
    <div class="background-container">
      <div class="overlay"></div>
      
      <!-- 비디오가 사용 가능한 경우 -->
      <template v-if="isVideoAvailable">
        <video 
          ref="backgroundVideo" 
          class="background-video" 
          autoplay 
          muted 
          loop 
          playsinline
          @loadeddata="handleVideoLoaded"
          @error="handleVideoError"
        >
          <!-- WebM 파일만 사용 -->
          <source :src="currentVideoSrc + '.webm'" type="video/webm">
          비디오를 재생할 수 없습니다.
        </video>
      </template>
      
      <!-- 비디오가 사용 불가능한 경우 정적 배경 이미지 표시 -->
      <template v-else>
        <div class="static-background animated-bg"></div>
      </template>
    </div>
    
    <!-- 상단 네비게이션 바 -->
    <nav class="navbar">
      <div class="navbar-container">
        <div class="nav-group">
          <a href="#" class="nav-item">LOOK AROUND</a>
          <a href="#" class="nav-item">SEARCH</a>
        </div>
        
        <div class="nav-center">
          <router-link to="/" class="logo-text">LOG:O</router-link>
        </div>
        
        <div class="nav-group">
          <router-link to="/llamasearch" class="nav-item">LOGIN</router-link>
          <a href="#" class="nav-item">SIGN UP</a>
        </div>
      </div>
    </nav>
    
    <!-- 메인 콘텐츠 -->
    <main class="onboarding-content">
      <div class="hero-section">
        <h1 class="main-title">
          <span class="travel-title">Log Your Travel</span>
        </h1>
        
        <p class="korean-subtitle">
          여행의 가장 아름다운 순간을 계획하고 기록합니다
        </p>
        
        <div class="cta-container">
          <router-link to="/llamasearch" class="cta-button">
            여행 검색 시작하기
          </router-link>
        </div>
      </div>
      
      <!-- 스크롤 인디케이터 -->
      <div class="scroll-indicator"></div>
      
      <!-- 위치 정보 -->
      <div class="location-info">
        <span class="location-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </span>
        <span class="location-text">{{ currentLocation }}</span>
      </div>
    </main>
    
    <!-- "어떻게 작동하나요" 섹션 - 배경 불투명도 개선 -->
    <section class="how-it-works" id="how-it-works">
      <div class="section-content">
        <h2 class="section-title">어떻게 작동하나요?</h2>
        <div class="steps-container">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="step-title">이미지 업로드</h3>
            <p class="step-description">당신이 원하는 여행 분위기의 사진을 업로드하세요. 자연, 도시, 해변 등 어떤 이미지든 가능합니다.</p>
          </div>
          
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 class="step-title">AI 분석</h3>
            <p class="step-description">우리의 AI가 이미지를 분석하여 풍경, 분위기, 활동성 등 10가지 차원으로 이미지의 특성을 파악합니다.</p>
          </div>
          
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 class="step-title">맞춤 여행지 추천</h3>
            <p class="step-description">분석 결과를 바탕으로 당신의 취향과 가장 유사한 여행지를 추천해드립니다. 새로운 여행을 발견하세요!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 인기 여행지 섹션 -->
    <section class="popular-destinations">
      <div class="section-content">
        <h2 class="section-title">인기 여행지</h2>
        <p class="section-description">당신의 다음 여정은 어디로 향할까요? 지금 인기 있는 여행지를 둘러보세요!</p>
        
        <div class="destinations-preview">
          <div class="destination-card">
            <div class="destination-image" :style="{ backgroundImage: `url(${destinationImages.jeju})` }"></div>
            <span class="destination-name">제주도</span>
            <div class="destination-overlay">
              <p class="destination-description">푸른 바다와 아름다운 자연이 어우러진 천혜의 섬</p>
              <a href="#" class="destination-link">더보기</a>
            </div>
            <!-- 위치 정보 추가 -->
            <div class="destination-location">
              <span class="location-icon-small">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <span>제주시, 제주도</span>
            </div>
          </div>
          
          <div class="destination-card">
            <div class="destination-image" :style="{ backgroundImage: `url(${destinationImages.busan})` }"></div>
            <span class="destination-name">부산</span>
            <div class="destination-overlay">
              <p class="destination-description">해변과 산이 어우러진 한국 제2의 도시</p>
              <a href="#" class="destination-link">더보기</a>
            </div>
            <!-- 위치 정보 추가 -->
            <div class="destination-location">
              <span class="location-icon-small">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <span>해운대구, 부산시</span>
            </div>
          </div>
          
          <div class="destination-card">
            <div class="destination-image" :style="{ backgroundImage: `url(${destinationImages.gyeongju})` }"></div>
            <span class="destination-name">경주</span>
            <div class="destination-overlay">
              <p class="destination-description">천년의 역사를 간직한 한국의 고대 수도</p>
              <a href="#" class="destination-link">더보기</a>
            </div>
            <!-- 위치 정보 추가 -->
            <div class="destination-location">
              <span class="location-icon-small">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <span>경주시, 경상북도</span>
            </div>
          </div>
          
          <div class="destination-card">
            <div class="destination-image" :style="{ backgroundImage: `url(${destinationImages.gangneung})` }"></div>
            <span class="destination-name">서울</span>
            <div class="destination-overlay">
              <p class="destination-description">전통과 현대가 공존하는 역동적인 도시</p>
              <a href="#" class="destination-link">더보기</a>
            </div>
            <!-- 위치 정보 추가 -->
            <div class="destination-location">
              <span class="location-icon-small">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <span>종로구, 서울시</span>
            </div>
          </div>
        </div>
        
        <div class="view-all-container">
          <router-link to="/llamasearch" class="view-all-button">
            모든 여행지 보기
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h13M12 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 푸터 -->
    <footer class="onboarding-footer">
      <div class="social-links">
        <a href="#" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
          </svg>
        </a>
        <a href="#" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
        <a href="#" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        </a>
      </div>
      <p class="copyright">© 2025 LOG:O - 당신의 여행을 기록하다</p>
    </footer>
  </div>
</template>

<script>
import '../styles/animations.css';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'OnboardingPage',
  
  setup() {
    // ---------- 동영상 파일 관련 ----------
    // 동영상 파일 이름 (확장자 제외)
    const videoNames = [
      'videos/train',
      'videos/river',
      'videos/europe',
      'videos/canyon',
      'videos/city'
    ];
    
    // 각 비디오 위치 정보 매핑
    const videoLocations = {
      'videos/train': 'Interlaken, Switzerland',
      'videos/river': 'Bahamas',
      'videos/europe': 'Arc de Triomphe, Paris, France',
      'videos/canyon': 'Sedona, Arizona',
      'videos/city': 'Seville Cathedral, Spain'
    };
    
    // 비디오 존재 여부 확인 변수
    const isVideoAvailable = ref(true);
    
    // 현재 재생 중인 비디오 인덱스
    const currentVideoIndex = ref(0);
    // 현재 재생 중인 비디오 및 위치 정보
    const currentVideoName = computed(() => videoNames[currentVideoIndex.value]);
    const currentVideoSrc = computed(() => videoNames[currentVideoIndex.value]);
    const currentLocation = computed(() => videoLocations[videoNames[currentVideoIndex.value]] || '위치 정보 없음');
    const backgroundVideo = ref(null);
    
    // 자동 전환 타이머
    let autoChangeTimer = null;
    
    // 임시 이미지 URL로 대체
    const destinationImages = {
      jeju: 'https://images.unsplash.com/photo-1592352922996-7d259a3b7be6?q=80&w=500',
      busan: 'https://images.unsplash.com/photo-1544466248-1309137d4860?q=80&w=500',
      gyeongju: 'https://images.unsplash.com/photo-1584632211968-74ddf41eb4b4?q=80&w=500', 
      gangneung: 'https://images.unsplash.com/photo-1574131898859-cf684a244065?q=80&w=500'
    };
    
    // 비디오 로드 실패 시 처리하는 함수
    const handleVideoLoadError = () => {
      isVideoAvailable.value = false;
      console.warn('비디오를 로드할 수 없어 정적 배경으로 전환합니다');
    };
    
    // 비디오 경로 검증 함수
    const checkVideoPaths = () => {
      // webm 형식의 첫 번째 비디오 파일 존재 확인
      fetch(videoNames[0] + '.webm')
        .then(response => {
          if (!response.ok) {
            throw new Error('비디오 파일을 찾을 수 없습니다');
          }
          isVideoAvailable.value = true;
        })
        .catch(error => {
          console.error('비디오 경로 검증 실패:', error);
          handleVideoLoadError();
        });
    };
    
    // 다음 비디오로 자동 이동하는 함수 (사용자 조작 없음)
    const moveToNextVideo = () => {
      // 다음 인덱스 계산 (원형 큐 방식)
      currentVideoIndex.value = (currentVideoIndex.value + 1) % videoNames.length;
      changeVideo();
    };
    
    // 비디오 재생 시도 함수
    const tryPlayVideo = () => {
      if (!backgroundVideo.value) {
        console.warn('비디오 요소가 아직 로드되지 않았습니다');
        return;
      }
      
      try {
        const playPromise = backgroundVideo.value.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('비디오 재생 오류:', error);
            
            // 자동 재생 정책 우회 - 사용자 인터랙션이 필요할 수 있음
            const videoElement = backgroundVideo.value; // 현재 참조를 로컬 변수에 저장
            
            document.addEventListener('click', () => {
              // 클릭 이벤트 발생 시 videoElement가 여전히 존재하는지 확인
              if (videoElement && typeof videoElement.play === 'function') {
                videoElement.play()
                  .catch(e => console.warn('사용자 클릭 후에도 비디오 재생 실패:', e));
              }
            }, { once: true });
          });
        }
      } catch (error) {
        console.error('비디오 재생 시도 중 예외 발생:', error);
      }
    };
    
    // 동영상 변경 함수 (인덱스 변경 없이 현재 인덱스의 비디오 로드)
    const changeVideo = () => {
      // 페이드 아웃 효과 적용
      if (backgroundVideo.value) {
        backgroundVideo.value.classList.add('fade-out');
      }
      
      // 짧은 지연 후 비디오 로드 및 재생 (페이드 아웃 효과 동안)
      setTimeout(() => {
        // 비디오 요소가 유효한지 확인 후 재설정 및 재생
        if (backgroundVideo.value) {
          try {
            // 현재 비디오 일시 정지
            backgroundVideo.value.pause();
            
            // 새 비디오 로드 후 재생
            backgroundVideo.value.load();
            tryPlayVideo();
            
            // 페이드 인 효과 적용
            setTimeout(() => {
              if (backgroundVideo.value) {
                backgroundVideo.value.classList.remove('fade-out');
              }
            }, 50);
          } catch (error) {
            console.error('비디오 변경 중 오류:', error);
          }
        } else {
          console.warn('비디오 요소가 없어 변경할 수 없습니다');
        }
      }, 300);
      
      // 자동 전환 타이머 재설정
      resetAutoChangeTimer();
    };
    
    // 자동 전환 타이머 설정 
    const setupAutoChangeTimer = () => {
      autoChangeTimer = setInterval(() => {
        moveToNextVideo();
      }, 8000); // 8초마다 자동 전환
    };
    
    // 자동 전환 타이머 재설정
    const resetAutoChangeTimer = () => {
      if (autoChangeTimer) {
        clearInterval(autoChangeTimer);
      }
      setupAutoChangeTimer();
    };
    
    // 비디오 로드 완료 이벤트 핸들러
    const handleVideoLoaded = () => {
      console.log('비디오 로드 완료:', currentVideoName.value);
    };
    
    // 비디오 로드 오류 이벤트 핸들러
    const handleVideoError = (error) => {
      console.error('비디오 로드 오류:', error);
      // 오류 발생 시 다음 비디오로 이동 (계속 재생 유지)
      moveToNextVideo();
    };
    
    // 스크롤 이벤트 상태 관리 변수
    let isInScrollTransition = false;
    let lastScrollTimestamp = 0;
    
    onMounted(() => {
      // 비디오 경로 검증
      checkVideoPaths();
      
      // 비디오 객체 설정 및 재생
      if (backgroundVideo.value) {
        // 비디오 이벤트 리스너 설정
        backgroundVideo.value.addEventListener('loadeddata', handleVideoLoaded);
        backgroundVideo.value.addEventListener('error', handleVideoError);
        
        // 비디오 실행 시도
        tryPlayVideo();
      }
      
      // 자동 전환 타이머 설정
      setupAutoChangeTimer();
      
      // 페이지 로드 시 애니메이션 효과
      document.querySelectorAll('.travel-title, .korean-subtitle, .cta-button, .destination-card').forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, 300 + (index * 200));
      });
      
      // 스크롤 시 네비게이션 바 스타일 변경
      const navbar = document.querySelector('.navbar');
      
      const handleScroll = () => {
        if (window.scrollY > 100) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      
      // 섹션 요소들 가져오기
      const sections = document.querySelectorAll('.onboarding-content, .how-it-works, .popular-destinations, .onboarding-footer');
      let currentSectionIndex = 0;
      
      // 개선된 스크롤 이벤트 핸들러 (1개 섹션씩만 이동)
      const wheelHandler = (e) => {
        e.preventDefault();
        
        // 현재 시간 확인
        const now = Date.now();
        
        // 스크롤 중이거나 마지막 스크롤로부터 500ms가 지나지 않았으면 무시
        if (isInScrollTransition || now - lastScrollTimestamp < 500) {
          return;
        }
        
        // 스크롤 방향 결정 (1: 아래로, -1: 위로)
        const direction = Math.sign(e.deltaY);
        
        // 새 섹션 인덱스 계산 (범위 제한)
        const newIndex = Math.max(0, Math.min(sections.length - 1, currentSectionIndex + direction));
        
        // 인덱스가 변경된 경우에만 스크롤
        if (newIndex !== currentSectionIndex) {
          isInScrollTransition = true;
          lastScrollTimestamp = now;
          currentSectionIndex = newIndex;
          
          // 해당 섹션으로 스크롤
          sections[currentSectionIndex].scrollIntoView({ behavior: 'smooth' });
          
          // 스크롤 애니메이션 완료 후 플래그 초기화 (1초 후)
          setTimeout(() => {
            isInScrollTransition = false;
          }, 1000);
        }
      };
      
      // 휠 이벤트 리스너 추가 - { passive: false }가 중요함!
      window.addEventListener('wheel', wheelHandler, { passive: false });
      
      // touchmove 이벤트도 추가하여 모바일 대응
      let touchStartY = 0;
      
      window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: false });
      
      window.addEventListener('touchmove', (e) => {
        if (isInScrollTransition) {
          e.preventDefault();
          return;
        }
        
        const touchY = e.touches[0].clientY;
        const diff = touchStartY - touchY;
        
        // 충분한 스와이프 거리가 있을 때만 처리
        if (Math.abs(diff) > 50) {
          const now = Date.now();
          
          if (now - lastScrollTimestamp > 500) {
            const direction = diff > 0 ? 1 : -1;
            const newIndex = Math.max(0, Math.min(sections.length - 1, currentSectionIndex + direction));
            
            if (newIndex !== currentSectionIndex) {
              isInScrollTransition = true;
              lastScrollTimestamp = now;
              currentSectionIndex = newIndex;
              
              sections[currentSectionIndex].scrollIntoView({ behavior: 'smooth' });
              
              setTimeout(() => {
                isInScrollTransition = false;
              }, 1000);
            }
          }
          
          e.preventDefault();
          touchStartY = touchY;
        }
      }, { passive: false });
      
      // 스크롤 애니메이션 처리
      const scrollFadeElements = document.querySelectorAll('.step-item, .section-title');
      scrollFadeElements.forEach(el => {
        el.classList.add('scroll-fade');
      });
      
      const checkScroll = () => {
        scrollFadeElements.forEach(el => {
          const elementTop = el.getBoundingClientRect().top;
          const elementVisible = 150;
          
          if (elementTop < window.innerHeight - elementVisible) {
            el.classList.add('visible');
          }
        });
      };
      
      // 초기 체크
      checkScroll();
      
      // 스크롤 시 체크
      window.addEventListener('scroll', checkScroll);
      
      // 컴포넌트 언마운트 시 이벤트 리스너와 타이머 제거
      onBeforeUnmount(() => {
        window.removeEventListener('scroll', checkScroll);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('wheel', wheelHandler, { passive: false });
        window.removeEventListener('touchstart', () => {}, { passive: false });
        window.removeEventListener('touchmove', () => {}, { passive: false });
        
        // 자동 전환 타이머 정리
        if (autoChangeTimer) {
          clearInterval(autoChangeTimer);
        }
        
        // 비디오 이벤트 리스너 제거
        if (backgroundVideo.value) {
          backgroundVideo.value.removeEventListener('loadeddata', handleVideoLoaded);
          backgroundVideo.value.removeEventListener('error', handleVideoError);
        }
      });
    });
    
    return {
      backgroundVideo,
      currentVideoSrc,
      currentVideoName,
      currentLocation,
      isVideoAvailable,
      videoNames,
      changeVideo,
      moveToNextVideo,
      handleVideoLoaded,
      handleVideoError,
      destinationImages
    };
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=Parisienne&family=Petit+Formal+Script&family=Playfair+Display:wght@400;500;600;700&family=Satisfy&display=swap');

.onboarding {
  min-height: 100vh;
  position: relative;
  font-family: 'Cormorant Garamond', serif;
  color: white;
  overflow-x: hidden;
  scroll-snap-type: y mandatory; /* 스크롤 스냅 추가 */
}

/* 비디오 배경 스타일 */
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

/* 비디오 페이드 효과 */
.background-video.fade-out {
  opacity: 0.2;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7));
  z-index: 1;
}

/* 정적 배경 스타일 */
.static-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1465310477141-6fb93167a273?q=80&w=1470');
  background-size: cover;
  background-position: center;
}

/* 추가 애니메이션 효과 */
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

/* 네비게이션 바 스타일 */
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

.nav-item.highlight {
  background-color: transparent;
  border: 1px solid white;
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
}

.nav-item.highlight:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 메인 콘텐츠 */
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
  scroll-snap-align: start; /* 스크롤 스냅 */
}

.hero-section {
  max-width: 800px;
  margin: 0 auto;
}

.travel-title {
  font-family: 'Dancing Script', cursive;
  font-size: 7rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  display: block;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out;
  color: white;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
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
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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

.cta-button {
  display: inline-block;
  background-color: transparent;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 0;
  font-weight: 500;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid white;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out 0.4s;
}

.cta-button.visible {
  opacity: 1;
  transform: translateY(0);
}

.cta-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

/* 위치 정보 스타일 */
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

/* 스크롤 인디케이터 애니메이션 */
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

/* "어떻게 작동하나요" 섹션 - 수정된 스타일 */
.how-it-works {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: start;
  position: relative;
  z-index: 10;
  padding: 2rem;
  color: #333;
  background-color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 50px 20px rgba(0, 0, 0, 0.1);
}

.section-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
  position: relative;
  font-weight: 700;
  font-family: 'Noto Sans KR', sans-serif;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: #48b0e4;
  border-radius: 2px;
}

.steps-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
}

.step-item {
  flex: 1;
  min-width: 250px;
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  background-color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.step-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.step-number {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #48b0e4;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 5px 15px rgba(72, 176, 228, 0.3);
}

.step-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  color: #48b0e4;
}

.step-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
}

.step-description {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
}

/* 인기 여행지 섹션 */
.popular-destinations {
  min-height: 100vh;
  position: relative;
  z-index: 10;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: rgba(245, 245, 245, 0.92);
}

.section-description {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 3rem;
  color: #666;
  font-size: 1.1rem;
  line-height: 1.8;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 300;
}

/* 데스티네이션 미리보기 */
.destinations-preview {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 2rem auto 3rem;
}

.destination-card {
  flex: 1;
  max-width: 280px;
  min-width: 250px;
  height: 350px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  cursor: pointer;
  transform: translateY(40px);
  opacity: 0;
  transition: all 0.6s ease;
}

.destination-card.visible {
  transform: translateY(0);
  opacity: 1;
}

.destination-card:hover {
  transform: translateY(-10px);
}

.destination-image {
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: all 0.5s ease;
}

.destination-card:hover .destination-image {
  transform: scale(1.1);
}

.destination-name {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.destination-overlay {
  position: absolute;
  bottom: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  color: white;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1rem;
  transition: all 0.4s ease;
  z-index: 1;
}

.destination-card:hover .destination-overlay {
  bottom: 0;
}

.destination-description {
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
}

.destination-link {
  color: #ffd166;
  text-decoration: none;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.destination-link:hover {
  color: white;
}

.view-all-container {
  text-align: center;
  margin-top: 3rem;
}

.view-all-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #48b0e4;
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  font-family: 'Noto Sans KR', sans-serif;
}

.view-all-button:hover {
  background-color: #3283ad;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(72, 176, 228, 0.3);
}

/* 카드 위치 정보 */
.destination-location {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.7rem;
  color: white;
  z-index: 3;
}

.location-icon-small {
  display: flex;
  align-items: center;
  color: #ffd166;
}

/* 푸터 */
.onboarding-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 5;
  scroll-snap-align: start;
  min-height: 50vh;
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

/* 애니메이션 클래스 */
.scroll-fade {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}

.scroll-fade.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 반응형 스타일 */
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
  
  .destinations-preview {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .destination-card {
    flex: 0 0 calc(50% - 1rem);
    max-width: none;
  }
  
  .steps-container {
    flex-direction: column;
    align-items: center;
    gap: 3rem;
  }
  
  .step-item {
    max-width: 100%;
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
  
  .destination-card {
    flex: 0 0 100%;
  }
  
  .step-item {
    max-width: 100%;
  }
}
</style>