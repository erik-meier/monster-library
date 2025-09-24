#!/usr/bin/env node

/**
 * Build script for simplified monster data
 * Creates a JavaScript bundle from the simplified monster data
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SIMPLIFIED_MONSTERS_DIR = path.join(__dirname, '../data/simplified-monsters')
const SIMPLIFIED_INDEX_FILE = path.join(__dirname, '../data/simplified_monster_index.json')
const OUTPUT_FILE = path.join(__dirname, '../src/data/monsters-bundle.js')

console.log('🏗️  Building simplified monster data bundle...')

// Load the monster index
const monsterIndex = JSON.parse(fs.readFileSync(SIMPLIFIED_INDEX_FILE, 'utf8'))

// Load all simplified monsters
const monsters = {}
let successCount = 0
let errorCount = 0

for (const [monsterId, cardData] of Object.entries(monsterIndex.card)) {
  try {
    const filePath = path.join(SIMPLIFIED_MONSTERS_DIR, `${monsterId}.json`)
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`)
      continue
    }
    
    const monsterData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    monsters[monsterId] = monsterData
    successCount++
  } catch (error) {
    console.error(`❌ Failed to load ${monsterId}:`, error.message)
    errorCount++
  }
}

// Generate the bundle file
const bundleContent = `// Auto-generated simplified monster data bundle
// Generated on: ${new Date().toISOString()}

export const monsterIndex = ${JSON.stringify(monsterIndex, null, 2)};

export const monsters = ${JSON.stringify(monsters, null, 2)};

export function getMonsterIndex() {
  return monsterIndex;
}

export function getAllMonsters() {
  return monsters;
}

export function getMonster(monsterId) {
  return monsters[monsterId] || null;
}

// Export card data for easy access
export const monsterCards = monsterIndex.card;

console.log('✅ Simplified monster data bundle loaded:', {
  totalMonsters: Object.keys(monsters).length,
  indexVersion: '${new Date().toISOString()}'
});
`

// Write the bundle file
fs.writeFileSync(OUTPUT_FILE, bundleContent)

console.log(`✅ Bundle created: ${OUTPUT_FILE}`)
console.log(`📊 Successfully bundled: ${successCount} monsters`)
if (errorCount > 0) {
  console.log(`⚠️  Errors encountered: ${errorCount} monsters`)
}
console.log(`📦 Bundle size: ${(bundleContent.length / 1024 / 1024).toFixed(2)} MB`)