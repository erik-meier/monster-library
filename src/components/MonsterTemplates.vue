<template>
  <div class="monster-templates">
    <div class="templates-header">
      <h3>Monster Templates</h3>
      <p>Start with pre-built templates for common monster types</p>
    </div>

    <div class="templates-grid">
      <div v-for="template in templates" :key="template.id" class="template-card" @click="selectTemplate(template)">
        <div class="template-header">
          <h4 class="template-name">{{ template.name }}</h4>
          <div class="template-meta">
            <span class="template-role">Level {{ template.level }} {{ template.role }}</span>
          </div>
        </div>

        <div class="template-keywords">
          <span v-for="keyword in template.keywords" :key="keyword" class="keyword-tag">
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
import { ref, onMounted } from 'vue'
import { getMonster } from '@/data/monsters.js'
import type { MonsterItem } from '@/types/monster-forms'

// Template monster IDs from actual monster data
const templateIds = [
  'animal',           // Basic animal template
  'animal-swarm',     // Swarm template  
  'big-animal-a',     // Large animal template
  'big-animal-b',     // Larger animal template
  'predator-a',       // Predator template
  'predator-b'        // Stronger predator template
]

interface TemplateMonster {
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
  keywords: string[]
  description: string
  size: { value: number; letter: string }
  speed: number
  stamina: number
  stability: number
  freeStrike: number
  characteristics: {
    might: number
    agility: number
    reason: number
    intuition: number
    presence: number
  }
  movementTypes: string[]
  items: MonsterItem[]
}

const templates = ref<TemplateMonster[]>([])

// Load templates from actual monster data on mount
onMounted(() => {
  const loadedTemplates: TemplateMonster[] = []

  for (const templateId of templateIds) {
    try {
      const monsterData = getMonster(templateId)
      if (monsterData) {
        // Generate a description based on the monster's properties
        const description = generateDescription(monsterData)

        loadedTemplates.push({
          id: monsterData.id,
          name: monsterData.name,
          level: monsterData.level,
          ev: monsterData.ev,
          role: monsterData.role,
          organization: monsterData.organization,
          keywords: monsterData.keywords || [],
          description,
          size: monsterData.size,
          speed: monsterData.speed,
          stamina: monsterData.stamina,
          stability: monsterData.stability,
          freeStrike: monsterData.freeStrike,
          characteristics: monsterData.characteristics,
          movementTypes: monsterData.movementTypes || ['walk'],
          items: monsterData.items || []
        })
      }
    } catch (error) {
      console.warn(`Failed to load template ${templateId}:`, error)
    }
  }

  templates.value = loadedTemplates
})

// Template monster IDs from actual monster data with their descriptions
const templateDescriptions: Record<string, string> = {
  'animal': 'Basic animal template suitable for wildlife encounters. Features natural weapons and mobility.',
  'animal-swarm': 'Swarm of small animals that can occupy other creatures\' spaces and create difficult terrain.',
  'big-animal-a': 'Large creature suitable as a mount in combat encounters.',
  'big-animal-b': 'Larger creature suitable as a mount in combat encounters.',
  'predator-a': 'Common predator for wild combat encounters.',
  'predator-b': 'Predator template for larger, more dangerous creatures.'
}

function generateDescription(monster: {
  id?: string
  role?: string
  keywords?: string[]
  level?: number
  organization?: string
  name?: string
}): string {
  // Use direct mapping for known template IDs
  if (monster.id && templateDescriptions[monster.id]) {
    return templateDescriptions[monster.id]
  }

  const role = monster.role ? monster.role.toLowerCase() : 'creature'
  const keywords = monster.keywords?.join(', ') || 'generic'
  const level = monster.level || 1
  const organization = monster.organization?.toLowerCase() || 'standard'

  // Avoid article confusion by rephrasing
  return `Level ${level} ${organization} ${role} template featuring ${keywords} traits.`
}

// Emit event when template is selected
const emit = defineEmits<{
  templateSelected: [template: TemplateMonster]
}>()

function selectTemplate(template: TemplateMonster) {
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