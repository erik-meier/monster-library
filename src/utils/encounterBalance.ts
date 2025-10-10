/**
 * Draw Steel encounter balancing utilities
 * Based on Draw Steel TTRPG encounter building rules
 */

export type EncounterDifficulty = 'Trivial' | 'Easy' | 'Standard' | 'Hard' | 'Extreme'

export interface PartyConfiguration {
  heroes: Array<{ level: number; victories: number }>
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
  role?: string
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
 * Calculate party strength (sum of hero levels plus victory bonuses)
 * Every 2 victories on average increases party strength as if there was an additional hero
 */
export function calculatePartyStrength(party: PartyConfiguration): number {
  // Base strength from hero levels
  const baseStrength = party.heroes.reduce((sum, hero) => sum + (2 * hero.level + 4), 0)
  
  // Victory bonus: every 2 victories on average adds strength equivalent to one additional hero
  const totalVictories = party.heroes.reduce((sum, hero) => sum + hero.victories, 0)
  const averageVictories = party.heroes.length > 0 ? totalVictories / party.heroes.length : 0
  const averageHeroLevel = party.heroes.length > 0 ? 
    party.heroes.reduce((sum, hero) => sum + hero.level, 0) / party.heroes.length : 1
  
  // Each 2 victories on average = strength of one additional hero of average level
  const victoryBonus = Math.floor(averageVictories / 2) * (2 * averageHeroLevel + 4)
  
  return baseStrength + victoryBonus
}

/**
 * Calculate the strength thresholds for each difficulty level
 */
export function calculateDifficultyThresholds(party: PartyConfiguration): {
  trivial: number
  easy: number
  standard: number
  hard: number
  extreme: number
} {
  const partyStrength = calculatePartyStrength(party)
  const averageHeroLevel = party.heroes.length > 0 ? 
    party.heroes.reduce((sum, hero) => sum + hero.level, 0) / party.heroes.length : 1
  const heroStrength = 2 * averageHeroLevel + 4
  
  return {
    trivial: 0, // Starts at 0
    easy: Math.max(0, partyStrength - heroStrength), // Less than party strength - 1 hero
    standard: partyStrength, // Party strength
    hard: partyStrength + heroStrength, // Party strength + 1 hero
    extreme: partyStrength + (3 * heroStrength) // Party strength + 3 heroes
  }
}

/**
 * Determine the current difficulty of an encounter based on encounter strength
 */
export function getCurrentEncounterDifficulty(
  party: PartyConfiguration,
  encounterStrength: number
): EncounterDifficulty {
  const thresholds = calculateDifficultyThresholds(party)
  
  if (encounterStrength < thresholds.easy) return 'Trivial'
  if (encounterStrength < thresholds.standard) return 'Easy'
  if (encounterStrength < thresholds.hard) return 'Standard'
  if (encounterStrength < thresholds.extreme) return 'Hard'
  return 'Extreme'
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
 * Calculate encounter strength (total monster EV) and determine difficulty
 */
export function calculateEncounterDifficulty(
  party: PartyConfiguration,
  monsters: MonsterInEncounter[]
): {
  encounterStrength: number
  difficulty: EncounterDifficulty
  thresholds: ReturnType<typeof calculateDifficultyThresholds>
  progressToNext: number
} {
  const encounterStrength = calculateBudgetUsage(monsters)
  const difficulty = getCurrentEncounterDifficulty(party, encounterStrength)
  const thresholds = calculateDifficultyThresholds(party)
  
  // Calculate progress to next difficulty level
  let currentThreshold = 0
  let nextThreshold = thresholds.easy
  
  if (difficulty === 'Trivial') {
    currentThreshold = 0
    nextThreshold = thresholds.easy
  } else if (difficulty === 'Easy') {
    currentThreshold = thresholds.easy
    nextThreshold = thresholds.standard
  } else if (difficulty === 'Standard') {
    currentThreshold = thresholds.standard
    nextThreshold = thresholds.hard
  } else if (difficulty === 'Hard') {
    currentThreshold = thresholds.hard
    nextThreshold = thresholds.extreme
  } else {
    // Extreme - no next level
    currentThreshold = thresholds.extreme
    nextThreshold = thresholds.extreme
  }
  
  const progressToNext = nextThreshold > currentThreshold
    ? Math.min(100, Math.round(((encounterStrength - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    : 100
  
  return {
    encounterStrength,
    difficulty,
    thresholds,
    progressToNext: Math.max(0, progressToNext)
  }
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
      'Trivial encounters should pose no challenge to the heroes and should be used sparingly to highlight the heroes\' strengths.',
    Easy:
      'Easy encounters are not life-threatening unless the heroes are very low on stamina or recoveries.',
    Standard:
      'Standard encounters are the most common, and should deplete some stamina and recoveries.',
    Hard:
      'Hard encounters are typically climactic encounters with a villain or major threat that should put the heroes in real danger.',
    Extreme:
      'Extreme encounters are deadly, with a fight to the bitter end likely resulting in hero deaths.'
  }
  return descriptions[difficulty]
}

/**
 * Get recommendations for party configuration
 */
export function getEncounterRecommendations(party: PartyConfiguration): string[] {
  const heroCount = party.heroes.length
  const recommendations: string[] = []

  if (heroCount === 0) {
    recommendations.push('Add at least one hero to configure the encounter.')
    return recommendations
  }

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

  return recommendations
}

/**
 * Get recommendations based on encounter composition (monsters vs party)
 */
export function getMonsterRecommendations(
  party: PartyConfiguration,
  monsters: MonsterInEncounter[]
): string[] {
  const heroCount = party.heroes.length
  const recommendations: string[] = []

  if (heroCount === 0 || monsters.length === 0) {
    return recommendations // No recommendations if no party or no monsters
  }

  const avgHeroLevel = party.heroes.reduce((sum, hero) => sum + hero.level, 0) / heroCount
  const maxMonsterLevel = Math.max(...monsters.map(m => m.level))
  const totalMonsterCount = monsters.reduce((sum, monster) => sum + monster.count, 0)
  const monsterCountPerHero = totalMonsterCount / heroCount
  const uniqueMonsterTypes = monsters.length
  
  const minionMonsters = monsters.filter(m => m.organization.toLowerCase() === 'minion')
  const soloMonsters = monsters.filter(m => m.organization.toLowerCase() === 'solo')
  const totalMinionCount = minionMonsters.reduce((sum, monster) => sum + monster.count, 0)

  // Check monster level vs hero level
  if (maxMonsterLevel >= avgHeroLevel + 3) {
    recommendations.push('⚠️ Monster levels may be too high - highest monster is 3+ levels above average hero level.')
  }

  // Check for solo monsters with high level difference
  if (maxMonsterLevel >= avgHeroLevel + 1 && soloMonsters.length > 0 && monsters.every(m => m.organization.toLowerCase() === 'solo')) {
    recommendations.push('⚠️ Monster levels may be too high - solo monsters are 1+ levels above average hero level.')
  }

  // Check minion count
  if (totalMinionCount > 0 && totalMinionCount < 8) {
    recommendations.push('💡 Consider adding more minions - they are more effective in larger numbers (8+).')
  }

  // Check total monster count per hero
  if (monsterCountPerHero > 8) {
    recommendations.push('⚠️ Many monsters per hero - this encounter may be difficult to run effectively.')
  }

  // Check non-minion density
  if (monsterCountPerHero > 3 && totalMinionCount < totalMonsterCount / 2) {
    recommendations.push('⚠️ Many non-minion monsters per hero - encounter may be challenging or difficult to run.')
  }

  // Check monster variety
  if (uniqueMonsterTypes > 6) {
    recommendations.push('⚠️ Many different monster types - variety could make the encounter challenging to run.')
  }

  // Check solo monsters with others
  if (soloMonsters.length > 0 && monsters.length > soloMonsters.length) {
    recommendations.push('⚠️ Solo creatures work best when encountered alone, not with other monsters.')
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
