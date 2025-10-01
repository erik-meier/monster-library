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
                <li><kbd>Alt</kbd> + <kbd>S</kbd>: Save monster</li>
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
  z-index: var(--z-modal-backdrop);
  padding: var(--space-4);
  overflow-y: auto;
}

.modal-dialog {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
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
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-neutral-200);
}

.modal-header h2 {
  margin: 0;
  color: var(--color-primary-700);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--color-neutral-500);
  cursor: pointer;
  padding: var(--space-1);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-base);
  transition: var(--transition-colors);
}

.close-btn:hover {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-800);
}

.modal-content {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

.help-section {
  margin-bottom: var(--space-6);
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h3 {
  color: var(--color-neutral-800);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-2) 0;
}

.help-section p {
  color: var(--color-neutral-600);
  line-height: var(--line-height-relaxed);
  margin: var(--space-2) 0;
  font-size: var(--font-size-base);
}

.help-section ul {
  margin: var(--space-2) 0;
  padding-left: var(--space-6);
  color: var(--color-neutral-600);
}

.help-section li {
  margin: var(--space-2) 0;
  line-height: var(--line-height-relaxed);
}

kbd {
  display: inline-block;
  padding: 0.2em 0.4em;
  font-size: var(--font-size-sm);
  font-family: var(--font-family-mono);
  line-height: var(--line-height-tight);
  color: var(--color-neutral-800);
  background-color: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
  font-weight: var(--font-weight-medium);
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  margin-right: var(--space-1);
}

.status-complete {
  background-color: var(--color-success-600);
  color: white;
}

.status-invalid {
  background-color: var(--color-error-600);
  color: white;
}

.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btn {
  padding: var(--padding-btn);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-all);
  box-shadow: var(--shadow-sm);
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .modal-dialog {
    max-width: 95%;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--space-4);
  }

  .help-section h3 {
    font-size: var(--font-size-base);
  }
}
</style>
