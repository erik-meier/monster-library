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

.defense-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

.defense-title {
  color: #495057;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.defense-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.defense-entries {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.defense-entry {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #ced4da;
}

.damage-type-input,
.damage-type-select {
  flex: 2;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.damage-value-input {
  flex: 1;
  max-width: 80px;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

.damage-type-input:focus,
.damage-type-select:focus,
.damage-value-input:focus {
  outline: none;
  border-color: #8b4513;
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.25);
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-remove:hover {
  background: #c82333;
}

.btn-add {
  padding: 0.75rem 1rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-start;
}

.btn-add:hover {
  background: #a0522d;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.help-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.help-section h4 {
  color: #8b4513;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.damage-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.damage-type-badge {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
  font-weight: 500;
}

.help-text {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .defense-entry {
    flex-wrap: wrap;
  }
  
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
  }
}

@media (max-width: 480px) {
  .defense-section {
    padding: 1rem;
  }
  
  .damage-types-grid {
    grid-template-columns: 1fr;
  }
}
</style>