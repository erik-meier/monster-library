<template>
  <div class="monster-list">
    <div class="page-header">
      <h1>Monster Library</h1>
      <p>Browse and search through the monster collection</p>
    </div>

    <div class="filters">
      <div class="search-bar">
        <input v-model="searchTerm" type="text" placeholder="Search monsters..." class="search-input">
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label for="keyword-filter">Keywords:</label>
          <input id="keyword-filter" v-model="selectedKeywords" type="text" placeholder="Filter by keywords..."
            class="filter-input">
        </div>

        <div class="filter-group">
          <label for="level-filter">Level:</label>
          <select id="level-filter" v-model="selectedLevel" class="filter-select">
            <option value="">All Levels</option>
            <option v-for="level in availableLevels" :key="level" :value="level">
              Level {{ level }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="ev-filter">EV:</label>
          <select id="ev-filter" v-model="selectedEV" class="filter-select">
            <option value="">All EVs</option>
            <option v-for="ev in availableEVs" :key="ev" :value="ev">
              {{ ev }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="role-filter">Role:</label>
          <select id="role-filter" v-model="selectedRole" class="filter-select">
            <option value="">All Roles</option>
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="organization-filter">Organization:</label>
          <select id="organization-filter" v-model="selectedOrganization" class="filter-select">
            <option value="">All Organizations</option>
            <option v-for="org in availableOrganizations" :key="org.value" :value="org.value">
              {{ org.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="sort-row">
        <div class="filter-group">
          <label for="sort-by">Sort by:</label>
          <select id="sort-by" v-model="sortBy" class="filter-select">
            <option value="name">Name</option>
            <option value="level">Level</option>
            <option value="ev">EV</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="sort-order">Order:</label>
          <select id="sort-order" v-model="sortOrder" class="filter-select">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <button @click="clearFilters" class="clear-filters-btn">
          Clear All Filters
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Loading monsters...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="monsters-grid">
      <div v-for="monster in filteredMonsters" :key="monster.id" class="monster-card" @click="viewMonster(monster.id)">
        <div class="monster-card-header">
          <h3 class="monster-name">{{ monster.name }}</h3>
          <div class="monster-role">Level {{ monster.level }}{{ monster.organization ? ` ${monster.organization}` : ''
            }}{{ monster.role ? ` ${monster.role}` : '' }}</div>
        </div>

        <div class="monster-stats">
          <span v-if="monster.ev !== undefined && monster.ev !== null" class="monster-ev">EV {{ monster.ev }}</span>
        </div>

        <div class="monster-keywords" v-if="monster.keywords && monster.keywords.length > 0">
          <span v-for="keyword in monster.keywords" :key="keyword" class="keyword-tag">
            {{ keyword }}
          </span>
        </div>

        <div class="monster-card-footer">
          <div class="monster-role">Level {{ monster.level }}{{ formatRoleOrganization(monster) ? `
            ${formatRoleOrganization(monster)}` : '' }}</div>
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
import { useCustomMonstersStore } from '@/stores/customMonsters'

export default {
  name: 'MonsterList',
  setup() {
    const customMonstersStore = useCustomMonstersStore()
    return { customMonstersStore }
  },
  data() {
    return {
      monsters: [],
      loading: true,
      error: null,
      searchTerm: '',
      selectedKeywords: '',
      selectedLevel: '',
      selectedEV: '',
      selectedRole: '',
      selectedOrganization: '',
      sortBy: 'name',
      sortOrder: 'asc'
    }
  },
  computed: {
    availableLevels() {
      const levels = [...new Set(this.monsters.map(m => m.level).filter(l => l !== undefined))];
      return levels.sort((a, b) => a - b);
    },
    availableEVs() {
      const evs = [...new Set(this.monsters.map(m => m.ev).filter(ev => ev !== undefined))];
      return evs.sort((a, b) => a - b);
    },
    availableRoles() {
      const roles = [...new Set(this.monsters.map(m => m.role).filter(r => r))];
      return roles.sort().map(role => ({
        value: role,
        label: role.charAt(0).toUpperCase() + role.slice(1)
      }));
    },
    availableOrganizations() {
      const orgs = [...new Set(this.monsters.map(m => m.organization).filter(o => o))];
      return orgs.sort().map(org => ({
        value: org,
        label: org.charAt(0).toUpperCase() + org.slice(1)
      }));
    },
    filteredMonsters() {
      let filtered = this.monsters

      // Search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(monster =>
          monster.name.toLowerCase().includes(term)
        )
      }

      // Keywords filter
      if (this.selectedKeywords) {
        const keywordTerms = this.selectedKeywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k);
        filtered = filtered.filter(monster => {
          if (!monster.keywords || monster.keywords.length === 0) return false;
          return keywordTerms.every(term =>
            monster.keywords.some(keyword => keyword.toLowerCase().includes(term))
          );
        });
      }

      // Level filter
      if (this.selectedLevel !== '') {
        filtered = filtered.filter(monster => monster.level === parseInt(this.selectedLevel))
      }

      // EV filter
      if (this.selectedEV) {
        filtered = filtered.filter(monster => monster.ev === this.selectedEV)
      }

      // Role filter
      if (this.selectedRole) {
        filtered = filtered.filter(monster => monster.role === this.selectedRole)
      }

      // Organization filter
      if (this.selectedOrganization) {
        filtered = filtered.filter(monster => monster.organization === this.selectedOrganization)
      }

      // Sorting
      filtered = filtered.slice().sort((a, b) => {
        let aVal, bVal;

        switch (this.sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'level':
            aVal = a.level || 0;
            bVal = b.level || 0;
            break;
          case 'ev':
            aVal = a.ev || 0;
            bVal = b.ev || 0;
            break;
          default:
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
        }

        if (this.sortOrder === 'desc') {
          return aVal < bVal ? 1 : (aVal > bVal ? -1 : 0);
        } else {
          return aVal > bVal ? 1 : (aVal < bVal ? -1 : 0);
        }
      });

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
        // Use bundled data instead of fetch
        const { getMonsterIndex } = await import('@/data/monsters.js')
        const indexData = getMonsterIndex()

        // Transform the card data into monsters array with full details
        const bundledMonsters = Object.entries(indexData.card).map(([id, cardData]) => ({
          id,
          name: cardData.name,
          level: cardData.level,
          ev: cardData.ev,
          role: cardData.role,
          organization: cardData.organization,
          keywords: cardData.keywords || [],
          isCustom: false
        }));

        // Get custom monsters
        const customMonsters = this.customMonstersStore.getAllCustomMonsters().map(monster => ({
          id: monster.id,
          name: monster.name,
          level: monster.level,
          role: monster.role,
          organization: monster.organization,
          keywords: monster.keywords || [],
          isCustom: true
        }));

        // Combine and sort all monsters
        this.monsters = [...bundledMonsters, ...customMonsters];
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
      this.selectedKeywords = ''
      this.selectedLevel = ''
      this.selectedEV = ''
      this.selectedRole = ''
      this.selectedOrganization = ''
      this.sortBy = 'name'
      this.sortOrder = 'asc'
    },
    formatRoleOrganization(monster) {
      if (!monster.role && !monster.organization) return '';
      if (!monster.role) return monster.organization;
      if (!monster.organization) return monster.role;
      if (monster.role === monster.organization) return monster.role;
      return `${monster.organization} ${monster.role}`;
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

.search-input,
.filter-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus,
.filter-input:focus {
  outline: none;
  border-color: #8b4513;
}

.filter-row,
.sort-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.sort-row {
  margin-bottom: 0;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 150px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #8b4513;
}

.clear-filters-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-end;
}

.clear-filters-btn:hover {
  background: #c82333;
}

.monster-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  margin-bottom: 1rem;
}

.loading,
.error {
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
  display: flex;
  flex-direction: column;
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

.monster-card-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.monster-name {
  color: #8b4513;
  font-size: 1.3rem;
  margin: 0;
  font-weight: bold;
  flex: 1;
}

.monster-role {
  background-color: #8b4513;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  text-transform: capitalize;
}

.monster-ev {
  background: #28a745;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.monster-info {
  margin-bottom: 1rem;
}

.monster-organization {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9rem;
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

  .filter-row,
  .sort-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-group {
    min-width: auto;
  }

  .filter-select {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .clear-filters-btn {
    align-self: stretch;
    margin-top: 0.5rem;
  }

  .monsters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .monster-card {
    padding: 1rem;
    min-height: 44px;
    /* Touch-friendly target */
  }

  .monster-card:hover {
    transform: none;
    /* Reduce hover effects on mobile */
  }

  .monster-card:active {
    transform: scale(0.98);
    /* Touch feedback */
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }

  .filters {
    padding: 0.75rem;
  }

  .filter-select {
    padding: 0.875rem;
    font-size: 1rem;
  }

  .monsters-grid {
    gap: 0.75rem;
  }

  .monster-card {
    padding: 0.875rem;
  }

  .monster-name {
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .monster-role {
    font-size: 0.9rem;
  }

  .keywords {
    font-size: 0.85rem;
    line-height: 1.4;
  }
}
</style>