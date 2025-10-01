/**
 * Tests for text-processors.js data processing functions
 */

import { describe, it, expect } from 'vitest';
import {
  processDamageDirectives,
  processHealDirectives,
  processRollDirectives,
  processUuidReferences,
  processCharacteristicReferences,
  processPotencyText,
  processForcedPlaceholders,
  processFoundryText,
  processPowerRollFormula
} from '../scripts/text-processors.js';

describe('Text Processing Functions', () => {
  // Sample monster for testing
  const sampleMonster = {
    freeStrike: 5,
    characteristics: {
      might: 3,
      agility: 2,
      reason: 1,
      intuition: 2,
      presence: 1
    }
  };

  describe('processDamageDirectives', () => {
    it('should process basic damage directive with value and type', () => {
      const text = 'Deals [[/damage 10 fire]] to the target.';
      const result = processDamageDirectives(text, sampleMonster);
      
      expect(result).toContain('<span class="damage-value damage-generic">10</span>');
      expect(result).toContain('fire');
    });

    it('should process damage directive with @monster.freeStrike', () => {
      const text = 'Deals [[/damage @monster.freeStrike]] damage.';
      const result = processDamageDirectives(text, sampleMonster);
      
      expect(result).toContain('<span class="damage-value damage-generic">5</span>');
      expect(result).toContain('damage free strike');
    });

    it('should handle damage with multiple types as untyped', () => {
      const text = 'Deals [[/damage 11 sonic poison fire]] damage.';
      const result = processDamageDirectives(text, sampleMonster);
      
      expect(result).toContain('<span class="damage-value damage-generic">11</span>');
      expect(result).not.toContain('sonic');
    });

    it('should handle damage with single type', () => {
      const text = 'Deals [[/damage 8 cold]] damage.';
      const result = processDamageDirectives(text, sampleMonster);
      
      expect(result).toContain('<span class="damage-value damage-generic">8</span>');
      expect(result).toContain('cold');
    });

    it('should return original text if no damage directives', () => {
      const text = 'No damage here.';
      const result = processDamageDirectives(text, sampleMonster);
      
      expect(result).toBe(text);
    });

    it('should handle null or undefined text', () => {
      expect(processDamageDirectives(null, sampleMonster)).toBe(null);
      expect(processDamageDirectives(undefined, sampleMonster)).toBe(undefined);
    });
  });

  describe('processHealDirectives', () => {
    it('should process basic heal directive', () => {
      const text = 'Heals [[/heal 5]] stamina.';
      const result = processHealDirectives(text);
      
      expect(result).toContain('<span class="heal-value">5</span>');
      expect(result).toContain('stamina');
    });

    it('should process temporary heal directive', () => {
      const text = 'Gains [[/heal 3 temporary]] temporary stamina.';
      const result = processHealDirectives(text);
      
      expect(result).toContain('<span class="heal-value">3</span>');
      expect(result).toContain('temporary');
      expect(result).toContain('stamina');
    });

    it('should handle dice notation in heal', () => {
      const text = 'Heals [[/heal 2d6]] stamina.';
      const result = processHealDirectives(text);
      
      expect(result).toContain('<span class="heal-value">2d6</span>');
    });

    it('should return original text if no heal directives', () => {
      const text = 'No healing here.';
      const result = processHealDirectives(text);
      
      expect(result).toBe(text);
    });

    it('should handle null or undefined text', () => {
      expect(processHealDirectives(null)).toBe(null);
      expect(processHealDirectives(undefined)).toBe(undefined);
    });
  });

  describe('processRollDirectives', () => {
    it('should process roll directive with /roll', () => {
      const text = 'Roll [[/roll d3]] for the effect.';
      const result = processRollDirectives(text);
      
      expect(result).toContain('<span class="roll-formula">d3</span>');
    });

    it('should process roll directive with /r shorthand', () => {
      const text = 'Roll [[/r 2d6]] for damage.';
      const result = processRollDirectives(text);
      
      expect(result).toContain('<span class="roll-formula">2d6</span>');
    });

    it('should trim whitespace in roll formulas', () => {
      const text = 'Roll [[/roll  1d8  ]] for effect.';
      const result = processRollDirectives(text);
      
      expect(result).toContain('<span class="roll-formula">1d8</span>');
    });

    it('should return original text if no roll directives', () => {
      const text = 'No rolls here.';
      const result = processRollDirectives(text);
      
      expect(result).toBe(text);
    });

    it('should handle null or undefined text', () => {
      expect(processRollDirectives(null)).toBe(null);
      expect(processRollDirectives(undefined)).toBe(undefined);
    });
  });

  describe('processUuidReferences', () => {
    it('should process monster UUID reference', () => {
      const text = 'See @UUID[Compendium.draw-steel.monsters.Actor.abc123]{Ancient Dragon} for more.';
      const result = processUuidReferences(text);
      
      expect(result).toContain('<a href="/monster/ancient-dragon"');
      expect(result).toContain('class="monster-link"');
      expect(result).toContain('Ancient Dragon');
    });

    it('should process non-monster UUID reference', () => {
      const text = 'See @UUID[Compendium.draw-steel.items.Item.xyz]{Magic Sword} for details.';
      const result = processUuidReferences(text);
      
      expect(result).toContain('<span class="reference-text">Magic Sword</span>');
      expect(result).not.toContain('<a href');
    });

    it('should return original text if no UUID references', () => {
      const text = 'No UUID references here.';
      const result = processUuidReferences(text);
      
      expect(result).toBe(text);
    });

    it('should handle null or undefined text', () => {
      expect(processUuidReferences(null)).toBe(null);
      expect(processUuidReferences(undefined)).toBe(undefined);
    });
  });

  describe('processCharacteristicReferences', () => {
    it('should replace @chr with highest characteristic formula', () => {
      const text = 'Roll @chr against the target.';
      const result = processCharacteristicReferences(text, sampleMonster);
      
      expect(result).toBe('Roll 2d10 + 3 against the target.');
    });

    it('should replace standalone @chr', () => {
      const result = processCharacteristicReferences('@chr', sampleMonster);
      
      expect(result).toBe('2d10 + 3');
    });

    it('should use highest characteristic value', () => {
      const monsterWithHighPresence = {
        characteristics: {
          might: 1,
          agility: 1,
          reason: 1,
          intuition: 1,
          presence: 5
        }
      };
      const result = processCharacteristicReferences('@chr', monsterWithHighPresence);
      
      expect(result).toBe('2d10 + 5');
    });

    it('should handle monster without characteristics', () => {
      const result = processCharacteristicReferences('@chr', {});
      
      expect(result).toBe('@chr');
    });

    it('should return original text if no @chr references', () => {
      const text = 'No characteristic references.';
      const result = processCharacteristicReferences(text, sampleMonster);
      
      expect(result).toBe(text);
    });

    it('should handle null or undefined text', () => {
      expect(processCharacteristicReferences(null, sampleMonster)).toBe(null);
      expect(processCharacteristicReferences(undefined, sampleMonster)).toBe(undefined);
    });
  });

  describe('processPotencyText', () => {
    it('should replace {{potency}} placeholder with formatted pattern', () => {
      const text = 'Target must roll {{potency}} or be affected.';
      const result = processPotencyText(text, 5, 'might', sampleMonster);
      
      expect(result).toContain('<strong class="potency-value">M&lt;5</strong>');
    });

    it('should handle @potency.weak', () => {
      const text = 'Requires a roll of @potency.weak.';
      const result = processPotencyText(text, null, null, sampleMonster);
      
      expect(result).toContain('1'); // highest char (3) - 2
    });

    it('should handle @potency.average', () => {
      const text = 'Requires a roll of @potency.average.';
      const result = processPotencyText(text, null, null, sampleMonster);
      
      expect(result).toContain('2'); // highest char (3) - 1
    });

    it('should handle @potency.strong', () => {
      const text = 'Requires a roll of @potency.strong.';
      const result = processPotencyText(text, null, null, sampleMonster);
      
      expect(result).toContain('3'); // highest char (3)
    });

    it('should format existing potency patterns with styling', () => {
      const text = 'Must beat M&lt;5 to succeed.';
      const result = processPotencyText(text, null, null, sampleMonster);
      
      expect(result).toContain('<strong class="potency-value">M&lt;5</strong>');
    });

    it('should handle text without monster characteristics', () => {
      const result = processPotencyText('Some text', 5, 'might', {});
      
      expect(result).toBe('Some text');
    });

    it('should handle null or undefined text', () => {
      expect(processPotencyText(null, 5, 'might', sampleMonster)).toBe(null);
      expect(processPotencyText(undefined, 5, 'might', sampleMonster)).toBe(undefined);
    });
  });

  describe('processForcedPlaceholders', () => {
    it('should replace {{forced}} with forced movement description', () => {
      const text = 'The target is {{forced}}.';
      const forcedData = {
        movement: ['push'],
        distance: '3',
        properties: []
      };
      const result = processForcedPlaceholders(text, forcedData);
      
      expect(result).toBe('The target is push 3.');
    });

    it('should include properties in forced movement', () => {
      const text = 'The target is {{forced}}.';
      const forcedData = {
        movement: ['slide'],
        distance: '2',
        properties: ['vertical']
      };
      const result = processForcedPlaceholders(text, forcedData);
      
      expect(result).toBe('The target is vertical slide 2.');
    });

    it('should handle multiple properties', () => {
      const text = 'Target is {{forced}}.';
      const forcedData = {
        movement: ['push'],
        distance: '5',
        properties: ['vertical', 'forced']
      };
      const result = processForcedPlaceholders(text, forcedData);
      
      expect(result).toContain('vertical, forced');
      expect(result).toContain('push 5');
    });

    it('should return original text if no {{forced}} placeholder', () => {
      const text = 'No forced movement here.';
      const result = processForcedPlaceholders(text, { movement: ['push'], distance: '1' });
      
      expect(result).toBe(text);
    });

    it('should handle missing forcedData', () => {
      const text = 'The target is {{forced}}.';
      const result = processForcedPlaceholders(text, null);
      
      expect(result).toBe(text);
    });

    it('should handle null or undefined text', () => {
      expect(processForcedPlaceholders(null, {})).toBe(null);
      expect(processForcedPlaceholders(undefined, {})).toBe(undefined);
    });
  });

  describe('processFoundryText (integration)', () => {
    it('should apply all transformations in sequence', () => {
      const text = 'Deals [[/damage 10 fire]] and heals [[/heal 5]] stamina.';
      const result = processFoundryText(text, sampleMonster);
      
      expect(result).toContain('<span class="damage-value damage-generic">10</span>');
      expect(result).toContain('fire');
      expect(result).toContain('<span class="heal-value">5</span>');
      expect(result).toContain('stamina');
    });

    it('should process UUID references with other directives', () => {
      const text = 'See @UUID[Compendium.draw-steel.monsters.Actor.abc]{Dragon} and roll [[/roll 1d6]].';
      const result = processFoundryText(text, sampleMonster);
      
      expect(result).toContain('<a href="/monster/dragon"');
      expect(result).toContain('<span class="roll-formula">1d6</span>');
    });

    it('should process potency with options', () => {
      const text = 'Target must beat {{potency}}.';
      const options = {
        potencyData: {
          value: 5,
          characteristic: 'might'
        }
      };
      const result = processFoundryText(text, sampleMonster, options);
      
      expect(result).toContain('<strong class="potency-value">M&lt;5</strong>');
    });

    it('should process forced movement with options', () => {
      const text = 'Target is {{forced}}.';
      const options = {
        forcedData: {
          movement: ['push'],
          distance: '2',
          properties: []
        }
      };
      const result = processFoundryText(text, sampleMonster, options);
      
      expect(result).toContain('push 2');
    });

    it('should handle empty text', () => {
      expect(processFoundryText('', sampleMonster)).toBe('');
    });

    it('should handle null text', () => {
      expect(processFoundryText(null, sampleMonster)).toBe(null);
    });
  });

  describe('processPowerRollFormula', () => {
    it('should process characteristic references in formula', () => {
      const result = processPowerRollFormula('@chr', sampleMonster);
      
      expect(result).toBe('2d10 + 3');
    });

    it('should handle formula without characteristic references', () => {
      const result = processPowerRollFormula('2d6 + 5', sampleMonster);
      
      expect(result).toBe('2d6 + 5');
    });
  });
});
