<template>
  <div class="loading-spinner" :class="{ 'inline': inline }">
    <div class="spinner"></div>
    <span v-if="message" class="loading-message">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  inline?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
}

.loading-spinner.inline {
  display: inline-flex;
  flex-direction: row;
  padding: var(--space-2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-neutral-200);
  border-top-color: var(--color-primary-600);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.loading-spinner.inline .spinner {
  width: 20px;
  height: 20px;
  border-width: 3px;
}

.loading-message {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
}

.loading-spinner.inline .loading-message {
  font-size: var(--font-size-xs);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
