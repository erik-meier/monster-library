<template>
  <div class="form-demo">
    <div class="demo-header">
      <h1>Monster Edit Demo</h1>
      <p>Demonstration of inline monster editing functionality</p>
      <p class="demo-note">
        This demo shows the inline editing feature now available on monster view pages. 
        For full form editing, visit a monster page or create a new monster.
      </p>
    </div>
    
    <div class="demo-actions">
      <router-link to="/monsters" class="btn btn-primary">
        Browse Monsters
      </router-link>
      <router-link to="/monster/create" class="btn btn-secondary">
        Create New Monster
      </router-link>
    </div>
    
    <div class="demo-features">
      <h2>Inline Editing Features</h2>
      <div class="feature-list">
        <div class="feature-item">
          <h3>✏️ Quick Edit Mode</h3>
          <p>Toggle edit mode directly on monster view pages for custom monsters</p>
        </div>
        <div class="feature-item">
          <h3>💾 Save/Cancel/Revert</h3>
          <p>Save changes, cancel editing, or revert to original values</p>
        </div>
        <div class="feature-item">
          <h3>📝 Inline Forms</h3>
          <p>Edit monster stats, characteristics, and basic info without leaving the page</p>
        </div>
        <div class="feature-item">
          <h3>🔒 Smart Permissions</h3>
          <p>Only custom monsters can be edited. Official monsters can be copied to edit</p>
        </div>
      </div>
    </div>
    
    <div class="demo-instructions">
      <h2>How to Use</h2>
      <ol>
        <li>Create a custom monster or copy an existing one</li>
        <li>Visit the monster's view page</li>
        <li>Click "Edit Inline" to enter edit mode</li>
        <li>Make your changes using the inline form controls</li>
        <li>Save, cancel, or revert your changes as needed</li>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormDemo'
}
</script>

<style scoped>
.form-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  color: #8b4513;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.demo-header p {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.demo-note {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #8b4513;
  margin-top: 1rem;
  font-style: italic;
}

.demo-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #8b4513;
  color: white;
}

.btn-primary:hover {
  background: #a0522d;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.demo-features {
  margin-bottom: 3rem;
}

.demo-features h2 {
  color: #8b4513;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #8b4513;
}

.feature-item h3 {
  color: #8b4513;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.feature-item p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.demo-instructions {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.demo-instructions h2 {
  color: #8b4513;
  margin-bottom: 1rem;
}

.demo-instructions ol {
  color: #495057;
  line-height: 1.8;
  padding-left: 1.5rem;
}

.demo-instructions li {
  margin-bottom: 0.5rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-demo {
    padding: 1rem 0.5rem;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .demo-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
  
  .demo-instructions {
    padding: 1rem;
  }
}
</style>