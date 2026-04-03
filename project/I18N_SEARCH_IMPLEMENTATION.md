# I18n Search Keys Implementation

## Summary
Added multilingual search interface translations to support 5 languages: French, English, Arabic, Italian, and Russian.

## Changes to i18n.ts

### New Search Section
Added `search` key to all language objects with the following fields:

```typescript
search: {
  placeholderQuery: string;   // Main search input placeholder
  placeholderCity: string;     // City filter input placeholder
  seeAll: string;              // "See all results" button text
  resultsTitle: string;        // Results section title
  noResults: string;           // No results message
}
```

### Language-Specific Translations

#### French (fr)
```typescript
search: {
  placeholderQuery: '🔍 Que cherchez-vous ?',
  placeholderCity: '📍 Où êtes-vous ?',
  seeAll: '➡️ Voir tous les résultats',
  resultsTitle: 'Résultats',
  noResults: 'Aucun résultat.',
}
```

#### English (en)
```typescript
search: {
  placeholderQuery: '🔍 What are you looking for?',
  placeholderCity: '📍 Where are you?',
  seeAll: '➡️ See all results',
  resultsTitle: 'Results',
  noResults: 'No results.',
}
```

#### Arabic (ar)
```typescript
search: {
  placeholderQuery: '🔍 ماذا تبحث؟',
  placeholderCity: '📍 أين أنت؟',
  seeAll: '➡️ عرض كل النتائج',
  resultsTitle: 'النتائج',
  noResults: 'لا توجد نتائج.',
}
```

#### Italian (it)
```typescript
search: {
  placeholderQuery: '🔍 Cosa stai cercando?',
  placeholderCity: '📍 Dove sei?',
  seeAll: '➡️ Vedi tutti i risultati',
  resultsTitle: 'Risultati',
  noResults: 'Nessun risultato.',
}
```

#### Russian (ru)
```typescript
search: {
  placeholderQuery: '🔍 Что вы ищете?',
  placeholderCity: '📍 Где вы находитесь?',
  seeAll: '➡️ Показать все результаты',
  resultsTitle: 'Результаты',
  noResults: 'Нет результатов.',
}
```

## Helper Functions Added

### Type Definition
```typescript
export type Lang = 'fr' | 'ar' | 'en' | 'it' | 'ru';
```

### RTL Language Detection
```typescript
export const RTL_LANGS: Record<Lang, boolean> = {
  fr: false,
  en: false,
  it: false,
  ru: false,
  ar: true,
};

export function isRTL(lang: Lang): boolean {
  return RTL_LANGS[lang] === true;
}
```

### Translation Function
```typescript
export function t(lang: Lang, path: string, fallback?: string): string {
  const segs = path.split('.');
  let cur: any = translations[lang] || translations.fr;
  for (const s of segs) {
    cur = cur?.[s];
  }
  return (cur ?? fallback ?? path);
}
```

### Dictionary Export
```typescript
export const i18nDict = translations;
```

## Usage Examples

### Basic Translation
```typescript
import { t } from '@/lib/i18n';

// Get French translation
const placeholder = t('fr', 'search.placeholderQuery');
// Returns: '🔍 Que cherchez-vous ?'

// Get Arabic translation
const placeholderAr = t('ar', 'search.placeholderQuery');
// Returns: '🔍 ماذا تبحث؟'
```

### With Fallback
```typescript
import { t } from '@/lib/i18n';

// If key doesn't exist, return fallback
const text = t('fr', 'search.nonExistent', 'Default Text');
// Returns: 'Default Text'
```

### RTL Detection
```typescript
import { isRTL } from '@/lib/i18n';

const shouldReverseLayout = isRTL('ar');  // true
const shouldReverseLayout2 = isRTL('fr'); // false
```

### In React Components
```typescript
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';

function SearchBar() {
  const { language } = useLanguage();

  return (
    <input
      placeholder={t(language, 'search.placeholderQuery')}
      dir={isRTL(language) ? 'rtl' : 'ltr'}
    />
  );
}
```

## Integration with Existing System

The i18n system already exists and uses a `LanguageContext` with `useTranslation()` hook. The new functions are complementary:

### Existing System
```typescript
const { t } = useTranslation();
t('citizens.search.placeholderKeyword');
```

### New Simplified API
```typescript
import { t } from '@/lib/i18n';
t('fr', 'search.placeholderQuery');
```

Both approaches work. The new API is more explicit about the language and useful for server-side rendering or non-React contexts.

## Location in File Structure

All translations added at line positions:
- French (fr): Line 182-188
- English (en): Line 687-693
- Arabic (ar): Line 1192-1198
- Italian (it): Line 1687-1693
- Russian (ru): Line 2182-2188

Helper functions added at end of file (Line 2685-2708).

## Benefits

1. **Consistent Interface**: Same search UI text across all supported languages
2. **RTL Support**: Proper Arabic text direction handling
3. **Fallback System**: Graceful degradation if translation missing
4. **Type Safety**: TypeScript types for language codes
5. **Emoji Support**: Visual icons work across all languages
6. **Extensible**: Easy to add more languages or keys

## Testing

Build successful with no TypeScript errors. All 5 languages supported:
- ✅ French (default)
- ✅ English
- ✅ Arabic (RTL)
- ✅ Italian
- ✅ Russian
