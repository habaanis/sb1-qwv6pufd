/**
 * Script de géocodage automatique avec Nominatim (OpenStreetMap)
 *
 * Ce script récupère toutes les entreprises sans coordonnées GPS
 * et les géocode automatiquement en utilisant leur adresse.
 *
 * Limite : 1 requête par seconde (politique Nominatim)
 * Durée estimée : ~4.5 minutes pour 246 entreprises
 *
 * Usage :
 *   node scripts/geocode_nominatim.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  console.error('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définis dans .env');
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

  // Liste de patterns suspects (horaires, numéros de téléphone seuls, etc.)
  const suspiciousPatterns = [
    /\d{1,2}h\d{0,2}/i,  // Horaires: 8h30, 9h, etc.
    /\d{1,2}:\d{2}/,  // Heures: 08:00
    /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i,  // Jours
    /ouvert|fermé|fermeture/i,  // Mots liés aux horaires
    /^\d{8}$/,  // Juste un numéro de téléphone
    /^\+216/,  // Téléphone international
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

  // Patterns suspects dans gouvernorat
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
  // Validation et nettoyage des champs
  const validAdresse = adresse && isValidAddress(adresse) ? adresse : null;
  const validGouvernorat = gouvernorat && isValidGouvernorat(gouvernorat) ? gouvernorat : null;

  // Construction intelligente de la requête
  const parts = [];

  if (validAdresse) {
    parts.push(validAdresse);
  }

  if (ville) {
    parts.push(ville);
  } else if (nom) {
    // Si pas de ville, utiliser le nom de l'entreprise
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
        display_name: data[0].display_name
      };
    }

    return null;
  } catch (error) {
    console.error(`   ⚠️  Erreur API: ${error.message}`);
    return null;
  }
}

/**
 * Met à jour les coordonnées d'une entreprise
 */
async function updateCoordinates(id, latitude, longitude) {
  const { error } = await supabase
    .from('entreprise')
    .update({
      latitude: latitude,
      longitude: longitude
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Fonction principale
 */
async function geocodeAllEntreprises() {
  console.log('🗺️  Démarrage du géocodage des entreprises\n');

  // Récupération des entreprises sans GPS
  const { data: entreprises, error } = await supabase
    .from('entreprise')
    .select('id, nom, adresse, ville, gouvernorat')
    .or('latitude.is.null,longitude.is.null');

  if (error) {
    console.error('❌ Erreur Supabase:', error.message);
    process.exit(1);
  }

  if (!entreprises || entreprises.length === 0) {
    console.log('✅ Toutes les entreprises ont déjà des coordonnées GPS !');
    return;
  }

  // PRIORISATION : Mahdia et Chebba en premier
  const prioritaires = entreprises.filter(e =>
    e.gouvernorat === 'Mahdia' ||
    e.ville?.toLowerCase().includes('chebba') ||
    e.ville?.toLowerCase().includes('mahdia')
  );
  const autres = entreprises.filter(e => !prioritaires.includes(e));
  const sorted = [...prioritaires, ...autres];

  console.log(`📍 ${entreprises.length} entreprises à géocoder`);
  console.log(`   🎯 ${prioritaires.length} prioritaires (Mahdia/Chebba)`);
  console.log(`   📦 ${autres.length} autres\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < sorted.length; i++) {
    const ent = sorted[i];
    const progress = `[${i + 1}/${sorted.length}]`;
    const isPriority = prioritaires.includes(ent) ? '🎯' : '  ';

    console.log(`${progress} ${isPriority} ${ent.nom}`);

    // Vérifier si l'entreprise a des données exploitables
    const hasValidData =
      (ent.adresse && isValidAddress(ent.adresse)) ||
      ent.ville ||
      (ent.gouvernorat && isValidGouvernorat(ent.gouvernorat));

    if (!hasValidData) {
      console.log('   ⏭️  Aucune donnée géolocalisable - ignoré');
      skipped++;
      continue;
    }

    try {
      // Géocodage avec validation intelligente
      const coords = await geocodeAddress(
        ent.adresse || '',
        ent.ville || '',
        ent.gouvernorat || '',
        ent.nom || ''
      );

      if (coords) {
        // Mise à jour en base
        await updateCoordinates(ent.id, coords.latitude, coords.longitude);
        console.log(`   ✅ ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        success++;
      } else {
        console.log('   ❌ Adresse non trouvée');
        failed++;
      }

    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      failed++;
    }

    // Respect de la limite 1 req/sec de Nominatim
    if (i < sorted.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DU GÉOCODAGE');
  console.log('='.repeat(50));
  console.log(`✅ Succès       : ${success}`);
  console.log(`❌ Échecs       : ${failed}`);
  console.log(`⏭️  Ignorés      : ${skipped}`);
  console.log(`📍 Total traités : ${success + failed + skipped}`);
  console.log('='.repeat(50));

  // Vérification finale
  const { data: stats } = await supabase
    .from('entreprise')
    .select('id, latitude, longitude');

  if (stats) {
    const withGPS = stats.filter(e => e.latitude && e.longitude).length;
    const total = stats.length;
    const percentage = ((withGPS / total) * 100).toFixed(1);

    console.log(`\n🎯 Couverture GPS : ${withGPS}/${total} (${percentage}%)`);
  }
}

// Lancement du script
geocodeAllEntreprises()
  .then(() => {
    console.log('\n✨ Géocodage terminé !');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
