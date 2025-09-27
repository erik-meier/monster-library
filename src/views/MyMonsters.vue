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

      <!-- Export/Import Panel -->
      <ExportImportPanel />

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
          <div 
            v-for="monster in sortedCustomMonsters" 
            :key="monster.id" 
            class="monster-card"
          >
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
              <router-link 
                :to="`/monster/${monster.id}`" 
                class="btn btn-sm btn-secondary"
              >
                View
              </router-link>
              
              <router-link 
                :to="`/monster/${monster.id}/edit`" 
                class="btn btn-sm btn-primary"
              >
                Edit
              </router-link>
              
              <button 
                @click="deleteMonster(monster)" 
                class="btn btn-sm btn-danger"
                :disabled="deleting === monster.id"
              >
                {{ deleting === monster.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="cancelDelete">
      <div 
        class="dialog" 
        role="dialog"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
        @keydown.escape="cancelDelete"
        ref="deleteDialog"
      >
        <h3 id="delete-dialog-title">Delete Monster</h3>
        <p id="delete-dialog-desc">Are you sure you want to delete "{{ monsterToDelete?.name }}"? This action cannot be undone.</p>
        <div class="dialog-actions">
          <button 
            @click="cancelDelete" 
            class="btn btn-secondary"
            @keydown.escape="cancelDelete"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete" 
            class="btn btn-danger"
            ref="deleteButton"
            @keydown.enter.prevent="confirmDelete"
          >
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

interface MonsterTemplate {
  id: string
  name: string
  level: number
  role: string
  organization: string
  keywords: string[]
  description: string
  baseStats: {
    ev: number
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
  }
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
    role: template.role,
    organization: template.organization,
    keywords: template.keywords,
    ...template.baseStats,
    immunities: {},
    weaknesses: {},
    items: [] // Start with empty items - user can add their own
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
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #8b4513;
}

.subtitle {
  color: #6c757d;
  font-size: 1.2rem;
}

.dashboard {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.actions {
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.templates-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.monsters-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.monsters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.monster-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid #8b4513;
}

.monster-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.monster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.monster-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #8b4513;
  margin: 0;
}

.monster-level {
  background: #8b4513;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.monster-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #495057;
}

.monster-meta {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.monster-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #8b4513;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-primary {
  background-color: #8b4513;
  color: white;
  border-color: #8b4513;
}

.btn-primary:hover:not(:disabled) {
  background-color: #7a3c11;
  border-color: #6c3310;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
  border-color: #4e555b;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  margin-right: 0.5rem;
  font-weight: bold;
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
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  margin: 1rem;
  text-align: center;
}

.dialog h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.dialog p {
  margin-bottom: 2rem;
  color: #6c757d;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.2rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .my-monsters {
    padding: 1rem;
  }
  
  .dashboard {
    padding: 1rem;
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
    margin: 0.5rem;
  }
}
</style>