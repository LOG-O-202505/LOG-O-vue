<template>
  <div class="file-upload-container">
    <div class="file-upload-card">
      <div class="file-upload-content">
        <div class="gradient-background"></div>
        <div class="relative-content">
          <!-- File Preview -->
          <transition name="fade-scale" mode="out-in">
            <div v-if="file && (status === 'success' || status !== 'uploading')" 
                 key="preview" 
                 class="file-preview">
              <div v-if="previewUrl" class="preview-image-container">
                <img :src="previewUrl" :alt="`Preview of ${file.name}`" class="preview-image" />
              </div>
              <div v-else class="file-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div class="file-info-container">
                <p class="file-name" :title="file.name">{{ file.name }}</p>
                <div class="file-details">
                  <div class="file-detail">
                    <span class="detail-label">Size</span>
                    <span class="detail-value">{{ formatBytes(file.size) }}</span>
                  </div>
                  <div class="file-detail">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">{{ file.type.split("/")[1].toUpperCase() || "Unknown" }}</span>
                  </div>
                  <div class="file-detail">
                    <span class="detail-label">Modified</span>
                    <span class="detail-value">{{ new Date(file.lastModified).toLocaleDateString() }}</span>
                  </div>
                  <div class="file-detail">
                    <span class="detail-label">Status</span>
                    <span class="detail-value status-ready">Ready</span>
                  </div>
                </div>
              </div>
              <div class="button-group">
                <button @click="triggerFileInput" type="button" class="replace-button">
                  파일 변경하기
                </button>
                <button @click="handleRemoveFile" type="button" class="remove-button">
                  파일 삭제하기
                </button>
                <button 
                  @click="isAnalyzing ? handleAnalyzeCancel() : handleAnalyzeStart()" 
                  type="button" 
                  class="analyze-start-button"
                  :class="{ 'analyzing': isAnalyzing }"
                >
                  {{ isAnalyzing ? '분석 취소하기' : '이미지 분석 시작하기' }}
                </button>
              </div>
            </div>

            <!-- Dropzone -->
            <div v-else-if="status === 'idle' || status === 'dragging'" 
                 key="dropzone" 
                 class="dropzone"
                 :class="{ 'dragging': status === 'dragging' }"
                 @dragover.prevent="handleDragOver"
                 @dragleave.prevent="handleDragLeave"
                 @drop.prevent="handleDrop"
                 @click="triggerFileInput"
                 @keydown="handleKeyDown">
              <div class="dropzone-background"></div>
              <div class="upload-icon" :class="{ 'dragging': status === 'dragging' }">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <p class="dropzone-text">
                <span class="highlight">Click to upload</span> or <span class="highlight">drag and drop</span>
              </p>
              <p class="file-types">
                {{ acceptedTypesText }}
                {{ maxFileSize ? ` (Max ${formatBytes(maxFileSize)})` : '' }}
              </p>
              <input
                ref="fileInputRef"
                type="file"
                class="hidden-input"
                @change="handleFileInputChange"
                :accept="acceptedFileTypes ? acceptedFileTypes.join(',') : undefined"
                aria-label="File input"
              />
            </div>

            <!-- Uploading -->
            <div v-else-if="status === 'uploading' && file" 
                 key="uploading" 
                 class="uploading-container">
              <div class="progress-container">
                <svg class="progress-circle" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" class="progress-background"></circle>
                  <circle cx="18" cy="18" r="16" class="progress-indicator" 
                          :style="{ 'stroke-dashoffset': 100 - progress }"></circle>
                </svg>
                <div class="file-icon-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
              </div>
              <p class="uploading-filename" :title="file.name">{{ file.name }}</p>
              <p class="uploading-progress">Uploading... {{ Math.round(progress) }}%</p>
              <button
                @click="resetState"
                type="button"
                class="cancel-button"
                aria-label="Cancel upload"
              >
                Cancel
              </button>
            </div>

            <!-- Success -->
            <div v-else-if="status === 'success' && file" 
                 key="success" 
                 class="success-container">
              <div class="success-icon-container">
                <div class="success-glow"></div>
                <div class="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              </div>
              <h3 class="success-title">Upload Successful!</h3>
              <p class="success-filename" :title="file.name">
                {{ file.name }} ({{ formatBytes(file.size) }})
              </p>
              <button
                @click="resetState"
                type="button"
                class="upload-another-button"
                aria-label="Upload another file"
              >
                Upload Another File
              </button>
            </div>

            <!-- Error -->
            <div v-else-if="status === 'error'" 
                 key="error" 
                 class="error-container">
              <div class="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <p class="error-title">Upload Failed</p>
              <p class="error-message">{{ error || "An unknown error occurred." }}</p>
              <button
                @click="resetState"
                type="button"
                class="try-again-button"
                aria-label="Try uploading again"
              >
                Try Again
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
  onUploadSuccess: Function,
  onUploadError: Function,
  acceptedFileTypes: Array,
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024 // Default 5MB
  },
  currentFile: {
    type: Object,
    default: null
  },
  onFileRemove: Function,
  isAnalyzing: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['upload-success', 'upload-error', 'file-remove', 'analyze-start', 'analyze-cancel']);

// State
const file = ref(props.currentFile);
const status = ref('idle');
const progress = ref(0);
const error = ref(null);
const previewUrl = ref(null);
const fileInputRef = ref(null);

// Computed
const acceptedTypesText = computed(() => {
  if (props.acceptedFileTypes && props.acceptedFileTypes.length > 0) {
    return `Accepted: ${props.acceptedFileTypes
      .map(t => t.split('/')[1])
      .join(', ')
      .toUpperCase()}`;
  }
  return 'SVG, PNG, JPG or GIF';
});

// Watch for file changes to create preview URL
watch(file, (newFile) => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  
  if (newFile?.type?.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(newFile);
  }
}, { immediate: true });

// Methods
const handleFileValidation = (selectedFile) => {
  error.value = null; // Reset error before validation
  
  if (props.acceptedFileTypes && props.acceptedFileTypes.length > 0 && !props.acceptedFileTypes.includes(selectedFile.type)) {
    const err = `Invalid file type. Accepted: ${props.acceptedFileTypes
      .map(t => t.split('/')[1])
      .join(', ')
      .toUpperCase()}`;
    error.value = err;
    status.value = 'error';
    if (props.onUploadError) props.onUploadError(err);
    emit('upload-error', err);
    return false;
  }
  
  if (props.maxFileSize && selectedFile.size > props.maxFileSize) {
    const err = `File size exceeds the limit of ${formatBytes(props.maxFileSize)}.`;
    error.value = err;
    status.value = 'error';
    if (props.onUploadError) props.onUploadError(err);
    emit('upload-error', err);
    return false;
  }
  
  return true;
};

const handleFileSelect = (selectedFile) => {
  if (!selectedFile) return;

  if (!handleFileValidation(selectedFile)) {
    file.value = null; // Clear invalid file
    return;
  }

  file.value = selectedFile;
  error.value = null;
  status.value = 'uploading';
  progress.value = 0;
  // Simulate upload
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

const handleKeyDown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    triggerFileInput();
  }
};

const handleFileInputChange = (event) => {
  const selectedFile = event.target.files?.[0];
  handleFileSelect(selectedFile || null);
  // Reset input value to allow selecting the same file again
  if (event.target) event.target.value = '';
};

const triggerFileInput = () => {
  if (status.value === 'uploading' || status.value === 'success') return;
  fileInputRef.value?.click();
};

const simulateUpload = (uploadingFile) => {
  let currentProgress = 0;
  const interval = setInterval(() => {
    currentProgress += Math.random() * 10 + 10; // Simulate progress increments
    if (currentProgress >= 100) {
      clearInterval(interval);
      progress.value = 100;
      status.value = 'success';
      if (props.onUploadSuccess) {
        props.onUploadSuccess(uploadingFile);
      }
      emit('upload-success', uploadingFile);
    } else {
      // Check if still in uploading state before updating progress
      if (status.value === 'uploading') {
        progress.value = currentProgress;
      } else {
        // If status changed (e.g., user clicked reset), stop the simulation
        clearInterval(interval);
      }
    }
  }, 200); // Adjust interval for simulation speed
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
  if (props.onFileRemove) props.onFileRemove();
  emit('file-remove');
};

const handleAnalyzeStart = () => {
  if (file.value) {
    emit('analyze-start', file.value);
  }
};

const handleAnalyzeCancel = () => {
  emit('analyze-cancel');
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
</script>

<style scoped>
/* Base Styles */
.file-upload-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.file-upload-card {
  width: 100%;
  max-width: 500px;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.file-upload-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}

.gradient-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(255, 255, 255, 0) 50%, rgba(56, 189, 248, 0.05) 100%);
  pointer-events: none;
}

.relative-content {
  position: relative;
  z-index: 10;
  width: 100%;
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

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* File Preview */
.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  animation: fadeIn 0.3s ease-out;
}

.preview-image-container {
  position: relative;
  width: 320px;
  height: 320px;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
  animation: rotateIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #7c3aed;
}

.file-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.file-info-container {
  width: 320px;
  max-width: 320px;
  background-color: rgba(249, 250, 251, 0.5);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  backdrop-filter: blur(4px);
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 12px;
}

.file-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  font-weight: 500;
  color: #374151;
}

.status-ready {
  color: #10b981;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  margin-top: 16px;
}

.replace-button {
  width: 100%;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(124, 58, 237, 0.3);
  position: relative;
  overflow: hidden;
}

.replace-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.replace-button:hover::before {
  left: 100%;
}

.replace-button:hover {
  background: linear-gradient(135deg, #6d28d9, #5b21b6);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
}

.remove-button {
  width: 100%;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 242, 242, 0.8));
  border: 2px solid rgba(239, 68, 68, 0.2);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.15);
  position: relative;
  overflow: hidden;
}

.remove-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.remove-button:hover::before {
  left: 100%;
}

.remove-button:hover {
  color: white;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.analyze-start-button {
  width: 100%;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #76b39d, #48b0e4);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(118, 179, 157, 0.3);
  position: relative;
  overflow: hidden;
}

.analyze-start-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.analyze-start-button:hover::before {
  left: 100%;
}

.analyze-start-button:hover {
  background: linear-gradient(135deg, #67a58d, #3a9cd1);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(118, 179, 157, 0.4);
}

.analyze-start-button.analyzing {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.3);
}

.analyze-start-button.analyzing:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Dropzone */
.dropzone {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: all 0.5s ease-in-out;
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.dropzone:hover {
  border-color: #7c3aed;
  background-color: rgba(124, 58, 237, 0.05);
}

.dropzone.dragging {
  border-color: #7c3aed;
  background-color: rgba(124, 58, 237, 0.1);
  transform: scale(1.02);
}

.dropzone-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.7s;
}

.dropzone:hover .dropzone-background {
  opacity: 1;
  background: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05), transparent 70%);
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #9ca3af;
  transition: all 0.5s ease-out;
}

.dropzone:hover .upload-icon {
  color: #7c3aed;
  transform: translateY(-2px);
}

.upload-icon.dragging {
  color: #7c3aed;
  animation: float 1s ease-in-out infinite alternate;
}

.dropzone-text {
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
  transition: all 0.5s;
}

.highlight {
  font-weight: 600;
  color: #7c3aed;
  transition: color 0.5s;
}

.dropzone:hover .highlight {
  color: #6d28d9;
}

.file-types {
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.5s;
}

.dropzone:hover .file-types {
  color: #6b7280;
}

/* Uploading */
.uploading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  animation: fadeIn 0.3s ease-out;
}

.progress-container {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  animation: spin 2s linear infinite;
}

.progress-background {
  fill: none;
  stroke: #f3f4f6;
  stroke-width: 2.5;
}

.progress-indicator {
  fill: none;
  stroke: #7c3aed;
  stroke-width: 2.5;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  transition: stroke-dashoffset 0.5s ease-out;
}

.file-icon-center {
  position: absolute;
  color: #7c3aed;
  animation: scaleIn 0.3s ease-out 0.2s both;
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

/* Success */
.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.success-icon-container {
  position: relative;
  margin-bottom: 16px;
}

.success-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-color: rgba(16, 185, 129, 0.2);
  filter: blur(16px);
  animation: pulse 2s ease-out infinite;
}

.success-icon {
  position: relative;
  z-index: 10;
  color: #10b981;
  filter: drop-shadow(0 4px 6px rgba(16, 185, 129, 0.3));
  animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.success-filename {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 16px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-another-button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: #7c3aed;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(124, 58, 237, 0.2);
}

.upload-another-button:hover {
  background-color: #6d28d9;
}

/* Error */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #ef4444;
  animation: shakeIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.error-icon {
  margin-bottom: 12px;
  animation: shake 0.5s ease-in-out;
}

.error-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.error-message {
  font-size: 12px;
  margin-bottom: 16px;
  max-width: 320px;
}

.try-again-button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background-color: rgba(243, 244, 246, 0.8);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(4px);
}

.try-again-button:hover {
  background-color: rgba(229, 231, 235, 0.8);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes rotateIn {
  from {
    transform: rotate(-10deg) scale(0.9);
  }
  to {
    transform: rotate(0) scale(1);
  }
}

@keyframes float {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-5px);
  }
}

@keyframes spin {
  from {
    transform: rotate(-90deg);
  }
  to {
    transform: rotate(270deg);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.5);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  60% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

@keyframes shakeIn {
  0% {
    transform: scale(0.8) rotate(-10deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0);
  }
  20%, 60% {
    transform: rotate(-10deg);
  }
  40%, 80% {
    transform: rotate(10deg);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .file-upload-card {
    background-color: #1f2937;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .gradient-background {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(31, 41, 55, 0) 50%, rgba(56, 189, 248, 0.1) 100%);
  }
  
  .file-title, .uploading-filename, .success-title, .file-name {
    color: #f3f4f6;
  }
  
  .detail-value {
    color: #d1d5db;
  }
  
  .detail-label, .file-types, .uploading-progress {
    color: #9ca3af;
  }
  
  .file-info-container {
    background-color: rgba(31, 41, 55, 0.5);
  }
  
  .dropzone {
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .dropzone:hover {
    background-color: rgba(124, 58, 237, 0.1);
  }
  
  .dropzone-text {
    color: #d1d5db;
  }
  
  .progress-background {
    stroke: #374151;
  }
  
  .try-again-button {
    color: #e5e7eb;
    background-color: rgba(55, 65, 81, 0.8);
  }
  
  .try-again-button:hover {
    background-color: rgba(75, 85, 99, 0.8);
  }
  
  .success-filename {
    color: #9ca3af;
  }
}
</style>