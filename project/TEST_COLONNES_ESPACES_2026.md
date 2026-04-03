# Test des colonnes avec espaces - 27 février 2026

## Vérification complète des corrections

### ✅ Fichiers corrigés

#### 1. PremiumPartnersSection.tsx
```typescript
// Interface
interface PremiumPartner {
  'statut abonnement': string | null;
  'niveau priorité abonnement': number | null;
}

// Requête principale (ligne 36)
.select('id, nom, ville, image_url, logo_url, categorie, "statut abonnement", "niveau priorité abonnement", note_moyenne, "mise en avant pub"')
.eq('"mise en avant pub"', true)
.order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })

// Requête fallback (ligne 66)
.select('id, nom, ville, image_url, logo_url, categorie, "statut abonnement", "niveau priorité abonnement", note_moyenne')
.or('"mise en avant pub".is.null,"mise en avant pub".eq.false')
.or('"statut abonnement".ilike.%Elite Pro%,"statut abonnement".ilike.%Premium%,"statut abonnement".ilike.%Elite%')
.order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })

// Split image (ligne 159)
const firstImageUrl = partner.image_url ? parseImageUrls(partner.image_url)[0] : null;

// Accès propriété (ligne 157)
const badge = getBadgeConfig(partner['statut abonnement']);
```

#### 2. LocalBusinessesSection.tsx
```typescript
// Interface
interface LocalBusiness {
  'page commerce local': boolean | null;
}

// Requête (ligne 33)
.select('id, nom, ville, image_url, logo_url, categorie, "page commerce local"')
.eq('"page commerce local"', true)

// Split image (ligne 96)
const firstImageUrl = business.image_url ? parseImageUrls(business.image_url)[0] : null;
```

#### 3. FeaturedBusinessesStrip.tsx
```typescript
// Interface
interface BusinessRow {
  'statut abonnement': string | null;
}

// Requête (ligne 138)
.select('id, nom, ville, gouvernorat, sous_categories, "statut abonnement", image_url, logo_url, horaires_ok')

// Mapping (ligne 164)
statutAbonnement: row['statut abonnement'] || null,
```

#### 4. Businesses.tsx
```typescript
// Requête principale (ligne 220)
.select('id, nom, secteur, sous_categories, categorie, gouvernorat, ville, adresse, telephone, email, site_web, description, services, image_url, logo_url, "statut abonnement", "niveau priorité abonnement", badges_entreprise, mots_cles_recherche, "Lien Instagram", "lien facebook", "Lien TikTok", "Lien LinkedIn", "Lien YouTube", lien_x, horaires_ok')
.order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
```

#### 5. BusinessDetail.tsx
```typescript
// Toutes les requêtes utilisent maintenant "statut abonnement"
.select('id, nom, categorie, sous_categories, ville, description, image_url, "statut abonnement"')

// Mapping
statut_abonnement: (data['statut abonnement'] || '').trim().toLowerCase() || null,
```

#### 6. CitizensShops.tsx
```typescript
// Requête (ligne 51)
.eq('"page commerce local"', true)
```

---

## Syntaxe de test SQL

Pour tester directement dans Supabase :

```sql
-- Test 1: Vérifier les colonnes
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'entreprise'
AND column_name IN (
  'statut abonnement',
  'niveau priorité abonnement',
  'mise en avant pub',
  'page commerce local'
);
-- Doit retourner 4 lignes

-- Test 2: Requête avec espaces
SELECT id, nom, "statut abonnement", "mise en avant pub"
FROM entreprise
WHERE "mise en avant pub" = true
LIMIT 5;

-- Test 3: Compter les commerces locaux
SELECT COUNT(*) as total
FROM entreprise
WHERE "page commerce local" = true;

-- Test 4: Compter les entreprises mises en avant
SELECT COUNT(*) as total
FROM entreprise
WHERE "mise en avant pub" = true;
```

---

## Tests dans la console navigateur

### Test PremiumPartnersSection

Ouvrir la page d'accueil et vérifier dans la console :

```
[PremiumPartnersSection] 🔍 Recherche des entreprises avec "mise en avant pub"...
[PremiumPartnersSection] 📊 Données à la une: {count: X, data: [...]}
```

**Résultat attendu :**
- Pas d'erreur 400
- Section "Établissements à la Une" affichée avec 4 cartes
- Images affichées correctement (pas de 404)

---

### Test LocalBusinessesSection

Ouvrir la page Citizens > Magasins et vérifier :

```
[LocalBusinessesSection] 🔍 Recherche des commerces locaux...
[LocalBusinessesSection] 📊 Données commerces locaux: {count: X, data: [...]}
```

**Résultat attendu :**
- Pas d'erreur 400
- Section "Commerces Locaux" affichée
- Images affichées correctement

---

## Checklist de validation

### Page d'accueil (/)
- [ ] Section "Établissements à la Une" visible
- [ ] 4 cartes d'entreprises affichées
- [ ] Images chargées correctement
- [ ] Badge Elite/Premium visible
- [ ] Pas d'erreur 400 dans la console
- [ ] Pas d'erreur 404 sur les images

### Page Citizens > Magasins (/citizens-shops)
- [ ] Section "Commerces Locaux" visible
- [ ] 6 cartes de commerces affichées
- [ ] Badge "Local" visible
- [ ] Images chargées correctement
- [ ] Pas d'erreur 400 dans la console

### Page Entreprises (/businesses)
- [ ] Liste des entreprises triées par priorité
- [ ] Ordre : Elite > Premium > Artisan > Découverte
- [ ] Pas d'erreur 400 dans la console

---

## Erreurs à surveiller

### ❌ Erreur 400 : Colonne inexistante
```
error: {
  code: "42703",
  message: "column \"statut_abonnement\" does not exist"
}
```

**Cause :** Nom de colonne sans guillemets ou avec underscore

**Solution :** Utiliser `"statut abonnement"` avec guillemets

---

### ❌ Erreur 404 : Image non trouvée
```
GET https://ik.imagekit.io/url1.jpg,url2.jpg,url3.jpg 404
```

**Cause :** Plusieurs URLs non splitées

**Solution :** Utiliser `parseImageUrls(imageUrl)[0]`

---

## Commandes de vérification

```bash
# Build réussit
npm run build
# ✓ built in 17.15s

# Rechercher les colonnes avec underscore (ne doit rien trouver)
grep -r "statut_abonnement" src/
grep -r "mise_en_avant_pub" src/
grep -r "page_commerce_local" src/

# Vérifier les guillemets dans les requêtes
grep -r '"statut abonnement"' src/
grep -r '"mise en avant pub"' src/
grep -r '"page commerce local"' src/
```

---

## Résumé des colonnes concernées

| Nom exact | Type | Utilisation |
|-----------|------|-------------|
| `statut abonnement` | string | Niveau d'abonnement (Elite, Premium, etc.) |
| `niveau priorité abonnement` | integer | Priorité de tri (1-4) |
| `mise en avant pub` | boolean | Marquer pour section "À la Une" |
| `page commerce local` | boolean | Marquer comme commerce local |

**Important :** Toujours utiliser des **doubles guillemets** dans les requêtes Supabase.

---

## Syntaxe correcte vs incorrecte

### ❌ INCORRECT
```typescript
.select('statut_abonnement, mise_en_avant_pub')
.eq('statut_abonnement', 'Elite')
business.statut abonnement  // Erreur de syntaxe JS
```

### ✅ CORRECT
```typescript
// Dans les requêtes SQL
.select('"statut abonnement", "mise en avant pub"')
.eq('"statut abonnement"', 'Elite')

// Dans les interfaces TypeScript
'statut abonnement': string | null;

// Pour accéder aux propriétés
business['statut abonnement']
```

---

**Build :** ✅ Réussi
**Erreurs 400 :** ✅ Corrigées
**Images 404 :** ✅ Corrigées
**Prêt pour le test :** ✅ Oui

---

*Document de test créé le 27 février 2026*
