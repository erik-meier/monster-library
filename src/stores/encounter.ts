import { defineStore } from 'pinia'

export interface EncounterMonster {
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
  count: number
}

export interface EncounterState {
  monsters: EncounterMonster[]
  targetEV: number
}

export const useEncounterStore = defineStore('encounter', {
  state: (): EncounterState => ({
    monsters: [],
    targetEV: 0
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
    }
  },

  actions: {
    addMonster(monster: Omit<EncounterMonster, 'count'>) {
      const existing = this.monsters.find(m => m.id === monster.id)
      if (existing) {
        existing.count++
      } else {
        this.monsters.push({ ...monster, count: 1 })
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
    },

    setTargetEV(ev: number) {
      this.targetEV = ev
    }
  }
})
