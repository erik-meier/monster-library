<template>
  <div class="encounter-builder">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Encounter Builder</h1>
      <p class="page-description">
        Build balanced encounters for your Draw Steel adventures
      </p>
    </div>

    <!-- Main Content Area -->
    <div class="encounter-layout">
      <!-- Left: Monster Selection -->
      <div class="selection-panel">
        <h2 class="panel-title">Select Monsters</h2>
        <MonsterSelector />
      </div>

      <!-- Right: Encounter Summary -->
      <aside class="summary-panel">
        <EncounterSummary />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import MonsterSelector from '@/components/MonsterSelector.vue'
import EncounterSummary from '@/components/EncounterSummary.vue'

defineOptions({
  name: 'EncounterBuilder'
})

// Keyboard navigation support
const handleKeydown = (event: KeyboardEvent) => {
  // Escape to go back (future: could navigate to home or show save dialog)
  if (event.key === 'Escape') {
    event.preventDefault()
    console.log('Escape pressed')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.encounter-builder {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-4);
}

/* Page Header */
.page-header {
  text-align: center;
  padding: var(--space-6) var(--space-4);
  margin-bottom: var(--space-6);
}

.page-header h1 {
  color: var(--color-primary-700);
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-serif);
}

.page-description {
  color: var(--color-neutral-600);
  font-size: var(--font-size-lg);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* Layout */
.encounter-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-6);
  align-items: start;
}

.selection-panel {
  min-width: 0;
}

.panel-title {
  color: var(--color-primary-700);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-6) 0;
}

.summary-panel {
  min-width: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .encounter-layout {
    grid-template-columns: 1fr;
  }

  .summary-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .encounter-builder {
    padding: var(--space-2);
  }

  .page-header {
    padding: var(--space-4) var(--space-2);
  }

  .page-header h1 {
    font-size: var(--font-size-3xl);
  }

  .page-description {
    font-size: var(--font-size-base);
  }

  .panel-title {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: var(--font-size-2xl);
  }
}
</style>
