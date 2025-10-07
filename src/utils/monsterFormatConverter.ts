/**
 * Utility functions to convert between monster data formats
 */

import type { MonsterFormData, MonsterItem } from '@/types/monster-forms'

/**
 * Convert a MonsterItem from the old system format to the new simplified format
 */
export function convertItemToSimplifiedFormat(item: MonsterItem): MonsterItem {
  // If it already has the simplified format, return as-is
  if (item.effects || item.ability_type || item.usage) {
    return item;
  }

  const newItem: MonsterItem = {
    name: item.name,
    type: item.type,
    system: item.system // Keep system for backward compatibility
  };

  // Convert abilities to simplified format
  if (item.type === 'ability' && item.system) {
    // Set ability_type based on category
    if (item.system.category === 'signature') {
      newItem.ability_type = 'Signature Ability';
    } else if (item.system.type === 'villain') {
      newItem.ability_type = 'Villain Action';
    }

    // Set usage from system.type
    if (item.system.type) {
      const typeMap: Record<string, string> = {
        'main': 'Main action',
        'maneuver': 'Maneuver', 
        'triggered': 'Triggered action',
        'freeTriggered': 'Free triggered action',
        'villain': 'Villain action',
        'move': 'Move action'
      };
      newItem.usage = typeMap[item.system.type] || item.system.type;
    }

    // Set keywords
    if (item.system.keywords) {
      newItem.keywords = [...item.system.keywords];
    }

    // Convert distance
    if (item.system.distance) {
      newItem.distance = convertDistanceToString(item.system.distance);
    }

    // Convert target  
    if (item.system.target) {
      newItem.target = convertTargetToString(item.system.target);
    }

    // Convert effects
    const effects = [];

    // Add power roll effect if present
    if (item.system.power?.tiers && item.system.power.tiers.length > 0) {
      const rollEffect: any = {};
      
      if (item.system.power.roll?.formula) {
        rollEffect.roll = item.system.power.roll.formula;
      }

      // Add tier data
      item.system.power.tiers.forEach(tier => {
        if (tier.tier === 1) rollEffect.tier1 = tier.display;
        if (tier.tier === 2) rollEffect.tier2 = tier.display;  
        if (tier.tier === 3) rollEffect.tier3 = tier.display;
      });

      if (Object.keys(rollEffect).length > 0) {
        effects.push(rollEffect);
      }
    }

    // Add effect if present
    if (item.system.effect?.text) {
      effects.push({
        name: 'Effect',
        effect: item.system.effect.text
      });
    }

    // Add spend effect if present  
    if (item.system.spend?.text) {
      effects.push({
        cost: item.system.resource ? `${item.system.resource} Malice` : undefined,
        effect: item.system.spend.text
      });
    }

    // Add trigger if present (at top level)
    if (item.system.trigger) {
      newItem.trigger = item.system.trigger;
    }

    if (effects.length > 0) {
      newItem.effects = effects;
    }
  }

  // Convert features to simplified format
  if (item.type === 'feature' && item.system?.description?.value) {
    newItem.effects = [{
      effect: item.system.description.value
    }];
  }

  return newItem;
}

/**
 * Convert distance object to string format
 */
function convertDistanceToString(distance: any): string {
  switch (distance.type) {
    case 'melee':
      return `Melee ${distance.primary || 1}`;
    case 'ranged':
      return `Ranged ${distance.primary || distance.secondary || 5}`;
    case 'meleeRanged':
      return `Melee ${distance.primary || 1} or Ranged ${distance.secondary || 5}`;
    case 'line':
      return `${distance.primary || 5} x ${distance.secondary || 1} line within ${distance.tertiary || 10}`;
    case 'cube':
      return `${distance.primary || 3} cube within ${distance.secondary || 10}`;
    case 'wall':
      return `${distance.primary || 6} wall within ${distance.secondary || 10}`;
    case 'burst':
      return `${distance.primary || 2} burst`;
    case 'self':
      return 'Self';
    case 'special':
      return 'Special';
    default:
      return distance.type || 'Special';
  }
}

/**
 * Convert target object to string format
 */
function convertTargetToString(target: any): string {
  switch (target.type) {
    case 'creature':
      return target.value > 1 ? `${target.value} creatures` : 'One creature';
    case 'creatureObject':
      return target.value > 1 ? `${target.value} creatures or objects` : 'One creature or object';
    case 'enemy':
      return target.value > 1 ? `${target.value} enemies` : 'One enemy';
    case 'ally':
      return target.value > 1 ? `${target.value} allies` : 'One ally';
    case 'selfAlly':
      return 'Self and one ally';
    case 'selfOrAlly':
      return 'Self or one ally';
    case 'self':
      return 'Self';
    case 'special':
      return 'Special';
    default:
      return target.type || 'Special';
  }
}

/**
 * Convert entire monster form data to simplified format
 */
export function convertMonsterToSimplifiedFormat(monster: MonsterFormData): MonsterFormData {
  return {
    ...monster,
    items: monster.items.map(item => convertItemToSimplifiedFormat(item))
  };
}