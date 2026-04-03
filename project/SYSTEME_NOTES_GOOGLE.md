# Système de Nettoyage et Affichage des Notes Google

## Vue d'ensemble

Système automatique de nettoyage des notes Google pour gérer les formats avec virgules (ex: `4,5` → `4.5`) et afficher les notes avec une étoile dorée.

---

## Fichiers créés

### 1. `/src/lib/ratingUtils.ts`
Utilitaires de nettoyage et formatage des notes.

**Fonctions principales :**

```typescript
// Nettoie une note (virgule → point)
cleanGoogleRating('4,5') // → 4.5
cleanGoogleRating('invalid') // → 0

// Nettoie le compteur d'avis
cleanReviewCount('124') // → 124
cleanReviewCount('invalid') // → 0

// Formate pour l'affichage
formatRating(4.5, 124)
// → { display: '⭐ 4.5', full: '⭐ 4.5 (124 avis)' }

// Nettoie les données d'entreprise
cleanBusinessRatings(business)
// → { ...business, note_google_clean: 4.5, nombre_avis_clean: 124 }

// Trie par note décroissante
sortByRating(businesses)

// Obtient le Top N
getTopRated(businesses, 10)
```

### 2. `/src/components/GoogleRating.tsx`
Composants React pour afficher les notes.

**Composants disponibles :**

```tsx
// Badge simple
<RatingBadge rating="4,5" reviewCount="124" />

// Affichage avec étoile
<GoogleRating rating="4,5" reviewCount="124" size="medium" />

// Affichage détaillé avec étoiles visuelles
<DetailedRating rating="4,5" reviewCount="124" showStars={true} />
```

### 3. `/src/lib/businessQueries.ts`
Helpers pour récupérer les entreprises avec tri automatique.

**Fonctions disponibles :**

```typescript
// Récupérer avec tri par note
await fetchBusinesses({ sortByRating: true, limit: 100 })

// Récupérer Top 10
await fetchTopRatedBusinesses({ limit: 10 })

// Récupérer une entreprise avec notes nettoyées
await fetchBusinessById(id)

// Récupérer featured avec tri
await fetchFeaturedBusinesses({ sortByRating: true })
```

### 4. `/src/lib/ratingUtils.test.ts`
Tests unitaires pour valider le système.

---

## Formats acceptés

Le système gère automatiquement :

| Format d'entrée | Sortie |
|-----------------|--------|
| `'4,5'` | `4.5` |
| `'4.5'` | `4.5` |
| `4.5` | `4.5` |
| `'4,95'` | `4.95` |
| `'Note: 4,8'` | `4.8` |
| `'★4,7'` | `4.7` |
| `null` | `0` |
| `undefined` | `0` |
| `''` | `0` |
| `'invalid'` | `0` |
| `6` | `5` (max) |
| `-1` | `0` (min) |

---

## Utilisation

### Dans une page avec recherche d'entreprises

```typescript
import { fetchTopRatedBusinesses } from '../lib/businessQueries';
import { BusinessCard } from '../components/BusinessCard';

// Récupérer le Top 10 par note
const { data: topBusinesses } = await fetchTopRatedBusinesses({
  limit: 10,
  secteur: 'sante'
});

// Afficher les cartes (la note s'affiche automatiquement)
topBusinesses.map(business => (
  <BusinessCard key={business.id} business={business} />
))
```

### Affichage manuel d'une note

```tsx
import { GoogleRating } from '../components/GoogleRating';

<GoogleRating
  rating={business.note_google}
  reviewCount={business.nombre_avis}
  size="medium"
  showCount={true}
/>
```

### Badge de note sur une carte

```tsx
import { RatingBadge } from '../components/GoogleRating';

<RatingBadge
  rating={business.note_google}
  reviewCount={business.nombre_avis}
/>
```

---

## Tri Top 10

Le système trie automatiquement :

1. **Par note décroissante** (5.0 → 4.0 → 3.0)
2. **Entreprises avec note > 0 en premier**
3. **Entreprises sans note en bas**

```typescript
// Exemple de tri
const businesses = [
  { nom: 'A', note_google: '3.5' },  // 4e position
  { nom: 'B', note_google: '4.8' },  // 1re position
  { nom: 'C', note_google: '0' },    // 5e position (sans note)
  { nom: 'D', note_google: '4.2' },  // 3e position
  { nom: 'E', note_google: '4.5' }   // 2e position
];

const topRated = getTopRated(businesses, 10);
// Résultat: B (4.8), E (4.5), D (4.2), A (3.5), C (0)
```

---

## Affichage visuel

### Badge de note (RatingBadge)
```
┌─────────────────┐
│ ⭐ 4.5 (124)   │  ← Badge jaune doré
└─────────────────┘
```

### Note simple (GoogleRating)
```
⭐ 4.5 (124 avis)
```

### Note détaillée (DetailedRating)
```
⭐ 4.5 / 5
★★★★☆          ← Étoiles visuelles
124 avis
```

---

## Gestion des colonnes Supabase

Le système supporte deux formats de colonnes :

### Format moderne (snake_case)
```typescript
{
  note_google: '4,5',
  nombre_avis: '124'
}
```

### Format legacy (avec espaces)
```typescript
{
  'Note Google Globale': '4,5',
  'Compteur Avis Google': '124'
}
```

Les deux formats sont automatiquement détectés et nettoyés.

---

## Sécurité et robustesse

### Protection contre les erreurs

```typescript
// Valeurs manquantes → 0
cleanGoogleRating(null) // → 0
cleanGoogleRating(undefined) // → 0
cleanGoogleRating('') // → 0

// Valeurs invalides → 0
cleanGoogleRating('abc') // → 0
cleanGoogleRating('invalid') // → 0

// Valeurs hors limites → clamped
cleanGoogleRating(10) // → 5 (max)
cleanGoogleRating(-5) // → 0 (min)
```

### Pas de plantage

Si une note est mal formatée, le système :
1. Retourne `0` au lieu de planter
2. N'affiche rien si la note est `0`
3. Continue de fonctionner normalement

---

## Multilingue

Le système supporte 5 langues :

| Langue | "Non noté" | "avis" |
|--------|-----------|--------|
| Français | Non noté | avis |
| Arabe | غير مصنف | تقييمات |
| Anglais | Not rated | reviews |
| Italien | Non valutato | recensioni |
| Russe | Не оценено | отзывов |

---

## Performance

### Optimisations

1. **Nettoyage unique** : Les notes sont nettoyées une fois après fetch
2. **Tri en mémoire** : Le tri se fait côté client sur les données déjà chargées
3. **Pas de requêtes supplémentaires** : Tout est inclus dans le fetch initial

### Recommandations

- Récupérez plus d'entreprises que nécessaire pour avoir un bon échantillon
- Pour un Top 10, récupérez au moins 100 entreprises
- Le tri en mémoire est instantané

```typescript
// Bon : récupère 100 pour avoir un Top 10 fiable
fetchTopRatedBusinesses({ limit: 10 }) // fetch 100 en interne

// Moins bon : trop peu d'échantillons
fetchBusinesses({ limit: 10, sortByRating: true })
```

---

## Exemples pratiques

### Page "Top 10 des médecins"

```typescript
import { fetchTopRatedBusinesses } from '../lib/businessQueries';

const TopDoctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const loadTop = async () => {
      const { data } = await fetchTopRatedBusinesses({
        limit: 10,
        secteur: 'sante',
        categorie: 'Médecin'
      });
      setDoctors(data);
    };
    loadTop();
  }, []);

  return (
    <div>
      <h1>Top 10 des Médecins</h1>
      {doctors.map((doc, index) => (
        <div key={doc.id}>
          <span>#{index + 1}</span>
          <BusinessCard business={doc} />
        </div>
      ))}
    </div>
  );
};
```

### Affichage dans BusinessDetail

```tsx
import { DetailedRating } from '../components/GoogleRating';

const BusinessDetail = ({ business }) => {
  return (
    <div>
      <h1>{business.nom}</h1>

      {/* Affichage détaillé avec étoiles */}
      <DetailedRating
        rating={business.note_google}
        reviewCount={business.nombre_avis}
        showStars={true}
      />

      {/* Lien vers Google */}
      {business['Lien Avis Google'] && (
        <a href={business['Lien Avis Google']} target="_blank">
          Voir tous les avis sur Google
        </a>
      )}
    </div>
  );
};
```

---

## Migration des pages existantes

Pour ajouter le système à une page existante :

1. **Importer les utilitaires**
```typescript
import { fetchTopRatedBusinesses } from '../lib/businessQueries';
```

2. **Remplacer le fetch**
```typescript
// Avant
const { data } = await supabase.from('entreprise').select('*').limit(10);

// Après
const { data } = await fetchTopRatedBusinesses({ limit: 10 });
```

3. **Ajouter les colonnes au type**
```typescript
interface Business {
  // ... autres champs
  note_google?: string | number | null;
  nombre_avis?: string | number | null;
}
```

4. **Le composant BusinessCard affiche automatiquement la note**

---

## Tests

Lancer les tests :

```bash
npm run test src/lib/ratingUtils.test.ts
```

Tests inclus :
- Nettoyage virgules → points
- Gestion des valeurs invalides
- Formatage multilingue
- Tri par note
- Top N

---

## FAQ

### Q : Pourquoi utiliser des virgules et des points ?
**R :** Certains utilisateurs saisissent les notes avec des virgules (format européen). Le système normalise automatiquement.

### Q : Que se passe-t-il si la note est vide ?
**R :** Le badge de note ne s'affiche pas. Aucune erreur.

### Q : Comment forcer l'affichage "Non noté" ?
**R :** Utilisez `GoogleRating` au lieu de `RatingBadge`.

### Q : Les notes sont-elles mises à jour en temps réel ?
**R :** Non, elles sont récupérées depuis Supabase. Mettez à jour la base pour changer les notes.

### Q : Peut-on trier côté serveur ?
**R :** Oui, mais Supabase ne peut pas trier sur des données avec virgules. Le nettoyage côté client est plus fiable.

---

## Maintenance

### Ajouter une nouvelle langue

Dans `ratingUtils.ts`, ajouter les traductions :

```typescript
const noRating = locale === 'ar' ? 'غير مصنف' :
                 locale === 'en' ? 'Not rated' :
                 locale === 'it' ? 'Non valutato' :
                 locale === 'ru' ? 'Не оценено' :
                 locale === 'es' ? 'Sin calificar' : // ← Nouvelle langue
                 'Non noté';
```

### Modifier le style des étoiles

Dans `GoogleRating.tsx`, modifier les classes Tailwind :

```tsx
<Star className="fill-yellow-400 text-yellow-400" />
//            ^^^^^^^^^^^^^^^^ Couleur de remplissage
//                           ^^^^^^^^^^^^^^^^ Couleur du contour
```

---

## Résumé

Le système est maintenant opérationnel et gère automatiquement :
- Nettoyage des virgules → points
- Affichage avec étoile dorée ⭐
- Tri par note décroissante
- Top 10 fiables
- Protection contre les erreurs
- Support multilingue

**Aucun plantage, données toujours propres, Top 10 précis.**
