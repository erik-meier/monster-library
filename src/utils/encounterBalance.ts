/**
 * Draw Steel encounter balancing utilities
 * Based on Draw Steel TTRPG encounter building rules
 */

export type EncounterDifficulty = 'Trivial' | 'Easy' | 'Standard' | 'Hard' | 'Extreme'

export interface PartyConfiguration {
  heroes: Array<{ level: number }>
}

export interface EncounterBudget {
  total: number
  used: number
  remaining: number
  percentage: number
}

export interface MonsterInEncounter {
  id: string
  name: string
  level: number
  ev: number
  organization: string
  count: number
}

/**
 * Get the budget multiplier for a given difficulty
 */
export function getDifficultyMultiplier(difficulty: EncounterDifficulty): number {
  const multipliers: Record<EncounterDifficulty, number> = {
    Trivial: 0.5,
    Easy: 0.75,
    Standard: 1.0,
    Hard: 1.5,
    Extreme: 2.0
  }
  return multipliers[difficulty]
}

/**
 * Calculate party strength (sum of hero levels)
 */
export function calculatePartyStrength(party: PartyConfiguration): number {
  return party.heroes.reduce((sum, hero) => sum + hero.level, 0)
}

/**
 * Calculate total encounter budget based on party and difficulty
 * Formula: Party Strength × Difficulty Multiplier
 */
export function calculateEncounterBudget(
  party: PartyConfiguration,
  difficulty: EncounterDifficulty
): number {
  const partyStrength = calculatePartyStrength(party)
  const multiplier = getDifficultyMultiplier(difficulty)
  return Math.round(partyStrength * multiplier)
}

/**
 * Calculate the EV cost for adding monsters to an encounter
 * For minions, EV represents 4 minions, so we need to scale appropriately
 */
export function calculateMonsterCost(monster: MonsterInEncounter): number {
  // Minions: EV is for 4 minions, so cost per minion is EV/4
  if (monster.organization.toLowerCase() === 'minion') {
    return (monster.ev / 4) * monster.count
  }
  
  // All other organizations: EV × count
  return monster.ev * monster.count
}

/**
 * Calculate current budget usage from a list of monsters
 */
export function calculateBudgetUsage(monsters: MonsterInEncounter[]): number {
  return monsters.reduce((sum, monster) => sum + calculateMonsterCost(monster), 0)
}

/**
 * Calculate encounter budget summary
 */
export function getEncounterBudgetSummary(
  party: PartyConfiguration,
  difficulty: EncounterDifficulty,
  monsters: MonsterInEncounter[]
): EncounterBudget {
  const total = calculateEncounterBudget(party, difficulty)
  const used = calculateBudgetUsage(monsters)
  const remaining = total - used
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0

  return {
    total,
    used: Math.round(used * 10) / 10, // Round to 1 decimal
    remaining: Math.round(remaining * 10) / 10,
    percentage
  }
}

/**
 * Get budget status (for UI feedback)
 */
export function getBudgetStatus(budget: EncounterBudget): 'safe' | 'warning' | 'danger' | 'over' {
  if (budget.percentage >= 100) return 'over'
  if (budget.percentage >= 90) return 'danger'
  if (budget.percentage >= 75) return 'warning'
  return 'safe'
}

/**
 * Get difficulty description for tooltips
 */
export function getDifficultyDescription(difficulty: EncounterDifficulty): string {
  const descriptions: Record<EncounterDifficulty, string> = {
    Trivial:
      'Trivial encounters pose minimal threat. Heroes should easily overcome these challenges with few resources spent.',
    Easy:
      'Easy encounters provide a light challenge. Heroes will likely succeed without expending significant resources.',
    Standard:
      'Standard encounters are the baseline difficulty. Heroes should win but may need to use some abilities and tactics.',
    Hard:
      'Hard encounters are dangerous. Heroes will need to work together strategically and use resources wisely.',
    Extreme:
      'Extreme encounters are deadly. Heroes face serious risk of defeat and should approach with caution and planning.'
  }
  return descriptions[difficulty]
}

/**
 * Get recommendations for encounter difficulty based on party composition
 */
export function getEncounterRecommendations(party: PartyConfiguration): string[] {
  const heroCount = party.heroes.length
  const recommendations: string[] = []

  if (heroCount === 0) {
    recommendations.push('Add at least one hero to configure the encounter.')
    return recommendations
  }

  const avgLevel = calculatePartyStrength(party) / heroCount
  const levels = party.heroes.map(h => h.level)
  const minLevel = Math.min(...levels)
  const maxLevel = Math.max(...levels)
  const levelSpread = maxLevel - minLevel

  if (heroCount < 4) {
    recommendations.push(
      `Small party (${heroCount} heroes): Consider easier difficulties or be cautious with action economy.`
    )
  }

  if (heroCount > 6) {
    recommendations.push(
      `Large party (${heroCount} heroes): Consider harder difficulties or multiple encounters.`
    )
  }

  if (levelSpread > 2) {
    recommendations.push(
      `Wide level range (${minLevel}-${maxLevel}): Balance encounters carefully to challenge all heroes.`
    )
  }

  if (avgLevel <= 2) {
    recommendations.push('Low-level party: Trivial and Easy encounters recommended for new heroes.')
  } else if (avgLevel >= 8) {
    recommendations.push('High-level party: Consider Hard and Extreme encounters for worthy challenges.')
  }

  return recommendations
}

/**
 * Validate party configuration
 */
export function validatePartyConfiguration(party: PartyConfiguration): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!party.heroes || party.heroes.length === 0) {
    errors.push('At least one hero is required.')
  }

  party.heroes.forEach((hero, index) => {
    if (!hero.level || hero.level < 1) {
      errors.push(`Hero ${index + 1}: Level must be at least 1.`)
    }
    if (hero.level > 10) {
      errors.push(`Hero ${index + 1}: Level cannot exceed 10.`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
