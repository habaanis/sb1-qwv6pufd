# Intégration des Événements Culturels avec Billetterie

## Table Supabase: `culture_events`

### Nouvelles Colonnes Ajoutées

1. **prix** (text)
   - Format: "Gratuit", "20 DT", "15-50 DT", etc.
   - Affichage: Badge coloré selon le type de cadre (cyan/émeraude/or)

2. **lien_billetterie** (text)
   - URL vers la page de réservation/achat de billets
   - Transforme automatiquement le bouton en "Réserver/Billetterie"

### Structure Complète de la Table

```sql
- id (uuid, primary key)
- titre (text)
- ville (text)
- date_debut (timestamptz)
- date_fin (timestamptz)
- image_url (text)
- categorie (text)
- description_courte (text)
- est_annuel (boolean)
- prix (text) ✨ NOUVEAU
- lien_billetterie (text) ✨ NOUVEAU
- type_affichage (text) - "hebdo", "mensuel", "annuel"
- created_at (timestamptz)
- updated_at (timestamptz)
```

## Logique des 3 Cadres Temporels

### 1. Cadre Hebdo (Cyan/Bleu)
- **Filtre**: Événements dans les 7 prochains jours
- **Badge**: "Cette Semaine" (cyan)
- **Style**: Border cyan, shadow cyan, badges cyan
- **SQL**: `date_debut BETWEEN NOW() AND NOW() + 7 days`

### 2. Cadre Mensuel (Vert/Émeraude)
- **Filtre**: Événements du mois en cours
- **Badge**: "Ce Mois-ci" (émeraude)
- **Style**: Border émeraude, shadow émeraude, badges émeraude
- **SQL**: `date_debut BETWEEN NOW() AND end_of_month`

### 3. Cadre Annuel (Or)
- **Filtre**: Événements marqués `est_annuel = true`
- **Badge**: "Événements Annuels" (doré)
- **Style**: Border or, shadow or, badges or, titre gradient or
- **SQL**: `est_annuel = true`

## Composants Créés

### 1. CultureEventAgendaCard.tsx
Composant réutilisable pour afficher les cartes d'événements avec:
- Affichage du prix (badge coloré)
- Bouton billetterie (si lien disponible)
- Formatage automatique des dates
- Styles thématiques selon le type (weekly/monthly/annual)
- État vide élégant si aucun événement

### 2. CultureEvents.tsx
Page complète d'agenda culturel avec:
- 3 cadres horizontaux (hebdo, mensuel, annuel)
- Chargement automatique depuis Supabase
- Support multilingue (FR, EN, AR, IT, RU)
- Design premium avec dégradés et animations
- Responsive (mobile, tablette, desktop)

## Routes Ajoutées

- **Hash**: `#/evenements` ou `#/culture-events`
- **Navigation**: Accessible via URL directe
- **Retour**: Bouton retour vers la page d'accueil

## Données de Test Incluses

3 événements ont été créés pour tester les 3 cadres:

1. **Soirée Jazz & Blues** (Hebdo)
   - Date: Dans 4 jours
   - Prix: 25 DT
   - Billetterie: Facebook Events

2. **Marathon de Carthage** (Mensuel)
   - Date: Dans 20 jours
   - Prix: 50 DT
   - Billetterie: Site officiel

3. **Festival International de Carthage** (Annuel)
   - Date: Été 2026
   - Prix: 30-100 DT
   - Billetterie: Site du festival
   - est_annuel: true

## Intégration Visuelle

### Affichage du Prix
```tsx
{event.prix && (
  <span className={`px-3 py-1 ${color.badge} rounded-full text-sm font-medium`}>
    {event.prix}
  </span>
)}
```

### Bouton Billetterie
```tsx
{event.lien_billetterie && (
  <a href={event.lien_billetterie} target="_blank" rel="noopener noreferrer"
     className={`inline-flex items-center gap-2 px-4 py-2 ${color.button}`}>
    <Ticket className="w-4 h-4" />
    <span>Réserver</span>
  </a>
)}
```

## Utilisation

### Accéder à la page
```typescript
// Via URL
window.location.hash = '#/evenements';

// Via navigation interne
handleNavigate('cultureEvents');
```

### Ajouter un nouvel événement
```sql
INSERT INTO culture_events (
  titre, ville, date_debut, date_fin,
  categorie, image_url, prix, lien_billetterie,
  est_annuel, description_courte
) VALUES (
  'Nom de l''événement',
  'Ville',
  '2026-03-15 20:00:00+00',
  '2026-03-15 23:00:00+00',
  'Concert',
  'https://images.pexels.com/photos/xxx.jpeg',
  '35 DT',
  'https://www.example.com/tickets',
  false,
  'Description courte de l''événement'
);
```

## Prochaines Étapes Recommandées

1. **Interface Admin**: Créer un formulaire pour ajouter/modifier les événements
2. **Filtres**: Ajouter filtres par ville, catégorie, prix
3. **Recherche**: Intégrer la barre de recherche
4. **Pagination**: Afficher plus d'événements par catégorie
5. **Favoris**: Permettre aux utilisateurs de sauvegarder leurs événements préférés
6. **Notifications**: Alertes pour les nouveaux événements

## Support Multilingue

Toutes les traductions sont incluses pour:
- Français (FR)
- Anglais (EN)
- Arabe (AR)
- Italien (IT)
- Russe (RU)

Les événements eux-mêmes stockent le titre en français. Pour ajouter des traductions d'événements, vous pouvez ajouter des colonnes `titre_ar`, `titre_en`, etc.
