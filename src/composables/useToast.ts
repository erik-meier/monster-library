import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
  timestamp: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  const addToast = (message: string, type: Toast['type'] = 'info', duration = 4000): number => {
    const id = ++toastId
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now()
    }
    
    toasts.value.push(toast)
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id: number): void => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearToasts = (): void => {
    toasts.value = []
  }

  // Convenience methods
  const success = (message: string, duration?: number) => addToast(message, 'success', duration)
  const error = (message: string, duration?: number) => addToast(message, 'error', duration)
  const warning = (message: string, duration?: number) => addToast(message, 'warning', duration)
  const info = (message: string, duration?: number) => addToast(message, 'info', duration)

  return {
    toasts: toasts.value,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}