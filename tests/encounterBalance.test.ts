import { describe, it, expect } from 'vitest'
import {
  getDifficultyMultiplier,
  calculatePartyStrength,
  calculateEncounterBudget,
  calculateMonsterCost,
  calculateBudgetUsage,
  getEncounterBudgetSummary,
  getBudgetStatus,
  getDifficultyDescription,
  getEncounterRecommendations,
  validatePartyConfiguration,
  type PartyConfiguration,
  type MonsterInEncounter
} from '../src/utils/encounterBalance'

describe('Encounter Balance Utilities', () => {
  describe('getDifficultyMultiplier', () => {
    it('should return correct multipliers for each difficulty', () => {
      expect(getDifficultyMultiplier('Trivial')).toBe(0.5)
      expect(getDifficultyMultiplier('Easy')).toBe(0.75)
      expect(getDifficultyMultiplier('Standard')).toBe(1.0)
      expect(getDifficultyMultiplier('Hard')).toBe(1.5)
      expect(getDifficultyMultiplier('Extreme')).toBe(2.0)
    })
  })

  describe('calculatePartyStrength', () => {
    it('should sum all hero levels', () => {
      const party: PartyConfiguration = {
        heroes: [{ level: 3 }, { level: 4 }, { level: 3 }, { level: 5 }]
      }
      expect(calculatePartyStrength(party)).toBe(15)
    })

    it('should return 0 for empty party', () => {
      const party: PartyConfiguration = { heroes: [] }
      expect(calculatePartyStrength(party)).toBe(0)
    })

    it('should handle single hero', () => {
      const party: PartyConfiguration = { heroes: [{ level: 7 }] }
      expect(calculatePartyStrength(party)).toBe(7)
    })
  })

  describe('calculateEncounterBudget', () => {
    const party: PartyConfiguration = {
      heroes: [{ level: 3 }, { level: 4 }, { level: 3 }, { level: 4 }]
    }

    it('should calculate Trivial budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Trivial')).toBe(7)
    })

    it('should calculate Easy budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Easy')).toBe(11) // 14 * 0.75 = 10.5, rounded to 11
    })

    it('should calculate Standard budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Standard')).toBe(14)
    })

    it('should calculate Hard budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Hard')).toBe(21)
    })

    it('should calculate Extreme budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Extreme')).toBe(28)
    })
  })

  describe('calculateMonsterCost', () => {
    it('should calculate cost for regular monster', () => {
      const monster: MonsterInEncounter = {
        id: 'test',
        name: 'Test Monster',
        level: 3,
        ev: 8,
        organization: 'Standard',
        count: 1
      }
      expect(calculateMonsterCost(monster)).toBe(8)
    })

    it('should calculate cost for multiple regular monsters', () => {
      const monster: MonsterInEncounter = {
        id: 'test',
        name: 'Test Monster',
        level: 3,
        ev: 8,
        organization: 'Standard',
        count: 3
      }
      expect(calculateMonsterCost(monster)).toBe(24)
    })

    it('should calculate cost for minions correctly', () => {
      const monster: MonsterInEncounter = {
        id: 'test',
        name: 'Test Minion',
        level: 2,
        ev: 4,
        organization: 'Minion',
        count: 4
      }
      // 4 minions at EV 4 (which is for 4 minions) = 4
      expect(calculateMonsterCost(monster)).toBe(4)
    })

    it('should calculate cost for 8 minions correctly', () => {
      const monster: MonsterInEncounter = {
        id: 'test',
        name: 'Test Minion',
        level: 2,
        ev: 4,
        organization: 'Minion',
        count: 8
      }
      // 8 minions at EV 4 (which is for 4 minions) = 8
      expect(calculateMonsterCost(monster)).toBe(8)
    })

    it('should handle minion organization with different casing', () => {
      const monster: MonsterInEncounter = {
        id: 'test',
        name: 'Test Minion',
        level: 2,
        ev: 4,
        organization: 'MINION',
        count: 4
      }
      expect(calculateMonsterCost(monster)).toBe(4)
    })
  })

  describe('calculateBudgetUsage', () => {
    it('should sum costs of all monsters', () => {
      const monsters: MonsterInEncounter[] = [
        {
          id: '1',
          name: 'Monster 1',
          level: 3,
          ev: 8,
          organization: 'Standard',
          count: 1
        },
        {
          id: '2',
          name: 'Monster 2',
          level: 2,
          ev: 4,
          organization: 'Minion',
          count: 4
        }
      ]
      expect(calculateBudgetUsage(monsters)).toBe(12) // 8 + 4
    })

    it('should return 0 for empty monster list', () => {
      expect(calculateBudgetUsage([])).toBe(0)
    })
  })

  describe('getEncounterBudgetSummary', () => {
    const party: PartyConfiguration = {
      heroes: [{ level: 4 }, { level: 4 }, { level: 4 }, { level: 4 }]
    }

    it('should calculate complete budget summary', () => {
      const monsters: MonsterInEncounter[] = [
        {
          id: '1',
          name: 'Monster',
          level: 3,
          ev: 8,
          organization: 'Standard',
          count: 1
        }
      ]

      const summary = getEncounterBudgetSummary(party, 'Standard', monsters)
      expect(summary.total).toBe(16)
      expect(summary.used).toBe(8)
      expect(summary.remaining).toBe(8)
      expect(summary.percentage).toBe(50)
    })

    it('should handle empty encounter', () => {
      const summary = getEncounterBudgetSummary(party, 'Standard', [])
      expect(summary.total).toBe(16)
      expect(summary.used).toBe(0)
      expect(summary.remaining).toBe(16)
      expect(summary.percentage).toBe(0)
    })

    it('should handle over-budget encounters', () => {
      const monsters: MonsterInEncounter[] = [
        {
          id: '1',
          name: 'Monster',
          level: 5,
          ev: 20,
          organization: 'Standard',
          count: 1
        }
      ]

      const summary = getEncounterBudgetSummary(party, 'Standard', monsters)
      expect(summary.total).toBe(16)
      expect(summary.used).toBe(20)
      expect(summary.remaining).toBe(-4)
      expect(summary.percentage).toBe(125)
    })
  })

  describe('getBudgetStatus', () => {
    it('should return "safe" for low usage', () => {
      const budget = { total: 100, used: 50, remaining: 50, percentage: 50 }
      expect(getBudgetStatus(budget)).toBe('safe')
    })

    it('should return "warning" at 75% usage', () => {
      const budget = { total: 100, used: 75, remaining: 25, percentage: 75 }
      expect(getBudgetStatus(budget)).toBe('warning')
    })

    it('should return "danger" at 90% usage', () => {
      const budget = { total: 100, used: 90, remaining: 10, percentage: 90 }
      expect(getBudgetStatus(budget)).toBe('danger')
    })

    it('should return "over" at 100% usage', () => {
      const budget = { total: 100, used: 100, remaining: 0, percentage: 100 }
      expect(getBudgetStatus(budget)).toBe('over')
    })

    it('should return "over" above 100% usage', () => {
      const budget = { total: 100, used: 120, remaining: -20, percentage: 120 }
      expect(getBudgetStatus(budget)).toBe('over')
    })
  })

  describe('getDifficultyDescription', () => {
    it('should return descriptions for all difficulties', () => {
      expect(getDifficultyDescription('Trivial')).toContain('minimal threat')
      expect(getDifficultyDescription('Easy')).toContain('light challenge')
      expect(getDifficultyDescription('Standard')).toContain('baseline difficulty')
      expect(getDifficultyDescription('Hard')).toContain('dangerous')
      expect(getDifficultyDescription('Extreme')).toContain('deadly')
    })
  })

  describe('getEncounterRecommendations', () => {
    it('should recommend adding heroes for empty party', () => {
      const party: PartyConfiguration = { heroes: [] }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0]).toContain('Add at least one hero')
    })

    it('should warn about small parties', () => {
      const party: PartyConfiguration = { heroes: [{ level: 4 }, { level: 4 }] }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.some((r) => r.includes('Small party'))).toBe(true)
    })

    it('should warn about large parties', () => {
      const party: PartyConfiguration = {
        heroes: Array(7).fill({ level: 4 })
      }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.some((r) => r.includes('Large party'))).toBe(true)
    })

    it('should warn about wide level ranges', () => {
      const party: PartyConfiguration = {
        heroes: [{ level: 1 }, { level: 5 }, { level: 6 }]
      }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.some((r) => r.includes('Wide level range'))).toBe(true)
    })

    it('should provide recommendations for low-level parties', () => {
      const party: PartyConfiguration = {
        heroes: [{ level: 1 }, { level: 2 }, { level: 1 }]
      }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.some((r) => r.includes('Low-level party'))).toBe(true)
    })

    it('should provide recommendations for high-level parties', () => {
      const party: PartyConfiguration = {
        heroes: [{ level: 9 }, { level: 10 }, { level: 8 }]
      }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.some((r) => r.includes('High-level party'))).toBe(true)
    })
  })

  describe('validatePartyConfiguration', () => {
    it('should validate correct party', () => {
      const party: PartyConfiguration = {
        heroes: [{ level: 3 }, { level: 4 }, { level: 5 }]
      }
      const result = validatePartyConfiguration(party)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty party', () => {
      const party: PartyConfiguration = { heroes: [] }
      const result = validatePartyConfiguration(party)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.toLowerCase().includes('at least one hero'))).toBe(true)
    })

    it('should reject invalid levels', () => {
      const party: PartyConfiguration = {
        heroes: [{ level: 0 }, { level: 11 }]
      }
      const result = validatePartyConfiguration(party)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should accept boundary levels (1 and 10)', () => {
      const party: PartyConfiguration = {
        heroes: [{ level: 1 }, { level: 10 }]
      }
      const result = validatePartyConfiguration(party)
      expect(result.valid).toBe(true)
    })
  })
})
