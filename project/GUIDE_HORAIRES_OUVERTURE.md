# Guide d'utilisation - Horaires d'ouverture

## Vue d'ensemble

Le système d'affichage des horaires d'ouverture permet aux entreprises de communiquer leurs horaires de manière claire et dynamique, avec un indicateur en temps réel qui montre si l'établissement est actuellement ouvert ou fermé.

## Fonctionnalités

### 1. Indicateur dynamique "Ouvert/Fermé" sur les cartes de visite

Sur chaque carte d'entreprise (BusinessCard), un indicateur visuel indique l'état actuel :
- **Ouvert** : Badge vert avec icône horloge
- **Fermé** : Badge rouge avec icône horloge

L'indicateur :
- Se met à jour automatiquement en fonction de l'heure actuelle
- Compare l'heure avec les plages horaires définies pour le jour en cours
- Prend en compte les jours de fermeture (dimanche, jours fériés, etc.)
- S'adapte à toutes les langues disponibles (FR, EN, AR, IT, RU)

### 2. Tableau détaillé des horaires sur la page de détails

Sur la page de détails d'une entreprise (BusinessDetail), un tableau élégant affiche :
- Les 7 jours de la semaine
- Les horaires pour chaque jour
- Le jour actuel mis en évidence (fond coloré différent)
- Les jours de fermeture affichés en rouge

Fonctionnalités spéciales :
- Les jours traduits automatiquement selon la langue sélectionnée
- Le design s'adapte au niveau d'abonnement (Premium avec couleur dorée)
- Gestion élégante des cas où les horaires ne sont pas renseignés

## Format des données dans Supabase

### Colonne : `horaires_ok`

Type : `text` (chaîne de caractères)

Format attendu :
```
Lundi : 08:00–17:00
Mardi : 08:00–17:00
Mercredi : 08:00–17:00
Jeudi : 08:00–17:00
Vendredi : 08:00–17:00
Samedi : 08:00–12:00
Dimanche : Fermé
```

### Règles de format :
1. Un jour par ligne
2. Format : `Nom du jour : Horaire`
3. Les horaires doivent être au format `HH:MM–HH:MM` (avec tiret long `–` ou tiret simple `-`)
4. Pour les jours fermés, utiliser : `Fermé`, `Closed`, ou `مغلق` (arabe)

## Fichiers techniques

### Utilitaires - `/src/lib/horaireUtils.ts`

Fonctions principales :

#### `parseHoraires(horaires: string): DaySchedule[]`
Parse la chaîne de caractères des horaires et retourne un tableau structuré.

#### `isCurrentlyOpen(horaires: string): boolean`
Détermine si l'établissement est actuellement ouvert en fonction de l'heure actuelle.

#### `getParsedSchedule(horaires: string): ParsedSchedule`
Retourne un objet complet avec les horaires parsés et l'état actuel.

#### Fonctions de traduction :
- `translateOpenStatus(language: string): string` - Traduit "Ouvert"
- `translateClosedStatus(language: string): string` - Traduit "Fermé"
- `translateScheduleTitle(language: string): string` - Traduit "Horaires d'ouverture"
- `translateScheduleNotAvailable(language: string): string` - Traduit "Horaires non communiqués"
- `getDayName(dayIndex: number, language: string): string` - Traduit les noms de jours

### Composants modifiés

#### `/src/components/BusinessCard.tsx`
- Ajout de l'indicateur "Ouvert/Fermé"
- Affichage conditionnel si `horaires_ok` existe
- Icône Clock colorée selon l'état

#### `/src/pages/BusinessDetail.tsx`
- Section complète des horaires
- Tableau des 7 jours de la semaine
- Mise en évidence du jour actuel
- Gestion des cas sans horaires

## Langues supportées

Le système supporte 5 langues :
- Français (FR)
- Anglais (EN)
- Arabe (AR)
- Italien (IT)
- Russe (RU)

Toutes les traductions sont gérées automatiquement par les fonctions utilitaires.

## Exemples d'affichage

### Carte d'entreprise

```
┌─────────────────────────┐
│ 🏢 Restaurant Le Gourmet│
│ 📍 Tunis                │
│ 🕐 Ouvert ✅            │ ← Indicateur dynamique
│ Voir les détails →     │
└─────────────────────────┘
```

### Page de détails

```
⏰ Horaires d'ouverture [Ouvert]

┌──────────────────────────┐
│ Lundi      08:00–17:00  │
│ Mardi      08:00–17:00  │
│ Mercredi   08:00–17:00  │ ← (jour actuel en surbrillance)
│ Jeudi      08:00–17:00  │
│ Vendredi   08:00–17:00  │
│ Samedi     08:00–12:00  │
│ Dimanche   Fermé        │ ← (affiché en rouge)
└──────────────────────────┘
```

## Cas particuliers gérés

1. **Horaires non renseignés** : Affiche "Horaires non communiqués" dans la langue sélectionnée
2. **Format invalide** : Le système parse ligne par ligne et ignore les lignes mal formatées
3. **Jours fermés** : Détectés automatiquement par les mots-clés "Fermé", "Closed", "مغلق"
4. **Changement de langue** : Les jours et états se mettent à jour instantanément
5. **Minuit** : Les horaires qui traversent minuit sont gérés (exemple : 22:00–02:00)

## Maintenance et évolution

### Ajouter une nouvelle langue

1. Ajouter les traductions dans `/src/lib/horaireUtils.ts` :
   - `DAYS_XX` (tableau des jours)
   - Cas dans `getDayName()`
   - Cas dans les fonctions de traduction

2. Les traductions sont automatiquement utilisées partout

### Modifier le design

Les styles sont dans :
- `BusinessCard.tsx` : Indicateur sur carte (lignes 206-222)
- `BusinessDetail.tsx` : Tableau des horaires (lignes 741-807)

### Ajouter des fonctionnalités

Idées d'évolution :
- Horaires exceptionnels (jours fériés)
- Plusieurs plages horaires par jour
- Pause déjeuner
- Horaires d'été/hiver
- Notification avant fermeture

## Performance

- Les calculs sont faits côté client (pas de requête serveur)
- Parsing léger et rapide
- Mise en cache automatique par React
- Aucun impact sur le temps de chargement

## Sécurité

- Données en lecture seule depuis Supabase
- Pas d'injection possible (texte simple)
- Validation automatique du format
- Pas de risque XSS (pas de HTML dans les données)
