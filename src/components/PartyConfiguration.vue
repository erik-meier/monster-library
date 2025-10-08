<template>
  <div class="party-configuration">
    <div class="section-header">
      <h3>Party Configuration</h3>
      <p class="section-description">Configure your party to calculate encounter budget</p>
    </div>

    <div v-if="partyStrength > 0" class="party-summary">
      <div class="summary-stat">
        <span class="stat-label">Party Size:</span>
        <span class="stat-value">{{ heroes.length }}</span>
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

    <div class="heroes-list">
      <div class="heroes-header">
        <span class="hero-name-header">Hero</span>
        <span class="hero-stat-header">Level</span>
        <span class="hero-stat-header">Victories</span>
        <span class="hero-actions-header"></span>
      </div>
      <div v-for="(hero, index) in heroes" :key="index" class="hero-item">
        <label :for="`hero-level-${index}`" class="hero-label">Hero {{ index + 1 }}</label>
        <div class="hero-controls">
          <div class="hero-input-group" data-label="Level">
            <label :for="`hero-level-${index}`" class="sr-only">Level for Hero {{ index + 1 }}</label>
            <input :id="`hero-level-${index}`" v-model.number="hero.level" type="number" min="1" max="10"
              class="form-input hero-stat-input" @input="updateParty" />
          </div>
          <div class="hero-input-group" data-label="Victories">
            <label :for="`hero-victories-${index}`" class="sr-only">Victories for Hero {{ index + 1 }}</label>
            <input :id="`hero-victories-${index}`" v-model.number="hero.victories" type="number" min="0"
              class="form-input hero-stat-input" @input="updateParty" />
          </div>
          <button type="button" class="btn btn-sm btn-danger" @click="removeHero(index)" :disabled="heroes.length === 1"
            title="Remove hero">
            ✕
          </button>
        </div>
      </div>
    </div>

    <button type="button" class="btn btn-secondary btn-full-width" @click="addHero">
      + Add Hero
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  calculatePartyStrength,
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
const heroes = ref(props.modelValue.heroes.map((h) => ({ level: h.level, victories: h.victories || 0 })))

// Computed properties
const partyStrength = computed(() => calculatePartyStrength({ heroes: heroes.value }))

const avgLevel = computed(() => {
  if (heroes.value.length === 0) return 0
  return Math.round((heroes.value.map((h) => h.level).reduce((sum, lvl) => sum + lvl, 0) / heroes.value.length) * 10) / 10
})

// Methods
function addHero() {
  let newLevel = 1
  let newVictories = 0

  if (heroes.value.length > 0) {
    // Calculate average level and victories, rounding down
    const totalLevel = heroes.value.reduce((sum, hero) => sum + hero.level, 0)
    const totalVictories = heroes.value.reduce((sum, hero) => sum + hero.victories, 0)

    newLevel = Math.floor(totalLevel / heroes.value.length)
    newVictories = Math.floor(totalVictories / heroes.value.length)

    // Ensure level is at least 1
    if (newLevel < 1) newLevel = 1
  }

  heroes.value.push({ level: newLevel, victories: newVictories })
  updateParty()
}

function removeHero(index: number) {
  if (heroes.value.length > 1) {
    heroes.value.splice(index, 1)
    updateParty()
  }
}

function updateParty() {
  // Validate and clamp levels and victories
  heroes.value.forEach((hero) => {
    if (hero.level < 1) hero.level = 1
    if (hero.level > 10) hero.level = 10
    if (hero.victories < 0) hero.victories = 0
  })

  emit('update:modelValue', { heroes: heroes.value.map((h) => ({ level: h.level, victories: h.victories })) })
}

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (JSON.stringify(newValue.heroes) !== JSON.stringify(heroes.value)) {
      heroes.value = newValue.heroes.map((h) => ({ level: h.level, victories: h.victories || 0 }))
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

.heroes-header {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  color: var(--color-neutral-600);
  border-bottom: 1px solid var(--color-neutral-300);
}

.hero-name-header {
  text-align: left;
}

.hero-stat-header {
  text-align: center;
  min-width: 80px;
}

.hero-actions-header {
  min-width: 32px;
}

.hero-item {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: var(--space-3);
}

.hero-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.hero-controls {
  display: contents;
}

.hero-input-group {
  display: flex;
}

.hero-stat-input {
  width: 80px;
  text-align: center;
  font-weight: var(--font-weight-medium);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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

/* Mobile responsive */
@media (max-width: 640px) {
  .heroes-header {
    display: none;
  }

  .hero-item {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--color-neutral-50);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-neutral-200);
  }

  .hero-controls {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }

  .hero-input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .hero-input-group::before {
    content: attr(data-label);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-600);
    text-transform: uppercase;
  }

  .hero-stat-input {
    width: 100%;
  }

  .party-summary {
    flex-direction: column;
  }
}
</style>
