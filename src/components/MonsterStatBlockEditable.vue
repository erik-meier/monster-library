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
            <select v-model="editableData.size.letter" class="form-select size-select"
              :disabled="editableData.size.value > 1" @change="updateField('size')">
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
          <div v-for="(immunity, index) in immunityEntries" :key="`immunity-${index}`" class="defense-entry">
            <select v-model="immunity.type" @change="debouncedUpdateDefenses" class="form-select defense-type-select">
              <option value="">Select type...</option>
              <option v-for="type in DAMAGE_TYPES" :key="type" :value="type">
                {{ capitalize(type) }}
              </option>
            </select>
            <input v-model.number="immunity.value" @input="debouncedUpdateDefenses" type="number" min="0"
              class="defense-value-input" placeholder="Value" />
            <button @click="removeImmunity(index)" class="btn-remove-small" type="button">
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
          <div v-for="(weakness, index) in weaknessEntries" :key="`weakness-${index}`" class="defense-entry">
            <select v-model="weakness.type" @change="debouncedUpdateDefenses" class="form-select defense-type-select">
              <option value="">Select type...</option>
              <option v-for="type in DAMAGE_TYPES" :key="type" :value="type">
                {{ capitalize(type) }}
              </option>
            </select>
            <input v-model.number="weakness.value" @input="debouncedUpdateDefenses" type="number" min="0"
              class="defense-value-input" placeholder="Value" />
            <button @click="removeWeakness(index)" class="btn-remove-small" type="button">
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
            <input type="checkbox" :value="moveType"
              :checked="editableData.movementTypes && editableData.movementTypes.includes(moveType)"
              @change="updateMovementTypes" />
            <span>{{ capitalize(moveType) }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Abilities -->
    <div v-if="!editMode">
      <ActionsList v-if="monster.items || monster.abilities" :title="'Abilities'"
        :actions="monster.items || monster.abilities || []" :chr="String(getMaxCharacteristic())" :monster="monster" />
    </div>

    <!-- Editable Abilities -->
    <div v-else class="abilities-edit">
      <div class="abilities-edit-header">
        <h4>Abilities & Features</h4>
        <button @click="addAbility" class="btn-add-small" type="button">+ Add Ability</button>
      </div>

      <div v-if="editableData.items && editableData.items.length > 0" class="abilities-list-edit">
        <div v-for="(item, index) in editableData.items" :key="`ability-${index}`" class="ability-edit-item">
          <div class="ability-edit-header">
            <div class="ability-edit-name">
              <input v-model="item.name" @input="debouncedUpdateField" placeholder="Ability name"
                class="ability-name-input" />
            </div>
            <div class="ability-edit-actions">
              <button @click="editAbility(index)" class="btn-edit-small" type="button" title="Edit ability details">
                ✏️
              </button>
              <button @click="removeAbility(index)" class="btn-remove-small" type="button" title="Remove ability">
                ×
              </button>
            </div>
          </div>

          <!-- Enhanced preview of ability details -->
          <div class="ability-edit-preview">
            <!-- Type and Category Info -->
            <div v-if="item.type === 'feature'" class="ability-type-badge feature">Feature</div>
            <div v-else class="ability-info-row">
              <span v-if="item.system?.category === 'signature'" class="ability-type-badge signature">Signature</span>
              <!-- Removed heroic tag display as requested -->
              <span v-if="item.system?.type" class="ability-action-type">{{ formatActionType(item.system.type) }}</span>
              <span v-if="item.system?.resource" class="ability-resource">{{ item.system.resource }} Malice</span>
            </div>

            <!-- Range and Target Info -->
            <div v-if="item.type === 'ability'" class="ability-targeting">
              <span v-if="item.system?.distance" class="ability-range">{{ formatRange(item.system.distance) }}</span>
              <span v-if="item.system?.target" class="ability-target">{{ formatTarget(item.system.target) }}</span>
            </div>

            <!-- Power Roll Info -->
            <div v-if="item.system?.power?.roll" class="ability-power">
              <strong>{{ item.system.power.roll.formula }}</strong>
              <span v-if="item.system?.power?.tiers" class="tier-count">({{ item.system.power.tiers.length }}
                tiers)</span>
            </div>

            <!-- Description or Effects -->
            <div v-if="item.type === 'feature' && item.system?.description?.value" class="ability-description"
              v-html="item.system.description.value"></div>
            <div v-else-if="item.system?.effect?.text" class="ability-effects">
              <div class="effect-text"><strong>Effect:</strong> <span v-html="item.system.effect.text"></span></div>
            </div>

            <!-- Keywords -->
            <div v-if="item.system?.keywords && item.system.keywords.length > 0" class="ability-keywords">
              Keywords: {{ item.system.keywords.join(', ') }}
            </div>

            <!-- Trigger (for triggered abilities) -->
            <div v-if="item.system?.trigger" class="ability-trigger">
              <strong>Trigger:</strong> {{ item.system.trigger }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-abilities">
        <p>No abilities added yet. Click "Add Ability" to create one.</p>
      </div>
    </div>

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
      <button @click="handleSave" class="btn btn-success">Save Changes</button>
      <button @click="$emit('cancel')" class="btn btn-secondary">Cancel</button>
    </div>

    <!-- Ability Editor Modal -->
    <div v-if="showAbilityEditor" class="editor-modal-overlay" @click.self="handleAbilityCancel">
      <div class="editor-modal-container">
        <AbilityEditor v-if="editingAbility" :model-value="editingAbility" :existing-items="editableData.items"
          :editing-index="editingAbilityIndex" @update:model-value="handleAbilityUpdate" @save="handleAbilitySave"
          @cancel="handleAbilityCancel" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import ActionsList from './ActionsList.vue'
import AbilityEditor from './AbilityEditor.vue'
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

// Ability editor state
const showAbilityEditor = ref(false)
const editingAbility = ref(null)
const editingAbilityIndex = ref(null)

// Helper function to check for partial defense entries
const hasPartialEntries = () => {
  // Check if any immunity entry has been modified from default empty state
  const hasModifiedImmunities = immunityEntries.value.some(entry =>
    entry.type !== '' || (entry.value && entry.value > 0)
  )
  // Check if any weakness entry has been modified from default empty state
  const hasModifiedWeaknesses = weaknessEntries.value.some(entry =>
    entry.type !== '' || (entry.value && entry.value > 0)
  )
  return hasModifiedImmunities || hasModifiedWeaknesses
}

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
    movementTypes: props.monster.movementTypes || ['walk'],
    items: props.monster.items || props.monster.abilities || []
  }

  editableData.value = data
  originalData.value = JSON.parse(JSON.stringify(data))

  // Initialize defense entries (but preserve partial entries that user is working on)
  if (!hasPartialEntries()) {
    immunityEntries.value = Object.entries(data.immunities || {}).map(([type, value]) => ({ type, value }))
    if (immunityEntries.value.length === 0) {
      immunityEntries.value.push({ type: '', value: 0 })
    }

    weaknessEntries.value = Object.entries(data.weaknesses || {}).map(([type, value]) => ({ type, value }))
    if (weaknessEntries.value.length === 0) {
      weaknessEntries.value.push({ type: '', value: 0 })
    }
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

// Ability formatting helpers
const formatActionType = (type) => {
  const typeMap = {
    'main': 'Main Action',
    'maneuver': 'Maneuver',
    'triggered': 'Triggered',
    'freeTriggered': 'Free Triggered',
    'villain': 'Villain Action',
    'move': 'Move',
    'none': 'No Action'
  }
  return typeMap[type] || type
}

const formatRange = (distance) => {
  if (!distance) return ''

  switch (distance.type) {
    case 'melee':
      return `Melee ${distance.primary || 1}`
    case 'ranged':
      return `Ranged ${distance.secondary || 5}`
    case 'meleeRanged':
      return `Melee ${distance.primary || 1} or Ranged ${distance.secondary || 5}`
    case 'line':
      return `${distance.primary}×${distance.secondary} line within ${distance.tertiary}`
    case 'cube':
      return `${distance.primary} cube within ${distance.secondary}`
    case 'wall':
      return `${distance.primary} wall within ${distance.secondary}`
    case 'burst':
      return `${distance.primary} burst`
    case 'special':
      return 'Special'
    default:
      return distance.type || ''
  }
}

const formatTarget = (target) => {
  if (!target) return ''

  let targetText = ''
  switch (target.type) {
    case 'creature':
      targetText = 'Creature'
      break
    case 'creatureObject':
      targetText = 'Creature or Object'
      break
    case 'enemy':
      targetText = 'Enemy'
      break
    case 'ally':
      targetText = 'Ally'
      break
    case 'selfAlly':
      targetText = 'Self and Ally'
      break
    case 'selfOrAlly':
      targetText = 'Self or Ally'
      break
    case 'special':
      targetText = 'Special'
      break
    default:
      targetText = target.type || ''
  }

  if (target.value && target.value > 1) {
    targetText += ` (${target.value})`
  }

  return targetText
}

// Normalize ability data for the editor
const normalizeAbilityForEditor = (ability) => {
  // Ensure basic structure exists
  if (!ability.system) {
    ability.system = {}
  }

  // Ensure keywords array exists
  if (!ability.system.keywords) {
    ability.system.keywords = []
  }

  // Handle features vs abilities differently
  if (ability.type === 'feature') {
    // For features, ensure description exists
    if (!ability.system.description) {
      ability.system.description = {
        value: '',
        director: ''
      }
    }
    // Features don't need power structure
    ability.system.power = null
  } else {
    // For abilities, ensure power structure is complete
    if (!ability.system.power) {
      ability.system.power = {
        roll: {
          formula: '2d10 + might',
          characteristics: ['might']
        },
        tiers: [
          { tier: 1, display: '' },
          { tier: 2, display: '' },
          { tier: 3, display: '' }
        ]
      }
    } else {
      // Fix power structure if incomplete
      if (!ability.system.power.roll) {
        ability.system.power.roll = {
          formula: '2d10 + might',
          characteristics: ['might']
        }
      }

      // Ensure characteristics array exists
      if (!ability.system.power.roll.characteristics) {
        ability.system.power.roll.characteristics = ['might']
      }

      // Convert effects object to tiers array if needed
      if (ability.system.power.effects && !ability.system.power.tiers) {
        ability.system.power.tiers = [
          { tier: 1, display: '' },
          { tier: 2, display: '' },
          { tier: 3, display: '' }
        ]
        delete ability.system.power.effects
      }

      // Ensure tiers array exists and is properly structured
      if (!ability.system.power.tiers || !Array.isArray(ability.system.power.tiers)) {
        ability.system.power.tiers = [
          { tier: 1, display: '' },
          { tier: 2, display: '' },
          { tier: 3, display: '' }
        ]
      }

      // Ensure each tier has proper structure
      ability.system.power.tiers = ability.system.power.tiers.map((tier, index) => ({
        tier: tier.tier || (index + 1),
        display: tier.display || ''
      }))
    }

    // Ensure other ability properties exist
    if (!ability.system.distance) {
      ability.system.distance = {
        type: 'melee',
        primary: 1
      }
    }

    if (!ability.system.target) {
      ability.system.target = {
        type: 'creatureObject',
        value: 1
      }
    }

    if (!ability.system.effect) {
      ability.system.effect = {
        text: ''
      }
    } else {
      // Convert legacy before/after fields to unified text field
      let combinedText = '';
      if (ability.system.effect.before) {
        combinedText += ability.system.effect.before;
      }
      if (ability.system.effect.after) {
        if (combinedText) {
          combinedText += ' ';
        }
        combinedText += ability.system.effect.after;
      }
      if (!ability.system.effect.text && combinedText) {
        ability.system.effect.text = combinedText;
      }
      // Clean up legacy fields
      delete ability.system.effect.before;
      delete ability.system.effect.after;
    }

    if (ability.system.trigger === undefined) {
      ability.system.trigger = ''
    }

    if (!ability.system.spend) {
      ability.system.spend = {
        text: '',
        value: null
      }
    }

    // Ensure category and type exist
    if (!ability.system.category) {
      ability.system.category = ''
    }

    if (!ability.system.type) {
      ability.system.type = 'main'
    }
  }

  return ability
}

// Defense editing methods
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const cleanupEmptyDefenseEntries = () => {
  // Remove completely empty entries (both type and value are empty/zero)
  immunityEntries.value = immunityEntries.value.filter(entry =>
    entry.type !== '' || (entry.value && entry.value > 0)
  )
  weaknessEntries.value = weaknessEntries.value.filter(entry =>
    entry.type !== '' || (entry.value && entry.value > 0)
  )

  // Ensure we always have at least one empty entry for adding new ones
  if (immunityEntries.value.length === 0) {
    immunityEntries.value.push({ type: '', value: 0 })
  }
  if (weaknessEntries.value.length === 0) {
    weaknessEntries.value.push({ type: '', value: 0 })
  }
}

const handleSave = () => {
  // Clean up empty defense entries before saving
  cleanupEmptyDefenseEntries()
  // Update defenses one final time to ensure consistency
  updateDefenses()
  // Emit save event
  emit('save', editableData.value)
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
  // Update immunities - allow incomplete entries for better UX
  const immunities = {}
  immunityEntries.value.forEach(entry => {
    // Save entry if it has either a type or value > 0 (allows incomplete state)
    if (entry.type || (entry.value && entry.value > 0)) {
      // Only set in immunities if both type and value are present
      if (entry.type && entry.value > 0) {
        immunities[entry.type] = entry.value
      }
    }
  })
  editableData.value.immunities = immunities

  // Update weaknesses - allow incomplete entries for better UX
  const weaknesses = {}
  weaknessEntries.value.forEach(entry => {
    // Save entry if it has either a type or value > 0 (allows incomplete state)
    if (entry.type || (entry.value && entry.value > 0)) {
      // Only set in weaknesses if both type and value are present
      if (entry.type && entry.value > 0) {
        weaknesses[entry.type] = entry.value
      }
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

// Ability editing methods
const addAbility = () => {
  if (!editableData.value.items) {
    editableData.value.items = []
  }

  const newAbility = {
    name: 'New Ability',
    type: 'ability',
    system: {
      category: '',
      type: 'main',
      resource: null,
      keywords: [],
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
          formula: '2d10 + might',
          characteristics: ['might']
        },
        tiers: [
          { tier: 1, display: '' },
          { tier: 2, display: '' },
          { tier: 3, display: '' }
        ]
      },
      effect: {
        text: ''
      },
      spend: {
        text: '',
        value: null
      }
    }
  }

  // Set up editing state - normalize just to be safe
  editingAbility.value = normalizeAbilityForEditor(JSON.parse(JSON.stringify(newAbility)))
  editingAbilityIndex.value = null // New ability, no index yet
  showAbilityEditor.value = true
}

const removeAbility = (index) => {
  if (editableData.value.items) {
    editableData.value.items.splice(index, 1)
    updateField('abilities')
  }
}

const editAbility = (index) => {
  if (editableData.value.items && editableData.value.items[index]) {
    // Create a deep copy of the ability for editing
    const ability = JSON.parse(JSON.stringify(editableData.value.items[index]))

    // Normalize the ability structure for the editor
    editingAbility.value = normalizeAbilityForEditor(ability)
    editingAbilityIndex.value = index
    showAbilityEditor.value = true
  }
}

// Ability editor handlers
const handleAbilitySave = () => {
  if (!editableData.value.items) {
    editableData.value.items = []
  }

  if (editingAbilityIndex.value !== null) {
    // Editing existing ability
    editableData.value.items[editingAbilityIndex.value] = JSON.parse(JSON.stringify(editingAbility.value))
  } else {
    // Adding new ability
    editableData.value.items.push(JSON.parse(JSON.stringify(editingAbility.value)))
  }

  // Close editor and update
  showAbilityEditor.value = false
  editingAbility.value = null
  editingAbilityIndex.value = null
  updateField('abilities')
}

const handleAbilityCancel = () => {
  // Close editor without saving
  showAbilityEditor.value = false
  editingAbility.value = null
  editingAbilityIndex.value = null
}

const handleAbilityUpdate = (updatedAbility) => {
  // Update the editing ability with changes from the editor
  editingAbility.value = JSON.parse(JSON.stringify(updatedAbility))
}

// Debounced version of updateField for general use
let fieldUpdateTimeout = null
const debouncedUpdateField = () => {
  if (fieldUpdateTimeout) {
    clearTimeout(fieldUpdateTimeout)
  }
  fieldUpdateTimeout = setTimeout(() => {
    updateField('abilities')
  }, 500)
}

// Debounced version of updateDefenses to prevent auto-save interference
let defensesUpdateTimeout = null
const debouncedUpdateDefenses = () => {
  if (defensesUpdateTimeout) {
    clearTimeout(defensesUpdateTimeout)
  }
  defensesUpdateTimeout = setTimeout(() => {
    updateDefenses()
  }, 500) // Wait 500ms after user stops typing/selecting
}

// Keyboard shortcuts
const handleKeydown = (event) => {
  // Alt+S to save (only when in edit mode)
  if (event.altKey && event.key === 's' && props.editMode) {
    event.preventDefault()
    emit('save', editableData.value)
    return
  }

  // Escape to close ability editor (if open) or cancel editing
  if (event.key === 'Escape') {
    if (showAbilityEditor.value) {
      // Close ability editor first
      event.preventDefault()
      handleAbilityCancel()
      return
    } else if (props.editMode) {
      // Then cancel editing if no ability editor is open
      event.preventDefault()
      emit('cancel')
      return
    }
  }

  // Only handle if no input is focused (except when in ability editor)
  if (event.target && (event.target).tagName.match(/INPUT|TEXTAREA|SELECT/) && !showAbilityEditor.value) {
    return
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Base stat block styles */
.stat-block {
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-700);
  border-radius: var(--radius-base);
  padding: var(--space-6);
  font-family: var(--font-family-serif);
  box-shadow: var(--shadow-base);
  max-width: 100%;
  transition: var(--transition-all);
}

.stat-block.edit-mode {
  background: var(--color-neutral-50);
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}

/* Header styles */
.header {
  text-align: center;
  margin-bottom: var(--space-4);
}

.monster-name {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-700);
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.monster-name-edit {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-700);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  border: 2px solid #007bff;
  border-radius: var(--radius-base);
  padding: var(--space-2);
  background: white;
  width: 100%;
  margin-bottom: var(--space-4);
}

.monster-meta-edit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.meta-edit-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.meta-edit-group label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-700);
}

.meta-edit-group input,
.meta-edit-group select {
  padding: var(--space-1);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

/* Core stats */
.core-stats-grid {
  margin-bottom: var(--space-4);
}

.stat-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.stat-label {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-700);
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
  gap: var(--space-1);
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
  padding: var(--space-1);
  border: 1px solid #007bff;
  border-radius: var(--radius-sm);
  text-align: center;
  font-weight: var(--font-weight-bold);
  background: white;
  font-size: var(--font-size-sm);
  margin: 0 auto;
  /* Center the input */
}

.size-select {
  /* Extend form-select with specific sizing for stat block */
  padding: var(--space-1);
  font-size: var(--font-size-sm);
  min-width: 40px;
  max-width: 50px;
  border: 1px solid var(--color-primary-500);
}

/* Characteristics */
.characteristic-scores {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-3);
  margin: var(--space-4) 0;
}

.characteristic-score {
  text-align: center;
  border: 1px solid var(--color-primary-700);
  border-radius: var(--radius-base);
  padding: var(--space-3) 0.5rem;
  background: #f9f5f0;
  min-width: 0;
  transition: all 0.2s ease;
}

.edit-mode .characteristic-score {
  border-color: #007bff;
  background: white;
}

.characteristic-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  color: var(--color-primary-700);
  margin-bottom: var(--space-1);
  letter-spacing: 0.5px;
}

.characteristic-value {
  font-size: var(--space-4);
  color: #333;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

.characteristic-input {
  width: 100%;
  max-width: 60px;
  padding: var(--space-1);
  border: 1px solid #007bff;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-align: center;
  background: white;
  color: #333;
}

/* Secondary stats and other elements */
.secondary-stats {
  font-size: var(--font-size-sm);
  color: #666;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  line-height: 1.4;
}

.stat-item {
  white-space: nowrap;
}

.stat-item strong {
  color: var(--color-primary-700);
  font-weight: var(--font-weight-bold);
}

.stat-separator {
  color: var(--color-primary-700);
  font-weight: var(--font-weight-bold);
  margin: 0 0.25rem;
}

/* Editable defenses */
.defenses-edit {
  background: white;
  border: 1px solid #007bff;
  border-radius: var(--radius-base);
  padding: var(--space-4);
  margin: var(--space-2) 0;
}

.defense-edit-section {
  margin-bottom: var(--space-4);
}

.defense-edit-section:last-child {
  margin-bottom: 0;
}

.defense-edit-section h4 {
  color: var(--color-primary-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  margin: 0 0 0.5rem 0;
}

.defense-entries {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.defense-entry {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.defense-type-select {
  /* Extend form-select with specific sizing for defenses */
  flex: 2;
  padding: var(--space-1);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-primary-500);
}

.defense-value-input {
  flex: 1;
  max-width: 60px;
  padding: var(--space-1);
  border: 1px solid #007bff;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  text-align: center;
  background: white;
}

.btn-remove-small,
.btn-add-small {
  padding: var(--space-1) 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--space-3);
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
  margin-top: var(--space-1);
}

.btn-add-small:hover {
  background: #1e7e34;
}

.movement-types-edit {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.movement-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: var(--space-1) 0.5rem;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  background: white;
  transition: all 0.2s ease;
}

.movement-checkbox:hover {
  background: var(--color-neutral-50);
  border-color: #007bff;
}

.movement-checkbox input[type="checkbox"] {
  margin: 0;
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, var(--color-primary-700), transparent);
  margin: var(--space-4) 0;
}

.source-info {
  margin-top: var(--space-4);
}

.source-text {
  font-size: var(--font-size-xs);
  color: #777;
  text-align: center;
  font-style: italic;
}

/* Edit controls */
.edit-controls {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: var(--space-2) 1rem;
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  font-size: var(--font-size-sm);
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
  background: var(--color-neutral-600);
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: var(--color-neutral-600);
  border: 1px solid var(--color-neutral-600);
}

.btn-outline:hover {
  background: var(--color-neutral-600);
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
    gap: var(--space-2);
  }

  .stat-edit-values {
    flex-direction: column;
    gap: var(--space-2);
  }

  /* Make stats section stack vertically on mobile */
  .core-stats-grid {
    margin-bottom: var(--space-6);
  }

  .stat-labels {
    font-size: var(--font-size-xs);
    margin-bottom: var(--space-3);
  }

  .stat-label {
    font-size: var(--font-size-xs);
    padding: 0 0.25rem;
  }

  /* Stack edit inputs with labels on mobile */
  .stat-edit-values {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-3);
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
    gap: var(--space-2);
    text-align: center;
    margin-bottom: var(--space-4);
  }

  .stat-values {
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
  }
}

/* Abilities editing styles */
.abilities-edit {
  margin: var(--space-4) 0;
}

.abilities-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.abilities-edit-header h4 {
  margin: 0;
  color: var(--color-primary-700);
}

.abilities-list-edit {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ability-edit-item {
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-base);
  padding: var(--space-4);
  background: var(--color-neutral-50);
}

.ability-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.ability-edit-name {
  flex: 1;
}

.ability-name-input {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid #ccc;
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.ability-edit-actions {
  display: flex;
  gap: var(--space-2);
}

.ability-edit-preview {
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-neutral-200);
}

.ability-description {
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
}

.ability-power {
  font-style: italic;
  color: #666;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
}

.ability-keywords {
  font-size: var(--font-size-xs);
  color: #999;
  font-style: italic;
}

.no-abilities {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: var(--space-8);
  border: 2px dashed #ccc;
  border-radius: var(--radius-base);
  background: var(--color-neutral-50);
}

.btn-edit-small {
  padding: var(--space-1) 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  background: #17a2b8;
  color: white;
  cursor: pointer;
  font-size: var(--font-size-xs);
  transition: background-color 0.2s;
}

.btn-edit-small:hover {
  background: #138496;
}

/* Enhanced ability preview styles */
.ability-info-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
  flex-wrap: wrap;
}

.ability-type-badge {
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ability-type-badge.signature {
  background: var(--color-primary-700);
  color: white;
}

.ability-type-badge.heroic {
  background: #dc3545;
  color: white;
}

.ability-type-badge.feature {
  background: #28a745;
  color: white;
  margin-bottom: var(--space-2);
}

.ability-action-type {
  font-size: var(--font-size-xs);
  color: #666;
  font-style: italic;
}

.ability-resource {
  font-size: var(--font-size-xs);
  color: #dc3545;
  font-weight: 500;
}

.ability-targeting {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-1);
  font-size: var(--font-size-sm);
  color: #666;
  flex-wrap: wrap;
}

.ability-range,
.ability-target {
  background: var(--color-neutral-50);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-neutral-200);
  font-size: var(--space-3);
}

.ability-power {
  margin-bottom: var(--space-1);
  font-size: var(--font-size-sm);
  color: #333;
}

.ability-power strong {
  color: var(--color-primary-700);
  font-family: 'Courier New', monospace;
}

.tier-count {
  color: #666;
  font-size: var(--font-size-xs);
  margin-left: var(--space-2);
}

.ability-effects {
  margin-bottom: var(--space-1);
  font-size: var(--font-size-sm);
  color: #555;
}

.effect-text {
  margin-bottom: 0.125rem;
  padding: var(--space-1);
  background: var(--color-neutral-50);
  border-radius: var(--radius-base);
  border-left: 3px solid var(--color-primary-700);
}

.ability-trigger {
  margin-bottom: var(--space-1);
  font-size: var(--font-size-sm);
  color: #666;
  padding: var(--space-1);
  background: #fff3cd;
  border-radius: var(--radius-base);
  border-left: 3px solid #ffc107;
}

.ability-description {
  margin-bottom: var(--space-1);
  font-size: var(--font-size-sm);
  color: #555;
  line-height: 1.4;
}

.ability-keywords {
  font-size: var(--space-3);
  color: #999;
  font-style: italic;
  margin-top: var(--space-1);
  padding-top: var(--space-1);
  border-top: 1px solid var(--color-neutral-200);
}

/* Modal styles for AbilityEditor */
.editor-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: var(--space-4);
}

.editor-modal-container {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: min(1200px, 95vw);
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
}

/* Ensure modal is above other content */
.editor-modal-overlay::backdrop {
  background: rgba(0, 0, 0, 0.75);
}

@media (max-width: 768px) {
  .editor-modal-container {
    width: min(100vw - 2rem, 95vw);
    max-height: 95vh;
    margin: var(--space-2);
  }

  .editor-modal-overlay {
    padding: var(--space-2);
  }
}

@media (min-width: 1400px) {
  .editor-modal-container {
    width: min(1400px, 90vw);
  }
}
</style>