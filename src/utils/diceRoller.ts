/**
 * Dice rolling utilities for Draw Steel power rolls
 */

export interface PowerRollResult {
  roll1: number
  roll2: number
  total: number
  modifier: number
  tier: number
}

/**
 * Roll 2d10 and add modifier
 * @param modifier The characteristic modifier to add
 * @returns PowerRollResult with individual dice, total, and tier
 */
export function rollPowerRoll(modifier: number): PowerRollResult {
  const roll1 = Math.floor(Math.random() * 10) + 1
  const roll2 = Math.floor(Math.random() * 10) + 1
  const total = roll1 + roll2 + modifier

  const tier = calculateTier(total)

  return {
    roll1,
    roll2,
    total,
    modifier,
    tier
  }
}

/**
 * Calculate the tier based on the total roll result
 * Tier 1: ≤11, Tier 2: 12-16, Tier 3: 17+
 */
export function calculateTier(total: number): number {
  if (total <= 11) return 1
  if (total <= 16) return 2
  return 3
}

/**
 * Get tier label for display
 */
export function getTierLabel(tier: number): string {
  const tierMap: Record<number, string> = {
    1: '≤11',
    2: '12-16',
    3: '17+'
  }
  return tierMap[tier] || tier.toString()
}

/**
 * Parse a power roll formula (e.g., "2d10 + 5", "2d10 + 2", "2d10") and extract the modifier
 * @param formula The power roll formula string
 * @returns The modifier number, or 0 if no modifier found
 */
export function parsePowerRollModifier(formula: string): number {
  if (!formula) return 0
  
  // Match patterns like "2d10 + 5", "2d10 - 2", "2d10+5", "2d10-2"
  const match = formula.match(/2d10\s*([+-])\s*(\d+)/)
  if (!match) {
    // Check if it's just "2d10" with no modifier
    if (formula.trim() === '2d10') {
      return 0
    }
    return 0
  }
  
  const sign = match[1]
  const value = parseInt(match[2])
  
  return sign === '-' ? -value : value
}
