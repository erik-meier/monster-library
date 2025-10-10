<template>
  <div class="encounter-budget">
    <!-- Prominent EV and Difficulty Display -->
    <div class="encounter-summary">
      <div class="ev-badge" :class="`difficulty-${encounterInfo.difficulty.toLowerCase()}`">
        <div class="ev-value">{{ encounterInfo.encounterStrength.toFixed(0) }}</div>
        <div class="ev-label">EV</div>
      </div>

      <div class="difficulty-info">
        <div class="difficulty-name" :class="`difficulty-${encounterInfo.difficulty.toLowerCase()}`">
          {{ encounterInfo.difficulty }}
        </div>
        <div class="difficulty-subtitle">Encounter Difficulty</div>
      </div>

      <button type="button" class="help-button" @click="showTooltip = !showTooltip"
        :title="showTooltip ? 'Hide difficulty info' : 'Show difficulty info'">
        ?
      </button>
    </div>

    <!-- Clean Progress Bar (no labels) -->
    <div class="difficulty-progress-bar">
      <div class="difficulty-levels">
        <div v-for="zone in difficultyLevels" :key="zone.name" :class="`difficulty-zone ${zone.color}`"
          :style="{ width: `${zone.width}%` }">
        </div>
      </div>
      <div class="progress-indicator" :style="{ left: `${progressPosition}%` }">
        <div class="progress-line"></div>
      </div>
    </div>

    <!-- Detailed Info Tooltip -->
    <div v-if="showTooltip" class="difficulty-tooltip">
      <h4>{{ encounterInfo.difficulty }} Encounter</h4>
      <p>{{ difficultyDescription }}</p>
      <div class="threshold-info">
        <p><strong>Difficulty Thresholds (based on party strength):</strong></p>
        <ul>
          <li>Trivial: 0 - {{ encounterInfo.thresholds.easy.toFixed(1) }} EV</li>
          <li>Easy: {{ encounterInfo.thresholds.easy.toFixed(1) }} - {{ encounterInfo.thresholds.standard.toFixed(1) }}
            EV</li>
          <li>Standard: {{ encounterInfo.thresholds.standard.toFixed(1) }} - {{ encounterInfo.thresholds.hard.toFixed(1)
          }} EV</li>
          <li>Hard: {{ encounterInfo.thresholds.hard.toFixed(1) }} - {{ encounterInfo.thresholds.extreme.toFixed(1) }}
            EV</li>
          <li>Extreme: {{ encounterInfo.thresholds.extreme.toFixed(1) }}+ EV</li>
        </ul>
      </div>
      <br />
      <h4>About Dynamic Difficulty</h4>
      <p>
        Encounter difficulty is determined by comparing the total Encounter Value (EV) of monsters
        to your party's strength. The difficulty automatically updates as you add or remove monsters.
      </p>
      <p class="help-note">
        <strong>Party Strength:</strong> Based on hero levels {{party.heroes.length > 0 && party.heroes.some(h =>
          h.victories > 0) ? 'and victory bonuses' : ''}}.
        Heroes with victories increase the party's effective strength.
      </p>
    </div>

    <div v-if="encounterInfo.difficulty === 'Extreme'" class="progress-info extreme-warning">
      ⚠️ Extreme encounter! This may be deadly for the heroes.
    </div>

    <div v-if="monsterRecommendations.length > 0" class="encounter-recommendations">
      <h4>Encounter Recommendations</h4>
      <ul>
        <li v-for="(rec, index) in monsterRecommendations" :key="index">{{ rec }}</li>
      </ul>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  calculateEncounterDifficulty,
  getDifficultyDescription,
  getMonsterRecommendations,
  type PartyConfiguration,
  type MonsterInEncounter
} from '@/utils/encounterBalance'

interface Props {
  party: PartyConfiguration
  monsters: MonsterInEncounter[]
}

const props = defineProps<Props>()

const showTooltip = ref(false)

const encounterInfo = computed(() => {
  return calculateEncounterDifficulty(props.party, props.monsters)
})

const difficultyDescription = computed(() => {
  return getDifficultyDescription(encounterInfo.value.difficulty)
})

const difficultyLevels = computed(() => {
  const thresholds = encounterInfo.value.thresholds

  // Set hard threshold to be at 80% of the bar
  const maxThreshold = thresholds.extreme / 0.8

  return [
    {
      name: 'Green Zone',
      description: 'Trivial-Standard',
      width: (thresholds.hard / maxThreshold) * 100,
      color: 'green'
    },
    {
      name: 'Yellow Zone',
      description: 'Hard',
      width: ((thresholds.extreme - thresholds.hard) / maxThreshold) * 100,
      color: 'yellow'
    },
    {
      name: 'Red Zone',
      description: 'Extreme',
      width: ((maxThreshold - thresholds.extreme) / maxThreshold) * 100,
      color: 'red'
    }
  ]
})

const progressPosition = computed(() => {
  const strength = encounterInfo.value.encounterStrength
  const thresholds = encounterInfo.value.thresholds
  const maxThreshold = thresholds.extreme / 0.8

  // Ensure minimum position of 3% to align with the start of the green zone
  const position = (strength / maxThreshold) * 100
  return Math.max(3, Math.min(98, position))
})

const monsterRecommendations = computed(() => {
  return getMonsterRecommendations(props.party, props.monsters)
})
</script>

<style scoped>
.encounter-budget {
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

/* Encounter Summary - Prominent EV and Difficulty */
.encounter-summary {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-5);
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}

.ev-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ev-badge.difficulty-trivial,
.ev-badge.difficulty-easy,
.ev-badge.difficulty-standard {
  background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600));
  color: white;
}

.ev-badge.difficulty-hard {
  background: linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600));
  color: white;
}

.ev-badge.difficulty-extreme {
  background: linear-gradient(135deg, var(--color-error-500), var(--color-error-600));
  color: white;
}

.ev-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.ev-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.difficulty-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.difficulty-name {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

.difficulty-name.difficulty-trivial,
.difficulty-name.difficulty-easy,
.difficulty-name.difficulty-standard {
  color: var(--color-success-700);
}

.difficulty-name.difficulty-hard {
  color: var(--color-warning-700);
}

.difficulty-name.difficulty-extreme {
  color: var(--color-error-700);
}

.difficulty-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.help-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-primary-600);
  background: white;
  color: var(--color-primary-600);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all 0.2s;
}

.help-button:hover {
  background: var(--color-primary-600);
  color: white;
}

.difficulty-tooltip {
  padding: var(--space-4);
  background: var(--color-primary-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary-200);
}

.difficulty-tooltip h4 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-700);
}

.difficulty-tooltip p {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  line-height: var(--line-height-relaxed);
}

.difficulty-tooltip p:last-child {
  margin-bottom: 0;
}

.threshold-info {
  margin-top: var(--space-3);
}

.threshold-info p {
  margin: 0 0 var(--space-2) 0;
}

.threshold-info ul {
  margin: 0;
  padding-left: var(--space-4);
  font-size: var(--font-size-sm);
}

.threshold-info li {
  margin-bottom: var(--space-1);
  color: var(--color-neutral-700);
}

.difficulty-progress-bar {
  position: relative;
  padding: var(--space-3);
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}

.difficulty-levels {
  display: flex;
  height: 32px;
  border-radius: var(--radius-base);
  overflow: hidden;
  background: var(--color-neutral-200);
}

.difficulty-zone {
  position: relative;
  transition: all 0.3s ease;
  border-right: 2px solid white;
}

.difficulty-zone:last-child {
  border-right: none;
}

.difficulty-zone.green {
  background: linear-gradient(90deg, var(--color-success-500), var(--color-success-600));
}

.difficulty-zone.yellow {
  background: linear-gradient(90deg, var(--color-warning-500), var(--color-warning-600));
}

.difficulty-zone.red {
  background: linear-gradient(90deg, var(--color-error-500), var(--color-error-600));
}

.progress-indicator {
  position: absolute;
  top: 12px;
  transform: translateX(-50%);
  z-index: 15;
  pointer-events: none;
  transition: left 0.3s ease;
}

.progress-line {
  width: 4px;
  height: 32px;
  background: var(--color-neutral-900);
  border-radius: 1px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-info {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  text-align: center;
  margin: var(--space-3) 0;
}

.next-threshold {
  color: var(--color-neutral-500);
  font-size: var(--font-size-xs);
}

.extreme-warning {
  color: var(--color-error-700);
  font-weight: var(--font-weight-medium);
}

.encounter-help {
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
}

.encounter-help h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-800);
}

.encounter-help p {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  line-height: var(--line-height-relaxed);
}

.encounter-help p:last-child {
  margin-bottom: 0;
}

.help-note {
  font-style: italic;
  color: var(--color-neutral-600);
}

.encounter-recommendations {
  padding: var(--space-4);
  background: var(--color-warning-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-warning-600);
  margin-bottom: var(--space-4);
}

.encounter-recommendations h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-warning-700);
}

.encounter-recommendations ul {
  margin: 0;
  padding-left: var(--space-5);
  list-style: none;
}

.encounter-recommendations li {
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  line-height: var(--line-height-relaxed);
  position: relative;
}

.encounter-recommendations li:last-child {
  margin-bottom: 0;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .encounter-summary {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .ev-badge {
    width: 60px;
    height: 60px;
  }

  .ev-value {
    font-size: var(--font-size-xl);
  }

  .difficulty-name {
    font-size: var(--font-size-xl);
  }

  .difficulty-subtitle {
    font-size: var(--font-size-xs);
  }

  .progress-info {
    font-size: var(--font-size-xs);
  }
}
</style>
