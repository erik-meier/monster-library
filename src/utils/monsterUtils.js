// Utility functions for monster-related operations

import { getMonsterIndex } from '@/data/monsters.js'

/**
 * Gets a random monster ID from the monster index
 * @returns {Promise<string|null>} Random monster ID or null if error
 */
export async function getRandomMonsterId() {
  try {
    const monsterIndex = getMonsterIndex()
    
    if (!monsterIndex || !monsterIndex.card) {
      console.error('Monster index not loaded')
      return null
    }

    // Get all monster IDs from the card data
    const monsterIds = Object.keys(monsterIndex.card)
    
    if (monsterIds.length === 0) {
      console.error('No monsters found in index')
      return null
    }

    // Pick a random monster
    const randomId = monsterIds[Math.floor(Math.random() * monsterIds.length)]
    return randomId
  } catch (error) {
    console.error('Failed to get random monster:', error)
    return null
  }
}