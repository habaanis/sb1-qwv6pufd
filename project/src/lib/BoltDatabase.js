/* ---------------------------------------------------------
   ⚙️ Fichier : BoltDatabase.js
   Projet : Dalil Tounes 🇹🇳
   Objectif : Constantes Supabase + fonctions helpers
   ⚠️ Le client Supabase unifié est dans src/lib/supabaseClient.ts
--------------------------------------------------------- */

import { supabase } from './supabaseClient';

/* ------------- 🔐 Connexion Supabase ------------- */
// ⚠️ Tu peux laisser ces valeurs ici pour test local,
// mais idéalement les mettre plus tard dans ton .env
export const SUPABASE_URL = "https://kmvjegbtroksjqaqliyv.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdmplZ2J0cm9rc2pxYXFsaXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDA1NTEsImV4cCI6MjA2NzM3NjU1MX0.MbU7b-HWQBwlYtbJeE7_ABvrGhuhzeAuqvkcVvvoE1o";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Clés Supabase manquantes. Vérifie ton .env ou tes constantes.");
  throw new Error("Supabase non configuré.");
}

/* ------------- 🧩 Export du client unifié ------------- */
export { supabase };

/* ---------------------------------------------------------
   📊 Fonction 1 : Compter tous les établissements
--------------------------------------------------------- */
export async function getEtablissementsCount() {
  const { count, error } = await supabase
    .from('entreprise')
    .select('*', { count: 'exact', head: true })
    .limit(1); // ✅ Important : évite la limite implicite de 300

  if (error) {
    console.error("❌ Erreur lors du comptage :", error.message);
    return 0;
  }

  console.log("📊 Nombre total d’établissements :", count);
  return count || 0;
}

/* ---------------------------------------------------------
   🧮 (Optionnel) Fonction 2 : Compter par gouvernorat
--------------------------------------------------------- */
export async function getCountByGovernorate() {
  const { data, error } = await supabase
    .from('entreprise')
    .select('gouvernorat', { count: 'exact' });

  if (error) {
    console.error("❌ Erreur lors du comptage par gouvernorat :", error.message);
    return [];
  }

  // Regrouper les résultats par gouvernorat
  const map = {};
  data.forEach(row => {
    if (!map[row.gouvernorat]) map[row.gouvernorat] = 0;
    map[row.gouvernorat]++;
  });

  console.log("📍 Répartition par gouvernorat :", map);
  return map;
}

/* ---------------------------------------------------------
   🔍 (Optionnel) Fonction 3 : Récupérer les dernières entrées
--------------------------------------------------------- */
export async function getLatestEtablissements(limit = 10) {
  const { data, error } = await supabase
    .from('entreprise')
    .select('nom, ville, categories, telephone, site_web')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ Erreur lors de la récupération des dernières entrées :", error.message);
    return [];
  }

  console.log(`🆕 ${data.length} derniers établissements récupérés`);
  return data;
}

/* ---------------------------------------------------------
   🎓 Fonction 4 : Recherche établissements éducation
--------------------------------------------------------- */
export async function searchEducation({ keyword = '', city = '', quick = null, pageCategorie = null }) {
  try {
    let query = supabase.from('entreprise').select('*');

    if (pageCategorie) {
      query = query.eq('page_categorie', pageCategorie);
    } else {
      query = query.ilike('categories', '%éducation%');
    }

    if (keyword)
      query = query.or(`nom.ilike.%${keyword}%,description.ilike.%${keyword}%,ville.ilike.%${keyword}%`);
    if (city)
      query = query.ilike('ville', `%${city}%`);
    if (quick === 'languages')
      query = query.ilike('sous_categories', '%langue%');

    const { data, error } = await query.limit(30);
    if (error) throw error;
    console.log("✅ Résultats éducation:", data?.length || 0, "établissements");
    return data || [];
  } catch (err) {
    console.error("❌ Erreur searchEducation:", err.message);
    return [];
  }
}

/* ---------------------------------------------------------
   👨‍🏫 Fonction 5 : Recherche professeurs privés
--------------------------------------------------------- */
export async function searchTeachers({ keyword = '', city = '' }) {
  try {
    let query = supabase.from('professeurs_prives').select('*');

    if (keyword)
      query = query.or(`nom.ilike.%${keyword}%,matiere.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    if (city)
      query = query.ilike('ville', `%${city}%`);

    const { data, error } = await query.limit(30);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("❌ Erreur searchTeachers:", err.message);
    return [];
  }
}

export async function addTeacher(payload) {
  try {
    // Préparer les données - STRICTE CORRESPONDANCE avec les colonnes
    const teacherData = {
      nom: payload.nom?.trim() || '',
      matiere: payload.matiere?.trim() || '',
      ville: payload.ville?.trim() || '',
      telephone: payload.telephone?.trim() || null,
      email: payload.email?.trim() || null,
      description: payload.description?.trim() || null
    };

    // LOG DE DÉBOGAGE - Données prêtes pour Supabase
    console.log('=== DONNÉES PRÊTES POUR SUPABASE ===');
    console.log('Fonction addTeacher - Professeur Privé');
    console.log('Données formatées:', JSON.stringify(teacherData, null, 2));
    console.log('Types des champs:');
    console.log('- nom (string):', typeof teacherData.nom, teacherData.nom);
    console.log('- matiere (string):', typeof teacherData.matiere, teacherData.matiere);
    console.log('- ville (string):', typeof teacherData.ville, teacherData.ville);
    console.log('- telephone (string|null):', typeof teacherData.telephone, teacherData.telephone);
    console.log('- email (string|null):', typeof teacherData.email, teacherData.email);
    console.log('- description (string|null):', typeof teacherData.description, teacherData.description);
    console.log('=====================================');

    // Validation des champs obligatoires
    const requiredFields = ['nom', 'matiere', 'ville'];
    const missingFields = requiredFields.filter(field => !teacherData[field] || teacherData[field].trim() === '');

    if (missingFields.length > 0) {
      console.error('❌ ERREUR: Champs obligatoires manquants:', missingFields);
      return { error: { message: `Champs obligatoires manquants: ${missingFields.join(', ')}` } };
    }

    // Validation de l'email si présent
    if (teacherData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(teacherData.email)) {
        console.error('❌ ERREUR: Format email invalide:', teacherData.email);
        return { error: { message: 'Format email invalide' } };
      }
    }

    console.log('✅ Validation réussie. Envoi à Supabase...');

    const { data, error } = await supabase
      .from('professeurs_prives')
      .insert([teacherData])
      .select('id')
      .single();

    if (error) {
      console.error('❌ ERREUR Supabase:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      return { error };
    }

    console.log('✅ SUCCÈS: Professeur privé créé dans Supabase');
    console.log('Données créées:', data);
    console.log('ID professeur:', data?.id);
    return { data, error: null };
  } catch (err) {
    console.error('❌ ERREUR INATTENDUE:', err);
    return { error: err };
  }
}

/* ---------------------------------------------------------
   🔍 Fonction 6 : Recherche globale d'établissements
--------------------------------------------------------- */
export async function searchEtablissements({ keyword = '', city = '', category = '' }) {
  try {
    let query = supabase.from('entreprise').select('*');

    // Filtrage par catégorie
    if (category && category.trim()) {
      query = query.ilike('categories', `%${category.trim()}%`);
    }

    // Filtrage par ville
    if (city && city.trim()) {
      query = query.ilike('ville', `%${city.trim()}%`);
    }

    // Recherche par mot-clé (large)
    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      query = query.or(`nom.ilike.%${kw}%,description.ilike.%${kw}%,categories.ilike.%${kw}%,sous_categories.ilike.%${kw}%,ville.ilike.%${kw}%`);
    }

    const { data, error } = await query
      .order('nom', { ascending: true })
      .limit(30);

    if (error) throw error;
    console.log("✅ searchEtablissements:", data?.length || 0, "résultats");
    return data || [];
  } catch (err) {
    console.error("❌ Erreur recherche établissement:", err.message);
    return [];
  }
}

/* ---------------------------------------------------------
   🏥 Fonction 7 : Recherche établissements de santé
--------------------------------------------------------- */
export async function searchHealthEstablishments({ keyword = '', city = '', type = null }) {
  try {
    let query = supabase
      .from('entreprise')
      .select('id, nom, categories, sous_categories, ville, adresse, telephone, site_web, email, description, verified')
      .ilike('categories', '%santé%');

    if (keyword.trim().length >= 2) {
      const kw = keyword.trim();
      query = query.or(
        `nom.ilike.%${kw}%, description.ilike.%${kw}%, sous_categories.ilike.%${kw}%`
      );
    }

    if (city.trim()) {
      query = query.ilike('ville', `%${city.trim()}%`);
    }

    if (type) {
      query = query.ilike('sous_categories', `%${type}%`);
    }

    const { data, error } = await query.order('nom', { ascending: true }).limit(30);

    if (error) {
      console.error('❌ Erreur searchHealthEstablishments:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Erreur critique searchHealthEstablishments:', err.message);
    return [];
  }
}

/* ---------------------------------------------------------
   🎉 Fonction 8 : Récupérer les événements mis en avant
--------------------------------------------------------- */
export async function getFeaturedEvents(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('business_events')
      .select('*')
      .eq('featured', true)
      .order('event_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('⚠️ getFeaturedEvents disabled (table not available):', error.message);
      return [];
    }

    console.log("✅ Événements featured:", data?.length || 0, "événements");
    return data || [];
  } catch (err) {
    console.warn('⚠️ getFeaturedEvents disabled:', err.message);
    return [];
  }
}

/* ---------------------------------------------------------
   🎊 Fonction 9 : Récupérer tous les événements
--------------------------------------------------------- */
export async function getAllEvents() {
  try {
    const { data, error } = await supabase
      .from('business_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      console.warn('⚠️ getAllEvents disabled (table not available):', error.message);
      return [];
    }

    console.log("✅ Tous les événements:", data?.length || 0, "événements");
    return data || [];
  } catch (err) {
    console.warn('⚠️ getAllEvents disabled:', err.message);
    return [];
  }
}

/* ---------------------------------------------------------
   🏥 Fonction : Rechercher des professionnels de santé (VERSION AMÉLIORÉE)
--------------------------------------------------------- */
export async function searchHealthProfessionals(opts) {
  const { specialty = '', city = '', acceptCNAM = false, limit = 30, pageCategorie = null } = opts;

  try {
    let q = supabase
      .from('entreprise')
      .select('id, nom, secteur, sous_categories, gouvernorat', { count: 'exact' })
      .eq('secteur', 'sante')
      .limit(limit);

    // Filtre par spécialité
    if (specialty.trim()) {
      const s = specialty.trim();
      q = q.or(`nom.ilike.%${s}%,sous_categories.ilike.%${s}%`);
    }

    // Filtre par gouvernorat
    if (city.trim()) {
      q = q.eq('gouvernorat', city.trim());
    }

    const { data, error } = await q.order('nom', { ascending: true });

    if (error) {
      console.error('❌ Erreur searchHealthProfessionals:', error.message);
      return [];
    }

    console.log('✅ Professionnels de santé trouvés:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Erreur critique searchHealthProfessionals:', err.message);
    return [];
  }
}

/* ---------------------------------------------------------
   🚨 Fonction : Récupérer les établissements d'urgence 24/7 (VERSION AMÉLIORÉE)
--------------------------------------------------------- */
export async function getEmergencyFacilities() {
  try {
    // Essayer d'abord la table dédiée emergency_facilities
    const { data: emergencyData, error: emergencyError } = await supabase
      .from('emergency_facilities')
      .select('name, phone, address')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(10);

    // Si la table existe et contient des données, on les retourne
    if (!emergencyError && emergencyData && emergencyData.length > 0) {
      console.log('✅ Établissements d\'urgence (table dédiée):', emergencyData.length);
      return emergencyData;
    }

    // Fallback : chercher dans la table entreprise
    const { data, error } = await supabase
      .from('entreprise')
      .select('nom as name, telephone as phone, adresse as address')
      .ilike('categories', '%Santé%')
      .or('sous_categories.ilike.%urgence%,sous_categories.ilike.%24/7%,sous_categories.ilike.%hopital%,sous_categories.ilike.%hôpital%')
      .limit(10);

    if (error) {
      console.error('❌ Erreur getEmergencyFacilities:', error.message);
      return [];
    }

    console.log('✅ Établissements d\'urgence trouvés (entreprise):', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Erreur critique getEmergencyFacilities:', err.message);
    return [];
  }
}

/* ---------------------------------------------------------
   💊 Fonction : Récupérer le lien des pharmacies de garde (VERSION AMÉLIORÉE)
--------------------------------------------------------- */
export async function getOnCallPharmaciesLink() {
  try {
    // Essayer de récupérer depuis la table settings
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', 'pharmacies_de_garde_url')
      .limit(1)
      .maybeSingle();

    // Si trouvé dans settings, retourner la valeur
    if (data?.value) {
      console.log('✅ Lien pharmacies de garde (settings):', data.value);
      return data.value;
    }

    // Fallback : lien par défaut
    const defaultLink = 'https://www.pharmacie.tn/garde';
    console.log('✅ Lien pharmacies de garde (par défaut):', defaultLink);
    return defaultLink;
  } catch (err) {
    console.error('❌ Erreur getOnCallPharmaciesLink:', err.message);
    // En cas d'erreur, retourner le lien par défaut
    return 'https://www.pharmacie.tn/garde';
  }
}

/* ---------------------------------------------------------
   🏙️ Fonction : Récupérer les villes depuis Supabase (autocomplétion avec Fuzzy Search)
--------------------------------------------------------- */
export async function searchCities(searchTerm) {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    // Essayer d'abord la recherche fuzzy
    const { data: fuzzyData, error: fuzzyError } = await supabase.rpc('search_cities_fuzzy', {
      search_query: searchTerm,
      similarity_threshold: 0.3
    });

    if (!fuzzyError && fuzzyData && fuzzyData.length > 0) {
      console.log('✅ Villes trouvées (fuzzy):', fuzzyData.length);
      return fuzzyData;
    }

    // Fallback 1: Utilise RPC pour recherche avec unaccent (insensible aux accents)
    const { data, error } = await supabase.rpc('search_cities_unaccent', {
      search_term: searchTerm
    });

    if (error) {
      console.error('❌ Erreur searchCities:', error.message);

      // Fallback 2: recherche simple sans unaccent
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('cities')
        .select(`
          name_fr,
          name_ar,
          governorates (
            name_fr
          )
        `)
        .or(`name_fr.ilike.%${searchTerm}%,name_ar.ilike.%${searchTerm}%`)
        .order('name_fr', { ascending: true })
        .limit(10);

      if (fallbackError) {
        console.error('❌ Erreur fallback:', fallbackError.message);
        return [];
      }

      const formattedFallback = fallbackData?.map(city => ({
        name_fr: city.name_fr,
        name_ar: city.name_ar,
        governorate_fr: city.governorates?.name_fr || ''
      })) || [];

      console.log('✅ Villes trouvées (fallback):', formattedFallback.length);
      return formattedFallback;
    }

    console.log('✅ Villes trouvées:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Erreur critique searchCities:', err.message);
    return [];
  }
}

/* ---------------------------------------------------------
   🚑 Fonction : Rechercher des transporteurs médicaux
--------------------------------------------------------- */
export async function searchMedicalTransportProviders(opts) {
  const { city = '', limit = 20 } = opts;

  try {
    // Essayer d'abord la table dédiée medical_transport_providers
    const { data: transportData, error: transportError } = await supabase
      .from('medical_transport_providers')
      .select('id, nom as name, ville as city, telephone as phone, type_vehicule as vehicle_type, certifications, is_cnam_approved')
      .eq('is_active', true)
      .limit(limit);

    // Si la table dédiée existe et contient des données
    if (!transportError && transportData && transportData.length > 0) {
      let filteredData = transportData;

      // Filtrer par ville si spécifié
      if (city.trim()) {
        filteredData = transportData.filter(t =>
          t.city?.toLowerCase().includes(city.trim().toLowerCase())
        );
      }

      console.log('✅ Transporteurs médicaux trouvés (table dédiée):', filteredData.length);
      return filteredData;
    }

    // Fallback : chercher dans la table entreprise
    let query = supabase
      .from('entreprise')
      .select('id, nom as name, ville as city, telephone as phone, sous_categories, description')
      .or('categories.ilike.%transport médical%,categories.ilike.%transport medical%,categories.ilike.%ambulance%,sous_categories.ilike.%transport médical%,sous_categories.ilike.%transport medical%,sous_categories.ilike.%ambulance%');

    // Filtrer par ville
    if (city.trim()) {
      query = query.ilike('ville', `%${city.trim()}%`);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error('❌ Erreur searchMedicalTransportProviders:', error.message);
      return [];
    }

    console.log('✅ Transporteurs médicaux trouvés (entreprise):', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Erreur critique searchMedicalTransportProviders:', err.message);
    return [];
  }
}
