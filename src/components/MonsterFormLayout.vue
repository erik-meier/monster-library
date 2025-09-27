<template>
  <div class="monster-form-layout">
    <header class="form-header">
      <h1 class="form-title">
        {{ isEditing ? 'Edit Monster' : 'Create Monster' }}: {{ modelValue.name || 'Unnamed Monster' }}
      </h1>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button type="button" class="btn btn-primary" @click="handleSave" :disabled="!isValid">
          {{ isEditing ? 'Save Changes' : 'Create Monster' }}
        </button>
      </div>
    </header>

    <nav class="form-nav">
      <button 
        v-for="section in sections" 
        :key="section.id"
        type="button"
        class="nav-btn"
        :class="{ 
          active: currentSection === section.id,
          invalid: section.isValid === false 
        }"
        @click="currentSection = section.id"
      >
        {{ section.label }}
        <span v-if="section.isValid === false" class="invalid-indicator">!</span>
      </button>
    </nav>

    <main class="form-content">
      <div class="form-section" v-show="currentSection === 'basic'">
        <BasicInfoForm :model-value="modelValue" @update:model-value="handleUpdate" @update:isValid="updateSectionValidity('basic', $event)" />
      </div>
      
      <div class="form-section" v-show="currentSection === 'stats'">
        <StatsForm :model-value="modelValue" @update:model-value="handleUpdate" @update:isValid="updateSectionValidity('stats', $event)" />
      </div>
      
      <div class="form-section" v-show="currentSection === 'characteristics'">
        <CharacteristicsForm :model-value="modelValue" @update:model-value="handleUpdate" @update:isValid="updateSectionValidity('characteristics', $event)" />
      </div>
      
      <div class="form-section" v-show="currentSection === 'defenses'">
        <DefensesForm :model-value="modelValue" @update:model-value="handleUpdate" @update:isValid="updateSectionValidity('defenses', $event)" />
      </div>
      
      <div class="form-section" v-show="currentSection === 'abilities'">
        <AbilitiesForm :model-value="modelValue" @update:model-value="handleUpdate" @update:isValid="updateSectionValidity('abilities', $event)" />
      </div>
      
      <div class="form-section" v-show="currentSection === 'keywords'">
        <KeywordsForm :model-value="modelValue" @update:model-value="handleUpdate" @update:isValid="updateSectionValidity('keywords', $event)" />
      </div>
      
      <div class="form-section" v-show="currentSection === 'source'">
        <SourceInfoForm :model-value="modelValue" @update:model-value="handleUpdate" @update:isValid="updateSectionValidity('source', $event)" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MonsterFormData, FormSection } from '@/types/monster-forms'
import BasicInfoForm from './BasicInfoForm.vue'
import StatsForm from './StatsForm.vue'
import CharacteristicsForm from './CharacteristicsForm.vue'
import DefensesForm from './DefensesForm.vue'
import AbilitiesForm from './AbilitiesForm.vue'
import KeywordsForm from './KeywordsForm.vue'
import SourceInfoForm from './SourceInfoForm.vue'

interface Props {
  modelValue: MonsterFormData
  isEditing?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: MonsterFormData): void
  (e: 'save', value: MonsterFormData): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentSection = ref('basic')

const sections = ref<FormSection[]>([
  { id: 'basic', label: 'Basic Info', component: 'BasicInfoForm', isValid: true },
  { id: 'stats', label: 'Stats', component: 'StatsForm', isValid: true },
  { id: 'characteristics', label: 'Characteristics', component: 'CharacteristicsForm', isValid: true },
  { id: 'defenses', label: 'Defenses', component: 'DefensesForm', isValid: true },
  { id: 'abilities', label: 'Abilities', component: 'AbilitiesForm', isValid: true },
  { id: 'keywords', label: 'Keywords', component: 'KeywordsForm', isValid: true },
  { id: 'source', label: 'Source Info', component: 'SourceInfoForm', isValid: true }
])

const isValid = computed(() => {
  return sections.value.every(section => section.isValid !== false)
})

const updateSectionValidity = (sectionId: string, valid: boolean) => {
  const section = sections.value.find(s => s.id === sectionId)
  if (section) {
    section.isValid = valid
  }
}

const handleUpdate = (value: MonsterFormData) => {
  emit('update:modelValue', value)
}

const handleSave = () => {
  if (isValid.value) {
    emit('save', props.modelValue)
  }
}
</script>

<style scoped>
.monster-form-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1.5rem;
}

.form-title {
  color: #8b4513;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #8b4513;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #a0522d;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.form-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.nav-btn {
  position: relative;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background-color: #f8f9fa;
  border-color: #8b4513;
}

.nav-btn.active {
  background-color: #8b4513;
  color: white;
  border-color: #8b4513;
}

.nav-btn.invalid {
  border-color: #dc3545;
  color: #dc3545;
}

.nav-btn.invalid.active {
  background-color: #dc3545;
  color: white;
}

.invalid-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.form-content {
  min-height: 400px;
}

.form-section {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .monster-form-layout {
    padding: 0.5rem;
  }
  
  .form-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .form-actions {
    justify-content: center;
  }
  
  .form-nav {
    justify-content: center;
  }
  
  .nav-btn {
    flex: 1;
    min-width: 120px;
    text-align: center;
  }
  
  .form-title {
    font-size: 1.3rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .form-nav {
    flex-direction: column;
  }
  
  .nav-btn {
    flex: none;
  }
}
</style>