/**
 * Tests unitaires pour le système de slugs SEO
 *
 * Pour exécuter ces tests dans la console du navigateur :
 * 1. Importer les fonctions depuis slugify.ts
 * 2. Copier/coller ce fichier dans la console
 * 3. Les tests s'exécutent automatiquement
 */

import {
  generateSlug,
  generateBusinessUrl,
  extractIdFromSlugUrl,
  generateShareUrl,
  isValidSlug,
  cleanSlug,
  SLUG_EXAMPLES
} from './slugify';

// Fonction de test simple
function test(description: string, fn: () => boolean) {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ PASS: ${description}`);
    } else {
      console.error(`❌ FAIL: ${description}`);
    }
  } catch (error) {
    console.error(`❌ ERROR: ${description}`, error);
  }
}

// Tests de generateSlug
console.group('Tests generateSlug()');

test('Supprime les accents français', () => {
  return generateSlug('Café Élégant') === 'cafe-elegant';
});

test('Gère les caractères spéciaux', () => {
  return generateSlug('Garage & Auto') === 'garage-auto';
});

test('Gère les apostrophes', () => {
  return generateSlug("Cabinet d'Avocat") === 'cabinet-davocat';
});

test('Supprime les étoiles', () => {
  return generateSlug('Hôtel 5★ Luxe') === 'hotel-5-luxe';
});

test('Gère les slashs', () => {
  return generateSlug('Garage 24/7') === 'garage-24-7';
});

test('Nettoie les tirets multiples', () => {
  return generateSlug('Garage --- Auto') === 'garage-auto';
});

test('Supprime tirets début/fin', () => {
  return generateSlug('---Garage---') === 'garage';
});

test('Gère les espaces multiples', () => {
  return generateSlug('Garage    Auto') === 'garage-auto';
});

test('Tout en minuscules', () => {
  return generateSlug('GARAGE AUTO') === 'garage-auto';
});

test('Gère les chiffres', () => {
  return generateSlug('Auto 2024') === 'auto-2024';
});

test('Gère les accents arabes normalisés', () => {
  const result = generateSlug('École المدرسة');
  return result.includes('ecole');
});

test('Vérifie les exemples prédéfinis', () => {
  return Object.entries(SLUG_EXAMPLES).every(([original, expected]) => {
    const result = generateSlug(original);
    const pass = result === expected;
    if (!pass) {
      console.log(`  ${original} → ${result} (attendu: ${expected})`);
    }
    return pass;
  });
});

console.groupEnd();

// Tests de generateBusinessUrl
console.group('Tests generateBusinessUrl()');

test('Format correct avec nom court', () => {
  const url = generateBusinessUrl('Garage Auto', 'abc12345-def6-7890-ghij-klmnopqrstuv');
  return url === '/p/garage-auto-abc12345';
});

test('Format correct avec nom long', () => {
  const url = generateBusinessUrl('Cabinet d\'Avocat Spécialisé en Droit Commercial', 'xyz98765-abcd-efgh-ijkl-mnopqrstuvwx');
  return url.startsWith('/p/cabinet-davocat-specialise-en-droit-commercial-xyz98765');
});

test('Gère les caractères spéciaux', () => {
  const url = generateBusinessUrl('Café & Restaurant ★★★', 'test1234-5678-90ab-cdef-ghijklmnopqr');
  return url === '/p/cafe-restaurant-test1234';
});

console.groupEnd();

// Tests de extractIdFromSlugUrl
console.group('Tests extractIdFromSlugUrl()');

test('Extrait ID depuis slug simple', () => {
  const id = extractIdFromSlugUrl('/p/garage-auto-abc12345');
  return id === 'abc12345';
});

test('Extrait ID depuis slug long', () => {
  const id = extractIdFromSlugUrl('/p/cabinet-davocat-specialise-en-droit-xyz98765');
  return id === 'xyz98765';
});

test('Gère les IDs complets (UUID)', () => {
  const id = extractIdFromSlugUrl('/p/garage-test-abc12345def67890');
  return id === 'abc12345def67890';
});

test('Retourne null si format invalide', () => {
  const id = extractIdFromSlugUrl('/p/garage-auto');
  return id === null;
});

test('Retourne null si pas de tiret final', () => {
  const id = extractIdFromSlugUrl('/p/garageauto123');
  return id === null;
});

console.groupEnd();

// Tests de generateShareUrl
console.group('Tests generateShareUrl()');

test('Génère URL complète avec domaine', () => {
  const url = generateShareUrl('Garage Auto', 'abc12345-def6-7890-ghij-klmnopqrstuv');
  return url.includes('://') && url.includes('/p/garage-auto-abc12345');
});

test('Utilise window.location.origin', () => {
  const url = generateShareUrl('Test', 'xyz12345-abcd-efgh-ijkl-mnopqrstuvwx');
  return url.startsWith(window.location.origin);
});

console.groupEnd();

// Tests de isValidSlug
console.group('Tests isValidSlug()');

test('Slug valide simple', () => {
  return isValidSlug('garage-auto') === true;
});

test('Slug valide avec chiffres', () => {
  return isValidSlug('garage-24-7') === true;
});

test('Rejette espaces', () => {
  return isValidSlug('garage auto') === false;
});

test('Rejette double tiret', () => {
  return isValidSlug('garage--auto') === false;
});

test('Rejette majuscules', () => {
  return isValidSlug('Garage-Auto') === false;
});

test('Rejette underscore', () => {
  return isValidSlug('garage_auto') === false;
});

test('Rejette tiret début', () => {
  return isValidSlug('-garage') === false;
});

test('Rejette tiret fin', () => {
  return isValidSlug('garage-') === false;
});

test('Accepte slug long', () => {
  return isValidSlug('cabinet-davocat-specialise-en-droit-commercial-international') === true;
});

console.groupEnd();

// Tests de cleanSlug
console.group('Tests cleanSlug()');

test('Nettoie slug invalide', () => {
  return cleanSlug('Garage Auto') === 'garage-auto';
});

test('Nettoie tirets multiples', () => {
  return cleanSlug('garage--auto') === 'garage-auto';
});

test('Garde slug valide intact', () => {
  return cleanSlug('garage-auto') === 'garage-auto';
});

console.groupEnd();

// Test de performance
console.group('Tests de Performance');

test('Génère 1000 slugs en moins de 100ms', () => {
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    generateSlug(`Test Business ${i} with Special Chars éàç`);
  }
  const duration = performance.now() - start;
  console.log(`  Durée : ${duration.toFixed(2)}ms pour 1000 slugs`);
  return duration < 100;
});

test('Extrait 1000 IDs en moins de 50ms', () => {
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    extractIdFromSlugUrl(`/p/test-business-${i}-abc12345`);
  }
  const duration = performance.now() - start;
  console.log(`  Durée : ${duration.toFixed(2)}ms pour 1000 extractions`);
  return duration < 50;
});

console.groupEnd();

// Résumé final
console.log('\n📊 Tests terminés !');
console.log('Vérifiez qu\'il n\'y a aucun ❌ ci-dessus.');
console.log('Tous les tests doivent afficher ✅ PASS');

export { test };
