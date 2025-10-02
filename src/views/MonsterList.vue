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

    <LoadingSpinner v-if="loading" message="Loading monsters..." />

    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h3>Failed to Load Monsters</h3>
        <p>{{ error }}</p>
        <button @click="loadMonsters" class="btn btn-primary">Try Again</button>
      </div>
    </div>

    <div v-else class="monsters-grid">
      <div v-for="monster in filteredMonsters" :key="monster.id" class="monster-card" @click="viewMonster(monster.id)">
        <div class="monster-card-header">
          <h3 class="monster-name">{{ monster.name }}</h3>
          <span v-if="monster.ev !== undefined && monster.ev !== null" class="monster-ev">EV {{ monster.ev }}</span>
        </div>

        <div class="monster-card-footer">
          <div class="monster-keywords" v-if="monster.keywords && monster.keywords.length > 0">
            <span v-for="keyword in monster.keywords" :key="keyword" class="keyword-tag">
              {{ keyword }}
            </span>
          </div>
          <div class="monster-role">Level {{ monster.level }}{{ formatRoleOrganization(monster) ? `
            ${formatRoleOrganization(monster)}` : '' }}</div>
        </div>
      </div>

      <div v-if="!loading && filteredMonsters.length === 0" class="no-results">
        <h3>No monsters found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useCustomMonstersStore } from '@/stores/customMonsters'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'MonsterList',
  components: {
    LoadingSpinner
  },
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
      const orgs = [...new Set(this.monsters.map(m => m.organization.toLowerCase()).filter(o => o))];
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
        filtered = filtered.filter(monster => monster.organization.toLowerCase() === this.selectedOrganization)
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
          ev: monster.ev,
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
  margin-bottom: var(--space-8);
}

.page-header h1 {
  color: var(--color-primary-700);
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-2);
  font-family: var(--font-family-serif);
  font-weight: var(--font-weight-bold);
}

.page-header p {
  color: var(--color-neutral-600);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
}

.filters {
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  margin-bottom: var(--space-8);
  border: 1px solid var(--color-neutral-200);
}

.search-bar {
  margin-bottom: var(--space-4);
}

.search-input,
.filter-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family-sans);
  transition: var(--transition-colors), box-shadow var(--duration-normal) var(--ease-out);
  background: var(--color-neutral-50);
}

.search-input:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--focus-ring);
  background: white;
}

.filter-row,
.sort-row {
  display: flex;
  gap: var(--space-4);
  align-items: flex-end;
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.sort-row {
  margin-bottom: 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 150px;
}

.filter-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-sans);
  background: white;
  transition: var(--transition-colors), box-shadow var(--duration-normal) var(--ease-out);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--focus-ring);
}

.clear-filters-btn {
  background: var(--color-error-600);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
  align-self: flex-end;
  box-shadow: var(--shadow-sm);
}

.clear-filters-btn:hover {
  background: var(--color-error-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.clear-filters-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.monster-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 1;
}

.loading,
.error {
  text-align: center;
  padding: var(--space-8);
  font-size: var(--font-size-lg);
}

.error {
  color: var(--color-error-600);
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-8);
  box-shadow: var(--shadow-sm);
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
  font-weight: var(--font-weight-bold);
}

.error-content p {
  margin: 0;
  color: var(--color-error-600);
  line-height: var(--line-height-relaxed);
}

.error .btn {
  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-all);
}

.error .btn-primary {
  background-color: var(--color-primary-600);
  color: white;
  box-shadow: var(--shadow-sm);
}

.error .btn-primary:hover {
  background-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.monsters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

.monster-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-base);
  cursor: pointer;
  transition: var(--transition-all);
  border-left: 4px solid var(--color-primary-600);
  border: 1px solid var(--color-neutral-200);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.monster-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-primary-600), var(--color-primary-700));
  transform: scaleY(1);
  transition: transform var(--duration-normal) var(--ease-out);
}

.monster-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-200);
}

.monster-card:hover::before {
  transform: scaleY(1.1);
}

.monster-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
  gap: var(--space-3);
}

.monster-card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.monster-name {
  color: var(--color-primary-700);
  font-size: var(--font-size-xl);
  margin: 0;
  font-weight: var(--font-weight-bold);
  flex: 1;
  line-height: var(--line-height-tight);
}

.monster-role {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  text-transform: capitalize;
  box-shadow: var(--shadow-sm);
}

.monster-ev {
  background: var(--color-success-600);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}

.monster-info {
  margin-bottom: var(--space-4);
}

.monster-organization {
  color: var(--color-neutral-600);
  font-style: italic;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.keyword-tag {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  font-size: var(--font-size-xs);
  border: 1px solid var(--color-neutral-200);
  font-weight: var(--font-weight-medium);
}

.monster-details {
  margin-bottom: var(--space-4);
}

.monster-type {
  color: var(--color-neutral-600);
  font-style: italic;
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-sm);
}

.monster-stats {
  display: flex;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
}

.monster-stats span {
  background: var(--color-neutral-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-medium);
}

.monster-preview {
  border-top: 1px solid var(--color-neutral-200);
  padding-top: var(--space-4);
}

.preview-text {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  margin: 0;
  line-height: var(--line-height-snug);
}

.no-results {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-neutral-600);
}

.no-results h3 {
  margin-bottom: var(--space-2);
  color: var(--color-neutral-700);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: var(--font-size-3xl);
  }

  .filters {
    padding: var(--space-4);
  }

  .filter-row,
  .sort-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .filter-group {
    min-width: auto;
  }

  .filter-select {
    padding: var(--space-3);
    font-size: var(--font-size-base);
  }

  .clear-filters-btn {
    align-self: stretch;
    margin-top: var(--space-2);
    padding: var(--space-3);
  }

  .monsters-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .monster-card {
    padding: var(--space-4);
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