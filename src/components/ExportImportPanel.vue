<template>
  <div class="export-import-section">
    <h3>Import & Export</h3>
    <div class="export-import-grid">
      <!-- Export Section -->
      <div class="export-section">
        <h4>Export Monsters</h4>
        <div class="export-buttons">
          <button 
            class="btn btn-secondary"
            @click="exportAllCustomMonsters"
            :disabled="customMonsterCount === 0"
            title="Export all your custom monsters as JSON"
          >
            <span class="btn-icon">📦</span>
            Export All Custom ({{ customMonsterCount }})
          </button>
          
          <button 
            class="btn btn-outline"
            @click="createBackup"
            title="Create a full backup including all settings"
          >
            <span class="btn-icon">💾</span>
            Create Full Backup
          </button>
        </div>
      </div>

      <!-- Import Section -->
      <div class="import-section">
        <h4>Import Monsters</h4>
        <div class="import-area">
          <input
            type="file"
            ref="fileInput"
            accept=".json"
            @change="handleFileUpload"
            class="file-input"
            id="monster-import"
          />
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

    <!-- Import Results -->
    <div v-if="importResult" class="import-results">
      <div class="import-summary" :class="{ success: importResult.success, error: !importResult.success }">
        <h4>Import Results</h4>
        <div class="import-stats">
          <span class="stat">
            <strong>{{ importResult.imported }}</strong> imported
          </span>
          <span class="stat">
            <strong>{{ importResult.skipped }}</strong> skipped
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
            <strong>{{ warning.monster }}:</strong>
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
            <strong>{{ error.monster || 'System' }}:</strong>
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
          <p>Use these options if you need to restore data or recover from corruption:</p>
          
          <div class="restore-buttons">
            <input
              type="file"
              ref="backupInput"
              accept=".json"
              @change="handleBackupRestore"
              class="file-input"
              id="backup-restore"
            />
            <label for="backup-restore" class="file-label btn btn-warning">
              <span class="btn-icon">🔄</span>
              Restore from Backup
            </label>
            
            <button 
              class="btn btn-danger"
              @click="showClearConfirm = true"
              title="Clear all custom monster data"
            >
              <span class="btn-icon">🗑️</span>
              Clear All Data
            </button>
          </div>
          
          <p class="warning-text">
            ⚠️ <strong>Warning:</strong> Restore will replace all existing custom monsters. 
            Create a backup first if you want to preserve current data.
          </p>
        </div>
      </details>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
      <div class="modal">
        <h3>Clear All Custom Monsters</h3>
        <p>This will permanently delete all your custom monsters. This action cannot be undone.</p>
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
import { 
  exportAllMonsters, 
  importMonsters, 
  createFullBackup, 
  restoreFromBackup, 
  downloadFile, 
  generateExportFilename,
  type ImportResult 
} from '@/utils/exportImport'

const customMonstersStore = useCustomMonstersStore()

// Refs
const fileInput = ref<HTMLInputElement>()
const backupInput = ref<HTMLInputElement>()
const importResult = ref<ImportResult | null>(null)
const showClearConfirm = ref(false)

// Computed
const customMonsterCount = computed(() => customMonstersStore.customMonsterCount)

// Export functions
function exportAllCustomMonsters() {
  const monsters = customMonstersStore.getAllCustomMonsters()
  if (monsters.length === 0) return
  
  const jsonContent = exportAllMonsters(monsters)
  const filename = generateExportFilename('custom-monsters-export')
  downloadFile(jsonContent, filename)
}

function createBackup() {
  const backupContent = createFullBackup()
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
      importResult.value = importMonsters(content)
    }
  }
  reader.readAsText(file)
  
  // Clear the input so the same file can be selected again
  target.value = ''
}

function handleBackupRestore(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!confirm('This will replace all existing custom monsters. Are you sure?')) {
    target.value = ''
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (content) {
      importResult.value = restoreFromBackup(content)
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
  showClearConfirm.value = false
  importResult.value = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: [],
    warnings: [{
      monster: 'System',
      message: 'All custom monster data has been cleared',
      action: 'Data deleted successfully'
    }]
  }
}
</script>

<style scoped>
.export-import-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.export-import-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.export-import-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.export-section,
.import-section {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: #f8f9fa;
}

.export-section h4,
.import-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.export-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.import-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.4;
}

.import-info small {
  color: #868e96;
}

/* Import Results */
.import-results {
  background: #f1f3f4;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
}

.import-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.import-summary.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.import-summary.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.import-summary h4 {
  margin: 0;
  font-size: 1rem;
}

.import-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.import-warnings,
.import-errors {
  margin: 1rem 0;
}

.import-warnings h5,
.import-errors h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
}

.message-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
}

.message-item {
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.85rem;
  line-height: 1.4;
}

.message-item:last-child {
  border-bottom: none;
}

.message-item.warning {
  background: #fff3cd;
  color: #856404;
}

.message-item.error {
  background: #f8d7da;
  color: #721c24;
}

.error-details {
  margin-top: 0.5rem;
  padding-left: 1rem;
}

.error-details ul {
  margin: 0.25rem 0 0 0;
  padding-left: 1rem;
}

/* Advanced Options */
.advanced-options {
  margin-top: 2rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
}

.advanced-options summary {
  padding: 1rem;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
  user-select: none;
}

.advanced-options summary:hover {
  background: #e9ecef;
}

.advanced-content {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid #dee2e6;
}

.advanced-content h4 {
  margin: 0.5rem 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.restore-buttons {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.warning-text {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.75rem;
  margin: 1rem 0 0 0;
  font-size: 0.9rem;
  color: #856404;
  line-height: 1.4;
}

/* Modal */
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
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  margin: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin: 0 0 1rem 0;
  color: #dc3545;
}

.modal p {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .export-import-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .export-buttons,
  .restore-buttons {
    gap: 0.75rem;
  }
  
  .import-stats {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .modal {
    margin: 0.5rem;
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
}

@media (max-width: 480px) {
  .export-import-section {
    padding: 1rem;
  }
  
  .restore-buttons {
    flex-direction: column;
  }
}

/* Button Styles */
.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  transition: all 0.2s ease;
  min-height: 44px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  min-height: 36px;
}

.btn-icon {
  font-size: 1rem;
}
</style>