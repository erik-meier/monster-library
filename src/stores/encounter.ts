import { defineStore } from 'pinia'
import type { PartyConfiguration } from '@/utils/encounterBalance'

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
  monsterIds: string[]  // Array of monster IDs in this group
  order: number  // Display order
}

export interface EncounterState {
  monsters: EncounterMonster[]
  targetEV: number
  initiativeGroups: InitiativeGroup[]
  nextGroupId: number
  party: PartyConfiguration
}

export interface SavedEncounter {
  id: string
  name: string
  description?: string
  monsters: EncounterMonster[]
  targetEV: number
  initiativeGroups: InitiativeGroup[]
  nextGroupId: number
  party: PartyConfiguration
  createdAt: string
  updatedAt: string
}

export interface EncounterValidationError {
  field: string
  message: string
}

export interface EncounterValidationResult {
  isValid: boolean
  errors: EncounterValidationError[]
}

const STORAGE_KEY = 'savedEncounters'
const AUTOSAVE_KEY = 'encounterAutosave'

export const useEncounterStore = defineStore('encounter', {
  state: (): EncounterState & { savedEncounters: Record<string, SavedEncounter>, isLoaded: boolean, currentEncounterId: string | null } => ({
    monsters: [],
    targetEV: 0,
    initiativeGroups: [],
    nextGroupId: 1,
    party: {
      heroes: [
        { level: 3, victories: 0 },
        { level: 3, victories: 0 },
        { level: 3, victories: 0 },
        { level: 3, victories: 0 }
      ]
    },
    savedEncounters: {},
    isLoaded: false,
    currentEncounterId: null
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
    },

    // Saved encounters getters
    allSavedEncounters: (state) => {
      return Object.values(state.savedEncounters).sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    },

    savedEncounterCount: (state) => {
      return Object.keys(state.savedEncounters).length
    },

    getSavedEncounter: (state) => (id: string) => {
      return state.savedEncounters[id] || null
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
      this.targetEV = 0
      this.currentEncounterId = null
      // Note: Party configuration is preserved when clearing encounter
    },

    setTargetEV(ev: number) {
      this.targetEV = ev
    },

    setParty(party: PartyConfiguration) {
      this.party = JSON.parse(JSON.stringify(party)) // Deep copy
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
    },

    // Persistence actions
    loadSavedEncounters() {
      if (this.isLoaded) return

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          this.savedEncounters = parsed
        }
      } catch (error) {
        console.error('Error loading saved encounters from storage:', error)
        this.savedEncounters = {}
      }
      this.isLoaded = true
    },

    saveSavedEncountersToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedEncounters))
      } catch (error) {
        console.error('Error saving encounters to storage:', error)
        throw error
      }
    },

    // Validation
    validateEncounter(): EncounterValidationResult {
      const errors: EncounterValidationError[] = []

      // Check if encounter has monsters
      if (this.monsters.length === 0) {
        errors.push({
          field: 'monsters',
          message: 'Encounter must have at least one monster'
        })
      }

      // Validate each monster
      this.monsters.forEach((monster, index) => {
        if (!monster.id || !monster.name) {
          errors.push({
            field: `monsters[${index}]`,
            message: 'Monster must have id and name'
          })
        }
        if (monster.count <= 0) {
          errors.push({
            field: `monsters[${index}].count`,
            message: 'Monster count must be greater than 0'
          })
        }
        if (monster.level < 1 || monster.level > 10) {
          errors.push({
            field: `monsters[${index}].level`,
            message: 'Monster level must be between 1 and 10'
          })
        }
      })

      // Validate initiative groups
      this.initiativeGroups.forEach((group, index) => {
        if (!group.id || !group.name) {
          errors.push({
            field: `initiativeGroups[${index}]`,
            message: 'Initiative group must have id and name'
          })
        }
      })

      return {
        isValid: errors.length === 0,
        errors
      }
    },

    // Generate unique ID for saved encounter
    generateEncounterId(name: string): string {
      const baseId = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      let id = `encounter-${baseId}`
      let counter = 1
      
      while (this.savedEncounters[id]) {
        id = `encounter-${baseId}-${counter}`
        counter++
      }
      
      return id
    },

    // Save current encounter with a name
    saveEncounter(name: string, description?: string): string {
      this.loadSavedEncounters()

      // Validate before saving
      const validation = this.validateEncounter()
      if (!validation.isValid) {
        throw new Error(`Encounter validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      const id = this.generateEncounterId(name)
      const now = new Date().toISOString()

      const savedEncounter: SavedEncounter = {
        id,
        name,
        description,
        monsters: JSON.parse(JSON.stringify(this.monsters)), // Deep copy
        targetEV: this.targetEV,
        initiativeGroups: JSON.parse(JSON.stringify(this.initiativeGroups)), // Deep copy
        nextGroupId: this.nextGroupId,
        party: JSON.parse(JSON.stringify(this.party)), // Deep copy
        createdAt: now,
        updatedAt: now
      }

      this.savedEncounters[id] = savedEncounter
      this.saveSavedEncountersToStorage()
      
      // Track this as the current encounter
      this.currentEncounterId = id

      return id
    },

    // Update existing saved encounter
    updateSavedEncounter(id: string, name: string, description?: string): boolean {
      this.loadSavedEncounters()

      if (!this.savedEncounters[id]) {
        return false
      }

      // Validate before updating
      const validation = this.validateEncounter()
      if (!validation.isValid) {
        throw new Error(`Encounter validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      this.savedEncounters[id] = {
        ...this.savedEncounters[id],
        name,
        description,
        monsters: JSON.parse(JSON.stringify(this.monsters)), // Deep copy
        targetEV: this.targetEV,
        initiativeGroups: JSON.parse(JSON.stringify(this.initiativeGroups)), // Deep copy
        nextGroupId: this.nextGroupId,
        party: JSON.parse(JSON.stringify(this.party)), // Deep copy
        updatedAt: new Date().toISOString()
      }

      this.saveSavedEncountersToStorage()
      return true
    },

    // Load a saved encounter into current state
    loadEncounter(id: string): boolean {
      this.loadSavedEncounters()

      const encounter = this.savedEncounters[id]
      if (!encounter) {
        return false
      }

      // Deep copy to avoid reference issues
      this.monsters = JSON.parse(JSON.stringify(encounter.monsters))
      this.targetEV = encounter.targetEV
      this.initiativeGroups = JSON.parse(JSON.stringify(encounter.initiativeGroups))
      this.nextGroupId = encounter.nextGroupId
      this.party = JSON.parse(JSON.stringify(encounter.party || {
        heroes: [
          { level: 3, victories: 0 },
          { level: 3, victories: 0 },
          { level: 3, victories: 0 },
          { level: 3, victories: 0 }
        ]
      })) // Deep copy with fallback for old encounters
      this.currentEncounterId = id

      return true
    },

    // Delete a saved encounter
    deleteSavedEncounter(id: string): boolean {
      this.loadSavedEncounters()

      if (!this.savedEncounters[id]) {
        return false
      }

      delete this.savedEncounters[id]
      this.saveSavedEncountersToStorage()
      return true
    },

    // Auto-save current encounter to a temporary slot
    autoSaveEncounter() {
      try {
        const autoSaveData = {
          monsters: this.monsters,
          targetEV: this.targetEV,
          initiativeGroups: this.initiativeGroups,
          nextGroupId: this.nextGroupId,
          party: this.party,
          savedAt: new Date().toISOString()
        }
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(autoSaveData))
      } catch (error) {
        console.error('Error auto-saving encounter:', error)
      }
    },

    // Load auto-saved encounter
    loadAutoSave(): boolean {
      try {
        const stored = localStorage.getItem(AUTOSAVE_KEY)
        if (stored) {
          const autoSaveData = JSON.parse(stored)
          this.monsters = autoSaveData.monsters || []
          this.targetEV = autoSaveData.targetEV || 0
          this.initiativeGroups = autoSaveData.initiativeGroups || []
          this.nextGroupId = autoSaveData.nextGroupId || 1
          // Only restore party from auto-save if it exists in the auto-save data
          // This preserves any party configuration the user has already set up
          if (autoSaveData.party) {
            this.party = autoSaveData.party
          }
          return true
        }
      } catch (error) {
        console.error('Error loading auto-saved encounter:', error)
      }
      return false
    },

    // Clear auto-save
    clearAutoSave() {
      try {
        localStorage.removeItem(AUTOSAVE_KEY)
      } catch (error) {
        console.error('Error clearing auto-save:', error)
      }
    },

    // Export encounter as JSON
    exportEncounter(id?: string): string {
      let encounterData: SavedEncounter

      if (id) {
        this.loadSavedEncounters()
        const encounter = this.savedEncounters[id]
        if (!encounter) {
          throw new Error('Encounter not found')
        }
        encounterData = encounter
      } else {
        // Export current encounter
        const validation = this.validateEncounter()
        if (!validation.isValid) {
          throw new Error(`Encounter validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
        }

        encounterData = {
          id: 'exported-encounter',
          name: 'Exported Encounter',
          monsters: this.monsters,
          targetEV: this.targetEV,
          initiativeGroups: this.initiativeGroups,
          nextGroupId: this.nextGroupId,
          party: this.party,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      return JSON.stringify(encounterData, null, 2)
    },

    // Import encounter from JSON
    importEncounter(jsonData: string): string {
      try {
        const encounterData = JSON.parse(jsonData) as SavedEncounter

        // Validate the imported data
        if (!encounterData.monsters || !Array.isArray(encounterData.monsters)) {
          throw new Error('Invalid encounter data: missing monsters array')
        }

        this.loadSavedEncounters()

        // Generate new ID to avoid conflicts
        const id = this.generateEncounterId(encounterData.name || 'Imported Encounter')
        const now = new Date().toISOString()

        const savedEncounter: SavedEncounter = {
          ...encounterData,
          id,
          createdAt: now,
          updatedAt: now
        }

        this.savedEncounters[id] = savedEncounter
        this.saveSavedEncountersToStorage()

        return id
      } catch (error) {
        console.error('Error importing encounter:', error)
        throw new Error(`Failed to import encounter: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }
})
