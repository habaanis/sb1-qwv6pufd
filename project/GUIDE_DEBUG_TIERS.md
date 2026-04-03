# Guide de Debug des Tiers d'Abonnement

## 🎯 Activation/Désactivation du Debug Visuel

### Mode Debug ACTIVÉ
Affiche un badge en haut à gauche de chaque carte avec :
- Le tier détecté (DECOUVERTE, ARTISAN, PREMIUM, ELITE, CUSTOM)
- La valeur brute venant de la base de données

Pour **activer** le debug :
```typescript
// Dans src/pages/Businesses.tsx et src/pages/BusinessDetail.tsx
const ENABLE_TIER_DEBUG = true; // ✅ Mode debug activé
```

Pour **désactiver** le debug en production :
```typescript
const ENABLE_TIER_DEBUG = false; // ❌ Mode debug désactivé
```

## 🔍 Console Logs

Le système affiche également dans la console :
- Toutes les valeurs des entreprises avec leur tier détecté
- Les warnings pour les valeurs non reconnues

**Exemple de log :**
```
[Business Café Central] statut_abonnement="Elite Pro", subscription_tier="null", is_premium=false -> tier="elite"
[TierMapping] Valeur non reconnue: "ancien_plan" -> Découverte par défaut
```

## 🎨 Correspondance des Couleurs

| Valeur DB (exemples) | Tier Détecté | Fond | Texte | Bordure |
|---------------------|--------------|------|-------|---------|
| `null`, `""`, `"gratuit"`, `"free"`, `"decouverte"` | **DECOUVERTE** | #F8FAFC (gris clair) | Noir | Or fine |
| `"artisan"`, `"Artisan"`, `"ARTISAN"` | **ARTISAN** | #4A1D43 (mauve) | Blanc + Or | Or épaisse |
| `"premium"`, `"Premium"`, `"PREMIUM"` | **PREMIUM** | #064E3B (vert) | Blanc + Or | Or épaisse |
| `"elite"`, `"Elite Pro"`, `"elite_pro"`, `"ELITE PRO"` | **ELITE** | #121212 (noir) | Or | Or épaisse |
| `"custom"`, `"sur-mesure"`, `"personnalisé"` | **CUSTOM** | Gris | Noir | Pointillés |

## ✅ Normalisation Automatique

Le système gère automatiquement :
- ✅ Majuscules/minuscules : `"ARTISAN"` → `"artisan"`
- ✅ Espaces : `"Elite Pro"` → `"elitepro"`
- ✅ Underscores : `"elite_pro"` → `"elitepro"`
- ✅ Tirets : `"elite-pro"` → `"elitepro"`

**Exemple :**
```
"Elite Pro" → "elite"
"elite_pro" → "elite"
"ELITE PRO" → "elite"
"  elite  " → "elite"
```

## 🧪 Test des Valeurs

### 1. Via SQL dans Supabase

Créez une entreprise de test avec chaque tier :
```sql
-- Test Artisan
UPDATE entreprise
SET statut_abonnement = 'artisan'
WHERE id = 'votre-id-test';

-- Test Premium
UPDATE entreprise
SET statut_abonnement = 'premium'
WHERE id = 'votre-id-test';

-- Test Elite Pro (plusieurs formats possibles)
UPDATE entreprise
SET statut_abonnement = 'Elite Pro' -- ou 'elite_pro' ou 'elite'
WHERE id = 'votre-id-test';
```

### 2. Vérification Visuelle

1. **Activez le debug** (`ENABLE_TIER_DEBUG = true`)
2. Rechargez la page des entreprises
3. Vérifiez :
   - Le badge debug (coin supérieur gauche)
   - La couleur de fond de la carte
   - La couleur de la bordure (Or pour tous)
   - La console du navigateur (F12)

### 3. Scénarios de Test

| Scénario | Valeur DB | Tier Attendu | Couleur Attendue |
|----------|-----------|--------------|------------------|
| Nouvelle entreprise | `null` | DECOUVERTE | Gris clair |
| Artisan Tunisien | `"artisan"` | ARTISAN | Mauve |
| Entreprise Premium | `"premium"` | PREMIUM | Vert |
| Grande entreprise | `"Elite Pro"` | ELITE | Noir |
| Format ancien | `"elite_pro"` | ELITE | Noir |
| Majuscules | `"PREMIUM"` | PREMIUM | Vert |
| Avec espaces | `"  premium  "` | PREMIUM | Vert |

## 🐛 Dépannage

### Problème : Les couleurs ne s'appliquent pas

**Vérifications :**
1. Ouvrez la console (F12) → Onglet "Console"
2. Cherchez les logs `[Business ...]`
3. Vérifiez que `statut_abonnement` n'est pas `undefined`
4. Vérifiez que le tier détecté est correct

**Exemple de log correct :**
```
[Business Café Central] statut_abonnement="premium", subscription_tier="null", is_premium=false -> tier="premium"
```

**Exemple de problème :**
```
[Business Café Central] statut_abonnement="undefined", subscription_tier="null", is_premium=false -> tier="decouverte"
⚠️ PROBLÈME : La valeur est "undefined" au lieu d'une vraie valeur
```

### Problème : Warning "Valeur non reconnue"

Si vous voyez dans la console :
```
[TierMapping] Valeur non reconnue: "ancien_format" -> Découverte par défaut
```

**Solution :** Ajoutez la détection de cette valeur dans `src/lib/subscriptionTiers.ts` :
```typescript
// Ajoutez votre condition
if (normalized.includes('ancien_format')) {
  return 'artisan'; // ou le tier approprié
}
```

## 📊 Statistiques en Console

Pour voir combien d'entreprises utilisent chaque tier :
```javascript
// Ouvrez la console et collez :
const tiers = {};
document.querySelectorAll('[class*="bg-"]').forEach(card => {
  const badge = card.querySelector('.font-mono');
  if (badge) {
    const tier = badge.textContent.split('\n')[0];
    tiers[tier] = (tiers[tier] || 0) + 1;
  }
});
console.table(tiers);
```

## 🚀 Désactivation en Production

Avant de déployer en production, **N'OUBLIEZ PAS** :
```typescript
// Dans src/pages/Businesses.tsx
const ENABLE_TIER_DEBUG = false; // ❌ IMPORTANT : false en production

// Dans src/pages/BusinessDetail.tsx
const ENABLE_TIER_DEBUG = false; // ❌ IMPORTANT : false en production
```

Ou supprimez les lignes de console.log :
```typescript
// SUPPRIMEZ ces lignes :
console.log(`[Business ${business.name}] ...`);
console.log(`[BusinessDetail ${business.nom}] ...`);
```

## 📝 Notes Importantes

1. **La colonne `statut_abonnement` est prioritaire** sur `subscription_tier`
2. **La colonne `is_premium`** sert de fallback si aucune valeur n'est définie
3. **Le tier par défaut est DECOUVERTE** (sécurité)
4. **La normalisation est robuste** : peu importe la casse ou les espaces
