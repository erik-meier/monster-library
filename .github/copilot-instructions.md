# Copilot Instructions for Steel Cauldron

## Repository Overview

**Steel Cauldron** is a Vue.js web application that serves as a comprehensive monster library for the Draw Steel tabletop roleplaying game. The app allows users to browse, search, and view detailed stat blocks for hundreds of monsters.

### Key Features
- Browse and search through Draw Steel monsters
- View detailed stat blocks with complete monster information
- **Mobile-optimized responsive design** for gaming sessions on any device
- Fast loading and optimized performance

## Tech Stack & Architecture

### Frontend Stack
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vue Router** for navigation
- **Pinia** for state management (if needed)
- **Vite** as build tool and dev server
- **CSS** with mobile-first responsive design patterns

### Development Tools
- **ESLint** with Vue/TypeScript configs for linting
- **Prettier** for code formatting
- **Vitest** for unit testing
- **vue-tsc** for TypeScript checking
- **GitHub Actions** for CI/CD

### Design System & Styling
- **Complete design system** defined in `STYLE_GUIDE.md` with design tokens, components, and patterns
- **Design tokens** available in `src/assets/design-tokens.css` for consistent colors, spacing, typography
- **Component library** in `src/assets/components.css` with `.btn`, `.card`, `.form-input`, `.modal` classes
- **Always use design tokens** instead of hardcoded values (colors, spacing, typography)
- **Follow established patterns** for new components to maintain visual consistency

### Data Management
- Monster data stored in `/data/monsters/` as individual JSON files
- Monster index in `/data/monster_index.json`
- Build script (`scripts/build-monster-data.js`) bundles data into `/src/data/monsters-bundle.js`
- Schema validation using AJV for data integrity

## Development Workflow

### Available Scripts
```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Full production build
npm run build-data            # Bundle monster data
npm run preview               # Preview production build

# Code Quality
npm run lint                  # Run ESLint
npm run lint:fix              # Run ESLint with auto-fix
npm run format               # Format code with Prettier
npm run type-check           # TypeScript type checking

# Testing
npm test                     # Run tests in watch mode
npm run test:run            # Run tests once (CI mode) - prefer this for local validation too

# Data Management
npm run clone-monsters       # Clone latest monster data
npm run process-monsters     # Fix data formatting
npm run refresh-all         # Complete data refresh pipeline
```

### File Structure
```
/src/
  /components/     # Reusable Vue components
  /views/         # Page-level components
  /router/        # Vue Router configuration
  /data/          # Generated data bundles
  /assets/        # Static assets (CSS, images)

/data/
  /monsters/      # Individual monster JSON files
  monster_index.json  # Monster metadata index

/tests/
  /fixtures/      # Test data files
  /helpers/       # Testing utilities
  *.test.ts      # Test files

/scripts/         # Build and data processing scripts
/.github/
  /workflows/     # CI/CD configurations
```

## Code Style & Conventions

### Vue Components
- Use `<script setup>` syntax when possible
- Prefer Composition API over Options API
- Use TypeScript for all new components
- Follow Vue 3 best practices for reactivity

### TypeScript
- Enable strict mode
- Use proper type annotations
- Leverage Vue's TypeScript support with `vue-tsc`
- Define interfaces for data structures

### CSS & Design System
- **Follow the Steel Cauldron Design System** - Use design tokens from `STYLE_GUIDE.md`
- **Use CSS custom properties** - Always prefer design tokens over hardcoded values
- **Mobile-first responsive design is critical** - test on various screen sizes
- **Follow component library patterns** - Use established `.btn`, `.card`, `.form-input` classes
- **Maintain design consistency** - Reference `src/assets/design-tokens.css` for all styling
- Use semantic class names and ensure touch-friendly interfaces for mobile gaming sessions

### Code Organization
- Keep components focused and single-purpose
- Use descriptive file and variable names
- Maintain consistent import ordering
- Follow existing patterns in the codebase

## Testing Guidelines

### Test Types
1. **Unit Tests**: Component logic and utility functions
2. **Data Validation**: Monster data schema compliance
3. **Formatting Tests**: Data consistency checks

### Testing Patterns
- Use Vitest for all tests
- Test files located in `/tests/` directory
- Use fixtures for test data
- Validate both positive and negative cases

### Key Test Areas
- Monster data validation (schema compliance)
- Data formatting consistency
- Component rendering and behavior
- Router navigation

## Data Management

### Monster Data Structure
Each monster JSON file contains:
- Basic stats (level, role, size, etc.)
- Combat statistics (Health, Speed, etc.)
- Special abilities and attacks
- Lore and description

### Data Processing Pipeline
1. Raw data from external sources
2. Simplification and normalization
3. Schema validation
4. Bundle generation for app consumption

### Data Validation Rules
- All monsters must pass AJV schema validation
- Required fields: name, level, role, organization
- Consistent formatting for names and text fields
- Valid numeric ranges for stats

## Common Tasks & Patterns

### Adding New Components
1. Create component in appropriate directory (`/components/` or `/views/`)
2. Use TypeScript and proper typing
3. **Follow design system patterns** - Use established component classes and design tokens
4. **Use design system components** - Reference `STYLE_GUIDE.md` for buttons, forms, cards, etc.
5. Add to router if it's a page component
6. Include responsive design considerations
7. **Test against design system** - Ensure consistency with existing components and update tests if needed

### Updating Monster Data
1. Use `npm run refresh-all` for complete updates
2. Run `npm run test:run` to validate changes
3. Commit only processed data, not raw external data

### Maintaining the Design System
1. **When adding new component patterns** - Document them in `STYLE_GUIDE.md`
2. **When creating new design tokens** - Add to `src/assets/design-tokens.css` and document usage
3. **When modifying existing components** - Ensure changes are reflected in the style guide
4. **Before major styling changes** - Review impact on design system consistency
5. **Component library updates** - Update `src/assets/components.css` and provide examples

### Debugging Issues
1. Check browser console for runtime errors
2. Use Vue DevTools for component inspection
3. Run linting: `npm run lint`
4. Verify types: `npm run type-check`
5. Check test results: `npm run test:run`

## Performance Considerations

### Build Optimization
- Monster data is pre-bundled at build time
- Vite handles code splitting and optimization
- Assets are optimized for web delivery

### Runtime Performance
- Use Vue's reactivity system efficiently
- Implement proper key attributes for lists
- Avoid unnecessary re-renders
- Optimize images and assets

## CI/CD Pipeline

### Automated Checks
- ESLint for code quality
- TypeScript compilation
- Full test suite execution
- Monster data validation
- Build verification

### PR Requirements
- All tests must pass
- No linting errors
- Type checking must succeed
- Monster data changes require validation
- Consistent formatting

## Special Considerations

### Monster Data
- Monster data consists of many individual JSON files (238+ monsters)
- Schema changes require careful validation
- External data sources may have inconsistencies
- Maintain backward compatibility when possible

### Browser Compatibility
- Target modern browsers with ES6+ support
- **Mobile compatibility is essential** - optimize for touch interfaces and small screens
- Responsive design for gaming sessions on tablets and phones
- Progressive enhancement approach

### Deployment
- Static site deployment
- Build artifacts in `/dist/`
- Environment-specific configurations

---

When working on this repository, always:
1. Run tests before and after changes: `npm run test:run`
2. Lint your code: `npm run lint`
3. Check types: `npm run type-check`
4. **Follow the design system** - Use design tokens and component patterns from `STYLE_GUIDE.md`
5. **Test responsive design on multiple screen sizes** - mobile compatibility is critical
6. **Validate monster data changes thoroughly** - data quality must not degrade
7. Follow existing code patterns and conventions
8. **Update STYLE_GUIDE.md when adding new patterns** - Document new components and design decisions
9. Ensure documentation is updated for significant changes, but don't include change history in documentation