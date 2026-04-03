import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
const envPath = join(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanFacebookEvents() {
  console.log('🔍 Recherche d\'événements avec URLs Facebook...\n');

  // Lister d'abord les événements avec URLs Facebook
  const { data: fbEvents, error: fetchError } = await supabase
    .from('featured_events')
    .select('id, event_name, image_url')
    .or('image_url.like.%fbcdn.net%,image_url.like.%facebook.com%');

  if (fetchError) {
    console.error('❌ Erreur lecture:', fetchError.message);
    return;
  }

  if (!fbEvents || fbEvents.length === 0) {
    console.log('✅ Aucun événement avec URL Facebook trouvé');
    return;
  }

  console.log(`⚠️  Trouvé ${fbEvents.length} événement(s) avec URLs Facebook:\n`);
  fbEvents.forEach(event => {
    console.log(`  - [${event.id}] ${event.event_name}`);
    console.log(`    URL: ${event.image_url}\n`);
  });

  // Supprimer les événements
  const { error: deleteError } = await supabase
    .from('featured_events')
    .delete()
    .or('image_url.like.%fbcdn.net%,image_url.like.%facebook.com%');

  if (deleteError) {
    console.error('❌ Erreur suppression:', deleteError.message);
    return;
  }

  console.log(`✅ ${fbEvents.length} événement(s) supprimé(s) avec succès`);
}

cleanFacebookEvents().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
