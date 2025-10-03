import { defineStore } from 'pinia'

export interface EncounterMonster {
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
  count: number
  groupId?: string | null  // Reference to initiative group
}

export interface InitiativeGroup {
  id: string
  name: string
  initiative?: number
  monsterIds: string[]  // Array of monster IDs in this group
  order: number  // Display order
}

export interface EncounterState {
  monsters: EncounterMonster[]
  targetEV: number
  initiativeGroups: InitiativeGroup[]
  nextGroupId: number
}

export const useEncounterStore = defineStore('encounter', {
  state: (): EncounterState => ({
    monsters: [],
    targetEV: 0,
    initiativeGroups: [],
    nextGroupId: 1
  }),

  getters: {
    totalEV: (state) => {
      return state.monsters.reduce((sum, monster) => sum + (monster.ev * monster.count), 0)
    },
    
    totalMonsters: (state) => {
      return state.monsters.reduce((sum, monster) => sum + monster.count, 0)
    },

    budgetStatus: (state) => {
      if (state.targetEV === 0) return 'not-set'
      const total = state.monsters.reduce((sum, monster) => sum + (monster.ev * monster.count), 0)
      const ratio = total / state.targetEV
      if (ratio < 0.8) return 'under'
      if (ratio > 1.2) return 'over'
      return 'balanced'
    },

    hasMonster: (state) => (monsterId: string) => {
      return state.monsters.some(m => m.id === monsterId)
    },

    getMonsterCount: (state) => (monsterId: string) => {
      const monster = state.monsters.find(m => m.id === monsterId)
      return monster ? monster.count : 0
    },

    // Initiative group getters
    sortedGroups: (state) => {
      return [...state.initiativeGroups].sort((a, b) => a.order - b.order)
    },

    getMonstersInGroup: (state) => (groupId: string) => {
      return state.monsters.filter(m => m.groupId === groupId)
    },

    getGroupById: (state) => (groupId: string) => {
      return state.initiativeGroups.find(g => g.id === groupId)
    },

    ungroupedMonsters: (state) => {
      return state.monsters.filter(m => !m.groupId)
    },

    getGroupTotalEV: (state) => (groupId: string) => {
      const monsters = state.monsters.filter(m => m.groupId === groupId)
      return monsters.reduce((sum, monster) => sum + (monster.ev * monster.count), 0)
    },

    getGroupMonsterCount: (state) => (groupId: string) => {
      const monsters = state.monsters.filter(m => m.groupId === groupId)
      return monsters.reduce((sum, monster) => sum + monster.count, 0)
    }
  },

  actions: {
    addMonster(monster: Omit<EncounterMonster, 'count'>) {
      const existing = this.monsters.find(m => m.id === monster.id)
      if (existing) {
        existing.count++
      } else {
        this.monsters.push({ ...monster, count: 1, groupId: null })
      }
    },

    removeMonster(monsterId: string) {
      const index = this.monsters.findIndex(m => m.id === monsterId)
      if (index !== -1) {
        const monster = this.monsters[index]
        if (monster.count > 1) {
          monster.count--
        } else {
          this.monsters.splice(index, 1)
        }
      }
    },

    updateMonsterCount(monsterId: string, count: number) {
      const monster = this.monsters.find(m => m.id === monsterId)
      if (monster) {
        if (count <= 0) {
          this.removeMonster(monsterId)
        } else {
          monster.count = count
        }
      }
    },

    clearEncounter() {
      this.monsters = []
      this.initiativeGroups = []
      this.nextGroupId = 1
    },

    setTargetEV(ev: number) {
      this.targetEV = ev
    },

    // Initiative group actions
    createGroup(name?: string) {
      const groupId = `group-${this.nextGroupId++}`
      const order = this.initiativeGroups.length
      const group: InitiativeGroup = {
        id: groupId,
        name: name || `Group ${this.initiativeGroups.length + 1}`,
        monsterIds: [],
        order
      }
      this.initiativeGroups.push(group)
      return groupId
    },

    deleteGroup(groupId: string) {
      const index = this.initiativeGroups.findIndex(g => g.id === groupId)
      if (index !== -1) {
        // Remove groupId from all monsters in this group
        this.monsters.forEach(m => {
          if (m.groupId === groupId) {
            m.groupId = null
          }
        })
        this.initiativeGroups.splice(index, 1)
        // Update order for remaining groups
        this.initiativeGroups.forEach((g, idx) => {
          g.order = idx
        })
      }
    },

    updateGroupName(groupId: string, name: string) {
      const group = this.initiativeGroups.find(g => g.id === groupId)
      if (group) {
        group.name = name
      }
    },

    updateGroupInitiative(groupId: string, initiative: number) {
      const group = this.initiativeGroups.find(g => g.id === groupId)
      if (group) {
        group.initiative = initiative
      }
    },

    moveMonsterToGroup(monsterId: string, targetGroupId: string | null) {
      const monster = this.monsters.find(m => m.id === monsterId)
      if (monster) {
        // Remove from old group's monsterIds
        if (monster.groupId) {
          const oldGroup = this.initiativeGroups.find(g => g.id === monster.groupId)
          if (oldGroup) {
            const idx = oldGroup.monsterIds.indexOf(monsterId)
            if (idx !== -1) {
              oldGroup.monsterIds.splice(idx, 1)
            }
          }
        }
        
        // Add to new group's monsterIds
        monster.groupId = targetGroupId
        if (targetGroupId) {
          const newGroup = this.initiativeGroups.find(g => g.id === targetGroupId)
          if (newGroup && !newGroup.monsterIds.includes(monsterId)) {
            newGroup.monsterIds.push(monsterId)
          }
        }
      }
    },

    reorderGroups(groupIds: string[]) {
      // Update order based on the new array
      groupIds.forEach((groupId, index) => {
        const group = this.initiativeGroups.find(g => g.id === groupId)
        if (group) {
          group.order = index
        }
      })
    }
  }
})
