<template>
  <div v-if="visible" :class="['toast-message', toastTypeClass]" @click="hideToast">
    <span class="toast-icon">{{ icon }}</span>
    <span class="toast-text">{{ message }}</span>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';

export default {
  name: 'ToastMessage',
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'success', // 'success', 'error', 'processing'
    },
    duration: {
      type: Number,
      default: 3000,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:show'],
  setup(props, { emit }) {
    const visible = ref(props.show);
    let timer = null;

    const icon = computed(() => {
      switch (props.type) {
        case 'success':
          return '✅';
        case 'error':
          return '❌';
        case 'processing':
          return '🌐';
        default:
          return '✅';
      }
    });

    const toastTypeClass = computed(() => {
      return `toast-${props.type}`;
    });

    const hideToast = () => {
      visible.value = false;
      emit('update:show', false);
      if (timer) {
        clearTimeout(timer);
      }
    };

    watch(() => props.show, (newValue) => {
      visible.value = newValue;
      if (newValue) {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          hideToast();
        }, props.duration);
      }
    });

    // Clean up timer on unmount
    watch(visible, (currentValue) => {
      if (!currentValue && timer) {
        clearTimeout(timer);
      }
    });

    return {
      visible,
      icon,
      toastTypeClass,
      hideToast,
    };
  },
};
</script>

<style scoped>
.toast-message {
  position: fixed;
  top: 80px; /* Adjusted to be higher */
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  z-index: 2000; /* Ensure it's above other elements */
  cursor: pointer;
  transition: opacity 0.3s ease, transform 0.3s ease;
  font-weight: 500;
}

.toast-message.toast-success {
  background-color: #48bb78; /* Green for success */
  color: white;
}

.toast-message.toast-error {
  background-color: #f56565; /* Red for error */
  color: white;
}

.toast-message.toast-processing {
  background-color: #BEE3F8; /* Light sky blue for processing */
  color: #2D3748; /* Dark text for better contrast */
  border: 1px solid #90CDF4; /* Slightly darker blue border */
}

.toast-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.toast-text {
  font-size: 1rem;
}
</style> 