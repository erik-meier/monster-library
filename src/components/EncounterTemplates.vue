<template>
  <div class="encounter-templates">
    <div class="templates-header">
      <h3>Encounter Templates</h3>
      <p>Quick-start with pre-built encounter templates</p>
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
          <div class="template-badges">
            <span class="stat-badge">{{ template.monsters.length }} monsters</span>
            <span class="stat-badge ev-badge">EV {{ template.totalEV }}</span>
          </div>
        </div>

        <p class="template-description">{{ template.description }}</p>

        <div class="template-monsters">
          <div v-for="monster in template.monsters.slice(0, 3)" :key="monster.id" class="monster-preview">
            <span class="monster-count">{{ monster.count }}×</span>
            <span class="monster-name">{{ monster.name }}</span>
          </div>
          <div v-if="template.monsters.length > 3" class="more-monsters">
            +{{ template.monsters.length - 3 }} more
          </div>
        </div>

        <button type="button" class="btn btn-primary btn-sm" @click.stop="selectTemplate(template)">
          Use Template
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EncounterMonster } from '@/stores/encounter'

interface EncounterTemplate {
  id: string
  name: string
  description: string
  monsters: EncounterMonster[]
  targetEV: number
  totalEV: number
}

const emit = defineEmits<{
  templateSelected: [template: EncounterTemplate]
}>()

// Pre-defined encounter templates
const templates = computed<EncounterTemplate[]>(() => {
  const templateList: EncounterTemplate[] = [
    {
      id: 'template-goblin-ambush',
      name: 'Goblin Ambush',
      description: 'A classic low-level encounter with goblins attacking from multiple sides',
      targetEV: 12,
      monsters: [
        { id: 'goblin', name: 'Goblin', level: 1, ev: 2, role: 'Harrier', organization: 'Minion', count: 4 },
        { id: 'goblin-sharpshooter', name: 'Goblin Sharpshooter', level: 1, ev: 4, role: 'Artillery', organization: 'Standard', count: 1 }
      ],
      totalEV: 12
    },
    {
      id: 'template-undead-horde',
      name: 'Undead Horde',
      description: 'Waves of undead creatures with a powerful leader',
      targetEV: 30,
      monsters: [
        { id: 'skeleton', name: 'Skeleton', level: 2, ev: 2, role: 'Brute', organization: 'Minion', count: 8 },
        { id: 'ghoul', name: 'Ghoul', level: 2, ev: 6, role: 'Harrier', organization: 'Standard', count: 2 },
        { id: 'wight', name: 'Wight', level: 3, ev: 8, role: 'Leader', organization: 'Elite', count: 1 }
      ],
      totalEV: 30
    },
    {
      id: 'template-dragon-lair',
      name: 'Dragon Lair',
      description: 'Face a young dragon with its kobold servants',
      targetEV: 40,
      monsters: [
        { id: 'young-dragon', name: 'Young Dragon', level: 5, ev: 30, role: 'Solo', organization: 'Solo', count: 1 },
        { id: 'kobold-dragonshield', name: 'Kobold Dragonshield', level: 3, ev: 5, role: 'Defender', organization: 'Standard', count: 2 }
      ],
      totalEV: 40
    },
    {
      id: 'template-bandit-camp',
      name: 'Bandit Camp',
      description: 'A diverse group of bandits with ranged and melee fighters',
      targetEV: 20,
      monsters: [
        { id: 'bandit', name: 'Bandit', level: 2, ev: 3, role: 'Harrier', organization: 'Minion', count: 4 },
        { id: 'bandit-captain', name: 'Bandit Captain', level: 3, ev: 8, role: 'Leader', organization: 'Elite', count: 1 }
      ],
      totalEV: 20
    },
    {
      id: 'template-elemental-chaos',
      name: 'Elemental Chaos',
      description: 'Multiple elemental creatures causing havoc',
      targetEV: 25,
      monsters: [
        { id: 'fire-elemental', name: 'Fire Elemental', level: 3, ev: 7, role: 'Brute', organization: 'Standard', count: 2 },
        { id: 'air-elemental', name: 'Air Elemental', level: 3, ev: 6, role: 'Harrier', organization: 'Standard', count: 1 },
        { id: 'earth-elemental', name: 'Earth Elemental', level: 3, ev: 5, role: 'Defender', organization: 'Standard', count: 1 }
      ],
      totalEV: 25
    },
    {
      id: 'template-spider-nest',
      name: 'Spider Nest',
      description: 'Giant spiders and their swarm of smaller offspring',
      targetEV: 18,
      monsters: [
        { id: 'giant-spider', name: 'Giant Spider', level: 2, ev: 6, role: 'Ambusher', organization: 'Standard', count: 2 },
        { id: 'spider-swarm', name: 'Spider Swarm', level: 1, ev: 2, role: 'Harrier', organization: 'Minion', count: 3 }
      ],
      totalEV: 18
    }
  ]

  return templateList
})

function selectTemplate(template: EncounterTemplate) {
  emit('templateSelected', template)
}
</script>

<style scoped>
.encounter-templates {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  padding: var(--space-6);
}

.templates-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.templates-header h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.templates-header p {
  margin: 0;
  color: var(--color-neutral-600);
  font-size: var(--font-size-base);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.template-card {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid var(--color-primary-500);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.template-card:hover {
  border-color: var(--color-primary-400);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.template-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.template-name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.template-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.stat-badge {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
  background: var(--color-neutral-100);
  padding: 2px var(--space-2);
  border-radius: var(--radius-base);
}

.ev-badge {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.template-description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  line-height: var(--line-height-relaxed);
  flex: 1;
}

.template-monsters {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.monster-preview {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.monster-count {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.monster-name {
  color: var(--color-neutral-700);
}

.more-monsters {
  color: var(--color-neutral-500);
  font-style: italic;
  margin-top: var(--space-1);
}

.template-card .btn {
  margin-top: auto;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
