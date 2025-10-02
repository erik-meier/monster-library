<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="close">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">{{ characteristicName }} Power Roll</h2>
            <button class="modal-close" @click="close" aria-label="Close">×</button>
          </div>
          
          <div class="modal-body">
            <div class="roll-display">
              <div class="dice-results">
                <div class="die">{{ result.roll1 }}</div>
                <div class="plus">+</div>
                <div class="die">{{ result.roll2 }}</div>
                <div class="plus">+</div>
                <div class="modifier">{{ formatModifier(result.modifier) }}</div>
              </div>
              
              <div class="total-result">
                <div class="total-label">Total</div>
                <div class="total-value">{{ result.total }}</div>
              </div>
              
              <div class="tier-result" :class="`tier-${result.tier}`">
                <div class="tier-label">Tier {{ result.tier }}</div>
                <div class="tier-range">{{ getTierLabel(result.tier) }}</div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="reroll">Roll Again</button>
            <button class="btn btn-primary" @click="close">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { PowerRollResult } from '@/utils/diceRoller'
import { getTierLabel } from '@/utils/diceRoller'

interface Props {
  show: boolean
  result: PowerRollResult
  characteristicName: string
}

interface Emits {
  (e: 'close'): void
  (e: 'reroll'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const formatModifier = (value: number): string => {
  return value >= 0 ? `+${value}` : `${value}`
}

const close = () => {
  emit('close')
}

const reroll = () => {
  emit('reroll')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-neutral-200);
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-3xl);
  color: var(--color-neutral-500);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-base);
  transition: var(--transition-colors);
}

.modal-close:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.modal-body {
  padding: var(--space-6);
}

.roll-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
}

.dice-results {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.die {
  width: 60px;
  height: 60px;
  background: var(--color-primary-600);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3xl);
  box-shadow: var(--shadow-md);
}

.modifier {
  min-width: 60px;
  height: 60px;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border: 2px solid var(--color-primary-400);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  box-shadow: var(--shadow-sm);
}

.plus {
  color: var(--color-neutral-500);
  font-size: var(--font-size-2xl);
}

.total-result {
  text-align: center;
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  min-width: 200px;
}

.total-label {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.total-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.tier-result {
  text-align: center;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  border-left: 4px solid;
  min-width: 200px;
}

.tier-result.tier-1 {
  background: var(--color-error-50);
  border-left-color: var(--color-error-600);
}

.tier-result.tier-2 {
  background: var(--color-warning-50);
  border-left-color: var(--color-warning-600);
}

.tier-result.tier-3 {
  background: var(--color-success-50);
  border-left-color: var(--color-success-600);
}

.tier-label {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-1);
}

.tier-result.tier-1 .tier-label {
  color: var(--color-error-700);
}

.tier-result.tier-2 .tier-label {
  color: var(--color-warning-700);
}

.tier-result.tier-3 .tier-label {
  color: var(--color-success-700);
}

.tier-range {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
}

.modal-footer {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding: var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: var(--font-size-base);
}

.btn-primary {
  background: var(--color-primary-600);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.btn-secondary:hover {
  background: var(--color-neutral-200);
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-4);
  }

  .modal-title {
    font-size: var(--font-size-xl);
  }

  .dice-results {
    gap: var(--space-2);
    font-size: var(--font-size-lg);
  }

  .die,
  .modifier {
    width: 50px;
    height: 50px;
    font-size: var(--font-size-2xl);
  }

  .total-value {
    font-size: var(--font-size-3xl);
  }
}
</style>
