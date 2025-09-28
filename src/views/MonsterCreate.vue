<template>
  <div class="monster-create">
    <MonsterFormLayout :model-value="form" :is-editing="false" @update:model-value="updateForm" @save="handleSave"
      @cancel="handleCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MonsterFormLayout from '@/components/MonsterFormLayout.vue'
import { useCustomMonstersStore, type CustomMonster } from '@/stores/customMonsters'
import type { MonsterFormData } from '@/types/monster-forms'

const router = useRouter()
const customMonstersStore = useCustomMonstersStore()

// Initialize form with default values
const form = ref<MonsterFormData>({
  id: '',
  name: '',
  level: 1,
  ev: 1,
  role: '',
  organization: '',
  keywords: [],
  size: {
    value: 1,
    letter: 'M'
  },
  speed: 6,
  stamina: 10,
  stability: 0,
  freeStrike: 2,
  movementTypes: ['walk'],
  characteristics: {
    might: 0,
    agility: 0,
    reason: 0,
    intuition: 0,
    presence: 0
  },
  immunities: {},
  weaknesses: {},
  items: []
})

// Check for template data on mount
onMounted(() => {
  const templateData = localStorage.getItem('templateMonster')
  if (templateData) {
    try {
      const template = JSON.parse(templateData)
      // Populate form with template data
      form.value = {
        ...form.value,
        name: `${template.name} (Custom)`,
        level: template.level,
        ev: template.ev,
        role: template.role,
        organization: template.organization,
        keywords: template.keywords || [],
        size: template.size || { value: 1, letter: 'M' },
        speed: template.speed,
        stamina: template.stamina,
        stability: template.stability,
        freeStrike: template.freeStrike,
        characteristics: template.characteristics,
        movementTypes: template.movementTypes || ['walk'],
        immunities: template.immunities || {},
        weaknesses: template.weaknesses || {},
        items: template.items || []
      }
      
      // Clear the template data from localStorage
      localStorage.removeItem('templateMonster')
    } catch (error) {
      console.error('Failed to parse template data:', error)
      localStorage.removeItem('templateMonster')
    }
  }
})

const updateForm = (newData: MonsterFormData) => {
  form.value = { ...newData }
}

const handleSave = async (monsterData: MonsterFormData) => {
  try {
    // Create the monster using the store (convert form data to monster format)
    const monsterId = customMonstersStore.createMonster(monsterData as Omit<CustomMonster, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>)

    // Redirect to the new monster's view page
    router.push(`/monster/${monsterId}`)
  } catch (error) {
    console.error('Failed to create monster:', error)
    alert('Failed to create monster. Please try again.')
  }
}

const handleCancel = () => {
  router.go(-1)
}
</script>

<style scoped>
.monster-create {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 1rem;
}

@media (max-width: 768px) {
  .monster-create {
    padding: 1rem 0.5rem;
  }
}
</style>