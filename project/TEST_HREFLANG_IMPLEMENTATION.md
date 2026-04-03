# Test d'Implémentation Hreflang - 15 Mars 2026

## Tests de Validation

### Test 1 : Vérification des Balises dans le HEAD

**Ouvrir la console du navigateur et exécuter :**

```javascript
// Lister toutes les balises hreflang
const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
console.log(`Nombre de balises hreflang : ${hreflangLinks.length}`);

hreflangLinks.forEach(link => {
  console.log(`${link.getAttribute('hreflang')}: ${link.getAttribute('href')}`);
});
```

**Résultat attendu :**
```
Nombre de balises hreflang : 7

fr: https://dalil-tounes.com?lang=fr#/concept
ar: https://dalil-tounes.com?lang=ar#/concept
it: https://dalil-tounes.com?lang=it#/concept
ru: https://dalil-tounes.com?lang=ru#/concept
en: https://dalil-tounes.com?lang=en#/concept
x-default: https://dalil-tounes.com?lang=fr#/concept
fr: https://dalil-tounes.com?lang=fr#/concept (auto-référence)
```

### Test 2 : Changement de Page

**Actions :**
1. Aller sur la page d'accueil `#/`
2. Naviguer vers `#/concept`
3. Vérifier les balises hreflang

**Console :**
```javascript
// Après navigation
const currentPath = window.location.hash;
console.log('Path actuel:', currentPath);

const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
hreflangLinks.forEach(link => {
  const href = link.getAttribute('href');
  const hasCorrectPath = href.includes(currentPath);
  console.log(`${link.getAttribute('hreflang')}: ${hasCorrectPath ? '✅' : '❌'} ${href}`);
});
```

**Résultat attendu :**
Toutes les URLs doivent contenir `#/concept`

### Test 3 : Paramètre de Langue dans URL

**Test A : Chargement avec paramètre**
1. Ouvrir : `https://dalil-tounes.com?lang=ar#/`
2. Vérifier que l'interface est en arabe
3. Vérifier que les balises hreflang sont correctes

**Test B : Changement de langue**
1. Cliquer sur le sélecteur de langue
2. Sélectionner "Italiano"
3. Vérifier que l'URL devient : `?lang=it#/...`
4. Recharger la page
5. Vérifier que la langue italienne est préservée

**Console :**
```javascript
// Vérifier la langue actuelle
const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang');
console.log('Langue depuis URL:', lang);

// Vérifier le localStorage
const savedLang = localStorage.getItem('dalilTounes_language');
console.log('Langue sauvegardée:', savedLang);

// Vérifier l'attribut HTML lang
console.log('HTML lang:', document.documentElement.lang);
```

### Test 4 : x-default

**Vérification :**
```javascript
// Trouver la balise x-default
const xdefault = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
console.log('x-default:', xdefault?.getAttribute('href'));

// Vérifier qu'elle pointe vers le français
const shouldContainFr = xdefault?.getAttribute('href')?.includes('lang=fr');
console.log('x-default pointe vers FR:', shouldContainFr ? '✅' : '❌');
```

**Résultat attendu :**
```
x-default: https://dalil-tounes.com?lang=fr#/concept
x-default pointe vers FR: ✅
```

### Test 5 : Auto-référence

**Vérification :**
```javascript
// Obtenir la langue actuelle
const urlParams = new URLSearchParams(window.location.search);
const currentLang = urlParams.get('lang') || 'fr';
const currentPath = window.location.hash;

// Trouver toutes les balises pour la langue actuelle
const currentLangLinks = document.querySelectorAll(`link[rel="alternate"][hreflang="${currentLang}"]`);
console.log(`Balises pour ${currentLang}:`, currentLangLinks.length);

// Vérifier qu'au moins une pointe vers la page actuelle
let hasSelfReference = false;
currentLangLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href?.includes(`lang=${currentLang}`) && href?.includes(currentPath)) {
    hasSelfReference = true;
    console.log('✅ Auto-référence trouvée:', href);
  }
});

console.log('A une auto-référence:', hasSelfReference ? '✅' : '❌');
```

### Test 6 : Balise Canonical

**Vérification :**
```javascript
const canonical = document.querySelector('link[rel="canonical"]');
console.log('Canonical:', canonical?.getAttribute('href'));

// Vérifier cohérence avec la langue actuelle
const urlParams = new URLSearchParams(window.location.search);
const currentLang = urlParams.get('lang') || 'fr';
const isCoherent = canonical?.getAttribute('href')?.includes(`lang=${currentLang}`);
console.log('Cohérent avec langue actuelle:', isCoherent ? '✅' : '❌');
```

### Test 7 : Navigation entre pages

**Scénario complet :**
1. Charger `?lang=fr#/`
2. Naviguer vers `#/concept`
3. Changer la langue vers Arabe
4. Naviguer vers `#/businesses`
5. Vérifier les balises hreflang à chaque étape

**Script de test automatique :**
```javascript
function testHreflang() {
  const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
  const urlParams = new URLSearchParams(window.location.search);
  const currentLang = urlParams.get('lang') || 'fr';
  const currentPath = window.location.hash || '#/';

  const tests = {
    count: hreflangLinks.length >= 6,
    hasXDefault: !!document.querySelector('link[hreflang="x-default"]'),
    hasSelfReference: false,
    allHaveCurrentPath: true
  };

  // Vérifier auto-référence
  hreflangLinks.forEach(link => {
    const href = link.getAttribute('href');
    const hreflang = link.getAttribute('hreflang');

    if (hreflang === currentLang && href?.includes(`lang=${currentLang}`) && href?.includes(currentPath)) {
      tests.hasSelfReference = true;
    }

    if (!href?.includes(currentPath)) {
      tests.allHaveCurrentPath = false;
    }
  });

  console.log('📊 Résultats des tests hreflang:');
  console.log('✅ Nombre de balises:', tests.count ? 'OK' : 'FAIL');
  console.log('✅ x-default présent:', tests.hasXDefault ? 'OK' : 'FAIL');
  console.log('✅ Auto-référence:', tests.hasSelfReference ? 'OK' : 'FAIL');
  console.log('✅ Toutes les URLs ont le bon path:', tests.allHaveCurrentPath ? 'OK' : 'FAIL');

  const allPass = Object.values(tests).every(v => v === true);
  console.log(allPass ? '🎉 TOUS LES TESTS PASSENT' : '⚠️ CERTAINS TESTS ÉCHOUENT');

  return tests;
}

// Exécuter le test
testHreflang();
```

## Tests Google Search Console

Une fois le site déployé, vérifier dans Google Search Console :

### 1. Accéder à "Ciblage international"
1. Ouvrir Google Search Console
2. Aller dans "Ancienne version et outils"
3. Cliquer sur "Ciblage international"
4. Vérifier la section "Langue"

### 2. Vérifier les Erreurs hreflang
- Aucune erreur de balise manquante
- Aucune erreur de balise de retour manquante
- Aucune URL inaccessible dans hreflang

### 3. Utiliser l'Outil de Test d'URL
1. Saisir une URL : `https://dalil-tounes.com?lang=fr#/concept`
2. Cliquer sur "Tester l'URL active"
3. Vérifier que Google détecte les balises hreflang

## Tests Outils Tiers

### Screaming Frog SEO Spider

1. Télécharger Screaming Frog
2. Crawler le site : `https://dalil-tounes.com`
3. Aller dans l'onglet "Hreflang"
4. Vérifier :
   - Toutes les pages ont des balises hreflang
   - Aucune erreur de réciprocité
   - x-default est présent

### Ahrefs Site Audit

1. Lancer un audit du site
2. Filtrer par "Hreflang"
3. Vérifier les erreurs potentielles

### Semrush Site Audit

1. Configurer le projet
2. Activer "Vérification des balises hreflang"
3. Analyser les résultats

## Checklist de Validation

- [ ] Les 5 langues supportées ont une balise hreflang
- [ ] x-default pointe vers le français
- [ ] Chaque page a une auto-référence
- [ ] Les URLs sont cohérentes (même structure)
- [ ] Le changement de langue met à jour l'URL
- [ ] Le rechargement préserve la langue
- [ ] La balise canonical est présente
- [ ] L'attribut `lang` du HTML est correct
- [ ] Pas d'erreurs dans la console
- [ ] Le build passe sans erreurs
- [ ] Les balises se mettent à jour lors de la navigation

## Résultats Attendus

### Avant l'implémentation
```html
<!-- Aucune balise hreflang -->
<link rel="canonical" href="https://dalil-tounes.com">
```

### Après l'implémentation
```html
<!-- Canonical -->
<link rel="canonical" href="https://dalil-tounes.com?lang=fr#/concept">

<!-- Hreflang pour toutes les langues -->
<link rel="alternate" hreflang="fr" href="https://dalil-tounes.com?lang=fr#/concept">
<link rel="alternate" hreflang="ar" href="https://dalil-tounes.com?lang=ar#/concept">
<link rel="alternate" hreflang="it" href="https://dalil-tounes.com?lang=it#/concept">
<link rel="alternate" hreflang="ru" href="https://dalil-tounes.com?lang=ru#/concept">
<link rel="alternate" hreflang="en" href="https://dalil-tounes.com?lang=en#/concept">

<!-- x-default -->
<link rel="alternate" hreflang="x-default" href="https://dalil-tounes.com?lang=fr#/concept">

<!-- Auto-référence -->
<link rel="alternate" hreflang="fr" href="https://dalil-tounes.com?lang=fr#/concept">
```

## Problèmes Potentiels et Solutions

### Problème 1 : Balises dupliquées
**Symptôme :** Plusieurs balises avec le même hreflang

**Solution :** Le code nettoie automatiquement les anciennes balises avant d'en créer de nouvelles

### Problème 2 : Path incorrect
**Symptôme :** Les URLs ne contiennent pas le bon hash

**Solution :** Vérifier que `useHreflangPath()` est appelé dans le composant

### Problème 3 : Langue non préservée au rechargement
**Symptôme :** La langue revient à 'fr' après rechargement

**Solution :** Vérifier localStorage et les paramètres URL

### Problème 4 : x-default manquant
**Symptôme :** Pas de balise x-default

**Solution :** Vérifier la fonction `generateHreflangUrls()` dans SEOHead.tsx

---

**Date de test :** 15 Mars 2026
**Version :** 1.0
**Status :** ✅ Prêt pour validation
**Build :** ✅ Réussi (12.79s)
