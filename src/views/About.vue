<template>
  <div class="about-page">
    <div class="about-hero">
      <h1>About Steel Cauldron</h1>
      <p class="subtitle">Your comprehensive monster library and builder for Draw Steel</p>
    </div>

    <div class="about-content">
      <section class="about-section">
        <h2>🎲 What is Steel Cauldron?</h2>
        <p>
          Steel Cauldron is a web application designed to help Directors run amazing Draw Steel encounters.
          Browse through official monster stat blocks, create your own custom creatures, and build balanced encounters
          for your table.
        </p>
      </section>

      <section class="about-section">
        <h2>✨ Features</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">📖</div>
            <h3><router-link to="/monsters">Monster Library</router-link></h3>
            <p>Browse and search through all Draw Steel monsters with complete stat blocks and abilities.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🛠️</div>
            <h3><router-link to="/my-monsters">Custom Monster Builder</router-link></h3>
            <p>Create your own monsters with a guided step-by-step form. Save them locally and export for sharing.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Access your monsters on any device - perfect for gaming sessions at the table or on the go.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">💾</div>
            <h3>Export & Import</h3>
            <p>Export monsters as JSON files for backup or sharing. Import custom monsters from your community.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">📋</div>
            <h3>Monster Templates</h3>
            <p>Start from existing monsters when creating custom ones. Customize any stat to fit your needs.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <h3>Fast & Offline</h3>
            <p>All data is stored locally in your browser. No internet connection required after first load.</p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>🚀 Getting Started</h2>
        <ol class="getting-started-list">
          <li>
            <strong>Browse Monsters:</strong> Head to the <router-link to="/monsters">Monster Library</router-link> to
            explore all available creatures.
          </li>
          <li>
            <strong>View Details:</strong> Click any monster to see its complete stat block with all abilities and
            actions.
          </li>
          <li>
            <strong>Create Custom Monsters:</strong> Visit <router-link to="/my-monsters">My Monsters</router-link> to
            build your own creatures.
          </li>
          <li>
            <strong>Use Templates:</strong> When creating a monster, click "Browse Templates" to start from an existing
            creature.
          </li>
          <li>
            <strong>Export & Share:</strong> Save your custom monsters as JSON files to share with other directors.
          </li>
        </ol>
      </section>

      <section class="about-section">
        <h2>💡 Tips & Tricks</h2>
        <ul class="tips-list">
          <li><strong>Recently Viewed:</strong> The home page shows your recently viewed monsters for quick access.</li>
          <li><strong>Random Monster:</strong> Click "Random Monster" to discover creatures you haven't seen yet.</li>
          <li><strong>Search:</strong> Use the search bar in the Monster Library to find specific creatures quickly.
          </li>
          <li><strong>Local Storage:</strong> All your custom monsters are saved in your browser's local storage.</li>
          <li><strong>Backup Your Work:</strong> Export your custom monsters regularly to avoid losing your creations.
          </li>
        </ul>
      </section>

      <section class="about-section">
        <h2>🛡️ Data & Privacy</h2>
        <p>
          Steel Cauldron stores all data locally in your browser. No data is sent to any servers.
          Your custom monsters, recently viewed history, and preferences stay on your device.
        </p>
      </section>

      <section class="about-section">
        <h2>📜 Legal</h2>
        <p class="legal-text">
          Steel Cauldron is an independent product published under the DRAW STEEL Creator License
          and is not affiliated with MCDM Productions, LLC. DRAW STEEL © 2024 MCDM Productions, LLC.
        </p>
        <p class="legal-text">
          Monster data is sourced from the Draw Steel Foundry VTT module, which is available under
          the DRAW STEEL Creator License.
        </p>
      </section>

      <section class="about-section cta-section">
        <h2>Ready to Start?</h2>
        <div class="cta-buttons">
          <router-link to="/monsters" class="btn btn-primary">
            Browse Monsters
          </router-link>
          <router-link to="/my-monsters" class="btn btn-secondary">
            Create Monster
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AboutPage'
})
</script>

<style scoped>
.about-page {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.about-hero {
  text-align: center;
  padding: var(--space-12) var(--space-8);
  background: linear-gradient(135deg, var(--color-neutral-50), var(--color-primary-50));
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-12);
  box-shadow: var(--shadow-base);
}

.about-hero h1 {
  color: var(--color-primary-700);
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-4);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-serif);
}

.subtitle {
  color: var(--color-neutral-600);
  font-size: var(--font-size-xl);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

.about-section {
  background: white;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-neutral-200);
}

.about-section h2 {
  color: var(--color-primary-700);
  font-size: var(--font-size-2xl);
  margin: 0 0 var(--space-6) 0;
  font-weight: var(--font-weight-bold);
}

.about-section p {
  color: var(--color-neutral-700);
  line-height: var(--line-height-relaxed);
  margin: var(--space-3) 0;
  font-size: var(--font-size-base);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-6);
}

.feature-item {
  padding: var(--space-6);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  transition: var(--transition-all);
  background: white;
}

.feature-item:hover {
  border-color: var(--color-primary-400);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-3);
}

.feature-item h3 {
  color: var(--color-neutral-800);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--space-2) 0;
  font-weight: var(--font-weight-semibold);
}

.feature-item p {
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.getting-started-list {
  margin: var(--space-4) 0;
  padding-left: var(--space-6);
  color: var(--color-neutral-700);
  line-height: var(--line-height-loose);
}

.getting-started-list li {
  margin: var(--space-4) 0;
}

.getting-started-list strong {
  color: var(--color-neutral-800);
  font-weight: var(--font-weight-semibold);
}

.getting-started-list a {
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-colors);
}

.getting-started-list a:hover {
  text-decoration: underline;
  color: var(--color-primary-700);
}

.shortcuts-grid {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
}

.shortcut-keys {
  display: flex;
  gap: var(--space-2);
  min-width: 150px;
}

kbd {
  display: inline-block;
  padding: 0.3em 0.6em;
  font-size: var(--font-size-sm);
  font-family: var(--font-family-mono);
  line-height: var(--line-height-tight);
  color: var(--color-neutral-800);
  background-color: white;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-base);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 2px #ffffff;
  font-weight: var(--font-weight-medium);
}

.shortcut-description {
  color: var(--color-neutral-600);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

.tips-list {
  margin: var(--space-4) 0;
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

.legal-text {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  line-height: var(--line-height-relaxed);
}

.cta-section {
  text-align: center;
  background: linear-gradient(135deg, var(--color-neutral-50), var(--color-primary-50));
  border: none;
}

.cta-buttons {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: var(--space-6);
  flex-wrap: wrap;
}

.btn {
  padding: var(--padding-btn);
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
  box-shadow: var(--shadow-sm);
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

.btn-secondary {
  background-color: white;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-600);
}

.btn-secondary:hover {
  background-color: var(--color-primary-50);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .about-page {
    padding: var(--space-4) var(--space-2);
  }

  .about-hero {
    padding: var(--space-8) var(--space-4);
    margin-bottom: var(--space-8);
  }

  .about-hero h1 {
    font-size: var(--font-size-3xl);
  }

  .subtitle {
    font-size: var(--font-size-base);
  }

  .about-section {
    padding: var(--space-6);
  }

  .about-section h2 {
    font-size: var(--font-size-xl);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .shortcuts-grid {
    gap: var(--space-3);
  }

  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .shortcut-keys {
    min-width: auto;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}
</style>
