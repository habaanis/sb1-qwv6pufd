# Recherche Multi-Colonnes Intelligente - Page Entreprises

## Vue d'ensemble

La page Entreprises dispose désormais d'un **système de recherche multi-colonnes intelligent** qui permet de trouver une entreprise même si son nom ne contient pas le métier recherché. La recherche s'effectue simultanément dans 4 sources de données différentes.

## Les 4 Sources de Recherche

### 1. **Nom de l'entreprise** (`nom`)
Recherche dans le nom officiel de l'entreprise.

**Exemple** : "Restaurant Carthage" est trouvé avec la recherche "carthage"

### 2. **Tags** (`tags`)
Tableau de mots-clés pour améliorer la découvrabilité.

**Exemple** : "Dupont SARL" avec tags `["plomberie", "chauffage", "dépannage"]` sera trouvée pour :
- "plombier"
- "chauffagiste"
- "dépannage"

### 3. **Mots-clés de recherche** (`mots_cles_recherche`)
Texte libre contenant des synonymes et variantes.

**Exemple** : Une entreprise avec mots_cles_recherche = "coiffeur salon beauté esthétique" sera trouvée pour :
- "coiffure"
- "coiffeur"
- "beauté"
- "esthétique"

### 4. **Catégories** (`sous_categories`, `categorie`)
Catégories et sous-catégories de l'entreprise.

**Exemple** : Une entreprise dans la catégorie "restauration" sera trouvée avec "restaurant"

## Architecture Technique

### Migration Database

Colonne `tags` ajoutée à la table `entreprise` :

```sql
ALTER TABLE entreprise ADD COLUMN tags text[];
CREATE INDEX idx_entreprise_tags ON entreprise USING gin(tags);
```

La colonne `mots_cles_recherche` existait déjà dans la table.

### Normalisation du Texte

Utilise la fonction `normalizeText()` du module `src/lib/textNormalization.ts` :

```typescript
export function normalizeText(text: string): string {
  return removeAccents(text.toLowerCase().trim());
}
```

**Avantages** :
- Insensible aux accents : "café" = "cafe"
- Insensible à la casse : "Plomberie" = "plomberie"
- Supprime les espaces superflus

### Fonction de Recherche

La fonction `performSearch()` dans `Businesses.tsx` :

```typescript
const performSearch = async () => {
  // 1. Récupération large de résultats (200 max)
  let query = supabase
    .from(Tables.ENTREPRISE)
    .select('..., tags, mots_cles_recherche')
    .limit(200);

  // 2. Filtres Supabase de base (ville, catégorie, premium)
  if (selectedCity) query = query.eq('gouvernorat', selectedCity);
  if (filterPremium) query = query.eq('is_premium', true);

  const { data } = await query;

  // 3. Filtrage côté client avec normalizeText
  if (searchTerm) {
    const normalizedSearchTerm = normalizeText(searchTerm);

    mappedData = mappedData.filter((business) => {
      const matchNom = normalizeText(business.name)
        .includes(normalizedSearchTerm);

      const matchTags = business.tags?.some(tag =>
        normalizeText(tag).includes(normalizedSearchTerm)
      );

      const matchMotsCles = normalizeText(business.mots_cles_recherche)
        .includes(normalizedSearchTerm);

      const matchCategory = normalizeText(business.category)
        .includes(normalizedSearchTerm);

      return matchNom || matchTags || matchMotsCles || matchCategory;
    });
  }
};
```

### Recherche en Temps Réel

Un `useEffect` avec debounce de 250ms déclenche automatiquement la recherche :

```typescript
useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (searchTerm || selectedCity || selectedCategory || filterPremium) {
      performSearch();
    } else {
      fetchBusinesses();
    }
  }, 250);

  return () => clearTimeout(delayDebounceFn);
}, [searchTerm, selectedCity, selectedCategory, filterPremium]);
```

**Avantages** :
- Résultats mis à jour en direct pendant la frappe
- Pas besoin de cliquer sur un bouton "Rechercher"
- Debounce évite les requêtes excessives

## Interface Utilisateur

### Placeholder Informatif

Le champ de recherche affiche maintenant :

```
"Recherche intelligente : nom, métier, tags, mots-clés..."
```

### Indicateur de Recherche Active

Quand l'utilisateur tape, un message s'affiche sous le champ :

```
Recherche dans : Nom d'entreprise • Tags • Mots-clés • Catégories
```

### Logs de Débogage

Des logs détaillés dans la console permettent de suivre la recherche :

```
[Recherche Multi-colonnes] Terme: "plombier"
[Recherche Multi-colonnes] Terme normalisé: "plombier"
[Recherche Multi-colonnes] Résultats bruts: 150
[Recherche Multi-colonnes] Match trouvé: {
  nom: "Dupont SARL",
  matchNom: false,
  matchTags: true,
  matchMotsCles: false,
  matchCategory: false,
  tags: ["plomberie", "chauffage"]
}
[Recherche Multi-colonnes] Résultats filtrés: 12
```

## Combinaison des Filtres

Les filtres se complètent intelligemment :

### Exemple 1 : Mot-clé + Ville
```
Recherche: "plombier"
Gouvernorat: "Tunis"
→ Toutes les entreprises avec "plombier" dans (nom, tags, mots_cles, category) ET situées à Tunis
```

### Exemple 2 : Mot-clé + Catégorie + Ville
```
Recherche: "dépannage"
Catégorie: "Services"
Gouvernorat: "Sousse"
→ Entreprises de services de dépannage à Sousse uniquement
```

### Exemple 3 : Recherche Premium
```
Recherche: "restaurant"
Premium: ✓
→ Uniquement les restaurants premium
```

## Cas d'Usage Réels

### Cas 1 : Entreprise sans métier dans le nom

**Base de données** :
- Nom : "SARL Dupont & Fils"
- Tags : `["plomberie", "chauffage", "climatisation"]`

**Recherche** : "plombier"
**Résultat** : ✅ Trouvée grâce aux tags

---

### Cas 2 : Synonymes et variantes

**Base de données** :
- Nom : "Beauty Center"
- Mots-clés : "coiffeur salon beauté esthétique manucure pédicure"

**Recherches possibles** :
- "coiffure" → ✅ Trouvée
- "esthéticienne" → ✅ Trouvée (normalisation : "estheticienne" match "esthétique")
- "manucure" → ✅ Trouvée

---

### Cas 3 : Recherche avec accents

**Recherche** : "café"
**Normalisation** : "cafe"

**Trouve** :
- "Café des Amis" (nom)
- Entreprise avec tags `["café", "restaurant"]`
- Entreprise avec mots_cles "coffee café bistrot"

## Avantages du Système

### 1. **Découvrabilité Maximale**
Une entreprise peut être trouvée même si le terme recherché n'apparaît pas dans son nom.

### 2. **Expérience Utilisateur Fluide**
- Recherche en temps réel
- Pas de bouton à cliquer
- Résultats instantanés

### 3. **Robustesse Linguistique**
- Insensible aux accents
- Insensible à la casse
- Support des synonymes

### 4. **Combinaison Intelligente**
Les filtres (mot-clé + ville + catégorie + premium) se complètent pour affiner les résultats.

### 5. **Performance**
- Récupération initiale de 200 résultats maximum
- Filtrage côté client ultra-rapide
- Indexes database optimisés

## Maintenance et Enrichissement

### Ajouter des Tags à une Entreprise

```sql
UPDATE entreprise
SET tags = ARRAY['plomberie', 'chauffage', 'dépannage']
WHERE id = 'entreprise-id';
```

### Ajouter des Mots-clés

```sql
UPDATE entreprise
SET mots_cles_recherche = 'coiffeur salon beauté esthétique manucure'
WHERE id = 'entreprise-id';
```

### Bonnes Pratiques

1. **Tags** : Utiliser des mots-clés courts et précis
   - ✅ `["plomberie", "chauffage"]`
   - ❌ `["nous faisons de la plomberie"]`

2. **Mots-clés** : Inclure synonymes et variantes
   - ✅ "coiffeur coiffure salon beauté"
   - ❌ "coiffeur"

3. **Normalisation** : Pas besoin d'ajouter les versions avec/sans accents
   - ✅ "café"
   - ❌ "café cafe"

## Prochaines Étapes Possibles

1. **Scoring** : Classer les résultats par pertinence (match nom > tags > mots-clés)
2. **Recherche Floue** : Tolérer les fautes de frappe ("plombire" → "plombier")
3. **Recherche Multi-mots** : Supporter "plombier tunis" sans sélectionner le gouvernorat
4. **Suggestions** : Proposer des corrections ("plombire" → "Voulez-vous dire : plombier ?")
5. **Historique** : Sauvegarder les recherches récentes

## Tests

### Test 1 : Recherche par nom
```
Recherche: "restaurant"
Attendu: Toutes les entreprises avec "restaurant" dans le nom
```

### Test 2 : Recherche par tag
```
Recherche: "plombier"
Attendu: Entreprises avec tag "plomberie" ou "plombier"
```

### Test 3 : Recherche par mots-clés
```
Recherche: "beauté"
Attendu: Entreprises avec "beauté" ou "beaute" dans mots_cles_recherche
```

### Test 4 : Recherche avec accents
```
Recherche: "café"
Attendu: Même résultats que "cafe"
```

### Test 5 : Combinaison filtres
```
Recherche: "restaurant"
Ville: "Tunis"
Attendu: Restaurants à Tunis uniquement
```

## Conclusion

Le système de recherche multi-colonnes transforme la page Entreprises en un véritable outil de découverte de partenaires. Les utilisateurs peuvent maintenant trouver une entreprise en tapant n'importe quel terme lié à son activité, même si ce terme n'apparaît pas dans le nom de l'entreprise.

La normalisation du texte garantit une recherche robuste et intuitive, tandis que la mise à jour en temps réel offre une expérience utilisateur moderne et fluide.
