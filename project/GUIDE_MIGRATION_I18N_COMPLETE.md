# Guide Complet de Migration I18n - Dalil Tounes

## 📋 Vue d'ensemble

Ce guide explique comment implémenter la traduction complète du site Dalil Tounes pour les 5 langues (FR, AR, EN, IT, RU) avec support RTL pour l'arabe.

## ✅ Ce qui a été créé

### 1. **i18nExtensions.ts** - Dictionnaire de traductions étendues
Contient TOUTES les traductions manquantes pour :
- Pages Home, Businesses, Citizens (Services, Health, Leisure)
- Education, Footer, Layout, composants communs
- 5 langues complètes : FR, AR, EN, IT, RU

### 2. **useRTL.ts** - Hook pour le mode RTL (arabe)
- Détecte automatiquement la langue arabe
- Applique `dir="rtl"` au document HTML
- Fournit des utilitaires pour flex-direction, text-align, margins, etc.

### 3. **useTranslationExtended.ts** - Hook pour traductions étendues
- Accès sécurisé aux traductions avec fallback
- Interpolation de variables `{variable}`
- Compatible avec les traductions existantes

### 4. **databaseI18n.ts** - Gestion colonnes multilingues
- Helpers pour récupérer automatiquement les bonnes colonnes selon la langue
- `getMultilingualField()` - Récupère un champ traduit avec fallback
- `translateEntreprise()`, `translateEvent()` - Helpers spécifiques
- `getMultilingualSelect()` - Génère le SELECT Supabase avec les bonnes colonnes

## 🔧 Comment utiliser dans vos composants

### Méthode 1 : Traductions étendues uniquement

```tsx
import { useLanguage } from '../context/LanguageContext';
import { useTranslationExtended } from '../lib/useTranslationExtended';
import { useRTL } from '../lib/useRTL';

function MyComponent() {
  const { language } = useLanguage();
  const te = useTranslationExtended(language);
  const { isRTL } = useRTL();

  return (
    <div className={isRTL ? 'text-right' : 'text-left'}>
      <h1>{te.home?.socialNotice}</h1>
      <button className={isRTL ? 'flex-row-reverse' : ''}>
        {te.common?.access}
      </button>
    </div>
  );
}
```

### Méthode 2 : Traductions existantes + étendues

```tsx
import { useTranslation } from '../lib/i18n';
import { useTranslationExtended } from '../lib/useTranslationExtended';

function MyComponent() {
  const { language } = useLanguage();
  const t = useTranslation(language);    // Traductions existantes
  const te = useTranslationExtended(language); // Traductions étendues

  return (
    <div>
      <h1>{t.nav.home}</h1>  {/* Depuis i18n.ts */}
      <p>{te.footer?.copyright}</p>  {/* Depuis i18nExtensions.ts */}
    </div>
  );
}
```

### Méthode 3 : Avec données de la base

```tsx
import { getMultilingualField, translateEntreprise } from '../lib/databaseI18n';

// Dans votre fetch Supabase
const { data } = await supabase
  .from('entreprise')
  .select('id, nom, nom_ar, nom_en, description, description_ar, description_en')
  .eq('id', entrepriseId)
  .single();

// Traduire automatiquement
const translated = translateEntreprise(data, language);
console.log(translated.nom); // Affiche le nom dans la bonne langue

// Ou manuellement pour un champ
const nomTraduit = getMultilingualField(data, 'nom', language);
```

## 📝 Liste des clés de traduction disponibles

### te.home
- `socialNotice`, `shareAddress`, `areYouFindable`, `exploreServices`, `accessButton`

### te.businesses
- `searchPartner`, `findPartners`, `browseJobs`, `discoverJobs`
- `businessEvents`, `participateEvents`, `careerOpportunities`
- `exclusiveOffers`, `priority`, `premium`, `viewOffer`, `viewAllOffers`
- `registerBusiness`, `viewCandidates`, `searchingInProgress`
- `noBusinessAvailable`, `featuredBusinesses`, `resetFilters`
- `searchingSpecific`, `moreBusinessesAvailable`, `elitePro`

### te.citizens.services
- `title`, `backToProcedures`, `processingTime`, `cost`
- `requiredDocuments`, `competentService`, `downloadPdfForm`
- `accessOnlineForm`, `verifyWarning`, `officesTitle`, `officesSubtitle`
- `proceduresTitle`, `proceduresSubtitle`, `urgencyTitle`, `urgencySubtitle`
- `socialTitle`, `socialSubtitle`, `noOfficeFound`, `searchPlaceholder`, `together`

### te.citizens.health
- `backToCategories`, `title`, `searchInProgress`, `noResults`
- `searchResults`, `resetSearch`, `noProviderFound`, `medicalTransport`
- `searchingProviders`, `tryModifyCriteria`, `haveAdaptedVehicle`
- `registerProvider`, `registerDescription`

### te.citizens.leisure
- `buyTickets`, `backToCitizens`, `historicSitesGuide`
- `searchPlaceholder`, `proposeEvent`, `featuredEvents`, `findIdeas`
- `activeFilter`, `clearFilter`, `hideMap`, `showMap`, `interactiveMap`

### te.education
- `backToCitizens`, `organizeEvent`, `eventDescription`, `proposeEvent`
- `searchPlaceholder`, `educationEstablishments`, `results`, `resetSearch`
- `searchInProgress`, `noEstablishmentFound`, `tryModifyCriteria`
- `keyStats`, `upcomingEvents`, `filterByCity`, `allCities`
- `noEventIn`, `noEducationEvent`

### te.footer
- `email`, `copied`, `copyAddress`, `dalilTounes`, `platformDescription`
- `navigation`, `home`, `businesses`, `jobs`, `subscriptions`, `citizens`
- `health`, `education`, `publicServices`, `shops`, `leisure`
- `socialServices`, `localMarket`, `contact`, `digitalGuide`
- `copyright`, `registerEstablishment`

### te.layout
- `concept`, `dalilTounes`, `quickSourcing`, `aroundMe`, `admin`

### te.common
- `access`, `viewDetails`, `close`, `back`, `search`, `filter`
- `reset`, `loading`, `noResults`, `seeMore`, `seeLess`
- `open`, `closed`, `free`, `pieces`

## 🎨 Classes RTL pour Tailwind

Le hook `useRTL()` fournit ces utilitaires :

```tsx
const { isRTL, flexDirection, textAlign, marginStart, marginEnd } = useRTL();

// Utilisation
<div className={`flex ${flexDirection}`}>  // flex-row ou flex-row-reverse
<p className={textAlign}>                  // text-left ou text-right
<div className={`${marginStart}-4`}>       // ml-4 ou mr-4
```

## 🔄 Migration des pages existantes

### Exemple : Page Home

**AVANT :**
```tsx
<p>Les réseaux sociaux sont pour le divertissement...</p>
<button>Accéder</button>
```

**APRÈS :**
```tsx
import { useTranslationExtended } from '../lib/useTranslationExtended';
import { useRTL } from '../lib/useRTL';

const { language } = useLanguage();
const te = useTranslationExtended(language);
const { isRTL } = useRTL();

<p className={isRTL ? 'text-right' : 'text-left'}>
  {te.home?.socialNotice}
</p>
<button className={isRTL ? 'flex-row-reverse' : ''}>
  {te.common?.access}
</button>
```

### Exemple : Interpolation de variables

**Template :**
```
"moreBusinessesAvailable": "Plus de {count} entreprises disponibles"
```

**Utilisation :**
```tsx
const message = te.interpolate(
  te.businesses?.moreBusinessesAvailable || '',
  { count: 150 }
);
// Résultat : "Plus de 150 entreprises disponibles"
```

## 🗄️ Support colonnes multilingues en base

### Colonnes à ajouter dans Supabase

Pour chaque table (entreprise, evenements_locaux, etc.), ajoutez les colonnes :

```sql
-- Pour la table entreprise
ALTER TABLE entreprise
ADD COLUMN nom_ar TEXT,
ADD COLUMN nom_en TEXT,
ADD COLUMN nom_it TEXT,
ADD COLUMN nom_ru TEXT,
ADD COLUMN description_ar TEXT,
ADD COLUMN description_en TEXT,
ADD COLUMN description_it TEXT,
ADD COLUMN description_ru TEXT;

-- Répéter pour services, sous_categories, etc.
```

### Utilisation dans les requêtes

```tsx
import { getMultilingualSelect } from '../lib/databaseI18n';

const fields = ['nom', 'description', 'services'];
const select = getMultilingualSelect(fields, language);

const { data } = await supabase
  .from('entreprise')
  .select(select)  // Sélectionne automatiquement nom, nom_ar, description, description_ar, etc.
  .limit(10);

const translated = data.map(item => translateEntreprise(item, language));
```

## ✅ Checklist de migration par page

### Pages à migrer

- [x] Footer (FAIT - exemple complet)
- [ ] Home.tsx
- [ ] Businesses.tsx
- [ ] BusinessDetail.tsx
- [ ] CitizensServices.tsx
- [ ] CitizensHealth.tsx
- [ ] CitizensLeisure.tsx
- [ ] EducationNew.tsx
- [ ] Layout.tsx
- [ ] BusinessCard.tsx
- [ ] Tous les autres composants avec textes en dur

### Pour chaque page :

1. ✅ Importer `useTranslationExtended` et `useRTL`
2. ✅ Remplacer tous les textes en dur par `te.section?.key`
3. ✅ Ajouter classes RTL conditionnelles (`isRTL ? 'text-right' : 'text-left'`)
4. ✅ Inverser flex-direction pour l'arabe (`flex-row-reverse`)
5. ✅ Tester dans les 5 langues

## 🧪 Test complet

```tsx
// Test dans chaque langue
const languages = ['fr', 'ar', 'en', 'it', 'ru'];

languages.forEach(lang => {
  // Changer la langue
  setLanguage(lang);

  // Vérifier :
  // 1. Tous les textes sont traduits
  // 2. Direction RTL fonctionne (arabe)
  // 3. Layout n'est pas cassé
  // 4. Données DB sont traduites
});
```

## 🚀 Prochaines étapes

1. **Migrer toutes les pages** en suivant l'exemple du Footer
2. **Ajouter colonnes multilingues** dans Supabase pour les tables principales
3. **Tester exhaustivement** dans les 5 langues
4. **Documenter** les traductions manquantes pour ajout futur

## 💡 Bonnes pratiques

1. **Toujours utiliser** `te.section?.key` avec optional chaining pour éviter les erreurs
2. **Fournir un fallback** : `te.footer?.title || 'Titre par défaut'`
3. **Tester le mode RTL** sur chaque page modifiée
4. **Interpoler les variables** avec `te.interpolate()` au lieu de concaténation
5. **Utiliser les helpers DB** pour les données multilingues

---

**Créé le :** 2026-03-01
**Auteur :** Système I18n Dalil Tounes
**Version :** 1.0.0
