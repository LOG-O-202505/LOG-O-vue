<template>
  <div v-if="show" class="modal-overlay" @click="onCancel">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>일정 삭제 확인</h3>
      </div>
      <div class="modal-body">
        <p><strong>{{ placeName }}</strong>을(를) 삭제하시겠습니까?</p>
        <p class="warning-text">삭제된 일정은 복구할 수 없습니다.</p>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="onCancel">취소</button>
        <button class="delete-btn" @click="onConfirm">삭제</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  placeName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['confirm', 'cancel'])
/* eslint-enable no-undef */

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  padding: 0;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #4a5568;
  line-height: 1.5;
}

.warning-text {
  font-size: 0.9rem;
  color: #e53e3e;
}

.modal-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.delete-btn {
  padding: 8px 16px;
  border: none;
  background: #e53e3e;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #c53030;
}
</style> 