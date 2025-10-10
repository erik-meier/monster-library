<template>
  <div class="abilities-form">
    <h2 class="form-section-title">Abilities & Features</h2>

    <div class="abilities-section">
      <p class="section-description">
        Manage this monster's abilities and features. Features are passive traits, while abilities are active
        actions the monster can take.
      </p>

      <!-- Abilities List -->
      <div class="abilities-list" v-if="formData.items.length > 0">
        <div v-for="(item, index) in formData.items" :key="`ability-${index}`" class="ability-card"
          :class="{ expanded: expandedIndex === index }">
          <div class="ability-header" @click="toggleExpanded(index)">
            <div class="ability-title-section">
              <h3 class="ability-name">{{ item.name || 'Unnamed Ability' }}</h3>
              <div class="ability-badges">
                <span class="ability-type-badge" :class="item.type">
                  {{ capitalize(item.type) }}
                </span>
                <span v-if="getAbilityCategory(item)" class="category-badge" :class="getAbilityCategory(item)">
                  {{ capitalize(getAbilityCategory(item) || '') }}
                </span>
                <span v-if="getAbilityCost(item)" class="resource-badge">
                  {{ getAbilityCost(item) }}
                </span>
              </div>
            </div>
            <div class="ability-controls">
              <button type="button" class="btn-edit" @click.stop="editAbility(index)" title="Edit ability">
                Edit
              </button>
              <button type="button" class="btn-remove" @click.stop="removeAbility(index)" title="Remove ability">
                ×
              </button>
            </div>
          </div>

          <!-- Expanded Content -->
          <div v-if="expandedIndex === index" class="ability-content">
            <div class="ability-details">
              <!-- Ability Properties -->
              <div v-if="item.ability_type" class="detail-row">
                <strong>Type:</strong> {{ item.ability_type }}
              </div>
              <div v-if="item.usage && item.usage !== 'none'" class="detail-row">
                <strong>Usage:</strong> {{ formatActionType(item.usage) }}
              </div>
              <div v-if="item.keywords?.length" class="detail-row">
                <strong>Keywords:</strong> {{ item.keywords.join(', ') }}
              </div>
              <div v-if="item.distance" class="detail-row">
                <strong>Distance:</strong> {{ item.distance }}
              </div>
              <div v-if="item.target" class="detail-row">
                <strong>Target:</strong> {{ item.target }}
              </div>
              <div v-if="item.trigger" class="detail-row">
                <strong>Trigger:</strong> {{ item.trigger }}
              </div>
              <div v-if="item.cost" class="detail-row">
                <strong>Cost:</strong> {{ item.cost }}
              </div>

              <!-- Effects -->
              <div v-if="item.effects?.length" class="effects-section">
                <div class="effects-list">
                  <div v-for="(effect, effectIndex) in item.effects" :key="effectIndex" class="effect-item">
                    <div v-if="effect.name" class="effect-name">{{ effect.name }}</div>

                    <!-- Power Roll -->
                    <div v-if="effect.roll" class="detail-row">
                      <strong>Power Roll:</strong> {{ effect.roll }}
                    </div>

                    <!-- Power Tiers -->
                    <div v-if="effect.tier1 || effect.tier2 || effect.tier3" class="power-tiers">
                      <div class="tiers-list">
                        <div v-if="effect.tier1" class="tier-item">
                          <span class="tier-number">Tier 1:</span>
                          <span class="tier-display">{{ effect.tier1 }}</span>
                        </div>
                        <div v-if="effect.tier2" class="tier-item">
                          <span class="tier-number">Tier 2:</span>
                          <span class="tier-display">{{ effect.tier2 }}</span>
                        </div>
                        <div v-if="effect.tier3" class="tier-item">
                          <span class="tier-number">Tier 3:</span>
                          <span class="tier-display">{{ effect.tier3 }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Effect Text -->
                    <div v-if="effect.effect" class="detail-row">
                      <div class="effect-text" v-html="effect.effect"></div>
                    </div>

                    <!-- Effect Cost -->
                    <div v-if="effect.cost" class="detail-row">
                      <strong>Cost:</strong> {{ effect.cost }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Legacy system support (fallback) -->
              <div v-if="!item.effects?.length && item.system?.description?.value" class="detail-row">
                <strong>Description:</strong>
                <div class="description-text" v-html="item.system.description.value"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">⚔️</div>
        <h3>No Abilities Added Yet</h3>
        <p>Add abilities and features to bring this monster to life!</p>
      </div>

      <!-- Add New Ability -->
      <div class="add-ability-section">
        <button type="button" class="btn-add-ability" @click="addNewAbility">
          + Add New Ability
        </button>
        <button type="button" class="btn-add-feature" @click="addNewFeature">
          + Add New Feature
        </button>
      </div>
    </div>

    <!-- Ability Editor Modal -->
    <div v-if="editingIndex !== null && editingAbility" class="modal-overlay" @keydown.escape.stop="closeEditor">
      <div class="modal-content">
        <AbilityEditor :model-value="editingAbility" :existing-items="formData.items" :editing-index="editingIndex"
          @update:model-value="updateEditingAbility" @save="saveAbility" @cancel="closeEditor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { MonsterFormData, MonsterItem } from '@/types/monster-forms'
import AbilityEditor from './AbilityEditor.vue'

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
  items: [...(props.modelValue.items || [])]
})

const expandedIndex = ref<number | null>(null)
const editingIndex = ref<number | null>(null)
const editingAbility = ref<MonsterItem | null>(null)

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatActionType = (usage: string) => {
  const types: Record<string, string> = {
    'Main action': 'Main Action',
    'Maneuver': 'Maneuver',
    'Triggered action': 'Triggered Action',
    'Free triggered action': 'Free Triggered Action',
    'Move action': 'Move Action',
    'main': 'Main Action',
    'move': 'Move Action',
    'triggered': 'Triggered Action',
    'villain': 'Villain Action',
    'none': 'Passive'
  }
  return types[usage] || capitalize(usage)
}

const toggleExpanded = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

const editAbility = (index: number) => {
  editingIndex.value = index
  editingAbility.value = JSON.parse(JSON.stringify(formData.items[index]))
}

const closeEditor = () => {
  editingIndex.value = null
  editingAbility.value = null
}

const updateEditingAbility = (ability: MonsterItem) => {
  editingAbility.value = ability
}

const saveAbility = () => {
  if (editingIndex.value !== null && editingAbility.value) {
    formData.items[editingIndex.value] = JSON.parse(JSON.stringify(editingAbility.value))
    closeEditor()
  }
}

const removeAbility = (index: number) => {
  if (confirm('Are you sure you want to remove this ability?')) {
    formData.items.splice(index, 1)
    if (expandedIndex.value === index) {
      expandedIndex.value = null
    } else if (expandedIndex.value !== null && expandedIndex.value > index) {
      expandedIndex.value--
    }
  }
}

const createNewItem = (type: 'ability' | 'feature'): MonsterItem => {
  const baseItem: MonsterItem = {
    name: type === 'ability' ? 'New Ability' : 'New Feature',
    type,
    keywords: [],
    effects: [
      type === 'ability'
        ? {
          name: '',
          roll: '2d10 + 3',
          tier1: 'Tier 1 effect',
          tier2: 'Tier 2 effect',
          tier3: 'Tier 3 effect',
          effect: '',
          cost: ''
        }
        : {
          name: '',
          effect: type === 'feature' ? 'Feature description goes here.' : '',
          cost: ''
        }
    ],
    ...(type === 'ability' && {
      ability_type: '',
      usage: 'Main action',
      distance: 'Melee 1',
      target: 'One creature',
      cost: ''
    })
  }

  return baseItem
}

const addNewAbility = () => {
  const newAbility = createNewItem('ability')
  formData.items.push(newAbility)
  editAbility(formData.items.length - 1)
}

const addNewFeature = () => {
  const newFeature = createNewItem('feature')
  formData.items.push(newFeature)
  editAbility(formData.items.length - 1)
}

// Helper methods to handle both new and old data structures
const getAbilityCategory = (item: MonsterItem) => {
  // Check for new structure signature indicator
  if (item.ability_type?.includes('Signature')) return 'signature'
  if (item.ability_type?.includes('Villain')) return 'villain'
  // Check for old structure
  return item.system?.category
}

const getAbilityCost = (item: MonsterItem) => {
  // Check for new structure: top-level cost or effects with cost field
  if (item.cost) return item.cost

  if (item.effects && item.effects.length > 0) {
    const costEffect = item.effects.find(effect => effect.cost)
    if (costEffect) return costEffect.cost
  }

  // Check for old structure
  return item.system?.resource ? `${item.system.resource} Malice` : null
}

const isValid = computed(() => {
  // Validate that all items have names and required fields
  return formData.items.every(item => {
    if (!item.name || item.name.trim() === '') return false
    if (item.type === 'feature') {
      // Check new format first, then fallback to old format
      if (item.effects && item.effects.length > 0) {
        return item.effects.some(effect => effect.effect && effect.effect.trim() !== '')
      }
      return item.system?.description?.value && item.system.description.value.trim() !== ''
    }
    // For abilities, we just need a name for now
    return true
  })
})

const updateModelValue = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    items: JSON.parse(JSON.stringify(formData.items))
  })
}

// Watch for changes and update model
watch(formData, () => {
  updateModelValue()
}, { deep: true })

// Watch for external changes
watch(() => props.modelValue.items, (newItems) => {
  if (JSON.stringify(newItems) !== JSON.stringify(formData.items)) {
    formData.items = JSON.parse(JSON.stringify(newItems || []))
  }
}, { deep: true })

// Emit validity status
watch(isValid, (valid) => {
  emit('update:isValid', valid)
}, { immediate: true })
</script>

<style scoped>
.abilities-form {
  padding: 1rem 0;
}

.form-section-title {
  color: var(--color-primary-600);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-6) 0;
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-primary-600);
}

.abilities-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-description {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.abilities-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ability-card {
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  background: white;
  overflow: hidden;
  transition: var(--transition-card);
  box-shadow: var(--shadow-sm);
}

.ability-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.ability-card.expanded {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  cursor: pointer;
  user-select: none;
  transition: var(--transition-colors);
}

.ability-header:hover {
  background: var(--color-neutral-50);
}

.ability-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ability-name {
  color: var(--color-primary-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.ability-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.ability-type-badge,
.category-badge,
.resource-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.ability-type-badge.ability {
  background: var(--color-info-600);
  color: white;
}

.ability-type-badge.feature {
  background: var(--color-success-600);
  color: white;
}

.category-badge.signature {
  background: var(--color-warning-500);
  color: var(--color-neutral-900);
}

.category-badge.heroic {
  background: var(--color-error-600);
  color: white;
}

.resource-badge {
  background: var(--color-primary-600);
  color: white;
}

.ability-controls {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.btn-edit {
  padding: var(--space-2) var(--space-3);
  background: var(--color-neutral-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-button);
}

.btn-edit:hover {
  background: var(--color-neutral-700);
  transform: translateY(-1px);
}

.btn-edit:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
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
}

.btn-remove:hover {
  background: var(--color-error-700);
  transform: translateY(-1px);
}

.btn-remove:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-error);
}

.ability-content {
  padding: 0 var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-50);
  animation: expand var(--duration-expand) cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes expand {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ability-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-4);
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-row strong {
  color: var(--color-neutral-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.detail-row {
  color: var(--color-neutral-800);
}

.power-tiers {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tiers-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-left: var(--space-4);
}

.tier-item {
  display: flex;
  gap: var(--space-2);
}

.tier-number {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  min-width: 24px;
}

.tier-display {
  color: var(--color-neutral-800);
}

.effect-text,
.description-text {
  background: white;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-neutral-800);
}

.effects-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-neutral-800);
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-left: var(--space-4);
}

.effect-item {
  background: white;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-neutral-800);
}

.effect-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-600);
  font-size: var(--font-size-sm);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-neutral-600);
}

.empty-icon {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--space-4);
  opacity: 0.8;
}

.empty-state h3 {
  color: var(--color-neutral-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

.add-ability-section {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
}

.btn-add-ability,
.btn-add-feature {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-button);
}

.btn-add-ability {
  background: var(--color-info-600);
  color: white;
}

.btn-add-ability:hover {
  background: var(--color-info-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-add-ability:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn-add-feature {
  background: var(--color-success-600);
  color: white;
}

.btn-add-feature:hover {
  background: var(--color-success-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-add-feature:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: var(--radius-xl);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: modalAppear var(--duration-expand) cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-section-title {
    font-size: var(--font-size-lg);
  }

  .ability-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3);
  }

  .ability-controls {
    align-self: flex-end;
  }

  .add-ability-section {
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .modal-overlay {
    padding: var(--space-2);
  }

  .empty-state {
    padding: var(--space-8) var(--space-2);
  }

  .empty-icon {
    font-size: var(--font-size-2xl);
  }
}
</style>