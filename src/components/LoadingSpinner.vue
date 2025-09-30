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
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner.inline {
  display: inline-flex;
  flex-direction: row;
  padding: 0.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #8b4513;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner.inline .spinner {
  width: 20px;
  height: 20px;
  border-width: 3px;
}

.loading-message {
  color: #6b7280;
  font-size: 0.9rem;
}

.loading-spinner.inline .loading-message {
  font-size: 0.85rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
