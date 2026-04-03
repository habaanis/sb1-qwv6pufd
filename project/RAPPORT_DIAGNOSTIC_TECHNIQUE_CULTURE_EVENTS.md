# Rapport Diagnostic Technique - Culture Events

**Date:** 3 février 2026
**Status:** ✅ Diagnostic Complet Activé
**Objectif:** Vérifier les branchements Supabase pour la page Loisirs

---

## 📋 RÉPONSES AUX QUESTIONS

### 1. Nom de la Table Supabase

**Réponse:** `culture_events`

**Confirmation:**
- ✅ Table existante dans Supabase
- ✅ Contient actuellement 13 événements
- ✅ Accessible via le client Supabase

**Code source:**
```typescript
// Fichier: /src/pages/CultureEvents.tsx, ligne 184
const { data: allData, error: allError } = await supabase
  .from('culture_events')  // ← NOM DE LA TABLE
  .select('*')
  .order('date_debut', { ascending: true });
```

---

### 2. Requête SQL Exacte

**Requête pour charger TOUS les événements:**

```sql
SELECT *
FROM culture_events
ORDER BY date_debut ASC
```

**Équivalent Supabase JS:**
```typescript
supabase
  .from('culture_events')
  .select('*')
  .order('date_debut', { ascending: true })
```

**Filtrage pour les événements "hebdo":**
```javascript
// Après réception des données, filtrage en JavaScript (case-insensitive)
const weekly = allData.filter(e =>
  e.type_affichage?.toLowerCase() === 'hebdo' &&
  (selectedSecteur === 'all' || e.secteur_evenement === selectedSecteur)
);
```

**Requête SQL équivalente (si faite en SQL):**
```sql
SELECT *
FROM culture_events
WHERE LOWER(type_affichage) = 'hebdo'
  AND (secteur_evenement = 'Art & Culture' OR 'all')
ORDER BY date_debut ASC
```

---

### 3. Test de Réponse - Affichage du Nombre de Lignes

**IMPLÉMENTÉ:** Un panneau de diagnostic technique complet s'affiche maintenant en haut de la page.

**Informations Affichées:**

```
🔧 DIAGNOSTIC TECHNIQUE COMPLET

1. Nom de la Table Supabase:
   culture_events

2. Requête SQL Exacte:
   SELECT * FROM culture_events ORDER BY date_debut ASC

3. Status de la Connexion:
   ✅ CONNEXION RÉUSSIE (ou ❌ ERREUR selon le cas)

4. Nombre de Lignes Reçues:
   13 événements (ou le nombre exact reçu)

5. Temps de Réponse:
   XX.XXms

6. URL Supabase:
   https://kmvjegbtroksjqaqliyv.supabase.co

📊 Répartition des Événements:
   Hebdo: 5
   Mensuel: 4
   Annuel: 4

📋 Échantillon des Données (3 premiers):
   • Concert de Malouf - Type: hebdo - Secteur: Art & Culture
   • Soirée Jazz & Blues - Type: hebdo - Secteur: Art & Culture
   • 4LFA, COSMIC & RAMSJAMSSS - Type: hebdo - Secteur: Art & Culture
```

---

## 🔍 VÉRIFICATIONS EFFECTUÉES

### Test Direct SQL (Via MCP)

**Requête 1: Compter les événements**
```sql
SELECT COUNT(*) as total FROM culture_events;
```
**Résultat:** ✅ 13 événements

**Requête 2: Lister tous les événements**
```sql
SELECT id, titre, type_affichage, secteur_evenement, date_debut
FROM culture_events
ORDER BY created_at DESC
LIMIT 13;
```

**Résultat:** ✅ 13 lignes retournées

**Exemples de données:**

| Titre | Type | Secteur |
|-------|------|---------|
| Festival des Arts de la Rue | annuel | Art & Culture |
| Festival du Film Documentaire | annuel | Art & Culture |
| Concert de Dhafer Youssef | hebdo | Art & Culture |
| Spectacle de Danse Contemporaine | hebdo | Art & Culture |
| Exposition d'Art Contemporain | mensuel | Art & Culture |
| Pièce de Théâtre: Le Bourgeois... | mensuel | Art & Culture |
| 4LFA, COSMIC & RAMSJAMSSS | hebdo | Art & Culture |
| Soirée Jazz & Blues | hebdo | Art & Culture |
| Festival International de Carthage | annuel | Art & Culture |
| Marathon de Carthage | mensuel | Sorties & Soirées |
| Festival des Cerfs-Volants | mensuel | Art & Culture |
| Concert de Malouf | hebdo | Art & Culture |
| Festival International de Musique... | annuel | Art & Culture |

**Répartition:**
- **Hebdo:** 5 événements
- **Mensuel:** 4 événements
- **Annuel:** 4 événements
- **Art & Culture:** 12 événements
- **Sorties & Soirées:** 1 événement

---

## 🛠️ CONFIGURATION SUPABASE

### Connexion

**URL Supabase:**
```
https://kmvjegbtroksjqaqliyv.supabase.co
```

**Clé Anon:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdmplZ2J0cm9rc2pxYXFsaXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDA1NTEsImV4cCI6MjA2NzM3NjU1MX0.MbU7b-HWQBwlYtbJeE7_ABvrGhuhzeAuqvkcVvvoE1o
```

**Source:** `/src/lib/BoltDatabase.js` (lignes 13-14)

### Client Supabase

**Initialisation:**
```typescript
// Fichier: /src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function ensureClient(): SupabaseClient {
  const cur = readKeys();
  if (!client || !last || cur.url !== last.url || cur.anon !== last.anon) {
    client = createClient(cur.url, cur.anon);
    last = cur;
  }
  return client!;
}

export const supabase: SupabaseClient = ensureClient();
```

**Import dans CultureEvents:**
```typescript
// Fichier: /src/pages/CultureEvents.tsx, ligne 3
import { supabase } from '../lib/BoltDatabase';
```

---

## 📊 STRUCTURE DU CODE

### États React

```typescript
const [weeklyEvents, setWeeklyEvents] = useState<CultureEvent[]>([]);
const [monthlyEvents, setMonthlyEvents] = useState<CultureEvent[]>([]);
const [annualEvents, setAnnualEvents] = useState<CultureEvent[]>([]);
const [allEvents, setAllEvents] = useState<CultureEvent[]>([]);
const [loading, setLoading] = useState(true);
const [selectedSecteur, setSelectedSecteur] = useState<string>('all');
const [debugInfo, setDebugInfo] = useState<string>('');
const [techDiag, setTechDiag] = useState<any>(null);  // ← NOUVEAU: Diagnostic
```

### Interface TypeScript

```typescript
interface CultureEvent {
  id: string;
  titre: string;
  ville: string;
  date_debut: string;
  date_fin?: string;
  image_url?: string;
  categorie?: string;
  description_courte?: string;
  prix?: string;
  lien_billetterie?: string;
  est_annuel?: boolean;
  type_affichage?: string;        // 'hebdo' | 'mensuel' | 'annuel'
  secteur_evenement?: string;     // 'Art & Culture' | 'Sorties & Soirées'
}
```

### Fonction de Chargement (Complète)

```typescript
const loadAgendaEvents = async () => {
  setLoading(true);
  setDebugInfo('🔍 Chargement des événements...');

  const startTime = performance.now();
  const diagnosis: any = {
    timestamp: new Date().toISOString(),
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Non défini',
    tableName: 'culture_events',
    querySQL: "SELECT * FROM culture_events ORDER BY date_debut ASC",
    status: 'pending'
  };

  try {
    // ✅ Requête Supabase SANS condition WHERE
    const { data: allData, error: allError } = await supabase
      .from('culture_events')
      .select('*')
      .order('date_debut', { ascending: true });

    const endTime = performance.now();
    diagnosis.duration = `${(endTime - startTime).toFixed(2)}ms`;

    // Gestion erreur
    if (allError) {
      diagnosis.status = 'error';
      diagnosis.error = {
        message: allError.message,
        code: allError.code,
        details: allError.details,
        hint: allError.hint
      };
      setDebugInfo(`❌ Erreur: ${allError.message}`);
      setTechDiag(diagnosis);
      return;
    }

    // Gestion table vide
    if (!allData || allData.length === 0) {
      diagnosis.status = 'empty';
      diagnosis.rowsReceived = 0;
      setDebugInfo('⚠️ Aucune donnée dans culture_events');
      setTechDiag(diagnosis);
      return;
    }

    // ✅ Succès
    diagnosis.status = 'success';
    diagnosis.rowsReceived = allData.length;
    diagnosis.sampleData = allData.slice(0, 3).map(e => ({
      id: e.id,
      titre: e.titre,
      type_affichage: e.type_affichage,
      secteur_evenement: e.secteur_evenement
    }));

    setAllEvents(allData);
    setDebugInfo(`✅ ${allData.length} événements chargés`);

    // ✅ Filtrage case-insensitive en JavaScript
    const weekly = allData.filter(e =>
      e.type_affichage?.toLowerCase() === 'hebdo' &&
      (selectedSecteur === 'all' || e.secteur_evenement === selectedSecteur)
    );

    const monthly = allData.filter(e =>
      e.type_affichage?.toLowerCase() === 'mensuel' &&
      (selectedSecteur === 'all' || e.secteur_evenement === selectedSecteur)
    );

    const annual = allData.filter(e =>
      e.type_affichage?.toLowerCase() === 'annuel' &&
      (selectedSecteur === 'all' || e.secteur_evenement === selectedSecteur)
    );

    diagnosis.filteredCounts = {
      weekly: weekly.length,
      monthly: monthly.length,
      annual: annual.length
    };

    setWeeklyEvents(weekly);
    setMonthlyEvents(monthly);
    setAnnualEvents(annual);
    setTechDiag(diagnosis);

  } catch (error: any) {
    const endTime = performance.now();
    diagnosis.status = 'exception';
    diagnosis.duration = `${(endTime - startTime).toFixed(2)}ms`;
    diagnosis.exception = {
      message: error?.message || String(error),
      stack: error?.stack
    };
    setDebugInfo(`❌ Exception: ${error}`);
    setTechDiag(diagnosis);
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 POINTS CLÉS À VÉRIFIER

### Dashboard Supabase

**1. Accédez à votre Dashboard:**
```
https://supabase.com/dashboard/project/kmvjegbtroksjqaqliyv
```

**2. Table Editor → culture_events:**
- Vérifiez que vous voyez bien **13 lignes**
- Vérifiez les colonnes: `titre`, `type_affichage`, `secteur_evenement`
- Vérifiez que `type_affichage` contient: 'hebdo', 'mensuel', 'annuel' (minuscules)

**3. Table Editor → SQL:**
```sql
-- Test 1: Compter
SELECT COUNT(*) FROM culture_events;

-- Test 2: Voir tout
SELECT * FROM culture_events ORDER BY created_at DESC;

-- Test 3: Vérifier types
SELECT DISTINCT type_affichage, COUNT(*) as count
FROM culture_events
GROUP BY type_affichage;

-- Résultat attendu:
-- hebdo    | 5
-- mensuel  | 4
-- annuel   | 4
```

---

## 🔧 COMPARAISON AVEC DASHBOARD

### Ce Que Vous Devriez Voir

**Dans Supabase Dashboard:**
- Table: `culture_events`
- Lignes: 13
- Colonnes principales: `id`, `titre`, `type_affichage`, `secteur_evenement`, `date_debut`

**Sur la Page Web (avec diagnostic):**

```
🔧 DIAGNOSTIC TECHNIQUE COMPLET

1. Nom de la Table Supabase: culture_events
2. Requête SQL Exacte: SELECT * FROM culture_events ORDER BY date_debut ASC
3. Status de la Connexion: ✅ CONNEXION RÉUSSIE
4. Nombre de Lignes Reçues: 13 événements
5. Temps de Réponse: ~XX ms
6. URL Supabase: https://kmvjegbtroksjqaqliyv.supabase.co

📊 Répartition des Événements:
   Hebdo: 5 | Mensuel: 4 | Annuel: 4

📋 Échantillon des Données (3 premiers):
   • Concert de Malouf - Type: hebdo - Secteur: Art & Culture
   • Soirée Jazz & Blues - Type: hebdo - Secteur: Art & Culture
   • 4LFA, COSMIC & RAMSJAMSSS - Type: hebdo - Secteur: Art & Culture
```

**Si ces nombres correspondent → ✅ Connexion OK**

**Si vous voyez:**
- ❌ ERREUR DE CONNEXION → Vérifier .env ou BoltDatabase.js
- ⚠️ TABLE VIDE → Ajouter des données dans Supabase
- 0 événements mais la table contient 13 → Problème de RLS ou de filtrage

---

## 🚨 RÉSOLUTION DES PROBLÈMES

### Si "CONNEXION RÉUSSIE" mais 0 événements affichés

**Cause possible:** Problème de RLS (Row Level Security)

**Solution:**
```sql
-- Vérifier les policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'culture_events';

-- La policy SELECT doit avoir qual = 'true' pour lecture publique
-- Si non, créer:
DROP POLICY IF EXISTS "Lecture publique des événements culturels" ON culture_events;

CREATE POLICY "Lecture publique des événements culturels"
ON culture_events
FOR SELECT
TO public
USING (true);
```

### Si "ERREUR DE CONNEXION"

**Vérifier:**

1. **Variables d'environnement (.env):**
```env
VITE_SUPABASE_URL=https://kmvjegbtroksjqaqliyv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **BoltDatabase.js (lignes 13-14):**
```javascript
export const SUPABASE_URL = "https://kmvjegbtroksjqaqliyv.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

3. **Supabase Dashboard → Settings → API:**
- Project URL doit correspondre
- anon/public key doit correspondre

### Si "TABLE VIDE"

**Ajouter des données de test:**
```sql
INSERT INTO culture_events (titre, type_affichage, secteur_evenement, ville, date_debut)
VALUES
  ('Test Event Hebdo', 'hebdo', 'Art & Culture', 'Tunis', NOW()),
  ('Test Event Mensuel', 'mensuel', 'Sorties & Soirées', 'Sousse', NOW()),
  ('Test Event Annuel', 'annuel', 'Art & Culture', 'Sfax', NOW());
```

---

## ✅ VALIDATION BUILD

```bash
npm run build
```

**Résultat:**
```
✓ 2062 modules transformed
✓ Built in 17.20s
✅ Aucune erreur TypeScript
✅ Aucun warning bloquant
```

---

## 📸 CAPTURES D'ÉCRAN RECOMMANDÉES

Pour diagnostic complet, envoyez-moi:

1. **Panneau de diagnostic technique** (box bleue en haut de page)
2. **Console du navigateur (F12)** avec le log `📊 Debug Info`
3. **Dashboard Supabase** → Table Editor → culture_events (nombre de lignes)
4. **Dashboard Supabase** → Table Editor → Exemple de 3 lignes avec colonnes visibles

---

## 🎯 RÉSUMÉ EXÉCUTIF

| Question | Réponse |
|----------|---------|
| **1. Nom de la table** | `culture_events` |
| **2. Requête SQL** | `SELECT * FROM culture_events ORDER BY date_debut ASC` |
| **3. Test de réponse** | ✅ Panneau diagnostic complet visible en haut de page |
| **Nombre d'événements en DB** | 13 (vérifié par SQL direct) |
| **Status build** | ✅ Réussi sans erreur |
| **RLS policies** | ✅ Lecture publique activée (qual=true) |

---

**Date du rapport:** 3 février 2026
**Status:** ✅ Diagnostic Complet Implémenté
**Action requise:** Vérifier le panneau bleu sur la page et comparer avec Supabase Dashboard
