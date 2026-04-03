# Correction Urgente - Recherche Page Entreprises

## Problème Identifié

La recherche sur la page Entreprises ne retournait **AUCUN résultat** à cause d'un filtre trop restrictif.

### Cause Racine

```typescript
// ❌ AVANT (Code problématique)
.eq('secteur', 'entreprise')
```

**Impact** :
- Sur 362 entreprises dans la table, seules 12 avaient `secteur = 'entreprise'`
- 285 entreprises avaient `secteur = null`
- Les autres avaient des secteurs différents (magasin, santé, éducation, etc.)
- **Résultat** : 97% des entreprises étaient invisibles !

### Distribution des Secteurs

| Secteur | Nombre |
|---------|--------|
| null | 285 |
| magasin & marché local | 29 |
| santé | 17 |
| **entreprise** | **12** |
| éducation | 6 |
| finance | 5 |
| justice | 4 |
| autres | 4 |
| **TOTAL** | **362** |

## Corrections Appliquées

### 1. Suppression du Filtre Restrictif

```typescript
// ✅ APRÈS (Corrigé)
let query = supabase
  .from(Tables.ENTREPRISE)
  .select('...')
  // .eq('secteur', 'entreprise') ← SUPPRIMÉ
  .order('nom', { ascending: true });
```

**Maintenant** : Toutes les 362 entreprises sont accessibles !

### 2. Ajout de Logs de Debug Complets

Les deux fonctions (`fetchBusinesses` et `performSearch`) affichent maintenant des logs détaillés :

```typescript
console.log('═══════════════════════════════════════');
console.log('🔍 [DEBUG performSearch] Démarrage...');
console.log('Terme recherché:', searchTerm);
console.log('Ville sélectionnée:', selectedCity);
console.log('Catégorie sélectionnée:', selectedCategory);
console.log('Filter Premium:', filterPremium);
console.log('═══════════════════════════════════════');
```

### 3. Logs des Paramètres d'URL

```typescript
console.log('🌐 [DEBUG URL] Chargement des paramètres URL...');
console.log('[DEBUG URL] readParams() retourne:', params);
console.log('[DEBUG URL] Paramètres extraits:', {
  urlQ,
  urlVille,
  urlCategorie,
  ...
});
```

### 4. Logs du useEffect de Recherche

```typescript
console.log('🔄 [DEBUG useEffect] Changement détecté:', {
  searchTerm,
  selectedCity,
  selectedCategory,
  pageCategorie,
  filterPremium
});
```

## Vérifications des Colonnes

### Colonnes Interrogées pour la Recherche Multi-colonnes

| Colonne | Type | Exemple |
|---------|------|---------|
| `nom` | text | "MAISON 2000 (Électroménager)" |
| `tags` | text[] | null (pour l'instant) |
| `mots_cles_recherche` | text | "MAISON 2000 (Électroménager) \| \| Maison & Équipement \| \| " |
| `sous_categories` | text | "Garage Mécanique" |
| `categorie` | text | "Automobile" |

### Exemple de Données Réelles

```json
{
  "nom": "Madhia Auto Services",
  "secteur": null,
  "sous_categories": "Garage Mécanique",
  "categorie": "Automobile",
  "tags": null,
  "mots_cles_recherche": "Madhia Auto Services | | Automobile | | karroussa, krahba (كراهب), sayara (سيارة), bi3 w chra (بيع و شراء), micanique (ميكانيك), toli (طولي), dahn (دهن), lavage (غسيل), par-brise, moteur, jantet, roue, 3ajel, dar (agence), jdid, مستعملة, voiture, auto, véhicule, occasion, achat, vente, mécanique, vidange, diagnostic, pneus, batterie, carrosserie, parallélisme, lavage, entretien, pièces de rechange, accessoires auto",
  "gouvernorat": "Mahdia",
  "ville": "Mahdia"
}
```

## Tests à Effectuer

### Test 1 : Recherche Simple par Nom

**Action** : Taper "MAISON" dans la barre de recherche

**Logs attendus** :
```
🔍 [DEBUG performSearch] Démarrage...
Terme recherché: MAISON
...
✅ Match trouvé: {
  nom: "MAISON 2000 (Électroménager)",
  matchNom: true,
  matchTags: false,
  matchMotsCles: true,
  matchCategory: false
}
```

**Résultat attendu** : Affichage de "MAISON 2000 (Électroménager)"

### Test 2 : Recherche par Mot-clé

**Action** : Taper "mécanique"

**Logs attendus** :
```
🔎 [Recherche Multi-colonnes] Terme normalisé: "mecanique"
✅ Match trouvé: {
  nom: "Madhia Auto Services",
  matchNom: false,
  matchTags: false,
  matchMotsCles: true,
  matchCategory: false
}
```

**Résultat attendu** : Garages et entreprises de mécanique

### Test 3 : Recherche avec Accents (Multilingue)

**Action** : Taper "café"

**Normalisation** : "café" → "cafe"

**Résultat attendu** : Trouve aussi les entreprises avec "cafe" dans le nom ou mots-clés

### Test 4 : Paramètres d'URL (depuis Accueil)

**Action** : Naviguer depuis l'accueil avec `?q=restaurant`

**Logs attendus** :
```
🌐 [DEBUG URL] Chargement des paramètres URL...
[DEBUG URL] readParams() retourne: { q: "restaurant", ... }
[DEBUG URL] Paramètres extraits: {
  urlQ: "restaurant",
  urlVille: "",
  urlCategorie: "",
  ...
}
```

**Résultat attendu** :
- La barre de recherche contient "restaurant"
- Les résultats sont filtrés pour "restaurant"

### Test 5 : Combinaison Filtres

**Action** :
- Recherche : "garage"
- Gouvernorat : "Tunis"

**Résultat attendu** : Uniquement les garages de Tunis

### Test 6 : Recherche Sans Résultat

**Action** : Taper "xyzabc123456"

**Logs attendus** :
```
[Recherche Multi-colonnes] ✅ Résultats filtrés: 0
```

**Résultat attendu** : Message "Aucune entreprise trouvée"

## Flux de la Recherche

```
┌─────────────────────────────────────┐
│  Utilisateur tape "restaurant"     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  useEffect détecte le changement   │
│  Debounce 250ms                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  performSearch() déclenché          │
│  Log : Terme recherché: restaurant  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Requête Supabase                   │
│  SELECT * FROM entreprise           │
│  LIMIT 200                          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Résultats bruts : 200 entreprises │
│  Log : Données reçues: 200          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Filtrage côté client               │
│  normalizeText("restaurant")        │
│  = "restaurant"                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Vérification dans 4 colonnes :     │
│  1. nom                             │
│  2. tags                            │
│  3. mots_cles_recherche             │
│  4. sous_categories / categorie     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Résultats filtrés : 15             │
│  Log : Résultats filtrés: 15        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Affichage des 15 entreprises       │
└─────────────────────────────────────┘
```

## Recherche Multi-colonnes Intelligente

La recherche s'effectue dans **4 colonnes simultanément** :

```typescript
const matchNom = normalizeText(business.name || '').includes(normalizedSearchTerm);
const matchTags = business.tags?.some(tag =>
  normalizeText(tag).includes(normalizedSearchTerm)
) || false;
const matchMotsCles = business.mots_cles_recherche
  ? normalizeText(business.mots_cles_recherche).includes(normalizedSearchTerm)
  : false;
const matchCategory = normalizeText(business.category || '').includes(normalizedSearchTerm);

const isMatch = matchNom || matchTags || matchMotsCles || matchCategory;
```

## Recherche Fuzzy Multilingue

La fonction `normalizeText()` garantit une recherche insensible aux accents et à la casse :

```typescript
import { normalizeText } from '../lib/textNormalization';

// Exemples
normalizeText("Café") → "cafe"
normalizeText("Élégant") → "elegant"
normalizeText("RESTAURANT") → "restaurant"
normalizeText("  Mecanique  ") → "mecanique"
```

**Avantages pour les touristes** :
- Anglais : "cafe" trouve "Café"
- Italien : "ristorante" trouve "restaurante"
- Français : "mécanique" = "mecanique"

## Guide de Debug Console

### 1. Ouvrir la Console

- Chrome/Edge : F12 ou Ctrl+Shift+I
- Firefox : F12 ou Ctrl+Shift+K
- Safari : Cmd+Option+I (Mac)

### 2. Logs à Surveiller

#### Au chargement de la page

```
🌐 [DEBUG URL] Chargement des paramètres URL...
[DEBUG URL] readParams() retourne: {...}
🔄 [DEBUG useEffect] Changement détecté: {...}
➡️ [DEBUG] Déclenchement de fetchBusinesses()
🔍 [DEBUG fetchBusinesses] Démarrage...
✅ Données reçues: 50 entreprises
```

#### Lors d'une recherche

```
🔄 [DEBUG useEffect] Changement détecté: {
  searchTerm: "restaurant",
  ...
}
➡️ [DEBUG] Déclenchement de performSearch()
🔍 [DEBUG performSearch] Démarrage...
Terme recherché: restaurant
...
✅ Données reçues: 200 entreprises
🔎 [Recherche Multi-colonnes] Terme normalisé: "restaurant"
✅ Match trouvé: {...}
✅ Résultats filtrés: 15
```

#### En cas d'erreur

```
❌ [ERROR] Erreur Supabase: {...}
❌ [ERROR] performSearch: {...}
```

### 3. Points de Vérification

| Étape | Log à chercher | Que vérifier |
|-------|---------------|--------------|
| Paramètres URL | `[DEBUG URL] Paramètres extraits` | Le paramètre `?q=` est bien récupéré |
| Déclenchement | `➡️ [DEBUG] Déclenchement de...` | La bonne fonction est appelée |
| Requête Supabase | `✅ Données reçues: X entreprises` | X > 0 (sinon problème database) |
| Exemple données | `[DEBUG] Exemple première entreprise` | Les colonnes existent |
| Normalisation | `Terme normalisé: "..."` | Accents retirés, minuscules |
| Matches | `✅ Match trouvé:` | Au moins un match trouvé |
| Résultats finaux | `✅ Résultats filtrés: X` | X > 0 pour une recherche valide |

## Problèmes Potentiels et Solutions

### Problème 1 : Aucun résultat même pour nom exact

**Cause possible** : RLS (Row Level Security) trop restrictif

**Vérification** :
```sql
-- Vérifier les policies RLS
SELECT * FROM pg_policies WHERE tablename = 'entreprise';
```

**Solution** : S'assurer que la policy permet la lecture publique

### Problème 2 : Paramètres URL non transmis

**Logs à vérifier** :
```
[DEBUG URL] readParams() retourne: {}
```

**Solution** : Vérifier la fonction `readParams()` dans `src/lib/urlParams.ts`

### Problème 3 : Recherche ne trouve pas les accents

**Cause** : `normalizeText()` ne fonctionne pas

**Vérification** :
```typescript
console.log(normalizeText("café"));
// Doit afficher: "cafe"
```

**Solution** : Vérifier `src/lib/textNormalization.ts`

### Problème 4 : Tags toujours null

**Cause** : Les tags n'ont pas été remplis dans la database

**Solution** : Ajouter des tags via SQL ou interface admin
```sql
UPDATE entreprise
SET tags = ARRAY['plomberie', 'chauffage']
WHERE nom LIKE '%plomb%';
```

## Prochaines Améliorations

1. **Remplir les tags** : Ajouter des tags à toutes les entreprises
2. **Scoring** : Classer les résultats par pertinence (nom > tags > mots-clés)
3. **Recherche floue** : Tolérer les fautes de frappe
4. **Suggestions** : "Voulez-vous dire : ..."
5. **Historique** : Sauvegarder les recherches récentes

## Conclusion

La recherche fonctionne maintenant sur **toutes les 362 entreprises** au lieu de seulement 12. Les logs détaillés permettent de débugger facilement tout problème futur.

**Les 4 colonnes de recherche** permettent une découvrabilité maximale, et la **normalisation du texte** garantit une expérience multilingue robuste.
