# Configuration de l'Authentification - Mode Accès Direct

## Vue d'ensemble

L'authentification a été configurée en mode "Accès Direct" pour offrir une expérience utilisateur fluide :

- **Inscription instantanée** : Les utilisateurs sont automatiquement connectés après inscription
- **Pas de confirmation email** : Aucune vérification par email nécessaire
- **Redirection automatique** : Accès immédiat au tableau de bord approprié
- **Création automatique du profil** : Un profil est créé automatiquement lors de l'inscription

## Configuration requise dans Supabase Dashboard

Pour activer le mode auto-confirmation, suivez ces étapes :

### 1. Accédez à votre projet Supabase

1. Connectez-vous à [https://supabase.com](https://supabase.com)
2. Sélectionnez votre projet "Dalil Tounes"

### 2. Désactivez la confirmation par email

1. Allez dans **Authentication** (menu de gauche)
2. Cliquez sur **Settings** (ou **Providers**)
3. Trouvez la section **Email Auth**
4. Désactivez l'option **Enable email confirmations** (ou **Confirm email**)
5. Cliquez sur **Save** pour enregistrer

### Configuration alternative via SQL (si nécessaire)

Si vous préférez configurer via SQL, exécutez cette commande dans l'éditeur SQL de Supabase :

```sql
-- Désactiver la confirmation email pour les nouveaux utilisateurs
UPDATE auth.config
SET value = 'false'
WHERE parameter = 'enable_signup';

-- OU via les métadonnées du projet
UPDATE auth.config
SET value = 'false'
WHERE parameter = 'email_confirm_required';
```

**Note** : Cette approche est moins recommandée, utilisez de préférence l'interface Dashboard.

## Fonctionnalités implémentées

### 1. Pages d'authentification

- **`/src/pages/Auth.tsx`** : Page principale d'authentification
- **Routes** : `#/auth`, `#/connexion`, `#/inscription`

### 2. Composants

- **`SignupForm`** : Formulaire d'inscription avec choix Candidat/Entreprise
- **`LoginForm`** : Formulaire de connexion
- **`AuthContext`** : Contexte React pour gérer l'état d'authentification

### 3. Dashboards

- **`CandidateDashboard`** : Tableau de bord pour les candidats
  - Route : `#/dashboard/candidat`
  - Fonctionnalités : Profil, Candidatures, Paramètres

- **`CompanyDashboard`** : Tableau de bord pour les entreprises
  - Route : `#/dashboard/entreprise`
  - Fonctionnalités : Offres d'emploi, Candidats, Paramètres

### 4. Trigger automatique

Un trigger PostgreSQL a été créé pour automatiser la création du profil :

- **Table `candidates`** : Pour les utilisateurs de type "candidat"
- **Table `profiles`** : Pour tous les utilisateurs (base commune)

Le trigger s'exécute automatiquement après chaque inscription (`INSERT` sur `auth.users`).

## Flux d'inscription

1. **Utilisateur visite** `#/auth`
2. **Sélectionne son type** : Candidat ou Entreprise
3. **Remplit le formulaire** : Email + Mot de passe (min 6 caractères)
4. **Clique sur "S'inscrire"**
5. **Connexion automatique** : L'utilisateur est immédiatement connecté
6. **Création du profil** : Le trigger crée automatiquement la ligne dans `candidates` ou `profiles`
7. **Redirection** : Vers le dashboard approprié
8. **Message de bienvenue** : "Bienvenue sur Dalil Tounes !" (5 secondes)

## Flux de connexion

1. **Utilisateur visite** `#/auth` et clique sur "Se connecter"
2. **Entre ses identifiants** : Email + Mot de passe
3. **Clique sur "Se connecter"**
4. **Connexion** : Vérification des credentials
5. **Détection du type** : Candidat ou Entreprise (via `localStorage` ou requête DB)
6. **Redirection** : Vers le dashboard approprié

## Sécurité

- **Validation du mot de passe** : Minimum 6 caractères (requis par Supabase)
- **RLS activé** : Les politiques Row Level Security sont en place sur toutes les tables
- **Politiques d'accès** :
  - Candidats : Peuvent voir/modifier uniquement leur propre profil
  - Entreprises : Peuvent voir/modifier uniquement leurs propres offres
  - Lecture publique limitée aux profils publics et offres actives

## Tables affectées

### Table `candidates`
- Nouvelle colonne ajoutée : `created_by` (uuid)
- Trigger crée une ligne automatiquement pour les candidats

### Table `profiles`
- Utilisée comme table commune pour tous les utilisateurs
- Contient les informations de base (email, role, is_premium)

## Routes disponibles

| Route | Description |
|-------|-------------|
| `#/auth` | Page d'authentification (inscription/connexion) |
| `#/connexion` | Alias vers la page d'authentification |
| `#/inscription` | Alias vers la page d'authentification |
| `#/dashboard/candidat` | Tableau de bord candidat |
| `#/dashboard/entreprise` | Tableau de bord entreprise |

## Tests à effectuer

1. **Inscription candidat** :
   - Aller sur `#/auth`
   - Sélectionner "Candidat"
   - S'inscrire avec email + mot de passe
   - Vérifier redirection vers `#/dashboard/candidat`
   - Vérifier message de bienvenue
   - Vérifier ligne créée dans `candidates`

2. **Inscription entreprise** :
   - Aller sur `#/auth`
   - Sélectionner "Entreprise"
   - S'inscrire avec email + mot de passe
   - Vérifier redirection vers `#/dashboard/entreprise`
   - Vérifier message de bienvenue
   - Vérifier ligne créée dans `profiles`

3. **Connexion** :
   - Se déconnecter
   - Cliquer sur "Se connecter"
   - Entrer les identifiants
   - Vérifier redirection vers le bon dashboard

4. **Sécurité RLS** :
   - En tant que candidat, essayer d'accéder aux données d'un autre candidat
   - Vérifier que l'accès est bloqué
   - Vérifier que seules les données personnelles sont accessibles

## Dépannage

### Erreur "Email not confirmed"

Si vous voyez cette erreur, c'est que la confirmation email est toujours activée :
1. Allez dans Supabase Dashboard > Authentication > Settings
2. Désactivez "Enable email confirmations"
3. Réessayez l'inscription

### Profil non créé automatiquement

Vérifiez que le trigger est bien actif :
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Si le trigger n'existe pas, exécutez la migration :
```bash
# La migration a déjà été appliquée lors de la configuration
# Si besoin de la réappliquer, vérifiez les migrations dans supabase/migrations/
```

### Redirection vers mauvais dashboard

Le type d'utilisateur est stocké dans `localStorage` avec la clé `userType_{userId}`.
Si la redirection est incorrecte :
1. Ouvrez la console du navigateur
2. Tapez : `localStorage.clear()`
3. Reconnectez-vous

## Support

Pour toute question ou problème, consultez :
- Documentation Supabase Auth : https://supabase.com/docs/guides/auth
- Code source : `src/context/AuthContext.tsx`
