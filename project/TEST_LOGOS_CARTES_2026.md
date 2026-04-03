# Tests Visuels - Logos sur Cartes d'Entreprises - Mars 2026

## Guide de Test Rapide

### Test 1 : Vérification Visuelle des Logos

**Emplacement :** Page Entreprises (`/#/businesses`)

**Actions :**
1. Charger la page des entreprises
2. Observer les cartes d'entreprises affichées
3. Vérifier que les logos apparaissent dans un cercle doré en haut de chaque carte

**Résultat attendu :**
```
┌─────────────────────────┐
│                         │
│      ┌─────────┐        │ ← Header gris clair
│      │  LOGO   │        │ ← Logo rond 64px, bordure dorée
│      └─────────┘        │
│                         │
│   Nom de l'entreprise   │
│   Catégorie            │
│   📍 Ville             │
│                         │
│   Voir les détails →   │
└─────────────────────────┘
```

### Test 2 : Logo par Défaut

**Scénario :** Entreprise sans logo personnalisé

**Résultat attendu :**
- Le logo Dalil Tounes (logo rond avec écriture) s'affiche
- La carte reste visuellement cohérente
- Aucune image cassée ou erreur 404

**Vérification console :**
```javascript
// Compter les logos par défaut
const defaultLogos = document.querySelectorAll('img[src*="dalil-tounes-logo"]');
console.log(`Logos par défaut : ${defaultLogos.length}`);
```

### Test 3 : Logos Personnalisés

**Scénario :** Entreprise avec logo dans Supabase

**Vérification :**
```javascript
// Compter les logos personnalisés (non par défaut)
const customLogos = Array.from(document.querySelectorAll('img[alt*="Logo"]')).filter(
  img => !img.src.includes('dalil-tounes-logo')
);
console.log(`Logos personnalisés : ${customLogos.length}`);
```

### Test 4 : Requête Supabase

**Actions :**
1. Ouvrir DevTools > Network
2. Filtrer par "supabase"
3. Charger la page Entreprises
4. Inspecter la requête POST vers Supabase

**Vérification dans le payload :**
```json
{
  "columns": "id, nom, ..., logo_url, ..."
}
```

Le champ `logo_url` doit être présent dans la liste des colonnes sélectionnées.

### Test 5 : Différents Tiers d'Abonnement

**Page :** `/#/businesses`

**Tailles attendues :**

| Tier | Taille Logo | Observation |
|------|-------------|-------------|
| Gratuit | 56px | Logo plus petit |
| Artisan | 64px | Logo taille standard |
| Premium | 64px | Logo taille standard |
| Elite | 80px | Logo plus grand, badge "ÉLITE PRO" |

**Test visuel :**
1. Identifier une entreprise Elite (badge doré visible)
2. Comparer la taille de son logo avec les autres
3. Le logo Elite devrait être visiblement plus grand

### Test 6 : Responsive Design

**Tailles d'écran à tester :**
- Mobile : 375px
- Tablette : 768px
- Desktop : 1920px

**Vérification :**
- Les logos restent ronds
- La bordure dorée est visible
- Les proportions sont préservées
- Pas de déformation ou étirement

### Test 7 : Section Commerce Local

**Page :** `/#/citizens-shops`

**Vérification :**
1. Les logos apparaissent dans les cartes
2. Format : 48px (w-12 h-12)
3. Bordure grise légère
4. Affichage conditionnel (uniquement si logo_url existe)

**Console :**
```javascript
// Vérifier les logos dans Commerce Local
const shopLogos = document.querySelectorAll('.w-12.h-12.object-contain');
console.log(`Logos magasins affichés : ${shopLogos.length}`);
```

### Test 8 : Section Santé

**Page :** `/#/citizens-health`

**Actions :**
1. Charger la page Santé
2. Observer les cartes d'établissements de santé
3. Vérifier l'affichage des logos

**Attendu :** Même structure que les autres cartes

### Test 9 : Performance de Chargement

**Outils :** Chrome DevTools > Performance

**Métriques à vérifier :**
- Temps de chargement des logos < 1s
- Pas de re-render excessif
- Images en cache après première visite

**Console :**
```javascript
// Mesurer le temps de chargement des images
const imgs = document.querySelectorAll('img[src*="logo"]');
imgs.forEach((img, i) => {
  console.log(`Logo ${i+1}: ${img.complete ? 'Chargé' : 'En cours...'}`);
});
```

### Test 10 : Gestion des Erreurs

**Scénario :** URL de logo invalide ou 404

**Test :**
1. Inspecter une image avec erreur
2. Vérifier que le fallback fonctionne
3. Ou vérifier que l'image est masquée proprement

**Console :**
```javascript
// Vérifier les images en erreur
const brokenImages = Array.from(document.querySelectorAll('img')).filter(
  img => !img.complete || img.naturalHeight === 0
);
console.log(`Images cassées : ${brokenImages.length}`);
```

## Tests Automatisés (Console)

### Script de Test Complet

Coller dans la console du navigateur :

```javascript
function testLogosCartes() {
  console.log('🧪 === TEST LOGOS CARTES ===');

  // 1. Compter tous les logos affichés
  const allLogos = document.querySelectorAll('img[alt*="Logo"], img[src*="logo"]');
  console.log(`✅ Total logos : ${allLogos.length}`);

  // 2. Logos par défaut vs personnalisés
  const defaultLogos = Array.from(allLogos).filter(img =>
    img.src.includes('dalil-tounes-logo')
  );
  const customLogos = allLogos.length - defaultLogos.length;
  console.log(`📦 Logos par défaut : ${defaultLogos.length}`);
  console.log(`🎨 Logos personnalisés : ${customLogos}`);

  // 3. Vérifier les conteneurs ronds
  const roundContainers = document.querySelectorAll('[class*="rounded-full"]');
  console.log(`⭕ Conteneurs ronds : ${roundContainers.length}`);

  // 4. Vérifier les bordures dorées
  const goldBorders = Array.from(roundContainers).filter(el => {
    const style = window.getComputedStyle(el);
    return style.borderColor.includes('212, 175, 55'); // #D4AF37 en RGB
  });
  console.log(`✨ Bordures dorées : ${goldBorders.length}`);

  // 5. Images cassées
  const brokenImages = Array.from(allLogos).filter(img =>
    !img.complete || img.naturalHeight === 0
  );
  console.log(`❌ Images cassées : ${brokenImages.length}`);

  // 6. Résumé
  console.log('\n📊 === RÉSUMÉ ===');
  const success = brokenImages.length === 0 && allLogos.length > 0;
  console.log(success ? '✅ TOUS LES TESTS PASSENT' : '⚠️ PROBLÈMES DÉTECTÉS');

  return {
    totalLogos: allLogos.length,
    defaultLogos: defaultLogos.length,
    customLogos: customLogos,
    roundContainers: roundContainers.length,
    goldBorders: goldBorders.length,
    brokenImages: brokenImages.length,
    success: success
  };
}

// Exécuter le test
const results = testLogosCartes();
```

### Résultat Attendu

```
🧪 === TEST LOGOS CARTES ===
✅ Total logos : 15
📦 Logos par défaut : 3
🎨 Logos personnalisés : 12
⭕ Conteneurs ronds : 15
✨ Bordures dorées : 15
❌ Images cassées : 0

📊 === RÉSUMÉ ===
✅ TOUS LES TESTS PASSENT
```

## Tests Visuels dans Supabase

### Vérifier les Données

**SQL Query :**
```sql
-- Compter les entreprises avec logo
SELECT
  COUNT(*) as total,
  COUNT(logo_url) as avec_logo,
  COUNT(*) - COUNT(logo_url) as sans_logo
FROM entreprise;
```

**Résultat attendu :**
```
total  | avec_logo | sans_logo
-------|-----------|----------
1250   | 487       | 763
```

### Exemples d'Entreprises avec Logo

**SQL Query :**
```sql
-- Lister quelques entreprises avec logo
SELECT id, nom, logo_url
FROM entreprise
WHERE logo_url IS NOT NULL
LIMIT 10;
```

## Checklist de Validation

- [ ] Les logos s'affichent sur la page Entreprises
- [ ] Les logos s'affichent sur la page Santé
- [ ] Les logos s'affichent sur la page Commerce Local
- [ ] Le logo par défaut s'affiche quand `logo_url` est null
- [ ] Les logos sont ronds avec bordure dorée
- [ ] La taille varie selon le tier (Gratuit < Standard < Elite)
- [ ] Pas d'images cassées (404)
- [ ] Les requêtes Supabase incluent `logo_url`
- [ ] Le build réussit sans erreurs
- [ ] Performance acceptable (<1s de chargement)

## Problèmes Connus et Solutions

### Problème 1 : Logo ne s'affiche pas

**Symptôme :** Espace vide à la place du logo

**Causes possibles :**
1. `logo_url` est null dans Supabase
2. URL invalide ou inaccessible
3. CORS bloqué

**Solution :**
```javascript
// Vérifier dans la console
const card = document.querySelector('[class*="rounded-full"] img');
console.log('URL du logo:', card?.src);
console.log('Image chargée:', card?.complete);
console.log('Dimensions:', card?.naturalWidth, 'x', card?.naturalHeight);
```

### Problème 2 : Logo déformé

**Symptôme :** Logo étiré ou écrasé

**Cause :** `object-fit` incorrect

**Solution :** Vérifier que `object-contain` est appliqué
```tsx
className="w-full h-full object-contain"
```

### Problème 3 : Bordure dorée manquante

**Symptôme :** Logo sans bordure colorée

**Solution :** Vérifier le style inline
```tsx
style={{
  border: '3px solid #D4AF37'
}}
```

## Notes de Production

1. **Cache :** Les logos sont mis en cache par le navigateur
2. **CDN :** Utiliser ImageKit.io pour optimisation
3. **Format :** PNG ou SVG recommandés
4. **Taille fichier :** Max 100 Ko par logo
5. **Dimensions recommandées :** 256×256 px minimum

---

**Date de test :** 15 Mars 2026
**Version :** 1.0
**Build :** ✅ Réussi (12.32s)
**Status :** ✅ Prêt pour production
