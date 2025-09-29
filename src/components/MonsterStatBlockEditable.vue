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
          <div v-for="(immunity, index) in immunityEntries" :key="`immunity-${index}`" class="defense-entry">
            <select v-model="immunity.type" @change="debouncedUpdateDefenses" class="defense-type-select">
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
            <select v-model="weakness.type" @change="debouncedUpdateDefenses" class="defense-type-select">
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
            <div v-else-if="item.system?.effect" class="ability-effects">
              <div v-if="item.system.effect.before" class="effect-before">Before: {{ item.system.effect.before }}</div>
              <div v-if="item.system.effect.after" class="effect-after">After: {{ item.system.effect.after }}</div>
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
      <button @click="$emit('save', editableData)" class="btn btn-success">Save Changes</button>
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
import { ref, watch } from 'vue'
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
        before: '',
        after: ''
      }
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
      ability.system.category = 'signature'
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
      category: 'signature',
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
        before: '',
        after: ''
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

/* Abilities editing styles */
.abilities-edit {
  margin: 1rem 0;
}

.abilities-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.abilities-edit-header h4 {
  margin: 0;
  color: #8b4513;
}

.abilities-list-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ability-edit-item {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  background: #f8f9fa;
}

.ability-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ability-edit-name {
  flex: 1;
}

.ability-name-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.1rem;
}

.ability-edit-actions {
  display: flex;
  gap: 0.5rem;
}

.ability-edit-preview {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
}

.ability-description {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.ability-power {
  font-style: italic;
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.ability-keywords {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

.no-abilities {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 4px;
  background: #f8f9fa;
}

.btn-edit-small {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 3px;
  background: #17a2b8;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
}

.btn-edit-small:hover {
  background: #138496;
}
/* Enhanced ability preview styles */
.ability-info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
}

.ability-type-badge {
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ability-type-badge.signature {
  background: #8b4513;
  color: white;
}

.ability-type-badge.heroic {
  background: #dc3545;
  color: white;
}

.ability-type-badge.feature {
  background: #28a745;
  color: white;
  margin-bottom: 0.5rem;
}

.ability-action-type {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.ability-resource {
  font-size: 0.8rem;
  color: #dc3545;
  font-weight: 500;
}

.ability-targeting {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #666;
  flex-wrap: wrap;
}

.ability-range,
.ability-target {
  background: #f8f9fa;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  font-size: 0.75rem;
}

.ability-power {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #333;
}

.ability-power strong {
  color: #8b4513;
  font-family: 'Courier New', monospace;
}

.tier-count {
  color: #666;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.ability-effects {
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #555;
}

.effect-before,
.effect-after {
  margin-bottom: 0.125rem;
  padding: 0.25rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #8b4513;
}

.ability-trigger {
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #666;
  padding: 0.25rem;
  background: #fff3cd;
  border-radius: 4px;
  border-left: 3px solid #ffc107;
}

.ability-description {
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #555;
  line-height: 1.4;
}

.ability-keywords {
  font-size: 0.75rem;
  color: #999;
  font-style: italic;
  margin-top: 0.25rem;
  padding-top: 0.25rem;
  border-top: 1px solid #e9ecef;
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
  padding: 1rem;
}

.editor-modal-container {
  background: white;
  border-radius: 8px;
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
    margin: 0.5rem;
  }

  .editor-modal-overlay {
    padding: 0.5rem;
  }
}

@media (min-width: 1400px) {
  .editor-modal-container {
    width: min(1400px, 90vw);
  }
}
</style>