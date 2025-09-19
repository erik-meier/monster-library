<template>
  <div class="ability-scores">
    <div 
      v-for="ability in abilityOrder" 
      :key="ability"
      class="ability-score"
    >
      <div class="ability-name">{{ ability.toUpperCase() }}</div>
      <div class="ability-value">
        {{ abilities[ability] || 10 }} ({{ formatModifier(getModifier(abilities[ability] || 10)) }})
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AbilityScores',
  props: {
    abilities: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      abilityOrder: ['str', 'dex', 'con', 'int', 'wis', 'cha']
    }
  },
  methods: {
    getModifier(score) {
      return Math.floor((score - 10) / 2)
    },
    formatModifier(modifier) {
      return modifier >= 0 ? `+${modifier}` : `${modifier}`
    }
  }
}
</script>

<style scoped>
.ability-scores {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  margin: 1rem 0;
}

.ability-score {
  text-align: center;
  border: 1px solid #8b4513;
  border-radius: 4px;
  padding: 0.75rem 0.5rem;
  background: #f9f5f0;
  min-width: 0;
}

.ability-name {
  font-weight: bold;
  font-size: 0.8rem;
  color: #8b4513;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}

.ability-value {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .ability-scores {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .ability-score {
    padding: 0.5rem 0.25rem;
  }
  
  .ability-name {
    font-size: 0.7rem;
  }
  
  .ability-value {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .ability-scores {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>