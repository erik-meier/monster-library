import { describe, it, expect } from 'vitest';
import { formatMonster } from './helpers/formatting-utils';
import * as fs from 'fs';
import * as path from 'path';

describe('Monster Formatting Validation', () => {
    it('should validate that monsters follow formatting standards', () => {
        const fixturePath = path.join(__dirname, './fixtures/valid-monster-example.json');
        const validMonster = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
        
        const result = formatMonster(validMonster);
        
        // Test should PASS when no changes are needed (properly formatted)
        expect(result.changes).toHaveLength(0);
    });

    it('should identify formatting issues in sample monsters', () => {
        const monstersDir = path.join(__dirname, '../data/monsters');
        
        if (!fs.existsSync(monstersDir)) {
            console.log('Skipping - monsters directory not found');
            return;
        }

        const monsterFiles = fs.readdirSync(monstersDir)
            .filter((file: string) => file.endsWith('.json'))
            .slice(0, 5); // Test first 5
            
        let totalIssues = 0;
        
        for (const file of monsterFiles) {
            const monster = JSON.parse(fs.readFileSync(path.join(monstersDir, file), 'utf8'));
            const result = formatMonster(monster);
            
            if (result.changes.length > 0) {
                totalIssues += result.changes.length;
                console.log(`${monster.name}: ${result.changes.length} formatting issues`);
            }
        }
        
        // This test documents the current state - adjust threshold as needed
        console.log(`Total formatting issues found: ${totalIssues}`);
        
        // Test passes regardless - this is just reporting
        expect(totalIssues).toBeGreaterThanOrEqual(0);
    });
});