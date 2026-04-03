# Rapport d'Audit - Formulaires et Tables Supabase

**Date:** 2026-01-24
**Projet:** DalilTounes
**Objectif:** Synchronisation Airtable/Whalesync

## Vue d'ensemble

Ce document liste **tous les formulaires** du site DalilTounes et la **table Supabase exacte** à laquelle chacun est connecté.

---

## Tableau récapitulatif des formulaires

| # | Nom du formulaire | Fichier source | Table Supabase | Type d'opération | RLS activé |
|---|-------------------|----------------|----------------|------------------|------------|
| 1 | **Inscription Entreprise** | `src/components/RegistrationForm.tsx` | `entreprise` | INSERT | ✅ |
| 2 | **Profil Candidat** | `src/components/forms/CandidateForm.tsx` | `candidates` | INSERT/UPDATE | ✅ |
| 3 | **Publication Offre d'Emploi** | `src/components/forms/JobPostForm.tsx` | `job_postings` | INSERT/UPDATE | ✅ |
| 4 | **Création Annonce Locale** | `src/components/AnnouncementForm.tsx` | `annonces_locales` | INSERT | ✅ |
| 5 | **Avis Vendeur** | `src/components/AvisForm.tsx` | `avis_vendeur` | INSERT | ✅ |
| 6 | **Signaler une Annonce** | `src/components/ReportModal.tsx` | `annonces_signales` | INSERT | ✅ |
| 7 | **Inscription Professeur Privé** | `src/components/TeacherSignupModal.tsx` | `professeurs_prives` | INSERT | ✅ |
| 8 | **Proposer mes services B2B** | `src/pages/PartnerSearch.tsx` | `projets_services_b2b` | INSERT | ✅ |
| 9 | **Suggérer une entreprise** | `src/components/SuggestionEntrepriseModal.tsx` | `suggestions_entreprises` | INSERT | ✅ |
| 10 | **Suggestion Entreprise (Businesses)** | `src/pages/Businesses.tsx:252` | `business_suggestions` | INSERT | ⚠️ |
| 11 | **Publication Offre d'Emploi (Jobs)** | `src/pages/Jobs.tsx:60` | `job_postings` | INSERT | ✅ |
| 12 | **Candidature à une Offre** | `src/pages/Jobs.tsx:100` | `job_applications` | INSERT | ⚠️ |

---

## Détails par formulaire

### 1. Inscription Entreprise
- **Fichier:** `src/components/RegistrationForm.tsx`
- **Table Supabase:** `entreprise`
- **Colonnes utilisées:**
  - `nom`, `ville`, `categories`, `secteur`, `page_categorie`
  - `adresse`, `telephone`, `email`, `site_web`
  - `description`, `status`, `verified`, `is_premium`
- **Notes:**
  - Formulaire premium pour inscription payante
  - Status par défaut: `pending`
  - Validation email stricte

---

### 2. Profil Candidat
- **Fichier:** `src/components/forms/CandidateForm.tsx`
- **Table Supabase:** `candidates`
- **Colonnes utilisées:**
  - `full_name`, `prenom`, `email`, `phone`
  - `address`, `city`, `category`, `diplome`
  - `skills`, `experience_years`, `languages`
  - `desired_contracts`, `visibility`, `cv_url`
  - `availability`, `is_premium`, `created_by`
- **Notes:**
  - Upload CV vers Supabase Storage
  - Gestion des compétences en array
  - Mode création ET édition

---

### 3. Publication Offre d'Emploi
- **Fichier:** `src/components/forms/JobPostForm.tsx`
- **Table Supabase:** `job_postings`
- **Colonnes utilisées:**
  - `title`, `company`, `company_address`, `city`
  - `category`, `contract_type`, `seniority`
  - `skills`, `description_text`
  - `salary_min`, `salary_max`
  - `contact_email`, `contact_phone`
  - `status`, `is_premium`, `created_by`
- **Notes:**
  - Mode création ET édition
  - Gestion des compétences en array
  - Fourchette salariale optionnelle

---

### 4. Création Annonce Locale
- **Fichier:** `src/components/AnnouncementForm.tsx`
- **Table Supabase:** `annonces_locales`
- **Colonnes utilisées:**
  - `titre`, `description`, `prix`, `devise`
  - `categorie`, `ville`, `etat_produit`
  - `nom_vendeur`, `email_vendeur`, `tel_vendeur`
  - `images_urls`, `accepte_echange`, `negociable`
- **Notes:**
  - Upload d'images multiples (max 5)
  - Gestion des prix négociables
  - Option d'échange

---

### 5. Avis Vendeur
- **Fichier:** `src/components/AvisForm.tsx`
- **Table Supabase:** `avis_vendeur`
- **Colonnes utilisées:**
  - `annonce_id`, `vendeur_email`, `nom_acheteur`
  - `note`, `commentaire`, `created_at`
- **Notes:**
  - Vérification anti-doublon (1 avis par utilisateur)
  - Note de 1 à 5 étoiles
  - Commentaire optionnel

---

### 6. Signaler une Annonce
- **Fichier:** `src/components/ReportModal.tsx`
- **Table Supabase:** `annonces_signales`
- **Colonnes utilisées:**
  - `annonce_id`, `motif`, `details`
  - `signale_par_email`, `created_at`
- **Notes:**
  - Motifs prédéfinis: arnaque, contenu inapproprié, etc.
  - Détails optionnels
  - Email du signaleur optionnel

---

### 7. Inscription Professeur Privé
- **Fichier:** `src/components/TeacherSignupModal.tsx`
- **Fonction:** `addTeacher()` dans `src/lib/BoltDatabase.js:151`
- **Table Supabase:** `professeurs_prives`
- **Colonnes utilisées:**
  - `nom`, `matiere`, `ville`
  - `telephone`, `email`, `description`
- **Notes:**
  - Formulaire simplifié
  - Matière et ville obligatoires
  - Contact optionnel

---

### 8. Proposer mes services B2B
- **Fichier:** `src/pages/PartnerSearch.tsx`
- **Table Supabase:** `projets_services_b2b`
- **Colonnes utilisées:**
  - `type_entree` (valeur: `'offre_service'`)
  - `nom_entreprise`, `secteur_activite`, `description`
  - `site_web`, `annees_experience`
  - `email`, `telephone`, `localisation`
- **Notes:**
  - Nouveau formulaire optimisé (9 champs)
  - Secteur d'activité en dropdown (11 options)
  - Validation stricte avec logs détaillés
  - Toast de confirmation
  - **CORRIGÉ:** Colonnes `description` et `localisation` ajoutées

---

### 9. Suggérer une entreprise
- **Fichier:** `src/components/SuggestionEntrepriseModal.tsx`
- **Table Supabase:** `suggestions_entreprises`
- **Colonnes utilisées:**
  - `nom_entreprise`, `secteur`, `ville`
  - `contact_suggere`, `email_suggesteur`
  - `raison_suggestion`, `statut`
- **Notes:**
  - Modal avec animation Framer Motion
  - 11 secteurs d'activité
  - Toast de confirmation
  - **NOUVEAU:** Table créée le 2026-01-24

---

### 10. Suggestion Entreprise (Page Businesses)
- **Fichier:** `src/pages/Businesses.tsx:252`
- **Table Supabase:** `business_suggestions`
- **Colonnes utilisées:** À vérifier
- **Notes:**
  - ⚠️ **ATTENTION:** Table potentiellement inexistante
  - À migrer vers `suggestions_entreprises` ?

---

### 11. Publication Offre d'Emploi (Page Jobs)
- **Fichier:** `src/pages/Jobs.tsx:60`
- **Table Supabase:** `job_postings`
- **Colonnes utilisées:**
  - `title`, `company`, `location`, `description`
  - `requirements`, `salary`, `contact_email`
- **Notes:**
  - Version simplifiée du formulaire
  - Même table que JobPostForm (#3)

---

### 12. Candidature à une Offre
- **Fichier:** `src/pages/Jobs.tsx:100`
- **Table Supabase:** `job_applications`
- **Colonnes utilisées:**
  - `full_name`, `email`, `phone`
  - `cover_letter`, `cv_url`, `job_posting_id`
- **Notes:**
  - ⚠️ **ATTENTION:** Vérifier si la table existe
  - Lien avec `job_postings` via `job_posting_id`

---

## Tables Supabase concernées

Voici la liste **unique** des tables Supabase utilisées par les formulaires :

1. `entreprise`
2. `candidates`
3. `job_postings`
4. `annonces_locales`
5. `avis_vendeur`
6. `annonces_signales`
7. `professeurs_prives`
8. `projets_services_b2b` ✅ **Corrigée**
9. `suggestions_entreprises` ✅ **Créée**
10. `business_suggestions` ⚠️ **À vérifier**
11. `job_applications` ⚠️ **À vérifier**

---

## Actions de maintenance récentes

### Migration 1: `fix_projets_services_b2b_columns`
**Date:** 2026-01-24
**Modifications:**
- ✅ Ajout colonne `description` (text)
- ✅ Ajout colonne `localisation` (text)

**Raison:** Le formulaire "Proposer mes services" envoyait `description` et `localisation` mais la table avait seulement `description_detaillee` et `localisation_service`.

---

### Migration 2: `add_type_entree_to_projets_services_b2b`
**Date:** 2026-01-24
**Modifications:**
- ✅ Ajout colonne `type_entree` (text, default: 'demande_service')
- ✅ Ajout colonne `secteur_activite` (text)
- ✅ Ajout colonne `annees_experience` (integer)
- ✅ Ajout colonne `site_web` (text)
- ✅ Index sur `type_entree`

**Raison:** Permet de distinguer les offres de services (`'offre_service'`) des demandes (`'demande_service'`).

---

### Migration 3: `create_suggestions_entreprises_table`
**Date:** 2026-01-24
**Modifications:**
- ✅ Création table `suggestions_entreprises`
- ✅ Colonnes: `id`, `nom_entreprise`, `secteur`, `ville`, `contact_suggere`, `email_suggesteur`, `raison_suggestion`, `statut`, `created_at`
- ✅ RLS activé avec politique d'insertion publique
- ✅ Index sur `statut`, `created_at`, `secteur`

**Raison:** Le formulaire "Suggérer une entreprise" échouait car la table était manquante.

---

## Recommandations pour Whalesync/Airtable

### Priorités de synchronisation

**Niveau 1 - Critique (données business):**
- `entreprise` (Entreprises inscrites)
- `candidates` (Candidats)
- `job_postings` (Offres d'emploi)
- `suggestions_entreprises` (Suggestions communauté)
- `projets_services_b2b` (Services B2B)

**Niveau 2 - Important (marketplace):**
- `annonces_locales` (Petites annonces)
- `avis_vendeur` (Avis marketplace)
- `annonces_signales` (Signalements)

**Niveau 3 - Secondaire (éducation):**
- `professeurs_prives` (Professeurs privés)
- `etablissements_education` (Établissements scolaires)

---

## Points d'attention

### ⚠️ Tables à vérifier
- `business_suggestions` - Existe-t-elle ? Migrer vers `suggestions_entreprises` ?
- `job_applications` - Existe-t-elle ? Structure à documenter

### ✅ Corrections appliquées
- `projets_services_b2b` - Colonnes manquantes ajoutées
- `suggestions_entreprises` - Table créée avec RLS

### 🔄 Champs à mapper dans Airtable
Certains champs utilisent des arrays JSON (PostgreSQL):
- `candidates.skills` (array de strings)
- `candidates.languages` (array de strings)
- `candidates.desired_contracts` (array de strings)
- `job_postings.skills` (array de strings)
- `annonces_locales.images_urls` (array de strings)

**Recommandation:** Utiliser des champs "Multi-select" dans Airtable ou convertir en texte séparé par virgules.

---

## Logs et débogage

Tous les formulaires incluent maintenant des logs détaillés :
```
=== DONNÉES PRÊTES POUR SUPABASE ===
Formulaire [Nom] - [Description]
Données formatées: {...}
Types des champs: [détails]
✅ Validation réussie. Envoi à Supabase...
```

Ces logs permettent de tracer précisément les données envoyées et de déboguer rapidement.

---

**Fin du rapport**
