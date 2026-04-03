# Guide Rapide - Système de Tiers d'Abonnement

## Démarrage Rapide

Le système de couleurs Elite s'applique **automatiquement** selon le champ `subscription_tier` dans la base de données.

### Mettre à jour le tier d'une entreprise

```sql
-- Dans Supabase SQL Editor ou via votre client SQL

-- Passer en Artisan (Mauve)
UPDATE entreprise
SET subscription_tier = 'artisan'
WHERE id = 'uuid-de-votre-entreprise';

-- Passer en Premium (Vert)
UPDATE entreprise
SET subscription_tier = 'premium'
WHERE id = 'uuid-de-votre-entreprise';

-- Passer en Élite Pro (Anthracite)
UPDATE entreprise
SET subscription_tier = 'elite'
WHERE id = 'uuid-de-votre-entreprise';
```

### Valeurs Possibles

| Valeur BDD | Tier Visuel | Couleur | Bordure |
|------------|-------------|---------|---------|
| `'gratuit'` ou `'decouverte'` | Découverte | Gris clair `#F8FAFC` | Dorée fine (1px) |
| `'artisan'` | Artisan | Mauve `#4A1D43` | Dorée épaisse (2px) + lueur |
| `'premium'` | Premium | Vert `#064E3B` | Dorée épaisse (2px) + lueur |
| `'elite'` ou `'elite_pro'` | Élite Pro | Anthracite `#121212` | Dorée épaisse (2px) + lueur |
| `'custom'` | Custom | Gris clair `#F9FAFB` | Pointillée grise (2px) |

## Tester le Système

### 1. Exécuter le script de démonstration

```bash
# Dans le dossier du projet
cat DEMO_TIERS_ABONNEMENT.sql
```

Copiez et exécutez les requêtes dans Supabase SQL Editor.

### 2. Vérifier visuellement

1. Ouvrez votre application
2. Allez sur la page `/businesses` ou `/partner-search`
3. Les cartes d'entreprises afficheront automatiquement les bonnes couleurs

### 3. Vérifier une entreprise spécifique

```sql
SELECT nom, ville, subscription_tier
FROM entreprise
WHERE nom ILIKE '%votre-recherche%';
```

## Exemple Complet

### Créer une entreprise Artisan

```sql
INSERT INTO entreprise (
  nom,
  ville,
  categories,
  description,
  telephone,
  email,
  site_web,
  subscription_tier
) VALUES (
  'Restaurant Le Gourmet',
  'Tunis',
  'Restaurant, Gastronomie',
  'Restaurant gastronomique français au cœur de Tunis',
  '+216 71 123 456',
  'contact@legourmet.tn',
  'https://legourmet.tn',
  'artisan'  -- ← Cette ligne détermine la couleur !
);
```

### Passer une entreprise existante en Premium

```sql
-- Trouver l'entreprise
SELECT id, nom, subscription_tier
FROM entreprise
WHERE nom ILIKE '%gourmet%';

-- La mettre à jour
UPDATE entreprise
SET subscription_tier = 'premium'
WHERE id = 'uuid-trouvé-ci-dessus';
```

## Vérification Rapide

```sql
-- Voir toutes les entreprises premium
SELECT nom, ville, subscription_tier
FROM entreprise
WHERE subscription_tier IN ('artisan', 'premium', 'elite');

-- Compter par tier
SELECT subscription_tier, COUNT(*)
FROM entreprise
GROUP BY subscription_tier;
```

## Intégration Stripe (Future)

Quand vous intégrerez Stripe, mettez à jour automatiquement :

```typescript
// Après validation du paiement Stripe
await supabase
  .from('entreprise')
  .update({ subscription_tier: 'artisan' })
  .eq('id', businessId);
```

## Composants Concernés

Le système s'applique automatiquement à :
- ✓ `BusinessDirectory` (Liste des entreprises)
- ✓ `BusinessList` (Annuaire citoyen)
- ✓ `PartnerSearch` (Recherche de partenaires)
- ✓ Page `Subscription` (Tarifs)

## Dépannage

### Les couleurs ne s'affichent pas

1. Vérifiez la valeur dans la BDD :
```sql
SELECT id, nom, subscription_tier
FROM entreprise
WHERE id = 'votre-id';
```

2. Vérifiez que la valeur est valide (voir tableau ci-dessus)

3. Rafraîchissez la page (Ctrl+F5)

### Erreur de contrainte

```
ERROR: new row for relation "entreprise" violates check constraint
```

**Solution :** Utilisez uniquement les valeurs autorisées :
- `'gratuit'`, `'decouverte'`, `'artisan'`, `'premium'`, `'elite'`, `'elite_pro'`, `'custom'`

## Documentation Complète

- **Architecture :** `SYSTEME_TIERS_DYNAMIQUE_2026.md`
- **Design :** `SYSTEME_COULEURS_ELITE_2026.md`
- **Signature Or :** `SYSTEME_SIGNATURE_OR_2026.md`

## Support

En cas de problème :
1. Consultez la documentation complète
2. Vérifiez la structure de la BDD
3. Testez avec le script `DEMO_TIERS_ABONNEMENT.sql`

---

**Version :** 1.0
**Date :** 3 février 2026
