# Monster Library

Web app for building encounters and viewing monster stat blocks for the tabletop roleplaying game Draw Steel.

## Features

- Browse and search through 238+ Draw Steel monsters
- View detailed stat blocks with complete monster information
- Optimized data structure for fast loading and small bundle sizes
- Responsive design for desktop and mobile use

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Data Processing

The monster data is processed through an optimization pipeline that significantly reduces bundle size while maintaining all functionality.

### Data Structure Overview

The application uses an optimized monster data structure that:
- **Reduces bundle size by 60%+** compared to the original Foundry VTT data
- **Flattens nested structures** for easier access and processing
- **Extracts only fields used by the application** from the comprehensive source data
- **Maintains complete monster information** including descriptions, abilities, and statistics

### Monster Data Scripts

#### 1. Data Optimization

```sh
node scripts/simplify-monster-data.js
```

This script processes the raw Foundry VTT monster data and creates an optimized version:
- Extracts only the fields needed by the application (~20 fields vs 100+ in source)
- Flattens nested object structures (e.g., `monster.system.monster.level` → `monster.level`)
- Converts from nested folder structure to flat file organization
- Includes both `description` and `effect` fields for complete ability descriptions

**Input:** `data/monsters/` (raw Foundry VTT files)
**Output:** `data/optimized-monsters/` (optimized JSON files) + `data/optimized_monster_index.json`

#### 2. Bundle Generation

```sh
node scripts/build-monster-data.js
# or via npm script:
npm run build-data
```

This script creates the final JavaScript bundle used by the application:
- Automatically detects and uses optimized data when available
- Falls back to original data structure if optimized data doesn't exist
- Generates a single JavaScript module with all monster data
- Creates optimized exports for fast access (`getMonster()`, `getAllMonsters()`, etc.)

**Input:** `data/optimized-monsters/` (preferred) or `data/monsters/` (fallback)
**Output:** `src/data/monsters-bundle.js`

### Updating Monster Data

To update the monster data with new releases:

1. **Get latest data** (if using the clone script):
   ```sh
   ./scripts/clone_monsters.sh
   ```

2. **Optimize the data**:
   ```sh
   node scripts/simplify-monster-data.js
   ```

3. **Build the bundle**:
   ```sh
   npm run build-data
   ```

4. **Build the application**:
   ```sh
   npm run build
   ```

### Data Structure Details

#### Optimized Monster Format

```javascript
{
  "id": "monster-name",
  "name": "Monster Name", 
  "level": 1,
  "ev": 3,
  "role": "artillery",
  "organization": "horde",
  "keywords": ["humanoid"],
  
  // Combat stats
  "size": { "value": 1, "letter": "S" },
  "speed": 5,
  "stamina": 10,
  "stability": 0,
  "freeStrike": 2,
  
  // Flattened characteristics
  "characteristics": {
    "might": 0,
    "agility": 2,
    "reason": 1,
    "intuition": 0,
    "presence": -1
  },
  
  // Damage info
  "immunities": { "poison": 2, /* ... */ },
  "weaknesses": { /* ... */ },
  "movementTypes": ["walk", "swim", "climb"],
  
  // Abilities and features
  "items": [
    {
      "name": "Ability Name",
      "type": "ability",
      "system": {
        "category": "signature",
        "keywords": ["ranged", "strike"],
        "power": { /* power roll data */ },
        "description": { "value": "Feature description..." },
        "effect": { 
          "before": "Ability description...",
          "after": ""
        }
      }
    }
  ],
  
  "source": {
    "book": "Monsters",
    "page": "36",
    "license": "Draw Steel Creator License"
  }
}
```

#### Size Comparison

- **Original Foundry VTT data**: ~4.8MB JSON, ~2.8MB bundle (gzipped: 230KB)
- **Optimized data**: ~2.4MB JSON, ~2.6MB bundle (gzipped: 85KB)
- **Improvement**: 63% reduction in gzipped bundle size

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Configuration

See [Vite Configuration Reference](https://vite.dev/config/).
