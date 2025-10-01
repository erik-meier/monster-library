/**
 * Tests for process-monster-data.js utility functions
 */

import { describe, it, expect } from 'vitest';
import { 
  standardizeName, 
  generateId, 
  cleanDamageValues 
} from '../scripts/data-processing-utils.js';

describe('Monster Data Processing Utilities', () => {
  describe('standardizeName', () => {
    it('should capitalize first letter of each word', () => {
      const result = standardizeName('ancient red dragon');
      expect(result).toBe('Ancient Red Dragon');
    });

    it('should convert existing names to proper case', () => {
      const result = standardizeName('ANCIENT RED DRAGON');
      expect(result).toBe('Ancient Red Dragon');
    });

    it('should handle mixed case input', () => {
      const result = standardizeName('aNcIeNt ReD dRaGoN');
      expect(result).toBe('Ancient Red Dragon');
    });

    it('should handle names with parentheses correctly', () => {
      const result = standardizeName('goblin (size 2)');
      expect(result).toBe('Goblin (Size 2)');
    });

    it('should handle parentheses at start of word', () => {
      const result = standardizeName('(ancient dragon');
      expect(result).toBe('(Ancient Dragon');
    });

    it('should handle parentheses at end of word', () => {
      const result = standardizeName('ancient dragon)');
      expect(result).toBe('Ancient Dragon)');
    });

    it('should handle full parenthetical word', () => {
      const result = standardizeName('dragon (elite)');
      expect(result).toBe('Dragon (Elite)');
    });

    it('should handle single word names', () => {
      const result = standardizeName('arixx');
      expect(result).toBe('Arixx');
    });

    it('should handle empty or null input', () => {
      expect(standardizeName('')).toBe('');
      expect(standardizeName(null)).toBe(null);
      expect(standardizeName(undefined)).toBe(undefined);
    });

    it('should handle names with multiple spaces', () => {
      const result = standardizeName('ancient  red   dragon');
      expect(result).toBe('Ancient  Red   Dragon');
    });

    it('should handle non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(standardizeName(123 as any)).toBe(123);
    });

    it('should preserve special characters', () => {
      const result = standardizeName('dragon-knight');
      expect(result).toBe('Dragon-knight');
    });
  });

  describe('generateId', () => {
    it('should convert name to lowercase with hyphens', () => {
      const result = generateId('Ancient Red Dragon');
      expect(result).toBe('ancient-red-dragon');
    });

    it('should remove special characters', () => {
      const result = generateId("Dragon's Lair");
      expect(result).toBe('dragon-s-lair');
    });

    it('should handle multiple consecutive spaces', () => {
      const result = generateId('Ancient  Red   Dragon');
      expect(result).toBe('ancient-red-dragon');
    });

    it('should remove leading and trailing hyphens', () => {
      const result = generateId('  Ancient Dragon  ');
      expect(result).toBe('ancient-dragon');
    });

    it('should handle parentheses', () => {
      const result = generateId('Goblin (Size 2)');
      expect(result).toBe('goblin-size-2');
    });

    it('should handle numbers in names', () => {
      const result = generateId('Dragon 123');
      expect(result).toBe('dragon-123');
    });

    it('should remove multiple special characters', () => {
      const result = generateId('Dragon!!!@@@###Knight');
      expect(result).toBe('dragon-knight');
    });

    it('should handle already lowercase names', () => {
      const result = generateId('ancient red dragon');
      expect(result).toBe('ancient-red-dragon');
    });

    it('should handle single word', () => {
      const result = generateId('Arixx');
      expect(result).toBe('arixx');
    });

    it('should handle names with commas', () => {
      const result = generateId('Red Dragon, Ancient');
      expect(result).toBe('red-dragon-ancient');
    });

    it('should handle empty string', () => {
      const result = generateId('');
      expect(result).toBe('');
    });

    it('should handle names with only alphanumeric characters', () => {
      const result = generateId('Dragon123Knight456');
      expect(result).toBe('dragon123knight456');
    });

    it('should consolidate multiple hyphens', () => {
      const result = generateId('Dragon---Knight');
      expect(result).toBe('dragon-knight');
    });
  });

  describe('cleanDamageValues', () => {
    it('should remove zero-value entries', () => {
      const input = { fire: 5, cold: 0, poison: 3 };
      const result = cleanDamageValues(input);
      
      expect(result).toEqual({ fire: 5, poison: 3 });
      expect(result).not.toHaveProperty('cold');
    });

    it('should keep all non-zero values', () => {
      const input = { fire: 5, cold: 10, poison: 3 };
      const result = cleanDamageValues(input);
      
      expect(result).toEqual({ fire: 5, cold: 10, poison: 3 });
    });

    it('should return empty object if all values are zero', () => {
      const input = { fire: 0, cold: 0, poison: 0 };
      const result = cleanDamageValues(input);
      
      expect(result).toEqual({});
    });

    it('should handle empty object', () => {
      const input = {};
      const result = cleanDamageValues(input);
      
      expect(result).toEqual({});
    });

    it('should handle null input', () => {
      const result = cleanDamageValues(null);
      expect(result).toBe(null);
    });

    it('should handle undefined input', () => {
      const result = cleanDamageValues(undefined);
      expect(result).toBe(undefined);
    });

    it('should handle non-object input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(cleanDamageValues('not an object' as any)).toBe('not an object');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(cleanDamageValues(123 as any)).toBe(123);
    });

    it('should preserve negative values', () => {
      const input = { fire: -5, cold: 0, poison: 3 };
      const result = cleanDamageValues(input);
      
      expect(result).toEqual({ fire: -5, poison: 3 });
    });

    it('should handle mixed zero and non-zero values', () => {
      const input = { 
        fire: 10, 
        cold: 0, 
        poison: 5, 
        acid: 0, 
        lightning: 3,
        thunder: 0
      };
      const result = cleanDamageValues(input);
      
      expect(result).toEqual({ 
        fire: 10, 
        poison: 5, 
        lightning: 3 
      });
    });

    it('should preserve original object structure for non-zero values', () => {
      const input = { a: 1, b: 2, c: 3 };
      const result = cleanDamageValues(input);
      
      expect(Object.keys(result)).toEqual(['a', 'b', 'c']);
    });
  });
});
