<template>
  <div v-if="show" class="modal-wrapper">
    <!-- 메인 모달 오버레이 -->
    <div class="modal-overlay" @click="closeModal">
      <!-- 모달 컨테이너 그룹 -->
      <div class="modal-container-group" :class="{ 'expanded': step !== 'main' }">
        <!-- 메인 모달 -->
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>지출 내역 추가</h2>
            <button class="close-btn" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-content">
            <!-- 기술 설명 섹션 -->
            <div class="tech-intro-section">
              <div class="tech-intro-left">
                <h3 class="tech-intro-heading">
                  <span class="gradient-text">영수증 분석</span>으로 간편하게 지출을 관리하세요!
                </h3>
                <div class="tech-intro-description">
                  최신 AI 기술을 활용하여 영수증을 자동으로 분석하고 지출 내역을 손쉽게 추가해보세요 !
                </div>
              </div>
              <div class="tech-intro-right">
                <div class="tech-features">
                  <div class="tech-feature-item">
                    <div class="tech-feature-image">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tech-feature-logo">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                    <div class="tech-feature-text">
                      <div class="tech-feature-title">Google Vision API OCR</div>
                      <div class="tech-feature-desc">
                        구글의 강력한 광학 문자 인식 기술로 영수증과 결제 내역의 텍스트를 정확하게 추출합니다.
                      </div>
                    </div>
                  </div>
                  <div class="tech-feature-item">
                    <div class="tech-feature-image">
                      <img src="@/assets/img/meta.png" alt="Llama" class="tech-feature-logo" />
                    </div>
                    <div class="tech-feature-text">
                      <div class="tech-feature-title">Llama 결제 내역 분석</div>
                      <div class="tech-feature-desc">
                        Meta의 Llama AI가 추출된 텍스트를 분석하여 상호명, 금액, 시간 등을 자동으로 구분합니다.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 날짜 선택 섹션 -->
            <div class="date-select-section">
              <h3 class="section-title">지출이 발생한 날짜를 선택하세요</h3>
              <div class="date-selection-grid">
                <div 
                  v-for="(root, index) in travelRoots" 
                  :key="root.truid || index"
                  class="date-card"
                  :class="{ 'selected': selectedDate === root.travelDate }"
                  @click="selectDate(root.travelDate)"
                >
                  <div class="date-card-header">
                    <span class="day-number">DAY {{ root.day }}</span>
                  </div>
                  <div class="date-card-content">
                    <div class="date-text">{{ formatTravelDateFromString(root.travelDate) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 사이드 모달 (날짜 선택 후 오른쪽에 나타남) -->
        <div v-if="step !== 'main'" class="side-modal-container" @click.stop>
          <div class="side-modal-header">
            <h3 v-if="step === 'select'">지출 추가 방법 선택</h3>
            <h3 v-else-if="step === 'manual'">수동 지출 입력</h3>
            <h3 v-else-if="step === 'receipt'">영수증 사진 업로드</h3>
            <h3 v-else-if="step === 'receipt-result'">영수증 분석 결과</h3>
            <button class="close-btn" @click="goBackToDateSelect">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>
          
          <div class="side-modal-content">
            <!-- 선택된 날짜 정보 -->
            <div class="selected-date-info">
              <h4>선택된 날짜: {{ formatSelectedDate(selectedDate) }}</h4>
            </div>
            
            <!-- 방법 선택 단계 -->
            <div v-if="step === 'select'" class="method-selection-section">
              <div class="method-selection-buttons">
                <button class="method-selection-btn manual" @click="selectMethod('manual')">
                  <div class="btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                  <div class="btn-text">
                    <h4>수동 추가</h4>
                    <p>직접 입력하여 추가</p>
                  </div>
                </button>
                <button class="method-selection-btn receipt" @click="selectMethod('receipt')">
                  <div class="btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                  </div>
                  <div class="btn-text">
                    <h4>영수증 분석</h4>
                    <p>사진으로 자동 입력</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- 수동 입력 단계 -->
            <div v-else-if="step === 'manual'" class="manual-input-section">
              <button class="back-btn" @click="goBack">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                방법 선택으로 돌아가기
              </button>
              
              <form @submit.prevent="addManualExpense" class="manual-form">
                <div class="form-group">
                  <label for="description">지출 항목</label>
                  <input 
                    type="text" 
                    id="description" 
                    v-model="manualData.description" 
                    placeholder="예: 점심식사, 교통비 등"
                    required
                  >
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="amount">금액</label>
                    <input 
                      type="number" 
                      id="amount" 
                      v-model="manualData.amount" 
                      placeholder="0"
                      min="0"
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="time">시간</label>
                    <input 
                      type="time" 
                      id="time" 
                      v-model="manualData.time"
                      placeholder="선택사항"
                    >
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="add-btn" :disabled="!isManualFormValid">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    추가하기
                  </button>
                </div>
              </form>
            </div>

            <!-- 영수증 업로드 단계 -->
            <div v-else-if="step === 'receipt'" class="receipt-input-section">
              <button class="back-btn" @click="goBack">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                방법 선택으로 돌아가기
              </button>
              
              <!-- 업로드 영역 -->
              <div 
                class="upload-area" 
                :class="{ 'dragging': isDragging }"
                @dragover.prevent="onDragOver"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onDrop"
                @click="triggerFileInput"
              >
                <input 
                  type="file" 
                  ref="fileInput" 
                  @change="handleFileInput" 
                  accept="image/*" 
                  style="display: none;"
                >
                
                <div v-if="!receiptPreview" class="upload-placeholder">
                  <p class="upload-main-text">영수증 사진을 업로드하세요</p>
                  <span class="upload-sub-text">클릭하거나 파일을 드래그하세요</span>
                </div>
                
                <div v-else class="preview-container">
                  <img :src="receiptPreview" alt="영수증 미리보기" class="receipt-preview">
                </div>
              </div>

              <div v-if="receiptPreview" class="receipt-actions">
                <button 
                  class="reset-btn" 
                  @click="clearReceiptImage"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                  초기화
                </button>
                <button 
                  class="analyze-btn" 
                  @click="analyzeReceipt" 
                  :disabled="isAnalyzing"
                >
                  <div v-if="isAnalyzing" class="analyzing-spinner"></div>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                  </svg>
                  {{ isAnalyzing ? '분석중...' : '영수증 분석' }}
                </button>
              </div>
            </div>

            <!-- 영수증 분석 결과 단계 -->
            <div v-else-if="step === 'receipt-result'" class="receipt-result-section">
              <button class="back-btn" @click="goBackToReceipt">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                영수증 업로드로 돌아가기
              </button>
              
              <!-- 분석 결과 표시 -->
              <div class="analysis-results">
                <h4 class="results-title">분석된 지출 내역</h4>
                <div v-if="analysisResults && analysisResults.length > 0" class="results-list">
                  <div 
                    v-for="(result, index) in analysisResults" 
                    :key="index"
                    class="result-item"
                  >
                    <div class="result-header">
                      <span class="item-number">{{ index + 1 }}번 항목</span>
                    </div>
                    <div class="result-content">
                      <div class="result-field">
                        <label>상호명</label>
                        <span>{{ result.Place || '정보 없음' }}</span>
                      </div>
                      <div class="result-field">
                        <label>금액</label>
                        <span>{{ result.Price ? Number(result.Price).toLocaleString() + '원' : '정보 없음' }}</span>
                      </div>
                      <div class="result-field">
                        <label>시간</label>
                        <span>{{ extractTimeFromString(result.Time) || '정보 없음' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-results">
                  <p>분석된 지출 내역이 없습니다.</p>
                </div>
              </div>

              <div class="result-actions">
                <button 
                  class="save-btn" 
                  @click="saveAnalysisResults" 
                  :disabled="!analysisResults || analysisResults.length === 0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ToastMessage 컴포넌트 -->
    <ToastMessage 
      v-model:show="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
    />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { ImgToPayment, addTravelPayment } from '@/services/api';
import ToastMessage from '@/components/ToastMessage.vue';

export default {
  name: 'PaymentModal',
  components: {
    ToastMessage
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    travelId: {
      type: Number,
      default: 1
    },
    travelRoots: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'add-expense', 'payment-added'],
  setup(props, { emit }) {
    const step = ref('main');
    const selectedDate = ref(null);
    const fileInput = ref(null);
    const isDragging = ref(false);
    const receiptPreview = ref(null);
    const receiptFile = ref(null);
    const isAnalyzing = ref(false);

    // Toast 관련 변수
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastType = ref('success');

    // 수동 입력 데이터
    const manualData = ref({
      description: '',
      amount: null,
      time: '',
      date: new Date().toISOString().split('T')[0]
    });

    // 분석된 데이터
    const parsedData = ref({
      description: '',
      amount: null,
      time: '',
      date: new Date().toISOString().split('T')[0]
    });

    // 영수증 분석 결과
    const analysisResults = ref([]);

    // 폼 유효성 검사
    const isManualFormValid = computed(() => {
      return manualData.value.description && 
             manualData.value.amount && 
             selectedDate.value;
    });

    const isParsedFormValid = computed(() => {
      return parsedData.value.description && 
             parsedData.value.amount && 
             selectedDate.value;
    });

    // 모달 닫기
    const closeModal = () => {
      emit('close');
      resetModal();
    };

    // 모달 리셋
    const resetModal = () => {
      step.value = 'main';
      selectedDate.value = null;
      clearReceiptImage();
      analysisResults.value = [];
      manualData.value = {
        description: '',
        amount: null,
        time: '',
        date: new Date().toISOString().split('T')[0]
      };
      parsedData.value = {
        description: '',
        amount: null,
        time: '',
        date: new Date().toISOString().split('T')[0]
      };
    };

    // Toast 메시지 표시 함수
    const showToastMessage = (message, type = 'success') => {
      toastMessage.value = message;
      toastType.value = type;
      showToast.value = true;
    };

    // 방법 선택
    const selectMethod = (method) => {
      step.value = method;
      
      // 선택된 날짜를 기본값으로 설정
      if (selectedDate.value) {
        manualData.value.date = selectedDate.value;
        parsedData.value.date = selectedDate.value;
      }
    };

    // 날짜 선택
    const selectDate = (date) => {
      selectedDate.value = date;
      step.value = 'select'; // 날짜 선택 후 방법 선택으로 이동
    };

    // 뒤로 가기
    const goBack = () => {
      step.value = 'select';
    };

    // 날짜 선택으로 돌아가기
    const goBackToDateSelect = () => {
      step.value = 'main';
      selectedDate.value = null;
    };

    const goBackToReceipt = () => {
      step.value = 'receipt';
    };

    // 날짜와 시간을 ISO 8601 형식으로 변환하는 함수
    const formatToISO = (date, time) => {
      if (!date) return new Date().toISOString();
      
      let isoString = date;
      if (time) {
        isoString += `T${time}:00.000Z`;
      } else {
        isoString += 'T00:00:00.000Z';
      }
      
      return isoString;
    };

    // 날짜 배열을 YYYY-MM-DD 형식으로 변환하는 함수
    const formatDateArray = (dateArray) => {
      if (!dateArray || dateArray.length < 3) return '';
      const [year, month, day] = dateArray;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // 여행 날짜 포맷팅 (한국어) - 배열 형태
    const formatTravelDate = (dateArray) => {
      if (!dateArray || dateArray.length < 3) return '';
      const [year, month, day] = dateArray;
      return `${year}년 ${month}월 ${day}일`;
    };

    // 문자열 형태의 날짜를 한국어로 포맷팅
    const formatTravelDateFromString = (dateString) => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) {
          console.error('Invalid date string:', dateString);
          return dateString;
        }
        
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      } catch (error) {
        console.error('날짜 포맷팅 오류:', error);
        return dateString;
      }
    };

    // 선택된 날짜 포맷팅
    const formatSelectedDate = (dateString) => {
      if (!dateString) return '';
      
      // 날짜 형식 확인 및 변환
      let date;
      if (typeof dateString === 'string') {
        // YYYY-MM-DD 형식인지 확인
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = new Date(dateString + 'T00:00:00');
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return dateString; // 원본 문자열 반환
      }
      
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    // 수동 지출 추가
    const addManualExpense = async () => {
      try {
        const paymentData = {
          tuid: props.travelId,
          cost: Number(manualData.value.amount),
          history: manualData.value.description,
          payment_time: formatToISO(selectedDate.value, manualData.value.time)
        };

        // 서버에 데이터 저장
        await addTravelPayment(paymentData);

        // 로컬 데이터도 부모 컴포넌트에 전달
        const expense = {
          id: Date.now(),
          description: manualData.value.description,
          amount: Number(manualData.value.amount),
          time: manualData.value.time || '',
          date: selectedDate.value
        };

        emit('add-expense', expense);
        emit('payment-added'); // 데이터 갱신 이벤트
        showToastMessage('지출 내역이 성공적으로 추가되었습니다!', 'success');
        closeModal();
      } catch (error) {
        console.error('수동 지출 추가 오류:', error);
        showToastMessage('지출 내역 추가 중 오류가 발생했습니다: ' + error.message, 'error');
      }
    };

    // 영수증 분석 지출 추가
    const addReceiptExpense = async () => {
      try {
        const paymentData = {
          tuid: props.travelId,
          cost: Number(parsedData.value.amount),
          history: parsedData.value.description,
          payment_time: formatToISO(selectedDate.value, parsedData.value.time)
        };

        // 서버에 데이터 저장
        await addTravelPayment(paymentData);

        // 로컬 데이터도 부모 컴포넌트에 전달
        const expense = {
          id: Date.now(),
          description: parsedData.value.description,
          amount: Number(parsedData.value.amount),
          time: parsedData.value.time || '',
          date: selectedDate.value
        };

        emit('add-expense', expense);
        emit('payment-added'); // 데이터 갱신 이벤트
        showToastMessage('지출 내역이 성공적으로 추가되었습니다!', 'success');
        closeModal();
      } catch (error) {
        console.error('영수증 지출 추가 오류:', error);
        showToastMessage('지출 내역 추가 중 오류가 발생했습니다: ' + error.message, 'error');
      }
    };

    // 파일 입력 트리거
    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    // 파일 입력 처리
    const handleFileInput = (event) => {
      const file = event.target.files[0];
      if (file) {
        processFile(file);
      }
    };

    // 드래그 이벤트
    const onDragOver = () => {
      isDragging.value = true;
    };

    const onDragLeave = () => {
      isDragging.value = false;
    };

    const onDrop = (event) => {
      isDragging.value = false;
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processFile(file);
      }
    };

    // 파일 처리
    const processFile = (file) => {
      if (!file.type.startsWith('image/')) {
        showToastMessage('이미지 파일만 업로드 가능합니다.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 1200;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          receiptPreview.value = canvas.toDataURL(file.type);

          canvas.toBlob((blob) => {
            receiptFile.value = new File([blob], file.name, { type: file.type });
          }, file.type);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    // 영수증 이미지 삭제
    const clearReceiptImage = () => {
      receiptFile.value = null;
      receiptPreview.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    // 영수증 분석
    const analyzeReceipt = async () => {
      if (!receiptFile.value) {
        showToastMessage('영수증 파일을 선택해주세요.', 'error');
        return;
      }

      isAnalyzing.value = true;

      try {
        const paymentDataArray = await ImgToPayment(receiptFile.value);

        if (paymentDataArray && paymentDataArray.length > 0) {
          // 유효한 데이터만 필터링
          const validResults = paymentDataArray.filter(paymentData => 
            paymentData && paymentData.Place && paymentData.Time && paymentData.Price !== undefined
          );

          if (validResults.length > 0) {
            analysisResults.value = validResults;
            step.value = 'receipt-result'; // 분석 결과 화면으로 이동
            showToastMessage(`총 ${validResults.length}건의 결제 내역을 분석했습니다.`, 'success');
          } else {
            showToastMessage('영수증에서 유효한 결제 내역을 찾을 수 없습니다.', 'error');
          }
        } else {
          showToastMessage('영수증 분석에 실패했습니다. 수동으로 입력해주세요.', 'error');
        }
      } catch (error) {
        console.error('영수증 분석 오류:', error);
        showToastMessage(`영수증 분석 중 오류가 발생했습니다: ${error.message || '서버 오류'}`, 'error');
      } finally {
        isAnalyzing.value = false;
      }
    };

    // 영수증 분석 결과 저장
    const saveAnalysisResults = async () => {
      if (!analysisResults.value || analysisResults.value.length === 0) {
        showToastMessage('저장할 데이터가 없습니다.', 'error');
        return;
      }

      try {
        let addedCount = 0;

        for (const paymentData of analysisResults.value) {
          try {
            // 영수증에서 시간만 추출하고 선택된 날짜와 조합
            const extractedTime = extractTimeFromString(paymentData.Time);
            
            // 서버에 데이터 저장
            const serverPaymentData = {
              tuid: props.travelId,
              cost: Number(paymentData.Price) || 0,
              history: paymentData.Place,
              payment_time: formatToISO(selectedDate.value, extractedTime)
            };

            await addTravelPayment(serverPaymentData);

            // 로컬 데이터도 부모 컴포넌트에 전달
            const expense = {
              id: Date.now() + addedCount,
              description: paymentData.Place,
              amount: Number(paymentData.Price) || 0,
              time: extractedTime,
              date: selectedDate.value
            };

            emit('add-expense', expense);
            addedCount++;
          } catch (error) {
            console.error(`영수증 항목 저장 실패:`, error);
          }
        }

        if (addedCount > 0) {
          showToastMessage(`총 ${addedCount}건의 결제 내역이 추가되었습니다!`, 'success');
          emit('payment-added'); // 데이터 갱신 이벤트
          closeModal();
        } else {
          showToastMessage('결제 내역 저장 중 오류가 발생했습니다.', 'error');
        }
      } catch (error) {
        console.error('영수증 분석 결과 저장 오류:', error);
        showToastMessage(`저장 중 오류가 발생했습니다: ${error.message || '서버 오류'}`, 'error');
      }
    };

    // 시간 문자열에서 시간만 추출
    const extractTimeFromString = (timeStr) => {
      if (!timeStr) return '';
      
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2].padStart(2, '0')}`;
      }
      
      return '';
    };

    // 모달이 닫힐 때 리셋
    watch(() => props.show, (newShow) => {
      if (!newShow) {
        resetModal();
      }
    });

    return {
      step,
      selectedDate,
      fileInput,
      isDragging,
      receiptPreview,
      receiptFile,
      isAnalyzing,
      manualData,
      parsedData,
      isManualFormValid,
      isParsedFormValid,
      showToast,
      toastMessage,
      toastType,
      closeModal,
      selectMethod,
      selectDate,
      goBack,
      goBackToDateSelect,
      goBackToReceipt,
      addManualExpense,
      addReceiptExpense,
      triggerFileInput,
      handleFileInput,
      onDragOver,
      onDragLeave,
      onDrop,
      clearReceiptImage,
      analyzeReceipt,
      extractTimeFromString,
      formatToISO,
      formatDateArray,
      formatTravelDate,
      formatTravelDateFromString,
      formatSelectedDate,
      analysisResults,
      saveAnalysisResults
    };
  }
};
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: all 0.3s ease;
}

.modal-container-group {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: stretch;
  transition: all 0.3s ease;
  position: relative;
}

.modal-container-group:not(.expanded) {
  max-width: 800px;
}

.modal-container-group.expanded {
  max-width: 1300px;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;
}

.modal-container.shifted-left {
  transform: translateX(-15%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 32px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
  transform: scale(1.05);
}

.modal-content {
  padding: 32px;
}

/* 기술 설명 섹션 */
.tech-intro-section {
  margin-bottom: 48px;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: stretch;
  width: 100%;
  max-width: 800px;
  flex-direction: column;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(0);
  margin: 0 auto 48px auto;
}

.tech-intro-left {
  flex: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tech-intro-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tech-intro-heading {
  margin: 0 0 16px;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  font-family: 'Noto Sans KR', sans-serif;
  background: linear-gradient(270deg,
      #48b0e4 0%,
      #76b39d 15%,
      #3a9cd1 25%,
      #48b0e4 35%,
      #48b0e4 65%,
      #76b39d 75%,
      #3a9cd1 85%,
      #48b0e4 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: techWaveAnimation 6s linear infinite;
}

@keyframes techWaveAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-text {
  background: inherit;
  -webkit-background-clip: inherit;
  -webkit-text-fill-color: inherit;
  background-clip: inherit;
  font-weight: 800;
}

.tech-intro-description {
  margin: 0;
  font-size: 1rem;
  color: #666;
  margin-top: 1.5rem;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 1.7;
  max-width: 600px;
  margin: 1.5rem auto 0 auto;
}

.tech-features {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tech-feature-item {
  display: flex;
  align-items: center;
  text-align: left;
  padding: 1.2rem;
  background: linear-gradient(135deg, #f8fdff 0%, #f0f8ff 100%);
  border-radius: 12px;
  border: 1px solid rgba(72, 176, 228, 0.1);
  transition: all 0.3s ease;
  flex: 1;
  min-width: 300px;
  max-width: 380px;
  height: 120px;
  gap: 1rem;
}

.tech-feature-item:hover {
  transform: translateX(6px);
  border-color: rgba(72, 176, 228, 0.3);
}

.tech-feature-image {
  margin-right: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(72, 176, 228, 0.15), rgba(118, 179, 157, 0.15));
  border-radius: 50%;
  overflow: hidden;
}

.tech-feature-logo {
  width: 70%;
  height: 70%;
  object-fit: contain;
  border-radius: 4px;
  color: #48b0e4;
}

.tech-feature-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tech-feature-title {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 1.4;
}

.tech-feature-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 날짜 선택 섹션 */
.date-select-section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 32px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.date-selection-grid {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 15px;
  padding-top: 15px;
  margin-top: 16px;
  scroll-behavior: smooth;
}

.date-selection-grid::-webkit-scrollbar {
  height: 6px;
}

.date-selection-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.date-selection-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 3px;
}

.date-selection-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.date-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-width: 180px;
  flex-shrink: 0;
}

.date-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.date-card:hover::before,
.date-card.selected::before {
  opacity: 1;
}

.date-card:hover,
.date-card.selected {
  border-color: #3b82f6;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
}

.date-card-header {
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.day-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.date-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.date-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* 사이드 모달 */
.side-modal-container {
  background: white;
  border-radius: 24px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease-out;
  flex-shrink: 0;
}

.side-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 32px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.side-modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.side-modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.selected-date-info {
  background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 24px;
  margin: 24px 32px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.selected-date-info h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.method-selection-section {
  flex: 1;
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
}

.method-selection-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.method-selection-btn {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  text-align: left;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.method-selection-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.method-selection-btn:hover::before {
  opacity: 1;
}

.method-selection-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.method-selection-btn.manual:hover {
  border-color: #10b981;
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.2);
}

.method-selection-btn.receipt:hover {
  border-color: #f59e0b;
  box-shadow: 0 12px 24px rgba(245, 158, 11, 0.2);
}

.btn-icon {
  color: #6b7280;
  transition: all 0.3s;
  flex-shrink: 0;
}

.method-selection-btn.manual .btn-icon {
  color: #10b981;
}

.method-selection-btn.receipt .btn-icon {
  color: #f59e0b;
}

.btn-text h4 {
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.btn-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

/* 수동 입력 및 영수증 업로드 섹션 */
.manual-input-section,
.receipt-input-section {
  flex: 1;
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
}

.back-btn {
  background: none;
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 24px;
  align-self: flex-start;
}

.back-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.manual-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-sizing: border-box;
  background: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: auto;
  padding-top: 32px;
}

.add-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.add-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 업로드 영역 */
.receipt-input-section {
  flex: 1;
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 24px;
  background: linear-gradient(145deg, #fafafa 0%, #ffffff 100%);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.upload-area:hover,
.upload-area.dragging {
  border-color: #3b82f6;
  background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
  transform: translateY(-2px);
}

.upload-placeholder p {
  margin: 16px 0 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.upload-placeholder span {
  font-size: 0.875rem;
  color: #6b7280;
}

.preview-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.receipt-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.receipt-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 24px;
}

.reset-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

.analyze-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.analyze-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.analyzing-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 반응형 */
@media (max-width: 1024px) {
  .modal-container-group.expanded {
    max-width: 95%;
  }
  
  .modal-container {
    width: 600px;
  }
  
  .side-modal-container {
    width: 400px;
  }
  
  .date-card {
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .modal-container-group {
    flex-direction: column;
    max-width: 95%;
    gap: 1rem;
  }
  
  .modal-container-group.expanded {
    max-width: 95%;
  }
  
  .modal-container {
    width: 100%;
  }
  
  .side-modal-container {
    width: 100%;
    max-height: 60vh;
  }
  
  .date-card {
    min-width: 140px;
  }
  
  .tech-intro-section {
    padding: 1rem;
    max-width: 100%;
  }
  
  .tech-intro-heading {
    font-size: 1.5rem;
  }
  
  .tech-intro-description {
    font-size: 0.9rem;
  }
  
  .tech-features {
    flex-direction: column;
    gap: 1rem;
  }
  
  .tech-feature-item {
    min-width: auto;
    max-width: 100%;
    height: auto;
    min-height: 100px;
    padding: 1rem;
  }
  
  .tech-feature-image {
    width: 48px;
    height: 48px;
  }
  
  .tech-feature-title {
    font-size: 1rem;
  }
  
  .tech-feature-desc {
    font-size: 0.8rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .method-selection-buttons {
    gap: 16px;
  }
  
  .method-selection-btn {
    padding: 24px 20px;
  }
  
  .side-modal-header {
    padding: 20px;
  }
  
  .selected-date-info {
    margin: 16px 20px;
    padding: 16px;
  }
  
  .method-selection-section,
  .manual-input-section,
  .receipt-input-section {
    padding: 0 20px 20px;
  }
  
  .upload-area {
    padding: 32px 16px;
    min-height: 150px;
  }
  
  .upload-main-text {
    font-size: 1.1rem;
  }
}

/* 영수증 분석 결과 섹션 */
.receipt-result-section {
  flex: 1;
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
}

.analysis-results {
  flex: 1;
  margin-bottom: 24px;
}

.results-title {
  margin: 0 0 24px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.result-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
}

.result-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.item-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  padding: 4px 12px;
  border-radius: 20px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.result-field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 60px;
}

.result-field span {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.no-results {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.no-results p {
  margin: 0;
  font-size: 1rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 24px;
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style> 