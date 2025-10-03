<template>
  <div class="encounter-summary">
    <div class="summary-header">
      <h2>Current Encounter</h2>
      <button 
        v-if="encounterStore.monsters.length > 0"
        @click="clearEncounter" 
        class="btn btn-clear"
        aria-label="Clear encounter"
      >
        Clear All
      </button>
    </div>

    <!-- Budget Display -->
    <div class="budget-section">
      <div class="budget-header">
        <h3>Encounter Budget</h3>
      </div>
      <div class="budget-display" :class="`budget-${encounterStore.budgetStatus}`">
        <div class="budget-stat">
          <span class="budget-label">Total EV</span>
          <span class="budget-value">{{ encounterStore.totalEV }}</span>
        </div>
        <div v-if="encounterStore.targetEV > 0" class="budget-stat">
          <span class="budget-label">Target EV</span>
          <span class="budget-value">{{ encounterStore.targetEV }}</span>
        </div>
        <div class="budget-stat">
          <span class="budget-label">Monsters</span>
          <span class="budget-value">{{ encounterStore.totalMonsters }}</span>
        </div>
      </div>

      <div v-if="encounterStore.budgetStatus !== 'not-set'" class="budget-status">
        <div v-if="encounterStore.budgetStatus === 'balanced'" class="status-message status-balanced">
          ✓ Well balanced encounter
        </div>
        <div v-else-if="encounterStore.budgetStatus === 'under'" class="status-message status-under">
          ⚠ Below target - consider adding more monsters
        </div>
        <div v-else-if="encounterStore.budgetStatus === 'over'" class="status-message status-over">
          ⚠ Above target - encounter may be too difficult
        </div>
      </div>
    </div>

    <!-- Monster List -->
    <div v-if="encounterStore.monsters.length === 0" class="empty-state">
      <div class="empty-icon">🐉</div>
      <p>No monsters added yet</p>
      <p class="empty-hint">Search and select monsters below to build your encounter</p>
    </div>

    <div v-else class="monster-list">
      <div 
        v-for="monster in encounterStore.monsters" 
        :key="monster.id" 
        class="encounter-monster"
      >
        <div class="monster-info">
          <div class="monster-main">
            <h4 class="monster-name">{{ monster.name }}</h4>
            <div class="monster-meta">
              <span class="meta-badge">Level {{ monster.level }}</span>
              <span v-if="monster.role" class="meta-badge">{{ monster.role }}</span>
              <span v-if="monster.organization" class="meta-badge">{{ monster.organization }}</span>
            </div>
          </div>
          
          <div class="monster-controls">
            <div class="count-controls">
              <button 
                @click="decreaseCount(monster.id)"
                class="count-btn"
                aria-label="Decrease count"
              >
                −
              </button>
              <span class="count-display">{{ monster.count }}</span>
              <button 
                @click="increaseCount(monster.id)"
                class="count-btn"
                aria-label="Increase count"
              >
                +
              </button>
            </div>
            <button 
              @click="removeMonster(monster.id)"
              class="btn-remove"
              aria-label="Remove monster"
            >
              ×
            </button>
          </div>
        </div>

        <div class="monster-total">
          <span class="total-label">Subtotal:</span>
          <span class="total-value">EV {{ monster.ev * monster.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEncounterStore } from '@/stores/encounter'

const encounterStore = useEncounterStore()

const increaseCount = (monsterId: string) => {
  encounterStore.addMonster(
    encounterStore.monsters.find(m => m.id === monsterId)!
  )
}

const decreaseCount = (monsterId: string) => {
  encounterStore.removeMonster(monsterId)
}

const removeMonster = (monsterId: string) => {
  const monster = encounterStore.monsters.find(m => m.id === monsterId)
  if (monster) {
    encounterStore.updateMonsterCount(monsterId, 0)
  }
}

const clearEncounter = () => {
  if (confirm('Are you sure you want to clear the entire encounter?')) {
    encounterStore.clearEncounter()
  }
}
</script>

<style scoped>
.encounter-summary {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-neutral-200);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  position: sticky;
  top: var(--space-4);
  max-height: calc(100vh - var(--space-8));
  overflow-y: auto;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-4);
  border-bottom: 2px solid var(--color-neutral-200);
}

.summary-header h2 {
  color: var(--color-primary-700);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.btn-clear {
  padding: var(--space-2) var(--space-3);
  background: var(--color-error-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
}

.btn-clear:hover {
  background: var(--color-error-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Budget Section */
.budget-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.budget-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
  margin: 0;
}

.budget-display {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-neutral-200);
}

.budget-balanced {
  background: var(--color-success-50);
  border-color: var(--color-success-300);
}

.budget-under {
  background: var(--color-warning-50);
  border-color: var(--color-warning-300);
}

.budget-over {
  background: var(--color-error-50);
  border-color: var(--color-error-300);
}

.budget-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.budget-label {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.budget-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.budget-status {
  margin-top: var(--space-2);
}

.status-message {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
}

.status-balanced {
  background: var(--color-success-50);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-300);
}

.status-under {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  border: 1px solid var(--color-warning-300);
}

.status-over {
  background: var(--color-error-50);
  color: var(--color-error-700);
  border: 1px solid var(--color-error-300);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-neutral-600);
}

.empty-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-4);
}

.empty-state p {
  margin: var(--space-2) 0;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-500);
}

/* Monster List */
.monster-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.encounter-monster {
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  transition: var(--transition-all);
}

.encounter-monster:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}

.monster-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.monster-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.monster-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
  margin: 0;
  line-height: var(--line-height-tight);
}

.monster-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.meta-badge {
  padding: var(--space-1) var(--space-2);
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-base);
  font-size: var(--font-size-xs);
  color: var(--color-neutral-700);
}

.ev-badge {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
  font-weight: var(--font-weight-semibold);
}

.monster-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.count-controls {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: white;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  padding: var(--space-1);
}

.count-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-base);
  color: var(--color-neutral-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: var(--transition-all);
  line-height: 1;
}

.count-btn:hover {
  background: var(--color-primary-100);
  border-color: var(--color-primary-400);
  color: var(--color-primary-700);
}

.count-display {
  min-width: 32px;
  text-align: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
}

.btn-remove {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-error-50);
  border: 1px solid var(--color-error-300);
  border-radius: var(--radius-md);
  color: var(--color-error-700);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: var(--transition-all);
  line-height: 1;
}

.btn-remove:hover {
  background: var(--color-error-600);
  border-color: var(--color-error-600);
  color: white;
}

.monster-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-neutral-200);
}

.total-label {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  font-weight: var(--font-weight-medium);
}

.total-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-700);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .encounter-summary {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .monster-info {
    flex-direction: column;
  }

  .monster-controls {
    align-self: flex-start;
  }
}
</style>
