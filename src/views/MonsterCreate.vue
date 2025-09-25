<template>
  <div class="monster-create">
    <div class="header">
      <h1>Create New Monster</h1>
      <p class="subtitle">Design your own custom monster for Draw Steel campaigns</p>
    </div>

    <form @submit.prevent="handleSubmit" class="monster-form">
      <!-- Basic Information -->
      <div class="form-section">
        <h2>Basic Information</h2>
        
        <div class="form-group">
          <label for="name">Monster Name *</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            required 
            class="form-control"
            placeholder="Enter monster name"
          >
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="level">Level *</label>
            <input 
              type="number" 
              id="level" 
              v-model.number="form.level" 
              required 
              min="1" 
              max="20"
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" v-model="form.role" class="form-control">
              <option value="">Select role...</option>
              <option value="Ambusher">Ambusher</option>
              <option value="Artillery">Artillery</option>
              <option value="Brute">Brute</option>
              <option value="Controller">Controller</option>
              <option value="Defender">Defender</option>
              <option value="Harrier">Harrier</option>
              <option value="Hexer">Hexer</option>
              <option value="Mount">Mount</option>
              <option value="Support">Support</option>
            </select>
          </div>

          <div class="form-group">
            <label for="organization">Organization *</label>
            <select id="organization" v-model="form.organization" required class="form-control">
              <option value="">Select organization...</option>
              <option value="Minion">Minion</option>
              <option value="Horde">Horde</option>
              <option value="Platoon">Platoon</option>
              <option value="Elite">Elite</option>
              <option value="Solo">Solo</option>
              <option value="Leader">Leader</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Combat Stats -->
      <div class="form-section">
        <h2>Combat Statistics</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label for="ev">Encounter Value (EV) *</label>
            <input 
              type="number" 
              id="ev" 
              v-model.number="form.ev" 
              required 
              min="1"
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="speed">Speed *</label>
            <input 
              type="number" 
              id="speed" 
              v-model.number="form.speed" 
              required 
              min="1"
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="stamina">Stamina *</label>
            <input 
              type="number" 
              id="stamina" 
              v-model.number="form.stamina" 
              required 
              min="1"
              class="form-control"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="stability">Stability *</label>
            <input 
              type="number" 
              id="stability" 
              v-model.number="form.stability" 
              required 
              min="0"
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="freeStrike">Free Strike *</label>
            <input 
              type="number" 
              id="freeStrike" 
              v-model.number="form.freeStrike" 
              required 
              min="0"
              class="form-control"
            >
          </div>
        </div>
      </div>

      <!-- Size -->
      <div class="form-section">
        <h2>Size</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label for="sizeValue">Size Value *</label>
            <input 
              type="number" 
              id="sizeValue" 
              v-model.number="form.size.value" 
              required 
              min="1"
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="sizeLetter">Size Category *</label>
            <select id="sizeLetter" v-model="form.size.letter" required class="form-control">
              <option value="">Select size...</option>
              <option value="T">Tiny (T)</option>
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
              <option value="H">Huge (H)</option>
              <option value="G">Gargantuan (G)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Characteristics -->
      <div class="form-section">
        <h2>Characteristics</h2>
        
        <div class="characteristics-grid">
          <div class="form-group">
            <label for="might">Might *</label>
            <input 
              type="number" 
              id="might" 
              v-model.number="form.characteristics.might" 
              required 
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="agility">Agility *</label>
            <input 
              type="number" 
              id="agility" 
              v-model.number="form.characteristics.agility" 
              required 
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="reason">Reason *</label>
            <input 
              type="number" 
              id="reason" 
              v-model.number="form.characteristics.reason" 
              required 
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="intuition">Intuition *</label>
            <input 
              type="number" 
              id="intuition" 
              v-model.number="form.characteristics.intuition" 
              required 
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="presence">Presence *</label>
            <input 
              type="number" 
              id="presence" 
              v-model.number="form.characteristics.presence" 
              required 
              class="form-control"
            >
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn btn-secondary">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Creating...' : 'Create Monster' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { useCustomMonstersStore } from '@/stores/customMonsters'

export default {
  name: 'MonsterCreate',
  setup() {
    const customMonstersStore = useCustomMonstersStore()
    return { customMonstersStore }
  },
  data() {
    return {
      submitting: false,
      form: {
        name: '',
        level: 1,
        ev: 1,
        role: '',
        organization: '',
        speed: 5,
        stamina: 10,
        stability: 0,
        freeStrike: 1,
        size: {
          value: 1,
          letter: 'M'
        },
        characteristics: {
          might: 0,
          agility: 0,
          reason: 0,
          intuition: 0,
          presence: 0
        },
        keywords: [],
        abilities: [],
        actions: []
      }
    }
  },
  methods: {
    async handleSubmit() {
      this.submitting = true
      
      try {
        // Create the monster using the store
        const monsterId = this.customMonstersStore.createMonster(this.form)
        
        // Redirect to the new monster's view page
        this.$router.push(`/monster/${monsterId}`)
      } catch (error) {
        console.error('Failed to create monster:', error)
        alert('Failed to create monster. Please try again.')
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.monster-create {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.subtitle {
  color: #6c757d;
  font-size: 1.1rem;
}

.monster-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.characteristics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  outline: 0;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 400;
  text-decoration: none;
  border: 1px solid;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #004085;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
  border-color: #4e555b;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .monster-create {
    padding: 1rem;
  }
  
  .monster-form {
    padding: 1rem;
  }
  
  .form-row,
  .characteristics-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>