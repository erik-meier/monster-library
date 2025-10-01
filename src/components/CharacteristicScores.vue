<template>
  <div class="characteristic-scores">
    <div v-for="characteristic in characteristicOrder" :key="characteristic" class="characteristic-score">
      <div class="characteristic-name">{{ getCharacteristicName(characteristic) }}</div>
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
</template>

<script setup lang="ts">
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

const updateCharacteristic = (characteristic: string, value: string): void => {
  const numValue = parseInt(value) || 0
  const updated = { ...props.characteristics, [characteristic]: numValue }
  emit('update:characteristics', updated)
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

.characteristic-score:hover {
  border-color: var(--color-primary-500);
  background: var(--color-primary-100);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.characteristic-score:focus-within {
  border-color: var(--color-primary-600);
  background: white;
  box-shadow: var(--focus-ring), var(--shadow-md);
}

.characteristic-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-primary-700);
  margin-bottom: var(--space-1);
}

.characteristic-value {
  font-size: var(--font-size-lg);
  color: var(--color-neutral-900);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.characteristic-edit {
  display: flex;
  justify-content: center;
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