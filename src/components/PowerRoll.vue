<template>
  <div class="power-roll">
    <div
      v-if="processedEffects.length && processedEffects[0].tiers && Object.keys(processedEffects[0].tiers).length > 0"
      class="outcomes">
      <div v-for="(tierText, tier) in processedEffects[0].tiers" :key="tier" class="outcome" :class="`tier-${tier}`">
        <span class="tier-number">{{ formatTierNumber(tier) }}</span>
        <span class="outcome-text" v-html="tierText"></span>
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
      type: Object,
      default: () => ({})
    },
    chr: {
      type: String,
      default: ''
    }
  },
  computed: {
    processedEffects() {
      // Group all effects by tier instead of processing them individually
      const tierData = { 1: [], 2: [], 3: [] }

      // Process each effect and add to appropriate tiers
      if (this.effects && typeof this.effects === 'object') {
        Object.values(this.effects).forEach((effect) => {
          const processedEffect = this.processEffect(effect)

          // Add each tier's text to the appropriate tier array
          Object.entries(processedEffect.tiers).forEach(([tier, text]) => {
            if (text && tierData[tier]) {
              tierData[tier].push(text)
            }
          })
        })
      }

      // Combine all effects for each tier into single strings
      const collatedTiers = {}
      Object.entries(tierData).forEach(([tier, texts]) => {
        if (texts.length > 0) {
          collatedTiers[tier] = texts.join('; ')
        }
      })

      // Return single effect object with collated tiers
      return [{
        _id: 'collated-effects',
        name: '',
        tiers: collatedTiers
      }]
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

            // Apply description formatting
            description = this.formatDescription(description)

            tiers[index + 1] = description
          }
        })
      } else if (effect.type === 'forced' && effect.forced) {
        // Handle forced movement effects (push, pull, etc.)
        ['tier1', 'tier2', 'tier3'].forEach((tier, index) => {
          const tierData = effect.forced[tier]
          if (tierData) {
            let description = tierData.display

            // If display is {{forced}}, generate the movement description
            if (description === '{{forced}}') {
              const properties = tierData.properties || []
              const movement = tierData.movement || []
              const distance = tierData.distance || ''

              // Format as "properties movement distance" (e.g., "vertical push 2")
              description = [
                ...properties,
                ...movement,
                distance
              ].filter(Boolean).join(' ')
            }

            if (description) {
              // Apply description formatting
              description = this.formatDescription(description)
              tiers[index + 1] = description
            }
          }
        })
      } else if (effect.type === 'applied' && effect.applied) {
        // Handle applied effects (conditions, etc.)
        // First check if any tier has a display value
        const hasAnyDisplay = ['tier1', 'tier2', 'tier3'].some(tier =>
          effect.applied[tier] && effect.applied[tier].display
        );

        ['tier1', 'tier2', 'tier3'].forEach((tier, index) => {
          const tierData = effect.applied[tier]
          if (tierData) {
            let description = tierData.display

            // If this tier has no display, try tier1 display if hasAnyDisplay
            if (!description && hasAnyDisplay && effect.applied.tier1 && effect.applied.tier1.display) {
              description = effect.applied.tier1.display
            }


            if (description) {
              // Fall back to tier1 characteristic if not specified
              if (tierData.potency && (!tierData.potency.characteristic || tierData.potency.characteristic === 'none')) {
                if (effect.applied.tier1?.potency?.characteristic) {
                  tierData.potency.characteristic = effect.applied.tier1.potency.characteristic
                }
              }

              // Replace {{potency}} placeholder with formatted potency if it exists
              if (description.includes('{{potency}}') && tierData.potency && tierData.potency.value && tierData.potency.characteristic) {
                const potencyText = this.formatPotency(tierData.potency)
                description = description.replace('{{potency}}', potencyText)
              }

              // Apply description formatting
              description = this.formatDescription(description)

              tiers[index + 1] = description
            }
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
        '@potency.weak': parseInt(this.chr) - 2,
        '@potency.average': parseInt(this.chr) - 1,
        '@potency.strong': parseInt(this.chr)
      }

      const potencyValue = potencyMap[potency.value] || potency.value

      // Format as characteristic abbreviation + < + value with bold emphasis
      const charAbbrev = potency.characteristic.charAt(0).toUpperCase()
      return `<strong class="potency-value">${charAbbrev}&lt;${potencyValue}</strong>`
    },
    formatDescription(description) {
      if (!description) return description

      // Parse and replace [[/damage type X]] directives
      description = description.replace(/\[\[\/damage\s+(\d+)(?:\s+(\w+))?\]\]/g, (match, value, type) => {
        const damageClass = type ? `damage-${type.toLowerCase()}` : 'damage-generic'
        return `<span class="damage-value ${damageClass}">${value}${type ? ` ${type}` : ''}</span>`
      })

      // Bold any remaining potency patterns that might exist in descriptions
      description = description.replace(/([A-Z]<\d+)/g, '<strong class="potency-value">$1</strong>')

      return description
    },
    formatGenericTier(tierData) {
      // Handle non-damage effects
      if (typeof tierData === 'string') return this.formatDescription(tierData)
      if (tierData.description) return this.formatDescription(tierData.description)
      return JSON.stringify(tierData) // Fallback for complex objects
    },
    formatTierNumber(tier) {
      if (tier === '1') return '<=11'
      if (tier === '2') return '12-16'
      if (tier === '3') return '17+'
      return ''
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
  font-size: 0.8rem;
  min-width: 3rem;
  height: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
  border: 2px solid;
  padding: 0 0.25rem;
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

/* Handle HTML formatting in descriptions */
.outcome-text :deep(strong),
.effect :deep(strong) {
  font-weight: bold;
}

.outcome-text :deep(em),
.effect :deep(em) {
  font-style: italic;
}

.outcome-text :deep(br),
.effect :deep(br) {
  margin-bottom: 0.25rem;
}

/* Potency value styling */
.outcome-text :deep(.potency-value),
.effect :deep(.potency-value) {
  font-weight: bold;
  color: #2563eb;
  background: #dbeafe;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

/* Damage type styling */
.outcome-text :deep(.damage-value),
.effect :deep(.damage-value) {
  font-weight: bold;
  font-size: 0.9rem;
}

/* Specific damage type colors */
.outcome-text :deep(.damage-value.damage-acid),
.effect :deep(.damage-value.damage-acid) {
  color: #059669;
  background: #d1fae5;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.outcome-text :deep(.damage-value.damage-cold),
.effect :deep(.damage-value.damage-cold) {
  color: #0891b2;
  background: #cffafe;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.outcome-text :deep(.damage-value.damage-corruption),
.effect :deep(.damage-value.damage-corruption) {
  color: #7c2d12;
  background: #fef3c7;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.outcome-text :deep(.damage-value.damage-fire),
.effect :deep(.damage-value.damage-fire) {
  color: #dc2626;
  background: #fee2e2;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.outcome-text :deep(.damage-value.damage-holy),
.effect :deep(.damage-value.damage-holy) {
  color: #ca8a04;
  background: #fef9c3;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.outcome-text :deep(.damage-value.damage-lightning),
.effect :deep(.damage-value.damage-lightning) {
  color: #7c3aed;
  background: #ede9fe;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.outcome-text :deep(.damage-value.damage-poison),
.effect :deep(.damage-value.damage-poison) {
  color: #16a34a;
  background: #dcfce7;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.outcome-text :deep(.damage-value.damage-psychic),
.effect :deep(.damage-value.damage-psychic) {
  color: #be185d;
  background: #fce7f3;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.outcome-text :deep(.damage-value.damage-sonic),
.effect :deep(.damage-value.damage-sonic) {
  color: #8b5cf6;
  background: #f3e8ff;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

/* Untyped damage - just bold, no background */
.outcome-text :deep(.damage-value.damage-generic),
.effect :deep(.damage-value.damage-generic) {
  color: inherit;
}

@media (max-width: 768px) {
  .power-roll {
    padding: 0.75rem;
  }

  .outcome {
    padding: 0.4rem;
  }

  .tier-number {
    min-width: 2.5rem;
    height: 1.25rem;
    font-size: 0.7rem;
    margin-right: 0.5rem;
    padding: 0 0.2rem;
  }
}
</style>