<template>
  <div class="stats-form">
    <h2 class="form-section-title">Combat Stats</h2>

    <div class="form-grid">
      <!-- Size -->
      <div class="form-group">
        <label class="form-label required">Size</label>
        <div class="size-input-group">
          <input v-model.number="formData.size.value" type="number" class="form-input size-number"
            :class="{ invalid: errors.sizeValue }" min="0" max="10" placeholder="1" />
          <select v-if="formData.size.value === 1" v-model="formData.size.letter" class="form-select size-letter"
            :class="{ invalid: errors.sizeLetter }">
            <option value="">Size</option>
            <option v-for="letter in availableSizeLetters" :key="letter" :value="letter">
              {{ letter }}
            </option>
          </select>
        </div>
        <div v-if="errors.sizeValue || errors.sizeLetter" class="error-message">
          {{ errors.sizeValue || errors.sizeLetter }}
        </div>
        <div class="help-text">Size value with optional letter (T, S, M, L). Examples: 1M, 2, 3</div>
      </div>

      <!-- Core Combat Stats -->
      <div class="stats-row">
        <div class="form-group">
          <label for="monster-speed" class="form-label required">Speed</label>
          <input id="monster-speed" v-model.number="formData.speed" type="number" class="form-input"
            :class="{ invalid: errors.speed }" min="0" placeholder="6" />
          <div v-if="errors.speed" class="error-message">{{ errors.speed }}</div>
          <div class="help-text">Movement speed in squares</div>
        </div>

        <div class="form-group">
          <label for="monster-stamina" class="form-label required">Stamina</label>
          <input id="monster-stamina" v-model.number="formData.stamina" type="number" class="form-input"
            :class="{ invalid: errors.stamina }" min="1" placeholder="10" />
          <div v-if="errors.stamina" class="error-message">{{ errors.stamina }}</div>
          <div class="help-text">Health points</div>
        </div>

        <div class="form-group">
          <label for="monster-stability" class="form-label required">Stability</label>
          <input id="monster-stability" v-model.number="formData.stability" type="number" class="form-input"
            :class="{ invalid: errors.stability }" placeholder="0" />
          <div v-if="errors.stability" class="error-message">{{ errors.stability }}</div>
          <div class="help-text">Resistance to forced movement</div>
        </div>

        <div class="form-group">
          <label for="monster-free-strike" class="form-label required">Free Strike</label>
          <input id="monster-free-strike" v-model.number="formData.freeStrike" type="number" class="form-input"
            :class="{ invalid: errors.freeStrike }" min="0" placeholder="2" />
          <div v-if="errors.freeStrike" class="error-message">{{ errors.freeStrike }}</div>
          <div class="help-text">Free strike damage</div>
        </div>
      </div>

      <!-- Movement Types -->
      <div class="form-group">
        <label class="form-label">Movement Types</label>
        <div class="checkbox-group">
          <label v-for="moveType in MOVEMENT_TYPES" :key="moveType" class="checkbox-label">
            <input type="checkbox" :value="moveType" v-model="formData.movementTypes" class="checkbox-input" />
            <span class="checkbox-text">{{ capitalize(moveType) }}</span>
          </label>
        </div>
        <div class="help-text">Select all movement types this monster can use</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { MonsterFormData, SizeLetter } from '@/types/monster-forms'
import { SIZE_LETTERS, MOVEMENT_TYPES } from '@/types/monster-forms'

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
  size: {
    value: props.modelValue.size?.value || 1,
    letter: props.modelValue.size?.letter || ''
  },
  speed: props.modelValue.speed || 6,
  stamina: props.modelValue.stamina || 10,
  stability: props.modelValue.stability || 0,
  freeStrike: props.modelValue.freeStrike || 2,
  movementTypes: props.modelValue.movementTypes || ['walk']
})

const errors = reactive({
  sizeValue: '',
  sizeLetter: '',
  speed: '',
  stamina: '',
  stability: '',
  freeStrike: ''
})

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const availableSizeLetters = computed(() => {
  // Size letters are available for size value 1
  return SIZE_LETTERS
})

const validateField = (field: string, value: unknown) => {
  switch (field) {
    case 'sizeValue':
      if (!value || typeof value !== 'number' || value < 0 || value > 10) {
        errors.sizeValue = 'Size value must be between 0 and 10'
      } else {
        errors.sizeValue = ''
      }
      break

    case 'sizeLetter':
      if (formData.size.value === 1) {
        if (!value || typeof value !== 'string' || !SIZE_LETTERS.includes(value as SizeLetter)) {
          errors.sizeLetter = 'Please select a valid size letter for size 1'
        } else {
          errors.sizeLetter = ''
        }
      } else if (formData.size.value > 1) {
        // For sizes > 1, allow any valid size letter or empty
        if (value && typeof value === 'string' && !SIZE_LETTERS.includes(value as SizeLetter)) {
          errors.sizeLetter = 'Please select a valid size letter'
        } else {
          errors.sizeLetter = ''
        }
      } else {
        errors.sizeLetter = ''
      }
      break

    case 'speed':
      if (!value && value !== 0 || typeof value !== 'number' || value < 0) {
        errors.speed = 'Speed must be 0 or greater'
      } else {
        errors.speed = ''
      }
      break

    case 'stamina':
      if (!value || typeof value !== 'number' || value < 1) {
        errors.stamina = 'Stamina must be at least 1'
      } else {
        errors.stamina = ''
      }
      break

    case 'stability':
      if (typeof value !== 'number' && value !== 0) {
        errors.stability = 'Stability must be a number'
      } else {
        errors.stability = ''
      }
      break

    case 'freeStrike':
      if (value !== 0 && !value || typeof value !== 'number' || value < 0) {
        errors.freeStrike = 'Free Strike must be 0 or greater'
      } else {
        errors.freeStrike = ''
      }
      break
  }
}

const isValid = computed(() => {
  return Object.values(errors).every(error => error === '')
})

const updateModelValue = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    size: {
      value: formData.size.value,
      letter: formData.size.letter
    },
    speed: formData.speed,
    stamina: formData.stamina,
    stability: formData.stability,
    freeStrike: formData.freeStrike,
    movementTypes: formData.movementTypes
  })
}

// Watch for changes and validate
watch(() => formData.size.value, (newValue) => {
  validateField('sizeValue', newValue)
  validateField('sizeLetter', formData.size.letter)
  updateModelValue()
})

watch(() => formData.size.letter, (newValue) => {
  validateField('sizeLetter', newValue)
  updateModelValue()
})

watch([() => formData.speed, () => formData.stamina, () => formData.stability, () => formData.freeStrike], () => {
  validateField('speed', formData.speed)
  validateField('stamina', formData.stamina)
  validateField('stability', formData.stability)
  validateField('freeStrike', formData.freeStrike)
  updateModelValue()
})

watch(() => formData.movementTypes, () => {
  updateModelValue()
}, { deep: true })

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue.size?.value !== formData.size.value) {
    formData.size.value = newValue.size?.value || 1
  }
  if (newValue.size?.letter !== formData.size.letter) {
    formData.size.letter = newValue.size?.letter || ''
  }
  if (newValue.speed !== formData.speed) {
    formData.speed = newValue.speed || 6
  }
  if (newValue.stamina !== formData.stamina) {
    formData.stamina = newValue.stamina || 10
  }
  if (newValue.stability !== formData.stability) {
    formData.stability = newValue.stability || 0
  }
  if (newValue.freeStrike !== formData.freeStrike) {
    formData.freeStrike = newValue.freeStrike || 2
  }
  if (JSON.stringify(newValue.movementTypes) !== JSON.stringify(formData.movementTypes)) {
    formData.movementTypes = newValue.movementTypes || ['walk']
  }
}, { deep: true })

// Emit validity status
watch(isValid, (valid) => {
  emit('update:isValid', valid)
}, { immediate: true })

// Initial validation
validateField('sizeValue', formData.size.value)
validateField('sizeLetter', formData.size.letter)
validateField('speed', formData.speed)
validateField('stamina', formData.stamina)
validateField('stability', formData.stability)
validateField('freeStrike', formData.freeStrike)
</script>

<style scoped>
.stats-form {
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

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.size-input-group {
  display: flex;
  gap: 0.5rem;
}

.size-number {
  flex: 1;
  max-width: 100px;
}

.size-letter {
  flex: 1;
  max-width: 120px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #8b4513;
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.25);
}

.form-input.invalid,
.form-select.invalid {
  border-color: #dc3545;
}

.form-input.invalid:focus,
.form-select.invalid:focus {
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
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #f8f9fa;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #8b4513;
}

.checkbox-text {
  user-select: none;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
  }

  .checkbox-group {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>