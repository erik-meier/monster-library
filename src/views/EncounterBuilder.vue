<template>
  <div class="encounter-builder">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb" aria-label="Encounter building steps">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item active" aria-current="page">
          <span class="breadcrumb-number">1</span>
          <span class="breadcrumb-text">Setup</span>
        </li>
        <li class="breadcrumb-item disabled">
          <span class="breadcrumb-number">2</span>
          <span class="breadcrumb-text">Add Monsters</span>
        </li>
        <li class="breadcrumb-item disabled">
          <span class="breadcrumb-number">3</span>
          <span class="breadcrumb-text">Initiative Groups</span>
        </li>
        <li class="breadcrumb-item disabled">
          <span class="breadcrumb-number">4</span>
          <span class="breadcrumb-text">Review</span>
        </li>
      </ol>
    </nav>

    <!-- Page Header -->
    <div class="page-header">
      <h1>Encounter Builder</h1>
      <p class="page-description">
        Create balanced encounters for your Draw Steel adventures
      </p>
    </div>

    <!-- Main Content Area -->
    <div class="encounter-content">
      <section class="welcome-section" aria-labelledby="welcome-heading">
        <div class="welcome-icon">⚔️</div>
        <h2 id="welcome-heading">Build Your Encounter</h2>
        <p class="welcome-text">
          The Encounter Builder helps you create balanced, exciting encounters for your Draw Steel campaigns.
          Select monsters, organize them into initiative groups, and get instant encounter balance feedback.
        </p>

        <div class="feature-highlights">
          <div class="feature-highlight">
            <div class="highlight-icon">🎲</div>
            <h3>Smart Balance</h3>
            <p>Automatic EV calculations ensure fair and challenging encounters</p>
          </div>
          <div class="feature-highlight">
            <div class="highlight-icon">👥</div>
            <h3>Initiative Groups</h3>
            <p>Organize monsters into tactical groups that act together</p>
          </div>
          <div class="feature-highlight">
            <div class="highlight-icon">📊</div>
            <h3>Live Preview</h3>
            <p>See your encounter stat blocks update in real-time</p>
          </div>
        </div>

        <div class="cta-section">
          <button 
            class="btn btn-primary btn-lg" 
            @click="startEncounter"
            aria-label="Start building new encounter"
          >
            <span class="btn-icon">✨</span>
            Start New Encounter
          </button>
          <p class="hint-text">
            <span class="keyboard-hint">Keyboard shortcut: <kbd>Alt</kbd> + <kbd>N</kbd></span>
          </p>
        </div>
      </section>

      <!-- Quick Tips Section -->
      <section class="tips-section" aria-labelledby="tips-heading">
        <h2 id="tips-heading">Quick Tips</h2>
        <ul class="tips-list">
          <li>
            <strong>Start Simple:</strong> Begin with a few monsters and add more as needed
          </li>
          <li>
            <strong>Use Initiative Groups:</strong> Group monsters that should act together on the same turn
          </li>
          <li>
            <strong>Balance EV:</strong> Keep total encounter EV close to recommended values for your party
          </li>
          <li>
            <strong>Mix Roles:</strong> Combine different monster roles for interesting tactical scenarios
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'EncounterBuilder'
})

// Placeholder function for starting an encounter
const startEncounter = () => {
  // This will be implemented in future phases
  console.log('Starting encounter builder...')
  alert('Encounter builder workflow coming soon! This MVP provides the basic interface structure.')
}

// Keyboard navigation support
const handleKeydown = (event: KeyboardEvent) => {
  // Alt+N to start new encounter
  if (event.altKey && event.key === 'n') {
    event.preventDefault()
    startEncounter()
  }
  
  // Escape to go back (future: return to home)
  if (event.key === 'Escape') {
    event.preventDefault()
    console.log('Escape pressed - would navigate back')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.encounter-builder {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-2);
}

/* Breadcrumb Navigation */
.breadcrumb {
  background: white;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  margin-bottom: var(--space-6);
  border: 1px solid var(--color-neutral-200);
}

.breadcrumb-list {
  display: flex;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  justify-content: center;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  transition: var(--transition-all);
  color: var(--color-neutral-500);
  background: var(--color-neutral-50);
  position: relative;
  min-width: 120px;
  justify-content: center;
}

.breadcrumb-item:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: -16px;
  color: var(--color-neutral-400);
  font-size: var(--font-size-lg);
  z-index: 1;
}

.breadcrumb-item.active {
  background: var(--color-primary-600);
  color: white;
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.breadcrumb-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.breadcrumb-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: currentColor;
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  mix-blend-mode: multiply;
}

.breadcrumb-item.active .breadcrumb-number {
  background: white;
  color: var(--color-primary-600);
  mix-blend-mode: normal;
}

.breadcrumb-text {
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

/* Page Header */
.page-header {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  margin-bottom: var(--space-6);
}

.page-header h1 {
  color: var(--color-primary-700);
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-3);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-serif);
}

.page-description {
  color: var(--color-neutral-600);
  font-size: var(--font-size-lg);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* Content Area */
.encounter-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Welcome Section */
.welcome-section {
  background: white;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-neutral-200);
  text-align: center;
}

.welcome-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-4);
}

.welcome-section h2 {
  color: var(--color-primary-700);
  font-size: var(--font-size-3xl);
  margin: 0 0 var(--space-4) 0;
  font-weight: var(--font-weight-bold);
}

.welcome-text {
  color: var(--color-neutral-700);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--space-8) 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* Feature Highlights */
.feature-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
  margin: var(--space-8) 0;
}

.feature-highlight {
  padding: var(--space-6);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  transition: var(--transition-all);
  background: var(--color-neutral-50);
}

.feature-highlight:hover {
  border-color: var(--color-primary-400);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.highlight-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-3);
}

.feature-highlight h3 {
  color: var(--color-neutral-800);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--space-2) 0;
  font-weight: var(--font-weight-semibold);
}

.feature-highlight p {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* CTA Section */
.cta-section {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
}

.btn {
  padding: var(--space-4) var(--space-6);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-all);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  box-shadow: var(--shadow-sm);
  min-height: 44px;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-lg {
  padding: var(--space-5) var(--space-8);
  font-size: var(--font-size-lg);
}

.btn-icon {
  font-size: var(--font-size-xl);
}

.hint-text {
  color: var(--color-neutral-500);
  font-size: var(--font-size-sm);
  margin: var(--space-4) 0 0 0;
}

.keyboard-hint {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

kbd {
  display: inline-block;
  padding: 0.25em 0.5em;
  font-size: var(--font-size-xs);
  font-family: var(--font-family-mono);
  line-height: var(--line-height-tight);
  color: var(--color-neutral-800);
  background-color: white;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-base);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  font-weight: var(--font-weight-medium);
}

/* Tips Section */
.tips-section {
  background: white;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-neutral-200);
}

.tips-section h2 {
  color: var(--color-primary-700);
  font-size: var(--font-size-2xl);
  margin: 0 0 var(--space-6) 0;
  font-weight: var(--font-weight-bold);
}

.tips-list {
  margin: 0;
  padding-left: var(--space-6);
  color: var(--color-neutral-700);
  line-height: var(--line-height-loose);
}

.tips-list li {
  margin: var(--space-3) 0;
}

.tips-list strong {
  color: var(--color-neutral-800);
  font-weight: var(--font-weight-semibold);
}

/* Responsive Design - Mobile First */
@media (max-width: 768px) {
  .encounter-builder {
    padding: var(--space-2) var(--space-1);
  }

  .breadcrumb {
    padding: var(--space-3);
  }

  .breadcrumb-list {
    gap: var(--space-1);
  }

  .breadcrumb-item {
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-2);
    min-width: 60px;
  }

  .breadcrumb-item:not(:last-child)::after {
    right: -10px;
    font-size: var(--font-size-base);
  }

  .breadcrumb-text {
    font-size: var(--font-size-xs);
  }

  .page-header {
    padding: var(--space-6) var(--space-2);
  }

  .page-header h1 {
    font-size: var(--font-size-3xl);
  }

  .page-description {
    font-size: var(--font-size-base);
  }

  .welcome-section {
    padding: var(--space-6);
  }

  .welcome-section h2 {
    font-size: var(--font-size-2xl);
  }

  .welcome-text {
    font-size: var(--font-size-base);
  }

  .feature-highlights {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .btn-lg {
    padding: var(--space-4) var(--space-6);
    font-size: var(--font-size-base);
    width: 100%;
  }

  .tips-section {
    padding: var(--space-6);
  }

  .tips-section h2 {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .breadcrumb-item {
    min-width: 50px;
  }

  .breadcrumb-number {
    width: 20px;
    height: 20px;
    font-size: var(--font-size-xs);
  }

  .breadcrumb-text {
    display: none;
  }

  .page-header h1 {
    font-size: var(--font-size-2xl);
  }

  .welcome-icon {
    font-size: var(--font-size-4xl);
  }

  .feature-highlight {
    padding: var(--space-4);
  }

  .highlight-icon {
    font-size: var(--font-size-3xl);
  }

  .keyboard-hint {
    display: none;
  }
}
</style>
