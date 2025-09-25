import { describe, it, expect } from 'vitest';
import { validateMonster } from './helpers/validation-utils';
import * as fs from 'fs';
import * as path from 'path';

describe('Monster Validation', () => {
    it('should validate valid monster stat block structure', () => {
        const fixturePath = path.join(__dirname, './fixtures/valid-monster-example.json');
        const validMonster = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
        
        const result = validateMonster(validMonster);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});