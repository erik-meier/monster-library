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
                    <h3>Malice Features & Abilities</h3>
                    <div class="add-buttons">
                        <button @click="addFeature" class="btn btn-outline btn-add-small">
                            + Add Feature
                        </button>
                        <button @click="addAbility" class="btn btn-outline btn-add-small">
                            + Add Ability
                        </button>
                    </div>
                </div>

                <div v-if="editableData.features && editableData.features.length > 0" class="features-list-edit">
                    <div v-for="(feature, index) in editableData.features" :key="index" class="feature-edit-item">
                        <div class="feature-edit-header">
                            <div class="feature-edit-name">
                                <input v-model="feature.name" @input="debouncedUpdateField" class="feature-name-input"
                                    placeholder="Feature Name" />
                            </div>
                            <div class="feature-edit-actions">
                                <button @click="editFeature(index)" class="btn-edit-small" type="button"
                                    title="Edit feature details">
                                    ✏️
                                </button>
                                <button @click="removeFeature(index)" class="btn-remove-small" type="button"
                                    title="Remove feature">
                                    ×
                                </button>
                            </div>
                        </div>

                        <!-- Enhanced preview of feature details -->
                        <div class="feature-edit-preview">
                            <div class="feature-meta-info">
                                <div v-if="feature.type === 'ability'" class="feature-type-badge ability">Ability</div>
                                <div v-else class="feature-type-badge feature">Feature</div>
                                <div v-if="feature.cost" class="feature-cost">{{ feature.cost }}</div>
                                <div v-else class="feature-cost missing">⚠️ Cost required</div>
                            </div>

                            <!-- Ability-specific info -->
                            <div v-if="feature.type === 'ability'" class="ability-info">
                                <div v-if="feature.usage" class="ability-usage">{{ feature.usage }}</div>
                                <div v-if="feature.distance" class="ability-distance">{{ feature.distance }}</div>
                                <div v-if="feature.target" class="ability-target">{{ feature.target }}</div>
                            </div>

                            <!-- Feature effects preview -->
                            <div v-if="feature.effects && feature.effects.length > 0" class="feature-effects">
                                <div v-for="(effect, effectIndex) in feature.effects" :key="effectIndex"
                                    class="effect-text">
                                    <div v-if="effect.roll" class="feature-power-roll">
                                        <strong>Power Roll:</strong> {{ effect.roll }}
                                    </div>
                                    <div v-if="effect.effect" class="effect-description" v-html="effect.effect"></div>
                                    <div v-if="effect.tier1 || effect.tier2 || effect.tier3" class="tier-count">
                                        Has {{ [effect.tier1, effect.tier2, effect.tier3].filter(Boolean).length }} tier
                                        effects
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="no-features">
                    <p>No features added yet. Click "Add Feature" to create your first malice feature.</p>
                </div>
            </template>

            <template v-else>
                <div v-if="maliceBlock.features && maliceBlock.features.length > 0" class="actions-list">
                    <ActionDisplay v-for="(feature, index) in maliceBlock.features" :key="index" :action="feature"
                        @power-roll-click="handlePowerRollClick" />
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

    <!-- Feature Editor Modal -->
    <div v-if="showFeatureEditor" class="editor-modal-overlay" @click.self="handleFeatureCancel">
        <div class="editor-modal-container">
            <AbilityEditor v-if="editingFeature" :model-value="editingFeature" :existing-items="editableData.features"
                :editing-index="editingFeatureIndex" :is-malice-context="true" @update:model-value="handleFeatureUpdate"
                @save="handleFeatureSave" @cancel="handleFeatureCancel" />
        </div>
    </div>

    <RollResultModal :show="showRollModal" :result="rollResult" :characteristicName="rollName"
        @close="showRollModal = false" @reroll="rerollCurrent" />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import ActionDisplay from './ActionDisplay.vue'
import RollResultModal from './RollResultModal.vue'
import AbilityEditor from './AbilityEditor.vue'
import { rollPowerRoll, parsePowerRollModifier } from '@/utils/diceRoller'

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

// Feature editor state
const showFeatureEditor = ref(false)
const editingFeature = ref(null)
const editingFeatureIndex = ref(null)

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

// Power roll functionality now handled by ActionDisplay component

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



// Feature management
const addFeature = () => {
    const newFeature = {
        type: 'feature',
        name: '',
        cost: '',
        effects: [{
            effect: ''
        }],
        // Ensure it has the structure the AbilityEditor expects
        system: {
            description: { value: '' },
            keywords: []
        }
    }

    // Set up editing state - normalize for the editor
    editingFeature.value = normalizeFeatureForEditor(JSON.parse(JSON.stringify(newFeature)))
    editingFeatureIndex.value = null // New feature, no index yet
    showFeatureEditor.value = true
}

const addAbility = () => {
    const newAbility = {
        type: 'ability',
        name: '',
        cost: '',
        usage: '',
        distance: '',
        target: '',
        effects: [{
            effect: ''
        }],
        // Ensure it has the structure the AbilityEditor expects
        system: {
            type: 'action',
            category: 'regular',
            keywords: [],
            distance: { type: 'ranged', value: 1, unit: 'square' },
            target: { type: 'creature', value: 1 },
            power: {
                roll: { formula: '' },
                tiers: []
            }
        }
    }

    // Set up editing state - normalize for the editor
    editingFeature.value = normalizeFeatureForEditor(JSON.parse(JSON.stringify(newAbility)))
    editingFeatureIndex.value = null // New ability, no index yet
    showFeatureEditor.value = true
}

const editFeature = (index) => {
    if (editableData.value.features && editableData.value.features[index]) {
        // Deep copy to avoid direct mutations during editing
        editingFeature.value = normalizeFeatureForEditor(JSON.parse(JSON.stringify(editableData.value.features[index])))
        editingFeatureIndex.value = index
        showFeatureEditor.value = true
    }
}

const removeFeature = (index) => {
    editableData.value.features.splice(index, 1)
    debouncedUpdateField()
}

// Normalize feature data for the editor
const normalizeFeatureForEditor = (feature) => {
    // Ensure basic structure exists
    if (!feature.system) {
        feature.system = {}
    }

    // Ensure description structure 
    if (!feature.system.description) {
        feature.system.description = { value: '' }
    }

    // Ensure keywords array exists
    if (!feature.system.keywords) {
        feature.system.keywords = []
    }

    if (feature.type === 'ability') {
        // For abilities, ensure proper structure
        if (!feature.system.type) {
            feature.system.type = 'action'
        }

        if (!feature.system.category) {
            feature.system.category = 'regular'
        }

        // Ensure distance structure
        if (!feature.system.distance) {
            feature.system.distance = { type: 'ranged', value: 1, unit: 'square' }
        }

        // Ensure target structure
        if (!feature.system.target) {
            feature.system.target = { type: 'creature', value: 1 }
        }

        // Ensure power structure for abilities that might have rolls
        if (!feature.system.power) {
            feature.system.power = {
                roll: { formula: '' },
                tiers: []
            }
        }
    } else {
        // For features, simpler structure
        if (!feature.system.power) {
            feature.system.power = null
        }
    }

    return feature
}

// Validation functions
const validateMaliceCost = (item) => {
    // Check for malice cost - it should be present and non-empty
    const hasCost = item.cost && item.cost.trim() !== ''
    const hasResourceCost = item.system?.resource && item.system.resource > 0

    return hasCost || hasResourceCost
}

const validateFeature = (item) => {
    const errors = []

    if (!item.name || item.name.trim() === '') {
        errors.push('Feature name is required')
    }

    if (!validateMaliceCost(item)) {
        errors.push('Malice cost is required for all malice features and abilities')
    }

    return errors
}

// Feature editor handlers
const handleFeatureSave = () => {
    if (!editableData.value.features) {
        editableData.value.features = []
    }

    // Validate the feature before saving
    const validationErrors = validateFeature(editingFeature.value)
    if (validationErrors.length > 0) {
        alert(`Cannot save: ${validationErrors.join(', ')}`)
        return
    }

    if (editingFeatureIndex.value !== null) {
        // Update existing feature
        editableData.value.features[editingFeatureIndex.value] = JSON.parse(JSON.stringify(editingFeature.value))
    } else {
        // Add new feature
        editableData.value.features.push(JSON.parse(JSON.stringify(editingFeature.value)))
    }

    // Close editor and update
    showFeatureEditor.value = false
    editingFeature.value = null
    editingFeatureIndex.value = null
    debouncedUpdateField()
}

const handleFeatureCancel = () => {
    // Close editor without saving
    showFeatureEditor.value = false
    editingFeature.value = null
    editingFeatureIndex.value = null
}

const handleFeatureUpdate = (updatedFeature) => {
    // Update the editing feature with changes from the editor
    editingFeature.value = JSON.parse(JSON.stringify(updatedFeature))
}

// Save/Cancel handlers
const handleSave = () => {
    // Validate all features before saving
    const allErrors = []

    if (editableData.value.features) {
        editableData.value.features.forEach((feature, index) => {
            const errors = validateFeature(feature)
            if (errors.length > 0) {
                allErrors.push(`Feature ${index + 1} (${feature.name || 'Unnamed'}): ${errors.join(', ')}`)
            }
        })
    }

    if (allErrors.length > 0) {
        alert(`Cannot save malice block:\n${allErrors.join('\n')}`)
        return
    }

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
        if (showFeatureEditor.value) {
            handleFeatureCancel()
        } else {
            handleCancel()
        }
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

.add-buttons {
    display: flex;
    gap: var(--space-2);
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

.btn-edit-small {
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-primary-600);
    color: var(--color-primary-600);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-edit-small:hover {
    background: var(--color-primary-600);
    color: white;
}

.feature-edit-preview {
    margin-top: var(--space-3);
    padding: var(--space-3);
    background: var(--color-neutral-50);
    border-radius: var(--radius-sm);
    border-left: 4px solid var(--color-primary-400);
}

.feature-effects {
    margin-top: var(--space-2);
}

.effect-text {
    margin-bottom: var(--space-2);
}

.feature-power-roll {
    font-size: var(--font-size-sm);
    color: var(--color-primary-700);
    margin-bottom: var(--space-1);
}

.effect-description {
    font-size: var(--font-size-sm);
    color: var(--color-neutral-700);
    line-height: var(--line-height-relaxed);
}

.tier-count {
    font-size: var(--font-size-xs);
    color: var(--color-neutral-500);
    font-style: italic;
}

.feature-meta-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    flex-wrap: wrap;
}

.feature-type-badge {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.feature-type-badge.feature {
    background: var(--color-info-100);
    color: var(--color-info-700);
    border: 1px solid var(--color-info-300);
}

.feature-type-badge.ability {
    background: var(--color-success-100);
    color: var(--color-success-700);
    border: 1px solid var(--color-success-300);
}

.feature-cost.missing {
    background: var(--color-warning-100);
    color: var(--color-warning-700);
    border: 1px solid var(--color-warning-300);
}

.ability-info {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    flex-wrap: wrap;
}

.ability-usage,
.ability-distance,
.ability-target {
    font-size: var(--font-size-xs);
    padding: var(--space-1) var(--space-2);
    background: var(--color-neutral-100);
    border-radius: var(--radius-sm);
    color: var(--color-neutral-700);
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
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.power-roll-badge {
    font-weight: var(--font-weight-bold);
    color: var(--color-neutral-700);
    background: var(--color-neutral-100);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
}

.power-roll-badge.clickable {
    cursor: pointer;
    transition: var(--transition-colors);
}

.power-roll-badge.clickable:hover {
    background: var(--color-primary-100);
    color: var(--color-primary-700);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
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

/* Action display uses shared ActionDisplay component */
.actions-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

/* Tier styling now handled in PowerRoll component */

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

    .add-buttons {
        justify-content: center;
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

    .action-mechanics {
        flex-direction: column;
        gap: var(--space-1);
    }

    .action-usage,
    .action-distance,
    .action-target {
        font-size: var(--font-size-sm);
        padding: var(--space-1) var(--space-2);
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

/* Modal styles for Feature Editor */
.editor-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-4);
}

.editor-modal-container {
    background: var(--color-neutral-50);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 90vw;
    max-height: 90vh;
    width: 800px;
}

/* Ensure modal is above other content */
.editor-modal-overlay::backdrop {
    background-color: rgba(0, 0, 0, 0.7);
}
</style>