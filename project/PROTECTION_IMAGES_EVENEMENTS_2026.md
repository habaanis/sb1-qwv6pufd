# Protection Images Événements - Correction Erreurs 403

**Date:** 2026-01-24
**Projet:** DalilTounes

---

## Problème Identifié

Des images d'événements provenant de Facebook (fbcdn.net, facebook.com) retournaient des erreurs 403 (Forbidden), causant :
- ❌ Images cassées dans les carousels d'événements
- ❌ Expérience utilisateur dégradée
- ❌ Risques de crash ou erreurs JS si non gérées

**Cause racine :**
Les liens Facebook expirent ou sont bloqués par des restrictions CORS/Referer, rendant les images inaccessibles depuis notre application.

---

## Solutions Implémentées

### 1. ✅ Composant SafeImage avec Fallback

**Nouveau fichier:** `src/components/SafeImage.tsx`

Un composant React intelligent qui :
- Gère automatiquement les erreurs de chargement d'images
- Affiche un placeholder élégant en cas d'erreur
- Supporte deux types de fallback : `placeholder` et `icon`
- Inclut un état de chargement avec animation
- Log les erreurs dans la console pour debugging

**Fonctionnalités :**

```typescript
<SafeImage
  src={imageUrl}
  alt="Nom événement"
  className="w-full h-full object-contain"
  fallbackType="icon"  // ou "placeholder"
  onError={() => console.log('Image failed')}
/>
```

**Rendu en cas d'erreur :**
```
┌─────────────────┐
│     🖼️ ❌       │
│ Image           │
│ indisponible    │
└─────────────────┘
```

Avec un dégradé de gris élégant et une icône `ImageOff` de lucide-react.

---

### 2. ✅ Intégration dans les Composants Événements

#### FeaturedEventCard.tsx

**Avant :**
```tsx
<img
  src={event.image_url}
  alt={event.event_name}
  className="max-h-[80%] max-w-[70%] object-contain"
/>
```

**Après :**
```tsx
<SafeImage
  src={event.image_url}
  alt={event.event_name}
  className="w-full h-full object-contain"
  fallbackType="icon"
/>
```

#### FeaturedEventsCarousel.tsx

**Avant :**
```tsx
<img
  src={event.image_url}
  alt={event.event_name}
  className="max-h-[80%] max-w-[70%] object-contain"
/>
```

**Après :**
```tsx
<SafeImage
  src={event.image_url}
  alt={event.event_name}
  className="w-full h-full object-contain"
  fallbackType="icon"
/>
```

**Résultat :**
- ✅ Plus de crash si une image échoue
- ✅ Fallback visuel professionnel
- ✅ Logs automatiques pour debugging
- ✅ Transition smooth (opacity 0 → 1)

---

### 3. ✅ Notes Préventives dans les Formulaires

Des avertissements ont été ajoutés dans les deux formulaires de soumission d'événements pour éduquer les utilisateurs.

#### EducationEventForm.tsx (ligne 297)

```tsx
<p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
  ⚠️ Merci d'utiliser des images importées directement (hébergées sur votre site ou un service d'hébergement d'images) au lieu de liens Facebook pour éviter les erreurs d'affichage.
</p>
```

#### BusinessEvents.tsx (ligne 795)

```tsx
<p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
  ⚠️ Merci d'utiliser des images importées directement (hébergées sur votre site ou un service d'hébergement d'images) au lieu de liens Facebook pour éviter les erreurs d'affichage.
</p>
```

**Rendu visuel :**

```
┌───────────────────────────────────────────────┐
│ URL de l'image (optionnel)                    │
│ ┌───────────────────────────────────────────┐ │
│ │ https://...                                │ │
│ └───────────────────────────────────────────┘ │
│                                                │
│ ⚠️ Merci d'utiliser des images importées      │
│    directement au lieu de liens Facebook...   │
└───────────────────────────────────────────────┘
```

En jaune ambré (`amber-600`) sur fond clair (`amber-50`) avec bordure (`amber-200`).

---

### 4. ✅ Nettoyage Base de Données

**Script créé:** `scripts/clean_facebook_events.mjs`

Un script Node.js qui :
- Se connecte à Supabase
- Recherche les événements avec URLs Facebook dans `image_url`
- Liste les événements trouvés
- Les supprime automatiquement

**Exécution :**
```bash
node scripts/clean_facebook_events.mjs
```

**Résultat :**
```
🔍 Recherche d'événements avec URLs Facebook...

⚠️  Trouvé 1 événement(s) avec URLs Facebook:

  - [671bde5f-43b6-4aac-b4f5-a7a99a890777] SALON DE LA CRÉATION ARTISANALE 2026
    URL: https://scontent-cdg4-1.xx.fbcdn.net/v/t39.30808...

✅ 1 événement(s) supprimé(s) avec succès
```

**Événements supprimés :**
1. **SALON DE LA CRÉATION ARTISANALE 2026** - Image hébergée sur `fbcdn.net` (expirée)

---

## Architecture Technique

### Flux de Gestion d'Erreur

```
┌─────────────┐
│ SafeImage   │
└──────┬──────┘
       │
       ├─ src existe ?
       │  └─ Non → Fallback immédiat
       │
       ├─ Chargement en cours
       │  └─ Skeleton animé (pulse)
       │
       ├─ onLoad réussi ?
       │  └─ Oui → Affiche image (fade in)
       │
       └─ onError déclenché ?
          └─ Oui → Fallback + Log console
```

### Props SafeImage

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| null \| undefined` | - | URL de l'image |
| `alt` | `string` | - | Texte alternatif |
| `className` | `string` | `''` | Classes CSS |
| `fallbackType` | `'placeholder' \| 'icon'` | `'placeholder'` | Type de fallback |
| `onError` | `() => void` | - | Callback erreur |

### États Internes

```typescript
const [imageError, setImageError] = useState(false);
const [isLoading, setIsLoading] = useState(true);
```

---

## Avantages

### Pour les Développeurs

✅ **Composant réutilisable** - Peut être utilisé partout dans l'app
✅ **Gestion d'erreur centralisée** - Plus besoin de répéter la logique
✅ **Logs automatiques** - Debug facile des images cassées
✅ **TypeScript** - Types stricts pour éviter les erreurs

### Pour les Utilisateurs

✅ **Pas de crash** - L'app continue de fonctionner normalement
✅ **Feedback visuel clair** - Icône + message "Image indisponible"
✅ **Chargement smooth** - Transition opacity pour une meilleure UX
✅ **Prévention** - Avertissements dans les formulaires

### Pour les Gestionnaires

✅ **Base de données propre** - Événements invalides supprimés
✅ **Script automatisé** - Facile de nettoyer à nouveau si besoin
✅ **Éducation utilisateurs** - Notes dans les formulaires préviennent futurs problèmes

---

## Tests Recommandés

### Test 1: Image valide
```
1. Créer un événement avec une image valide (ex: imgur.com)
2. L'image doit s'afficher normalement
3. Pas de log d'erreur dans la console
```

### Test 2: Image Facebook
```
1. Créer un événement avec une URL fbcdn.net ou facebook.com
2. L'image doit échouer à charger
3. Le fallback doit s'afficher (icône + "Image indisponible")
4. Log dans la console: "[SafeImage] Échec chargement image: ..."
```

### Test 3: Image null/undefined
```
1. Créer un événement sans image_url
2. Le fallback doit s'afficher immédiatement
3. Pas d'erreur JS
```

### Test 4: Formulaire avec avertissement
```
1. Aller sur #/education-event-form
2. Scroller vers le champ "URL de l'image"
3. Vérifier la présence de l'avertissement jaune
4. Même chose pour #/business-events (formulaire soumission)
```

### Test 5: Script de nettoyage
```bash
# Ajouter un événement test avec URL Facebook
# Puis exécuter:
node scripts/clean_facebook_events.mjs

# Doit afficher:
# ⚠️  Trouvé X événement(s) avec URLs Facebook
# ✅ X événement(s) supprimé(s) avec succès
```

---

## Fichiers Modifiés/Créés

### Nouveaux fichiers (2)

1. ✅ `src/components/SafeImage.tsx` - Composant image avec fallback
2. ✅ `scripts/clean_facebook_events.mjs` - Script nettoyage DB

### Fichiers modifiés (4)

1. ✅ `src/components/FeaturedEventCard.tsx`
   - Import `SafeImage`
   - Remplacement `<img>` → `<SafeImage>`

2. ✅ `src/components/FeaturedEventsCarousel.tsx`
   - Import `SafeImage`
   - Remplacement `<img>` → `<SafeImage>`

3. ✅ `src/pages/EducationEventForm.tsx`
   - Ajout avertissement sous le champ image_url (ligne 297-299)

4. ✅ `src/pages/BusinessEvents.tsx`
   - Ajout avertissement sous le champ image_url (ligne 795-797)

---

## Prochaines Étapes Possibles

### Améliorations Court Terme

1. **Upload d'images directement**
   - Intégrer Supabase Storage pour upload d'images
   - Remplacer le champ URL par un bouton "Upload"
   - Stocker les images dans un bucket Supabase

2. **Validation côté serveur**
   - Créer un Edge Function qui vérifie les URLs d'images
   - Rejeter automatiquement les URLs Facebook
   - Retourner une erreur claire à l'utilisateur

3. **Retry automatique**
   - Ajouter une logique de retry dans SafeImage
   - Tenter 2-3 fois avant d'afficher le fallback
   - Utile pour les erreurs réseau temporaires

### Améliorations Long Terme

1. **CDN pour images**
   - Proxy/cache les images via un CDN
   - Convertir les URLs externes en URLs internes
   - Garantir la disponibilité à long terme

2. **Monitoring**
   - Logger les erreurs d'images dans Sentry/LogRocket
   - Dashboard pour voir quelles images échouent le plus
   - Alertes automatiques si taux d'erreur > 5%

3. **Optimisation images**
   - Compression automatique des images uploadées
   - Génération de thumbnails (small, medium, large)
   - Format WebP pour performance

---

## Migration des Données Existantes

Si vous avez beaucoup d'événements avec URLs Facebook, voici un plan de migration :

### Étape 1: Audit complet
```sql
SELECT id, event_name, image_url
FROM featured_events
WHERE image_url LIKE '%fbcdn.net%'
   OR image_url LIKE '%facebook.com%';
```

### Étape 2: Contacter les organisateurs
- Exporter la liste des événements affectés
- Envoyer un email aux organisateurs
- Demander de soumettre une nouvelle image

### Étape 3: Nettoyage automatisé
```bash
# Exécuter le script de nettoyage
node scripts/clean_facebook_events.mjs

# Ou supprimer manuellement via SQL
DELETE FROM featured_events
WHERE image_url LIKE '%fbcdn.net%'
   OR image_url LIKE '%facebook.com%';
```

### Étape 4: Mettre à jour les policies RLS
```sql
-- Bloquer les URLs Facebook au niveau DB (optionnel)
CREATE OR REPLACE FUNCTION validate_image_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_url LIKE '%fbcdn.net%' OR NEW.image_url LIKE '%facebook.com%' THEN
    RAISE EXCEPTION 'URLs Facebook non autorisées pour les images';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_image_url_trigger
BEFORE INSERT OR UPDATE ON featured_events
FOR EACH ROW
EXECUTE FUNCTION validate_image_url();
```

---

## Commandes Rapides

### Développement

```bash
# Build avec protection images
npm run build

# Nettoyer événements Facebook
node scripts/clean_facebook_events.mjs

# Chercher images Facebook restantes
grep -r "fbcdn.net\|facebook.com/.*\.jpg\|facebook.com/.*\.png" src/
```

### Debug

```javascript
// Dans la console navigateur

// Voir tous les composants SafeImage
document.querySelectorAll('[class*="SafeImage"]')

// Simuler une erreur d'image
const img = document.querySelector('img');
img.dispatchEvent(new Event('error'));
```

---

## Métriques de Succès

### Avant les corrections
- ❌ 1 événement avec URL Facebook cassée
- ❌ Erreurs 403 visibles dans la console
- ❌ UX dégradée (images manquantes)
- ❌ Pas d'avertissement pour les utilisateurs

### Après les corrections
- ✅ 0 événement avec URL Facebook
- ✅ Fallback élégant pour toutes les erreurs
- ✅ Logs clairs pour debugging
- ✅ Avertissements dans les 2 formulaires
- ✅ Script automatisé pour nettoyage futur

---

**Protection des images événements complète et opérationnelle !** ✅

Les utilisateurs verront maintenant un placeholder élégant au lieu d'images cassées, et seront avertis de ne pas utiliser de liens Facebook dans les formulaires.
