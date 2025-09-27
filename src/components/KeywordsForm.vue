<template>
  <div class="keywords-form">
    <h2 class="form-section-title">Keywords</h2>
    
    <div class="keywords-section">
      <p class="section-description">
        Select keywords that describe this monster's type and traits. These keywords are used for abilities and interactions.
      </p>
      
      <!-- Common Keywords -->
      <div class="keyword-category">
        <h3 class="subsection-title">Common Creature Types</h3>
        <div class="keyword-grid">
          <label 
            v-for="keyword in COMMON_KEYWORDS" 
            :key="keyword"
            class="keyword-checkbox"
            :class="{ selected: formData.keywords.includes(keyword) }"
          >
            <input 
              type="checkbox" 
              :value="keyword"
              v-model="formData.keywords"
              class="checkbox-input"
            />
            <span class="keyword-text">{{ capitalize(keyword) }}</span>
          </label>
        </div>
      </div>
      
      <!-- Custom Keywords -->
      <div class="custom-keywords">
        <h3 class="subsection-title">Custom Keywords</h3>
        <div class="custom-input-group">
          <input 
            v-model="customKeyword"
            type="text"
            class="custom-input"
            :class="{ invalid: customKeywordError }"
            placeholder="Enter custom keyword"
            @keyup.enter="addCustomKeyword"
          />
          <button 
            type="button" 
            class="btn-add-custom"
            @click="addCustomKeyword"
            :disabled="!customKeyword.trim() || !!customKeywordError"
          >
            Add
          </button>
        </div>
        <div v-if="customKeywordError" class="error-message">{{ customKeywordError }}</div>
        <div class="help-text">
          Enter additional keywords not covered by the common types. Use lowercase, single words or hyphenated phrases.
        </div>
      </div>
      
      <!-- Selected Keywords Summary -->
      <div class="selected-keywords" v-if="formData.keywords.length > 0">
        <h3 class="subsection-title">Selected Keywords ({{ formData.keywords.length }})</h3>
        <div class="keyword-tags">
          <span 
            v-for="keyword in formData.keywords" 
            :key="keyword"
            class="keyword-tag selected"
          >
            {{ keyword }}
            <button 
              type="button"
              class="remove-keyword"
              @click="removeKeyword(keyword)"
              title="Remove keyword"
            >
              ×
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { MonsterFormData } from '@/types/monster-forms'
import { COMMON_KEYWORDS } from '@/types/monster-forms'

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
  keywords: [...(props.modelValue.keywords || [])]
})

const customKeyword = ref('')
const customKeywordError = ref('')

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const removeKeyword = (keyword: string) => {
  const index = formData.keywords.indexOf(keyword)
  if (index > -1) {
    formData.keywords.splice(index, 1)
  }
}

const validateCustomKeyword = (keyword: string): string => {
  if (!keyword.trim()) {
    return 'Keyword cannot be empty'
  }
  
  if (keyword.length > 50) {
    return 'Keyword must be 50 characters or less'
  }
  
  if (!/^[a-z0-9-\s]+$/i.test(keyword)) {
    return 'Keywords can only contain letters, numbers, hyphens, and spaces'
  }
  
  if (formData.keywords.includes(keyword.toLowerCase().trim())) {
    return 'This keyword is already added'
  }
  
  return ''
}

const addCustomKeyword = () => {
  const keyword = customKeyword.value.toLowerCase().trim()
  const error = validateCustomKeyword(keyword)
  
  if (error) {
    customKeywordError.value = error
    return
  }
  
  formData.keywords.push(keyword)
  customKeyword.value = ''
  customKeywordError.value = ''
}

const isValid = computed(() => {
  // Keywords are optional, so always valid unless there's a custom keyword error
  return !customKeywordError.value
})

const updateModelValue = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    keywords: [...formData.keywords]
  })
}

// Watch for changes in custom keyword input
watch(customKeyword, (newValue) => {
  if (newValue) {
    customKeywordError.value = validateCustomKeyword(newValue)
  } else {
    customKeywordError.value = ''
  }
})

// Watch for changes and update model
watch(formData, () => {
  updateModelValue()
}, { deep: true })

// Watch for external changes
watch(() => props.modelValue.keywords, (newKeywords) => {
  if (JSON.stringify(newKeywords) !== JSON.stringify(formData.keywords)) {
    formData.keywords = [...(newKeywords || [])]
  }
}, { deep: true })

// Emit validity status
watch(isValid, (valid) => {
  emit('update:isValid', valid)
}, { immediate: true })
</script>

<style scoped>
.keywords-form {
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

.keywords-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.subsection-title {
  color: #495057;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.selected-keywords {
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 8px;
  padding: 1.5rem;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-tag {
  background: #8b4513;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-keyword {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.remove-keyword:hover {
  background: rgba(255, 255, 255, 0.2);
}

.keyword-category {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
}

.keyword-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
}

.keyword-grid.small {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.keyword-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
}

.keyword-checkbox:hover {
  background: rgba(139, 69, 19, 0.1);
}

.keyword-checkbox.selected {
  background: rgba(139, 69, 19, 0.15);
  font-weight: 600;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #8b4513;
}

.keyword-text {
  user-select: none;
}

.custom-keywords {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
}

.custom-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.custom-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.95rem;
}

.custom-input:focus {
  outline: none;
  border-color: #8b4513;
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.25);
}

.custom-input.invalid {
  border-color: #dc3545;
}

.custom-input.invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.btn-add-custom {
  padding: 0.75rem 1rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.btn-add-custom:hover:not(:disabled) {
  background: #a0522d;
}

.btn-add-custom:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.ability-keywords {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1.5rem;
}

.quick-add-btn {
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.quick-add-btn:hover {
  background: rgba(139, 69, 19, 0.1);
  border-color: #8b4513;
}

.quick-add-btn.selected {
  background: #8b4513;
  color: white;
  border-color: #8b4513;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.help-text {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

.keywords-summary {
  background: white;
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.summary-title {
  color: #8b4513;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.summary-list {
  color: #495057;
  line-height: 1.6;
  font-weight: 500;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .keyword-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .keyword-grid.small {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .custom-input-group {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .keyword-grid {
    grid-template-columns: 1fr;
  }
  
  .keyword-grid.small {
    grid-template-columns: 1fr;
  }
  
  .keyword-tags {
    justify-content: center;
  }
}
</style>