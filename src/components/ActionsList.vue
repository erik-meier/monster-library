<template>
  <div class="actions-list" v-if="sortedActions.length > 0">
    <ActionDisplay v-for="action in sortedActions" :key="action.name || action.id || Math.random()" :action="action"
      :monster="monster" @power-roll-click="handlePowerRollClick" />
  </div>

  <RollResultModal :show="showRollModal" :result="rollResult" :characteristicName="rollName"
    @close="showRollModal = false" @reroll="rerollCurrent" />
</template>

<script>
import { ref } from 'vue'
import ActionDisplay from './ActionDisplay.vue'
import RollResultModal from './RollResultModal.vue'
import { rollPowerRoll, parsePowerRollModifier } from '@/utils/diceRoller'

export default {
  name: 'ActionsList',
  components: {
    ActionDisplay,
    RollResultModal,
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
  setup() {
    const showRollModal = ref(false)
    const rollResult = ref({
      roll1: 1,
      roll2: 1,
      total: 2,
      modifier: 0,
      tier: 1
    })
    const rollName = ref('')
    const currentFormula = ref('')

    const handlePowerRollClick = (action) => {
      // Get the power roll formula
      let formula = ''
      if (action.effects) {
        const rollEffect = action.effects.find(effect => effect.roll)
        if (rollEffect) formula = rollEffect.roll
      } else {
        formula = action.system?.power?.roll?.formula || ''
      }

      if (!formula) return

      // Parse the formula to get the modifier
      const modifier = parsePowerRollModifier(formula)

      // Store current formula for rerolls
      currentFormula.value = formula

      // Set the roll name (action name)
      rollName.value = action.name || 'Power Roll'

      // Perform the roll
      rollResult.value = rollPowerRoll(modifier)
      showRollModal.value = true
    }

    const rerollCurrent = () => {
      if (currentFormula.value) {
        const modifier = parsePowerRollModifier(currentFormula.value)
        rollResult.value = rollPowerRoll(modifier)
      }
    }

    return {
      showRollModal,
      rollResult,
      rollName,
      handlePowerRollClick,
      rerollCurrent
    }
  },
  methods: {
    // Helper method for sorting - extract resource cost value
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
</style>