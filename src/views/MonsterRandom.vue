<template>
  <div class="monster-random-redirect">
    <LoadingSpinner message="Finding a random monster..." />
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'MonsterRandom',
  components: {
    LoadingSpinner
  },
  async mounted() {
    // Get a random monster and redirect to it
    try {
      const { getRandomMonsterId } = await import('@/utils/monsterUtils.js')
      const randomId = await getRandomMonsterId()

      if (randomId) {
        // Navigate to the random monster
        this.$router.replace(`/monster/${randomId}`)
      } else {
        // If we couldn't get a random monster, redirect to monster list
        this.$router.replace('/monsters')
      }
    } catch (error) {
      console.error('Failed to get random monster:', error)
      // Redirect to monster list on error
      this.$router.replace('/monsters')
    }
  }
}
</script>

<style scoped>
.monster-random-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
</style>
