export interface FormattingResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatted: any;
  changes: Array<{
    field: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    old: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new: any;
    reason: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatMonster(monster: any): FormattingResult {
  const formatted = { ...monster };
  const changes: FormattingResult['changes'] = [];

  // Ensure name is properly capitalized
  if (formatted.name && typeof formatted.name === 'string') {
    const properName = formatted.name
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    if (properName !== formatted.name) {
      changes.push({
        field: 'name',
        old: formatted.name,
        new: properName,
        reason: 'Standardized name capitalization'
      });
      formatted.name = properName;
    }
  }

  // Ensure id is lowercase with hyphens
  if (formatted.id && typeof formatted.id === 'string') {
    const properID = formatted.id
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (properID !== formatted.id) {
      changes.push({
        field: 'id',
        old: formatted.id,
        new: properID,
        reason: 'Standardized ID format (lowercase with hyphens)'
      });
      formatted.id = properID;
    }
  }

  // Sort keywords alphabetically
  if (formatted.keywords && Array.isArray(formatted.keywords)) {
    const sortedKeywords = [...formatted.keywords].sort();
    if (JSON.stringify(sortedKeywords) !== JSON.stringify(formatted.keywords)) {
      changes.push({
        field: 'keywords',
        old: formatted.keywords,
        new: sortedKeywords,
        reason: 'Sorted keywords alphabetically'
      });
      formatted.keywords = sortedKeywords;
    }
  }

  // Ensure role is properly capitalized
  if (formatted.role && typeof formatted.role === 'string') {
    const capitalizedRole = formatted.role.charAt(0).toUpperCase() + formatted.role.slice(1).toLowerCase();
    if (capitalizedRole !== formatted.role) {
      changes.push({
        field: 'role',
        old: formatted.role,
        new: capitalizedRole,
        reason: 'Role should be properly capitalized'
      });
      formatted.role = capitalizedRole;
    }
  }

  // Ensure organization is properly capitalized
  if (formatted.organization && typeof formatted.organization === 'string') {
    const capitalizedOrg = formatted.organization.charAt(0).toUpperCase() + formatted.organization.slice(1).toLowerCase();
    if (capitalizedOrg !== formatted.organization) {
      changes.push({
        field: 'organization',
        old: formatted.organization,
        new: capitalizedOrg,
        reason: 'Organization should be properly capitalized'
      });
      formatted.organization = capitalizedOrg;
    }
  }

  // Standardize size letter to uppercase
  if (formatted.size && formatted.size.letter && typeof formatted.size.letter === 'string') {
    const upperLetter = formatted.size.letter.toUpperCase();
    if (upperLetter !== formatted.size.letter) {
      changes.push({
        field: 'size.letter',
        old: formatted.size.letter,
        new: upperLetter,
        reason: 'Size letter should be uppercase'
      });
      formatted.size.letter = upperLetter;
    }
  }

  // Remove any immunity/weakness entries that are 0 to clean up the JSON
  if (formatted.immunities && typeof formatted.immunities === 'object') {
    const cleanedImmunities = Object.fromEntries(
      Object.entries(formatted.immunities).filter(([, value]) => value !== 0)
    );
    if (Object.keys(cleanedImmunities).length !== Object.keys(formatted.immunities).length) {
      changes.push({
        field: 'immunities',
        old: formatted.immunities,
        new: cleanedImmunities,
        reason: 'Removed zero-value immunities for cleaner JSON'
      });
      formatted.immunities = cleanedImmunities;
    }
  }

  if (formatted.weaknesses && typeof formatted.weaknesses === 'object') {
    const cleanedWeaknesses = Object.fromEntries(
      Object.entries(formatted.weaknesses).filter(([, value]) => value !== 0)
    );
    if (Object.keys(cleanedWeaknesses).length !== Object.keys(formatted.weaknesses).length) {
      changes.push({
        field: 'weaknesses',
        old: formatted.weaknesses,
        new: cleanedWeaknesses,
        reason: 'Removed zero-value weaknesses for cleaner JSON'
      });
      formatted.weaknesses = cleanedWeaknesses;
    }
  }

  return {
    formatted,
    changes
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatMonsterBatch(monsters: any[]): Array<{ original: any; result: FormattingResult }> {
  return monsters.map(monster => ({
    original: monster,
    result: formatMonster(monster)
  }));
}