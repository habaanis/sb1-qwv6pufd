export function extractMainCategory(category: string | undefined | null): string {
  if (!category || category.trim() === '') return '';

  const cleaned = category.trim();

  const separators = [',', '/', '|', ';', '-'];

  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      const parts = cleaned.split(sep).map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 0) {
        return parts[0];
      }
    }
  }

  return cleaned;
}

export function getAllKeywords(category: string | undefined | null): string[] {
  if (!category || category.trim() === '') return [];

  const cleaned = category.trim();
  const separators = [',', '/', '|', ';', '-'];

  let keywords: string[] = [];

  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      keywords = cleaned.split(sep).map(p => p.trim()).filter(p => p.length > 0);
      break;
    }
  }

  if (keywords.length === 0) {
    keywords = [cleaned];
  }

  return keywords;
}
