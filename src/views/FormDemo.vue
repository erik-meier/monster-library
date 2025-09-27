<template>
  <div class="form-demo">
    <div class="demo-header">
      <h1>Monster Form Demo</h1>
      <p>Demonstration of the monster editing form components</p>
    </div>
    
    <div class="demo-controls">
      <button @click="loadSampleMonster" class="btn btn-secondary">
        Load Sample Monster
      </button>
      <button @click="createNewMonster" class="btn btn-primary">
        Create New Monster
      </button>
    </div>
    
    <div v-if="showForm" class="form-container">
      <MonsterFormLayout
        :model-value="monsterData"
        :is-editing="isEditing"
        @update:model-value="updateMonster"
        @save="saveMonster"
        @cancel="cancelEdit"
      />
    </div>
    
    <div v-if="savedMonster" class="saved-monster">
      <h2>Saved Monster Data</h2>
      <div class="json-preview">
        <pre>{{ JSON.stringify(savedMonster, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MonsterFormData } from '@/types/monster-forms'
import MonsterFormLayout from '@/components/MonsterFormLayout.vue'

const showForm = ref(false)
const isEditing = ref(false)
const savedMonster = ref<MonsterFormData | null>(null)

const monsterData = ref<MonsterFormData>({
  id: '',
  name: '',
  level: 1,
  ev: 1,
  role: '',
  organization: '',
  keywords: [],
  size: {
    value: 1,
    letter: 'M'
  },
  speed: 6,
  stamina: 10,
  stability: 0,
  freeStrike: 2,
  movementTypes: ['walk'],
  characteristics: {
    might: 0,
    agility: 0,
    reason: 0,
    intuition: 0,
    presence: 0
  },
  immunities: {},
  weaknesses: {},
  items: []
})

const loadSampleMonster = () => {
  monsterData.value = {
    id: 'sample-goblin-warrior',
    name: 'Sample Goblin Warrior',
    level: 2,
    ev: 4,
    role: 'Brute',
    organization: 'Standard',
    keywords: ['humanoid'],
    size: {
      value: 1,
      letter: 'S'
    },
    speed: 6,
    stamina: 15,
    stability: 1,
    freeStrike: 3,
    movementTypes: ['walk', 'climb'],
    characteristics: {
      might: 2,
      agility: 1,
      reason: -1,
      intuition: 1,
      presence: 0
    },
    immunities: {},
    weaknesses: {
      fire: 2
    },
    items: [
      {
        name: 'Rusty Sword',
        type: 'ability',
        system: {
          category: 'signature',
          type: 'main',
          resource: null,
          keywords: ['melee', 'weapon', 'strike'],
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
              formula: '2d10 + 2',
              characteristics: ['might']
            },
            tiers: [
              { tier: 1, display: '3 damage' },
              { tier: 2, display: '5 damage' },
              { tier: 3, display: '7 damage' }
            ]
          },
          effect: {
            before: '',
            after: 'The goblin snarls menacingly.'
          },
          description: {
            value: '',
            director: ''
          },
          spend: {
            text: '',
            value: null
          }
        }
      },
      {
        name: 'Goblin Cunning',
        type: 'feature',
        system: {
          keywords: [],
          power: null,
          description: {
            value: 'When the goblin takes damage, it can shift 1 square as a free triggered action.',
            director: 'Use this to keep goblins mobile and hard to pin down.'
          }
        }
      }
    ],
    source: {
      book: 'Demo Monsters',
      page: '1',
      license: 'Draw Steel Creator License'
    }
  }
  isEditing.value = true
  showForm.value = true
  savedMonster.value = null
}

const createNewMonster = () => {
  monsterData.value = {
    id: '',
    name: '',
    level: 1,
    ev: 1,
    role: '',
    organization: '',
    keywords: [],
    size: {
      value: 1,
      letter: 'M'
    },
    speed: 6,
    stamina: 10,
    stability: 0,
    freeStrike: 2,
    movementTypes: ['walk'],
    characteristics: {
      might: 0,
      agility: 0,
      reason: 0,
      intuition: 0,
      presence: 0
    },
    immunities: {},
    weaknesses: {},
    items: []
  }
  isEditing.value = false
  showForm.value = true
  savedMonster.value = null
}

const updateMonster = (data: MonsterFormData) => {
  monsterData.value = data
}

const saveMonster = (data: MonsterFormData) => {
  savedMonster.value = { ...data }
  showForm.value = false
  console.log('Monster saved:', data)
}

const cancelEdit = () => {
  showForm.value = false
}
</script>

<style scoped>
.form-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.demo-header h1 {
  color: #8b4513;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.demo-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.demo-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #8b4513;
  color: white;
}

.btn-primary:hover {
  background: #a0522d;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.form-container {
  margin-top: 2rem;
}

.saved-monster {
  margin-top: 3rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.saved-monster h2 {
  color: #8b4513;
  margin-bottom: 1rem;
}

.json-preview {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #ced4da;
  overflow-x: auto;
}

.json-preview pre {
  margin: 0;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #333;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-demo {
    padding: 1rem 0.5rem;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .demo-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
}
</style>