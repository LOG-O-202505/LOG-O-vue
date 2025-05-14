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
          <router-link to="/lookAround" class="nav-item">HOT PLACE</router-link>
          <router-link to="/llamasearch" class="nav-item">SEARCH</router-link>
          <router-link to="/keyword" class="nav-item">KEYWORD</router-link>
        </div>
        
        <div class="nav-center">
          <router-link to="/" class="logo-text">LOG:O</router-link>
        </div>
        
        <div class="nav-group">
          <router-link to="/imgsearch" class="nav-item">IMG SEARCH</router-link>
          <router-link to="/plan" class="nav-item">PLANNER</router-link>
          <router-link to="/mytravel" class="nav-item">MY JOURNEY</router-link>
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
    
    <!-- 서비스 기능 소개 섹션 -->
    <section class="features-section" id="features">
      <div class="section-content">
        <h2 class="section-title">LOG:O와 함께하는 여행 경험</h2>
        <p class="section-description">여행의 모든 단계를 더 스마트하고 즐겁게 만들어드립니다</p>
        
        <!-- 기능 1: 핫플레이스 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">한눈에 핫플레이스 조회</h3>
            <p class="feature-description">
              전국 각지의 인기 여행지를 한눈에 살펴보세요. 다양한 카테고리와 지역별 필터링으로 원하는 핫플레이스를 쉽고 빠르게 찾아볼 수 있습니다.
            </p>
            <router-link to="/lookAround" class="feature-link">
              핫플레이스 살펴보기
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
        </div>
        
        <!-- 기능 2: AI 이미지 기반 여행지 추천 -->
        <div class="feature-card reverse">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">AI 이미지 기반 여행지 추천</h3>
            <p class="feature-description">
              원하는 분위기의 이미지를 업로드하면 Llama와 Llava AI가 이미지를 분석하여 유사한 분위기의 여행지를 추천해드립니다. 당신의 취향에 딱 맞는 새로운 여행지를 발견하세요.
            </p>
            <router-link to="/LogoSearch" class="feature-link">
              이미지로 여행지 찾기
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
        </div>
        
        <!-- 기능 3: ElasticSearch 기반 검색 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">스마트한 여행지 검색</h3>
            <p class="feature-description">
              딱딱한 검색은 이제 그만! ElasticSearch를 활용한 직관적이고 자연스러운 검색으로 원하는 여행지를 쉽게 찾아보세요. 키워드와 태그를 기반으로 쉽고 빠르게 검색합니다.
            </p>
            <router-link to="/keyword" class="feature-link">
              키워드로 검색하기
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
        </div>
        
        <!-- 기능 4: 일정 및 소비 관리 -->
        <div class="feature-card reverse">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">스마트한 일정 및 소비 관리</h3>
            <p class="feature-description">
              일정관리를 한눈에! 소비 관리도 AI를 이용해서 결제 내역이나 영수증을 업로드하면 자동으로 지출 내역이 관리됩니다. 여행 계획부터 예산 관리까지 모두 한곳에서 해결하세요.
            </p>
            <router-link to="/plan" class="feature-link">
              여행 계획 세우기
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
        </div>
        
        <!-- 기능 5: 나만의 여행 기록 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">당신의 여행을 한눈에</h3>
            <p class="feature-description">
              나만의 여행 취향 분석과 실제 사진 기반 여행 인증을 통해 수집 욕구를 불러일으키는 전국 각지의 지도 모형 채우기! 당신의 여행 기록을 시각적으로 확인하고 공유하세요.
            </p>
            <router-link to="/mytravel" class="feature-link">
              나의 여행 기록 보기
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
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
      }, 6000); // 6초마다 자동 전환
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
      const sections = document.querySelectorAll('.onboarding-content, .features-section, .onboarding-footer');
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
      handleVideoError
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
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8));
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
  background: none !important;
  background-image: none !important;
}

.main-title {
  background: none !important;
  background-image: none !important;
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
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6);
  background: none !important;
  background-image: none !important;
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
  background: none !important;
  background-image: none !important;
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
  
  .step-item {
    max-width: 100%;
  }
}

/* 서비스 기능 소개 섹션 스타일 */
.features-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: start;
  position: relative;
  z-index: 10;
  padding: 4rem 2rem;
  color: #333;
  background-color: rgba(250, 250, 250, 0.95);
  box-shadow: 0 0 50px 20px rgba(0, 0, 0, 0.1);
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 4rem;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.feature-card.reverse {
  flex-direction: row-reverse;
  background-color: rgba(240, 247, 255, 0.7);
}

.feature-icon {
  width: 80px;
  height: 80px;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(72, 176, 228, 0.1);
  border-radius: 50%;
  color: #48b0e4;
  margin-top: 0.5rem;
}

.feature-content {
  flex: 1;
}

.feature-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #2d3748;
  font-weight: 700;
  font-family: 'Noto Sans KR', sans-serif;
}

.feature-description {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #4a5568;
  font-family: 'Noto Sans KR', sans-serif;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #48b0e4;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: 'Noto Sans KR', sans-serif;
}

.feature-link:hover {
  color: #3283ad;
  gap: 0.8rem;
}

@media (max-width: 768px) {
  .feature-card, .feature-card.reverse {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }
  
  .feature-icon {
    margin-bottom: 1rem;
  }
  
  .feature-title {
    font-size: 1.3rem;
  }
}
</style>