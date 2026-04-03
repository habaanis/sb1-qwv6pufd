#!/usr/bin/env node

/**
 * Script de géocodage GLOBAL v2 pour toutes les villes de Tunisie
 * Basé sur les améliorations v2 de Mahdia/Chebba
 *
 * Fonctionnalités:
 * 1. Filtrage géographique strict par ville
 * 2. Gestion des adresses descriptives tunisiennes
 * 3. Géocodage en cascade (3 niveaux)
 * 4. Protection contre données sales (horaires, téléphones)
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Zone de tolérance autour du centre-ville (en degrés, ~5-10km)
const CITY_RADIUS = 0.1;

/**
 * Charge toutes les villes de Tunisie avec leurs coordonnées
 */
async function loadCitiesBounds() {
  const { data, error } = await supabase
    .from('villes')
    .select('nom, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) {
    throw error;
  }

  const bounds = {};

  for (const city of data) {
    const lat = parseFloat(city.latitude);
    const lon = parseFloat(city.longitude);

    bounds[city.nom.toLowerCase()] = {
      lat_min: lat - CITY_RADIUS,
      lat_max: lat + CITY_RADIUS,
      lon_min: lon - CITY_RADIUS,
      lon_max: lon + CITY_RADIUS,
      center: { lat, lon }
    };
  }

  return bounds;
}

/**
 * Valide si une adresse est exploitable pour le géocodage
 */
function isValidAddress(adresse) {
  if (!adresse || adresse.trim().length < 5) {
    return false;
  }

  const suspiciousPatterns = [
    /\d{1,2}h\d{0,2}/i,
    /\d{1,2}:\d{2}/,
    /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i,
    /ouvert|fermé|fermeture/i,
    /^\d{8}$/,
    /^\+216/,
    /^\?+$/,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(adresse)) {
      return false;
    }
  }

  return true;
}

/**
 * Valide si un gouvernorat est exploitable
 */
function isValidGouvernorat(gouvernorat) {
  if (!gouvernorat) {
    return false;
  }

  const suspiciousPatterns = [
    /\d{1,2}h\d{0,2}/i,
    /\d{1,2}:\d{2}/,
    /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i,
    /ouvert|fermé|fermeture/i,
    /^null$/i,
    /^a_verifier$/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(gouvernorat)) {
      return false;
    }
  }

  return true;
}

/**
 * Parse les adresses descriptives tunisiennes
 */
function parseDescriptiveAddress(adresse) {
  const descriptivePatterns = [
    /(?:en face de?|en face d[ue])\s+(.+)/i,
    /(?:à côté de?|a cote de?)\s+(.+)/i,
    /(?:près de?|pres de?)\s+(.+)/i,
    /(?:devant|derrière)\s+(.+)/i,
    /(?:face à|face a)\s+(.+)/i,
  ];

  for (const pattern of descriptivePatterns) {
    const match = adresse.match(pattern);
    if (match) {
      return {
        isDescriptive: true,
        landmark: match[1].trim()
      };
    }
  }

  return {
    isDescriptive: false,
    landmark: null
  };
}

/**
 * Vérifie si des coordonnées sont dans la zone géographique d'une ville
 */
function isInCityBounds(latitude, longitude, ville, cityBounds) {
  const cityKey = ville.toLowerCase();
  const bounds = cityBounds[cityKey];

  if (!bounds) {
    // Si ville inconnue, pas de restriction (fallback)
    return true;
  }

  return (
    latitude >= bounds.lat_min &&
    latitude <= bounds.lat_max &&
    longitude >= bounds.lon_min &&
    longitude <= bounds.lon_max
  );
}

/**
 * Géocode une adresse via Nominatim avec filtrage strict
 */
async function geocodeAddress(adresse, ville, gouvernorat, nom, cityBounds) {
  const validAdresse = adresse && isValidAddress(adresse) ? adresse : null;
  const validGouvernorat = gouvernorat && isValidGouvernorat(gouvernorat) ? gouvernorat : null;

  // Parse les adresses descriptives
  let searchAddress = validAdresse;
  if (validAdresse) {
    const parsed = parseDescriptiveAddress(validAdresse);
    if (parsed.isDescriptive) {
      searchAddress = parsed.landmark;
    }
  }

  // Construction de la requête avec ville TOUJOURS présente
  const parts = [];

  if (searchAddress) {
    parts.push(searchAddress);
  }

  // TOUJOURS ajouter la ville
  if (ville) {
    parts.push(ville);
  }

  if (validGouvernorat) {
    parts.push(validGouvernorat);
  }

  parts.push('Tunisia');

  const query = parts.join(', ');
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=3&countrycodes=tn`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DalilTounes/2.0 (contact@daliltounes.tn)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      // Filtrage géographique strict
      for (const result of data) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        if (isInCityBounds(lat, lon, ville, cityBounds)) {
          return {
            latitude: lat,
            longitude: lon,
            display_name: result.display_name,
            importance: result.importance,
            filtered: false
          };
        }
      }

      // Aucun résultat dans la bonne zone
      return null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Tentative de géocodage en cascade (3 niveaux)
 */
async function geocodeWithFallback(entreprise, cityBounds) {
  const { id, nom, adresse, ville, gouvernorat } = entreprise;

  // Niveau 1: Adresse complète + ville + gouvernorat
  let coords = await geocodeAddress(adresse || '', ville || '', gouvernorat || '', nom, cityBounds);

  if (coords) {
    return { ...coords, level: 1 };
  }

  // Niveau 2: Nom entreprise + ville
  if (nom && ville) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    coords = await geocodeAddress(nom, ville, gouvernorat || '', '', cityBounds);

    if (coords) {
      return { ...coords, level: 2 };
    }
  }

  // Niveau 3: Fallback au centre-ville
  const cityKey = ville ? ville.toLowerCase() : null;
  const bounds = cityBounds[cityKey];

  if (bounds) {
    return {
      latitude: bounds.center.lat,
      longitude: bounds.center.lon,
      display_name: `Centre-ville ${ville} (fallback)`,
      importance: 0,
      filtered: false,
      level: 3,
      isFallback: true
    };
  }

  return null;
}

/**
 * Met à jour les coordonnées d'une entreprise
 */
async function updateCoordinates(id, latitude, longitude) {
  const { error } = await supabase
    .from('entreprise')
    .update({
      latitude,
      longitude,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/**
 * Identifie toutes les entreprises à géocoder
 */
async function getEntreprisesToGeocode(cityBounds) {
  // Récupérer toutes les entreprises
  const { data: all, error } = await supabase
    .from('entreprise')
    .select('id, nom, adresse, ville, gouvernorat, latitude, longitude')
    .order('ville', { ascending: true });

  if (error) {
    throw error;
  }

  const toGeocode = [];

  for (const ent of all) {
    // Cas 1: Pas de GPS
    if (!ent.latitude || !ent.longitude) {
      toGeocode.push({ ...ent, reason: 'NO_GPS' });
      continue;
    }

    // Cas 2: GPS mais hors zone (mal géocodé)
    if (ent.ville && !isInCityBounds(ent.latitude, ent.longitude, ent.ville, cityBounds)) {
      toGeocode.push({ ...ent, reason: 'OUT_OF_BOUNDS' });
      continue;
    }

    // Cas 3: GPS fallback probable (centre-ville exact)
    const cityKey = ent.ville ? ent.ville.toLowerCase() : null;
    const bounds = cityBounds[cityKey];
    if (bounds) {
      const distFromCenter = Math.sqrt(
        Math.pow(ent.latitude - bounds.center.lat, 2) +
        Math.pow(ent.longitude - bounds.center.lon, 2)
      );

      // Si très proche du centre (< 0.0001 deg ~10m) et a une adresse, probablement fallback
      if (distFromCenter < 0.0001 && ent.adresse && ent.adresse.length > 5) {
        toGeocode.push({ ...ent, reason: 'FALLBACK_CENTER' });
      }
    }
  }

  return toGeocode;
}

/**
 * Script principal
 */
async function main() {
  console.log('\n🌍 === GÉOCODAGE GLOBAL v2 - TOUTES LES VILLES DE TUNISIE ===\n');
  console.log('🎯 Chargement des zones géographiques...\n');

  const cityBounds = await loadCitiesBounds();
  console.log(`✅ ${Object.keys(cityBounds).length} villes chargées\n`);

  console.log('🔍 Identification des entreprises à géocoder...\n');

  const toGeocode = await getEntreprisesToGeocode(cityBounds);

  console.log(`📊 Entreprises à géocoder: ${toGeocode.length}\n`);

  if (toGeocode.length === 0) {
    console.log('✅ Toutes les entreprises ont déjà des coordonnées valides!\n');
    return;
  }

  // Répartition par raison
  const reasons = {};
  toGeocode.forEach(ent => {
    reasons[ent.reason] = (reasons[ent.reason] || 0) + 1;
  });

  console.log('📋 Répartition:');
  if (reasons.NO_GPS) console.log(`   • Sans GPS: ${reasons.NO_GPS}`);
  if (reasons.OUT_OF_BOUNDS) console.log(`   • Hors zone: ${reasons.OUT_OF_BOUNDS}`);
  if (reasons.FALLBACK_CENTER) console.log(`   • Fallback centre: ${reasons.FALLBACK_CENTER}`);
  console.log('');

  // Stats par ville
  const cityStats = {};

  let success = 0;
  let failed = 0;
  let fallback = 0;

  for (let i = 0; i < toGeocode.length; i++) {
    const ent = toGeocode[i];
    const progress = `[${i + 1}/${toGeocode.length}]`;
    const city = ent.ville || 'INCONNU';

    // Initialiser les stats de la ville
    if (!cityStats[city]) {
      cityStats[city] = { success: 0, failed: 0, fallback: 0, levels: { 1: 0, 2: 0, 3: 0 } };
    }

    // Affichage simplifié (tous les 10 entreprises)
    if (i % 10 === 0 || i === toGeocode.length - 1) {
      console.log(`${progress} 🔄 Traitement en cours... (${success} succès, ${fallback} fallback, ${failed} échecs)`);
    }

    try {
      // Géocodage avec cascade
      const coords = await geocodeWithFallback(ent, cityBounds);

      if (coords) {
        await updateCoordinates(ent.id, coords.latitude, coords.longitude);

        if (coords.isFallback) {
          cityStats[city].fallback++;
          fallback++;
        } else {
          cityStats[city].success++;
          cityStats[city].levels[coords.level]++;
          success++;
        }
      } else {
        cityStats[city].failed++;
        failed++;
      }

      // Respect du rate limit Nominatim (1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      cityStats[city].failed++;
      failed++;
    }
  }

  // Rapport final
  console.log('\n\n📊 === RAPPORT GLOBAL v2 ===\n');

  // Top 10 villes par volume
  const cityArray = Object.entries(cityStats).map(([ville, stats]) => ({
    ville,
    total: stats.success + stats.fallback + stats.failed,
    ...stats
  })).sort((a, b) => b.total - a.total);

  console.log('🏙️  TOP 10 VILLES PAR VOLUME:\n');

  for (let i = 0; i < Math.min(10, cityArray.length); i++) {
    const city = cityArray[i];
    console.log(`${i + 1}. ${city.ville} (${city.total} entreprises)`);
    console.log(`   ✅ Succès précis: ${city.success}`);
    if (city.levels[1]) console.log(`      • Niveau 1: ${city.levels[1]}`);
    if (city.levels[2]) console.log(`      • Niveau 2: ${city.levels[2]}`);
    console.log(`   🎯 Fallback: ${city.fallback}`);
    console.log(`   ❌ Échecs: ${city.failed}`);
    console.log('');
  }

  console.log('📈 RÉSUMÉ GLOBAL:\n');
  console.log(`   ✅ Géocodés avec précision: ${success}`);
  console.log(`   🎯 Fallback centre-ville: ${fallback}`);
  console.log(`   ❌ Échecs complets: ${failed}`);

  const totalProcessed = success + fallback + failed;
  const successRate = totalProcessed > 0 ? ((success / totalProcessed) * 100).toFixed(1) : 0;
  const usableRate = totalProcessed > 0 ? (((success + fallback) / totalProcessed) * 100).toFixed(1) : 0;

  console.log(`\n🎯 Taux de succès précis: ${successRate}%`);
  console.log(`🎯 Taux de couverture GPS (avec fallback): ${usableRate}%`);

  // Statistiques globales de la base
  console.log('\n\n📊 === STATISTIQUES GLOBALES BASE DE DONNÉES ===\n');

  const { data: globalStats, error: statsError } = await supabase
    .from('entreprise')
    .select('id, latitude, longitude, ville');

  if (!statsError && globalStats) {
    const total = globalStats.length;
    const withGPS = globalStats.filter(e => e.latitude && e.longitude).length;
    const globalCoverage = ((withGPS / total) * 100).toFixed(1);

    console.log(`📊 Total entreprises: ${total}`);
    console.log(`✅ Avec coordonnées GPS: ${withGPS}`);
    console.log(`🎯 Couverture GPS globale: ${globalCoverage}%`);
  }

  console.log('\n✅ Géocodage global terminé!\n');
}

main().catch(console.error);
