#!/usr/bin/env node

/**
 * Script de géocodage AMÉLIORÉ v2 pour Mahdia et Chebba
 * Corrections:
 * 1. Filtrage géographique strict
 * 2. Gestion des adresses descriptives tunisiennes
 * 3. Correction du bug d'affichage "true"
 * 4. Retry sur les échecs précédents
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

// Zones géographiques valides
const CITY_BOUNDS = {
  'mahdia': {
    lat_min: 35.48,
    lat_max: 35.55,
    lon_min: 11.02,
    lon_max: 11.12,
    center: { lat: 35.5036, lon: 11.0682 }
  },
  'chebba': {
    lat_min: 35.23,
    lat_max: 35.25,
    lon_min: 11.10,
    lon_max: 11.12,
    center: { lat: 35.2386, lon: 11.1132 }
  }
};

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
 * Ex: "En face du café Sidi Salem" -> ["café Sidi Salem"]
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
function isInCityBounds(latitude, longitude, ville) {
  const cityKey = ville.toLowerCase();
  const bounds = CITY_BOUNDS[cityKey];

  if (!bounds) {
    return true; // Pas de restriction si ville inconnue
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
async function geocodeAddress(adresse, ville, gouvernorat, nom) {
  const validAdresse = adresse && isValidAddress(adresse) ? adresse : null;
  const validGouvernorat = gouvernorat && isValidGouvernorat(gouvernorat) ? gouvernorat : null;

  // Parse les adresses descriptives
  let searchAddress = validAdresse;
  if (validAdresse) {
    const parsed = parseDescriptiveAddress(validAdresse);
    if (parsed.isDescriptive) {
      console.log(`   📍 Adresse descriptive détectée: "${parsed.landmark}"`);
      searchAddress = parsed.landmark;
    }
  }

  // Construction de la requête avec ville TOUJOURS présente
  const parts = [];

  if (searchAddress) {
    parts.push(searchAddress);
  }

  // TOUJOURS ajouter la ville pour éviter les ambiguïtés
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
      // Filtrage géographique strict : chercher le premier résultat dans la bonne zone
      for (const result of data) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        if (isInCityBounds(lat, lon, ville)) {
          return {
            latitude: lat,
            longitude: lon,
            display_name: result.display_name,
            importance: result.importance,
            filtered: false
          };
        }
      }

      // Aucun résultat dans la bonne zone géographique
      console.log(`   ⚠️  ${data.length} résultat(s) trouvé(s) mais hors zone ${ville}`);
      return null;
    }

    return null;
  } catch (error) {
    console.error(`   ⚠️  Erreur API: ${error.message}`);
    return null;
  }
}

/**
 * Tentative de géocodage en cascade (3 niveaux)
 */
async function geocodeWithFallback(entreprise) {
  const { id, nom, adresse, ville, gouvernorat } = entreprise;

  // Niveau 1: Adresse complète + ville + gouvernorat
  console.log(`   🔍 Niveau 1: Adresse complète`);
  let coords = await geocodeAddress(adresse || '', ville || '', gouvernorat || '', nom);

  if (coords) {
    return { ...coords, level: 1 };
  }

  // Niveau 2: Nom entreprise + ville
  if (nom && ville) {
    console.log(`   🔍 Niveau 2: Nom entreprise + ville`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    coords = await geocodeAddress(nom, ville, gouvernorat || '', '');

    if (coords) {
      return { ...coords, level: 2 };
    }
  }

  // Niveau 3: Fallback au centre-ville
  console.log(`   🔍 Niveau 3: Fallback centre-ville`);
  const cityKey = ville.toLowerCase();
  const bounds = CITY_BOUNDS[cityKey];

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
 * Identifie les entreprises à retraiter (échecs + mauvaises coords)
 */
async function getEntreprisesToRetry() {
  // Récupérer toutes les entreprises de Mahdia/Chebba
  const { data: all, error } = await supabase
    .from('entreprise')
    .select('id, nom, adresse, ville, gouvernorat, latitude, longitude')
    .in('ville', ['Mahdia', 'Chebba'])
    .order('ville', { ascending: true });

  if (error) {
    throw error;
  }

  const toRetry = [];

  for (const ent of all) {
    // Cas 1: Pas de GPS
    if (!ent.latitude || !ent.longitude) {
      toRetry.push({ ...ent, reason: 'NO_GPS' });
      continue;
    }

    // Cas 2: GPS mais hors zone (géocodé vers mauvaise ville)
    if (!isInCityBounds(ent.latitude, ent.longitude, ent.ville)) {
      toRetry.push({ ...ent, reason: 'OUT_OF_BOUNDS' });
      continue;
    }

    // Cas 3: GPS fallback Phase 1 (centre-ville générique)
    const cityKey = ent.ville.toLowerCase();
    const bounds = CITY_BOUNDS[cityKey];
    if (bounds) {
      const distFromCenter = Math.sqrt(
        Math.pow(ent.latitude - bounds.center.lat, 2) +
        Math.pow(ent.longitude - bounds.center.lon, 2)
      );

      // Si très proche du centre exact (< 0.0001 deg ~10m), probablement fallback
      if (distFromCenter < 0.0001 && ent.adresse && ent.adresse.length > 5) {
        toRetry.push({ ...ent, reason: 'FALLBACK_CENTER' });
      }
    }
  }

  return toRetry;
}

/**
 * Script principal
 */
async function main() {
  console.log('\n🎯 === GÉOCODAGE AMÉLIORÉ v2 - MAHDIA & CHEBBA ===\n');
  console.log('✨ Nouvelles fonctionnalités:');
  console.log('   1. Filtrage géographique strict');
  console.log('   2. Gestion adresses descriptives');
  console.log('   3. Affichage requêtes corrigé');
  console.log('   4. Géocodage en cascade (3 niveaux)\n');

  console.log('🔍 Identification des entreprises à retraiter...\n');

  const toRetry = await getEntreprisesToRetry();

  console.log(`📊 Entreprises à retraiter: ${toRetry.length}\n`);

  if (toRetry.length === 0) {
    console.log('✅ Toutes les entreprises ont déjà des coordonnées valides!\n');
    return;
  }

  // Afficher la répartition par raison
  const reasons = {};
  toRetry.forEach(ent => {
    reasons[ent.reason] = (reasons[ent.reason] || 0) + 1;
  });

  console.log('📋 Répartition:');
  if (reasons.NO_GPS) console.log(`   • Sans GPS: ${reasons.NO_GPS}`);
  if (reasons.OUT_OF_BOUNDS) console.log(`   • Hors zone: ${reasons.OUT_OF_BOUNDS}`);
  if (reasons.FALLBACK_CENTER) console.log(`   • Fallback centre: ${reasons.FALLBACK_CENTER}`);
  console.log('');

  let success = 0;
  let failed = 0;
  let fallback = 0;

  const report = {
    mahdia: { success: 0, failed: 0, fallback: 0, levels: { 1: 0, 2: 0, 3: 0 } },
    chebba: { success: 0, failed: 0, fallback: 0, levels: { 1: 0, 2: 0, 3: 0 } }
  };

  for (let i = 0; i < toRetry.length; i++) {
    const ent = toRetry[i];
    const progress = `[${i + 1}/${toRetry.length}]`;
    const city = ent.ville.toLowerCase();

    console.log(`\n${progress} 🏢 ${ent.nom}`);
    console.log(`   📍 Ville: ${ent.ville}`);
    console.log(`   📝 Raison: ${ent.reason}`);

    if (ent.latitude && ent.longitude) {
      console.log(`   🔄 GPS actuel: ${ent.latitude}, ${ent.longitude}`);
    }

    // Afficher les vraies données (correction bug "true")
    const adresseDisplay = ent.adresse || '(aucune)';
    const gouvernoratDisplay = ent.gouvernorat || '(aucun)';
    console.log(`   📋 Adresse: "${adresseDisplay}"`);
    console.log(`   🏛️  Gouvernorat: "${gouvernoratDisplay}"`);

    try {
      // Géocodage avec cascade
      const coords = await geocodeWithFallback(ent);

      if (coords) {
        await updateCoordinates(ent.id, coords.latitude, coords.longitude);

        if (coords.isFallback) {
          console.log(`   🎯 Fallback: ${coords.latitude}, ${coords.longitude}`);
          console.log(`   📌 ${coords.display_name}`);
          report[city].fallback++;
          fallback++;
        } else {
          console.log(`   ✅ Niveau ${coords.level}: ${coords.latitude}, ${coords.longitude}`);
          console.log(`   📌 ${coords.display_name}`);
          report[city].success++;
          report[city].levels[coords.level]++;
          success++;
        }
      } else {
        console.log('   ❌ Géocodage échoué - aucun résultat valide');
        report[city].failed++;
        failed++;
      }

      // Respect du rate limit Nominatim (1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      report[city].failed++;
      failed++;
    }
  }

  // Rapport final
  console.log('\n\n📊 === RAPPORT AMÉLIORÉ v2 ===\n');

  console.log('🏙️  MAHDIA:');
  console.log(`   ✅ Succès: ${report.mahdia.success}`);
  console.log(`      • Niveau 1 (adresse précise): ${report.mahdia.levels[1]}`);
  console.log(`      • Niveau 2 (nom + ville): ${report.mahdia.levels[2]}`);
  console.log(`   🎯 Fallback centre-ville: ${report.mahdia.fallback}`);
  console.log(`   ❌ Échecs: ${report.mahdia.failed}`);

  console.log('\n🏖️  CHEBBA:');
  console.log(`   ✅ Succès: ${report.chebba.success}`);
  console.log(`      • Niveau 1 (adresse précise): ${report.chebba.levels[1]}`);
  console.log(`      • Niveau 2 (nom + ville): ${report.chebba.levels[2]}`);
  console.log(`   🎯 Fallback centre-ville: ${report.chebba.fallback}`);
  console.log(`   ❌ Échecs: ${report.chebba.failed}`);

  console.log('\n📈 TOTAL:');
  console.log(`   ✅ Géocodés avec précision: ${success}`);
  console.log(`   🎯 Fallback centre-ville: ${fallback}`);
  console.log(`   ❌ Échecs complets: ${failed}`);

  const totalProcessed = success + fallback + failed;
  const successRate = totalProcessed > 0 ? ((success / totalProcessed) * 100).toFixed(1) : 0;
  const usableRate = totalProcessed > 0 ? (((success + fallback) / totalProcessed) * 100).toFixed(1) : 0;

  console.log(`\n🎯 Taux de succès précis: ${successRate}%`);
  console.log(`🎯 Taux de couverture GPS (avec fallback): ${usableRate}%`);
  console.log('\n✅ Géocodage amélioré terminé!\n');
}

main().catch(console.error);
