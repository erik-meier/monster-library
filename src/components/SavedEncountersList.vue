<template>
  <div class="saved-encounters">
    <div class="encounters-header">
      <h3>Saved Encounters</h3>
      <p v-if="encounters.length === 0" class="empty-message">No saved encounters yet</p>
      <p v-else class="count-message">{{ encounters.length }} saved encounter{{ encounters.length !== 1 ? 's' : '' }}</p>
    </div>

    <div v-if="encounters.length > 0" class="encounters-list">
      <div v-for="encounter in encounters" :key="encounter.id" class="encounter-card">
        <div class="encounter-info">
          <h4 class="encounter-name">{{ encounter.name }}</h4>
          <p v-if="encounter.description" class="encounter-description">{{ encounter.description }}</p>
          
          <div class="encounter-stats">
            <span class="stat-badge">{{ encounter.monsters.length }} monster{{ encounter.monsters.length !== 1 ? 's' : '' }}</span>
            <span class="stat-badge ev-badge">EV {{ calculateTotalEV(encounter) }}</span>
            <span v-if="encounter.targetEV > 0" class="stat-badge target-badge">Target: {{ encounter.targetEV }}</span>
          </div>

          <div class="encounter-meta">
            <span class="meta-date" :title="`Created: ${formatDate(encounter.createdAt)}`">
              Updated {{ formatRelativeTime(encounter.updatedAt) }}
            </span>
          </div>
        </div>

        <div class="encounter-actions">
          <button 
            type="button"
            class="btn btn-primary btn-sm" 
            @click="handleLoad(encounter.id)"
            title="Load this encounter"
          >
            Load
          </button>
          <button 
            type="button"
            class="btn btn-secondary btn-sm" 
            @click="handleExport(encounter.id)"
            title="Export as JSON"
          >
            Export
          </button>
          <button 
            type="button"
            class="btn btn-danger btn-sm" 
            @click="handleDelete(encounter.id)"
            title="Delete this encounter"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <div v-if="showImport" class="import-section">
      <h4>Import Encounter</h4>
      <textarea
        v-model="importData"
        class="form-input import-textarea"
        rows="6"
        placeholder="Paste encounter JSON data here..."
      />
      <div class="import-actions">
        <button type="button" class="btn btn-secondary" @click="cancelImport">Cancel</button>
        <button type="button" class="btn btn-primary" @click="handleImport" :disabled="!importData.trim()">
          Import
        </button>
      </div>
      <p v-if="importError" class="error-message">{{ importError }}</p>
    </div>

    <div v-if="!showImport && encounters.length > 0" class="footer-actions">
      <button type="button" class="btn btn-secondary btn-sm" @click="showImport = true">
        Import Encounter
      </button>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-content confirmation-dialog">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete "{{ encounterToDelete?.name }}"?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" @click="cancelDelete">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEncounterStore, type SavedEncounter } from '@/stores/encounter'

const emit = defineEmits<{
  load: [id: string]
  export: [id: string]
}>()

const encounterStore = useEncounterStore()

// Load saved encounters
encounterStore.loadSavedEncounters()

const encounters = computed(() => encounterStore.allSavedEncounters)

// Import state
const showImport = ref(false)
const importData = ref('')
const importError = ref<string | null>(null)

// Delete confirmation state
const showConfirmDialog = ref(false)
const encounterToDelete = ref<SavedEncounter | null>(null)

function calculateTotalEV(encounter: SavedEncounter): number {
  return encounter.monsters.reduce((sum, monster) => sum + (monster.ev * monster.count), 0)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  
  return formatDate(dateString)
}

function handleLoad(id: string) {
  emit('load', id)
}

function handleExport(id: string) {
  try {
    const json = encounterStore.exportEncounter(id)
    
    // Create download
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const encounter = encounterStore.getSavedEncounter(id)
    a.href = url
    a.download = `${encounter?.name || 'encounter'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    emit('export', id)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export encounter')
  }
}

function handleDelete(id: string) {
  encounterToDelete.value = encounterStore.getSavedEncounter(id)
  showConfirmDialog.value = true
}

function confirmDelete() {
  if (encounterToDelete.value) {
    const success = encounterStore.deleteSavedEncounter(encounterToDelete.value.id)
    if (!success) {
      alert('Failed to delete encounter')
    }
  }
  cancelDelete()
}

function cancelDelete() {
  showConfirmDialog.value = false
  encounterToDelete.value = null
}

function handleImport() {
  importError.value = null
  
  try {
    encounterStore.importEncounter(importData.value)
    importData.value = ''
    showImport.value = false
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Failed to import encounter'
  }
}

function cancelImport() {
  showImport.value = false
  importData.value = ''
  importError.value = null
}
</script>

<style scoped>
.saved-encounters {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  padding: var(--space-6);
}

.encounters-header {
  margin-bottom: var(--space-4);
}

.encounters-header h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.empty-message {
  margin: 0;
  color: var(--color-neutral-500);
  font-style: italic;
}

.count-message {
  margin: 0;
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
}

.encounters-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.encounter-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  gap: var(--space-4);
  transition: all 0.2s;
}

.encounter-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}

.encounter-info {
  flex: 1;
  min-width: 0;
}

.encounter-name {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.encounter-description {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  line-height: var(--line-height-relaxed);
}

.encounter-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.stat-badge {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
  background: var(--color-neutral-100);
  padding: 2px var(--space-2);
  border-radius: var(--radius-base);
}

.ev-badge {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.target-badge {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.encounter-meta {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
}

.meta-date {
  cursor: help;
}

.encounter-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.import-section {
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  margin-bottom: var(--space-4);
}

.import-section h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-700);
}

.import-textarea {
  width: 100%;
  font-family: monospace;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-3);
}

.import-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.error-message {
  margin: var(--space-3) 0 0 0;
  padding: var(--space-3);
  background: var(--color-danger-50);
  border: 1px solid var(--color-danger-200);
  border-radius: var(--radius-md);
  color: var(--color-danger-700);
  font-size: var(--font-size-sm);
}

.footer-actions {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  justify-content: center;
}

/* Confirmation Dialog */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.confirmation-dialog {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 400px;
  padding: var(--space-6);
}

.confirmation-dialog h3 {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.confirmation-dialog p {
  margin: 0 0 var(--space-3) 0;
  color: var(--color-neutral-700);
}

.warning-text {
  color: var(--color-danger-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.dialog-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .encounter-card {
    flex-direction: column;
  }

  .encounter-actions {
    flex-direction: row;
    width: 100%;
  }

  .encounter-actions .btn {
    flex: 1;
  }

  .import-actions,
  .dialog-actions {
    flex-direction: column;
  }

  .import-actions .btn,
  .dialog-actions .btn {
    width: 100%;
  }
}
</style>
