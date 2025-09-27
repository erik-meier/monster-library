<template>
  <div class="monster-view">
    <div v-if="loading" class="loading">
      Loading monster...
    </div>
    
    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>
    
    <div v-else-if="monster">
      <MonsterStatBlock 
        :monster="editMode ? editableMonster : monster" 
        :edit-mode="editMode"
        @update:monster="updateMonster"
      />
      <div class="monster-actions">
        <button class="btn btn-secondary" @click="viewRandomMonster" :disabled="loadingRandom || editMode">
          {{ loadingRandom ? 'Loading...' : 'Random Monster' }}
        </button>
        
        <!-- Edit Mode Controls -->
        <template v-if="canEdit">
          <button 
            v-if="!editMode" 
            @click="enterEditMode" 
            class="btn btn-primary"
          >
            Edit Inline
          </button>
          <template v-if="editMode">
            <button 
              @click="saveChanges" 
              class="btn btn-success"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button 
              @click="cancelEdit" 
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              @click="revertChanges" 
              class="btn btn-outline"
              title="Revert to original values"
            >
              Revert
            </button>
          </template>
          
          <router-link 
            v-if="!editMode"
            :to="`/monster/${monsterId}/edit`" 
            class="btn btn-outline"
          >
            Edit Full Form
          </router-link>
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
    </div>
  </div>
</template>

<script>
import MonsterStatBlock from '@/components/MonsterStatBlock.vue'
import { useCustomMonstersStore } from '@/stores/customMonsters'

export default {
  name: 'MonsterView',
  components: {
    MonsterStatBlock
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
      editableMonster: null,
      originalMonster: null,
      loading: true,
      error: null,
      loadingRandom: false,
      editMode: false,
      saving: false,
    }
  },
  computed: {
    canEdit() {
      // Can edit if it's a custom monster
      return this.monster && this.monster.isCustom === true
    }
  },
  async mounted() {
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
      if (!this.monster) return;

      const recentMonster = {
        id: this.monsterId,
        name: this.monster.name,
        level: this.monster.level || 0,
        viewedAt: new Date().toISOString()
      };

      // Get existing recent monsters
      let recentMonsters = [];
      const existing = localStorage.getItem('recentlyViewedMonsters');
      if (existing) {
        recentMonsters = JSON.parse(existing);
      }

      // Remove if already exists (we'll add it to the front)
      recentMonsters = recentMonsters.filter(m => m.id !== this.monsterId);

      // Add to front
      recentMonsters.unshift(recentMonster);

      // Keep only the 10 most recent
      recentMonsters = recentMonsters.slice(0, 10);

      // Save back to localStorage
      localStorage.setItem('recentlyViewedMonsters', JSON.stringify(recentMonsters));
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
        // Create a copy of the official monster as a custom monster
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
          abilities: this.monster.abilities || [],
          actions: this.monster.actions || []
        }
        
        const newMonsterId = this.customMonstersStore.createMonster(copyData)
        
        // Navigate directly to edit the copy
        this.$router.push(`/monster/${newMonsterId}/edit`)
      } catch (error) {
        console.error('Failed to create copy:', error)
        alert('Failed to create copy. Please try again.')
      }
    },

    // Edit Mode Methods
    enterEditMode() {
      this.editMode = true
      this.originalMonster = JSON.parse(JSON.stringify(this.monster)) // Deep copy
      this.editableMonster = JSON.parse(JSON.stringify(this.monster)) // Deep copy
    },

    exitEditMode() {
      this.editMode = false
      this.editableMonster = null
      this.originalMonster = null
    },

    updateMonster(updatedMonster) {
      if (this.editMode && updatedMonster) {
        // Only update if we're in edit mode and have valid data
        this.editableMonster = { ...this.editableMonster, ...updatedMonster }
      }
    },

    async saveChanges() {
      if (!this.editableMonster || !this.canEdit) return

      this.saving = true
      try {
        const success = this.customMonstersStore.updateMonster(this.monsterId, this.editableMonster)
        
        if (success) {
          // Update the current monster with the saved data
          this.monster = { ...this.editableMonster }
          this.exitEditMode()
        } else {
          throw new Error('Failed to save monster changes')
        }
      } catch (error) {
        console.error('Failed to save changes:', error)
        alert('Failed to save changes. Please try again.')
      } finally {
        this.saving = false
      }
    },

    cancelEdit() {
      this.exitEditMode()
    },

    revertChanges() {
      if (this.originalMonster) {
        this.editableMonster = JSON.parse(JSON.stringify(this.originalMonster))
      }
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