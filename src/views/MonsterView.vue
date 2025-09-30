<template>
  <div class="monster-view">
    <LoadingSpinner v-if="loading" message="Loading monster..." />

    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h3>Monster Not Found</h3>
        <p>{{ error }}</p>
        <router-link to="/monsters" class="btn btn-primary">Browse Monsters</router-link>
      </div>
    </div>

    <div v-else-if="monster">
      <MonsterStatBlock v-if="!editMode" :monster="monster" />
      <MonsterStatBlockEditable v-else :monster="monster" :edit-mode="true" @update:monster="handleAutoSave"
        @save="handleSave" @cancel="cancelEdit" />

      <div class="monster-actions">
        <button class="btn btn-secondary" @click="viewRandomMonster" :disabled="loadingRandom || editMode">
          {{ loadingRandom ? 'Loading...' : 'Random Monster' }}
        </button>

        <button class="btn btn-primary" @click="exportToPDF" :disabled="exportingPDF || editMode">
          {{ exportingPDF ? 'Exporting...' : '📄 Export PDF' }}
        </button>

        <!-- Edit Mode Controls -->
        <template v-if="canEdit">
          <button v-if="!editMode" @click="toggleEditMode" class="btn btn-primary">
            Edit Monster
          </button>
        </template>

        <button v-else-if="!canEdit && !monster.isCustom" @click="createCopyAndEdit" class="btn btn-outline"
          :disabled="editMode">
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
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useCustomMonstersStore } from '@/stores/customMonsters'
import { exportMonsterToPDF } from '@/utils/pdfExport'

export default {
  name: 'MonsterView',
  components: {
    MonsterStatBlock,
    MonsterStatBlockEditable,
    LoadingSpinner
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
      exportingPDF: false,
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
      this.$router.replace({ query }).catch(() => { })
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
    },

    async exportToPDF() {
      if (!this.monster) return

      this.exportingPDF = true
      try {
        await exportMonsterToPDF(this.monster)
      } catch (error) {
        console.error('Failed to export PDF:', error)
        alert('Failed to export PDF. Please try again.')
      } finally {
        this.exportingPDF = false
      }
    }
  }
}
</script>

<style scoped>
.monster-view {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-8);
}

.monster-actions {
  margin-top: var(--space-8);
  text-align: center;
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons use design system classes from components.css */

.loading,
.error {
  text-align: center;
  padding: var(--space-8);
  font-size: var(--font-size-lg);
}

.error {
  color: var(--color-error-600);
  background-color: var(--color-error-50);
  border: 2px solid var(--color-error-200);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-8);
  text-align: center;
}

.error-icon {
  font-size: var(--font-size-5xl);
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.error-content h3 {
  margin: 0;
  color: var(--color-error-700);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.error-content p {
  margin: 0;
  color: var(--color-error-600);
}

.loading {
  color: var(--color-neutral-500);
}

/* Auto-save indicator */
.auto-save-indicator {
  position: fixed;
  bottom: var(--space-5);
  right: var(--space-5);
  background: var(--color-info-600);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
  animation: slideIn var(--duration-slow) var(--ease-bounce);
}

.auto-save-indicator.saved {
  background: var(--color-success-600);
}

.save-icon {
  font-size: var(--font-size-lg);
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

/* Mobile responsive buttons */
@media (max-width: 768px) {
  .monster-view {
    padding: var(--space-4);
  }

  .monster-actions {
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .monster-actions .btn {
    min-width: 200px;
    max-width: 100%;
  }
}
</style>