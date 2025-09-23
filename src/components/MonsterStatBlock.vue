<template>
  <div class="stat-block">
    <!-- Header -->
    <div class="header">
      <h1 class="monster-name">{{ monster.name }}</h1>
      <div class="monster-meta-container">
        <p class="monster-meta-left">
          {{ formatMonsterRole(monster.system.monster) }}
        </p>
        <p class="monster-meta-center">
          {{ monster.system.monster.keywords.join(", ") }}
        </p>
        <p class="monster-meta-right">
          EV {{ monster.system.monster.ev }}
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
        <div class="stat-value">{{ monster.system.combat.size.value }}{{ monster.system.combat.size.letter }}</div>
        <div class="stat-value">{{ monster.system.movement.value }}</div>
        <div class="stat-value">{{ monster.system.stamina.max }}</div>
        <div class="stat-value">{{ monster.system.combat.stability }}</div>
        <div class="stat-value">{{ monster.system.monster.freeStrike }}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Characteristics -->
    <CharacteristicScores :characteristics="monster.system.characteristics" />

    <div class="divider"></div>

    <!-- Secondary Stats -->
    <div class="secondary-stats">
      <div class="stat-row">
        <span class="stat-label">Immunity</span>
        <span class="stat-value">{{ formatImmunity(monster.system.damage.immunities) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Weakness</span>
        <span class="stat-value">{{ formatWeakness(monster.system.damage.weaknesses) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Movement</span>
        <span class="stat-value">{{ formatMovement(monster.system.movement.types) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Languages</span>
        <span class="stat-value">{{ monster.system.biography.languages.join(', ') || '—' }}</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Abilities -->
    <ActionsList :title="Abilities" :actions="monster.items" :chr="Math.max(...Object.values(monster.system.characteristics).map(c => c.value))" />
  </div>
</template>

<script>
import CharacteristicScores from './CharacteristicScores.vue'
import ActionsList from './ActionsList.vue';

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
    formatMonsterRole(monster) {
      return `Level ${monster.level} ${monster.organization}${monster.role ? ' ' + monster.role : ''}`;
    },
    formatImmunity(immunity) {
      let result = null;
      if (typeof immunity === 'object') {
        result = Object.entries(immunity)
          .filter(([type, value]) => value > 0)
          .map(([type, value]) => `${type} ${value}`)
          .join(', ');
      }
      return result || '—';
    },
    formatWeakness(weakness) {
      let result = null;
      if (typeof weakness === 'object') {
        result = Object.entries(weakness)
          .filter(([type, value]) => value > 0)
          .map(([type, value]) => `${type} ${value}`)
          .join(', ');
      }
      return result || '—';
    },
    formatMovement(movement) {
      if (!movement) return '—';
      if (typeof movement === 'string') return movement;
      if (Array.isArray(movement)) return movement.join(', ');
      return movement;
    }
  }
}
</script>

<style scoped>
.stat-block {
  background: #fdf6e3;
  border: 1px solid #8b4513;
  border-radius: 4px;
  padding: 1.5rem;
  font-family: 'Libre Baskerville', 'Book Antiqua', serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 1rem;
}

.monster-name {
  font-size: 1.8rem;
  font-weight: bold;
  color: #8b4513;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.monster-meta-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 0.5rem 0;
  text-transform: capitalize;
}

.monster-meta-left {
  margin: 0;
  font-weight: bold;
  color: #666;
  font-size: 1rem;
}

.monster-meta-center {
  margin: 0;
  font-style: italic;
  color: #666;
  font-size: 1rem;
}

.monster-meta-right {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  color: #8b4513;
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #8b4513, transparent);
  margin: 1rem 0;
}

.core-stats {
  margin-bottom: 1rem;
}

.stat-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-weight: bold;
  color: #8b4513;
  flex: 1;
  text-align: center;
}

.stat-values {
  display: flex;
  justify-content: space-between;
}

.stat-value {
  flex: 1;
  color: #333;
  text-align: center;
}

.secondary-stats {
  font-size: 0.9rem;
}

.abilities-section {
  margin: 1rem 0;
}

.ability {
  margin-bottom: 1rem;
}

.ability-name {
  font-weight: bold;
  color: #8b4513;
  margin: 0;
  display: inline;
  font-size: 1rem;
}

.ability-text {
  display: inline;
  margin: 0;
  color: #333;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .stat-block {
    padding: 1rem;
  }
  
  .monster-name {
    font-size: 1.5rem;
  }
  
  .stat-row {
    flex-direction: column;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    min-width: auto;
    margin-bottom: 0.25rem;
  }
}
</style>