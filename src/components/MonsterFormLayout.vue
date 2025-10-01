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
        <button v-if="!isEditing" type="button" class="btn btn-outline" @click="showTemplates = !showTemplates">
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
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        <span class="progress-text">
          Step {{ currentSectionIndex + 1 }} of {{ sections.length }}
        </span>
      </div>

      <!-- Section Navigation Tabs -->
      <div class="nav-tabs">
        <button v-for="(section, index) in sections" :key="section.id" type="button" class="nav-btn" :class="{
          active: currentSection === section.id,
          invalid: section.isValid === false,
          completed: index < currentSectionIndex && section.isValid !== false
        }" @click="navigateToSection(section.id, index)">
          <span class="section-number">{{ index + 1 }}</span>
          {{ section.label }}
          <span v-if="section.isValid === false" class="invalid-indicator">!</span>
          <span v-else-if="index < currentSectionIndex" class="completed-indicator">✓</span>
        </button>
      </div>
    </nav>

    <main class="form-content">
      <div class="form-section" v-show="currentSection === 'basic'">
        <BasicInfoForm :model-value="modelValue" @update:model-value="handleUpdate"
          @update:isValid="updateSectionValidity('basic', $event)" />
      </div>

      <div class="form-section" v-show="currentSection === 'stats'">
        <StatsForm :model-value="modelValue" @update:model-value="handleUpdate"
          @update:isValid="updateSectionValidity('stats', $event)" />
      </div>

      <div class="form-section" v-show="currentSection === 'characteristics'">
        <CharacteristicsForm :model-value="modelValue" @update:model-value="handleUpdate"
          @update:isValid="updateSectionValidity('characteristics', $event)" />
      </div>

      <div class="form-section" v-show="currentSection === 'defenses'">
        <DefensesForm :model-value="modelValue" @update:model-value="handleUpdate"
          @update:isValid="updateSectionValidity('defenses', $event)" />
      </div>

      <div class="form-section" v-show="currentSection === 'abilities'">
        <AbilitiesForm :model-value="modelValue" @update:model-value="handleUpdate"
          @update:isValid="updateSectionValidity('abilities', $event)" />
      </div>

      <div class="form-section" v-show="currentSection === 'keywords'">
        <KeywordsForm :model-value="modelValue" @update:model-value="handleUpdate"
          @update:isValid="updateSectionValidity('keywords', $event)" />
      </div>

      <div class="form-section" v-show="currentSection === 'source'">
        <SourceInfoForm :model-value="modelValue" @update:model-value="handleUpdate"
          @update:isValid="updateSectionValidity('source', $event)" />
      </div>
    </main>

    <!-- Wizard Navigation -->
    <footer class="wizard-nav">
      <div class="nav-buttons">
        <button type="button" class="btn btn-secondary" @click="previousSection" :disabled="currentSectionIndex === 0">
          ← Previous
        </button>

        <div class="center-info">
          <span class="current-section-name">{{ currentSectionName }}</span>
        </div>

        <button v-if="currentSectionIndex < sections.length - 1" type="button" class="btn btn-primary"
          @click="nextSection" :disabled="!canProceedToNext">
          Next →
        </button>

        <button v-else type="button" class="btn btn-success" @click="handleSave" :disabled="!isValid">
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
  // Alt+S to save
  if (event.altKey && event.key === 's') {
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
    name: template.name,
    id: template.id,
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
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-6);
  border-bottom: 2px solid var(--color-neutral-200);
  margin-bottom: var(--space-8);
  gap: var(--space-4);
}

.form-title {
  color: var(--color-primary-600);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  line-height: var(--line-height-tight);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
}

/* Buttons use design system classes from components.css */
.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn-success {
  background-color: var(--color-success-600);
  color: white;
  border: 2px solid var(--color-success-600);
}

.btn-success:hover:not(:disabled) {
  background-color: var(--color-success-700);
  border-color: var(--color-success-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  margin-right: var(--space-2);
  font-size: var(--font-size-base);
}

.btn-icon-only {
  background-color: transparent;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-600);
  padding: var(--space-2) var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.btn-icon-only:hover {
  background-color: var(--color-primary-50);
}

.btn-icon-only .btn-icon {
  margin: 0;
}

.templates-section {
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  background: var(--color-neutral-50);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-neutral-200);
}

.form-nav {
  margin-bottom: var(--space-8);
  border-bottom: 2px solid var(--color-neutral-200);
  padding-bottom: var(--space-6);
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-base);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-600), var(--color-primary-700));
  border-radius: var(--radius-base);
  transition: width var(--duration-slow) var(--ease-out);
  box-shadow: 0 1px 3px rgba(139, 69, 19, 0.3);
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-500);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.nav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.nav-btn {
  position: relative;
  padding: var(--space-3) var(--space-5);
  background: white;
  border: 2px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: var(--transition-all);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.section-number {
  background: var(--color-neutral-100);
  color: var(--color-neutral-500);
  border-radius: var(--radius-full);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  transition: var(--transition-all);
}

.nav-btn:hover:not(:disabled) {
  background-color: var(--color-neutral-50);
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-sm);
}

.nav-btn.active {
  background-color: var(--color-primary-600);
  color: white;
  border-color: var(--color-primary-600);
  box-shadow: var(--shadow-md);
}

.nav-btn.active .section-number {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.nav-btn.completed {
  border-color: var(--color-success-500);
  color: var(--color-success-600);
}

.nav-btn.completed .section-number {
  background: var(--color-success-600);
  color: white;
}

.nav-btn.invalid {
  border-color: var(--color-error-500);
  color: var(--color-error-600);
}

.nav-btn.invalid.active {
  background-color: var(--color-error-600);
  color: white;
}

.invalid-indicator,
.completed-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-error-600);
  color: white;
  border-radius: var(--radius-full);
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
}

.completed-indicator {
  background: var(--color-success-600);
}

.form-content {
  min-height: 400px;
  margin-bottom: var(--space-8);
}

.wizard-nav {
  border-top: 1px solid var(--color-neutral-200);
  padding-top: var(--space-6);
  background: var(--color-neutral-50);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  margin: 0 calc(-1 * var(--space-4)) calc(-1 * var(--space-4)) calc(-1 * var(--space-4));
  padding: var(--space-6);
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.center-info {
  flex: 1;
  text-align: center;
}

.current-section-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-600);
  font-size: var(--font-size-lg);
}

.form-section {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .monster-form-layout {
    padding: var(--space-2);
  }

  .form-header {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }

  .form-actions {
    justify-content: center;
  }

  .progress-indicator {
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
  }

  .nav-tabs {
    justify-content: center;
    gap: var(--space-1);
  }

  .nav-btn {
    flex: 1;
    min-width: 100px;
    text-align: center;
    padding: var(--space-2);
    font-size: var(--font-size-xs);
  }

  .section-number {
    width: 20px;
    height: 20px;
    font-size: var(--font-size-xs);
  }

  .form-title {
    font-size: var(--font-size-xl);
    text-align: center;
  }

  .nav-buttons {
    flex-direction: column;
    gap: var(--space-4);
  }

  .center-info {
    order: -1;
  }

  .current-section-name {
    font-size: var(--font-size-base);
  }

  .wizard-nav {
    padding: var(--space-4);
    margin: 0 calc(-1 * var(--space-2)) calc(-1 * var(--space-2)) calc(-1 * var(--space-2));
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

  .form-actions .btn {
    min-width: 120px;
  }
}
</style>