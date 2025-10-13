<template>
  <div class="export-import-section">
    <h3>Import & Export</h3>
    <div class="export-import-grid">
      <!-- Export Section -->
      <div class="export-section">
        <h4>Export Monsters</h4>
        <div class="export-buttons">
          <button class="btn btn-secondary" @click="exportAllCustomMonsters"
            :disabled="customMonsterCount === 0 && customMaliceCount === 0"
            title="Export all your custom monsters and malice features as JSON">
            <span class="btn-icon">📦</span>
            Export All Custom ({{ customMonsterCount }} monsters, {{ customMaliceCount }} malice)
          </button>

          <button class="btn btn-outline" @click="createBackup" title="Create a full backup including all settings">
            <span class="btn-icon">💾</span>
            Create Full Backup
          </button>
        </div>
      </div>

      <!-- Import Section -->
      <div class="import-section">
        <h4>Import Monsters</h4>
        <div class="import-area">
          <input type="file" ref="fileInput" accept=".json" @change="handleFileUpload" class="file-input"
            id="monster-import" />
          <label for="monster-import" class="file-label btn btn-primary">
            <span class="btn-icon">📁</span>
            Choose JSON File
          </label>
          <div class="import-info" v-if="!importResult">
            <p>Select a JSON file containing monster data to import.</p>
            <p><small>Supports single monsters or bulk export files.</small></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Preview Modal -->
    <div v-if="showImportPreview && importPreview" class="modal-overlay" @click.self="cancelImport">
      <div class="modal import-preview-modal">
        <h3>Import Preview</h3>

        <div class="preview-summary">
          <div class="preview-stats">
            <div class="stat-item">
              <span class="stat-number">{{ importPreview.totalMonsters }}</span>
              <span class="stat-label">Total Monsters</span>
            </div>
            <div class="stat-item success">
              <span class="stat-number">{{ importPreview.validMonsters }}</span>
              <span class="stat-label">Valid</span>
            </div>
            <div class="stat-item error" v-if="importPreview.invalidMonsters > 0">
              <span class="stat-number">{{ importPreview.invalidMonsters }}</span>
              <span class="stat-label">Invalid</span>
            </div>
            <div class="stat-item" v-if="importPreview.totalMaliceFeatures && importPreview.totalMaliceFeatures > 0">
              <span class="stat-number">{{ importPreview.totalMaliceFeatures }}</span>
              <span class="stat-label">Total Malice</span>
            </div>
            <div class="stat-item success"
              v-if="importPreview.validMaliceFeatures && importPreview.validMaliceFeatures > 0">
              <span class="stat-number">{{ importPreview.validMaliceFeatures }}</span>
              <span class="stat-label">Valid Malice</span>
            </div>
            <div class="stat-item warning" v-if="importPreview.warnings.length > 0">
              <span class="stat-number">{{ importPreview.warnings.length }}</span>
              <span class="stat-label">Warnings</span>
            </div>
          </div>
        </div>

        <!-- Preview Warnings -->
        <div v-if="importPreview.warnings.length > 0" class="preview-warnings">
          <h4>⚠️ Warnings</h4>
          <div class="preview-message-list">
            <div v-for="(warning, index) in importPreview.warnings" :key="index" class="preview-message-item warning">
              <div class="message-header">
                <strong>{{ warning.monster || warning.malice }}</strong>
                <span class="warning-type" v-if="warning.type === 'id_collision'">ID Collision</span>
                <span class="item-type-badge" v-if="warning.malice">Malice</span>
              </div>
              <div class="message-content">
                {{ warning.message }}
              </div>
              <div class="message-action">
                {{ warning.action }}
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Errors -->
        <div v-if="importPreview.errors.length > 0" class="preview-errors">
          <h4>❌ Errors</h4>
          <div class="preview-message-list">
            <div v-for="(error, index) in importPreview.errors" :key="index" class="preview-message-item error">
              <div class="message-header">
                <strong>{{ error.monster || error.malice }}</strong>
                <span class="item-type-badge" v-if="error.malice">Malice</span>
              </div>
              <div class="message-content">
                {{ error.error }}
              </div>
              <div v-if="error.details && error.details.length > 0" class="error-details">
                <ul>
                  <li v-for="(detail, detailIndex) in error.details" :key="detailIndex">
                    <strong>{{ detail.field }}:</strong> {{ detail.message }}
                    <span v-if="detail.value !== undefined"> (got: {{ detail.value }})</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Monster List Preview -->
        <div v-if="importPreview.validMonsters > 0" class="preview-monsters">
          <h4>Monsters to Import ({{ importPreview.validMonsters }})</h4>
          <div class="monster-list">
            <div v-for="monster in importPreview.monsters.slice(0, 10)" :key="monster.id" class="monster-item">
              <span class="monster-name">{{ monster.name }}</span>
              <span class="monster-details">Level {{ monster.level }} {{ monster.role }} {{ monster.organization
                }}</span>
            </div>
            <div v-if="importPreview.monsters.length > 10" class="more-monsters">
              ... and {{ importPreview.monsters.length - 10 }} more monsters
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="cancelImport">
            Cancel
          </button>
          <button class="btn btn-primary" @click="confirmImport" :disabled="!importPreview.isValid">
            {{ importPreview.isValid ? `Import ${importPreview.validMonsters} Monster${importPreview.validMonsters !== 1
              ? 's' : ''}` : 'Cannot Import' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Import Results -->
    <div v-if="importResult" class="import-results">
      <div class="import-summary" :class="{ success: importResult.success, error: !importResult.success }">
        <h4>Import Results</h4>
        <div class="import-stats">
          <span class="stat">
            <strong>{{ importResult.imported }}</strong> monsters imported
          </span>
          <span class="stat">
            <strong>{{ importResult.skipped }}</strong> skipped
          </span>
          <span class="stat" v-if="importResult.importedMalice && importResult.importedMalice > 0">
            <strong>{{ importResult.importedMalice }}</strong> malice imported
          </span>
          <span class="stat" v-if="importResult.errors.length > 0">
            <strong>{{ importResult.errors.length }}</strong> errors
          </span>
          <span class="stat" v-if="importResult.warnings.length > 0">
            <strong>{{ importResult.warnings.length }}</strong> warnings
          </span>
        </div>

        <button class="btn btn-sm btn-outline" @click="clearImportResult">
          Clear Results
        </button>
      </div>

      <!-- Warnings -->
      <div v-if="importResult.warnings.length > 0" class="import-warnings">
        <h5>⚠️ Warnings</h5>
        <div class="message-list">
          <div v-for="(warning, index) in importResult.warnings" :key="index" class="message-item warning">
            <strong>{{ warning.monster || warning.malice }}{{ warning.malice ? ' (Malice)' : '' }}:</strong>
            {{ warning.message }}
            <br><small>{{ warning.action }}</small>
          </div>
        </div>
      </div>

      <!-- Errors -->
      <div v-if="importResult.errors.length > 0" class="import-errors">
        <h5>❌ Errors</h5>
        <div class="message-list">
          <div v-for="(error, index) in importResult.errors" :key="index" class="message-item error">
            <strong>{{ error.monster || error.malice || 'System' }}{{ error.malice ? ' (Malice)' : '' }}:</strong>
            {{ error.error }}
            <div v-if="error.details && error.details.length > 0" class="error-details">
              <ul>
                <li v-for="(detail, detailIndex) in error.details" :key="detailIndex">
                  <strong>{{ detail.field }}:</strong> {{ detail.message }}
                  <span v-if="detail.value !== undefined"> (got: {{ detail.value }})</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Restore Section -->
    <div class="restore-section">
      <details class="advanced-options">
        <summary>Advanced Options</summary>
        <div class="advanced-content">
          <h4>Data Recovery</h4>

          <div class="restore-buttons">
            <input type="file" ref="backupInput" accept=".json" @change="handleBackupRestore" class="file-input"
              id="backup-restore" />
            <label for="backup-restore" class="file-label btn btn-warning">
              <span class="btn-icon">🔄</span>
              Restore from Backup
            </label>

            <button class="btn btn-danger" @click="showClearConfirm = true"
              title="Clear all custom monster and malice data">
              <span class="btn-icon">🗑️</span>
              Clear All Data
            </button>
          </div>

          <p class="warning-text">
            ⚠️ <strong>Warning:</strong> Restore will replace all existing custom monsters and malice features.
            Create a backup first if you want to preserve current data.
          </p>
        </div>
      </details>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
      <div class="modal clear-confirm-modal">
        <h3>Clear All Custom Data</h3>
        <p>This will permanently delete all your custom monsters and malice features. This action cannot be undone.</p>
        <p><strong>Are you sure you want to continue?</strong></p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showClearConfirm = false">
            Cancel
          </button>
          <button class="btn btn-danger" @click="clearAllData">
            Yes, Clear All Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCustomMonstersStore } from '@/stores/customMonsters'
import { useCustomMaliceStore } from '@/stores/customMalice'
import {
  exportAllMonsters,
  importMonsters,
  previewImport,
  createFullBackup,
  restoreFromBackup,
  downloadFile,
  generateExportFilename,
  type ImportResult,
  type ImportPreview
} from '@/utils/exportImport'

const customMonstersStore = useCustomMonstersStore()
const customMaliceStore = useCustomMaliceStore()

// Refs
const fileInput = ref<HTMLInputElement>()
const backupInput = ref<HTMLInputElement>()
const importResult = ref<ImportResult | null>(null)
const importPreview = ref<ImportPreview | null>(null)
const showImportPreview = ref(false)
const showClearConfirm = ref(false)
const pendingImportContent = ref<string>('')

// Computed
const customMonsterCount = computed(() => customMonstersStore.customMonsterCount)
const customMaliceCount = computed(() => customMaliceStore.getCustomMaliceCount)

// Export functions
function exportAllCustomMonsters() {
  const monsters = customMonstersStore.getAllCustomMonsters()
  const maliceFeatures = customMaliceStore.getAllCustomMalice
  if (monsters.length === 0 && maliceFeatures.length === 0) return

  const jsonContent = exportAllMonsters(monsters, maliceFeatures)
  const filename = generateExportFilename('custom-monsters-export')
  downloadFile(jsonContent, filename)
}

function createBackup() {
  const backupContent = createFullBackup(customMonstersStore, customMaliceStore)
  const filename = generateExportFilename('monster-library-backup')
  downloadFile(backupContent, filename)
}

// Import functions
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (content) {
      // Clear previous results
      importResult.value = null

      // Generate preview
      importPreview.value = previewImport(content, customMonstersStore, customMaliceStore)
      pendingImportContent.value = content
      showImportPreview.value = true
    }
  }
  reader.readAsText(file)

  // Clear the input so the same file can be selected again
  target.value = ''
}

function confirmImport() {
  if (pendingImportContent.value) {
    importResult.value = importMonsters(pendingImportContent.value, customMonstersStore, customMaliceStore)
    showImportPreview.value = false
    importPreview.value = null
    pendingImportContent.value = ''
  }
}

function cancelImport() {
  showImportPreview.value = false
  importPreview.value = null
  pendingImportContent.value = ''
}

function handleBackupRestore(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!confirm('This will replace all existing custom monsters and malice features. Are you sure?')) {
    target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (content) {
      importResult.value = restoreFromBackup(content, customMonstersStore, customMaliceStore)
    }
  }
  reader.readAsText(file)

  // Clear the input
  target.value = ''
}

function clearImportResult() {
  importResult.value = null
}

function clearAllData() {
  customMonstersStore.clearAllCustomMonsters()
  customMaliceStore.customMaliceFeatures.clear()
  customMaliceStore.saveToStorage()
  showClearConfirm.value = false
  importResult.value = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: [],
    warnings: [{
      monster: 'System',
      message: 'All custom monster and malice feature data has been cleared',
      action: 'Data deleted successfully'
    }]
  }
}
</script>

<style scoped>
.export-import-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-8);
  border: 1px solid var(--color-neutral-200);
}

.export-import-section h3 {
  margin: 0 0 var(--space-6) 0;
  color: var(--color-neutral-900);
  border-bottom: 2px solid var(--color-neutral-200);
  padding-bottom: var(--space-2);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.export-import-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.export-section,
.import-section {
  padding: var(--space-4);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background: var(--color-neutral-50);
  transition: var(--transition-colors);
}

.export-section:hover,
.import-section:hover {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

.export-section h4,
.import-section h4 {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-neutral-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.export-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.import-area {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.file-input {
  position: absolute;
  left: -9999px;
  opacity: 0;
}

.file-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  justify-content: center;
}

.import-info {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  line-height: var(--line-height-relaxed);
}

.import-info small {
  color: var(--color-neutral-500);
}

/* Import Results */
.import-results {
  background: var(--color-neutral-50);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  margin: var(--space-4) 0;
  border: 2px solid var(--color-neutral-300);
  box-shadow: var(--shadow-md);
}

.import-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.import-summary.success {
  background: var(--color-success-100);
  border: 2px solid var(--color-success-600);
  color: var(--color-success-700);
  box-shadow: var(--shadow-sm);
}

.import-summary.error {
  background: var(--color-error-100);
  border: 2px solid var(--color-error-600);
  color: var(--color-error-700);
  box-shadow: var(--shadow-sm);
}

.import-summary h4 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.import-stats {
  display: flex;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.import-warnings,
.import-errors {
  margin: var(--space-4) 0;
}

.import-warnings h5,
.import-errors h5 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-800);
}

.message-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background: white;
  box-shadow: var(--shadow-sm);
}

.message-item {
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-neutral-200);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-relaxed);
}

.message-item:last-child {
  border-bottom: none;
}

.message-item.warning {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  border-bottom-color: var(--color-warning-300);
  border-left: 3px solid var(--color-warning-600);
}

.message-item.error {
  background: var(--color-error-50);
  color: var(--color-error-700);
  border-bottom-color: var(--color-error-300);
  border-left: 3px solid var(--color-error-600);
}

.error-details {
  margin-top: var(--space-2);
  padding-left: var(--space-4);
}

.error-details ul {
  margin: var(--space-1) 0 0 0;
  padding-left: var(--space-4);
}

/* Advanced Options */
.advanced-options {
  margin-top: var(--space-8);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background: var(--color-neutral-50);
  box-shadow: var(--shadow-sm);
}

.advanced-options summary {
  padding: var(--space-4);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
  user-select: none;
  transition: var(--transition-colors);
  border-radius: var(--radius-md);
}

.advanced-options summary:hover {
  background: var(--color-neutral-100);
}

.advanced-content {
  padding: 0 var(--space-4) var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
}

.advanced-content h4 {
  margin: var(--space-2) 0 var(--space-4) 0;
  color: var(--color-neutral-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.advanced-content p {
  color: var(--color-neutral-700);
}

.restore-buttons {
  display: flex;
  gap: var(--space-4);
  margin: var(--space-4) 0;
  flex-wrap: wrap;
}

.warning-text {
  background: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin: var(--space-4) 0 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-warning-800);
  line-height: var(--line-height-relaxed);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 500px;
  margin: var(--space-4);
  box-shadow: var(--shadow-xl);
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--color-neutral-200);
}

.import-preview-modal {
  max-width: 700px;
  max-height: 90vh;
}

.modal h3 {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-neutral-900);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.modal p {
  margin: var(--space-2) 0;
  line-height: var(--line-height-relaxed);
  color: var(--color-neutral-700);
}

.modal-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
  margin-top: var(--space-6);
}

/* Preview Styles */
.preview-summary {
  margin-bottom: var(--space-6);
}

.preview-stats {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  min-width: 80px;
  box-shadow: var(--shadow-sm);
}

.stat-item.success {
  background: var(--color-success-100);
  border-color: var(--color-success-600);
  color: var(--color-success-700);
  border-width: 2px;
}

.stat-item.error {
  background: var(--color-error-100);
  border-color: var(--color-error-600);
  color: var(--color-error-700);
  border-width: 2px;
}

.stat-item.warning {
  background: var(--color-warning-50);
  border-color: var(--color-warning-600);
  color: var(--color-warning-700);
  border-width: 2px;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.stat-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  margin-top: var(--space-1);
  font-weight: var(--font-weight-medium);
}

.preview-warnings,
.preview-errors {
  margin: var(--space-4) 0;
}

.preview-warnings h4,
.preview-errors h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.preview-message-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background: white;
  box-shadow: var(--shadow-sm);
}

.preview-message-item {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-neutral-200);
  font-size: var(--font-size-sm);
}

.preview-message-item:last-child {
  border-bottom: none;
}

.preview-message-item.warning {
  background: var(--color-warning-50);
  border-bottom-color: var(--color-warning-300);
  border-left: 3px solid var(--color-warning-600);
  color: var(--color-warning-700);
}

.preview-message-item.error {
  background: var(--color-error-50);
  border-bottom-color: var(--color-error-300);
  border-left: 3px solid var(--color-error-600);
  color: var(--color-error-700);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.warning-type {
  background: var(--color-warning-500);
  color: var(--color-neutral-900);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.item-type-badge {
  background: var(--color-primary-600);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.message-content {
  margin-bottom: var(--space-1);
  font-weight: var(--font-weight-medium);
}

.message-action {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
  font-style: italic;
}

.preview-monsters {
  margin: var(--space-4) 0;
}

.preview-monsters h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.monster-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background: white;
  box-shadow: var(--shadow-sm);
}

.monster-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-neutral-200);
}

.monster-item:last-child {
  border-bottom: none;
}

.monster-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-900);
}

.monster-details {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
}

.clear-confirm-modal h3 {
  color: var(--color-error-600);
}

.more-monsters {
  padding: var(--space-2) var(--space-3);
  text-align: center;
  font-style: italic;
  color: var(--color-neutral-600);
  background: var(--color-neutral-50);
  border-top: 1px solid var(--color-neutral-200);
  font-size: var(--font-size-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .export-import-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .export-buttons,
  .restore-buttons {
    gap: var(--space-3);
  }

  .import-stats {
    flex-direction: column;
    gap: var(--space-1);
  }

  .modal {
    margin: var(--space-2);
    padding: var(--space-6);
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: var(--space-2);
  }

  .preview-stats {
    gap: var(--space-2);
  }

  .stat-item {
    min-width: 60px;
    padding: var(--space-2);
  }
}

@media (max-width: 480px) {
  .export-import-section {
    padding: var(--space-4);
  }

  .restore-buttons {
    flex-direction: column;
    gap: var(--space-2);
  }

  .modal {
    margin: var(--space-1);
    padding: var(--space-4);
  }

  .preview-stats {
    justify-content: center;
  }

  .stat-item {
    min-width: 50px;
    padding: var(--space-2);
  }

  .stat-number {
    font-size: var(--font-size-xl);
  }
}

/* Button Styles */
.btn {
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: center;
  transition: var(--transition-button);
  min-height: 44px;
  font-family: var(--font-family-sans);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary-600);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn-secondary {
  background: var(--color-neutral-600);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-neutral-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn-outline {
  background: transparent;
  color: var(--color-neutral-600);
  border: 2px solid var(--color-neutral-300);
}

.btn-outline:hover {
  background: var(--color-neutral-600);
  color: white;
  border-color: var(--color-neutral-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-outline:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn-warning {
  background: var(--color-warning-500);
  color: var(--color-neutral-900);
}

.btn-warning:hover {
  background: var(--color-warning-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-warning:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-warning);
}

.btn-danger {
  background: var(--color-error-600);
  color: white;
}

.btn-danger:hover {
  background: var(--color-error-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-danger:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-error);
}

.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
  min-height: 36px;
}

.btn-icon {
  font-size: var(--font-size-base);
}
</style>