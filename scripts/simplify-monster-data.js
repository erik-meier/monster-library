#!/usr/bin/env node

/**
 * Simplify Monster Data Script
 * 
 * This script processes the full Foundry VTT monster JSON files and extracts
 * only the fields that are actually used by the monster viewer application.
 * 
 * It creates simplified monster files with a flatter structure and reorganizes
 * the file system to be more maintainable.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Paths
const SOURCE_MONSTERS_DIR = path.join(__dirname, '../data/monsters')
const TEMP_MONSTERS_DIR = path.join(__dirname, '../data/monsters-temp')  
const OUTPUT_INDEX_FILE = path.join(__dirname, '../data/monster_index.json')

console.log('🔄 Simplifying monster data...')

// Create temp directory
if (!fs.existsSync(TEMP_MONSTERS_DIR)) {
  fs.mkdirSync(TEMP_MONSTERS_DIR, { recursive: true })
}

// Clear temp directory
if (fs.existsSync(TEMP_MONSTERS_DIR)) {
  const existingFiles = fs.readdirSync(TEMP_MONSTERS_DIR)
  existingFiles.forEach(file => {
    fs.unlinkSync(path.join(TEMP_MONSTERS_DIR, file))
  })
}

// Process all monster files
const monstersData = {}
const monsterIndex = {
  name: {},
  keyword: {},
  ev: {},
  role: {},
  card: {}
}

let processedCount = 0
let errorCount = 0

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

function processMonsterFile(filePath) {
  try {
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    // Generate monster ID from name
    const monsterId = rawData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    // Extract only the fields we actually use in the application
    const simplifiedMonster = {
      // Basic info
      id: monsterId,
      name: rawData.name,
      
      // Core stats (used in MonsterStatBlock)
      level: rawData.system.monster.level,
      ev: rawData.system.monster.ev,
      role: rawData.system.monster.role,
      organization: rawData.system.monster.organization,
      keywords: rawData.system.monster.keywords || [],
      
      // Combat stats
      size: {
        value: rawData.system.combat.size.value,
        letter: rawData.system.combat.size.letter
      },
      speed: rawData.system.movement.value,
      stamina: rawData.system.stamina.max,
      stability: rawData.system.combat.stability,
      freeStrike: rawData.system.monster.freeStrike,
      
      // Characteristics (used in CharacteristicScores)
      characteristics: {
        might: rawData.system.characteristics.might.value,
        agility: rawData.system.characteristics.agility.value,
        reason: rawData.system.characteristics.reason.value,
        intuition: rawData.system.characteristics.intuition.value,
        presence: rawData.system.characteristics.presence.value
      },
      
      // Damage/Defense
      immunities: rawData.system.damage.immunities || {},
      weaknesses: rawData.system.damage.weaknesses || {},
      movementTypes: rawData.system.movement.types || [],
      
      // Actions/Abilities (used in ActionsList)
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
            effects: item.system.power.effects
          } : null,
          description: item.system?.description,
          effect: item.system?.effect  // Include effect field for ability descriptions
        }
      })),
      
      // Source info
      source: rawData.system.source ? {
        book: rawData.system.source.book,
        page: rawData.system.source.page,
        license: rawData.system.source.license
      } : null
    }
    
    // Save simplified monster to individual file
    const outputFilePath = path.join(TEMP_MONSTERS_DIR, `${monsterId}.json`)
    fs.writeFileSync(outputFilePath, JSON.stringify(simplifiedMonster, null, 2))
    
    // Update index
    monsterIndex.name[monsterId] = simplifiedMonster.name
    
    // Keyword index
    simplifiedMonster.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase()
      if (!monsterIndex.keyword[keywordLower]) {
        monsterIndex.keyword[keywordLower] = []
      }
      monsterIndex.keyword[keywordLower].push(monsterId)
    })
    
    // EV index
    if (!monsterIndex.ev[simplifiedMonster.ev]) {
      monsterIndex.ev[simplifiedMonster.ev] = []
    }
    monsterIndex.ev[simplifiedMonster.ev].push(monsterId)
    
    // Role index  
    const role = simplifiedMonster.role?.toLowerCase() || simplifiedMonster.organization?.toLowerCase() || 'unknown'
    if (!monsterIndex.role[role]) {
      monsterIndex.role[role] = []
    }
    monsterIndex.role[role].push(monsterId)
    
    // Card data for list view
    monsterIndex.card[monsterId] = {
      name: simplifiedMonster.name,
      level: simplifiedMonster.level,
      ev: simplifiedMonster.ev,
      role: simplifiedMonster.role,
      organization: simplifiedMonster.organization,
      keywords: simplifiedMonster.keywords
    }
    
    processedCount++
    
  } catch (error) {
    console.error(`❌ Failed to process ${filePath}:`, error.message)
    errorCount++
  }
}

// Process all monster files
walkDirectory(SOURCE_MONSTERS_DIR)

// Write the index
fs.writeFileSync(OUTPUT_INDEX_FILE, JSON.stringify(monsterIndex, null, 2))

// Calculate size savings
const originalSize = execSync(`find "${SOURCE_MONSTERS_DIR}" -name "*.json" -exec wc -c {} + | tail -1 | awk '{print $1}'`).toString().trim()
const simplifiedSize = execSync(`find "${TEMP_MONSTERS_DIR}" -name "*.json" -exec wc -c {} + | tail -1 | awk '{print $1}'`).toString().trim()
const indexSize = fs.statSync(OUTPUT_INDEX_FILE).size

const totalSimplifiedSize = parseInt(simplifiedSize) + indexSize
const reduction = ((parseInt(originalSize) - totalSimplifiedSize) / parseInt(originalSize) * 100).toFixed(1)

console.log(`✅ Simplification complete!`)
console.log(`📊 Processed: ${processedCount} monsters`)
console.log(`⚠️  Errors: ${errorCount} monsters`)
console.log(`📦 Original size: ${(parseInt(originalSize) / 1024 / 1024).toFixed(2)} MB`)
console.log(`📦 Simplified size: ${(totalSimplifiedSize / 1024 / 1024).toFixed(2)} MB`)
console.log(`🎉 Size reduction: ${reduction}%`)

// Replace original monsters directory with simplified versions
console.log('🔄 Replacing original monsters with simplified versions...')

// Backup original monsters directory
const backupDir = path.join(__dirname, '../data/monsters-original')
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true })
}
fs.renameSync(SOURCE_MONSTERS_DIR, backupDir)

// Move simplified monsters to main location
fs.renameSync(TEMP_MONSTERS_DIR, SOURCE_MONSTERS_DIR)

console.log('✅ Monster data replacement complete!')
console.log('📁 Original data backed up to monsters-original/')

