/**
 * Export/Import utilities for monster data
 * Handles JSON export/import with validation and type safety
 */

import { validateMonster, type ValidationResult } from '../../tests/helpers/validation-utils'
import { useCustomMonstersStore, type CustomMonster } from '@/stores/customMonsters'
import { useCustomMaliceStore, type CustomMaliceFeature } from '@/stores/customMalice'
import { getAllMonsters as getBundledMonsters } from '@/data/monsters.js'

export interface ExportData {
  metadata: {
    exportDate: string
    version: string
    application: string
    totalMonsters: number
    totalMaliceFeatures?: number
  }
  monsters: CustomMonster[]
  maliceFeatures?: CustomMaliceFeature[]
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  importedMalice?: number
  skippedMalice?: number
  errors: Array<{
    monster?: string
    malice?: string
    error: string
    details?: ValidationResult['errors']
  }>
  warnings: Array<{
    monster?: string
    malice?: string
    message: string
    action: string
  }>
}

export interface ImportPreview {
  isValid: boolean
  totalMonsters: number
  validMonsters: number
  invalidMonsters: number
  totalMaliceFeatures?: number
  validMaliceFeatures?: number
  invalidMaliceFeatures?: number
  warnings: Array<{
    monster?: string
    malice?: string
    type: 'id_collision' | 'validation_warning' | 'other'
    message: string
    action: string
  }>
  errors: Array<{
    monster?: string
    malice?: string
    error: string
    details?: ValidationResult['errors']
  }>
  monsters: CustomMonster[]
  maliceFeatures?: CustomMaliceFeature[]
}

/**
 * JSON replacer function to handle Sets and other special types
 */
function jsonReplacer(key: string, value: unknown): unknown {
  if (value instanceof Set) {
    return Array.from(value)
  }
  return value
}

/**
 * JSON reviver function to reconstruct Sets from arrays
 */
function jsonReviver(key: string, value: unknown): unknown {
  // Reconstruct Sets for movementTypes field
  if (key === 'movementTypes' && Array.isArray(value)) {
    return new Set(value)
  }
  return value
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
  
  return JSON.stringify(exportData, jsonReplacer, 2)
}

/**
 * Export all custom monsters as a single JSON file
 * @param monsters - Array of custom monsters to export
 * @param maliceFeatures - Optional array of custom malice features to export
 */
export function exportAllMonsters(monsters: CustomMonster[], maliceFeatures?: CustomMaliceFeature[]): string {
  const exportData: ExportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
      application: 'Steel Cauldron Monster Library',
      totalMonsters: monsters.length,
      totalMaliceFeatures: maliceFeatures?.length || 0
    },
    monsters: monsters,
    maliceFeatures: maliceFeatures || []
  }
  
  return JSON.stringify(exportData, jsonReplacer, 2)
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
 * @param customMaliceStore - Optional malice store instance, will use global store if not provided
 */
export function previewImport(
  jsonContent: string, 
  customMonstersStore?: ReturnType<typeof useCustomMonstersStore>,
  customMaliceStore?: ReturnType<typeof useCustomMaliceStore>
): ImportPreview {
  const preview: ImportPreview = {
    isValid: false,
    totalMonsters: 0,
    validMonsters: 0,
    invalidMonsters: 0,
    totalMaliceFeatures: 0,
    validMaliceFeatures: 0,
    invalidMaliceFeatures: 0,
    warnings: [],
    errors: [],
    monsters: [],
    maliceFeatures: []
  }

  try {
    const data = JSON.parse(jsonContent, jsonReviver)
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
    
    // Use provided stores or create new ones
    const monstersStore = customMonstersStore || useCustomMonstersStore()
    const maliceStore = customMaliceStore || useCustomMaliceStore()
    
    monstersStore.loadFromStorage()
    maliceStore.loadFromStorage()
    
    // Get all existing IDs (custom + bundled)
    const existingIds = new Set<string>()
    
    // Add all custom monster IDs
    Object.keys(monstersStore.customMonsters).forEach(id => existingIds.add(id))
    
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

    // Preview malice features if present
    if (exportData.maliceFeatures && Array.isArray(exportData.maliceFeatures)) {
      preview.totalMaliceFeatures = exportData.maliceFeatures.length
      
      const existingMaliceIds = new Set<string>()
      for (const [id] of maliceStore.customMaliceFeatures) {
        existingMaliceIds.add(id)
      }

      for (const maliceData of exportData.maliceFeatures) {
        try {
          // Validate malice data
          if (!maliceStore.validateMaliceData(maliceData)) {
            preview.errors.push({
              malice: maliceData.name || 'Unknown',
              error: 'Malice feature failed validation'
            })
            preview.invalidMaliceFeatures = (preview.invalidMaliceFeatures || 0) + 1
            continue
          }

          // Check for ID collisions
          if (existingMaliceIds.has(maliceData.id)) {
            const newId = generateUniqueId(maliceData.id, existingMaliceIds)
            preview.warnings.push({
              malice: maliceData.name,
              type: 'id_collision',
              message: `ID collision detected`,
              action: `Will be renamed from '${maliceData.id}' to '${newId}'`
            })
            existingMaliceIds.add(newId)
          } else {
            existingMaliceIds.add(maliceData.id)
          }

          preview.maliceFeatures!.push(maliceData)
          preview.validMaliceFeatures = (preview.validMaliceFeatures || 0) + 1
        } catch (error) {
          preview.errors.push({
            malice: maliceData.name || 'Unknown',
            error: `Malice preview error: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
          preview.invalidMaliceFeatures = (preview.invalidMaliceFeatures || 0) + 1
        }
      }
    }

    preview.isValid = preview.validMonsters > 0 || (preview.validMaliceFeatures || 0) > 0

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
 * @param customMaliceStore - Optional malice store instance, will use global store if not provided
 */
export function importMonsters(
  jsonContent: string, 
  customMonstersStore?: ReturnType<typeof useCustomMonstersStore>,
  customMaliceStore?: ReturnType<typeof useCustomMaliceStore>
): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    importedMalice: 0,
    skippedMalice: 0,
    errors: [],
    warnings: []
  }

  try {
    const data = JSON.parse(jsonContent, jsonReviver)
    const validation = validateImportData(data)
    
    if (!validation.isValid) {
      result.errors.push({ error: validation.error! })
      return result
    }

    const exportData = validation.exportData!
    
    // Use provided stores or create new ones
    const monstersStore = customMonstersStore || useCustomMonstersStore()
    const maliceStore = customMaliceStore || useCustomMaliceStore()
    
    // Load existing data to check for collisions
    monstersStore.loadFromStorage()
    maliceStore.loadFromStorage()
    
    // Get all existing IDs (custom + bundled)
    const existingIds = new Set<string>()
    
    // Add all custom monster IDs
    Object.keys(monstersStore.customMonsters).forEach(id => existingIds.add(id))
    
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
        monstersStore.customMonsters[finalId] = monsterToImport
        existingIds.add(finalId)
        result.imported++
        
      } catch (error) {
        result.errors.push({
          monster: monsterData.name || 'Unknown',
          error: `Import error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    // Import malice features if present
    if (exportData.maliceFeatures && Array.isArray(exportData.maliceFeatures)) {
      const existingMaliceIds = new Set<string>()
      
      // Get all existing custom malice IDs
      for (const [id] of maliceStore.customMaliceFeatures) {
        existingMaliceIds.add(id)
      }

      for (const maliceData of exportData.maliceFeatures) {
        try {
          // Validate malice data
          if (!maliceStore.validateMaliceData(maliceData)) {
            result.errors.push({
              malice: maliceData.name || 'Unknown',
              error: 'Malice feature failed validation'
            })
            continue
          }

          // Handle ID collisions
          let finalId = maliceData.id
          if (existingMaliceIds.has(maliceData.id)) {
            finalId = generateUniqueId(maliceData.id, existingMaliceIds)
            result.warnings.push({
              malice: maliceData.name,
              message: `ID collision detected`,
              action: `Renamed from '${maliceData.id}' to '${finalId}'`
            })
          }

          // Ensure the malice has the custom flag and timestamps
          const now = new Date().toISOString()
          const maliceToImport: CustomMaliceFeature = {
            ...maliceData,
            id: finalId,
            isCustom: true,
            createdAt: maliceData.createdAt || now,
            updatedAt: now
          }

          maliceStore.customMaliceFeatures.set(finalId, maliceToImport)
          existingMaliceIds.add(finalId)
          result.importedMalice = (result.importedMalice || 0) + 1
        } catch (error) {
          result.errors.push({
            malice: maliceData.name || 'Unknown',
            error: `Malice import error: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }

      if (result.importedMalice && result.importedMalice > 0) {
        maliceStore.saveToStorage()
      }
    }

    // Save all changes
    if (result.imported > 0) {
      monstersStore.saveToStorage()
      result.success = true
    } else if (result.importedMalice && result.importedMalice > 0) {
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
 * Create a backup of all monster data and malice features
 * @param customMonstersStore - Optional store instance, will use global store if not provided
 * @param customMaliceStore - Optional malice store instance, will use global store if not provided
 */
export function createFullBackup(
  customMonstersStore?: ReturnType<typeof useCustomMonstersStore>,
  customMaliceStore?: ReturnType<typeof useCustomMaliceStore>
): string {
  // Use provided stores or create new ones
  const monstersStore = customMonstersStore || useCustomMonstersStore()
  const maliceStore = customMaliceStore || useCustomMaliceStore()
  
  monstersStore.loadFromStorage()
  maliceStore.loadFromStorage()
  
  const allMonsters = monstersStore.getAllMonsters()
  const customMonsters = monstersStore.getAllCustomMonsters()
  const customMaliceFeatures = maliceStore.getAllCustomMalice
  
  const backupData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
      application: 'Steel Cauldron Monster Library - Full Backup',
      totalMonsters: allMonsters.length,
      customMonsters: customMonsters.length,
      bundledMonsters: allMonsters.length - customMonsters.length,
      customMaliceFeatures: customMaliceFeatures.length
    },
    customMonsters: customMonsters,
    customMaliceFeatures: customMaliceFeatures,
    // Note: We don't backup bundled monsters as they come from the source data
    applicationInfo: {
      localStorage: {
        customMonstersKey: 'customMonsters',
        customMaliceKey: 'customMaliceFeatures',
        monstersDataSize: JSON.stringify(monstersStore.customMonsters).length,
        maliceDataSize: JSON.stringify(Array.from(maliceStore.customMaliceFeatures.entries())).length
      }
    }
  }
  
  return JSON.stringify(backupData, jsonReplacer, 2)
}

/**
 * Restore from a full backup
 * @param jsonContent - JSON string containing backup data  
 * @param customMonstersStore - Optional store instance, will use global store if not provided
 * @param customMaliceStore - Optional malice store instance, will use global store if not provided
 */
export function restoreFromBackup(
  jsonContent: string, 
  customMonstersStore?: ReturnType<typeof useCustomMonstersStore>,
  customMaliceStore?: ReturnType<typeof useCustomMaliceStore>
): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    importedMalice: 0,
    skippedMalice: 0,
    errors: [],
    warnings: []
  }

  try {
    const backupData = JSON.parse(jsonContent, jsonReviver)
    
    if (!backupData.customMonsters) {
      // Try to import as regular export data
      return importMonsters(jsonContent, customMonstersStore, customMaliceStore)
    }

    // Use provided stores or create new ones
    const monstersStore = customMonstersStore || useCustomMonstersStore()
    const maliceStore = customMaliceStore || useCustomMaliceStore()
    
    // Clear existing custom monsters
    monstersStore.clearAllCustomMonsters()
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

        monstersStore.customMonsters[monster.id] = monster
        result.imported++
      } catch (error) {
        result.errors.push({
          monster: monster.name || 'Unknown',
          error: `Restore error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    // Import custom malice features if present in backup
    if (backupData.customMaliceFeatures && Array.isArray(backupData.customMaliceFeatures)) {
      // Clear existing malice features
      maliceStore.customMaliceFeatures.clear()
      result.warnings.push({
        malice: 'System',
        message: 'All existing custom malice features were cleared for restore',
        action: 'Previous malice data replaced'
      })

      for (const malice of backupData.customMaliceFeatures) {
        try {
          // Validate malice data
          if (!maliceStore.validateMaliceData(malice)) {
            result.errors.push({
              malice: malice.name || 'Unknown',
              error: 'Malice feature failed validation'
            })
            continue
          }

          maliceStore.customMaliceFeatures.set(malice.id, malice)
          result.importedMalice = (result.importedMalice || 0) + 1
        } catch (error) {
          result.errors.push({
            malice: malice.name || 'Unknown',
            error: `Malice restore error: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }

      if (result.importedMalice && result.importedMalice > 0) {
        maliceStore.saveToStorage()
      }
    }

    if (result.imported > 0 || (result.importedMalice && result.importedMalice > 0)) {
      monstersStore.saveToStorage()
      result.success = true
    }

  } catch (error) {
    result.errors.push({
      error: `Backup restore error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  return result
}