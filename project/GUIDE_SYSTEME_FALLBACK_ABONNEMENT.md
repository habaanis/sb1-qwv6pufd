# 🔄 Système de Fallback des Abonnements - Guide Complet

## 📋 Vue d'Ensemble

Le système utilise maintenant un **système de fallback intelligent** qui garantit que les données d'abonnement sont toujours disponibles, même si la source principale (Whalesync) n'a pas encore de données.

---

## 🎯 Priorité des Sources de Données

Le système vérifie les colonnes dans cet ordre précis :

```
1️⃣ "Statut Abonnement" (colonne Whalesync/Airtable) ← PRIORITÉ 1
    ↓ si vide
2️⃣ type_abonnement ← Fallback prioritaire
    ↓ si vide
3️⃣ subscription_tier ← Fallback secondaire
    ↓ si vide
4️⃣ NULL → Tier "découverte" par défaut
```

---

## 🗄️ Colonnes de la Base de Données

### Colonne Principale (Whalesync)
- **Nom:** `"Statut Abonnement"` (avec guillemets et espace)
- **Type:** `text`
- **Source:** Synchronisée avec Airtable via Whalesync
- **Utilisation:** Alias `statut_abonnement_whalesync` dans les requêtes

### Colonnes de Fallback
1. **`type_abonnement`** (text) - Fallback prioritaire
2. **`subscription_tier`** (text) - Fallback secondaire

---

## 💻 Implémentation Technique

### 1. Requête SQL (avec alias)

```typescript
// Dans fetchBusinesses et performSearch
.select(`
  id, nom, secteur, sous_categories, gouvernorat, ville, adresse,
  telephone, email, site_web, description, image_url,
  "Statut Abonnement" as statut_abonnement_whalesync,  ← Colonne Whalesync
  type_abonnement,                                      ← Fallback 1
  subscription_tier,                                    ← Fallback 2
  is_premium
`)
```

### 2. Logique de Fallback (mapping)

```typescript
const mappedData = (data || []).map((item: any) => {
  // PRIORITÉ DE FALLBACK: Whalesync → type_abonnement → subscription_tier
  const statutFinal =
    item.statut_abonnement_whalesync ||  // ← Priorité 1 (Whalesync)
    item.type_abonnement ||               // ← Priorité 2
    item.subscription_tier ||             // ← Priorité 3
    null;                                 // ← Valeur par défaut

  return {
    ...item,
    statut_abonnement: statutFinal,       // ← Valeur finale unifiée
    niveau_abonnement: item.type_abonnement || null,
    type_abonnement: item.type_abonnement || null,
    subscription_tier: item.subscription_tier || null,
  };
});
```

### 3. Interface TypeScript

```typescript
interface Business {
  statut_abonnement?: string | null;  // Whalesync/Airtable (priorité 1)
  niveau_abonnement?: string | null;   // Fallback (priorité 2)
  type_abonnement?: string | null;     // Fallback (priorité 3)
  subscription_tier?: string | null;   // Fallback (priorité 4)
  is_premium?: boolean;
  // ...autres champs
}
```

---

## 🎨 Mapping des Couleurs

Le système applique les couleurs selon la valeur finale de `statut_abonnement` :

| Valeur Normalisée | Couleur | Fond | Texte | Bordure |
|------------------|---------|------|-------|---------|
| `'artisan'` | 🟣 Mauve | `#4A1D43` | Blanc | Or `#D4AF37` |
| `'premium'` | 🟢 Vert | `#064E3B` | Blanc | Or `#D4AF37` |
| `'elite'` / `'pro'` | ⚫ Noir | `#121212` | Blanc | Or `#D4AF37` |
| `NULL` / `''` | ⚪ Blanc | `#FFFFFF` | Noir | Or `#D4AF37` |

---

## 🧪 Tests à Effectuer

### Test 1: Vérifier les colonnes disponibles

```sql
SELECT
  id,
  nom,
  "Statut Abonnement",
  type_abonnement,
  subscription_tier
FROM entreprise
WHERE secteur = 'entreprise'
LIMIT 10;
```

**Résultat attendu:** Voir les valeurs de chaque colonne.

---

### Test 2: Créer des entreprises de test avec différentes sources

```sql
-- Entreprise avec Whalesync uniquement
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone,
  "Statut Abonnement"
) VALUES (
  'TEST Whalesync Artisan', 'entreprise', 'Test', 'Tunis', 'Tunis', '71000001',
  'artisan'
);

-- Entreprise avec fallback type_abonnement
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone,
  type_abonnement
) VALUES (
  'TEST Fallback Premium', 'entreprise', 'Test', 'Tunis', 'Tunis', '71000002',
  'premium'
);

-- Entreprise avec fallback subscription_tier
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone,
  subscription_tier
) VALUES (
  'TEST Fallback Elite', 'entreprise', 'Test', 'Tunis', 'Tunis', '71000003',
  'Elite Pro'
);

-- Entreprise sans abonnement (découverte)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone
) VALUES (
  'TEST Découverte', 'entreprise', 'Test', 'Tunis', 'Tunis', '71000004'
);
```

---

### Test 3: Vérifier les logs dans la Console (F12)

Après avoir rechargé `/entreprises`, vous devez voir :

```
[fetchBusinesses] ✅ Données récupérées de Supabase: X entreprises
[fetchBusinesses] 📊 Colonnes abonnement récupérées: {
  id: "...",
  nom: "TEST Whalesync Artisan",
  statut_abonnement_whalesync: "artisan",    ← Donnée Whalesync
  type_abonnement: null,
  subscription_tier: null,
  is_premium: false
}

[CompanyCard TEST Whalesync Artisan] {
  statut_abonnement_FINAL: "artisan",        ← Valeur finale utilisée
  niveau_abonnement: null,
  type_abonnement: null,
  subscription_tier: null,
  normalized: "artisan",
  source: "✅ Whalesync"                      ← Source identifiée
}

[CompanyCard TEST Fallback Premium] {
  statut_abonnement_FINAL: "premium",
  niveau_abonnement: "premium",
  type_abonnement: "premium",
  subscription_tier: null,
  normalized: "premium",
  source: "⚠️ Fallback type"                  ← Fallback utilisé
}
```

---

### Test 4: Vérifier l'affichage visuel

Après le test SQL ci-dessus, vous devez voir sur `/entreprises` :

| Entreprise | Couleur Carte | Badge | Source |
|-----------|---------------|-------|--------|
| TEST Whalesync Artisan | 🟣 Mauve | ⭐ ARTISAN | Whalesync |
| TEST Fallback Premium | 🟢 Vert | ⭐ PREMIUM | type_abonnement |
| TEST Fallback Elite | ⚫ Noir | ⭐ ELITE | subscription_tier |
| TEST Découverte | ⚪ Blanc | (aucun) | NULL |

---

## 🔄 Scénarios de Synchronisation Whalesync

### Scénario 1: Whalesync sync une nouvelle entreprise

```
1. Airtable: Nouvelle ligne créée avec "Statut Abonnement" = "artisan"
   ↓
2. Whalesync: Synchronise vers Supabase
   ↓
3. PostgreSQL: INSERT avec "Statut Abonnement" = "artisan"
   ↓
4. Application: Détecte statut_abonnement_whalesync = "artisan"
   ↓
5. Résultat: Carte MAUVE affichée ✅
```

### Scénario 2: Migration d'entreprises existantes

```
État actuel:
  - "Statut Abonnement" = NULL
  - type_abonnement = "premium"
  ↓ Application utilise le fallback
Résultat: Carte VERTE ✅

Après Whalesync:
  - "Statut Abonnement" = "Elite Pro"  ← Whalesync met à jour
  - type_abonnement = "premium"         ← Reste inchangé
  ↓ Application prioritise Whalesync
Résultat: Carte NOIRE ✅
```

### Scénario 3: Entreprise sans abonnement

```
État:
  - "Statut Abonnement" = NULL
  - type_abonnement = NULL
  - subscription_tier = NULL
  ↓
Résultat: Carte BLANCHE (découverte) ✅
```

---

## 🛠️ Maintenance et Monitoring

### Compter les sources de données

```sql
SELECT
  COUNT(*) FILTER (WHERE "Statut Abonnement" IS NOT NULL) AS whalesync_count,
  COUNT(*) FILTER (WHERE "Statut Abonnement" IS NULL AND type_abonnement IS NOT NULL) AS fallback_type_count,
  COUNT(*) FILTER (WHERE "Statut Abonnement" IS NULL AND type_abonnement IS NULL AND subscription_tier IS NOT NULL) AS fallback_tier_count,
  COUNT(*) FILTER (WHERE "Statut Abonnement" IS NULL AND type_abonnement IS NULL AND subscription_tier IS NULL) AS no_data_count,
  COUNT(*) AS total
FROM entreprise
WHERE secteur = 'entreprise';
```

**Résultat attendu :**
```
| whalesync_count | fallback_type | fallback_tier | no_data | total |
|-----------------|---------------|---------------|---------|-------|
| 5               | 10            | 2             | 33      | 50    |
```

---

### Vérifier la cohérence des données

```sql
-- Entreprises avec des valeurs différentes entre les colonnes
SELECT
  id,
  nom,
  "Statut Abonnement" as whalesync,
  type_abonnement,
  subscription_tier
FROM entreprise
WHERE secteur = 'entreprise'
  AND (
    ("Statut Abonnement" IS NOT NULL AND type_abonnement IS NOT NULL AND "Statut Abonnement" != type_abonnement)
    OR
    ("Statut Abonnement" IS NOT NULL AND subscription_tier IS NOT NULL AND "Statut Abonnement" != subscription_tier)
  );
```

Si ce résultat retourne des lignes, il y a des **incohérences** entre les sources.

---

## 📊 Console JavaScript - Statistiques en Direct

Collez ce code dans la console (F12) pour voir les statistiques des cartes :

```javascript
const cards = document.querySelectorAll('[style*="backgroundColor"]');
const stats = {
  whalesync: 0,
  fallback_niveau: 0,
  fallback_type: 0,
  fallback_tier: 0,
  no_data: 0,
  by_color: {}
};

cards.forEach(card => {
  const bg = card.style.backgroundColor;

  // Compter par couleur
  let tier = 'AUTRE';
  if (bg === 'rgb(74, 29, 67)') tier = '🟣 ARTISAN';
  else if (bg === 'rgb(6, 78, 59)') tier = '🟢 PREMIUM';
  else if (bg === 'rgb(18, 18, 18)') tier = '⚫ ELITE';
  else if (bg === 'rgb(255, 255, 255)') tier = '⚪ DECOUVERTE';

  stats.by_color[tier] = (stats.by_color[tier] || 0) + 1;
});

console.log('📊 Statistiques des Cartes:');
console.table(stats.by_color);
```

**Résultat attendu :**
```
┌────────────────┬─────────┐
│    (index)     │ Values  │
├────────────────┼─────────┤
│ ⚪ DECOUVERTE   │   40    │
│ 🟣 ARTISAN     │    5    │
│ 🟢 PREMIUM     │    3    │
│ ⚫ ELITE        │    2    │
└────────────────┴─────────┘
```

---

## ✅ Checklist de Validation

- [ ] Les 3 colonnes sont bien récupérées dans les requêtes SQL
- [ ] La console affiche les logs avec les 3 sources
- [ ] Le système de fallback fonctionne (testé avec des INSERT)
- [ ] Les cartes affichent les bonnes couleurs selon la source
- [ ] Le badge "source" dans la console est correct
- [ ] Après une sync Whalesync, la valeur Whalesync prend le dessus
- [ ] Les entreprises sans données affichent une carte blanche

---

## 🚨 Résolution de Problèmes

### Problème 1: Colonne "Statut Abonnement" non trouvée

**Solution:**
```sql
-- Créer la colonne si elle n'existe pas
ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS "Statut Abonnement" text;
```

### Problème 2: Les couleurs ne changent pas

**Vérifier:**
1. La console affiche-t-elle les logs `[CompanyCard]` ?
2. La valeur `normalized` est-elle correcte ?
3. Le cache du navigateur (CTRL+SHIFT+R pour forcer le refresh)

### Problème 3: Whalesync écrase les autres colonnes

**C'est normal !** Le système de fallback est conçu pour que Whalesync soit prioritaire. Si vous ne voulez pas que Whalesync écrase, configurez Whalesync pour ne PAS synchroniser les colonnes `type_abonnement` et `subscription_tier`.

---

## 📝 Notes Importantes

1. **NE PAS TOUCHER** aux réglages Whalesync - Ce système s'adapte automatiquement
2. **Colonne principale:** `"Statut Abonnement"` (avec guillemets dans SQL)
3. **Fallback automatique:** L'application gère tout automatiquement
4. **Pas de migration nécessaire:** Les anciennes données fonctionnent toujours
5. **Compatible avec Whalesync:** Dès que Whalesync sync, la donnée Whalesync est utilisée

---

## 🎓 Résumé pour les Développeurs

```typescript
// Logique simplifiée
const getAbonnement = (business) => {
  return (
    business.statut_abonnement_whalesync ||  // ← Whalesync (priorité)
    business.type_abonnement ||               // ← Fallback 1
    business.subscription_tier ||             // ← Fallback 2
    null                                      // ← Découverte
  );
};

// Mapping couleurs
const getColor = (abonnement) => {
  const normalized = (abonnement || '').toLowerCase().replace(/[\s_-]/g, '');

  if (normalized.includes('artisan')) return MAUVE;
  if (normalized.includes('premium')) return VERT;
  if (normalized.includes('elite') || normalized.includes('pro')) return NOIR;
  return BLANC; // découverte
};
```

**C'est tout !** Le système fonctionne automatiquement et garantit qu'une carte aura toujours la bonne couleur, peu importe la source de données.
