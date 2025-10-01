<template>
  <div class="defenses-form">
    <h2 class="form-section-title">Defenses</h2>
    
    <!-- Immunities Section -->
    <div class="defense-section">
      <h3 class="defense-title">Immunities</h3>
      <p class="defense-description">
        Damage types this monster is immune to or has reduced damage from.
      </p>
      
      <div class="defense-entries">
        <div 
          v-for="immunity in immunityEntries" 
          :key="`immunity-${immunity.id}`"
          class="defense-entry"
        >
          <input 
            v-model="immunity.type"
            type="text"
            class="damage-type-input"
            :list="`immunity-types`"
            placeholder="Damage type"
            @input="updateImmunity(immunity.id, immunity.type, immunity.value)"
          />
          <datalist id="immunity-types">
            <option v-for="type in DAMAGE_TYPES" :key="type" :value="type">
              {{ capitalize(type) }}
            </option>
          </datalist>
          
          <input 
            v-model.number="immunity.value"
            type="number"
            class="damage-value-input" 
            min="0"
            placeholder="Value"
            @input="updateImmunity(immunity.id, immunity.type, immunity.value)"
          />
          
          <button 
            type="button"
            class="btn-remove"
            @click="removeImmunityEntry(immunity.id)"
            title="Remove immunity"
          >
            ×
          </button>
        </div>
        
        <button 
          type="button" 
          class="btn-add"
          @click="addImmunityEntry"
        >
          + Add Immunity
        </button>
      </div>
      
      <div v-if="errors.immunities" class="error-message">{{ errors.immunities }}</div>
    </div>
    
    <!-- Weaknesses Section -->
    <div class="defense-section">
      <h3 class="defense-title">Weaknesses</h3>
      <p class="defense-description">
        Damage types this monster is vulnerable to or takes extra damage from.
      </p>
      
      <div class="defense-entries">
        <div 
          v-for="weakness in weaknessEntries" 
          :key="`weakness-${weakness.id}`"
          class="defense-entry"
        >
          <input 
            v-model="weakness.type"
            type="text"
            class="damage-type-input"
            :list="`weakness-types`"
            placeholder="Damage type"
            @input="updateWeakness(weakness.id, weakness.type, weakness.value)"
          />
          <datalist id="weakness-types">
            <option v-for="type in DAMAGE_TYPES" :key="type" :value="type">
              {{ capitalize(type) }}
            </option>
          </datalist>
          
          <input 
            v-model.number="weakness.value"
            type="number"
            class="damage-value-input" 
            min="0"
            placeholder="Value"
            @input="updateWeakness(weakness.id, weakness.type, weakness.value)"
          />
          
          <button 
            type="button"
            class="btn-remove"
            @click="removeWeaknessEntry(weakness.id)"
            title="Remove weakness"
          >
            ×
          </button>
        </div>
        
        <button 
          type="button" 
          class="btn-add"
          @click="addWeaknessEntry"
        >
          + Add Weakness
        </button>
      </div>
      
      <div v-if="errors.weaknesses" class="error-message">{{ errors.weaknesses }}</div>
    </div>
    
    <!-- Help Section -->
    <div class="help-section">
      <h4>Damage Type Reference</h4>
      <div class="damage-types-grid">
        <span v-for="type in DAMAGE_TYPES" :key="type" class="damage-type-badge">
          {{ capitalize(type) }}
        </span>
      </div>
      <p class="help-text">
        <strong>Immunities:</strong> Reduce incoming damage of that type by the specified amount.<br>
        <strong>Weaknesses:</strong> Take additional damage of that type equal to the specified amount.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { MonsterFormData } from '@/types/monster-forms'
import { DAMAGE_TYPES } from '@/types/monster-forms'

interface Props {
  modelValue: MonsterFormData
}

interface Emits {
  (e: 'update:modelValue', value: MonsterFormData): void
  (e: 'update:isValid', valid: boolean): void
}

interface DefenseEntry {
  id: string
  type: string
  value: number
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive({
  immunities: { ...props.modelValue.immunities } as Record<string, number>,
  weaknesses: { ...props.modelValue.weaknesses } as Record<string, number>
})

const errors = reactive({
  immunities: '',
  weaknesses: ''
})

const immunityEntries = ref<DefenseEntry[]>(
  Object.entries(formData.immunities).map(([type, value]) => ({
    id: Math.random().toString(36),
    type,
    value
  }))
)

const weaknessEntries = ref<DefenseEntry[]>(
  Object.entries(formData.weaknesses).map(([type, value]) => ({
    id: Math.random().toString(36),
    type,
    value
  }))
)

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const addImmunityEntry = () => {
  immunityEntries.value.push({
    id: Math.random().toString(36),
    type: '',
    value: 0
  })
}

const addWeaknessEntry = () => {
  weaknessEntries.value.push({
    id: Math.random().toString(36),
    type: '',
    value: 0
  })
}

const removeImmunityEntry = (id: string) => {
  const index = immunityEntries.value.findIndex(entry => entry.id === id)
  if (index > -1) {
    immunityEntries.value.splice(index, 1)
  }
  updateModelFromEntries()
}

const removeWeaknessEntry = (id: string) => {
  const index = weaknessEntries.value.findIndex(entry => entry.id === id)
  if (index > -1) {
    weaknessEntries.value.splice(index, 1)
  }
  updateModelFromEntries()
}

const updateImmunity = (id: string, type: string, value: number) => {
  const entry = immunityEntries.value.find(e => e.id === id)
  if (entry) {
    entry.type = type
    entry.value = value
  }
  updateModelFromEntries()
}

const updateWeakness = (id: string, type: string, value: number) => {
  const entry = weaknessEntries.value.find(e => e.id === id)
  if (entry) {
    entry.type = type
    entry.value = value
  }
  updateModelFromEntries()
}

const updateModelFromEntries = () => {
  // Update immunities
  const newImmunities: Record<string, number> = {}
  immunityEntries.value.forEach(entry => {
    if (entry.type.trim() && typeof entry.value === 'number') {
      newImmunities[entry.type.trim()] = entry.value
    }
  })
  formData.immunities = newImmunities

  // Update weaknesses  
  const newWeaknesses: Record<string, number> = {}
  weaknessEntries.value.forEach(entry => {
    if (entry.type.trim() && typeof entry.value === 'number') {
      newWeaknesses[entry.type.trim()] = entry.value
    }
  })
  formData.weaknesses = newWeaknesses

  validateDefenses()
  updateModelValue()
}

const validateDefenses = () => {
  errors.immunities = ''
  errors.weaknesses = ''
  
  // Check for overlap between immunities and weaknesses
  const immunityTypes = Object.keys(formData.immunities)
  const weaknessTypes = Object.keys(formData.weaknesses)
  const overlap = immunityTypes.filter(type => weaknessTypes.includes(type))
  
  if (overlap.length > 0) {
    errors.immunities = `Cannot have both immunity and weakness to: ${overlap.join(', ')}`
    errors.weaknesses = `Cannot have both immunity and weakness to: ${overlap.join(', ')}`
  }
}

const isValid = computed(() => {
  return Object.values(errors).every(error => error === '')
})

const updateModelValue = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    immunities: { ...formData.immunities },
    weaknesses: { ...formData.weaknesses }
  })
}

// Watch for external changes
watch(() => [props.modelValue.immunities, props.modelValue.weaknesses], ([newImmunities, newWeaknesses]) => {
  if (JSON.stringify(newImmunities) !== JSON.stringify(formData.immunities)) {
    formData.immunities = { ...newImmunities || {} }
    immunityEntries.value = Object.entries(formData.immunities).map(([type, value]) => ({
      id: Math.random().toString(36),
      type,
      value
    }))
  }
  if (JSON.stringify(newWeaknesses) !== JSON.stringify(formData.weaknesses)) {
    formData.weaknesses = { ...newWeaknesses || {} }
    weaknessEntries.value = Object.entries(formData.weaknesses).map(([type, value]) => ({
      id: Math.random().toString(36),
      type,
      value
    }))
  }
}, { deep: true })

// Emit validity status
watch(isValid, (valid) => {
  emit('update:isValid', valid)
}, { immediate: true })

// Initial validation
validateDefenses()
</script>

<style scoped>
.defenses-form {
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

.defense-section {
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  background: var(--color-neutral-50);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-colors);
}

.defense-section:hover {
  background: var(--color-neutral-25);
  border-color: var(--color-neutral-300);
}

.defense-title {
  color: var(--color-neutral-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2) 0;
}

.defense-description {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-4) 0;
  line-height: var(--line-height-relaxed);
}

.defense-entries {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.defense-entry {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-3);
  background: white;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-neutral-200);
  transition: var(--transition-colors);
  box-shadow: var(--shadow-sm);
}

.defense-entry:hover {
  border-color: var(--color-neutral-300);
  box-shadow: var(--shadow-md);
}

.damage-type-input,
.damage-type-select {
  flex: 2;
  padding: var(--space-2);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-neutral-50);
  color: var(--color-neutral-800);
  transition: var(--transition-input);
  font-family: var(--font-family-sans);
}

.damage-value-input {
  flex: 1;
  max-width: 80px;
  padding: var(--space-2);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  text-align: center;
  background: var(--color-neutral-50);
  color: var(--color-neutral-800);
  transition: var(--transition-input);
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-semibold);
}

.damage-type-input:focus,
.damage-type-select:focus,
.damage-value-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--focus-ring);
  background: white;
}

.damage-type-input:hover:not(:focus),
.damage-type-select:hover:not(:focus),
.damage-value-input:hover:not(:focus) {
  border-color: var(--color-neutral-300);
  background: white;
}

.btn-remove {
  background: var(--color-error-600);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: var(--transition-button);
  flex-shrink: 0;
}

.btn-remove:hover {
  background: var(--color-error-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-remove:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-error);
}

.btn-add {
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-button);
  align-self: flex-start;
}

.btn-add:hover {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-add:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.error-message {
  color: var(--color-error-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: var(--font-weight-medium);
}

.error-message::before {
  content: '⚠';
  font-size: var(--font-size-base);
}

.help-section {
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-top: var(--space-8);
  box-shadow: var(--shadow-sm);
}

.help-section h4 {
  color: var(--color-primary-700);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-4) 0;
}

.damage-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.damage-type-badge {
  background: var(--color-neutral-200);
  color: var(--color-neutral-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  text-align: center;
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--color-neutral-300);
  transition: var(--transition-colors);
}

.damage-type-badge:hover {
  background: var(--color-neutral-300);
  border-color: var(--color-neutral-400);
}

.help-text {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-section-title {
    font-size: var(--font-size-lg);
  }

  .defense-section {
    padding: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .defense-entry {
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  
  .damage-type-input,
  .damage-type-select {
    flex: 1;
    min-width: 150px;
  }
  
  .damage-value-input {
    flex: 0;
    min-width: 80px;
  }
  
  .damage-types-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-1);
  }

  .help-section {
    padding: var(--space-4);
    margin-top: var(--space-6);
  }
}

@media (max-width: 480px) {
  .defense-section {
    padding: var(--space-3);
  }

  .help-section {
    padding: var(--space-3);
  }
  
  .damage-types-grid {
    grid-template-columns: 1fr;
  }

  .defense-entry {
    flex-direction: column;
    align-items: stretch;
  }

  .damage-type-input,
  .damage-type-select,
  .damage-value-input {
    flex: none;
    min-width: auto;
    width: 100%;
  }

  .btn-remove {
    align-self: center;
    margin-top: var(--space-2);
  }
}
</style>