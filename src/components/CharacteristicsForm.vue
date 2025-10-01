<template>
  <div class="characteristics-form">
    <h2 class="form-section-title">Characteristics</h2>

    <div class="characteristics-grid">
      <div class="form-group" v-for="(label, key) in characteristicLabels" :key="key">
        <label :for="`char-${key}`" class="form-label required">{{ label }}</label>
        <input :id="`char-${key}`" v-model.number="formData.characteristics[key]" type="number"
          class="form-input characteristic-input" :class="{ invalid: errors[key] }" min="-9" max="99"
          :placeholder="'0'" />
        <div v-if="errors[key]" class="error-message">{{ errors[key] }}</div>
      </div>
    </div>

    <div class="highest-characteristic">
      <strong>Highest Characteristic:</strong>
      {{ getHighestCharacteristic() }} ({{ formatCharacteristic(Math.max(...Object.values(formData.characteristics)))
      }})
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
  } else if (value < -9 || value > 99) {
    errors[key as keyof typeof errors] = `${characteristicLabels[key as keyof typeof characteristicLabels]} must be between -9 and 99`
  } else {
    errors[key as keyof typeof errors] = ''
  }
}

const getHighestCharacteristic = (): string => {
  const characteristics = formData.characteristics
  const maxValue = Math.max(...Object.values(characteristics))
  const maxKey = Object.keys(characteristics).find(
    key => characteristics[key as keyof typeof characteristics] === maxValue
  ) as keyof typeof characteristicLabels

  return characteristicLabels[maxKey] || 'None'
}

const formatCharacteristic = (value: number): string => {
  return value > 0 ? `+${value}` : `${value}`
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

.characteristics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
  font-size: var(--font-size-sm);
  display: block;
  margin-bottom: var(--space-1);
}

.form-label.required::after {
  content: ' *';
  color: var(--color-error-600);
}

.characteristic-input {
  padding: var(--padding-input);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  background: var(--color-neutral-50);
  color: var(--color-neutral-800);
  transition: var(--transition-input);
  font-family: var(--font-family-sans);
}

.characteristic-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--focus-ring);
  background: white;
}

.characteristic-input:hover:not(:focus) {
  border-color: var(--color-neutral-300);
  background: white;
}

.characteristic-input.invalid {
  border-color: var(--color-error-500);
}

.characteristic-input.invalid:focus {
  box-shadow: var(--focus-ring-error);
}

.error-message {
  color: var(--color-error-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: var(--font-weight-medium);
}

.error-message::before {
  content: '⚠';
  font-size: var(--font-size-base);
}

.highest-characteristic {
  background: var(--color-primary-50);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-primary-400);
  color: var(--color-primary-700);
  text-align: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin-top: var(--space-4);
  box-shadow: var(--shadow-sm);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-section-title {
    font-size: var(--font-size-lg);
  }
  
  .characteristics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }

  .characteristic-input {
    padding: var(--space-2);
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .characteristics-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .form-group {
    gap: var(--space-1);
  }
  
  .highest-characteristic {
    margin-top: var(--space-3);
    padding: var(--space-2);
    font-size: var(--font-size-sm);
  }
}
</style>