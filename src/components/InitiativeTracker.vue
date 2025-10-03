<template>
  <div class="initiative-tracker">
    <div class="tracker-header">
      <h2>Initiative Groups</h2>
      <div class="header-actions">
        <button 
          class="btn btn-primary"
          @click="createNewGroup"
          :aria-label="'Create new initiative group'"
        >
          + New Group
        </button>
      </div>
    </div>

    <!-- Initiative Groups -->
    <div class="groups-container" v-if="sortedGroups.length > 0">
      <TransitionGroup name="group-list" tag="div" class="groups-list">
        <InitiativeGroup
          v-for="group in sortedGroups"
          :key="group.id"
          :group="group"
          :can-reorder="true"
          :show-initiative="true"
          @delete="handleDeleteGroup"
          @reorder="handleReorderGroups"
          @monster-moved="handleMonsterMoved"
        />
      </TransitionGroup>
    </div>

    <!-- Ungrouped Monsters Section -->
    <div 
      v-if="ungroupedMonsters.length > 0" 
      class="ungrouped-section"
      @dragover.prevent="handleUngroupedDragOver"
      @drop="handleUngroupedDrop"
      :class="{ 'dragging-over': isDraggingOverUngrouped }"
    >
      <div class="ungrouped-header">
        <h3>Ungrouped Monsters</h3>
        <button 
          class="btn btn-secondary btn-sm"
          @click="groupAllUngrouped"
          :aria-label="'Create group with all ungrouped monsters'"
        >
          Group All
        </button>
      </div>
      
      <div class="monster-grid">
        <div
          v-for="monster in ungroupedMonsters"
          :key="monster.id"
          class="ungrouped-monster"
          draggable="true"
          @dragstart="handleUngroupedMonsterDragStart(monster, $event)"
          @dragend="handleMonsterDragEnd"
          tabindex="0"
          role="listitem"
          :aria-label="`${monster.name}, Level ${monster.level}`"
        >
          <div class="monster-drag-icon">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="3" cy="3" r="1.5"/>
              <circle cx="9" cy="3" r="1.5"/>
              <circle cx="3" cy="9" r="1.5"/>
              <circle cx="9" cy="9" r="1.5"/>
            </svg>
          </div>
          
          <div class="monster-content">
            <div class="monster-name-row">
              <span class="monster-name">{{ monster.name }}</span>
              <span class="monster-count-badge">×{{ monster.count }}</span>
            </div>
            <div class="monster-stats-row">
              <span class="stat">Lvl {{ monster.level }}</span>
              <span class="stat">{{ monster.role }}</span>
              <span class="stat">EV {{ monster.ev }}</span>
            </div>
          </div>
          
          <button
            class="btn-icon btn-remove"
            @click.stop="removeUngroupedMonster(monster)"
            :aria-label="`Remove ${monster.name} from encounter`"
            title="Remove from encounter"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="sortedGroups.length === 0 && ungroupedMonsters.length === 0" class="empty-state">
      <div class="empty-icon">🎲</div>
      <h3>No Monsters in Encounter</h3>
      <p>Add monsters from the monster selector to organize them into initiative groups.</p>
    </div>

    <!-- Help Text -->
    <div class="help-text" v-if="sortedGroups.length > 0 || ungroupedMonsters.length > 0">
      <h4>Keyboard Shortcuts</h4>
      <ul>
        <li><kbd>↑</kbd> / <kbd>↓</kbd> on group drag handle: Reorder groups</li>
        <li><kbd>+</kbd> / <kbd>-</kbd> on monster: Adjust count</li>
        <li><kbd>Delete</kbd> / <kbd>Backspace</kbd> on monster: Remove from group</li>
        <li><kbd>Enter</kbd> / <kbd>Space</kbd> on group name: Edit name</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEncounterStore, type EncounterMonster } from '@/stores/encounter'
import InitiativeGroup from './InitiativeGroup.vue'

const encounterStore = useEncounterStore()

// State
const isDraggingOverUngrouped = ref(false)

// Computed
const sortedGroups = computed(() => {
  return encounterStore.sortedGroups
})

const ungroupedMonsters = computed(() => {
  return encounterStore.ungroupedMonsters
})

// Actions
const createNewGroup = () => {
  encounterStore.createGroup()
}

const handleDeleteGroup = (groupId: string) => {
  encounterStore.deleteGroup(groupId)
}

const handleReorderGroups = (draggedGroupId: string, targetGroupId: string) => {
  const allGroups = encounterStore.sortedGroups
  const draggedGroup = allGroups.find(g => g.id === draggedGroupId)
  const targetGroup = allGroups.find(g => g.id === targetGroupId)
  
  if (draggedGroup && targetGroup) {
    const draggedOrder = draggedGroup.order
    const targetOrder = targetGroup.order
    
    // Swap orders
    const newOrder = allGroups.map(g => {
      if (g.id === draggedGroupId) {
        return { ...g, order: targetOrder }
      } else if (g.id === targetGroupId) {
        return { ...g, order: draggedOrder }
      }
      return g
    }).sort((a, b) => a.order - b.order)
    
    // Update all group orders
    const groupIds = newOrder.map(g => g.id)
    encounterStore.reorderGroups(groupIds)
  }
}

const handleMonsterMoved = (monsterId: string, targetGroupId: string) => {
  // Already handled by the store in InitiativeGroup component
  console.log(`Monster ${monsterId} moved to group ${targetGroupId}`)
}

const groupAllUngrouped = () => {
  const groupId = encounterStore.createGroup('New Group')
  ungroupedMonsters.value.forEach(monster => {
    encounterStore.moveMonsterToGroup(monster.id, groupId)
  })
}

// Ungrouped monster drag handlers
const handleUngroupedMonsterDragStart = (monster: EncounterMonster, event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'monster',
      monsterId: monster.id,
      sourceGroupId: null
    }))
  }
  ;(event.target as HTMLElement).classList.add('dragging')
}

const handleMonsterDragEnd = (event: DragEvent) => {
  ;(event.target as HTMLElement).classList.remove('dragging')
}

const handleUngroupedDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOverUngrouped.value = true
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleUngroupedDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOverUngrouped.value = false
  
  if (event.dataTransfer) {
    try {
      const data = JSON.parse(event.dataTransfer.getData('text/plain'))
      
      if (data.type === 'monster' && data.sourceGroupId) {
        // Moving a monster back to ungrouped
        encounterStore.moveMonsterToGroup(data.monsterId, null)
      }
    } catch (e) {
      console.error('Error parsing drop data:', e)
    }
  }
}

const removeUngroupedMonster = (monster: EncounterMonster) => {
  encounterStore.removeMonster(monster.id)
}
</script>

<style scoped>
.initiative-tracker {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Header */
.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 2px solid var(--color-neutral-200);
}

.tracker-header h2 {
  margin: 0;
  color: var(--color-primary-700);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

/* Groups Container */
.groups-container {
  display: flex;
  flex-direction: column;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Group List Transitions */
.group-list-move,
.group-list-enter-active,
.group-list-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.group-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.group-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.group-list-leave-active {
  position: absolute;
}

/* Ungrouped Section */
.ungrouped-section {
  background: white;
  border: 2px dashed var(--color-neutral-300);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: var(--transition-all);
}

.ungrouped-section.dragging-over {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  box-shadow: var(--shadow-md);
}

.ungrouped-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-neutral-200);
}

.ungrouped-header h3 {
  margin: 0;
  color: var(--color-neutral-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.monster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-3);
}

.ungrouped-monster {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  transition: var(--transition-all);
  cursor: grab;
  position: relative;
}

.ungrouped-monster:hover {
  background: var(--color-neutral-100);
  box-shadow: var(--shadow-sm);
  border-color: var(--color-neutral-300);
}

.ungrouped-monster:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.ungrouped-monster.dragging {
  opacity: 0.5;
}

.monster-drag-icon {
  color: var(--color-neutral-400);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.monster-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.monster-name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.monster-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.monster-count-badge {
  background: var(--color-primary-600);
  color: white;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.monster-stats-row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.stat {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
  background: white;
  padding: 2px var(--space-2);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-neutral-200);
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
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.btn-primary {
  background: var(--color-primary-600);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-700);
  box-shadow: var(--shadow-sm);
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

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-colors);
  color: var(--color-neutral-600);
  flex-shrink: 0;
}

.btn-icon:hover {
  background: var(--color-neutral-200);
  color: var(--color-neutral-800);
}

.btn-icon:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.btn-remove {
  color: var(--color-error-600);
}

.btn-remove:hover {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-12);
  background: white;
  border: 2px dashed var(--color-neutral-300);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  color: var(--color-neutral-800);
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-xl);
}

.empty-state p {
  color: var(--color-neutral-600);
  margin: 0;
  font-size: var(--font-size-base);
}

/* Help Text */
.help-text {
  background: var(--color-info-50);
  border: 1px solid var(--color-info-200);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.help-text h4 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-info-800);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.help-text ul {
  margin: 0;
  padding-left: var(--space-5);
  color: var(--color-info-700);
  font-size: var(--font-size-sm);
}

.help-text li {
  margin-bottom: var(--space-1);
}

.help-text kbd {
  background: white;
  border: 1px solid var(--color-info-300);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-1);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-info-900);
  box-shadow: 0 1px 0 var(--color-info-300);
}

/* Responsive Design */
@media (max-width: 768px) {
  .tracker-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .monster-grid {
    grid-template-columns: 1fr;
  }

  .help-text {
    display: none;
  }
}
</style>
