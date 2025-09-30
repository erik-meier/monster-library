<template>
  <div class="stats-form">
    <h2 class="form-section-title">Combat Stats</h2>

    <div class="form-grid">
      <!-- Size -->
      <div class="form-group">
        <label class="form-label required">Size</label>
        <div class="size-input-group">
          <input v-model.number="formData.size.value" type="number" class="form-input size-number"
            :class="{ invalid: errors.sizeValue }" min="1" max="99" placeholder="1" aria-label="Size value"
            :aria-invalid="!!errors.sizeValue" :aria-describedby="errors.sizeValue ? 'size-value-error' : 'size-help'"
            required />
          <select v-if="formData.size.value === 1" v-model="formData.size.letter" class="form-select size-letter"
            :class="{ invalid: errors.sizeLetter }" aria-label="Size letter" :aria-invalid="!!errors.sizeLetter"
            :aria-describedby="errors.sizeLetter ? 'size-letter-error' : 'size-help'" required>
            <option value="">Size</option>
            <option v-for="letter in availableSizeLetters" :key="letter" :value="letter">
              {{ letter }}
            </option>
          </select>
        </div>
        <div v-if="errors.sizeValue" id="size-value-error" class="error-message" role="alert">
          {{ errors.sizeValue }}
        </div>
        <div v-if="errors.sizeLetter" id="size-letter-error" class="error-message" role="alert">
          {{ errors.sizeLetter }}
        </div>
        <div id="size-help" class="help-text">Size value with optional letter (T, S, M, L). Examples: 1M, 2, 3</div>
      </div>

      <!-- Core Combat Stats -->
      <div class="stats-row">
        <div class="form-group">
          <label for="monster-speed" class="form-label required">Speed</label>
          <input id="monster-speed" v-model.number="formData.speed" type="number" class="form-input"
            :class="{ invalid: errors.speed }" min="0" placeholder="6" :aria-invalid="!!errors.speed"
            :aria-describedby="errors.speed ? 'speed-error' : 'speed-help'" required />
          <div v-if="errors.speed" id="speed-error" class="error-message" role="alert">{{ errors.speed }}</div>
          <div id="speed-help" class="help-text">Movement speed in squares</div>
        </div>

        <div class="form-group">
          <label for="monster-stamina" class="form-label required">Stamina</label>
          <input id="monster-stamina" v-model.number="formData.stamina" type="number" class="form-input"
            :class="{ invalid: errors.stamina }" min="1" placeholder="10" :aria-invalid="!!errors.stamina"
            :aria-describedby="errors.stamina ? 'stamina-error' : 'stamina-help'" required />
          <div v-if="errors.stamina" id="stamina-error" class="error-message" role="alert">{{ errors.stamina }}</div>
          <div id="stamina-help" class="help-text">Health points</div>
        </div>

        <div class="form-group">
          <label for="monster-stability" class="form-label required">Stability</label>
          <input id="monster-stability" v-model.number="formData.stability" type="number" class="form-input"
            :class="{ invalid: errors.stability }" placeholder="0" :aria-invalid="!!errors.stability"
            :aria-describedby="errors.stability ? 'stability-error' : 'stability-help'" required />
          <div v-if="errors.stability" id="stability-error" class="error-message" role="alert">{{ errors.stability }}
          </div>
          <div id="stability-help" class="help-text">Resistance to forced movement</div>
        </div>

        <div class="form-group">
          <label for="monster-free-strike" class="form-label required">Free Strike</label>
          <input id="monster-free-strike" v-model.number="formData.freeStrike" type="number" class="form-input"
            :class="{ invalid: errors.freeStrike }" min="0" placeholder="2" :aria-invalid="!!errors.freeStrike"
            :aria-describedby="errors.freeStrike ? 'free-strike-error' : 'free-strike-help'" required />
          <div v-if="errors.freeStrike" id="free-strike-error" class="error-message" role="alert">{{ errors.freeStrike
            }}</div>
          <div id="free-strike-help" class="help-text">Free strike damage</div>
        </div>
      </div>

      <!-- Movement Types -->
      <fieldset class="form-group">
        <legend class="form-label">Movement Types</legend>
        <div class="checkbox-group" role="group" aria-labelledby="movement-types-legend">
          <label v-for="moveType in MOVEMENT_TYPES" :key="moveType" class="checkbox-label">
            <input type="checkbox" :value="moveType" v-model="formData.movementTypes" class="checkbox-input"
              :aria-describedby="'movement-help'" />
            <span class="checkbox-text">{{ capitalize(moveType) }}</span>
          </label>
        </div>
        <div id="movement-help" class="help-text">Select all movement types this monster can use</div>
      </fieldset>
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
      if (!value || typeof value !== 'number' || value < 1 || value > 99) {
        errors.sizeValue = 'Size value must be between 1 and 99'
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

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
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

.size-input-group {
  display: flex;
  gap: var(--space-2);
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
  gap: var(--space-4);
}

/* Use design system form styles - remove local overrides */

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

.help-text {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  line-height: var(--line-height-relaxed);
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
  padding: var(--space-3);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background: var(--color-neutral-50);
  transition: var(--transition-colors);
}

.checkbox-group:hover {
  border-color: var(--color-neutral-300);
  background: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  transition: var(--transition-colors);
  padding: var(--space-1);
  border-radius: var(--radius-sm);
}

.checkbox-label:hover {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary-600);
}

.checkbox-text {
  user-select: none;
  font-weight: var(--font-weight-medium);
}

/* Fieldset and legend styling */
fieldset.form-group {
  border: none;
  padding: 0;
  margin: 0;
}

fieldset.form-group legend {
  padding: 0;
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-section-title {
    font-size: var(--font-size-lg);
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .checkbox-group {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-2);
  }

  .size-input-group {
    flex-direction: column;
  }

  .size-number,
  .size-letter {
    max-width: none;
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