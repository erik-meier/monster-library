<template>
  <div class="actions-list">
    <div v-for="action in sortedActions" :key="action.name" class="action">
      <div class="action-header">
        <h4 class="action-name">
          {{ action.name }}{{ action.system.resource ? ` - ${action.system.resource} Malice` : '' }}
          <span v-if="actionHasPowerRoll(action)" class="action-power-roll">{{ formatPowerRoll(action.system.power.roll.formula, chr) }}</span>
        </h4>
        <span v-if="action.system.category === 'signature'" class="action-signature">Signature Ability</span>
        <span class="action-type-header" v-if="action.system.type">
          {{ formatActionType(action.system.type) }}
        </span>
      </div>

      <div class="action-meta">
        <div class="action-meta-left" v-if="action.system.keywords">
          {{ action.system.keywords.join(', ') }}
        </div>
        <div class="action-meta-right">
          <span v-if="formatActionDistance(action.system.distance)" class="action-distance">{{ formatActionDistance(action.system.distance) }}</span>
          <span v-if="formatActionTargets(action.system.target)" class="action-target">{{ formatActionTargets(action.system.target) }}</span>
        </div>
      </div>

      <div v-if="action.system.type == 'triggered'" class="action-trigger">
        <strong>Trigger:</strong> {{ action.system.trigger }}
      </div>

      <PowerRoll v-if="actionHasPowerRoll(action)" :effects="action.system.power.effects" :chr="chr" />
      <div class="action-description" v-html="extractDescription(action)"></div>
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
    }
  },
  computed: {
    sortedActions() {
      return this.actions.slice().sort((a, b) => {
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
      if (action.system.description && action.system.description.value) {
        return action.system.description.value;
      }
      if (action.system.effect) {
        return action.system.effect.before || action.system.effect.after;
      }
      return ''
    },
    formatActionDistance(distance) {
      if (!distance) return '';
      if (distance.type === 'melee' || distance.type === 'ranged') {
        return `${distance.type.charAt(0).toUpperCase() + distance.type.slice(1)} ${distance.primary}`;
      }
      if (distance.type === 'line') {
        return `${distance.primary} x ${distance.secondary} line within ${distance.tertiary}`
      }
      if (distance.type === 'cube' || distance.type === 'wall') {
        return `${distance.primary} ${distance.type} within ${distance.secondary}`
      }
      return ''
    },
    formatActionTargets(target) {
      if (!target) return '';
      if (target.type === 'creature') {
        return `${target.value} creature${target.value > 1 ? 's' : ''}`;
      } else if (target.type === 'creatureObject') {
        return `${target.value ? target.value : 'Each'} creature${target.value > 1 ? 's' : ''} or object${target.value > 1 ? 's' : ''}`;
      }
    },
    formatActionType(type) {
      if (!type) return '';
      if (type.toLowerCase() === 'none') return '';
      if (type.toLowerCase() === 'maneuver') return type;
      return type + ' action';
    },
    formatPowerRoll(formula, chr) {
      if (!formula) return '';
      if (formula === '@chr') {
        return '2d10 + ' + chr;
      }
    },
    actionHasPowerRoll(action) {
      if(action.system.power && action.system.power.effects) {
        for (const [_, effect] of Object.entries(action.system.power.effects)) {
          if(effect.type === 'damage') {
            return true
          }
        }
      }
      return false
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.action-name {
  font-weight: bold;
  color: #8b4513;
  font-size: 1rem;
  margin: 0;
}

.action-power-roll {
  font-weight: bold;
  color: #495057;
  margin-left: 0.5rem;
}

.action-type-header {
  font-size: 0.9rem;
  color: #6c757d;
  text-transform: capitalize;
}

.action-signature {
  font-size: 0.9rem;
  color: #28a745;
  font-weight: bold;
  margin-left: 0.5rem;
}

.action-meta {
  margin-bottom: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
}

.action-meta-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-meta-right {
  display: flex;
  gap: 1rem;
}

.action-distance {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.action-target {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
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

.action-description :deep(em) {
  font-style: italic;
}

.action-description :deep(strong) {
  font-weight: bold;
}

.action-description :deep(br) {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.1rem;
  }

  .action-name {
    font-size: 0.95rem;
  }

  .action-description {
    font-size: 0.9rem;
  }
}
</style>