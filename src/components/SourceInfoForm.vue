<template>
  <div class="source-info-form">
    <h2 class="form-section-title">Source Information</h2>
    
    <div class="form-section">
      <p class="section-description">
        Optional information about where this monster originates from. This can include published sourcebooks, homebrew collections, or custom campaigns.
      </p>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="source-book" class="form-label">Source Book</label>
          <input 
            id="source-book"
            v-model="formData.book"
            type="text" 
            class="form-input"
            :class="{ invalid: errors.book }"
            placeholder="e.g., Monster Manual, Homebrew Collection"
          />
          <div v-if="errors.book" class="error-message">{{ errors.book }}</div>
          <div class="help-text">Name of the book, module, or collection this monster comes from</div>
        </div>
        
        <div class="form-group">
          <label for="source-page" class="form-label">Page Reference</label>
          <input 
            id="source-page"
            v-model="formData.page"
            type="text" 
            class="form-input"
            :class="{ invalid: errors.page }"
            placeholder="e.g., 42, 15-16, A3"
          />
          <div v-if="errors.page" class="error-message">{{ errors.page }}</div>
          <div class="help-text">Page number or reference where this monster can be found</div>
        </div>
        
        <div class="form-group full-width">
          <label for="source-license" class="form-label">License</label>
          <select 
            id="source-license"
            v-model="formData.license"
            class="form-select"
            :class="{ invalid: errors.license }"
          >
            <option value="">Select a license (optional)</option>
            <option value="Draw Steel Creator License">Draw Steel Creator License</option>
            <option value="OGL 1.0a">Open Game License 1.0a</option>
            <option value="CC BY 4.0">Creative Commons Attribution 4.0</option>
            <option value="CC BY-SA 4.0">Creative Commons Attribution-ShareAlike 4.0</option>
            <option value="Homebrew">Homebrew (Personal Use)</option>
            <option value="Custom">Custom License</option>
          </select>
          <div v-if="errors.license" class="error-message">{{ errors.license }}</div>
          <div class="help-text">Legal license under which this monster is published</div>
        </div>
      </div>
      
      <!-- Custom License Input -->
      <div v-if="formData.license === 'Custom'" class="form-group">
        <label for="custom-license" class="form-label">Custom License Details</label>
        <textarea 
          id="custom-license"
          v-model="customLicenseText"
          class="form-textarea"
          :class="{ invalid: errors.customLicense }"
          placeholder="Enter custom license text or details"
          rows="3"
        />
        <div v-if="errors.customLicense" class="error-message">{{ errors.customLicense }}</div>
        <div class="help-text">Provide details about the custom license terms</div>
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
      
      <!-- Common Presets -->
      <div class="presets-section">
        <h3 class="presets-title">Quick Presets</h3>
        <div class="presets-grid">
          <button
            v-for="preset in commonPresets"
            :key="preset.name"
            type="button"
            class="preset-btn"
            @click="applyPreset(preset)"
          >
            {{ preset.name }}
          </button>
        </div>
        <div class="help-text">Click a preset to quickly fill in common source information</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { MonsterFormData } from '@/types/monster-forms'

interface Props {
  modelValue: MonsterFormData
}

interface Emits {
  (e: 'update:modelValue', value: MonsterFormData): void
  (e: 'update:isValid', valid: boolean): void
}

interface SourcePreset {
  name: string
  book: string
  license: string
  page?: string
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive({
  book: props.modelValue.source?.book || '',
  page: props.modelValue.source?.page || '',
  license: props.modelValue.source?.license || ''
})

const customLicenseText = ref('')

const errors = reactive({
  book: '',
  page: '',
  license: '',
  customLicense: ''
})

const commonPresets: SourcePreset[] = [
  {
    name: 'Draw Steel Official',
    book: 'Monsters',
    license: 'Draw Steel Creator License'
  },
  {
    name: 'Homebrew',
    book: 'Custom Homebrew',
    license: 'Homebrew'
  },
  {
    name: 'Community Content',
    book: '',
    license: 'Draw Steel Creator License'
  }
]

const hasSourceInfo = computed(() => {
  return formData.book || formData.page || formData.license
})

const displayLicense = computed(() => {
  if (formData.license === 'Custom') {
    return customLicenseText.value || 'Custom License'
  }
  return formData.license
})

const applyPreset = (preset: SourcePreset) => {
  formData.book = preset.book
  formData.license = preset.license
  if (preset.page) {
    formData.page = preset.page
  }
}

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
      
    case 'customLicense':
      if (formData.license === 'Custom' && (!value || value.trim() === '')) {
        errors.customLicense = 'Custom license details are required when using Custom license'
      } else if (value && value.length > 1000) {
        errors.customLicense = 'Custom license details must be 1000 characters or less'
      } else {
        errors.customLicense = ''
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
    license: formData.license === 'Custom' ? customLicenseText.value || formData.license : formData.license || undefined
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
  validateField('customLicense', customLicenseText.value)
  updateModelValue()
}, { deep: true })

// Watch custom license text
watch(customLicenseText, () => {
  validateField('customLicense', customLicenseText.value)
  updateModelValue()
})

// Watch for external changes
watch(() => props.modelValue.source, (newSource) => {
  if (newSource) {
    if (newSource.book !== formData.book) formData.book = newSource.book || ''
    if (newSource.page !== formData.page) formData.page = newSource.page || ''
    if (newSource.license !== formData.license) {
      formData.license = newSource.license || ''
      if (formData.license === 'Custom') {
        customLicenseText.value = newSource.license || ''
      }
    }
  } else {
    formData.book = ''
    formData.page = ''
    formData.license = ''
    customLicenseText.value = ''
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
validateField('customLicense', customLicenseText.value)
</script>

<style scoped>
.source-info-form {
  padding: 1rem 0;
}

.form-section-title {
  color: #8b4513;
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #8b4513;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #8b4513;
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.25);
}

.form-input.invalid,
.form-select.invalid,
.form-textarea.invalid {
  border-color: #dc3545;
}

.form-input.invalid:focus,
.form-select.invalid:focus,
.form-textarea.invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.help-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  line-height: 1.4;
}

.source-preview {
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 8px;
  padding: 1.5rem;
}

.preview-title {
  color: #495057;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.preview-content {
  color: #333;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-style: italic;
}

.presets-section {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
}

.presets-title {
  color: #495057;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preset-btn {
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.preset-btn:hover {
  background: #8b4513;
  color: white;
  border-color: #8b4513;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .presets-grid {
    grid-template-columns: 1fr;
  }
}
</style>