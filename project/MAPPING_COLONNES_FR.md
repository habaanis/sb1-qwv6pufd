# Mapping des Colonnes - Français

## Table: job_postings

### Anciennes colonnes → Nouvelles colonnes

| Ancien (Anglais) | Nouveau (Français) | Type | Notes |
|------------------|-------------------|------|-------|
| `title` | `titre_poste` | text | ✅ |
| `company` | `nom_entreprise` | text | ✅ |
| `description` | `description_poste` | text | ✅ |
| `city` | `ville` | text | ✅ |
| `contract_type` | `type_contrat` | text | ✅ |
| `status` | `statut` | text | ✅ |
| `is_premium` | `est_premium` | boolean | ✅ |
| `contact_email` | `email_contact` | text | ✅ |
| `contact_phone` | `telephone_contact` | text | ✅ |
| `salary_min` | `salaire_min` | integer | ✅ |
| `salary_max` | `salaire_max` | integer | ✅ |
| `category` | `secteur_emploi` | text | ✅ |
| `requirements` | `exigences_profil` | text | ✅ |
| `skills` | `competences_cles` | text[] | ✅ |
| `seniority` | `niveau_experience` | text | ✅ |

### Colonnes inchangées
- `id` (uuid)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (uuid)

---

## Table: candidates

### Colonnes à utiliser (déjà en français)

| Colonne | Type | Notes |
|---------|------|-------|
| `nom_complet` | text | ✅ Déjà en français |
| `email` | text | ✅ |
| `telephone` | text | ✅ |
| `competences` | text[] | ✅ |
| `annees_experience` | integer | ✅ |
| `cv_url` | text | ✅ |
| `est_premium` | boolean | ✅ |
| `contrats_souhaites` | text[] | ✅ |
| `ville_residence` | text | ✅ |
| `prenom` | text | ✅ |
| `diplome` | text | ✅ |

### Anciennes colonnes à mapper

| Ancien | Nouveau | Notes |
|--------|---------|-------|
| `full_name` | `nom_complet` | ✅ |
| `phone` | `telephone` | ✅ |
| `skills` | `competences` | ✅ |
| `experience_years` | `annees_experience` | ✅ |
| `is_premium` | `est_premium` | ✅ |
| `desired_contracts` | `contrats_souhaites` | ✅ |
| `city` | `ville_residence` | ✅ |

---

## Table: entreprise

### Nouveaux champs à ajouter dans l'affichage

| Colonne | Type | Description |
|---------|------|-------------|
| `matricule_fiscal` | text | Numéro d'identification fiscale |
| `email_professionnel` | text | Email professionnel de l'entreprise |
| `adresse_administrative` | text | Adresse administrative complète |

---

## Résumé des fichiers à modifier

### 1. Interfaces TypeScript
- `src/hooks/useJobSearch.ts` - Interface JobPosting
- `src/lib/jobsApi.ts` - Type JobFilters
- `src/components/forms/JobPostForm.tsx` - Interface JobData
- `src/components/forms/CandidateForm.tsx` - Interface CandidateData

### 2. Requêtes Supabase
- `src/lib/jobsApi.ts` - Toutes les requêtes SELECT
- `src/components/forms/JobPostForm.tsx` - INSERT/UPDATE
- `src/components/forms/CandidateForm.tsx` - UPSERT
- `src/pages/Jobs.tsx` - SELECT
- `src/pages/JobDetail.tsx` - SELECT
- `src/pages/CandidateProfile.tsx` - SELECT
- `src/pages/PublishJob.tsx` - SELECT/UPDATE

### 3. Composants d'affichage
- `src/components/JobCard.tsx`
- `src/components/SimpleJobCard.tsx`
- `src/pages/JobDetail.tsx`
- `src/pages/CandidateProfile.tsx`
- `src/pages/BusinessDetail.tsx`

### 4. Pages
- `src/pages/Jobs.tsx`
- `src/pages/PublishJob.tsx`
- `src/pages/CompanyDashboard.tsx`
- `src/pages/CandidateDashboard.tsx`
- `src/pages/CandidateList.tsx`
