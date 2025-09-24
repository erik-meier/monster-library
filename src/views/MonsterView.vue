<template>
  <div class="monster-view">
    <div v-if="loading" class="loading">
      Loading monster...
    </div>
    
    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>
    
    <MonsterStatBlock v-else-if="monster" :monster="monster" />
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
        level: this.monster.system?.monster?.level || 0,
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