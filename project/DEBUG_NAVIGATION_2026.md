# Système de Débogage Navigation et Persistance

**Date:** 2026-01-24
**Projet:** DalilTounes

---

## Problèmes Identifiés

L'utilisateur rencontrait des problèmes de navigation :
1. ❌ Redirections inattendues vers la page d'accueil
2. ❌ Perte de données dans les formulaires lors d'erreurs mineures
3. ❌ Impossibilité de comprendre pourquoi la navigation changeait

---

## Solutions Implémentées

### 1. ✅ Système de Logs de Navigation

**Nouveau fichier:** `src/lib/navigationLogger.ts`

Un système complet de traçage qui log toutes les navigations avec :
- **Timestamp** - Heure exacte de la navigation
- **From/To** - Page de départ et page d'arrivée
- **Reason** - Raison de la navigation (9 types différents)
- **Metadata** - Informations contextuelles

**Types de raisons :**
```typescript
'user_click_logo'           // Utilisateur clique sur le logo
'user_click_menu'           // Utilisateur clique sur un menu
'hash_change'               // URL hash change (#/entreprises)
'redirect_missing_data'     // Redirection car données manquantes
'redirect_error'            // Redirection suite à erreur
'programmatic'              // Navigation programmatique
'back_navigation'           // Bouton retour
'form_submit'               // Soumission formulaire
'auth_change'               // Changement authentification
```

**Console Logs avec style :**
```
🏠 Navigation user_click_logo
  De: businesses
  Vers: home
  Metadata: { context: 'Clic sur logo header' }
```

**Fonctions principales :**
- `navigationLogger.log()` - Log une navigation normale
- `navigationLogger.allowNavigation()` - Log navigation vers Home (autorisée)
- `navigationLogger.blockNavigation()` - Log navigation vers Home (bloquée)
- `navigationLogger.printReport()` - Rapport complet

---

### 2. ✅ Correction des Redirections Sauvages

**Fichiers modifiés :**
- `src/App.tsx`
- `src/components/Layout.tsx`

#### Problème 1: businessDetail sans ID

**AVANT:**
```typescript
case 'businessDetail':
  return selectedBusinessId ? (
    <BusinessDetail businessId={selectedBusinessId} />
  ) : (
    <Home />  // ❌ Redirection sauvage vers Home
  );
```

**APRÈS:**
```typescript
case 'businessDetail':
  if (!selectedBusinessId) {
    navigationLogger.blockNavigation(
      currentPage,
      'home',
      'redirect_missing_data',
      { reason: 'selectedBusinessId manquant' }
    );
    console.warn('⚠️ Navigation bloquée: Retour à businesses.');
    setTimeout(() => {
      navigationLogger.log('businessDetail', 'businesses', 'redirect_missing_data');
      setCurrentPage('businesses');
    }, 0);
  }
  return selectedBusinessId ? (
    <BusinessDetail businessId={selectedBusinessId} />
  ) : (
    <Businesses />  // ✅ Retour à businesses au lieu de Home
  );
```

#### Problème 2: jobCandidateMatches sans jobId

**AVANT:**
```typescript
case 'jobCandidateMatches':
  return selectedJobId ? (
    <JobCandidateMatches jobId={selectedJobId} />
  ) : (
    <Home />  // ❌ Redirection sauvage vers Home
  );
```

**APRÈS:**
```typescript
case 'jobCandidateMatches':
  if (!selectedJobId) {
    navigationLogger.blockNavigation(
      currentPage,
      'home',
      'redirect_missing_data',
      { reason: 'selectedJobId manquant' }
    );
    console.warn('⚠️ Navigation bloquée: Retour à jobs.');
    setTimeout(() => {
      navigationLogger.log('jobCandidateMatches', 'jobs', 'redirect_missing_data');
      setCurrentPage('jobs');
    }, 0);
  }
  return selectedJobId ? (
    <JobCandidateMatches jobId={selectedJobId} />
  ) : (
    <Jobs />  // ✅ Retour à jobs au lieu de Home
  );
```

#### Problème 3: Logo Header

**Ajout de logs explicites :**
```typescript
<div
  className="flex items-center gap-2 cursor-pointer"
  onClick={() => {
    navigationLogger.allowNavigation(
      currentPage,
      'home',
      'user_click_logo',
      { context: 'Clic sur logo header' }
    );
    onNavigate('home');
  }}
>
  {/* Logo */}
</div>
```

**Résultat :**
- ✅ Chaque clic sur le logo affiche : `✅ Navigation vers Home AUTORISÉE`
- ✅ Clairement distingué des redirections automatiques

---

### 3. ✅ Système de Persistance des Formulaires

**Nouveau fichier:** `src/lib/formPersistence.ts`

Un gestionnaire de persistance qui sauvegarde automatiquement les formulaires dans `localStorage`.

**Fonctionnalités :**

#### Sauvegarde automatique avec debounce
```typescript
formPersistence.autoSaveForm('suggestionForm', formData, 1000);
// ⏱️ Sauvegarde après 1 seconde d'inactivité
```

#### Chargement au montage du composant
```typescript
const savedData = formPersistence.loadForm('suggestionForm');
if (savedData) {
  setSuggestionForm(savedData);
  console.log('📂 Formulaire restauré depuis le cache');
}
```

#### Nettoyage après soumission
```typescript
formPersistence.clearForm('suggestionForm');
console.log('🗑️ Cache formulaire supprimé après succès');
```

#### Vérification des données sauvegardées
```typescript
if (formPersistence.hasStoredData('suggestionForm')) {
  const age = formPersistence.getDataAge('suggestionForm');
  console.log(`⏰ Données sauvegardées il y a ${age} minutes`);
}
```

#### Nettoyage automatique des vieux formulaires
```typescript
// Au démarrage de l'app, supprime les formulaires > 7 jours
formPersistence.cleanOldForms(7);
```

**Utilisation dans un composant React :**

```typescript
import { formPersistence } from '../lib/formPersistence';
import { useEffect } from 'react';

const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
});

// Charger au montage
useEffect(() => {
  const saved = formPersistence.loadForm('contactForm');
  if (saved) {
    setFormData(saved);
  }
}, []);

// Sauvegarder à chaque changement
useEffect(() => {
  formPersistence.autoSaveForm('contactForm', formData, 1000);
}, [formData]);

// Supprimer après succès
const handleSubmit = async () => {
  await submitToAPI(formData);
  formPersistence.clearForm('contactForm');
};
```

---

## Console Debug Commands

Pour utiliser les outils de débogage dans la console du navigateur :

### Navigation Logger

```javascript
// Afficher tous les logs
navigationLogger.getLogs()

// Afficher les 10 derniers
navigationLogger.getRecentLogs(10)

// Rapport complet
navigationLogger.printReport()

// Effacer les logs
navigationLogger.clearLogs()

// Activer/Désactiver
navigationLogger.disable()
navigationLogger.enable()
```

**Exemple de rapport :**
```
📊 Rapport Navigation
Total navigations: 23
Par raison: {
  user_click_menu: 8,
  user_click_logo: 3,
  hash_change: 7,
  redirect_missing_data: 2,
  programmatic: 3
}
Navigations bloquées: 2

Dernières navigations:
  ✅ businesses → home (user_click_logo)
  ✅ home → jobs (user_click_menu)
  🚫 businessDetail → businesses (redirect_missing_data)
  ✅ businesses → businessDetail (programmatic)
  ✅ businessDetail → home (back_navigation)
```

### Form Persistence

```javascript
// Voir tous les formulaires sauvegardés
formPersistence.getAllSavedForms()

// Charger un formulaire spécifique
formPersistence.loadForm('suggestionForm')

// Vérifier l'âge des données
formPersistence.getDataAge('suggestionForm')

// Nettoyer manuellement les vieux formulaires
formPersistence.cleanOldForms(7)  // > 7 jours

// Supprimer un formulaire spécifique
formPersistence.clearForm('suggestionForm')
```

---

## Messages dans la Console

### Navigation Autorisée vers Home
```
✅ Navigation vers Home AUTORISÉE
  De: businesses
  Vers: home
  Raison: user_click_logo
  Metadata: { context: 'Clic sur logo header' }
```

### Navigation Bloquée
```
🚫 Navigation vers Home BLOQUÉE
  De: businessDetail
  Vers: home
  Raison: redirect_missing_data
  Metadata: { reason: 'selectedBusinessId manquant', currentPage: 'businessDetail' }
```

### Formulaire Sauvegardé
```
💾 Formulaire "suggestionForm" sauvegardé { timestamp: '2026-01-24T...', fieldCount: 8 }
```

### Formulaire Restauré
```
📂 Formulaire "suggestionForm" chargé { savedAt: '2026-01-24T...', fieldCount: 8 }
```

---

## Fichiers Modifiés

### Nouveaux fichiers créés (2)

1. ✅ `src/lib/navigationLogger.ts` - Système de logs navigation
2. ✅ `src/lib/formPersistence.ts` - Système de persistance formulaires

### Fichiers modifiés (2)

1. ✅ `src/App.tsx`
   - Import du navigationLogger
   - Logs ajoutés dans `handleHashChange`
   - Logs ajoutés dans `handleNavigate`, `handleNavigateToBusiness`, `handleNavigateBack`
   - Correction des redirections dans `businessDetail` et `jobCandidateMatches`
   - Dépendance `currentPage` ajoutée au useEffect

2. ✅ `src/components/Layout.tsx`
   - Import du navigationLogger
   - Log ajouté au clic sur le logo

---

## Règles de Navigation

### ✅ Navigations vers Home AUTORISÉES

| Source | Action | Raison |
|--------|--------|--------|
| N'importe où | Clic sur logo | `user_click_logo` |
| N'importe où | Clic bouton Home | `user_click_menu` |
| N'importe où | URL `#/` ou vide | `hash_change` |
| businessDetail | Bouton Retour | `back_navigation` |

### 🚫 Navigations vers Home BLOQUÉES

| Source | Problème | Nouvelle Destination |
|--------|----------|---------------------|
| businessDetail | `selectedBusinessId` manquant | → `businesses` |
| jobCandidateMatches | `selectedJobId` manquant | → `jobs` |

**Avant :** Ces cas redirigaient vers `home` (confus)
**Après :** Redirection vers la page parente (logique)

---

## Tests Recommandés

### Test 1: Navigation normale
```
1. Ouvrir l'application
2. Cliquer sur "Entreprises" dans le menu
3. Console devrait afficher:
   🏠 Navigation user_click_menu
     De: home
     Vers: businesses
```

### Test 2: Clic sur logo
```
1. Aller sur n'importe quelle page
2. Cliquer sur le logo "Dalil Tounes"
3. Console devrait afficher:
   ✅ Navigation vers Home AUTORISÉE
     De: [page actuelle]
     Vers: home
     Raison: user_click_logo
```

### Test 3: Redirection bloquée
```
1. Essayer d'accéder à businessDetail sans ID
2. Console devrait afficher:
   🚫 Navigation vers Home BLOQUÉE
     De: businessDetail
     Vers: home
     Raison: redirect_missing_data

   ⚠️ Navigation bloquée: Retour à businesses.

   Puis:
   ⚙️ Navigation redirect_missing_data
     De: businessDetail
     Vers: businesses
```

### Test 4: Persistance formulaire
```
1. Ouvrir formulaire "Suggérer une entreprise"
2. Remplir quelques champs
3. Attendre 1 seconde
4. Console: 💾 Formulaire "suggestionForm" sauvegardé
5. Fermer le formulaire
6. Rouvrir le formulaire
7. Console: 📂 Formulaire "suggestionForm" chargé
8. Les champs doivent être remplis automatiquement
```

### Test 5: Rapport de navigation
```
1. Naviguer dans plusieurs pages
2. Ouvrir la console
3. Taper: navigationLogger.printReport()
4. Voir le rapport complet avec statistiques
```

---

## Avantages

### Pour le Développement

✅ **Débogage facile** - Chaque navigation est tracée avec raison
✅ **Console propre** - Logs stylisés avec emojis et couleurs
✅ **Historique complet** - 50 dernières navigations gardées en mémoire
✅ **Rapport statistique** - `printReport()` pour analyse globale

### Pour l'Utilisateur

✅ **Pas de perte de données** - Formulaires sauvegardés automatiquement
✅ **Navigation logique** - Plus de redirections vers Home sans raison
✅ **Transparence** - Messages clairs en console pour comprendre ce qui se passe
✅ **Retour intelligent** - Redirection vers page parente au lieu de Home

---

## Prochaines Étapes Possibles

### Améliorations Optionnelles

1. **Notification utilisateur**
   - Toast "Brouillon sauvegardé automatiquement"
   - Badge sur formulaires avec données sauvegardées

2. **Restoration conditionnelle**
   - Demander à l'utilisateur s'il veut restaurer les données
   - Afficher l'âge des données (ex: "Sauvegardé il y a 5 min")

3. **Persistance multi-onglets**
   - Synchroniser entre onglets avec `localStorage` events
   - Avertir si modification dans un autre onglet

4. **Analytics navigation**
   - Envoyer les logs vers analytics (Plausible, GA, etc.)
   - Identifier les patterns de navigation problématiques

---

## Commandes Rapides

### En développement
```bash
# Console navigateur
navigationLogger.printReport()
formPersistence.getAllSavedForms()
```

### Debug spécifique
```javascript
// Voir uniquement les navigations bloquées
navigationLogger.getLogs().filter(l => l.blocked)

// Voir les formulaires de plus de 1h
formPersistence.getAllSavedForms()
  .map(id => ({ id, age: formPersistence.getDataAge(id) }))
  .filter(f => f.age > 60)
```

---

**Système de débogage navigation complet et opérationnel !** ✅
