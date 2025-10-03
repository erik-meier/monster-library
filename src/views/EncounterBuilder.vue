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

      <!-- Right: Encounter Panel with Tabs -->
      <aside class="summary-panel">
        <div class="panel-tabs">
          <button 
            class="tab-btn"
            :class="{ active: currentTab === 'summary' }"
            @click="currentTab = 'summary'"
          >
            Summary
          </button>
          <button 
            class="tab-btn"
            :class="{ active: currentTab === 'initiative' }"
            @click="currentTab = 'initiative'"
          >
            Initiative Groups
          </button>
        </div>

        <div class="tab-content">
          <EncounterSummary v-if="currentTab === 'summary'" />
          <InitiativeTracker v-else-if="currentTab === 'initiative'" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MonsterSelector from '@/components/MonsterSelector.vue'
import EncounterSummary from '@/components/EncounterSummary.vue'
import InitiativeTracker from '@/components/InitiativeTracker.vue'

defineOptions({
  name: 'EncounterBuilder'
})

// Tab state
const currentTab = ref<'summary' | 'initiative'>('summary')

// Keyboard navigation support
const handleKeydown = (event: KeyboardEvent) => {
  // Escape to go back (future: could navigate to home or show save dialog)
  if (event.key === 'Escape') {
    event.preventDefault()
    console.log('Escape pressed')
  }
  
  // Tab navigation with Ctrl/Cmd + 1/2
  if ((event.ctrlKey || event.metaKey) && event.key === '1') {
    event.preventDefault()
    currentTab.value = 'summary'
  } else if ((event.ctrlKey || event.metaKey) && event.key === '2') {
    event.preventDefault()
    currentTab.value = 'initiative'
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
  position: sticky;
  top: var(--space-4);
  height: fit-content;
  max-height: calc(100vh - var(--space-8));
  display: flex;
  flex-direction: column;
}

/* Tabs */
.panel-tabs {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  background: white;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border: 1px solid var(--color-neutral-200);
  border-bottom: none;
}

.tab-btn {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  color: var(--color-neutral-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
}

.tab-btn:hover {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

.tab-btn.active {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
  color: white;
  font-weight: var(--font-weight-semibold);
}

.tab-btn:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  background: white;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
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
