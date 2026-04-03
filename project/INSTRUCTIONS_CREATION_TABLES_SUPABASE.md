# Instructions : Créer les Tables dans Supabase

## Étape 1 : Accéder à l'Éditeur SQL

1. Connectez-vous à votre compte Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **SQL Editor** (Éditeur SQL)
4. Cliquez sur **New query** (Nouvelle requête)

## Étape 2 : Copier le Script SQL

1. Ouvrez le fichier `SCRIPT_SQL_COMPLET_TABLES_LOISIRS.sql`
2. Copiez **TOUT** le contenu du fichier
3. Collez-le dans l'éditeur SQL de Supabase

## Étape 3 : Exécuter le Script

1. Cliquez sur le bouton **Run** (Exécuter) ou appuyez sur `Ctrl+Entrée`
2. Attendez quelques secondes que le script s'exécute
3. Vous devriez voir un message de succès en vert

## Étape 4 : Vérifier la Création

Le script affiche automatiquement un résumé à la fin :

```
table_name         | total_records
-------------------|---------------
entreprise         | 6
evenements_locaux  | 5
```

Cela confirme que :
- ✅ La table `entreprise` a été créée avec 6 lieux d'exemple
- ✅ La table `evenements_locaux` a été créée avec 5 événements d'exemple

## Étape 5 : Vérifier dans l'Interface

1. Dans le menu de gauche, cliquez sur **Table Editor** (Éditeur de tables)
2. Vous devriez voir les deux nouvelles tables :
   - `entreprise`
   - `evenements_locaux`
3. Cliquez sur chaque table pour voir les données d'exemple

## Ce qui a été créé

### Table `entreprise` (Lieux Permanents)
**Colonnes principales :**
- `nom` - Nom de l'établissement
- `ville` - Ville
- `secteur` - Secteur d'activité (loisir, education, sante, etc.)
- `categorie` - Catégorie principale
- `sous_categories` - Sous-catégorie pour filtres avancés
- `image_url` - URL de l'image
- `is_premium` - Établissement premium (true/false)
- `latitude`, `longitude` - Coordonnées GPS
- `description`, `adresse`, `telephone`, `email`, `site_web`

**Données d'exemple :**
- Restaurant Dar El Jeld (Tunis)
- Musée du Bardo (Tunis)
- Café des Délices (Sidi Bou Said)
- Hôtel Dar Hi (Nefta)
- Plage de La Marsa
- Club de Tennis Ezzahra

### Table `evenements_locaux` (Événements)
**Colonnes principales :**
- `titre`, `titre_ar`, `titre_en` - Titre multilingue
- `description`, `description_ar`, `description_en` - Description multilingue
- `date_debut`, `date_fin` - Dates de l'événement
- `localisation_ville`, `localisation_region` - Localisation
- `prix` - Prix (Gratuit, €€, €€€)
- `type_evenement` - Type (Festival, Concert, Sport, etc.)
- `secteur_evenement` - Secteur (loisir, education, entreprise)
- `niveau_abonnement` - Niveau (gratuit, premium, vip)
- `image_url` - URL de l'image
- `accessible_enfants` - Adapté aux enfants (true/false)

**Données d'exemple :**
- Festival International de Mahdia
- Concert de Jazz à Carthage
- Exposition d'Art Contemporain
- Marathon de Monastir
- Cinéma en Plein Air

## Sécurité (RLS - Row Level Security)

✅ **Les deux tables sont sécurisées avec RLS :**
- **Lecture publique** : Tout le monde peut voir les données approuvées/actives
- **Insertion** : Seuls les utilisateurs authentifiés peuvent ajouter des données
- **Modification** : Seuls les utilisateurs authentifiés peuvent modifier

## Index de Performance

✅ **Des index ont été créés automatiquement pour :**
- Recherches par ville, secteur, catégorie
- Recherches par dates (événements)
- Recherche textuelle full-text (noms, descriptions)
- Filtrage par statut premium
- Géolocalisation (latitude/longitude)

## En cas de problème

Si vous voyez une erreur disant que la table existe déjà :
1. Les tables existent probablement dans votre base de données
2. Le script utilise `CREATE TABLE IF NOT EXISTS`, donc il ne devrait pas y avoir d'erreur
3. Si vous voulez recommencer à zéro, supprimez d'abord les tables existantes :
   ```sql
   DROP TABLE IF EXISTS evenements_locaux CASCADE;
   DROP TABLE IF EXISTS entreprise CASCADE;
   ```
   Puis réexécutez le script complet.

## Prochaines Étapes

Une fois les tables créées :
1. ✅ Votre site web peut maintenant se connecter à Supabase
2. ✅ La page Loisirs affichera les événements et lieux
3. ✅ Les filtres fonctionneront (catégorie, ville, prix, etc.)
4. ✅ Les cartes de la Home redirigeront vers les bons filtres

## Ajouter Vos Propres Données

Pour ajouter vos propres lieux ou événements :

### Via l'Interface Supabase (Facile)
1. Allez dans **Table Editor**
2. Sélectionnez la table (`entreprise` ou `evenements_locaux`)
3. Cliquez sur **Insert row** (Insérer une ligne)
4. Remplissez les champs requis
5. Cliquez sur **Save** (Enregistrer)

### Via SQL (Avancé)
```sql
-- Exemple : Ajouter un restaurant
INSERT INTO entreprise (nom, ville, secteur, sous_categories, adresse, telephone, status)
VALUES ('Restaurant La Mer', 'Hammamet', 'loisir', 'Restaurant', 'Avenue de la Plage', '+216 XX XXX XXX', 'approved');

-- Exemple : Ajouter un événement
INSERT INTO evenements_locaux (titre, date_debut, date_fin, localisation_ville, localisation_region, type_evenement, prix, secteur_evenement, statut)
VALUES ('Festival de Musique', '2026-06-15', '2026-06-20', 'Sousse', 'Centre', 'Festival', 'Gratuit', 'loisir', 'actif');
```

## Support

Si vous avez des questions ou rencontrez des problèmes :
1. Vérifiez les logs dans l'éditeur SQL de Supabase
2. Consultez la documentation Supabase : https://supabase.com/docs
3. Les colonnes `nom` et `titre` sont obligatoires (NOT NULL)
4. Les dates doivent être au format ISO (YYYY-MM-DD)
