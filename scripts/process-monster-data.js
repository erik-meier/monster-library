#!/usr/bin/env node

/**
 * Process Monster Data Script
 * 
 * Processes simplified statblock format from monsters-original directory:
 * 1. Recursively scans for JSON files with type "statblock"
 * 2. Generates standardized IDs and processes the data
 * 3. Saves processed files to data/monsters/<id>.json
 * 4. Creates the monster index for the application
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { standardizeName, generateId } from './data-processing-utils.js'
import { processPotencyPatterns } from './text-processors.js'
import { MONSTER_ROLES, MONSTER_ORGANIZATIONS } from '../src/types/monster-forms.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Paths
const SOURCE_MONSTERS_DIR = path.join(__dirname, '../data/monsters-original')
const OUTPUT_MONSTERS_DIR = path.join(__dirname, '../data/monsters')
const OUTPUT_INDEX_FILE = path.join(__dirname, '../data/monster_index.json')

console.log('🔄 Processing monster data...')
console.log(`Source: ${SOURCE_MONSTERS_DIR}`)
console.log(`Output: ${OUTPUT_MONSTERS_DIR}`)

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_MONSTERS_DIR)) {
  fs.mkdirSync(OUTPUT_MONSTERS_DIR, { recursive: true })
}

// Clear output directory completely
if (fs.existsSync(OUTPUT_MONSTERS_DIR)) {
  const existingFiles = fs.readdirSync(OUTPUT_MONSTERS_DIR)
  existingFiles.forEach(file => {
    const filePath = path.join(OUTPUT_MONSTERS_DIR, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      fs.rmSync(filePath, { recursive: true })
    } else {
      fs.unlinkSync(filePath)
    }
  })
}

// Initialize index
const monsterIndex = {
  name: {},
  keyword: {},
  ev: {},
  role: {},
  card: {}
}

let processedCount = 0
let errorCount = 0

// Track used IDs to prevent collisions
const usedIds = new Set()

/**
 * Generate a unique monster ID, handling collisions by appending a number
 */
function generateUniqueId(name) {
  let baseId = generateId(name)
  let uniqueId = baseId
  let counter = 2

  while (usedIds.has(uniqueId)) {
    uniqueId = `${baseId}-${counter}`
    counter++
  }

  usedIds.add(uniqueId)
  return uniqueId
}

/**
 * Walk through directory structure to find all JSON files with type "statblock"
 */
function walkDirectory(dir) {
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      walkDirectory(itemPath)
    } else if (item.endsWith('.json')) {
      processStatblockFile(itemPath)
    }
  }
}

/**
 * Process individual statblock file
 */
function processStatblockFile(filePath) {
  try {
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    // Only process files with type "statblock"
    if (rawData.type !== 'statblock') {
      return
    }

    // Standardize name and generate unique ID
    const standardizedName = standardizeName(rawData.name)
    const monsterId = generateUniqueId(standardizedName)

    // Process ancestry into keywords
    const keywords = [...(rawData.ancestry || [])].sort()

    // Parse roles based on known roles and organizations
    const roles = rawData.roles[0].split(' ')
    let primaryRole = ''
    let secondaryRole = ''
    for (const role of roles) {
      if (MONSTER_ROLES.includes(role)) {
        primaryRole = role
      }
      else if (MONSTER_ORGANIZATIONS.includes(role)) {
        secondaryRole = role
      }
    }

    // Extract and format core data for the simplified format
    const monster = {
      // Basic info
      id: monsterId,
      name: standardizedName,

      // Core stats
      level: rawData.level || 1,
      ev: parseInt(rawData.ev) || 0,
      role: primaryRole,
      organization: secondaryRole,
      keywords: keywords,

      // Combat stats
      size: rawData.size || '',
      speed: rawData.speed || 0,
      stamina: parseInt(rawData.stamina) || 0,
      stability: rawData.stability || 0,
      freeStrike: rawData.free_strike || 0,

      // Characteristics
      characteristics: {
        might: rawData.might || 0,
        agility: rawData.agility || 0,
        reason: rawData.reason || 0,
        intuition: rawData.intuition || 0,
        presence: rawData.presence || 0
      },

      // Process immunities (convert array format to object)
      immunities: processImmunitiesWeaknesses(rawData.immunities || []),
      weaknesses: processImmunitiesWeaknesses(rawData.weaknesses || []),

      // Parse movement types from movement string
      movementTypes: (rawData.movement || 'walk').split(',').map(m => m.trim().toLowerCase()).filter(m => m),

      // Directly copy features into items
      items: (rawData.features || []).map(feature => processFeature(feature)),

      // Source info (not in simplified format, so we'll add a default)
      source: {
        book: "Monsters",
        page: "",
        license: "Draw Steel Creator License"
      }
    }

    // Save processed monster
    const outputFilePath = path.join(OUTPUT_MONSTERS_DIR, `${monsterId}.json`)
    fs.writeFileSync(outputFilePath, JSON.stringify(monster, null, 2))

    // Update index
    monsterIndex.name[monsterId] = monster.name

    // Keyword index
    monster.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase()
      if (!monsterIndex.keyword[keywordLower]) {
        monsterIndex.keyword[keywordLower] = []
      }
      monsterIndex.keyword[keywordLower].push(monsterId)
    })

    // EV index
    if (!monsterIndex.ev[monster.ev]) {
      monsterIndex.ev[monster.ev] = []
    }
    monsterIndex.ev[monster.ev].push(monsterId)

    // Role index  
    const role = monster.role?.toLowerCase() || 'unknown'
    if (!monsterIndex.role[role]) {
      monsterIndex.role[role] = []
    }
    monsterIndex.role[role].push(monsterId)

    // Card data for list view
    monsterIndex.card[monsterId] = {
      name: monster.name,
      level: monster.level,
      ev: monster.ev,
      role: monster.role,
      organization: monster.organization,
      keywords: monster.keywords
    }

    processedCount++
    if (processedCount % 50 === 0) {
      console.log(`  Processed ${processedCount} monsters...`)
    }

  } catch (error) {
    console.error(`❌ Failed to process ${filePath}:`, error.message)
    errorCount++
  }
}

/**
 * Convert immunities/weaknesses array format to object format
 * Example: ["Poison 2", "Fire"] -> { poison: 2, fire: 0 }
 */
function processImmunitiesWeaknesses(array) {
  const result = {}

  if (!Array.isArray(array)) return result

  array.forEach(item => {
    if (typeof item === 'string') {
      const match = item.match(/^(.+?)\s*(\d+)?$/)
      if (match) {
        const type = match[1].toLowerCase()
        const value = match[2] ? parseInt(match[2]) : 0
        result[type] = value
      }
    }
  })

  return result
}

/**
 * Process a feature from simplified format to items format
 */
function processFeature(feature) {
  delete feature.icon

  if (feature.feature_type === 'trait') {
    feature.type = 'feature'
  }
  else if (feature.feature_type === 'ability') {
    feature.type = 'ability'
  }
  else {
    feature.type = feature.feature_type
  }
  delete feature.feature_type

  // Process effects array
  if (feature.effects && feature.effects.length > 0) {
    for (const effect of feature.effects) {
      // Fix power roll formula
      if (effect.roll) {
        effect.roll = effect.roll.replace(/Power\s+Roll/g, '2d10')
      }

      // Process effect text for potency patterns
      if (effect.effect) {
        effect.effect = processPotencyPatterns(effect.effect)
      }

      // Process tier descriptions for potency patterns
      if (effect.tier1) {
        effect.tier1 = processPotencyPatterns(effect.tier1)
      }
      if (effect.tier2) {
        effect.tier2 = processPotencyPatterns(effect.tier2)
      }
      if (effect.tier3) {
        effect.tier3 = processPotencyPatterns(effect.tier3)
      }
    }
  }

  return feature
}

// Check if source directory exists
if (!fs.existsSync(SOURCE_MONSTERS_DIR)) {
  console.error(`❌ Source directory ${SOURCE_MONSTERS_DIR} does not exist`)
  console.log('   Run "npm run clone-monsters" first to get the source data')
  process.exit(1)
}

// Process all monster files
console.log('📋 Processing monsters...')
walkDirectory(SOURCE_MONSTERS_DIR)

// Write the index
console.log('📊 Creating monster index...')
fs.writeFileSync(OUTPUT_INDEX_FILE, JSON.stringify(monsterIndex, null, 2))

// Calculate size comparison
let originalSize = 0
let processedSize = 0

try {
  originalSize = parseInt(execSync(`find "${SOURCE_MONSTERS_DIR}" -name "*.json" -exec wc -c {} + | tail -1 | awk '{print $1}'`).toString().trim())
  processedSize = parseInt(execSync(`find "${OUTPUT_MONSTERS_DIR}" -name "*.json" -exec wc -c {} + | tail -1 | awk '{print $1}'`).toString().trim())
  const indexSize = fs.statSync(OUTPUT_INDEX_FILE).size
  const totalProcessedSize = processedSize + indexSize
  const reduction = ((originalSize - totalProcessedSize) / originalSize * 100).toFixed(1)

  console.log(`\n✅ Processing complete!`)
  console.log(`📊 Processed: ${processedCount} monsters`)
  console.log(`⚠️  Errors: ${errorCount} monsters`)
  console.log(`📦 Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`📦 Processed size: ${(totalProcessedSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`🎉 Size reduction: ${reduction}%`)
} catch {
  console.log(`\n✅ Processing complete!`)
  console.log(`📊 Processed: ${processedCount} monsters`)
  console.log(`⚠️  Errors: ${errorCount} monsters`)
  console.log(`💡 Size comparison unavailable`)
}

if (errorCount > 0) {
  console.log(`\n⚠️  ${errorCount} errors encountered. Check the logs above.`)
  process.exit(1)
}

export {
  processStatblockFile,
  walkDirectory,
  generateUniqueId,
  processImmunitiesWeaknesses,
  processFeature
}