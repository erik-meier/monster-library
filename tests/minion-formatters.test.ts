import { describe, it, expect } from 'vitest'
import { formatActionTargets, formatMonsterEV } from '../src/utils/formatters'

describe('Minion Formatters', () => {
  describe('formatActionTargets with minion organization', () => {
    it('should add "per minion" suffix for creature targets', () => {
      const target = { type: 'creature', value: 1 }
      expect(formatActionTargets(target, 'Minion')).toBe('1 creature per minion')
    })

    it('should add "per minion" suffix for creatureObject targets', () => {
      const target = { type: 'creatureObject', value: 1 }
      expect(formatActionTargets(target, 'Minion')).toBe('1 creature or object per minion')
    })

    it('should add "per minion" suffix for enemy targets', () => {
      const target = { type: 'enemy', value: 1 }
      expect(formatActionTargets(target, 'Minion')).toBe('1 enemy per minion')
    })

    it('should add "per minion" suffix for multiple enemies', () => {
      const target = { type: 'enemy', value: 2 }
      expect(formatActionTargets(target, 'Minion')).toBe('2 enemies per minion')
    })

    it('should add "per minion" suffix for ally targets', () => {
      const target = { type: 'ally', value: 1 }
      expect(formatActionTargets(target, 'Minion')).toBe('1 ally per minion')
    })

    it('should not add "per minion" suffix for self targets', () => {
      const target = { type: 'self' }
      expect(formatActionTargets(target, 'Minion')).toBe('Self')
    })

    it('should not add "per minion" suffix for special targets', () => {
      const target = { type: 'special' }
      expect(formatActionTargets(target, 'Minion')).toBe('Special')
    })

    it('should add "per minion" suffix for selfAlly targets', () => {
      const target = { type: 'selfAlly', value: 1 }
      expect(formatActionTargets(target, 'Minion')).toBe('Self and 1 ally per minion')
    })

    it('should add "per minion" suffix for selfOrAlly targets', () => {
      const target = { type: 'selfOrAlly', value: 1 }
      expect(formatActionTargets(target, 'Minion')).toBe('Self or 1 ally per minion')
    })
  })

  describe('formatActionTargets without minion organization', () => {
    it('should not add "per minion" suffix for creature targets', () => {
      const target = { type: 'creature', value: 1 }
      expect(formatActionTargets(target, 'Elite')).toBe('1 creature')
      expect(formatActionTargets(target)).toBe('1 creature')
    })

    it('should not add "per minion" suffix for creatureObject targets', () => {
      const target = { type: 'creatureObject', value: 1 }
      expect(formatActionTargets(target, 'Solo')).toBe('1 creature or object')
    })

    it('should handle plural creatures correctly', () => {
      const target = { type: 'creature', value: 3 }
      expect(formatActionTargets(target, 'Horde')).toBe('3 creatures')
    })

    it('should handle plural creatureObject correctly', () => {
      const target = { type: 'creatureObject', value: 2 }
      expect(formatActionTargets(target, 'Platoon')).toBe('2 creatures or objects')
    })
  })

  describe('formatMonsterEV', () => {
    it('should format minion EV with "for 4 minions" suffix', () => {
      const monster = { level: 1, organization: 'Minion', ev: 4 }
      expect(formatMonsterEV(monster)).toBe('EV 4 for 4 minions')
    })

    it('should format non-minion EV without suffix', () => {
      const monster = { level: 1, organization: 'Elite', ev: 10 }
      expect(formatMonsterEV(monster)).toBe('EV 10')
    })

    it('should format solo EV without suffix', () => {
      const monster = { level: 5, organization: 'Solo', ev: 40 }
      expect(formatMonsterEV(monster)).toBe('EV 40')
    })

    it('should format horde EV without suffix', () => {
      const monster = { level: 2, organization: 'Horde', ev: 6 }
      expect(formatMonsterEV(monster)).toBe('EV 6')
    })

    it('should handle different minion EV values', () => {
      const monster1 = { level: 1, organization: 'Minion', ev: 2 }
      expect(formatMonsterEV(monster1)).toBe('EV 2 for 4 minions')

      const monster2 = { level: 3, organization: 'Minion', ev: 8 }
      expect(formatMonsterEV(monster2)).toBe('EV 8 for 4 minions')
    })

    it('should handle missing EV value', () => {
      const monster = { level: 1, organization: 'Minion' }
      expect(formatMonsterEV(monster)).toBe('EV 0 for 4 minions')
    })
  })
})
