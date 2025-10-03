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
  processPowerRollFormula,
  flattenPowerEffects,
  extractTableToTiers,
  processMonsterText
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
      
      expect(result).toContain('<span class="potency-display">');
      expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
      expect(result).toContain('<img src="/assets/potency-5.svg" alt="5" class="potency-icon" />');
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
      
      expect(result).toContain('<span class="potency-display">');
      expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
      expect(result).toContain('<img src="/assets/potency-5.svg" alt="5" class="potency-icon" />');
    });

    it('should format negative potency values', () => {
      const text = 'Must beat R<-1 to succeed.';
      const result = processPotencyText(text, null, null, sampleMonster);
      
      expect(result).toContain('<span class="potency-fallback">R&lt;-1</span>');
    });

    it('should format multiple potency patterns including negative values', () => {
      const text = 'Test M<5 and R<-2 and P<0 patterns.';
      const result = processPotencyText(text, null, null, sampleMonster);
      
      expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
      expect(result).toContain('<img src="/assets/potency-5.svg" alt="5" class="potency-icon" />');
      expect(result).toContain('<span class="potency-fallback">R&lt;-2</span>');
      expect(result).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
    });

    it('should not double-wrap already formatted potency values', () => {
      const text = 'Already formatted <strong class="potency-value">M&lt;5</strong> and new R<3.';
      const result = processPotencyText(text, null, null, sampleMonster);
      
      // Should not double-wrap the already formatted one
      expect(result).not.toContain('<strong class="potency-value"><strong class="potency-value">');
      // Should format the new one with icons
      expect(result).toContain('<img src="/assets/reason.svg" alt="R" class="potency-char-icon" />');
      expect(result).toContain('<img src="/assets/potency-3.svg" alt="3" class="potency-icon" />');
      // Should keep the already formatted one as-is
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
      
      expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
      expect(result).toContain('<img src="/assets/potency-5.svg" alt="5" class="potency-icon" />');
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

  describe('extractTableToTiers', () => {
    it('should extract HTML table with power roll results to tier structure', () => {
      const htmlWithTable = `<p>Each angulotl makes an <strong>Intuition test.</strong></p>
        <table><tbody>
          <tr><td><p>11 or less</p></td><td><p>5 sonic damage; slowed (EoT)</p></td></tr>
          <tr><td><p>12-16</p></td><td><p>4 sonic damage</p></td></tr>
          <tr><td><p>17+</p></td><td><p>No effect.</p></td></tr>
        </tbody></table>`;

      const result = extractTableToTiers(htmlWithTable);
      
      expect(result.tiers).toBeDefined();
      expect(result.tiers).toHaveLength(3);
      expect(result.tiers[0]).toEqual({ tier: 1, display: '5 sonic damage; slowed (EoT)' });
      expect(result.tiers[1]).toEqual({ tier: 2, display: '4 sonic damage' });
      expect(result.tiers[2]).toEqual({ tier: 3, display: 'No effect.' });
      expect(result.cleanText).toBe('<p>Each angulotl makes an <strong>Intuition test.</strong></p>');
    });

    it('should handle table with damage spans correctly', () => {
      const htmlWithSpans = `<p>Roll test:</p>
        <table><tbody>
          <tr><td><p>11 or less</p></td><td><p><span class="damage-value damage-generic">5</span> sonic damage; slowed (EoT)</p></td></tr>
          <tr><td><p>12-16</p></td><td><p><span class="damage-value damage-generic">4</span> sonic damage</p></td></tr>
          <tr><td><p>17+</p></td><td><p>No effect.</p></td></tr>
        </tbody></table>`;

      const result = extractTableToTiers(htmlWithSpans);
      
      expect(result.tiers).toHaveLength(3);
      expect(result.tiers[0].display).toBe('5 sonic damage; slowed (EoT)');
      expect(result.tiers[1].display).toBe('4 sonic damage');
    });

    it('should handle table with varying number of rows', () => {
      const htmlWithTwoRows = `<p>Simple test:</p>
        <table><tbody>
          <tr><td><p>Failure</p></td><td><p>Take damage</p></td></tr>
          <tr><td><p>Success</p></td><td><p>No effect</p></td></tr>
        </tbody></table>`;

      const result = extractTableToTiers(htmlWithTwoRows);
      
      expect(result.tiers).toHaveLength(2);
      expect(result.tiers[0]).toEqual({ tier: 1, display: 'Take damage' });
      expect(result.tiers[1]).toEqual({ tier: 2, display: 'No effect' });
    });

    it('should handle malformed table gracefully', () => {
      const htmlWithBadTable = `<p>Test</p><table><tr><td>Missing tbody</td></tr></table>`;
      
      const result = extractTableToTiers(htmlWithBadTable);
      
      expect(result.tiers).toHaveLength(0);
      expect(result.cleanText).toBe('<p>Test</p><table><tr><td>Missing tbody</td></tr></table>');
    });

    it('should return original text if no table present', () => {
      const htmlWithoutTable = '<p>No table here, just regular text.</p>';
      
      const result = extractTableToTiers(htmlWithoutTable);
      
      expect(result.tiers).toHaveLength(0);
      expect(result.cleanText).toBe(htmlWithoutTable);
    });

    it('should handle empty or null input', () => {
      expect(extractTableToTiers('')).toEqual({ tiers: [], cleanText: '' });
      expect(extractTableToTiers(null)).toEqual({ tiers: [], cleanText: null });
      expect(extractTableToTiers(undefined)).toEqual({ tiers: [], cleanText: undefined });
    });
  });

  describe('flattenPowerEffects', () => {
    describe('table extraction integration', () => {
      it('should extract table from effect text and create tiers when no power effects exist', () => {
        const itemWithTable = {
          system: {
            effect: {
              text: `<p>Each angulotl makes an <strong>Intuition test.</strong></p>
                <table><tbody>
                  <tr><td><p>11 or less</p></td><td><p>5 sonic damage; slowed (EoT)</p></td></tr>
                  <tr><td><p>12-16</p></td><td><p>4 sonic damage</p></td></tr>
                  <tr><td><p>17+</p></td><td><p>No effect.</p></td></tr>
                </tbody></table>`
            },
            power: {
              roll: { formula: '2d10 + 2', characteristics: [] },
              effects: {}
            }
          }
        };

        const result = flattenPowerEffects(itemWithTable, sampleMonster);
        
        expect(result.system.power.tiers).toBeDefined();
        expect(result.system.power.tiers).toHaveLength(3);
        expect(result.system.power.tiers[0]).toEqual({ tier: 1, display: '5 sonic damage; slowed (EoT)' });
        expect(result.system.power.tiers[1]).toEqual({ tier: 2, display: '4 sonic damage' });
        expect(result.system.power.tiers[2]).toEqual({ tier: 3, display: 'No effect.' });
        expect(result.system.effect.text).toBe('<p>Each angulotl makes an <strong>Intuition test.</strong></p>');
      });

      it('should not extract table if power effects already exist', () => {
        const itemWithBothTableAndEffects = {
          system: {
            effect: {
              text: `<p>Test</p><table><tbody><tr><td>11 or less</td><td>5 damage</td></tr></tbody></table>`
            },
            power: {
              roll: { formula: '2d10 + 2', characteristics: [] },
              effects: {
                'existing': {
                  type: 'damage',
                  damage: {
                    tier1: { value: '3', types: ['fire'] }
                  }
                }
              }
            }
          }
        };

        const result = flattenPowerEffects(itemWithBothTableAndEffects, sampleMonster);
        
        // Should process existing effects, not extract table
        expect(result.system.power.tiers).toBeDefined();
        expect(result.system.power.tiers[0].display).toContain('3 fire damage');
        // Table should remain in effect text since effects took precedence
        expect(result.system.effect.text).toContain('<table>');
      });

      it('should handle real Angulotl Cleaver Resonating Croak ability correctly', () => {
        const resonatingCroakItem = {
          name: "Resonating Croak",
          type: "ability",
          system: {
            category: "heroic",
            type: "none",
            resource: 5,
            keywords: [],
            distance: { type: "special" },
            target: { type: "special" },
            trigger: "",
            power: {
              roll: {
                formula: "2d10 + 2",
                characteristics: []
              },
              effects: {}
            },
            effect: {
              text: `<p>Each angulotl in the encounter puffs out their throat and starts loudly droning Any non-angulotl adjacent to an angulotl makes an <strong>Intuition test.</strong></p><p></p><table><tbody><tr><td data-colwidth="103"><p>11 or less</p></td><td><p><span class="damage-value damage-generic">5</span> sonic damage; slowed (EoT)</p></td></tr><tr><td data-colwidth="103"><p>12-16</p></td><td><p><span class="damage-value damage-generic">4</span> sonic damage</p></td></tr><tr><td data-colwidth="103"><p>17+</p></td><td><p>No effect.</p></td></tr></tbody></table>`
            },
            spend: {
              text: "",
              value: null
            }
          }
        };

        const result = flattenPowerEffects(resonatingCroakItem, sampleMonster);

        expect(result.system.power.tiers).toBeDefined();
        expect(result.system.power.tiers).toHaveLength(3);
        expect(result.system.power.tiers[0]).toEqual({ tier: 1, display: '5 sonic damage; slowed (EoT)' });
        expect(result.system.power.tiers[1]).toEqual({ tier: 2, display: '4 sonic damage' });
        expect(result.system.power.tiers[2]).toEqual({ tier: 3, display: 'No effect.' });
        
        // Check that table was removed from effect text but description remains
        expect(result.system.effect.text).toBe('<p>Each angulotl in the encounter puffs out their throat and starts loudly droning Any non-angulotl adjacent to an angulotl makes an <strong>Intuition test.</strong></p><p></p>');
        expect(result.system.effect.text).not.toContain('<table>');
      });
    });

    describe('named damage effects with potency', () => {
      it('should process named damage effect with agility potency correctly', () => {
        const item = {
          system: {
            power: {
              roll: {
                characteristics: ['agility']
              },
              effects: {
                'damage1': {
                  name: '',
                  type: 'damage',
                  damage: {
                    tier1: { value: '4', types: [], potency: { value: '@potency.weak', characteristic: 'none' } },
                    tier2: { value: '4', types: [], potency: { value: '@potency.average', characteristic: '' } },
                    tier3: { value: '4', types: [], potency: { value: '@potency.strong', characteristic: '' } }
                  }
                },
                'damage2': {
                  name: 'Agility Damage',
                  type: 'damage',
                  damage: {
                    tier1: { value: '0', types: [], potency: { value: '@potency.weak', characteristic: 'none' } },
                    tier2: { value: '2', types: [], potency: { value: '1', characteristic: 'agility' } },
                    tier3: { value: '5', types: [], potency: { value: '2', characteristic: 'agility' } }
                  }
                },
                'applied1': {
                  name: 'Prone',
                  type: 'applied',
                  applied: {
                    tier1: { display: '', potency: { value: '@potency.weak', characteristic: 'none' } },
                    tier2: { display: 'Prone', potency: { value: '1', characteristic: 'agility' } },
                    tier3: { display: 'prone and can\'t stand (save ends)', potency: { value: '2', characteristic: '' } }
                  }
                }
              }
            }
          }
        };

        const result = flattenPowerEffects(item, sampleMonster);

        expect(result.system.power.tiers).toHaveLength(3);
        expect(result.system.power.tiers[0].display).toBe('4 damage'); // Zero damage effect is not shown
        expect(result.system.power.tiers[1].display).toBe('4 damage; <span class="potency-display"><img src="/assets/agility.svg" alt="A" class="potency-char-icon" /><img src="/assets/potency-1.svg" alt="1" class="potency-icon" /></span> 2 damage; Prone');
        expect(result.system.power.tiers[2].display).toBe('4 damage; <span class="potency-display"><img src="/assets/agility.svg" alt="A" class="potency-char-icon" /><img src="/assets/potency-2.svg" alt="2" class="potency-icon" /></span> 5 damage; prone and can\'t stand (save ends)');
      });

      it('should not add potency for damage effects with characteristic "none"', () => {
        const item = {
          system: {
            power: {
              roll: {
                characteristics: ['might']
              },
              effects: {
                'damage1': {
                  name: 'Regular Damage',
                  type: 'damage',
                  damage: {
                    tier1: { value: '6', types: ['fire'], potency: { value: '@potency.weak', characteristic: 'none' } },
                    tier2: { value: '8', types: ['fire'], potency: { value: '@potency.average', characteristic: '' } },
                    tier3: { value: '12', types: ['fire'], potency: { value: '@potency.strong', characteristic: '' } }
                  }
                }
              }
            }
          }
        };

        const result = flattenPowerEffects(item, sampleMonster);

        expect(result.system.power.tiers).toHaveLength(3);
        expect(result.system.power.tiers[0].display).toBe('6 fire damage');
        expect(result.system.power.tiers[1].display).toBe('8 fire damage');
        expect(result.system.power.tiers[2].display).toBe('12 fire damage');
      });

      it('should handle zero damage values correctly', () => {
        const item = {
          system: {
            power: {
              roll: {
                characteristics: ['agility']
              },
              effects: {
                'damage1': {
                  name: 'Base Damage',
                  type: 'damage',
                  damage: {
                    tier1: { value: '3', types: [], potency: { value: '@potency.weak', characteristic: 'none' } },
                    tier2: { value: '3', types: [], potency: { value: '@potency.average', characteristic: 'none' } },
                    tier3: { value: '3', types: [], potency: { value: '@potency.strong', characteristic: 'none' } }
                  }
                },
                'damage2': {
                  name: 'Bonus Damage',
                  type: 'damage',
                  damage: {
                    tier1: { value: '0', types: [], potency: { value: '1', characteristic: 'agility' } },
                    tier2: { value: '1', types: [], potency: { value: '2', characteristic: 'agility' } },
                    tier3: { value: '3', types: [], potency: { value: '3', characteristic: 'agility' } }
                  }
                }
              }
            }
          }
        };

        const result = flattenPowerEffects(item, sampleMonster);

        expect(result.system.power.tiers).toHaveLength(3);
        expect(result.system.power.tiers[0].display).toBe('3 damage'); // Zero damage effect is not shown at all
        expect(result.system.power.tiers[1].display).toBe('3 damage; <span class="potency-display"><img src="/assets/agility.svg" alt="A" class="potency-char-icon" /><img src="/assets/potency-2.svg" alt="2" class="potency-icon" /></span> 1 damage');
        expect(result.system.power.tiers[2].display).toBe('3 damage; <span class="potency-display"><img src="/assets/agility.svg" alt="A" class="potency-char-icon" /><img src="/assets/potency-3.svg" alt="3" class="potency-icon" /></span> 3 damage');
      });

      it('should process different characteristics correctly', () => {
        const item = {
          system: {
            power: {
              roll: {
                characteristics: ['might']
              },
              effects: {
                'damage1': {
                  name: 'Might Damage',
                  type: 'damage',
                  damage: {
                    tier1: { value: '2', types: [], potency: { value: '0', characteristic: 'might' } },
                    tier2: { value: '4', types: [], potency: { value: '1', characteristic: 'might' } },
                    tier3: { value: '6', types: [], potency: { value: '2', characteristic: 'might' } }
                  }
                },
                'damage2': {
                  name: 'Reason Damage',
                  type: 'damage',
                  damage: {
                    tier1: { value: '1', types: [], potency: { value: '-2', characteristic: 'reason' } },
                    tier2: { value: '2', types: [], potency: { value: '-1', characteristic: 'reason' } },
                    tier3: { value: '3', types: [], potency: { value: '0', characteristic: 'reason' } }
                  }
                }
              }
            }
          }
        };

        const result = flattenPowerEffects(item, sampleMonster);

        expect(result.system.power.tiers).toHaveLength(3);
        expect(result.system.power.tiers[0].display).toBe('2 damage; <span class="potency-fallback">R&lt;-2</span> 1 damage'); // Both damages show (potency 0 doesn't show for might damage)
        expect(result.system.power.tiers[1].display).toBe('<span class="potency-display"><img src="/assets/might.svg" alt="M" class="potency-char-icon" /><img src="/assets/potency-1.svg" alt="1" class="potency-icon" /></span> 4 damage; <span class="potency-fallback">R&lt;-1</span> 2 damage');
        expect(result.system.power.tiers[2].display).toBe('<span class="potency-display"><img src="/assets/might.svg" alt="M" class="potency-char-icon" /><img src="/assets/potency-2.svg" alt="2" class="potency-icon" /></span> 6 damage; 3 damage'); // Reason damage potency 0 doesn't show
      });

      it('should inherit characteristic from tier 1 when tiers 2 and 3 have empty characteristics', () => {
        const item = {
          system: {
            power: {
              roll: {
                characteristics: ['agility']
              },
              effects: {
                'damage1': {
                  name: 'Agility Damage',
                  type: 'damage',
                  damage: {
                    tier1: { value: '10', types: [], potency: { value: '@potency.weak', characteristic: 'agility' } },
                    tier2: { value: '15', types: [], potency: { value: '@potency.average', characteristic: '' } },
                    tier3: { value: '19', types: [], potency: { value: '@potency.strong', characteristic: '' } }
                  }
                }
              }
            }
          }
        };

        const result = flattenPowerEffects(item, sampleMonster);

        expect(result.system.power.tiers).toHaveLength(3);
        expect(result.system.power.tiers[0].display).toBe('<span class="potency-display"><img src="/assets/agility.svg" alt="A" class="potency-char-icon" /><img src="/assets/potency-1.svg" alt="1" class="potency-icon" /></span> 10 damage'); // A<3-2=1 for @potency.weak
        expect(result.system.power.tiers[1].display).toBe('<span class="potency-display"><img src="/assets/agility.svg" alt="A" class="potency-char-icon" /><img src="/assets/potency-2.svg" alt="2" class="potency-icon" /></span> 15 damage'); // A<3-1=2 for @potency.average, inherits agility
        expect(result.system.power.tiers[2].display).toBe('<span class="potency-display"><img src="/assets/agility.svg" alt="A" class="potency-char-icon" /><img src="/assets/potency-3.svg" alt="3" class="potency-icon" /></span> 19 damage'); // A<3 for @potency.strong, inherits agility
      });
    });

    describe('regular effects processing', () => {
      it('should handle items without power effects', () => {
        const item = {
          system: {
            description: { value: 'Just a regular item' }
          }
        };

        const result = flattenPowerEffects(item, sampleMonster);

        expect(result).toEqual(item); // Should be unchanged
      });

      it('should process existing tiers without modification', () => {
        const item = {
          system: {
            power: {
              roll: { characteristics: ['agility'] },
              tiers: [
                { tier: 1, display: 'Custom tier 1' },
                { tier: 2, display: 'Custom tier 2' }
              ]
            }
          }
        };

        const result = flattenPowerEffects(item, sampleMonster);

        expect(result.system.power.tiers).toEqual(item.system.power.tiers);
      });
    });
  });

  describe('Enhanced Potency Processing', () => {
    describe('processPotencyText - lowercase patterns', () => {
      it('should format lowercase potency patterns and convert to uppercase', () => {
        const text = 'Target with m<2 is knocked prone.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
      });

      it('should format multiple lowercase patterns', () => {
        const text = 'Check a<1 and r<0 and p<3.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<img src="/assets/agility.svg" alt="A" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-1.svg" alt="1" class="potency-icon" />');
        expect(result).toContain('<img src="/assets/reason.svg" alt="R" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
        expect(result).toContain('<img src="/assets/presence.svg" alt="P" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-3.svg" alt="3" class="potency-icon" />');
      });

      it('should handle lowercase patterns with negative values', () => {
        const text = 'Target with m<-1 is affected.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<span class="potency-fallback">M&lt;-1</span>');
      });
    });

    describe('processPotencyText - patterns with spaces', () => {
      it('should format uppercase patterns with spaces', () => {
        const text = 'Target with P < 0 is affected.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<img src="/assets/presence.svg" alt="P" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
      });

      it('should format patterns with multiple spaces', () => {
        const text = 'Check M  <  5 and A   <   2.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-5.svg" alt="5" class="potency-icon" />');
        expect(result).toContain('<img src="/assets/agility.svg" alt="A" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
      });

      it('should format lowercase patterns with spaces', () => {
        const text = 'Target with m < 2 is knocked prone.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
      });

      it('should handle negative values with spaces', () => {
        const text = 'Target with R < -1 is affected.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<span class="potency-fallback">R&lt;-1</span>');
      });
    });

    describe('processPotencyText - HTML encoded patterns', () => {
      it('should format HTML encoded patterns', () => {
        const text = 'Target with m&lt;2 is knocked prone.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
      });

      it('should format mixed HTML encoded and raw patterns', () => {
        const text = 'Check m&lt;2 and A < 3.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
        expect(result).toContain('<img src="/assets/agility.svg" alt="A" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-3.svg" alt="3" class="potency-icon" />');
      });

      it('should handle HTML encoded patterns with spaces', () => {
        const text = 'Target with P &lt; 0 is affected.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).toContain('<img src="/assets/presence.svg" alt="P" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
      });
    });

    describe('processPotencyText - avoid double wrapping', () => {
      it('should not double-wrap already formatted patterns', () => {
        const text = 'Already formatted <strong class="potency-value">M&lt;5</strong> and new m<2.';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).not.toContain('<strong class="potency-value"><strong class="potency-value">');
        expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
        const matches = result.match(/<strong class="potency-value">M&lt;5<\/strong>/g);
        expect(matches).toBeTruthy();
        expect(matches).toHaveLength(1); // Original kept
      });

      it('should handle complex HTML with multiple patterns', () => {
        const text = '<p>Already wrapped: <strong class="potency-value">A&lt;1</strong> and new pattern m<3.</p>';
        const result = processPotencyText(text, null, null, sampleMonster);
        
        expect(result).not.toContain('<strong class="potency-value"><strong class="potency-value">');
        expect(result).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(result).toContain('<img src="/assets/potency-3.svg" alt="3" class="potency-icon" />');
        expect(result).toContain('<strong class="potency-value">A&lt;1</strong>'); // Pre-existing format preserved
      });
    });
  });

  describe('processMonsterText - Comprehensive Potency Processing', () => {
    const mockMonster = {
      id: 'test-monster',
      name: 'Test Monster',
      characteristics: {
        might: 3,
        agility: 2,
        reason: 1,
        intuition: 2,
        presence: 1
      },
      items: []
    };

    describe('effect text processing', () => {
      it('should process potency patterns in effect text', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Wall Leap',
              type: 'ability',
              system: {
                effect: {
                  text: '<p>If the target has m&lt;2, they are knocked prone.</p>'
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const processedEffect = result.items[0].system.effect.text;
        
        expect(processedEffect).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(processedEffect).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
        expect(processedEffect).not.toContain('m&lt;2'); // Original should be replaced
      });

      it('should process multiple potency patterns in effect text', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Complex Effect',
              type: 'ability',
              system: {
                effect: {
                  text: '<p>Targets with A < 2 are dazed, those with p<0 are weakened.</p>'
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const processedEffect = result.items[0].system.effect.text;
        
        expect(processedEffect).toContain('<img src="/assets/agility.svg" alt="A" class="potency-char-icon" />');
        expect(processedEffect).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
        expect(processedEffect).toContain('<img src="/assets/presence.svg" alt="P" class="potency-char-icon" />');
        expect(processedEffect).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
      });

      it('should handle effect text with before/after fields', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Combined Effect',
              type: 'ability',
              system: {
                effect: {
                  before: 'First part with M < 3.',
                  after: 'Second part with a<1.'
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const processedEffect = result.items[0].system.effect.text;
        
        expect(processedEffect).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(processedEffect).toContain('<img src="/assets/potency-3.svg" alt="3" class="potency-icon" />');
        expect(processedEffect).toContain('<img src="/assets/agility.svg" alt="A" class="potency-char-icon" />');
        expect(processedEffect).toContain('<img src="/assets/potency-1.svg" alt="1" class="potency-icon" />');
        expect(result.items[0].system.effect.before).toBeUndefined();
        expect(result.items[0].system.effect.after).toBeUndefined();
      });
    });

    describe('spend effect processing', () => {
      it('should process potency patterns in spend text', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Accursed Bite',
              type: 'ability',
              system: {
                spend: {
                  text: 'If the target has P < 0, they are afflicted with lycanthropy.',
                  value: 2
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const spendData = result.items[0].system.spend;
        
        expect(spendData.formattedText).toContain('<img src="/assets/presence.svg" alt="P" class="potency-char-icon" />');
        expect(spendData.formattedText).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
        expect(spendData.formattedText).toContain('<strong class="malice-cost-emphasis">2 Malice:</strong>');
        expect(spendData.text).toBe('If the target has P < 0, they are afflicted with lycanthropy.'); // Original preserved
      });

      it('should process spend text without malice value', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'No Value Spend',
              type: 'ability',
              system: {
                spend: {
                  text: 'Target with m<1 is bleeding.',
                  value: null
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const spendData = result.items[0].system.spend;
        
        expect(spendData.text).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(spendData.text).toContain('<img src="/assets/potency-1.svg" alt="1" class="potency-icon" />');
        expect(spendData.formattedText).toBeUndefined(); // No formattedText without value
      });

      it('should handle complex potency patterns in spend text', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Complex Spend',
              type: 'ability',
              system: {
                spend: {
                  text: 'Targets with A < 2 are weakened, those with m&lt;0 are restrained.',
                  value: 3
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const formattedText = result.items[0].system.spend.formattedText;
        
        expect(formattedText).toContain('<img src="/assets/agility.svg" alt="A" class="potency-char-icon" />');
        expect(formattedText).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
        expect(formattedText).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(formattedText).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
        expect(formattedText).toContain('<strong class="malice-cost-emphasis">3 Malice:</strong>');
      });
    });

    describe('feature description processing', () => {
      it('should process potency patterns in feature descriptions', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Shapeshifter',
              type: 'feature',
              system: {
                description: {
                  value: '<p>Creatures with R < 0 cannot detect this transformation.</p>'
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const description = result.items[0].system.description.value;
        
        expect(description).toContain('<img src="/assets/reason.svg" alt="R" class="potency-char-icon" />');
        expect(description).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
      });

      it('should handle multiple patterns in feature descriptions', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Complex Feature',
              type: 'feature',
              system: {
                description: {
                  value: '<p>Affects creatures with m<2 and A &lt; 1 differently.</p>'
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const description = result.items[0].system.description.value;
        
        expect(description).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(description).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
        expect(description).toContain('<img src="/assets/agility.svg" alt="A" class="potency-char-icon" />');
        expect(description).toContain('<img src="/assets/potency-1.svg" alt="1" class="potency-icon" />');
      });
    });

    describe('mixed content processing', () => {
      it('should process potency patterns across all text fields', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Complex Ability',
              type: 'ability',
              system: {
                description: {
                  value: '<p>Base ability affects creatures with m<3.</p>'
                },
                effect: {
                  text: '<p>Additional effect for targets with A < 1.</p>'
                },
                spend: {
                  text: 'Enhanced version affects P < 0 targets.',
                  value: 2
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const item = result.items[0].system;
        
        expect(item.description.value).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(item.description.value).toContain('<img src="/assets/potency-3.svg" alt="3" class="potency-icon" />');
        expect(item.effect.text).toContain('<img src="/assets/agility.svg" alt="A" class="potency-char-icon" />');
        expect(item.effect.text).toContain('<img src="/assets/potency-1.svg" alt="1" class="potency-icon" />');
        expect(item.spend.formattedText).toContain('<img src="/assets/presence.svg" alt="P" class="potency-char-icon" />');
        expect(item.spend.formattedText).toContain('<img src="/assets/potency-0.svg" alt="0" class="potency-icon" />');
      });

      it('should preserve other text processing while adding potency processing', () => {
        const monster = {
          ...mockMonster,
          items: [
            {
              name: 'Multi-Processing Ability',
              type: 'ability', 
              system: {
                effect: {
                  text: '<p>Deals [[/damage 5 fire]] to targets with m<2.</p>'
                },
                spend: {
                  text: 'Enhanced damage [[/damage 10 fire]] for P < 0 targets.',
                  value: 1
                }
              }
            }
          ]
        };

        const result = processMonsterText(monster);
        const item = result.items[0].system;
        
        // Should process both damage directives AND potency patterns
        expect(item.effect.text).toContain('<span class="damage-value damage-generic">5</span>');
        expect(item.effect.text).toContain('<img src="/assets/might.svg" alt="M" class="potency-char-icon" />');
        expect(item.effect.text).toContain('<img src="/assets/potency-2.svg" alt="2" class="potency-icon" />');
        expect(item.spend.formattedText).toContain('<span class="damage-value damage-generic">10</span>');
      });
    });
  });
});
