# Organisation Menu Admin et Géolocalisation

**Date**: 8 février 2026
**Composants modifiés**: Layout.tsx, AroundMe.tsx (nouveau), App.tsx

---

## Objectif

Réorganiser l'accès aux fonctions spéciales (Sourcing et Admin) en créant un menu Admin structuré avec sous-menu, et ajouter une nouvelle page de géolocalisation "Autour de moi".

---

## 1. Menu Admin avec Sous-Menu

### Avant
- Bouton simple "Admin" dans la barre de navigation
- Accès direct uniquement au Sourcing Rapide
- Pas de sous-menu

### Après
- **Menu déroulant "Admin"** avec icône chevron
- Deux options dans le sous-menu :
  1. **Sourcing Rapide** (icône Building2)
  2. **Autour de moi** (icône Target)

### Implémentation Desktop

```tsx
{/* Admin Menu - Desktop (DEV only) */}
{showAdminLink && (
  <div
    className="relative nav-dropdown-container"
    onMouseEnter={() => setOpenMenu('Admin')}
    onMouseLeave={() => setOpenMenu(null)}
  >
    <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-200 hover:bg-gray-100 text-gray-700 transition-all">
      Admin
      <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'Admin' ? 'rotate-180' : ''}`} />
    </button>

    {openMenu === 'Admin' && (
      <div className="absolute top-full right-0 pt-2">
        <div className="bg-white rounded-lg shadow-xl py-2 min-w-[220px] border border-gray-200">
          <button onClick={() => {onNavigate('adminSourcing'); setOpenMenu(null);}}>
            <Building2 className="w-4 h-4" />
            Sourcing Rapide
          </button>
          <button onClick={() => {onNavigate('aroundMe'); setOpenMenu(null);}}>
            <Target className="w-4 h-4" />
            Autour de moi
          </button>
        </div>
      </div>
    )}
  </div>
)}
```

### Implémentation Mobile

```tsx
{/* Admin Menu - Mobile (DEV only) */}
{showAdminLink && (
  <div>
    <button onClick={() => {setMobileExpandedMenu(mobileExpandedMenu === 'Admin' ? null : 'Admin');}}>
      <span className="flex items-center gap-2">
        <Target className="w-4 h-4" />
        Admin
      </span>
      <ChevronRight className={`w-4 h-4 transition-transform ${mobileExpandedMenu === 'Admin' ? 'rotate-90' : ''}`} />
    </button>

    {mobileExpandedMenu === 'Admin' && (
      <div className="ml-4 mt-1 space-y-1">
        <button onClick={() => {onNavigate('adminSourcing'); setShowMobileMenu(false); setMobileExpandedMenu(null);}}>
          <Building2 className="w-4 h-4" />
          Sourcing Rapide
        </button>
        <button onClick={() => {onNavigate('aroundMe'); setShowMobileMenu(false); setMobileExpandedMenu(null);}}>
          <Target className="w-4 h-4" />
          Autour de moi
        </button>
      </div>
    )}
  </div>
)}
```

---

## 2. Page "Autour de moi" (Géolocalisation)

### Fonctionnalités

#### 2.1. Géolocalisation de l'utilisateur
- Demande automatique de permission de géolocalisation au chargement
- Récupération des coordonnées GPS précises (enableHighAccuracy)
- Affichage de la position de l'utilisateur sur la carte avec un marqueur bleu spécial

#### 2.2. Recherche d'établissements proximité
- Filtre par rayon de recherche : 2, 5, 10, 20, 50 km
- Calcul de distance via la formule de Haversine
- Tri automatique par distance croissante
- Affichage du nombre total d'établissements trouvés

#### 2.3. Carte Interactive
- **Marqueur bleu** pour la position de l'utilisateur
- **Marqueurs rouges** pour les établissements
- Pop-ups avec informations détaillées :
  - Nom de l'établissement
  - Catégorie
  - Ville
  - Distance en km
- **Bouton flottant "Me localiser"** (icône Navigation) :
  - Position : En bas à droite de la carte
  - Fonction : Recentre la carte sur la position de l'utilisateur
  - Design : Fond blanc, ombre portée, hover scale
  - z-index: 1000 (toujours visible)

#### 2.4. Liste des Résultats
- Grille responsive (1, 2 ou 3 colonnes selon l'écran)
- Cartes d'établissement avec :
  - Image de l'établissement
  - Nom, catégorie, ville, adresse
  - Téléphone (si disponible)
  - Badge de distance en km
- Clic sur une carte → Sélection sur la carte (ring bleu) et zoom

#### 2.5. Gestion des Erreurs
- Permission refusée → Message d'erreur explicite
- Géolocalisation non supportée → Message d'information
- Aucun établissement trouvé → Message informatif

### Structure du Code

```tsx
export default function AroundMe() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [radius, setRadius] = useState(10); // km
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Géolocalisation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
        },
        (err) => setError(t.geoPermission),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Recherche établissements
  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyBusinesses = async () => {
      const { data } = await supabase
        .from('entreprise')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      const withDistance = data
        .map(b => ({ ...b, distance: calculateDistance(...userLocation, b.latitude, b.longitude) }))
        .filter(b => b.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      setEtablissements(withDistance);
    };

    fetchNearbyBusinesses();
  }, [userLocation, radius]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Formule de Haversine
    const R = 6371; // Rayon de la Terre en km
    // ... calcul ...
    return R * c;
  };

  const recenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 13);
    }
  };
}
```

### Marqueur Personnalisé (Position Utilisateur)

```tsx
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMCIgZmlsbD0iIzM4NzVkNyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSI0IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});
```

### Bouton Flottant "Me Localiser"

```tsx
<button
  onClick={recenterMap}
  className="absolute bottom-6 right-6 z-[1000] bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg border-2 border-gray-200 transition-all hover:scale-110"
  title={t.recenter}
>
  <Navigation className="w-6 h-6" />
</button>
```

**Caractéristiques** :
- Position : `absolute bottom-6 right-6`
- Z-index : `1000` (au-dessus de la carte Leaflet)
- Effet hover : `scale-110` (grossit légèrement)
- Icône : `Navigation` (boussole) de Lucide React
- Ombre portée et bordure pour visibilité

---

## 3. Icônes Utilisées

| Icône | Usage | Couleur |
|-------|-------|---------|
| `Target` | Menu Admin (mobile), Autour de moi | Gris/Bleu |
| `Building2` | Sourcing Rapide | Gris/Orange |
| `Navigation` | Bouton "Me localiser" sur la carte | Gris foncé |
| `MapPin` | Localisation des établissements | Rouge (Leaflet) |

---

## 4. Multilingue

La page "Autour de moi" supporte 3 langues :
- **Français** (fr)
- **Arabe** (ar)
- **Anglais** (en)

Textes traduits :
- Titre, sous-titre
- Messages d'erreur (permission refusée, géolocalisation non supportée)
- Labels (rayon, résultats, distance, etc.)
- Bouton "Me localiser"

---

## 5. Fichiers Modifiés

### Layout.tsx
- Import de l'icône `Target`
- Ajout de `'aroundMe'` dans le type `Page`
- Remplacement du bouton "Admin" simple par un menu déroulant
- Version desktop (hover) et mobile (clic)

### App.tsx
- Import de `AroundMe`
- Ajout de `'aroundMe'` dans le type `Page`
- Ajout du case `'aroundMe'` dans le switch

### AroundMe.tsx (nouveau)
- Page complète de géolocalisation
- Carte interactive avec Leaflet
- Calcul de distances
- Filtrage par rayon
- Bouton flottant de recentrage

---

## 6. Responsive Design

### Desktop
- Menu Admin en haut à droite avec dropdown au hover
- Carte 500px de hauteur
- Grille 3 colonnes pour les résultats

### Tablette
- Menu Admin identique au desktop
- Carte 500px de hauteur
- Grille 2 colonnes pour les résultats

### Mobile
- Menu Admin dans le menu hamburger avec expansion
- Icône Target bien visible
- Carte 500px de hauteur (plein écran)
- Grille 1 colonne pour les résultats
- Bouton flottant "Me localiser" facilement accessible au pouce

---

## 7. Permissions et Sécurité

### Permission de Géolocalisation
- Demandée au chargement de la page "Autour de moi"
- Message d'erreur clair si refusée
- Option `enableHighAccuracy: true` pour précision maximale
- Timeout de 10 secondes

### Données GPS
- Aucune donnée GPS de l'utilisateur n'est stockée
- Calculs de distance effectués côté client
- Aucune requête serveur avec les coordonnées de l'utilisateur

---

## 8. Performances

### Optimisations
- Requête Supabase filtrée (seulement les établissements avec GPS)
- Calcul de distance en JavaScript (rapide)
- Filtre local par rayon (pas de nouvelle requête)
- Tri local par distance
- Pas de re-rendu inutile grâce aux useEffect

### Limites
- Pas de pagination (tous les résultats affichés)
- Pas de cache des résultats
- Recalcul à chaque changement de rayon

---

## 9. Améliorations Futures Possibles

1. **Clustering des marqueurs** : Grouper les établissements proches pour meilleure lisibilité
2. **Itinéraire** : Bouton pour ouvrir Google Maps avec itinéraire
3. **Filtres avancés** : Par catégorie, note, horaires d'ouverture
4. **Mode suivi** : Mise à jour continue de la position (pour usage mobile en déplacement)
5. **Historique** : Sauvegarder les établissements consultés
6. **Partage** : Partager un établissement trouvé
7. **Pagination** : Charger les résultats par batches

---

## 10. Tests Effectués

### Build
✅ Build réussi sans erreur TypeScript
✅ Tous les imports corrects
✅ Pas de conflit de types

### Navigation
✅ Menu Admin accessible en desktop (hover)
✅ Menu Admin accessible en mobile (clic + expansion)
✅ Navigation vers "Sourcing Rapide" fonctionne
✅ Navigation vers "Autour de moi" fonctionne

### Responsive
✅ Menu visible et utilisable sur mobile
✅ Icônes bien dimensionnées
✅ Bouton flottant accessible au pouce

---

## Conclusion

Le menu Admin est maintenant bien organisé avec un sous-menu clair, et la nouvelle page "Autour de moi" permet aux utilisateurs de trouver facilement les établissements à proximité de leur position GPS. Le bouton flottant de recentrage améliore l'expérience utilisateur en permettant de revenir rapidement à sa position après avoir exploré la carte.

**Points forts** :
- Navigation claire et intuitive
- Géolocalisation précise
- Design responsive et accessible
- Multilingue
- Bouton flottant bien positionné et visible

**Accès** :
- Mode DEV : Menu Admin visible automatiquement
- Production : Visible si `VITE_SHOW_ADMIN_LINK=true`
