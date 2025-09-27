<template>
  <div class="monster-view">
    <div v-if="loading" class="loading">
      Loading monster...
    </div>
    
    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>
    
    <div v-else-if="monster">
      <MonsterStatBlock v-if="!editMode" :monster="monster" />
      <MonsterStatBlockEditable 
        v-else
        :monster="monster" 
        :edit-mode="true"
        @update:monster="handleAutoSave"
        @save="handleSave"
        @cancel="cancelEdit"
      />
      
      <div class="monster-actions">
        <button class="btn btn-secondary" @click="viewRandomMonster" :disabled="loadingRandom || editMode">
          {{ loadingRandom ? 'Loading...' : 'Random Monster' }}
        </button>
        
        <!-- Edit Mode Controls -->
        <template v-if="canEdit">
          <button 
            v-if="!editMode" 
            @click="toggleEditMode" 
            class="btn btn-primary"
          >
            Edit Monster
          </button>
        </template>
        
        <button 
          v-else-if="!canEdit && !monster.isCustom" 
          @click="createCopyAndEdit" 
          class="btn btn-outline"
          :disabled="editMode"
        >
          Create Copy to Edit
        </button>
      </div>
      
      <!-- Auto-save indicator -->
      <div v-if="autoSaving" class="auto-save-indicator">
        <span class="save-icon">💾</span>
        Saving...
      </div>
      
      <div v-else-if="lastSaved" class="auto-save-indicator saved">
        <span class="save-icon">✅</span>
        Saved {{ formatLastSaved }}
      </div>
    </div>
  </div>
</template>

<script>
import MonsterStatBlock from '@/components/MonsterStatBlock.vue'
import MonsterStatBlockEditable from '@/components/MonsterStatBlockEditable.vue'
import { useCustomMonstersStore } from '@/stores/customMonsters'

export default {
  name: 'MonsterView',
  components: {
    MonsterStatBlock,
    MonsterStatBlockEditable
  },
  props: {
    monsterId: {
      type: String,
      required: true
    }
  },
  setup() {
    const customMonstersStore = useCustomMonstersStore()
    return { customMonstersStore }
  },
  data() {
    return {
      monster: null,
      loading: true,
      error: null,
      loadingRandom: false,
      editMode: false,
      autoSaving: false,
      lastSaved: null,
    }
  },
  computed: {
    canEdit() {
      // Can edit if it's a custom monster
      return this.monster && this.monster.isCustom === true
    },
    
    formatLastSaved() {
      if (!this.lastSaved) return ''
      const now = new Date()
      const diff = now - this.lastSaved
      
      if (diff < 60000) return 'just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      return this.lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  },
  
  async mounted() {
    // Check URL parameters for edit mode
    if (this.$route.query.edit === 'true') {
      this.editMode = true
    }
    
    await this.loadMonster()
  },
  watch: {
    monsterId: {
      handler() {
        // Exit edit mode when monster changes
        if (this.editMode) {
          this.exitEditMode()
        }
        this.loadMonster()
      }
    },
    
    // Update URL when edit mode changes
    editMode(newValue) {
      const query = { ...this.$route.query }
      if (newValue) {
        query.edit = 'true'
      } else {
        delete query.edit
      }
      
      // Update URL without triggering navigation
      this.$router.replace({ query }).catch(() => {})
    }
  },
  methods: {
    async loadMonster() {
      this.loading = true
      this.error = null
      
      try {
        // Use integrated store that checks both custom and bundled monsters
        const monster = this.customMonstersStore.getMonster(this.monsterId)
        
        if (!monster) {
          throw new Error('Monster not found')
        }
        
        this.monster = monster
        
        // Add to recently viewed monsters
        this.addToRecentlyViewed()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    
    addToRecentlyViewed() {
      if (!this.monster) return

      const recentMonster = {
        id: this.monsterId,
        name: this.monster.name,
        level: this.monster.level || 0,
        viewedAt: new Date().toISOString()
      }

      // Get existing recent monsters
      let recentMonsters = []
      const existing = localStorage.getItem('recentlyViewedMonsters')
      if (existing) {
        recentMonsters = JSON.parse(existing)
      }

      // Remove if already exists (we'll add it to the front)
      recentMonsters = recentMonsters.filter(m => m.id !== this.monsterId)

      // Add to front
      recentMonsters.unshift(recentMonster)

      // Keep only the 10 most recent
      recentMonsters = recentMonsters.slice(0, 10)

      // Save back to localStorage
      localStorage.setItem('recentlyViewedMonsters', JSON.stringify(recentMonsters))
    },
    
    async viewRandomMonster() {
      this.loadingRandom = true
      
      try {
        const { getRandomMonsterId } = await import('@/utils/monsterUtils.js')
        const randomId = await getRandomMonsterId()
        
        if (randomId && randomId !== this.monsterId) {
          // Navigate to the new random monster
          this.$router.push(`/monster/${randomId}`)
        } else if (randomId === this.monsterId) {
          // If we got the same monster, try again
          this.viewRandomMonster()
          return
        }
      } catch (error) {
        console.error('Failed to get random monster:', error)
      } finally {
        this.loadingRandom = false
      }
    },

    async createCopyAndEdit() {
      try {
        // Create a complete copy of the official monster as a custom monster
        const copyData = {
          name: `${this.monster.name} (Copy)`,
          level: this.monster.level,
          ev: this.monster.ev,
          role: this.monster.role || '',
          organization: this.monster.organization,
          speed: this.monster.speed,
          stamina: this.monster.stamina,
          stability: this.monster.stability,
          freeStrike: this.monster.freeStrike,
          size: {
            value: this.monster.size?.value || 1,
            letter: this.monster.size?.letter || 'M'
          },
          characteristics: {
            might: this.monster.characteristics.might,
            agility: this.monster.characteristics.agility,
            reason: this.monster.characteristics.reason,
            intuition: this.monster.characteristics.intuition,
            presence: this.monster.characteristics.presence
          },
          keywords: this.monster.keywords || [],
          // Copy all abilities/items and other data
          items: this.monster.items || this.monster.abilities || [],
          abilities: this.monster.abilities || [],
          actions: this.monster.actions || [],
          // Copy additional properties that may exist
          movementTypes: this.monster.movementTypes || ['walk'],
          immunities: this.monster.immunities || {},
          weaknesses: this.monster.weaknesses || {},
          source: this.monster.source ? { ...this.monster.source } : undefined
        }
        
        const newMonsterId = this.customMonstersStore.createMonster(copyData)
        
        // Navigate to the copy with edit mode enabled
        this.$router.push(`/monster/${newMonsterId}?edit=true`)
      } catch (error) {
        console.error('Failed to create copy:', error)
        alert('Failed to create copy. Please try again.')
      }
    },

    // New edit mode methods
    toggleEditMode() {
      this.editMode = !this.editMode
    },
    
    exitEditMode() {
      this.editMode = false
    },
    
    async handleAutoSave(monsterData) {
      if (!this.canEdit) return
      
      this.autoSaving = true
      
      try {
        // Debounce auto-save
        clearTimeout(this.autoSaveTimeout)
        this.autoSaveTimeout = setTimeout(async () => {
          const success = this.customMonstersStore.updateMonster(this.monsterId, monsterData)
          
          if (success) {
            this.monster = { ...this.monster, ...monsterData }
            this.lastSaved = new Date()
          }
          
          this.autoSaving = false
        }, 500)
      } catch (error) {
        console.error('Auto-save failed:', error)
        this.autoSaving = false
      }
    },
    
    async handleSave(monsterData) {
      if (!this.canEdit) return
      
      try {
        const success = this.customMonstersStore.updateMonster(this.monsterId, monsterData)
        
        if (success) {
          this.monster = { ...this.monster, ...monsterData }
          this.lastSaved = new Date()
          this.exitEditMode()
        } else {
          throw new Error('Failed to save monster changes')
        }
      } catch (error) {
        console.error('Failed to save changes:', error)
        alert('Failed to save changes. Please try again.')
      }
    },
    
    cancelEdit() {
      this.exitEditMode()
    }
  }
}
</script>

<style scoped>
.monster-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.monster-actions {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #004085;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #6c757d;
  border-color: #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.btn-outline {
  background-color: transparent;
  color: #007bff;
  border-color: #007bff;
}

.btn-outline:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
}

.loading {
  color: #6b7280;
}

/* Auto-save indicator */
.auto-save-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.auto-save-indicator.saved {
  background: rgba(40, 167, 69, 0.9);
}

.save-icon {
  font-size: 1.1rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Edit mode button styles */
.btn-success {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
  border-color: #1e7e34;
}

/* Mobile responsive buttons */
@media (max-width: 768px) {
  .monster-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
    max-width: 100%;
  }
}
</style>