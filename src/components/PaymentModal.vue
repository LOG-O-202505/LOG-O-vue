<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
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
        <!-- 추가 방법 선택 -->
        <div v-if="step === 'select'" class="selection-step">
          <h3>지출 추가 방법을 선택하세요</h3>
          <div class="selection-buttons">
            <button class="selection-btn manual" @click="selectMethod('manual')">
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
            <button class="selection-btn receipt" @click="selectMethod('receipt')">
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

        <!-- 수동 입력 -->
        <div v-else-if="step === 'manual'" class="manual-step">
          <div class="back-btn-container">
            <button class="back-btn" @click="goBack">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              방법 선택으로 돌아가기
            </button>
          </div>
          
          <h3>지출 정보 입력</h3>
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
                >
              </div>
            </div>

            <div class="form-group">
              <label for="date">날짜</label>
              <input 
                type="date" 
                id="date" 
                v-model="manualData.date"
                required
              >
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

        <!-- 영수증 업로드 -->
        <div v-else-if="step === 'receipt'" class="receipt-step">
          <div class="back-btn-container">
            <button class="back-btn" @click="goBack">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              방법 선택으로 돌아가기
            </button>
          </div>

          <h3>영수증 사진 업로드</h3>
          
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
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              <p>영수증 사진을 업로드하세요</p>
              <span>클릭하거나 파일을 드래그하세요</span>
            </div>
            
            <div v-else class="preview-container">
              <img :src="receiptPreview" alt="영수증 미리보기" class="receipt-preview">
              <button class="remove-image-btn" @click.stop="clearReceiptImage">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="receiptPreview" class="receipt-actions">
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

        <!-- 영수증 분석 결과 -->
        <div v-else-if="step === 'result'" class="result-step">
          <div class="back-btn-container">
            <button class="back-btn" @click="goBackToReceipt">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              사진 업로드로 돌아가기
            </button>
          </div>

          <h3>분석 결과 확인</h3>
          <p class="result-desc">분석된 정보를 확인하고 수정해주세요.</p>
          
          <form @submit.prevent="addReceiptExpense" class="result-form">
            <div class="form-group">
              <label for="parsed-description">지출 항목</label>
              <input 
                type="text" 
                id="parsed-description" 
                v-model="parsedData.description" 
                placeholder="분석된 지출 항목"
                required
              >
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="parsed-amount">금액</label>
                <input 
                  type="number" 
                  id="parsed-amount" 
                  v-model="parsedData.amount" 
                  placeholder="0"
                  min="0"
                  required
                >
              </div>
              <div class="form-group">
                <label for="parsed-time">시간</label>
                <input 
                  type="time" 
                  id="parsed-time" 
                  v-model="parsedData.time"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="parsed-date">날짜</label>
              <input 
                type="date" 
                id="parsed-date" 
                v-model="parsedData.date"
                required
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="add-btn" :disabled="!isParsedFormValid">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                추가하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Toast Message -->
  <ToastMessage 
    v-model:show="showToast"
    :message="toastMessage"
    :type="toastType"
    :duration="3000"
  />
</template>

<script>
import { ref, computed, watch } from 'vue';
import { ImgToPayment, addTravelPayment } from '@/services/api';
import ToastMessage from './ToastMessage.vue';

export default {
  name: 'PaymentModal',
  components: {
    ToastMessage,
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    travelId: {
      type: Number,
      default: 1
    }
  },
  emits: ['close', 'add-expense', 'payment-added'],
  setup(props, { emit }) {
    const step = ref('select');
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

    // 폼 유효성 검사
    const isManualFormValid = computed(() => {
      return manualData.value.description && 
             manualData.value.amount && 
             manualData.value.date;
    });

    const isParsedFormValid = computed(() => {
      return parsedData.value.description && 
             parsedData.value.amount && 
             parsedData.value.date;
    });

    // 모달 닫기
    const closeModal = () => {
      emit('close');
      resetModal();
    };

    // 모달 리셋
    const resetModal = () => {
      step.value = 'select';
      clearReceiptImage();
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
    };

    // 뒤로 가기
    const goBack = () => {
      step.value = 'select';
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

    // 수동 지출 추가
    const addManualExpense = async () => {
      try {
        const paymentData = {
          tuid: props.travelId,
          cost: Number(manualData.value.amount),
          history: manualData.value.description,
          payment_time: formatToISO(manualData.value.date, manualData.value.time)
        };

        // 서버에 데이터 저장
        await addTravelPayment(paymentData);

        // 로컬 데이터도 부모 컴포넌트에 전달
        const expense = {
          id: Date.now(),
          description: manualData.value.description,
          amount: Number(manualData.value.amount),
          time: manualData.value.time || '',
          date: manualData.value.date
        };

        emit('add-expense', expense);
        emit('payment-added'); // 데이터 갱신 이벤트
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
          payment_time: formatToISO(parsedData.value.date, parsedData.value.time)
        };

        // 서버에 데이터 저장
        await addTravelPayment(paymentData);

        // 로컬 데이터도 부모 컴포넌트에 전달
        const expense = {
          id: Date.now(),
          description: parsedData.value.description,
          amount: Number(parsedData.value.amount),
          time: parsedData.value.time || '',
          date: parsedData.value.date
        };

        emit('add-expense', expense);
        emit('payment-added'); // 데이터 갱신 이벤트
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
          let addedCount = 0;

          for (const paymentData of paymentDataArray) {
            if (paymentData && paymentData.Place && paymentData.Time && paymentData.Price !== undefined) {
              try {
                // 서버에 데이터 저장
                const serverPaymentData = {
                  tuid: props.travelId,
                  cost: Number(paymentData.Price) || 0,
                  history: paymentData.Place,
                  payment_time: formatTimeToISO(paymentData.Time)
                };

                await addTravelPayment(serverPaymentData);

                // 로컬 데이터도 부모 컴포넌트에 전달
                const expense = {
                  id: Date.now() + addedCount,
                  description: paymentData.Place,
                  amount: Number(paymentData.Price) || 0,
                  time: extractTimeFromString(paymentData.Time),
                  date: extractDateFromString(paymentData.Time)
                };

                emit('add-expense', expense);
                addedCount++;
              } catch (error) {
                console.error(`영수증 항목 저장 실패:`, error);
              }
            }
          }

          if (addedCount > 0) {
            showToastMessage(`총 ${addedCount}건의 결제 내역이 추가되었습니다!`, 'success');
            emit('payment-added'); // 데이터 갱신 이벤트
            closeModal();
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

    // 시간 문자열을 ISO 형식으로 변환하는 도우미 함수
    const formatTimeToISO = (timeStr) => {
      if (!timeStr) return new Date().toISOString();

      let dateObj = new Date();
      
      // 날짜 추출 시도
      const dateFormats = [
        /(\d{4})[-./](\d{1,2})[-./](\d{1,2})/,  // YYYY-MM-DD
        /(\d{1,2})[-./](\d{1,2})[-./](\d{4})/,  // DD-MM-YYYY
        /(\d{1,2})[-./](\d{1,2})[-./](\d{2})/   // DD-MM-YY
      ];

      for (let i = 0; i < dateFormats.length; i++) {
        const match = timeStr.match(dateFormats[i]);
        if (match) {
          try {
            if (i === 0) {
              dateObj = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
            } else if (i === 1) {
              dateObj = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
            } else if (i === 2) {
              const year = parseInt(match[3]) + (parseInt(match[3]) < 50 ? 2000 : 1900);
              dateObj = new Date(year, parseInt(match[2]) - 1, parseInt(match[1]));
            }
          } catch (e) {
            console.error('날짜 파싱 오류:', e);
          }
          break;
        }
      }

      // 시간 추출 시도
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (timeMatch) {
        try {
          dateObj.setHours(parseInt(timeMatch[1]));
          dateObj.setMinutes(parseInt(timeMatch[2]));
          if (timeMatch[3]) {
            dateObj.setSeconds(parseInt(timeMatch[3]));
          }
        } catch (e) {
          console.error('시간 파싱 오류:', e);
        }
      }

      return dateObj.toISOString();
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

    // 시간 문자열에서 날짜만 추출
    const extractDateFromString = (timeStr) => {
      if (!timeStr) return new Date().toISOString().split('T')[0];

      const dateFormats = [
        /(\d{4})[-./](\d{1,2})[-./](\d{1,2})/,  // YYYY-MM-DD
        /(\d{1,2})[-./](\d{1,2})[-./](\d{4})/,  // DD-MM-YYYY
        /(\d{1,2})[-./](\d{1,2})[-./](\d{2})/   // DD-MM-YY
      ];

      for (let i = 0; i < dateFormats.length; i++) {
        const match = timeStr.match(dateFormats[i]);
        if (match) {
          try {
            let dateObj;
            if (i === 0) {
              dateObj = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
            } else if (i === 1) {
              dateObj = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
            } else if (i === 2) {
              const year = parseInt(match[3]) + (parseInt(match[3]) < 50 ? 2000 : 1900);
              dateObj = new Date(year, parseInt(match[2]) - 1, parseInt(match[1]));
            }
            return dateObj.toISOString().split('T')[0];
          } catch (e) {
            console.error('날짜 파싱 오류:', e);
          }
        }
      }

      return new Date().toISOString().split('T')[0];
    };

    // 모달이 닫힐 때 리셋
    watch(() => props.show, (newShow) => {
      if (!newShow) {
        resetModal();
      }
    });

    return {
      step,
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
      goBack,
      goBackToReceipt,
      addManualExpense,
      addReceiptExpense,
      triggerFileInput,
      handleFileInput,
      onDragOver,
      onDragLeave,
      onDrop,
      clearReceiptImage,
      analyzeReceipt
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 24px;
}

/* 선택 단계 */
.selection-step h3 {
  margin: 0 0 24px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.selection-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.selection-btn {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.selection-btn:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.selection-btn.manual:hover {
  border-color: #10b981;
}

.selection-btn.receipt:hover {
  border-color: #f59e0b;
}

.btn-icon {
  margin-bottom: 16px;
  color: #6b7280;
}

.selection-btn.manual .btn-icon {
  color: #10b981;
}

.selection-btn.receipt .btn-icon {
  color: #f59e0b;
}

.btn-text h4 {
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.btn-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

/* 뒤로 가기 버튼 */
.back-btn-container {
  margin-bottom: 24px;
}

.back-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #374151;
}

/* 수동 입력 단계 */
.manual-step h3,
.receipt-step h3,
.result-step h3 {
  margin: 0 0 24px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.manual-form,
.result-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  margin-top: 8px;
}

.add-btn {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: #2563eb;
}

.add-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* 영수증 업로드 단계 */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.upload-area:hover,
.upload-area.dragging {
  border-color: #3b82f6;
  background: #f8fafc;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
}

.upload-placeholder svg {
  color: #9ca3af;
}

.upload-placeholder p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.upload-placeholder span {
  font-size: 0.875rem;
}

.preview-container {
  position: relative;
  display: inline-block;
}

.receipt-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: white;
  color: #374151;
}

.receipt-actions {
  display: flex;
  justify-content: center;
}

.analyze-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.analyze-btn:hover:not(:disabled) {
  background: #d97706;
}

.analyze-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.analyzing-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 결과 단계 */
.result-desc {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 0.875rem;
}

/* 반응형 */
@media (max-width: 640px) {
  .modal-container {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }
  
  .selection-buttons {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style> 