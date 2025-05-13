<template>
    <div class="img-search-page">
      <!-- 헤더 -->
      <Header 
        :showHero="true"
        heroImageSrc="https://images.unsplash.com/photo-1516466723877-e6ec3a1d060f?q=80&w=1470"
        heroTitle="이미지 분석 시스템"
        heroSubtitle="API 기반 이미지 분석 방식 성능 비교"
        heroHeight="320px"
      />

      <!-- 컨텐츠 영역 -->
      <div class="content-wrapper">
        <div class="vertical-layout">
          <!-- 1. 이미지 입력 섹션 -->
          <div class="analysis-block image-input-block">
            <!-- 이미지 업로드 섹션 -->
            <div class="upload-section">
              <h2>1. 이미지 업로드</h2>
              <div 
                class="upload-area" 
                @click="triggerFileInput"
                :class="{ 'has-image': imagePreview }"
              >
                <div v-if="!imagePreview" class="upload-placeholder">
                  <div class="icon">📷</div>
                  <p>여기를 클릭하여 이미지를 업로드하세요</p>
                </div>
                <img v-else :src="imagePreview" alt="Preview" class="preview-image" />
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                style="display: none;" 
                @change="handleFileChange"
              />
            </div>
            
            <!-- 이미지 압축 정보 섹션 -->
            <div v-if="compressionInfo" class="compression-section">
              <h3>이미지 압축 정보</h3>
              <div class="compression-grid">
                <div class="info-item">
                  <div class="info-label">원본 크기</div>
                  <div class="info-value">{{ compressionInfo.originalSize }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">압축 후 크기</div>
                  <div class="info-value">{{ compressionInfo.compressedSize }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">원본 해상도</div>
                  <div class="info-value">{{ compressionInfo.dimensionsFrom }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">압축 후 해상도</div>
                  <div class="info-value">{{ compressionInfo.dimensionsTo }}</div>
                </div>
                <div class="info-item highlight">
                  <div class="info-label">압축률</div>
                  <div class="info-value">{{ compressionInfo.compressionRatio }}</div>
                </div>
              </div>
            </div>
            
            <!-- 분석 실행 버튼 -->
            <button 
              @click="analyzeImage" 
              class="analyze-button" 
              :disabled="!imageFile || isLoading"
            >
              분석 시작
            </button>
            
            <!-- 로딩 또는 처리 표시 -->
            <div v-if="isLoading" class="loading">
              <div class="spinner"></div>
              <p>{{ loadingMessage }}</p>
              <p v-if="processingTimeElapsed > 0" class="elapsed-time">
                처리 중: {{ formatTime(processingTimeElapsed) }} 경과
              </p>
            </div>
            
            <!-- 처리 단계 표시 섹션 -->
            <div class="processing-steps">
              <div class="step" :class="{ active: step >= 1, completed: step > 1 }">
                <div class="step-number">1</div>
                <div class="step-label">이전 방식으로 처리중</div>
              </div>
              <div class="step-connector"></div>
              <div class="step" :class="{ active: step >= 2, completed: step > 2 }">
                <div class="step-number">2</div>
                <div class="step-label">개선 방식으로 처리중</div>
              </div>
              <div class="step-connector"></div>
              <div class="step" :class="{ active: step >= 3, completed: step > 3 }">
                <div class="step-number">3</div>
                <div class="step-label">처리 완료</div>
              </div>
            </div>
          </div>
          
          <!-- 오류 메시지 표시 (공통) -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div v-if="showResult" class="results-container">
            <!-- 2. 1차 결과 섹션 -->
            <div class="analysis-block first-result-block">
              <h2>2. 분석 결과 (api.js 사용)</h2>
              
              <!-- 처리 시간 정보 섹션 -->
              <div class="timing-section">
                <h3>처리 시간 정보</h3>
                <div class="timing-grid">
                  <div class="timing-item">
                    <div class="timing-label">이미지 설명 생성</div>
                    <div class="timing-value">{{ formatTime(step1Time) }}</div>
                  </div>
                  <div class="timing-item">
                    <div class="timing-label">10차원 벡터 생성</div>
                    <div class="timing-value">{{ formatTime(step2Time) }}</div>
                  </div>
                  <div class="timing-item total">
                    <div class="timing-label">총 처리 시간</div>
                    <div class="timing-value">{{ formatTime(totalTime) }}</div>
                  </div>
                </div>
                <div class="timing-details">
                  <div class="detail-item">
                    <span class="detail-label">이미지 설명 생성 시작:</span>
                    <span class="detail-value">{{ formatTimestamp(step1StartTime) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">이미지 설명 생성 완료:</span>
                    <span class="detail-value">{{ formatTimestamp(step1EndTime) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">10차원 분석 시작:</span>
                    <span class="detail-value">{{ formatTimestamp(step2StartTime) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">10차원 분석 완료:</span>
                    <span class="detail-value">{{ formatTimestamp(step2EndTime) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 결과 표시 섹션 -->
              <div class="results-section">
                <!-- 영문 설명 토글 -->
                <div class="description-toggle">
                  <button @click="toggleDescription" class="toggle-button">
                    {{ showDescription ? '영문 설명 숨기기' : '영문 설명 보기' }}
                  </button>
                </div>
                
                <div v-if="showDescription" class="english-description">
                  <h3>분석 결과 (첫 번째 단계 결과)</h3>
                  <div class="description-content">
                    <pre>{{ formatAnalysisResult(analyzedData) }}</pre>
                  </div>
                </div>
                
                <!-- 10차원 분석 결과 (차트 형태) -->
                <div class="dimension-results">
                  <h3>10차원 분석 (두 번째 단계 결과)</h3>
                  <div class="dimension-chart">
                    <div 
                      v-for="(score, dimension) in analyzedData" 
                      :key="dimension" 
                      class="dimension-bar"
                    >
                      <div class="dimension-label">{{ getDimensionName(dimension) }}</div>
                      <div class="bar-container">
                        <div 
                          class="bar" 
                          :style="{ width: `${typeof score === 'number' ? score * 100 : 0}%`, backgroundColor: getBarColor(typeof score === 'number' ? score : 0) }"
                        ></div>
                        <div class="score-label">{{ typeof score === 'number' ? score.toFixed(1) : score }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. 2차 결과 섹션 -->
            <div class="analysis-block second-result-block">
              <h2>3. 분석 결과 (직접 API 호출)</h2>
              
              <!-- 처리 시간 정보 섹션 -->
              <div class="timing-section">
                <h3>처리 시간 정보</h3>
                <div class="timing-grid">
                  <div class="timing-item">
                    <div class="timing-label">이미지 설명 생성</div>
                    <div class="timing-value">{{ formatTime(newStep1Time) }}</div>
                  </div>
                  <div class="timing-item">
                    <div class="timing-label">10차원 벡터 생성</div>
                    <div class="timing-value">{{ formatTime(newStep2Time) }}</div>
                  </div>
                  <div class="timing-item total">
                    <div class="timing-label">총 처리 시간</div>
                    <div class="timing-value">{{ formatTime(newTotalTime) }}</div>
                  </div>
                </div>
                <div class="timing-details">
                  <div class="detail-item">
                    <span class="detail-label">이미지 설명 생성 시작:</span>
                    <span class="detail-value">{{ formatTimestamp(newStep1StartTime) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">이미지 설명 생성 완료:</span>
                    <span class="detail-value">{{ formatTimestamp(newStep1EndTime) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">10차원 분석 시작:</span>
                    <span class="detail-value">{{ formatTimestamp(newStep2StartTime) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">10차원 분석 완료:</span>
                    <span class="detail-value">{{ formatTimestamp(newStep2EndTime) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 결과 표시 섹션 -->
              <div class="results-section">
                <!-- 영문 설명 토글 -->
                <div class="description-toggle">
                  <button @click="toggleNewDescription" class="toggle-button">
                    {{ showNewDescription ? '영문 설명 숨기기' : '영문 설명 보기' }}
                  </button>
                </div>
                
                <div v-if="showNewDescription" class="english-description">
                  <h3>영문 설명 (첫 번째 단계 결과)</h3>
                  <div class="description-content">
                    {{ newDescription }}
                  </div>
                </div>
                
                <!-- 10차원 분석 결과 (차트 형태) -->
                <div class="dimension-results">
                  <h3>10차원 분석 (두 번째 단계 결과)</h3>
                  <div class="dimension-chart">
                    <div 
                      v-for="(score, dimension) in newAnalyzedData" 
                      :key="dimension" 
                      class="dimension-bar"
                    >
                      <div class="dimension-label">{{ getDimensionName(dimension) }}</div>
                      <div class="bar-container">
                        <div 
                          class="bar" 
                          :style="{ width: `${typeof score === 'number' ? score * 100 : 0}%`, backgroundColor: getBarColor(typeof score === 'number' ? score : 0) }"
                        ></div>
                        <div class="score-label">{{ typeof score === 'number' ? score.toFixed(1) : score }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 푸터 -->
      <footer class="footer">
        <p>© 2025 LOG:O - 당신의 여행을 기록하다</p>
      </footer>
    </div>
  </template>
  
  <script>
  // api.js에서 이미지 압축 함수 가져오기
  import { fileToBase64, analyzeImage } from '@/services/api';
  // eslint-disable-next-line
  import config from '@/config.js';
  import Header from "@/components/Header.vue";
  
  export default {
    name: 'ImgSearch',
    
    components: {
      Header
    },
    
    data() {
      return {
        imageFile: null,
        imagePreview: null,
        isLoading: false,
        step: 0,
        loadingMessage: '',
        description: '',
        analyzedData: null,
        errorMessage: '',
        showResult: false,
        showDescription: false,
        
        // 압축 정보 저장
        compressionInfo: {
          originalSize: '',
          compressedSize: '',
          dimensionsFrom: '',
          dimensionsTo: '',
          compressionRatio: ''
        },
        
        // 시간 측정 관련 변수
        startTime: null,
        step1StartTime: null,
        step1EndTime: null,
        step2StartTime: null,
        step2EndTime: null,
        step1Time: 0,
        step2Time: 0,
        totalTime: 0,
        processingTimeElapsed: 0,
        timerInterval: null,
        
        // 왼쪽-오른쪽 비교를 위한 새 변수들
        showNewDescription: false,
        newDescription: '',
        newAnalyzedData: null,
        newStartTime: null,
        newStep1StartTime: null,
        newStep1EndTime: null,
        newStep2StartTime: null,
        newStep2EndTime: null,
        newStep1Time: 0,
        newStep2Time: 0,
        newTotalTime: 0
      }
    },
    
    methods: {
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      
      async handleFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.imageFile = file;
        this.imagePreview = URL.createObjectURL(file);
        
        // 압축 정보를 수집
        try {
          console.log("원본 이미지 파일:", file);
          
          // 원본 이미지 크기 저장
          const originalSize = file.size;
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = this.imagePreview;
          });
          
          const originalWidth = img.width;
          const originalHeight = img.height;
          console.log(`원본 이미지 크기: ${originalWidth}x${originalHeight}, ${originalSize} 바이트`);
          
          // 압축된 이미지 Base64 가져오기 (이미지 표시 목적이 아니므로 실제로 사용하지는 않음)
          const compressedBase64 = await fileToBase64(file);
          console.log("압축된 Base64 생성 완료, 길이:", compressedBase64.length);
          
          // 압축된 base64 문자열 크기 계산 (근사값)
          const compressedSize = compressedBase64.length * 0.75;
          
          // 압축 후 크기 계산 (api.js의 fileToBase64 함수 로직 기반)
          let newWidth, newHeight;
          const targetSize = 640;
          
          if (originalWidth < originalHeight) {
            // 가로가 더 짧은 경우
            const ratio = targetSize / originalWidth;
            newWidth = targetSize;
            newHeight = Math.round(originalHeight * ratio);
          } else {
            // 세로가 더 짧은 경우
            const ratio = targetSize / originalHeight;
            newHeight = targetSize;
            newWidth = Math.round(originalWidth * ratio);
          }
          
          // 원본이 이미 targetSize보다 작다면 그대로 사용
          if (originalWidth <= targetSize && originalHeight <= targetSize) {
            newWidth = originalWidth;
            newHeight = originalHeight;
          }
          
          console.log(`압축 후 크기: ${newWidth}x${newHeight}, 약 ${Math.round(compressedSize)} 바이트`);
          
          // 압축률 계산
          const compressionRatio = ((1 - (compressedSize / originalSize)) * 100).toFixed(2);
          console.log(`압축률: ${compressionRatio}%`);
          
          // 압축 정보 저장
          this.compressionInfo = {
            originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
            compressedSize: `${(compressedSize / 1024).toFixed(2)} KB`,
            dimensionsFrom: `${originalWidth}x${originalHeight}`,
            dimensionsTo: `${newWidth}x${newHeight}`,
            compressionRatio: `${compressionRatio}%`
          };
          
          console.log('압축 정보:', this.compressionInfo);
        } catch (error) {
          console.error('이미지 압축 정보 계산 중 오류:', error);
        }
        
        // 새 이미지가 선택되면 결과 초기화
        this.showResult = false;
        this.description = '';
        this.analyzedData = null;
        this.errorMessage = '';
        this.step = 0;
        this.resetTimers();
      },
      
      resetTimers() {
        this.startTime = null;
        this.step1StartTime = null;
        this.step1EndTime = null;
        this.step2StartTime = null;
        this.step2EndTime = null;
        this.step1Time = 0;
        this.step2Time = 0;
        this.totalTime = 0;
        this.processingTimeElapsed = 0;
        
        // 새로운 변수들 초기화 추가
        this.newStartTime = null;
        this.newStep1StartTime = null;
        this.newStep1EndTime = null;
        this.newStep2StartTime = null;
        this.newStep2EndTime = null;
        this.newStep1Time = 0;
        this.newStep2Time = 0;
        this.newTotalTime = 0;
        
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      },
      
      startElapsedTimeCounter() {
        this.startTime = performance.now();
        this.timerInterval = setInterval(() => {
          this.processingTimeElapsed = (performance.now() - this.startTime) / 1000;
        }, 100);
      },
      
      stopElapsedTimeCounter() {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      },
      
      async analyzeImage() {
        if (!this.imageFile) {
          this.errorMessage = '이미지를 먼저 선택해주세요.';
          return;
        }
        
        this.isLoading = true;
        this.errorMessage = '';
        this.step = 1;
        this.resetTimers();
        this.startElapsedTimeCounter();
        
        try {
          // 시작 시간 기록
          this.startTime = performance.now();
          
          // 이미지를 base64로 변환
          const base64Image = await fileToBase64(this.imageFile);
          console.log("이미지 압축 완료, Base64 길이:", base64Image.length);
          
          // ===== 왼쪽 패널: api.js의 analyzeImage 함수 사용 (LogoSearch 방식) =====
          console.log("===== 왼쪽 패널: api.js의 analyzeImage 함수 사용 =====");
          this.loadingMessage = 'api.js 함수로 이미지 분석 중...';
          this.step1StartTime = performance.now();
          
          // api.js의 analyzeImage 함수 호출
          const abortController = new AbortController();
          const apiResult = await analyzeImage(this.imageFile, abortController.signal);
          
          this.step1EndTime = performance.now();
          this.step1Time = (this.step1EndTime - this.step1StartTime) / 1000;
          
          // 분석 결과 저장
          this.description = JSON.stringify(apiResult);
          console.log("API 함수 사용 분석 결과:", apiResult);
          
          // 10차원 분석 결과 저장 (api.js에서 이미 분석된 결과 사용)
          this.step2StartTime = performance.now();
          this.analyzedData = apiResult; // 이미 차원 분석이 포함되어 있음
          this.step2EndTime = performance.now();
          this.step2Time = (this.step2EndTime - this.step2StartTime) / 1000;
          
          // 총 처리 시간 계산
          const endTime = performance.now();
          this.totalTime = (endTime - this.startTime) / 1000;
          
          // 1단계(이전 방식) 처리 완료 후 타이머 초기화 (1초로 설정)
          this.processingTimeElapsed = 1;
          this.stopElapsedTimeCounter();
          this.startElapsedTimeCounter();
          
          // 2단계 시작 표시
          this.step = 2;
          
          // ===== 새 로직 실행 (오른쪽) =====
          this.loadingMessage = '새 방식으로 분석 중...';
          this.newStartTime = performance.now();
          
          // 1단계: 새 방식으로 영문 설명 생성
          this.newStep1StartTime = performance.now();
          const newDescriptionData = await this.generateNewDescription(base64Image);
          this.newStep1EndTime = performance.now();
          this.newStep1Time = (this.newStep1EndTime - this.newStep1StartTime) / 1000;
          this.newDescription = newDescriptionData.description;
          console.log("이미지 설명 생성 완료 (새 방식):", this.newDescription);
          
          // 2단계: 새 방식으로 10차원 분석
          this.newStep2StartTime = performance.now();
          const newAnalyzed = await this.analyzeNew10Dimensions(this.newDescription);
          this.newStep2EndTime = performance.now();
          this.newStep2Time = (this.newStep2EndTime - this.newStep2StartTime) / 1000;
          this.newAnalyzedData = newAnalyzed;
          console.log("10차원 분석 완료 (새 방식):", this.newAnalyzedData);
          
          // 새 방식 총 처리 시간 계산
          const newEndTime = performance.now();
          this.newTotalTime = (newEndTime - this.newStartTime) / 1000;
          
          // 결과 표시
          this.step = 3;
          this.showResult = true;
        } catch (error) {
          console.error('분석 중 오류 발생:', error);
          this.errorMessage = `분석 중 오류가 발생했습니다: ${error.message}`;
        } finally {
          this.isLoading = false;
          this.stopElapsedTimeCounter();
        }
      },
      
      // 수정된 generateDescription 함수 - Ollama API 형식에 맞게 변경
      async generateDescription(base64Image) {
        try {
          console.log("이미지 설명 생성 API 호출 시작...");
          
          // Ollama API 형식으로 요청 구성 - messages 배열 대신 prompt와 images 필드 사용
          const apiRequestBody = {
            model: 'light_2',
            prompt: 'Describe this travel destination in detail according to your instructions.',
            images: [base64Image.split(',')[1]], // Base64 이미지 데이터만 추출
            stream: false // 스트리밍 비활성화
          };
          
          console.log("API 요청 내용:", JSON.stringify(apiRequestBody, null, 2).substring(0, 500) + "...");
          
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiRequestBody)
          });

          console.log("API 응답:", response);
          
          if (!response.ok) {
            console.error("API 응답 상태:", response.status, response.statusText);
            throw new Error(`API 응답 오류: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("이미지 설명 API 응답:", data);
          
          // Ollama API는 response 필드에 직접 텍스트 응답을 제공
          if (data && data.response) {
            return { description: data.response };
          }
          
          console.error("API 응답 형식이 예상과 다릅니다:", data);
          return { description: "API에서 유효한 응답을 받지 못했습니다." };
        } catch (error) {
          console.error('설명 생성 오류:', error);
          throw new Error('이미지 설명을 생성하는 동안 오류가 발생했습니다.');
        }
      },
      
      // 수정된 analyze10Dimensions 함수 - Ollama API 형식에 맞게 변경
      async analyze10Dimensions(description) {
        try {
          console.log("10차원 분석 API 호출 시작...");
          
          // Ollama API 형식으로 요청 구성 - messages 배열 대신 prompt 필드 사용
          const apiRequestBody = {
            model: 'ko_2',
            prompt: description, // 이전 단계에서 얻은 설명을 프롬프트로 사용
            stream: false
          };
          
          console.log("API 요청 내용:", JSON.stringify(apiRequestBody, null, 2));
          
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiRequestBody)
          });
          
          if (!response.ok) {
            console.error("API 응답 상태:", response.status, response.statusText);
            throw new Error(`API 응답 오류: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("10차원 분석 API 응답:", data);
          
          // Ollama API는 response 필드에 직접 텍스트 응답을 제공
          if (data && data.response) {
            try {
              // 1. JSON 형식의 문자열인 경우 파싱 시도
              if (data.response.trim().startsWith('{')) {
                const parsedData = JSON.parse(data.response);
                console.log("10차원 분석 파싱 결과 (JSON):", parsedData);
                return parsedData;
              }
              
              // 2. 각 줄이 "키": 값 형태로 되어 있는 경우 정규식으로 파싱
              const dimensions = {};
              const lines = data.response.split('\n');
              
              for (const line of lines) {
                // "Natural Elements": 0.9 형태의 라인 파싱
                const match = line.match(/"([^"]+)":\s*([0-9.]+)/);
                if (match) {
                  const key = match[1];
                  const value = parseFloat(match[2]);
                  dimensions[key] = value;
                }
              }
              
              // 추출된 차원이 있는지 확인
              if (Object.keys(dimensions).length > 0) {
                console.log("10차원 분석 파싱 결과 (라인 파싱):", dimensions);
                return dimensions;
              }
              
              // 3. 파싱 실패 시 테스트 데이터 제공 (실제 서비스에서는 제거하는 것이 좋음)
              console.warn("응답 파싱 실패, 테스트 데이터 사용");
              return {
                "Natural Elements": 0.7,
                "Urban Character": 0.3,
                "Water Features": 0.5,
                "Seasonal Appeal": 0.8,
                "Relaxation Potential": 0.7,
                "Romantic Atmosphere": 0.6,
                "Activity Opportunities": 0.4,
                "Historical/Cultural Value": 0.5,
                "Food Experience": 0.3,
                "Shopping Potential": 0.2
              };
            } catch (jsonError) {
              console.error("10차원 분석 파싱 오류:", jsonError, "원본 내용:", data.response);
              throw new Error('10차원 분석 결과를 파싱하는 데 실패했습니다.');
            }
          } else {
            throw new Error('API에서 유효한 응답을 받지 못했습니다.');
          }
        } catch (error) {
          console.error('10차원 분석 오류:', error);
          throw new Error('10차원 분석을 수행하는 동안 오류가 발생했습니다.');
        }
      },
      
      // 새 방식의 이미지 설명 생성 함수
      async generateNewDescription(base64Image) {
        try {
          console.log("이미지 설명 생성 API 호출 시작 (새 방식)...");
          
          // Ollama API 형식으로 요청 구성
          const apiRequestBody = {
            model: 'light_2',
            prompt: 'Describe this travel destination in detail according to your instructions.',
            images: [base64Image.split(',')[1]], // Base64 이미지 데이터만 추출
            stream: false // 스트리밍 비활성화
          };
          
          console.log("API 요청 내용:", JSON.stringify(apiRequestBody, null, 2).substring(0, 500) + "...");
          
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiRequestBody)
          });
          
          console.log("API 응답:", response);
          
          if (!response.ok) {
            console.error("API 응답 상태:", response.status, response.statusText);
            throw new Error(`API 응답 오류: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("이미지 설명 API 응답:", data);
          
          // Ollama API는 response 필드에 직접 텍스트 응답을 제공
          if (data && data.response) {
            return { description: data.response };
          }
          
          console.error("API 응답 형식이 예상과 다릅니다:", data);
          return { description: "API에서 유효한 응답을 받지 못했습니다." };
        } catch (error) {
          console.error('설명 생성 오류 (새 방식):', error);
          throw new Error('이미지 설명을 생성하는 동안 오류가 발생했습니다. (새 방식)');
        }
      },
      
      // 새 방식의 10차원 분석 함수
      async analyzeNew10Dimensions(description) {
        try {
          console.log("10차원 분석 API 호출 시작 (새 방식)...");
          
          // Ollama API 형식으로 요청 구성
          const apiRequestBody = {
            model: 'ko_2',
            prompt: description, // 이전 단계에서 얻은 설명을 프롬프트로 사용
            stream: false
          };
          
          console.log("API 요청 내용:", JSON.stringify(apiRequestBody, null, 2));
          
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiRequestBody)
          });
          
          if (!response.ok) {
            console.error("API 응답 상태:", response.status, response.statusText);
            throw new Error(`API 응답 오류: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("10차원 분석 API 응답:", data);
          
          // Ollama API는 response 필드에 직접 텍스트 응답을 제공
          if (data && data.response) {
            try {
              // 1. JSON 형식의 문자열인 경우 파싱 시도
              if (data.response.trim().startsWith('{')) {
                const parsedData = JSON.parse(data.response);
                console.log("10차원 분석 파싱 결과 (JSON) (새 방식):", parsedData);
                return parsedData;
              }
              
              // 2. 각 줄이 "키": 값 형태로 되어 있는 경우 정규식으로 파싱
              const dimensions = {};
              const lines = data.response.split('\n');
              
              for (const line of lines) {
                // "Natural Elements": 0.9 형태의 라인 파싱
                const match = line.match(/"([^"]+)":\s*([0-9.]+)/);
                if (match) {
                  const key = match[1];
                  const value = parseFloat(match[2]);
                  dimensions[key] = value;
                }
              }
              
              // 추출된 차원이 있는지 확인
              if (Object.keys(dimensions).length > 0) {
                console.log("10차원 분석 파싱 결과 (라인 파싱) (새 방식):", dimensions);
                return dimensions;
              }
              
              // 3. 파싱 실패 시 테스트 데이터 제공 (실제 서비스에서는 제거하는 것이 좋음)
              console.warn("응답 파싱 실패, 테스트 데이터 사용 (새 방식)");
              return {
                "Natural Elements": 0.7,
                "Urban Character": 0.3,
                "Water Features": 0.5,
                "Seasonal Appeal": 0.8,
                "Relaxation Potential": 0.7,
                "Romantic Atmosphere": 0.6,
                "Activity Opportunities": 0.4,
                "Historical/Cultural Value": 0.5,
                "Food Experience": 0.3,
                "Shopping Potential": 0.2
              };
            } catch (jsonError) {
              console.error("10차원 분석 파싱 오류 (새 방식):", jsonError, "원본 내용:", data.response);
              throw new Error('10차원 분석 결과를 파싱하는 데 실패했습니다. (새 방식)');
            }
          } else {
            throw new Error('API에서 유효한 응답을 받지 못했습니다. (새 방식)');
          }
        } catch (error) {
          console.error('10차원 분석 오류 (새 방식):', error);
          throw new Error('10차원 분석을 수행하는 동안 오류가 발생했습니다. (새 방식)');
        }
      },
      
      toggleDescription() {
        this.showDescription = !this.showDescription;
      },
      
      toggleNewDescription() {
        this.showNewDescription = !this.showNewDescription;
      },
      
      formatTime(seconds) {
        if (!seconds) return '0초';
        
        if (seconds < 60) {
          return `${seconds.toFixed(1)}초`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes}분 ${remainingSeconds.toFixed(0)}초`;
      },
      
      formatTimestamp(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          fractionalSecondDigits: 3
        });
      },
      
      getDimensionName(dimension) {
        // 영어 차원명을 한국어로 변환
        const translations = {
          'Natural Elements': '자연 요소',
          'Urban Character': '도시 특성',
          'Water Features': '수경 요소',
          'Seasonal Appeal': '계절적 매력',
          'Relaxation Potential': '휴식 잠재력',
          'Romantic Atmosphere': '로맨틱한 분위기',
          'Activity Opportunities': '활동 기회',
          'Historical/Cultural Value': '역사/문화적 가치',
          'Food Experience': '식도락 경험',
          'Shopping Potential': '쇼핑 잠재력'
        };
        return translations[dimension] || dimension;
      },
      
      getBarColor(score) {
        // 점수에 따른 막대 색상 지정
        if (score >= 0.8) return '#4CAF50'; // 높은 점수 (녹색)
        if (score >= 0.5) return '#2196F3'; // 중간 점수 (파란색)
        if (score >= 0.3) return '#FF9800'; // 낮은 점수 (주황색)
        return '#F44336'; // 매우 낮은 점수 (빨간색)
      },
      
      // 결과 데이터 포맷 함수 추가
      formatAnalysisResult(result) {
        if (!result) return '';
        
        // 객체를 보기 좋은 형태로 변환
        const formattedResult = {};
        
        // 차원 정보만 포함
        const dimensions = [
          "Natural Elements",
          "Urban Character",
          "Water Features",
          "Seasonal Appeal",
          "Relaxation Potential",
          "Romantic Atmosphere",
          "Activity Opportunities",
          "Historical/Cultural Value",
          "Food Experience",
          "Shopping Potential"
        ];
        
        // 차원 정보 추출
        dimensions.forEach(dim => {
          if (result[dim] !== undefined) {
            formattedResult[dim] = result[dim];
          }
        });
        
        // 위치 정보가 있으면 추가
        if (result.geoLocation) {
          formattedResult.location = result.geoLocation.coordinates;
          
          if (result.geoLocation.address) {
            formattedResult.address = {
              province: result.geoLocation.address.province,
              city: result.geoLocation.address.city
            };
          }
        }
        
        return JSON.stringify(formattedResult, null, 2);
      }
    },
    
    // Vue 3에서는 beforeDestroy 대신 beforeUnmount 사용
    beforeUnmount() {
      // 컴포넌트 소멸 시 타이머 정리
      this.stopElapsedTimeCounter();
    }
  }
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

  .img-search-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Noto Sans KR', sans-serif;
    background-color: #f5f5f5;
  }

  .content-wrapper {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 20px;
    flex-grow: 1;
  }

  /* 새로운 세로 레이아웃 */
  .vertical-layout {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  /* 분석 블록 공통 스타일 */
  .analysis-block {
    background-color: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    width: 100%;
  }

  /* 결과 컨테이너 */
  .results-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    width: 100%;
  }

  /* 이미지 입력 블록 */
  .image-input-block {
    border-top: 4px solid #3498db;
  }

  /* 첫 번째 결과 블록 */
  .first-result-block {
    border-top: 4px solid #2196F3;
  }

  /* 두 번째 결과 블록 */
  .second-result-block {
    border-top: 4px solid #4CAF50;
  }

  .footer {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 20px;
    font-size: 14px;
    margin-top: 40px;
  }

  .footer p {
    margin: 0;
    opacity: 0.8;
  }

  h2 {
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 600;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  h3 {
    color: #3498db;
    margin-top: 15px;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 500;
  }
  
  /* 업로드 영역 스타일 */
  .upload-section {
    margin-bottom: 25px;
  }
  
  .upload-area {
    width: 100%;
    height: 250px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .upload-area:hover {
    border-color: #3498db;
    background-color: #f8f9fa;
  }
  
  .upload-area.has-image {
    border-style: solid;
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #777;
  }
  
  .icon {
    font-size: 48px;
    margin-bottom: 10px;
  }
  
  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  /* 처리 단계 표시 스타일 */
  .processing-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 25px 0 10px;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e0e0e0;
    color: #777;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-bottom: 10px;
    transition: all 0.3s ease;
  }
  
  .step.active .step-number {
    background-color: #3498db;
    color: white;
  }
  
  .step.completed .step-number {
    background-color: #2ecc71;
    color: white;
  }
  
  .step-label {
    font-size: 14px;
    color: #777;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .step.active .step-label,
  .step.completed .step-label {
    color: #333;
    font-weight: 500;
  }
  
  .step-connector {
    flex-grow: 1;
    height: 2px;
    background-color: #e0e0e0;
    margin: 0 10px;
    position: relative;
    top: -20px;
  }
  
  /* 압축 정보 스타일 */
  .compression-section {
    margin: 20px 0;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
  
  .compression-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .info-item {
    padding: 8px;
    background-color: white;
    border-radius: 6px;
    border: 1px solid #ddd;
    text-align: center;
  }
  
  .info-item.highlight {
    grid-column: span 2;
    background-color: #e8f5e9;
    border-color: #c8e6c9;
    font-weight: 500;
  }
  
  .info-label {
    font-size: 13px;
    color: #616161;
    margin-bottom: 4px;
  }
  
  .info-value {
    font-size: 16px;
    font-weight: 500;
    color: #2c3e50;
  }
  
  .info-item.highlight .info-value {
    color: #2e7d32;
    font-size: 18px;
  }
  
  /* 로딩 스타일 */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px 0;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  .elapsed-time {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
    font-family: monospace;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 타이밍 섹션 스타일 */
  .timing-section {
    margin: 20px 0;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
  
  .timing-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .timing-item {
    padding: 10px;
    background-color: white;
    border-radius: 6px;
    border: 1px solid #ddd;
    text-align: center;
  }
  
  .timing-item.total {
    grid-column: span 2;
    background-color: #e8f4fd;
    border-color: #bde0fe;
    font-weight: 500;
  }
  
  .timing-label {
    margin-bottom: 5px;
    font-size: 14px;
    color: #555;
  }
  
  .timing-value {
    font-size: 18px;
    font-weight: 500;
    color: #2c3e50;
    font-family: monospace;
  }
  
  .timing-item.total .timing-value {
    color: #2980b9;
    font-size: 20px;
  }
  
  .timing-details {
    margin-top: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px dashed #ddd;
    font-size: 0.9rem;
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    padding: 3px 0;
  }
  
  .detail-item:not(:last-child) {
    border-bottom: 1px dotted #eee;
  }
  
  .detail-label {
    color: #666;
    font-weight: 500;
  }
  
  .detail-value {
    font-family: monospace;
    color: #2c3e50;
  }
  
  /* 버튼 스타일 */
  .analyze-button {
    display: block;
    width: 100%;
    padding: 15px;
    margin: 20px 0;
    background: linear-gradient(to right, #3498db, #2ecc71);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .analyze-button:hover {
    background: linear-gradient(to right, #2980b9, #27ae60);
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }
  
  .analyze-button:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .toggle-button {
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .toggle-button:hover {
    background-color: #e9ecef;
  }
  
  /* 결과 스타일 */
  .results-section {
    margin-top: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background-color: #f8f9fa;
  }
  
  .description-toggle {
    text-align: center;
    margin-bottom: 15px;
  }
  
  .english-description {
    margin-bottom: 30px;
    background-color: white;
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #ddd;
  }
  
  .description-content {
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .dimension-chart {
    margin-top: 15px;
  }
  
  .dimension-bar {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .dimension-label {
    width: 150px;
    text-align: right;
    padding-right: 15px;
    font-size: 14px;
    font-weight: 500;
    color: #555;
  }
  
  .bar-container {
    flex-grow: 1;
    height: 25px;
    background-color: #e9ecef;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }
  
  .bar {
    height: 100%;
    transition: width 0.8s ease-out;
  }
  
  .score-label {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: bold;
    font-size: 14px;
    color: #333;
  }
  
  /* 오류 메시지 스타일 */
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
    width: 100%;
  }

  /* 반응형 */
  @media (max-width: 992px) {
    .timing-grid {
      grid-template-columns: 1fr;
    }
    
    .timing-item.total {
      grid-column: span 1;
    }
  }
  
  @media (max-width: 768px) {
    .dimension-label {
      width: 120px;
      font-size: 12px;
    }
    
    .score-label {
      font-size: 12px;
    }
    
    .upload-area {
      height: 200px;
    }
    
    .compression-grid {
      grid-template-columns: 1fr;
    }
    
    .info-item.highlight {
      grid-column: span 1;
    }
  }

  .description-content pre {
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background-color: #f8f9fa;
    padding: 0.75rem;
    border-radius: 4px;
    margin: 0;
    overflow: auto;
    max-height: 300px;
  }
  </style>