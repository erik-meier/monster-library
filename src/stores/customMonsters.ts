import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getMonster as getBundledMonster, getAllMonsters as getBundledMonsters } from '@/data/monsters.js'
import type { MonsterSchema } from '../../tests/helpers/validation-utils'

export interface CustomMonster {
  id: string;
  name: string;
  level: number;
  ev: number;
  role: string;
  organization: string;
  keywords?: string[];
  size: {
    value: number;
    letter: string;
  };
  speed: number;
  stamina: number;
  stability: number;
  freeStrike: number;
  characteristics: {
    might: number;
    agility: number;
    reason: number;
    intuition: number;
    presence: number;
  };
  immunities?: Record<string, number>;
  weaknesses?: Record<string, number>;
  movementTypes?: string[];
  items?: Array<{
    name: string;
    type: string;
    system: {
      keywords: string[];
      description: {
        value: string;
        director?: string;
      };
      category?: string;
      type?: string;
      resource?: number | null;
      distance?: {
        type: string;
        primary?: number;
        secondary?: number;
        tertiary?: number;
      };
      target?: {
        type: string;
        value?: number | null;
      };
      trigger?: string;
      power?: {
        roll?: {
          formula: string;
          characteristics: string[];
        };
        tiers?: Array<{
          tier: number;
          display: string;
        }>;
        effects?: Record<string, unknown>;
      };
      effect?: {
        before?: string;
        after?: string;
      };
      spend?: {
        text?: string;
        value?: number | null;
        formattedText?: string;
      };
    };
  }>;
  // Additional fields for custom monsters
  isCustom: true;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'customMonsters'

export const useCustomMonstersStore = defineStore('customMonsters', () => {
  const customMonsters = ref<Record<string, CustomMonster>>({})
  const isLoaded = ref(false)

  // Computed
  const allCustomMonsters = computed(() => Object.values(customMonsters.value))
  const customMonsterCount = computed(() => allCustomMonsters.value.length)

  // Load from localStorage
  function loadFromStorage() {
    if (isLoaded.value) return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        customMonsters.value = parsed
      }
    } catch (error) {
      console.error('Error loading custom monsters from storage:', error)
      customMonsters.value = {}
    }
    isLoaded.value = true
  }

  // Save to localStorage
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customMonsters.value))
    } catch (error) {
      console.error('Error saving custom monsters to storage:', error)
    }
  }

  // Generate unique ID for new monster
  function generateId(name: string): string {
    const baseId = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    let id = `custom-${baseId}`
    let counter = 1
    
    // Ensure ID is unique (check both custom and bundled monsters)
    while (customMonsters.value[id] || getBundledMonster(id)) {
      id = `custom-${baseId}-${counter}`
      counter++
    }
    
    return id
  }

  // Create a new custom monster
  function createMonster(monsterData: Omit<CustomMonster, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>): string {
    loadFromStorage()
    
    const id = generateId(monsterData.name)
    const now = new Date().toISOString()
    
    const monster: CustomMonster = {
      ...monsterData,
      id,
      isCustom: true,
      createdAt: now,
      updatedAt: now
    }
    
    customMonsters.value[id] = monster
    saveToStorage()
    
    return id
  }

  // Update existing custom monster
  function updateMonster(id: string, updates: Partial<Omit<CustomMonster, 'id' | 'isCustom' | 'createdAt'>>): boolean {
    loadFromStorage()
    
    if (!customMonsters.value[id]) {
      return false
    }
    
    customMonsters.value[id] = {
      ...customMonsters.value[id],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    saveToStorage()
    return true
  }

  // Delete custom monster
  function deleteMonster(id: string): boolean {
    loadFromStorage()
    
    if (!customMonsters.value[id]) {
      return false
    }
    
    delete customMonsters.value[id]
    saveToStorage()
    return true
  }

  // Get a single custom monster
  function getCustomMonster(id: string): CustomMonster | null {
    loadFromStorage()
    return customMonsters.value[id] || null
  }

  // Get all custom monsters
  function getAllCustomMonsters(): CustomMonster[] {
    loadFromStorage()
    return allCustomMonsters.value
  }

  // Integration with bundled monsters - get any monster (custom or bundled)
  function getMonster(id: string): CustomMonster | MonsterSchema | null {
    loadFromStorage()
    
    // First check custom monsters
    const customMonster = customMonsters.value[id]
    if (customMonster) {
      return customMonster
    }
    
    // Then check bundled monsters
    return getBundledMonster(id)
  }

  // Get all monsters (custom + bundled) combined
  function getAllMonsters(): (CustomMonster | MonsterSchema)[] {
    loadFromStorage()
    const bundledMonstersObj = getBundledMonsters()
    const bundled = bundledMonstersObj ? Object.values(bundledMonstersObj) : []
    const custom = allCustomMonsters.value
    
    return [...bundled, ...custom]
  }

  // Clear all custom monsters (utility function)
  function clearAllCustomMonsters(): void {
    customMonsters.value = {}
    saveToStorage()
  }

  return {
    // State
    customMonsters,
    isLoaded,
    
    // Computed
    allCustomMonsters,
    customMonsterCount,
    
    // Actions
    createMonster,
    updateMonster,
    deleteMonster,
    getCustomMonster,
    getAllCustomMonsters,
    getMonster,
    getAllMonsters,
    clearAllCustomMonsters,
    
    // Utilities
    loadFromStorage,
    saveToStorage
  }
})