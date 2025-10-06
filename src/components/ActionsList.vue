<template>
  <div class="actions-list" v-if="sortedActions.length > 0">
    <div v-for="action in sortedActions" :key="action.name || action.id || Math.random()" class="action">
      <!-- Handle custom monster actions (simple structure) -->
      <div v-if="!action.system" class="simple-action">
        <h4 class="action-name">{{ action.name || action.title || 'Unnamed Action' }}</h4>
        <div class="action-description" v-if="action.description">{{ action.description }}</div>
        <div class="action-description" v-else-if="action.effect">{{ action.effect }}</div>
      </div>

      <!-- Handle official monster actions (complex structure) -->
      <div v-else class="complex-action">
        <div class="action-header">
          <div class="action-title-row">
            <h4 class="action-name">
              <img v-if="getActionIcon(action)" :src="getActionIcon(action)" :alt="getActionIconAlt(action)"
                class="action-type-icon" />
              <span v-if="action.type === 'feature'" class="feature-badge">★</span>
              {{ action.name }}
              <span v-if="action.system.category === 'signature'" class="signature-badge">SIGNATURE</span>
              <span v-if="action.system.resource" class="malice-cost">{{ action.system.resource }} Malice</span>
            </h4>
            <div class="action-power-info">
              <span v-if="actionHasPowerRoll(action)" class="action-power-roll">{{
                formatPowerRoll(action.system.power.roll.formula, chr) }}</span>
              <span class="action-type-badge" v-if="action.system.type && action.system.type !== 'none'">
                {{ formatActionType(action.system.type) }}
              </span>
            </div>
          </div>

          <div class="action-details">
            <div class="action-keywords" v-if="action.system.keywords && action.system.keywords.length">
              {{ action.system.keywords.join(', ') }}
            </div>
            <div class="action-mechanics">
              <span v-if="formatActionDistance(action.system.distance)" class="action-distance">
                <img src="/assets/distance.svg" alt="Distance" class="icon" />
                {{ formatActionDistance(action.system.distance) }}
              </span>
              <span v-if="formatActionTargets(action.system.target, monster?.organization)" class="action-target">
                <img src="/assets/target.svg" alt="Target" class="icon" />
                {{ formatActionTargets(action.system.target, monster?.organization) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="action.system.type == 'triggered' || action.system.type == 'freeTriggered'" class="action-trigger">
          <strong>Trigger:</strong> {{ action.system.trigger }}
        </div>

        <PowerRoll v-if="actionHasPowerRoll(action)" :tiers="action.system.power.tiers || []" />
        <div v-if="!actionHasPowerRoll(action)" class="action-description"
          v-html="formatDescription(extractDescription(action))"></div>

        <div v-if="action.system.effect && action.system.effect.text && actionHasPowerRoll(action)"
          class="action-effect-text">
          <strong>Effect:</strong> <span v-html="formatDescription(action.system.effect.text)"></span>
        </div>

        <div v-if="action.system.spend && action.system.spend.formattedText" class="action-spend">
          <span v-html="action.system.spend.formattedText"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PowerRoll from './PowerRoll.vue'
import {
  formatActionDistance,
  formatActionTargets,
  formatActionType,
  actionHasPowerRoll,
  extractDescription
} from '@/utils/formatters'

export default {
  name: 'ActionsList',
  components: {
    PowerRoll,
  },
  props: {
    title: {
      type: String,
      required: true
    },
    actions: {
      type: Array,
      required: true
    },
    chr: {
      type: String,
      required: true
    },
    monster: {
      type: Object,
      required: false
    }
  },
  computed: {
    sortedActions() {
      if (!this.actions || this.actions.length === 0) return [];

      return this.actions.slice().sort((a, b) => {
        // Handle simple custom monster actions that don't have system property
        if (!a.system && !b.system) return 0;
        if (!a.system) return 1;
        if (!b.system) return -1;

        if (a.system.category === 'signature' && b.system.category !== 'signature') return -1;
        if (a.system.category !== 'signature' && b.system.category === 'signature') return 1;

        if (a.type === 'ability' && b.type !== 'ability') return -1;
        if (a.type !== 'ability' && b.type === 'ability') return 1;

        const aRes = a.system.resource;
        const bRes = b.system.resource;
        if (aRes == null && bRes == null) return 0;
        if (aRes == null) return -1;
        if (bRes == null) return 1;
        return aRes - bRes;
      });
    }
  },
  methods: {
    // Use imported formatters from shared utilities
    extractDescription,
    formatActionDistance,
    formatActionTargets,
    formatActionType,
    actionHasPowerRoll,
    formatPowerRoll(formula) {
      // Power roll formulas are now pre-processed in the data pipeline
      return formula || '';
    },
    formatDescription(description) {
      // Text is now pre-processed in the data pipeline, so just return as-is
      return description;
    },
    getActionIcon(action) {
      if (!action.system) return null;

      // Check for triggered actions first
      if (action.system.type === 'triggered' || action.system.type === 'freeTriggered') {
        return '/assets/triggered-action.svg';
      }

      // Check for villain actions
      if (action.system.type === 'villain') {
        return '/assets/villain-action.svg';
      }

      // Check distance-based icons
      if (action.system.distance && action.system.distance.type) {
        const distance = action.system.distance.type.toLowerCase();

        // Self distance
        if (distance === 'self') {
          return '/assets/self.svg';
        }

        // Melee or ranged
        if (distance.includes('melee') || distance.includes('ranged')) {
          return '/assets/melee-or-ranged.svg';
        }

        // Area effects
        if (distance.includes('burst') || distance.includes('aura')) {
          return '/assets/burst-aura.svg';
        }

        if (distance.includes('cube') || distance.includes('line') || distance.includes('wall')) {
          return '/assets/cube-line-wall.svg';
        }

        // Other distance types
        return '/assets/unique-distance.svg';
      }

      return null;
    },
    getActionIconAlt(action) {
      if (!action.system) return '';

      if (action.system.type === 'triggered' || action.system.type === 'freeTriggered') {
        return 'Triggered Action';
      }

      if (action.system.type === 'villain') {
        return 'Villain Action';
      }

      if (action.system.distance && action.system.distance.type) {
        const distance = action.system.distance.type;

        if (distance === 'self') {
          return 'Self';
        }

        if (distance.includes('melee') && distance.includes('ranged')) {
          return 'Melee or Ranged';
        }

        if (distance.includes('burst') || distance.includes('aura')) {
          return 'Burst or Aura';
        }

        if (distance.includes('cube') || distance.includes('line') || distance.includes('wall')) {
          return 'Area Effect';
        }

        return 'Distance Effect';
      }

      return 'Action';
    }
  }
}
</script>

<style scoped>
.actions-section {
  margin: 1rem 0;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  margin: 0 0 var(--space-4) 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--color-primary-600);
  padding-bottom: var(--space-1);
}

.legendary-description {
  font-style: italic;
  color: var(--color-neutral-600);
  margin-bottom: var(--space-4);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-sm);
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.action {
  margin-bottom: var(--space-3);
}

.action-header {
  margin-bottom: var(--space-3);
}

.action-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.action-name {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  font-size: var(--font-size-lg);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.action-type-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  opacity: 0.8;
}

.feature-badge {
  color: var(--color-warning-500);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-normal);
  text-shadow: 0 0 2px var(--color-warning-200);
}

.signature-badge {
  background: var(--color-danger-600);
  color: var(--color-neutral-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.5px;
}

.malice-cost {
  background: var(--color-primary-700);
  color: var(--color-neutral-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
}

.action-power-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.action-power-roll {
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-700);
  background: var(--color-neutral-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.action-type-badge {
  background: var(--color-neutral-600);
  color: var(--color-neutral-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  text-transform: capitalize;
}

.action-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.action-keywords {
  font-style: italic;
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
}

.action-mechanics {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.action-distance,
.action-target {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
}

.icon {
  width: 18px;
  height: 18px;
  opacity: 1;
}

.action-trigger {
  margin-bottom: var(--space-2);
  padding: var(--space-3);
  background: var(--color-warning-50);
  border-left: 4px solid var(--color-warning-500);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  color: var(--color-neutral-900);
  line-height: var(--line-height-relaxed);
}

.action-description {
  margin: 0;
  color: var(--color-neutral-800);
  line-height: var(--line-height-relaxed);
}

.action-effect-text {
  margin: var(--space-2) 0;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--color-neutral-900);
  line-height: var(--line-height-relaxed);
}

.action-effect-text strong {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-semibold);
}

.action-effect-text :deep(.potency-value) {
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-800);
  background: transparent;
  padding: var(--space-1) var(--space-1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.action-spend {
  margin: var(--space-3) 0;
  padding: var(--space-3);
  background: var(--color-primary-50);
  border-left: 4px solid var(--color-primary-500);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
}

.action-spend span {
  color: var(--color-neutral-900);
  font-weight: var(--font-weight-normal);
}

.action-spend :deep(.malice-cost-emphasis) {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
}

.action-spend :deep(.potency-value) {
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-800);
  background: transparent;
  padding: var(--space-1) var(--space-1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.action-description :deep(em) {
  font-style: italic;
}

.action-description :deep(strong) {
  font-weight: bold;
}

.action-description :deep(br) {
  margin-bottom: 0.5rem;
}

/* Potency value styling */
.action-description :deep(.potency-value) {
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-800);
  background: transparent;
  padding: var(--space-1) var(--space-1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

/* Damage type styling */
.action-description :deep(.damage-value) {
  font-weight: var(--font-weight-bold);
  font-size: 0.9rem;
}

/* Specific damage type colors */
.action-description :deep(.damage-value.damage-acid) {
  color: #059669;
  background: #d1fae5;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.action-description :deep(.damage-value.damage-cold) {
  color: #0891b2;
  background: #cffafe;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.action-description :deep(.damage-value.damage-corruption) {
  color: #7c2d12;
  background: #fef3c7;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.action-description :deep(.damage-value.damage-fire) {
  color: #dc2626;
  background: #fee2e2;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.action-description :deep(.damage-value.damage-holy) {
  color: #ca8a04;
  background: #fef9c3;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.action-description :deep(.damage-value.damage-lightning) {
  color: #7c3aed;
  background: #ede9fe;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.action-description :deep(.damage-value.damage-poison) {
  color: #16a34a;
  background: #dcfce7;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.action-description :deep(.damage-value.damage-psychic) {
  color: #be185d;
  background: #fce7f3;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.action-description :deep(.damage-value.damage-sonic) {
  color: #8b5cf6;
  background: #f3e8ff;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

/* Untyped damage - just bold, no background */
.action-description :deep(.damage-value.damage-generic) {
  color: inherit;
}

/* UUID reference styling */
.action-description :deep(.monster-link) {
  color: #8b4513;
  text-decoration: underline;
  font-weight: 500;
}

.action-description :deep(.monster-link:hover) {
  color: #a0522d;
  text-decoration: none;
}

.action-description :deep(.reference-text) {
  font-style: italic;
  color: #6c757d;
}

@media (max-width: 768px) {
  .section-title {
    font-size: var(--font-size-lg);
  }

  .action-title-row {
    flex-direction: column;
    gap: var(--space-2);
  }

  .action-name {
    font-size: var(--font-size-base);
  }

  .action-power-info {
    align-self: flex-start;
  }

  .action-mechanics {
    flex-direction: column;
    gap: var(--space-1);
  }

  .action-distance,
  .action-target {
    font-size: var(--font-size-sm);
    padding: var(--space-1) var(--space-2);
  }

  .action-description {
    font-size: var(--font-size-sm);
  }
}
</style>