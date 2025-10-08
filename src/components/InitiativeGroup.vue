<template>
  <div 
    class="initiative-group"
    :class="{ 'dragging-over': isDraggingOver }"
    :data-group-id="group.id"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    role="region"
    :aria-label="`Initiative group: ${group.name}`"
  >
    <!-- Group Header -->
    <div class="group-header">
      <div class="group-title-section">
        <button
          v-if="canReorder"
          class="drag-handle"
          :aria-label="`Drag to reorder ${group.name}`"
          @mousedown="startGroupDrag"
          @keydown="handleGroupKeyboard"
          tabindex="0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <input
          v-if="isEditingName"
          v-model="editedName"
          type="text"
          class="group-name-input"
          @blur="saveGroupName"
          @keydown.enter="saveGroupName"
          @keydown.esc="cancelEditName"
          ref="nameInput"
          :aria-label="`Edit group name`"
        />
        <h3 
          v-else 
          class="group-name"
          @click="startEditName"
          @keydown.enter="startEditName"
          @keydown.space.prevent="startEditName"
          tabindex="0"
          :aria-label="`Group name: ${group.name}. Press Enter to edit`"
        >
          {{ group.name }}
        </h3>
      </div>
      
      <div class="group-stats">
        <span class="stat-badge monster-count">
          {{ totalMonsterCount }} {{ totalMonsterCount === 1 ? 'Monster' : 'Monsters' }}
        </span>
        <span class="stat-badge total-ev">
          EV {{ totalEV }}
        </span>
        <button
          class="btn-icon btn-delete"
          @click="confirmDelete"
          :aria-label="`Delete ${group.name}`"
          title="Delete group"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Monster List -->
    <div class="monster-list" v-if="monstersInGroup.length > 0">
      <div
        v-for="monster in monstersInGroup"
        :key="monster.id"
        class="monster-item"
        :class="{ 
          'is-minion': isMinion(monster),
          'has-captain': hasCapitalRelationship()
        }"
        draggable="true"
        @dragstart="handleMonsterDragStart(monster, $event)"
        @dragend="handleMonsterDragEnd"
        @keydown="handleMonsterKeyboard(monster, $event)"
        tabindex="0"
        role="listitem"
        :aria-label="`${monster.name}, Level ${monster.level}, ${monster.count} count`"
      >
        <div class="monster-drag-handle" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="3" r="1.5"/>
            <circle cx="9" cy="3" r="1.5"/>
            <circle cx="3" cy="9" r="1.5"/>
            <circle cx="9" cy="9" r="1.5"/>
          </svg>
        </div>
        
        <div class="monster-info">
          <div class="monster-header">
            <span class="monster-name">{{ monster.name }}</span>
            <span v-if="isMinion(monster)" class="minion-badge" title="Minion">
              👥
            </span>
            <span v-if="isCaptain(monster)" class="captain-badge" title="Captain">
              ⭐
            </span>
          </div>
          <div class="monster-details">
            <span class="detail-badge">Lvl {{ monster.level }}</span>
            <span class="detail-badge">{{ monster.role }}</span>
            <span class="detail-badge">EV {{ monster.ev }}</span>
          </div>
        </div>
        
        <div class="monster-controls">
          <div class="count-controls">
            <button
              class="btn-icon btn-count"
              @click="decrementMonster(monster)"
              :aria-label="`Decrease ${monster.name} count`"
              :disabled="monster.count <= 1"
            >
              -
            </button>
            <span class="count-display">{{ monster.count }}</span>
            <button
              class="btn-icon btn-count"
              @click="incrementMonster(monster)"
              :aria-label="`Increase ${monster.name} count`"
            >
              +
            </button>
          </div>
          <button
            class="btn-icon btn-remove"
            @click="removeMonster(monster)"
            :aria-label="`Remove ${monster.name} from group`"
            title="Remove from group"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>Drop monsters here to add them to this group</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useEncounterStore, type EncounterMonster } from '@/stores/encounter'

interface Props {
  group: {
    id: string
    name: string
    monsterIds: string[]
    order: number
  }
  canReorder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canReorder: true
})

const emit = defineEmits<{
  delete: [groupId: string]
  reorder: [draggedGroupId: string, targetGroupId: string]
  monsterMoved: [monsterId: string, targetGroupId: string]
}>()

const encounterStore = useEncounterStore()

// State
const isDraggingOver = ref(false)
const isEditingName = ref(false)
const editedName = ref(props.group.name)
const nameInput = ref<HTMLInputElement | null>(null)

// Computed
const monstersInGroup = computed(() => {
  return encounterStore.getMonstersInGroup(props.group.id)
})

const totalEV = computed(() => {
  return encounterStore.getGroupTotalEV(props.group.id)
})

const totalMonsterCount = computed(() => {
  return encounterStore.getGroupMonsterCount(props.group.id)
})

// Helper functions
const isMinion = (monster: EncounterMonster) => {
  return monster.organization?.toLowerCase() === 'minion'
}

const isCaptain = (monster: EncounterMonster) => {
  // Check if this monster could be a captain (has minions in same group)
  const minions = monstersInGroup.value.filter(m => isMinion(m) && m.id !== monster.id)
  return minions.length > 0 && !isMinion(monster)
}

const hasCapitalRelationship = () => {
  // Check if there are both minions and non-minions in the group
  const hasMinions = monstersInGroup.value.some(m => isMinion(m))
  const hasCaptains = monstersInGroup.value.some(m => !isMinion(m))
  return hasMinions && hasCaptains
}

// Group name editing
const startEditName = () => {
  isEditingName.value = true
  editedName.value = props.group.name
  nextTick(() => {
    nameInput.value?.focus()
    nameInput.value?.select()
  })
}

const saveGroupName = () => {
  if (editedName.value.trim()) {
    encounterStore.updateGroupName(props.group.id, editedName.value.trim())
  }
  isEditingName.value = false
}

const cancelEditName = () => {
  editedName.value = props.group.name
  isEditingName.value = false
}

// Monster drag and drop
const handleMonsterDragStart = (monster: EncounterMonster, event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'monster',
      monsterId: monster.id,
      sourceGroupId: props.group.id
    }))
  }
  // Add dragging class for visual feedback
  ;(event.target as HTMLElement).classList.add('dragging')
}

const handleMonsterDragEnd = (event: DragEvent) => {
  ;(event.target as HTMLElement).classList.remove('dragging')
}

// Group drag and drop
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    const data = event.dataTransfer.types
    if (data.includes('text/plain')) {
      isDraggingOver.value = true
      event.dataTransfer.dropEffect = 'move'
    }
  }
}

const handleDragLeave = () => {
  isDraggingOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOver.value = false
  
  if (event.dataTransfer) {
    try {
      const data = JSON.parse(event.dataTransfer.getData('text/plain'))
      
      if (data.type === 'monster') {
        // Moving a monster to this group
        if (data.sourceGroupId !== props.group.id) {
          encounterStore.moveMonsterToGroup(data.monsterId, props.group.id)
          emit('monsterMoved', data.monsterId, props.group.id)
        }
      } else if (data.type === 'group') {
        // Reordering groups
        if (data.groupId !== props.group.id) {
          emit('reorder', data.groupId, props.group.id)
        }
      }
    } catch (e) {
      console.error('Error parsing drop data:', e)
    }
  }
}

// Group drag for reordering
const startGroupDrag = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const groupElement = target.closest('.initiative-group') as HTMLElement
  
  if (groupElement) {
    groupElement.setAttribute('draggable', 'true')
    
    groupElement.addEventListener('dragstart', (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: 'group',
          groupId: props.group.id
        }))
      }
      groupElement.classList.add('dragging')
    })
    
    groupElement.addEventListener('dragend', () => {
      groupElement.classList.remove('dragging')
      groupElement.removeAttribute('draggable')
    })
  }
}

// Monster controls
const incrementMonster = (monster: EncounterMonster) => {
  encounterStore.updateMonsterCount(monster.id, monster.count + 1)
}

const decrementMonster = (monster: EncounterMonster) => {
  if (monster.count > 1) {
    encounterStore.updateMonsterCount(monster.id, monster.count - 1)
  }
}

const removeMonster = (monster: EncounterMonster) => {
  encounterStore.moveMonsterToGroup(monster.id, null)
}

// Group deletion
const confirmDelete = () => {
  if (monstersInGroup.value.length > 0) {
    if (confirm(`Delete ${props.group.name}? Monsters will be moved to ungrouped.`)) {
      emit('delete', props.group.id)
    }
  } else {
    emit('delete', props.group.id)
  }
}

// Keyboard navigation
const handleGroupKeyboard = (event: KeyboardEvent) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    // Move group up
    const currentOrder = props.group.order
    if (currentOrder > 0) {
      const allGroups = encounterStore.sortedGroups
      const targetGroup = allGroups.find(g => g.order === currentOrder - 1)
      if (targetGroup) {
        emit('reorder', props.group.id, targetGroup.id)
      }
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    // Move group down
    const currentOrder = props.group.order
    const allGroups = encounterStore.sortedGroups
    if (currentOrder < allGroups.length - 1) {
      const targetGroup = allGroups.find(g => g.order === currentOrder + 1)
      if (targetGroup) {
        emit('reorder', props.group.id, targetGroup.id)
      }
    }
  }
}

const handleMonsterKeyboard = (monster: EncounterMonster, event: KeyboardEvent) => {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    removeMonster(monster)
  } else if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    incrementMonster(monster)
  } else if (event.key === '-' || event.key === '_') {
    event.preventDefault()
    decrementMonster(monster)
  }
}
</script>

<style scoped>
.initiative-group {
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: var(--transition-all);
  box-shadow: var(--shadow-sm);
}

.initiative-group.dragging-over {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  box-shadow: var(--shadow-md);
}

.initiative-group.dragging {
  opacity: 0.5;
}

/* Group Header */
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-neutral-200);
}

.group-title-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.drag-handle {
  background: none;
  border: none;
  cursor: grab;
  color: var(--color-neutral-500);
  padding: var(--space-1);
  border-radius: var(--radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-colors);
  flex-shrink: 0;
}

.drag-handle:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.drag-handle:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.drag-handle:active {
  cursor: grabbing;
}

.group-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-700);
  margin: 0;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
  transition: var(--transition-colors);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-name:hover {
  background: var(--color-neutral-100);
}

.group-name:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.group-name-input {
  flex: 1;
  min-width: 0;
  padding: var(--space-1) var(--space-2);
  border: 2px solid var(--color-primary-500);
  border-radius: var(--radius-base);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-sans);
  color: var(--color-primary-700);
}

.group-name-input:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.group-stats {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.stat-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.monster-count {
  background: var(--color-info-50);
  color: var(--color-info-700);
  border: 1px solid var(--color-info-200);
}

.total-ev {
  background: var(--color-success-50);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-200);
}

/* Monster List */
.monster-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.monster-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  transition: var(--transition-all);
  cursor: grab;
}

.monster-item:hover {
  background: var(--color-neutral-100);
  box-shadow: var(--shadow-sm);
}

.monster-item:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.monster-item.dragging {
  opacity: 0.5;
}

.monster-item.is-minion {
  border-left: 3px solid var(--color-info-500);
}

.monster-item.has-captain {
  border-left: 3px solid var(--color-warning-500);
}

.monster-drag-handle {
  color: var(--color-neutral-400);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.monster-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.monster-header {
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
}

.minion-badge,
.captain-badge {
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.monster-details {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.detail-badge {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
  background: var(--color-neutral-100);
  padding: 2px var(--space-2);
  border-radius: var(--radius-base);
}

.monster-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.count-controls {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-base);
  padding: 2px;
}

.count-display {
  min-width: 24px;
  text-align: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
}

/* Button Styles */
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
}

.btn-icon:hover {
  background: var(--color-neutral-200);
  color: var(--color-neutral-800);
}

.btn-icon:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-count {
  color: var(--color-primary-600);
  width: 24px;
  height: 24px;
  font-weight: var(--font-weight-bold);
}

.btn-count:hover:not(:disabled) {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.btn-remove {
  color: var(--color-error-600);
}

.btn-remove:hover {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.btn-delete {
  color: var(--color-error-600);
}

.btn-delete:hover {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

/* Empty State */
.empty-state {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-neutral-500);
  border: 2px dashed var(--color-neutral-300);
  border-radius: var(--radius-md);
  background: var(--color-neutral-50);
}

.empty-state p {
  margin: 0;
  font-size: var(--font-size-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .group-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .group-stats {
    width: 100%;
    justify-content: space-between;
  }

  .monster-item {
    flex-wrap: wrap;
  }

  .monster-info {
    flex: 1 1 100%;
  }

  .monster-controls {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
