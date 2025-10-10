<template>
    <div class="malice-view">
        <LoadingSpinner v-if="loading" />

        <div v-else-if="error" class="error-message">
            <h2>Error Loading Malice Features</h2>
            <p>{{ error }}</p>
            <router-link :to="backNavigation.path" class="btn btn-primary">{{ backNavigation.label }}</router-link>
        </div>

        <div v-else-if="maliceBlock" class="malice-content">
            <!-- Navigation -->
            <nav class="malice-nav">
                <router-link :to="backNavigation.path" class="nav-link">{{ backNavigation.label }}</router-link>
                <div class="nav-actions">
                    <button v-if="!isCustomMalice && !isEditing" @click="copyToCustom" class="btn btn-outline"
                        title="Copy to create editable version">
                        📋 Copy
                    </button>
                    <button v-if="isCustomMalice && !isEditing" @click="startEditing" class="btn btn-outline">
                        ✏️ Edit
                    </button>
                    <button v-if="isEditing" @click="cancelEditing" class="btn btn-secondary">
                        Cancel
                    </button>
                    <button v-if="isCustomMalice && !isEditing" @click="deleteMalice" class="btn btn-outline"
                        title="Delete custom malice">
                        ❌ Delete
                    </button>
                </div>
            </nav>

            <!-- Malice Feature Block -->
            <MaliceFeatureBlockEditable :malice-block="currentMaliceBlock" :edit-mode="isEditing" @save="handleSave"
                @cancel="cancelEditing" @update:malice-block="handleUpdate" />

            <!-- Related Monsters -->
            <div v-if="relatedMonsters.length > 0" class="related-monsters">
                <div class="divider"></div>
                <h3>Monsters with these Malice Features</h3>
                <div class="monster-grid">
                    <router-link v-for="monster in relatedMonsters" :key="monster.id" :to="`/monster/${monster.id}`"
                        class="monster-card">
                        <h4>{{ monster.name }}</h4>
                        <div class="monster-info">
                            Level {{ monster.level }} {{ monster.organization }} {{ monster.role }}
                        </div>
                        <div v-if="monster.keywords?.length" class="monster-keywords">
                            {{ monster.keywords.join(', ') }}
                        </div>
                    </router-link>
                </div>
            </div>
        </div>

        <div v-else class="not-found">
            <h2>Malice Features Not Found</h2>
            <router-link to="/my-monsters" class="btn btn-primary">← Back to My Monsters</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MaliceFeatureBlockEditable from '@/components/MaliceFeatureBlockEditable.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useCustomMaliceStore } from '@/stores/customMalice'
// @ts-expect-error - Dynamic import for data bundle
import { getMonsterIndex } from '@/data/monsters-bundle.js'

const route = useRoute()
const router = useRouter()
const customMaliceStore = useCustomMaliceStore()

// State
const loading = ref(true)
const error = ref(null)
const maliceBlock = ref(null)
const currentMaliceBlock = ref(null)
const isEditing = ref(false)
const hasUnsavedChanges = ref(false)
const isCustomMalice = ref(false)

// Computed
const relatedMonsters = computed(() => {
    if (!maliceBlock.value) return []

    const maliceId = route.params.maliceId
    return customMaliceStore.getLinkedMonsters(maliceId)
})

const backNavigation = computed(() => {
    const fromMonsterId = route.query.from
    if (fromMonsterId) {
        const index = getMonsterIndex()
        const monster = index.card[fromMonsterId]
        if (monster) {
            return {
                path: `/monster/${fromMonsterId}`,
                label: `← Back to ${monster.name}`
            }
        }
    }
    return {
        path: '/my-monsters',
        label: '← Back to My Monsters'
    }
})

// Methods
const loadMaliceFeatures = async () => {
    try {
        loading.value = true
        error.value = null

        // Initialize the custom malice store
        customMaliceStore.loadFromStorage()

        const maliceId = route.params.maliceId
        const maliceData = customMaliceStore.getMaliceFeature(maliceId)

        if (!maliceData) {
            error.value = `Malice features with ID "${maliceId}" not found.`
            return
        }

        maliceBlock.value = maliceData
        currentMaliceBlock.value = { ...maliceData }
        isCustomMalice.value = customMaliceStore.isCustomMalice(maliceId)

    } catch (err) {
        console.error('Error loading malice features:', err)
        error.value = 'Failed to load malice features. Please try again.'
    } finally {
        loading.value = false
    }
}

const startEditing = () => {
    // Only allow editing of custom malice
    if (!isCustomMalice.value) return

    isEditing.value = true
    currentMaliceBlock.value = JSON.parse(JSON.stringify(maliceBlock.value))
    hasUnsavedChanges.value = false
}

const cancelEditing = () => {
    if (hasUnsavedChanges.value) {
        if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
            return
        }
    }

    isEditing.value = false
    currentMaliceBlock.value = { ...maliceBlock.value }
    hasUnsavedChanges.value = false
}

const handleUpdate = (updatedMaliceBlock) => {
    currentMaliceBlock.value = updatedMaliceBlock
    hasUnsavedChanges.value = true
}

const handleSave = (savedMaliceBlock) => {
    if (!isCustomMalice.value) return

    const maliceId = route.params.maliceId
    const success = customMaliceStore.updateMaliceFeature(maliceId, savedMaliceBlock)

    if (success) {
        maliceBlock.value = { ...savedMaliceBlock }
        currentMaliceBlock.value = { ...savedMaliceBlock }
        isEditing.value = false
        hasUnsavedChanges.value = false
    } else {
        alert('Failed to save malice features. Please try again.')
    }
}

const copyToCustom = async () => {
    if (isCustomMalice.value) return

    const originalMaliceId = route.params.maliceId
    const newMaliceId = customMaliceStore.copyOfficialMalice(originalMaliceId)

    if (newMaliceId) {
        // Navigate to the new custom malice
        await router.push(`/malice/${newMaliceId}`)
    } else {
        alert('Failed to copy malice features. Please try again.')
    }
}

const deleteMalice = () => {
    if (!isCustomMalice.value) return

    if (confirm('Are you sure you want to delete this custom malice feature? This action cannot be undone.')) {
        const maliceId = route.params.maliceId
        const success = customMaliceStore.deleteMaliceFeature(maliceId)

        if (success) {
            // Navigate back to monsters page or dashboard
            router.push('/my-monsters')
        } else {
            alert('Failed to delete malice features. Please try again.')
        }
    }
}

// Watchers
watch(() => route.params.maliceId, loadMaliceFeatures, { immediate: true })

// Lifecycle
onMounted(() => {
    loadMaliceFeatures()
})

// Navigation guard for unsaved changes
const beforeUnload = (event) => {
    if (hasUnsavedChanges.value) {
        event.preventDefault()
        event.returnValue = ''
    }
}

onMounted(() => {
    window.addEventListener('beforeunload', beforeUnload)
})

onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style scoped>
.malice-view {
    min-height: 100vh;
    background: var(--color-background-100);
    padding: var(--space-4);
}

.error-message,
.not-found {
    text-align: center;
    padding: var(--space-8);
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    max-width: 600px;
    margin: 0 auto;
}

.error-message h2,
.not-found h2 {
    color: var(--color-danger-600);
    margin-bottom: var(--space-4);
}

.error-message p,
.not-found p {
    color: var(--color-neutral-600);
    margin-bottom: var(--space-6);
}

.malice-content {
    max-width: 800px;
    margin: 0 auto;
}

.malice-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.nav-link {
    color: var(--color-primary-600);
    text-decoration: none;
    font-weight: var(--font-weight-semibold);
    transition: color 0.2s ease;
}

.nav-link:hover {
    color: var(--color-primary-700);
    text-decoration: underline;
}

.nav-actions {
    display: flex;
    gap: var(--space-3);
}

.btn {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-semibold);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
}

.btn-primary {
    background: var(--color-primary-600);
    color: white;
}

.btn-primary:hover {
    background: var(--color-primary-700);
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

.btn-secondary {
    background: var(--color-neutral-600);
    color: white;
}

.btn-secondary:hover {
    background: var(--color-neutral-700);
}

.btn-danger {
    background: var(--color-danger-600);
    color: white;
}

.btn-danger:hover {
    background: var(--color-danger-700);
}

.related-monsters {
    margin-top: var(--space-8);
    padding: var(--space-6);
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.related-monsters h3 {
    text-align: center;
    color: var(--color-primary-600);
    margin-bottom: var(--space-6);
    font-size: var(--font-size-2xl);
}

.divider {
    height: 2px;
    background: linear-gradient(to right, transparent, var(--color-primary-600), transparent);
    margin: var(--space-4) 0;
}

.monster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-4);
}

.monster-card {
    padding: var(--space-4);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    background: var(--color-background-50);
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
}

.monster-card:hover {
    border-color: var(--color-primary-400);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.monster-card h4 {
    margin: 0 0 var(--space-2) 0;
    color: var(--color-primary-600);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
}

.monster-info {
    font-size: var(--font-size-sm);
    color: var(--color-neutral-600);
    margin-bottom: var(--space-2);
    font-weight: var(--font-weight-semibold);
}

.monster-keywords {
    font-size: var(--font-size-xs);
    color: var(--color-neutral-500);
    font-style: italic;
    line-height: var(--line-height-relaxed);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .malice-view {
        padding: var(--space-2);
    }

    .malice-nav {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
    }

    .nav-actions {
        justify-content: center;
    }

    .monster-grid {
        grid-template-columns: 1fr;
    }

    .related-monsters {
        padding: var(--space-4);
    }

    .related-monsters h3 {
        font-size: var(--font-size-xl);
    }
}

@media (max-width: 480px) {
    .malice-view {
        padding: var(--space-1);
    }

    .malice-nav {
        padding: var(--space-3);
    }

    .related-monsters {
        padding: var(--space-3);
    }

    .monster-card {
        padding: var(--space-3);
    }
}
</style>