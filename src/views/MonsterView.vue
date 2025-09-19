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
      error: null
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
        const response = await fetch(`/data/monsters/${this.monsterId}.json`)
        if (!response.ok) {
          throw new Error(`Monster not found: ${this.monsterId}`)
        }
        this.monster = await response.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
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