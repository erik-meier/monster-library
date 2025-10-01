<template>
  <div class="keywords-form">
    <h2 class="form-section-title">Keywords</h2>

    <div class="keywords-section">
      <p class="section-description">
        Select keywords that describe this monster's type and traits. These keywords are used for abilities and
        interactions.
      </p>

      <!-- Common Keywords -->
      <div class="keyword-category">
        <h3 class="subsection-title">Common Creature Types</h3>
        <div class="keyword-grid">
          <label v-for="keyword in COMMON_KEYWORDS" :key="keyword" class="keyword-checkbox"
            :class="{ selected: formData.keywords.includes(keyword) }">
            <input type="checkbox" :value="keyword" v-model="formData.keywords" class="checkbox-input" />
            <span class="keyword-text">{{ capitalize(keyword) }}</span>
          </label>
        </div>
      </div>

      <!-- Custom Keywords -->
      <div class="custom-keywords">
        <h3 class="subsection-title">Custom Keywords</h3>
        <div class="custom-input-group">
          <input v-model="customKeyword" type="text" class="custom-input" :class="{ invalid: customKeywordError }"
            placeholder="Enter custom keyword" @keyup.enter="addCustomKeyword" />
          <button type="button" class="btn-add-custom" @click="addCustomKeyword"
            :disabled="!customKeyword.trim() || !!customKeywordError">
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
          <span v-for="keyword in formData.keywords" :key="keyword" class="keyword-tag selected">
            {{ keyword }}
            <button type="button" class="remove-keyword" @click="removeKeyword(keyword)" title="Remove keyword">
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

.keywords-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.section-description {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--space-4) 0;
}

.subsection-title {
  color: var(--color-neutral-700);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-4) 0;
}

.selected-keywords {
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.keyword-tag {
  background: var(--color-primary-600);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  box-shadow: var(--shadow-sm);
}

.remove-keyword {
  background: none;
  border: none;
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-colors);
}

.remove-keyword:hover {
  background: rgba(255, 255, 255, 0.2);
}

.keyword-category {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.keyword-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-2);
}

.keyword-grid.small {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.keyword-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: var(--transition-colors);
  font-size: var(--font-size-sm);
}

.keyword-checkbox:hover {
  background: var(--color-primary-50);
}

.keyword-checkbox.selected {
  background: var(--color-primary-100);
  font-weight: var(--font-weight-semibold);
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary-600);
}

.keyword-text {
  user-select: none;
  color: var(--color-neutral-800);
}

.custom-keywords {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.custom-input-group {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.custom-input {
  flex: 1;
  padding: var(--space-3);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-base);
  font-size: var(--font-size-base);
  transition: var(--transition-colors);
}

.custom-input:focus {
  outline: none;
  border-color: var(--color-primary-600);
  box-shadow: var(--focus-ring);
}

.custom-input.invalid {
  border-color: var(--color-error-600);
}

.custom-input.invalid:focus {
  border-color: var(--color-error-600);
  box-shadow: var(--focus-ring-error);
}

.btn-add-custom {
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}

.btn-add-custom:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-add-custom:disabled {
  background: var(--color-neutral-400);
  cursor: not-allowed;
}

.ability-keywords {
  background: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.quick-add-btn {
  padding: var(--space-2) var(--space-3);
  background: white;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-all);
  text-align: center;
}

.quick-add-btn:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-600);
}

.quick-add-btn.selected {
  background: var(--color-primary-600);
  color: white;
  border-color: var(--color-primary-600);
}

.error-message {
  color: var(--color-error-600);
  font-size: var(--font-size-sm);
  margin: var(--space-1) 0;
}

.help-text {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-snug);
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