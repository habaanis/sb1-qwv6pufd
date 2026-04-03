# 🎯 SYSTÈME DE FALLBACK À 3 NIVEAUX - ABONNEMENTS

**Date**: 4 février 2026
**Fichier**: `/src/pages/Businesses.tsx`
**Objectif**: Assurer l'affichage des bonnes couleurs de carte en utilisant plusieurs sources de données avec priorité

---

## 📋 RÈGLE DE PRIORITÉ ABSOLUE

Le système scanne **3 colonnes dans l'ordre** pour déterminer le tier d'abonnement :

```
PRIORITÉ 1 → statut_abonnement (Whalesync/Airtable) ✅
PRIORITÉ 2 → type_abonnement (Fallback)            ⚠️
PRIORITÉ 3 → subscription_tier (Fallback)          ⚠️
```

### Logique de Fallback

```typescript
const statutFinal = business.statut_abonnement
                 || business.type_abonnement
                 || business.subscription_tier
                 || '';
```

---

## 🎨 MAPPAGE DES COULEURS

| Valeur Détectée | Couleur | Code Hex | Tier |
|----------------|---------|----------|------|
| **Elite Pro** / **Elite** | ⚫ Noir | `#121212` | `elite` |
| **Artisan** | 🟣 Mauve | `#4A1D43` | `artisan` |
| **Premium** | 🟢 Vert | `#064E3B` | `premium` |
| **Gratuit** / **Découverte** / Vide | ⚪ Blanc | `#FFFFFF` | `decouverte` |

### Détection Intelligente

Le système utilise `.includes()` pour détecter les variantes :
- `'Elite'`, `'elite_pro'`, `'Elite Pro'` → Tous détectés comme **Elite**
- `'Artisan'`, `'artisan'`, `'ARTISAN'` → Tous détectés comme **Artisan**
- `'Premium'`, `'premium'`, `'PREMIUM'` → Tous détectés comme **Premium**

---

## 💻 MODIFICATIONS APPORTÉES

### 1. Interface Business - 3 Colonnes Activées

```typescript
interface Business {
  statut_abonnement?: string | null;   // Priorité 1: Whalesync/Airtable
  type_abonnement?: string | null;     // Priorité 2: Fallback
  subscription_tier?: string | null;   // Priorité 3: Fallback
  is_premium?: boolean;
}
```

### 2. Requêtes SQL - Récupération des 3 Colonnes

```typescript
// fetchBusinesses()
.select('..., statut_abonnement, type_abonnement, subscription_tier, is_premium')

// performSearch()
.select('..., statut_abonnement, type_abonnement, subscription_tier, is_premium')
```

### 3. Mapping des Données

```typescript
const mappedData = (data || []).map((item: any) => ({
  // ... autres champs ...
  statut_abonnement: item.statut_abonnement || null,
  type_abonnement: item.type_abonnement || null,
  subscription_tier: item.subscription_tier || null,
  is_premium: item.is_premium || false,
}));
```

### 4. Fonction getCardStyles - Système de Fallback Intégré

```typescript
const getCardStyles = (business: Business) => {
  // PRIORITÉ 1: statut_abonnement (Whalesync)
  // PRIORITÉ 2: type_abonnement (Fallback)
  // PRIORITÉ 3: subscription_tier (Fallback)
  const statutFinal = business.statut_abonnement
                   || business.type_abonnement
                   || business.subscription_tier
                   || '';

  const statut = statutFinal.toLowerCase().trim();

  // Debug: Afficher la source utilisée
  const source = business.statut_abonnement ? '✅ P1: statut_abonnement'
    : business.type_abonnement ? '⚠️ P2: type_abonnement'
    : business.subscription_tier ? '⚠️ P3: subscription_tier'
    : '❌ Aucune colonne';

  console.log(`[CompanyCard ${business.name}]`, {
    source,
    statut_abonnement: business.statut_abonnement,
    type_abonnement: business.type_abonnement,
    subscription_tier: business.subscription_tier,
    statutFinal: statut
  });

  // Détection avec includes() pour flexibilité
  if (statut.includes('elite') || statut.includes('pro')) {
    return { bg: '#121212', tier: 'elite', ... };
  } else if (statut.includes('artisan')) {
    return { bg: '#4A1D43', tier: 'artisan', ... };
  } else if (statut.includes('premium')) {
    return { bg: '#064E3B', tier: 'premium', ... };
  } else {
    return { bg: '#FFFFFF', tier: 'decouverte', ... };
  }
};
```

### 5. Badge Debug - Affichage de la Source Utilisée

```typescript
{business.statut_abonnement ? `P1: ${business.statut_abonnement}`
  : business.type_abonnement ? `P2: ${business.type_abonnement}`
  : business.subscription_tier ? `P3: ${business.subscription_tier}`
  : 'null'}
```

**Résultat visuel**:
- Si `statut_abonnement = 'elite_pro'` → Badge affiche: `ELITE` + `P1: elite_pro`
- Si `type_abonnement = 'premium'` → Badge affiche: `PREMIUM` + `P2: premium`
- Si `subscription_tier = 'artisan'` → Badge affiche: `ARTISAN` + `P3: artisan`

---

## 🧪 SCÉNARIOS DE TEST

### Scénario 1: Priorité 1 - Whalesync Actif

```
statut_abonnement = 'elite_pro'
type_abonnement = NULL
subscription_tier = NULL
```

**Résultat**: Carte ⚫ NOIRE avec badge `ELITE` + `P1: elite_pro`

---

### Scénario 2: Priorité 2 - Fallback type_abonnement

```
statut_abonnement = NULL
type_abonnement = 'premium'
subscription_tier = 'artisan'
```

**Résultat**: Carte 🟢 VERTE avec badge `PREMIUM` + `P2: premium`

---

### Scénario 3: Priorité 3 - Fallback subscription_tier

```
statut_abonnement = NULL
type_abonnement = NULL
subscription_tier = 'artisan'
```

**Résultat**: Carte 🟣 MAUVE avec badge `ARTISAN` + `P3: artisan`

---

### Scénario 4: Aucune Colonne Remplie

```
statut_abonnement = NULL
type_abonnement = NULL
subscription_tier = NULL
```

**Résultat**: Carte ⚪ BLANCHE avec badge `DECOUVERTE` (pas de badge premium)

---

### Scénario 5: Variantes de Nommage

```
statut_abonnement = 'Elite Pro'    → Détecté comme ELITE ✅
statut_abonnement = 'elite_pro'    → Détecté comme ELITE ✅
statut_abonnement = 'ELITE'        → Détecté comme ELITE ✅
type_abonnement = 'Premium'        → Détecté comme PREMIUM ✅
subscription_tier = 'ARTISAN'      → Détecté comme ARTISAN ✅
```

**Raison**: Le système utilise `.toLowerCase().trim()` puis `.includes()` pour détecter les mots-clés

---

## 📊 LOGS DE DEBUG

### Console Logs Attendus

```javascript
[fetchBusinesses] ✅ Données récupérées: 50 entreprises
[fetchBusinesses] 📊 Colonnes abonnement: {
  id: "123",
  nom: "Entreprise XYZ",
  statut_abonnement: "elite_pro",
  type_abonnement: null,
  subscription_tier: null,
  is_premium: true
}

[CompanyCard Entreprise XYZ] {
  source: "✅ P1: statut_abonnement",
  statut_abonnement: "elite_pro",
  type_abonnement: null,
  subscription_tier: null,
  statutFinal: "elite_pro"
}

[CompanyCard Entreprise XYZ] → tier="elite", bg="#121212"
```

---

## 🔍 VÉRIFICATION SQL

### 1. Voir les colonnes disponibles

```sql
SELECT
  nom,
  statut_abonnement,
  type_abonnement,
  subscription_tier
FROM entreprise
WHERE secteur = 'entreprise'
LIMIT 10;
```

---

### 2. Statistiques par Priorité

```sql
SELECT
  CASE
    WHEN statut_abonnement IS NOT NULL THEN '✅ P1: statut_abonnement'
    WHEN type_abonnement IS NOT NULL THEN '⚠️ P2: type_abonnement'
    WHEN subscription_tier IS NOT NULL THEN '⚠️ P3: subscription_tier'
    ELSE '❌ Aucune colonne'
  END as source_utilisee,
  COALESCE(statut_abonnement, type_abonnement, subscription_tier, 'null') as valeur,
  COUNT(*) as nombre
FROM entreprise
WHERE secteur = 'entreprise'
GROUP BY source_utilisee, valeur
ORDER BY nombre DESC;
```

---

### 3. Détection d'Anomalies

```sql
-- Entreprises avec plusieurs colonnes remplies (conflit potentiel)
SELECT
  nom,
  statut_abonnement,
  type_abonnement,
  subscription_tier
FROM entreprise
WHERE secteur = 'entreprise'
  AND statut_abonnement IS NOT NULL
  AND (type_abonnement IS NOT NULL OR subscription_tier IS NOT NULL)
LIMIT 20;
```

---

## ⚠️ CAS SPÉCIAUX

### Cas 1: Conflit Entre Colonnes

Si une entreprise a:
```
statut_abonnement = 'premium'
type_abonnement = 'elite_pro'
subscription_tier = 'artisan'
```

**Résultat**: La **Priorité 1** gagne → Carte 🟢 VERTE (`premium`)

---

### Cas 2: Valeurs Non Reconnues

Si une entreprise a:
```
statut_abonnement = 'custom_tier_xyz'
```

**Résultat**: Carte ⚪ BLANCHE (`decouverte`) car aucun mot-clé reconnu

---

### Cas 3: Espaces et Majuscules

Le système normalise automatiquement :
```
statut_abonnement = '  Elite Pro  '  → Détecté comme ELITE ✅
statut_abonnement = 'PREMIUM'         → Détecté comme PREMIUM ✅
statut_abonnement = 'artisan '        → Détecté comme ARTISAN ✅
```

---

## 🎯 RÉSULTAT FINAL

### Avantages du Système

✅ **Robustesse**: Si Whalesync échoue, les fallbacks prennent le relais
✅ **Flexibilité**: Détecte les variantes de nommage (majuscules, espaces, underscores)
✅ **Traçabilité**: Les logs montrent quelle colonne est utilisée
✅ **Migration Progressive**: Permet de migrer vers `statut_abonnement` sans casser l'existant
✅ **Debug Visuel**: Badge affiche la source et la valeur pour débogage facile

---

### Recommandations

1. **Production**: Désactivez le debug visuel en mettant `ENABLE_TIER_DEBUG = false`

2. **Monitoring**: Surveillez les logs pour voir quelle priorité est utilisée:
   - Si beaucoup de `P2` ou `P3` → Whalesync ne synchronise pas correctement
   - Si beaucoup de `❌ Aucune colonne` → Problème de données

3. **Nettoyage Futur**: Une fois que `statut_abonnement` est entièrement synchronisé:
   - Exécutez `NETTOYAGE_SOURCE_UNIQUE_STATUT_ABONNEMENT.md`
   - Supprimez les colonnes `type_abonnement` et `subscription_tier`
   - Simplifiez la fonction `getCardStyles`

4. **Validation**: Exécutez le script `TEST_FALLBACK_3_NIVEAUX.sql` (voir fichier joint)

---

## 📁 FICHIERS ASSOCIÉS

- **Code**: `/src/pages/Businesses.tsx`
- **Test SQL**: `TEST_FALLBACK_3_NIVEAUX.sql`
- **Documentation Antérieure**: `NETTOYAGE_SOURCE_UNIQUE_STATUT_ABONNEMENT.md`

---

## 🔄 SYNCHRONISATION WHALESYNC

Le système attend que Whalesync remplisse la colonne `statut_abonnement` avec les valeurs d'Airtable.

### Valeurs Attendues d'Airtable

- `'artisan'` → 🟣 Mauve
- `'premium'` → 🟢 Vert
- `'elite_pro'` ou `'Elite Pro'` → ⚫ Noir
- Vide ou autre → ⚪ Blanc

---

## ✅ BUILD & DÉPLOIEMENT

```bash
npm run build
```

**Résultat**: ✅ Build réussi sans erreurs TypeScript

---

**FIN DU DOCUMENT**

*Ce système garantit l'affichage correct des couleurs de carte même en cas de défaillance de Whalesync, tout en donnant la priorité à la source principale.*
