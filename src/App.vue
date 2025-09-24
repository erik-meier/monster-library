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
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2025 Steel Cauldron - Draw Steel Monster Brewing</p>
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
  min-height: 44px; /* Ensure touch-friendly target size */
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
  text-align: center;
  padding: 1rem;
  margin-top: auto;
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
</style>