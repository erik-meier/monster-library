<template>
  <div class="my-monsters">
    <div class="header">
      <h1>My Custom Content</h1>
      <p class="subtitle">Manage your custom monsters and malice features</p>
    </div>

    <div class="dashboard">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ customMonsterCount }}</div>
          <div class="stat-label">Custom Monsters</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{{ customMaliceCount }}</div>
          <div class="stat-label">Custom Malice Features</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{{ totalMonsters }}</div>
          <div class="stat-label">Total Monsters</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <router-link to="/monster/create" class="btn btn-primary">
          <span class="btn-icon">+</span>
          Create New Monster
        </router-link>
        <button class="btn btn-primary" @click="createNewMalice">
          <span class="btn-icon">+</span>
          Create New Malice Features
        </button>
        <button class="btn btn-secondary" @click="showTemplates = !showTemplates">
          <span class="btn-icon">📋</span>
          {{ showTemplates ? 'Hide Templates' : 'Browse Templates' }}
        </button>
      </div>

      <!-- Monster Templates -->
      <div v-if="showTemplates" class="templates-section">
        <MonsterTemplates @template-selected="startFromTemplate" />
      </div>

      <!-- Monster List -->
      <div v-if="loading" class="loading">
        Loading monsters...
      </div>

      <div v-else-if="customMonsters.length === 0" class="empty-state">
        <div class="empty-icon">🐉</div>
        <h2>No Custom Monsters Yet</h2>
        <p>You haven't created any custom monsters yet. Get started by creating your first monster!</p>
        <router-link to="/monster/create" class="btn btn-primary">
          Create Your First Monster
        </router-link>
      </div>

      <div v-else class="monsters-section">
        <CollapsibleSection title="Custom Monsters" :expanded="true">
          <div class="monsters-grid">
            <div v-for="monster in sortedCustomMonsters" :key="monster.id" class="monster-card">
              <div class="monster-card-header">
                <h3 class="monster-name">{{ monster.name }}</h3>
                <span class="monster-ev">EV {{ monster.ev }}</span>
              </div>

              <div class="monster-card-footer">
                <div class="monster-role">
                  Level {{ monster.level }}{{ formatRoleOrganization(monster) ? ` ${formatRoleOrganization(monster)}`
                  : '' }}
                </div>
              </div>

              <div class="monster-meta">
                <div class="created-date">
                  Created: {{ formatDate(monster.createdAt) }}
                </div>
                <div v-if="monster.updatedAt !== monster.createdAt" class="updated-date">
                  Updated: {{ formatDate(monster.updatedAt) }}
                </div>
              </div>

              <div class="monster-actions">
                <router-link :to="`/monster/${monster.id}`" class="btn btn-sm btn-secondary">
                  View
                </router-link>

                <router-link :to="`/monster/${monster.id}?edit=true`" class="btn btn-sm btn-primary">
                  Edit
                </router-link>

                <button @click="deleteMonster(monster)" class="btn btn-sm btn-danger"
                  :disabled="deleting === monster.id">
                  {{ deleting === monster.id ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <!-- Custom Malice Features Section -->
      <div v-if="customMaliceFeatures.length > 0" class="malice-section">
        <CollapsibleSection title="Custom Malice Features" :expanded="true">
          <div class="malice-grid">
            <div v-for="malice in customMaliceFeatures" :key="malice.id" class="malice-card">
              <div class="malice-card-header">
                <h3 class="malice-name">{{ malice.name }}</h3>
                <div class="malice-level">Level {{ malice.level || 1 }}+</div>
              </div>

              <div class="malice-meta">
                <div class="created-date">
                  Created: {{ formatDate(malice.createdAt) }}
                </div>
                <div v-if="malice.updatedAt !== malice.createdAt" class="updated-date">
                  Updated: {{ formatDate(malice.updatedAt) }}
                </div>
              </div>

              <div class="malice-actions">
                <router-link :to="`/malice/${malice.id}`" class="btn btn-sm btn-secondary">
                  View
                </router-link>

                <router-link :to="`/malice/${malice.id}`" class="btn btn-sm btn-primary">
                  Edit
                </router-link>

                <button @click="deleteMaliceFeature(malice)" class="btn btn-sm btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>

    <!-- Export/Import Panel -->
    <ExportImportPanel />

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="cancelDelete">
      <div class="dialog" role="dialog" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-desc"
        @keydown.escape="cancelDelete" ref="deleteDialog">
        <h3 id="delete-dialog-title">Delete Monster</h3>
        <p id="delete-dialog-desc">Are you sure you want to delete "{{ monsterToDelete?.name }}"? This action cannot be
          undone.</p>
        <div class="dialog-actions">
          <button @click="cancelDelete" class="btn btn-secondary" @keydown.escape="cancelDelete">
            Cancel
          </button>
          <button @click="confirmDelete" class="btn btn-danger" ref="deleteButton"
            @keydown.enter.prevent="confirmDelete">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomMonstersStore } from '@/stores/customMonsters'
import { useCustomMaliceStore } from '@/stores/customMalice'
import ExportImportPanel from '@/components/ExportImportPanel.vue'
import MonsterTemplates from '@/components/MonsterTemplates.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import type { CustomMonster } from '@/stores/customMonsters'
import type { MonsterItem } from '@/types/monster-forms'

interface MonsterTemplate {
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
  keywords: string[]
  description: string
  size: string
  speed: number
  stamina: number
  stability: number
  freeStrike: number
  characteristics: {
    might: number
    agility: number
    reason: number
    intuition: number
    presence: number
  }
  movementTypes: Set<string>
  items: MonsterItem[]
}

const router = useRouter()
const customMonstersStore = useCustomMonstersStore()
const customMaliceStore = useCustomMaliceStore()

// Reactive state
const loading = ref(true)
const deleting = ref<string | null>(null)
const showDeleteDialog = ref(false)
const monsterToDelete = ref<CustomMonster | null>(null)
const deleteButton = ref<HTMLButtonElement>()
const showTemplates = ref(false)

// Computed properties
const customMonsters = computed(() => customMonstersStore.getAllCustomMonsters())
const customMaliceFeatures = computed(() => customMaliceStore.getAllCustomMalice)

const customMonsterCount = computed(() => customMonsters.value.length)
const customMaliceCount = computed(() => customMaliceFeatures.value.length)

const totalMonsters = computed(() => customMonstersStore.getAllMonsters().length)

const sortedCustomMonsters = computed(() => {
  return [...customMonsters.value].sort((a, b) => {
    // Sort by most recently updated first
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

// Methods
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatRoleOrganization(monster: CustomMonster) {
  if (!monster.role && !monster.organization) return ''
  if (!monster.role) return monster.organization
  if (!monster.organization) return monster.role
  if (monster.role === monster.organization) return monster.role
  return `${monster.organization} ${monster.role}`
}

function deleteMonster(monster: CustomMonster) {
  monsterToDelete.value = monster
  showDeleteDialog.value = true

  // Focus the delete button when the dialog opens
  nextTick(() => {
    if (deleteButton.value) {
      deleteButton.value.focus()
    }
  })
}

function cancelDelete() {
  showDeleteDialog.value = false
  monsterToDelete.value = null
}

async function confirmDelete() {
  if (!monsterToDelete.value) return

  deleting.value = monsterToDelete.value.id

  try {
    const success = customMonstersStore.deleteMonster(monsterToDelete.value.id)

    if (!success) {
      throw new Error('Failed to delete monster')
    }

    showDeleteDialog.value = false
    monsterToDelete.value = null
  } catch (error) {
    console.error('Failed to delete monster:', error)
    alert('Failed to delete monster. Please try again.')
  } finally {
    deleting.value = null
  }
}

function startFromTemplate(template: MonsterTemplate) {
  // Create a monster object from the template
  const templateMonster = {
    name: template.name,
    level: template.level,
    ev: template.ev,
    role: template.role,
    organization: template.organization.toLowerCase(), // Normalize to lowercase
    keywords: template.keywords,
    size: template.size,
    speed: template.speed,
    stamina: template.stamina,
    stability: template.stability,
    freeStrike: template.freeStrike,
    characteristics: template.characteristics,
    movementTypes: template.movementTypes,
    immunities: {},
    weaknesses: {},
    items: template.items || [] // Include abilities from stat blocks
  }

  // Store the template data in localStorage for the create page to pick up
  localStorage.setItem('templateMonster', JSON.stringify(templateMonster))

  // Navigate to the create page
  router.push('/monster/create')
}

function deleteMaliceFeature(malice: { id: string; name: string }) {
  if (confirm(`Are you sure you want to delete "${malice.name}"? This action cannot be undone.`)) {
    const success = customMaliceStore.deleteMaliceFeature(malice.id)

    if (!success) {
      alert('Failed to delete malice feature. Please try again.')
    }
  }
}

function createNewMalice() {
  // Create a basic malice feature template
  const newMaliceId = customMaliceStore.createMaliceFeature({
    name: 'New Malice Features',
    featureblockType: 'Malice Features',
    level: 1,
    features: [{
      name: 'New Feature',
      effects: [{
        tier1: 'Tier 1 effect',
        tier2: 'Tier 2 effect',
        tier3: 'Tier 3 effect'
      }]
    }]
  })

  if (newMaliceId) {
    // Navigate to the new malice for editing
    router.push(`/malice/${newMaliceId}`)
  } else {
    alert('Failed to create new malice feature. Please try again.')
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    // Load custom monsters and malice from storage
    customMonstersStore.loadFromStorage()
    customMaliceStore.loadFromStorage()
  } catch (error) {
    console.error('Error loading custom content:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.my-monsters {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8);
}

.header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.header h1 {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-2);
  color: var(--color-primary-600);
  font-weight: var(--font-weight-bold);
}

.subtitle {
  color: var(--color-neutral-500);
  font-size: var(--font-size-lg);
}

.dashboard {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  padding: var(--space-8);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.stat-card {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
  color: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.stat-number {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.actions {
  margin-bottom: var(--space-8);
  text-align: center;
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.templates-section {
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  background: var(--color-neutral-50);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-neutral-200);
}

.monsters-section {
  margin-bottom: var(--space-8);
}

.section-header {
  margin-bottom: var(--space-4);
  padding: var(--space-4) 0;
}

.section-count {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

.monsters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

.monster-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
  border: 1px solid var(--color-neutral-200);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.monster-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-primary-600), var(--color-primary-700));
  transform: scaleY(1);
  transition: transform var(--duration-normal) var(--ease-out);
}

.monster-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-200);
}

.monster-card:hover::before {
  transform: scaleY(1.1);
}

.monster-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
  gap: var(--space-3);
}

.monster-name {
  color: var(--color-primary-700);
  font-size: var(--font-size-xl);
  margin: 0;
  font-weight: var(--font-weight-bold);
  flex: 1;
  line-height: var(--line-height-tight);
}

.monster-ev {
  background: var(--color-success-600);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}

.monster-card-footer {
  margin-bottom: var(--space-4);
}

.monster-role {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  text-transform: capitalize;
  box-shadow: var(--shadow-sm);
  display: inline-block;
}

.monster-meta {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
  margin-bottom: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
}

.monster-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: var(--space-16) var(--space-8);
  color: var(--color-neutral-500);
}

.empty-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-4);
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-4);
  color: var(--color-primary-600);
  font-weight: var(--font-weight-semibold);
}

.empty-state p {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-8);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Buttons use design system classes from components.css */

.btn-danger {
  background-color: var(--color-error-600);
  color: white;
  border: 2px solid var(--color-error-600);
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--color-error-700);
  border-color: var(--color-error-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-danger:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-icon {
  margin-right: var(--space-2);
  font-weight: var(--font-weight-bold);
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.dialog {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 400px;
  margin: var(--space-4);
  text-align: center;
  box-shadow: var(--shadow-xl);
  animation: slideIn var(--duration-normal) var(--ease-out);
}

.dialog h3 {
  margin-bottom: var(--space-4);
  color: var(--color-neutral-800);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.dialog p {
  margin-bottom: var(--space-8);
  color: var(--color-neutral-600);
  line-height: var(--line-height-relaxed);
}

.dialog-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.loading {
  text-align: center;
  padding: var(--space-16) var(--space-8);
  font-size: var(--font-size-lg);
  color: var(--color-neutral-500);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Malice Features Styling */
.malice-section {
  margin-top: var(--space-8);
}

.malice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}

.malice-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-neutral-200);
  transition: var(--transition-all);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.malice-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-warning-500), var(--color-warning-600));
  transform: scaleY(1);
  transition: transform var(--duration-normal) var(--ease-out);
}

.malice-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-warning-200);
}

.malice-card:hover::before {
  transform: scaleY(1.1);
}

.malice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
  gap: var(--space-3);
}

.malice-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-warning-700);
  margin: 0;
  flex: 1;
  line-height: var(--line-height-tight);
}

.malice-level {
  background: var(--color-warning-600);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}

.malice-info {
  margin-bottom: var(--space-4);
}

.malice-feature-count {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-neutral-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--space-2) var(--space-3);
  background: var(--color-warning-50);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-warning-200);
}

.feature-icon {
  font-size: var(--font-size-base);
}

.malice-meta {
  margin-bottom: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
}

.malice-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .my-monsters {
    padding: var(--space-4);
  }

  .dashboard {
    padding: var(--space-4);
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .monsters-grid,
  .malice-grid {
    grid-template-columns: 1fr;
  }

  .monster-actions,
  .malice-actions {
    justify-content: center;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .dialog {
    margin: var(--space-2);
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }

  .actions .btn {
    min-width: 200px;
  }
}
</style>