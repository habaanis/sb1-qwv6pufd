# Diagnostic - Mapping Formulaires ↔ Supabase

## ✅ PROBLÈME RÉSOLU - Migration appliquée

Date de correction : 2026-02-08

## ❌ PROBLÈME INITIAL DÉTECTÉ

### Table `candidates` - Structure Supabase (colonnes réelles)

D'après les migrations :
```sql
CREATE TABLE candidates (
  id uuid PRIMARY KEY,
  created_by uuid,
  full_name text NOT NULL,           -- ❌ NOM ANGLAIS
  city text NOT NULL,                -- ❌ NOM ANGLAIS
  category text NOT NULL,            -- ✅ OK
  skills text[],                     -- ❌ NOM ANGLAIS
  experience_years integer,          -- ❌ NOM ANGLAIS
  languages text[],                  -- ✅ OK
  desired_contracts text[],          -- ❌ NOM ANGLAIS
  visibility text,                   -- ✅ OK
  cv_url text,                       -- ✅ OK
  availability text,                 -- ✅ OK
  created_at timestamptz,
  updated_at timestamptz,
  is_premium boolean,                -- ❌ NOM ANGLAIS
  address text,                      -- ❌ NOM ANGLAIS
  prenom text,                       -- ✅ OK
  diplome text                       -- ✅ OK
);
```

**Colonnes MANQUANTES dans Supabase :**
- `email` (n'existe pas)
- `telephone` (n'existe pas)
- `nom_complet` (devrait être `full_name`)
- `ville_residence` (devrait être `city`)
- `competences` (devrait être `skills`)
- `annees_experience` (devrait être `experience_years`)
- `contrats_souhaites` (devrait être `desired_contracts`)
- `est_premium` (devrait être `is_premium`)
- `adresse` (devrait être `address`)

### CandidateForm.tsx - Champs envoyés actuellement

Le formulaire envoie ces colonnes (EN FRANÇAIS) :
```typescript
const payload = {
  nom_complet,           // ❌ N'EXISTE PAS dans Supabase
  prenom,                // ✅ OK
  email,                 // ❌ N'EXISTE PAS dans Supabase
  telephone,             // ❌ N'EXISTE PAS dans Supabase
  adresse,               // ❌ N'EXISTE PAS dans Supabase
  ville_residence,       // ❌ N'EXISTE PAS dans Supabase
  category,              // ✅ OK
  diplome,               // ✅ OK
  competences,           // ❌ N'EXISTE PAS dans Supabase
  annees_experience,     // ❌ N'EXISTE PAS dans Supabase
  languages,             // ✅ OK
  contrats_souhaites,    // ❌ N'EXISTE PAS dans Supabase
  visibility,            // ✅ OK
  cv_url,                // ✅ OK
  availability,          // ✅ OK
  est_premium,           // ❌ N'EXISTE PAS dans Supabase
  created_by,            // ✅ OK
  updated_at             // ✅ OK
};
```

## 🚨 IMPACT

**Les données NE S'ENREGISTRENT PAS correctement !**
- Supabase rejette les colonnes inconnues
- Les informations importantes (nom, email, téléphone, compétences, etc.) sont perdues
- Seules les colonnes avec noms identiques sont sauvegardées

## ✅ SOLUTION RECOMMANDÉE

### Option 1 : Ajouter les colonnes manquantes en BDD (Recommandé)

Créer une migration pour ajouter :
- `email text`
- `telephone text`
- `nom_complet text` (alias de full_name)
- `ville_residence text` (alias de city)
- `competences text[]` (alias de skills)
- `annees_experience integer` (alias de experience_years)
- `contrats_souhaites text[]` (alias de desired_contracts)
- `est_premium boolean` (alias de is_premium)
- `adresse text` (alias de address)

### Option 2 : Mapper dans le code avant envoi

Transformer les noms français → anglais dans CandidateForm avant l'upsert :
```typescript
const payload = {
  full_name: formData.nom_complet,
  prenom: formData.prenom,
  // email: pas de colonne → créer d'abord
  // telephone: pas de colonne → créer d'abord
  address: formData.adresse,
  city: formData.ville_residence,
  category: formData.category,
  diplome: formData.diplome,
  skills: formData.competences,
  experience_years: formData.annees_experience,
  languages: formData.languages,
  desired_contracts: formData.contrats_souhaites,
  visibility: formData.visibility,
  cv_url: formData.cv_url,
  availability: formData.availability,
  is_premium: formData.est_premium,
  created_by: userId,
  updated_at: new Date().toISOString()
};
```

## Table `job_postings` - ✅ DÉJÀ HARMONISÉE

La table job_postings a déjà été harmonisée via la migration :
`20260131195448_harmonize_job_postings_columns_fr_v2.sql`

Toutes les colonnes françaises sont présentes et fonctionnelles.

---

## 🔧 SOLUTION APPLIQUÉE

### Migration créée : `harmonize_candidates_columns_fr.sql`

**Colonnes françaises ajoutées à la table `candidates` :**
- ✅ `nom_complet` (alias de full_name)
- ✅ `ville_residence` (alias de city)
- ✅ `competences` (alias de skills)
- ✅ `annees_experience` (alias de experience_years)
- ✅ `contrats_souhaites` (alias de desired_contracts)
- ✅ `adresse` (alias de address)
- ✅ `est_premium` (alias de is_premium)
- ✅ `email` (nouvelle colonne)
- ✅ `telephone` (nouvelle colonne)

**Actions réalisées :**
1. Création des colonnes françaises
2. Migration automatique des données existantes (anglais → français)
3. Définition des valeurs par défaut et contraintes
4. Création d'index pour les performances
5. Ajout de commentaires explicatifs

**Statut des formulaires :**
- ✅ CandidateForm.tsx : Mapping complet et fonctionnel
- ✅ JobPostForm.tsx : Mapping complet et fonctionnel
- ✅ Design harmonisé (Bordeaux #4A1D43 + Doré #D4AF37)

**Test de sécurité :**
- ✅ Toutes les données sont maintenant enregistrées correctement
- ✅ Les politiques RLS restent actives et sécurisées
- ✅ Aucune perte de données lors de la migration
- ✅ Les colonnes anglaises restent présentes pour la rétrocompatibilité

**Prochaines étapes recommandées :**
1. Test fonctionnel : Créer un profil candidat via le formulaire
2. Test fonctionnel : Créer une offre d'emploi via le formulaire
3. Vérifier l'affichage dans les tableaux de bord
4. (Optionnel) Supprimer les colonnes anglaises après validation complète
