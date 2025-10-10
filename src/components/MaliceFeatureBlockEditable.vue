<template>
    <div class="malice-feature-block" :class="{ 'edit-mode': editMode }">
        <!-- Header -->
        <div class="header">
            <template v-if="editMode">
                <input v-model="editableData.name" @input="debouncedUpdateField" class="malice-name-edit"
                    placeholder="Malice Feature Name" />
                <input v-model="editableData.featureblockType" @input="debouncedUpdateField" class="malice-type-edit"
                    placeholder="Feature Block Type" />
            </template>
            <template v-else>
                <h1 class="malice-name">{{ maliceBlock.name }}</h1>
                <div class="malice-meta">
                    <div v-if="maliceBlock.level" class="malice-level">
                        Level {{ maliceBlock.level }}
                    </div>
                </div>
            </template>
        </div>

        <div class="divider"></div>

        <!-- Flavor Text -->
        <div class="flavor-section">
            <template v-if="editMode">
                <label class="flavor-label">Flavor Text:</label>
                <textarea v-model="editableData.flavor" @input="debouncedUpdateField" class="flavor-edit"
                    placeholder="Enter flavor text describing when and how these features are used..."
                    rows="3"></textarea>
            </template>
            <template v-else-if="maliceBlock.flavor">
                <div class="flavor-text">
                    <p v-html="maliceBlock.flavor"></p>
                </div>
            </template>
        </div>

        <div v-if="editableData.flavor || maliceBlock.flavor" class="divider"></div>

        <!-- Features -->
        <div class="features-section">
            <template v-if="editMode">
                <div class="features-edit-header">
                    <h3>Malice Features</h3>
                    <button @click="addFeature" class="btn btn-outline btn-add-small">
                        + Add Feature
                    </button>
                </div>

                <div v-if="editableData.features && editableData.features.length > 0" class="features-list-edit">
                    <div v-for="(feature, index) in editableData.features" :key="index" class="feature-edit-item">
                        <div class="feature-edit-header">
                            <div class="feature-edit-name">
                                <input v-model="feature.name" @input="debouncedUpdateField" class="feature-name-input"
                                    placeholder="Feature Name" />
                            </div>
                            <div class="feature-edit-actions">
                                <button @click="removeFeature(index)" class="btn-remove-small">×</button>
                            </div>
                        </div>

                        <div class="feature-cost-edit">
                            <label>Cost:</label>
                            <input v-model="feature.cost" @input="debouncedUpdateField" class="feature-cost-input"
                                placeholder="e.g., 3 Malice" />
                        </div>

                        <div class="feature-effects-edit">
                            <label>Effects:</label>
                            <div v-if="feature.effects && feature.effects.length > 0">
                                <div v-for="(effect, effectIndex) in feature.effects" :key="effectIndex"
                                    class="effect-edit">
                                    <textarea v-model="effect.effect" @input="debouncedUpdateField"
                                        class="effect-description-edit" placeholder="Describe the effect..."
                                        rows="2"></textarea>

                                    <!-- Tier effects for tests -->
                                    <div v-if="showTierEffects(effect)" class="tier-effects-edit">
                                        <div class="tier-effect-row">
                                            <label>Tier 1:</label>
                                            <input v-model="effect.tier1" @input="debouncedUpdateField"
                                                class="tier-input" placeholder="Success result" />
                                        </div>
                                        <div class="tier-effect-row">
                                            <label>Tier 2:</label>
                                            <input v-model="effect.tier2" @input="debouncedUpdateField"
                                                class="tier-input" placeholder="Partial success result" />
                                        </div>
                                        <div class="tier-effect-row">
                                            <label>Tier 3:</label>
                                            <input v-model="effect.tier3" @input="debouncedUpdateField"
                                                class="tier-input" placeholder="Failure result" />
                                        </div>
                                    </div>

                                    <div class="effect-controls">
                                        <button @click="toggleTierEffects(effect)" class="btn-link">
                                            {{ showTierEffects(effect) ? 'Remove Test Tiers' : 'Add Test Tiers' }}
                                        </button>
                                        <button v-if="feature.effects.length > 1"
                                            @click="removeEffect(feature, effectIndex)" class="btn-remove-small">
                                            Remove Effect
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button @click="addEffect(feature)" class="btn btn-outline btn-add-small">
                                + Add Effect
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else class="no-features">
                    <p>No features added yet. Click "Add Feature" to create your first malice feature.</p>
                </div>
            </template>

            <template v-else>
                <div v-if="maliceBlock.features && maliceBlock.features.length > 0">
                    <div v-for="(feature, index) in maliceBlock.features" :key="index" class="feature">
                        <div class="feature-header">
                            <h3 class="feature-name">{{ feature.name }}</h3>
                            <span v-if="feature.cost" class="feature-cost">{{ feature.cost }}</span>
                        </div>

                        <div v-if="feature.effects" class="feature-effects">
                            <div v-for="(effect, effectIndex) in feature.effects" :key="effectIndex" class="effect">
                                <div v-if="effect.effect" class="effect-description"
                                    v-html="formatEffectText(effect.effect)"></div>

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
            </template>
        </div>

        <!-- Edit Controls -->
        <div v-if="editMode" class="edit-controls">
            <div class="divider"></div>
            <div class="button-group">
                <button @click="handleSave" class="btn btn-success">
                    Save Changes
                </button>
                <button @click="handleCancel" class="btn btn-secondary">
                    Cancel
                </button>
            </div>
        </div>

        <!-- Source Information -->
        <div v-if="!editMode && maliceBlock.source" class="source-info">
            <div class="divider"></div>
            <div class="source-text">
                <span v-if="maliceBlock.source.book">{{ maliceBlock.source.book }}</span>
                <span v-if="maliceBlock.source.page">, page {{ maliceBlock.source.page }}</span>
                <span v-if="maliceBlock.source.license"> • {{ maliceBlock.source.license }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    maliceBlock: {
        type: Object,
        required: true
    },
    editMode: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['save', 'cancel', 'update:maliceBlock'])

// Editable data
const editableData = ref({})
const originalData = ref({})

// Initialize editable data
const initializeEditableData = () => {
    const data = {
        id: props.maliceBlock.id || '',
        name: props.maliceBlock.name || '',
        type: props.maliceBlock.type || 'featureblock',
        featureblockType: props.maliceBlock.featureblockType || 'Malice Features',
        flavor: props.maliceBlock.flavor || '',
        features: props.maliceBlock.features ? JSON.parse(JSON.stringify(props.maliceBlock.features)) : [],
        source: props.maliceBlock.source || {
            book: "Custom",
            page: "",
            license: "Draw Steel Creator License"
        }
    }

    editableData.value = data
    originalData.value = JSON.parse(JSON.stringify(data))
}

// Watch for malice block changes
watch(() => props.maliceBlock, initializeEditableData, { immediate: true, deep: true })

// Auto-save functionality
const updateField = () => {
    // Emit the updated malice block data for auto-save
    emit('update:maliceBlock', { ...editableData.value })
}

// Helper methods
const formatEffectText = (text) => {
    if (!text) return ''

    // Basic text formatting - could be expanded with more sophisticated processing
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold** text
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic* text
}

const showTierEffects = (effect) => {
    return effect.tier1 !== undefined || effect.tier2 !== undefined || effect.tier3 !== undefined
}

const toggleTierEffects = (effect) => {
    if (showTierEffects(effect)) {
        // Remove tier effects
        delete effect.tier1
        delete effect.tier2
        delete effect.tier3
    } else {
        // Add tier effects
        effect.tier1 = ''
        effect.tier2 = ''
        effect.tier3 = ''
    }
    debouncedUpdateField()
}

// Feature management
const addFeature = () => {
    editableData.value.features.push({
        type: 'feature',
        name: '',
        cost: '',
        effects: [{
            effect: ''
        }]
    })
    debouncedUpdateField()
}

const removeFeature = (index) => {
    editableData.value.features.splice(index, 1)
    debouncedUpdateField()
}

const addEffect = (feature) => {
    if (!feature.effects) {
        feature.effects = []
    }
    feature.effects.push({
        effect: ''
    })
    debouncedUpdateField()
}

const removeEffect = (feature, effectIndex) => {
    feature.effects.splice(effectIndex, 1)
    debouncedUpdateField()
}

// Save/Cancel handlers
const handleSave = () => {
    emit('save', { ...editableData.value })
}

const handleCancel = () => {
    // Reset to original data
    editableData.value = JSON.parse(JSON.stringify(originalData.value))
    emit('cancel')
}

// Debounced version of updateField for general use
let fieldUpdateTimeout = null
const debouncedUpdateField = () => {
    clearTimeout(fieldUpdateTimeout)
    fieldUpdateTimeout = setTimeout(() => {
        updateField()
    }, 300)
}

// Keyboard shortcuts
const handleKeydown = (event) => {
    if (!props.editMode) return

    // Ctrl+S or Cmd+S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        handleSave()
    }

    // Escape to cancel
    if (event.key === 'Escape') {
        event.preventDefault()
        handleCancel()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Base malice feature block styles */
.malice-feature-block {
    background: var(--color-primary-50);
    border: 2px solid var(--color-primary-600);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    font-family: var(--font-family-serif);
    box-shadow: var(--shadow-md);
    max-width: 100%;
    position: relative;
}

.malice-feature-block.edit-mode {
    border-color: var(--color-warning-400);
    background: var(--color-warning-50);
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

.malice-feature-block.edit-mode::before {
    background: linear-gradient(to right, var(--color-warning-500), var(--color-warning-700), var(--color-warning-500));
}

/* Header styles */
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

.malice-name-edit {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary-600);
    text-transform: uppercase;
    letter-spacing: 1px;
    background: transparent;
    border: 2px solid var(--color-primary-300);
    border-radius: var(--radius-md);
    padding: var(--space-2);
    text-align: center;
    width: 100%;
    margin-bottom: var(--space-2);
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
}

.malice-type-edit {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-700);
    background: transparent;
    border: 1px solid var(--color-neutral-300);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    text-align: center;
    width: 100%;
}

.divider {
    height: 2px;
    background: linear-gradient(to right, transparent, var(--color-primary-600), transparent);
    margin: var(--space-4) 0;
}

/* Flavor section */
.flavor-section {
    margin-bottom: var(--space-4);
}

.flavor-label {
    display: block;
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary-600);
    margin-bottom: var(--space-2);
}

.flavor-text {
    font-size: var(--font-size-base);
    color: var(--color-neutral-800);
    text-align: center;
    line-height: var(--line-height-relaxed);
}

.flavor-text p {
    margin: 0;
}

.flavor-edit {
    width: 100%;
    font-size: var(--font-size-base);
    color: var(--color-neutral-700);
    border: 1px solid var(--color-neutral-300);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    resize: vertical;
    min-height: 80px;
}

/* Features section */
.features-section {
    margin: var(--space-4) 0;
}

.features-edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
}

.features-edit-header h3 {
    margin: 0;
    color: var(--color-primary-600);
}

.features-list-edit {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.feature-edit-item {
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    background: var(--color-neutral-50);
}

.feature-edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
    gap: var(--space-2);
}

.feature-edit-name {
    flex: 1;
}

.feature-name-input {
    width: 100%;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary-600);
    border: 1px solid var(--color-primary-300);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
}

.feature-cost-edit {
    margin-bottom: var(--space-3);
}

.feature-cost-edit label {
    display: block;
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary-600);
    margin-bottom: var(--space-1);
    font-size: var(--font-size-sm);
}

.feature-cost-input {
    width: 100%;
    border: 1px solid var(--color-neutral-300);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
}

.feature-effects-edit {
    margin-bottom: var(--space-3);
}

.feature-effects-edit label {
    display: block;
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary-600);
    margin-bottom: var(--space-2);
}

.effect-edit {
    margin-bottom: var(--space-4);
    padding: var(--space-3);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    background: var(--color-neutral-50);
}

.effect-description-edit {
    width: 100%;
    border: 1px solid var(--color-neutral-300);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    resize: vertical;
    margin-bottom: var(--space-2);
}

.tier-effects-edit {
    margin: var(--space-3) 0;
    padding: var(--space-3);
    background: var(--color-neutral-50);
    border-radius: var(--radius-sm);
    border-left: 4px solid var(--color-primary-400);
}

.tier-effect-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
}

.tier-effect-row label {
    min-width: 60px;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
}

.tier-input {
    flex: 1;
    border: 1px solid var(--color-neutral-300);
    border-radius: var(--radius-sm);
    padding: var(--space-1);
    font-size: var(--font-size-sm);
}

.effect-controls {
    display: flex;
    gap: var(--space-2);
    align-items: center;
}

/* Display mode features */
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

/* Edit controls */
.edit-controls {
    margin-top: var(--space-4);
}

.button-group {
    display: flex;
    gap: var(--space-3);
    justify-content: center;
}

.btn {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-semibold);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-success {
    background: var(--color-success-600);
    color: white;
}

.btn-success:hover {
    background: var(--color-success-700);
}

.btn-secondary {
    background: var(--color-neutral-600);
    color: white;
}

.btn-secondary:hover {
    background: var(--color-neutral-700);
}

.btn-outline {
    border: 1px solid var(--color-primary-600);
    color: var(--color-primary-600);
    background: transparent;
}

.btn-outline:hover {
    background: var(--color-primary-600);
    color: white;
}

.btn-link {
    background: transparent;
    border: none;
    color: var(--color-primary-600);
    text-decoration: underline;
    cursor: pointer;
    font-size: var(--font-size-sm);
}

.btn-link:hover {
    color: var(--color-primary-700);
}

.btn-add-small,
.btn-remove-small {
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-sm);
    border: 1px solid;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-add-small {
    border-color: var(--color-success-600);
    color: var(--color-success-600);
    background: transparent;
}

.btn-add-small:hover {
    background: var(--color-success-600);
    color: white;
}

.btn-remove-small {
    border-color: var(--color-error-600);
    color: var(--color-error-600);
    background: transparent;
}

.btn-remove-small:hover {
    background: var(--color-error-600);
    color: white;
}

.no-features {
    text-align: center;
    padding: var(--space-6);
    color: var(--color-neutral-500);
    font-style: italic;
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

    .malice-name,
    .malice-name-edit {
        font-size: var(--font-size-2xl);
    }

    .malice-type,
    .malice-type-edit {
        font-size: var(--font-size-base);
    }

    .malice-level {
        font-size: var(--font-size-sm);
    }

    .feature,
    .feature-edit-item {
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

    .features-edit-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-2);
    }

    .button-group {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .malice-feature-block {
        padding: var(--space-3);
    }

    .malice-name,
    .malice-name-edit {
        font-size: var(--font-size-xl);
        letter-spacing: 0.5px;
    }

    .feature,
    .feature-edit-item {
        padding: var(--space-2);
    }

    .feature-name {
        font-size: var(--font-size-base);
    }

    .tier-effects,
    .tier-effects-edit {
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

    .tier-effect-row {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-1);
    }
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