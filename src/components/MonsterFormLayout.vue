<template>
  <div class="monster-form-layout">
    <header class="form-header">
      <h1 class="form-title">
        {{ isEditing ? 'Edit Monster' : 'Create Monster' }}: {{ modelValue.name || 'Unnamed Monster' }}
      </h1>
      <div class="form-actions">
        <button type="button" class="btn btn-icon-only" @click="showHelp = true" title="Help (?)">
          <span class="btn-icon">❓</span>
        </button>
        <button type="button" class="btn btn-secondary" @click="handleCancel">
          Cancel
        </button>
        <button 
          v-if="!isEditing" 
          type="button" 
          class="btn btn-outline" 
          @click="showTemplates = !showTemplates"
        >
          <span class="btn-icon">📋</span>
          {{ showTemplates ? 'Hide Templates' : 'Browse Templates' }}
        </button>
        <button type="button" class="btn btn-primary" @click="handleSave" :disabled="!isValid">
          {{ isEditing ? 'Save Changes' : 'Create Monster' }}
        </button>
      </div>
    </header>

    <!-- Help Modal -->
    <HelpModal :is-open="showHelp" @close="showHelp = false" />

    <!-- Templates Section -->
    <div v-if="showTemplates && !isEditing" class="templates-section">
      <MonsterTemplates @template-selected="handleTemplateSelected" />
    </div>

    <nav class="form-nav">
      <!-- Progress Indicator -->
      <div class="progress-indicator">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <span class="progress-text">
          Step {{ currentSectionIndex + 1 }} of {{ sections.length }}
        </span>
      </div>
      
      <!-- Section Navigation Tabs -->
      <div class="nav-tabs">
        <button 
          v-for="(section, index) in sections" 
          :key="section.id"
          type="button"
          class="nav-btn"
          :class="{ 
            active: currentSection === section.id,
            invalid: section.isValid === false,
            completed: index < currentSectionIndex && section.isValid !== false
          }"
          @click="navigateToSection(section.id, index)"
        >
          <span class="section-number">{{ index + 1 }}</span>
          {{ section.label }}
          <span v-if="section.isValid === false" class="invalid-indicator">!</span>
          <span v-else-if="index < currentSectionIndex" class="completed-indicator">✓</span>
        </button>
      </div>
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

    <!-- Wizard Navigation -->
    <footer class="wizard-nav">
      <div class="nav-buttons">
        <button 
          type="button" 
          class="btn btn-secondary"
          @click="previousSection"
          :disabled="currentSectionIndex === 0"
        >
          ← Previous
        </button>
        
        <div class="center-info">
          <span class="current-section-name">{{ currentSectionName }}</span>
        </div>
        
        <button 
          v-if="currentSectionIndex < sections.length - 1"
          type="button" 
          class="btn btn-primary"
          @click="nextSection"
          :disabled="!canProceedToNext"
        >
          Next →
        </button>
        
        <button 
          v-else
          type="button" 
          class="btn btn-success" 
          @click="handleSave" 
          :disabled="!isValid"
        >
          {{ isEditing ? 'Save Changes' : 'Create Monster' }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { MonsterFormData, FormSection, MonsterItem } from '@/types/monster-forms'
import BasicInfoForm from './BasicInfoForm.vue'
import StatsForm from './StatsForm.vue'
import CharacteristicsForm from './CharacteristicsForm.vue'
import DefensesForm from './DefensesForm.vue'
import AbilitiesForm from './AbilitiesForm.vue'
import KeywordsForm from './KeywordsForm.vue'
import SourceInfoForm from './SourceInfoForm.vue'
import MonsterTemplates from './MonsterTemplates.vue'
import HelpModal from './HelpModal.vue'

interface TemplateMonster {
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
  keywords: string[]
  description: string
  size: { value: number; letter: string }
  speed: number
  stamina: number
  stability: number
  freeStrike: number
  characteristics: {
    might: number
    agility: number
    reason: number
    intuition: number
    presence: number
  }
  movementTypes: string[]
  items: MonsterItem[]
}

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

// Help modal state
const showHelp = ref(false)

// Templates state
const showTemplates = ref(false)

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

const currentSectionIndex = computed(() => {
  return sections.value.findIndex(s => s.id === currentSection.value)
})

const currentSectionName = computed(() => {
  return sections.value[currentSectionIndex.value]?.label || ''
})

const progressPercentage = computed(() => {
  return ((currentSectionIndex.value + 1) / sections.value.length) * 100
})

const isValid = computed(() => {
  return sections.value.every(section => section.isValid !== false)
})

const canProceedToNext = computed(() => {
  const current = sections.value[currentSectionIndex.value]
  return current && current.isValid !== false
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

const handleCancel = () => {
  emit('cancel')
}

// Wizard navigation methods
const navigateToSection = (sectionId: string, index: number) => {
  // Allow navigation to any completed section or the current/next section
  if (index <= currentSectionIndex.value + 1) {
    currentSection.value = sectionId
  }
}

const nextSection = () => {
  if (currentSectionIndex.value < sections.value.length - 1 && canProceedToNext.value) {
    const nextIndex = currentSectionIndex.value + 1
    currentSection.value = sections.value[nextIndex].id
  }
}

const previousSection = () => {
  if (currentSectionIndex.value > 0) {
    const prevIndex = currentSectionIndex.value - 1
    currentSection.value = sections.value[prevIndex].id
  }
}

// Keyboard navigation and shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+S or Cmd+S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    handleSave()
    return
  }

  // Escape to cancel (but not if help modal is open)
  if (event.key === 'Escape' && !showHelp.value) {
    event.preventDefault()
    handleCancel()
    return
  }

  // Only handle arrow keys if no input is focused
  if (event.target && (event.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT/)) {
    return
  }
  
  if (event.key === 'ArrowRight' && canProceedToNext.value) {
    event.preventDefault()
    nextSection()
  } else if (event.key === 'ArrowLeft' && currentSectionIndex.value > 0) {
    event.preventDefault()
    previousSection()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Template handling
function handleTemplateSelected(template: TemplateMonster) {
  // Apply template data to form
  const updatedForm: MonsterFormData = {
    ...props.modelValue,
    name: `${template.name} (Custom)`,
    level: template.level,
    ev: template.ev,
    role: template.role,
    organization: template.organization.toLowerCase(), // Normalize to lowercase
    keywords: template.keywords || [],
    size: template.size || { value: 1, letter: 'M' },
    speed: template.speed,
    stamina: template.stamina,
    stability: template.stability,
    freeStrike: template.freeStrike,
    characteristics: template.characteristics,
    movementTypes: template.movementTypes || ['walk'],
    immunities: {},
    weaknesses: {},
    items: template.items || []
  }
  
  emit('update:modelValue', updatedForm)
  showTemplates.value = false
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

.btn-outline {
  background-color: transparent;
  color: #8b4513;
  border: 1px solid #8b4513;
}

.btn-outline:hover {
  background-color: #8b4513;
  color: white;
}

.btn-icon {
  margin-right: 0.5rem;
}

.btn-icon-only {
  background-color: transparent;
  color: #8b4513;
  border: 1px solid #8b4513;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-only:hover {
  background-color: #f8f9fa;
}

.btn-icon-only .btn-icon {
  margin: 0;
}

.templates-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-nav {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1.5rem;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b4513, #a0522d);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
  white-space: nowrap;
}

.nav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nav-btn {
  position: relative;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-number {
  background: #f8f9fa;
  color: #6c757d;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #8b4513;
}

.nav-btn.active {
  background-color: #8b4513;
  color: white;
  border-color: #8b4513;
}

.nav-btn.active .section-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-btn.completed {
  border-color: #28a745;
  color: #28a745;
}

.nav-btn.completed .section-number {
  background: #28a745;
  color: white;
}

.nav-btn.invalid {
  border-color: #dc3545;
  color: #dc3545;
}

.nav-btn.invalid.active {
  background-color: #dc3545;
  color: white;
}

.invalid-indicator, .completed-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.completed-indicator {
  background: #28a745;
}

.form-content {
  min-height: 400px;
  margin-bottom: 2rem;
}

.wizard-nav {
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
  margin: 0 -1rem -1rem -1rem;
  padding: 1.5rem;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.center-info {
  flex: 1;
  text-align: center;
}

.current-section-name {
  font-weight: 600;
  color: #8b4513;
  font-size: 1.1rem;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
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
  
  .progress-indicator {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .nav-tabs {
    justify-content: center;
    gap: 0.25rem;
  }
  
  .nav-btn {
    flex: 1;
    min-width: 100px;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .section-number {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
  
  .form-title {
    font-size: 1.3rem;
    text-align: center;
  }
  
  .nav-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .center-info {
    order: -1;
  }
  
  .current-section-name {
    font-size: 1rem;
  }
  
  .wizard-nav {
    padding: 1rem;
    margin: 0 -0.5rem -0.5rem -0.5rem;
  }
}

@media (max-width: 480px) {
  .nav-tabs {
    flex-direction: column;
  }
  
  .nav-btn {
    flex: none;
    justify-content: center;
  }
}
</style>