<template>
  <div class="characteristics-form">
    <h2 class="form-section-title">Characteristics</h2>
    
    <div class="characteristics-grid">
      <div class="form-group" v-for="(label, key) in characteristicLabels" :key="key">
        <label :for="`char-${key}`" class="form-label required">{{ label }}</label>
        <input 
          :id="`char-${key}`"
          v-model.number="formData.characteristics[key]"
          type="number" 
          class="form-input characteristic-input"
          :class="{ invalid: errors[key] }"
          min="-5" 
          max="10"
          :placeholder="'0'"
        />
        <div v-if="errors[key]" class="error-message">{{ errors[key] }}</div>
        <div class="help-text">
          Modifier: {{ formatModifier(formData.characteristics[key]) }}
        </div>
      </div>
    </div>
    
    <div class="characteristics-summary">
      <h3 class="summary-title">Characteristic Summary</h3>
      <div class="summary-grid">
        <div class="summary-item" v-for="(label, key) in characteristicLabels" :key="key">
          <span class="summary-label">{{ label }}:</span>
          <span class="summary-value">
            {{ formData.characteristics[key] }} ({{ formatModifier(formData.characteristics[key]) }})
          </span>
        </div>
      </div>
      
      <div class="highest-characteristic">
        <strong>Highest Characteristic:</strong> 
        {{ getHighestCharacteristic() }} ({{ Math.max(...Object.values(formData.characteristics)) }})
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

const characteristicLabels = {
  might: 'Might',
  agility: 'Agility', 
  reason: 'Reason',
  intuition: 'Intuition',
  presence: 'Presence'
} as const

const formData = reactive({
  characteristics: {
    might: props.modelValue.characteristics?.might || 0,
    agility: props.modelValue.characteristics?.agility || 0,
    reason: props.modelValue.characteristics?.reason || 0,
    intuition: props.modelValue.characteristics?.intuition || 0,
    presence: props.modelValue.characteristics?.presence || 0
  }
})

const errors = reactive({
  might: '',
  agility: '',
  reason: '',
  intuition: '',
  presence: ''
})

const validateCharacteristic = (key: string, value: number) => {
  if (typeof value !== 'number' || isNaN(value)) {
    errors[key as keyof typeof errors] = `${characteristicLabels[key as keyof typeof characteristicLabels]} must be a valid number`
  } else if (value < -5 || value > 10) {
    errors[key as keyof typeof errors] = `${characteristicLabels[key as keyof typeof characteristicLabels]} must be between -5 and 10`
  } else {
    errors[key as keyof typeof errors] = ''
  }
}

const formatModifier = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '+0'
  return value >= 0 ? `+${value}` : `${value}`
}

const getHighestCharacteristic = (): string => {
  const characteristics = formData.characteristics
  const maxValue = Math.max(...Object.values(characteristics))
  const maxKey = Object.keys(characteristics).find(
    key => characteristics[key as keyof typeof characteristics] === maxValue
  ) as keyof typeof characteristicLabels
  
  return characteristicLabels[maxKey] || 'None'
}

const isValid = computed(() => {
  return Object.values(errors).every(error => error === '')
})

const updateModelValue = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    characteristics: { ...formData.characteristics }
  })
}

// Watch for changes and validate
watch(formData, () => {
  Object.keys(formData.characteristics).forEach(key => {
    validateCharacteristic(key, formData.characteristics[key as keyof typeof formData.characteristics])
  })
  updateModelValue()
}, { deep: true })

// Watch for external changes
watch(() => props.modelValue.characteristics, (newCharacteristics) => {
  if (newCharacteristics) {
    Object.keys(formData.characteristics).forEach(key => {
      const typedKey = key as keyof typeof formData.characteristics
      if (newCharacteristics[typedKey] !== formData.characteristics[typedKey]) {
        formData.characteristics[typedKey] = newCharacteristics[typedKey] || 0
      }
    })
  }
}, { deep: true })

// Emit validity status
watch(isValid, (valid) => {
  emit('update:isValid', valid)
}, { immediate: true })

// Initial validation
Object.keys(formData.characteristics).forEach(key => {
  validateCharacteristic(key, formData.characteristics[key as keyof typeof formData.characteristics])
})
</script>

<style scoped>
.characteristics-form {
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

.characteristics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.characteristic-input {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  text-align: center;
  font-weight: 600;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.characteristic-input:focus {
  outline: none;
  border-color: #8b4513;
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.25);
}

.characteristic-input.invalid {
  border-color: #dc3545;
}

.characteristic-input.invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
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
  text-align: center;
  font-weight: 500;
}

.characteristics-summary {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.summary-title {
  color: #8b4513;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.summary-label {
  font-weight: 600;
  color: #495057;
}

.summary-value {
  font-weight: 600;
  color: #8b4513;
  font-family: 'Courier New', monospace;
}

.highest-characteristic {
  background: white;
  padding: 0.75rem;
  border-radius: 4px;
  border: 2px solid #8b4513;
  color: #8b4513;
  text-align: center;
  font-size: 1rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .characteristics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .characteristics-grid {
    grid-template-columns: 1fr;
  }
}
</style>