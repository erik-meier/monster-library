<template>
  <div class="ability-editor" role="dialog" aria-labelledby="editor-title" aria-modal="true">
    <header class="editor-header">
      <h2 id="editor-title" class="editor-title">
        {{ isFeature ? 'Edit Feature' : 'Edit Ability' }}: {{ formData.name || 'New Item' }}
      </h2>
      <div class="editor-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')"
          aria-label="Cancel editing and close dialog">
          Cancel
        </button>
        <button type="button" class="btn btn-primary" @click="handleSave" :disabled="!isValid"
          :aria-label="isValid ? 'Save changes' : 'Please fix validation errors before saving'">
          Save
        </button>
      </div>
    </header>

    <div class="editor-content">
      <!-- Basic Info -->
      <CollapsibleSection title="Basic Information" :expanded="true" id="basic-info">
        <div class="form-grid">
          <div class="form-group">
            <label for="ability-name" class="form-label required">Name</label>
            <input id="ability-name" v-model="formData.name" type="text" class="form-input"
              :class="{ invalid: errors.name }" placeholder="Ability name" :aria-invalid="!!errors.name"
              :aria-describedby="errors.name ? 'ability-name-error' : undefined" required />
            <div v-if="errors.name" id="ability-name-error" class="error-message" role="alert">{{ errors.name }}</div>
          </div>

          <div class="form-group">
            <label for="ability-type" class="form-label required">Type</label>
            <select id="ability-type" v-model="formData.type" class="form-select" :class="{ invalid: errors.type }"
              @change="onTypeChange" :aria-invalid="!!errors.type"
              :aria-describedby="errors.type ? 'ability-type-error' : undefined" required>
              <option value="ability">Ability (Active)</option>
              <option value="feature">Feature (Passive)</option>
            </select>
            <div v-if="errors.type" id="ability-type-error" class="error-message" role="alert">{{ errors.type }}</div>
          </div>
        </div>
      </CollapsibleSection>

      <!-- Feature-specific fields -->
      <CollapsibleSection v-if="isFeature" title="Feature Description" :expanded="true" id="feature-description">
        <div class="form-group">
          <label for="feature-description" class="form-label required">Description</label>
          <textarea id="feature-description" v-model="formData.system.description!.value" class="form-textarea"
            :class="{ invalid: errors.description }" rows="4" placeholder="Describe what this feature does..." />
          <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
          <div class="help-text">HTML is supported for formatting</div>
        </div>
      </CollapsibleSection>

      <!-- Ability-specific fields -->
      <template v-if="!isFeature">
        <!-- System Properties -->
        <CollapsibleSection title="Action Properties" :expanded="true" id="action-properties">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-checkbox-label">
                <input type="checkbox" v-model="isSignature" class="form-checkbox" />
                <span class="checkbox-text">Signature Ability</span>
              </label>
              <div class="help-text">Signature abilities are always available (only one per monster)</div>
              <div v-if="errors.signature" class="error-message">{{ errors.signature }}</div>
            </div>

            <div class="form-group">
              <label for="action-type" class="form-label">Action Type</label>
              <select id="action-type" v-model="formData.system.type" class="form-select">
                <option value="main">Main Action</option>
                <option value="maneuver">Maneuver</option>
                <option value="triggered">Triggered Action</option>
                <option value="freeTriggered">Free Triggered Action</option>
                <option value="villain">Villain Action</option>
                <option value="move">Move Action</option>
              </select>
            </div>

            <div class="form-group">
              <label for="malice-cost" class="form-label">Malice Cost</label>
              <input id="malice-cost" v-model="formData.system.resource" type="number" class="form-input" min="0"
                placeholder="0" />
              <div class="help-text">Leave empty if no cost</div>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Targeting -->
        <section class="editor-section">
          <h3 class="section-title">Targeting</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="range-type" class="form-label">Range Type</label>
              <select id="range-type" v-model="rangeType" class="form-select">
                <option value="melee">Melee</option>
                <option value="ranged">Ranged</option>
                <option value="meleeRanged">Melee or Ranged</option>
                <option value="line">Line</option>
                <option value="cube">Cube</option>
                <option value="wall">Wall</option>
                <option value="burst">Burst</option>
                <option value="self">Self</option>
                <option value="special">Special</option>
              </select>
            </div>

            <!-- Melee Range -->
            <div class="form-group" v-if="rangeType === 'melee' || rangeType === 'meleeRanged'">
              <label for="melee-range" class="form-label">Melee Range</label>
              <input id="melee-range" v-model.number="formData.system.distance!.primary" type="number"
                class="form-input" min="1" placeholder="1" />
            </div>

            <!-- Ranged Distance -->
            <div class="form-group" v-if="rangeType === 'ranged' || rangeType === 'meleeRanged'">
              <label for="ranged-distance" class="form-label">Ranged Distance</label>
              <input id="ranged-distance" v-model.number="formData.system.distance!.secondary" type="number"
                class="form-input" min="1" placeholder="5" />
            </div>

            <!-- Line Range -->
            <div class="form-group-row" v-if="rangeType === 'line'">
              <input v-model.number="formData.system.distance!.primary" type="number" class="form-input inline-input"
                min="1" placeholder="5" />
              <span class="range-text">x</span>
              <input v-model.number="formData.system.distance!.secondary" type="number" class="form-input inline-input"
                min="1" placeholder="5" />
              <span class="range-text">line within</span>
              <input v-model.number="formData.system.distance!.tertiary" type="number" class="form-input inline-input"
                min="1" placeholder="10" />
            </div>

            <!-- Cube Range -->
            <div class="form-group-row" v-if="rangeType === 'cube'">
              <input v-model.number="formData.system.distance!.primary" type="number" class="form-input inline-input"
                min="1" placeholder="3" />
              <span class="range-text">cube within</span>
              <input v-model.number="formData.system.distance!.secondary" type="number" class="form-input inline-input"
                min="1" placeholder="10" />
            </div>

            <!-- Wall Range -->
            <div class="form-group-row" v-if="rangeType === 'wall'">
              <input v-model.number="formData.system.distance!.primary" type="number" class="form-input inline-input"
                min="1" placeholder="6" />
              <span class="range-text">wall within</span>
              <input v-model.number="formData.system.distance!.secondary" type="number" class="form-input inline-input"
                min="1" placeholder="10" />
            </div>

            <!-- Burst Range -->
            <div class="form-group-row" v-if="rangeType === 'burst'">
              <input v-model.number="formData.system.distance!.primary" type="number" class="form-input inline-input"
                min="1" placeholder="2" />
              <span class="range-text">burst</span>
              <span class="range-spacer"></span>
            </div>

            <div class="form-group">
              <label for="target-type" class="form-label">Target Type</label>
              <select id="target-type" v-model="formData.system.target!.type" class="form-select">
                <option value="creature">Creature</option>
                <option value="creatureObject">Creature or Object</option>
                <option value="enemy">Enemy</option>
                <option value="ally">Ally</option>
                <option value="selfAlly">Self and Ally</option>
                <option value="selfOrAlly">Self or Ally</option>
                <option value="self">Self</option>
                <option value="special">Special</option>
              </select>
              <div class="help-text">What can be targeted by this ability</div>
            </div>

            <div class="form-group"
              v-if="formData.system.target!.type !== 'self' && formData.system.target!.type !== 'special'">
              <label for="target-count" class="form-label">Target Count</label>
              <input id="target-count" v-model.number="formData.system.target!.value" type="number" class="form-input"
                min="1" placeholder="1" />
              <div class="help-text">Number of targets</div>
            </div>
          </div>
        </section>

        <!-- Power Roll (Optional) -->
        <section class="editor-section">
          <div class="section-header-with-toggle">
            <h3 class="section-title">Power Roll (Optional)</h3>
            <label class="toggle-switch">
              <input type="checkbox" v-model="hasPowerRoll" />
              <span class="toggle-slider"></span>
              <span class="toggle-label">{{ hasPowerRoll ? 'Has Power Roll' : 'No Power Roll' }}</span>
            </label>
          </div>

          <template v-if="hasPowerRoll">
            <div class="form-grid">
              <div class="form-group">
                <label for="power-characteristic" class="form-label">Characteristic</label>
                <select id="power-characteristic" v-model="selectedCharacteristic" class="form-select">
                  <option value="">Custom Formula</option>
                  <option v-for="char in characteristicsList" :key="char.value" :value="char.value">
                    {{ char.label }}
                  </option>
                </select>
                <div class="help-text">Select characteristic for 2d10 + characteristic formula, or use custom</div>
              </div>

              <div class="form-group" v-if="!selectedCharacteristic">
                <label for="power-formula" class="form-label">Custom Formula</label>
                <input id="power-formula" v-model="formData.system.power!.roll!.formula" type="text" class="form-input"
                  placeholder="2d10 + 2" />
                <div class="help-text">e.g., 2d10, 2d10 + 3</div>
              </div>

              <div class="form-group" v-else>
                <label class="form-label">Generated Formula</label>
                <div class="formula-display">{{ generatedFormula }}</div>
                <div class="help-text">Formula automatically generated from selected characteristic</div>
              </div>
            </div>

            <!-- Power Tiers -->
            <div class="power-tiers">
              <h4 class="subsection-title">Power Tiers</h4>
              <div class="tier-list">
                <div v-for="tierNum in 3" :key="tierNum" class="tier-row">
                  <div class="tier-number">{{ tierNum }}</div>
                  <input v-model="getTierDisplay(tierNum).value" type="text" class="tier-input"
                    :placeholder="`Tier ${tierNum} effect`" />
                </div>
              </div>
            </div>
          </template>
        </section>

        <!-- Effects -->
        <section class="editor-section">
          <h3 class="section-title">Effect</h3>
          <div class="form-group">
            <label for="effect-text" class="form-label">Effect Description</label>
            <textarea id="effect-text" v-model="formData.system.effect!.text" class="form-textarea" rows="3"
              placeholder="Describe what this ability does..." />
            <div class="help-text">HTML is supported for formatting</div>
          </div>
        </section>

        <!-- Spend Effects -->
        <section class="editor-section">
          <h3 class="section-title">Spend Effects</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="spend-value" class="form-label">Malice Cost</label>
              <input id="spend-value" v-model.number="formData.system.spend!.value" type="number" class="form-input"
                min="0" placeholder="0" />
              <div class="help-text">Cost in Malice to activate the spend effect (leave empty if no cost)</div>
            </div>
          </div>
          <div class="form-group">
            <label for="spend-text" class="form-label">Spend Effect Description</label>
            <textarea id="spend-text" v-model="formData.system.spend!.text" class="form-textarea" rows="2"
              placeholder="Effect when spending resources..." />
            <div class="help-text">Describes what happens when the character spends Malice for this ability</div>
          </div>
        </section>

        <!-- Trigger -->
        <section class="editor-section"
          v-if="formData.system.type === 'triggered' || formData.system.type === 'freeTriggered'">
          <h3 class="section-title">Trigger</h3>
          <div class="form-group">
            <label for="trigger-text" class="form-label">Trigger Condition</label>
            <textarea id="trigger-text" v-model="formData.system.trigger" class="form-textarea" rows="2"
              placeholder="When this ability triggers..." />
          </div>
        </section>
      </template>

      <!-- Keywords (for both abilities and features) -->
      <section class="editor-section">
        <h3 class="section-title">Keywords</h3>
        <div class="keywords-editor">
          <div class="selected-keywords" v-if="formData.system.keywords.length > 0">
            <span v-for="keyword in formData.system.keywords" :key="keyword" class="keyword-tag">
              {{ keyword }}
              <button type="button" class="remove-keyword" @click="removeKeyword(keyword)">
                ×
              </button>
            </span>
          </div>

          <div class="keyword-input-group">
            <input v-model="newKeyword" type="text" class="keyword-input" placeholder="Add keyword..."
              @keyup.enter="addKeyword" />
            <button type="button" class="btn-add-keyword" @click="addKeyword" :disabled="!newKeyword.trim()">
              Add
            </button>
          </div>

          <!-- Quick Add Common Keywords -->
          <div class="quick-keywords">
            <button v-for="keyword in quickKeywords" :key="keyword" type="button" class="quick-keyword-btn"
              :class="{ selected: formData.system.keywords.includes(keyword) }" @click="toggleQuickKeyword(keyword)">
              {{ keyword }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { MonsterItem } from '@/types/monster-forms'
import { ABILITY_KEYWORDS } from '@/types/monster-forms'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import { useToast } from '@/composables/useToast'

// Debounce utility for performance optimization
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

// Initialize toast notifications
const { success, error } = useToast()

interface Props {
  modelValue: MonsterItem
  existingItems?: MonsterItem[]
  editingIndex?: number | null
}

interface Emits {
  (e: 'update:modelValue', value: MonsterItem): void
  (e: 'save'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive<MonsterItem>(JSON.parse(JSON.stringify(props.modelValue)))
const newKeyword = ref('')

// Determine if this ability has a power roll based on existing data
const hasPowerRoll = ref(
  !!(formData.system.power?.tiers?.length && formData.system.power.tiers.length > 0)
)

const characteristicsList = [
  { value: 'might', label: 'Might' },
  { value: 'agility', label: 'Agility' },
  { value: 'reason', label: 'Reason' },
  { value: 'intuition', label: 'Intuition' },
  { value: 'presence', label: 'Presence' }
]

const quickKeywords = ABILITY_KEYWORDS.slice(0, 10) // Show first 10 for quick access

const errors = reactive({
  name: '',
  type: '',
  description: '',
  signature: ''
})

const isFeature = computed(() => formData.type === 'feature')

const isSignature = computed({
  get: () => formData.system.category === 'signature',
  set: (value: boolean) => {
    formData.system.category = value ? 'signature' : ''
  }
})

const rangeType = computed({
  get: () => formData.system.distance?.type || 'melee',
  set: (value: string) => {
    if (formData.system.distance) {
      formData.system.distance.type = value as 'line' | 'melee' | 'ranged' | 'meleeRanged' | 'special' | 'cube' | 'wall' | 'burst' | 'self'
      // Reset range values when type changes
      if (value === 'self') {
        // Self range doesn't need any distance values
        formData.system.distance.primary = undefined
        formData.system.distance.secondary = undefined
        formData.system.distance.tertiary = undefined
      } else {
        formData.system.distance.primary = value === 'burst' ? 2 : 1
        formData.system.distance.secondary = undefined
        formData.system.distance.tertiary = undefined
      }
    }
  }
})

const selectedCharacteristic = computed({
  get: () => {
    // Check if formula matches 2d10 + {characteristic} pattern
    const chars = formData.system.power?.roll?.characteristics || []
    return chars.length === 1 ? chars[0] : ''
  },
  set: (value: string) => {
    if (value) {
      // Set characteristic and generate formula
      formData.system.power!.roll!.characteristics = [value]
      formData.system.power!.roll!.formula = `2d10 + ${value}`
    } else {
      // Clear characteristic for custom formula
      formData.system.power!.roll!.characteristics = []
    }
  }
})

const generatedFormula = computed(() => {
  return selectedCharacteristic.value ? `2d10 + ${selectedCharacteristic.value}` : ''
})

const isValid = computed(() => {
  return Object.values(errors).every(error => error === '') &&
    formData.name.trim() !== '' &&
    (isFeature.value ? formData.system.description?.value?.trim() !== '' : true)
})

const getTierDisplay = (tierNum: number) => {
  return computed({
    get: () => {
      if (!formData.system.power?.tiers) return ''
      const tier = formData.system.power.tiers.find(t => t.tier === tierNum)
      return tier?.display || ''
    },
    set: (value: string) => {
      if (!formData.system.power?.tiers) return

      isInternalUpdate = true
      nextTick(() => {
        // Find existing tier or create new one
        let tier = formData.system.power!.tiers!.find(t => t.tier === tierNum)
        if (!tier) {
          tier = { tier: tierNum, display: value }
          formData.system.power!.tiers!.push(tier)
          // Sort tiers by tier number
          formData.system.power!.tiers!.sort((a, b) => a.tier - b.tier)
        } else {
          tier.display = value
        }
        isInternalUpdate = false
      })
    }
  })
}

const validateFields = () => {
  errors.name = formData.name.trim() === '' ? 'Name is required' : ''
  errors.type = !formData.type ? 'Type is required' : ''

  // Validate signature uniqueness
  if (isSignature.value && props.existingItems) {
    const otherSignatureExists = props.existingItems.some((item, index) =>
      item.system.category === 'signature' && index !== props.editingIndex
    )
    errors.signature = otherSignatureExists ? 'Only one signature ability allowed per monster' : ''
  } else {
    errors.signature = ''
  }

  if (isFeature.value) {
    errors.description = (!formData.system.description?.value || formData.system.description.value.trim() === '') ? 'Description is required for features' : ''
  } else {
    errors.description = ''
  }
}

const onTypeChange = () => {
  isInternalUpdate = true

  nextTick(() => {
    if (formData.type === 'feature') {
      // Initialize feature fields
      formData.system = {
        keywords: formData.system.keywords || [],
        power: null,
        description: {
          value: formData.system.description?.value || '',
          director: formData.system.description?.director || ''
        }
      }
    } else {
      // Initialize ability fields
      formData.system = {
        keywords: formData.system.keywords || [],
        category: formData.system.category || '',
        type: formData.system.type || 'main',
        resource: formData.system.resource || null,
        distance: formData.system.distance || {
          type: 'melee',
          primary: 1
        },
        target: formData.system.target || {
          type: 'creatureObject',
          value: 1
        },
        trigger: formData.system.trigger || '',
        power: formData.system.power || {
          roll: {
            formula: '2d10',
            characteristics: ['might']
          },
          tiers: [
            { tier: 1, display: '' },
            { tier: 2, display: '' },
            { tier: 3, display: '' }
          ]
        },
        effect: formData.system.effect || {
          text: ''
        },
        spend: formData.system.spend || {
          text: '',
          value: null
        }
      }
    }

    validateFields()
    isInternalUpdate = false
  })
}



const addKeyword = () => {
  const keyword = newKeyword.value.toLowerCase().trim()
  if (keyword && !formData.system.keywords.includes(keyword)) {
    isInternalUpdate = true
    formData.system.keywords.push(keyword)
    newKeyword.value = ''
    nextTick(() => {
      isInternalUpdate = false
    })
  }
}

const removeKeyword = (keyword: string) => {
  const index = formData.system.keywords.indexOf(keyword)
  if (index > -1) {
    isInternalUpdate = true
    formData.system.keywords.splice(index, 1)
    nextTick(() => {
      isInternalUpdate = false
    })
  }
}

const toggleQuickKeyword = (keyword: string) => {
  if (formData.system.keywords.includes(keyword)) {
    removeKeyword(keyword)
  } else {
    isInternalUpdate = true
    formData.system.keywords.push(keyword)
    nextTick(() => {
      isInternalUpdate = false
    })
  }
}

const handleSave = () => {
  validateFields()
  if (isValid.value) {
    try {
      emit('save')
      success(`${isFeature.value ? 'Feature' : 'Ability'} "${formData.name}" saved successfully!`)
    } catch (err) {
      error('Failed to save. Please check your inputs and try again.')
      console.error('Save error:', err)
    }
  } else {
    error('Please fix the validation errors before saving.')
  }
}

// Handle escape key to close editor
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    emit('cancel')
  }
}

// Add event listener when component mounts
onMounted(() => {
  document.addEventListener('keydown', handleEscape, true) // Use capture phase
})

// Remove event listener when component unmounts
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape, true)
})

// Debounced validation and emit to prevent performance issues on mobile
const debouncedUpdate = debounce(() => {
  validateFields()
  // Only emit if there are actual changes to prevent circular updates
  emit('update:modelValue', JSON.parse(JSON.stringify(formData)))
}, 300) // 300ms debounce

let isInternalUpdate = false

// Watch for changes and validate (debounced for performance)
watch(formData, () => {
  if (!isInternalUpdate) {
    debouncedUpdate()
  }
}, { deep: true, flush: 'post' })

// Watch for hasPowerRoll toggle changes
watch(hasPowerRoll, (newValue) => {
  isInternalUpdate = true
  nextTick(() => {
    if (!newValue) {
      // Clear power roll data when disabled
      if (formData.system.power) {
        formData.system.power.roll = {
          formula: '',
          characteristics: []
        }
        formData.system.power.tiers = []
      }
    } else {
      // Initialize with three tiers when enabled
      if (formData.system.power) {
        formData.system.power.tiers = [
          { tier: 1, display: '' },
          { tier: 2, display: '' },
          { tier: 3, display: '' }
        ]
      }
    }
    isInternalUpdate = false
  })
})

// Watch for external changes (debounced to prevent conflicts)
const debouncedExternalUpdate = debounce((newValue: MonsterItem) => {
  isInternalUpdate = true
  Object.assign(formData, JSON.parse(JSON.stringify(newValue)))
  nextTick(() => {
    isInternalUpdate = false
  })
}, 100)

watch(() => props.modelValue, (newValue) => {
  if (!isInternalUpdate) {
    debouncedExternalUpdate(newValue)
  }
}, { deep: true })

// Initial validation
validateFields()
</script>

<style scoped>
.ability-editor {
  padding: 1.5rem;
  max-height: 90vh;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1.5rem;
}

.editor-title {
  color: #8b4513;
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0;
}

.editor-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.btn {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-button);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: var(--color-neutral-50);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  transition-duration: var(--duration-fast);
}

.btn-primary:disabled {
  background-color: var(--color-neutral-400);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background-color: var(--color-neutral-600);
  color: var(--color-neutral-50);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-neutral-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary:active:not(:disabled) {
  transform: translateY(0);
  transition-duration: var(--duration-fast);
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.editor-section {
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  background: var(--color-neutral-50);
  transition: var(--transition-card);
}

.editor-section:hover {
  border-color: var(--color-neutral-300);
  background: white;
}

.section-title {
  color: #495057;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.subsection-title {
  color: #495057;
  font-size: 1rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.inline-input {
  width: 80px;
  flex-shrink: 0;
}

.range-text {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

.range-spacer {
  flex: 1;
  min-width: 80px;
}

.formula-display {
  padding: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #495057;
}

.form-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #8b4513;
}

.form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
  font-size: var(--font-size-sm);
  display: block;
  margin-bottom: var(--space-2);
}

.form-label.required::after {
  content: ' *';
  color: var(--color-error-600);
}

/* Use global form styles from design system */

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
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

.power-tiers {
  margin-top: 1rem;
  background: white;
  border-radius: 4px;
  padding: 1rem;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tier-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tier-number {
  background: #8b4513;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.tier-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}



.keywords-editor {
  background: white;
  border-radius: 4px;
  padding: 1rem;
}

.selected-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.keyword-tag {
  background: #8b4513;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.remove-keyword {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keyword-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.keyword-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.btn-add-keyword {
  padding: 0.5rem 1rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-add-keyword:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.quick-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.quick-keyword-btn {
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-keyword-btn:hover {
  background: #dee2e6;
}

.quick-keyword-btn.selected {
  background: #8b4513;
  color: white;
  border-color: #8b4513;
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

.help-text {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  line-height: var(--line-height-relaxed);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .ability-editor {
    padding: 1rem;
  }

  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .editor-actions {
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .tier-row {
    flex-wrap: wrap;
  }

  .tier-input {
    min-width: 200px;
  }
}

/* Toggle Switch Styles */
.section-header-with-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-help {
  margin-bottom: 1rem;
  font-style: italic;
  color: #6c757d;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.toggle-switch input[type="checkbox"] {
  position: relative;
  width: 40px;
  height: 20px;
  appearance: none;
  background: #ccc;
  border-radius: 20px;
  outline: none;
  transition: background 0.3s;
  cursor: pointer;
}

.toggle-switch input[type="checkbox"]:checked {
  background: #28a745;
}

.toggle-switch input[type="checkbox"]::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch input[type="checkbox"]:checked::before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}
</style>