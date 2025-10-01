<template>
  <div class="stat-block">
    <!-- Header -->
    <div class="header">
      <h1 class="monster-name">{{ monster.name }}</h1>
      <div class="monster-meta-container">
        <p class="monster-meta-left">
          {{ formatMonsterRole(monster) }}
        </p>
        <p class="monster-meta-center">
          {{ formatKeywords(monster.keywords) }}
        </p>
        <p class="monster-meta-right">
          {{ formatMonsterEV(monster) }}
        </p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Core Stats Grid -->
    <div class="core-stats-grid">
      <div class="stat-labels">
        <div class="stat-label">Size</div>
        <div class="stat-label">Speed</div>
        <div class="stat-label">Stamina</div>
        <div class="stat-label">Stability</div>
        <div class="stat-label">Free Strike</div>
      </div>
      <div class="stat-values">
        <div class="stat-value">{{ monster.size.value }}{{ monster.size.value > 1 ? '' : monster.size.letter }}</div>
        <div class="stat-value">{{ monster.speed }}</div>
        <div class="stat-value">{{ monster.stamina }}</div>
        <div class="stat-value">{{ monster.stability }}</div>
        <div class="stat-value">{{ monster.freeStrike }}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Characteristics -->
    <CharacteristicScores :characteristics="monster.characteristics" />

    <div class="divider"></div>

    <!-- Secondary Stats -->
    <div class="secondary-stats">
      <span class="stat-item">
        <strong>Immunity</strong> {{ formatImmunity(monster.immunities) }}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat-item">
        <strong>Weakness</strong> {{ formatWeakness(monster.weaknesses) }}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat-item">
        <strong>Movement</strong> {{ formatMovement(monster.movementTypes) }}
      </span>
    </div>

    <div class="divider"></div>

    <!-- Abilities -->
    <div v-if="(monster.items || []).length > 0" title="Abilities" :expanded="true" id="abilities-section">
      <ActionsList :title="'Abilities'" :actions="monster.items || []" :chr="String(getMaxCharacteristic())"
        :monster="monster" />
    </div>

    <!-- Source Information -->
    <div v-if="monster.source" class="source-info">
      <div class="divider"></div>
      <div class="source-text">
        <span v-if="monster.source.book">{{ monster.source.book }}</span>
        <span v-if="monster.source.page">, page {{ monster.source.page }}</span>
        <span v-if="monster.source.license"> • {{ monster.source.license }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import CharacteristicScores from './CharacteristicScores.vue'
import ActionsList from './ActionsList.vue'
import {
  formatKeywords,
  formatMonsterRole,
  formatMonsterEV,
  formatImmunity,
  formatWeakness,
  formatMovement
} from '@/utils/formatters'

export default {
  name: 'MonsterStatBlock',
  components: {
    CharacteristicScores,
    ActionsList
  },
  props: {
    monster: {
      type: Object,
      required: true
    }
  },
  methods: {
    getMaxCharacteristic() {
      if (!this.monster.characteristics) return 0;
      const values = Object.values(this.monster.characteristics);
      return values.length > 0 ? Math.max(...values) : 0;
    },
    // Use imported formatters from shared utilities
    formatKeywords,
    formatMonsterRole,
    formatMonsterEV,
    formatImmunity,
    formatWeakness,
    formatMovement
  }
}
</script>

<style scoped>
.stat-block {
  background: var(--color-primary-50);
  border: 2px solid var(--color-primary-600);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  font-family: var(--font-family-serif);
  box-shadow: var(--shadow-md);
  max-width: 100%;
}

.header {
  text-align: center;
  margin-bottom: var(--space-4);
}

.monster-name {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.monster-meta-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 var(--space-2) 0;
  text-transform: capitalize;
  position: relative;
}

.monster-meta-left {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-600);
  font-size: var(--font-size-base);
}

.monster-meta-center {
  margin: 0;
  font-style: italic;
  color: var(--color-neutral-600);
  font-size: var(--font-size-base);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.monster-meta-right {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, var(--color-primary-600), transparent);
  margin: var(--space-4) 0;
}

.core-stats {
  margin-bottom: var(--space-4);
}

.stat-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.stat-label {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  flex: 1;
  text-align: center;
  font-size: var(--font-size-sm);
}

.stat-values {
  display: flex;
  justify-content: space-between;
}

.stat-value {
  flex: 1;
  color: var(--color-neutral-800);
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

.secondary-stats {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  line-height: var(--line-height-relaxed);
}

.stat-item {
  white-space: nowrap;
}

.stat-item strong {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-bold);
}

.stat-separator {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-bold);
  margin: 0 var(--space-1);
}

.source-info {
  margin-top: var(--space-4);
}

.source-text {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
  text-align: center;
  font-style: italic;
}

.abilities-section {
  margin: var(--space-4) 0;
}

.ability {
  margin-bottom: var(--space-4);
}

.ability-name {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  margin: 0;
  display: inline;
  font-size: var(--font-size-base);
}

.ability-text {
  display: inline;
  margin: 0;
  color: var(--color-neutral-800);
  line-height: var(--line-height-relaxed);
}

@media (max-width: 768px) {
  .stat-block {
    padding: var(--space-4);
  }

  .monster-name {
    font-size: var(--font-size-2xl);
  }

  .monster-meta-container {
    flex-direction: column;
    gap: var(--space-1);
    text-align: center;
    align-items: center;
  }

  .monster-meta-left,
  .monster-meta-center,
  .monster-meta-right {
    position: static;
    transform: none;
    margin: 0;
    width: auto;
  }

  .core-stats {
    margin-bottom: var(--space-5);
  }

  .stat-labels,
  .stat-values {
    gap: var(--space-1);
  }

  .stat-label,
  .stat-value {
    font-size: var(--font-size-sm);
    min-width: 0;
  }

  .secondary-stats {
    flex-direction: column;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    text-align: left;
    align-items: flex-start;
  }

  .stat-item {
    white-space: normal;
    word-break: break-word;
  }

  .stat-separator {
    display: none;
  }
}

@media (max-width: 480px) {
  .stat-block {
    padding: var(--space-3);
  }

  .monster-name {
    font-size: var(--font-size-xl);
    letter-spacing: 0.5px;
  }

  .monster-meta-container {
    gap: var(--space-2);
  }

  .monster-meta-left,
  .monster-meta-center,
  .monster-meta-right {
    font-size: var(--font-size-sm);
  }

  .core-stats {
    margin-bottom: var(--space-4);
  }

  .stat-labels {
    margin-bottom: var(--space-2);
  }

  .stat-label {
    font-size: var(--font-size-xs);
  }

  .stat-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
  }

  .secondary-stats {
    font-size: var(--font-size-xs);
    gap: var(--space-2);
  }
}
</style>