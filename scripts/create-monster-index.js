#!/usr/bin/env node

/**
 * Create Monster Index Script
 * 
 * JavaScript equivalent of monster_index.py
 * Constructs an index of monster files by name and keywords from raw Foundry VTT data
 */

import fs from 'fs'
import path from 'path'

// Get monsters path from command line argument
const monstersPath = process.argv[2]
if (!monstersPath) {
  console.error('Usage: node create-monster-index.js <monsters-directory>')
  process.exit(1)
}

const dataPath = path.join(monstersPath, '../')
const outputFile = path.join(dataPath, 'monster_index.json')

console.log('📋 Creating monster index from raw Foundry VTT data...')

const nameDict = {}
const pathIndex = {}
const keywordIndex = {}
const evIndex = {}
const roleIndex = {}
const card = {}

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
    const monster = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    // Generate monster ID from name
    const monsterId = monster.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    // ID index
    nameDict[monsterId] = monster.name
    
    // Path index (relative to monsters directory)
    pathIndex[monsterId] = path.relative(monstersPath, filePath)
    
    // Keyword index
    try {
      const keywords = monster.system?.monster?.keywords || []
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase()
        if (!keywordIndex[keywordLower]) {
          keywordIndex[keywordLower] = []
        }
        keywordIndex[keywordLower].push(monsterId)
      })
    } catch {
      // Skip if keywords not found
    }
    
    // EV index
    try {
      const ev = monster.system?.monster?.ev
      if (ev !== undefined) {
        if (!evIndex[ev]) {
          evIndex[ev] = []
        }
        evIndex[ev].push(monsterId)
      }
    } catch {
      // Skip if EV not found
    }
    
    // Role index
    try {
      let role = monster.system?.monster?.role?.toLowerCase()
      if (!role) {
        // Fall back to organization if role is empty
        role = monster.system?.monster?.organization?.toLowerCase()
      }
      if (role) {
        if (!roleIndex[role]) {
          roleIndex[role] = []
        }
        roleIndex[role].push(monsterId)
      }
    } catch {
      // Skip if role not found
    }
    
    // Card information
    try {
      card[monsterId] = {
        name: monster.name,
        ev: monster.system?.monster?.ev,
        level: monster.system?.monster?.level,
        role: monster.system?.monster?.role,
        organization: monster.system?.monster?.organization,
        keywords: monster.system?.monster?.keywords || []
      }
    } catch {
      // Skip if card data incomplete
    }
    
    processedCount++
    
  } catch (error) {
    console.error(`❌ Failed to process ${filePath}:`, error.message)
    errorCount++
  }
}

// Process all monster files
walkDirectory(monstersPath)

// Create the monster index
const monsterIndex = {
  name: nameDict,
  path: pathIndex,
  keyword: keywordIndex,
  ev: evIndex,
  role: roleIndex,
  card: card
}

// Write the index file
fs.writeFileSync(outputFile, JSON.stringify(monsterIndex, null, 2))

console.log(`✅ Monster index created: ${outputFile}`)
console.log(`📊 Processed: ${processedCount} monsters`)
if (errorCount > 0) {
  console.log(`⚠️  Errors: ${errorCount} monsters`)
}