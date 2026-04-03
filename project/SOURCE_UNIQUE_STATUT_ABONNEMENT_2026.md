# 🧹 SOURCE UNIQUE: statut_abonnement

**Date:** 4 février 2026  
**Objectif:** Utiliser UNIQUEMENT `statut_abonnement` pour déterminer les couleurs des cartes

---

## ✅ RÈGLES DE MAPPAGE (STRICT)

| Valeur BDD | Couleur | Fond | Border |
|------------|---------|------|--------|
| `'artisan'` | 🟣 Mauve | `#4A1D43` | `#D4AF37` |
| `'premium'` | 🟢 Vert | `#064E3B` | `#D4AF37` |
| `'elite_pro'` ou `'elite'` | ⚫ Noir | `#121212` | `#D4AF37` |
| Autre ou null | ⚪ Blanc | `#FFFFFF` | `#E5E7EB` |

### Normalisation automatique
```typescript
const statut = (statutAbonnement || '').toLowerCase().trim();
```

---

## 📊 FICHIERS MODIFIÉS

### 1. **src/pages/Businesses.tsx**
- ✅ Requêtes SQL: Supprimé `type_abonnement, subscription_tier`
- ✅ Interface Business: Gardé uniquement `statut_abonnement`
- ✅ getCardStyles: Source unique avec mappage strict
- ✅ Badge Debug: Affiche uniquement `statut_abonnement`

### 2. **src/pages/BusinessDetail.tsx**
- ✅ Interface Business nettoyée
- ✅ 3 requêtes SQL nettoyées
- ✅ mapSubscriptionToTier simplifié
- ✅ Badge Debug simplifié

### 3. **src/components/business/BusinessDirectory.tsx**
- ✅ Interface Business nettoyée
- ✅ mapSubscriptionToTier simplifié

### 4. **src/lib/subscriptionTiers.ts**
- ✅ Interface SubscriptionData simplifiée
- ✅ mapSubscriptionToTier utilise source unique

---

## 🎨 FONCTION getCardStyles SIMPLIFIÉE

```typescript
const getCardStyles = (statutAbonnement: string | null) => {
  const statut = (statutAbonnement || '').toLowerCase().trim();

  if (statut === 'artisan') {
    return { bg: '#4A1D43', tier: 'artisan' };
  } else if (statut === 'premium') {
    return { bg: '#064E3B', tier: 'premium' };
  } else if (statut === 'elite_pro' || statut === 'elite') {
    return { bg: '#121212', tier: 'elite' };
  } else {
    return { bg: '#FFFFFF', tier: 'decouverte' };
  }
};
```

---

## ✅ VALIDATION

```bash
npm run build
✓ built in 16.30s
```

Pas d'erreurs TypeScript. Toutes les requêtes SQL ne demandent plus les colonnes supprimées.

---

## 🧪 TEST SQL

```sql
-- Vérifier les valeurs en BDD
SELECT nom, statut_abonnement, is_premium,
  CASE
    WHEN statut_abonnement = 'artisan' THEN '🟣 Mauve'
    WHEN statut_abonnement = 'premium' THEN '🟢 Vert'
    WHEN statut_abonnement IN ('elite_pro', 'elite') THEN '⚫ Noir'
    ELSE '⚪ Blanc'
  END as couleur_attendue
FROM entreprise
WHERE secteur = 'entreprise'
LIMIT 10;
```
