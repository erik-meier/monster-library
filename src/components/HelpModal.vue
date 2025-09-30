<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="close">
      <div class="modal-dialog" role="dialog" aria-labelledby="help-modal-title" aria-modal="true">
        <header class="modal-header">
          <h2 id="help-modal-title">{{ title }}</h2>
          <button type="button" class="close-btn" @click="close" aria-label="Close help">
            ✕
          </button>
        </header>
        
        <div class="modal-content">
          <slot>
            <div class="help-section">
              <h3>🎯 Monster Builder Guide</h3>
              <p>Create custom monsters for your Draw Steel campaigns step-by-step.</p>
            </div>

            <div class="help-section">
              <h3>📝 Form Navigation</h3>
              <ul>
                <li><strong>Previous/Next buttons:</strong> Move between form sections</li>
                <li><strong>Section tabs:</strong> Jump directly to any section</li>
                <li><strong>Progress bar:</strong> See how much is completed</li>
              </ul>
            </div>

            <div class="help-section">
              <h3>⌨️ Keyboard Shortcuts</h3>
              <ul>
                <li><kbd>Ctrl</kbd> + <kbd>S</kbd> (or <kbd>Cmd</kbd> + <kbd>S</kbd>): Save monster</li>
                <li><kbd>Esc</kbd>: Cancel or close modal</li>
                <li><kbd>←</kbd> / <kbd>→</kbd>: Navigate between sections (when not in input field)</li>
              </ul>
            </div>

            <div class="help-section">
              <h3>📋 Using Templates</h3>
              <p>Click "Browse Templates" to start from an existing monster. This pre-fills the form with values you can customize.</p>
            </div>

            <div class="help-section">
              <h3>✅ Validation</h3>
              <p>Required fields are marked with an asterisk (*). Section tabs show:</p>
              <ul>
                <li><span class="status-indicator status-complete">✓</span> Completed sections</li>
                <li><span class="status-indicator status-invalid">!</span> Sections with errors</li>
              </ul>
            </div>

            <div class="help-section">
              <h3>💾 Saving Your Work</h3>
              <p>Monsters are saved locally in your browser. You can export them as JSON files for backup or sharing.</p>
            </div>
          </slot>
        </div>
        
        <footer class="modal-footer">
          <button type="button" class="btn btn-primary" @click="close">
            Got it!
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Help'
})

const emit = defineEmits<Emits>()

const close = () => {
  emit('close')
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  margin: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: #8b4513;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.help-section {
  margin-bottom: 1.5rem;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h3 {
  color: #374151;
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
}

.help-section p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0.5rem 0;
}

.help-section ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: #6b7280;
}

.help-section li {
  margin: 0.5rem 0;
  line-height: 1.6;
}

kbd {
  display: inline-block;
  padding: 0.2em 0.4em;
  font-size: 0.85em;
  font-family: monospace;
  line-height: 1;
  color: #1f2937;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: bold;
  margin-right: 0.25rem;
}

.status-complete {
  background-color: #10b981;
  color: white;
}

.status-invalid {
  background-color: #ef4444;
  color: white;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #8b4513;
  color: white;
}

.btn-primary:hover {
  background-color: #6d3410;
}

@media (max-width: 768px) {
  .modal-dialog {
    max-width: 95%;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 1rem;
  }

  .help-section h3 {
    font-size: 1rem;
  }
}
</style>
