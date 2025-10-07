import { defineStore } from 'pinia'
// @ts-ignore - Dynamic import for data bundle
import { getMaliceFeature, getMonsterIndex } from '@/data/monsters-bundle.js'

export interface CustomMaliceFeature {
  id: string
  name: string
  featureblockType: string
  level?: number
  flavor?: string
  features: Array<{
    name: string
    cost?: string
    effects: Array<{
      effect?: string
      tier1?: string
      tier2?: string
      tier3?: string
    }>
  }>
  source?: {
    book?: string
    page?: number
    license?: string
  }
  isCustom: true
  createdAt: string
  updatedAt: string
}

export const useCustomMaliceStore = defineStore('customMalice', {
  state: () => ({
    customMaliceFeatures: new Map<string, CustomMaliceFeature>(),
    customMaliceMappings: new Map<string, string[]>(), // maliceId -> monsterIds
    loaded: false
  }),

  getters: {
    getAllCustomMalice(): CustomMaliceFeature[] {
      return Array.from(this.customMaliceFeatures.values())
    },

    getCustomMaliceCount(): number {
      return this.customMaliceFeatures.size
    }
  },

  actions: {
    // Load custom malice from localStorage
    loadFromStorage() {
      if (this.loaded) return

      try {
        const stored = localStorage.getItem('customMaliceFeatures')
        if (stored) {
          const data = JSON.parse(stored)
          this.customMaliceFeatures = new Map(Object.entries(data.maliceFeatures || {}))
          this.customMaliceMappings = new Map(Object.entries(data.maliceMappings || {}))
        }
      } catch (error) {
        console.error('Failed to load custom malice from storage:', error)
        this.customMaliceFeatures = new Map()
        this.customMaliceMappings = new Map()
      }

      this.loaded = true
    },

    // Save to localStorage
    saveToStorage() {
      try {
        const data = {
          maliceFeatures: Object.fromEntries(this.customMaliceFeatures),
          maliceMappings: Object.fromEntries(this.customMaliceMappings)
        }
        localStorage.setItem('customMaliceFeatures', JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save custom malice to storage:', error)
      }
    },

    // Get malice feature (custom or official)
    getMaliceFeature(maliceId: string): CustomMaliceFeature | any {
      // Check custom first
      const custom = this.customMaliceFeatures.get(maliceId)
      if (custom) return custom

      // Fall back to official
      return getMaliceFeature(maliceId)
    },

    // Check if malice feature is custom
    isCustomMalice(maliceId: string): boolean {
      return this.customMaliceFeatures.has(maliceId)
    },

    // Create new custom malice feature
    createMaliceFeature(maliceData: Omit<CustomMaliceFeature, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>): string {
      const id = `custom-malice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()
      
      const newMalice: CustomMaliceFeature = {
        ...maliceData,
        id,
        isCustom: true,
        createdAt: now,
        updatedAt: now
      }

      this.customMaliceFeatures.set(id, newMalice)
      this.saveToStorage()
      
      return id
    },

    // Update custom malice feature
    updateMaliceFeature(maliceId: string, updates: Partial<CustomMaliceFeature>): boolean {
      const existing = this.customMaliceFeatures.get(maliceId)
      if (!existing) return false

      const updated: CustomMaliceFeature = {
        ...existing,
        ...updates,
        id: maliceId, // Preserve ID
        isCustom: true, // Preserve custom flag
        createdAt: existing.createdAt, // Preserve creation date
        updatedAt: new Date().toISOString()
      }

      this.customMaliceFeatures.set(maliceId, updated)
      this.saveToStorage()
      
      return true
    },

    // Delete custom malice feature
    deleteMaliceFeature(maliceId: string): boolean {
      if (!this.customMaliceFeatures.has(maliceId)) return false

      this.customMaliceFeatures.delete(maliceId)
      // Remove any mappings
      this.customMaliceMappings.delete(maliceId)
      this.saveToStorage()
      
      return true
    },

    // Copy official malice to create custom version
    copyOfficialMalice(officialMaliceId: string): string | null {
      const officialMalice = getMaliceFeature(officialMaliceId)
      if (!officialMalice) return null

      const copyData = {
        name: `${officialMalice.name} (Copy)`,
        featureblockType: officialMalice.featureblockType,
        level: officialMalice.level || 1,
        flavor: officialMalice.flavor,
        features: JSON.parse(JSON.stringify(officialMalice.features || [])),
        source: officialMalice.source ? { ...officialMalice.source } : undefined
      }

      return this.createMaliceFeature(copyData)
    },

    // Get monsters linked to malice (both official and custom)
    getLinkedMonsters(maliceId: string): any[] {
      // Check custom mappings first
      const customMonsterIds = this.customMaliceMappings.get(maliceId) || []
      
      // Check official mappings
      const index = getMonsterIndex()
      const officialMonsterIds = index.maliceMappings?.[maliceId] || []
      
      // Combine and get monster data
      const allMonsterIds = [...customMonsterIds, ...officialMonsterIds]
      return allMonsterIds
        .map(monsterId => {
          // Try to get custom monster first, then official
          // This would need integration with custom monsters store
          return index.card[monsterId]
        })
        .filter(Boolean)
    },

    // Link custom malice to custom monster
    linkMaliceToMonster(maliceId: string, monsterId: string) {
      if (!this.customMaliceFeatures.has(maliceId)) return false

      const existing = this.customMaliceMappings.get(maliceId) || []
      if (!existing.includes(monsterId)) {
        existing.push(monsterId)
        this.customMaliceMappings.set(maliceId, existing)
        this.saveToStorage()
      }
      
      return true
    },

    // Unlink malice from monster
    unlinkMaliceFromMonster(maliceId: string, monsterId: string) {
      const existing = this.customMaliceMappings.get(maliceId) || []
      const filtered = existing.filter(id => id !== monsterId)
      
      if (filtered.length !== existing.length) {
        this.customMaliceMappings.set(maliceId, filtered)
        this.saveToStorage()
        return true
      }
      
      return false
    },

    // Export custom malice features
    exportCustomMalice(): string {
      const data = {
        maliceFeatures: Object.fromEntries(this.customMaliceFeatures),
        maliceMappings: Object.fromEntries(this.customMaliceMappings),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
      return JSON.stringify(data, null, 2)
    },

    // Import custom malice features
    importCustomMalice(jsonData: string): { success: boolean; imported: number; errors: string[] } {
      const result = { success: false, imported: 0, errors: [] as string[] }
      
      try {
        const data = JSON.parse(jsonData)
        
        if (!data.maliceFeatures) {
          result.errors.push('Invalid format: missing maliceFeatures')
          return result
        }

        // Import malice features
        for (const [id, maliceData] of Object.entries(data.maliceFeatures)) {
          try {
            // Validate malice data
            if (!this.validateMaliceData(maliceData as any)) {
              result.errors.push(`Invalid malice data for ${id}`)
              continue
            }

            // Generate new ID to avoid conflicts
            const newId = this.createMaliceFeature(maliceData as any)
            result.imported++
          } catch (error) {
            result.errors.push(`Error importing ${id}: ${error}`)
          }
        }

        result.success = result.imported > 0
      } catch (error) {
        result.errors.push(`Parse error: ${error}`)
      }

      return result
    },

    // Validate malice feature data
    validateMaliceData(data: any): boolean {
      return (
        typeof data === 'object' &&
        typeof data.name === 'string' &&
        typeof data.featureblockType === 'string' &&
        Array.isArray(data.features)
      )
    }
  }
})