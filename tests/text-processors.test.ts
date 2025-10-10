/**
 * Tests for text-processors.js data processing functions
 */

import { describe, it, expect } from 'vitest';
import {
  processPotencyPatterns
} from '../scripts/text-processors.js';

describe('Text Processing Functions', () => {
  describe('processPotencyPatterns', () => {
    it('should format existing potency patterns with styling', () => {
      const text = 'Must beat M&lt;5 to succeed.';
      const result = processPotencyPatterns(text);
      
      expect(result).toContain('<strong class="potency-value">M&lt;5</strong>');
    });

    it('should format negative potency values', () => {
      const text = 'Must beat R<-1 to succeed.';
      const result = processPotencyPatterns(text);
      
      expect(result).toContain('<strong class="potency-value">R&lt;-1</strong>');
    });

    it('should format multiple potency patterns including negative values', () => {
      const text = 'Test M<5 and R<-2 and P<0 patterns.';
      const result = processPotencyPatterns(text);
      
      expect(result).toContain('<strong class="potency-value">M&lt;5</strong>');
      expect(result).toContain('<strong class="potency-value">R&lt;-2</strong>');
      expect(result).toContain('<strong class="potency-value">P&lt;0</strong>');
    });

    it('should format lowercase potency patterns and convert to uppercase', () => {
      const text = 'Must beat m<2 to succeed.';
      const result = processPotencyPatterns(text);
      
      expect(result).toContain('<strong class="potency-value">M&lt;2</strong>');
    });

    it('should format multiple lowercase patterns', () => {
      const text = 'Test a<1 and r<-1 patterns.';
      const result = processPotencyPatterns(text);
      
      expect(result).toContain('<strong class="potency-value">A&lt;1</strong>');
      expect(result).toContain('<strong class="potency-value">R&lt;-1</strong>');
    });

    it('should handle lowercase patterns with negative values', () => {
      const text = 'Must beat p<-3 to succeed.';
      const result = processPotencyPatterns(text);
      
      expect(result).toContain('<strong class="potency-value">P&lt;-3</strong>');
    });

    it('should format uppercase patterns with spaces', () => {
      const text = 'Must beat M < 5 to succeed.';
      const result = processPotencyPatterns(text);
      
      expect(result).toContain('<strong class="potency-value">M&lt;5</strong>');
    });

    it('should not double-wrap already formatted potency values', () => {
      const text = 'Already formatted <strong class="potency-value">M&lt;5</strong> and new R<3.';
      const result = processPotencyPatterns(text);
      
      // Should not double-wrap the already formatted one
      expect(result).not.toContain('<strong class="potency-value"><strong class="potency-value">');
      // Should format the new one
      expect(result).toContain('<strong class="potency-value">R&lt;3</strong>');
      // Should keep the already formatted one as-is
      expect(result).toContain('<strong class="potency-value">M&lt;5</strong>');
    });

    it('should return original text if no potency patterns', () => {
      const text = 'No potency patterns here.';
      const result = processPotencyPatterns(text);
      
      expect(result).toBe(text);
    });

    it('should handle null or undefined text', () => {
      expect(processPotencyPatterns(null)).toBe(null);
      expect(processPotencyPatterns(undefined)).toBe(undefined);
    });

    it('should handle empty text', () => {
      expect(processPotencyPatterns('')).toBe('');
    });
  });
});