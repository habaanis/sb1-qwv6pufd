# Guide de Déploiement sur Netlify

## Méthode 1 : Déploiement via CLI (Recommandé)

### Étape 1 : Connexion à Netlify
```bash
netlify login
```
Cette commande ouvrira votre navigateur pour vous authentifier.

### Étape 2 : Déploiement initial
```bash
netlify deploy --prod
```

Lors du premier déploiement, Netlify vous demandera :
- **Create & configure a new site** (choisir cette option)
- **Team** : Sélectionnez votre équipe
- **Site name** : Entrez un nom (ex: dalil-tounes)
- **Publish directory** : Entrez `dist`

### Étape 3 : Déploiements futurs
Pour les mises à jour futures, simplement :
```bash
npm run build
netlify deploy --prod
```

## Méthode 2 : Via l'interface Netlify (Drag & Drop)

1. Allez sur https://app.netlify.com/drop
2. Faites glisser le dossier `dist/` dans la zone de dépôt
3. Votre site sera déployé en quelques secondes !

## Méthode 3 : Via Git (Déploiement Continu)

### Étape 1 : Pousser vers GitHub
```bash
git init
git add .
git commit -m "Initial commit - Dalil Tounes"
git remote add origin <votre-repo-github>
git push -u origin main
```

### Étape 2 : Connecter à Netlify
1. Allez sur https://app.netlify.com
2. Cliquez sur "Add new site" > "Import an existing project"
3. Choisissez GitHub et sélectionnez votre repository
4. Configuration build :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
5. Cliquez sur "Deploy site"

## Variables d'Environnement

### Sur Netlify Dashboard :
1. Allez dans Site settings > Environment variables
2. Ajoutez les variables suivantes :

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

## Configuration du Domaine Personnalisé

### Après le déploiement :
1. Allez dans Site settings > Domain management
2. Cliquez sur "Add custom domain"
3. Entrez votre domaine (ex: dalil-tounes.tn)
4. Suivez les instructions pour configurer les DNS

### Configuration DNS recommandée :
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: <votre-site>.netlify.app
```

## Optimisations Incluses

✅ Cache optimisé pour les assets statiques (1 an)
✅ Headers de sécurité configurés
✅ Redirections SPA configurées
✅ Sitemap.xml accessible
✅ Robots.txt configuré
✅ Compression automatique (gzip/brotli)

## Commandes Utiles

```bash
# Voir le statut du site
netlify status

# Ouvrir le site dans le navigateur
netlify open

# Voir les logs de déploiement
netlify logs

# Déploiement de test (preview)
netlify deploy

# Déploiement en production
netlify deploy --prod
```

## Performance Attendue

Avec cette configuration, vous devriez obtenir :
- Lighthouse Score : 90-100
- First Contentful Paint : < 1.5s
- Time to Interactive : < 3s
- Total Bundle Size : ~2.1 MB (compressé)

## Support

En cas de problème :
1. Vérifiez les logs de build sur Netlify
2. Assurez-vous que les variables d'environnement sont configurées
3. Vérifiez que le build local fonctionne : `npm run build`

## Prochaines Étapes Recommandées

1. Configurer un domaine personnalisé
2. Activer le HTTPS automatique (inclus gratuitement)
3. Configurer les notifications de déploiement
4. Activer Analytics (optionnel)
5. Configurer les déploiements automatiques depuis Git
