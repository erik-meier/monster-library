<template>
  <div class="encounter-builder">
    <div class="page-header">
      <h1>Encounter Builder</h1>
      <p class="page-subtitle">Create balanced encounters using Draw Steel rules</p>
    </div>

    <div class="builder-layout">
      <div class="builder-sidebar">
        <PartyConfiguration v-model="party" />
        <EncounterBudget :party="party" :monsters="encounterMonsters" :difficulty="difficulty"
          @update:difficulty="difficulty = $event" />
      </div>

      <div class="builder-main">
        <div class="section-card">
          <h2>Encounter Monsters</h2>
          <p v-if="encounterMonsters.length === 0" class="empty-state">
            No monsters added yet. Use the search below to add monsters to your encounter.
          </p>

          <div v-else class="monster-list">
            <div v-for="monster in encounterMonsters" :key="monster.id" class="monster-entry">
              <div class="monster-info">
                <h3 class="monster-name">{{ monster.name }}</h3>
                <div class="monster-stats">
                  <span class="stat-badge">Level {{ monster.level }}</span>
                  <span class="stat-badge">{{ monster.organization }}</span>
                  <span class="stat-badge ev-badge">EV {{ monster.ev }}</span>
                </div>
              </div>

              <div class="monster-controls">
                <div class="quantity-control">
                  <button type="button" class="btn btn-sm" @click="decrementMonster(monster.id)"
                    :disabled="monster.count <= 1">
                    −
                  </button>
                  <span class="quantity-display">{{ monster.count }}</span>
                  <button type="button" class="btn btn-sm" @click="incrementMonster(monster.id)">
                    +
                  </button>
                </div>
                <div class="monster-cost">
                  <span class="cost-label">Cost:</span>
                  <span class="cost-value">{{ calculateCost(monster) }} EV</span>
                </div>
                <button type="button" class="btn btn-sm btn-danger" @click="removeMonster(monster.id)"
                  title="Remove from encounter">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <h2>Add Monsters</h2>
          <div class="search-section">
            <input v-model="searchQuery" type="text" placeholder="Search monsters by name, level, or role..."
              class="form-input search-input" />

            <div class="filter-controls">
              <select v-model="filterLevel" class="form-input filter-select">
                <option value="">All Levels</option>
                <option v-for="level in 10" :key="level" :value="level">Level {{ level }}</option>
              </select>

              <select v-model="filterOrg" class="form-input filter-select">
                <option value="">All Organizations</option>
                <option value="Minion">Minion</option>
                <option value="Standard">Standard</option>
                <option value="Elite">Elite</option>
                <option value="Leader">Leader</option>
                <option value="Solo">Solo</option>
              </select>
            </div>
          </div>

          <div v-if="filteredMonsters.length === 0" class="no-results">
            No monsters match your search criteria.
          </div>

          <div v-else class="available-monsters">
            <div v-for="monster in filteredMonsters.slice(0, 20)" :key="monster.id" class="available-monster">
              <div class="monster-info">
                <h4 class="monster-name">{{ monster.name }}</h4>
                <div class="monster-stats">
                  <span class="stat-badge">Level {{ monster.level }}</span>
                  <span class="stat-badge">{{ monster.organization }}</span>
                  <span class="stat-badge">{{ monster.role }}</span>
                  <span class="stat-badge ev-badge">EV {{ monster.ev }}</span>
                </div>
              </div>
              <button type="button" class="btn btn-primary btn-sm" @click="addMonsterToEncounter(monster)">
                + Add
              </button>
            </div>
          </div>

          <p v-if="filteredMonsters.length > 20" class="results-note">
            Showing 20 of {{ filteredMonsters.length }} results. Refine your search to see more.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PartyConfiguration from '@/components/PartyConfiguration.vue'
import EncounterBudget from '@/components/EncounterBudget.vue'
import {
  calculateMonsterCost,
  type PartyConfiguration as PartyConfig,
  type MonsterInEncounter,
  type EncounterDifficulty
} from '@/utils/encounterBalance'

// State
const party = ref<PartyConfig>({
  heroes: [{ level: 3 }, { level: 3 }, { level: 3 }, { level: 3 }]
})

const difficulty = ref<EncounterDifficulty>('Standard')
const encounterMonsters = ref<MonsterInEncounter[]>([])
const searchQuery = ref('')
const filterLevel = ref<string>('')
const filterOrg = ref<string>('')

interface SimpleMonster {
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
}

// All available monsters
const allMonsters = ref<SimpleMonster[]>([])

onMounted(async () => {
  // Load all monsters using dynamic import
  const { getMonsterIndex } = await import('@/data/monsters.js')
  const indexData = getMonsterIndex() as { card: Record<string, SimpleMonster> }

  // Transform the card data into simplified monster data
  allMonsters.value = Object.entries(indexData.card).map(([id, cardData]) => ({
    id,
    name: cardData.name,
    level: cardData.level,
    ev: cardData.ev,
    role: cardData.role,
    organization: cardData.organization
  }))
})

// Computed
const filteredMonsters = computed(() => {
  let results = allMonsters.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.role?.toLowerCase().includes(query) ||
        m.level.toString().includes(query)
    )
  }

  // Filter by level
  if (filterLevel.value) {
    results = results.filter((m) => m.level === parseInt(filterLevel.value))
  }

  // Filter by organization
  if (filterOrg.value) {
    results = results.filter((m) => m.organization.toLowerCase() === filterOrg.value.toLowerCase())
  }

  // Sort by level then name
  return results.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    return a.name.localeCompare(b.name)
  })
})

// Methods
function addMonsterToEncounter(monster: SimpleMonster) {
  const existing = encounterMonsters.value.find((m) => m.id === monster.id)

  if (existing) {
    existing.count++
  } else {
    encounterMonsters.value.push({
      id: monster.id,
      name: monster.name,
      level: monster.level,
      ev: monster.ev,
      organization: monster.organization,
      count: 1
    })
  }
}

function incrementMonster(id: string) {
  const monster = encounterMonsters.value.find((m) => m.id === id)
  if (monster) {
    monster.count++
  }
}

function decrementMonster(id: string) {
  const monster = encounterMonsters.value.find((m) => m.id === id)
  if (monster && monster.count > 1) {
    monster.count--
  }
}

function removeMonster(id: string) {
  const index = encounterMonsters.value.findIndex((m) => m.id === id)
  if (index !== -1) {
    encounterMonsters.value.splice(index, 1)
  }
}

function calculateCost(monster: MonsterInEncounter): string {
  return (Math.round(calculateMonsterCost(monster) * 10) / 10).toString()
}
</script>

<style scoped>
.encounter-builder {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
}

.page-header {
  margin-bottom: var(--space-8);
  text-align: center;
}

.page-header h1 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.page-subtitle {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-neutral-600);
}

.builder-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: var(--space-6);
}

.builder-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.builder-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-card {
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-sm);
}

.section-card h2 {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.empty-state {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-neutral-500);
  font-style: italic;
}

.monster-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.monster-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  gap: var(--space-4);
}

.monster-info {
  flex: 1;
}

.monster-name {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.monster-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.stat-badge {
  padding: var(--space-1) var(--space-2);
  background: var(--color-neutral-200);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.ev-badge {
  background: var(--color-primary-200);
  color: var(--color-primary-700);
}

.monster-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.quantity-display {
  min-width: 30px;
  text-align: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.monster-cost {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 70px;
}

.cost-label {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
}

.cost-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.search-section {
  margin-bottom: var(--space-4);
}

.search-input {
  width: 100%;
  margin-bottom: var(--space-3);
}

.filter-controls {
  display: flex;
  gap: var(--space-3);
}

.filter-select {
  flex: 1;
}

.no-results {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-neutral-500);
  font-style: italic;
}

.available-monsters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-height: 600px;
  overflow-y: auto;
}

.available-monster {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  gap: var(--space-3);
  transition: all 0.2s;
}

.available-monster:hover {
  border-color: var(--color-primary-400);
  box-shadow: var(--shadow-sm);
}

.available-monster .monster-name {
  font-size: var(--font-size-base);
  margin-bottom: var(--space-1);
}

.results-note {
  margin-top: var(--space-3);
  padding: var(--space-3);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .builder-layout {
    grid-template-columns: 1fr;
  }

  .builder-sidebar {
    order: 2;
  }

  .builder-main {
    order: 1;
  }
}

@media (max-width: 640px) {
  .encounter-builder {
    padding: var(--space-4);
  }

  .monster-entry,
  .available-monster {
    flex-direction: column;
    align-items: stretch;
  }

  .monster-controls {
    justify-content: space-between;
  }

  .filter-controls {
    flex-direction: column;
  }
}
</style>
