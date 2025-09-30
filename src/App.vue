<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          Steel Cauldron
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.navbar {
  background: linear-gradient(135deg, #8b4513, #a0522d);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fdf6e3;
  text-decoration: none;
  font-family: 'Libre Baskerville', 'Book Antiqua', serif;
}

.nav-brand:hover {
  color: #f4e4bc;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #fdf6e3;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  min-height: 44px;
  /* Ensure touch-friendly target size */
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.main-content {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background-color: #343a40;
  color: #adb5bd;
  padding: 2rem 1rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  position: relative;
}

.footer-logo {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.footer-logo img {
  max-height: 60px;
  height: auto;
  max-width: 150px;
  object-fit: contain;
}

.footer-text {
  text-align: center;
  line-height: 1.6;
}

.copyright {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #dee2e6;
}

.disclaimer {
  font-size: 0.8rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive navigation */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 0.5rem;
    min-height: 56px;
    height: auto;
  }

  .nav-brand {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .nav-menu {
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .nav-link {
    padding: 0.375rem 0.75rem;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .main-content {
    padding: 1rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem 0.5rem;
    align-items: center;
    text-align: center;
  }

  .nav-menu {
    gap: 1rem;
    justify-content: center;
    flex-wrap: nowrap;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 360px) {
  .nav-menu {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .nav-link {
    display: block;
    text-align: center;
    padding: 0.5rem;
  }
}

/* Footer responsive styles */
@media (max-width: 768px) {
  .footer {
    padding: 1.5rem 1rem;
  }

  .footer-content {
    gap: 1rem;
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

  .powered-by-text {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .copyright {
    font-size: 0.9rem;
  }

  .disclaimer {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 1rem 0.5rem;
  }

  .disclaimer {
    font-size: 0.7rem;
    line-height: 1.5;
  }
}
</style>
