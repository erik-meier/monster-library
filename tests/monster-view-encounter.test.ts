import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterStore } from '../src/stores/encounter'

describe('MonsterView Start Encounter Feature', () => {
  let encounterStore: ReturnType<typeof useEncounterStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    encounterStore = useEncounterStore()
  })

  it('should add monster to encounter when starting encounter', () => {
    // Mock monster data similar to what would be available in MonsterView
    const mockMonster = {
      id: 'test-goblin',
      name: 'Test Goblin',
      level: 1,
      ev: 2,
      role: 'Minion',
      organization: 'Minion'
    }

    // Verify encounter starts empty
    expect(encounterStore.monsters).toHaveLength(0)

    // Simulate what happens when startEncounterWithMonster is called
    encounterStore.clearEncounter()
    encounterStore.addMonster(mockMonster)

    // Verify the monster was added to the encounter
    expect(encounterStore.monsters).toHaveLength(1)
    expect(encounterStore.monsters[0]).toMatchObject({
      ...mockMonster,
      count: 1,
      groupId: null
    })
  })

  it('should clear existing encounter before adding new monster', () => {
    // Add some existing monsters
    encounterStore.addMonster({
      id: 'existing-orc',
      name: 'Existing Orc',
      level: 2,
      ev: 4,
      role: 'Brute',
      organization: 'Standard'
    })

    expect(encounterStore.monsters).toHaveLength(1)

    // Simulate starting a new encounter with a different monster
    const newMonster = {
      id: 'new-dragon',
      name: 'New Dragon',
      level: 5,
      ev: 20,
      role: 'Solo',
      organization: 'Solo'
    }

    encounterStore.clearEncounter()
    encounterStore.addMonster(newMonster)

    // Verify the old monsters are cleared and only the new one exists
    expect(encounterStore.monsters).toHaveLength(1)
    expect(encounterStore.monsters[0].name).toBe('New Dragon')
  })

  it('should handle monsters without role or organization gracefully', () => {
    const incompleteMonster = {
      id: 'incomplete-monster',
      name: 'Incomplete Monster',
      level: 3,
      ev: 6,
      role: '', // Empty string
      organization: '' // Empty string
    }

    encounterStore.clearEncounter()
    encounterStore.addMonster(incompleteMonster)

    expect(encounterStore.monsters).toHaveLength(1)
    expect(encounterStore.monsters[0]).toMatchObject({
      ...incompleteMonster,
      count: 1,
      groupId: null
    })
  })
})