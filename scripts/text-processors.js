/**
 * Text Processing Functions for Foundry VTT Directives
 * 
 * This module provides consolidated text processing functions to handle
 * Foundry VTT-specific directives and references in monster descriptions,
 * moving the processing from Vue components into the data pipeline.
 */

/**
 * Process damage directives like [[/damage 5 fire]] or [[/damage @monster.freeStrike]] or [[/damage 11 sonic poison fire]]
 */
function processDamageDirectives(text, monster) {
  if (!text) return text;

  return text.replace(/\[\[\/damage\s+(@monster\.freeStrike|\d+|\dd\d+)(?:\s+([\w\s]+?))?\]\](\{.+\})?/g, (match, value, typeString) => {
    // Handle @monster.freeStrike reference
    if (value === '@monster.freeStrike') {
      const freeStrikeValue = monster?.freeStrike || value;
      return `<span class="damage-value damage-generic">${freeStrikeValue}</span> damage free strike`;
    }

    // Handle regular numeric damage values
    let damageText = `<span class="damage-value damage-generic">${value}</span>`;

    if (typeString && typeString.trim()) {
      // For muiltiple types show as untyped
      const types = typeString.trim().split(/\s+/);
      if (types.length == 1) {
        damageText += ` ${types[0]}`;
      }
    }

    return damageText;
  });
}

/**
 * Process UUID references like @UUID[Compendium.draw-steel.monsters.Actor.ID]{Display Name}
 */
function processUuidReferences(text) {
  if (!text) return text;

  return text.replace(/@UUID\[([^\]]+)\]\{([^}]+)\}/g, (match, uuid, displayName) => {
    // Check if this is a monster reference
    if (uuid.includes('draw-steel.monsters.Actor')) {
      // Extract the monster ID from the UUID
      const monsterIdMatch = uuid.match(/Actor\.([^.]+)$/);
      if (monsterIdMatch) {
        // Convert the display name to our simplified ID format for linking
        const simplifiedId = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return `<a href="/monster/${simplifiedId}" class="monster-link">${displayName}</a>`;
      }
    }

    // For other types (features, items, etc.), just return the display name
    return `<span class="reference-text">${displayName}</span>`;
  });
}

/**
 * Process heal directives like [[/heal 3]]
 */
function processHealDirectives(text) {
  if (!text) return text;

  return text.replace(/\[\[\/heal\s+(\d+|\dd\d+)\]\]/g, (match, value) => {
    return `<span class="heal-value">${value}</span> healing`;
  });
}

/**
 * Process @chr formula references
 */
function processCharacteristicReferences(text, monster) {
  if (!text) return text;

  // Handle @chr in formulas (replace with "2d10 + [highest characteristic]")
  if (text === '@chr' && monster?.characteristics) {
    const characteristics = monster.characteristics;
    const highestChar = Math.max(
      characteristics.might || 0,
      characteristics.agility || 0,
      characteristics.reason || 0,
      characteristics.intuition || 0,
      characteristics.presence || 0
    );
    return `2d10 + ${highestChar}`;
  }

  // Handle @chr within other text
  return text.replace(/@chr/g, (match) => {
    if (monster?.characteristics) {
      const characteristics = monster.characteristics;
      const highestChar = Math.max(
        characteristics.might || 0,
        characteristics.agility || 0,
        characteristics.reason || 0,
        characteristics.intuition || 0,
        characteristics.presence || 0
      );
      return `2d10 + ${highestChar}`;
    }
    return match;
  });
}

/**
 * Comprehensive potency processing function
 * Handles @potency.* values, {{potency}} placeholders, and formats potency patterns
 */
function processPotencyText(text, potencyValue, characteristic, monster) {
  if (!text || !monster?.characteristics) return text;

  let processed = text;

  // Get highest characteristic value for calculations
  const characteristics = monster.characteristics;
  const highestCharValue = Math.max(
    characteristics.might || 0,
    characteristics.agility || 0,
    characteristics.reason || 0,
    characteristics.intuition || 0,
    characteristics.presence || 0
  );

  // Get characteristic abbreviation 
  let charAbbrev = 'P'; // Default fallback
  if (characteristic && characteristic !== 'none' && characteristic !== '') {
    charAbbrev = characteristic.charAt(0).toUpperCase();
  }

  // Step 1: Replace {{potency}} placeholders with actual potency patterns
  if (processed.includes('{{potency}}') && potencyValue !== undefined) {
    let numericValue = potencyValue;

    // Convert @potency.* patterns to numeric values
    if (typeof potencyValue === 'string' && potencyValue.startsWith('@potency.')) {
      const potencyMap = {
        '@potency.weak': highestCharValue - 2,
        '@potency.average': highestCharValue - 1,
        '@potency.strong': highestCharValue
      };
      numericValue = potencyMap[potencyValue] || potencyValue;
    }

    // Create formatted potency pattern
    const potencyPattern = `<strong class="potency-value">${charAbbrev}&lt;${numericValue}</strong>`;
    processed = processed.replace(/\{\{potency\}\}/g, potencyPattern);
  }

  // Step 2: Replace any remaining @potency.* patterns with numeric values
  processed = processed.replace(/@potency\.(weak|average|strong)/g, (match, type) => {
    const potencyMap = {
      'weak': highestCharValue - 2,
      'average': highestCharValue - 1,
      'strong': highestCharValue
    };
    return potencyMap[type].toString();
  });

  // Step 3: Format standalone potency patterns like "M<5" with proper styling
  // Avoid double-wrapping by checking if already formatted
  if (!processed.includes('<strong class="potency-value">')) {
    processed = processed.replace(/([A-Z]&lt;\d+|[A-Z]<\d+)/g, (match) => {
      // Ensure consistent &lt; encoding
      const normalized = match.replace('<', '&lt;');
      return `<strong class="potency-value">${normalized}</strong>`;
    });
  }

  return processed;
}

/**
 * Process {{forced}} placeholders in text by replacing with actual forced movement description
 */
function processForcedPlaceholders(text, forcedData) {
  if (!text || !text.includes('{{forced}}') || !forcedData) return text;

  // Generate forced movement description
  let forcedText = '';

  if (forcedData.movement && forcedData.movement.length > 0) {
    const movement = forcedData.movement[0]; // Use first movement type
    const distance = forcedData.distance || '1';

    // Add properties if they exist
    const properties = forcedData.properties || [];
    let propertiesText = '';
    if (properties.length > 0) {
      propertiesText = properties.join(', ') + ' ';
    }

    forcedText = `${propertiesText}${movement} ${distance}`;
  }

  return text.replace(/\{\{forced\}\}/g, forcedText);
}


/**
 * Comprehensive text processing function that applies all transformations
 */
function processFoundryText(text, monster, options = {}) {
  if (!text) return text;

  let processed = text;

  // Process UUID references first (before other processing)
  processed = processUuidReferences(processed);

  // Process damage directives
  processed = processDamageDirectives(processed, monster);

  // Process heal directives  
  processed = processHealDirectives(processed);

  // Process potency placeholders and patterns (consolidated)
  if (options.potencyData) {
    processed = processPotencyText(processed, options.potencyData.value, options.potencyData.characteristic, monster);
  } else {
    // Process any standalone @potency.* patterns or existing potency patterns
    processed = processPotencyText(processed, null, null, monster);
  }

  // Process forced movement placeholders if forced data provided
  if (options.forcedData) {
    processed = processForcedPlaceholders(processed, options.forcedData);
  }

  return processed;
}

/**
 * Process power roll formula references
 */
function processPowerRollFormula(formula, monster) {
  return processCharacteristicReferences(formula, monster);
}

/**
 * Flatten power effects structure into simple tier display arrays
 */
function flattenPowerEffects(item, monster) {
  if (!item.system?.power?.effects && !item.system?.power?.tiers) {
    return item;
  }

  // If already has tiers (already processed), return as is
  if (item.system.power.tiers && !item.system.power.effects) {
    return item;
  }

  const effects = item.system.power.effects;
  const tiers = [];

  // Find the primary characteristic by looking at all effect tiers
  let primaryCharacteristic = null;
  Object.values(effects).forEach(effect => {
    ['tier1', 'tier2', 'tier3'].forEach(tierKey => {
      const tierData = effect[effect.type]?.[tierKey];
      if (tierData?.potency?.characteristic &&
        tierData.potency.characteristic !== 'none' &&
        tierData.potency.characteristic !== '' &&
        !primaryCharacteristic) {
        primaryCharacteristic = tierData.potency.characteristic;
      }
    });
  });

  // Process each tier (1, 2, 3)
  for (let tierNum = 1; tierNum <= 3; tierNum++) {
    const tierKey = `tier${tierNum}`;
    const tierParts = [];

    Object.values(effects).forEach(effect => {
      const effectType = effect.type;
      const tierData = effect[effectType]?.[tierKey];

      if (!tierData) return;

      if (effectType === 'damage') {
        // Handle damage effects
        let damageText = `${tierData.value}`;
        if (tierData.types?.length > 0) {
          damageText += ` ${tierData.types.join('/')}`;
        }
        damageText += ' damage';
        tierParts.push(damageText);
      } else if (effectType === 'applied' || effectType === 'forced' || effectType === 'other') {
        // Handle effects with display templates
        let displayTemplate = tierData.display;

        // Find template to use - check current tier, then inherit from earlier tiers
        if (!displayTemplate || !displayTemplate.trim()) {
          // Look for template in earlier tiers for this effect
          for (let inheritTierNum = tierNum - 1; inheritTierNum >= 1; inheritTierNum--) {
            const inheritTierKey = `tier${inheritTierNum}`;
            const inheritTierData = effect[effectType]?.[inheritTierKey];
            if (inheritTierData?.display && inheritTierData.display.trim()) {
              displayTemplate = inheritTierData.display;
              break;
            }
          }
        }

        // Only process if we have a display template
        if (displayTemplate && displayTemplate.trim()) {
          let processedDisplay = displayTemplate;

          // Determine characteristic for this tier, inheriting if needed
          let characteristic = tierData.potency?.characteristic;
          if (!characteristic || characteristic === 'none' || characteristic === '') {
            // Inherit from earlier tiers in this effect
            for (let inheritTierNum = tierNum - 1; inheritTierNum >= 1; inheritTierNum--) {
              const inheritTierKey = `tier${inheritTierNum}`;
              const inheritTierData = effect[effectType]?.[inheritTierKey];
              if (inheritTierData?.potency?.characteristic &&
                inheritTierData.potency.characteristic !== 'none' &&
                inheritTierData.potency.characteristic !== '') {
                characteristic = inheritTierData.potency.characteristic;
                break;
              }
            }
            // Fall back to primary characteristic
            if (!characteristic || characteristic === 'none' || characteristic === '') {
              characteristic = primaryCharacteristic;
            }
          }

          // Process all potency-related content ({{potency}}, @potency.*, patterns)
          processedDisplay = processPotencyText(processedDisplay, tierData.potency?.value, characteristic, monster);

          // Process {{forced}} placeholders for forced movement
          if (processedDisplay.includes('{{forced}}') && effectType === 'forced') {
            processedDisplay = processForcedPlaceholders(processedDisplay, tierData);
          }

          tierParts.push(processedDisplay);
        }
      }
    });

    if (tierParts.length > 0) {
      tiers.push({
        tier: tierNum,
        display: tierParts.join('; ')
      });
    }
  }

  // Replace the complex effects structure with flattened tiers
  const newItem = { ...item };
  if (tiers.length > 0) {
    newItem.system.power.tiers = tiers;
    delete newItem.system.power.effects; // Remove the complex structure
  }

  return newItem;
}

/**
 * Process a complete monster's text content
 */
function processMonsterText(monster) {
  if (!monster || !monster.items) return monster;

  // Deep copy the monster to avoid mutating the original
  const processedMonster = JSON.parse(JSON.stringify(monster));

  // Process all items (abilities, features, etc.)
  processedMonster.items = processedMonster.items.map(item => {
    // First, flatten power effects if they exist, OR process existing tiers
    let processedItem = item;
    if (item.system?.power?.effects || item.system?.power?.tiers) {
      processedItem = flattenPowerEffects(item, monster);
    }

    // Process description text
    if (processedItem.system?.description?.value) {
      processedItem.system.description.value = processFoundryText(
        processedItem.system.description.value,
        monster
      );
    }

    // Process effect text (before/after)
    if (processedItem.system?.effect?.before) {
      processedItem.system.effect.before = processFoundryText(
        processedItem.system.effect.before,
        monster
      );
    }

    if (processedItem.system?.effect?.after) {
      processedItem.system.effect.after = processFoundryText(
        processedItem.system.effect.after,
        monster
      );
    }

    // Process power roll formula
    if (processedItem.system?.power?.roll?.formula) {
      processedItem.system.power.roll.formula = processPowerRollFormula(
        processedItem.system.power.roll.formula,
        monster
      );
    }

    // Process spend effects (Malice costs)
    if (processedItem.system?.spend?.text && processedItem.system?.spend?.value) {
      const spendText = processFoundryText(
        processedItem.system.spend.text,
        monster
      );
      processedItem.system.spend.formattedText = `<strong class="malice-cost-emphasis">${processedItem.system.spend.value} Malice:</strong> ${spendText}`;
    }

    return processedItem;
  });

  return processedMonster;
}

export {
  processDamageDirectives,
  processHealDirectives,
  processUuidReferences,
  processCharacteristicReferences,
  processPotencyText,
  processForcedPlaceholders,
  processFoundryText,
  processPowerRollFormula,
  flattenPowerEffects,
  processMonsterText
};