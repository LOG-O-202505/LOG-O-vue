<template>
    <div class="two-step-analyzer">
      <h1>이미지 분석 시스템 (2단계 프로세스)</h1>
      
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
      
      <!-- 처리 단계 표시 섹션 -->
      <div class="processing-steps">
        <div class="step" :class="{ active: step >= 1, completed: step > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">이미지 설명 생성 중</div>
        </div>
        <div class="step-connector"></div>
        <div class="step" :class="{ active: step >= 2, completed: step > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">10차원 분석 중</div>
        </div>
        <div class="step-connector"></div>
        <div class="step" :class="{ active: step >= 3, completed: step > 3 }">
          <div class="step-number">3</div>
          <div class="step-label">결과 생성 완료</div>
        </div>
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
      
      <!-- 로딩 또는 처리 표시 -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
        <p v-if="processingTimeElapsed > 0" class="elapsed-time">
          처리 중: {{ formatTime(processingTimeElapsed) }} 경과
        </p>
      </div>
      
      <!-- 분석 실행 버튼 -->
      <button 
        @click="analyzeImage" 
        class="analyze-button" 
        :disabled="!imageFile || isLoading"
      >
        분석 시작
      </button>
      
      <!-- 처리 시간 정보 섹션 -->
      <div v-if="showResult" class="timing-section">
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
      <div v-if="showResult" class="results-section">
        <h2>분석 결과</h2>
        
        <!-- 중간 영문 설명 표시 (토글 가능) -->
        <div class="description-toggle">
          <button @click="toggleDescription" class="toggle-button">
            {{ showDescription ? '영문 설명 숨기기' : '영문 설명 보기' }}
          </button>
        </div>
        
        <div v-if="showDescription" class="english-description">
          <h3>영문 설명 (첫 번째 단계 결과)</h3>
          <div class="description-content">
            {{ description }}
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
                  :style="{ width: `${score * 100}%`, backgroundColor: getBarColor(score) }"
                ></div>
                <div class="score-label">{{ score.toFixed(1) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 오류 메시지 표시 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </template>
  
  <script>
  // api.js에서 이미지 압축 함수 가져오기
  import { fileToBase64 } from '@/services/api';
  
  export default {
    name: 'TwoStepImageAnalyzer',
    
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
        timerInterval: null
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
          
          // 1단계: 이미지를 base64로 변환 (api.js의 fileToBase64 함수 사용)
          const base64Image = await fileToBase64(this.imageFile);
          console.log("이미지 압축 완료, Base64 길이:", base64Image.length);
          
          // 2단계: light_2 모델로 영문 설명 생성
          this.loadingMessage = '이미지 설명 생성 중...';
          this.step1StartTime = performance.now();
          const descriptionData = await this.generateDescription(base64Image);
          this.step1EndTime = performance.now();
          this.step1Time = (this.step1EndTime - this.step1StartTime) / 1000;
          this.description = descriptionData.description; // JSON에서 description 필드 추출
          console.log("이미지 설명 생성 완료:", this.description);
          
          // 3단계: ko_2 모델로 10차원 분석
          this.step = 2;
          this.loadingMessage = '10차원 분석 중...';
          this.step2StartTime = performance.now();
          const analyzed = await this.analyze10Dimensions(this.description);
          this.step2EndTime = performance.now();
          this.step2Time = (this.step2EndTime - this.step2StartTime) / 1000;
          this.analyzedData = analyzed;
          console.log("10차원 분석 완료:", this.analyzedData);
          
          // 총 처리 시간 계산
          const endTime = performance.now();
          this.totalTime = (endTime - this.startTime) / 1000;
          
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
      
      async generateDescription(base64Image) {
        // light_2 모델에 이미지 전송하여 설명 생성
        try {
          console.log("이미지 설명 생성 API 호출 시작...");
          const apiRequestBody = {
            model: 'light_2',
            messages: [
              {
                role: 'user',
                content: 'Describe this travel destination in detail according to your instructions.',
                images: [base64Image.split(',')[1]]
              }
            ]
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
          
          // 응답 처리 개선 - 스크린샷에서 보이는 응답 형식에 맞게 수정
          if (!data || !data.message || !data.message.content) {
            console.error("API 응답 형식이 예상과 다릅니다:", data);
            return { description: "API에서 유효한 응답을 받지 못했습니다." };
          }
          
          const content = data.message.content;
          
          // 응답이 이미 JSON 객체 형태로 되어 있는 경우
          if (typeof content === 'object' && content.description) {
            console.log("응답이 이미 객체 형식입니다:", content);
            return content;
          }
          
          // 응답이 문자열인 경우 JSON 파싱 시도
          if (typeof content === 'string') {
            try {
              // 문자열이 JSON 형식인지 확인
              if (content.trim().startsWith('{')) {
                const parsedContent = JSON.parse(content);
                if (parsedContent.description) {
                  return parsedContent;
                }
              }
              
              // 스크린샷에서 보이는 형식 처리 - JSON 형태의 문자열이지만 중괄호만 있는 경우
              const jsonPattern = /"description":\s*"([^"]*)"/;
              const match = content.match(jsonPattern);
              if (match) {
                return { description: match[1] };
              }
            } catch (jsonError) {
              console.warn("JSON 파싱 실패:", jsonError);
            }
          }
          
          // 모든 파싱 시도가 실패한 경우, 원본 텍스트를 description으로 사용
          return { description: typeof content === 'string' ? content : JSON.stringify(content) };
        } catch (error) {
          console.error('설명 생성 오류:', error);
          throw new Error('이미지 설명을 생성하는 동안 오류가 발생했습니다.');
        }
      },
      
      async analyze10Dimensions(description) {
        // ko_2 모델에 영문 설명 전송하여 10차원 분석
        try {
          console.log("10차원 분석 API 호출 시작...");
          const apiRequestBody = {
            model: 'ko_2',
            messages: [
              {
                role: 'user',
                content: description
              }
            ]
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
          
          // 응답 처리 개선 - 스크린샷에서 보이는 응답 형식에 맞게 수정
          if (!data || !data.message || !data.message.content) {
            console.error("API 응답 형식이 예상과 다릅니다:", data);
            throw new Error('API에서 유효한 응답을 받지 못했습니다.');
          }
          
          const content = data.message.content;
          
          // 스크린샷에서 보이는 형식 처리 - 각 차원별 값을 추출하여 객체로 변환
          if (typeof content === 'string') {
            try {
              // 1. 일반적인 JSON 형식인 경우 먼저 시도
              if (content.trim().startsWith('{')) {
                const parsedData = JSON.parse(content);
                console.log("10차원 분석 파싱 결과 (JSON):", parsedData);
                return parsedData;
              }
              
              // 2. 스크린샷에서 보이는 형식 - 각 줄이 "키": 값 형태로 되어 있는 경우
              const dimensions = {};
              const lines = content.split('\n');
              
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
              
              throw new Error('응답에서 차원 데이터를 추출할 수 없습니다');
            } catch (jsonError) {
              console.error("10차원 분석 파싱 오류:", jsonError, "원본 내용:", content);
              throw new Error('10차원 분석 결과를 파싱하는 데 실패했습니다.');
            }
          } else if (typeof content === 'object') {
            // 이미 객체인 경우 그대로 반환
            console.log("10차원 분석 결과 (이미 객체):", content);
            return content;
          } else {
            throw new Error('예상치 못한 응답 형식입니다');
          }
        } catch (error) {
          console.error('10차원 분석 오류:', error);
          throw new Error('10차원 분석을 수행하는 동안 오류가 발생했습니다.');
        }
      },
      
      toggleDescription() {
        this.showDescription = !this.showDescription;
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
  .two-step-analyzer {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Noto Sans KR', sans-serif;
  }
  
  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
  }
  
  h2 {
    color: #2c3e50;
    margin-top: 20px;
    margin-bottom: 15px;
  }
  
  h3 {
    color: #3498db;
    margin-top: 15px;
    margin-bottom: 10px;
  }
  
  /* 업로드 영역 스타일 */
  .upload-section {
    margin-bottom: 30px;
  }
  
  .upload-area {
    width: 100%;
    height: 300px;
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
    margin: 30px 0;
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
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .analyze-button:hover {
    background-color: #2980b9;
  }
  
  .analyze-button:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
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
    margin-top: 30px;
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
    margin-top: 20px;
    text-align: center;
  }
  
  /* 반응형 */
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
    
    .timing-grid,
    .compression-grid {
      grid-template-columns: 1fr;
    }
    
    .timing-item.total,
    .info-item.highlight {
      grid-column: span 1;
    }
  }
  </style>