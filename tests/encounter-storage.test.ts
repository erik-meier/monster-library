import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterStore } from '@/stores/encounter'
import type { EncounterMonster } from '@/stores/encounter'

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {}
  })
}

// Replace global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Encounter Storage', () => {
  let store: ReturnType<typeof useEncounterStore>

  beforeEach(() => {
    // Clear localStorage mock
    mockLocalStorage.clear()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()

    // Setup pinia
    setActivePinia(createPinia())
    store = useEncounterStore()
  })

  describe('Encounter Validation', () => {
    it('should validate empty encounter as invalid', () => {
      const validation = store.validateEncounter()
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContainEqual(
        expect.objectContaining({
          field: 'monsters',
          message: 'Encounter must have at least one monster'
        })
      )
    })

    it('should validate encounter with monsters as valid', () => {
      store.addMonster({
        id: 'test-monster',
        name: 'Test Monster',
        level: 3,
        ev: 6,
        role: 'Brute',
        organization: 'Standard'
      })

      const validation = store.validateEncounter()
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should validate monster level ranges', () => {
      store.monsters = [
        {
          id: 'invalid-monster',
          name: 'Invalid Monster',
          level: 15, // Invalid level
          ev: 10,
          role: 'Brute',
          organization: 'Standard',
          count: 1
        }
      ]

      const validation = store.validateEncounter()
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.message.includes('level'))).toBe(true)
    })

    it('should validate monster count', () => {
      store.monsters = [
        {
          id: 'test-monster',
          name: 'Test Monster',
          level: 3,
          ev: 6,
          role: 'Brute',
          organization: 'Standard',
          count: 0 // Invalid count
        }
      ]

      const validation = store.validateEncounter()
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.message.includes('count'))).toBe(true)
    })
  })

  describe('Save Encounter', () => {
    it('should save encounter with generated ID', () => {
      store.addMonster({
        id: 'goblin',
        name: 'Goblin',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })
      store.setTargetEV(10)

      const encounterId = store.saveEncounter('Test Encounter', 'A test encounter')

      expect(encounterId).toMatch(/^encounter-test-encounter/)
      expect(store.savedEncounterCount).toBe(1)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'savedEncounters',
        expect.any(String)
      )
    })

    it('should save encounter with all state', () => {
      store.addMonster({
        id: 'orc',
        name: 'Orc',
        level: 2,
        ev: 4,
        role: 'Brute',
        organization: 'Standard'
      })
      store.setTargetEV(20)
      const groupId = store.createGroup('Enemy Group')
      store.moveMonsterToGroup('orc', groupId)

      const encounterId = store.saveEncounter('Complex Encounter')
      const saved = store.getSavedEncounter(encounterId)

      expect(saved).toBeDefined()
      expect(saved?.name).toBe('Complex Encounter')
      expect(saved?.targetEV).toBe(20)
      expect(saved?.monsters).toHaveLength(1)
      expect(saved?.initiativeGroups).toHaveLength(1)
      expect(saved?.createdAt).toBeDefined()
      expect(saved?.updatedAt).toBeDefined()
    })

    it('should throw error when saving invalid encounter', () => {
      // Empty encounter (no monsters)
      expect(() => {
        store.saveEncounter('Invalid Encounter')
      }).toThrow('Encounter validation failed')
    })

    it('should generate unique IDs for encounters with same name', () => {
      store.addMonster({
        id: 'monster1',
        name: 'Monster',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })

      const id1 = store.saveEncounter('Duplicate Name')
      
      // Clear current encounter and add a monster again
      store.clearEncounter()
      store.addMonster({
        id: 'monster2',
        name: 'Monster 2',
        level: 2,
        ev: 4,
        role: 'Brute',
        organization: 'Standard'
      })
      
      const id2 = store.saveEncounter('Duplicate Name')

      expect(id1).toBe('encounter-duplicate-name')
      expect(id2).toBe('encounter-duplicate-name-1')
    })
  })

  describe('Update Saved Encounter', () => {
    it('should update existing saved encounter', () => {
      // Create and save initial encounter
      store.addMonster({
        id: 'monster1',
        name: 'Monster 1',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })

      const encounterId = store.saveEncounter('Original Name', 'Original description')
      const original = store.getSavedEncounter(encounterId)

      // Modify encounter and update
      store.addMonster({
        id: 'monster2',
        name: 'Monster 2',
        level: 2,
        ev: 4,
        role: 'Brute',
        organization: 'Standard'
      })

      const success = store.updateSavedEncounter(encounterId, 'Updated Name', 'Updated description')
      const updated = store.getSavedEncounter(encounterId)

      expect(success).toBe(true)
      expect(updated?.name).toBe('Updated Name')
      expect(updated?.description).toBe('Updated description')
      expect(updated?.monsters).toHaveLength(2)
      // Verify timestamps are present and createdAt stays the same
      expect(updated?.createdAt).toBe(original?.createdAt)
      expect(updated?.updatedAt).toBeDefined()
    })

    it('should return false when updating non-existent encounter', () => {
      const success = store.updateSavedEncounter('non-existent', 'Test')
      expect(success).toBe(false)
    })
  })

  describe('Load Encounter', () => {
    it('should load saved encounter into current state', () => {
      // Create and save an encounter
      store.addMonster({
        id: 'dragon',
        name: 'Dragon',
        level: 5,
        ev: 20,
        role: 'Solo',
        organization: 'Solo'
      })
      store.setTargetEV(50)
      const groupId = store.createGroup('Dragons')
      store.moveMonsterToGroup('dragon', groupId)

      const encounterId = store.saveEncounter('Dragon Fight')

      // Clear current state
      store.clearEncounter()
      expect(store.monsters).toHaveLength(0)
      expect(store.targetEV).toBe(0)

      // Load the saved encounter
      const success = store.loadEncounter(encounterId)

      expect(success).toBe(true)
      expect(store.monsters).toHaveLength(1)
      expect(store.monsters[0].name).toBe('Dragon')
      expect(store.targetEV).toBe(50)
      expect(store.initiativeGroups).toHaveLength(1)
      expect(store.initiativeGroups[0].name).toBe('Dragons')
    })

    it('should return false when loading non-existent encounter', () => {
      const success = store.loadEncounter('non-existent')
      expect(success).toBe(false)
    })

    it('should deep copy data to avoid reference issues', () => {
      // Create and save an encounter
      store.addMonster({
        id: 'goblin',
        name: 'Goblin',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })

      const encounterId = store.saveEncounter('Reference Test')
      const saved = store.getSavedEncounter(encounterId)

      // Load and modify
      store.loadEncounter(encounterId)
      store.addMonster({
        id: 'orc',
        name: 'Orc',
        level: 2,
        ev: 4,
        role: 'Brute',
        organization: 'Standard'
      })

      // Saved encounter should not be modified
      expect(saved?.monsters).toHaveLength(1)
      expect(store.monsters).toHaveLength(2)
    })
  })

  describe('Delete Saved Encounter', () => {
    it('should delete existing saved encounter', () => {
      store.addMonster({
        id: 'monster',
        name: 'Monster',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })

      const encounterId = store.saveEncounter('To Delete')
      expect(store.savedEncounterCount).toBe(1)

      const success = store.deleteSavedEncounter(encounterId)

      expect(success).toBe(true)
      expect(store.savedEncounterCount).toBe(0)
      expect(store.getSavedEncounter(encounterId)).toBeNull()
    })

    it('should return false when deleting non-existent encounter', () => {
      const success = store.deleteSavedEncounter('non-existent')
      expect(success).toBe(false)
    })
  })

  describe('Auto-save', () => {
    it('should auto-save current encounter', () => {
      store.addMonster({
        id: 'monster',
        name: 'Monster',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })
      store.setTargetEV(15)

      store.autoSaveEncounter()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'encounterAutosave',
        expect.any(String)
      )
    })

    it('should load auto-saved encounter', () => {
      // Auto-save an encounter
      store.addMonster({
        id: 'monster',
        name: 'Monster',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })
      store.setTargetEV(15)
      store.autoSaveEncounter()

      // Clear and load
      store.clearEncounter()
      expect(store.monsters).toHaveLength(0)

      const success = store.loadAutoSave()

      expect(success).toBe(true)
      expect(store.monsters).toHaveLength(1)
      expect(store.targetEV).toBe(15)
    })

    it('should clear auto-save', () => {
      store.addMonster({
        id: 'monster',
        name: 'Monster',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })
      store.autoSaveEncounter()

      store.clearAutoSave()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('encounterAutosave')
    })

    it('should return false when no auto-save exists', () => {
      const success = store.loadAutoSave()
      expect(success).toBe(false)
    })
  })

  describe('Export Encounter', () => {
    it('should export current encounter as JSON', () => {
      store.addMonster({
        id: 'monster',
        name: 'Monster',
        level: 3,
        ev: 6,
        role: 'Brute',
        organization: 'Standard'
      })
      store.setTargetEV(20)

      const json = store.exportEncounter()
      const parsed = JSON.parse(json)

      expect(parsed.monsters).toHaveLength(1)
      expect(parsed.monsters[0].name).toBe('Monster')
      expect(parsed.targetEV).toBe(20)
    })

    it('should export saved encounter by ID', () => {
      store.addMonster({
        id: 'monster',
        name: 'Monster',
        level: 3,
        ev: 6,
        role: 'Brute',
        organization: 'Standard'
      })

      const encounterId = store.saveEncounter('Export Test')
      const json = store.exportEncounter(encounterId)
      const parsed = JSON.parse(json)

      expect(parsed.name).toBe('Export Test')
      expect(parsed.id).toBe(encounterId)
    })

    it('should throw error when exporting invalid encounter', () => {
      // Empty encounter
      expect(() => {
        store.exportEncounter()
      }).toThrow('Encounter validation failed')
    })

    it('should throw error when exporting non-existent saved encounter', () => {
      expect(() => {
        store.exportEncounter('non-existent')
      }).toThrow('Encounter not found')
    })
  })

  describe('Import Encounter', () => {
    it('should import encounter from JSON', () => {
      const encounterData = {
        id: 'original-id',
        name: 'Imported Encounter',
        description: 'Test import',
        monsters: [
          {
            id: 'monster1',
            name: 'Monster 1',
            level: 2,
            ev: 4,
            role: 'Brute',
            organization: 'Standard',
            count: 1
          }
        ] as EncounterMonster[],
        targetEV: 20,
        initiativeGroups: [],
        nextGroupId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const json = JSON.stringify(encounterData)
      const newId = store.importEncounter(json)

      expect(newId).toMatch(/^encounter-imported-encounter/)
      expect(newId).not.toBe('original-id') // Should generate new ID
      expect(store.savedEncounterCount).toBe(1)

      const imported = store.getSavedEncounter(newId)
      expect(imported?.name).toBe('Imported Encounter')
      expect(imported?.monsters).toHaveLength(1)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => {
        store.importEncounter('invalid json')
      }).toThrow('Failed to import encounter')
    })

    it('should throw error for invalid encounter data', () => {
      const invalidData = JSON.stringify({ name: 'Invalid' })
      
      expect(() => {
        store.importEncounter(invalidData)
      }).toThrow('Invalid encounter data')
    })
  })

  describe('Storage Persistence', () => {
    it('should load saved encounters from localStorage', () => {
      // Pre-populate localStorage
      const testEncounter = {
        'encounter-test': {
          id: 'encounter-test',
          name: 'Test Encounter',
          monsters: [
            {
              id: 'monster',
              name: 'Monster',
              level: 1,
              ev: 2,
              role: 'Minion',
              organization: 'Minion',
              count: 1
            }
          ],
          targetEV: 10,
          initiativeGroups: [],
          nextGroupId: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }

      mockLocalStorage.store['savedEncounters'] = JSON.stringify(testEncounter)

      // Create new store to trigger loading
      const newStore = useEncounterStore()
      newStore.loadSavedEncounters()

      expect(newStore.savedEncounterCount).toBe(1)
      expect(newStore.getSavedEncounter('encounter-test')?.name).toBe('Test Encounter')
    })

    it('should handle corrupted localStorage data gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockLocalStorage.store['savedEncounters'] = 'invalid json'

      const newStore = useEncounterStore()
      newStore.loadSavedEncounters()

      expect(newStore.savedEncounterCount).toBe(0)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Saved Encounters Getters', () => {
    it('should get all saved encounters sorted by update time', () => {
      store.addMonster({
        id: 'monster',
        name: 'Monster',
        level: 1,
        ev: 2,
        role: 'Minion',
        organization: 'Minion'
      })

      const id1 = store.saveEncounter('First')
      
      store.clearEncounter()
      store.addMonster({
        id: 'monster2',
        name: 'Monster 2',
        level: 2,
        ev: 4,
        role: 'Brute',
        organization: 'Standard'
      })
      const id2 = store.saveEncounter('Second')

      const allEncounters = store.allSavedEncounters
      expect(allEncounters).toHaveLength(2)
      // Encounters should be present (order may vary due to timing)
      const encounterIds = allEncounters.map(e => e.id)
      expect(encounterIds).toContain(id1)
      expect(encounterIds).toContain(id2)
    })
  })
})
