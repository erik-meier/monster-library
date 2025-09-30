# Steel Cauldron Design System

## Overview
This design system provides consistent visual patterns, components, and interactions for the Steel Cauldron monster builder application.

## Design Tokens

### Color Palette
```css
:root {
  /* Primary Colors - Draw Steel Brand */
  --color-primary-50: #fdf8f6;
  --color-primary-100: #f2e8e5;
  --color-primary-200: #eaddd7;
  --color-primary-300: #e0cec7;
  --color-primary-400: #d2bab0;
  --color-primary-500: #c69c7b;
  --color-primary-600: #8b4513;  /* Current primary */
  --color-primary-700: #7a3a0f;
  --color-primary-800: #68320d;
  --color-primary-900: #562a0b;

  /* Neutral Colors */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;

  /* Semantic Colors */
  --color-success-50: #f0fdf4;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  --color-warning-50: #fffbeb;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  --color-error-50: #fef2f2;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  --color-info-50: #eff6ff;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;
}
```

### Typography Scale
```css
:root {
  /* Font Families */
  --font-family-serif: 'Libre Baskerville', 'Book Antiqua', Georgia, serif;
  --font-family-sans: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', monospace;

  /* Font Sizes - Modular Scale (1.25 ratio) */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
}
```

### Spacing System
```css
:root {
  /* Spacing Scale - Consistent 4px grid */
  --space-px: 1px;
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */

  /* Component Specific Spacing */
  --padding-btn-sm: var(--space-2) var(--space-3);
  --padding-btn: var(--space-3) var(--space-6);
  --padding-btn-lg: var(--space-4) var(--space-8);
  --padding-input: var(--space-3) var(--space-4);
  --padding-card: var(--space-6);
  --padding-section: var(--space-8) 0;
}
```

### Border Radius & Shadows
```css
:root {
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.125rem;    /* 2px */
  --radius-base: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;    /* 6px */
  --radius-lg: 0.5rem;      /* 8px */
  --radius-xl: 0.75rem;     /* 12px */
  --radius-2xl: 1rem;       /* 16px */
  --radius-full: 9999px;

  /* Shadows - Consistent elevation */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* Focus rings */
  --focus-ring: 0 0 0 3px rgba(139, 69, 19, 0.1);
  --focus-ring-error: 0 0 0 3px rgba(220, 38, 38, 0.1);
}
```

### Animation & Transitions
```css
:root {
  /* Timing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Common Transitions */
  --transition-colors: color var(--duration-normal) var(--ease-out),
                      background-color var(--duration-normal) var(--ease-out),
                      border-color var(--duration-normal) var(--ease-out);
  --transition-transform: transform var(--duration-normal) var(--ease-out);
  --transition-opacity: opacity var(--duration-normal) var(--ease-out);
  --transition-all: all var(--duration-normal) var(--ease-out);
}
```

## Component Library

### Buttons

#### Base Button Class
```css
.btn {
  /* Reset */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  text-decoration: none;
  cursor: pointer;
  
  /* Typography */
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  line-height: var(--line-height-tight);
  
  /* Spacing & Layout */
  padding: var(--padding-btn);
  border-radius: var(--radius-md);
  gap: var(--space-2);
  
  /* Interaction */
  transition: var(--transition-all);
  user-select: none;
  
  /* Focus */
  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
  
  /* Disabled */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
```

#### Button Variants
```css
/* Primary Button */
.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
  
  &:hover:not(:disabled) {
    background-color: var(--color-primary-700);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
}

/* Secondary Button */
.btn-secondary {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
  
  &:hover:not(:disabled) {
    background-color: var(--color-neutral-200);
    border-color: var(--color-neutral-400);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
}

/* Outline Button */
.btn-outline {
  background-color: transparent;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-600);
  
  &:hover:not(:disabled) {
    background-color: var(--color-primary-50);
    transform: translateY(-1px);
  }
}

/* Success Button */
.btn-success {
  background-color: var(--color-success-600);
  color: white;
  
  &:hover:not(:disabled) {
    background-color: var(--color-success-700);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
}
```

#### Button Sizes
```css
.btn-sm {
  padding: var(--padding-btn-sm);
  font-size: var(--font-size-sm);
}

.btn-lg {
  padding: var(--padding-btn-lg);
  font-size: var(--font-size-lg);
}
```

### Form Controls

#### Input Fields
```css
.form-input {
  /* Reset */
  display: block;
  width: 100%;
  border: none;
  outline: none;
  background: var(--color-neutral-50);
  
  /* Typography */
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-neutral-800);
  
  /* Layout */
  padding: var(--padding-input);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-neutral-200);
  
  /* Interaction */
  transition: var(--transition-colors), box-shadow var(--duration-normal) var(--ease-out);
  
  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: var(--focus-ring);
    background-color: white;
  }
  
  &:invalid {
    border-color: var(--color-error-500);
    
    &:focus {
      box-shadow: var(--focus-ring-error);
    }
  }
  
  &::placeholder {
    color: var(--color-neutral-400);
  }
}
```

#### Select Fields
```css
.form-select {
  @extend .form-input;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right var(--space-3) center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: var(--space-10);
}
```

### Cards & Containers

#### Base Card
```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-neutral-200);
}

.card-body {
  padding: var(--padding-card);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-50);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
```

### Modal System

#### Modal Backdrop
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  /* Animation */
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.modal-dialog {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  
  /* Animation */
  animation: slideIn var(--duration-normal) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

## Typography Hierarchy

### Headings
```css
.text-5xl { font-size: var(--font-size-5xl); }
.text-4xl { font-size: var(--font-size-4xl); }
.text-3xl { font-size: var(--font-size-3xl); }
.text-2xl { font-size: var(--font-size-2xl); }
.text-xl { font-size: var(--font-size-xl); }
.text-lg { font-size: var(--font-size-lg); }

.font-light { font-weight: var(--font-weight-light); }
.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }
```

## Utility Classes

### Spacing
```css
/* Margin */
.m-0 { margin: 0; }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-3 { margin: var(--space-3); }
.m-4 { margin: var(--space-4); }
.m-6 { margin: var(--space-6); }
.m-8 { margin: var(--space-8); }

/* Padding */
.p-0 { padding: 0; }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }
```

### Colors
```css
.text-primary { color: var(--color-primary-600); }
.text-neutral { color: var(--color-neutral-600); }
.text-success { color: var(--color-success-600); }
.text-warning { color: var(--color-warning-600); }
.text-error { color: var(--color-error-600); }

.bg-primary { background-color: var(--color-primary-600); }
.bg-neutral { background-color: var(--color-neutral-100); }
.bg-success { background-color: var(--color-success-50); }
.bg-warning { background-color: var(--color-warning-50); }
.bg-error { background-color: var(--color-error-50); }
```