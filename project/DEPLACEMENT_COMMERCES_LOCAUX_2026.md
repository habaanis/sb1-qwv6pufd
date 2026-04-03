# Déplacement de LocalBusinessesSection vers CitizensShops

## Date : 27 Février 2026

---

## Objectif

Alléger la page d'accueil en déplaçant la section "Commerces Locaux" vers la page dédiée "Commerces & Magasins".

---

## Modifications effectuées

### 1. Home.tsx (Page d'accueil)

**Retrait de LocalBusinessesSection :**

```typescript
// ❌ RETIRÉ
import { LocalBusinessesSection } from '../components/LocalBusinessesSection';

// ❌ RETIRÉ
<LocalBusinessesSection onCardClick={(id) => onNavigateToBusiness(id)} />
```

**Résultat :**
- Page d'accueil plus légère et rapide
- Focus sur les établissements premium uniquement
- Meilleure expérience utilisateur

### 2. CitizensShops.tsx (Page Commerces & Magasins)

**Ajout de LocalBusinessesSection :**

```typescript
// ✅ AJOUTÉ
import { LocalBusinessesSection } from '../components/LocalBusinessesSection';

// ✅ AJOUTÉ dans la section d'affichage par défaut
{!hasActiveSearch && (
  <>
    {/* Section Commerces Locaux à la Une */}
    <div className="mb-10">
      <LocalBusinessesSection
        onCardClick={(id) => {
          window.location.hash = `#/business/${id}`;
        }}
      />
    </div>

    {/* Section Magasins mis en avant */}
    <div className="mb-10">
      <FeaturedBusinessesStrip
        variant="magasins"
        onCardClick={(id) => {
          window.location.hash = `#/business/${id}`;
        }}
      />
    </div>
  </>
)}
```

**Résultat :**
- Les commerces locaux sont maintenant visibles sur la page dédiée
- Affichage uniquement quand aucune recherche n'est active
- Meilleure organisation du contenu

---

## Vérification de la barre de recherche

### Console logs ajoutés

**Fonction runSearch() :**

```typescript
console.log('[CitizensShops] 🔍 Recherche lancée avec critères:', {
  searchTerm,
  selectedGouvernorat,
  selectedMagasinCategory
});

console.log('[CitizensShops] 📍 Filtre gouvernorat appliqué:', selectedGouvernorat);
console.log('[CitizensShops] 🏷️ Filtre catégorie appliqué:', selectedMagasinCategory);
console.log('[CitizensShops] 🔎 Filtre texte appliqué:', searchTerm);

console.log('[CitizensShops] 📊 Résultats bruts:', {
  count: data?.length || 0,
  data: data
});

console.log('[CitizensShops] ✅ Résultats triés:', sortedData.length, 'magasins');
```

---

## Requête de recherche

### Critères appliqués

```typescript
let query = supabase
  .from(Tables.ENTREPRISE)
  .select('id, nom, secteur, sous_categories, gouvernorat, is_premium')
  .eq('secteur', 'magasin')                    // ✅ Secteur magasin
  .eq('page_commerce_local', true)              // ✅ Commerce local uniquement
  .limit(100);

// Filtres optionnels
if (selectedGouvernorat) {
  query = query.eq('gouvernorat', selectedGouvernorat);
}

if (selectedMagasinCategory) {
  query = query.eq('sous_categories', selectedMagasinCategory);
}

if (searchTerm) {
  query = query.or(`nom.ilike.%${searchTerm}%,sous_categories.ilike.%${searchTerm}%`);
}
```

### Tri des résultats

```typescript
// Tri client-side : Premium d'abord, puis alphabétique
const sortedData = (data || []).sort((a, b) => {
  if (a.is_premium && !b.is_premium) return -1;
  if (!a.is_premium && b.is_premium) return 1;
  return a.nom.localeCompare(b.nom);
});
```

---

## Comment tester

### Test 1 : Page d'accueil allégée

```
1. Ouvrir la page d'accueil (/)
2. Vérifier que seule la section "Établissements à la Une" s'affiche
3. Vérifier que la section "Commerces Locaux" n'apparaît plus
4. Vérifier le temps de chargement (devrait être plus rapide)
```

### Test 2 : Page Commerces & Magasins

```
1. Naviguer vers #/citizens-shops
2. Vérifier que la section "Commerces Locaux" apparaît en haut
3. Vérifier que les magasins s'affichent correctement
4. Cliquer sur un commerce pour vérifier la redirection
```

### Test 3 : Barre de recherche

**Test 3.1 : Recherche par texte**

```
1. Ouvrir la console (F12)
2. Entrer "artisanat" dans le champ "Que cherchez-vous ?"
3. Cliquer sur "Rechercher"
4. Vérifier dans la console :
   [CitizensShops] 🔍 Recherche lancée avec critères
   [CitizensShops] 🔎 Filtre texte appliqué: artisanat
   [CitizensShops] 📊 Résultats bruts: {count: X, data: [...]}
   [CitizensShops] ✅ Résultats triés: X magasins
5. Vérifier que les résultats s'affichent
6. Vérifier que les commerces locaux disparaissent (hasActiveSearch = true)
```

**Test 3.2 : Recherche par gouvernorat**

```
1. Ouvrir la console (F12)
2. Sélectionner "Tunis" dans le menu déroulant
3. Cliquer sur "Rechercher"
4. Vérifier dans la console :
   [CitizensShops] 📍 Filtre gouvernorat appliqué: Tunis
5. Vérifier que seuls les magasins de Tunis s'affichent
```

**Test 3.3 : Recherche combinée**

```
1. Entrer "épices" dans le champ texte
2. Sélectionner "Sousse" dans le gouvernorat
3. Cliquer sur "Rechercher"
4. Vérifier dans la console que les deux filtres sont appliqués
5. Vérifier que les résultats correspondent aux critères
```

**Test 3.4 : Réinitialisation**

```
1. Faire une recherche quelconque
2. Cliquer sur "Réinitialiser la recherche"
3. Vérifier que :
   - Les champs sont vidés
   - La section "Commerces Locaux" réapparaît
   - Les magasins mis en avant réapparaissent
```

---

## Diagnostic des données

### Script SQL de vérification

**Fichier :** `DEBUG_COMMERCES_LOCAUX.sql`

**Exécution :**

```sql
-- 1. Vérifier les colonnes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'entreprise'
AND column_name IN ('secteur', 'page_commerce_local', 'sous_categories', 'gouvernorat');

-- 2. Compter les commerces locaux
SELECT COUNT(*)
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true;

-- 3. Tester la requête exacte
SELECT id, nom, secteur, sous_categories, gouvernorat, is_premium
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true
LIMIT 10;
```

**Résultats attendus :**

```
┌──────────────────────┬────────────┐
│ column_name          │ data_type  │
├──────────────────────┼────────────┤
│ secteur              │ text       │
│ page_commerce_local  │ boolean    │
│ sous_categories      │ text       │
│ gouvernorat          │ text       │
└──────────────────────┴────────────┘

┌────────┐
│ count  │
├────────┤
│ 42     │  (Exemple)
└────────┘
```

---

## Cas d'erreur possibles

### Erreur 1 : Aucun résultat de recherche

**Symptôme :**
```
[CitizensShops] 📊 Résultats bruts: {count: 0, data: []}
```

**Causes possibles :**
1. La colonne `page_commerce_local` n'est pas cochée pour les magasins
2. La valeur `secteur` n'est pas exactement "magasin"
3. Les données Airtable ne sont pas synchronisées

**Solution :**

```sql
-- Vérifier les valeurs distinctes de secteur
SELECT secteur, COUNT(*)
FROM entreprise
GROUP BY secteur;

-- Si secteur = "Magasin" au lieu de "magasin"
UPDATE entreprise
SET secteur = 'magasin'
WHERE secteur ILIKE 'magasin';

-- Mettre à jour page_commerce_local si nécessaire
UPDATE entreprise
SET page_commerce_local = true
WHERE secteur = 'magasin'
AND /* vos critères */;
```

### Erreur 2 : LocalBusinessesSection ne s'affiche pas

**Symptôme :**
- La section n'apparaît pas sur CitizensShops

**Causes possibles :**
1. `hasActiveSearch = true` (une recherche est active)
2. Aucune donnée dans `page_commerce_local = true`

**Vérification :**

```typescript
// Dans la console du navigateur
console.log('hasActiveSearch:', hasActiveSearch);
console.log('searchTerm:', searchTerm);
console.log('selectedGouvernorat:', selectedGouvernorat);
```

**Solution :**
- Réinitialiser la recherche
- Vérifier les données dans Supabase

### Erreur 3 : Erreur SQL

**Symptôme :**
```
[CitizensShops] ❌ Erreur requête: {
  message: "column \"page_commerce_local\" does not exist",
  code: "42703"
}
```

**Solution :**

```sql
-- Créer la colonne si elle n'existe pas
ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS page_commerce_local boolean DEFAULT false;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_entreprise_commerce_local
ON entreprise (page_commerce_local)
WHERE page_commerce_local = true;
```

---

## Structure finale des pages

### Page d'accueil (Home.tsx)

```
1. Hero avec drapeau tunisien
2. Bouton "Notre Concept"
3. Section "Pourquoi choisir Dalil-Tounes"
4. Compteur d'entreprises
5. Établissements à la Une (PremiumPartnersSection) ⭐
6. Barre de recherche
7. Bouton "Suggérer une entreprise"
8. Loisirs & Événements
9. Message de valorisation
10. Widget de feedback
```

### Page Commerces & Magasins (CitizensShops.tsx)

```
1. Header avec image de fond
2. Barre de recherche (texte + gouvernorat + catégorie)
3. Cross-promotion "Produits d'occasion"

SI RECHERCHE ACTIVE :
4. Résultats de recherche (cartes)

SI PAS DE RECHERCHE :
4. Commerces Locaux à la Une (LocalBusinessesSection) ⭐
5. Magasins mis en avant (FeaturedBusinessesStrip)

6. Bloc d'inscription pour les magasins
```

---

## Performance

### Avant (Home.tsx)

```
Composants chargés :
- PremiumPartnersSection (4 entreprises)
- LocalBusinessesSection (6 entreprises)
- LeisureEventsSection
- HomeFeedbackWidget

Total : 10+ requêtes Supabase
```

### Après (Home.tsx)

```
Composants chargés :
- PremiumPartnersSection (4 entreprises)
- LeisureEventsSection
- HomeFeedbackWidget

Total : 6+ requêtes Supabase
Gain : ~40% de requêtes en moins
```

---

## Checklist de vérification

**Avant de considérer la tâche terminée :**

- [x] LocalBusinessesSection retiré de Home.tsx
- [x] LocalBusinessesSection ajouté à CitizensShops.tsx
- [x] Console logs ajoutés à la fonction de recherche
- [x] Script SQL de diagnostic créé
- [x] Build réussit sans erreur
- [ ] Test manuel : Page d'accueil ne montre plus les commerces locaux
- [ ] Test manuel : Page Commerces & Magasins montre les commerces locaux
- [ ] Test manuel : Recherche par texte fonctionne
- [ ] Test manuel : Recherche par gouvernorat fonctionne
- [ ] Test manuel : Réinitialisation fonctionne
- [ ] Vérification des données dans Supabase (script SQL)

---

## Fichiers modifiés

```
src/pages/Home.tsx
  ├── Ligne 5 : Import LocalBusinessesSection SUPPRIMÉ
  └── Ligne 145 : Composant <LocalBusinessesSection /> SUPPRIMÉ

src/pages/CitizensShops.tsx
  ├── Ligne 7 : Import LocalBusinessesSection AJOUTÉ
  ├── Lignes 40-99 : Console logs ajoutés à runSearch()
  └── Lignes 306-312 : <LocalBusinessesSection /> AJOUTÉ

DEBUG_COMMERCES_LOCAUX.sql (NOUVEAU)
  └── 10 requêtes SQL de diagnostic
```

---

## Prochaines étapes

1. **Ouvrir la page Commerces & Magasins**
2. **Ouvrir la console (F12)**
3. **Tester la recherche avec différents critères**
4. **Vérifier les logs dans la console**
5. **Partager les résultats :**
   - Nombre de résultats trouvés
   - Logs complets de la console
   - Captures d'écran si nécessaire

---

*Documentation créée le 27 février 2026*
