/**
 * Utility functions for monster data processing
 * Extracted for testability without running the full script
 */

/**
 * Standardize name capitalization with correct parentheses handling
 */
export function standardizeName(name) {
  if (!name || typeof name !== 'string') return name

  return name
    .split(' ')
    .map(word => {
      // Handle parentheses cases like "(Size 3)" -> "(Size 3)"
      if (word.startsWith('(') && word.endsWith(')')) {
        const inner = word.slice(1, -1)
        return `(${inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase()})`
      }
      // Handle words with parentheses at start or end
      else if (word.startsWith('(')) {
        return `(${word.slice(1).charAt(0).toUpperCase() + word.slice(2).toLowerCase()}`
      }
      else if (word.endsWith(')')) {
        return `${word.slice(0, -1).charAt(0).toUpperCase() + word.slice(1, -1).toLowerCase()})`
      }
      // Regular words - first letter uppercase, rest lowercase
      else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
    })
    .join(' ')
}

/**
 * Generate standardized ID from name
 */
export function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Clean zero-value damage immunities/weaknesses
 */
export function cleanDamageValues(obj) {
  if (!obj || typeof obj !== 'object') return obj
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== 0)
  )
}
