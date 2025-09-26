/**
 * Text Processing Functions for Foundry VTT Directives
 * 
 * This module provides consolidated text processing functions to handle
 * Foundry VTT-specific directives and references in monster descriptions,
 * moving the processing from Vue components into the data pipeline.
 */

/**
 * Process damage directives like [[/damage 5 fire]] or [[/damage @monster.freeStrike]]
 */
function processDamageDirectives(text, monster) {
  if (!text) return text;

  return text.replace(/\[\[\/damage\s+(@monster\.freeStrike|\d+|\dd\d+)(?:\s+(\w+))?\]\]/g, (match, value, type) => {
    // Handle @monster.freeStrike reference
    if (value === '@monster.freeStrike') {
      const freeStrikeValue = monster?.freeStrike || value;
      return `<span class="damage-value damage-generic">${freeStrikeValue}</span> damage free strike`;
    }

    // Handle regular numeric damage values
    const damageClass = type ? `damage-${type.toLowerCase()}` : 'damage-generic';
    return `<span class="damage-value ${damageClass}">${value}${type ? ` ${type}` : ''}</span>`;
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
        const foundryId = monsterIdMatch[1];
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
 * Process potency references like @potency.weak, @potency.average, @potency.strong
 */
function processPotencyReferences(value, characteristic, monster) {
  if (!value || !value.startsWith('@potency') || !monster?.characteristics) {
    return null;
  }

  const characteristics = monster.characteristics;
  
  // If no valid characteristic specified, use the highest characteristic
  let charValue;
  let charAbbrev;
  
  if (!characteristic || characteristic === 'none' || characteristic === '') {
    // Use highest characteristic
    charValue = Math.max(
      characteristics.might || 0,
      characteristics.agility || 0,
      characteristics.reason || 0,
      characteristics.intuition || 0,
      characteristics.presence || 0
    );
    // Find which characteristic has the highest value for abbreviation
    const maxChar = Object.entries(characteristics).reduce((max, [key, val]) => 
      (val || 0) > (max.value || 0) ? { key, value: val } : max, 
      { key: 'presence', value: -Infinity }
    );
    charAbbrev = maxChar.key.charAt(0).toUpperCase();
  } else {
    charValue = characteristics[characteristic] || 0;
    charAbbrev = characteristic.charAt(0).toUpperCase();
  }

  // Map potency patterns to numeric values relative to the characteristic
  const potencyMap = {
    '@potency.weak': charValue - 2,
    '@potency.average': charValue - 1, 
    '@potency.strong': charValue
  };

  const potencyValue = potencyMap[value];
  if (potencyValue === undefined) {
    return null;
  }

  // Format as characteristic abbreviation + < + value with bold emphasis
  return `<strong class="potency-value">${charAbbrev}<${potencyValue}</strong>`;
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
      propertiesText = ` ${properties.join(', ')}`;
    }
    
    forcedText = `${propertiesText} ${movement} ${distance}`;
  }
  
  return text.replace(/\{\{forced\}\}/g, forcedText);
}

/**
 * Process {{potency}} placeholders in text
 */
function processPotencyPlaceholders(text, potencyData, monster) {
  if (!text || !text.includes('{{potency}}')) return text;

  if (potencyData && potencyData.value && potencyData.characteristic) {
    const potencyText = processPotencyReferences(potencyData.value, potencyData.characteristic, monster);
    if (potencyText) {
      return text.replace(/\{\{potency\}\}/g, potencyText);
    }
  }

  return text;
}

/**
 * Process standalone potency patterns like "M<5" that appear in descriptions
 */
function processPotencyPatterns(text) {
  if (!text) return text;

  return text.replace(/([A-Z]&lt;\d+|[A-Z]<\d+)/g, (match) => {
    // Ensure consistent &lt; encoding
    const normalized = match.replace('<', '&lt;');
    return `<strong class="potency-value">${normalized}</strong>`;
  });
}

/**
 * Process @potency.* patterns in text
 */
function processTextPotencyReferences(text, monster) {
  if (!text) return text;
  
  // Handle @potency.* that's already inside HTML - replace with proper numeric values
  return text.replace(/@potency\.(weak|average|strong)/g, (match, type) => {
    // Use highest characteristic since we don't have context for specific characteristic
    if (!monster?.characteristics) {
      return match; // Return original if no characteristics
    }
    
    const characteristics = monster.characteristics;
    const charValue = Math.max(
      characteristics.might || 0,
      characteristics.agility || 0,
      characteristics.reason || 0,
      characteristics.intuition || 0,
      characteristics.presence || 0
    );
    
    const potencyMap = {
      'weak': charValue - 2,
      'average': charValue - 1, 
      'strong': charValue
    };
    
    const potencyValue = potencyMap[type];
    
    return potencyValue.toString();
  });
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

  // Process potency placeholders if potency data provided
  if (options.potencyData) {
    processed = processPotencyPlaceholders(processed, options.potencyData, monster);
  }

  // Process forced movement placeholders if forced data provided
  if (options.forcedData) {
    processed = processForcedPlaceholders(processed, options.forcedData);
  }

  // Process @potency.* patterns in text
  processed = processTextPotencyReferences(processed, monster);

  // Process standalone potency patterns
  processed = processPotencyPatterns(processed);

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

  // // If we already have a tiers array, process the display strings for @potency patterns
  // if (item.system.power.tiers) {
  //   const processedTiers = item.system.power.tiers.map(tierData => {
  //     let processedDisplay = tierData.display;
      
  //     // Process @potency patterns in the display string
  //     if (processedDisplay && processedDisplay.includes('@potency')) {
  //       processedDisplay = processTextPotencyReferences(processedDisplay, monster);
  //     }
      
  //     return {
  //       ...tierData,
  //       display: processedDisplay
  //     };
  //   });
    
  //   return {
  //     ...item,
  //     system: {
  //       ...item.system,
  //       power: {
  //         ...item.system.power,
  //         tiers: processedTiers
  //       }
  //     }
  //   };
  // }

  // Build tiers from effects structure
  const effects = item.system.power.effects;
  const tiers = [];

  // First pass: collect all applied effects with potency to determine the primary characteristic
  // and check which tiers have display templates
  let primaryCharacteristic = null;
  const appliedEffectDisplays = {};
  
  Object.values(effects).forEach(effect => {
    if (effect.type === 'applied') {
      // Look for the first tier that has a characteristic defined
      ['tier1', 'tier2', 'tier3'].forEach(tierKey => {
        if (effect.applied?.[tierKey]?.potency?.characteristic && 
            effect.applied[tierKey].potency.characteristic !== 'none' && 
            effect.applied[tierKey].potency.characteristic !== '' &&
            !primaryCharacteristic) {
          primaryCharacteristic = effect.applied[tierKey].potency.characteristic;
        }
        
        // Track which tiers have display text for this effect
        if (!appliedEffectDisplays[effect._id]) {
          appliedEffectDisplays[effect._id] = {};
        }
        
        const hasDisplay = effect.applied?.[tierKey]?.display && effect.applied[tierKey].display.trim();
        appliedEffectDisplays[effect._id][tierKey] = hasDisplay;
      });
    }
  });

  // Process each tier (1, 2, 3)
  for (let tierNum = 1; tierNum <= 3; tierNum++) {
    const tierKey = `tier${tierNum}`;
    const tierParts = [];

    // Collect all effects for this tier
    Object.values(effects).forEach(effect => {
      if (effect.type === 'damage' && effect.damage?.[tierKey]) {
        const dmg = effect.damage[tierKey];
        let damageText = `${dmg.value}`;
        if (dmg.types?.length > 0) {
          damageText += ` ${dmg.types.join('/')}`;
        }
        damageText += ' damage';
        tierParts.push(damageText);
      }
      
      if (effect.type === 'applied' && effect.applied?.[tierKey]) {
        const applied = effect.applied[tierKey];
        let appliedText = '';
        
        // Check if this effect has any display text across all tiers
        const effectDisplayInfo = appliedEffectDisplays[effect._id] || {};
        const hasAnyDisplay = Object.values(effectDisplayInfo).some(hasDisplay => hasDisplay);
        
        // Check if only tier1 has display text (common pattern)
        const onlyTier1HasDisplay = effectDisplayInfo.tier1 && !effectDisplayInfo.tier2 && !effectDisplayInfo.tier3;
        
        // Only process if there's display text for this tier, or if only tier1 has display (use as template)
        const shouldProcess = effectDisplayInfo[tierKey] || (onlyTier1HasDisplay && hasAnyDisplay);
        
        if (shouldProcess) {
          const effectNames = Object.keys(applied.effects || {});
          
          if (effectNames.length > 0 && applied.potency?.value !== undefined) {
            let charAbbrev = 'P'; // Default abbreviation
            
            // Use the tier's specific characteristic, or fall back to primary characteristic
            let effectCharacteristic = applied.potency.characteristic;
            if (!effectCharacteristic || effectCharacteristic === 'none' || effectCharacteristic === '') {
              effectCharacteristic = primaryCharacteristic;
            }
            
            if (effectCharacteristic) {
              charAbbrev = effectCharacteristic.charAt(0).toUpperCase();
            }
            
            // Process @potency patterns in the value
            let potencyValue = applied.potency.value;
            if (typeof potencyValue === 'string' && potencyValue.startsWith('@potency')) {
              potencyValue = processTextPotencyReferences(potencyValue, monster);
            }
            
            appliedText = `${charAbbrev}<${potencyValue} ${effectNames.join(', ')}`;
            
            // Add condition details if available
            const firstEffect = applied.effects[effectNames[0]];
            if (firstEffect?.end === 'save') {
              appliedText += ' (save ends)';
            } else if (firstEffect?.end === 'EoT') {
              appliedText += ' (EoT)';
            }
          }
          // Use explicit display text if available
          else if (applied.display && applied.display.trim()) {
            appliedText = applied.display.trim();
          }
        }
        
        if (appliedText) {
          tierParts.push(appliedText);
        }
      }
      
      // Add support for other effect types as needed (forced movement, etc.)
      if (effect.type === 'forced' && effect.forced?.[tierKey]) {
        const forced = effect.forced[tierKey];
        if (forced.display) {
          // Process {{forced}} placeholders first
          let processedDisplay = processForcedPlaceholders(forced.display, forced);
          
          // Clean up any existing HTML tags for consistency
          const cleanDisplay = processedDisplay.replace(/<[^>]*>/g, '').trim();
          if (cleanDisplay) {
            tierParts.push(cleanDisplay);
          }
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

    return processedItem;
  });

  return processedMonster;
}

export {
  processDamageDirectives,
  processHealDirectives,
  processUuidReferences,
  processCharacteristicReferences,
  processPotencyReferences,
  processPotencyPlaceholders,
  processForcedPlaceholders,
  processPotencyPatterns,
  processTextPotencyReferences,
  processFoundryText,
  processPowerRollFormula,
  flattenPowerEffects,
  processMonsterText
};