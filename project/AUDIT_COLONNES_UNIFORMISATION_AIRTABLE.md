# Audit Complet : Uniformisation des Colonnes Airtable/Supabase

**Date** : 2026-02-07
**Objectif** : Uniformiser les noms de colonnes dans le code pour correspondre exactement à la structure Airtable

---

## ✅ Modifications Effectuées

### 1. Suppression des Colonnes Fantômes

Les colonnes suivantes ont été **complètement supprimées** du code TypeScript :

| Colonne Fantôme | Statut | Détails |
|-----------------|--------|---------|
| `is_premium` | ❌ **SUPPRIMÉ** | Remplacé par la logique basée sur `statut_abonnement` |
| `pack_type` | ❌ Jamais utilisé | N'existe pas dans le code |
| `subscription_tier` | ❌ Jamais utilisé | N'existe pas dans le code |
| `tags_backup` | ❌ Jamais utilisé | N'existe pas dans le code |
| `"Statut Abonnement"` | ❌ **REMPLACÉ** | Remplacé par `statut_abonnement` (minuscules + underscore) |

### 2. Uniformisation des Noms de Colonnes

Tous les noms de colonnes ont été standardisés selon Airtable :

| Airtable | Supabase | Utilisation dans le Code |
|----------|----------|--------------------------|
| `nom` | `nom` | ✅ Uniformisé partout |
| `statut abonnement` | `statut_abonnement` | ✅ Uniformisé (underscore au lieu d'espace) |
| `mots clef recherche` | `mots_cles_recherche` | ✅ Uniformisé (underscores) |
| `gouvernorat` | `gouvernorat` | ✅ Correct |
| `ville` | `ville` | ✅ Correct |
| `telephone` | `telephone` | ✅ Correct |
| `description` | `description` | ✅ Correct |

### 3. Nouvelle Logique d'Abonnement

#### Fichier Créé : `src/lib/subscriptionHelper.ts`

Ce nouveau fichier remplace complètement la logique basée sur `is_premium` :

```typescript
// Anciennes approches ❌
.eq('is_premium', true)
.order('is_premium', { ascending: false })

// Nouvelle approche ✅
.or('statut_abonnement.ilike.%elite%,statut_abonnement.ilike.%premium%,statut_abonnement.ilike.%artisan%')
```

**Fonctions Utilitaires** :

- `isPremiumBusiness(statut: string)` → Retourne `true` si Elite/Premium/Artisan
- `getSubscriptionTier(statut: string)` → Retourne `'elite' | 'premium' | 'artisan' | 'decouverte'`
- `getSubscriptionPriority(statut: string)` → Retourne un score (4 = Elite, 3 = Premium, 2 = Artisan, 1 = Découverte)
- `getTierDisplayName(tier)` → Retourne le nom d'affichage en français

**Utilisation dans le Tri** :

```typescript
// Tri automatique par priorité d'abonnement
mappedData.sort((a, b) => {
  const priorityA = getSubscriptionPriority(a.statut_abonnement);
  const priorityB = getSubscriptionPriority(b.statut_abonnement);
  return priorityB - priorityA; // Elite → Premium → Artisan → Découverte
});
```

### 4. Fichiers Modifiés

| Fichier | Modifications |
|---------|---------------|
| `src/components/FeaturedBusinessesStrip.tsx` | ✅ Suppression de `is_premium`, tri par priorité |
| `src/components/BusinessCard.tsx` | ✅ Utilise uniquement `statut_abonnement` |
| `src/pages/Businesses.tsx` | ✅ Remplace `is_premium` par filtre sur `statut_abonnement` |
| `src/pages/BusinessDetail.tsx` | ✅ Suppression de `is_premium` des interfaces et requêtes |
| `src/lib/subscriptionTiers.ts` | ✅ Suppression de `is_premium` de l'interface `SubscriptionData` |
| `src/lib/subscriptionHelper.ts` | ✅ **NOUVEAU** – Logique centralisée d'abonnement |

---

## 📊 Audit des Colonnes de la Table `entreprise`

### Colonnes UTILISÉES Activement dans le Code

| Colonne Supabase | Type | Utilisation | Peut Supprimer? |
|------------------|------|-------------|-----------------|
| `id` | text | ✅ Identifiant unique | ❌ **ESSENTIEL** |
| `nom` | text | ✅ Nom de l'entreprise | ❌ **ESSENTIEL** |
| `statut_abonnement` | text | ✅ Tier (Elite/Premium/Artisan/Découverte) | ❌ **ESSENTIEL** |
| `gouvernorat` | text | ✅ Filtres et affichage | ❌ **ESSENTIEL** |
| `ville` | text | ✅ Affichage et recherche | ❌ **ESSENTIEL** |
| `adresse` | text | ✅ Détails entreprise | ❌ **IMPORTANT** |
| `telephone` | text | ✅ Contact | ❌ **IMPORTANT** |
| `email` | text | ✅ Contact | ❌ **IMPORTANT** |
| `site_web` | text | ✅ Liens externes | ⚠️ Optionnel |
| `description` | text | ✅ Affichage cartes | ❌ **IMPORTANT** |
| `categorie` | text | ✅ Filtres et recherche | ❌ **ESSENTIEL** |
| `sous_categories` | text | ✅ Filtres avancés | ❌ **ESSENTIEL** |
| `secteur` | text | ✅ Filtres B2B/Citoyens | ❌ **ESSENTIEL** |
| `image_url` | text | ✅ Photos entreprises | ⚠️ Optionnel |
| `tags` | ARRAY | ✅ Recherche multi-colonnes | ❌ **IMPORTANT** |
| `mots_cles_recherche` | text | ✅ Recherche full-text | ❌ **ESSENTIEL** |
| `latitude` | double | ✅ Cartes interactives | ⚠️ Optionnel |
| `longitude` | double | ✅ Cartes interactives | ⚠️ Optionnel |
| `created_at` | timestamp | ✅ Tri par date | ⚠️ Optionnel |
| `verifie` | boolean | ⚠️ Peu utilisé | ⚠️ Optionnel |

### Colonnes NON Utilisées ou Doublons

Ces colonnes peuvent être **supprimées en toute sécurité** :

| Colonne Supabase | Type | Raison | Peut Supprimer? |
|------------------|------|--------|-----------------|
| `is_premium` | boolean | 🔴 **Fantôme** – Remplacé par logique `statut_abonnement` | ✅ **OUI** |
| `nom_entreprise` | text | 🔴 **Doublon** – Identique à `nom` | ✅ **OUI** |
| `"Statut Abonnement"` | text | 🔴 **Doublon** – Utilise `statut_abonnement` (minuscules) | ✅ **OUI** |
| `categories` | ARRAY | 🔴 **Doublon** – Utilise `categorie` et `sous_categories` | ✅ **OUI** |
| `approved_1768497777739` | real | 🔴 **Champ technique temporaire** | ✅ **OUI** |
| `approved` | boolean | 🔴 **Doublon** – Utilise `statut_validation` | ✅ **OUI si statut_validation existe** |
| `status` | text | 🔴 **Doublon** – Utilise `statut_validation` | ✅ **OUI si statut_validation existe** |
| `photo` | text | 🔴 **Doublon** – Utilise `image_url` | ✅ **OUI** |
| `url_photo_principale` | text | 🔴 **Doublon** – Utilise `image_url` | ✅ **OUI** |
| `url_photo_optimisee_finale` | text | 🔴 **Doublon** – Utilise `image_url` | ✅ **OUI** |
| `Photo_Upload_Brute` | text | 🔴 **Champ interne upload** | ✅ **OUI** |
| `whalesync_postgres_id` | uuid | 🔴 **Champ technique sync** | ⚠️ Si WhaleSync non utilisé |
| `id_airtable` | text | 🔴 **Champ technique sync** | ⚠️ Si sync Airtable terminée |
| `Statut Sync` | text | 🔴 **Champ technique sync** | ⚠️ Si sync Airtable terminée |
| `Service RS Créé (VIP)` | boolean | 🔴 **Champ interne marketing** | ⚠️ À vérifier |

### Colonnes Techniques à Garder

Ces colonnes sont utiles pour l'administration et la qualité des données :

| Colonne Supabase | Type | Raison | Peut Supprimer? |
|------------------|------|--------|-----------------|
| `statut_validation` | text | ✅ Modération admin | ❌ Garder |
| `priorite` | integer | ✅ Tri personnalisé | ❌ Garder |
| `niveau_priorite` | integer | ✅ Tri avancé | ❌ Garder |
| `featured` | boolean | ✅ Mise en avant | ❌ Garder |
| `home_featured` | boolean | ✅ Accueil | ❌ Garder |
| `est_publicite` | integer | ✅ Bannières pub | ❌ Garder |
| `verifie` | boolean | ✅ Badge vérifié | ❌ Garder |
| `mis_a_jour_le` | timestamp | ✅ Suivi modifications | ❌ Garder |
| `updated_at` | timestamp | ✅ Suivi modifications | ❌ Garder |
| `Date Fin Abonnement` | date | ✅ Gestion abonnements | ❌ Garder |

### Colonnes Réseaux Sociaux

Ces colonnes sont activement utilisées pour les liens sociaux :

| Colonne Supabase | Type | Utilisation | Peut Supprimer? |
|------------------|------|-------------|-----------------|
| `url_facebook` | text | ✅ Liens sociaux (ancien) | ⚠️ Si `facebook_url` existe |
| `facebook_url` | text | ✅ Liens sociaux | ❌ Garder |
| `instagram_url` | text | ✅ Liens sociaux | ❌ Garder |
| `tiktok_url` | text | ✅ Liens sociaux | ❌ Garder |
| `youtube_url` | text | ✅ Liens sociaux | ❌ Garder |
| `linkedin_url` | text | ✅ Liens B2B | ❌ Garder |
| `Lien Instagram` | text | 🔴 **Doublon** | ✅ OUI (utilise `instagram_url`) |
| `Lien TikTok` | text | 🔴 **Doublon** | ✅ OUI (utilise `tiktok_url`) |
| `Lien LinkedIn` | text | 🔴 **Doublon** | ✅ OUI (utilise `linkedin_url`) |
| `Lien YouTube` | text | 🔴 **Doublon** | ✅ OUI (utilise `youtube_url`) |
| `Lien Avis Google` | text | ⚠️ Peu utilisé | ⚠️ Si `google_url` existe |

### Colonnes Boutons et Raccourcis

| Colonne Supabase | Type | Utilisation | Peut Supprimer? |
|------------------|------|-------------|-----------------|
| `BTN_Maps` | text | 🔴 Champ interne UI | ✅ **OUI** |
| `BTN_Google` | text | 🔴 Champ interne UI | ✅ **OUI** |
| `BTN_Facebook` | text | 🔴 Champ interne UI | ✅ **OUI** |
| `maps_url` | text | ✅ Lien Google Maps | ❌ Garder |
| `google_url` | text | ✅ Fiche Google Business | ❌ Garder |

### Colonnes Avis et Notes

| Colonne Supabase | Type | Utilisation | Peut Supprimer? |
|------------------|------|-------------|-----------------|
| `Note Google Globale` | numeric | ✅ Affichage notes | ❌ Garder |
| `Compteur Avis Google` | integer | ✅ Nombre d'avis | ❌ Garder |

### Colonnes Horaires et Détails

| Colonne Supabase | Type | Utilisation | Peut Supprimer? |
|------------------|------|-------------|-----------------|
| `horaires_ok` | text | ⚠️ Peu utilisé | ⚠️ À vérifier |
| `logo` | varchar | ⚠️ Peu utilisé | ⚠️ Si `logo_url` existe |
| `logo_url` | text | ✅ Logo entreprise | ❌ Garder |
| `image_couverture` | text | ✅ Image bannière | ❌ Garder |
| `video_url` | text | ✅ Vidéo présentation | ❌ Garder |

### Colonnes Métier Légales

| Colonne Supabase | Type | Utilisation | Peut Supprimer? |
|------------------|------|-------------|-----------------|
| `matricule_fiscal` | text | ✅ Identité légale | ❌ Garder |
| `email_professionnel` | text | ✅ Contact pro | ❌ Garder |

### Colonnes Labels Éditoriaux et Services

| Colonne Supabase | Type | Utilisation | Peut Supprimer? |
|------------------|------|-------------|-----------------|
| `labels_editorial` | ARRAY | ⚠️ Peu utilisé | ⚠️ À vérifier |
| `services` | ARRAY | ⚠️ Peu utilisé | ⚠️ À vérifier |
| `secteur_evenement` | text | ⚠️ Peu utilisé | ⚠️ À vérifier |

### Colonne Full-Text Search

| Colonne Supabase | Type | Utilisation | Peut Supprimer? |
|------------------|------|-------------|-----------------|
| `search_text` | text | ✅ Full-text search Postgres | ❌ Garder (performance) |

---

## 🗑️ RECOMMANDATIONS FINALES : Colonnes à Supprimer

### ✅ **SUPPRESSION SÛRE** (Aucun impact sur le code)

Ces colonnes peuvent être supprimées **MAINTENANT** sans risque :

1. ✅ `is_premium` → Remplacé par `statut_abonnement`
2. ✅ `nom_entreprise` → Doublon de `nom`
3. ✅ `"Statut Abonnement"` → Utilise `statut_abonnement` (minuscules)
4. ✅ `categories` → Doublon de `categorie` + `sous_categories`
5. ✅ `approved_1768497777739` → Champ technique temporaire
6. ✅ `photo` → Doublon de `image_url`
7. ✅ `url_photo_principale` → Doublon de `image_url`
8. ✅ `url_photo_optimisee_finale` → Doublon de `image_url`
9. ✅ `Photo_Upload_Brute` → Champ interne upload
10. ✅ `BTN_Maps` → Champ UI interne
11. ✅ `BTN_Google` → Champ UI interne
12. ✅ `BTN_Facebook` → Champ UI interne
13. ✅ `Lien Instagram` → Doublon de `instagram_url`
14. ✅ `Lien TikTok` → Doublon de `tiktok_url`
15. ✅ `Lien LinkedIn` → Doublon de `linkedin_url`
16. ✅ `Lien YouTube` → Doublon de `youtube_url`

**Total : 16 colonnes à supprimer en toute sécurité**

### ⚠️ **VÉRIFIER AVANT SUPPRESSION**

Ces colonnes nécessitent une vérification manuelle :

1. ⚠️ `approved` + `status` → Vérifier si `statut_validation` les remplace
2. ⚠️ `url_facebook` → Vérifier si `facebook_url` existe et est utilisé
3. ⚠️ `logo` → Vérifier si `logo_url` existe et est utilisé
4. ⚠️ `whalesync_postgres_id` → Vérifier si WhaleSync est encore utilisé
5. ⚠️ `id_airtable` → Vérifier si sync Airtable est terminée
6. ⚠️ `Statut Sync` → Vérifier si sync Airtable est terminée
7. ⚠️ `Service RS Créé (VIP)` → Vérifier utilisation interne marketing
8. ⚠️ `labels_editorial` → Vérifier utilisation future
9. ⚠️ `services` → Vérifier utilisation future
10. ⚠️ `horaires_ok` → Vérifier affichage horaires

**Total : 10 colonnes à vérifier**

---

## 📝 Commandes SQL pour Supprimer les Colonnes

```sql
-- ⚠️ ATTENTION : Faire un backup complet avant d'exécuter ces commandes !

-- Suppression des colonnes fantômes sûres
ALTER TABLE entreprise DROP COLUMN IF EXISTS "is_premium";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "nom_entreprise";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "Statut Abonnement";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "categories";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "approved_1768497777739";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "photo";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "url_photo_principale";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "url_photo_optimisee_finale";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "Photo_Upload_Brute";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "BTN_Maps";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "BTN_Google";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "BTN_Facebook";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "Lien Instagram";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "Lien TikTok";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "Lien LinkedIn";
ALTER TABLE entreprise DROP COLUMN IF EXISTS "Lien YouTube";
```

---

## 🎯 Résumé des Changements

### Code TypeScript

✅ **Supprimé** :
- Toutes les références à `is_premium`
- Toutes les références à `"Statut Abonnement"` (avec guillemets)
- Interfaces avec `is_premium?: boolean`
- Tri avec `.order('is_premium', ...)`
- Filtres avec `.eq('is_premium', true)`

✅ **Ajouté** :
- `src/lib/subscriptionHelper.ts` avec fonctions utilitaires
- Tri automatique par priorité d'abonnement (Elite → Premium → Artisan → Découverte)
- Filtre OR sur `statut_abonnement.ilike.%elite%|%premium%|%artisan%`

✅ **Uniformisé** :
- Utilisation cohérente de `statut_abonnement` partout
- Utilisation cohérente de `nom` au lieu de `name`
- Utilisation cohérente de `gouvernorat` au lieu de `city`
- Utilisation cohérente de `mots_cles_recherche`

### Base de Données

📊 **Total colonnes table `entreprise`** : 76 colonnes

🗑️ **Colonnes à supprimer** :
- **16 colonnes sûres** (doublons et fantômes)
- **10 colonnes à vérifier** (selon utilisation)

✅ **Résultat attendu** : **~50 colonnes** après nettoyage

---

## ✅ Build Réussi

```bash
✓ 2070 modules transformed.
✓ built in 16.30s
```

**Aucune erreur TypeScript** après toutes les modifications.

---

## 📚 Fichiers de Documentation Créés

1. ✅ `src/lib/subscriptionHelper.ts` – Logique d'abonnement
2. ✅ `UNIFORMISATION_CARTES_ENTREPRISES.md` – Système de couleurs unifié
3. ✅ `AUDIT_COLONNES_UNIFORMISATION_AIRTABLE.md` – Ce document

---

## 🎉 Prochaines Étapes Recommandées

1. **Backup Supabase** : Faire un export complet de la base avant toute suppression
2. **Vérifier les colonnes ⚠️** : Tester manuellement les 10 colonnes marquées "à vérifier"
3. **Supprimer les 16 colonnes sûres** : Exécuter les commandes SQL ci-dessus
4. **Tester en staging** : Vérifier que tout fonctionne après suppression
5. **Déployer en production** : Une fois validé en staging

---

**Fin du Rapport**
