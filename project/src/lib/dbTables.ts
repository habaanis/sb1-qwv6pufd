/**
 * Constantes centralisées pour les noms de tables et RPC Supabase
 *
 * Ce fichier force l'utilisation des bons noms (français) partout dans le projet
 * et évite les erreurs de typo ou de nommage inconsistant.
 */

const Tables = {
  ENTREPRISE: 'entreprise',
  CITIES: 'cities',
  ANNONCES: 'annonces_locales',
  GOUVERNORATS: 'governorates',
  EDUCATION: 'etablissements_education',
  ADMIN: 'demarches_administratives',
  JOBS: 'job_postings',
  JOB_POSTINGS: 'job_postings',
  EVENTS: 'evenements_locaux',
  PROFESSEURS: 'professeurs_prives',
  TRANSPORT_MEDICAL: 'medical_transport_providers',
  BUSINESS_EVENTS: 'business_events',
  PARTNER_REQUESTS: 'partner_requests',
  AVIS_VENDEUR: 'avis_vendeur',
  ALERTES: 'alertes_recherche',
  BUMPS: 'annonce_bumps',
  SIGNALEMENTS: 'annonces_signales',
  CANDIDATES: 'candidates',
  SUGGESTIONS_ENTREPRISES: 'suggestions_entreprises',
  PROJETS_SERVICES_B2B: 'projets_services_b2b',
  QUOTES: 'quotes',
  INSCRIPTIONS_LOISIRS: 'inscriptions_loisirs',
  CULTURE_EVENTS: 'culture_events',
} as const;

const RPC = {
  SUGGEST_ENTREPRISES: 'enterprise_suggest_filtered',
  SUGGEST_ENTREPRISES_SIMPLE: 'enterprise_suggest_simple',
  SUGGEST_VILLES: 'enterprise_city_suggest',
  SEARCH_CITIES_FUZZY: 'search_cities_fuzzy',
  FIND_NEAREST_CITY: 'find_nearest_city',
  SEARCH_GLOBAL: 'search_global_unified',
  ENTERPRISE_SEARCH_LIST: 'enterprise_search_list',
  ENTERPRISE_CITIES_SUGGEST: 'enterprise_cities_suggest',
  ENTERPRISE_CATEGORIES_SUGGEST: 'enterprise_categories_suggest',
  JOB_FACETS: 'job_facets',
  JOB_SEARCH: 'job_search',
} as const;

const Views = {
  ANNONCES_VISIBLES: 'v_annonces_visibles',
} as const;

export { Tables, RPC, Views };
