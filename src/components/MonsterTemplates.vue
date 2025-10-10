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
  size: string
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
  movementTypes: Set<string>
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
  margin-bottom: var(--space-8);
}

.templates-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.templates-header h3 {
  color: var(--color-primary-700);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-2);
}

.templates-header p {
  color: var(--color-neutral-600);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.template-card {
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  cursor: pointer;
  transition: var(--transition-all);
  border-left: 4px solid var(--color-primary-600);
  box-shadow: var(--shadow-sm);
}

.template-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--color-primary-500);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.template-name {
  color: var(--color-primary-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
  flex: 1;
  line-height: var(--line-height-tight);
}

.template-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  align-items: flex-end;
}

.template-role {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: capitalize;
  box-shadow: var(--shadow-sm);
}

.template-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.keyword-tag {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  font-size: var(--font-size-xs);
  border: 1px solid var(--color-neutral-200);
  font-weight: var(--font-weight-medium);
}

.template-description {
  margin-bottom: var(--space-4);
}

.template-description p {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-snug);
  margin: 0;
}

.template-actions {
  text-align: center;
}

.btn {
  display: inline-block;
  padding: var(--padding-btn);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  border: 1px solid;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-all);
  text-align: center;
  background: none;
  box-shadow: var(--shadow-sm);
}

.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
  border-color: var(--color-primary-600);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }

  .template-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .template-meta {
    flex-direction: row;
    align-items: center;
  }
}
</style>