<template>
  <div class="characteristic-scores">
    <div 
      v-for="characteristic in characteristicOrder" 
      :key="characteristic"
      class="characteristic-score"
    >
      <div class="characteristic-name">{{ getCharacteristicName(characteristic) }}</div>
      <div class="characteristic-value">
        {{ formatModifier(characteristics[characteristic] || 0) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharacteristicScores',
  props: {
    characteristics: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      characteristicOrder: ['might', 'agility', 'reason', 'intuition', 'presence']
    }
  },
  methods: {
    getCharacteristicName(characteristic) {
      const names = {
        might: 'Might',
        agility: 'Agility', 
        reason: 'Reason',
        intuition: 'Intuition',
        presence: 'Presence'
      }
      return names[characteristic] || characteristic
    },
    formatModifier(value) {
      return value >= 0 ? `+${value}` : `${value}`
    }
  }
}
</script>

<style scoped>
.characteristic-scores {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin: 1rem 0;
}

.characteristic-score {
  text-align: center;
  border: 1px solid #8b4513;
  border-radius: 4px;
  padding: 0.75rem 0.5rem;
  background: #f9f5f0;
  min-width: 0;
}

.characteristic-name {
  font-weight: bold;
  font-size: 0.8rem;
  color: #8b4513;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}

.characteristic-value {
  font-size: 1rem;
  color: #333;
  font-weight: bold;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .characteristic-scores {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .characteristic-score {
    padding: 0.5rem 0.25rem;
  }
  
  .characteristic-name {
    font-size: 0.7rem;
  }
  
  .characteristic-value {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .characteristic-scores {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>