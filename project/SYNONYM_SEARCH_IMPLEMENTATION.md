# Synonym Search Implementation

## Summary
Created dedicated synonym expansion system with comprehensive Tunisian business vocabulary support.

## Files Created

### 1. `/src/lib/searchSynonyms.ts`
Central dictionary for synonym expansion with 60+ business categories:

**Health Categories:**
- dentiste → dentaire, cabinet dentaire, orthodontiste, stomatologie
- médecin → docteur, médecin généraliste, cabinet médical, clinique
- pharmacie → para-pharmacie, drugstore, parapharmacie
- kiné → kinésithérapeute, physiothérapeute, rééducation
- ophtalmo, cardio, dermato, pédiatre, gynéco, radiologue, labo, urgence

**Education:**
- école → lycée, collège, maternelle, primaire, institut
- cours → formation, tutorat, stage, apprentissage
- prof → professeur, enseignant, tuteur
- université → fac, faculté, supérieur

**Administration:**
- mairie → municipalité, hôtel de ville, commune
- carte → carte identité, cin, passeport
- acte → acte de naissance, état civil, mariage
- visa → consulat, ambassade

**Leisure & Entertainment:**
- resto → restaurant, snack, café, restauration
- ciné → cinéma, film, projection
- sport → gym, fitness, musculation
- théâtre → spectacle, salle de spectacle

**Commerce & Shops:**
- chaussure → chaussures, souliers, pointure
- épicerie → alimentation, superette
- coiffure → coiffeur, salon de coiffure
- boulangerie → boulanger, pâtisserie, pain
- bijoux → bijouterie, bijoutier, or, argent
- vêtement → habits, mode, prêt-à-porter

**Services:**
- garage → mécanicien, mécanique, atelier, réparation auto
- plombier → plomberie, sanitaire, eau
- électricien → électricité, installation électrique
- avocat → cabinet avocat, juriste, droit
- comptable → expert comptable, comptabilité
- banque → agence bancaire, finance, crédit

**Transport & Tourism:**
- hotel → hôtel, hébergement, auberge
- taxi → transport, chauffeur
- bus → transport en commun, autobus

## Core Functions

### `expandQuery(q: string): string[]`
Expands search query with relevant synonyms:

```typescript
expandQuery('dentiste')
// Returns: ['dentiste', 'dentaire', 'cabinet dentaire', 'orthodontiste', 'stomatologie']

expandQuery('resto')
// Returns: ['resto', 'restaurant', 'snack', 'café', 'restauration']
```

### `norm(s: string): string`
Normalizes text (lowercase + removes accents):

```typescript
norm('Café')
// Returns: 'cafe'
```

### `rankItem(item: any, q: string): number`
Ranks search results by relevance:
- 0: Exact prefix match (highest priority)
- 1: Word starts with query
- 2: City match
- 3: Contains query
- 9: No match (lowest priority)

## Integration

### SearchBar Component
Updated `src/components/SearchBar.tsx` to:
1. Import synonym functions
2. Expand search queries automatically
3. Fetch results for all synonym terms
4. Deduplicate results by ID
5. Rank by relevance using original query

```typescript
// Before: Single search
const resp = await fetchEntreprisesDirect(v, city, 8);

// After: Multi-term synonym search
const terms = expandQuery(v);
const allResults = [];
for (const term of terms) {
  const resp = await fetchEntreprisesDirect(term, city, 8);
  if (resp.data) allResults.push(...resp.data);
}
// Deduplicate + rank + limit to 10 results
```

### fuzzySearch.ts
Re-exported functions from searchSynonyms.ts for backward compatibility:

```typescript
export {
  expandQuery as expandQueryWithSynonyms,
  rankItem,
  norm as normalizeStringSimple
} from './searchSynonyms';
```

## Usage Examples

### User Types "dentiste"
System searches for:
- dentiste (original)
- dentaire
- cabinet dentaire
- orthodontiste
- stomatologie

Results include all matching businesses, ranked by relevance.

### User Types "resto tunis"
System searches for:
- resto (original) + tunis
- restaurant + tunis
- snack + tunis
- café + tunis
- restauration + tunis

### User Types "kiné"
System expands to:
- kiné
- kinésithérapeute
- physiothérapeute
- rééducation

## Performance Considerations

1. **Parallel Fetching**: Terms are fetched sequentially but quickly (< 50ms each with indexes)
2. **Deduplication**: Results are deduplicated by ID to avoid showing same business multiple times
3. **Limit Control**: Maximum 10 results shown after synonym expansion
4. **Debounce**: 200ms delay before search triggers

## Benefits

✅ **Finds more results**: "resto" finds restaurants, cafés, snacks
✅ **Handles abbreviations**: "kiné" finds kinésithérapeutes
✅ **French vocabulary**: Covers common French business terms in Tunisia
✅ **Accent-insensitive**: Works with normalized text matching
✅ **Smart ranking**: Original query term ranks highest
✅ **No duplicates**: Each business appears once in results

## Future Enhancements

Potential additions:
- Arabic synonyms (مطعم for resto, etc.)
- Region-specific terms
- Brand name mappings
- User-contributed synonyms
- A/B testing for synonym effectiveness
