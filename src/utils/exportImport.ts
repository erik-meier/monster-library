/**
 * Export/Import utilities for monster data
 * Handles JSON export/import with validation and collision avoidance
 */

import { validateMonster, type ValidationResult } from '../../tests/helpers/validation-utils'
import { useCustomMonstersStore, type CustomMonster } from '@/stores/customMonsters'
import { getAllMonsters as getBundledMonsters } from '@/data/monsters.js'

export interface ExportData {
  metadata: {
    exportDate: string
    version: string
    application: string
    totalMonsters: number
  }
  monsters: CustomMonster[]
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    monster?: string
    error: string
    details?: ValidationResult['errors']
  }>
  warnings: Array<{
    monster: string
    message: string
    action: string
  }>
}

export interface ImportPreview {
  isValid: boolean
  totalMonsters: number
  validMonsters: number
  invalidMonsters: number
  warnings: Array<{
    monster: string
    type: 'id_collision' | 'validation_warning' | 'other'
    message: string
    action: string
  }>
  errors: Array<{
    monster: string
    error: string
    details?: ValidationResult['errors']
  }>
  monsters: CustomMonster[]
}

/**
 * Export a single monster as JSON
 */
export function exportMonster(monster: CustomMonster): string {
  const exportData: ExportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
      application: 'Steel Cauldron Monster Library',
      totalMonsters: 1
    },
    monsters: [monster]
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Export all custom monsters as a single JSON file
 */
export function exportAllMonsters(monsters: CustomMonster[]): string {
  const exportData: ExportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
      application: 'Steel Cauldron Monster Library',
      totalMonsters: monsters.length
    },
    monsters: monsters
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Download a file with the given content
 */
export function downloadFile(content: string, filename: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate a unique filename with timestamp
 */
export function generateExportFilename(prefix: string, extension = 'json'): string {
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
  return `${prefix}-${timestamp}.${extension}`
}

/**
 * Validate import data structure
 */
function validateImportData(data: unknown): { isValid: boolean; error?: string; exportData?: ExportData } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid JSON data' }
  }

  const obj = data as Record<string, unknown>
  
  // Check if it's a direct monster object (legacy single monster format)
  if (obj.id && obj.name && obj.level !== undefined && !obj.metadata) {
    // Wrap single monster in proper export format
    const exportData: ExportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        application: 'Steel Cauldron Monster Library (Legacy Import)',
        totalMonsters: 1
      },
      monsters: [obj as unknown as CustomMonster]
    }
    return { isValid: true, exportData }
  }

  // Check new export format
  if (!obj.metadata || !obj.monsters) {
    return { isValid: false, error: 'Invalid export format. Expected metadata and monsters properties.' }
  }

  if (!Array.isArray(obj.monsters)) {
    return { isValid: false, error: 'Invalid export format. Monsters must be an array.' }
  }

  return { isValid: true, exportData: obj as unknown as ExportData }
}

/**
 * Generate a unique ID to avoid collisions
 */
function generateUniqueId(baseId: string, existingIds: Set<string>): string {
  let id = baseId
  let counter = 1
  
  while (existingIds.has(id)) {
    id = `${baseId}-${counter}`
    counter++
  }
  
  return id
}

/**
 * Preview import data to show potential warnings and errors before importing
 * @param jsonContent - JSON string containing monster data
 * @param customMonstersStore - Optional store instance, will use global store if not provided
 */
export function previewImport(jsonContent: string, customMonstersStore?: ReturnType<typeof useCustomMonstersStore>): ImportPreview {
  const preview: ImportPreview = {
    isValid: false,
    totalMonsters: 0,
    validMonsters: 0,
    invalidMonsters: 0,
    warnings: [],
    errors: [],
    monsters: []
  }

  try {
    const data = JSON.parse(jsonContent)
    const validation = validateImportData(data)
    
    if (!validation.isValid) {
      preview.errors.push({ 
        monster: 'File', 
        error: validation.error! 
      })
      return preview
    }

    const exportData = validation.exportData!
    preview.totalMonsters = exportData.monsters.length
    
    // Use provided store or create new one
    const store = customMonstersStore || useCustomMonstersStore()
    store.loadFromStorage()
    
    // Get all existing IDs (custom + bundled)
    const existingIds = new Set<string>()
    
    // Add all custom monster IDs
    Object.keys(store.customMonsters).forEach(id => existingIds.add(id))
    
    // Add all bundled monster IDs
    const bundledMonsters = getBundledMonsters()
    if (bundledMonsters) {
      Object.keys(bundledMonsters).forEach(id => existingIds.add(id))
    }

    for (const monsterData of exportData.monsters) {
      try {
        // Validate monster schema
        const validation = validateMonster(monsterData)
        if (!validation.isValid) {
          preview.errors.push({
            monster: monsterData.name || 'Unknown',
            error: 'Monster failed schema validation',
            details: validation.errors
          })
          preview.invalidMonsters++
          continue
        }

        // Check for ID collisions
        if (existingIds.has(monsterData.id)) {
          const newId = generateUniqueId(monsterData.id, existingIds)
          preview.warnings.push({
            monster: monsterData.name,
            type: 'id_collision',
            message: `ID collision detected`,
            action: `Will be renamed from '${monsterData.id}' to '${newId}'`
          })
          existingIds.add(newId) // Add the new ID to prevent further collisions
        } else {
          existingIds.add(monsterData.id)
        }

        preview.monsters.push(monsterData)
        preview.validMonsters++
        
      } catch (error) {
        preview.errors.push({
          monster: monsterData.name || 'Unknown',
          error: `Preview error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
        preview.invalidMonsters++
      }
    }

    preview.isValid = preview.validMonsters > 0

  } catch (error) {
    preview.errors.push({
      monster: 'File',
      error: `JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  return preview
}

/**
 * Import monsters from JSON data
 * @param jsonContent - JSON string containing monster data
 * @param customMonstersStore - Optional store instance, will use global store if not provided
 */
export function importMonsters(jsonContent: string, customMonstersStore?: ReturnType<typeof useCustomMonstersStore>): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [],
    warnings: []
  }

  try {
    const data = JSON.parse(jsonContent)
    const validation = validateImportData(data)
    
    if (!validation.isValid) {
      result.errors.push({ error: validation.error! })
      return result
    }

    const exportData = validation.exportData!
    
    // Use provided store or create new one
    const store = customMonstersStore || useCustomMonstersStore()
    
    // Load existing data to check for collisions
    store.loadFromStorage()
    
    // Get all existing IDs (custom + bundled)
    const existingIds = new Set<string>()
    
    // Add all custom monster IDs
    Object.keys(store.customMonsters).forEach(id => existingIds.add(id))
    
    // Add all bundled monster IDs
    const bundledMonsters = getBundledMonsters()
    if (bundledMonsters) {
      Object.keys(bundledMonsters).forEach(id => existingIds.add(id))
    }

    for (const monsterData of exportData.monsters) {
      try {
        // Validate monster schema
        const validation = validateMonster(monsterData)
        if (!validation.isValid) {
          result.errors.push({
            monster: monsterData.name || 'Unknown',
            error: 'Monster failed schema validation',
            details: validation.errors
          })
          continue
        }

        // Handle ID collisions
        let finalId = monsterData.id
        if (existingIds.has(monsterData.id)) {
          finalId = generateUniqueId(monsterData.id, existingIds)
          result.warnings.push({
            monster: monsterData.name,
            message: `ID collision detected`,
            action: `Renamed from '${monsterData.id}' to '${finalId}'`
          })
        }
        
        // Ensure the monster has the custom flag and timestamps
        const now = new Date().toISOString()
        const monsterToImport: CustomMonster = {
          ...monsterData,
          id: finalId,
          isCustom: true,
          createdAt: monsterData.createdAt || now,
          updatedAt: now
        }

        // Create the monster
        store.customMonsters[finalId] = monsterToImport
        existingIds.add(finalId)
        result.imported++
        
      } catch (error) {
        result.errors.push({
          monster: monsterData.name || 'Unknown',
          error: `Import error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    // Save all changes
    if (result.imported > 0) {
      store.saveToStorage()
      result.success = true
    }

  } catch (error) {
    result.errors.push({
      error: `JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  return result
}

/**
 * Create a backup of all monster data (both custom and bundled)
 * @param customMonstersStore - Optional store instance, will use global store if not provided
 */
export function createFullBackup(customMonstersStore?: ReturnType<typeof useCustomMonstersStore>): string {
  // Use provided store or create new one
  const store = customMonstersStore || useCustomMonstersStore()
  
  store.loadFromStorage()
  
  const allMonsters = store.getAllMonsters()
  const customMonsters = store.getAllCustomMonsters()
  
  const backupData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
      application: 'Steel Cauldron Monster Library - Full Backup',
      totalMonsters: allMonsters.length,
      customMonsters: customMonsters.length,
      bundledMonsters: allMonsters.length - customMonsters.length
    },
    customMonsters: customMonsters,
    // Note: We don't backup bundled monsters as they come from the source data
    applicationInfo: {
      localStorage: {
        customMonstersKey: 'customMonsters',
        dataSize: JSON.stringify(store.customMonsters).length
      }
    }
  }
  
  return JSON.stringify(backupData, null, 2)
}

/**
 * Restore from a full backup
 * @param jsonContent - JSON string containing backup data  
 * @param customMonstersStore - Optional store instance, will use global store if not provided
 */
export function restoreFromBackup(jsonContent: string, customMonstersStore?: ReturnType<typeof useCustomMonstersStore>): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [],
    warnings: []
  }

  try {
    const backupData = JSON.parse(jsonContent)
    
    if (!backupData.customMonsters) {
      // Try to import as regular export data
      return importMonsters(jsonContent, customMonstersStore)
    }

    // Use provided store or create new one
    const store = customMonstersStore || useCustomMonstersStore()
    
    // Clear existing custom monsters
    store.clearAllCustomMonsters()
    result.warnings.push({
      monster: 'System',
      message: 'All existing custom monsters were cleared for restore',
      action: 'Previous data replaced'
    })

    // Import all custom monsters from backup
    for (const monster of backupData.customMonsters) {
      try {
        const validation = validateMonster(monster)
        if (!validation.isValid) {
          result.errors.push({
            monster: monster.name || 'Unknown',
            error: 'Monster failed schema validation',
            details: validation.errors
          })
          continue
        }

        store.customMonsters[monster.id] = monster
        result.imported++
      } catch (error) {
        result.errors.push({
          monster: monster.name || 'Unknown',
          error: `Restore error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    if (result.imported > 0) {
      store.saveToStorage()
      result.success = true
    }

  } catch (error) {
    result.errors.push({
      error: `Backup restore error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  return result
}