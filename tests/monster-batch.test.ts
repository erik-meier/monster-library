import { describe, it, expect } from 'vitest';
import { validateMonsterBatch } from './helpers/validation-utils';
import * as fs from 'fs';
import * as path from 'path';

describe('Batch Monster Validation', () => {
    const monstersDir = path.join(__dirname, '../data/monsters');
    
    it('should validate all monster files meet schema requirements', async () => {
        // Skip if monsters directory doesn't exist
        if (!fs.existsSync(monstersDir)) {
            console.log('Skipping batch validation - monsters directory not found');
            return;
        }

        const monsterFiles = fs.readdirSync(monstersDir)
            .filter((file: string) => file.endsWith('.json'))
            .map((file: string) => path.join(monstersDir, file));
        
        const monsters = monsterFiles.map((file: string) => {
            try {
                return JSON.parse(fs.readFileSync(file, 'utf8'));
            } catch (error) {
                console.warn(`Failed to parse ${file}:`, error);
                return null;
            }
        }).filter((monster: any) => monster !== null);

        const result = validateMonsterBatch(monsters);
        
        expect(result).toBeDefined();
        expect(result.valid).toBeDefined();
        expect(result.invalid).toBeDefined();
        
        // Log results for visibility
        console.log(`\n=== VALIDATION SUMMARY ===`);
        console.log(`Total monsters: ${monsters.length}`);
        console.log(`Valid: ${result.valid.length} (${Math.round(result.valid.length / monsters.length * 100)}%)`);
        console.log(`Invalid: ${result.invalid.length} (${Math.round(result.invalid.length / monsters.length * 100)}%)`);
        
        if (result.invalid.length > 0) {
            console.log('\nValidation errors:');
            result.invalid.slice(0, 10).forEach(inv => {
                console.log(`  • ${inv.monster.name || 'Unnamed'}: ${inv.errors.length} errors`);
                inv.errors.slice(0, 2).forEach(error => {
                    console.log(`    - ${error.field}: ${error.message}`);
                });
            });
            
            if (result.invalid.length > 10) {
                console.log(`    ... and ${result.invalid.length - 10} more monsters with validation errors`);
            }
        }

        // Ensure all monsters were processed
        expect(result.valid.length + result.invalid.length).toBe(monsters.length);

        expect(result.valid.length / monsters.length).toBeGreaterThan(0.95); // At least 95% valid
    });
});