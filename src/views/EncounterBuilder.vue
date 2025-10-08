<template>
  <div class="encounter-builder">
    <div class="page-header">
      <h1>Encounter Builder</h1>
      <p class="page-subtitle">Create balanced encounters using Draw Steel rules</p>
    </div>

    <div class="builder-layout">
      <div class="builder-sidebar">
        <EncounterBudget :party="party" :monsters="encounterMonsters" />
        <PartyConfiguration v-model="party" />
      </div>

      <div class="builder-main">
        <div class="section-card">
          <h2>Encounter Summary</h2>

          <CollapsibleSection title="Initiative Groups" :expanded="initiativeTrackerExpanded"
            @toggle="initiativeTrackerExpanded = $event">
            <InitiativeTracker />
          </CollapsibleSection>

          <CollapsibleSection title="Encounter Monsters" :expanded="encounterMonstersExpanded"
            @toggle="encounterMonstersExpanded = $event" ref="encounterMonstersSection">
            <p v-if="encounterMonsters.length === 0" class="empty-state">
              No monsters added yet. Use the search below to add monsters to your encounter.
            </p>

            <div v-else class="monster-list">
              <div v-for="monster in encounterMonsters" :key="monster.id" class="monster-entry">
                <div class="monster-info">
                  <h3 class="monster-name">{{ monster.name }}</h3>
                  <div class="monster-stats">
                    <span class="stat-badge">Level {{ monster.level }} {{ monster.organization }}{{ monster.role ? ' ' +
                      monster.role : '' }}</span>
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
          </CollapsibleSection>

          <CollapsibleSection title="Malice Features" :expanded="encounterMaliceExpanded"
            @toggle="encounterMaliceExpanded = $event" ref="encounterMaliceSection">
            <p v-if="encounterMalice.length === 0" class="empty-state">
              No malice features added yet. Use the search below to add malice features to your encounter.
            </p>

            <div v-else class="malice-list">
              <div v-for="malice in encounterMalice" :key="malice.id" class="malice-entry">
                <div class="malice-info">
                  <h3 class="malice-name">{{ malice.name }}</h3>
                  <div class="malice-stats">
                    <span class="stat-badge">Level {{ malice.level }}</span>
                  </div>
                  <p v-if="malice.flavor" class="malice-flavor">{{ malice.flavor }}</p>
                </div>
                <button type="button" class="btn btn-sm btn-danger" @click="removeMalice(malice.id)"
                  title="Remove from encounter">
                  ✕
                </button>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        <div class="section-card">
          <CollapsibleSection title="Add Monsters" :expanded="monstersListExpanded"
            @toggle="monstersListExpanded = $event">
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
                    <span class="stat-badge">Level {{ monster.level }} {{ monster.organization }}{{ monster.role ? ' ' +
                      monster.role : '' }}</span>
                    <span class="stat-badge ev-badge">EV {{ monster.ev }}</span>
                  </div>
                </div>
                <div class="monster-add-buttons">
                  <button type="button" class="btn btn-primary btn-sm" @click="addMonsterToEncounter(monster)">
                    + Add
                  </button>
                  <button v-if="monster.organization.toLowerCase() === 'minion'" type="button"
                    class="btn btn-primary btn-sm" @click="addMonsterToEncounter(monster, 4)"
                    title="Add a full group of 4 minions">
                    + Add 4
                  </button>
                </div>
              </div>
            </div>

            <p v-if="filteredMonsters.length > 20" class="results-note">
              Showing 20 of {{ filteredMonsters.length }} results. Refine your search to see more.
            </p>
          </CollapsibleSection>
        </div>

        <div class="section-card">
          <CollapsibleSection title="Add Malice Features" :expanded="maliceListExpanded"
            @toggle="maliceListExpanded = $event">
            <div class="search-section">
              <input v-model="maliceSearchQuery" type="text" placeholder="Search malice features by name or level..."
                class="form-input search-input" />
            </div>

            <div v-if="filteredMaliceFeatures.length === 0" class="no-results">
              No malice features match your search criteria.
            </div>

            <div v-else class="available-malice">
              <div v-for="malice in filteredMaliceFeatures.slice(0, 20)" :key="malice.id" class="available-malice-item">
                <div class="malice-info">
                  <h4 class="malice-name">{{ malice.name }}</h4>
                  <div class="malice-stats">
                    <span class="stat-badge">Level {{ malice.level }}</span>
                  </div>
                  <p v-if="malice.flavor" class="malice-flavor-preview">{{ malice.flavor }}</p>
                </div>
                <button type="button" class="btn btn-primary btn-sm" @click="addMaliceToEncounter(malice)">
                  + Add
                </button>
              </div>
            </div>

            <p v-if="filteredMaliceFeatures.length > 20" class="results-note">
              Showing 20 of {{ filteredMaliceFeatures.length }} results. Refine your search to see more.
            </p>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import PartyConfiguration from '@/components/PartyConfiguration.vue'
import EncounterBudget from '@/components/EncounterBudget.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import InitiativeTracker from '@/components/InitiativeTracker.vue'
import { useCustomMonstersStore } from '@/stores/customMonsters'
import { useEncounterStore } from '@/stores/encounter'
import {
  calculateMonsterCost,
  type PartyConfiguration as PartyConfig,
  type MonsterInEncounter
} from '@/utils/encounterBalance'

// Stores
const customMonstersStore = useCustomMonstersStore()
const encounterStore = useEncounterStore()

// State
const party = ref<PartyConfig>({
  heroes: [{ level: 3, victories: 0 }, { level: 3, victories: 0 }, { level: 3, victories: 0 }, { level: 3, victories: 0 }]
})
const encounterMonsters = ref<MonsterInEncounter[]>([])
const encounterMalice = ref<SimpleMaliceFeature[]>([])
const searchQuery = ref('')
const filterLevel = ref<string>('')
const filterOrg = ref<string>('')
const initiativeTrackerExpanded = ref(true)
const encounterMonstersExpanded = ref(true)
const encounterMaliceExpanded = ref(true)
const monstersListExpanded = ref(true)
const maliceListExpanded = ref(true)
const maliceSearchQuery = ref('')

// Template refs for CollapsibleSection components
const encounterMonstersSection = ref()
const encounterMaliceSection = ref()

interface SimpleMonster {
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
}

interface SimpleMaliceFeature {
  id: string
  name: string
  level: number
  flavor: string
}

// All available monsters
const allMonsters = ref<SimpleMonster[]>([])
const allMaliceFeatures = ref<SimpleMaliceFeature[]>([])

onMounted(async () => {
  // Load all monsters and malice features using dynamic import
  const monstersModule = await import('@/data/monsters.js')
  const { getMonsterIndex } = monstersModule
  const indexData = getMonsterIndex() as { card: Record<string, SimpleMonster> }

  // Transform the card data into simplified monster data
  const officialMonsters = Object.entries(indexData.card).map(([id, cardData]) => ({
    id,
    name: cardData.name,
    level: cardData.level,
    ev: cardData.ev,
    role: cardData.role,
    organization: cardData.organization
  }))

  // Load custom monsters from store
  customMonstersStore.loadFromStorage()
  const customMonsters = customMonstersStore.allCustomMonsters.map(monster => ({
    id: monster.id,
    name: monster.name,
    level: monster.level,
    ev: monster.ev,
    role: monster.role,
    organization: monster.organization
  }))

  // Combine official and custom monsters
  allMonsters.value = [...officialMonsters, ...customMonsters]

  // Load malice features
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maliceData = (monstersModule as any).maliceFeatures as Record<string, any>
  if (maliceData) {
    allMaliceFeatures.value = Object.entries(maliceData).map(([id, data]) => ({
      id,
      name: data.name,
      level: data.level,
      flavor: data.flavor || ''
    }))
  }
})

// Sync local encounter monsters with Pinia store on mount
onMounted(() => {
  syncFromStore()
})

// Watch for changes in the encounter store and sync to local state
watch(() => encounterStore.monsters, () => {
  syncFromStore()
}, { deep: true })

// Watch for changes in local state and sync to store
watch(encounterMonsters, (newMonsters) => {
  syncToStore(newMonsters)
}, { deep: true })

function syncFromStore() {
  encounterMonsters.value = encounterStore.monsters.map(m => ({
    id: m.id,
    name: m.name,
    level: m.level,
    ev: m.ev,
    organization: m.organization,
    role: m.role,
    count: m.count
  }))
}

function syncToStore(monsters: MonsterInEncounter[]) {
  // Clear existing monsters in store if they don't exist locally
  const localIds = new Set(monsters.map(m => m.id))
  const storeMonsters = encounterStore.monsters
  
  for (const storeMonster of storeMonsters) {
    if (!localIds.has(storeMonster.id)) {
      encounterStore.removeMonster(storeMonster.id)
    }
  }
  
  // Update or add monsters from local state
  for (const monster of monsters) {
    const existingInStore = storeMonsters.find(m => m.id === monster.id)
    if (existingInStore) {
      // Update count if different
      if (existingInStore.count !== monster.count) {
        encounterStore.updateMonsterCount(monster.id, monster.count)
      }
    } else {
      // Add new monster with defaults for optional fields
      encounterStore.addMonster({
        id: monster.id,
        name: monster.name,
        level: monster.level,
        ev: monster.ev,
        organization: monster.organization,
        role: monster.role || ''
      })
    }
  }
}

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

const filteredMaliceFeatures = computed(() => {
  let results = allMaliceFeatures.value

  // Filter by search query
  if (maliceSearchQuery.value) {
    const query = maliceSearchQuery.value.toLowerCase()
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.flavor?.toLowerCase().includes(query) ||
        m.level.toString().includes(query)
    )
  }

  // Sort by level then name
  return results.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    return a.name.localeCompare(b.name)
  })
})

// Helper function to update collapsible heights
async function updateCollapsibleHeights() {
  await nextTick()
  if (encounterMonstersSection.value?.updateHeight) {
    encounterMonstersSection.value.updateHeight()
  }
  if (encounterMaliceSection.value?.updateHeight) {
    encounterMaliceSection.value.updateHeight()
  }
}

// Methods
function addMonsterToEncounter(monster: SimpleMonster, count: number = 1) {
  // Add to encounter store directly
  for (let i = 0; i < count; i++) {
    encounterStore.addMonster({
      id: monster.id,
      name: monster.name,
      level: monster.level,
      ev: monster.ev,
      organization: monster.organization,
      role: monster.role || ''
    })
  }

  // Update heights after content changes
  updateCollapsibleHeights()
}

function incrementMonster(id: string) {
  const monster = encounterStore.monsters.find((m) => m.id === id)
  if (monster) {
    encounterStore.updateMonsterCount(id, monster.count + 1)
    updateCollapsibleHeights()
  }
}

function decrementMonster(id: string) {
  const monster = encounterStore.monsters.find((m) => m.id === id)
  if (monster && monster.count > 1) {
    encounterStore.updateMonsterCount(id, monster.count - 1)
    updateCollapsibleHeights()
  }
}

function removeMonster(id: string) {
  encounterStore.removeMonster(id)
  updateCollapsibleHeights()
}

function calculateCost(monster: MonsterInEncounter): string {
  return (Math.round(calculateMonsterCost(monster) * 10) / 10).toString()
}

function addMaliceToEncounter(malice: SimpleMaliceFeature) {
  const existing = encounterMalice.value.find((m) => m.id === malice.id)
  if (!existing) {
    encounterMalice.value.push(malice)
    updateCollapsibleHeights()
  }
}

function removeMalice(id: string) {
  const index = encounterMalice.value.findIndex((m) => m.id === id)
  if (index !== -1) {
    encounterMalice.value.splice(index, 1)
    updateCollapsibleHeights()
  }
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
  color: var(--color-neutral-800);
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
  max-height: 80vh;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .available-monsters {
    max-height: 60vh;
  }
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

.monster-add-buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
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

/* Malice Features Styling */
.malice-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.malice-entry {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  gap: var(--space-4);
}

.malice-info {
  flex: 1;
}

.malice-name {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.malice-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.malice-flavor {
  margin: var(--space-2) 0 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  font-style: italic;
  line-height: var(--line-height-relaxed);
}

.available-malice {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-height: 80vh;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .available-malice {
    max-height: 60vh;
  }
}

.available-malice-item {
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

.available-malice-item:hover {
  border-color: var(--color-primary-400);
  box-shadow: var(--shadow-sm);
}

.available-malice-item .malice-name {
  font-size: var(--font-size-base);
  margin-bottom: var(--space-1);
}

.malice-flavor-preview {
  margin: var(--space-1) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
  font-style: italic;
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
