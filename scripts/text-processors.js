/**
 * Text Processing Functions for Monster Data
 * 
 * This module provides a simplified text processor focused on potency patterns
 * for use in the data processing pipeline.
 */

/**
 * Process potency patterns in text by adding proper strong tag formatting
 * Handles patterns like "A<1", "M<-2", "r<5" and ensures they are wrapped in 
 * <strong class="potency-value"> tags for proper display styling.
 */
function processPotencyPatterns(text) {
  if (!text) return text;

  let processed = text;

  // Handle uppercase patterns with optional spaces: "P < 0", "M<5", etc.
  // Skip patterns already wrapped in strong tags
  processed = processed.replace(/([A-Z])\s*(&lt;|<)\s*(-?\d+)/g, (match, char, operator, number, offset, string) => {
    // Check if this match is already inside a potency-value strong tag
    const beforeMatch = string.substring(0, offset);
    const afterMatch = string.substring(offset + match.length);

    // Look for strong tag with potency-value class before this match
    const strongOpenBefore = beforeMatch.lastIndexOf('<strong class="potency-value">');
    const strongCloseBefore = beforeMatch.lastIndexOf('</strong>');
    const strongCloseAfter = afterMatch.indexOf('</strong>');

    // If we're inside a potency-value strong tag, don't modify
    if (strongOpenBefore > strongCloseBefore && strongCloseAfter !== -1) {
      return match;
    }

    // Ensure consistent &lt; encoding and add strong tag
    return `<strong class="potency-value">${char}&lt;${number}</strong>`;
  });

  // Handle lowercase patterns and convert to uppercase: "m<2" -> "M<2"
  processed = processed.replace(/([a-z])\s*(&lt;|<)\s*(-?\d+)/g, (match, char, operator, number, offset, string) => {
    // Check if this match is already inside a potency-value strong tag
    const beforeMatch = string.substring(0, offset);
    const afterMatch = string.substring(offset + match.length);

    // Look for strong tag with potency-value class before this match
    const strongOpenBefore = beforeMatch.lastIndexOf('<strong class="potency-value">');
    const strongCloseBefore = beforeMatch.lastIndexOf('</strong>');
    const strongCloseAfter = afterMatch.indexOf('</strong>');

    // If we're inside a potency-value strong tag, don't modify
    if (strongOpenBefore > strongCloseBefore && strongCloseAfter !== -1) {
      return match;
    }

    // Convert to uppercase and ensure consistent &lt; encoding and add strong tag
    return `<strong class="potency-value">${char.toUpperCase()}&lt;${number}</strong>`;
  });

  return processed;
}

export {
  processPotencyPatterns
};