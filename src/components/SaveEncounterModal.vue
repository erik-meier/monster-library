<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
    <div class="modal-content" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div class="modal-header">
        <h2 id="modal-title">{{ isUpdate ? 'Update' : 'Save' }} Encounter</h2>
        <button type="button" class="btn-close" @click="handleCancel" aria-label="Close">✕</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="modal-body">
          <div class="form-group">
            <label for="encounter-name" class="form-label">Encounter Name *</label>
            <input id="encounter-name" v-model="formData.name" type="text" class="form-input"
              placeholder="e.g., Goblin Ambush" required autofocus />
          </div>

          <div class="form-group">
            <label for="encounter-description" class="form-label">Description (Optional)</label>
            <textarea id="encounter-description" v-model="formData.description" class="form-input" rows="3"
              placeholder="Add notes about this encounter..." />
          </div>

          <div v-if="validationError" class="validation-error">
            <strong>⚠️ Validation Error:</strong> {{ validationError }}
          </div>

          <div class="encounter-summary">
            <h3>Encounter Summary</h3>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-label">Monsters:</span>
                <span class="stat-value">{{ encounterStats.monsterCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total EV:</span>
                <span class="stat-value">{{ encounterStats.totalEV }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Target EV:</span>
                <span class="stat-value">{{ encounterStats.targetEV }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="!formData.name.trim()">
            {{ isUpdate ? 'Update' : 'Save' }} Encounter
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEncounterStore } from '@/stores/encounter'

interface Props {
  isOpen: boolean
  existingEncounterId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  saved: [id: string]
}>()

const encounterStore = useEncounterStore()

const formData = ref({
  name: '',
  description: ''
})

const validationError = ref<string | null>(null)

const isUpdate = computed(() => !!props.existingEncounterId)

const encounterStats = computed(() => {
  return {
    monsterCount: encounterStore.totalMonsters,
    totalEV: encounterStore.totalEV,
    targetEV: encounterStore.targetEV
  }
})

// Load existing encounter data when updating or reset form for new encounter
watch([() => props.isOpen, () => props.existingEncounterId], ([isOpen, encounterId]) => {
  if (isOpen) {
    validationError.value = null

    if (encounterId) {
      // Load existing encounter data
      const existing = encounterStore.getSavedEncounter(encounterId)
      if (existing) {
        formData.value.name = existing.name
        formData.value.description = existing.description || ''
      }
    } else {
      // Reset form for new encounter
      formData.value.name = ''
      formData.value.description = ''
    }
  }
}, { immediate: true })

function handleSubmit() {
  validationError.value = null

  console.log('SaveEncounterModal handleSubmit:', {
    isUpdate: isUpdate.value,
    existingEncounterId: props.existingEncounterId,
    formName: formData.value.name
  })

  try {
    let encounterId: string

    if (isUpdate.value && props.existingEncounterId) {
      const success = encounterStore.updateSavedEncounter(
        props.existingEncounterId,
        formData.value.name,
        formData.value.description
      )
      if (!success) {
        validationError.value = 'Failed to update encounter'
        return
      }
      encounterId = props.existingEncounterId
    } else {
      encounterId = encounterStore.saveEncounter(
        formData.value.name,
        formData.value.description
      )
    }

    emit('saved', encounterId)
    emit('close')
  } catch (error) {
    validationError.value = error instanceof Error ? error.message : 'Failed to save encounter'
  }
}

function handleCancel() {
  emit('close')
}
</script>

<style scoped>
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

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.btn-close {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--color-neutral-500);
  cursor: pointer;
  padding: var(--space-2);
  line-height: 1;
  transition: color 0.2s;
}

.btn-close:hover {
  color: var(--color-neutral-700);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.validation-error {
  padding: var(--space-3);
  background: var(--color-danger-50);
  border: 1px solid var(--color-danger-200);
  border-radius: var(--radius-md);
  color: var(--color-danger-700);
  margin-bottom: var(--space-4);
}

.encounter-summary {
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
}

.encounter-summary h3 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-700);
}

.summary-stats {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
}

@media (max-width: 640px) {
  .modal-content {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-4);
  }

  .summary-stats {
    flex-direction: column;
    gap: var(--space-2);
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>
