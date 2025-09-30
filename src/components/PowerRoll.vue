<template>
  <div class="power-roll">
    <div v-if="tiers && tiers.length > 0" class="outcomes">
      <div v-for="tierData in tiers" :key="tierData.tier" class="outcome" :class="`tier-${tierData.tier}`">
        <span class="tier-number">{{ formatTierNumber(tierData.tier) }}</span>
        <span class="outcome-text" v-html="tierData.display"></span>
      </div>
    </div>

    <div v-if="effect">
      <strong>Effect:</strong><span class="effect-text" v-html="effect"></span>
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
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin: var(--space-2) 0;
}

.outcome {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-base);
  border-left: 4px solid;
}

.outcome.tier-1 {
  background: var(--color-error-50);
  border-left-color: var(--color-error-600);
}

.outcome.tier-2 {
  background: var(--color-warning-50);
  border-left-color: var(--color-warning-600);
}

.outcome.tier-3 {
  background: var(--color-success-50);
  border-left-color: var(--color-success-600);
}

.tier-number {
  background: white;
  color: var(--color-neutral-700);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  min-width: 3rem;
  height: 1.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-3);
  flex-shrink: 0;
  border: 2px solid;
  padding: 0 var(--space-1);
}

.tier-1 .tier-number {
  border-color: var(--color-error-600);
  color: var(--color-error-600);
}

.tier-2 .tier-number {
  border-color: var(--color-warning-600);
  color: var(--color-warning-600);
}

.tier-3 .tier-number {
  border-color: var(--color-success-600);
  color: var(--color-success-600);
}

.outcome-text {
  flex: 1;
  line-height: var(--line-height-snug);
  color: var(--color-neutral-800);
}

.effect-text {
  color: var(--color-neutral-800);
  line-height: var(--line-height-snug);
  margin-top: var(--space-2);
}

/* Handle HTML formatting in descriptions */
.outcome-text :deep(strong),
.effect-text :deep(strong) {
  font-weight: var(--font-weight-bold);
}

.outcome-text :deep(em),
.effect-text :deep(em) {
  font-style: italic;
}

.outcome-text :deep(br),
.effect-text :deep(br) {
  margin-bottom: var(--space-1);
}

/* Potency value styling */
.outcome-text :deep(.potency-value),
.effect-text :deep(.potency-value) {
  font-weight: var(--font-weight-bold);
  color: #2563eb;
  background: #dbeafe;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

/* Damage type styling */
.outcome-text :deep(.damage-value),
.effect-text :deep(.damage-value) {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

/* Specific damage type colors */
.outcome-text :deep(.damage-value.damage-acid),
.effect-text :deep(.damage-value.damage-acid) {
  color: #059669;
  background: #d1fae5;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.outcome-text :deep(.damage-value.damage-cold),
.effect-text :deep(.damage-value.damage-cold) {
  color: #0891b2;
  background: #cffafe;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.outcome-text :deep(.damage-value.damage-corruption),
.effect-text :deep(.damage-value.damage-corruption) {
  color: #7c2d12;
  background: #fef3c7;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.outcome-text :deep(.damage-value.damage-fire),
.effect-text :deep(.damage-value.damage-fire) {
  color: #dc2626;
  background: #fee2e2;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.outcome-text :deep(.damage-value.damage-holy),
.effect-text :deep(.damage-value.damage-holy) {
  color: #ca8a04;
  background: #fef9c3;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.outcome-text :deep(.damage-value.damage-lightning),
.effect-text :deep(.damage-value.damage-lightning) {
  color: #7c3aed;
  background: #ede9fe;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.outcome-text :deep(.damage-value.damage-poison),
.effect-text :deep(.damage-value.damage-poison) {
  color: #16a34a;
  background: #dcfce7;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.outcome-text :deep(.damage-value.damage-psychic),
.effect-text :deep(.damage-value.damage-psychic) {
  color: #be185d;
  background: #fce7f3;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.outcome-text :deep(.damage-value.damage-sonic),
.effect-text :deep(.damage-value.damage-sonic) {
  color: #8b5cf6;
  background: #f3e8ff;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

/* Untyped damage - just bold, no background */
.outcome-text :deep(.damage-value.damage-generic),
.effect-text :deep(.damage-value.damage-generic) {
  color: inherit;
}

@media (max-width: 768px) {
  .power-roll {
    padding: var(--space-3);
  }

  .outcome {
    padding: var(--space-2);
  }

  .tier-number {
    min-width: 2.5rem;
    height: 1.25rem;
    font-size: var(--font-size-xs);
    margin-right: var(--space-2);
    padding: 0 var(--space-1);
  }
}
</style>