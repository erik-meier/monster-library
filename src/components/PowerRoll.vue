<template>
  <div class="power-roll">
    <div v-if="processedEffects.length" class="outcomes">
      <div 
        v-for="effect in processedEffects" 
        :key="effect._id"
        class="effect-group"
      >
        <div v-if="effect.name" class="effect-name">{{ effect.name }}</div>
        
        <div 
          v-for="(tierText, tier) in effect.tiers" 
          :key="tier"
          class="outcome"
          :class="`tier-${tier}`"
        >
          <span class="tier-number">{{ tier }}</span>
          <span class="outcome-text" v-html="tierText"></span>
        </div>
      </div>
    </div>
    
    <div v-if="effect" class="effect">
      <strong>Effect:</strong> <span v-html="effect"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PowerRoll',
  props: {
    effects: {
      type: Array,
      default: () => []
    },
    chr: {
      type: String,
      default: ''
    }
  },
  computed: {
    processedEffects() {
      return Object.entries(this.effects).map(([_, effect]) => this.processEffect(effect))
    }
  },
  methods: {
    processEffect(effect) {
      const tiers = {}
      
      if (effect.type === 'damage' && effect.damage) {
        ['tier1', 'tier2', 'tier3'].forEach((tier, index) => {
          const tierData = effect.damage[tier]
          if (tierData) {
            let description = tierData.value
            
            // Add damage types if specified
            if (tierData.types && tierData.types.length > 0) {
              description += ` ${tierData.types.join('/')} damage`
            } else {
              description += ' damage'
            }
            
            // Add properties (conditions, etc.)
            if (tierData.properties && tierData.properties.length > 0) {
              description += `; ${tierData.properties.join(', ')}`
            }
            
            // Add potency effects (like conditions with save ends)
            if (tierData.potency && tierData.potency.value && tierData.potency.value !== 'none') {
              const potencyText = this.formatPotency(tierData.potency)
              if (potencyText) {
                description += `; ${potencyText}`
              }
            }
            
            tiers[index + 1] = description
          }
        })
      } else {
        // Handle other effect types (conditions, movement, etc.)
        if (effect.tier1) tiers[1] = this.formatGenericTier(effect.tier1)
        if (effect.tier2) tiers[2] = this.formatGenericTier(effect.tier2)
        if (effect.tier3) tiers[3] = this.formatGenericTier(effect.tier3)
      }
      
      return {
        ...effect,
        tiers
      }
    },
    formatPotency(potency) {
      if (!potency.value || !potency.characteristic || potency.characteristic === 'none') return null
      // Map common potency patterns to numeric values
      const potencyMap = {
        '@potency.weak': this.chr-2,
        '@potency.average': this.chr-1, 
        '@potency.strong': this.cr
      }
      
      let potencyValue = potencyMap[potency.value] || potency.value
      let result = `(${potency.characteristic.charAt(0).toUpperCase()}<${potencyValue}})`
      
      return result
    },
    formatGenericTier(tierData) {
      // Handle non-damage effects
      if (typeof tierData === 'string') return tierData
      if (tierData.description) return tierData.description
      return JSON.stringify(tierData) // Fallback for complex objects
    }
  }
}
</script>

<style scoped>
.power-roll {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.power-roll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.dice-notation {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.1rem;
  color: #495057;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
}

.signature-badge {
  background: linear-gradient(45deg, #8b4513, #a0522d);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.effect-group {
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.effect-name {
  background: #f3f4f6;
  padding: 0.5rem 0.75rem;
  font-weight: bold;
  color: #374151;
  font-size: 0.9rem;
  border-bottom: 1px solid #e5e7eb;
}

.outcomes .effect-group:last-child {
  margin-bottom: 0;
}

.effect-group .outcome {
  border-left: none;
  border-radius: 0;
  margin-bottom: 0;
}

.effect-group .outcome:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.outcome {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 4px solid;
}

.outcome.tier-1 {
  background: #fff5f5;
  border-left-color: #ef4444;
}

.outcome.tier-2 {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.outcome.tier-3 {
  background: #f0fdf4;
  border-left-color: #22c55e;
}

.tier-number {
  background: white;
  color: #495057;
  font-weight: bold;
  font-size: 0.9rem;
  min-width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
  border: 2px solid;
}

.tier-1 .tier-number {
  border-color: #ef4444;
  color: #ef4444;
}

.tier-2 .tier-number {
  border-color: #f59e0b;
  color: #f59e0b;
}

.tier-3 .tier-number {
  border-color: #22c55e;
  color: #22c55e;
}

.outcome-text {
  flex: 1;
  line-height: 1.4;
  color: #374151;
}

.effect {
  background: #e0e7ff;
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  padding: 0.75rem;
  margin: 0.75rem 0;
  color: #374151;
  line-height: 1.4;
}

.effect strong {
  color: #4338ca;
}

.malice-effects {
  margin-top: 0.75rem;
}

.malice-effect {
  display: block;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  color: #374151;
  line-height: 1.4;
}

.malice-cost {
  color: #92400e;
  font-weight: bold;
  margin-right: 0.5rem;
}

/* Handle HTML formatting in descriptions */
.outcome-text :deep(strong),
.effect :deep(strong),
.malice-effect :deep(strong) {
  font-weight: bold;
}

.outcome-text :deep(em),
.effect :deep(em),
.malice-effect :deep(em) {
  font-style: italic;
}

.outcome-text :deep(br),
.effect :deep(br),
.malice-effect :deep(br) {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .power-roll {
    padding: 0.75rem;
  }
  
  .power-roll-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .signature-badge {
    text-align: center;
  }
  
  .outcome {
    padding: 0.4rem;
  }
  
  .tier-number {
    min-width: 1.25rem;
    height: 1.25rem;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }
  
  .dice-notation {
    font-size: 1rem;
    text-align: center;
  }
}
</style>