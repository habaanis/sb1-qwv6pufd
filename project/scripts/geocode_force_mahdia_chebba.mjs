#!/usr/bin/env node

/**
 * Script de géocodage FORCÉ pour Mahdia et Chebba
 * Remplace les coordonnées GPS existantes (Phase 1 fallback) par des coordonnées précises
 * basées sur les vraies adresses
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
 * Géocode une adresse via Nominatim (OpenStreetMap)
 */
async function geocodeAddress(adresse, ville, gouvernorat, nom) {
  const validAdresse = adresse && isValidAddress(adresse) ? adresse : null;
  const validGouvernorat = gouvernorat && isValidGouvernorat(gouvernorat) ? gouvernorat : null;

  const parts = [];

  if (validAdresse) {
    parts.push(validAdresse);
  }

  if (ville) {
    parts.push(ville);
  } else if (nom) {
    parts.push(nom);
  }

  if (validGouvernorat) {
    parts.push(validGouvernorat);
  }

  parts.push('Tunisia');

  const query = parts.join(', ');

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=tn`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DalilTounes/1.0 (contact@daliltounes.tn)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        display_name: data[0].display_name,
        importance: data[0].importance
      };
    }

    return null;
  } catch (error) {
    console.error(`   ⚠️  Erreur API: ${error.message}`);
    return null;
  }
}

/**
 * Met à jour les coordonnées d'une entreprise (FORCE)
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
 * Script principal
 */
async function main() {
  console.log('\n🎯 === GÉOCODAGE FORCÉ - MAHDIA & CHEBBA ===\n');
  console.log('📍 Mode: REMPLACEMENT des coordonnées GPS existantes');
  console.log('🎯 Cibles: Mahdia et Chebba\n');

  // Récupérer TOUTES les entreprises de Mahdia et Chebba (même avec GPS)
  const { data: entreprises, error } = await supabase
    .from('entreprise')
    .select('id, nom, adresse, ville, gouvernorat, latitude, longitude')
    .in('ville', ['Mahdia', 'Chebba'])
    .order('ville', { ascending: true });

  if (error) {
    console.error('❌ Erreur lecture:', error);
    process.exit(1);
  }

  if (!entreprises || entreprises.length === 0) {
    console.log('⚠️  Aucune entreprise trouvée à Mahdia/Chebba');
    return;
  }

  console.log(`📊 Total à traiter: ${entreprises.length} entreprises\n`);

  let success = 0;
  let failed = 0;
  let noData = 0;
  let invalidData = 0;

  const report = {
    mahdia: { success: 0, failed: 0, noData: 0, invalidData: 0 },
    chebba: { success: 0, failed: 0, noData: 0, invalidData: 0 }
  };

  for (let i = 0; i < entreprises.length; i++) {
    const ent = entreprises[i];
    const progress = `[${i + 1}/${entreprises.length}]`;
    const city = ent.ville.toLowerCase();

    console.log(`\n${progress} 🏢 ${ent.nom}`);
    console.log(`   📍 Ville: ${ent.ville}`);

    if (ent.latitude && ent.longitude) {
      console.log(`   🔄 GPS actuel: ${ent.latitude}, ${ent.longitude} (sera remplacé)`);
    }

    // Vérifier les données disponibles
    const validAdresse = ent.adresse && isValidAddress(ent.adresse);
    const validGouvernorat = ent.gouvernorat && isValidGouvernorat(ent.gouvernorat);

    if (ent.adresse && !validAdresse) {
      console.log(`   ⚠️  Adresse invalide ignorée: "${ent.adresse}"`);
      report[city].invalidData++;
      invalidData++;
      continue;
    }

    if (!validAdresse && !ent.ville && !validGouvernorat) {
      console.log('   ❌ Aucune donnée géolocalisable');
      report[city].noData++;
      noData++;
      continue;
    }

    console.log(`   🔍 Requête: ${[validAdresse, ent.ville, validGouvernorat, 'Tunisia'].filter(Boolean).join(', ')}`);

    try {
      // Géocodage
      const coords = await geocodeAddress(
        ent.adresse || '',
        ent.ville || '',
        ent.gouvernorat || '',
        ent.nom || ''
      );

      if (coords) {
        await updateCoordinates(ent.id, coords.latitude, coords.longitude);

        console.log(`   ✅ Nouveau GPS: ${coords.latitude}, ${coords.longitude}`);
        console.log(`   📌 ${coords.display_name}`);

        report[city].success++;
        success++;
      } else {
        console.log('   ❌ Géocodage échoué - aucun résultat');
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
  console.log('\n\n📊 === RAPPORT DE PRÉCISION ===\n');

  console.log('🏙️  MAHDIA:');
  console.log(`   ✅ Succès: ${report.mahdia.success}`);
  console.log(`   ❌ Échecs: ${report.mahdia.failed}`);
  console.log(`   ⚠️  Données invalides: ${report.mahdia.invalidData}`);
  console.log(`   📭 Sans données: ${report.mahdia.noData}`);

  console.log('\n🏖️  CHEBBA:');
  console.log(`   ✅ Succès: ${report.chebba.success}`);
  console.log(`   ❌ Échecs: ${report.chebba.failed}`);
  console.log(`   ⚠️  Données invalides: ${report.chebba.invalidData}`);
  console.log(`   📭 Sans données: ${report.chebba.noData}`);

  console.log('\n📈 TOTAL:');
  console.log(`   ✅ Géocodés avec succès: ${success}`);
  console.log(`   ❌ Échecs géocodage: ${failed}`);
  console.log(`   ⚠️  Données invalides ignorées: ${invalidData}`);
  console.log(`   📭 Sans données exploitables: ${noData}`);

  const totalProcessed = success + failed + invalidData + noData;
  const successRate = totalProcessed > 0 ? ((success / totalProcessed) * 100).toFixed(1) : 0;

  console.log(`\n🎯 Taux de réussite: ${successRate}%`);
  console.log('\n✅ Géocodage forcé terminé!\n');
}

main().catch(console.error);
