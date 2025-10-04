<template>
  <div class="encounter-budget">
    <div class="section-header">
      <h3>Encounter Budget</h3>
      <p class="section-description">Track EV budget as you build your encounter</p>
    </div>

    <div class="difficulty-selector">
      <label for="difficulty-select">Difficulty:</label>
      <select id="difficulty-select" v-model="selectedDifficulty" class="form-input" @change="updateDifficulty">
        <option value="Trivial">Trivial</option>
        <option value="Easy">Easy</option>
        <option value="Standard">Standard</option>
        <option value="Hard">Hard</option>
        <option value="Extreme">Extreme</option>
      </select>
      <button
        type="button"
        class="help-button"
        @click="showTooltip = !showTooltip"
        :title="showTooltip ? 'Hide difficulty info' : 'Show difficulty info'"
      >
        ?
      </button>
    </div>

    <div v-if="showTooltip" class="difficulty-tooltip">
      <h4>{{ selectedDifficulty }} Encounter</h4>
      <p>{{ difficultyDescription }}</p>
      <p class="multiplier-info">
        <strong>Budget Multiplier:</strong> {{ difficultyMultiplier }}×
      </p>
    </div>

    <div class="budget-display" :class="`budget-${budgetStatus}`">
      <div class="budget-bar-container">
        <div class="budget-bar" :style="{ width: `${Math.min(budget.percentage, 100)}%` }"></div>
        <div v-if="budget.percentage > 100" class="budget-bar-overflow"></div>
      </div>
      <div class="budget-stats">
        <div class="budget-stat">
          <span class="stat-label">Used</span>
          <span class="stat-value">{{ budget.used }} EV</span>
        </div>
        <div class="budget-stat">
          <span class="stat-label">Total Budget</span>
          <span class="stat-value">{{ budget.total }} EV</span>
        </div>
        <div class="budget-stat">
          <span class="stat-label">Remaining</span>
          <span class="stat-value">{{ budget.remaining }} EV</span>
        </div>
        <div class="budget-stat budget-percentage">
          <span class="stat-value-large">{{ budget.percentage }}%</span>
        </div>
      </div>
    </div>

    <div v-if="budgetStatus === 'warning'" class="budget-warning warning">
      ⚠️ Budget usage at {{ budget.percentage }}%. Consider balancing the encounter.
    </div>

    <div v-if="budgetStatus === 'danger'" class="budget-warning danger">
      ⚠️ Budget usage at {{ budget.percentage }}%. You're approaching the limit!
    </div>

    <div v-if="budgetStatus === 'over'" class="budget-warning over">
      🛑 Budget exceeded! This encounter is over budget by {{ Math.abs(budget.remaining) }} EV.
    </div>

    <div class="budget-help">
      <h4>About Encounter Budget</h4>
      <p>
        The encounter budget is calculated based on your party's strength (sum of hero levels) multiplied
        by the difficulty multiplier. Add monsters to your encounter, and their combined EV will count
        against this budget.
      </p>
      <p class="help-note">
        <strong>Note:</strong> Minion EV represents 4 minions. When adding individual minions, the cost
        is divided accordingly.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  getEncounterBudgetSummary,
  getBudgetStatus,
  getDifficultyDescription,
  getDifficultyMultiplier,
  type EncounterDifficulty,
  type PartyConfiguration,
  type MonsterInEncounter
} from '@/utils/encounterBalance'

interface Props {
  party: PartyConfiguration
  monsters: MonsterInEncounter[]
  difficulty: EncounterDifficulty
}

interface Emits {
  (e: 'update:difficulty', value: EncounterDifficulty): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showTooltip = ref(false)
const selectedDifficulty = ref<EncounterDifficulty>(props.difficulty)

const budget = computed(() => {
  return getEncounterBudgetSummary(props.party, props.difficulty, props.monsters)
})

const budgetStatus = computed(() => {
  return getBudgetStatus(budget.value)
})

const difficultyDescription = computed(() => {
  return getDifficultyDescription(selectedDifficulty.value)
})

const difficultyMultiplier = computed(() => {
  return getDifficultyMultiplier(selectedDifficulty.value)
})

function updateDifficulty() {
  emit('update:difficulty', selectedDifficulty.value)
}
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

.section-description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
}

.difficulty-selector {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.difficulty-selector label {
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.difficulty-selector select {
  flex: 1;
  max-width: 200px;
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

.multiplier-info {
  font-size: var(--font-size-sm);
  color: var(--color-primary-600);
}

.budget-display {
  padding: var(--space-5);
  background: white;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-neutral-200);
  transition: border-color 0.3s;
}

.budget-display.budget-safe {
  border-color: var(--color-success-600);
}

.budget-display.budget-warning {
  border-color: var(--color-warning-600);
}

.budget-display.budget-danger {
  border-color: var(--color-error-600);
}

.budget-display.budget-over {
  border-color: var(--color-error-700);
  background: var(--color-error-50);
}

.budget-bar-container {
  position: relative;
  height: 24px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-base);
  overflow: hidden;
  margin-bottom: var(--space-4);
}

.budget-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-success-600), var(--color-success-500));
  transition: all 0.3s ease;
  border-radius: var(--radius-base);
}

.budget-display.budget-warning .budget-bar {
  background: linear-gradient(90deg, var(--color-warning-600), var(--color-warning-500));
}

.budget-display.budget-danger .budget-bar,
.budget-display.budget-over .budget-bar {
  background: linear-gradient(90deg, var(--color-error-600), var(--color-error-500));
}

.budget-bar-overflow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    var(--color-error-600),
    var(--color-error-600) 10px,
    var(--color-error-700) 10px,
    var(--color-error-700) 20px
  );
  animation: slideStripes 1s linear infinite;
}

@keyframes slideStripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 28px 28px;
  }
}

.budget-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--space-4);
}

.budget-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.budget-percentage {
  grid-column: 1 / -1;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-neutral-200);
}

.stat-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-600);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.stat-value-large {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.budget-warning {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.budget-warning.warning {
  background: var(--color-warning-50);
  border: 1px solid var(--color-warning-600);
  color: var(--color-warning-800);
}

.budget-warning.danger {
  background: var(--color-error-50);
  border: 1px solid var(--color-error-600);
  color: var(--color-error-800);
}

.budget-warning.over {
  background: var(--color-error-50);
  border: 2px solid var(--color-error-700);
  color: var(--color-error-900);
  font-weight: var(--font-weight-bold);
}

.budget-help {
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
}

.budget-help h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-800);
}

.budget-help p {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  line-height: var(--line-height-relaxed);
}

.budget-help p:last-child {
  margin-bottom: 0;
}

.help-note {
  font-style: italic;
  color: var(--color-neutral-600);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .difficulty-selector {
    flex-wrap: wrap;
  }

  .difficulty-selector select {
    max-width: 100%;
  }

  .budget-stats {
    grid-template-columns: 1fr 1fr;
  }

  .budget-percentage {
    grid-column: 1 / -1;
  }
}
</style>
