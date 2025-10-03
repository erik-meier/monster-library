<template>
  <div class="monster-selector">
    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="search-bar">
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Search monsters..." 
          class="search-input"
          @input="resetPagination"
        >
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label for="level-filter">Level:</label>
          <select id="level-filter" v-model="selectedLevel" class="filter-select" @change="resetPagination">
            <option value="">All Levels</option>
            <option v-for="level in availableLevels" :key="level" :value="level">
              Level {{ level }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="ev-filter">EV:</label>
          <select id="ev-filter" v-model="selectedEV" class="filter-select" @change="resetPagination">
            <option value="">All EVs</option>
            <option v-for="ev in availableEVs" :key="ev" :value="ev">
              {{ ev }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="role-filter">Role:</label>
          <select id="role-filter" v-model="selectedRole" class="filter-select" @change="resetPagination">
            <option value="">All Roles</option>
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="organization-filter">Organization:</label>
          <select id="organization-filter" v-model="selectedOrganization" class="filter-select" @change="resetPagination">
            <option value="">All Organizations</option>
            <option v-for="org in availableOrganizations" :key="org.value" :value="org.value">
              {{ org.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="keyword-filter">Keywords:</label>
          <input 
            id="keyword-filter" 
            v-model="selectedKeywords" 
            type="text" 
            placeholder="Filter by keywords..." 
            class="filter-input"
            @input="resetPagination"
          >
        </div>
      </div>

      <div class="filter-actions">
        <button @click="clearFilters" class="btn btn-secondary">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading monsters..." />

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h3>Failed to Load Monsters</h3>
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- Monster Grid -->
    <div v-else>
      <div class="results-header">
        <p class="results-count">
          Showing {{ paginatedMonsters.length }} of {{ filteredMonsters.length }} monsters
        </p>
      </div>

      <div v-if="paginatedMonsters.length === 0" class="no-results">
        <h3>No monsters found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>

      <div v-else class="monster-grid">
        <div 
          v-for="monster in paginatedMonsters" 
          :key="monster.id" 
          class="monster-card"
          :class="{ 'monster-card-selected': encounterStore.hasMonster(monster.id) }"
          tabindex="0"
          @keydown.enter="addToEncounter(monster)"
          @keydown.space.prevent="addToEncounter(monster)"
        >
          <div class="monster-card-header">
            <h3 class="monster-name">{{ monster.name }}</h3>
            <span v-if="monster.ev !== undefined && monster.ev !== null" class="monster-ev">
              EV {{ monster.ev }}
            </span>
          </div>

          <div class="monster-card-body">
            <div class="monster-stats">
              <span class="stat-badge stat-level">Level {{ monster.level }}</span>
              <span v-if="monster.role" class="stat-badge stat-role">{{ monster.role }}</span>
              <span v-if="monster.organization" class="stat-badge stat-org">{{ monster.organization }}</span>
            </div>

            <div v-if="monster.keywords && monster.keywords.length > 0" class="monster-keywords">
              <span v-for="keyword in monster.keywords.slice(0, 3)" :key="keyword" class="keyword-tag">
                {{ keyword }}
              </span>
              <span v-if="monster.keywords.length > 3" class="keyword-more">
                +{{ monster.keywords.length - 3 }}
              </span>
            </div>
          </div>

          <div class="monster-card-footer">
            <button 
              @click="addToEncounter(monster)" 
              class="btn btn-add"
              :class="{ 'btn-added': encounterStore.hasMonster(monster.id) }"
              :aria-label="`Add ${monster.name} to encounter`"
            >
              <span v-if="encounterStore.hasMonster(monster.id)">
                ✓ Added ({{ encounterStore.getMonsterCount(monster.id) }})
              </span>
              <span v-else>+ Add to Encounter</span>
            </button>
            <button 
              @click="viewMonster(monster.id)" 
              class="btn btn-view"
              :aria-label="`View ${monster.name} details`"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1" 
          class="pagination-btn"
          aria-label="Previous page"
        >
          ← Previous
        </button>
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages" 
          class="pagination-btn"
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEncounterStore } from '@/stores/encounter'
import { useCustomMonstersStore } from '@/stores/customMonsters'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

interface Monster {
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
  keywords: string[]
  isCustom: boolean
}

interface MonsterCardData {
  name: string
  level: number
  ev: number
  role: string
  organization: string
  keywords?: string[]
}

const router = useRouter()
const encounterStore = useEncounterStore()
const customMonstersStore = useCustomMonstersStore()

// State
const monsters = ref<Monster[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchTerm = ref('')
const selectedKeywords = ref('')
const selectedLevel = ref('')
const selectedEV = ref('')
const selectedRole = ref('')
const selectedOrganization = ref('')
const currentPage = ref(1)
const itemsPerPage = 12

// Computed
const availableLevels = computed(() => {
  const levels = [...new Set(monsters.value.map(m => m.level).filter(l => l !== undefined))]
  return levels.sort((a, b) => a - b)
})

const availableEVs = computed(() => {
  const evs = [...new Set(monsters.value.map(m => m.ev).filter(ev => ev !== undefined))]
  return evs.sort((a, b) => a - b)
})

const availableRoles = computed(() => {
  const roles = [...new Set(monsters.value.map(m => m.role).filter(r => r))]
  return roles.sort().map(role => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1)
  }))
})

const availableOrganizations = computed(() => {
  const orgs = [...new Set(monsters.value.map(m => m.organization?.toLowerCase()).filter(o => o))]
  return orgs.sort().map(org => ({
    value: org,
    label: org.charAt(0).toUpperCase() + org.slice(1)
  }))
})

const filteredMonsters = computed(() => {
  let filtered = monsters.value

  // Search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(monster =>
      monster.name.toLowerCase().includes(term)
    )
  }

  // Keywords filter
  if (selectedKeywords.value) {
    const keywordTerms = selectedKeywords.value.toLowerCase().split(',').map(k => k.trim()).filter(k => k)
    filtered = filtered.filter(monster => {
      if (!monster.keywords || monster.keywords.length === 0) return false
      return keywordTerms.every(term =>
        monster.keywords.some((keyword: string) => keyword.toLowerCase().includes(term))
      )
    })
  }

  // Level filter
  if (selectedLevel.value !== '') {
    filtered = filtered.filter(monster => monster.level === parseInt(selectedLevel.value))
  }

  // EV filter
  if (selectedEV.value) {
    filtered = filtered.filter(monster => monster.ev === parseInt(selectedEV.value))
  }

  // Role filter
  if (selectedRole.value) {
    filtered = filtered.filter(monster => monster.role === selectedRole.value)
  }

  // Organization filter
  if (selectedOrganization.value) {
    filtered = filtered.filter(monster => monster.organization?.toLowerCase() === selectedOrganization.value)
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredMonsters.value.length / itemsPerPage)
})

const paginatedMonsters = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredMonsters.value.slice(start, end)
})

// Methods
const loadMonsters = async () => {
  loading.value = true
  error.value = null
  try {
    const { getMonsterIndex } = await import('@/data/monsters.js')
    const indexData = getMonsterIndex()

    // Transform the card data into monsters array
    const bundledMonsters = Object.entries(indexData.card as Record<string, MonsterCardData>).map(([id, cardData]) => ({
      id,
      name: cardData.name,
      level: cardData.level,
      ev: cardData.ev,
      role: cardData.role,
      organization: cardData.organization,
      keywords: cardData.keywords || [],
      isCustom: false
    }))

    // Get custom monsters
    const customMonsters = customMonstersStore.getAllCustomMonsters().map((monster): Monster => ({
      id: monster.id,
      name: monster.name,
      level: monster.level,
      ev: monster.ev,
      role: monster.role,
      organization: monster.organization,
      keywords: monster.keywords || [],
      isCustom: true
    }))

    // Combine and sort
    monsters.value = [...bundledMonsters, ...customMonsters]
    monsters.value.sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    error.value = `Failed to load monsters: ${err instanceof Error ? err.message : String(err)}`
  } finally {
    loading.value = false
  }
}

const addToEncounter = (monster: Monster) => {
  encounterStore.addMonster({
    id: monster.id,
    name: monster.name,
    level: monster.level,
    ev: monster.ev || 0,
    role: monster.role || '',
    organization: monster.organization || ''
  })
}

const viewMonster = (monsterId: string) => {
  router.push(`/monster/${monsterId}`)
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedKeywords.value = ''
  selectedLevel.value = ''
  selectedEV.value = ''
  selectedRole.value = ''
  selectedOrganization.value = ''
  resetPagination()
}

const resetPagination = () => {
  currentPage.value = 1
}

// Lifecycle
onMounted(() => {
  loadMonsters()
})
</script>

<style scoped>
.monster-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Filters Section */
.filters-section {
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
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

.filter-row {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 150px;
  flex: 1;
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
  cursor: pointer;
  transition: var(--transition-colors);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--focus-ring);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

/* Results Header */
.results-header {
  margin-bottom: var(--space-4);
}

.results-count {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Monster Grid */
.monster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.monster-card {
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: var(--transition-all);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.monster-card:hover,
.monster-card:focus {
  border-color: var(--color-primary-400);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  outline: none;
}

.monster-card-selected {
  border-color: var(--color-success-600);
  background: var(--color-success-50);
}

.monster-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.monster-name {
  color: var(--color-primary-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
  line-height: var(--line-height-tight);
}

.monster-ev {
  background: var(--color-primary-600);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  flex-shrink: 0;
}

.monster-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex-grow: 1;
}

.monster-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.stat-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.stat-level {
  background: var(--color-info-50);
  color: var(--color-info-700);
  border: 1px solid var(--color-info-200);
}

.stat-role {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  border: 1px solid var(--color-warning-200);
}

.stat-org {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
}

.monster-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.keyword-tag {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  font-size: var(--font-size-xs);
  border: 1px solid var(--color-neutral-200);
}

.keyword-more {
  color: var(--color-neutral-500);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.monster-card-footer {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
}

/* Buttons */
.btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 36px;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.btn-add {
  flex: 1;
  background: var(--color-success-600);
  color: white;
}

.btn-add:hover {
  background: var(--color-success-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-added {
  background: var(--color-success-700);
}

.btn-view {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
}

.btn-view:hover {
  background: var(--color-neutral-200);
  border-color: var(--color-neutral-400);
}

.btn-secondary {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
}

.btn-secondary:hover {
  background: var(--color-neutral-200);
  border-color: var(--color-neutral-400);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6) 0;
}

.pagination-btn {
  padding: var(--space-2) var(--space-4);
  border: 2px solid var(--color-primary-600);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-primary-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-primary-600);
  color: white;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--color-neutral-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Error and No Results */
.error,
.no-results {
  background: white;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  text-align: center;
  border: 1px solid var(--color-neutral-200);
}

.error-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-4);
}

.error-content h3,
.no-results h3 {
  color: var(--color-neutral-800);
  margin: 0 0 var(--space-2) 0;
}

.error-content p,
.no-results p {
  color: var(--color-neutral-600);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .monster-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .monster-card-footer {
    flex-direction: column;
  }
}
</style>
