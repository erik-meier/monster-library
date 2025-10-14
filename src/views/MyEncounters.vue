<template>
  <div class="my-encounters">
    <div class="header">
      <h1>My Encounters</h1>
      <p class="subtitle">Manage your saved encounters</p>
    </div>

    <div class="dashboard">
      <!-- Actions -->
      <div class="actions">
        <router-link to="/encounter-builder" class="btn btn-primary">
          <span class="btn-icon">+</span>
          Create New Encounter
        </router-link>
        <button class="btn btn-secondary" @click="showImportModal = true">
          <span class="btn-icon">📥</span>
          Import Encounter
        </button>
      </div>

      <!-- Search and Filter -->
      <div v-if="encounters.length > 0" class="search-filter-section">
        <div class="search-bar">
          <input v-model="searchTerm" type="text" placeholder="Search encounters..." class="search-input">
        </div>

        <div class="filter-controls">
          <select v-model="sortBy" class="filter-select">
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="name">Name (A-Z)</option>
            <option value="ev">EV (High to Low)</option>
          </select>
        </div>
      </div>

      <!-- Encounter List -->
      <div v-if="loading" class="loading">
        Loading encounters...
      </div>

      <div v-else-if="encounters.length === 0" class="empty-state">
        <div class="empty-icon">⚔️</div>
        <h2>No Saved Encounters Yet</h2>
        <p>You haven't saved any encounters yet. Get started by creating your first encounter!</p>
        <router-link to="/encounter-builder" class="btn btn-primary">
          Create Your First Encounter
        </router-link>
      </div>

      <div v-else class="encounters-section">
        <h2>Your Saved Encounters ({{ filteredEncounters.length }})</h2>

        <div class="encounters-grid">
          <div v-for="encounter in filteredEncounters" :key="encounter.id" class="encounter-card">
            <div class="encounter-header">
              <h3 class="encounter-name">{{ encounter.name }}</h3>
            </div>

            <div v-if="encounter.description" class="encounter-description">
              {{ encounter.description }}
            </div>

            <div class="encounter-stats">
              <div class="stat-item">
                <span class="stat-label">Monsters:</span>
                <span class="stat-value">{{ getMonsterCount(encounter) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total EV:</span>
                <span class="stat-value">{{ getTotalEV(encounter) }}</span>
              </div>
            </div>

            <div class="encounter-monsters-preview">
              <strong>Monsters:</strong>
              <div class="monsters-list">
                <span v-for="monster in encounter.monsters.slice(0, 3)" :key="monster.id" class="monster-preview">
                  {{ monster.count }}× {{ monster.name }} (Lv{{ monster.level }})
                </span>
                <span v-if="encounter.monsters.length > 3" class="more-monsters">
                  +{{ encounter.monsters.length - 3 }} more
                </span>
              </div>
            </div>

            <div class="encounter-meta">
              <div class="created-date">
                Created: {{ formatDate(encounter.createdAt) }}
              </div>
              <div v-if="encounter.updatedAt !== encounter.createdAt" class="updated-date">
                Updated: {{ formatDate(encounter.updatedAt) }}
              </div>
            </div>

            <div class="encounter-actions">
              <button @click="loadEncounter(encounter)" class="btn btn-sm btn-primary">
                Load
              </button>

              <button @click="duplicateEncounter(encounter)" class="btn btn-sm btn-secondary">
                Duplicate
              </button>

              <button @click="exportEncounter(encounter)" class="btn btn-sm btn-secondary">
                Export
              </button>

              <button @click="shareEncounter(encounter)" class="btn btn-sm btn-secondary">
                Share
              </button>

              <button @click="deleteEncounter(encounter)" class="btn btn-sm btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="cancelDelete">
      <div class="dialog delete-dialog" role="dialog" aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc" @keydown.escape="cancelDelete" ref="deleteDialog">
        <div class="dialog-icon">⚠️</div>
        <h3 id="delete-dialog-title">Delete Encounter</h3>
        <p id="delete-dialog-desc">
          Are you sure you want to delete <strong>"{{ encounterToDelete?.name }}"</strong>?
        </p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="dialog-actions">
          <button @click="cancelDelete" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="confirmDelete" class="btn btn-danger" ref="deleteButton">
            <span class="btn-icon">🗑️</span>
            Delete Encounter
          </button>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="dialog-overlay" @click.self="showImportModal = false">
      <div class="dialog" role="dialog" aria-labelledby="import-dialog-title">
        <h3 id="import-dialog-title">Import Encounter</h3>
        <p>Select a JSON file containing encounter data to import.</p>

        <div class="file-input-wrapper">
          <input type="file" ref="fileInput" @change="handleFileImport" accept=".json" class="file-input"
            id="encounter-import" />
          <label for="encounter-import" class="btn btn-secondary">
            <span class="btn-icon">📁</span>
            Choose File
          </label>
        </div>

        <div v-if="importError" class="error-message">
          {{ importError }}
        </div>

        <div class="dialog-actions">
          <button @click="showImportModal = false" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="dialog-overlay" @click.self="showShareModal = false">
      <div class="dialog share-dialog" role="dialog" aria-labelledby="share-dialog-title">
        <h3 id="share-dialog-title">Share Encounter</h3>
        <p>Copy the JSON data below to share this encounter:</p>

        <textarea v-model="shareData" readonly class="share-textarea" @click="selectAllText"></textarea>

        <div class="dialog-actions">
          <button @click="copyToClipboard" class="btn btn-primary">
            <span class="btn-icon">📋</span>
            {{ copiedToClipboard ? 'Copied!' : 'Copy to Clipboard' }}
          </button>
          <button @click="showShareModal = false" class="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useEncounterStore } from '@/stores/encounter'
import type { SavedEncounter } from '@/stores/encounter'

const router = useRouter()
const encounterStore = useEncounterStore()

// Reactive state
const loading = ref(true)
const searchTerm = ref('')
const sortBy = ref('updated')
const showDeleteDialog = ref(false)
const encounterToDelete = ref<SavedEncounter | null>(null)
const deleteButton = ref<HTMLButtonElement>()
const showImportModal = ref(false)
const showShareModal = ref(false)
const shareData = ref('')
const copiedToClipboard = ref(false)
const fileInput = ref<HTMLInputElement>()
const importError = ref('')

// Computed properties
const encounters = computed(() => encounterStore.allSavedEncounters)

const filteredEncounters = computed(() => {
  let filtered = [...encounters.value]

  // Search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(encounter =>
      encounter.name.toLowerCase().includes(term) ||
      encounter.description?.toLowerCase().includes(term) ||
      encounter.monsters.some(m => m.name.toLowerCase().includes(term))
    )
  }



  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'name':
        return a.name.localeCompare(b.name)
      case 'ev':
        return getTotalEV(b) - getTotalEV(a)
      default:
        return 0
    }
  })

  return filtered
})

// Methods
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getMonsterCount(encounter: SavedEncounter): number {
  return encounter.monsters.reduce((sum, monster) => sum + monster.count, 0)
}

function getTotalEV(encounter: SavedEncounter): number {
  return encounter.monsters.reduce((sum, monster) => sum + (monster.ev * monster.count), 0)
}



function loadEncounter(encounter: SavedEncounter) {
  encounterStore.loadEncounter(encounter.id)
  router.push('/encounter-builder')
}

function duplicateEncounter(encounter: SavedEncounter) {
  try {
    // Load the encounter into the current state
    encounterStore.loadEncounter(encounter.id)

    // Save as a new encounter with a modified name
    const newName = `${encounter.name} (Copy)`
    const newDescription = encounter.description

    encounterStore.saveEncounter(newName, newDescription)

    // Refresh the list
    encounterStore.loadSavedEncounters()
  } catch (error) {
    console.error('Failed to duplicate encounter:', error)
    alert('Failed to duplicate encounter. Please try again.')
  }
}

function exportEncounter(encounter: SavedEncounter) {
  try {
    const json = encounterStore.exportEncounter(encounter.id)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${encounter.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export encounter:', error)
    alert('Failed to export encounter. Please try again.')
  }
}

function shareEncounter(encounter: SavedEncounter) {
  try {
    shareData.value = encounterStore.exportEncounter(encounter.id)
    showShareModal.value = true
    copiedToClipboard.value = false
  } catch (error) {
    console.error('Failed to share encounter:', error)
    alert('Failed to share encounter. Please try again.')
  }
}

function selectAllText(event: Event) {
  const target = event.target as HTMLTextAreaElement
  target.select()
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(shareData.value)
    copiedToClipboard.value = true
    setTimeout(() => {
      copiedToClipboard.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    alert('Failed to copy to clipboard. Please select and copy manually.')
  }
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      encounterStore.importEncounter(content)

      // Refresh the list
      encounterStore.loadSavedEncounters()

      showImportModal.value = false
      importError.value = ''

      // Clear the file input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    } catch (error) {
      importError.value = error instanceof Error ? error.message : 'Failed to import encounter'
      console.error('Import error:', error)
    }
  }
  reader.readAsText(file)
}

function deleteEncounter(encounter: SavedEncounter) {
  encounterToDelete.value = encounter
  showDeleteDialog.value = true

  // Focus the delete button when the dialog opens
  nextTick(() => {
    if (deleteButton.value) {
      deleteButton.value.focus()
    }
  })
}

function cancelDelete() {
  showDeleteDialog.value = false
  encounterToDelete.value = null
}

function confirmDelete() {
  if (!encounterToDelete.value) return

  try {
    const success = encounterStore.deleteSavedEncounter(encounterToDelete.value.id)

    if (!success) {
      throw new Error('Failed to delete encounter')
    }

    showDeleteDialog.value = false
    encounterToDelete.value = null
  } catch (error) {
    console.error('Failed to delete encounter:', error)
    alert('Failed to delete encounter. Please try again.')
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    // Load saved encounters from storage
    encounterStore.loadSavedEncounters()
  } catch (error) {
    console.error('Error loading encounters:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.my-encounters {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8);
}

.header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.header h1 {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-2);
  color: var(--color-neutral-900);
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-neutral-600);
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  text-align: center;
  border: 1px solid var(--color-neutral-200);
}

.stat-number {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--font-size-base);
  color: var(--color-neutral-600);
  font-weight: var(--font-weight-medium);
}

/* Actions */
.actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
}

/* Search and Filter */
.search-filter-section {
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-neutral-200);
}

.search-bar {
  margin-bottom: var(--space-4);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: var(--transition-colors);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: white;
  cursor: pointer;
  transition: var(--transition-colors);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

/* Loading and Empty States */
.loading {
  text-align: center;
  padding: var(--space-12);
  font-size: var(--font-size-lg);
  color: var(--color-neutral-600);
}

.empty-state {
  text-align: center;
  padding: var(--space-12);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-neutral-200);
}

.empty-icon {
  font-size: var(--font-size-6xl);
  margin-bottom: var(--space-4);
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-2);
  color: var(--color-neutral-800);
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--color-neutral-600);
  margin-bottom: var(--space-6);
}

/* Encounters Section */
.encounters-section {
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-neutral-200);
}

.encounters-section h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-6);
  color: var(--color-neutral-900);
}

.encounters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

.encounter-card {
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
}

.encounter-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-300);
  transform: translateY(-1px);
}

.encounter-header {
  border-bottom: 1px solid var(--color-neutral-100);
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-1);
}

.encounter-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
  margin: 0;
  line-height: var(--line-height-tight);
}



.encounter-description {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  line-height: var(--line-height-relaxed);
}

.encounter-stats {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  text-align: center;
}

.stat-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-600);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  color: var(--color-neutral-900);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.encounter-monsters-preview {
  font-size: var(--font-size-sm);
  flex-grow: 1;
}

.encounter-monsters-preview strong {
  display: block;
  color: var(--color-neutral-700);
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-semibold);
}

.monsters-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.monster-preview {
  color: var(--color-neutral-600);
  padding: var(--space-2);
  background: var(--color-neutral-50);
  border-radius: var(--radius-base);
  border-left: 3px solid var(--color-primary-400);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
}

.more-monsters {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-medium);
  font-style: italic;
  text-align: center;
  padding: var(--space-1);
}

.encounter-meta {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
  padding: var(--space-3);
  background: var(--color-neutral-25);
  border-radius: var(--radius-base);
  margin-top: auto;
}

.created-date,
.updated-date {
  margin-bottom: var(--space-1);
}

.encounter-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
  margin-top: var(--space-2);
}

.encounter-actions .btn {
  flex: 1;
  min-width: 80px;
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
  backdrop-filter: blur(4px);
}

.dialog {
  background: white;
  padding: var(--space-8);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.dialog h3 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-4);
  color: var(--color-neutral-900);
  font-weight: var(--font-weight-bold);
}

.dialog p {
  margin-bottom: var(--space-4);
  color: var(--color-neutral-700);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-base);
}

.dialog-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-6);
}

/* Delete Dialog Specific Styles */
.delete-dialog {
  border-top: 4px solid var(--color-error-500);
}

.dialog-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-4);
}

.warning-text {
  color: var(--color-error-600);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2);
}

/* Share Modal */
.share-dialog {
  max-width: 600px;
}

.share-textarea {
  width: 100%;
  min-height: 300px;
  padding: var(--space-3);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-family: monospace;
  font-size: var(--font-size-sm);
  resize: vertical;
  margin-bottom: var(--space-4);
}

.share-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

/* File Input */
.file-input-wrapper {
  margin: var(--space-4) 0;
}

.file-input {
  display: none;
}

.error-message {
  color: var(--color-error-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--color-error-50);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-error-200);
}

/* Responsive Design */
@media (max-width: 768px) {
  .my-encounters {
    padding: var(--space-4);
  }

  .header h1 {
    font-size: var(--font-size-3xl);
  }

  .encounters-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .encounter-actions {
    flex-direction: column;
  }

  .encounter-actions .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }

  .dialog {
    padding: var(--space-4);
  }
}
</style>
