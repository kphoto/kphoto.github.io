export const WORDS_PER_MINUTE = 220;

export function readingMinutes(text: string, wordsPerMinute: number = WORDS_PER_MINUTE): number {
  const words = text.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
