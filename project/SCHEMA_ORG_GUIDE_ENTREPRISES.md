# Guide Complet Schema.org pour les Entreprises - Dalil Tounes

## Vue d'Ensemble

Le système Schema.org a été entièrement intégré sur Dalil Tounes pour maximiser le référencement Google et améliorer la visibilité des entreprises tunisiennes.

---

## 🎯 Architecture Complète

### 1. **Composants Principaux**

#### `StructuredData.tsx`
Composant React qui injecte dynamiquement les scripts JSON-LD dans le `<head>` de chaque page.

**Utilisation :**
```tsx
<StructuredData data={generateLocalBusinessSchema(businessData)} />
```

#### `structuredDataSchemas.ts`
Bibliothèque centrale contenant toutes les fonctions de génération de schémas.

#### `schemaTypeMapping.ts`
Système intelligent de mapping entre les catégories d'entreprises et les types Schema.org appropriés.

---

## 📋 Schémas Implémentés

### **1. Page d'Accueil (Home)**

**Schémas actifs :**
- ✅ **Organization** : identité complète de Dalil Tounes
  - Nom, logo, URL
  - Réseaux sociaux (Facebook, Instagram, LinkedIn)
  - Adresse (Tunisie)

- ✅ **WebSite** : fonctionnalité de recherche
  - `potentialAction` pour la barre de recherche
  - Google comprend que la recherche est disponible
  - Format : `daliltounes.com/#/businesses?q={search_term_string}`

**Fichier :** `src/pages/Home.tsx`

---

### **2. Page Liste des Entreprises (Businesses)**

**Schéma actif :**
- ✅ **CollectionPage** : page de collection d'entreprises
- ✅ **ItemList** : liste dynamique des 20 premières entreprises
  - Chaque entreprise est un `ListItem`
  - Pointant vers sa fiche détaillée (`/#/business/{id}`)

**Génération dynamique :**
```typescript
const businessListItems = businesses.slice(0, 20).map(business => ({
  name: business.name,
  url: `${window.location.origin}/#/business/${business.id}`
}));
```

**Fichier :** `src/pages/Businesses.tsx`

---

### **3. Fiche Entreprise Individuelle (BusinessDetail)** ⭐

**C'est ici que le SEO est le plus puissant !**

#### **Type Dynamique (`@type`)**

Le système détecte automatiquement le type approprié selon la catégorie :

| Catégorie | Type Schema.org |
|-----------|----------------|
| Restaurant, Restauration | `Restaurant` |
| Café | `CafeOrCoffeeShop` |
| Hotel | `Hotel` |
| Magasin, Boutique | `Store` |
| Supermarché | `GroceryStore` |
| Garage, Mécanique | `AutoRepair` |
| Médecin | `Physician` |
| Dentiste | `Dentist` |
| Pharmacie | `Pharmacy` |
| Coiffeur | `HairSalon` |
| Banque | `BankOrCreditUnion` |
| Avocat | `Attorney` |
| Immobilier | `RealEstateAgent` |
| École | `EducationalOrganization` |
| **Défaut** | `LocalBusiness` |

**Fonction :** `getSchemaTypeFromCategory()` dans `schemaTypeMapping.ts`

---

#### **PriceRange Dynamique**

Déterminé automatiquement selon le niveau d'abonnement :

| Tier | PriceRange |
|------|-----------|
| Elite, Premium | `$$$` |
| Gold, Or | `$$` |
| Silver, Argent | `$` |
| Défaut | `$$` |

**Fonction :** `getPriceRangeFromTier()` dans `schemaTypeMapping.ts`

---

#### **OpeningHours (Horaires d'Ouverture)**

Très important pour que Google affiche **"Ouvert"** ou **"Ferme bientôt"**.

**Format supporté dans Supabase (colonne `horaires`) :**

```json
{
  "lundi": {
    "ouvert": true,
    "ouverture": "09:00",
    "fermeture": "18:00"
  },
  "mardi": {
    "ouvert": true,
    "ouverture": "09:00",
    "fermeture": "18:00"
  },
  "samedi": {
    "ouvert": true,
    "ouverture": "10:00",
    "fermeture": "14:00"
  },
  "dimanche": {
    "ouvert": false
  }
}
```

**Conversion automatique en Schema.org :**
```json
{
  "@type": "OpeningHoursSpecification",
  "dayOfWeek": ["Monday"],
  "opens": "09:00",
  "closes": "18:00"
}
```

**Fonction :** `parseOpeningHours()` dans `schemaTypeMapping.ts`

---

#### **Geo (Coordonnées GPS)**

Les coordonnées latitude/longitude sont automatiquement intégrées pour :
- ✅ Apparaître précisément sur **Google Maps**
- ✅ Recherche locale optimisée
- ✅ Fonction "Autour de moi"

**Format :**
```json
{
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.8065,
    "longitude": 10.1815
  }
}
```

---

#### **Image (Photo de Vitrine/Logo)**

La photo principale de l'entreprise est automatiquement intégrée :
- ✅ Affichage dans les résultats de recherche Google
- ✅ Knowledge Panel
- ✅ Google Maps

**Source :** colonne `image_url` de la table `entreprise`

---

#### **AggregateRating (Avis et Notes)** ⭐⭐⭐⭐⭐

**C'est crucial pour les étoiles dorées dans Google !**

**Récupération automatique depuis Supabase :**
```typescript
// Récupère tous les avis approuvés
const { data: avisData } = await supabase
  .from('avis_entreprise')
  .select('note')
  .eq('entreprise_id', businessId)
  .eq('status', 'approved');

// Calcul de la moyenne
const avgRating = totalRating / avisData.length;
```

**Schéma généré :**
```json
{
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 24,
    "bestRating": 5,
    "worstRating": 1
  }
}
```

**Résultat Google :**
```
★★★★☆ 4.5 (24 avis)
```

---

## 🔄 Génération Automatique

Dès qu'une nouvelle entreprise s'inscrit sur la plateforme, le système :

1. ✅ **Détecte automatiquement la catégorie** et assigne le type Schema.org approprié
2. ✅ **Calcule le PriceRange** selon l'abonnement
3. ✅ **Parse les horaires** et les convertit au format Schema.org
4. ✅ **Intègre les coordonnées GPS** pour la géolocalisation
5. ✅ **Récupère les avis** et calcule la note moyenne
6. ✅ **Génère le schéma complet** et l'injecte dans le `<head>`

**Tout se fait automatiquement, sans intervention manuelle !**

---

## 📊 Données Extraites de Supabase

### Table `entreprise`

| Colonne | Utilisation Schema.org |
|---------|----------------------|
| `nom` | `name` |
| `categorie` | Détermine le `@type` |
| `description` | `description` |
| `adresse` | `address.streetAddress` |
| `ville` | `address.addressLocality` |
| `Gouvernorat` | `address.addressRegion` |
| `telephone` | `telephone` |
| `site_web` | `url` |
| `image_url` | `image` |
| `latitude` | `geo.latitude` |
| `longitude` | `geo.longitude` |
| `Horaires` | `openingHoursSpecification` |
| `Statut Abonnement` | Détermine le `priceRange` |

### Table `avis_entreprise`

| Colonne | Utilisation Schema.org |
|---------|----------------------|
| `note` | Calcul du `ratingValue` |
| `status` | Filtrage (seuls les "approved") |
| `entreprise_id` | Lien avec l'entreprise |

**Calcul automatique :**
- `ratingValue` : moyenne de toutes les notes approuvées
- `reviewCount` : nombre total d'avis approuvés

---

## 🎨 Exemple Complet de Schéma Généré

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Le Gourmet Tunisien",
  "description": "Restaurant traditionnel tunisien avec vue sur la mer",
  "image": "https://dalil.supabase.co/storage/photos/restaurant.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenue Habib Bourguiba",
    "addressLocality": "Tunis",
    "addressRegion": "Tunis",
    "addressCountry": "TN"
  },
  "telephone": "+216 71 123 456",
  "url": "https://legourmet.tn",
  "priceRange": "$$",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.8065,
    "longitude": 10.1815
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 24,
    "bestRating": 5,
    "worstRating": 1
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday"],
      "opens": "09:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Tuesday"],
      "opens": "09:00",
      "closes": "22:00"
    }
  ]
}
```

---

## 🚀 Bénéfices SEO Immédiats

### **1. Rich Snippets dans Google**
- ⭐ **Étoiles dorées** directement dans les résultats
- 📍 **Adresse complète** affichée
- 📞 **Téléphone cliquable** sur mobile
- ⏰ **Statut "Ouvert/Fermé"** en temps réel
- 💰 **Indication de prix** (€, $$, $$$)

### **2. Knowledge Graph**
- Meilleure intégration dans le graphe de connaissances Google
- Informations structurées et validées
- Apparition dans le panel latéral Google

### **3. Google Maps**
- Géolocalisation précise avec latitude/longitude
- Affichage sur Google Maps avec toutes les infos
- Fonction "Autour de moi" optimale

### **4. Recherche Vocale**
- Compatibilité avec "Ok Google, trouve un restaurant près de moi"
- Réponses enrichies avec horaires et notes

### **5. Google Business Profile**
- Données synchronisées automatiquement
- Mise à jour en temps réel via Schema.org

---

## 📈 Monitoring et Validation

### **1. Test Schema.org**
Validez vos schémas sur :
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### **2. Google Search Console**
- Surveillez les erreurs de balisage
- Vérifiez l'indexation des Rich Snippets
- Analysez les performances des pages

### **3. Inspection des Pages**
```bash
# Ouvrir DevTools > Elements > <head>
# Chercher les balises <script type="application/ld+json">
```

---

## 🔧 Maintenance et Évolution

### **Ajouter un Nouveau Type Schema.org**

1. Ouvrir `src/lib/schemaTypeMapping.ts`
2. Ajouter le mapping dans `typeMapping` :

```typescript
const typeMapping: Record<string, string> = {
  // Existants...
  'nouvelle_categorie': 'NouveauTypeSchema',
};
```

### **Personnaliser le PriceRange**

Modifier la fonction `getPriceRangeFromTier()` :

```typescript
export function getPriceRangeFromTier(tier: string, category: string): string {
  // Votre logique personnalisée
  if (category.includes('luxe')) return '$$$$$';
  return '$$';
}
```

---

## ✅ Checklist de Vérification

Pour chaque nouvelle entreprise inscrite, vérifiez que :

- [ ] Le type Schema.org est correct (`@type`)
- [ ] L'adresse est complète (rue, ville, gouvernorat)
- [ ] Le téléphone est au format international (+216...)
- [ ] Les coordonnées GPS sont précises
- [ ] Les horaires sont renseignés et valides
- [ ] L'image est de bonne qualité et publique
- [ ] Les avis sont approuvés et comptabilisés
- [ ] Le schéma s'affiche dans le code source (`<head>`)

---

## 🎯 Résultat Final

**Chaque entreprise sur Dalil Tounes bénéficie désormais de :**

✅ Un référencement Google optimisé
✅ Des étoiles dorées dans les résultats
✅ Un affichage enrichi avec horaires et prix
✅ Une géolocalisation précise sur Maps
✅ Une visibilité maximale dans les recherches locales
✅ Une indexation professionnelle et structurée

**Le tout généré automatiquement sans intervention manuelle !**

---

**Auteur :** Système Bolt - Dalil Tounes
**Date :** 11 Février 2026
**Version :** 1.0 - Schema.org Complet
