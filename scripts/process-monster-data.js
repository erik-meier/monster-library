#!/usr/bin/env node

/**
 * Process Monster Data Script
 * 
 * Consolidated script that:
 * 1. Converts raw Foundry VTT monster files to simplified format
 * 2. Processes Foundry text directives into HTML
 * 3. Applies consistent formatting rules
 * 4. Creates the monster index for the application
 * 
 * This replaces the previous multi-step pipeline of:
 * - simplify-monster-data.js
 * - format-monster-data.js  
 * - create-monster-index.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { processMonsterText } from './text-processors.js'

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

/**
 * Walk through directory structure to find all monster JSON files
 */
function walkDirectory(dir) {
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      walkDirectory(itemPath)
    } else if (item.endsWith('.json')) {
      processMonsterFile(itemPath)
    }
  }
}

/**
 * Standardize name capitalization with correct parentheses handling
 */
function standardizeName(name) {
  if (!name || typeof name !== 'string') return name

  return name
    .split(' ')
    .map(word => {
      // Handle parentheses cases like "(Size 3)" -> "(Size 3)"
      if (word.startsWith('(') && word.endsWith(')')) {
        const inner = word.slice(1, -1)
        return `(${inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase()})`
      }
      // Handle words with parentheses at start or end
      else if (word.startsWith('(')) {
        return `(${word.slice(1).charAt(0).toUpperCase() + word.slice(2).toLowerCase()}`
      }
      else if (word.endsWith(')')) {
        return `${word.slice(0, -1).charAt(0).toUpperCase() + word.slice(1, -1).toLowerCase()})`
      }
      // Regular words - first letter uppercase, rest lowercase
      else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
    })
    .join(' ')
}

/**
 * Generate standardized ID from name
 */
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Clean zero-value damage immunities/weaknesses
 */
function cleanDamageValues(obj) {
  if (!obj || typeof obj !== 'object') return obj
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== 0)
  )
}

/**
 * Process individual monster file
 */
function processMonsterFile(filePath) {
  try {
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    // Standardize name and generate ID
    const standardizedName = standardizeName(rawData.name)
    const monsterId = generateId(standardizedName)

    // Extract and format core data
    const monster = {
      // Basic info
      id: monsterId,
      name: standardizedName,

      // Core stats
      level: rawData.system.monster.level,
      ev: rawData.system.monster.ev,
      role: rawData.system.monster.role?.charAt(0).toUpperCase() + (rawData.system.monster.role?.slice(1).toLowerCase() || ''),
      organization: rawData.system.monster.organization?.charAt(0).toUpperCase() + (rawData.system.monster.organization?.slice(1).toLowerCase() || ''),
      keywords: (rawData.system.monster.keywords || []).sort(), // Sort keywords alphabetically

      // Combat stats
      size: {
        value: rawData.system.combat.size.value,
        letter: rawData.system.combat.size.letter?.toUpperCase() || rawData.system.combat.size.letter
      },
      speed: rawData.system.movement.value,
      stamina: rawData.system.stamina.max,
      stability: rawData.system.combat.stability,
      freeStrike: rawData.system.monster.freeStrike,

      // Characteristics
      characteristics: {
        might: rawData.system.characteristics.might.value,
        agility: rawData.system.characteristics.agility.value,
        reason: rawData.system.characteristics.reason.value,
        intuition: rawData.system.characteristics.intuition.value,
        presence: rawData.system.characteristics.presence.value
      },

      // Damage/Defense (cleaned of zero values)
      immunities: cleanDamageValues(rawData.system.damage.immunities || {}),
      weaknesses: cleanDamageValues(rawData.system.damage.weaknesses || {}),
      movementTypes: rawData.system.movement.types || [],

      // Actions/Abilities
      items: rawData.items.map(item => ({
        name: item.name,
        type: item.type,
        system: {
          category: item.system?.category,
          type: item.system?.type,
          resource: item.system?.resource,
          keywords: item.system?.keywords || [],
          distance: item.system?.distance,
          target: item.system?.target,
          trigger: item.system?.trigger,
          power: item.system?.power ? {
            roll: item.system.power.roll,
            effects: item.system.power.effects,
            tiers: item.system.power.tiers // Include tiers if they exist
          } : null,
          description: item.system?.description,
          effect: item.system?.effect,
          spend: item.system?.spend
        }
      })),

      // Source info
      source: rawData.system.source ? {
        book: rawData.system.source.book,
        page: rawData.system.source.page,
        license: rawData.system.source.license
      } : null
    }

    // Clear role if it's the same as organization (duplicate)
    if (monster.role === monster.organization) {
      monster.role = ''
    }

    // Process Foundry VTT text directives
    const processedMonster = processMonsterText(monster)

    // Save processed monster
    const outputFilePath = path.join(OUTPUT_MONSTERS_DIR, `${monsterId}.json`)
    fs.writeFileSync(outputFilePath, JSON.stringify(processedMonster, null, 2))

    // Update index
    monsterIndex.name[monsterId] = processedMonster.name

    // Keyword index
    processedMonster.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase()
      if (!monsterIndex.keyword[keywordLower]) {
        monsterIndex.keyword[keywordLower] = []
      }
      monsterIndex.keyword[keywordLower].push(monsterId)
    })

    // EV index
    if (!monsterIndex.ev[processedMonster.ev]) {
      monsterIndex.ev[processedMonster.ev] = []
    }
    monsterIndex.ev[processedMonster.ev].push(monsterId)

    // Role index  
    const role = processedMonster.role?.toLowerCase() || processedMonster.organization?.toLowerCase() || 'unknown'
    if (!monsterIndex.role[role]) {
      monsterIndex.role[role] = []
    }
    monsterIndex.role[role].push(monsterId)

    // Card data for list view
    monsterIndex.card[monsterId] = {
      name: processedMonster.name,
      level: processedMonster.level,
      ev: processedMonster.ev,
      role: processedMonster.role,
      organization: processedMonster.organization,
      keywords: processedMonster.keywords
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

export { processMonsterFile, walkDirectory, standardizeName, generateId, cleanDamageValues }