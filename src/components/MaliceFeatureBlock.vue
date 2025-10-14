<template>
    <div class="malice-feature-block">
        <!-- Header -->
        <div class="header">
            <h1 class="malice-name">{{ maliceBlock.name }}</h1>
            <div class="malice-meta">
                <div v-if="maliceBlock.level" class="malice-level">
                    Level {{ maliceBlock.level }}
                </div>
                <div class="malice-type">
                    {{ maliceBlock.featureblockType }}
                </div>

            </div>
        </div>

        <div class="divider"></div>

        <!-- Flavor Text -->
        <div v-if="maliceBlock.flavor" class="flavor-text">
            <p v-html="maliceBlock.flavor"></p>
        </div>

        <div v-if="maliceBlock.flavor" class="divider"></div>

        <!-- Features -->
        <div v-if="maliceBlock.features && maliceBlock.features.length > 0" class="features-section">
            <div class="actions-list">
                <ActionDisplay v-for="(feature, index) in maliceBlock.features" :key="index" :action="feature"
                    @power-roll-click="handlePowerRollClick" />
            </div>
        </div>

        <!-- Source Information -->
        <div v-if="maliceBlock.source" class="source-info">
            <div class="divider"></div>
            <div class="source-text">
                <span v-if="maliceBlock.source.book">{{ maliceBlock.source.book }}</span>
                <span v-if="maliceBlock.source.page">, page {{ maliceBlock.source.page }}</span>
                <span v-if="maliceBlock.source.license"> • {{ maliceBlock.source.license }}</span>
            </div>
        </div>

        <RollResultModal :show="showRollModal" :result="rollResult" :characteristicName="rollName"
            @close="showRollModal = false" @reroll="rerollCurrent" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ActionDisplay from './ActionDisplay.vue'
import RollResultModal from './RollResultModal.vue'
import { rollPowerRoll, parsePowerRollModifier } from '@/utils/diceRoller'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
    maliceBlock: {
        type: Object,
        required: true
    }
})

// Roll modal state
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

// Power roll click handler
const handlePowerRollClick = (feature) => {
    // Get the power roll formula from the feature
    let formula = ''
    if (feature.effects) {
        const rollEffect = feature.effects.find(effect => effect.roll)
        if (rollEffect) formula = rollEffect.roll
    }

    if (!formula) return

    // Parse the formula to get the modifier
    const modifier = parsePowerRollModifier(formula)

    // Store current formula for rerolls
    currentFormula.value = formula

    // Set the roll name (feature name)
    rollName.value = feature.name || 'Power Roll'

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
</script>

<style scoped>
.malice-feature-block {
    background: var(--color-primary-50);
    border: 2px solid var(--color-primary-600);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    font-family: var(--font-family-serif);
    box-shadow: var(--shadow-md);
    max-width: 100%;
}

.header {
    text-align: center;
    margin-bottom: var(--space-4);
}

.malice-name {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary-600);
    margin: 0 0 var(--space-2) 0;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.malice-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
}

.malice-type {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-700);
    margin: 0;
}

.malice-level {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary-700);
    background: var(--color-primary-100);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-primary-200);
}

.divider {
    height: 2px;
    background: linear-gradient(to right, transparent, var(--color-primary-600), transparent);
    margin: var(--space-4) 0;
}

.flavor-text {
    font-size: var(--font-size-base);
    color: var(--color-neutral-800);
    text-align: center;
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-4);
}

.flavor-text p {
    margin: 0;
}

.features-section {
    margin: var(--space-4) 0;
}

.actions-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

/* Feature styling now handled by shared ActionDisplay component */

.source-info {
    margin-top: var(--space-4);
}

.source-text {
    font-size: var(--font-size-xs);
    color: var(--color-neutral-500);
    text-align: center;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .malice-feature-block {
        padding: var(--space-4);
    }

    .malice-name {
        font-size: var(--font-size-2xl);
    }

    .malice-type {
        font-size: var(--font-size-base);
    }

    .malice-level {
        font-size: var(--font-size-sm);
    }

}

@media (max-width: 480px) {
    .malice-feature-block {
        padding: var(--space-3);
    }

    .malice-name {
        font-size: var(--font-size-xl);
        letter-spacing: 0.5px;
    }
}

/* Enhanced styling for malice-specific theming */
.malice-feature-block {
    position: relative;
}

.malice-feature-block::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, var(--color-primary-500), var(--color-primary-700), var(--color-primary-500));
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

/* Ensure proper spacing for nested HTML content */
.feature-effects :deep(p) {
    margin: 0 0 var(--space-2) 0;
}

.feature-effects :deep(p:last-child) {
    margin-bottom: 0;
}

.feature-effects :deep(strong) {
    color: var(--color-primary-700);
}

.effect-description :deep(strong) {
    color: var(--color-primary-700);
}
</style>