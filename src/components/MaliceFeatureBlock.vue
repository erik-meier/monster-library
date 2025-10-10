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
            <div v-for="(feature, index) in maliceBlock.features" :key="index" class="feature">
                <div class="feature-header">
                    <h3 class="feature-name">{{ feature.name }}</h3>
                    <span v-if="feature.cost" class="feature-cost">{{ feature.cost }}</span>
                </div>

                <div v-if="feature.effects" class="feature-effects">
                    <div v-for="(effect, effectIndex) in feature.effects" :key="effectIndex" class="effect">
                        <div v-if="effect.effect" class="effect-description" v-html="formatEffectText(effect.effect)">
                        </div>

                        <!-- Tier effects for tests -->
                        <div v-if="effect.tier1 || effect.tier2 || effect.tier3" class="tier-effects">
                            <div v-if="effect.tier1" class="tier-outcome tier-1">
                                <span class="tier-number">
                                    <span class="glyph-icon glyph-tier-1" aria-label="Tier 1"></span>
                                </span>
                                <span class="tier-text" v-html="formatEffectText(effect.tier1)"></span>
                            </div>
                            <div v-if="effect.tier2" class="tier-outcome tier-2">
                                <span class="tier-number">
                                    <span class="glyph-icon glyph-tier-2" aria-label="Tier 2"></span>
                                </span>
                                <span class="tier-text" v-html="formatEffectText(effect.tier2)"></span>
                            </div>
                            <div v-if="effect.tier3" class="tier-outcome tier-3">
                                <span class="tier-number">
                                    <span class="glyph-icon glyph-tier-3" aria-label="Tier 3"></span>
                                </span>
                                <span class="tier-text" v-html="formatEffectText(effect.tier3)"></span>
                            </div>
                        </div>
                    </div>
                </div>
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
    </div>
</template>

<script>
export default {
    name: 'MaliceFeatureBlock',
    props: {
        maliceBlock: {
            type: Object,
            required: true
        }
    },
    methods: {
        formatEffectText(text) {
            if (!text) return ''

            // Basic text formatting - could be expanded with more sophisticated processing
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold** text
                .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic* text
        }
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

.feature {
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    background: var(--color-neutral-50);
}

.feature:last-child {
    margin-bottom: 0;
}

.feature-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
    flex-wrap: wrap;
    gap: var(--space-2);
}

.feature-name {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary-600);
    margin: 0;
    flex: 1;
}

.feature-cost {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-error-700);
    background: var(--color-error-50);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-error-200);
}

.feature-effects {
    color: var(--color-neutral-800);
    line-height: var(--line-height-relaxed);
}

.effect {
    margin-bottom: var(--space-3);
}

.effect:last-child {
    margin-bottom: 0;
}

.effect-description {
    margin-bottom: var(--space-2);
}

.tier-effects {
    background: var(--color-neutral-50);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    padding: var(--space-2);
    margin: var(--space-2) 0;
}

.tier-outcome {
    display: flex;
    align-items: flex-start;
    margin-bottom: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-base);
    border-left: 4px solid;
}

.tier-outcome:last-child {
    margin-bottom: 0;
}

.tier-outcome.tier-1 {
    background: var(--color-error-50);
    border-left-color: var(--color-error-600);
}

.tier-outcome.tier-2 {
    background: var(--color-warning-50);
    border-left-color: var(--color-warning-600);
}

.tier-outcome.tier-3 {
    background: var(--color-success-50);
    border-left-color: var(--color-success-600);
}

.tier-number {
    background: white;
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-xs);
    min-width: 3rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--space-3);
    flex-shrink: 0;
    padding: 0 var(--space-1);
}

.tier-1 .tier-number {
    border-color: var(--color-error-600);
    color: var(--color-neutral-800);
    background: var(--color-error-50);
}

.tier-2 .tier-number {
    border-color: var(--color-warning-600);
    color: var(--color-neutral-800);
    background: var(--color-warning-50);
}

.tier-3 .tier-number {
    border-color: var(--color-success-600);
    color: var(--color-neutral-800);
    background: var(--color-success-50);
}

.tier-number {
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tier-text {
    flex: 1;
    line-height: var(--line-height-snug);
    color: var(--color-neutral-800);
    transform: translateY(1px);
}

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

    .feature {
        padding: var(--space-3);
    }

    .feature-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
    }

    .feature-name {
        font-size: var(--font-size-lg);
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

    .feature {
        padding: var(--space-2);
    }

    .feature-name {
        font-size: var(--font-size-base);
    }

    .tier-effects {
        padding: var(--space-3);
    }

    .tier-outcome {
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