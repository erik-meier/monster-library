import { describe, it, expect } from 'vitest'
import {
  getDifficultyMultiplier,
  calculatePartyStrength,
  calculateDifficultyThresholds,
  getCurrentEncounterDifficulty,
  calculateEncounterBudget,
  calculateMonsterCost,
  calculateBudgetUsage,
  calculateEncounterDifficulty,
  getEncounterBudgetSummary,
  getBudgetStatus,
  getDifficultyDescription,
  getEncounterRecommendations,
  getMonsterRecommendations,
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
    it('should calculate party strength using new formula (2*level + 4)', () => {
      const party: PartyConfiguration = {
        heroes: [
          { level: 3, victories: 0 }, 
          { level: 4, victories: 0 }, 
          { level: 3, victories: 0 }, 
          { level: 5, victories: 0 }
        ]
      }
      // (2*3+4) + (2*4+4) + (2*3+4) + (2*5+4) = 10 + 12 + 10 + 14 = 46
      expect(calculatePartyStrength(party)).toBe(46)
    })

    it('should include victory bonuses', () => {
      const party: PartyConfiguration = {
        heroes: [
          { level: 4, victories: 4 }, // 4 victories = 2 average victories
          { level: 4, victories: 0 }
        ]
      }
      // Base: (2*4+4) + (2*4+4) = 12 + 12 = 24
      // Average victories: 4/2 = 2, so floor(2/2) = 1 bonus hero of level 4 = (2*4+4) = 12
      // Total: 24 + 12 = 36
      expect(calculatePartyStrength(party)).toBe(36)
    })

    it('should return 0 for empty party', () => {
      const party: PartyConfiguration = { heroes: [] }
      expect(calculatePartyStrength(party)).toBe(0)
    })

    it('should handle single hero', () => {
      const party: PartyConfiguration = { heroes: [{ level: 7, victories: 0 }] }
      // 2*7 + 4 = 18
      expect(calculatePartyStrength(party)).toBe(18)
    })
  })

  describe('calculateEncounterBudget', () => {
    const party: PartyConfiguration = {
      heroes: [
        { level: 3, victories: 0 }, 
        { level: 4, victories: 0 }, 
        { level: 3, victories: 0 }, 
        { level: 4, victories: 0 }
      ]
    }
    // Party strength: (2*3+4) + (2*4+4) + (2*3+4) + (2*4+4) = 10 + 12 + 10 + 12 = 44

    it('should calculate Trivial budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Trivial')).toBe(22) // 44 * 0.5 = 22
    })

    it('should calculate Easy budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Easy')).toBe(33) // 44 * 0.75 = 33
    })

    it('should calculate Standard budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Standard')).toBe(44) // 44 * 1.0 = 44
    })

    it('should calculate Hard budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Hard')).toBe(66) // 44 * 1.5 = 66
    })

    it('should calculate Extreme budget correctly', () => {
      expect(calculateEncounterBudget(party, 'Extreme')).toBe(88) // 44 * 2.0 = 88
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
      heroes: [
        { level: 4, victories: 0 }, 
        { level: 4, victories: 0 }, 
        { level: 4, victories: 0 }, 
        { level: 4, victories: 0 }
      ]
    }
    // Party strength: 4 * (2*4+4) = 4 * 12 = 48

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
      expect(summary.total).toBe(48) // 48 * 1.0
      expect(summary.used).toBe(8)
      expect(summary.remaining).toBe(40)
      expect(summary.percentage).toBe(17) // (8/48)*100 = 16.67, rounded to 17
    })

    it('should handle empty encounter', () => {
      const summary = getEncounterBudgetSummary(party, 'Standard', [])
      expect(summary.total).toBe(48)
      expect(summary.used).toBe(0)
      expect(summary.remaining).toBe(48)
      expect(summary.percentage).toBe(0)
    })

    it('should handle over-budget encounters', () => {
      const monsters: MonsterInEncounter[] = [
        {
          id: '1',
          name: 'Monster',
          level: 5,
          ev: 60,
          organization: 'Standard',
          count: 1
        }
      ]

      const summary = getEncounterBudgetSummary(party, 'Standard', monsters)
      expect(summary.total).toBe(48)
      expect(summary.used).toBe(60)
      expect(summary.remaining).toBe(-12)
      expect(summary.percentage).toBe(125) // (60/48)*100 = 125
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
      expect(getDifficultyDescription('Trivial')).toContain('no challenge')
      expect(getDifficultyDescription('Easy')).toContain('not life-threatening')
      expect(getDifficultyDescription('Standard')).toContain('most common')
      expect(getDifficultyDescription('Hard')).toContain('climactic')
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
      const party: PartyConfiguration = { 
        heroes: [{ level: 4, victories: 0 }, { level: 4, victories: 0 }] 
      }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.some((r) => r.includes('Small party'))).toBe(true)
    })

    it('should warn about large parties', () => {
      const party: PartyConfiguration = {
        heroes: Array(7).fill({ level: 4, victories: 0 })
      }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.some((r) => r.includes('Large party'))).toBe(true)
    })

    it('should warn about wide level ranges', () => {
      const party: PartyConfiguration = {
        heroes: [
          { level: 1, victories: 0 }, 
          { level: 5, victories: 0 }, 
          { level: 6, victories: 0 }
        ]
      }
      const recommendations = getEncounterRecommendations(party)
      expect(recommendations.some((r) => r.includes('Wide level range'))).toBe(true)
    })
  })

  describe('validatePartyConfiguration', () => {
    it('should validate correct party', () => {
      const party: PartyConfiguration = {
        heroes: [
          { level: 3, victories: 0 }, 
          { level: 4, victories: 1 }, 
          { level: 5, victories: 2 }
        ]
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
        heroes: [
          { level: 0, victories: 0 }, 
          { level: 11, victories: 0 }
        ]
      }
      const result = validatePartyConfiguration(party)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should accept boundary levels (1 and 10)', () => {
      const party: PartyConfiguration = {
        heroes: [
          { level: 1, victories: 0 }, 
          { level: 10, victories: 5 }
        ]
      }
      const result = validatePartyConfiguration(party)
      expect(result.valid).toBe(true)
    })
  })

  describe('calculateDifficultyThresholds', () => {
    it('should calculate thresholds based on party strength', () => {
      const party: PartyConfiguration = {
        heroes: [{ level: 4, victories: 0 }, { level: 4, victories: 0 }]
      }
      // Party strength: 2 * (2*4+4) = 2 * 12 = 24
      // Average hero level: 4
      // Hero strength: 2*4+4 = 12
      
      const thresholds = calculateDifficultyThresholds(party)
      expect(thresholds.trivial).toBe(0)
      expect(thresholds.easy).toBe(12) // 24 - 12 = 12
      expect(thresholds.standard).toBe(24) // Party strength
      expect(thresholds.hard).toBe(36) // 24 + 12 = 36
      expect(thresholds.extreme).toBe(60) // 24 + (3*12) = 60
    })
  })

  describe('getCurrentEncounterDifficulty', () => {
    const party: PartyConfiguration = {
      heroes: [{ level: 4, victories: 0 }, { level: 4, victories: 0 }]
    }

    it('should return correct difficulty for different encounter strengths', () => {
      expect(getCurrentEncounterDifficulty(party, 5)).toBe('Trivial')
      expect(getCurrentEncounterDifficulty(party, 15)).toBe('Easy')
      expect(getCurrentEncounterDifficulty(party, 25)).toBe('Standard')
      expect(getCurrentEncounterDifficulty(party, 40)).toBe('Hard')
      expect(getCurrentEncounterDifficulty(party, 70)).toBe('Extreme')
    })
  })

  describe('calculateEncounterDifficulty', () => {
    const party: PartyConfiguration = {
      heroes: [{ level: 4, victories: 0 }, { level: 4, victories: 0 }]
    }

    it('should return complete encounter analysis', () => {
      const monsters: MonsterInEncounter[] = [
        {
          id: '1',
          name: 'Monster',
          level: 4,
          ev: 25,
          organization: 'Standard',
          count: 1
        }
      ]

      const result = calculateEncounterDifficulty(party, monsters)
      expect(result.encounterStrength).toBe(25)
      expect(result.difficulty).toBe('Standard')
      expect(result.thresholds).toBeDefined()
      expect(result.progressToNext).toBeGreaterThanOrEqual(0)
      expect(result.progressToNext).toBeLessThanOrEqual(100)
    })
  })

  describe('getMonsterRecommendations', () => {
    const party: PartyConfiguration = {
      heroes: [{ level: 4, victories: 0 }, { level: 4, victories: 0 }]
    }

    it('should return empty array for no monsters', () => {
      const recommendations = getMonsterRecommendations(party, [])
      expect(recommendations).toEqual([])
    })

    it('should warn about high-level monsters', () => {
      const monsters: MonsterInEncounter[] = [
        {
          id: '1',
          name: 'High Level Monster',
          level: 8, // 4+ levels above average hero level (4)
          ev: 30,
          organization: 'Standard',
          count: 1
        }
      ]

      const recommendations = getMonsterRecommendations(party, monsters)
      expect(recommendations.some((r) => r.includes('⚠️') && r.includes('too high'))).toBe(true)
    })

    it('should suggest more minions when count is low', () => {
      const monsters: MonsterInEncounter[] = [
        {
          id: '1',
          name: 'Few Minions',
          level: 3,
          ev: 8,
          organization: 'Minion',
          count: 4
        }
      ]

      const recommendations = getMonsterRecommendations(party, monsters)
      expect(recommendations.some((r) => r.includes('💡') && r.includes('more minions'))).toBe(true)
    })

    it('should warn about solo monsters with others', () => {
      const monsters: MonsterInEncounter[] = [
        {
          id: '1',
          name: 'Solo Monster',
          level: 4,
          ev: 20,
          organization: 'Solo',
          count: 1
        },
        {
          id: '2',
          name: 'Regular Monster',
          level: 4,
          ev: 15,
          organization: 'Standard',
          count: 1
        }
      ]

      const recommendations = getMonsterRecommendations(party, monsters)
      expect(recommendations.some((r) => r.includes('⚠️') && r.includes('Solo creatures'))).toBe(true)
    })
  })
})
