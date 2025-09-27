<template>
  <div class="abilities-form">
    <h2 class="form-section-title">Abilities & Features</h2>
    
    <div class="abilities-section">
      <p class="section-description">
        Manage this monster's abilities, features, and actions. Features are passive traits, while abilities are active actions the monster can take.
      </p>
      
      <!-- Abilities List -->
      <div class="abilities-list" v-if="formData.items.length > 0">
        <div 
          v-for="(item, index) in formData.items" 
          :key="`ability-${index}`"
          class="ability-card"
          :class="{ expanded: expandedIndex === index }"
        >
          <div class="ability-header" @click="toggleExpanded(index)">
            <div class="ability-title-section">
              <h3 class="ability-name">{{ item.name || 'Unnamed Ability' }}</h3>
              <div class="ability-badges">
                <span class="ability-type-badge" :class="item.type">
                  {{ capitalize(item.type) }}
                </span>
                <span 
                  v-if="item.system.category" 
                  class="category-badge"
                  :class="item.system.category"
                >
                  {{ capitalize(item.system.category) }}
                </span>
                <span v-if="item.system.resource" class="resource-badge">
                  {{ item.system.resource }} Malice
                </span>
              </div>
            </div>
            <div class="ability-controls">
              <button 
                type="button"
                class="btn-edit"
                @click.stop="editAbility(index)"
                title="Edit ability"
              >
                Edit
              </button>
              <button 
                type="button"
                class="btn-remove"
                @click.stop="removeAbility(index)"
                title="Remove ability"
              >
                ×
              </button>
            </div>
          </div>
          
          <!-- Expanded Content -->
          <div v-if="expandedIndex === index" class="ability-content">
            <div class="ability-details">
              <!-- System Properties -->
              <div v-if="item.system.type && item.system.type !== 'none'" class="detail-row">
                <strong>Type:</strong> {{ formatActionType(item.system.type) }}
              </div>
              <div v-if="item.system.keywords?.length" class="detail-row">
                <strong>Keywords:</strong> {{ item.system.keywords.join(', ') }}
              </div>
              <div v-if="item.system.distance" class="detail-row">
                <strong>Distance:</strong> {{ formatDistance(item.system.distance) }}
              </div>
              <div v-if="item.system.target" class="detail-row">
                <strong>Target:</strong> {{ formatTarget(item.system.target) }}
              </div>
              <div v-if="item.system.trigger" class="detail-row">
                <strong>Trigger:</strong> {{ item.system.trigger }}
              </div>
              
              <!-- Power Roll -->
              <div v-if="item.system.power?.roll" class="detail-row">
                <strong>Power Roll:</strong> {{ item.system.power.roll.formula }}
                <span v-if="item.system.power.roll.characteristics?.length">
                  ({{ item.system.power.roll.characteristics.join(', ') }})
                </span>
              </div>
              
              <!-- Power Tiers -->
              <div v-if="item.system.power?.tiers?.length" class="power-tiers">
                <strong>Power Tiers:</strong>
                <div class="tiers-list">
                  <div 
                    v-for="tier in item.system.power.tiers" 
                    :key="tier.tier"
                    class="tier-item"
                  >
                    <span class="tier-number">{{ tier.tier }}:</span>
                    <span class="tier-display">{{ tier.display }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Effects -->
              <div v-if="item.system.effect?.before" class="detail-row">
                <strong>Effect (Before):</strong>
                <div class="effect-text" v-html="item.system.effect.before"></div>
              </div>
              <div v-if="item.system.effect?.after" class="detail-row">
                <strong>Effect (After):</strong>
                <div class="effect-text" v-html="item.system.effect.after"></div>
              </div>
              
              <!-- Description (for features) -->
              <div v-if="item.system.description?.value" class="detail-row">
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
        <button 
          type="button" 
          class="btn-add-ability"
          @click="addNewAbility"
        >
          + Add New Ability
        </button>
        <button 
          type="button" 
          class="btn-add-feature"
          @click="addNewFeature"
        >
          + Add New Feature
        </button>
      </div>
    </div>
    
    <!-- Ability Editor Modal -->
    <div v-if="editingIndex !== null && editingAbility" class="modal-overlay" @click.self="closeEditor">
      <div class="modal-content">
        <AbilityEditor
          :model-value="editingAbility"
          @update:model-value="updateEditingAbility"
          @save="saveAbility"
          @cancel="closeEditor"
        />
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

const formatActionType = (type: string) => {
  const types: Record<string, string> = {
    'main': 'Main Action',
    'move': 'Move Action',
    'triggered': 'Triggered Action',
    'villain': 'Villain Action',
    'none': 'Passive'
  }
  return types[type] || capitalize(type)
}

const formatDistance = (distance: MonsterItem['system']['distance']) => {
  if (!distance) return 'Special'
  
  if (distance.type === 'melee') {
    return `Melee ${distance.primary || 1}`
  } else if (distance.type === 'ranged') {
    return `Ranged ${distance.primary || 5}`
  } else if (distance.type === 'meleeRanged') {
    return `Melee ${distance.primary || 1} or Ranged ${distance.secondary || 5}`
  }
  
  return capitalize(distance.type)
}

const formatTarget = (target: MonsterItem['system']['target']) => {
  if (!target) return 'Special'
  
  if (target.type === 'creatureObject' && target.value) {
    return `${target.value} creature${target.value > 1 ? 's' : ''} or object${target.value > 1 ? 's' : ''}`
  }
  
  return capitalize(target.type)
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
    system: {
      keywords: [],
      ...(type === 'ability' && {
        category: 'signature',
        type: 'main',
        resource: null,
        distance: {
          type: 'melee',
          primary: 1
        },
        target: {
          type: 'creatureObject',
          value: 1
        },
        trigger: '',
        power: {
          roll: {
            formula: '2d10',
            characteristics: ['might']
          },
          tiers: [
            { tier: 1, display: 'Effect on tier 1' },
            { tier: 2, display: 'Effect on tier 2' },
            { tier: 3, display: 'Effect on tier 3' }
          ]
        },
        effect: {
          before: '',
          after: ''
        },
        spend: {
          text: '',
          value: null
        }
      }),
      ...(type === 'feature' && {
        power: null,
        description: {
          value: 'Feature description goes here.',
          director: ''
        }
      })
    }
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

const isValid = computed(() => {
  // Validate that all items have names and required fields
  return formData.items.every(item => {
    if (!item.name || item.name.trim() === '') return false
    if (item.type === 'feature') {
      return item.system.description?.value && item.system.description.value.trim() !== ''
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
  color: #8b4513;
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #8b4513;
}

.abilities-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.abilities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ability-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  transition: all 0.2s ease;
}

.ability-card:hover {
  border-color: #8b4513;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ability-card.expanded {
  border-color: #8b4513;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  user-select: none;
}

.ability-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ability-name {
  color: #8b4513;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.ability-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ability-type-badge,
.category-badge,
.resource-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.ability-type-badge.ability {
  background: #007bff;
  color: white;
}

.ability-type-badge.feature {
  background: #28a745;
  color: white;
}

.category-badge.signature {
  background: #ffc107;
  color: #212529;
}

.category-badge.heroic {
  background: #dc3545;
  color: white;
}

.resource-badge {
  background: #6f42c1;
  color: white;
}

.ability-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-edit:hover {
  background: #5a6268;
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

.ability-content {
  padding: 0 1rem 1rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.ability-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-row strong {
  color: #495057;
  font-size: 0.9rem;
}

.power-tiers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tiers-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 1rem;
}

.tier-item {
  display: flex;
  gap: 0.5rem;
}

.tier-number {
  font-weight: bold;
  color: #8b4513;
  min-width: 20px;
}

.tier-display {
  color: #495057;
}

.effect-text,
.description-text {
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.add-ability-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn-add-ability,
.btn-add-feature {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-ability {
  background: #007bff;
  color: white;
}

.btn-add-ability:hover {
  background: #0056b3;
}

.btn-add-feature {
  background: #28a745;
  color: white;
}

.btn-add-feature:hover {
  background: #1e7e34;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .ability-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .ability-controls {
    align-self: flex-end;
  }
  
  .add-ability-section {
    flex-direction: column;
    align-items: center;
  }
  
  .modal-overlay {
    padding: 0.5rem;
  }
}
</style>