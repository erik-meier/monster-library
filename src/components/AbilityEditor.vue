<template>
  <div class="ability-editor">
    <header class="editor-header">
      <h2 class="editor-title">
        {{ isFeature ? 'Edit Feature' : 'Edit Ability' }}: {{ formData.name }}
      </h2>
      <div class="editor-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button type="button" class="btn btn-primary" @click="handleSave" :disabled="!isValid">
          Save
        </button>
      </div>
    </header>

    <div class="editor-content">
      <!-- Basic Info -->
      <section class="editor-section">
        <h3 class="section-title">Basic Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="ability-name" class="form-label required">Name</label>
            <input id="ability-name" v-model="formData.name" type="text" class="form-input"
              :class="{ invalid: errors.name }" placeholder="Ability name" />
            <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
          </div>

          <div class="form-group">
            <label for="ability-type" class="form-label required">Type</label>
            <select id="ability-type" v-model="formData.type" class="form-select" :class="{ invalid: errors.type }"
              @change="onTypeChange">
              <option value="ability">Ability (Active)</option>
              <option value="feature">Feature (Passive)</option>
            </select>
            <div v-if="errors.type" class="error-message">{{ errors.type }}</div>
          </div>
        </div>
      </section>

      <!-- Feature-specific fields -->
      <section v-if="isFeature" class="editor-section">
        <h3 class="section-title">Feature Description</h3>
        <div class="form-group">
          <label for="feature-description" class="form-label required">Description</label>
          <textarea id="feature-description" v-model="formData.system.description!.value" class="form-textarea"
            :class="{ invalid: errors.description }" rows="4" placeholder="Describe what this feature does..." />
          <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
          <div class="help-text">HTML is supported for formatting</div>
        </div>

        <div class="form-group">
          <label for="director-notes" class="form-label">Director Notes</label>
          <textarea id="director-notes" v-model="formData.system.description!.director" class="form-textarea" rows="2"
            placeholder="Optional notes for the Director..." />
          <div class="help-text">Private notes visible only to the Director</div>
        </div>
      </section>

      <!-- Ability-specific fields -->
      <template v-if="!isFeature">
        <!-- System Properties -->
        <section class="editor-section">
          <h3 class="section-title">Action Properties</h3>
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
              <input id="malice-cost" v-model.number="formData.system.resource" type="number" class="form-input" min="0"
                placeholder="0" />
              <div class="help-text">Leave empty if no cost</div>
            </div>
          </div>
        </section>

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
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { MonsterItem } from '@/types/monster-forms'
import { ABILITY_KEYWORDS } from '@/types/monster-forms'

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

      // Find existing tier or create new one
      let tier = formData.system.power.tiers.find(t => t.tier === tierNum)
      if (!tier) {
        tier = { tier: tierNum, display: value }
        formData.system.power.tiers.push(tier)
        // Sort tiers by tier number
        formData.system.power.tiers.sort((a, b) => a.tier - b.tier)
      } else {
        tier.display = value
      }
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
}



const addKeyword = () => {
  const keyword = newKeyword.value.toLowerCase().trim()
  if (keyword && !formData.system.keywords.includes(keyword)) {
    formData.system.keywords.push(keyword)
    newKeyword.value = ''
  }
}

const removeKeyword = (keyword: string) => {
  const index = formData.system.keywords.indexOf(keyword)
  if (index > -1) {
    formData.system.keywords.splice(index, 1)
  }
}

const toggleQuickKeyword = (keyword: string) => {
  if (formData.system.keywords.includes(keyword)) {
    removeKeyword(keyword)
  } else {
    formData.system.keywords.push(keyword)
  }
}

const handleSave = () => {
  validateFields()
  if (isValid.value) {
    emit('save')
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

// Watch for changes and validate
watch(formData, () => {
  validateFields()
  emit('update:modelValue', JSON.parse(JSON.stringify(formData)))
}, { deep: true })

// Watch for hasPowerRoll toggle changes
watch(hasPowerRoll, (newValue) => {
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
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  Object.assign(formData, JSON.parse(JSON.stringify(newValue)))
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

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.editor-section {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
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
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #8b4513;
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.25);
}

.form-input.invalid,
.form-select.invalid,
.form-textarea.invalid {
  border-color: #dc3545;
}

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
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.help-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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