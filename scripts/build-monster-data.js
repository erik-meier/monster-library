#!/usr/bin/env node

/**
 * Build script to bundle all monster data into a single JavaScript module
 * This eliminates the need for dynamic imports and runtime data fetching
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DATA_DIR = path.join(__dirname, '../data')
const MONSTERS_DIR = path.join(DATA_DIR, 'monsters')
const INDEX_FILE = path.join(DATA_DIR, 'monster_index.json')
const OUTPUT_FILE = path.join(__dirname, '../src/data/monsters-bundle.js')

console.log('🏗️  Building monster data bundle...')

// Load the monster index
const monsterIndex = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'))

// Bundle all monster data
const monsters = {}
let successCount = 0
let errorCount = 0

for (const [monsterId, cardData] of Object.entries(monsterIndex.card)) {
  try {
    // Find the corresponding path
    const filePath = monsterIndex.path?.[monsterId]
    if (!filePath) {
      console.warn(`⚠️  No path found for monster: ${monsterId}`)
      continue
    }
    
    const fullPath = path.join(MONSTERS_DIR, filePath)
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  File not found: ${fullPath}`)
      continue
    }
    
    const monsterData = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    monsters[monsterId] = monsterData
    successCount++
  } catch (error) {
    console.error(`❌ Failed to load ${monsterId}:`, error.message)
    errorCount++
  }
}

// Generate the bundle file
const bundleContent = `// Auto-generated monster data bundle
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

console.log('✅ Monster data bundle loaded:', {
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