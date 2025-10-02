import { describe, it, expect } from 'vitest'
import { rollPowerRoll, calculateTier, getTierLabel } from '@/utils/diceRoller'

describe('diceRoller', () => {
  describe('calculateTier', () => {
    it('returns tier 1 for totals 11 or less', () => {
      expect(calculateTier(2)).toBe(1)
      expect(calculateTier(11)).toBe(1)
    })

    it('returns tier 2 for totals 12-16', () => {
      expect(calculateTier(12)).toBe(2)
      expect(calculateTier(14)).toBe(2)
      expect(calculateTier(16)).toBe(2)
    })

    it('returns tier 3 for totals 17 or more', () => {
      expect(calculateTier(17)).toBe(3)
      expect(calculateTier(20)).toBe(3)
      expect(calculateTier(25)).toBe(3)
    })
  })

  describe('getTierLabel', () => {
    it('returns correct tier labels', () => {
      expect(getTierLabel(1)).toBe('≤11')
      expect(getTierLabel(2)).toBe('12-16')
      expect(getTierLabel(3)).toBe('17+')
    })

    it('returns tier number as string for unknown tiers', () => {
      expect(getTierLabel(4)).toBe('4')
    })
  })

  describe('rollPowerRoll', () => {
    it('returns a valid PowerRollResult', () => {
      const result = rollPowerRoll(5)
      
      expect(result).toHaveProperty('roll1')
      expect(result).toHaveProperty('roll2')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('modifier')
      expect(result).toHaveProperty('tier')
      
      expect(result.modifier).toBe(5)
      expect(result.roll1).toBeGreaterThanOrEqual(1)
      expect(result.roll1).toBeLessThanOrEqual(10)
      expect(result.roll2).toBeGreaterThanOrEqual(1)
      expect(result.roll2).toBeLessThanOrEqual(10)
    })

    it('calculates total correctly', () => {
      const result = rollPowerRoll(3)
      expect(result.total).toBe(result.roll1 + result.roll2 + result.modifier)
    })

    it('assigns correct tier based on total', () => {
      // Run multiple times to test various outcomes
      for (let i = 0; i < 10; i++) {
        const result = rollPowerRoll(0)
        const expectedTier = calculateTier(result.total)
        expect(result.tier).toBe(expectedTier)
      }
    })

    it('handles negative modifiers', () => {
      const result = rollPowerRoll(-2)
      expect(result.modifier).toBe(-2)
      expect(result.total).toBe(result.roll1 + result.roll2 - 2)
    })

    it('handles positive modifiers', () => {
      const result = rollPowerRoll(7)
      expect(result.modifier).toBe(7)
      expect(result.total).toBe(result.roll1 + result.roll2 + 7)
    })
  })
})
