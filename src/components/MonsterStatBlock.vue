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
          {{ formatKeywords(monster.system.monster.keywords) }}
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
      <span class="stat-item">
        <strong>Immunity</strong> {{ formatImmunity(monster.system.damage.immunities) }}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat-item">
        <strong>Weakness</strong> {{ formatWeakness(monster.system.damage.weaknesses) }}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat-item">
        <strong>Movement</strong> {{ formatMovement(monster.system.movement.types) }}
      </span>
    </div>

    <div class="divider"></div>

    <!-- Abilities -->
    <ActionsList :title="Abilities" :actions="monster.items" :chr="Math.max(...Object.values(monster.system.characteristics).map(c => c.value))" :monster="monster" />

    <!-- Source Information -->
    <div v-if="monster.system.source" class="source-info">
      <div class="divider"></div>
      <div class="source-text">
        <span v-if="monster.system.source.book">{{ monster.system.source.book }}</span>
        <span v-if="monster.system.source.page">, page {{ monster.system.source.page }}</span>
        <span v-if="monster.system.source.license"> • {{ monster.system.source.license }}</span>
      </div>
    </div>
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
    formatKeywords(keywords) {
      if (!keywords || !Array.isArray(keywords)) return '';
      return keywords.map(keyword => 
        keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
      ).join(', ');
    },
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
  position: relative;
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
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
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
  color: #666;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  line-height: 1.4;
}

.stat-item {
  white-space: nowrap;
}

.stat-item strong {
  color: #8b4513;
  font-weight: bold;
}

.stat-separator {
  color: #8b4513;
  font-weight: bold;
  margin: 0 0.25rem;
}

.source-info {
  margin-top: 1rem;
}

.source-text {
  font-size: 0.8rem;
  color: #777;
  text-align: center;
  font-style: italic;
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

  .monster-meta-container {
    flex-direction: column;
    gap: 0.25rem;
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
    margin-bottom: 1.25rem;
  }
  
  .stat-labels,
  .stat-values {
    gap: 0.25rem;
  }
  
  .stat-label,
  .stat-value {
    font-size: 0.9rem;
    min-width: 0;
  }
  
  .secondary-stats {
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.85rem;
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
    padding: 0.75rem;
  }
  
  .monster-name {
    font-size: 1.3rem;
    letter-spacing: 0.5px;
  }
  
  .monster-meta-container {
    gap: 0.4rem;
  }
  
  .monster-meta-left,
  .monster-meta-center,
  .monster-meta-right {
    font-size: 0.9rem;
  }
  
  .core-stats {
    margin-bottom: 1rem;
  }
  
  .stat-labels {
    margin-bottom: 0.4rem;
  }
  
  .stat-label {
    font-size: 0.85rem;
  }
  
  .stat-value {
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .secondary-stats {
    font-size: 0.8rem;
    gap: 0.4rem;
  }
}
</style>