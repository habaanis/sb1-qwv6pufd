export function calculateLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function fuzzyMatch(query: string, target: string, threshold: number = 0.6): boolean {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);

  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  const distance = calculateLevenshteinDistance(normalizedQuery, normalizedTarget);
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold;
}

export function fuzzyScore(query: string, target: string): number {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);

  if (normalizedTarget.includes(normalizedQuery)) {
    return 1.0;
  }

  if (normalizedTarget.startsWith(normalizedQuery)) {
    return 0.9;
  }

  const words = normalizedTarget.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(normalizedQuery)) {
      return 0.8;
    }
  }

  const distance = calculateLevenshteinDistance(normalizedQuery, normalizedTarget);
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length);
  const similarity = 1 - distance / maxLength;

  return similarity;
}

export function sortByFuzzyRelevance<T>(
  items: T[],
  query: string,
  getField: (item: T) => string
): T[] {
  return items
    .map(item => ({
      item,
      score: fuzzyScore(query, getField(item))
    }))
    .filter(({ score }) => score > 0.4)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

export { expandQuery as expandQueryWithSynonyms, rankItem, stripAccents, norm } from './searchSynonyms';
