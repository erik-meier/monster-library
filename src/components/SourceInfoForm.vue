<template>
  <div class="source-info-form">
    <h2 class="form-section-title">Source Information</h2>

    <div class="form-section">
      <p class="section-description">
        Optional information about where this monster originates from. This can include published sourcebooks, homebrew
        collections, or custom campaigns.
      </p>

      <div class="form-grid">
        <div class="form-group">
          <label for="source-book" class="form-label">Source Book</label>
          <input id="source-book" v-model="formData.book" type="text" class="form-input"
            :class="{ invalid: errors.book }" placeholder="e.g., Monster Manual, Homebrew Collection" />
          <div v-if="errors.book" class="error-message">{{ errors.book }}</div>
          <div class="help-text">Name of the book, module, or collection this monster comes from</div>
        </div>

        <div class="form-group">
          <label for="source-page" class="form-label">Page Reference</label>
          <input id="source-page" v-model="formData.page" type="text" class="form-input"
            :class="{ invalid: errors.page }" placeholder="e.g., 42, 15-16, A3" />
          <div v-if="errors.page" class="error-message">{{ errors.page }}</div>
          <div class="help-text">Page number or reference where this monster can be found</div>
        </div>

        <div class="form-group full-width">
          <label for="source-license" class="form-label">License</label>
          <input id="source-license" v-model="formData.license" type="text" class="form-input"
            :class="{ invalid: errors.license }" placeholder="Draw Steel Creator License" />
          <div v-if="errors.license" class="error-message">{{ errors.license }}</div>
          <div class="help-text">Legal license under which this monster is published</div>
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="hasSourceInfo" class="source-preview">
        <h3 class="preview-title">Source Information Preview</h3>
        <div class="preview-content">
          <span v-if="formData.book">{{ formData.book }}</span>
          <span v-if="formData.page">, page {{ formData.page }}</span>
          <span v-if="displayLicense"> • {{ displayLicense }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { MonsterFormData } from '@/types/monster-forms'

interface Props {
  modelValue: MonsterFormData
}

interface Emits {
  (e: 'update:modelValue', value: MonsterFormData): void
  (e: 'update:isValid', valid: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive({
  book: props.modelValue.source?.book || '',
  page: props.modelValue.source?.page || '',
  license: props.modelValue.source?.license || ''
})

const errors = reactive({
  book: '',
  page: '',
  license: ''
})

const hasSourceInfo = computed(() => {
  return formData.book || formData.page || formData.license
})

const displayLicense = computed(() => {
  return formData.license
})

const validateField = (field: string, value: string) => {
  switch (field) {
    case 'book':
      if (value && value.length > 200) {
        errors.book = 'Book name must be 200 characters or less'
      } else {
        errors.book = ''
      }
      break

    case 'page':
      if (value && value.length > 50) {
        errors.page = 'Page reference must be 50 characters or less'
      } else {
        errors.page = ''
      }
      break

    case 'license':
      if (value && value.length > 200) {
        errors.license = 'License must be 200 characters or less'
      } else {
        errors.license = ''
      }
      break
  }
}

const isValid = computed(() => {
  return Object.values(errors).every(error => error === '')
})

const updateModelValue = () => {
  const sourceInfo = {
    book: formData.book || undefined,
    page: formData.page || undefined,
    license: formData.license || undefined
  }

  // Only include source if at least one field has a value
  const hasAnyValue = Object.values(sourceInfo).some(value => value && value.trim() !== '')

  emit('update:modelValue', {
    ...props.modelValue,
    source: hasAnyValue ? sourceInfo : undefined
  })
}

// Watch for changes and validate
watch(formData, () => {
  validateField('book', formData.book)
  validateField('page', formData.page)
  validateField('license', formData.license)
  updateModelValue()
}, { deep: true })

// Watch for external changes
watch(() => props.modelValue.source, (newSource) => {
  if (newSource) {
    if (newSource.book !== formData.book) formData.book = newSource.book || ''
    if (newSource.page !== formData.page) formData.page = newSource.page || ''
    if (newSource.license !== formData.license) formData.license = newSource.license || ''
  } else {
    formData.book = ''
    formData.page = ''
    formData.license = ''
  }
}, { deep: true })

// Emit validity status
watch(isValid, (valid) => {
  emit('update:isValid', valid)
}, { immediate: true })

// Initial validation
Object.keys(formData).forEach(key => {
  validateField(key, formData[key as keyof typeof formData])
})
</script>

<style scoped>
.source-info-form {
  padding: var(--space-4) 0;
}

.form-section-title {
  color: var(--color-primary-600);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-6) 0;
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-primary-600);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-description {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
  font-size: var(--font-size-sm);
}

/* Use global form styles from design system */

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: var(--font-family-sans);
  line-height: var(--line-height-relaxed);
}

.error-message {
  color: var(--color-error-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}

.help-text {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  line-height: var(--line-height-snug);
}

.source-preview {
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.preview-title {
  color: var(--color-neutral-700);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-4) 0;
}

.preview-content {
  color: var(--color-neutral-800);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  padding: var(--space-3);
  background: white;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-neutral-200);
  font-style: italic;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>