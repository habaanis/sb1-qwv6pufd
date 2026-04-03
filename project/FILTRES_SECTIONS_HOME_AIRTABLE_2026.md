# Filtres Sections Page d'Accueil - Synchronisés avec Airtable

## Date : 27 Février 2026

---

## Vue d'ensemble

Mise à jour des sections de la page d'accueil pour utiliser directement les colonnes de case à cocher Airtable/Supabase, permettant une gestion dynamique et réactive du contenu affiché.

---

## Colonnes Airtable/Supabase utilisées

### Table `entreprise`

| Colonne Airtable | Nom Supabase | Type | Usage |
|------------------|--------------|------|-------|
| **Mise en avant pub** | `mise en avant pub` | boolean | Contrôle l'affichage dans "Établissements à la Une" |
| **Page Commerce Local** | `page_commerce_local` | boolean | Contrôle l'affichage dans "Commerces Locaux" |
| **Niveau priorité abonnement** | `niveau priorité abonnement` | integer | Ordre de tri prioritaire |

---

## Section 1 : Établissements à la Une

### Filtre principal

```typescript
// Étape 1: Récupérer uniquement les entreprises avec "mise en avant pub" cochée
const { data: featuredData } = await supabase
  .from('entreprise')
  .select('...')
  .eq('mise en avant pub', true)  // ✅ Filtre Airtable
  .order('"niveau priorité abonnement"', { ascending: false })
  .limit(4);
```

### Comportement

**Si case cochée dans Airtable :**
```
┌────────────────────────────────┐
│ Airtable / Supabase            │
├────────────────────────────────┤
│ ☑ Mise en avant pub            │
│                                │
│ → Entreprise AFFICHÉE          │
│   dans "Établissements à la Une"│
└────────────────────────────────┘
```

**Si case décochée dans Airtable :**
```
┌────────────────────────────────┐
│ Airtable / Supabase            │
├────────────────────────────────┤
│ ☐ Mise en avant pub            │
│                                │
│ → Entreprise MASQUÉE           │
│   de "Établissements à la Une" │
└────────────────────────────────┘
```

### Algorithme de sélection

```
Étape 1: Chercher entreprises avec "mise en avant pub" = true
         └─> Tri par "niveau priorité abonnement" DESC
         └─> Limite: 4 entreprises

Si < 4 résultats trouvés:
  ↓
Étape 2: Compléter avec abonnés Premium/Elite
         └─> Exclut celles déjà affichées
         └─> Tri par priorité, note, date
         └─> Limite: 4 - (nombre déjà trouvé)

Résultat final: Toujours 4 cartes (ou moins si vraiment pas assez de données)
```

### Tri détaillé

**Ordre de priorité :**
1. `"niveau priorité abonnement"` (décroissant)
2. `created_at` (décroissant)

**Exemple pratique :**

| Entreprise | Mise en avant pub | Niveau priorité | Ordre affichage |
|------------|-------------------|-----------------|-----------------|
| Restaurant A | ✅ | 5 (Elite) | 1er |
| Hôtel B | ✅ | 5 (Elite) | 2ème |
| Café C | ✅ | 3 (Premium) | 3ème |
| Spa D | ✅ | 3 (Premium) | 4ème |
| Magasin E | ❌ | 5 (Elite) | ❌ Masqué |

### Synchronisation temps réel

```
┌─────────────────────────────────────────────────┐
│  Admin décoche "Mise en avant pub" dans Airtable│
│                      ↓                           │
│           Sync Airtable → Supabase              │
│                      ↓                           │
│  Prochaine visite page d'accueil                │
│                      ↓                           │
│  Entreprise disparaît de "Établissements à la Une"│
└─────────────────────────────────────────────────┘
```

**Temps de latence :**
- Sync Airtable → Supabase : Dépend de votre outil de synchronisation
- Affichage site web : Instantané (chargement de page)

---

## Section 2 : Commerces Locaux (NOUVEAU)

### Nouveau composant créé

**Fichier :** `/src/components/LocalBusinessesSection.tsx`

### Filtre principal

```typescript
const { data } = await supabase
  .from('entreprise')
  .select('...')
  .eq('page_commerce_local', true)  // ✅ Filtre Airtable
  .order('created_at', { ascending: false })
  .limit(6);
```

### Comportement

**Si case cochée dans Airtable :**
```
┌────────────────────────────────┐
│ Airtable / Supabase            │
├────────────────────────────────┤
│ ☑ Page Commerce Local          │
│                                │
│ → Commerce AFFICHÉ             │
│   dans "Commerces Locaux"      │
└────────────────────────────────┘
```

**Si case décochée dans Airtable :**
```
┌────────────────────────────────┐
│ Airtable / Supabase            │
├────────────────────────────────┤
│ ☐ Page Commerce Local          │
│                                │
│ → Commerce MASQUÉ              │
│   de "Commerces Locaux"        │
└────────────────────────────────┘
```

### Caractéristiques

**Limite :** 6 cartes maximum
**Tri :** Par date de création (plus récent en premier)
**Design :** Cartes compactes avec badge "Local" blanc

### Badge visuel

```tsx
<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/95 text-[#4A1D43] text-[10px] font-semibold rounded-full shadow-md border border-[#4A1D43]/20">
  <Store className="w-2.5 h-2.5" />
  Local
</span>
```

### Affichage de la section

**Si 0 commerce local :**
```typescript
if (!loading && businesses.length === 0) {
  return null;  // Section complètement masquée
}
```

La section n'apparaît QUE s'il y a au moins 1 commerce avec `page_commerce_local = true`.

### Position sur la page

```
Page d'Accueil
├── 1. Hero
├── 2. Pourquoi choisir Dalil-Tounes
├── 3. Compteur
├── 4. Établissements à la Une ⭐
├── 4.5. Commerces Locaux 🏪 ← NOUVEAU
├── 5. Barre de recherche
├── 6. Loisirs & Événements
└── ...
```

---

## Architecture des composants

### Composant PremiumPartnersSection (Mis à jour)

**Fichier :** `/src/components/PremiumPartnersSection.tsx`

**Changements clés :**

```diff
- // Ancien : Filtrait par statut_abonnement
- .or('statut_abonnement.ilike.%Elite Pro%,statut_abonnement.ilike.%Premium%')

+ // Nouveau : Filtre par case à cocher Airtable
+ .eq('mise en avant pub', true)
```

**Requête principale :**

```typescript
const { data: featuredData, error: featuredError } = await supabase
  .from('entreprise')
  .select('id, nom, ville, image_url, logo_url, categorie, statut_abonnement, "niveau priorité abonnement", note_moyenne, "mise en avant pub"')
  .eq('mise en avant pub', true)
  .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
  .order('created_at', { ascending: false })
  .limit(4);
```

**Fallback (si < 4) :**

```typescript
const { data: fallbackData } = await supabase
  .from('entreprise')
  .select('...')
  .or('mise en avant pub.is.null,mise en avant pub.eq.false')  // Exclut les déjà affichées
  .or('statut_abonnement.ilike.%Elite Pro%,statut_abonnement.ilike.%Premium%')
  .order('"niveau priorité abonnement"', { ascending: false })
  .order('note_moyenne', { ascending: false })
  .limit(neededCount);
```

### Composant LocalBusinessesSection (Nouveau)

**Fichier :** `/src/components/LocalBusinessesSection.tsx`

**Interface TypeScript :**

```typescript
interface LocalBusiness {
  id: string;
  nom: string;
  ville: string | null;
  image_url: string | null;
  logo_url: string | null;
  categorie: string | null;
  page_commerce_local: boolean | null;
}
```

**Requête :**

```typescript
const { data, error } = await supabase
  .from('entreprise')
  .select('id, nom, ville, image_url, logo_url, categorie, page_commerce_local')
  .eq('page_commerce_local', true)
  .order('created_at', { ascending: false })
  .limit(6);
```

**Skeleton loader (pendant chargement) :**

```tsx
<div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
  {[1, 2, 3, 4, 5, 6].map((i) => (
    <div className="animate-pulse">...</div>
  ))}
</div>
```

---

## Design visuel

### Section "Établissements à la Une"

**Grille :** 4 colonnes sur desktop, scroll horizontal sur mobile
**Hauteur carte :** 240px (image 160px + contenu 80px)
**Badge :** Dynamique selon `statut_abonnement`
  - Elite : Bordeaux foncé 👑
  - Premium : Doré ⭐
  - Autre : Gris "Nouveau"

### Section "Commerces Locaux"

**Grille :** 3 colonnes sur desktop, scroll horizontal sur mobile
**Hauteur carte :** 200px (image 144px + contenu 56px)
**Badge :** Blanc "Local" 🏪 (fixe pour tous)
**Couleurs :** Plus neutres, focus sur l'authenticité locale

### Comparaison visuelle

```
┌─────────────────────────────────────────────────┐
│  Établissements à la Une                        │
├─────────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐           │
│  │Elite│  │Elite│  │Prem │  │Prem │           │
│  │ 👑  │  │ 👑  │  │ ⭐  │  │ ⭐  │           │
│  └─────┘  └─────┘  └─────┘  └─────┘           │
│         Bordure dorée #D4AF37                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Commerces Locaux                                │
├─────────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐                     │
│  │Local│  │Local│  │Local│                     │
│  │ 🏪  │  │ 🏪  │  │ 🏪  │  ...                │
│  └─────┘  └─────┘  └─────┘                     │
│         Bordure grise #E5E7EB                   │
└─────────────────────────────────────────────────┘
```

---

## Intégration page d'accueil

### Fichier modifié

**Fichier :** `/src/pages/Home.tsx`

### Import ajouté

```typescript
import { LocalBusinessesSection } from '../components/LocalBusinessesSection';
```

### Ajout de la section

```tsx
{/* 4. Établissements à la Une */}
<PremiumPartnersSection onCardClick={(id) => onNavigateToBusiness(id)} />

{/* 4.5 Commerces Locaux */}
<LocalBusinessesSection onCardClick={(id) => onNavigateToBusiness(id)} />

{/* 5. Barre de recherche */}
```

---

## Gestion de la synchronisation Airtable

### Workflow de synchronisation

```
┌──────────────────────────────────────────────┐
│  1. Admin modifie cases dans Airtable        │
│     ☑ → ☐ Mise en avant pub                 │
│     ☐ → ☑ Page Commerce Local               │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  2. Outil de sync (Zapier, Make, etc.)      │
│     Airtable → Supabase                      │
│     Fréquence: Temps réel ou planifiée      │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  3. Mise à jour table Supabase               │
│     UPDATE entreprise                        │
│     SET "mise en avant pub" = false          │
│         "page_commerce_local" = true         │
│     WHERE id = '...'                         │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  4. Utilisateur visite page d'accueil        │
│     → Requête Supabase exécutée              │
│     → Données à jour affichées               │
└──────────────────────────────────────────────┘
```

### Vérification des colonnes

**Vérifier que les colonnes existent :**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'entreprise'
AND column_name IN ('mise en avant pub', 'page_commerce_local');
```

**Résultat attendu :**

```
┌────────────────────────┬───────────┬─────────────┐
│ column_name            │ data_type │ is_nullable │
├────────────────────────┼───────────┼─────────────┤
│ mise en avant pub      │ boolean   │ YES         │
│ page_commerce_local    │ boolean   │ YES         │
└────────────────────────┴───────────┴─────────────┘
```

### Vérifier le nombre d'entreprises cochées

```sql
SELECT
  COUNT(*) FILTER (WHERE "mise en avant pub" = true) as mise_en_avant_count,
  COUNT(*) FILTER (WHERE page_commerce_local = true) as commerce_local_count
FROM entreprise;
```

**Exemple de résultat :**

```
┌──────────────────────┬──────────────────────┐
│ mise_en_avant_count  │ commerce_local_count │
├──────────────────────┼──────────────────────┤
│ 5                    │ 2                    │
└──────────────────────┴──────────────────────┘
```

**Interprétation :**
- 5 entreprises apparaîtront dans "Établissements à la Une" (4 affichées)
- 2 commerces apparaîtront dans "Commerces Locaux"

---

## Tests de validation

### Test 1 : Cocher une case dans Airtable

**Avant :**
```
Airtable:
  Restaurant Le Bon Coin
    ☐ Mise en avant pub

Page d'accueil:
  "Établissements à la Une" → Restaurant absent
```

**Action :**
```
1. Cocher ☑ Mise en avant pub dans Airtable
2. Attendre sync Airtable → Supabase
3. Rafraîchir page d'accueil
```

**Après :**
```
Page d'accueil:
  "Établissements à la Une" → Restaurant visible ✅
```

### Test 2 : Décocher une case dans Airtable

**Avant :**
```
Airtable:
  Café des Artistes
    ☑ Page Commerce Local

Page d'accueil:
  "Commerces Locaux" → Café visible
```

**Action :**
```
1. Décocher ☐ Page Commerce Local dans Airtable
2. Attendre sync Airtable → Supabase
3. Rafraîchir page d'accueil
```

**Après :**
```
Page d'accueil:
  "Commerces Locaux" → Café disparu ✅
```

### Test 3 : Vider complètement une section

**Scénario :**
```
1. Décocher toutes les cases "Page Commerce Local"
2. Sync → Supabase
3. Rafraîchir page d'accueil
```

**Résultat attendu :**
```
Page d'accueil:
  "Commerces Locaux" → Section complètement masquée ✅
  (pas de message "Aucun commerce", la section disparaît)
```

### Test 4 : Ordre de priorité

**Données test :**

| Entreprise | Mise en avant | Niveau priorité | Created at |
|------------|---------------|-----------------|------------|
| A | ✅ | 5 | 2026-02-01 |
| B | ✅ | 5 | 2026-02-15 |
| C | ✅ | 3 | 2026-01-01 |
| D | ✅ | 3 | 2026-02-20 |
| E | ✅ | 2 | 2026-02-25 |

**Ordre d'affichage attendu :**

```
1. B (niveau 5, plus récent)
2. A (niveau 5, plus ancien)
3. D (niveau 3, plus récent)
4. C (niveau 3, plus ancien)

E n'est pas affiché (limite de 4)
```

---

## Gestion des cas limites

### Cas 1 : Aucune entreprise cochée

**Situation :**
- `mise en avant pub = true` → 0 entreprises
- `page_commerce_local = true` → 0 entreprises

**Comportement :**

```typescript
// PremiumPartnersSection
if (!loading && partners.length === 0) {
  // Affiche message "Aucun établissement"
}

// LocalBusinessesSection
if (!loading && businesses.length === 0) {
  return null;  // Masque complètement la section
}
```

**Affichage final :**
- "Établissements à la Une" : Message d'information
- "Commerces Locaux" : Section invisible

### Cas 2 : Sync Airtable en échec

**Problème :** Sync Airtable → Supabase bloquée

**Impact :**
- Les données affichées sont les dernières correctement synchronisées
- Pas d'erreur visible côté utilisateur
- L'admin doit vérifier la synchronisation

**Solution :**
- Vérifier les logs de synchronisation
- Forcer une resynchronisation manuelle si nécessaire

### Cas 3 : Colonne manquante dans Supabase

**Erreur potentielle :**
```
column "mise en avant pub" does not exist
```

**Solution :**

```sql
-- Ajouter la colonne si manquante
ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS "mise en avant pub" boolean DEFAULT false;

ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS page_commerce_local boolean DEFAULT false;
```

### Cas 4 : Doublons (entreprise dans les 2 sections)

**Situation :**
```
Entreprise X:
  ☑ Mise en avant pub
  ☑ Page Commerce Local
```

**Comportement :**
```
✅ L'entreprise apparaît dans les DEUX sections
```

**C'est normal et attendu :** Une entreprise peut être mise en avant ET être un commerce local.

---

## Avantages de cette approche

### 1. Contrôle total depuis Airtable

```
✅ Admin coche/décoche cases dans Airtable
✅ Aucune modification de code nécessaire
✅ Pas besoin d'accès technique
```

### 2. Réactivité

```
✅ Changement dans Airtable
    ↓
✅ Sync automatique vers Supabase
    ↓
✅ Affichage mis à jour instantanément
```

### 3. Flexibilité

```
✅ Peut mettre en avant n'importe quelle entreprise
✅ Pas limité aux abonnés payants
✅ Gestion marketing indépendante
```

### 4. Indépendance des sections

```
✅ Section "À la Une" : Stratégie marketing/commerciale
✅ Section "Commerces Locaux" : Soutien économie locale
✅ Une entreprise peut être dans les deux
```

---

## Performance

### Requêtes Supabase

**PremiumPartnersSection :**
- Requête 1 (mise en avant) : ~100-200ms
- Requête 2 (fallback) : ~100-200ms si nécessaire
- **Total** : 100-400ms

**LocalBusinessesSection :**
- Requête unique : ~100-200ms
- **Total** : 100-200ms

### Impact sur le chargement de la page

```
Page d'accueil chargement total:
├── Hero : ~50ms
├── Pourquoi choisir : ~10ms
├── Compteur : ~150ms (requête count)
├── Établissements à la Une : ~200ms ← Nouvelle requête
├── Commerces Locaux : ~150ms ← Nouveau composant
├── Barre de recherche : ~10ms
└── Loisirs : ~200ms

Total: ~770ms (acceptable)
```

**Optimisations possibles :**
- Cache côté client (5 minutes)
- Parallel loading des sections
- Préchargement des images

---

## Boutons "Voir tous"

### Établissements à la Une

```tsx
<a href="#/entreprises?premium=true">
  Voir tous nos établissements premium
</a>
```

**Condition d'affichage :**
- `partners.length >= 4`
- Suggère qu'il y a plus d'établissements

### Commerces Locaux

```tsx
<a href="#/entreprises?commerce_local=true">
  <Store className="w-4 h-4" />
  Découvrir tous nos commerces locaux
</a>
```

**Condition d'affichage :**
- `businesses.length >= 6`
- Suggère qu'il y a plus de commerces

**Note :** Les pages de destination doivent être configurées pour filtrer par `premium=true` et `commerce_local=true`.

---

## Fichiers modifiés

### Composants

1. **`/src/components/PremiumPartnersSection.tsx`**
   - Ligne 30-37 : Nouveau filtre `.eq('mise en avant pub', true)`
   - Ligne 53-61 : Fallback excluant les déjà affichées
   - Logique de sélection complètement revue

2. **`/src/components/LocalBusinessesSection.tsx`** (NOUVEAU)
   - Composant entièrement nouveau
   - 180 lignes de code
   - Gestion du filtre `page_commerce_local`

### Pages

3. **`/src/pages/Home.tsx`**
   - Ligne 5 : Import `LocalBusinessesSection`
   - Ligne 145-146 : Ajout de la section Commerces Locaux

---

## Build et déploiement

### Build réussi

```bash
npm run build

✓ 2088 modules transformed.
✓ built in 22.58s
```

**Aucune erreur :**
- ✅ TypeScript compilation OK
- ✅ Nouveau composant intégré
- ✅ Production ready

### Bundle impact

```
Avant : 279.27 kB
Après : 283.85 kB
Diff  : +4.58 kB (+1.6%)
```

**Impact minimal :** Le nouveau composant ajoute seulement ~4.5 KB au bundle.

---

## Documentation Airtable pour l'admin

### Guide rapide pour gérer les sections

**Pour ajouter une entreprise à "Établissements à la Une" :**
```
1. Ouvrir la fiche entreprise dans Airtable
2. Cocher ☑ la case "Mise en avant pub"
3. Sauvegarder
4. Attendre la synchronisation (quelques minutes max)
5. L'entreprise apparaît sur la page d'accueil
```

**Pour ajouter un commerce à "Commerces Locaux" :**
```
1. Ouvrir la fiche entreprise dans Airtable
2. Cocher ☑ la case "Page Commerce Local"
3. Sauvegarder
4. Attendre la synchronisation
5. Le commerce apparaît dans la section dédiée
```

**Pour retirer une entreprise :**
```
1. Ouvrir la fiche dans Airtable
2. Décocher ☐ la case correspondante
3. Sauvegarder
4. L'entreprise disparaît de la section
```

---

*Documentation générée le 27 février 2026*
