# Guide Géocodage et Coordonnées GPS

## État Actuel du Système

### ✅ Ce qui existe déjà

1. **Colonnes GPS dans Supabase**
   - `latitude` (numeric) - Précision 10,7
   - `longitude` (numeric) - Précision 10,7
   - Index optimisé : `idx_entreprise_gps`

2. **Affichage des cartes**
   - Utilise **React Leaflet** (OpenStreetMap)
   - **PAS de Mapbox** (pas de coût externe)
   - Cartes gratuites via OpenStreetMap

3. **Statistiques actuelles**
   - Total entreprises : **362**
   - Avec coordonnées GPS : **116** (32%)
   - Sans coordonnées GPS : **246** (68%)

### ❌ Ce qui manque

**Aucun service de géocodage automatique n'est configuré**
- Pas d'appel à Nominatim, Mapbox ou Google Maps API
- Les coordonnées doivent être ajoutées manuellement
- La carte n'apparaît que si latitude/longitude existent

---

## Solution : Import CSV des Coordonnées GPS

### Option 1 : Import Manuel via Script

Créez un fichier `import_gps.csv` avec ce format :

```csv
id,latitude,longitude
uuid-entreprise-1,36.806389,10.181667
uuid-entreprise-2,35.825278,10.634722
```

Puis exécutez ce script SQL dans Supabase :

```sql
-- Exemple d'update d'une entreprise
UPDATE entreprise
SET
  latitude = 36.806389,
  longitude = 10.181667
WHERE id = 'uuid-entreprise';

-- Ou en masse avec COPY (depuis l'interface Supabase)
-- 1. Allez dans SQL Editor
-- 2. Créez une table temporaire
CREATE TEMP TABLE gps_import (
  id uuid,
  latitude numeric(10,7),
  longitude numeric(10,7)
);

-- 3. Importez votre CSV via l'interface
-- 4. Puis mettez à jour :
UPDATE entreprise e
SET
  latitude = g.latitude,
  longitude = g.longitude
FROM gps_import g
WHERE e.id = g.id;
```

---

### Option 2 : Service de Géocodage Gratuit (Nominatim)

**Nominatim** est le service gratuit d'OpenStreetMap pour le géocodage.

#### Limites
- Maximum 1 requête par seconde
- Nécessite un User-Agent
- Gratuit mais limité

#### Script Node.js pour géocoder vos adresses

```javascript
// geocode_entreprises.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'VOTRE_SUPABASE_URL',
  'VOTRE_SUPABASE_SERVICE_KEY'
);

async function geocodeAddress(adresse, ville, gouvernorat) {
  const query = `${adresse}, ${ville}, ${gouvernorat}, Tunisia`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'DalilTounes/1.0'
    }
  });

  const data = await response.json();

  if (data && data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    };
  }

  return null;
}

async function geocodeAllEntreprises() {
  // Récupérer les entreprises sans GPS
  const { data: entreprises } = await supabase
    .from('entreprise')
    .select('id, nom, adresse, ville, gouvernorat')
    .is('latitude', null);

  console.log(`${entreprises.length} entreprises à géocoder`);

  for (const ent of entreprises) {
    try {
      console.log(`Géocodage: ${ent.nom}...`);

      const coords = await geocodeAddress(
        ent.adresse || '',
        ent.ville || '',
        ent.gouvernorat || ''
      );

      if (coords) {
        await supabase
          .from('entreprise')
          .update({
            latitude: coords.latitude,
            longitude: coords.longitude
          })
          .eq('id', ent.id);

        console.log(`✓ ${ent.nom} : ${coords.latitude}, ${coords.longitude}`);
      } else {
        console.log(`✗ ${ent.nom} : Adresse non trouvée`);
      }

      // Respect de la limite 1 req/sec
      await new Promise(resolve => setTimeout(resolve, 1100));

    } catch (error) {
      console.error(`Erreur pour ${ent.nom}:`, error.message);
    }
  }

  console.log('Géocodage terminé !');
}

geocodeAllEntreprises();
```

**Durée estimée** : 246 entreprises × 1.1 sec = ~4.5 minutes

---

### Option 3 : Coordonnées par Gouvernorat (Fallback)

Si l'adresse précise n'existe pas, vous pouvez utiliser le centre du gouvernorat :

```sql
-- Coordonnées des gouvernorats tunisiens
UPDATE entreprise
SET
  latitude = CASE gouvernorat
    WHEN 'Tunis' THEN 36.806389
    WHEN 'Ariana' THEN 36.860000
    WHEN 'Ben Arous' THEN 36.747222
    WHEN 'Manouba' THEN 36.810000
    WHEN 'Nabeul' THEN 36.456111
    WHEN 'Zaghouan' THEN 36.402778
    WHEN 'Bizerte' THEN 37.274444
    WHEN 'Béja' THEN 36.725556
    WHEN 'Jendouba' THEN 36.501389
    WHEN 'Kef' THEN 36.174167
    WHEN 'Siliana' THEN 36.084722
    WHEN 'Sousse' THEN 35.825278
    WHEN 'Monastir' THEN 35.777500
    WHEN 'Mahdia' THEN 35.504722
    WHEN 'Sfax' THEN 34.740833
    WHEN 'Kairouan' THEN 35.678889
    WHEN 'Kasserine' THEN 35.167222
    WHEN 'Sidi Bouzid' THEN 35.038056
    WHEN 'Gabès' THEN 33.881389
    WHEN 'Medenine' THEN 33.354167
    WHEN 'Tataouine' THEN 32.929722
    WHEN 'Gafsa' THEN 34.425000
    WHEN 'Tozeur' THEN 33.919722
    WHEN 'Kébili' THEN 33.705556
  END,
  longitude = CASE gouvernorat
    WHEN 'Tunis' THEN 10.181667
    WHEN 'Ariana' THEN 10.195556
    WHEN 'Ben Arous' THEN 10.219167
    WHEN 'Manouba' THEN 10.096667
    WHEN 'Nabeul' THEN 10.735278
    WHEN 'Zaghouan' THEN 10.143056
    WHEN 'Bizerte' THEN 9.873889
    WHEN 'Béja' THEN 9.181667
    WHEN 'Jendouba' THEN 8.780556
    WHEN 'Kef' THEN 8.704722
    WHEN 'Siliana' THEN 9.370278
    WHEN 'Sousse' THEN 10.634722
    WHEN 'Monastir' THEN 10.826389
    WHEN 'Mahdia' THEN 11.062222
    WHEN 'Sfax' THEN 10.760833
    WHEN 'Kairouan' THEN 10.096944
    WHEN 'Kasserine' THEN 8.830556
    WHEN 'Sidi Bouzid' THEN 9.484722
    WHEN 'Gabès' THEN 10.098333
    WHEN 'Medenine' THEN 10.505556
    WHEN 'Tataouine' THEN 10.451944
    WHEN 'Gafsa' THEN 8.784167
    WHEN 'Tozeur' THEN 8.133333
    WHEN 'Kébili' THEN 8.969167
  END
WHERE latitude IS NULL
  AND gouvernorat IS NOT NULL;
```

---

## Vérification Post-Import

Vérifiez le nombre d'entreprises géocodées :

```sql
SELECT
  COUNT(*) as total,
  COUNT(latitude) FILTER (WHERE latitude IS NOT NULL) as avec_gps,
  ROUND(COUNT(latitude) FILTER (WHERE latitude IS NOT NULL) * 100.0 / COUNT(*), 2) as pourcentage
FROM entreprise;
```

---

## Affichage Conditionnel de la Carte

Le code actuel affiche la carte uniquement si les coordonnées existent :

```typescript
{business.latitude && business.longitude && (
  <div className="mt-6">
    <MapContainer
      center={[business.latitude, business.longitude]}
      zoom={14}
      style={{ height: '320px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      <Marker position={[business.latitude, business.longitude]}>
        <Popup>{business.nom}</Popup>
      </Marker>
    </MapContainer>
  </div>
)}
```

---

## Recommandations

### Court terme (Immédiat)
✅ **Option 3** : Utilisez les coordonnées par gouvernorat pour avoir une carte instantanée pour toutes les entreprises

### Moyen terme (1-2 semaines)
✅ **Option 2** : Géocodez toutes les adresses avec Nominatim pour une précision maximale

### Long terme (Amélioration continue)
- Ajoutez un champ de géocodage dans le formulaire d'inscription
- Permettez aux entreprises de corriger leur position manuellement
- Créez un système de cache pour éviter de re-géocoder

---

## Support

**Services de géocodage gratuits :**
- [Nominatim OpenStreetMap](https://nominatim.openstreetmap.org/) - Gratuit, 1 req/sec
- [Geocode.xyz](https://geocode.xyz/) - 1 000 req/jour gratuit

**Services premium (si besoin de volumes élevés) :**
- Mapbox - 100 000 req/mois gratuit
- Google Maps Geocoding API - 200$/mois pour 40 000 req

---

## Résumé

| Aspect | État Actuel |
|--------|------------|
| **Colonnes GPS** | ✅ Créées (latitude, longitude) |
| **Service externe** | ❌ Aucun (OpenStreetMap gratuit pour cartes) |
| **Données existantes** | ⚠️ 32% seulement (116/362) |
| **Géocodage auto** | ❌ Non implémenté |
| **Import manuel** | ✅ Possible via SQL |
| **Carte instantanée** | ✅ Possible avec fallback gouvernorat |

**Prochaine étape recommandée :** Exécuter le script SQL de l'Option 3 pour avoir une carte immédiate pour toutes les entreprises.
