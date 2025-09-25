<template>
  <div class="monster-view">
    <div v-if="loading" class="loading">
      Loading monster...
    </div>
    
    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>
    
    <div v-else-if="monster">
      <MonsterStatBlock :monster="monster" />
      <div class="monster-actions">
        <button class="btn btn-secondary" @click="viewRandomMonster" :disabled="loadingRandom">
          {{ loadingRandom ? 'Loading...' : 'Random Monster' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import MonsterStatBlock from '@/components/MonsterStatBlock.vue'

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
  data() {
    return {
      monster: null,
      loading: true,
      error: null,
      loadingRandom: false,
    }
  },
  async mounted() {
    await this.loadMonster()
  },
  watch: {
    monsterId: {
      handler() {
        this.loadMonster()
      }
    }
  },
  methods: {
    async loadMonster() {
      this.loading = true
      this.error = null
      
      try {
        // Use bundled data instead of fetch
        const { getMonster } = await import('@/data/monsters.js')
        const monster = getMonster(this.monsterId)
        
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
</style>