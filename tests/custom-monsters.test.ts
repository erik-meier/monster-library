import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCustomMonstersStore } from '@/stores/customMonsters'

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

// Mock the bundled monsters
vi.mock('@/data/monsters.js', () => ({
  getMonster: vi.fn((id: string) => {
    const bundledMonsters = {
      'test-bundled': {
        id: 'test-bundled',
        name: 'Test Bundled Monster',
        level: 1,
        ev: 2,
        role: 'Brute',
        organization: 'Solo'
      }
    }
    return bundledMonsters[id as keyof typeof bundledMonsters] || null
  }),
  getAllMonsters: vi.fn(() => [
    {
      id: 'test-bundled',
      name: 'Test Bundled Monster',
      level: 1,
      ev: 2,
      role: 'Brute',
      organization: 'Solo'
    }
  ])
}))

// Replace global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Custom Monsters Store', () => {
  let store: ReturnType<typeof useCustomMonstersStore>

  beforeEach(() => {
    // Clear localStorage mock
    mockLocalStorage.clear()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    
    // Setup pinia
    setActivePinia(createPinia())
    store = useCustomMonstersStore()
  })

  describe('Monster Creation', () => {
    it('should create a custom monster with generated ID', () => {
      const monsterData = {
        name: 'Test Custom Monster',
        level: 5,
        ev: 10,
        role: 'Artillery',
        organization: 'Elite',
        size: { value: 2, letter: 'M' },
        speed: 8,
        stamina: 50,
        stability: 15,
        freeStrike: 8,
        characteristics: {
          might: 2,
          agility: 3,
          reason: 1,
          intuition: 2,
          presence: 1
        }
      }

      const id = store.createMonster(monsterData)
      
      expect(id).toMatch(/^custom-test-custom-monster/)
      expect(store.getCustomMonster(id)).toMatchObject({
        ...monsterData,
        id,
        isCustom: true
      })
      expect(store.customMonsterCount).toBe(1)
    })

    it('should generate unique IDs for monsters with same name', () => {
      const monsterData = {
        name: 'Duplicate Name',
        level: 1,
        ev: 2,
        role: 'Brute',
        organization: 'Minion',
        size: { value: 1, letter: 'S' },
        speed: 6,
        stamina: 10,
        stability: 5,
        freeStrike: 3,
        characteristics: {
          might: 1, agility: 0, reason: 0, intuition: 0, presence: 0
        }
      }

      const id1 = store.createMonster(monsterData)
      const id2 = store.createMonster(monsterData)
      
      expect(id1).toBe('custom-duplicate-name')
      expect(id2).toBe('custom-duplicate-name-1')
      expect(store.customMonsterCount).toBe(2)
    })

    it('should save to localStorage when creating monster', () => {
      const monsterData = {
        name: 'Storage Test',
        level: 1,
        ev: 1,
        role: 'Support',
        organization: 'Minion',
        size: { value: 1, letter: 'T' },
        speed: 5,
        stamina: 5,
        stability: 0,
        freeStrike: 1,
        characteristics: {
          might: 0, agility: 0, reason: 0, intuition: 0, presence: 1
        }
      }

      store.createMonster(monsterData)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'customMonsters', 
        expect.any(String)
      )
    })
  })

  describe('Monster Updates', () => {
    it('should update existing custom monster', () => {
      // Create a monster first
      const monsterData = {
        name: 'Update Test',
        level: 1,
        ev: 2,
        role: 'Defender',
        organization: 'Solo',
        size: { value: 2, letter: 'M' },
        speed: 6,
        stamina: 30,
        stability: 12,
        freeStrike: 5,
        characteristics: {
          might: 3, agility: 1, reason: 0, intuition: 1, presence: 1
        }
      }
      
      const id = store.createMonster(monsterData)
      
      // Update the monster
      const updated = store.updateMonster(id, {
        name: 'Updated Name',
        level: 3,
        stamina: 45
      })
      
      expect(updated).toBe(true)
      
      const monster = store.getCustomMonster(id)
      expect(monster?.name).toBe('Updated Name')
      expect(monster?.level).toBe(3)
      expect(monster?.stamina).toBe(45)
      expect(monster?.role).toBe('Defender') // Should keep original values
    })

    it('should return false when updating non-existent monster', () => {
      const updated = store.updateMonster('non-existent', { name: 'Test' })
      expect(updated).toBe(false)
    })

    it('should update updatedAt timestamp', () => {
      const monsterData = {
        name: 'Timestamp Test',
        level: 1,
        ev: 1,
        role: 'Harrier',
        organization: 'Minion',
        size: { value: 1, letter: 'S' },
        speed: 7,
        stamina: 8,
        stability: 2,
        freeStrike: 4,
        characteristics: {
          might: 1, agility: 2, reason: 0, intuition: 1, presence: 0
        }
      }
      
      const id = store.createMonster(monsterData)
      const originalTimestamp = store.getCustomMonster(id)?.updatedAt
      
      // Wait a moment and update
      setTimeout(() => {
        store.updateMonster(id, { name: 'Updated' })
        const newTimestamp = store.getCustomMonster(id)?.updatedAt
        expect(newTimestamp).not.toBe(originalTimestamp)
      }, 10)
    })
  })

  describe('Monster Deletion', () => {
    it('should delete existing custom monster', () => {
      const monsterData = {
        name: 'Delete Test',
        level: 2,
        ev: 4,
        role: 'Controller',
        organization: 'Elite',
        size: { value: 2, letter: 'M' },
        speed: 6,
        stamina: 25,
        stability: 10,
        freeStrike: 6,
        characteristics: {
          might: 1, agility: 2, reason: 3, intuition: 2, presence: 2
        }
      }
      
      const id = store.createMonster(monsterData)
      expect(store.getCustomMonster(id)).not.toBeNull()
      
      const deleted = store.deleteMonster(id)
      expect(deleted).toBe(true)
      expect(store.getCustomMonster(id)).toBeNull()
      expect(store.customMonsterCount).toBe(0)
    })

    it('should return false when deleting non-existent monster', () => {
      const deleted = store.deleteMonster('non-existent')
      expect(deleted).toBe(false)
    })
  })

  describe('Monster Retrieval', () => {
    it('should retrieve custom monsters', () => {
      const monsterData = {
        name: 'Retrieval Test',
        level: 1,
        ev: 2,
        role: 'Ambusher',
        organization: 'Minion',
        size: { value: 1, letter: 'S' },
        speed: 8,
        stamina: 12,
        stability: 3,
        freeStrike: 5,
        characteristics: {
          might: 2, agility: 3, reason: 0, intuition: 2, presence: 0
        }
      }
      
      const id = store.createMonster(monsterData)
      const retrieved = store.getCustomMonster(id)
      
      expect(retrieved).toMatchObject({
        ...monsterData,
        id,
        isCustom: true
      })
    })

    it('should get all custom monsters', () => {
      const monster1 = {
        name: 'Monster 1',
        level: 1, ev: 1, role: 'Brute', organization: 'Minion',
        size: { value: 1, letter: 'S' }, speed: 6, stamina: 10, stability: 5, freeStrike: 3,
        characteristics: { might: 1, agility: 0, reason: 0, intuition: 0, presence: 0 }
      }
      
      const monster2 = {
        name: 'Monster 2',
        level: 2, ev: 3, role: 'Artillery', organization: 'Elite',
        size: { value: 2, letter: 'M' }, speed: 5, stamina: 20, stability: 8, freeStrike: 4,
        characteristics: { might: 1, agility: 1, reason: 2, intuition: 1, presence: 1 }
      }
      
      store.createMonster(monster1)
      store.createMonster(monster2)
      
      const allCustom = store.getAllCustomMonsters()
      expect(allCustom).toHaveLength(2)
      expect(allCustom.map(m => m.name)).toContain('Monster 1')
      expect(allCustom.map(m => m.name)).toContain('Monster 2')
    })

    it('should integrate with bundled monsters via getMonster', () => {
      // Test getting bundled monster
      const bundledMonster = store.getMonster('test-bundled')
      expect(bundledMonster).toMatchObject({
        id: 'test-bundled',
        name: 'Test Bundled Monster'
      })
      
      // Test getting custom monster
      const monsterData = {
        name: 'Integration Test',
        level: 1, ev: 1, role: 'Support', organization: 'Minion',
        size: { value: 1, letter: 'T' }, speed: 5, stamina: 5, stability: 0, freeStrike: 1,
        characteristics: { might: 0, agility: 0, reason: 0, intuition: 0, presence: 1 }
      }
      
      const customId = store.createMonster(monsterData)
      const customMonster = store.getMonster(customId)
      expect(customMonster?.isCustom).toBe(true)
    })
  })

  describe('Storage Persistence', () => {
    it('should load from localStorage on first access', () => {
      // Pre-populate localStorage
      const testMonster = {
        'custom-test': {
          id: 'custom-test',
          name: 'Stored Monster',
          level: 1,
          ev: 2,
          role: 'Brute',
          organization: 'Solo',
          size: { value: 2, letter: 'M' },
          speed: 6,
          stamina: 30,
          stability: 12,
          freeStrike: 5,
          characteristics: {
            might: 3, agility: 1, reason: 0, intuition: 1, presence: 1
          },
          isCustom: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      }
      
      mockLocalStorage.store['customMonsters'] = JSON.stringify(testMonster)
      
      // Create new store instance to trigger loading
      const newStore = useCustomMonstersStore()
      
      expect(newStore.getCustomMonster('custom-test')).toMatchObject({
        name: 'Stored Monster'
      })
      expect(newStore.customMonsterCount).toBe(1)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      // Mock console.error to verify it's called
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockLocalStorage.store['customMonsters'] = 'invalid json'
      
      const newStore = useCustomMonstersStore()
      newStore.loadFromStorage() // Force loading
      
      expect(newStore.customMonsterCount).toBe(0)
      expect(consoleSpy).toHaveBeenCalled() // Should log error
      
      consoleSpy.mockRestore()
    })
  })
})