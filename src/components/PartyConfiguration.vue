<template>
  <div class="party-configuration">
    <div class="section-header">
      <h3>Party Configuration</h3>
      <p class="section-description">Configure your party to calculate encounter budget</p>
    </div>

    <div class="heroes-list">
      <div v-for="(hero, index) in heroes" :key="index" class="hero-item">
        <label :for="`hero-${index}`" class="hero-label">Hero {{ index + 1 }}</label>
        <div class="hero-controls">
          <input
            :id="`hero-${index}`"
            v-model.number="hero.level"
            type="number"
            min="1"
            max="10"
            class="form-input hero-level-input"
            @input="updateParty"
          />
          <button
            type="button"
            class="btn btn-sm btn-danger"
            @click="removeHero(index)"
            :disabled="heroes.length === 1"
            title="Remove hero"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <button type="button" class="btn btn-secondary btn-full-width" @click="addHero">
      + Add Hero
    </button>

    <div v-if="partyStrength > 0" class="party-summary">
      <div class="summary-stat">
        <span class="stat-label">Party Size:</span>
        <span class="stat-value">{{ heroes.length }} {{ heroes.length === 1 ? 'hero' : 'heroes' }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Party Strength:</span>
        <span class="stat-value">{{ partyStrength }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Avg Level:</span>
        <span class="stat-value">{{ avgLevel }}</span>
      </div>
    </div>

    <div v-if="recommendations.length > 0" class="recommendations">
      <h4>Recommendations</h4>
      <ul>
        <li v-for="(rec, index) in recommendations" :key="index">{{ rec }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  calculatePartyStrength,
  getEncounterRecommendations,
  type PartyConfiguration as PartyConfig
} from '@/utils/encounterBalance'

interface Props {
  modelValue: PartyConfig
}

interface Emits {
  (e: 'update:modelValue', value: PartyConfig): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state for heroes
const heroes = ref(props.modelValue.heroes.map((h) => ({ ...h })))

// Computed properties
const partyStrength = computed(() => calculatePartyStrength({ heroes: heroes.value }))

const avgLevel = computed(() => {
  if (heroes.value.length === 0) return 0
  return Math.round((partyStrength.value / heroes.value.length) * 10) / 10
})

const recommendations = computed(() => {
  return getEncounterRecommendations({ heroes: heroes.value })
})

// Methods
function addHero() {
  heroes.value.push({ level: 1 })
  updateParty()
}

function removeHero(index: number) {
  if (heroes.value.length > 1) {
    heroes.value.splice(index, 1)
    updateParty()
  }
}

function updateParty() {
  // Validate and clamp levels
  heroes.value.forEach((hero) => {
    if (hero.level < 1) hero.level = 1
    if (hero.level > 10) hero.level = 10
  })

  emit('update:modelValue', { heroes: heroes.value.map((h) => ({ ...h })) })
}

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (JSON.stringify(newValue.heroes) !== JSON.stringify(heroes.value)) {
      heroes.value = newValue.heroes.map((h) => ({ ...h }))
    }
  },
  { deep: true }
)
</script>

<style scoped>
.party-configuration {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-header h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.section-description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
}

.heroes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.hero-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.hero-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  min-width: 70px;
  color: var(--color-neutral-700);
}

.hero-controls {
  display: flex;
  gap: var(--space-2);
  flex: 1;
}

.hero-level-input {
  width: 80px;
  text-align: center;
  font-weight: var(--font-weight-medium);
}

.btn-full-width {
  width: 100%;
}

.party-summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
}

.summary-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-600);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.recommendations {
  padding: var(--space-4);
  background: var(--color-info-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-info-600);
}

.recommendations h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-info-700);
}

.recommendations ul {
  margin: 0;
  padding-left: var(--space-5);
  list-style: disc;
}

.recommendations li {
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  line-height: var(--line-height-relaxed);
}

.recommendations li:last-child {
  margin-bottom: 0;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .hero-item {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-label {
    min-width: auto;
  }

  .party-summary {
    flex-direction: column;
  }
}
</style>
