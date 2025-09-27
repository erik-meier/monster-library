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
                <strong>{{ warning.monster }}</strong>
                <span class="warning-type" v-if="warning.type === 'id_collision'">ID Collision</span>
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
                <strong>{{ error.monster }}</strong>
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
              <span class="monster-details">Level {{ monster.level }} {{ monster.role }} {{ monster.organization }}</span>
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
          <button 
            class="btn btn-primary" 
            @click="confirmImport"
            :disabled="!importPreview.isValid"
          >
            {{ importPreview.isValid ? `Import ${importPreview.validMonsters} Monster${importPreview.validMonsters !== 1 ? 's' : ''}` : 'Cannot Import' }}
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
      <div class="modal clear-confirm-modal">
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
  previewImport,
  createFullBackup, 
  restoreFromBackup, 
  downloadFile, 
  generateExportFilename,
  type ImportResult,
  type ImportPreview 
} from '@/utils/exportImport'

const customMonstersStore = useCustomMonstersStore()

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
      // Clear previous results
      importResult.value = null
      
      // Generate preview
      importPreview.value = previewImport(content)
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
    importResult.value = importMonsters(pendingImportContent.value)
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
  max-height: 80vh;
  overflow-y: auto;
}

.import-preview-modal {
  max-width: 700px;
  max-height: 90vh;
}

.modal h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
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

/* Preview Styles */
.preview-summary {
  margin-bottom: 1.5rem;
}

.preview-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  min-width: 80px;
}

.stat-item.success {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.stat-item.error {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.stat-item.warning {
  background: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-top: 0.25rem;
}

.preview-warnings,
.preview-errors {
  margin: 1rem 0;
}

.preview-warnings h4,
.preview-errors h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.preview-message-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
}

.preview-message-item {
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.9rem;
}

.preview-message-item:last-child {
  border-bottom: none;
}

.preview-message-item.warning {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.preview-message-item.error {
  background: #f8d7da;
  border-color: #f5c6cb;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.warning-type {
  background: #ffc107;
  color: #212529;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
}

.message-content {
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.message-action {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.preview-monsters {
  margin: 1rem 0;
}

.preview-monsters h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.monster-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
}

.monster-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.monster-item:last-child {
  border-bottom: none;
}

.monster-name {
  font-weight: 500;
  color: #2c3e50;
}

.monster-details {
  font-size: 0.8rem;
  color: #6c757d;
}

.clear-confirm-modal h3 {
  color: #dc3545;
}

.more-monsters {
  padding: 0.5rem 0.75rem;
  text-align: center;
  font-style: italic;
  color: #6c757d;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
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