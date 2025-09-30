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
          Steel Cauldron is a web application designed to help Game Masters run amazing Draw Steel campaigns.
          Browse through 238+ official monsters, create custom creatures, and build balanced encounters for your table.
        </p>
      </section>

      <section class="about-section">
        <h2>✨ Features</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">📖</div>
            <h3>Monster Library</h3>
            <p>Browse and search through all Draw Steel monsters with complete stat blocks and abilities.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🛠️</div>
            <h3>Custom Monster Builder</h3>
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
            <strong>Browse Monsters:</strong> Head to the <router-link to="/monsters">Monster Library</router-link> to explore all available creatures.
          </li>
          <li>
            <strong>View Details:</strong> Click any monster to see its complete stat block with all abilities and actions.
          </li>
          <li>
            <strong>Create Custom Monsters:</strong> Visit <router-link to="/my-monsters">My Monsters</router-link> to build your own creatures.
          </li>
          <li>
            <strong>Use Templates:</strong> When creating a monster, click "Browse Templates" to start from an existing creature.
          </li>
          <li>
            <strong>Export & Share:</strong> Save your custom monsters as JSON files to share with other GMs.
          </li>
        </ol>
      </section>

      <section class="about-section">
        <h2>⌨️ Keyboard Shortcuts</h2>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd> + <kbd>S</kbd>
            </div>
            <div class="shortcut-description">Save monster (in builder)</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <div class="shortcut-description">Close modal or cancel</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>←</kbd> / <kbd>→</kbd>
            </div>
            <div class="shortcut-description">Navigate form sections (in builder)</div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>💡 Tips & Tricks</h2>
        <ul class="tips-list">
          <li><strong>Recently Viewed:</strong> The home page shows your recently viewed monsters for quick access.</li>
          <li><strong>Random Monster:</strong> Click "Random Monster" to discover creatures you haven't seen yet.</li>
          <li><strong>Search:</strong> Use the search bar in the Monster Library to find specific creatures quickly.</li>
          <li><strong>Local Storage:</strong> All your custom monsters are saved in your browser's local storage.</li>
          <li><strong>Backup Your Work:</strong> Export your custom monsters regularly to avoid losing your creations.</li>
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
  padding: 2rem 1rem;
}

.about-hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  margin-bottom: 3rem;
}

.about-hero h1 {
  color: #8b4513;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.subtitle {
  color: #6c757d;
  font-size: 1.2rem;
  margin: 0;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.about-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.about-section h2 {
  color: #8b4513;
  font-size: 1.75rem;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.about-section p {
  color: #4b5563;
  line-height: 1.7;
  margin: 0.75rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature-item {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature-item:hover {
  border-color: #8b4513;
  box-shadow: 0 4px 6px rgba(139, 69, 19, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.feature-item h3 {
  color: #374151;
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
}

.feature-item p {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.getting-started-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
  color: #4b5563;
  line-height: 1.8;
}

.getting-started-list li {
  margin: 1rem 0;
}

.getting-started-list strong {
  color: #374151;
}

.getting-started-list a {
  color: #8b4513;
  text-decoration: none;
  font-weight: 600;
}

.getting-started-list a:hover {
  text-decoration: underline;
}

.shortcuts-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.shortcut-keys {
  display: flex;
  gap: 0.5rem;
  min-width: 150px;
}

kbd {
  display: inline-block;
  padding: 0.3em 0.6em;
  font-size: 0.9em;
  font-family: monospace;
  line-height: 1;
  color: #1f2937;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 2px #ffffff;
}

.shortcut-description {
  color: #6b7280;
  font-size: 0.95rem;
}

.tips-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
  color: #4b5563;
  line-height: 1.8;
}

.tips-list li {
  margin: 0.75rem 0;
}

.tips-list strong {
  color: #374151;
}

.legal-text {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.6;
}

.cta-section {
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: none;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
}

.btn-primary {
  background-color: #8b4513;
  color: white;
}

.btn-primary:hover {
  background-color: #6d3410;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

@media (max-width: 768px) {
  .about-page {
    padding: 1rem 0.5rem;
  }

  .about-hero {
    padding: 2rem 1rem;
    margin-bottom: 2rem;
  }

  .about-hero h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .about-section {
    padding: 1.5rem;
  }

  .about-section h2 {
    font-size: 1.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .shortcuts-grid {
    gap: 0.75rem;
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
