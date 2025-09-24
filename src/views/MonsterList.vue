<template>
  <div class="monster-list">
    <div class="page-header">
      <h1>Monster Library</h1>
      <p>Browse and search through the monster collection</p>
    </div>

    <div class="filters">
      <div class="search-bar">
        <input 
          v-model="searchTerm"
          type="text" 
          placeholder="Search monsters..."
          class="search-input"
        >
      </div>
    </div>

    <div v-if="loading" class="loading">
      Loading monsters...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="monsters-grid">
      <div
        v-for="monster in filteredMonsters"
        :key="monster.id"
        class="monster-card"
        @click="viewMonster(monster.id)"
      >
        <div class="monster-card-header">
          <h3 class="monster-name">{{ monster.name }}</h3>
          <div class="monster-level">Level {{ monster.level }}</div>
        </div>
        
        <div class="monster-info">
          <div class="monster-role">{{ monster.role }}</div>
          <div class="monster-organization" v-if="monster.organization">{{ monster.organization }}</div>
        </div>
        
        <div class="monster-keywords" v-if="monster.keywords && monster.keywords.length > 0">
          <span 
            v-for="keyword in monster.keywords" 
            :key="keyword"
            class="keyword-tag"
          >
            {{ keyword }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="!loading && filteredMonsters.length === 0" class="no-results">
      <h3>No monsters found</h3>
      <p>Try adjusting your search or filter criteria.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonsterList',
  data() {
    return {
      monsters: [],
      loading: true,
      error: null,
      searchTerm: '',
      selectedCR: '',
      selectedType: ''
    }
  },
  computed: {
    filteredMonsters() {
      let filtered = this.monsters
      
      // Search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(monster => 
          monster.name.toLowerCase().includes(term)
        )
      }

      return filtered
    }
  },
  async mounted() {
    await this.loadMonsterIndex()
  },
  methods: {
    async loadMonsterIndex() {
      this.loading = true;
      this.error = null;
      try {
        // Fetch the monster_index.json file from the project root
        const response = await fetch('/data/monster_index.json');
        if (!response.ok) throw new Error(`Failed to fetch monster index (${response.status})`);
        const indexData = await response.json();
        // The structure is { name: { "monster-id": "Monster Name", ... } }
        // Transform the index data into an array of { id, name } objects
        this.monsters = Object.entries(indexData.name).map(([id, name]) => ({ id, name }));
        this.monsters.sort((a, b) => a.name.localeCompare(b.name));
      } catch (err) {
        this.error = `Failed to load monsters: ${err.message}`;
      } finally {
        this.loading = false;
      }
    },
    viewMonster(monsterId) {
      this.$router.push(`/monster/${monsterId}`)
    },
    clearFilters() {
      this.searchTerm = ''
      this.selectedCR = ''
      this.selectedType = ''
    },
    truncateText(text, maxLength) {
      if (!text) return ''
      // Strip HTML tags for preview
      const plainText = text.replace(/<[^>]*>/g, '')
      if (plainText.length <= maxLength) return plainText
      return plainText.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style scoped>
.monster-list {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #8b4513;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-family: 'Libre Baskerville', 'Book Antiqua', serif;
}

.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #8b4513;
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: center;
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
  border-radius: 8px;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.monster-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.monster-name {
  color: #8b4513;
  font-size: 1.3rem;
  margin: 0;
  font-weight: bold;
  flex: 1;
}

.monster-level {
  background-color: #8b4513;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.monster-info {
  margin-bottom: 1rem;
}

.monster-role {
  color: #495057;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.monster-organization {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9rem;
}

.monster-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.keyword-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid #e9ecef;
}

.monster-details {
  margin-bottom: 1rem;
}

.monster-type {
  color: #6c757d;
  font-style: italic;
  margin: 0 0 0.5rem 0;
}

.monster-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #495057;
}

.monster-stats span {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.monster-preview {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.preview-text {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-results h3 {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .filters {
    padding: 1rem;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .monsters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .monster-card {
    padding: 1rem;
  }
}
</style>