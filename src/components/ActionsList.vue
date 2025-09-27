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
              {{ action.name }}
              <span v-if="action.type === 'feature'" class="feature-badge">★</span>
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
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z" />
                </svg>
                Range: {{ formatActionDistance(action.system.distance) }}
              </span>
              <span v-if="formatActionTargets(action.system.target)" class="action-target">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                Target: {{ formatActionTargets(action.system.target) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="action.system.type == 'triggered'" class="action-trigger">
          <strong>Trigger:</strong> {{ action.system.trigger }}
        </div>

        <div v-if="action.system.type == 'triggered' || action.system.type == 'freeTriggered'" class="action-trigger">
          <strong>Trigger:</strong> {{ action.system.trigger }}
        </div>

        <PowerRoll v-if="actionHasPowerRoll(action)" :tiers="action.system.power.tiers || []"
          :effect="formatActionEffect(action)" />
        <div v-if="!actionHasPowerRoll(action)" class="action-description"
          v-html="formatDescription(extractDescription(action))"></div>

        <div v-if="action.system.spend && action.system.spend.formattedText" class="action-spend">
          <span v-html="action.system.spend.formattedText"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PowerRoll from './PowerRoll.vue'

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
    extractDescription(action) {
      if (!action.system) return action.description || action.effect || '';
      if (action.system.description && action.system.description.value) {
        return action.system.description.value;
      }
      if (action.system.effect) {
        return action.system.effect.before || action.system.effect.after;
      }
      return ''
    },
    formatActionEffect(action) {
      // For the new flattened structure, effects are usually handled in tier display text
      // Only return effect text if it's different from tier display
      if (action.system.effect) {
        return action.system.effect.before || action.system.effect.after || '';
      }
      return '';
    },
    formatActionDistance(distance) {
      if (!distance) return '';
      if (distance.type === 'melee' || distance.type === 'ranged') {
        return `${distance.type.charAt(0).toUpperCase() + distance.type.slice(1)} ${distance.primary}`;
      }
      if (distance.type === 'meleeRanged') {
        return `Melee ${distance.primary} or ranged ${distance.secondary}`;
      }
      if (distance.type === 'line') {
        return `${distance.primary} x ${distance.secondary} line within ${distance.tertiary}`
      }
      if (distance.type === 'cube' || distance.type === 'wall') {
        return `${distance.primary} ${distance.type} within ${distance.secondary}`
      }
      if (distance.type === 'burst') {
        return `${distance.primary} burst`
      }
      return ''
    },
    formatActionTargets(target) {
      if (!target) return '';
      if (target.type === 'creature') {
        return `${target.value ? target.value : 'Each'} creature${target.value > 1 ? 's' : ''}`;
      } else if (target.type === 'creatureObject') {
        return `${target.value ? target.value : 'Each'} creature${target.value && target.value > 1 ? 's' : ''} or object${target.value && target.value > 1 ? 's' : ''}`;
      } else if (target.type === 'enemy') {
        return `${target.value ? target.value : 'Each'} ${target.value && target.value > 1 ? 'enemies' : 'enemy'}`;
      }
      else if (target.type === 'ally') {
        return `${target.value ? target.value : 'Each'} ${target.value && target.value > 1 ? 'allies' : 'ally'}`;
      } else if (target.type === 'selfAlly') {
        return 'Self and ' + `${target.value ? target.value : 'each'} ${target.value && target.value > 1 ? 'allies' : 'ally'}`;
      }
      return target.type
    },
    formatActionType(type) {
      if (!type) return '';
      if (type.toLowerCase() === 'none') return '';
      if (type.toLowerCase() === 'maneuver') return type;
      if (type.toLowerCase() === 'freetriggered') type = 'free triggered';
      return type + ' action';
    },
    formatPowerRoll(formula) {
      // Power roll formulas are now pre-processed in the data pipeline
      return formula || '';
    },
    actionHasPowerRoll(action) {
      // Check for tiers array in the new flattened structure
      if (action.system.power && action.system.power.tiers && action.system.power.tiers.length > 0) {
        return true;
      }

      // Fallback check for old effects structure (if any remain)
      if (action.system.power && action.system.power.effects) {
        for (const effect of Object.values(action.system.power.effects)) {
          if (effect.type === 'damage') {
            return true
          }
        }
      }
      return false
    },
    formatDescription(description) {
      // Text is now pre-processed in the data pipeline, so just return as-is
      return description;
    }
  }
}
</script>

<style scoped>
.actions-section {
  margin: 1rem 0;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #8b4513;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #8b4513;
  padding-bottom: 0.25rem;
}

.legendary-description {
  font-style: italic;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.9rem;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action {
  margin-bottom: 1.5rem;
}

.action-header {
  margin-bottom: 0.75rem;
}

.action-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.action-name {
  font-weight: bold;
  color: #8b4513;
  font-size: 1.1rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.feature-badge {
  color: #f59e0b;
  font-size: 1.2rem;
  font-weight: normal;
  text-shadow: 0 0 2px rgba(245, 158, 11, 0.3);
}

.signature-badge {
  background: #dc2626;
  color: white;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.malice-cost {
  background: #7c2d12;
  color: white;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: normal;
}

.action-power-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-power-roll {
  font-weight: bold;
  color: #495057;
  background: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.action-type-badge {
  background: #6c757d;
  color: white;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.action-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.action-keywords {
  font-style: italic;
  color: #6c757d;
  font-size: 0.9rem;
}

.action-mechanics {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-distance,
.action-target {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #495057;
}

.icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.action-trigger {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  font-size: 0.9rem;
}

.action-description {
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.action-spend {
  margin: 0.75rem 0;
  padding: 0.5rem;
  background: #f8fafc;
  border-left: 4px solid #0284c7;
  font-size: 0.9rem;
  border-radius: 4px;
}

.action-spend span {
  color: #0f172a;
  font-weight: 400;
}

.action-spend :deep(.malice-cost-emphasis) {
  color: #0284c7;
  font-weight: bold;
  font-size: 1rem;
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
  font-weight: bold;
  color: #2563eb;
  background: #dbeafe;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

/* Damage type styling */
.action-description :deep(.damage-value) {
  font-weight: bold;
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
    font-size: 1.1rem;
  }

  .action-title-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-name {
    font-size: 1rem;
  }

  .action-power-info {
    align-self: flex-start;
  }

  .action-mechanics {
    flex-direction: column;
    gap: 0.3rem;
  }

  .action-distance,
  .action-target {
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
  }

  .action-description {
    font-size: 0.9rem;
  }
}
</style>