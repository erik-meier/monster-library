/**
 * Shared formatting utilities for monster data
 * Used across MonsterStatBlock.vue, ActionsList.vue, and pdfExport.ts
 */

interface MonsterData {
  level?: number
  organization?: string
  role?: string
}

interface DistanceData {
  type: string
  primary?: number | string
  secondary?: number | string
  tertiary?: number | string
}

interface TargetData {
  type: string
  value?: number
}

/**
 * Format keywords array into a capitalized, comma-separated string
 */
export function formatKeywords(keywords: string[] = []): string {
  if (!keywords || !Array.isArray(keywords)) return ''
  return keywords.map(keyword =>
    keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
  ).join(', ')
}

/**
 * Format monster role string (Level X Organization Role)
 */
export function formatMonsterRole(monster: MonsterData): string {
  return `Level ${monster.level} ${monster.organization}${monster.role ? ' ' + monster.role : ''}`
}

/**
 * Format immunity object into display string
 */
export function formatImmunity(immunity?: Record<string, number>): string {
  if (!immunity || typeof immunity !== 'object') return '—'
  const result = Object.entries(immunity)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${type} ${value}`)
    .join(', ')
  return result || '—'
}

/**
 * Format weakness object into display string
 */
export function formatWeakness(weakness?: Record<string, number>): string {
  if (!weakness || typeof weakness !== 'object') return '—'
  const result = Object.entries(weakness)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${type} ${value}`)
    .join(', ')
  return result || '—'
}

/**
 * Format movement types into display string
 */
export function formatMovement(movement?: string | string[]): string {
  if (!movement) return '—'
  if (typeof movement === 'string') return movement
  if (Array.isArray(movement)) return movement.join(', ')
  return movement
}

/**
 * Format characteristic value with + prefix for positive values
 */
export function formatCharacteristic(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

/**
 * Format action distance for display
 */
export function formatActionDistance(distance?: DistanceData): string {
  if (!distance) return ''
  if (distance.type === 'melee' || distance.type === 'ranged') {
    return `${distance.type.charAt(0).toUpperCase() + distance.type.slice(1)} ${distance.primary}`
  }
  if (distance.type === 'meleeRanged') {
    return `Melee ${distance.primary} or ranged ${distance.secondary}`
  }
  if (distance.type === 'line') {
    return `${distance.primary} x ${distance.secondary} line within ${distance.tertiary}`
  }
  if (distance.type === 'cube' || distance.type === 'wall') {
    return `${distance.primary} ${distance.type} within ${distance.secondary}`
  }
  if (distance.type === 'burst') {
    return `${distance.primary} burst`
  }
  return distance.type.charAt(0).toUpperCase() + distance.type.slice(1)
}

/**
 * Format action targets for display
 */
export function formatActionTargets(target?: TargetData): string {
  if (!target) return ''
  
  const targetValue = target.value ? ` ${target.value}` : ''
  const targetMap: Record<string, string> = {
    'creature': 'creature',
    'creatureObject': 'creature or object',
    'enemy': 'enemy',
    'ally': 'ally',
    'selfAlly': 'self and ally',
    'selfOrAlly': 'self or ally',
    'special': 'special'
  }
  
  let baseText = targetMap[target.type] || target.type
  
  // Handle pluralization for specific target types
  if (target.type === 'creature' && target.value && target.value > 1) {
    baseText = 'creatures'
  } else if (target.type === 'creatureObject' && target.value && target.value > 1) {
    baseText = 'creatures or objects'
  } else if (target.type === 'enemy') {
    baseText = target.value && target.value > 1 ? 'enemies' : 'enemy'
  } else if (target.type === 'ally') {
    baseText = target.value && target.value > 1 ? 'allies' : 'ally'
  } else if (target.type === 'selfAlly') {
    baseText = 'Self and ' + `${target.value ? target.value : 'each'} ${target.value && target.value > 1 ? 'allies' : 'ally'}`
  } else if (target.type === 'selfOrAlly') {
    baseText = 'Self or ' + `${target.value ? target.value : ''} ${target.value && target.value > 1 ? 'allies' : 'ally'}`
  }
  
  return `${targetValue} ${baseText}`.trim()
}

/**
 * Format action type for display
 */
export function formatActionType(type?: string): string {
  if (!type) return ''
  if (type.toLowerCase() === 'none') return ''
  if (type.toLowerCase() === 'maneuver') return type
  if (type.toLowerCase() === 'freetriggered') type = 'free triggered'
  return type + ' action'
}

/**
 * Format tier number for power rolls (1 -> ≤11, 2 -> 12-16, 3 -> 17+)
 */
export function formatTierNumber(tier: number): string {
  const tierMap: Record<number, string> = { 1: '≤11', 2: '12-16', 3: '17+' }
  return tierMap[tier] || tier.toString()
}

/**
 * Strip HTML tags from text (useful for PDF export)
 */
export function stripHTML(text: string): string {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, '').trim()
}

/**
 * Check if an action/ability has a power roll
 */
export function actionHasPowerRoll(action: any): boolean {
  // Check for tiers array in the new flattened structure
  if (action.system?.power?.tiers && action.system.power.tiers.length > 0) {
    return true
  }

  // Fallback check for old effects structure (if any remain)
  if (action.system?.power?.effects) {
    for (const effect of Object.values(action.system.power.effects)) {
      if ((effect as any).type === 'damage') {
        return true
      }
    }
  }
  return false
}

/**
 * Extract description from action/ability
 */
export function extractDescription(action: any): string {
  if (!action.system) return action.description || action.effect || ''
  if (action.system.description && action.system.description.value) {
    return action.system.description.value
  }
  if (action.system.effect) {
    // Check for new unified text field first, fallback to legacy before/after
    return action.system.effect.text || action.system.effect.before || action.system.effect.after
  }
  return ''
}