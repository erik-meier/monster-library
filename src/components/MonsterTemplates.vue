<template>
  <div class="monster-templates">
    <div class="templates-header">
      <h3>Monster Templates</h3>
      <p>Start with pre-built templates for common monster types</p>
    </div>

    <div class="templates-grid">
      <div 
        v-for="template in templates" 
        :key="template.id" 
        class="template-card"
        @click="selectTemplate(template)"
      >
        <div class="template-header">
          <h4 class="template-name">{{ template.name }}</h4>
          <div class="template-meta">
            <span class="template-role">{{ template.role }}</span>
            <span class="template-level">Level {{ template.level }}</span>
          </div>
        </div>
        
        <div class="template-keywords">
          <span 
            v-for="keyword in template.keywords" 
            :key="keyword" 
            class="keyword-tag"
          >
            {{ keyword }}
          </span>
        </div>
        
        <div class="template-description">
          <p>{{ template.description }}</p>
        </div>
        
        <div class="template-actions">
          <button class="btn btn-primary btn-sm" @click.stop="selectTemplate(template)">
            Use Template
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const templates = ref([
  {
    id: 'animal-template',
    name: 'Animal',
    level: 1,
    role: 'Harrier',
    organization: 'Elite',
    keywords: ['animal'],
    description: 'A basic animal template suitable for wildlife encounters. Features natural weapons and mobility.',
    baseStats: {
      ev: 12,
      size: { value: 1, letter: 'M' },
      speed: 6,
      stamina: 60,
      stability: 0,
      freeStrike: 4,
      characteristics: {
        might: 0,
        agility: 2,
        reason: -2,
        intuition: 1,
        presence: -2
      },
      movementTypes: ['walk']
    }
  },
  {
    id: 'animal-swarm-template',
    name: 'Animal Swarm',
    level: 1,
    role: 'Hexer',
    organization: 'Elite',
    keywords: ['animal', 'swarm'],
    description: 'A swarm of small animals that can occupy other creatures\' spaces and impede movement.',
    baseStats: {
      ev: 12,
      size: { value: 2, letter: 'M' },
      speed: 5,
      stamina: 40,
      stability: 1,
      freeStrike: 4,
      characteristics: {
        might: -2,
        agility: 1,
        reason: -3,
        intuition: 2,
        presence: -3
      },
      movementTypes: ['walk']
    }
  },
  {
    id: 'humanoid-warrior-template',
    name: 'Humanoid Warrior',
    level: 1,
    role: 'Brute',
    organization: 'Minion',
    keywords: ['humanoid'],
    description: 'A basic humanoid warrior template for guards, soldiers, and fighters.',
    baseStats: {
      ev: 3,
      size: { value: 1, letter: 'M' },
      speed: 5,
      stamina: 15,
      stability: 0,
      freeStrike: 3,
      characteristics: {
        might: 2,
        agility: 0,
        reason: 0,
        intuition: 0,
        presence: 0
      },
      movementTypes: ['walk']
    }
  },
  {
    id: 'humanoid-spellcaster-template',
    name: 'Humanoid Spellcaster',
    level: 1,
    role: 'Controller',
    organization: 'Minion',
    keywords: ['humanoid'],
    description: 'A basic humanoid spellcaster template for mages, clerics, and other magic users.',
    baseStats: {
      ev: 3,
      size: { value: 1, letter: 'M' },
      speed: 5,
      stamina: 12,
      stability: 0,
      freeStrike: 2,
      characteristics: {
        might: -1,
        agility: 0,
        reason: 2,
        intuition: 1,
        presence: 0
      },
      movementTypes: ['walk']
    }
  },
  {
    id: 'undead-skeleton-template',
    name: 'Undead Skeleton',
    level: 1,
    role: 'Artillery',
    organization: 'Horde',
    keywords: ['undead'],
    description: 'A basic undead skeleton template for ranged attackers and support monsters.',
    baseStats: {
      ev: 3,
      size: { value: 1, letter: 'M' },
      speed: 5,
      stamina: 15,
      stability: 0,
      freeStrike: 3,
      characteristics: {
        might: 0,
        agility: 1,
        reason: -2,
        intuition: 0,
        presence: -2
      },
      movementTypes: ['walk']
    }
  },
  {
    id: 'elemental-template',
    name: 'Elemental',
    level: 1,
    role: 'Hexer',
    organization: 'Minion',
    keywords: ['elemental'],
    description: 'A basic elemental template for creatures of pure elemental energy.',
    baseStats: {
      ev: 3,
      size: { value: 1, letter: 'M' },
      speed: 5,
      stamina: 15,
      stability: 0,
      freeStrike: 3,
      characteristics: {
        might: 0,
        agility: 0,
        reason: -1,
        intuition: 2,
        presence: -1
      },
      movementTypes: ['walk']
    }
  }
])

// Emit event when template is selected
const emit = defineEmits<{
  templateSelected: [template: typeof templates.value[0]]
}>()

function selectTemplate(template: typeof templates.value[0]) {
  emit('templateSelected', template)
}
</script>

<style scoped>
.monster-templates {
  margin-bottom: 2rem;
}

.templates-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.templates-header h3 {
  color: #8b4513;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.templates-header p {
  color: #6c757d;
  font-size: 1rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.template-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid #8b4513;
}

.template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.template-name {
  color: #8b4513;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
  flex: 1;
}

.template-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.template-role {
  background-color: #8b4513;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: capitalize;
}

.template-level {
  background: #f8f9fa;
  color: #495057;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  border: 1px solid #e9ecef;
}

.template-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.keyword-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.7rem;
  border: 1px solid #e9ecef;
}

.template-description {
  margin-bottom: 1rem;
}

.template-description p {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.template-actions {
  text-align: center;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: none;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-primary {
  background-color: #8b4513;
  color: white;
  border-color: #8b4513;
}

.btn-primary:hover:not(:disabled) {
  background-color: #7a3c11;
  border-color: #6c3310;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .template-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .template-meta {
    flex-direction: row;
    align-items: center;
  }
}
</style>