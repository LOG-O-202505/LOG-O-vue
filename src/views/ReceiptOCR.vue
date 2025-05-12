<template>
    <div class="receipt-ocr-container">
      <h2 class="title">영수증 및 결제내역 분석</h2>
      
      <!-- API 키 입력 섹션 -->
      <div class="form-group" v-if="!apiKey">
        <label for="apiKey">OCR.space API 키</label>
        <div class="api-key-input">
          <input 
            type="text" 
            id="apiKey" 
            v-model="tempApiKey" 
            placeholder="OCR.space API 키를 입력하세요 (무료로 발급 가능)"
          >
          <button @click="saveApiKey" class="btn primary-btn" :disabled="!tempApiKey">저장</button>
        </div>
        <p class="api-info">
          API 키가 없으신가요? 
          <a href="https://ocr.space/ocrapi" target="_blank">여기서 무료로 발급받으세요</a>
        </p>
      </div>
  
      <!-- API 키가 저장된 경우 -->
      <div v-else class="api-key-display">
        <p>API 키: {{ maskApiKey(apiKey) }} 
          <button @click="resetApiKey" class="btn-link">변경</button>
        </p>
      </div>
  
      <!-- 이미지 업로드 섹션 -->
      <div class="upload-section" v-if="apiKey">
        <div class="upload-container" 
             @dragover.prevent="onDragOver" 
             @dragleave.prevent="onDragLeave" 
             @drop.prevent="onDrop" 
             :class="{ 'active-dropzone': isDragging }">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileInput" 
            accept="image/*" 
            style="display: none"
          >
          <div v-if="!preview" class="upload-prompt">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p>영수증 또는 결제내역 이미지를 끌어서 놓거나 클릭하여 업로드하세요</p>
            <button @click="triggerFileInput" class="btn secondary-btn">파일 선택</button>
          </div>
          <div v-else class="preview-container">
            <img :src="preview" alt="영수증/결제내역 미리보기" class="receipt-preview">
            <div class="preview-actions">
              <button @click="analyzeReceipt" class="btn primary-btn" :disabled="isLoading">
                {{ isLoading ? '분석 중...' : '이미지 분석하기' }}
              </button>
              <button @click="clearImage" class="btn cancel-btn">취소</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 로딩 인디케이터 -->
      <div class="loading-overlay" v-if="isLoading">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
  
      <!-- 결과 섹션 -->
      <div class="results-section" v-if="results">
        <h3>분석 결과</h3>
        
        <div class="container">
          <div class="tab-header">
            <button 
              @click="activeTab = 'extracted'" 
              :class="{ active: activeTab === 'extracted' }"
              class="tab-btn"
            >
              추출 데이터
            </button>
            <button 
              @click="activeTab = 'raw'" 
              :class="{ active: activeTab === 'raw' }"
              class="tab-btn"
            >
              원본 텍스트
            </button>
          </div>
  
          <!-- 추출 데이터 탭 -->
          <div v-if="activeTab === 'extracted'" class="extracted-data">
            <div class="data-card">
              <h4>결제 정보</h4>
              <table>
                <tbody>
                  <tr>
                    <td class="label">결제 장소:</td>
                    <td>{{ parsedData.Place || '인식 실패' }}</td>
                  </tr>
                  <tr>
                    <td class="label">결제 시간:</td>
                    <td>{{ parsedData.Time || '인식 실패' }}</td>
                  </tr>
                  <tr>
                    <td class="label">결제 금액:</td>
                    <td>{{ parsedData.Price ? formatPrice(parsedData.Price) : '인식 실패' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="data-correction">
              <p class="correction-note">
                * OCR 인식 결과는 100% 정확하지 않을 수 있습니다. 필요한 경우 데이터를 수정하세요.
              </p>
              <p v-if="analysisMethod" class="analysis-method">
                분석 방법: {{ analysisMethod }}
              </p>
            </div>
          </div>
  
          <!-- 원본 텍스트 탭 -->
          <div v-if="activeTab === 'raw'" class="raw-text">
            <div class="text-content">
              <pre>{{ results.ParsedText || '텍스트를 추출할 수 없습니다.' }}</pre>
            </div>
          </div>
        </div>
  
        <!-- 액션 버튼 -->
        <div class="action-buttons">
          <button @click="clearResults" class="btn secondary-btn">새 이미지 분석하기</button>
          <button @click="copyToClipboard" class="btn primary-btn">결과 복사하기</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ReceiptOCR',
    data() {
      return {
        apiKey: 'K83821813888957',
        tempApiKey: '',
        uploadedFile: null,
        preview: null,
        isLoading: false,
        isDragging: false,
        results: null,
        activeTab: 'extracted',
        parsedData: {
          Place: '',
          Time: '',
          Price: null
        },
        maxImageSize: 1024 * 1024, // 1MB in bytes
        compressionQuality: 0.7,
        imageCompressed: false,
        loadingMessage: '이미지 분석 중...',
        analysisMethod: '',
        ollamaApiUrl: 'http://localhost:11434/api/generate',
        ollamaModel: 'OCR_basic' // 모델 이름을 OCR_basic으로 설정
      }
    },
    mounted() {
      // 로컬 스토리지에서 API 키 불러오기
      const savedApiKey = localStorage.getItem('ocr_api_key');
      if (savedApiKey) {
        this.apiKey = savedApiKey;
      } else {
        // 기본 API 키 저장
        localStorage.setItem('ocr_api_key', this.apiKey);
      }
    },
    methods: {
      // 가격 포맷팅
      formatPrice(price) {
        if (!price) return '';
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
      },
      
      // API 키 저장
      saveApiKey() {
        if (this.tempApiKey) {
          this.apiKey = this.tempApiKey;
          localStorage.setItem('ocr_api_key', this.apiKey);
          this.tempApiKey = '';
        }
      },
      
      // API 키 재설정
      resetApiKey() {
        this.apiKey = '';
        this.tempApiKey = '';
        localStorage.removeItem('ocr_api_key');
      },
      
      // API 키 마스킹
      maskApiKey(key) {
        if (!key) return '';
        if (key.length <= 8) return '********';
        return key.substr(0, 4) + '********' + key.substr(key.length - 4);
      },
      
      // 파일 입력 트리거
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      
      // 파일 입력 처리
      handleFileInput(event) {
        const file = event.target.files[0];
        if (file) {
          this.processFile(file);
        }
      },
      
      // 드래그 이벤트
      onDragOver() {
        this.isDragging = true;
      },
      
      onDragLeave() {
        this.isDragging = false;
      },
      
      onDrop(event) {
        this.isDragging = false;
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          this.processFile(file);
        }
      },
      
      // 파일 처리
      processFile(file) {
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.');
          return;
        }
        
        this.uploadedFile = file;
        
        // 이미지 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
          this.preview = e.target.result;
          
          // 파일 크기 확인 및 압축 필요 시 압축
          if (file.size > this.maxImageSize) {
            this.compressImage(e.target.result);
          } else {
            this.imageCompressed = false;
          }
        };
        reader.readAsDataURL(file);
      },
      
      // 이미지 압축
      compressImage(dataUrl) {
        const image = new Image();
        image.onload = () => {
          let quality = this.compressionQuality;
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext('2d');
          
          // 원본 비율 유지
          let maxDimension = 1800; // 최대 크기 제한
          let width = image.width;
          let height = image.height;
          
          // 이미지 크기가 크면 줄임
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round(height * (maxDimension / width));
              width = maxDimension;
            } else {
              width = Math.round(width * (maxDimension / height));
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 이미지 그리기
          ctx.fillStyle = 'white'; // 배경색 흰색
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, width, height);
          
          const tryCompression = (q) => {
            const compressedDataUrl = canvas.toDataURL('image/jpeg', q);
            
            // 압축된 이미지 크기 계산
            const base64String = compressedDataUrl.split(',')[1];
            const paddingFactor = 1.33; // base64 인코딩은 원본보다 약 33% 크기 증가
            const compressedSize = Math.round((base64String.length * paddingFactor) / 4);
            
            if (compressedSize <= this.maxImageSize || q <= 0.1) {
              // 압축 완료 - Blob으로 변환
              canvas.toBlob((blob) => {
                if (blob) {
                  const compressedFile = new File([blob], this.uploadedFile.name, {
                    type: 'image/jpeg',
                    lastModified: new Date().getTime()
                  });
                  this.uploadedFile = compressedFile;
                  this.preview = compressedDataUrl;
                  this.imageCompressed = true;
                  console.log(`이미지 압축 완료: ${(compressedSize / 1024).toFixed(2)}KB (품질: ${q.toFixed(2)})`);
                }
              }, 'image/jpeg', q);
            } else {
              // 여전히 너무 큼, 더 압축
              tryCompression(q - 0.1);
            }
          };
          
          // 압축 시작
          tryCompression(quality);
        };
        image.src = dataUrl;
      },
      
      // 이미지 초기화
      clearImage() {
        this.uploadedFile = null;
        this.preview = null;
        this.$refs.fileInput.value = '';
      },
      
      // 결과 초기화
      clearResults() {
        this.results = null;
        this.clearImage();
        this.parsedData = {
          Place: '',
          Time: '',
          Price: null
        };
        this.analysisMethod = '';
      },
      
      // 영수증/결제내역 분석
      async analyzeReceipt() {
        if (!this.uploadedFile || !this.apiKey) {
          return;
        }
        
        this.isLoading = true;
        this.loadingMessage = 'OCR로 텍스트 추출 중...';
        
        try {
          // 파일 크기 확인
          if (this.uploadedFile.size > this.maxImageSize && !this.imageCompressed) {
            this.isLoading = false;
            alert(`이미지 크기가 너무 큽니다 (${(this.uploadedFile.size / 1024).toFixed(2)}KB). 1MB 이하로 압축해주세요.`);
            return;
          }
          
          // 한국어로만 한 번 시도
          let success = await this.tryOCRRequest('kor');
          
          if (!success) {
            alert('이미지 분석에 실패했습니다. 다른 이미지로 시도해보세요.');
          }
        } catch (error) {
          console.error('OCR API 호출 오류:', error);
          // 사용자 친화적인 오류 메시지 표시
          let errorMsg = error.message;
          
          // API 오류 코드에 따른 사용자 친화적인 메시지
          if (errorMsg.includes('E201')) {
            errorMsg = 'API 요청 형식이 올바르지 않습니다. 관리자에게 문의하세요.';
          } else if (errorMsg.includes('401')) {
            errorMsg = 'API 키가 유효하지 않습니다. 올바른 API 키를 입력하세요.';
          } else if (errorMsg.includes('503')) {
            errorMsg = 'OCR 서비스가 일시적으로 사용 불가능합니다. 잠시 후 다시 시도해주세요.';
          } else if (errorMsg.includes('size exceeds')) {
            errorMsg = '이미지 파일이 1MB를 초과합니다. 더 작은 이미지를 사용하거나 품질을 낮추세요.';
          }
          
          alert('이미지 분석 실패: ' + errorMsg);
        } finally {
          this.isLoading = false;
        }
      },
      
      // OCR API 요청 시도 함수
      async tryOCRRequest(languageParam = 'kor') {
        try {
          const formData = new FormData();
          formData.append('apikey', this.apiKey);
          formData.append('language', languageParam);
          formData.append('isTable', 'true');
          formData.append('OCREngine', '2');
          formData.append('scale', 'true');
          formData.append('file', this.uploadedFile);
          
          console.log(`API 요청 시작 (언어: ${languageParam})...`);
          
          const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
          });
          
          console.log('API 응답 수신:', response.status);
          const data = await response.json();
          console.log('API 응답 데이터:', data);
          
          if (data.OCRExitCode === 1) {
            this.results = data.ParsedResults[0];
            
            // 인공지능 모델로 OCR 결과 분석
            this.loadingMessage = 'AI로 내용 분석 중...';
            await this.analyzeWithAI(this.results.ParsedText);
            
            return true;
          } else {
            const errorMessage = data.ErrorMessage || '이미지 분석 중 오류가 발생했습니다.';
            console.error('OCR API 오류:', errorMessage, data);
            return false;
          }
        } catch (error) {
          console.error(`OCR API 호출 오류 (${languageParam}):`, error);
          return false;
        }
      },
      
      // AI 모델로 분석
      async analyzeWithAI(text) {
        try {
          console.log('AI 분석 시작...');
          
          // Ollama API 호출
          const response = await fetch(this.ollamaApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: this.ollamaModel,
              prompt: text,
              stream: false
            })
          });
          
          if (!response.ok) {
            throw new Error(`API 응답 오류: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('AI 응답:', data);
          
          if (data && data.response) {
            try {
              // JSON 파싱
              const parsedResponse = JSON.parse(data.response);
              console.log('파싱된 AI 응답:', parsedResponse);
              
              if (parsedResponse.Place !== undefined && 
                  parsedResponse.Time !== undefined && 
                  parsedResponse.Price !== undefined) {
                this.parsedData = parsedResponse;
                this.analysisMethod = 'AI 모델 분석';
                console.log('AI 분석 성공!');
                return;
              } else {
                console.warn('AI 응답이 올바른 형식이 아닙니다:', parsedResponse);
              }
            } catch (e) {
              console.error('AI 응답을 JSON으로 파싱할 수 없습니다:', e, data.response);
            }
          }
          
          // AI 분석 실패시 기본 패턴 매칭 사용
          console.log('기본 패턴 매칭으로 대체');
          this.extractReceiptData(text);
          this.analysisMethod = '기본 패턴 매칭';
        } catch (error) {
          console.error('AI 분석 오류:', error);
          // 오류 발생 시 기본 패턴 매칭 사용
          this.extractReceiptData(text);
          this.analysisMethod = '기본 패턴 매칭 (AI 오류 발생)';
        }
      },
      
      // 영수증/결제내역 데이터 추출 (기본 패턴 분석)
      extractReceiptData(text) {
        if (!text) return;
        
        const lines = text.split('\n').filter(line => line.trim());
        
        // 결제 장소 추출 (첫 1-3줄 중 가장 긴 줄을 장소로 가정)
        const potentialPlaces = lines.slice(0, Math.min(3, lines.length));
        this.parsedData.Place = potentialPlaces.reduce(
          (longest, current) => current.length > longest.length ? current : longest, 
          ''
        ).trim();
        
        // 날짜 및 시간 패턴 찾기
        const datePattern = /\d{2,4}[-./]\d{1,2}[-./]\d{1,2}|\d{1,2}[-./]\d{1,2}[-./]\d{2,4}/;
        const timePattern = /\d{1,2}:\d{2}(:\d{2})?/;
        
        // 결제 시간 추출
        for (const line of lines) {
          // 명시적인 결제 시간 라벨 찾기
          const timeLabels = ['날짜', '시간', '결제시간', '거래일시', '거래일자', '일자', '일시'];
          const hasTimeLabel = timeLabels.some(label => line.includes(label));
          
          // 날짜 검색
          const dateMatch = line.match(datePattern);
          if (dateMatch) {
            let dateStr = dateMatch[0];
            
            // 시간도 찾아봄
            const timeMatch = line.match(timePattern);
            if (timeMatch) {
              dateStr += ' ' + timeMatch[0];
            }
            
            if (hasTimeLabel || !this.parsedData.Time) {
              this.parsedData.Time = dateStr.trim();
            }
          }
        }
        
        // 결제 금액 추출
        const totalPatterns = [
          /(합\s*계|총\s*액|결제\s*금액|결제액|Total|합계금액).{0,10}([\d,]+)/i,
          /([\d,]+)\s*원\s*(합\s*계|총\s*액|결제\s*금액)/i
        ];
        
        for (const line of lines) {
          for (const pattern of totalPatterns) {
            const match = line.match(pattern);
            if (match) {
              // 숫자만 추출하여 콤마 제거
              const priceStr = match[2] || match[1];
              const numericPrice = priceStr.replace(/[^\d]/g, '');
              if (numericPrice && (!this.parsedData.Price || parseInt(numericPrice) > this.parsedData.Price)) {
                this.parsedData.Price = parseInt(numericPrice);
              }
            }
          }
        }
      },
      
      // 클립보드에 복사
      copyToClipboard() {
        const textToCopy = this.activeTab === 'raw' 
          ? this.results.ParsedText 
          : JSON.stringify(this.parsedData, null, 2);
        
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            alert('클립보드에 복사되었습니다.');
          })
          .catch(err => {
            console.error('클립보드 복사 실패:', err);
            alert('클립보드 복사에 실패했습니다.');
          });
      }
    }
  }
  </script>
  
  <style scoped>
  .receipt-ocr-container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 25px;
    font-family: 'Nunito', 'Noto Sans KR', sans-serif;
  }
  
  .title {
    color: var(--primary);
    text-align: center;
    margin-bottom: 30px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--gray-700);
  }
  
  .api-key-input {
    display: flex;
    gap: 10px;
  }
  
  .api-key-input input {
    flex: 1;
    padding: 12px 15px;
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    font-size: 16px;
  }
  
  .api-info {
    font-size: 14px;
    color: var(--gray-600);
    margin-top: 10px;
  }
  
  .api-info a {
    color: var(--primary);
    text-decoration: none;
  }
  
  .api-key-display {
    background-color: var(--gray-100);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .btn-link {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    text-decoration: underline;
    font-size: 14px;
    padding: 0;
    margin-left: 10px;
  }
  
  .upload-section {
    margin-top: 30px;
  }
  
  .upload-container {
    border: 2px dashed var(--gray-300);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .active-dropzone {
    border-color: var(--primary);
    background-color: rgba(66, 153, 225, 0.05);
  }
  
  .upload-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .upload-icon {
    color: var(--primary);
    margin-bottom: 10px;
  }
  
  .preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .receipt-preview {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .preview-actions {
    display: flex;
    gap: 10px;
  }
  
  .btn {
    font-family: 'Nunito', 'Noto Sans KR', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .primary-btn {
    background-color: var(--logo-blue);
    color: white;
  }
  
  .primary-btn:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
  }
  
  .secondary-btn {
    background-color: var(--gray-200);
    color: var(--gray-700);
  }
  
  .secondary-btn:hover {
    background-color: var(--gray-300);
  }
  
  .cancel-btn {
    background-color: var(--logo-coral);
    color: white;
  }
  
  .cancel-btn:hover {
    background-color: #ff7b6b;
  }
  
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--gray-200);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .results-section {
    margin-top: 40px;
  }
  
  .results-section h3 {
    color: var(--gray-800);
    margin-bottom: 20px;
  }
  
  .container {
    background-color: var(--white);
    border-radius: 16px;
    box-shadow: 0 8px 16px var(--shadow);
    border: 1px solid var(--gray-200);
    overflow: hidden;
    margin-bottom: 25px;
  }
  
  .tab-header {
    display: flex;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .tab-btn {
    flex: 1;
    padding: 15px;
    background: none;
    border: none;
    font-size: 16px;
    font-weight: 600;
    color: var(--gray-600);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .tab-btn.active {
    color: var(--primary);
    border-bottom: 3px solid var(--primary);
  }
  
  .extracted-data {
    padding: 20px;
  }
  
  .data-card {
    background-color: var(--gray-100);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .data-card h4 {
    color: var(--primary);
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 18px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  table td {
    padding: 8px 0;
  }
  
  .label {
    font-weight: 600;
    color: var(--gray-700);
    width: 100px;
  }
  
  .data-correction {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--gray-200);
  }
  
  .correction-note {
    color: var(--gray-600);
    font-size: 14px;
    font-style: italic;
  }
  
  .analysis-method {
    color: var(--gray-600);
    font-size: 14px;
    margin-top: 10px;
  }
  
  .raw-text {
    padding: 20px;
  }
  
  .text-content {
    background-color: var(--gray-100);
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
  }
  
  .text-content pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
    color: var(--gray-800);
  }
  
  .action-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
  }
  
  @media (max-width: 768px) {
    .api-key-input {
      flex-direction: column;
    }
    
    .upload-container {
      padding: 20px;
    }
  }
  </style>