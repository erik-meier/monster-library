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
            <input 
              id="ability-name"
              v-model="formData.name"
              type="text" 
              class="form-input"
              :class="{ invalid: errors.name }"
              placeholder="Ability name"
            />
            <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
          </div>
          
          <div class="form-group">
            <label for="ability-type" class="form-label required">Type</label>
            <select 
              id="ability-type"
              v-model="formData.type"
              class="form-select"
              :class="{ invalid: errors.type }"
              @change="onTypeChange"
            >
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
          <textarea 
            id="feature-description"
            v-model="formData.system.description!.value"
            class="form-textarea"
            :class="{ invalid: errors.description }"
            rows="4"
            placeholder="Describe what this feature does..."
          />
          <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
          <div class="help-text">HTML is supported for formatting</div>
        </div>
        
        <div class="form-group">
          <label for="director-notes" class="form-label">Director Notes</label>
          <textarea 
            id="director-notes"
            v-model="formData.system.description!.director"
            class="form-textarea"
            rows="2"
            placeholder="Optional notes for the Director..."
          />
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
              <label for="ability-category" class="form-label">Category</label>
              <select 
                id="ability-category"
                v-model="formData.system.category"
                class="form-select"
              >
                <option value="">None</option>
                <option value="signature">Signature</option>
                <option value="heroic">Heroic</option>
                <option value="villain">Villain</option>
              </select>
              <div class="help-text">Signature abilities are always available</div>
            </div>
            
            <div class="form-group">
              <label for="action-type" class="form-label">Action Type</label>
              <select 
                id="action-type"
                v-model="formData.system.type"
                class="form-select"
              >
                <option value="main">Main Action</option>
                <option value="move">Move Action</option>
                <option value="triggered">Triggered Action</option>
                <option value="villain">Villain Action</option>
                <option value="none">Passive/Special</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="malice-cost" class="form-label">Malice Cost</label>
              <input 
                id="malice-cost"
                v-model.number="formData.system.resource"
                type="number" 
                class="form-input"
                min="0"
                placeholder="0"
              />
              <div class="help-text">Leave empty if no cost</div>
            </div>
          </div>
        </section>

        <!-- Targeting -->
        <section class="editor-section">
          <h3 class="section-title">Targeting</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="distance-type" class="form-label">Distance Type</label>
              <select 
                id="distance-type"
                v-model="formData.system.distance!.type"
                class="form-select"
              >
                <option value="melee">Melee</option>
                <option value="ranged">Ranged</option>
                <option value="meleeRanged">Melee or Ranged</option>
                <option value="special">Special</option>
              </select>
            </div>
            
            <div class="form-group" v-if="formData.system.distance!.type === 'melee' || formData.system.distance!.type === 'meleeRanged'">
              <label for="melee-range" class="form-label">Melee Range</label>
              <input 
                id="melee-range"
                v-model.number="formData.system.distance!.primary"
                type="number" 
                class="form-input"
                min="1"
                placeholder="1"
              />
            </div>
            
            <div class="form-group" v-if="formData.system.distance!.type === 'ranged' || formData.system.distance!.type === 'meleeRanged'">
              <label for="ranged-distance" class="form-label">Ranged Distance</label>
              <input 
                id="ranged-distance"
                v-model.number="formData.system.distance!.secondary"
                type="number" 
                class="form-input"
                min="1"
                placeholder="5"
              />
            </div>
            
            <div class="form-group">
              <label for="target-count" class="form-label">Target Count</label>
              <input 
                id="target-count"
                v-model.number="formData.system.target!.value"
                type="number" 
                class="form-input"
                min="1"
                placeholder="1"
              />
              <div class="help-text">Number of creatures or objects</div>
            </div>
          </div>
        </section>

        <!-- Power Roll -->
        <section class="editor-section">
          <h3 class="section-title">Power Roll</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="power-formula" class="form-label">Roll Formula</label>
              <input 
                id="power-formula"
                v-model="formData.system.power!.roll!.formula"
                type="text" 
                class="form-input"
                placeholder="2d10 + 2"
              />
              <div class="help-text">e.g., 2d10, 2d10 + 3, 1d20 + 5</div>
            </div>
            
            <div class="form-group">
              <label for="characteristics" class="form-label">Characteristics</label>
              <div class="checkbox-group">
                <label 
                  v-for="char in characteristicsList" 
                  :key="char.value"
                  class="checkbox-label"
                >
                  <input 
                    type="checkbox" 
                    :value="char.value"
                    v-model="formData.system.power!.roll!.characteristics"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">{{ char.label }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Power Tiers -->
          <div class="power-tiers">
            <h4 class="subsection-title">Power Tiers</h4>
            <div class="tier-list">
              <div 
                v-for="(tier, index) in formData.system.power!.tiers!" 
                :key="index"
                class="tier-row"
              >
                <div class="tier-number">{{ tier.tier }}</div>
                <input 
                  v-model="tier.display"
                  type="text"
                  class="tier-input"
                  :placeholder="`Tier ${tier.tier} effect`"
                />
                <button 
                  v-if="formData.system.power!.tiers!.length > 1"
                  type="button"
                  class="btn-remove-tier"
                  @click="removeTier(index)"
                >
                  ×
                </button>
              </div>
            </div>
            <button type="button" class="btn-add-tier" @click="addTier">
              + Add Tier
            </button>
          </div>
        </section>

        <!-- Effects -->
        <section class="editor-section">
          <h3 class="section-title">Effects</h3>
          <div class="form-group">
            <label for="effect-before" class="form-label">Effect (Before Roll)</label>
            <textarea 
              id="effect-before"
              v-model="formData.system.effect!.before"
              class="form-textarea"
              rows="2"
              placeholder="Effect that happens before the power roll..."
            />
          </div>
          
          <div class="form-group">
            <label for="effect-after" class="form-label">Effect (After Roll)</label>
            <textarea 
              id="effect-after"
              v-model="formData.system.effect!.after"
              class="form-textarea"
              rows="2"
              placeholder="Effect that happens after the power roll..."
            />
          </div>
          
          <div class="help-text">HTML is supported for formatting</div>
        </section>

        <!-- Trigger -->
        <section class="editor-section" v-if="formData.system.type === 'triggered'">
          <h3 class="section-title">Trigger</h3>
          <div class="form-group">
            <label for="trigger-text" class="form-label">Trigger Condition</label>
            <textarea 
              id="trigger-text"
              v-model="formData.system.trigger"
              class="form-textarea"
              rows="2"
              placeholder="When this ability triggers..."
            />
          </div>
        </section>
      </template>

      <!-- Keywords (for both abilities and features) -->
      <section class="editor-section">
        <h3 class="section-title">Keywords</h3>
        <div class="keywords-editor">
          <div class="selected-keywords" v-if="formData.system.keywords.length > 0">
            <span 
              v-for="keyword in formData.system.keywords" 
              :key="keyword"
              class="keyword-tag"
            >
              {{ keyword }}
              <button 
                type="button"
                class="remove-keyword"
                @click="removeKeyword(keyword)"
              >
                ×
              </button>
            </span>
          </div>
          
          <div class="keyword-input-group">
            <input 
              v-model="newKeyword"
              type="text"
              class="keyword-input"
              placeholder="Add keyword..."
              @keyup.enter="addKeyword"
            />
            <button 
              type="button" 
              class="btn-add-keyword"
              @click="addKeyword"
              :disabled="!newKeyword.trim()"
            >
              Add
            </button>
          </div>
          
          <!-- Quick Add Common Keywords -->
          <div class="quick-keywords">
            <button
              v-for="keyword in quickKeywords"
              :key="keyword"
              type="button"
              class="quick-keyword-btn"
              :class="{ selected: formData.system.keywords.includes(keyword) }"
              @click="toggleQuickKeyword(keyword)"
            >
              {{ keyword }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { MonsterItem } from '@/types/monster-forms'
import { ABILITY_KEYWORDS } from '@/types/monster-forms'

interface Props {
  modelValue: MonsterItem
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
  description: ''
})

const isFeature = computed(() => formData.type === 'feature')

const isValid = computed(() => {
  return Object.values(errors).every(error => error === '') &&
         formData.name.trim() !== '' &&
         (isFeature.value ? formData.system.description?.value?.trim() !== '' : true)
})

const validateFields = () => {
  errors.name = formData.name.trim() === '' ? 'Name is required' : ''
  errors.type = !formData.type ? 'Type is required' : ''
  
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
      category: formData.system.category || 'signature',
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
        before: '',
        after: ''
      },
      spend: formData.system.spend || {
        text: '',
        value: null
      }
    }
  }
  validateFields()
}

const addTier = () => {
  if (!isFeature.value && formData.system.power?.tiers) {
    const nextTier = formData.system.power.tiers.length + 1
    formData.system.power.tiers.push({
      tier: nextTier,
      display: ''
    })
  }
}

const removeTier = (index: number) => {
  if (!isFeature.value && formData.system.power?.tiers && formData.system.power.tiers.length > 1) {
    formData.system.power.tiers.splice(index, 1)
    // Renumber tiers
    formData.system.power.tiers.forEach((tier, i) => {
      tier.tier = i + 1
    })
  }
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

// Watch for changes and validate
watch(formData, () => {
  validateFields()
  emit('update:modelValue', JSON.parse(JSON.stringify(formData)))
}, { deep: true })

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

.btn-remove-tier {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-add-tier {
  padding: 0.5rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
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
</style>