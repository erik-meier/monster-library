# Monster Library

Web app for browsing and viewing monster stat blocks for the tabletop roleplaying game Draw Steel.

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

The application uses monster data from the Draw Steel Foundry VTT module.

### File Structure

```
data/
├── monster_index.json          # Index with all monster metadata
└── monsters/                   # Monster files in simplified format
    ├── angulotl-cleaver.json
    ├── arixx.json
    └── ...

scripts/
├── clone_monsters.sh           # Clone raw data from draw-steel repository
├── create-monster-index.js     # Create index from raw Foundry VTT data
├── simplify-monster-data.js    # Convert raw data to simplified format
└── build-monster-data.js       # Bundle simplified data for app consumption
```

### Workflow Steps

#### 1. Clone Raw Monster Data
```bash
npm run clone-monsters
```
- Clones latest monster data from draw-steel Foundry module
- Creates initial `monster_index.json` from raw Foundry VTT data
- Removes Foundry folder files that aren't monsters

#### 2. Simplify Monster Data
```bash
npm run simplify-monsters
```
- Converts complex Foundry VTT monster files to simplified format
- Extracts only the fields actually used by the Vue components
- Replaces raw monsters with simplified versions (backs up originals)
- Updates `monster_index.json` for simplified structure

#### 3. Build Bundle for App
```bash
npm run build-data
```
- Creates JavaScript bundle from simplified monsters
- Generates `src/data/monsters-bundle.js` for app consumption
- Used automatically during `npm run build`

#### 4. Full Refresh (All Steps)
```bash
npm run refresh-all
```
- Runs all three steps in sequence
- Complete refresh from upstream draw-steel data

### Available Scripts

- `npm run clone-monsters` - Fetch latest monster data from upstream
- `npm run simplify-monsters` - Process raw data for the application
- `npm run build-data` - Bundle data for production (runs automatically during build)
- `npm run refresh-all` - Complete data refresh from upstream

### Updating Monster Data

To update with new monster releases:

```sh
npm run refresh-all
```

This will fetch the latest data, process it for the application, and prepare it for use.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Configuration

See [Vite Configuration Reference](https://vite.dev/config/).
