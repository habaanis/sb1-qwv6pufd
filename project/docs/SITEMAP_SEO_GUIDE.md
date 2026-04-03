# Guide Complet - Sitemap XML et SEO pour Dalil Tounes

## Vue d'ensemble

Ce système génère automatiquement un sitemap.xml complet pour améliorer le référencement Google Search Console.

## Fichiers créés

### 1. `/public/sitemap.xml` (généré automatiquement)
Le fichier sitemap principal qui liste toutes les URLs du site.

### 2. `/public/robots.txt` (mis à jour)
Guide les moteurs de recherche et pointe vers le sitemap.

### 3. `/scripts/generate_sitemap.mjs`
Script Node.js qui génère le sitemap en scannant Supabase.

### 4. `/supabase/functions/regenerate-sitemap/index.ts`
Edge Function pour régénérer le sitemap à la demande.

---

## Utilisation

### Génération manuelle du sitemap

```bash
npm run sitemap
```

Cette commande :
- Se connecte à Supabase
- Récupère toutes les entreprises, événements, emplois
- Génère `/public/sitemap.xml`
- Affiche un résumé dans la console

### Génération automatique lors du build

```bash
npm run build
```

Le sitemap est automatiquement régénéré avant chaque build de production.

### Régénération via Edge Function

L'Edge Function peut être appelée pour régénérer le sitemap à la demande :

```bash
curl https://[VOTRE-PROJET].supabase.co/functions/v1/regenerate-sitemap
```

---

## Structure du Sitemap

### Pages Statiques (13 pages)
```
- Accueil (/)
- Entreprises (/businesses)
- Emploi (/jobs)
- Santé (/citizens/health)
- Loisirs (/citizens/leisure)
- Administration (/citizens/admin)
- Magasins (/citizens/shops)
- Services (/citizens/services)
- Éducation (/education)
- Événements Culture (/culture-events)
- Abonnements (/subscription)
- Concept (/concept)
- Autour de moi (/around-me)
```

### Pages Dynamiques

#### Entreprises
Format : `/p/{slug}-{id}`
- Exemple : `/p/cafe-restaurant-etoile-a1b2c3d4`
- Priorité basée sur le tier :
  - Elite : 0.9
  - Pro : 0.8
  - Basique : 0.7
  - Autres : 0.6
- Changefreq : weekly
- Limite : 5000 entreprises

#### Événements Locaux
Format : `/event/{slug}-{id}`
- Exemple : `/event/festival-carthage-a1b2c3d4`
- Priorité : 0.7
- Changefreq : weekly
- Limite : 1000 événements

#### Offres d'Emploi
Format : `/job/{slug}-{id}`
- Exemple : `/job/developpeur-web-senior-a1b2c3d4`
- Priorité : 0.7
- Changefreq : weekly
- Limite : 1000 offres

#### Événements Culturels
Format : `/culture/{slug}-{id}`
- Exemple : `/culture/exposition-art-moderne-a1b2c3d4`
- Priorité : 0.7
- Changefreq : weekly
- Limite : 1000 événements

---

## Robots.txt

Le fichier `/public/robots.txt` a été optimisé :

```
User-agent: *
Allow: /

# Pages bloquées
Disallow: /admin-sourcing
Disallow: /admin
Disallow: /sourcing
Disallow: /auth
Disallow: /dashboard
Disallow: /debug

# Pages autorisées
Allow: /businesses
Allow: /p/
Allow: /event/
Allow: /job/
Allow: /culture/

# Sitemap
Sitemap: https://dalil-tounes.com/sitemap.xml
```

---

## Intégration Google Search Console

### 1. Soumettre le sitemap

1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Sélectionnez votre propriété Dalil Tounes
3. Menu : **Sitemaps**
4. Entrez : `https://dalil-tounes.com/sitemap.xml`
5. Cliquez sur **Soumettre**

### 2. Vérifier le statut

Google va :
- Télécharger le sitemap
- Analyser les URLs
- Commencer l'indexation (24-48h)

### 3. Surveiller l'indexation

Dans Search Console :
- **Couverture** : voir les pages indexées/non indexées
- **Performances** : voir les clics et impressions
- **Sitemaps** : voir le statut du sitemap

---

## Automatisation

### Option 1 : Trigger lors d'une inscription

Créer un trigger Supabase qui appelle l'Edge Function quand un nouveau professionnel s'inscrit :

```sql
CREATE OR REPLACE FUNCTION trigger_regenerate_sitemap()
RETURNS trigger AS $$
BEGIN
  -- Appeler l'Edge Function
  PERFORM net.http_post(
    url := 'https://[VOTRE-PROJET].supabase.co/functions/v1/regenerate-sitemap',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_entreprise_insert
AFTER INSERT ON entreprise
FOR EACH ROW
EXECUTE FUNCTION trigger_regenerate_sitemap();
```

### Option 2 : Cron Job

Configurer un cron job pour régénérer le sitemap quotidiennement :

```bash
# Crontab pour régénérer à 3h du matin
0 3 * * * cd /path/to/dalil-tounes && npm run sitemap
```

### Option 3 : GitHub Actions

Créer `.github/workflows/sitemap.yml` :

```yaml
name: Generate Sitemap
on:
  schedule:
    - cron: '0 3 * * *'  # 3h du matin chaque jour
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run sitemap
      - run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add public/sitemap.xml
          git commit -m "Update sitemap.xml"
          git push
```

---

## Monitoring et Maintenance

### Vérifier le sitemap

```bash
# Télécharger et vérifier
curl https://dalil-tounes.com/sitemap.xml

# Compter les URLs
curl -s https://dalil-tounes.com/sitemap.xml | grep -c "<loc>"
```

### Tester avec Google

```
https://www.google.com/ping?sitemap=https://dalil-tounes.com/sitemap.xml
```

### Vérifier les erreurs

- Search Console > Sitemaps > Voir les erreurs
- Erreurs courantes :
  - URLs en erreur 404
  - URLs bloquées par robots.txt
  - URLs avec redirections

---

## Optimisations SEO supplémentaires

### 1. Meta tags dans les pages
Chaque page dynamique devrait avoir :
```html
<title>{Nom de l'entreprise} - Dalil Tounes</title>
<meta name="description" content="{Description courte}">
<link rel="canonical" href="https://dalil-tounes.com/p/{slug}">
```

### 2. Schema.org JSON-LD
Ajouter des données structurées pour les entreprises :
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Nom de l'entreprise",
  "address": {...},
  "telephone": "+216...",
  "url": "https://dalil-tounes.com/p/{slug}"
}
```

### 3. Open Graph pour les réseaux sociaux
```html
<meta property="og:title" content="{Nom}">
<meta property="og:description" content="{Description}">
<meta property="og:image" content="{Image}">
<meta property="og:url" content="https://dalil-tounes.com/p/{slug}">
```

---

## FAQ

### Q : À quelle fréquence dois-je régénérer le sitemap ?
**R :** Idéalement, régénérez le sitemap :
- Après chaque nouvelle inscription d'entreprise
- Une fois par jour (via cron)
- Avant chaque déploiement

### Q : Combien de temps pour que Google indexe mes pages ?
**R :**
- Pages prioritaires (home, catégories) : 1-3 jours
- Pages entreprises : 1-2 semaines
- Pages moins importantes : 2-4 semaines

### Q : Puis-je avoir plusieurs sitemaps ?
**R :** Oui ! Si vous avez plus de 50 000 URLs, créez un sitemap index :
```xml
<sitemapindex>
  <sitemap>
    <loc>https://dalil-tounes.com/sitemap-businesses.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://dalil-tounes.com/sitemap-events.xml</loc>
  </sitemap>
</sitemapindex>
```

### Q : Comment exclure certaines entreprises du sitemap ?
**R :** Modifiez la requête dans `generate_sitemap.mjs` :
```javascript
.select('id, nom, updated_at, subscription_tier')
.neq('status', 'draft') // Exclure les brouillons
.eq('is_visible', true) // Uniquement les visibles
```

---

## Support et Logs

### Logs de génération

Le script affiche :
```
🚀 Génération du sitemap.xml en cours...
📄 Ajout des pages statiques...
✓ 13 pages statiques ajoutées
🏢 Récupération des entreprises...
✓ 1247 entreprises ajoutées
🎉 Récupération des événements locaux...
✓ 342 événements ajoutés
💼 Récupération des offres d'emploi...
✓ 156 offres d'emploi ajoutées
🎭 Récupération des événements culturels...
✓ 89 événements culturels ajoutés
✅ Sitemap généré avec succès!
```

### En cas d'erreur

Vérifiez :
1. Variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
2. Connexion Supabase
3. Permissions sur le dossier `/public`
4. Structure des tables Supabase

---

## Résumé des commandes

```bash
# Générer le sitemap
npm run sitemap

# Build avec sitemap
npm run build

# Vérifier le sitemap
curl https://dalil-tounes.com/sitemap.xml | head -50

# Soumettre à Google
https://www.google.com/ping?sitemap=https://dalil-tounes.com/sitemap.xml
```

---

**Dernière mise à jour** : Avril 2026
**Auteur** : Équipe Dalil Tounes
**Version** : 1.0.0
