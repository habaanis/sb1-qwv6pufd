# 🔧 CORRECTION DES FILTRES PARTNER REQUESTS

## 📋 RÉSUMÉ DU PROBLÈME

### Symptômes
- Les onglets "Besoins partenaires" et "Prestataires / services" n'affichaient aucune donnée
- Seul l'onglet "Tous" fonctionnait correctement
- Les données existent dans la base mais ne sont pas filtrées correctement

### Cause racine
1. **Décalage de valeurs** : Le code filtrait sur `'entreprise_besoin'` et `'prestataire_service'`, mais la base contenait `'need'`, `'offer'`, et `'unknown'`
2. **Champ manquant** : Les formulaires n'enregistraient PAS le champ `request_type` lors de l'insertion

---

## ✅ CORRECTIONS APPORTÉES

### 1️⃣ Fichier: `src/pages/PartnerRequestsAdmin.tsx`

#### **Modification des labels**
```typescript
// AVANT
const REQUEST_TYPE_LABELS: Record<string, string> = {
  entreprise_besoin: "Besoin partenaire / fournisseur",
  prestataire_service: "Prestataire de services",
};

// APRÈS
const REQUEST_TYPE_LABELS: Record<string, string> = {
  need: "Besoin partenaire / fournisseur",
  partner_need: "Besoin partenaire / fournisseur", // Alias
  offer: "Prestataire de services",
  service_provider: "Prestataire de services", // Alias
  unknown: "Type non spécifié",
};
```

#### **Modification des types de filtres**
```typescript
// AVANT
const [filterType, setFilterType] = useState<'all' | 'entreprise_besoin' | 'prestataire_service'>('all');

// APRÈS
type FilterType = 'all' | 'need' | 'offer';
const [filterType, setFilterType] = useState<FilterType>('all');
```

#### **Amélioration de la logique de filtrage**
```typescript
// AVANT
const filteredRequests = requests.filter((r) => {
  if (filterType === 'all') return true;
  return r.request_type === filterType;
});

// APRÈS
const filteredRequests = requests.filter((r) => {
  if (filterType === 'all') return true;

  // Filtre "Besoins partenaires"
  if (filterType === 'need') {
    return r.request_type === 'need' || r.request_type === 'partner_need';
  }

  // Filtre "Prestataires / services"
  if (filterType === 'offer') {
    return r.request_type === 'offer' || r.request_type === 'service_provider';
  }

  return true;
});
```

#### **Ajout de logs de debug**
```typescript
// LOG 1: Après chargement des données
const requestTypes = Array.from(new Set(mapped.map(r => r.request_type)));
console.log('[PartnerRequestsAdmin] 🔎 Types de requêtes présents:', requestTypes);

// LOG 2: Après filtrage
console.log('[PartnerRequestsAdmin] 🧮 Filtre actif:', filterType);
console.log('[PartnerRequestsAdmin] ✅ Nombre de demandes affichées:', filteredRequests.length);
```

#### **Correction des boutons de filtre**
```typescript
// AVANT
onClick={() => setFilterType('entreprise_besoin')}
onClick={() => setFilterType('prestataire_service')}

// APRÈS
onClick={() => setFilterType('need')}
onClick={() => setFilterType('offer')}
```

#### **Amélioration du badge de type**
```typescript
// AVANT
className={req.request_type === 'prestataire_service' ? '...' : '...'}

// APRÈS
className={
  req.request_type === 'offer' || req.request_type === 'service_provider'
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    : req.request_type === 'need' || req.request_type === 'partner_need'
    ? 'bg-orange-50 text-orange-700 border border-orange-100'
    : 'bg-gray-50 text-gray-700 border border-gray-100' // Pour 'unknown'
}
```

---

### 2️⃣ Fichier: `src/pages/PartnerSearch.tsx`

#### **Ajout du champ request_type dans le formulaire "Besoins"**
```typescript
// AVANT
const insertData = {
  profile_type: formData.profileType,
  company_name: formData.companyName,
  sector: formData.sector,
  region: formData.region,
  search_type: formData.searchType,
  description: formData.description,
  email: formData.email,
  phone: formData.phone,
  language: formData.language,
};

// APRÈS
const insertData = {
  request_type: 'need', // ✅ Définit le type de requête
  profile_type: formData.profileType,
  company_name: formData.companyName,
  sector: formData.sector,
  region: formData.region,
  search_type: formData.searchType,
  description: formData.description,
  email: formData.email,
  phone: formData.phone,
  language: formData.language,
};
```

#### **Ajout du champ request_type dans le formulaire "Offres"**
```typescript
// AVANT
const insertData = {
  profile_type: 'provider',
  company_name: offerFormData.companyName,
  sector: '',
  region: offerFormData.city,
  search_type: 'offer',
  description: offerFormData.description,
  email: offerFormData.email,
  phone: offerFormData.phone,
  language: language,
};

// APRÈS
const insertData = {
  request_type: 'offer', // ✅ Définit le type de requête
  profile_type: 'provider',
  company_name: offerFormData.companyName,
  sector: '',
  region: offerFormData.city,
  search_type: 'offer',
  description: offerFormData.description,
  email: offerFormData.email,
  phone: offerFormData.phone,
  language: language,
};
```

#### **Amélioration des logs**
```typescript
// AVANT
console.log('[PartnerRequests] 📤 Submitting NEED form', insertData);
console.log('[PartnerRequests] 📤 Submitting OFFER form', insertData);

// APRÈS
console.log('[PartnerRequests] 📤 Submitting NEED form (request_type=need)', insertData);
console.log('[PartnerRequests] 📤 Submitting OFFER form (request_type=offer)', insertData);
```

---

## 📊 SCHÉMA DES VALEURS

### Table: `partner_requests`

| Colonne | Type | Valeurs attendues |
|---------|------|-------------------|
| `request_type` | text | `'need'` ou `'offer'` |
| `profile_type` | text | `'enterprise'`, `'provider'`, etc. |
| `search_type` | text | Texte libre |
| `company_name` | text | Nom de l'entreprise |
| `sector` | text | Secteur d'activité |
| `region` | text | Région/ville |
| `description` | text | Description détaillée |
| `email` | text | Email de contact |
| `phone` | text | Téléphone |
| `language` | text | Langue (default: 'fr') |

### Mapping des valeurs

| Ancienne valeur | Nouvelle valeur | Signification |
|-----------------|-----------------|---------------|
| `'entreprise_besoin'` | `'need'` | Besoin partenaire |
| `'partner_need'` | `'need'` | Besoin partenaire (alias) |
| `'prestataire_service'` | `'offer'` | Offre de services |
| `'service_provider'` | `'offer'` | Offre de services (alias) |
| `'unknown'` | À migrer | Non spécifié |
| `NULL` | À migrer | Non renseigné |

---

## 🔍 LOGS DE DEBUG À VÉRIFIER

### Lors du chargement de la page admin

Ouvrez la console (F12) et filtrez avec : `[PartnerRequestsAdmin]`

Vous devriez voir :

```
[PartnerRequestsAdmin] 🔍 Chargement des demandes partenaires...
[PartnerRequestsAdmin] ✅ Demandes chargées: {count: 6, sample: {...}}
[PartnerRequestsAdmin] 🔎 Types de requêtes présents: ['unknown', 'offer', 'need']
[PartnerRequestsAdmin] 🧮 Filtre actif: all
[PartnerRequestsAdmin] ✅ Nombre de demandes affichées: 6
```

### Lors du clic sur un filtre

**Clic sur "Besoins partenaires":**
```
[PartnerRequestsAdmin] 🧮 Filtre actif: need
[PartnerRequestsAdmin] ✅ Nombre de demandes affichées: 1
```

**Clic sur "Prestataires / services":**
```
[PartnerRequestsAdmin] 🧮 Filtre actif: offer
[PartnerRequestsAdmin] ✅ Nombre de demandes affichées: 1
```

### Lors de la soumission d'un formulaire

**Formulaire "Besoins":**
```
[PartnerRequests] 📤 Submitting NEED form (request_type=need) {
  request_type: 'need',
  company_name: 'Test Company',
  ...
}
[PartnerRequests] ✅ Insert SUCCESS
```

**Formulaire "Offres":**
```
[PartnerRequests] 📤 Submitting OFFER form (request_type=offer) {
  request_type: 'offer',
  company_name: 'Service Provider Inc',
  ...
}
[PartnerRequests] ✅ Insert OFFER SUCCESS
```

---

## 🔧 MIGRATION DES DONNÉES EXISTANTES

### Script SQL fourni

Un script SQL complet a été créé : **`MIGRATION_REQUEST_TYPE.sql`**

Ce script contient :

1. **Audit** : Requêtes pour voir l'état actuel des données
2. **Normalisation** : UPDATE pour corriger les valeurs 'unknown'
3. **Vérification** : Requêtes pour valider la migration
4. **Contrainte** (optionnel) : Ajout d'une contrainte CHECK

### Exécution recommandée

```sql
-- 1. Voir l'état actuel
SELECT request_type, COUNT(*) AS nb
FROM partner_requests
GROUP BY request_type;

-- 2. Normaliser les 'unknown' basés sur des mots-clés
UPDATE partner_requests
SET request_type = 'need'
WHERE request_type = 'unknown'
  AND description ILIKE '%besoin%';

UPDATE partner_requests
SET request_type = 'offer'
WHERE request_type = 'unknown'
  AND description ILIKE '%offre%';

-- 3. Mettre le reste en 'need' par défaut
UPDATE partner_requests
SET request_type = 'need'
WHERE request_type = 'unknown' OR request_type IS NULL;

-- 4. Vérifier le résultat
SELECT request_type, COUNT(*) AS nb
FROM partner_requests
GROUP BY request_type;
-- Résultat attendu : uniquement 'need' et 'offer'
```

---

## 🧪 TESTS À EFFECTUER

### Test 1: Affichage de toutes les demandes
1. Allez sur `#/admin/partner-requests`
2. Vérifiez que toutes les demandes s'affichent
3. Le compteur "Total" doit être correct

### Test 2: Filtre "Besoins partenaires"
1. Cliquez sur le bouton "Besoins partenaires" (orange)
2. Seules les demandes avec `request_type = 'need'` doivent s'afficher
3. Vérifiez les logs : `[PartnerRequestsAdmin] 🧮 Filtre actif: need`

### Test 3: Filtre "Prestataires / services"
1. Cliquez sur le bouton "Prestataires / services" (vert)
2. Seules les demandes avec `request_type = 'offer'` doivent s'afficher
3. Vérifiez les logs : `[PartnerRequestsAdmin] 🧮 Filtre actif: offer`

### Test 4: Soumission formulaire "Besoins"
1. Allez sur la page de formulaire partenaire
2. Remplissez et soumettez un besoin
3. Vérifiez dans la console : `request_type: 'need'`
4. Allez dans l'admin, le filtre "Besoins partenaires" doit l'afficher

### Test 5: Soumission formulaire "Offres"
1. Cliquez sur "Proposer mes services"
2. Remplissez et soumettez une offre
3. Vérifiez dans la console : `request_type: 'offer'`
4. Allez dans l'admin, le filtre "Prestataires / services" doit l'afficher

---

## 🎨 MODIFICATIONS VISUELLES

### Badges de type

Les badges affichent maintenant la bonne couleur selon le type :

| Type | Couleur | Classes CSS |
|------|---------|-------------|
| `need` | 🟠 Orange | `bg-orange-50 text-orange-700 border-orange-100` |
| `offer` | 🟢 Vert | `bg-emerald-50 text-emerald-700 border-emerald-100` |
| `unknown` | ⚪ Gris | `bg-gray-50 text-gray-700 border-gray-100` |

### Boutons de filtre

| Filtre | État inactif | État actif |
|--------|-------------|-----------|
| Tous | Blanc | Noir |
| Besoins partenaires | Blanc | Orange |
| Prestataires / services | Blanc | Vert |

---

## 📝 NOTES IMPORTANTES

### 1. Valeurs 'unknown'
- Les anciennes demandes avec `request_type = 'unknown'` apparaîtront uniquement dans "Tous"
- Elles ne seront pas visibles dans les filtres spécifiques
- Utilisez le script SQL pour les migrer vers 'need' ou 'offer'

### 2. Nouvelles soumissions
- À partir de maintenant, toutes les nouvelles demandes auront un `request_type` défini
- Formulaire besoins → `request_type = 'need'`
- Formulaire offres → `request_type = 'offer'`

### 3. Rétrocompatibilité
- Le code accepte les alias : `'partner_need'` et `'service_provider'`
- Cela permet une migration progressive sans casser l'existant

---

## ✅ CHECKLIST DE VALIDATION

- [x] Les filtres sont basés sur `request_type` et non plus sur d'anciennes valeurs
- [x] Les formulaires enregistrent maintenant `request_type = 'need'` ou `'offer'`
- [x] Des logs de debug ont été ajoutés pour faciliter le diagnostic
- [x] Les badges de type affichent la bonne couleur
- [x] Les boutons de filtre utilisent les bonnes valeurs
- [x] Un script SQL de migration a été fourni
- [x] Le build fonctionne sans erreur (11.07s)
- [ ] Les données existantes ont été migrées (à faire manuellement)
- [ ] Les tests ont été effectués sur l'interface admin
- [ ] Les nouveaux formulaires ont été testés

---

## 🚀 PROCHAINES ÉTAPES

1. **Exécuter le script SQL** : `MIGRATION_REQUEST_TYPE.sql` dans Supabase
2. **Tester l'interface admin** : Vérifier que les filtres fonctionnent
3. **Tester les formulaires** : Soumettre des besoins et des offres
4. **Vérifier les logs** : S'assurer que tout est cohérent
5. **Documentation** : Mettre à jour la doc si nécessaire

---

## 📞 SUPPORT

En cas de problème :

1. Ouvrez la console (F12)
2. Filtrez avec `[PartnerRequestsAdmin]` ou `[PartnerRequests]`
3. Vérifiez les messages d'erreur
4. Consultez ce document pour la résolution

---

**Date de correction** : 2025-11-28
**Fichiers modifiés** : 2 (PartnerRequestsAdmin.tsx, PartnerSearch.tsx)
**Fichiers créés** : 2 (MIGRATION_REQUEST_TYPE.sql, ce document)
**Statut** : ✅ Code corrigé, migration SQL fournie, tests à effectuer
