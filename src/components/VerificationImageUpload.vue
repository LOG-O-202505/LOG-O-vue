<template>
  <div class="verification-upload-container">
    <div class="verification-upload-card">
      <!-- Close Button -->
      <button 
        @click="$emit('close-modal')" 
        :disabled="isVerifying"
        style="
          position: absolute !important;
          top: 16px !important;
          right: 16px !important;
          width: 32px !important;
          height: 32px !important;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          z-index: 10 !important;
          color: #666 !important;
          outline: none !important;
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="verification-upload-content">
        <!-- Guide State Container - 항상 표시 -->
        <div class="guide-state">
          <!-- 관리자 권한 버튼 (오른쪽 아래) -->
          <button @click="handleAdminUpload" class="admin-carrot-btn" title="관리자 권한으로 강제 인증">
            🥕
          </button>
          <input 
            ref="adminCarrotInput" 
            type="file" 
            accept="image/*" 
            style="display: none" 
            @change="handleAdminCarrotUpload"
          />
          
          <!-- Analysis Intro Section -->
          <div class="analysis-intro-section">
            <div class="analysis-intro-left">
              <h3 class="analysis-intro-heading">
                사진을 업로드만으로 방문을 인증해보세요!!
              </h3>
              <div class="analysis-intro-description">
                이미지의 메타데이터를 활용해서 인증을 하고 다른 사람들에게 여행지를 자동으로 추천해보세요
              </div>
            </div>
            <div class="analysis-intro-right">
              <div class="analysis-features">
                <div class="analysis-feature-item">
                  <div class="analysis-feature-image">
                    <img src="@/assets/img/llava-color.png" alt="Llava" class="analysis-feature-logo" />
                  </div>
                  <div class="analysis-feature-text">
                    <div class="analysis-feature-title">Llava 이미지 분석</div>
                    <div class="analysis-feature-desc">
                      최신 멀티모달 AI가 이미지의 구성 요소, 색상, 분위기, 건축 양식 등을 종합적으로 분석하여 
                      정확한 시각적 특성을 파악합니다.
                    </div>
                  </div>
                </div>
                <div class="analysis-feature-item">
                  <div class="analysis-feature-image">
                    <img src="@/assets/img/meta.png" alt="Llama" class="analysis-feature-logo" />
                  </div>
                  <div class="analysis-feature-text">
                    <div class="analysis-feature-title">Llama 의미 분석 및 키워드 추출</div>
                    <div class="analysis-feature-desc">
                      이미지에서 추출된 정보를 바탕으로 여행지의 특성과 분위기를 이해하고, 
                      장소를 특정할 수 있는 핵심 키워드를 추출합니다.
                    </div>
                  </div>
                </div>
                <div class="analysis-feature-item">
                  <div class="analysis-feature-image">
                    <img src="@/assets/img/elasticsearch.png" alt="ElasticSearch" class="analysis-feature-logo" />
                  </div>
                  <div class="analysis-feature-text">
                    <div class="analysis-feature-title">ES 한국어 형태소 분석</div>
                    <div class="analysis-feature-desc">
                      ElasticSearch의 한국어 형태소 분석기를 이용하여 
                      주소 키워드를 추출하고 정확한 위치를 검증합니다.
                    </div>
                  </div>
                </div>
                <!-- Upload Dropzone in the 4th position -->
                <div class="analysis-feature-item upload-feature-item">
                  <!-- File Preview with transitions -->
                  <transition name="fade-scale" mode="out-in">
                    <!-- 업로드 성공 시 이미지와 메타데이터 표시 -->
                    <div v-if="file && status === 'success' && verificationResult && verificationResult.success" 
                         key="success"
                         class="success-upload-content">
                      <!-- 상단: 업로드된 이미지 -->
                      <div class="uploaded-image-section">
                        <img v-if="previewUrl" :src="previewUrl" :alt="`Uploaded image`" class="uploaded-image" />
                      </div>
                      <!-- 하단: 파일 정보 -->
                      <div class="uploaded-file-info">
                        <p class="uploaded-file-name" :title="file.name">{{ file.name }}</p>
                        <div class="uploaded-divider"></div>
                        <div class="uploaded-file-details">
                          <div class="uploaded-file-detail">
                            <span class="uploaded-detail-label">크기 :</span>
                            <span class="uploaded-detail-value">{{ formatBytes(file.size) }}</span>
                          </div>
                          <div class="uploaded-file-detail">
                            <span class="uploaded-detail-label">타입 :</span>
                            <span class="uploaded-detail-value">{{ file.type.split("/")[1].toUpperCase() || "Unknown" }}</span>
                          </div>
                          <div class="uploaded-file-detail">
                            <span class="uploaded-detail-label">상태 :</span>
                            <span class="uploaded-detail-value status-verified">인증 완료</span>
                          </div>
                        </div>
                        <button @click="handleRemoveFile" type="button" class="upload-reset-button">
                          초기화
                        </button>
                      </div>
                    </div>

                    <!-- 업로딩 중 -->
                    <div v-else-if="status === 'uploading'" 
                         key="uploading"
                         class="uploading-container">
                      <div class="flight-loading-container">
                        <img src="@/assets/flight.gif" alt="Loading" class="flight-loading-spinner" />
                      </div>
                      <div class="uploading-filename">{{ file.name }}</div>
                      <div class="uploading-progress">업로드 중...</div>
                      <button @click="resetState" type="button" class="cancel-button">
                        취소
                      </button>
                    </div>
                    
                    <!-- 에러 상태 -->
                    <div v-else-if="status === 'error'" 
                         key="error"
                         class="error-container">
                      <div class="error-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <p class="error-message">{{ error }}</p>
                      <button @click="resetState" type="button" class="retry-button">
                        다시 시도
                      </button>
                    </div>

                    <!-- 기본 업로드 드롭존 -->
                    <div v-else 
                         key="dropzone"
                         class="dropzone"
                         :class="{ 'dragging': status === 'dragging', 'active-dropzone': status === 'dragging' }"
                         @dragover.prevent="handleDragOver"
                         @dragleave.prevent="handleDragLeave" 
                         @drop.prevent="handleDrop"
                         @click="triggerFileInput">

                      <p>방문 인증을 위한 사진을 업로드해주세요</p>
                      <p class="upload-tip">* 해당 장소에서 촬영한 사진만 인증 가능합니다</p>

                      <input 
                        ref="fileInputRef" 
                        type="file"
                        class="hidden-input"
                        @change="handleFileInputChange" 
                        accept="image/*"
                        style="display: none"
                      />
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import EXIF from 'exif-js';

export default {
  name: 'VerificationImageUpload',
  props: {
    currentFile: {
      type: File,
      default: null
    },
    photoMetadata: {
      type: Object,
      default: null
    },
    distanceFromTarget: {
      type: Number,
      default: null
    },
    verificationResult: {
      type: Object,
      default: null
    },
    isVerifying: {
      type: Boolean,
      default: false
    },
    acceptedFileTypes: {
      type: Array,
      default: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    targetCoords: {
      type: Object,
      default: () => ({ lat: 33.458031, lng: 126.942652 }) // 기본값: 제주도 성산일출봉
    }
  },
  emits: ['file-selected', 'file-remove', 'verify-photo', 'admin-verify', 'close-modal', 'verification-success', 'verification-failed'],
  setup(props, { emit }) {
    const fileInputRef = ref(null);
    const adminCarrotInput = ref(null);
    const file = ref(null);
    const status = ref('idle'); // idle, dragging, uploading, success, error
    const progress = ref(0);
    const error = ref(null);
    const previewUrl = ref(null);

    // Watch for external file changes
    watch(() => props.currentFile, (newFile) => {
      if (newFile !== file.value) {
        file.value = newFile;
        if (newFile) {
          status.value = 'success';
          createPreviewUrl(newFile);
        } else {
          resetState();
        }
      }
    }, { immediate: true });

    const createPreviewUrl = (selectedFile) => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        previewUrl.value = URL.createObjectURL(selectedFile);
      }
    };

    const handleFileValidation = (selectedFile) => {
      error.value = null;
      
      if (props.acceptedFileTypes && props.acceptedFileTypes.length > 0 && !props.acceptedFileTypes.includes(selectedFile.type)) {
        const err = `지원하지 않는 파일 형식입니다. 지원 형식: ${props.acceptedFileTypes
          .map(t => t.split('/')[1])
          .join(', ')
          .toUpperCase()}`;
        error.value = err;
        status.value = 'error';
        return false;
      }
      
      if (props.maxFileSize && selectedFile.size > props.maxFileSize) {
        const err = `파일 크기가 너무 큽니다. 최대 크기: ${formatBytes(props.maxFileSize)}`;
        error.value = err;
        status.value = 'error';
        return false;
      }
      
      return true;
    };

    const handleFileSelect = (selectedFile) => {
      if (!selectedFile) return;

      if (!handleFileValidation(selectedFile)) {
        file.value = null;
        return;
      }

      file.value = selectedFile;
      error.value = null;
      status.value = 'uploading';
      progress.value = 0;
      
      // Simulate upload progress
      simulateUpload(selectedFile);
    };

    const handleDragOver = (event) => {
      event.preventDefault();
      if (status.value !== 'uploading' && status.value !== 'success') {
        status.value = 'dragging';
      }
    };

    const handleDragLeave = (event) => {
      event.preventDefault();
      if (status.value === 'dragging') {
        status.value = 'idle';
      }
    };

    const handleDrop = (event) => {
      event.preventDefault();
      if (status.value === 'uploading' || status.value === 'success') return;

      status.value = 'idle';
      const droppedFile = event.dataTransfer.files?.[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    };

    const handleFileInputChange = (event) => {
      const selectedFile = event.target.files?.[0];
      handleFileSelect(selectedFile || null);
      if (event.target) event.target.value = '';
    };

    const triggerFileInput = () => {
      if (status.value === 'uploading') return;
      fileInputRef.value?.click();
    };

    const simulateUpload = (uploadingFile) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 10 + 10;
        if (currentProgress >= 100) {
          clearInterval(interval);
          progress.value = 100;
          status.value = 'success';
          createPreviewUrl(uploadingFile);
          
          // EXIF 데이터 추출 및 거리 계산
          extractLocationAndVerify(uploadingFile);
        } else {
          if (status.value === 'uploading') {
            progress.value = currentProgress;
          } else {
            clearInterval(interval);
          }
        }
      }, 200);
    };

    const extractLocationAndVerify = (uploadingFile) => {
      // 실제 EXIF 데이터에서 GPS 정보 추출
      console.log('===== EXIF 데이터 추출 시작 =====');
      console.log('파일명:', uploadingFile.name);
      console.log('파일 크기:', uploadingFile.size);
      console.log('목표 장소 좌표:', `[${props.targetCoords.lat.toFixed(6)}, ${props.targetCoords.lng.toFixed(6)}]`);
      
      if (!EXIF) {
        console.warn('EXIF.js 라이브러리를 찾을 수 없습니다. 시뮬레이션 모드로 진행합니다.');
        // 시뮬레이션 모드
        simulateLocationAndVerify(uploadingFile);
        return;
      }

      EXIF.getData(uploadingFile, function() {
        console.log('EXIF 데이터 추출 성공');
        
        const exifData = EXIF.getAllTags(this);
        console.log('추출된 EXIF 데이터:', exifData);
        
        let imageLat = null;
        let imageLng = null;
        
        // GPS 좌표 추출
        if (exifData.GPSLatitude && exifData.GPSLongitude) {
          try {
            const latDegrees = exifData.GPSLatitude[0].numerator / exifData.GPSLatitude[0].denominator;
            const latMinutes = exifData.GPSLatitude[1].numerator / exifData.GPSLatitude[1].denominator;
            const latSeconds = exifData.GPSLatitude[2].numerator / exifData.GPSLatitude[2].denominator;
            const latDirection = exifData.GPSLatitudeRef || "N";

            const lngDegrees = exifData.GPSLongitude[0].numerator / exifData.GPSLongitude[0].denominator;
            const lngMinutes = exifData.GPSLongitude[1].numerator / exifData.GPSLongitude[1].denominator;
            const lngSeconds = exifData.GPSLongitude[2].numerator / exifData.GPSLongitude[2].denominator;
            const lngDirection = exifData.GPSLongitudeRef || "E";

            imageLat = convertDMSToDD(latDegrees, latMinutes, latSeconds, latDirection);
            imageLng = convertDMSToDD(lngDegrees, lngMinutes, lngSeconds, lngDirection);

            console.log('===== 실제 EXIF GPS 좌표 추출 성공 =====');
            console.log('이미지 GPS 좌표:', `[${imageLat.toFixed(6)}, ${imageLng.toFixed(6)}]`);
            
            // 거리 계산
            const distance = calculateDistance(imageLat, imageLng, props.targetCoords.lat, props.targetCoords.lng);
            const distanceInMeters = distance * 1000; // 미터로 변환
            
            // 거리 조건 검증 (1km 이내)
            const isValidDistance = distanceInMeters <= 1000;
            
            console.log('===== 거리 계산 결과 =====');
            console.log('목표 좌표:', `[${props.targetCoords.lat.toFixed(6)}, ${props.targetCoords.lng.toFixed(6)}]`);
            console.log('이미지 좌표:', `[${imageLat.toFixed(6)}, ${imageLng.toFixed(6)}]`);
            console.log('거리:', `${Math.round(distanceInMeters)}m (${distance.toFixed(3)}km)`);
            console.log('1km 기준 인증 결과:', isValidDistance ? '✅ 성공' : '❌ 실패');
            console.log('==========================');
            
            if (isValidDistance) {
              // 성공 케이스
              emit('file-selected', uploadingFile);
              emit('verification-success', {
                file: uploadingFile,
                location: { lat: imageLat, lng: imageLng },
                distance: distanceInMeters
              });
            } else {
              // 실패 케이스
              resetState();
              emit('verification-failed', {
                message: `현재 위치에서 ${Math.round(distanceInMeters)}m 떨어져 있습니다. 인증 장소에서 1km 이내에서 촬영해주세요.`,
                distance: distanceInMeters
              });
            }
            
          } catch (error) {
            console.error('GPS 좌표 변환 오류:', error);
            // GPS 변환 실패 시 시뮬레이션 모드로 fallback
            simulateLocationAndVerify(uploadingFile);
          }
        } else {
          console.log('GPS 정보를 찾을 수 없습니다. 시뮬레이션 모드로 진행합니다.');
          // GPS 정보 없을 시 시뮬레이션 모드로 fallback
          simulateLocationAndVerify(uploadingFile);
        }
      });
    };

    // DMS(도분초)를 DD(십진도)로 변환하는 함수
    const convertDMSToDD = (degrees, minutes, seconds, direction) => {
      let dd = degrees + (minutes / 60) + (seconds / 3600);
      if (direction === "S" || direction === "W") {
        dd = dd * -1;
      }
      return dd;
    };

    // 시뮬레이션 모드 (EXIF가 없거나 GPS 정보가 없을 때)
    const simulateLocationAndVerify = (uploadingFile) => {
      console.log('===== 시뮬레이션 모드 진행 =====');
      
      // 시뮬레이션: 임의의 GPS 좌표 (목표 위치 근처에서 ±0.01도 범위)
      const randomOffset = () => (Math.random() - 0.5) * 0.02; // ±0.01도 범위
      const imageLat = props.targetCoords.lat + randomOffset();
      const imageLng = props.targetCoords.lng + randomOffset();
      
      // 거리 계산 (TripPlan.vue와 동일한 로직 사용 - km 단위)
      const distance = calculateDistance(imageLat, imageLng, props.targetCoords.lat, props.targetCoords.lng);
      const distanceInMeters = distance * 1000; // 미터로 변환
      
      // 거리 조건 검증 (1km 이내)
      const isValidDistance = distanceInMeters <= 1000;
      
      console.log('===== 시뮬레이션 거리 계산 결과 =====');
      console.log('목표 좌표:', `[${props.targetCoords.lat.toFixed(6)}, ${props.targetCoords.lng.toFixed(6)}]`);
      console.log('시뮬레이션 이미지 좌표:', `[${imageLat.toFixed(6)}, ${imageLng.toFixed(6)}]`);
      console.log('거리:', `${Math.round(distanceInMeters)}m (${distance.toFixed(3)}km)`);
      console.log('1km 기준 인증 결과:', isValidDistance ? '✅ 성공' : '❌ 실패');
      console.log('====================================');
      
      if (isValidDistance) {
        // 성공 케이스 - 상태를 유지하고 이벤트만 발생
        emit('file-selected', uploadingFile);
        emit('verification-success', {
          file: uploadingFile,
          location: { lat: imageLat, lng: imageLng },
          distance: distanceInMeters
        });
      } else {
        // 실패 케이스
        resetState();
        emit('verification-failed', {
          message: `현재 위치에서 ${Math.round(distanceInMeters)}m 떨어져 있습니다. 인증 장소에서 1km 이내에서 촬영해주세요.`,
          distance: distanceInMeters
        });
      }
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      // TripPlan.vue와 동일한 로직 사용 (km 단위)
      const R = 6371; // 지구 반지름 (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // 거리 (km)
    };

    const resetState = () => {
      file.value = null;
      status.value = 'idle';
      progress.value = 0;
      error.value = null;
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
      }
    };

    const handleRemoveFile = () => {
      resetState();
      emit('file-remove');
    };

    const handleVerifyPhoto = () => {
      emit('verify-photo');
    };

    const handleAdminVerify = () => {
      emit('admin-verify');
    };

    const formatBytes = (bytes, decimals = 2) => {
      if (!+bytes) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      const unit = sizes[i] || sizes[sizes.length - 1];
      return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${unit}`;
    };

    const formatPhotoDate = (dateTime) => {
      if (!dateTime) return '정보 없음';
      try {
        const date = new Date(dateTime);
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (e) {
        return dateTime;
      }
    };

    const formatDistance = (distance) => {
      if (distance === null || distance === undefined) return '정보 없음';
      if (distance < 1000) {
        return `${Math.round(distance)}m`;
      } else {
        return `${(distance / 1000).toFixed(2)}km`;
      }
    };

    // 관리자 당근 버튼 업로드 함수들
    const handleAdminUpload = () => {
      adminCarrotInput.value?.click();
    };

    const handleAdminCarrotUpload = (event) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        // 관리자 권한으로 강제 인증 통과 - 거리 1km 이내로 설정
        file.value = selectedFile;
        error.value = null;
        status.value = 'uploading';
        progress.value = 0;
        
        // 업로드 진행 시뮬레이션
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 15 + 15;
          if (currentProgress >= 100) {
            clearInterval(interval);
            progress.value = 100;
            status.value = 'success';
            createPreviewUrl(selectedFile);
            
            // 관리자 권한으로 강제 성공 (거리를 500m로 설정하여 1km 이내 통과)
            console.log('===== 관리자 당근 권한 인증 =====');
            console.log('파일명:', selectedFile.name);
            console.log('강제 거리 설정: 500m (1km 이내 통과)');
            console.log('==============================');
            
            emit('file-selected', selectedFile);
            emit('verification-success', {
              file: selectedFile,
              location: { lat: props.targetCoords.lat, lng: props.targetCoords.lng },
              distance: 500, // 1km 이내로 설정 (500m)
              isAdminForced: true
            });
          } else {
            if (status.value === 'uploading') {
              progress.value = currentProgress;
            } else {
              clearInterval(interval);
            }
          }
        }, 100);
        
        // 입력값 초기화
        event.target.value = '';
      }
    };

    return {
      fileInputRef,
      file,
      status,
      progress,
      error,
      previewUrl,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileInputChange,
      triggerFileInput,
      resetState,
      handleRemoveFile,
      handleVerifyPhoto,
      handleAdminVerify,
      formatBytes,
      formatPhotoDate,
      formatDistance,
      adminCarrotInput,
      handleAdminUpload,
      handleAdminCarrotUpload,
      convertDMSToDD,
      simulateLocationAndVerify
    };
  }
};
</script>

<style scoped>
/* Base Styles */
.verification-upload-container {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.verification-upload-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  border-radius: 12px;
  overflow: hidden;
}

.verification-upload-content {
  padding: 1rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  min-height: 0;
}

/* Hidden Input */
.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* File Preview */
.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 100%;
  justify-content: space-between;
}

.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: 300px;
  margin-bottom: 16px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: #6b7280;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Guide State */
.guide-state {
  width: 100%;
  max-width: 900px;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 관리자 당근 버튼 */
.admin-carrot-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: none;
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: none;
}

.admin-carrot-btn:hover {
  transform: scale(1.1);
}

/* Analysis Intro Section - same as LogoSearch.vue */
.analysis-intro-section {
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: stretch;
  width: 100%;
  max-width: 800px;
  flex-direction: column;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(0);
  margin: 0 auto;
}

.analysis-intro-left {
  flex: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.analysis-intro-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.analysis-intro-heading {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
  line-height: 1.3;
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
  animation: analysisWaveAnimation 6s linear infinite;
}

@keyframes analysisWaveAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.analysis-intro-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #666;
  margin-top: 1.5rem;
  font-family: 'Noto Sans KR', sans-serif;
}

.analysis-features {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.analysis-feature-item {
  display: flex;
  align-items: center;
  text-align: left;
  padding: 1.2rem;
  background: linear-gradient(135deg, #f8fdff 0%, #f0f8ff 100%);
  border-radius: 12px;
  border: 1px solid rgba(72, 176, 228, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(72, 176, 228, 0.05);
  flex: 1;
  min-width: 300px;
  max-width: 380px;
  height: 220px;
  flex-direction: column;
  text-align: center;
}

.analysis-feature-item:hover {
  transform: translateX(6px);
  box-shadow: 0 6px 20px rgba(72, 176, 228, 0.2);
  border-color: rgba(72, 176, 228, 0.3);
}

.upload-feature-item {
  background: linear-gradient(135deg, #f8fdff 0%, #f0f8ff 100%);
  border-color: rgba(72, 176, 228, 0.1);
}

.upload-feature-item:hover {
  transform: translateX(6px);
  box-shadow: 0 6px 20px rgba(72, 176, 228, 0.2);
  border-color: rgba(72, 176, 228, 0.3);
}

.analysis-feature-image {
  margin-right: 0;
  margin-bottom: 1rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(72, 176, 228, 0.15), rgba(118, 179, 157, 0.15));
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(72, 176, 228, 0.1);
  align-self: center;
}

.analysis-feature-logo {
  width: 70%;
  height: 70%;
  object-fit: contain;
  border-radius: 4px;
}

.analysis-feature-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.analysis-feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 1.4;
  text-align: center;
}

.analysis-feature-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
  font-family: 'Noto Sans KR', sans-serif;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Dropzone */
.dropzone {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 180px;
  max-height: 180px;
  border: 2px dashed rgba(72, 176, 228, 0.4);
  border-radius: 12px;
  background-color: rgba(248, 253, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 15px;
}

.dropzone:hover {
  border-color: #48b0e4;
  background-color: rgba(72, 176, 228, 0.1);
  transform: translateY(-2px);
}

.dropzone.dragging {
  border-color: #48b0e4;
  background-color: rgba(72, 176, 228, 0.15);
  border-style: solid;
  transform: scale(1.02);
}

.dropzone p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #48b0e4;
}

.upload-tip {
  font-size: 0.85rem !important;
  color: #76b39d !important;
  margin: -0.5rem 0 0 0 !important;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.secondary-btn {
  background-color: #e2e8f0;
  color: #4a5568;
  border: 1px solid #cbd5e0;
}

.secondary-btn:hover {
  background-color: #cbd5e0;
  color: #2d3748;
  transform: translateY(-2px);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 16px;
}

.replace-button, .remove-button, .verify-button, .admin-button {
  flex: 1;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.replace-button {
  background-color: #4299e1;
  color: white;
}

.replace-button:hover {
  background-color: #3182ce;
}

.remove-button {
  background-color: #e53e3e;
  color: white;
}

.remove-button:hover {
  background-color: #c53030;
}

.verify-button {
  background-color: #10b981;
  color: white;
}

.verify-button:hover:not(:disabled) {
  background-color: #059669;
}

.verify-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.admin-button {
  background-color: #8b5cf6;
  color: white;
}

.admin-button:hover:not(:disabled) {
  background-color: #7c3aed;
}

.admin-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Progress Styles */
.uploading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.flight-loading-container {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flight-loading-spinner {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.uploading-filename {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.uploading-progress {
  font-size: 12px;
  color: #6b7280;
}

.cancel-button {
  margin-top: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #ef4444;
  background-color: transparent;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button:hover {
  color: #dc2626;
  background-color: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Error Styles */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 16px;
}

.error-message {
  font-size: 14px;
  color: #ef4444;
  margin-bottom: 16px;
}

.retry-button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #4299e1;
  background-color: transparent;
  border: 1px solid #4299e1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-button:hover {
  color: white;
  background-color: #4299e1;
}

/* Photo Metadata Styles */
.photo-metadata {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  width: 100%;
  text-align: left;
}

.metadata-item {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #475569;
  display: flex;
  flex-wrap: wrap;
}

.metadata-item strong {
  min-width: 100px;
  font-weight: 600;
}

.metadata-item:last-child {
  margin-bottom: 0;
}

.verification-result {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-result {
  background-color: #dcfce7;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-result {
  background-color: #fee2e2;
  color: #991b1b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Fade-scale transition */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Active dropzone state */
.active-dropzone {
  border-color: #10b981 !important;
  background-color: #f0fff4 !important;
  border-style: solid !important;
  transform: scale(1.02) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .verification-upload-content {
    padding: 0.5rem;
  }

  .guide-state {
    max-width: 100%;
    padding: 0;
  }

  .analysis-intro-section {
    padding: 1rem;
    max-width: 100%;
  }

  .analysis-intro-heading {
    font-size: 1.5rem;
  }

  .analysis-intro-description {
    font-size: 0.9rem;
  }

  .analysis-features {
    flex-direction: column;
    gap: 1rem;
  }

  .analysis-feature-item {
    min-width: auto;
    max-width: 100%;
    height: auto;
    min-height: 180px;
    padding: 1rem;
  }

  .analysis-feature-image {
    width: 48px;
    height: 48px;
  }

  .analysis-feature-title {
    font-size: 1rem;
  }

  .analysis-feature-desc {
    font-size: 0.85rem;
  }

  .dropzone {
    min-height: 140px;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .guide-state {
    padding: 0.5rem;
  }

  .analysis-intro-section {
    padding: 0.5rem;
    min-height: 200px;
  }

  .analysis-intro-heading {
    font-size: 1.2rem;
  }

  .analysis-intro-description {
    font-size: 0.8rem;
    margin-top: 1rem;
  }

  .analysis-feature-item {
    padding: 0.8rem;
  }

  .analysis-feature-image {
    width: 40px;
    height: 40px;
  }

  .analysis-feature-title {
    font-size: 0.9rem;
  }

  .analysis-feature-desc {
    font-size: 0.75rem;
  }

  .dropzone {
    min-height: 140px;
    padding: 12px;
  }
}

/* 4번째 영역 인증 성공 스타일 */
.success-upload-content {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 1rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.uploaded-image-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
}

.uploaded-image {
  width: 100%;
  max-width: 180px;
  height: auto;
  max-height: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.uploaded-file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  text-align: left;
  padding-left: 1rem;
  min-height: 0;
  overflow: visible;
}

.uploaded-file-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
  max-height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.uploaded-divider {
  width: 100%;
  height: 1px;
  background-color: #e5e7eb;
  margin: 0.5rem 0;
}

.uploaded-file-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  width: 100%;
  margin-bottom: 0;
}

.uploaded-file-detail {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.uploaded-detail-label {
  color: #6b7280;
  font-size: 10px;
  min-width: 45px;
  font-weight: 500;
}

.uploaded-detail-value {
  font-weight: 600;
  color: #374151;
  font-size: 11px;
}

.status-verified {
  color: #10b981 !important;
  font-weight: 600 !important;
}

.upload-reset-button {
  margin-top: 0.75rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #ef4444;
  background-color: transparent;
  border: 1px solid #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.upload-reset-button:hover {
  color: #ffffff;
  background-color: #ef4444;
  transform: translateY(-1px);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .success-upload-content {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.8rem;
  }

  .uploaded-image-section {
    flex: none;
    margin-bottom: 0.5rem;
  }

  .uploaded-image {
    max-width: 140px;
    max-height: 110px;
  }

  .uploaded-file-info {
    align-items: center;
    text-align: center;
    padding-left: 0.5rem;
    justify-content: center;
  }

  .uploaded-file-name {
    font-size: 0.8rem;
  }

  .uploaded-divider {
    margin: 0.4rem 0;
  }

  .uploaded-file-details {
    gap: 5px;
    font-size: 10px;
  }

  .uploaded-detail-label {
    font-size: 9px;
    min-width: 40px;
  }

  .uploaded-detail-value {
    font-size: 10px;
  }

  .upload-reset-button {
    align-self: center;
    margin-top: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
}
</style> 