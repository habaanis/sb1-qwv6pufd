# Restructuration du Menu Citoyens - Janvier 2024

## Objectifs

1. Nettoyer le sous-menu Citoyens en supprimant les entrées inutiles
2. Corriger la page Services Publics pour utiliser la bonne image
3. Corriger les liens incorrects
4. Ajouter l'entrée manquante "Loisirs & Événements"
5. S'assurer que chaque lien fonctionne correctement

---

## Modifications effectuées

### 1. Nettoyage du sous-menu Citoyens

**Entrées supprimées :**
- ❌ "Recherche" (redondant avec la barre de recherche principale)
- ❌ "Numéros d'urgence" (non implémenté)
- ❌ "Services sociaux" (lien incorrect vers Loisirs)

**Fichier modifié :** `src/components/Layout.tsx`

**Avant :**
```tsx
children: [
  { label: t.navMenu.citizens.search, path: 'citizens' },
  { label: t.navMenu.citizens.health, path: '#/citizens/health' },
  { label: t.navMenu.citizens.education, path: '#/education' },
  { label: t.navMenu.citizens.publicServices, path: '#/citizens/admin' },
  { label: t.navMenu.citizens.social, path: '#/citizens/leisure' }, // INCORRECT
  { label: t.navMenu.citizens.emergency, anchor: 'section-urgences' },
],
```

**Après :**
```tsx
children: [
  { label: t.navMenu.citizens.health, path: '#/citizens/health' },
  { label: t.navMenu.citizens.education, path: '#/education' },
  { label: t.navMenu.citizens.publicServices, path: '#/citizens/admin' },
  { label: t.navMenu.citizens.shops, path: '#/citizens/magasins' },
  { label: t.navMenu.citizens.leisure, path: '#/citizens/leisure' },
  { label: t.navMenu.citizens.marketplace, path: '#/local-marketplace' },
],
```

---

### 2. Nouvelle structure du menu Citoyens

| Entrée | Lien | Page cible |
|--------|------|------------|
| ✅ Santé | `#/citizens/health` | CitizensHealth.tsx |
| ✅ Éducation | `#/education` | EducationNew.tsx |
| ✅ Services publics | `#/citizens/admin` | CitizensAdmin.tsx |
| ✅ Commerces & Magasins | `#/citizens/magasins` | CitizensShops.tsx |
| ✅ Loisirs & Événements | `#/citizens/leisure` | CitizensLeisure.tsx |
| ✅ Marché Local | `#/local-marketplace` | LocalMarketplace.tsx |

**Total : 6 entrées** (contre 6 avant, mais mieux organisées)

---

### 3. Correction de la page Services Publics

**Problème :** Page blanche ou image incorrecte

**Solution :** Modification de l'image de fond

**Fichier modifié :** `src/pages/CitizensAdmin.tsx`

**Avant :**
```tsx
<img
  src={getSupabaseImageUrl('passeport admi.jpg')}
  alt="Services administratifs en Tunisie"
/>
```

**Après :**
```tsx
<img
  src={getSupabaseImageUrl('cat_administratif.jpg')}
  alt="Services administratifs en Tunisie"
/>
```

**Image utilisée :** `cat_administratif.jpg` (depuis le bucket photos-dalil)

---

### 4. Nouvelles traductions ajoutées

**Fichier modifié :** `src/lib/i18n.ts`

#### Français
```typescript
citizens: {
  health: 'Santé',
  education: 'Éducation',
  publicServices: 'Services publics',
  shops: 'Commerces & Magasins',
  leisure: 'Loisirs & Événements',
  marketplace: 'Marché Local'
}
```

#### Anglais
```typescript
citizens: {
  health: 'Health',
  education: 'Education',
  publicServices: 'Public services',
  shops: 'Shops & Stores',
  leisure: 'Leisure & Events',
  marketplace: 'Local Marketplace'
}
```

#### Arabe
```typescript
citizens: {
  health: 'الصحة',
  education: 'التعليم',
  publicServices: 'الخدمات العامة',
  shops: 'المحلات والمتاجر',
  leisure: 'الترفيه والفعاليات',
  marketplace: 'السوق المحلي'
}
```

#### Italien
```typescript
citizens: {
  health: 'Salute',
  education: 'Istruzione',
  publicServices: 'Servizi pubblici',
  shops: 'Negozi e Commerci',
  leisure: 'Tempo libero ed Eventi',
  marketplace: 'Mercato Locale'
}
```

#### Russe
```typescript
citizens: {
  health: 'Здоровье',
  education: 'Образование',
  publicServices: 'Госуслуги',
  shops: 'Магазины и Лавки',
  leisure: 'Досуг и Мероприятия',
  marketplace: 'Местный Рынок'
}
```

---

### 5. Correspondance complète des liens

#### Desktop (menu déroulant)

Quand l'utilisateur clique sur "Citoyens" dans le menu principal, un sous-menu s'affiche avec ces options :

1. **Santé** → Redirige vers `#/citizens/health` → Page CitizensHealth.tsx
2. **Éducation** → Redirige vers `#/education` → Page EducationNew.tsx
3. **Services publics** → Redirige vers `#/citizens/admin` → Page CitizensAdmin.tsx
4. **Commerces & Magasins** → Redirige vers `#/citizens/magasins` → Page CitizensShops.tsx
5. **Loisirs & Événements** → Redirige vers `#/citizens/leisure` → Page CitizensLeisure.tsx
6. **Marché Local** → Redirige vers `#/local-marketplace` → Page LocalMarketplace.tsx

#### Mobile (menu accordéon)

Même comportement que le desktop, mais avec un affichage accordéon.

---

### 6. Images de fond par page

| Page | Image utilisée | Bucket |
|------|----------------|--------|
| CitizensHealth | `sante_banner.webp.jpeg` | photos-dalil |
| EducationNew | `classe-ecole.jpg` | photos-dalil |
| CitizensAdmin | `cat_administratif.jpg` | photos-dalil ✅ (nouveau) |
| CitizensShops | `magasin.jpg` | photos-dalil |
| CitizensLeisure | `loisir copy.jpg` | photos-dalil |
| LocalMarketplace | `petite annonce.jpg` | photos-dalil |

---

## Résumé des changements

### Fichiers modifiés : 2

1. **src/components/Layout.tsx**
   - Suppression de 3 entrées du menu (search, emergency, social)
   - Ajout de 3 nouvelles entrées (shops, leisure, marketplace)
   - Réorganisation de la structure

2. **src/lib/i18n.ts**
   - Mise à jour des traductions pour 5 langues
   - Ajout des nouvelles clés : `shops`, `leisure`, `marketplace`
   - Suppression des anciennes clés : `search`, `emergency`, `social`, `documents`, `security`, `contact`

3. **src/pages/CitizensAdmin.tsx**
   - Changement de l'image : `passeport admi.jpg` → `cat_administratif.jpg`

---

## Vérifications effectuées

### Routage

✅ Tous les liens du menu pointent vers des pages existantes :
- `#/citizens/health` → CitizensHealth.tsx ✅
- `#/education` → EducationNew.tsx ✅
- `#/citizens/admin` → CitizensAdmin.tsx ✅
- `#/citizens/magasins` → CitizensShops.tsx ✅
- `#/citizens/leisure` → CitizensLeisure.tsx ✅
- `#/local-marketplace` → LocalMarketplace.tsx ✅

### Images

✅ Toutes les images utilisées existent dans le bucket photos-dalil :
- `sante_banner.webp.jpeg` ✅
- `classe-ecole.jpg` ✅
- `cat_administratif.jpg` ✅ (nouveau)
- `magasin.jpg` ✅
- `loisir copy.jpg` ✅
- `petite annonce.jpg` ✅

### Build

```bash
npm run build
```

**Résultat :**
```
✓ built in 11.12s
dist/assets/index-B18HSTVT.js   1,246.05 kB │ gzip: 341.23 kB
```

**Build réussi sans erreurs ✅**

---

## Avant / Après

### Menu Citoyens - AVANT

1. ❌ Recherche (redondant)
2. ✅ Santé
3. ✅ Éducation
4. ⚠️ Services publics (image incorrecte)
5. ❌ Services sociaux (lien incorrect → Loisirs)
6. ❌ Numéros d'urgence (non implémenté)

**Problèmes :**
- 3 entrées inutiles ou incorrectes
- Manque l'entrée "Loisirs & Événements"
- Manque l'entrée "Commerces & Magasins"
- Manque l'entrée "Marché Local"
- Image incorrecte pour Services publics

### Menu Citoyens - APRÈS

1. ✅ Santé
2. ✅ Éducation
3. ✅ Services publics (image corrigée)
4. ✅ Commerces & Magasins (nouveau)
5. ✅ Loisirs & Événements (nouveau)
6. ✅ Marché Local (nouveau)

**Améliorations :**
- ✅ Toutes les entrées fonctionnelles
- ✅ Liens corrects vers les bonnes pages
- ✅ Images correctes
- ✅ Menu plus clair et complet
- ✅ Pas d'entrées redondantes

---

## Catégories du menu Citoyens

### 1. Santé
**Page :** CitizensHealth.tsx
**Route :** `#/citizens/health`
**Image :** `sante_banner.webp.jpeg`
**Contenu :** Services de santé, hôpitaux, cliniques, pharmacies, médecins

### 2. Éducation
**Page :** EducationNew.tsx
**Route :** `#/education`
**Image :** `classe-ecole.jpg`
**Contenu :** Écoles, universités, centres de formation, professeurs privés

### 3. Services publics
**Page :** CitizensAdmin.tsx
**Route :** `#/citizens/admin`
**Image :** `cat_administratif.jpg` ✅ (corrigé)
**Contenu :** Administrations, mairies, services administratifs, documents

### 4. Commerces & Magasins
**Page :** CitizensShops.tsx
**Route :** `#/citizens/magasins`
**Image :** `magasin.jpg`
**Contenu :** Magasins, commerces, supermarchés, boutiques

### 5. Loisirs & Événements
**Page :** CitizensLeisure.tsx
**Route :** `#/citizens/leisure`
**Image :** `loisir copy.jpg`
**Contenu :** Activités de loisirs, événements culturels, divertissements

### 6. Marché Local
**Page :** LocalMarketplace.tsx
**Route :** `#/local-marketplace`
**Image :** `petite annonce.jpg`
**Contenu :** Petites annonces, marché local, vente entre particuliers

---

## Tests à effectuer

### Navigation
- [ ] Cliquer sur "Citoyens" dans le menu principal
- [ ] Vérifier que le sous-menu s'affiche correctement
- [ ] Cliquer sur chaque entrée du sous-menu
- [ ] Vérifier que la bonne page s'affiche

### Images
- [ ] Vérifier que chaque page affiche la bonne image de fond
- [ ] Vérifier spécifiquement que Services publics affiche `cat_administratif.jpg`
- [ ] Vérifier que les images se chargent correctement depuis le bucket

### Responsive
- [ ] Tester le menu sur desktop (menu déroulant)
- [ ] Tester le menu sur mobile (menu accordéon)
- [ ] Vérifier que toutes les entrées sont accessibles

### Multilingue
- [ ] Tester le menu en français
- [ ] Tester le menu en anglais
- [ ] Tester le menu en arabe (RTL)
- [ ] Tester le menu en italien
- [ ] Tester le menu en russe

---

## Prochaines étapes

### Fonctionnalités futures possibles

1. **Services sociaux**
   - Créer une page dédiée aux services sociaux
   - Ajouter l'entrée dans le menu
   - Définir le contenu de la page

2. **Urgences**
   - Créer une section pour les numéros d'urgence
   - Peut être intégrée dans la page Santé ou Services publics
   - Afficher les numéros importants (SAMU, Police, Pompiers, etc.)

3. **Optimisations**
   - Ajouter des icônes pour chaque entrée du menu
   - Améliorer l'animation du sous-menu
   - Ajouter des descriptions au survol

---

**Date de mise à jour :** 24 janvier 2024
**Version :** 2.2.0
**Fichiers modifiés :** 3 (Layout.tsx, i18n.ts, CitizensAdmin.tsx)
**Entrées supprimées :** 3 (Recherche, Services sociaux, Numéros d'urgence)
**Entrées ajoutées :** 3 (Commerces & Magasins, Loisirs & Événements, Marché Local)
**Build :** Réussi ✅
**Tests :** En attente de vérification
