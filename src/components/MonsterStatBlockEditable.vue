<template>
  <div class="stat-block" :class="{ 'edit-mode': editMode }">
    <!-- Header -->
    <div class="header">
      <div v-if="!editMode" class="view-mode">
        <h1 class="monster-name">{{ monster.name }}</h1>
        <div class="monster-meta-container">
          <p class="monster-meta-left">{{ formatMonsterRole(monster) }}</p>
          <p class="monster-meta-center">{{ formatKeywords(monster.keywords) }}</p>
          <p class="monster-meta-right">EV {{ monster.ev }}</p>
        </div>
      </div>
      
      <div v-else class="edit-mode">
        <!-- Editable Header -->
        <div class="editable-field">
          <input 
            v-model="editableData.name" 
            type="text" 
            class="monster-name-edit"
            placeholder="Monster name"
            @blur="updateField('name')"
          />
        </div>
        
        <div class="monster-meta-edit">
          <div class="meta-edit-group">
            <label>Level:</label>
            <input 
              v-model.number="editableData.level" 
              type="number" 
              min="1" 
              max="20"
              @blur="updateField('level')"
            />
          </div>
          
          <div class="meta-edit-group">
            <label>Role:</label>
            <select v-model="editableData.role" @change="updateField('role')">
              <option value="">None</option>
              <option value="Ambusher">Ambusher</option>
              <option value="Artillery">Artillery</option>
              <option value="Brute">Brute</option>
              <option value="Controller">Controller</option>
              <option value="Defender">Defender</option>
              <option value="Harrier">Harrier</option>
              <option value="Hexer">Hexer</option>
              <option value="Mount">Mount</option>
              <option value="Support">Support</option>
            </select>
          </div>
          
          <div class="meta-edit-group">
            <label>Organization:</label>
            <select v-model="editableData.organization" @change="updateField('organization')">
              <option value="Minion">Minion</option>
              <option value="Horde">Horde</option>
              <option value="Platoon">Platoon</option>
              <option value="Elite">Elite</option>
              <option value="Leader">Leader</option>
              <option value="Solo">Solo</option>
            </select>
          </div>
          
          <div class="meta-edit-group">
            <label>EV:</label>
            <input 
              v-model.number="editableData.ev" 
              type="number" 
              min="1"
              @blur="updateField('ev')"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Core Stats -->
    <div class="core-stats-grid">
      <div class="stat-labels">
        <div class="stat-label">Size</div>
        <div class="stat-label">Speed</div>
        <div class="stat-label">Stamina</div>
        <div class="stat-label">Stability</div>
        <div class="stat-label">Free Strike</div>
      </div>
      
      <div v-if="!editMode" class="stat-values">
        <div class="stat-value">{{ monster.size?.value || 1 }}{{ monster.size?.letter || 'M' }}</div>
        <div class="stat-value">{{ monster.speed }}</div>
        <div class="stat-value">{{ monster.stamina }}</div>
        <div class="stat-value">{{ monster.stability }}</div>
        <div class="stat-value">{{ monster.freeStrike }}</div>
      </div>
      
      <div v-else class="stat-edit-values">
        <div class="size-edit">
          <input 
            v-model.number="editableData.size.value" 
            type="number" 
            min="1" 
            class="size-input"
            @blur="updateField('size')"
          />
          <select 
            v-model="editableData.size.letter" 
            class="size-select"
            :disabled="editableData.size.value > 1"
            @change="updateField('size')"
          >
            <option value="">—</option>
            <option value="T">T</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
          </select>
        </div>
        <input 
          v-model.number="editableData.speed" 
          type="number" 
          min="1" 
          class="stat-input"
          @blur="updateField('speed')"
        />
        <input 
          v-model.number="editableData.stamina" 
          type="number" 
          min="1" 
          class="stat-input"
          @blur="updateField('stamina')"
        />
        <input 
          v-model.number="editableData.stability" 
          type="number" 
          class="stat-input"
          @blur="updateField('stability')"
        />
        <input 
          v-model.number="editableData.freeStrike" 
          type="number" 
          min="0" 
          class="stat-input"
          @blur="updateField('freeStrike')"
        />
      </div>
    </div>

    <div class="divider"></div>

    <!-- Characteristics -->
    <div class="characteristic-scores">
      <div 
        v-for="characteristic in characteristicOrder" 
        :key="characteristic"
        class="characteristic-score"
      >
        <div class="characteristic-name">{{ getCharacteristicName(characteristic) }}</div>
        
        <div v-if="!editMode" class="characteristic-value">
          {{ formatModifier(monster.characteristics?.[characteristic] || 0) }}
        </div>
        
        <div v-else class="characteristic-edit">
          <input 
            :value="editableData.characteristics[characteristic]"
            @input="updateCharacteristic(characteristic, $event.target.value)"
            @blur="updateField('characteristics')"
            type="number"
            class="characteristic-input"
            :min="-10"
            :max="20"
          />
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Secondary Stats -->
    <div class="secondary-stats">
      <span class="stat-item">
        <strong>Immunity</strong> {{ formatImmunity(monster.immunities) }}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat-item">
        <strong>Weakness</strong> {{ formatWeakness(monster.weaknesses) }}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat-item">
        <strong>Movement</strong> {{ formatMovement(monster.movementTypes) }}
      </span>
    </div>

    <div class="divider"></div>

    <!-- Abilities (read-only for now) -->
    <ActionsList 
      v-if="monster.items || monster.abilities" 
      :title="'Abilities'" 
      :actions="monster.items || monster.abilities || []" 
      :chr="String(getMaxCharacteristic())"
      :monster="monster" 
    />

    <!-- Source Information -->
    <div v-if="monster.source" class="source-info">
      <div class="divider"></div>
      <div class="source-text">
        <span v-if="monster.source.book">{{ monster.source.book }}</span>
        <span v-if="monster.source.page">, page {{ monster.source.page }}</span>
        <span v-if="monster.source.license"> • {{ monster.source.license }}</span>
      </div>
    </div>
    
    <!-- Edit Mode Controls -->
    <div v-if="editMode" class="edit-controls">
      <button @click="$emit('save', editableData)" class="btn btn-success">Save Changes</button>
      <button @click="$emit('cancel')" class="btn btn-secondary">Cancel</button>
      <button @click="revertChanges" class="btn btn-outline">Revert</button>
      <button @click="openAdvancedEdit" class="btn btn-link">Advanced Edit</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ActionsList from './ActionsList.vue'

const props = defineProps({
  monster: {
    type: Object,
    required: true
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel', 'update:monster', 'advanced-edit'])

const characteristicOrder = ['might', 'agility', 'reason', 'intuition', 'presence']

// Editable data
const editableData = ref({})
const originalData = ref({})

// Initialize editable data
const initializeEditableData = () => {
  const data = {
    name: props.monster.name || '',
    level: props.monster.level || 1,
    ev: props.monster.ev || 1,
    role: props.monster.role || '',
    organization: props.monster.organization || '',
    size: {
      value: props.monster.size?.value || 1,
      letter: props.monster.size?.letter || 'M'
    },
    speed: props.monster.speed || 6,
    stamina: props.monster.stamina || 10,
    stability: props.monster.stability || 0,
    freeStrike: props.monster.freeStrike || 2,
    characteristics: {
      might: props.monster.characteristics?.might || 0,
      agility: props.monster.characteristics?.agility || 0,
      reason: props.monster.characteristics?.reason || 0,
      intuition: props.monster.characteristics?.intuition || 0,
      presence: props.monster.characteristics?.presence || 0
    }
  }
  
  editableData.value = data
  originalData.value = JSON.parse(JSON.stringify(data))
}

// Watch for monster changes
watch(() => props.monster, initializeEditableData, { immediate: true, deep: true })

// Auto-save functionality
const updateField = (fieldName) => {
  // Emit the updated monster data for auto-save
  emit('update:monster', { ...editableData.value })
}

const updateCharacteristic = (characteristic, value) => {
  const numValue = parseInt(value) || 0
  editableData.value.characteristics[characteristic] = numValue
}

const revertChanges = () => {
  editableData.value = JSON.parse(JSON.stringify(originalData.value))
}

const openAdvancedEdit = () => {
  emit('advanced-edit')
}

// Helper methods
const formatModifier = (value) => {
  return value >= 0 ? `+${value}` : `${value}`
}

const getCharacteristicName = (characteristic) => {
  const names = {
    might: 'Might',
    agility: 'Agility',
    reason: 'Reason',
    intuition: 'Intuition',
    presence: 'Presence'
  }
  return names[characteristic]
}

const formatMonsterRole = (monster) => {
  return `Level ${monster.level} ${monster.organization}${monster.role ? ' ' + monster.role : ''}`
}

const formatKeywords = (keywords) => {
  if (!keywords || !Array.isArray(keywords)) return ''
  return keywords.map(keyword =>
    keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
  ).join(', ')
}

const formatImmunity = (immunity) => {
  if (!immunity || typeof immunity !== 'object') return '—'
  const result = Object.entries(immunity)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${type} ${value}`)
    .join(', ')
  return result || '—'
}

const formatWeakness = (weakness) => {
  if (!weakness || typeof weakness !== 'object') return '—'
  const result = Object.entries(weakness)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${type} ${value}`)
    .join(', ')
  return result || '—'
}

const formatMovement = (movement) => {
  if (!movement) return '—'
  if (typeof movement === 'string') return movement
  if (Array.isArray(movement)) return movement.join(', ')
  return movement
}

const getMaxCharacteristic = () => {
  if (!props.monster.characteristics) return 0
  const values = Object.values(props.monster.characteristics)
  return values.length > 0 ? Math.max(...values) : 0
}
</script>

<style scoped>
/* Base stat block styles */
.stat-block {
  background: #fdf6e3;
  border: 1px solid #8b4513;
  border-radius: 4px;
  padding: 1.5rem;
  font-family: 'Libre Baskerville', 'Book Antiqua', serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  transition: all 0.3s ease;
}

.stat-block.edit-mode {
  background: #f8f9fa;
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}

/* Header styles */
.header {
  text-align: center;
  margin-bottom: 1rem;
}

.monster-name {
  font-size: 1.8rem;
  font-weight: bold;
  color: #8b4513;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.monster-name-edit {
  font-size: 1.8rem;
  font-weight: bold;
  color: #8b4513;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  border: 2px solid #007bff;
  border-radius: 4px;
  padding: 0.5rem;
  background: white;
  width: 100%;
  margin-bottom: 1rem;
}

.monster-meta-edit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-edit-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-edit-group label {
  font-size: 0.8rem;
  font-weight: bold;
  color: #495057;
}

.meta-edit-group input,
.meta-edit-group select {
  padding: 0.25rem;
  border: 1px solid #ced4da;
  border-radius: 3px;
  font-size: 0.9rem;
}

/* Core stats */
.core-stats-grid {
  margin-bottom: 1rem;
}

.stat-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-weight: bold;
  color: #8b4513;
  flex: 1;
  text-align: center;
}

.stat-values {
  display: flex;
  justify-content: space-between;
}

.stat-value {
  flex: 1;
  color: #333;
  text-align: center;
}

.stat-edit-values {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.size-edit {
  display: flex;
  gap: 0.25rem;
  flex: 1;
}

.size-input,
.stat-input {
  flex: 1;
  padding: 0.25rem;
  border: 1px solid #007bff;
  border-radius: 3px;
  text-align: center;
  font-weight: bold;
  background: white;
}

.size-select {
  padding: 0.25rem;
  border: 1px solid #007bff;
  border-radius: 3px;
  background: white;
}

/* Characteristics */
.characteristic-scores {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin: 1rem 0;
}

.characteristic-score {
  text-align: center;
  border: 1px solid #8b4513;
  border-radius: 4px;
  padding: 0.75rem 0.5rem;
  background: #f9f5f0;
  min-width: 0;
  transition: all 0.2s ease;
}

.edit-mode .characteristic-score {
  border-color: #007bff;
  background: white;
}

.characteristic-name {
  font-weight: bold;
  font-size: 0.8rem;
  color: #8b4513;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}

.characteristic-value {
  font-size: 1rem;
  color: #333;
  font-weight: bold;
  line-height: 1.2;
}

.characteristic-input {
  width: 100%;
  max-width: 60px;
  padding: 0.25rem;
  border: 1px solid #007bff;
  border-radius: 3px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  background: white;
  color: #333;
}

/* Secondary stats and other elements */
.secondary-stats {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  line-height: 1.4;
}

.stat-item {
  white-space: nowrap;
}

.stat-item strong {
  color: #8b4513;
  font-weight: bold;
}

.stat-separator {
  color: #8b4513;
  font-weight: bold;
  margin: 0 0.25rem;
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #8b4513, transparent);
  margin: 1rem 0;
}

.source-info {
  margin-top: 1rem;
}

.source-text {
  font-size: 0.8rem;
  color: #777;
  text-align: center;
  font-style: italic;
}

/* Edit controls */
.edit-controls {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-link {
  background: transparent;
  color: #007bff;
  text-decoration: underline;
}

.btn-link:hover {
  color: #0056b3;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .monster-meta-edit {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .characteristic-scores {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .stat-edit-values {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .edit-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .characteristic-scores {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .monster-meta-edit {
    grid-template-columns: 1fr;
  }
}
</style>