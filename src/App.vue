<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          Monster Codex
        </router-link>
        
        <div class="nav-menu">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/monsters" class="nav-link">Browse Monsters</router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2025 Monster Codex - Your TTRPG Companion</p>
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
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* Responsive navigation */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 0.5rem;
  }
  
  .nav-brand {
    font-size: 1.2rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .main-content {
    padding: 1rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>