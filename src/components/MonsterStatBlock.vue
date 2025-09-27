<template>
  <div class="stat-block">
    <!-- Header -->
    <div class="header">
      <h1 v-if="!editMode" class="monster-name">{{ monster.name }}</h1>
      <div v-if="editMode" class="form-group">
        <label for="monster-name">Monster Name</label>
        <input 
          id="monster-name"
          v-model="editableMonster.name" 
          type="text" 
          class="form-control monster-name-input"
          required
        />
      </div>
      <div class="monster-meta-container">
        <p class="monster-meta-left">
          {{ formatMonsterRole(editMode ? editableMonster : monster) }}
        </p>
        <p class="monster-meta-center">
          {{ formatKeywords((editMode ? editableMonster : monster).keywords) }}
        </p>
        <p class="monster-meta-right">
          EV {{ (editMode ? editableMonster : monster).ev }}
        </p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Core Stats Grid -->
    <div class="core-stats-grid">
      <div class="stat-labels">
        <div class="stat-label">Size</div>
        <div class="stat-label">Speed</div>
        <div class="stat-label">Stamina</div>
        <div class="stat-label">Stability</div>
        <div class="stat-label">Free Strike</div>
      </div>
      <div v-if="!editMode" class="stat-values">
        <div class="stat-value">{{ monster.size.value }}{{ monster.size.letter }}</div>
        <div class="stat-value">{{ monster.speed }}</div>
        <div class="stat-value">{{ monster.stamina }}</div>
        <div class="stat-value">{{ monster.stability }}</div>
        <div class="stat-value">{{ monster.freeStrike }}</div>
      </div>
      <div v-if="editMode" class="stat-edit-values">
        <div class="stat-edit-group">
          <input v-model.number="editableMonster.size.value" type="number" min="1" class="form-control stat-input" />
          <select v-model="editableMonster.size.letter" class="form-control stat-select" :disabled="editableMonster.size.value > 1">
            <option value="">—</option>
            <option value="T">T</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
          </select>
        </div>
        <div class="stat-edit-group">
          <input v-model.number="editableMonster.speed" type="number" min="1" class="form-control stat-input" />
        </div>
        <div class="stat-edit-group">
          <input v-model.number="editableMonster.stamina" type="number" min="1" class="form-control stat-input" />
        </div>
        <div class="stat-edit-group">
          <input v-model.number="editableMonster.stability" type="number" class="form-control stat-input" />
        </div>
        <div class="stat-edit-group">
          <input v-model.number="editableMonster.freeStrike" type="number" min="0" class="form-control stat-input" />
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Characteristics -->
    <CharacteristicScores 
      :characteristics="editMode ? editableMonster.characteristics : monster.characteristics" 
      :edit-mode="editMode"
      @update:characteristics="updateCharacteristics"
    />

    <div class="divider"></div>

    <!-- Secondary Stats -->
    <div class="secondary-stats">
      <span class="stat-item">
        <strong>Immunity</strong> {{ formatImmunity((editMode ? editableMonster : monster).immunities) }}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat-item">
        <strong>Weakness</strong> {{ formatWeakness((editMode ? editableMonster : monster).weaknesses) }}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat-item">
        <strong>Movement</strong> {{ formatMovement((editMode ? editableMonster : monster).movementTypes) }}
      </span>
    </div>

    <div class="divider"></div>

    <!-- Abilities -->
    <ActionsList :title="'Abilities'" :actions="(editMode ? editableMonster : monster).items || (editMode ? editableMonster : monster).abilities || []" :chr="String(getMaxCharacteristic(editMode ? editableMonster : monster))"
      :monster="editMode ? editableMonster : monster" />

    <!-- Actions -->
    <ActionsList :title="'Actions'" :actions="(editMode ? editableMonster : monster).actions || []" :chr="String(getMaxCharacteristic(editMode ? editableMonster : monster))"
      :monster="editMode ? editableMonster : monster" />

    <!-- Source Information -->
    <div v-if="monster.source" class="source-info">
      <div class="divider"></div>
      <div class="source-text">
        <span v-if="monster.source.book">{{ monster.source.book }}</span>
        <span v-if="monster.source.page">, page {{ monster.source.page }}</span>
        <span v-if="monster.source.license"> • {{ monster.source.license }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import CharacteristicScores from './CharacteristicScores.vue'
import ActionsList from './ActionsList.vue';

export default {
  name: 'MonsterStatBlock',
  components: {
    CharacteristicScores,
    ActionsList
  },
  props: {
    monster: {
      type: Object,
      required: true
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:monster'],
  setup(props, { emit }) {
    // Create a reactive copy of the monster for editing
    const editableMonster = ref({})
    
    // Initialize editable monster when monster prop changes
    const initializeEditableMonster = () => {
      if (!props.monster) return
      
      editableMonster.value = {
        name: props.monster.name || '',
        level: props.monster.level || 1,
        ev: props.monster.ev || 1,
        role: props.monster.role || '',
        organization: props.monster.organization || '',
        keywords: props.monster.keywords || [],
        size: {
          value: props.monster.size?.value || 1,
          letter: props.monster.size?.letter || 'M'
        },
        speed: props.monster.speed || 1,
        stamina: props.monster.stamina || 1,
        stability: props.monster.stability || 0,
        freeStrike: props.monster.freeStrike || 0,
        characteristics: { 
          might: props.monster.characteristics?.might || 0,
          agility: props.monster.characteristics?.agility || 0,
          reason: props.monster.characteristics?.reason || 0,
          intuition: props.monster.characteristics?.intuition || 0,
          presence: props.monster.characteristics?.presence || 0
        }
      }
    }

    // Watch for monster changes and reinitialize (only when not in edit mode)
    watch(() => [props.monster, props.editMode], ([newMonster, newEditMode]) => {
      if (newMonster && !newEditMode) {
        initializeEditableMonster()
      } else if (newMonster && newEditMode && !editableMonster.value.name) {
        // Only initialize if editableMonster is empty
        initializeEditableMonster()
      }
    }, { immediate: true, deep: false })
    
    // Watch for changes in editableMonster and emit updates (only in edit mode)
    watch(editableMonster, (newValue) => {
      if (props.editMode && newValue && Object.keys(newValue).length > 0) {
        emit('update:monster', { ...newValue })
      }
    }, { deep: true, flush: 'sync' })

    const updateCharacteristics = (characteristics) => {
      if (props.editMode && editableMonster.value) {
        editableMonster.value.characteristics = { ...characteristics }
      }
    }

    return {
      editableMonster,
      updateCharacteristics
    }
  },
  methods: {
    getMaxCharacteristic(monsterData) {
      const monster = monsterData || this.monster;
      if (!monster.characteristics) return 0;
      const values = Object.values(monster.characteristics);
      return values.length > 0 ? Math.max(...values) : 0;
    },
    formatKeywords(keywords) {
      if (!keywords || !Array.isArray(keywords)) return '';
      return keywords.map(keyword =>
        keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
      ).join(', ');
    },
    formatMonsterRole(monster) {
      return `Level ${monster.level} ${monster.organization}${monster.role ? ' ' + monster.role : ''}`;
    },
    formatImmunity(immunity) {
      let result = null;
      if (typeof immunity === 'object') {
        result = Object.entries(immunity)
          .filter(([, value]) => value > 0)
          .map(([type, value]) => `${type} ${value}`)
          .join(', ');
      }
      return result || '—';
    },
    formatWeakness(weakness) {
      let result = null;
      if (typeof weakness === 'object') {
        result = Object.entries(weakness)
          .filter(([, value]) => value > 0)
          .map(([type, value]) => `${type} ${value}`)
          .join(', ');
      }
      return result || '—';
    },
    formatMovement(movement) {
      if (!movement) return '—';
      if (typeof movement === 'string') return movement;
      if (Array.isArray(movement)) return movement.join(', ');
      return movement;
    }
  }
}
</script>

<style scoped>
.stat-block {
  background: #fdf6e3;
  border: 1px solid #8b4513;
  border-radius: 4px;
  padding: 1.5rem;
  font-family: 'Libre Baskerville', 'Book Antiqua', serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
}

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

.monster-meta-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 0.5rem 0;
  text-transform: capitalize;
  position: relative;
}

.monster-meta-left {
  margin: 0;
  font-weight: bold;
  color: #666;
  font-size: 1rem;
}

.monster-meta-center {
  margin: 0;
  font-style: italic;
  color: #666;
  font-size: 1rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.monster-meta-right {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  color: #8b4513;
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #8b4513, transparent);
  margin: 1rem 0;
}

.core-stats {
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

.source-info {
  margin-top: 1rem;
}

.source-text {
  font-size: 0.8rem;
  color: #777;
  text-align: center;
  font-style: italic;
}

.abilities-section {
  margin: 1rem 0;
}

.ability {
  margin-bottom: 1rem;
}

.ability-name {
  font-weight: bold;
  color: #8b4513;
  margin: 0;
  display: inline;
  font-size: 1rem;
}

.ability-text {
  display: inline;
  margin: 0;
  color: #333;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .stat-block {
    padding: 1rem;
  }

  .monster-name {
    font-size: 1.5rem;
  }

  .monster-meta-container {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
    align-items: center;
  }

  .monster-meta-left,
  .monster-meta-center,
  .monster-meta-right {
    position: static;
    transform: none;
    margin: 0;
    width: auto;
  }

  .core-stats {
    margin-bottom: 1.25rem;
  }

  .stat-labels,
  .stat-values {
    gap: 0.25rem;
  }

  .stat-label,
  .stat-value {
    font-size: 0.9rem;
    min-width: 0;
  }

  .secondary-stats {
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.85rem;
    text-align: left;
    align-items: flex-start;
  }

  .stat-item {
    white-space: normal;
    word-break: break-word;
  }

  .stat-separator {
    display: none;
  }
}

@media (max-width: 480px) {
  .stat-block {
    padding: 0.75rem;
  }

  .monster-name {
    font-size: 1.3rem;
    letter-spacing: 0.5px;
  }

  .monster-meta-container {
    gap: 0.4rem;
  }

  .monster-meta-left,
  .monster-meta-center,
  .monster-meta-right {
    font-size: 0.9rem;
  }

  .core-stats {
    margin-bottom: 1rem;
  }

  .stat-labels {
    margin-bottom: 0.4rem;
  }

  .stat-label {
    font-size: 0.85rem;
  }

  .stat-value {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .secondary-stats {
    font-size: 0.8rem;
    gap: 0.4rem;
  }
}

/* Edit Mode Styles */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: #8b4513;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #8b4513;
  border-radius: 4px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: 0;
  border-color: #a0522d;
  box-shadow: 0 0 0 0.2rem rgba(139, 69, 19, 0.25);
}

.monster-name-input {
  font-size: 1.5rem;
  font-weight: bold;
  color: #8b4513;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.stat-edit-values {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.stat-edit-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-input {
  padding: 0.4rem;
  text-align: center;
  font-weight: 600;
}

.stat-select {
  padding: 0.4rem;
  text-align: center;
}

/* Mobile edit styles */
@media (max-width: 768px) {
  .stat-edit-values {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat-edit-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  
  .monster-name-input {
    font-size: 1.3rem;
  }
}
</style>