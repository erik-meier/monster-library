<template>
  <div class="my-monsters">
    <div class="header">
      <h1>My Monsters</h1>
      <p class="subtitle">Manage your custom monsters</p>
    </div>

    <div class="dashboard">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ customMonsterCount }}</div>
          <div class="stat-label">Custom Monsters</div>
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
        <h2>Your Custom Monsters ({{ customMonsters.length }})</h2>

        <div class="monsters-grid">
          <div v-for="monster in sortedCustomMonsters" :key="monster.id" class="monster-card">
            <div class="monster-header">
              <h3 class="monster-name">{{ monster.name }}</h3>
              <div class="monster-level">Level {{ monster.level }}</div>
            </div>

            <div class="monster-details">
              <div class="detail-row">
                <span class="detail-label">Role:</span>
                <span class="detail-value">{{ monster.role || 'None' }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Organization:</span>
                <span class="detail-value">{{ monster.organization }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">EV:</span>
                <span class="detail-value">{{ monster.ev }}</span>
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

              <button @click="deleteMonster(monster)" class="btn btn-sm btn-danger" :disabled="deleting === monster.id">
                {{ deleting === monster.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
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
import ExportImportPanel from '@/components/ExportImportPanel.vue'
import MonsterTemplates from '@/components/MonsterTemplates.vue'
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
  size: { value: number; letter: string }
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
  movementTypes: string[]
  items: MonsterItem[]
}

const router = useRouter()
const customMonstersStore = useCustomMonstersStore()

// Reactive state
const loading = ref(true)
const deleting = ref<string | null>(null)
const showDeleteDialog = ref(false)
const monsterToDelete = ref<CustomMonster | null>(null)
const deleteButton = ref<HTMLButtonElement>()
const showTemplates = ref(false)

// Computed properties
const customMonsters = computed(() => customMonstersStore.getAllCustomMonsters())

const customMonsterCount = computed(() => customMonsters.value.length)

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

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    // Load custom monsters from storage
    customMonstersStore.loadFromStorage()
  } catch (error) {
    console.error('Error loading monsters:', error)
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

.monsters-section h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-6);
  color: var(--color-neutral-700);
  border-bottom: 2px solid var(--color-neutral-200);
  padding-bottom: var(--space-2);
  font-weight: var(--font-weight-semibold);
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
  cursor: pointer;
  transition: var(--transition-all);
  border-left: 4px solid var(--color-primary-600);
}

.monster-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.monster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.monster-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  margin: 0;
}

.monster-level {
  background: var(--color-primary-600);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.monster-details {
  margin-bottom: var(--space-4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
}

.detail-label {
  color: var(--color-neutral-500);
  font-weight: var(--font-weight-medium);
}

.detail-value {
  color: var(--color-neutral-700);
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

  .monsters-grid {
    grid-template-columns: 1fr;
  }

  .monster-actions {
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