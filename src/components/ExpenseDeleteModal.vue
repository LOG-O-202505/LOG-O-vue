<template>
  <div v-if="show" class="modal-overlay" @click="onCancel">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>지출 내역 삭제 확인</h3>
      </div>
      <div class="modal-body">
        <div class="expense-info">
          <div class="expense-detail">
            <span class="expense-description">{{ expenseDescription }}</span>
            <span class="expense-amount">{{ formatAmount(expenseAmount) }}원</span>
          </div>
          <div class="expense-date" v-if="expenseDate">
            {{ formatDate(expenseDate) }}
          </div>
        </div>
        <p class="warning-text">삭제된 지출 내역은 복구할 수 없습니다.</p>
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
  expenseDescription: {
    type: String,
    default: ''
  },
  expenseAmount: {
    type: Number,
    default: 0
  },
  expenseDate: {
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

// 금액 포맷팅
const formatAmount = (amount) => {
  return Number(amount).toLocaleString()
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

.expense-info {
  background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.expense-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.expense-description {
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.expense-amount {
  font-weight: 700;
  color: #e53e3e;
  font-size: 1.1rem;
}

.expense-date {
  font-size: 0.9rem;
  color: #718096;
  text-align: center;
}

.warning-text {
  font-size: 0.9rem;
  color: #e53e3e;
  margin: 0;
  text-align: center;
  font-weight: 500;
}

.modal-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.cancel-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.delete-btn {
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  box-shadow: 0 2px 4px rgba(229, 62, 62, 0.3);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #c53030 0%, #9c2626 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(229, 62, 62, 0.4);
}
</style> 