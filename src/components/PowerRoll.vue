<template>
  <div class="power-roll">
    <div v-if="tiers && tiers.length > 0" class="outcomes">
      <div v-for="tierData in tiers" :key="tierData.tier" class="outcome" :class="`tier-${tierData.tier}`">
        <span class="tier-number">{{ formatTierNumber(tierData.tier) }}</span>
        <span class="outcome-text" v-html="tierData.display"></span>
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
    tiers: {
      type: Array,
      default: () => []
    },
    effect: {
      type: String,
      default: ''
    }
  },
  methods: {
    formatTierNumber(tier) {
      const tierMap = { 1: '<=11', 2: '12-16', 3: '17+' }
      return tierMap[tier] || tier
    }
  }
}
</script>

<style scoped>
.power-roll {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
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