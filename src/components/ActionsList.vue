<template>
  <div class="actions-section">
    <h3 class="section-title">{{ title }}</h3>
    
    <p v-if="legendary" class="legendary-description">
      The {{ parentName || 'creature' }} can take {{ legendaryActionsCount || 3 }} legendary actions, 
      choosing from the options below. Only one legendary action option can be used at a time and 
      only at the end of another creature's turn. The {{ parentName || 'creature' }} regains spent 
      legendary actions at the start of its turn.
    </p>

    <div class="actions-list">
      <div 
        v-for="action in actions" 
        :key="action.name"
        class="action"
      >
        <h4 class="action-name">
          {{ action.name }}{{ action.cost && legendary ? ` (Costs ${action.cost} Actions)` : '' }}.
        </h4>
        <p class="action-description" v-html="action.description"></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionsList',
  props: {
    title: {
      type: String,
      required: true
    },
    actions: {
      type: Array,
      required: true
    },
    legendary: {
      type: Boolean,
      default: false
    },
    parentName: {
      type: String,
      default: null
    },
    legendaryActionsCount: {
      type: Number,
      default: 3
    }
  }
}
</script>

<style scoped>
.actions-section {
  margin: 1rem 0;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #8b4513;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #8b4513;
  padding-bottom: 0.25rem;
}

.legendary-description {
  font-style: italic;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.9rem;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action {
  padding-left: 0;
}

.action-name {
  font-weight: bold;
  color: #8b4513;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  display: inline;
}

.action-description {
  display: inline;
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.action-description :deep(em) {
  font-style: italic;
}

.action-description :deep(strong) {
  font-weight: bold;
}

.action-description :deep(br) {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.1rem;
  }
  
  .action-name {
    font-size: 0.95rem;
  }
  
  .action-description {
    font-size: 0.9rem;
  }
}
</style>