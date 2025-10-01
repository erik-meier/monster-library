<template>
  <div class="basic-info-form">
    <h2 class="form-section-title">Basic Information</h2>

    <div class="form-grid">
      <!-- Name and ID -->
      <div class="form-row">
        <div class="form-group">
          <label for="monster-name" class="form-label required">Monster Name</label>
          <input id="monster-name" v-model="formData.name" type="text" class="form-input"
            :class="{ invalid: errors.name }" placeholder="Enter monster name" />
          <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
        </div>

        <div class="form-group">
          <label for="monster-id" class="form-label required">Monster ID</label>
          <input id="monster-id" v-model="formData.id" type="text" class="form-input" :class="{ invalid: errors.id }"
            placeholder="monster-name-format" />
          <div v-if="errors.id" class="error-message">{{ errors.id }}</div>
          <div class="help-text">Auto-generated from name, or enter custom ID</div>
        </div>
      </div>

      <!-- Level and EV -->
      <div class="form-row">
        <div class="form-group">
          <label for="monster-level" class="form-label required">Level</label>
          <input id="monster-level" v-model.number="formData.level" type="number" class="form-input"
            :class="{ invalid: errors.level }" min="1" max="20" placeholder="1" />
          <div v-if="errors.level" class="error-message">{{ errors.level }}</div>
        </div>

        <div class="form-group">
          <label for="monster-ev" class="form-label required">Encounter Value (EV)</label>
          <input id="monster-ev" v-model.number="formData.ev" type="number" class="form-input"
            :class="{ invalid: errors.ev }" min="1" placeholder="1" />
          <div v-if="errors.ev" class="error-message">{{ errors.ev }}</div>
        </div>
      </div>

      <!-- Role and Organization -->
      <div class="form-row">
        <div class="form-group">
          <label for="monster-role" class="form-label">Role</label>
          <select id="monster-role" v-model="formData.role" class="form-select" :class="{ invalid: errors.role }">
            <option value="">Select a role</option>
            <option v-for="role in MONSTER_ROLES" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
          <div v-if="errors.role" class="error-message">{{ errors.role }}</div>
        </div>

        <div class="form-group">
          <label for="monster-organization" class="form-label required">Organization</label>
          <select id="monster-organization" v-model="formData.organization" class="form-select"
            :class="{ invalid: errors.organization }">
            <option value="">Select organization</option>
            <option v-for="org in MONSTER_ORGANIZATIONS" :key="org" :value="org">
              {{ capitalize(org) }}
            </option>
          </select>
          <div v-if="errors.organization" class="error-message">{{ errors.organization }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { MonsterFormData, MonsterRole, MonsterOrganization } from '@/types/monster-forms'
import { MONSTER_ROLES, MONSTER_ORGANIZATIONS } from '@/types/monster-forms'

interface Props {
  modelValue: MonsterFormData
}

interface Emits {
  (e: 'update:modelValue', value: MonsterFormData): void
  (e: 'update:isValid', valid: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive({
  id: props.modelValue.id || '',
  name: props.modelValue.name || '',
  level: props.modelValue.level || 1,
  ev: props.modelValue.ev || 1,
  role: props.modelValue.role || '',
  organization: props.modelValue.organization || ''
})

const errors = reactive({
  id: '',
  name: '',
  level: '',
  ev: '',
  role: '',
  organization: ''
})

const validateField = (field: string, value: unknown) => {
  switch (field) {
    case 'name':
      if (!value || typeof value !== 'string' || value.trim() === '') {
        errors.name = 'Monster name is required'
      } else if (value.length > 100) {
        errors.name = 'Monster name must be 100 characters or less'
      } else {
        errors.name = ''
      }
      break

    case 'id':
      if (!value || typeof value !== 'string' || value.trim() === '') {
        errors.id = 'Monster ID is required'
      } else if (!/^[a-z0-9-]+$/.test(value)) {
        errors.id = 'ID must contain only lowercase letters, numbers, and hyphens'
      } else if (value.length > 50) {
        errors.id = 'Monster ID must be 50 characters or less'
      } else {
        errors.id = ''
      }
      break

    case 'level':
      if (!value || typeof value !== 'number' || value < 1 || value > 20) {
        errors.level = 'Level must be between 1 and 20'
      } else {
        errors.level = ''
      }
      break

    case 'ev':
      if (!value || typeof value !== 'number' || value < 1) {
        errors.ev = 'EV must be at least 1'
      } else {
        errors.ev = ''
      }
      break

    case 'role':
      if (value && (typeof value !== 'string' || !MONSTER_ROLES.includes(value as MonsterRole))) {
        errors.role = 'Please select a valid role'
      } else {
        errors.role = ''
      }
      break

    case 'organization':
      if (!value || typeof value !== 'string' || !MONSTER_ORGANIZATIONS.includes(value as MonsterOrganization)) {
        errors.organization = 'Please select a valid organization'
      } else {
        errors.organization = ''
      }
      break
  }
}

const isValid = computed(() => {
  return Object.values(errors).every(error => error === '')
})

const generateIdFromName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const updateModelValue = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    id: formData.id,
    name: formData.name,
    level: formData.level,
    ev: formData.ev,
    role: formData.role,
    organization: formData.organization
  })
}

// Watch for changes and validate
watch(() => formData.name, (newName, oldName) => {
  validateField('name', newName)

  // Auto-generate ID if it's empty or matches the previous auto-generated format
  if (!formData.id || formData.id === generateIdFromName(oldName || '')) {
    formData.id = generateIdFromName(newName)
    validateField('id', formData.id)
  }

  updateModelValue()
})

watch([() => formData.level, () => formData.ev, () => formData.role, () => formData.organization], () => {
  validateField('level', formData.level)
  validateField('ev', formData.ev)
  validateField('role', formData.role)
  validateField('organization', formData.organization)
  updateModelValue()
})

watch(() => formData.id, () => {
  validateField('id', formData.id)
  updateModelValue()
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue.id !== formData.id) formData.id = newValue.id || ''
  if (newValue.name !== formData.name) formData.name = newValue.name || ''
  if (newValue.level !== formData.level) formData.level = newValue.level || 1
  if (newValue.ev !== formData.ev) formData.ev = newValue.ev || 1
  if (newValue.role !== formData.role) formData.role = newValue.role || ''
  if (newValue.organization !== formData.organization) formData.organization = newValue.organization || ''
}, { deep: true })

// Emit validity status
watch(isValid, (valid) => {
  emit('update:isValid', valid)
}, { immediate: true })

// Initial validation
Object.keys(formData).forEach(key => {
  validateField(key, formData[key as keyof typeof formData])
})
</script>

<style scoped>
.basic-info-form {
  padding: 1rem 0;
}

.form-section-title {
  color: var(--color-primary-600);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-6) 0;
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-primary-600);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
  font-size: var(--font-size-sm);
  display: block;
  margin-bottom: var(--space-1);
}

.form-label.required::after {
  content: ' *';
  color: var(--color-error-600);
}

/* Use design system form styles - remove local overrides */

.error-message {
  color: var(--color-error-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: var(--font-weight-medium);
}

.error-message::before {
  content: '⚠';
  font-size: var(--font-size-base);
}

.help-text {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  line-height: var(--line-height-relaxed);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-section-title {
    font-size: var(--font-size-lg);
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .form-grid {
    gap: var(--space-4);
  }
}
</style>