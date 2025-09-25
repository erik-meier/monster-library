#!/usr/bin/env node

/**
 * Format Monster Data Script
 * 
 * This script standardizes the formatting of all monster JSON files:
 * - Standardizes name capitalization
 * - Ensures consistent ID format (lowercase with hyphens)
 * - Sorts keywords alphabetically
 * - Normalizes role/organization to lowercase
 * - Standardizes size letters to uppercase
 * - Removes zero-value immunities/weaknesses for cleaner JSON
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatMonster(monster) {
  const formatted = { ...monster };
  const changes = [];

  // Ensure name is properly capitalized with correct parentheses handling
  if (formatted.name && typeof formatted.name === 'string') {
    const properName = formatted.name
      .split(' ')
      .map(word => {
        // Handle parentheses cases like "(Size 3)" -> "(Size 3)"
        if (word.startsWith('(') && word.endsWith(')')) {
          const inner = word.slice(1, -1);
          const capitalizedInner = inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase();
          return `(${capitalizedInner})`;
        }
        // Handle opening parenthesis like "(size" -> "(Size"
        else if (word.startsWith('(')) {
          const inner = word.slice(1);
          const capitalizedInner = inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase();
          return `(${capitalizedInner}`;
        }
        // Handle closing parenthesis like "3)" -> "3)"
        else if (word.endsWith(')')) {
          const inner = word.slice(0, -1);
          // Only capitalize if it's not a number
          if (!/^\d+$/.test(inner)) {
            const capitalizedInner = inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase();
            return `${capitalizedInner})`;
          }
          return word; // Keep numbers as-is
        }
        // Regular word capitalization
        else {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
      })
      .join(' ');
    
    if (properName !== formatted.name) {
      changes.push({
        field: 'name',
        old: formatted.name,
        new: properName,
        reason: 'Standardized name capitalization'
      });
      formatted.name = properName;
    }
  }

  // Ensure id is lowercase with hyphens
  if (formatted.id && typeof formatted.id === 'string') {
    const properID = formatted.id
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (properID !== formatted.id) {
      changes.push({
        field: 'id',
        old: formatted.id,
        new: properID,
        reason: 'Standardized ID format (lowercase with hyphens)'
      });
      formatted.id = properID;
    }
  }

  // Sort keywords alphabetically
  if (formatted.keywords && Array.isArray(formatted.keywords)) {
    const sortedKeywords = [...formatted.keywords].sort();
    if (JSON.stringify(sortedKeywords) !== JSON.stringify(formatted.keywords)) {
      changes.push({
        field: 'keywords',
        old: formatted.keywords,
        new: sortedKeywords,
        reason: 'Sorted keywords alphabetically'
      });
      formatted.keywords = sortedKeywords;
    }
  }

  // Ensure role is properly capitalized
  if (formatted.role && typeof formatted.role === 'string') {
    const properRole = formatted.role.charAt(0).toUpperCase() + formatted.role.slice(1).toLowerCase();
    if (properRole !== formatted.role) {
      changes.push({
        field: 'role',
        old: formatted.role,
        new: properRole,
        reason: 'Role should be properly capitalized'
      });
      formatted.role = properRole;
    }
  }

  // Ensure organization is properly capitalized
  if (formatted.organization && typeof formatted.organization === 'string') {
    const properOrg = formatted.organization.charAt(0).toUpperCase() + formatted.organization.slice(1).toLowerCase();
    if (properOrg !== formatted.organization) {
      changes.push({
        field: 'organization',
        old: formatted.organization,
        new: properOrg,
        reason: 'Organization should be properly capitalized'
      });
      formatted.organization = properOrg;
    }
  }

  // Standardize size letter to uppercase
  if (formatted.size && formatted.size.letter && typeof formatted.size.letter === 'string') {
    const upperLetter = formatted.size.letter.toUpperCase();
    if (upperLetter !== formatted.size.letter) {
      changes.push({
        field: 'size.letter',
        old: formatted.size.letter,
        new: upperLetter,
        reason: 'Size letter should be uppercase'
      });
      formatted.size.letter = upperLetter;
    }
  }

  // Remove any immunity/weakness entries that are 0 to clean up the JSON
  if (formatted.immunities && typeof formatted.immunities === 'object') {
    const cleanedImmunities = Object.fromEntries(
      Object.entries(formatted.immunities).filter(([, value]) => value !== 0)
    );
    if (Object.keys(cleanedImmunities).length !== Object.keys(formatted.immunities).length) {
      changes.push({
        field: 'immunities',
        old: `${Object.keys(formatted.immunities).length} entries`,
        new: `${Object.keys(cleanedImmunities).length} entries`,
        reason: 'Removed zero-value immunities for cleaner JSON'
      });
      formatted.immunities = cleanedImmunities;
    }
  }

  if (formatted.weaknesses && typeof formatted.weaknesses === 'object') {
    const cleanedWeaknesses = Object.fromEntries(
      Object.entries(formatted.weaknesses).filter(([, value]) => value !== 0)
    );
    if (Object.keys(cleanedWeaknesses).length !== Object.keys(formatted.weaknesses).length) {
      changes.push({
        field: 'weaknesses',
        old: `${Object.keys(formatted.weaknesses).length} entries`,
        new: `${Object.keys(cleanedWeaknesses).length} entries`,
        reason: 'Removed zero-value weaknesses for cleaner JSON'
      });
      formatted.weaknesses = cleanedWeaknesses;
    }
  }

  // If role and organization are both set to the same value, clear role since it's duplicate
  if (formatted.role === formatted.organization) {
    changes.push({
      field: 'role',
      old: formatted.role,
      new: '',
      reason: 'Role is the same as organization and has been cleared'
    });
    formatted.role = '';
  }

  return { formatted, changes };
}

function formatAllMonsters(monstersDir, dryRun = false) {
  console.log(`\n=== MONSTER DATA FORMATTER ===`);
  console.log(`Directory: ${monstersDir}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLYING CHANGES'}\n`);

  if (!fs.existsSync(monstersDir)) {
    console.error(`Error: Directory ${monstersDir} does not exist`);
    process.exit(1);
  }

  const monsterFiles = fs.readdirSync(monstersDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(monstersDir, file));

  let changedCount = 0;
  let totalChanges = 0;

  monsterFiles.forEach(file => {
    try {
      const original = JSON.parse(fs.readFileSync(file, 'utf8'));
      const result = formatMonster(original);
      
      if (result.changes.length > 0) {
        changedCount++;
        totalChanges += result.changes.length;
        
        console.log(`${original.name || path.basename(file)}:`);
        result.changes.forEach(change => {
          console.log(`  • ${change.field}: ${change.reason}`);
        });
        
        if (!dryRun) {
          fs.writeFileSync(file, JSON.stringify(result.formatted, null, 2) + '\n');
        }
        console.log('');
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total monsters: ${monsterFiles.length}`);
  console.log(`Monsters with changes: ${changedCount}`);
  console.log(`Total changes: ${totalChanges}`);
  
  if (dryRun) {
    console.log(`\nTo apply these changes, run: npm run format-monsters`);
  } else {
    console.log(`\n✅ All changes applied successfully!`);
  }
}

// Command line interface
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
Monster Data Formatter

Usage:
  node format-monster-data.js [options]

Options:
  --dry-run, -d    Show what would be changed without modifying files
  --help, -h       Show this help message

Examples:
  node format-monster-data.js --dry-run    # Preview changes
  node format-monster-data.js              # Apply changes
`);
  process.exit(0);
}

const monstersDir = path.join(__dirname, '../data/monsters');
formatAllMonsters(monstersDir, dryRun);

export { formatMonster, formatAllMonsters };