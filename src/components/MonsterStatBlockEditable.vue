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
          <input v-model="editableData.name" type="text" class="monster-name-edit" placeholder="Monster name"
            @blur="updateField('name')" />
        </div>

        <div class="monster-meta-edit">
          <div class="meta-edit-group">
            <label>Level:</label>
            <input v-model.number="editableData.level" type="number" min="1" max="20" @blur="updateField('level')" />
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
            <input v-model.number="editableData.ev" type="number" min="1" @blur="updateField('ev')" />
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
        <div class="stat-edit-item">
          <div class="size-edit">
            <input v-model.number="editableData.size.value" type="number" min="1" class="size-input"
              @blur="updateField('size')" />
            <select v-model="editableData.size.letter" class="size-select" :disabled="editableData.size.value > 1"
              @change="updateField('size')">
              <option value="">—</option>
              <option value="T">T</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          </div>
        </div>
        <div class="stat-edit-item">
          <input v-model.number="editableData.speed" type="number" min="1" class="stat-input"
            @blur="updateField('speed')" />
        </div>
        <div class="stat-edit-item">
          <input v-model.number="editableData.stamina" type="number" min="1" class="stat-input"
            @blur="updateField('stamina')" />
        </div>
        <div class="stat-edit-item">
          <input v-model.number="editableData.stability" type="number" min="1" class="stat-input"
            @blur="updateField('stability')" />
        </div>
        <div class="stat-edit-item">
          <input v-model.number="editableData.freeStrike" type="number" min="0" class="stat-input"
            @blur="updateField('freeStrike')" />
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Characteristics -->
    <div class="characteristic-scores">
      <div v-for="characteristic in characteristicOrder" :key="characteristic" class="characteristic-score">
        <div class="characteristic-name">{{ getCharacteristicName(characteristic) }}</div>

        <div v-if="!editMode" class="characteristic-value">
          {{ formatModifier(monster.characteristics?.[characteristic] || 0) }}
        </div>

        <div v-else class="characteristic-edit">
          <input :value="editableData.characteristics[characteristic]"
            @input="updateCharacteristic(characteristic, $event.target.value)" @blur="updateField('characteristics')"
            type="number" class="characteristic-input" :min="-10" :max="20" />
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Secondary Stats -->
    <div v-if="!editMode" class="secondary-stats">
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

    <!-- Editable Defenses -->
    <div v-else class="defenses-edit">
      <!-- Immunities Edit -->
      <div class="defense-edit-section">
        <h4>Immunities</h4>
        <div class="defense-entries">
          <div 
            v-for="(immunity, index) in immunityEntries" 
            :key="`immunity-${index}`"
            class="defense-entry"
          >
            <select 
              v-model="immunity.type" 
              @change="updateDefenses"
              class="defense-type-select"
            >
              <option value="">Select type...</option>
              <option v-for="type in DAMAGE_TYPES" :key="type" :value="type">
                {{ capitalize(type) }}
              </option>
            </select>
            <input 
              v-model.number="immunity.value" 
              @blur="updateDefenses"
              type="number" 
              min="0" 
              class="defense-value-input" 
              placeholder="Value"
            />
            <button 
              @click="removeImmunity(index)"
              class="btn-remove-small"
              type="button"
            >
              ×
            </button>
          </div>
          <button @click="addImmunity" class="btn-add-small" type="button">+ Add Immunity</button>
        </div>
      </div>

      <!-- Weaknesses Edit -->
      <div class="defense-edit-section">
        <h4>Weaknesses</h4>
        <div class="defense-entries">
          <div 
            v-for="(weakness, index) in weaknessEntries" 
            :key="`weakness-${index}`"
            class="defense-entry"
          >
            <select 
              v-model="weakness.type" 
              @change="updateDefenses"
              class="defense-type-select"
            >
              <option value="">Select type...</option>
              <option v-for="type in DAMAGE_TYPES" :key="type" :value="type">
                {{ capitalize(type) }}
              </option>
            </select>
            <input 
              v-model.number="weakness.value" 
              @blur="updateDefenses"
              type="number" 
              min="0" 
              class="defense-value-input" 
              placeholder="Value"
            />
            <button 
              @click="removeWeakness(index)"
              class="btn-remove-small"
              type="button"
            >
              ×
            </button>
          </div>
          <button @click="addWeakness" class="btn-add-small" type="button">+ Add Weakness</button>
        </div>
      </div>

      <!-- Movement Types Edit -->
      <div class="defense-edit-section">
        <h4>Movement Types</h4>
        <div class="movement-types-edit">
          <label v-for="moveType in MOVEMENT_TYPES" :key="moveType" class="movement-checkbox">
            <input 
              type="checkbox" 
              :value="moveType" 
              :checked="editableData.movementTypes && editableData.movementTypes.includes(moveType)"
              @change="updateMovementTypes"
            />
            <span>{{ capitalize(moveType) }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Abilities (read-only for now) -->
    <ActionsList v-if="monster.items || monster.abilities" :title="'Abilities'"
      :actions="monster.items || monster.abilities || []" :chr="String(getMaxCharacteristic())" :monster="monster" />

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
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ActionsList from './ActionsList.vue'
import { DAMAGE_TYPES, MOVEMENT_TYPES } from '@/types/monster-forms'

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

const emit = defineEmits(['save', 'cancel', 'update:monster'])

const characteristicOrder = ['might', 'agility', 'reason', 'intuition', 'presence']

// Editable data
const editableData = ref({})
const originalData = ref({})

// Reactive data for defenses
const immunityEntries = ref([])
const weaknessEntries = ref([])

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
    },
    immunities: props.monster.immunities || {},
    weaknesses: props.monster.weaknesses || {},
    movementTypes: props.monster.movementTypes || ['walk']
  }

  editableData.value = data
  originalData.value = JSON.parse(JSON.stringify(data))
  
  // Initialize defense entries
  immunityEntries.value = Object.entries(data.immunities || {}).map(([type, value]) => ({ type, value }))
  if (immunityEntries.value.length === 0) {
    immunityEntries.value.push({ type: '', value: 0 })
  }
  
  weaknessEntries.value = Object.entries(data.weaknesses || {}).map(([type, value]) => ({ type, value }))
  if (weaknessEntries.value.length === 0) {
    weaknessEntries.value.push({ type: '', value: 0 })
  }
}

// Watch for monster changes
watch(() => props.monster, initializeEditableData, { immediate: true, deep: true })

// Auto-save functionality
const updateField = () => {
  // Emit the updated monster data for auto-save
  emit('update:monster', { ...editableData.value })
}

const updateCharacteristic = (characteristic, value) => {
  const numValue = parseInt(value) || 0
  editableData.value.characteristics[characteristic] = numValue
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

// Defense editing methods
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const addImmunity = () => {
  immunityEntries.value.push({ type: '', value: 0 })
}

const removeImmunity = (index) => {
  immunityEntries.value.splice(index, 1)
  updateDefenses()
}

const addWeakness = () => {
  weaknessEntries.value.push({ type: '', value: 0 })
}

const removeWeakness = (index) => {
  weaknessEntries.value.splice(index, 1)
  updateDefenses()
}

const updateDefenses = () => {
  // Update immunities
  const immunities = {}
  immunityEntries.value.forEach(entry => {
    if (entry.type && entry.value > 0) {
      immunities[entry.type] = entry.value
    }
  })
  editableData.value.immunities = immunities

  // Update weaknesses  
  const weaknesses = {}
  weaknessEntries.value.forEach(entry => {
    if (entry.type && entry.value > 0) {
      weaknesses[entry.type] = entry.value
    }
  })
  editableData.value.weaknesses = weaknesses

  updateField('defenses')
}

const updateMovementTypes = (event) => {
  const value = event.target.value
  const isChecked = event.target.checked
  
  if (!editableData.value.movementTypes) {
    editableData.value.movementTypes = []
  }
  
  if (isChecked) {
    if (!editableData.value.movementTypes.includes(value)) {
      editableData.value.movementTypes.push(value)
    }
  } else {
    const index = editableData.value.movementTypes.indexOf(value)
    if (index > -1) {
      editableData.value.movementTypes.splice(index, 1)
    }
  }
  
  updateField('movementTypes')
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
}

.stat-edit-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.size-edit {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  align-items: center;
}

.size-input,
.stat-input {
  flex: 1;
  min-width: 0;
  /* Prevents flex items from overflowing */
  max-width: 80px;
  /* Constrains input width */
  padding: 0.25rem;
  border: 1px solid #007bff;
  border-radius: 3px;
  text-align: center;
  font-weight: bold;
  background: white;
  font-size: 0.9rem;
  margin: 0 auto;
  /* Center the input */
}

.size-select {
  padding: 0.25rem;
  border: 1px solid #007bff;
  border-radius: 3px;
  background: white;
  min-width: 40px;
  max-width: 50px;
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

/* Editable defenses */
.defenses-edit {
  background: white;
  border: 1px solid #007bff;
  border-radius: 4px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.defense-edit-section {
  margin-bottom: 1rem;
}

.defense-edit-section:last-child {
  margin-bottom: 0;
}

.defense-edit-section h4 {
  color: #8b4513;
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.defense-entries {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.defense-entry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.defense-type-select {
  flex: 2;
  padding: 0.25rem;
  border: 1px solid #007bff;
  border-radius: 3px;
  font-size: 0.8rem;
  background: white;
}

.defense-value-input {
  flex: 1;
  max-width: 60px;
  padding: 0.25rem;
  border: 1px solid #007bff;
  border-radius: 3px;
  font-size: 0.8rem;
  text-align: center;
  background: white;
}

.btn-remove-small,
.btn-add-small {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-remove-small {
  background: #dc3545;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-remove-small:hover {
  background: #c82333;
}

.btn-add-small {
  background: #28a745;
  color: white;
  align-self: flex-start;
  margin-top: 0.25rem;
}

.btn-add-small:hover {
  background: #1e7e34;
}

.movement-types-edit {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.movement-checkbox {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  background: white;
  transition: all 0.2s ease;
}

.movement-checkbox:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.movement-checkbox input[type="checkbox"] {
  margin: 0;
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

  /* Make stats section stack vertically on mobile */
  .core-stats-grid {
    margin-bottom: 1.5rem;
  }

  .stat-labels {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .stat-label {
    font-size: 0.8rem;
    padding: 0 0.25rem;
  }

  /* Stack edit inputs with labels on mobile */
  .stat-edit-values {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-edit-item {
    justify-content: center;
  }

  .size-edit {
    max-width: 150px;
  }

  .stat-input {
    max-width: 80px;
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

  .stat-labels {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .stat-values {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>