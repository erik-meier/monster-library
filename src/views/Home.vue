<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">Steel Cauldron</h1>
      <p class="hero-subtitle">
        Your workshop for brewing Draw Steel monsters and encounters
      </p>

      <div class="hero-actions">
        <router-link to="/monsters" class="btn btn-primary">
          Browse Monsters
        </router-link>
        <button class="btn btn-secondary" @click="viewRandomMonster">
          Random Monster
        </button>
      </div>
    </div>

    <div class="features">
      <div class="feature-grid">
        <router-link to="/monsters" class="feature-card">
          <div class="feature-icon">📖</div>
          <h3>Monster Library</h3>
          <p>Browse official Draw Steel monsters with detailed stat blocks</p>
        </router-link>

        <router-link to="/monster/create" class="feature-card">
          <div class="feature-icon">⚙️</div>
          <h3>Monster Builder</h3>
          <p>Create custom monsters from existing templates or start from scratch</p>
        </router-link>

        <div class="feature-card feature-card-disabled">
          <div class="feature-icon">⚔️</div>
          <h3>Encounter Builder</h3>
          <p>Create balanced encounters for your Draw Steel adventures (Coming Soon)</p>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <h2>{{ recentMonsters.length > 0 ? 'Recently Viewed' : 'Getting Started' }}</h2>
      <div v-if="recentMonsters.length > 0" class="quick-links">
        <router-link v-for="monster in recentMonsters" :key="monster.id" :to="`/monster/${monster.id}`"
          class="quick-link">
          <div class="quick-link-content">
            <h4>{{ monster.name }}</h4>
            <span class="level-badge">Level {{ monster.level }}</span>
          </div>
        </router-link>
      </div>
      <div v-else class="getting-started">
        <p>No recently viewed monsters yet. Browse the monster library or try a random monster to get started!</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      recentMonsters: []
    }
  },
  async created() {
    // Load recently viewed monsters from localStorage
    this.loadRecentMonsters()
  },
  methods: {
    loadRecentMonsters() {
      const recent = localStorage.getItem('recentlyViewedMonsters')
      if (recent) {
        this.recentMonsters = JSON.parse(recent).slice(0, 4) // Show max 4 recent monsters
      }
    },
    async viewRandomMonster() {
      const { getRandomMonsterId } = await import('@/utils/monsterUtils.js')
      const randomId = await getRandomMonsterId()

      if (randomId) {
        this.$router.push(`/monster/${randomId}`)
      }
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 1rem;
  font-family: 'Libre Baskerville', 'Book Antiqua', serif;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
}

.btn-primary {
  background-color: #8b4513;
  color: white;
}

.btn-primary:hover {
  background-color: #a0522d;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: transparent;
  color: #8b4513;
  border: 2px solid #8b4513;
}

.btn-secondary:hover {
  background-color: #8b4513;
  color: white;
  transform: translateY(-1px);
}

.features {
  margin: 3rem 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8f9fa;
}

.feature-card-disabled:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #8b4513;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.feature-card:visited h3 {
  color: #8b4513;
}

.feature-card p {
  color: #6c757d;
  line-height: 1.6;
}

.recent-section {
  margin: 3rem 0;
}

.recent-section h2 {
  color: #8b4513;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.getting-started {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid #8b4513;
}

.getting-started p {
  color: #6c757d;
  margin: 0;
  line-height: 1.6;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-link {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border-left: 4px solid #8b4513;
}

.quick-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.quick-link-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-link h4 {
  color: #333;
  margin: 0;
  font-size: 1.1rem;
}

.level-badge {
  background-color: #8b4513;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 200px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .quick-links {
    grid-template-columns: 1fr;
  }
}
</style>