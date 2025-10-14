<template>
  <div class="encounter-templates">
    <div class="templates-header">
      <h3>Encounter Templates</h3>
      <p>Quick-start with pre-built encounter templates</p>
    </div>

    <div v-if="templates.length === 0" class="coming-soon">
      <h4>Coming Soon</h4>
      <p>Pre-built encounter templates are being developed and will be available in a future update.</p>
    </div>

    <div v-else class="templates-grid">
      <div v-for="template in templates" :key="template.id" class="template-card" @click="selectTemplate(template)">
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
// TODO: Add encounter templates here
const templates = computed<EncounterTemplate[]>(() => {
  const templateList: EncounterTemplate[] = []

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

/* Coming Soon Message */
.coming-soon {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-neutral-600);
  background: var(--color-neutral-50);
  border: 2px dashed var(--color-neutral-300);
  border-radius: var(--radius-lg);
  margin: var(--space-4) 0;
}

.coming-soon h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-700);
}

.coming-soon p {
  margin: 0;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
