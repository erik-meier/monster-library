<template>
    <Teleport to="body">
        <div class="toast-container" v-if="toasts.length > 0">
            <TransitionGroup name="toast" tag="div">
                <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]" role="alert"
                    :aria-live="toast.type === 'error' ? 'assertive' : 'polite'">
                    <div class="toast-icon" aria-hidden="true">
                        <svg v-if="toast.type === 'success'" viewBox="0 0 20 20" fill="currentColor"
                            class="text-success">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <svg v-else-if="toast.type === 'error'" viewBox="0 0 20 20" fill="currentColor"
                            class="text-error">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                        <svg v-else-if="toast.type === 'warning'" viewBox="0 0 20 20" fill="currentColor"
                            class="text-warning">
                            <path fill-rule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                        <svg v-else viewBox="0 0 20 20" fill="currentColor" class="text-info">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="toast-content">
                        <div class="toast-message">{{ toast.message }}</div>
                    </div>
                    <button @click="removeToast(toast.id)" class="toast-close"
                        :aria-label="`Close ${toast.type} notification`">
                        <svg viewBox="0 0 20 20" fill="currentColor" style="width: 16px; height: 16px;">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script>
import { useToast } from '@/composables/useToast'

export default {
    name: 'ToastContainer',
    setup() {
        const { toasts, removeToast } = useToast()

        return {
            toasts,
            removeToast
        }
    }
}
</script>

<style scoped>
.toast-enter-active {
    transition: all var(--duration-normal) var(--ease-out);
}

.toast-leave-active {
    transition: all var(--duration-normal) var(--ease-in);
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}

.toast-move {
    transition: transform var(--duration-normal) var(--ease-out);
}

@media (max-width: 768px) {
    .toast-container {
        top: var(--space-2);
        right: var(--space-2);
        left: var(--space-2);
    }

    .toast {
        min-width: auto;
    }
}
</style>