import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterStore } from '../src/stores/encounter'

describe('Encounter Name Loading', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('should preserve encounter name when loading from saved encounter', () => {
    const store = useEncounterStore()
    
    // Create a test encounter
    store.addMonster({
      id: 'test-monster',
      name: 'Test Monster',
      level: 1,
      ev: 1,
      role: 'Striker',
      organization: 'Elite'
    })
    
    // Save the encounter with a specific name
    const testName = 'My Test Encounter'
    const encounterId = store.saveEncounter(testName, 'A test encounter for testing name loading')
    
    // Clear the encounter (simulate navigating away)
    store.clearEncounter()
    
    // Load the encounter back
    const loadSuccess = store.loadEncounter(encounterId)
    
    // Verify the encounter loaded successfully
    expect(loadSuccess).toBe(true)
    expect(store.currentEncounterId).toBe(encounterId)
    
    // Verify we can get the saved encounter name
    const savedEncounter = store.getSavedEncounter(encounterId)
    expect(savedEncounter).toBeTruthy()
    expect(savedEncounter?.name).toBe(testName)
    expect(savedEncounter?.description).toBe('A test encounter for testing name loading')
  })

  it('should handle getSavedEncounter properly', () => {
    const store = useEncounterStore()
    
    // Create and save an encounter
    store.addMonster({
      id: 'test-monster-2',
      name: 'Another Test Monster',
      level: 2,
      ev: 2,
      role: 'Defender',
      organization: 'Solo'
    })
    
    const testName = 'Another Test Encounter'
    const encounterId = store.saveEncounter(testName)
    
    // Test that getSavedEncounter works
    let savedEncounter = store.getSavedEncounter(encounterId)
    expect(savedEncounter).toBeTruthy()
    expect(savedEncounter?.name).toBe(testName)
    
    // Test that getSavedEncounter returns null for non-existent encounters
    const nonExistentEncounter = store.getSavedEncounter('non-existent-id')
    expect(nonExistentEncounter).toBeNull()
    
    // Test after loading saved encounters explicitly
    store.loadSavedEncounters()
    savedEncounter = store.getSavedEncounter(encounterId)
    expect(savedEncounter).toBeTruthy()
    expect(savedEncounter?.name).toBe(testName)
  })

  it('should track currentEncounterId properly', () => {
    const store = useEncounterStore()
    
    // Initially no encounter should be loaded
    expect(store.currentEncounterId).toBeNull()
    
    // Create and save an encounter
    store.addMonster({
      id: 'test-monster-3',
      name: 'Third Test Monster',
      level: 3,
      ev: 3,
      role: 'Leader',
      organization: 'Elite'
    })
    
    const encounterId = store.saveEncounter('Track ID Test')
    expect(store.currentEncounterId).toBe(encounterId)
    
    // Clear encounter should reset the ID
    store.clearEncounter()
    expect(store.currentEncounterId).toBeNull()
    
    // Loading should set the ID again
    store.loadEncounter(encounterId)
    expect(store.currentEncounterId).toBe(encounterId)
  })
})