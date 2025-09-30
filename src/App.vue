<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          <img src="/cauldron-logo.svg" alt="Steel Cauldron" class="nav-logo" />
          <span class="nav-brand-text">Steel Cauldron</span>
        </router-link>

        <div class="nav-menu">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/monsters" class="nav-link">Browse Monsters</router-link>
          <router-link to="/my-monsters" class="nav-link">My Monsters</router-link>
          <router-link to="/about" class="nav-link">About</router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-text">
          <p class="copyright">&copy; 2025 Erik Meier</p>
          <p class="disclaimer">
            Steel Cauldron is an independent product published under the DRAW STEEL Creator License
            and is not affiliated with MCDM Productions, LLC. DRAW STEEL © 2024 MCDM Productions, LLC.
          </p>
        </div>
        <div class="footer-logo">
          <img src="/assets/Draw-Steel-Compatibility-Logo.webp" alt="Draw Steel Compatibility Logo" />
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: var(--font-family-sans);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-neutral-100);
  line-height: var(--line-height-normal);
}

/* Typography improvements */
h1, h2, h3, h4, h5, h6 {
  line-height: var(--line-height-tight);
  margin-bottom: 0.5em;
  font-weight: var(--font-weight-bold);
}

p {
  margin-bottom: 1em;
}

/* Global button styles - ensure base buttons work with design system */
button, .btn {
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: var(--transition-all);
}

button:focus-visible, .btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

button:disabled, .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Navbar with premium gradient and elevation */
.navbar {
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  backdrop-filter: blur(8px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-50);
  text-decoration: none;
  font-family: var(--font-family-serif);
  transition: var(--transition-colors);
  letter-spacing: -0.02em;
}

.nav-logo {
  width: 32px;
  height: 32px;
  filter: brightness(1.2) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.nav-brand-text {
  display: inline-block;
}

.nav-brand:hover {
  color: var(--color-primary-100);
  transform: translateY(-1px);
}

.nav-menu {
  display: flex;
  gap: var(--space-4);
}

.nav-link {
  color: var(--color-primary-50);
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: var(--transition-all);
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.25);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.main-content {
  flex: 1;
  padding: var(--space-8) var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Premium footer with subtle gradient */
.footer {
  background: linear-gradient(180deg, var(--color-neutral-800) 0%, var(--color-neutral-900) 100%);
  color: var(--color-neutral-400);
  padding: var(--space-8) var(--space-4);
  margin-top: auto;
  border-top: 1px solid var(--color-neutral-700);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  position: relative;
}

.footer-logo {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.9;
  transition: var(--transition-opacity);
}

.footer-logo:hover {
  opacity: 1;
}

.footer-logo img {
  max-height: 60px;
  height: auto;
  max-width: 150px;
  object-fit: contain;
}

.footer-text {
  text-align: center;
  line-height: var(--line-height-relaxed);
}

.copyright {
  font-size: var(--font-size-base);
  margin-bottom: var(--space-2);
  color: var(--color-neutral-300);
  font-weight: var(--font-weight-medium);
}

.disclaimer {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-500);
  max-width: 600px;
  margin: 0 auto;
  line-height: var(--line-height-relaxed);
}

/* Responsive navigation */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 var(--space-2);
    min-height: 56px;
    height: auto;
  }

  .nav-brand {
    font-size: var(--font-size-xl);
    flex-shrink: 0;
  }

  .nav-logo {
    width: 28px;
    height: 28px;
  }

  .nav-menu {
    gap: var(--space-3);
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .nav-link {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
    white-space: nowrap;
  }

  .main-content {
    padding: var(--space-4) var(--space-2);
  }
}

@media (max-width: 480px) {
  .nav-container {
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-2);
    align-items: center;
    text-align: center;
  }

  .nav-logo {
    width: 24px;
    height: 24px;
  }

  .nav-menu {
    gap: var(--space-4);
    justify-content: center;
    flex-wrap: nowrap;
  }

  .nav-link {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 360px) {
  .nav-menu {
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
  }

  .nav-link {
    display: block;
    text-align: center;
    padding: var(--space-2);
  }
}

/* Footer responsive styles */
@media (max-width: 768px) {
  .footer {
    padding: var(--space-6) var(--space-4);
  }

  .footer-content {
    gap: var(--space-4);
    flex-direction: column;
    align-items: center;
    position: static;
  }

  .footer-text {
    text-align: center;
  }

  .footer-logo {
    position: static;
    transform: none;
    justify-content: center;
    display: flex;
  }

  .copyright {
    font-size: var(--font-size-sm);
  }

  .disclaimer {
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .footer {
    padding: var(--space-4) var(--space-2);
  }

  .disclaimer {
    font-size: var(--font-size-xs);
    line-height: var(--line-height-normal);
  }
}
</style>
