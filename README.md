# Steel Cauldron

![Test Status](https://github.com/erik-meier/monster-library/workflows/Test%20Monster%20Data/badge.svg)

Web app for building and viewing monsters and encounters for the tabletop roleplaying game Draw Steel.

## Features

- Browse and search through Draw Steel monsters
- View detailed stat blocks with complete monster information
- Responsive design for desktop and mobile use
- Fast loading and optimized performance

## Project Setup

```sh
npm install
```

### Development

```sh
npm run dev
```

### Production Build

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Data Management

The application sources monster data from the Draw Steel Foundry VTT module.

### File Structure

```
data/
├── monster_index.json          # Index with all monster metadata
├── monsters/                   # Processed monster files for app consumption
│   ├── angulotl-cleaver.json
│   ├── arixx.json
│   └── ...
└── monsters-original/          # Raw Foundry VTT data (backup)

scripts/
├── clone_monsters.sh           # Clone raw data from draw-steel repository
├── process-monster-data.js     # Process raw data for app consumption
├── build-monster-data.js       # Bundle processed data for app
└── text-processors.js          # Foundry VTT directive processing utilities
```

### Pipeline

The data processing pipeline consists of 3 streamlined steps:

#### 1. Clone Raw Monster Data
```bash
npm run clone-monsters
```
- Clones latest monster data from draw-steel Foundry module to `data/monsters-original/`

#### 2. Process Monster Data  
```bash
npm run process-monsters
```
- Converts complex Foundry VTT files to simplified format
- Processes Foundry text directives into HTML  
- Applies consistent formatting and validation
- Creates monster index for application
- Outputs processed files to `data/monsters/`

#### 3. Build Bundle for App
```bash
npm run build-data
```
- Creates JavaScript bundle from processed monsters
- Generates `src/data/monsters-bundle.js` for app consumption

#### 4. Full Refresh
```bash
npm run refresh-all
```
- Runs all three steps in sequence for complete data refresh

### Available Scripts

- `npm run clone-monsters` - Fetch latest monster data from upstream
- `npm run process-monsters` - Process raw data for the application  
- `npm run build-data` - Bundle data for production (runs automatically during build)
- `npm run refresh-all` - Complete data refresh from upstream
- `npm test` - Run validation tests in watch mode
- `npm run test:run` - Run validation tests once (used in CI)

## Automated Testing & Quality Assurance

The project includes comprehensive automated testing for monster data quality and validation.

### Test Suite

The testing system validates:
- **Schema Compliance**: All monsters match required data structure
- **Formatting Consistency**: Names, roles, and organizations follow standard formatting
- **Batch Validation**: Reports on overall data health across all 238+ monsters

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/production)
npm run test:run

# Check data formatting issues
npm run format-monsters:dry-run

# Fix formatting issues
npm run format-monsters
```

### GitHub Actions Workflows

The project includes automated CI/CD workflows:

1. **Test Monster Data** (`.github/workflows/test.yml`)
   - Runs on push/PR to main branch
   - Tests on Node.js 20.19.0 and 22.12.0
   - Validates all monster data, runs ESLint, and type checking

2. **PR Validation** (`.github/workflows/pr-validation.yml`)
   - Runs on PRs that modify monster data or code
   - Provides automated feedback on changes
   - Checks formatting consistency

### Quality Metrics

Current validation status: **99% of monsters pass validation**

The remaining issues are typically:
- Missing organization values for special monsters
- Edge cases requiring manual review

### Updating Monster Data

To update with new monster releases:

```sh
npm run refresh-all
```

This will fetch the latest data from the Draw Steel Foundry module, process it for the application, and create the bundle for production use.

## Configuration

See [Vite Configuration Reference](https://vite.dev/config/).
