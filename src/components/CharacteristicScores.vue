<template>
  <div class="characteristic-scores">
    <div v-for="characteristic in characteristicOrder" :key="characteristic" class="characteristic-score"
      :class="{ 'clickable': !editMode }" @click="!editMode && handleRoll(characteristic)">
      <div class="characteristic-row">
        <div class="characteristic-name">
          <img :src="getCharacteristicIcon(characteristic)" :alt="characteristic" class="characteristic-icon" />
          <span class="characteristic-text">{{ getCharacteristicText(characteristic) }}</span>
        </div>
        <div v-if="!editMode" class="characteristic-value">
          {{ formatModifier(characteristics[characteristic] || 0) }}
        </div>
        <div v-if="editMode" class="characteristic-edit">
          <input :value="characteristics[characteristic] || 0"
            @input="(event) => updateCharacteristic(characteristic, (event.target as HTMLInputElement).value)"
            type="number" class="characteristic-input" :min="-9" :max="99"
            :aria-label="`${getCharacteristicName(characteristic)} score`" :id="`characteristic-${characteristic}`" />
        </div>
      </div>
    </div>
  </div>

  <RollResultModal :show="showRollModal" :result="rollResult" :characteristicName="rolledCharacteristicName"
    @close="showRollModal = false" @reroll="rerollCurrentCharacteristic" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RollResultModal from './RollResultModal.vue'
import { rollPowerRoll, type PowerRollResult } from '@/utils/diceRoller'

interface Props {
  characteristics: Record<string, number>
  editMode?: boolean
}

interface Emits {
  (e: 'update:characteristics', characteristics: Record<string, number>): void
}

const props = withDefaults(defineProps<Props>(), {
  editMode: false
})

const emit = defineEmits<Emits>()

const characteristicOrder = ['might', 'agility', 'reason', 'intuition', 'presence']

const showRollModal = ref(false)
const rollResult = ref<PowerRollResult>({
  roll1: 1,
  roll2: 1,
  total: 2,
  modifier: 0,
  tier: 1
})
const rolledCharacteristic = ref<string>('')
const rolledCharacteristicName = ref<string>('')

const formatModifier = (value: number): string => {
  return value >= 0 ? `+${value}` : `${value}`
}

const getCharacteristicName = (characteristic: string): string => {
  const names: Record<string, string> = {
    might: 'Might',
    agility: 'Agility',
    reason: 'Reason',
    intuition: 'Intuition',
    presence: 'Presence'
  }
  return names[characteristic] || characteristic
}

const getCharacteristicIcon = (characteristic: string): string => {
  const icons: Record<string, string> = {
    might: '/assets/might.svg',
    agility: '/assets/agility.svg',
    reason: '/assets/reason.svg',
    intuition: '/assets/intuition.svg',
    presence: '/assets/presence.svg'
  }
  return icons[characteristic] || '/assets/might.svg'
}

const getCharacteristicText = (characteristic: string): string => {
  const texts: Record<string, string> = {
    might: 'ight',
    agility: 'gility',
    reason: 'eason',
    intuition: 'ntuition',
    presence: 'resence'
  }
  return texts[characteristic] || characteristic
}

const updateCharacteristic = (characteristic: string, value: string): void => {
  const numValue = parseInt(value) || 0
  const updated = { ...props.characteristics, [characteristic]: numValue }
  emit('update:characteristics', updated)
}

const handleRoll = (characteristic: string): void => {
  const modifier = props.characteristics[characteristic] || 0
  rolledCharacteristic.value = characteristic
  rolledCharacteristicName.value = getCharacteristicName(characteristic)
  rollResult.value = rollPowerRoll(modifier)
  showRollModal.value = true
}

const rerollCurrentCharacteristic = (): void => {
  if (rolledCharacteristic.value) {
    const modifier = props.characteristics[rolledCharacteristic.value] || 0
    rollResult.value = rollPowerRoll(modifier)
  }
}
</script>

<style scoped>
.characteristic-scores {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-3);
  margin: var(--space-4) 0;
}

.characteristic-score {
  text-align: center;
  border: 2px solid var(--color-primary-400);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-2);
  background: var(--color-primary-50);
  min-width: 0;
  transition: var(--transition-colors);
  box-shadow: var(--shadow-sm);
}

.characteristic-score.clickable {
  cursor: pointer;
}

.characteristic-score.clickable:hover {
  border-color: var(--color-primary-500);
  background: var(--color-primary-100);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.characteristic-score:not(.clickable):hover {
  border-color: var(--color-primary-500);
  background: var(--color-primary-100);
}

.characteristic-score:focus-within {
  border-color: var(--color-primary-600);
  background: white;
  box-shadow: var(--focus-ring), var(--shadow-md);
}

.characteristic-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.characteristic-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  color: var(--color-primary-700);
  display: flex;
  align-items: center;
  gap: 1px;
}

.characteristic-icon {
  width: 1.2em;
  height: 1.2em;
  display: inline-block;
  vertical-align: baseline;
}

.characteristic-text {
  line-height: 1;
}

.characteristic-value {
  font-size: var(--font-size-lg);
  color: var(--color-neutral-900);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-left: var(--space-2);
}

.characteristic-edit {
  display: flex;
  margin-left: var(--space-4);
}

.characteristic-input {
  width: 100%;
  max-width: 60px;
  padding: var(--space-1);
  border: 2px solid var(--color-primary-400);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-align: center;
  background: white;
  color: var(--color-neutral-800);
  transition: var(--transition-input);
  font-family: var(--font-family-sans);
}

.characteristic-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--focus-ring);
  background: white;
}

.characteristic-input:hover:not(:focus) {
  border-color: var(--color-primary-500);
}

.characteristic-input:invalid {
  border-color: var(--color-error-500);
}

.characteristic-input:invalid:focus {
  box-shadow: var(--focus-ring-error);
}

@media (max-width: 768px) {
  .characteristic-scores {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
  }

  .characteristic-score {
    padding: var(--space-2) var(--space-1);
  }

  .characteristic-name {
    font-size: var(--font-size-xs);
  }

  .characteristic-value {
    font-size: var(--font-size-base);
  }

  .characteristic-input {
    max-width: 50px;
  }
}

@media (max-width: 480px) {
  .characteristic-scores {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-2);
  }

  .characteristic-score {
    padding: var(--space-2);
  }

  .characteristic-name {
    font-size: 10px;
    margin-bottom: var(--space-1);
  }

  .characteristic-value {
    font-size: var(--font-size-sm);
  }

  .characteristic-input {
    max-width: 45px;
    font-size: var(--font-size-xs);
  }
}
</style>