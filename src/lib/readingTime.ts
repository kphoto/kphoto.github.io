export const WORDS_PER_MINUTE = 220;

/**
 * Estimates reading time in whole minutes for a piece of text.
 * Injected words-per-minute keeps the function pure and testable.
 */
export function readingMinutes(text: string, wordsPerMinute: number = WORDS_PER_MINUTE): number {
  const words = text.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
