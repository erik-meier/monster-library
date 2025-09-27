// TypeScript interfaces for monster form components

export interface MonsterFormData {
  // Basic Info
  id: string
  name: string
  level: number
  ev: number
  role: string
  organization: string
  keywords: string[]
  
  // Stats
  size: {
    value: number
    letter: string
  }
  speed: number
  stamina: number
  stability: number
  freeStrike: number
  movementTypes: string[]
  
  // Characteristics
  characteristics: {
    might: number
    agility: number
    reason: number
    intuition: number
    presence: number
  }
  
  // Defenses
  immunities: Record<string, number>
  weaknesses: Record<string, number>
  
  // Abilities & Items
  items: MonsterItem[]
  
  // Source Info
  source?: {
    book?: string
    page?: string
    license?: string
  }
}

export interface MonsterItem {
  name: string
  type: 'feature' | 'ability'
  system: {
    category?: 'signature' | 'heroic' | string
    type?: 'main' | 'move' | 'none' | string
    resource?: number | null
    keywords: string[]
    distance?: {
      type: 'melee' | 'ranged' | 'meleeRanged' | 'special'
      primary?: number | string
      secondary?: number | string
    }
    target?: {
      type: string
      value?: number
    }
    trigger?: string
    power?: {
      roll?: {
        formula: string
        characteristics: string[]
      }
      tiers?: Array<{
        tier: number
        display: string
      }>
      effects?: Record<string, unknown>
    } | null
    effect?: {
      before?: string
      after?: string
    }
    description?: {
      value: string
      director?: string
    }
    spend?: {
      text: string
      value: number | null
    }
  }
}

export interface FormSection {
  id: string
  label: string
  component: string
  isValid?: boolean
}

// Common role options for Draw Steel
export const MONSTER_ROLES = [
  'Ambusher',
  'Artillery', 
  'Brute',
  'Controller',
  'Defender',
  'Harrier',
  'Hexer',
  'Mount',
  'Support'
] as const

// Common organization options
export const MONSTER_ORGANIZATIONS = [
  'minion',
  'horde', 
  'platoon',
  'elite',
  'leader',
  'solo'
] as const

// Common size letters - only for size 1, sizes above 1L are just numbers
export const SIZE_LETTERS = ['T', 'S', 'M', 'L'] as const

// Common movement types
export const MOVEMENT_TYPES = [
  'walk',
  'swim', 
  'climb',
  'fly',
  'burrow',
  'teleport'
] as const

// Common keywords for Draw Steel monsters
export const COMMON_KEYWORDS = [
  'abyssal',
  'accursed', 
  'animal',
  'beast',
  'construct',
  'dragon',
  'elemental',
  'fey',
  'giant',
  'horror',
  'humanoid',
  'infernal',
  'ooze',
  'plant',
  'swarm',
  'undead'
] as const

// Common damage types for immunities/weaknesses
export const DAMAGE_TYPES = [
  'acid',
  'cold', 
  'corruption',
  'fire',
  'holy',
  'lightning',
  'poison',
  'psychic',
  'sonic'
] as const

// Common ability keywords
export const ABILITY_KEYWORDS = [
  'melee',
  'ranged',
  'strike',
  'weapon',
  'area',
  'psionic',
  'charge'
] as const

export type MonsterRole = typeof MONSTER_ROLES[number]
export type MonsterOrganization = typeof MONSTER_ORGANIZATIONS[number]
export type SizeLetter = typeof SIZE_LETTERS[number]
export type MovementType = typeof MOVEMENT_TYPES[number]
export type CommonKeyword = typeof COMMON_KEYWORDS[number]
export type DamageType = typeof DAMAGE_TYPES[number]
export type AbilityKeyword = typeof ABILITY_KEYWORDS[number]