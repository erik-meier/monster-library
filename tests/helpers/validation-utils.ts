export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}

export interface MonsterSchema {
  id: string;
  name: string;
  level: number;
  ev: number;
  role: string;
  organization: string;
  keywords?: string[];
  size: string;
  speed: number;
  stamina: number;
  stability: number;
  freeStrike: number;
  characteristics: {
    might: number;
    agility: number;
    reason: number;
    intuition: number;
    presence: number;
  };
  immunities?: Record<string, number>;
  weaknesses?: Record<string, number>;
  abilities?: unknown[];
  actions?: unknown[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateMonster(monster: any): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  // Required string fields
  const requiredStrings = ['id', 'name', 'organization', 'size'];
  for (const field of requiredStrings) {
    if (!monster[field] || typeof monster[field] !== 'string') {
      errors.push({
        field,
        message: `${field} is required and must be a string`,
        value: monster[field]
      });
    }
  }

  // Optional string fields
  const optionalStrings = ['role'];
  for (const field of optionalStrings) {
    if (field in monster && typeof monster[field] !== 'string') {
      errors.push({
        field,
        message: `${field} must be a string if provided`,
        value: monster[field]
      });
    }
  }

  // Required number fields
  const requiredNumbers = ['level', 'ev', 'speed', 'stamina', 'stability', 'freeStrike'];
  for (const field of requiredNumbers) {
    if (typeof monster[field] !== 'number') {
      errors.push({
        field,
        message: `${field} is required and must be a number`,
        value: monster[field]
      });
    }
  }

  // Validate characteristics
  if (!monster.characteristics || typeof monster.characteristics !== 'object') {
    errors.push({
      field: 'characteristics',
      message: 'characteristics is required and must be an object'
    });
  } else {
    const requiredCharacteristics = ['might', 'agility', 'reason', 'intuition', 'presence'];
    for (const char of requiredCharacteristics) {
      if (typeof monster.characteristics[char] !== 'number') {
        errors.push({
          field: `characteristics.${char}`,
          message: `characteristics.${char} must be a number`,
          value: monster.characteristics[char]
        });
      }
    }
  }

  // Validate role values
  const validRoles = ['Ambusher','Artillery', 'Brute', 'Controller', 'Defender', 'Harrier', 'Hexer', 'Mount', 'Support'];
  if (monster.role && !validRoles.includes(monster.role)) {
    errors.push({
      field: 'role',
      message: `role must be one of: ${validRoles.join(', ')}`,
      value: monster.role
    });
  }

  // Validate organization values
  const validOrganizations = ['Minion', 'Horde', 'Platoon', 'Elite', 'Solo', 'Leader'];
  if (monster.organization && !validOrganizations.includes(monster.organization)) {
    errors.push({
      field: 'organization',
      message: `organization must be one of: ${validOrganizations.join(', ')}`,
      value: monster.organization
    });
  }

  // Validate size letter values
  const validSizeLetters = ['T', 'S', 'M', 'L', 'H', 'G'];
  if (monster.size && monster.size.letter && !validSizeLetters.includes(monster.size.letter)) {
    errors.push({
      field: 'size.letter',
      message: `size.letter must be one of: ${validSizeLetters.join(', ')}`,
      value: monster.size.letter
    });
  }

  // Validate level range
  if (typeof monster.level === 'number' && (monster.level < 0 || monster.level > 20)) {
    errors.push({
      field: 'level',
      message: 'level should be between 1 and 20',
      value: monster.level
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateMonsterBatch(monsters: any[]): { valid: any[]; invalid: Array<{ monster: any; errors: ValidationResult['errors'] }> } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const valid: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invalid: Array<{ monster: any; errors: ValidationResult['errors'] }> = [];

  for (const monster of monsters) {
    const result = validateMonster(monster);
    if (result.isValid) {
      valid.push(monster);
    } else {
      invalid.push({ monster, errors: result.errors });
    }
  }

  return { valid, invalid };
}