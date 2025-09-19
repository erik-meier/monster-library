<template>
  <div class="monster-stat-block">
    <header class="monster-header">
      <h1>{{ monster.name }}</h1>
      <p>{{ monster.size }} {{ monster.type }}, {{ monster.alignment }}</p>
    </header>
    
    <div class="core-stats">
      <div class="ac-hp-speed">
        <span>AC {{ monster.ac }}</span>
        <span>HP {{ monster.hp }}</span>
        <span>Speed {{ monster.speed }}</span>
      </div>
    </div>
    
    <AbilityScores :scores="monster.abilities" />
    <ActionsList :actions="monster.actions" />
  </div>
</template>

<script>
export default {
  props: ['monsterId'],

  data() {
    return {
      monster: null
    }
  },
  async mounted() {
    // Load monster data from JSON
    const response = await fetch(`../../data/monsters/${this.monsterId}.json`)
    this.monster = await response.json()
  }
}
</script>

<style scoped>
.monster-stat-block {
  border: 2px solid #8b4513;
  padding: 1rem;
  font-family: 'Book Antiqua', serif;
}
</style>
