<template>
  <div class="actions-list" v-if="sortedActions.length > 0">
    <div v-for="action in sortedActions" :key="action.name || action.id || Math.random()" class="action">
      <!-- Handle all monster actions with unified template -->
      <div class="complex-action">
        <div class="action-header">
          <div class="action-title-row">
            <h4 class="action-name">
              <span v-if="getActionGlyph(action)" :class="getActionGlyph(action)" :aria-label="getActionIconAlt(action)"
                class="glyph-icon action-type-icon"></span>
              <span v-if="action.type === 'feature'" class="glyph-icon glyph-feature action-type-icon"
                aria-label="Feature"></span>
              {{ action.name }}
              <!-- Handle both new and old signature structure -->
              <span v-if="action.ability_type?.includes('Signature') || action.system?.category === 'signature'"
                class="signature-badge">SIGNATURE</span>
              <!-- Handle both new cost format and old resource format -->
              <span v-if="getResourceCost(action)" class="malice-cost">{{ getResourceCost(action) }}</span>
            </h4>
            <div class="action-power-info">
              <span v-if="actionHasPowerRoll(action)" class="action-power-roll">{{
                formatPowerRoll(getPowerRoll(action), chr) }}</span>
              <span class="action-type-badge" v-if="getActionType(action)">
                {{ getActionType(action) }}
              </span>
            </div>
          </div>

          <div class="action-details">
            <div class="action-keywords" v-if="getKeywords(action).length > 0">
              {{ getKeywords(action).join(', ') }}
            </div>
            <div class="action-mechanics">
              <span v-if="getDistance(action)" class="action-distance">
                <span class="glyph-icon glyph-distance icon" aria-label="Distance"></span>
                {{ getDistance(action) }}
              </span>
              <span v-if="getTarget(action)" class="action-target">
                <span class="glyph-icon glyph-target icon" aria-label="Target"></span>
                {{ getTarget(action) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="getActionTrigger(action)" class="action-trigger">
          <strong>Trigger:</strong> {{ getActionTrigger(action) }}
        </div>

        <PowerRoll v-if="actionHasPowerRoll(action)" :tiers="getTiers(action)" :tier1="getTier1(action)"
          :tier2="getTier2(action)" :tier3="getTier3(action)" />

        <!-- Multiple effects for new structure -->
        <div v-if="action.effects && action.effects.length > 0" class="action-effects-list">
          <div v-for="(effect, index) in action.effects" :key="index">
            <!-- Skip the power roll effect and effects with costs (those are handled separately) -->
            <div v-if="!effect.roll && !effect.cost" class="effect-item">
              <div v-if="effect.name || effect.effect" class="effect-content">
                <span v-if="effect.name" class="effect-name"><strong>{{ effect.name }}:</strong></span>
                <span v-if="effect.effect" class="effect-text" v-html="formatDescription(effect.effect)"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fallback for old structure description -->
        <div v-else-if="!actionHasPowerRoll(action) && getActionDescription(action)" class="action-description"
          v-html="formatDescription(getActionDescription(action))"></div>

        <!-- Effect for old structure power-roll abilities (shown after power roll) -->
        <div v-if="!action.effects && getActionEffect(action) && actionHasPowerRoll(action)" class="action-effect-text">
          <strong>Effect:</strong> <span v-html="formatDescription(getActionEffect(action))"></span>
        </div>

        <!-- Effect for old structure non-power-roll abilities -->
        <div v-if="!action.effects && getActionEffect(action) && !actionHasPowerRoll(action)"
          class="action-effect-text">
          <strong>Effect:</strong> <span v-html="formatDescription(getActionEffect(action))"></span>
        </div>

        <!-- Handle spend effects (both new and old structure) -->
        <div v-if="getSpendEffect(action)" class="action-spend">
          <span v-html="getSpendEffect(action)"></span>
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
        // Check for signature status in both structures
        const aIsSignature = a.ability_type?.includes('Signature') || a.system?.category === 'signature';
        const bIsSignature = b.ability_type?.includes('Signature') || b.system?.category === 'signature';

        if (aIsSignature && !bIsSignature) return -1;
        if (!aIsSignature && bIsSignature) return 1;

        // Sort features before abilities
        if (a.type === 'feature' && b.type !== 'feature') return -1;
        if (a.type !== 'feature' && b.type === 'feature') return 1;

        // Sort by resource cost (malice cost)
        const aRes = this.getResourceCostValue(a);
        const bRes = this.getResourceCostValue(b);
        if (aRes == null && bRes == null) return 0;
        if (aRes == null) return 1;
        if (bRes == null) return -1;
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

    // Helper methods to handle both new and old data structures
    getResourceCost(action) {
      // Check for effects with cost field (new structure)
      if (action.effects) {
        const costEffect = action.effects.find(effect => effect.cost);
        if (costEffect) return costEffect.cost;
      }
      // Check for old structure
      return action.system?.resource ? `${action.system.resource} Malice` : null;
    },

    getResourceCostValue(action) {
      // Extract numeric value for sorting
      if (action.effects) {
        const costEffect = action.effects.find(effect => effect.cost);
        if (costEffect) {
          // Extract number from cost string like "2 Malice"
          const match = costEffect.cost.match(/(\d+)/);
          return match ? parseInt(match[1]) : null;
        }
      }
      // Check for old structure
      return action.system?.resource || null;
    },

    getPowerRoll(action) {
      // Check for effects with roll field (new structure)  
      if (action.effects) {
        const rollEffect = action.effects.find(effect => effect.roll);
        if (rollEffect) return rollEffect.roll;
      }
      // Check for old structure
      return action.system?.power?.roll?.formula || '';
    },

    getActionType(action) {
      // Check for new structure fields
      if (action.usage && action.usage !== '-') return action.usage;
      if (action.ability_type?.includes('Villain')) return action.ability_type;
      // Check for old structure
      if (action.system?.type && action.system.type !== 'none') {
        return this.formatActionType(action.system.type);
      }
      return null;
    },

    getKeywords(action) {
      // Check for keywords at top level (new structure) or system level (old structure)
      const keywords = action.keywords || action.system?.keywords || [];
      // Filter out empty strings, '-', and falsy values, then capitalize for display
      return keywords
        .filter(keyword => keyword && keyword !== '-' && keyword.trim() !== '')
        .map(keyword => this.capitalize(keyword));
    },

    capitalize(str) {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    getDistance(action) {
      // Check for direct distance field (new structure)
      if (action.distance) return action.distance;
      // Check for old structure
      return this.formatActionDistance(action.system?.distance);
    },

    getTarget(action) {
      // Check for direct target field (new structure)
      if (action.target) return action.target;
      // Check for old structure  
      return this.formatActionTargets(action.system?.target, this.monster?.organization);
    },

    getTiers(action) {
      // Return old format tiers if they exist
      return action.system?.power?.tiers || [];
    },

    getTier1(action) {
      // Check for new format in effects array
      if (action.effects) {
        const rollEffect = action.effects.find(effect => effect.tier1);
        if (rollEffect) return rollEffect.tier1;
      }
      return '';
    },

    getTier2(action) {
      // Check for new format in effects array
      if (action.effects) {
        const rollEffect = action.effects.find(effect => effect.tier2);
        if (rollEffect) return rollEffect.tier2;
      }
      return '';
    },

    getTier3(action) {
      // Check for new format in effects array
      if (action.effects) {
        const rollEffect = action.effects.find(effect => effect.tier3);
        if (rollEffect) return rollEffect.tier3;
      }
      return '';
    },

    getActionDescription(action) {
      // For features, check effects first, then system description
      if (action.type === 'feature') {
        if (action.effects) {
          const descEffect = action.effects.find(effect => effect.effect);
          if (descEffect) return descEffect.effect;
        }
        return action.system?.description?.value;
      }

      // For abilities without power rolls, check for simple description
      if (action.description) return action.description;
      if (action.effect) return action.effect;

      // Use extractDescription as fallback
      return this.extractDescription(action);
    },

    getActionEffect(action) {
      // Check for effects with just "effect" field (new structure)
      if (action.effects) {
        const effectData = action.effects.find(effect => effect.effect && !effect.roll);
        if (effectData) return effectData.effect;
      }
      // Check for old structure
      return action.system?.effect?.text;
    },

    getActionTrigger(action) {
      // Check for new structure: top-level trigger field  
      if (action.trigger) {
        return action.trigger;
      }
      // Check for old structure
      if (action.system?.type === 'triggered' || action.system?.type === 'freeTriggered') {
        return action.system.trigger || '';
      }
      return '';
    },

    getSpendEffect(action) {
      // Check for effects with costs in new structure
      if (action.effects) {
        const costEffects = action.effects.filter(effect => effect.cost && effect.effect);
        if (costEffects.length > 0) {
          // Format all cost effects into a single HTML string
          return costEffects.map(effect => {
            const costText = `<strong>${effect.cost}:</strong> ${this.formatSpendEffect(effect.effect)}`;
            return costText;
          }).join('<br><br>');
        }
      }

      // Check for old structure
      if (action.system && action.system.spend && action.system.spend.formattedText) {
        return action.system.spend.formattedText;
      }

      return null;
    },

    formatSpendEffect(text) {
      // Apply old formatting style for spend effects with malice costs
      if (!text) return '';

      // Add malice cost emphasis for patterns like "1 Malice", "2 Malice", etc.
      return text.replace(/(\d+)\s+(Malice|malice)/g, '<span class="malice-cost-emphasis">$1 $2</span>');
    },

    formatPowerRoll(formula) {
      // Power roll formulas are now pre-processed in the data pipeline
      return formula || '';
    },
    formatDescription(description) {
      // Text is now pre-processed in the data pipeline, so just return as-is
      return description;
    },
    getActionGlyph(action) {
      // Handle new data structure first
      if (action.usage || action.ability_type) {
        // Check for triggered actions
        if (action.usage && action.usage.toLowerCase().includes('triggered')) {
          return 'glyph-triggered-action';
        }

        // Check for villain actions
        if (action.ability_type && action.ability_type.includes('Villain Action')) {
          return 'glyph-villain-action';
        }
      }

      // Check distance-based icons (new structure)
      if (action.distance) {
        const distance = action.distance.toLowerCase();

        // Self distance
        if (distance.includes('self')) {
          return 'glyph-self';
        }

        // Melee distance
        if (distance.includes('melee') && !distance.includes('ranged')) {
          return 'glyph-melee';
        }

        // Ranged distance
        if (distance.includes('ranged') && !distance.includes('melee')) {
          return 'glyph-ranged';
        }

        // Melee or ranged
        if (distance.includes('melee') && distance.includes('ranged')) {
          return 'glyph-melee-or-ranged';
        }

        // Area effects
        if (distance.includes('burst') || distance.includes('aura')) {
          return 'glyph-burst';
        }

        if (distance.includes('cube') || distance.includes('line') || distance.includes('wall')) {
          return 'glyph-cube-line-wall';
        }

        // Other distance types
        return 'glyph-unique-distance';
      }

      // Fall back to old structure
      if (!action.system) return null;

      // Check for triggered actions first
      if (action.system.type === 'triggered' || action.system.type === 'freeTriggered') {
        return 'glyph-triggered-action';
      }

      // Check for villain actions
      if (action.system.type === 'villain') {
        return 'glyph-villain-action';
      }

      // Check distance-based icons (old structure)
      if (action.system.distance && action.system.distance.type) {
        const distance = action.system.distance.type.toLowerCase();

        // Self distance
        if (distance === 'self') {
          return 'glyph-self';
        }

        // Melee distance
        if (distance.includes('melee') && !distance.includes('ranged')) {
          return 'glyph-melee';
        }

        // Ranged distance
        if (distance.includes('ranged') && !distance.includes('melee')) {
          return 'glyph-ranged';
        }

        // Melee or ranged
        if (distance.includes('melee') && distance.includes('ranged')) {
          return 'glyph-melee-or-ranged';
        }

        // Area effects
        if (distance.includes('burst') || distance.includes('aura')) {
          return 'glyph-burst';
        }

        if (distance.includes('cube') || distance.includes('line') || distance.includes('wall')) {
          return 'glyph-cube-line-wall';
        }

        // Other distance types
        return 'glyph-unique-distance';
      }

      return null;
    },
    getActionIconAlt(action) {
      // Handle new data structure first
      if (action.usage || action.ability_type) {
        if (action.usage && action.usage.toLowerCase().includes('triggered')) {
          return 'Triggered Action';
        }

        if (action.ability_type && action.ability_type.includes('Villain Action')) {
          return 'Villain Action';
        }
      }

      // Check distance for new structure
      if (action.distance) {
        const distance = action.distance.toLowerCase();

        if (distance.includes('self')) {
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

      // Fall back to old structure
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
  font-size: 1.25rem;
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
  font-size: 1rem;
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

.action-spend strong {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-bold);
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

/* Effects list styling */
.action-effects-list {
  margin: var(--space-3) 0;
}

.effect-item {
  margin-bottom: var(--space-2);
}

.effect-item:last-child {
  margin-bottom: 0;
}

.effect-content {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-1);
  color: var(--color-neutral-800);
  line-height: var(--line-height-relaxed);
}

.effect-name {
  color: var(--color-primary-600);
}

.effect-text {
  color: var(--color-neutral-800);
  line-height: var(--line-height-relaxed);
}

.effect-cost {
  color: var(--color-danger-600);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-1);
}
</style>