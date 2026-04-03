# Corrections des Formulaires - Janvier 2026

## Problèmes identifiés et corrigés

### 1. Formulaire "Suggérer une entreprise" (Erreur 400)

**Problème**: Envoyait le champ `statut` alors que la table utilise une valeur par défaut.

**Fichiers corrigés**:
- `src/components/SuggestionEntrepriseModal.tsx` - Supprimé le champ `statut`
- `src/pages/Businesses.tsx` - Supprimé le champ `statut`

**Solution**: Les 6 clés exactes envoyées à `suggestions_entreprises`:
```javascript
{
  nom_entreprise,    // required
  secteur,           // required
  ville,             // optional
  contact_suggere,   // optional
  email_suggesteur,  // optional
  raison_suggestion  // optional
}
// statut est défini automatiquement à 'en_attente'
```

### 2. Formulaire "Inscrire mon entreprise" (Erreur 400)

**Problème**: Envoyait vers la table `registration_requests` qui N'EXISTE PAS dans la base de données.

**Fichiers corrigés**:
- `src/components/RegistrationForm.tsx`
  - Changé de `registration_requests` → `suggestions_entreprises`
  - Adapté les données au format des 6 clés requises

**Solution**: Maintenant envoie vers `suggestions_entreprises` avec toutes les informations détaillées dans le champ `raison_suggestion`.

### 3. Autres formulaires B2B corrigés

**Fichiers corrigés pour utiliser `partner_requests`**:
- `src/pages/PartnerSearch.tsx` (2 formulaires)
  - Formulaire de recherche partenaire
  - Formulaire d'offre de service
- `src/components/MedicalTransportRegistrationForm.tsx`
- `src/components/LeisureEventProposalForm.tsx`

**Mapping vers `partner_requests`**:
```javascript
{
  company_name,
  contact_name,
  email,
  phone,
  city,
  description,
  request_type,
  sector
}
```

### 4. Vérification logo_url

**Status**: ✅ CORRECT

- La table s'appelle `entreprise` (singulier, pas entreprises)
- La colonne s'appelle `logo_url` (pas logo)
- `src/components/PremiumPartnersSection.tsx` utilise correctement `logo_url`

## Tests effectués

### Test 1: Insertion dans suggestions_entreprises
```sql
INSERT INTO suggestions_entreprises (
  nom_entreprise, secteur, ville, contact_suggere,
  email_suggesteur, raison_suggestion
) VALUES (...);
```
✅ SUCCÈS - statut défini automatiquement à 'en_attente'

### Test 2: Insertion dans partner_requests
```sql
INSERT INTO partner_requests (
  company_name, contact_name, email, phone,
  city, description, request_type, sector
) VALUES (...);
```
✅ SUCCÈS

## Structure de la base de données

### Tables utilisées:
1. **suggestions_entreprises** (5 lignes)
   - Pour suggestions d'entreprises
   - Pour inscriptions d'entreprises

2. **partner_requests** (2 lignes)
   - Pour recherches de partenaires B2B
   - Pour offres de services B2B
   - Pour transports médicaux
   - Pour événements de loisirs

3. **entreprise** (347 lignes) - NOM CORRECT (singulier)
   - Possède la colonne `logo_url` ✅

### Table supprimée/inexistante:
- ❌ `registration_requests` - N'EXISTE PAS dans la base

## Résumé des corrections

- ✅ Suppression du champ `statut` dans les formulaires de suggestions
- ✅ Redirection de `registration_requests` vers `suggestions_entreprises`
- ✅ Redirection vers `partner_requests` pour tous les formulaires B2B
- ✅ Vérification que `logo_url` est utilisé correctement
- ✅ Build du projet réussi
- ✅ Tests d'insertion validés

## Les deux formulaires fonctionnent maintenant correctement

1. **"Suggérer une entreprise"** → `suggestions_entreprises`
2. **"Inscrire mon entreprise"** → `suggestions_entreprises`
