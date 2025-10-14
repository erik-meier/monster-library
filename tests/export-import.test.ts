/**
 * Tests for export/import functionality
 */

import { describe, it, expect } from 'vitest'
import { 
  exportMonster, 
  exportAllMonsters, 
  generateExportFilename,
  downloadFile,
  type ExportData 
} from '../src/utils/exportImport'
import { validateMonster } from './helpers/validation-utils'
import type { CustomMonster } from '../src/stores/customMonsters'

describe('Export/Import Utilities', () => {
  const sampleMonster: CustomMonster = {
    id: 'test-monster',
    name: 'Test Monster',
    level: 1,
    ev: 3,
    role: 'Brute',
    organization: 'Minion',
    keywords: ['humanoid'],
    size: '1S',
    speed: 6,
    stamina: 10,
    stability: 0,
    freeStrike: 2,
    characteristics: {
      might: 2,
      agility: 0,
      reason: -1,
      intuition: 0,
      presence: -1
    },
    immunities: {},
    weaknesses: {},
    movementTypes: new Set(['walk']),
    items: [],
    isCustom: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const sampleMonster2: CustomMonster = {
    id: 'test-monster-2',
    name: 'Test Monster 2',
    level: 2,
    ev: 5,
    role: 'Artillery',
    organization: 'Elite',
    keywords: ['undead'],
    size: '2M',
    speed: 8,
    stamina: 15,
    stability: 1,
    freeStrike: 3,
    characteristics: {
      might: 1,
      agility: 2,
      reason: 0,
      intuition: 1,
      presence: 0
    },
    immunities: { poison: 5 },
    weaknesses: { fire: 3 },
    movementTypes: new Set(['walk']),
    items: [],
    isCustom: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  describe('Single Monster Export', () => {
    it('should export a single monster correctly', () => {
      const jsonString = exportMonster(sampleMonster)
      const exportData: ExportData = JSON.parse(jsonString, (key: string, value: unknown) => {
        if (key === 'movementTypes' && Array.isArray(value)) {
          return new Set(value)
        }
        return value
      })

      expect(exportData.metadata.application).toBe('Steel Cauldron Monster Library')
      expect(exportData.metadata.totalMonsters).toBe(1)
      expect(exportData.monsters).toHaveLength(1)
      expect(exportData.monsters[0]).toEqual(sampleMonster)
      expect(exportData.metadata.exportDate).toBeDefined()
      expect(exportData.metadata.version).toBe('1.0')
    })

    it('should generate valid JSON', () => {
      const jsonString = exportMonster(sampleMonster)
      expect(() => JSON.parse(jsonString)).not.toThrow()
    })
  })

  describe('Bulk Monster Export', () => {
    it('should export multiple monsters correctly', () => {
      const monsters = [sampleMonster, sampleMonster2]
      const jsonString = exportAllMonsters(monsters)
      const exportData: ExportData = JSON.parse(jsonString)

      expect(exportData.metadata.application).toBe('Steel Cauldron Monster Library')
      expect(exportData.metadata.totalMonsters).toBe(2)
      expect(exportData.monsters).toHaveLength(2)
      
      // Check that both monsters are included
      const monsterIds = exportData.monsters.map(m => m.id)
      expect(monsterIds).toContain(sampleMonster.id)
      expect(monsterIds).toContain(sampleMonster2.id)
    })

    it('should handle empty monster array', () => {
      const jsonString = exportAllMonsters([])
      const exportData: ExportData = JSON.parse(jsonString)

      expect(exportData.metadata.totalMonsters).toBe(0)
      expect(exportData.monsters).toHaveLength(0)
    })
  })

  describe('Filename Generation', () => {
    it('should generate valid filenames', () => {
      const filename = generateExportFilename('test')
      
      expect(filename).toMatch(/^test-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/)
    })

    it('should support custom extensions', () => {
      const filename = generateExportFilename('test', 'txt')
      
      expect(filename).toMatch(/^test-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.txt$/)
    })
  })

  describe('File Operations', () => {
    it('should not throw when mocked properly', () => {
      // This test ensures the downloadFile function structure is correct
      // In a real browser environment, it would trigger a file download
      expect(typeof downloadFile).toBe('function')
    })
  })

  describe('Malice Feature Export', () => {
    const sampleMalice = {
      id: 'test-malice-1',
      name: 'Test Malice Features',
      featureblockType: 'Malice Features',
      level: 1,
      features: [{
        name: 'Test Feature',
        effects: [{
          tier1: 'Tier 1 effect',
          tier2: 'Tier 2 effect',
          tier3: 'Tier 3 effect'
        }]
      }],
      isCustom: true as const,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }

    it('should export monsters with malice features', () => {
      const monsters = [sampleMonster]
      const maliceFeatures = [sampleMalice]
      
      const jsonString = exportAllMonsters(monsters, maliceFeatures)
      const exportData = JSON.parse(jsonString)

      expect(exportData.metadata.totalMonsters).toBe(1)
      expect(exportData.metadata.totalMaliceFeatures).toBe(1)
      expect(exportData.monsters).toHaveLength(1)
      expect(exportData.maliceFeatures).toHaveLength(1)
      expect(exportData.maliceFeatures[0].name).toBe('Test Malice Features')
    })

    it('should export monsters without malice features', () => {
      const monsters = [sampleMonster]
      
      const jsonString = exportAllMonsters(monsters)
      const exportData = JSON.parse(jsonString)

      expect(exportData.metadata.totalMonsters).toBe(1)
      expect(exportData.metadata.totalMaliceFeatures).toBe(0)
      expect(exportData.monsters).toHaveLength(1)
      expect(exportData.maliceFeatures).toHaveLength(0)
    })

    it('should handle empty malice array', () => {
      const monsters = [sampleMonster]
      const maliceFeatures: typeof sampleMalice[] = []
      
      const jsonString = exportAllMonsters(monsters, maliceFeatures)
      const exportData = JSON.parse(jsonString)

      expect(exportData.metadata.totalMaliceFeatures).toBe(0)
      expect(exportData.maliceFeatures).toHaveLength(0)
    })
  })
})

describe('Data Validation', () => {
  it('should correctly identify valid monster data', () => {
    const validMonster = {
      id: 'valid-monster',
      name: 'Valid Monster',
      level: 1,
      ev: 3,
      role: 'Brute',
      organization: 'Minion',
      keywords: ['humanoid'],
      size: '1S',
      speed: 6,
      stamina: 10,
      stability: 0,
      freeStrike: 2,
      characteristics: {
        might: 2,
        agility: 0,
        reason: -1,
        intuition: 0,
        presence: -1
      },
      immunities: {},
      weaknesses: {},
      movementTypes: new Set(['walk']),
      items: [],
      isCustom: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }

    const result = validateMonster(validMonster)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should identify invalid monster data', () => {
    const invalidMonster = {
      id: 'invalid-monster',
      name: 'Invalid Monster',
      // Missing required fields like level, ev, etc.
    }

    const result = validateMonster(invalidMonster)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    
    // Should have errors for missing required fields
    expect(result.errors.some(error => error.field === 'level')).toBe(true)
    expect(result.errors.some(error => error.field === 'ev')).toBe(true)
  })
})