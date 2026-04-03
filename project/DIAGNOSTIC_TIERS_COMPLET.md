# 🔍 Diagnostic Complet - Système de Tiers d'Abonnement

## ✅ Correctifs Appliqués

### 1. ✅ Styles Inline au lieu de Classes Tailwind

**Problème:** Les classes Tailwind CSS pouvaient être écrasées ou ne pas s'appliquer.

**Solution:** Modification de `SignatureCard.tsx` pour utiliser des **styles inline** (style={{ backgroundColor: ... }}) qui sont **prioritaires et forcément appliqués**.

**Fichier modifié:** `src/components/SignatureCard.tsx`

```typescript
// AVANT (Classes Tailwind - peuvent être écrasées)
bg: 'bg-[#4A1D43]'

// APRÈS (Styles inline - forcément appliqués)
backgroundColor: '#4A1D43'
```

### 2. ✅ Normalisation Robuste des Valeurs

**Problème:** Les variations de casse et espaces ("Elite Pro", "elite_pro", "ELITE PRO") n'étaient pas détectées uniformément.

**Solution:** Normalisation complète avec `.toLowerCase().trim().replace(/[\s_-]/g, '')` et détection flexible avec `.includes()`.

**Fichier modifié:** `src/lib/subscriptionTiers.ts`

```typescript
// Gère automatiquement:
"Elite Pro" → "elitepro" → détecté comme ELITE
"  premium  " → "premium" → détecté comme PREMIUM
"artisan" → "artisan" → détecté comme ARTISAN
```

### 3. ✅ Force le Rafraîchissement avec Key Unique

**Problème:** React ne re-render pas les composants si la clé ne change pas.

**Solution:** Ajout de `statut_abonnement` dans la clé du composant pour forcer le re-render.

**Fichier modifié:** `src/pages/Businesses.tsx`

```typescript
// AVANT
key={business.id}

// APRÈS (force le re-render si statut_abonnement change)
key={`${business.id}-${business.statut_abonnement || 'default'}`}
```

### 4. ✅ Console Logs de Debug Détaillés

**Ajout de logs à 3 niveaux:**

1. **Fetch Supabase** (`src/pages/Businesses.tsx`)
   - `[fetchBusinesses]` : Affiche les données brutes reçues
   - `[performSearch]` : Affiche les données lors de la recherche

2. **Mapping du Tier** (`src/pages/Businesses.tsx`)
   - `[Business ...]` : Affiche le mapping statut → tier pour chaque entreprise

3. **Composant Carte** (`src/components/SignatureCard.tsx`)
   - `[SignatureCard]` : Affiche le tier reçu et appliqué

### 5. ✅ Badge de Debug Visuel

**Nouveau composant:** `src/components/TierDebugBadge.tsx`

Affiche en haut à gauche de chaque carte:
- Le tier détecté (ELITE, PREMIUM, ARTISAN, DECOUVERTE)
- La valeur brute de la base de données

**Activation/Désactivation:**
```typescript
// Dans Businesses.tsx et BusinessDetail.tsx
const ENABLE_TIER_DEBUG = true;  // Mode debug
const ENABLE_TIER_DEBUG = false; // Production
```

---

## 🧪 Comment Tester

### Étape 1: Vérifier les Logs Console

1. Rechargez la page `/entreprises`
2. Ouvrez la console (F12)
3. Cherchez les logs suivants:

```
[fetchBusinesses] ✅ Données récupérées de Supabase: 50 entreprises
[fetchBusinesses] 📊 Exemple d'entreprise: {
  id: "xxx",
  nom: "Entreprise Test",
  statut_abonnement: "premium",
  subscription_tier: null,
  is_premium: false
}
[Business Entreprise Test] statut_abonnement="premium", subscription_tier="null", is_premium=false -> tier="premium"
[SignatureCard] Tier reçu: premium isPremium: true
```

### Étape 2: Vérifier le Badge Debug

Sur chaque carte, en haut à gauche, vous devez voir:
```
┌────────────┐
│ PREMIUM    │
│ DB: premium│
└────────────┘
```

### Étape 3: Vérifier les Couleurs

| Tier | Fond | Bordure | Badge Debug |
|------|------|---------|-------------|
| DECOUVERTE | Gris clair #F8FAFC | Or fine 1px | Gris |
| ARTISAN | Mauve #4A1D43 | Or épaisse 2px | Violet |
| PREMIUM | Vert #064E3B | Or épaisse 2px | Vert |
| ELITE | Noir #121212 | Or épaisse 2px | Noir |

### Étape 4: Tester les Modifications

1. **Ouvrez Supabase** → SQL Editor
2. **Copiez le script** `SCRIPT_TEST_TIERS.sql`
3. **Exécutez** pour créer des entreprises de test
4. **Rechargez** la page `/entreprises`
5. **Vérifiez** que les couleurs correspondent

### Étape 5: Tester le Rafraîchissement

1. Choisissez une entreprise existante
2. Modifiez son `statut_abonnement` dans Supabase:
   ```sql
   UPDATE entreprise
   SET statut_abonnement = 'artisan'
   WHERE id = 'votre-id';
   ```
3. Rechargez la page
4. La carte doit **immédiatement** afficher le fond mauve

---

## 🐛 Dépannage

### Problème 1: Les couleurs ne changent toujours pas

**Vérifications:**

1. **Console: Fetch Supabase**
   ```
   [fetchBusinesses] ✅ Données récupérées de Supabase: X entreprises
   ```
   ✅ Si vous voyez ce log, le fetch fonctionne.

2. **Console: Colonne statut_abonnement**
   ```
   statut_abonnement: "premium"  ← ✅ OK
   statut_abonnement: undefined  ← ❌ PROBLÈME
   statut_abonnement: null       ← ⚠️ Normal (= DECOUVERTE)
   ```

3. **Console: Tier détecté**
   ```
   -> tier="premium"  ← ✅ OK
   -> tier="decouverte"  ← ⚠️ Vérifier la valeur DB
   ```

4. **Console: SignatureCard**
   ```
   [SignatureCard] Tier reçu: premium  ← ✅ OK
   [SignatureCard] Tier reçu: undefined  ← ❌ PROBLÈME
   ```

**Actions correctives:**

- Si `statut_abonnement` est `undefined` :
  → Vérifiez que la colonne existe dans Supabase
  → Vérifiez le `.select()` dans le fetch

- Si le tier détecté est toujours `decouverte` :
  → Vérifiez la valeur exacte dans Supabase
  → Vérifiez `subscriptionTiers.ts` ligne ~36-48

- Si SignatureCard ne reçoit pas le tier :
  → Vérifiez que le prop `tier={tier}` est bien passé
  → Vérifiez le mapping dans Businesses.tsx ligne ~883-887

### Problème 2: Le badge debug ne s'affiche pas

**Solution:**
```typescript
// Vérifiez que dans Businesses.tsx:
const ENABLE_TIER_DEBUG = true; // ← Doit être true
```

### Problème 3: Les styles s'appliquent mais se réinitialisent

**Cause possible:** Cache du navigateur

**Solution:**
1. Ouvrez les DevTools (F12)
2. Clic droit sur le bouton Refresh
3. Sélectionnez "Vider le cache et actualiser"

### Problème 4: Certaines entreprises ne récupèrent pas la colonne

**Vérification SQL:**
```sql
-- Vérifier que la colonne existe et contient des valeurs
SELECT
  id,
  nom,
  statut_abonnement,
  subscription_tier,
  is_premium
FROM entreprise
WHERE secteur = 'entreprise'
LIMIT 10;
```

Si `statut_abonnement` est `NULL` partout:
→ C'est normal, les entreprises sont en mode DECOUVERTE par défaut
→ Utilisez le script `SCRIPT_TEST_TIERS.sql` pour créer des tests

---

## 📊 Statistiques en Temps Réel

### Dans la Console Navigateur

Collez ce code pour voir les tiers détectés:

```javascript
// Compter les tiers affichés
const tiers = {};
document.querySelectorAll('[style*="backgroundColor"]').forEach(card => {
  const bg = card.style.backgroundColor;
  const tierMap = {
    'rgb(248, 250, 252)': 'DECOUVERTE',
    'rgb(74, 29, 67)': 'ARTISAN',
    'rgb(6, 78, 59)': 'PREMIUM',
    'rgb(18, 18, 18)': 'ELITE'
  };
  const tier = tierMap[bg] || 'AUTRE';
  tiers[tier] = (tiers[tier] || 0) + 1;
});
console.table(tiers);
```

### Dans Supabase SQL

```sql
SELECT
  CASE
    WHEN LOWER(statut_abonnement) LIKE '%elite%' THEN 'ELITE'
    WHEN LOWER(statut_abonnement) LIKE '%premium%' THEN 'PREMIUM'
    WHEN LOWER(statut_abonnement) LIKE '%artisan%' THEN 'ARTISAN'
    ELSE 'DECOUVERTE'
  END as tier,
  COUNT(*) as nombre
FROM entreprise
WHERE secteur = 'entreprise'
GROUP BY tier
ORDER BY nombre DESC;
```

---

## 🚀 Mise en Production

### Avant de déployer:

1. **Désactivez le debug visuel:**
   ```typescript
   // src/pages/Businesses.tsx
   const ENABLE_TIER_DEBUG = false;

   // src/pages/BusinessDetail.tsx
   const ENABLE_TIER_DEBUG = false;
   ```

2. **Supprimez ou commentez les console.log:**
   ```typescript
   // src/pages/Businesses.tsx - Lignes à commenter:
   // console.log('[fetchBusinesses] ✅ ...');
   // console.log('[performSearch] ✅ ...');
   // console.log(`[Business ${business.name}] ...`);

   // src/pages/BusinessDetail.tsx - Ligne à commenter:
   // console.log(`[BusinessDetail ${business.nom}] ...`);

   // src/components/SignatureCard.tsx - Ligne à commenter:
   // console.log('[SignatureCard] Tier reçu:', tier, ...);
   ```

3. **Supprimez les entreprises de test:**
   ```sql
   DELETE FROM entreprise WHERE nom LIKE 'TEST %';
   ```

4. **Build final:**
   ```bash
   npm run build
   ```

---

## 📝 Résumé des Fichiers Modifiés

| Fichier | Modification | Raison |
|---------|-------------|--------|
| `src/components/SignatureCard.tsx` | Styles inline | Forcer l'application des couleurs |
| `src/lib/subscriptionTiers.ts` | Normalisation robuste | Gérer toutes les variations |
| `src/pages/Businesses.tsx` | Logs + key unique | Debug + force refresh |
| `src/pages/BusinessDetail.tsx` | Logs + debug badge | Debug |
| `src/components/TierDebugBadge.tsx` | Nouveau | Debug visuel |

## 📚 Fichiers Créés

- `GUIDE_DEBUG_TIERS.md` : Guide complet d'utilisation du debug
- `SCRIPT_TEST_TIERS.sql` : Script SQL pour créer des tests
- `DIAGNOSTIC_TIERS_COMPLET.md` : Ce fichier de diagnostic

---

## ✅ Checklist de Vérification

- [ ] Le fetch récupère bien `statut_abonnement` dans le SELECT
- [ ] Les données brutes s'affichent dans la console (fetchBusinesses)
- [ ] Le tier est correctement mappé (console logs Business)
- [ ] SignatureCard reçoit le tier (console logs SignatureCard)
- [ ] Les styles inline sont appliqués (inspect element)
- [ ] Le badge debug s'affiche (si ENABLE_TIER_DEBUG = true)
- [ ] Les couleurs correspondent au tableau de référence
- [ ] Le refresh après UPDATE fonctionne
- [ ] Les entreprises de test s'affichent correctement
- [ ] La key unique force le re-render

Si tous les points sont ✅, le système fonctionne parfaitement !
