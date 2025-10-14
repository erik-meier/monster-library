<template>
  <div class="ability-editor" role="dialog" aria-labelledby="editor-title" aria-modal="true">
    <header class="editor-header">
      <h2 id="editor-title" class="editor-title">
        {{ isFeature ? 'Edit Feature' : 'Edit Ability' }}: {{ formData.name || 'New Item' }}
      </h2>
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
            <div class="type-display" title="Type is set when creating and cannot be changed">
              {{ formData.type === 'ability' ? 'Ability (Active)' : 'Feature (Passive)' }}
            </div>
          </div>

          <!-- Malice Cost (when in malice context) -->
          <div v-if="isMaliceContext" class="form-group">
            <label for="malice-cost-basic" class="form-label required">Malice Cost</label>
            <input id="malice-cost-basic" v-model="formData.cost" type="text" class="form-input"
              :class="{ invalid: errors.maliceCost }" placeholder="e.g., '2 Malice'" required />
            <div v-if="errors.maliceCost" class="error-message" role="alert">{{ errors.maliceCost }}</div>
            <div class="help-text">All malice {{ isFeature ? 'features' : 'abilities' }} require a cost</div>
          </div>
        </div>

        <!-- Feature Description (for features) -->
        <div v-if="isFeature" class="form-group" style="margin-top: var(--space-4);">
          <label for="feature-description" class="form-label required">Description</label>
          <textarea id="feature-description" v-model="featureDescription" class="form-textarea"
            :class="{ invalid: errors.description }" rows="4" placeholder="Describe what this feature does..." />
          <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
          <div class="help-text">HTML is supported for formatting</div>
        </div>
      </CollapsibleSection>



      <!-- Ability-specific fields -->
      <template v-if="!isFeature">
        <!-- Ability Properties -->
        <CollapsibleSection title="Ability Properties" :expanded="true" id="ability-properties">
          <div class="form-grid">
            <div class="form-group">
              <label for="ability-type-select" class="form-label">Ability Type</label>
              <select id="ability-type-select" v-model="formData.ability_type" class="form-select">
                <option value="">Regular Ability</option>
                <option value="Signature Ability">Signature Ability</option>
                <option value="Villain Action">Villain Action</option>
              </select>
              <div v-if="errors.signature" class="error-message" role="alert">{{ errors.signature }}</div>
            </div>

            <div v-if="isVillainAction" class="form-group">
              <label for="villain-action-number" class="form-label">Number</label>
              <select id="villain-action-number" v-model="villainActionNumber" class="form-select">
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
                <option :value="5">5</option>
                <option :value="6">6</option>
                <option :value="7">7</option>
                <option :value="8">8</option>
                <option :value="9">9</option>
              </select>
              <div class="help-text">Ordering villain actions makes it easiser for directors to use them</div>
            </div>

            <div v-if="!isVillainAction" class="form-group">
              <label for="usage-type" class="form-label">Usage</label>
              <select id="usage-type" v-model="formData.usage" class="form-select">
                <option value="Main action">Main Action</option>
                <option value="Maneuver">Maneuver</option>
                <option value="Triggered action">Triggered Action</option>
                <option value="Free triggered action">Free Triggered Action</option>
                <option value="Move action">Move Action</option>
              </select>
            </div>

            <!-- Malice Cost (only show when NOT in malice context, since it's in Basic Info when in malice context) -->
            <div v-if="!isMaliceContext" class="form-group">
              <label for="malice-cost" class="form-label">Malice Cost</label>
              <input id="malice-cost" v-model="formData.cost" type="text" class="form-input"
                placeholder="e.g., '2 Malice'" />
              <div class="help-text">Leave empty if no cost</div>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Targeting -->
        <CollapsibleSection title="Targeting" :expanded="true" id="targeting">
          <div class="form-grid">
            <div class="form-group">
              <label for="distance-input" class="form-label">Distance</label>
              <input id="distance-input" v-model="formData.distance" type="text" class="form-input"
                placeholder="e.g., 'Melee 2', 'Ranged 10', '4 cube within 20'" />
              <div class="help-text">Examples: Melee 1, Ranged 10, 4 cube within 20, Self</div>
            </div>

            <div class="form-group">
              <label for="target-input" class="form-label">Target</label>
              <input id="target-input" v-model="formData.target" type="text" class="form-input"
                placeholder="e.g., 'Two creatures or objects', 'Self'" />
              <div class="help-text">Describe what can be targeted</div>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Trigger (for triggered abilities) -->
        <CollapsibleSection v-if="isTriggeredAction" title="Trigger" :expanded="true" id="trigger">
          <div class="form-group">
            <label for="trigger-input" class="form-label">Trigger Condition</label>
            <textarea id="trigger-input" v-model="formData.trigger" class="form-textarea" rows="2"
              placeholder="When this ability triggers..." />
          </div>
        </CollapsibleSection>
      </template>

      <!-- Keywords (for both abilities and features) -->
      <CollapsibleSection title="Keywords" :expanded="true" id="keywords" ref="keywordsSection">
        <div class="keywords-editor">
          <div class="selected-keywords" v-if="formData.keywords && formData.keywords.length > 0">
            <span v-for="keyword in formData.keywords" :key="keyword" class="keyword-tag">
              {{ capitalize(keyword) }}
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
              :class="{ selected: formData.keywords?.includes(keyword.toLowerCase()) }"
              @click="toggleQuickKeyword(keyword)">
              {{ capitalize(keyword) }}
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <!-- Power Roll Section (for abilities, or features in malice context) -->
      <CollapsibleSection v-if="!isFeature || isMaliceContext" title="Power Roll" :expanded="true" id="power-roll"
        ref="powerRollSection">
        <div class="power-roll-section">
          <div class="power-roll-toggle">
            <label class="toggle-switch">
              <input type="checkbox" v-model="hasPowerRoll" @change="handlePowerRollToggle" />
              <span class="toggle-label">Use Power Roll?</span>
            </label>
            <div class="help-text">Power rolls determine variable effects based on dice results</div>
          </div>

          <div v-if="hasPowerRoll" class="power-roll-content">
            <div class="form-group">
              <label class="form-label required">Power Roll Formula</label>
              <input v-model="powerRollFormula" type="text" class="form-input" placeholder="e.g., '2d10 + 2'"
                required />
              <div class="help-text">The dice formula or description for the power roll</div>
            </div>

            <!-- Power Roll Tiers -->
            <div class="power-tiers">
              <h5 class="subsection-title">Power Roll Tiers</h5>
              <div class="tier-list">
                <div class="tier-row">
                  <div class="tier-number">1</div>
                  <input v-model="powerRollTiers.tier1" type="text" class="tier-input" placeholder="Tier 1 effect" />
                </div>
                <div class="tier-row">
                  <div class="tier-number">2</div>
                  <input v-model="powerRollTiers.tier2" type="text" class="tier-input" placeholder="Tier 2 effect" />
                </div>
                <div class="tier-row">
                  <div class="tier-number">3</div>
                  <input v-model="powerRollTiers.tier3" type="text" class="tier-input" placeholder="Tier 3 effect" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <!-- Effects -->
      <CollapsibleSection title="Effects" :expanded="true" id="effects" ref="effectsSection">
        <div class="effects-list">
          <div v-for="(effect, index) in formData.effects" :key="`effect-${index}`" class="effect-item">
            <div class="effect-header">
              <h4 class="effect-title">Effect {{ index + 1 }}</h4>
              <button type="button" class="btn-remove-effect" @click="removeEffect(index)"
                :disabled="formData.effects!.length <= 1">
                Remove
              </button>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Effect Name (Optional)</label>
                <input v-model="effect.name" type="text" class="form-input" placeholder="e.g., 'End Effect', 'Spend'" />
              </div>

              <div class="form-group">
                <label class="form-label">Cost (Optional)</label>
                <input v-model="effect.cost" type="text" class="form-input" placeholder="e.g., '2 Malice'" />
              </div>
            </div>

            <!-- Effect Text -->
            <div class="form-group">
              <label class="form-label">Effect Description</label>
              <textarea v-model="effect.effect" class="form-textarea" rows="3"
                placeholder="Describe what this effect does..." />
              <div class="help-text">HTML is supported for formatting</div>
            </div>
          </div>

          <button type="button" class="btn-add-effect" @click="addEffect">
            Add Another Effect
          </button>
        </div>
      </CollapsibleSection>
    </div>

    <!-- Footer Actions -->
    <footer class="editor-footer">
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
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { MonsterItem } from '@/types/monster-forms'
import { ABILITY_KEYWORDS } from '@/types/monster-forms'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()

interface Props {
  modelValue: MonsterItem
  existingItems?: MonsterItem[]
  editingIndex?: number | null
  isMaliceContext?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: MonsterItem): void
  (e: 'save'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  isMaliceContext: false
})
const emit = defineEmits<Emits>()

// Initialize form data with new simplified structure
const formData = reactive<MonsterItem>({
  name: props.modelValue.name || '',
  type: props.modelValue.type || 'ability',
  ability_type: props.modelValue.ability_type || '',
  usage: props.modelValue.usage || 'Main action',
  distance: props.modelValue.distance || '',
  target: props.modelValue.target || '',
  keywords: props.modelValue.keywords ? [...props.modelValue.keywords] : [],
  cost: props.modelValue.cost || '',
  trigger: props.modelValue.trigger || '',
  effects: props.modelValue.effects && props.modelValue.effects.length > 0
    ? props.modelValue.effects.map(e => ({ ...e }))
    : [{ name: '', roll: '', tier1: '', tier2: '', tier3: '', effect: '', cost: '' }]
})

const newKeyword = ref('')
const quickKeywords = ABILITY_KEYWORDS.slice(0, 10)
const effectsSection = ref<{ updateHeight: () => void } | null>(null)
const keywordsSection = ref<{ updateHeight: () => void } | null>(null)
const powerRollSection = ref<{ updateHeight: () => void } | null>(null)

// Villain action state
const villainActionNumber = ref(1)

// Initialize villain action number from existing data
const initializeVillainActionNumber = () => {
  if (formData.ability_type && formData.ability_type.startsWith('Villain Action ')) {
    const match = formData.ability_type.match(/Villain Action (\d+)/)
    if (match) {
      villainActionNumber.value = parseInt(match[1], 10)
      // Normalize the ability_type to just "Villain Action"
      formData.ability_type = 'Villain Action'
    }
  }
}

// Power roll state
const hasPowerRoll = ref(false)
const powerRollFormula = ref('')
const powerRollTiers = reactive({
  tier1: '',
  tier2: '',
  tier3: ''
})

const errors = reactive({
  name: '',
  description: '',
  signature: '',
  maliceCost: ''
})

const isFeature = computed(() => formData.type === 'feature')
const isVillainAction = computed(() => formData.ability_type === 'Villain Action' || formData.ability_type?.startsWith('Villain Action '))
const isTriggeredAction = computed(() => formData.usage?.includes('Triggered'))

// Feature description computed property 
const featureDescription = computed({
  get: () => {
    if (formData.effects && formData.effects.length > 0) {
      return formData.effects[0].effect || ''
    }
    return ''
  },
  set: (value: string) => {
    if (!formData.effects) {
      formData.effects = []
    }
    if (formData.effects.length === 0) {
      formData.effects.push({ effect: value })
    } else {
      formData.effects[0].effect = value
    }
  }
})

const isValid = computed(() => {
  return Object.values(errors).every(error => error === '') &&
    formData.name.trim() !== '' &&
    (isFeature.value ? featureDescription.value.trim() !== '' : true)
})

// Helper function to capitalize strings
const capitalize = (str: string) => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const validateFields = () => {
  errors.name = formData.name.trim() === '' ? 'Name is required' : ''

  // Validate signature uniqueness  
  if (formData.ability_type === 'Signature Ability' && props.existingItems) {
    const otherSignatureExists = props.existingItems.some((item, index) =>
      item.ability_type === 'Signature Ability' && index !== props.editingIndex
    )
    errors.signature = otherSignatureExists ? 'Only one signature ability allowed per monster' : ''
  } else {
    errors.signature = ''
  }

  // Validate malice cost when in malice context
  if (props.isMaliceContext) {
    errors.maliceCost = formData.cost?.trim() === '' || !formData.cost ? 'Malice cost is required for all malice features and abilities' : ''
  } else {
    errors.maliceCost = ''
  }

  if (isFeature.value) {
    errors.description = featureDescription.value.trim() === '' ? 'Description is required for features' : ''
  } else {
    errors.description = ''
  }
}

const addKeyword = async () => {
  const keyword = newKeyword.value.toLowerCase().trim()
  if (keyword && !formData.keywords?.includes(keyword)) {
    if (!formData.keywords) formData.keywords = []
    formData.keywords.push(keyword)
    newKeyword.value = ''

    // Update the collapsible section height after adding keyword
    await nextTick()
    if (keywordsSection.value && keywordsSection.value.updateHeight) {
      keywordsSection.value.updateHeight()
    }
  }
}

const removeKeyword = async (keyword: string) => {
  if (formData.keywords) {
    const index = formData.keywords.indexOf(keyword)
    if (index > -1) {
      formData.keywords.splice(index, 1)

      // Update the collapsible section height after removing keyword
      await nextTick()
      if (keywordsSection.value && keywordsSection.value.updateHeight) {
        keywordsSection.value.updateHeight()
      }
    }
  }
}

const toggleQuickKeyword = async (keyword: string) => {
  if (!formData.keywords) formData.keywords = []

  const lowerKeyword = keyword.toLowerCase()
  if (formData.keywords.includes(lowerKeyword)) {
    await removeKeyword(lowerKeyword)
  } else {
    formData.keywords.push(lowerKeyword)
    // Update the collapsible section height after adding keyword
    await nextTick()
    if (keywordsSection.value && keywordsSection.value.updateHeight) {
      keywordsSection.value.updateHeight()
    }
  }
}

// Power roll handling
const handlePowerRollToggle = async () => {
  if (hasPowerRoll.value) {
    // Power roll enabled - ensure we have a power roll effect
    ensurePowerRollEffect()
  } else {
    // Power roll disabled - remove power roll from effects
    removePowerRollFromEffects()
  }

  // Update the collapsible section height after toggling power roll
  await nextTick()
  if (powerRollSection.value && powerRollSection.value.updateHeight) {
    powerRollSection.value.updateHeight()
  }
}

const ensurePowerRollEffect = () => {
  if (!formData.effects) {
    formData.effects = []
  }

  // Find existing power roll effect or create one
  let powerRollEffect = formData.effects.find(effect => effect.roll)
  if (!powerRollEffect) {
    // Add power roll effect as first effect
    powerRollEffect = {
      name: '',
      roll: powerRollFormula.value || 'Power Roll + 2',
      tier1: powerRollTiers.tier1,
      tier2: powerRollTiers.tier2,
      tier3: powerRollTiers.tier3,
      effect: '',
      cost: ''
    }
    formData.effects.unshift(powerRollEffect)
  } else {
    // Update existing power roll effect
    powerRollEffect.roll = powerRollFormula.value
    powerRollEffect.tier1 = powerRollTiers.tier1
    powerRollEffect.tier2 = powerRollTiers.tier2
    powerRollEffect.tier3 = powerRollTiers.tier3
  }
}

const removePowerRollFromEffects = () => {
  if (formData.effects) {
    // Remove all effects that have power rolls
    formData.effects = formData.effects.filter(effect => !effect.roll)

    // Ensure we have at least one effect
    if (formData.effects.length === 0) {
      formData.effects.push({
        name: '',
        roll: '',
        tier1: '',
        tier2: '',
        tier3: '',
        effect: '',
        cost: ''
      })
    }
  }
}

const initializePowerRollState = () => {
  // Check if we have a power roll in effects
  if (formData.effects) {
    const powerRollEffect = formData.effects.find(effect => effect.roll && effect.roll.trim() !== '')
    if (powerRollEffect) {
      hasPowerRoll.value = true
      powerRollFormula.value = powerRollEffect.roll || ''
      powerRollTiers.tier1 = powerRollEffect.tier1 || ''
      powerRollTiers.tier2 = powerRollEffect.tier2 || ''
      powerRollTiers.tier3 = powerRollEffect.tier3 || ''
    }
  }
}

const addEffect = async () => {
  if (!formData.effects) {
    formData.effects = []
  }

  const newEffect = {
    name: '',
    effect: '',
    cost: ''
  }

  formData.effects.push(newEffect)

  // Update the collapsible section height after adding the effect
  await nextTick()
  if (effectsSection.value && effectsSection.value.updateHeight) {
    effectsSection.value.updateHeight()
  }
}

const removeEffect = async (index: number) => {
  if (formData.effects && formData.effects.length > 1) {
    formData.effects.splice(index, 1)

    // Update the collapsible section height after removing the effect
    await nextTick()
    if (effectsSection.value && effectsSection.value.updateHeight) {
      effectsSection.value.updateHeight()
    }
  }
}

const handleSave = () => {
  validateFields()
  if (isValid.value) {
    try {
      // Ensure villain action has the correct format
      if (isVillainAction.value) {
        formData.ability_type = `Villain Action ${villainActionNumber.value}`
      }

      // Ensure power roll is properly handled
      if (hasPowerRoll.value && (!isFeature.value || props.isMaliceContext)) {
        ensurePowerRollEffect()
      }

      // Clean up empty effects
      if (formData.effects) {
        formData.effects = formData.effects.filter(effect =>
          effect.name || effect.roll || effect.tier1 || effect.tier2 || effect.tier3 || effect.effect || effect.cost
        )
      }

      // Ensure we have at least one effect
      if (!formData.effects || formData.effects.length === 0) {
        formData.effects = [{ effect: featureDescription.value || '' }]
      }

      emit('update:modelValue', { ...formData })
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

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    emit('cancel')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape, true)
  initializeVillainActionNumber()
  initializePowerRollState()
  validateFields()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape, true)
})

// Watch for changes and validate
watch(formData, () => {
  validateFields()
  emit('update:modelValue', { ...formData })
}, { deep: true })

// Watch power roll formula and update effects
watch(powerRollFormula, () => {
  if (hasPowerRoll.value) {
    ensurePowerRollEffect()
  }
})

// Watch power roll tiers and update effects
watch(powerRollTiers, () => {
  if (hasPowerRoll.value) {
    ensurePowerRollEffect()
  }
}, { deep: true })

// Watch hasPowerRoll and update section height
watch(hasPowerRoll, async () => {
  await nextTick()
  if (powerRollSection.value && powerRollSection.value.updateHeight) {
    powerRollSection.value.updateHeight()
  }
})

// Watch keywords array and update section height
watch(() => formData.keywords, async () => {
  await nextTick()
  if (keywordsSection.value && keywordsSection.value.updateHeight) {
    keywordsSection.value.updateHeight()
  }
}, { deep: true })

// Watch effects array changes and update CollapsibleSection height
watch(() => formData.effects, async () => {
  await nextTick()
  if (effectsSection.value && effectsSection.value.updateHeight) {
    effectsSection.value.updateHeight()
  }
}, { deep: true })

// Watch ability_type changes to handle villain action selection
watch(() => formData.ability_type, (newType, oldType) => {
  if (newType !== 'Villain Action' && !newType?.startsWith('Villain Action ')) {
    // Switched away from villain action, clear usage field
    if (oldType === 'Villain Action' || oldType?.startsWith('Villain Action ')) {
      formData.usage = 'Main action'
    }
  }
})
</script>

<style scoped>
.ability-editor {
  padding: 1.5rem;
  max-height: 90vh;
  overflow-y: auto;
  padding-bottom: 3rem;
  /* Extra padding at bottom for better scrolling */
}

.editor-header {
  text-align: center;
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

.editor-footer {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid #e9ecef;
  background: var(--color-neutral-50);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  display: flex;
  justify-content: center;
}

.editor-footer .editor-actions {
  justify-content: center;
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
  padding-bottom: var(--space-8);
  /* Ensure content doesn't get cut off */
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
  overflow: hidden;
  /* Prevent content overflow */
}

.selected-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-height: 120px;
  /* Limit height to prevent excessive growth */
  overflow-y: auto;
  /* Allow scrolling if many keywords */
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
  max-height: 100px;
  /* Limit height of quick keywords */
  overflow-y: auto;
  /* Allow scrolling if many options */
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

.type-display {
  padding: 0.5rem;
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--color-neutral-700);
  font-weight: var(--font-weight-medium);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .ability-editor {
    padding: 1rem;
  }

  .editor-header {
    text-align: center;
  }

  .editor-footer .editor-actions {
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
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

/* Power Roll Section Styles */
.power-roll-section {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.power-roll-toggle {
  margin-bottom: var(--space-4);
}

.power-roll-content {
  border-top: 1px solid var(--color-neutral-200);
  padding-top: var(--space-4);
  margin-top: var(--space-4);
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
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;
}

.toggle-switch input[type="checkbox"] {
  position: relative;
  width: 44px;
  height: 24px;
  appearance: none;
  background: var(--color-neutral-300);
  border-radius: 24px;
  outline: none;
  transition: background var(--transition-base);
  cursor: pointer;
}

.toggle-switch input[type="checkbox"]:checked {
  background: var(--color-primary-600);
}

.toggle-switch input[type="checkbox"]:focus-visible {
  box-shadow: var(--focus-ring);
}

.toggle-switch input[type="checkbox"]::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.toggle-switch input[type="checkbox"]:checked::before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-800);
}

/* Effects Section Styles */
.effects-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.effect-item {
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  position: relative;
}

.effect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-neutral-200);
}

.effect-title {
  font-size: 1.1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
  margin: 0;
}

.btn-remove-effect {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-error-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-button);
}

.btn-remove-effect:hover:not(:disabled) {
  background-color: var(--color-error-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-remove-effect:disabled {
  background-color: var(--color-neutral-400);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-add-effect {
  padding: var(--space-3) var(--space-6);
  background-color: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-button);
  align-self: flex-start;
  margin-top: var(--space-4);
}

.btn-add-effect:hover {
  background-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-add-effect:active {
  transform: translateY(0);
  transition-duration: var(--duration-fast);
}
</style>