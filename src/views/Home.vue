<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">Steel Cauldron</h1>
      <p class="hero-subtitle">
        Your workshop for brewing Draw Steel monsters and encounters
      </p>
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

    <p class="hero-actions-text">
      Not sure where to start? Try a random monster!
    </p>
    <div class="hero-actions">
      <button class="btn btn-primary" @click="viewRandomMonster">
        Random Monster
      </button>
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
  padding: var(--space-16) var(--space-8);
  background: linear-gradient(135deg, var(--color-neutral-50), var(--color-primary-50));
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-12);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-neutral-200);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(139, 69, 19, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.hero-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-6);
  display: block;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-700);
  margin-bottom: var(--space-4);
  font-family: var(--font-family-serif);
  letter-spacing: -0.02em;
  position: relative;
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--color-neutral-600);
  margin-bottom: var(--space-8);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-relaxed);
  position: relative;
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
}

.hero-actions-text {
  font-size: var(--font-size-base);
  color: var(--color-neutral-700);
  margin-bottom: var(--space-4);
  line-height: var(--line-height-relaxed);
  display: flex;
  justify-content: center;
}

.btn {
  padding: var(--padding-btn);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-all);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  box-shadow: var(--shadow-sm);
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-secondary {
  background-color: white;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-600);
}

.btn-secondary:hover {
  background-color: var(--color-primary-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.features {
  margin: var(--space-12) 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-8);
  margin-top: var(--space-8);
}

.feature-card {
  background: white;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  text-align: center;
  transition: var(--transition-all);
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
  border: 1px solid var(--color-neutral-200);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary-600), var(--color-primary-700));
  transform: scaleX(0);
  transition: transform var(--duration-normal) var(--ease-out);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-200);
}

.feature-card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-neutral-50);
}

.feature-card-disabled::before {
  display: none;
}

.feature-card-disabled:hover {
  transform: none;
  box-shadow: var(--shadow-base);
}

.feature-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-4);
  display: inline-block;
  transition: var(--transition-transform);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-card h3 {
  color: var(--color-primary-700);
  margin-bottom: var(--space-4);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.feature-card:visited h3 {
  color: var(--color-primary-700);
}

.feature-card p {
  color: var(--color-neutral-600);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-base);
  margin: 0;
}

.recent-section {
  margin: var(--space-12) 0;
}

.recent-section h2 {
  color: var(--color-primary-700);
  margin-bottom: var(--space-6);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.getting-started {
  background: white;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  text-align: center;
  border-left: 4px solid var(--color-primary-600);
}

.getting-started p {
  color: var(--color-neutral-600);
  margin: 0;
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-base);
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.quick-link {
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: inherit;
  transition: var(--transition-all);
  border-left: 4px solid var(--color-primary-600);
  border: 1px solid var(--color-neutral-200);
}

.quick-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-300);
}

.quick-link-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}

.quick-link h4 {
  color: var(--color-neutral-800);
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.level-badge {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .hero {
    padding: var(--space-8) var(--space-4);
  }

  .hero-logo {
    width: 64px;
    height: 64px;
  }

  .hero-title {
    font-size: var(--font-size-4xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-base);
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
    gap: var(--space-6);
  }

  .quick-links {
    grid-template-columns: 1fr;
  }

  .recent-section h2 {
    font-size: var(--font-size-2xl);
  }
}

@media (max-width: 480px) {
  .hero {
    padding: var(--space-6) var(--space-3);
  }

  .hero-logo {
    width: 56px;
    height: 56px;
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-sm);
  }
}
</style>
