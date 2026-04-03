# Sitemap XML - Guide Rapide

## En 3 commandes

```bash
# 1. Générer le sitemap
npm run sitemap

# 2. Vérifier le sitemap
npm run sitemap:check

# 3. Soumettre à Google
npm run sitemap:submit
```

## URLs incluses (524 au total)

```
✅ 13 pages statiques
   - Accueil
   - Entreprises
   - Emploi
   - Santé
   - Loisirs
   - Services
   - etc.

✅ 495 fiches d'entreprises
   Format: /p/nom-entreprise-a1b2c3d4

✅ 5 événements locaux
   Format: /event/nom-evenement-a1b2c3d4

✅ 10 offres d'emploi
   Format: /job/titre-poste-a1b2c3d4

✅ 1 activité de loisirs
   Format: /loisir/nom-activite-a1b2c3d4
```

## Automatisation

Le sitemap se régénère automatiquement :

- À chaque `npm run build`
- Via l'Edge Function déployée
- Manuellement avec `npm run sitemap`

## Google Search Console

1. Allez sur https://search.google.com/search-console
2. Ajoutez : `https://dalil-tounes.com/sitemap.xml`
3. Attendez 24-48h pour l'indexation

## Priorités SEO

- **1.0** : Accueil
- **0.9** : Entreprises Premium
- **0.8** : Pages principales
- **0.7** : Entreprises normales, événements, emplois

## Fichiers

- `/public/sitemap.xml` - Sitemap généré
- `/public/robots.txt` - Configuration crawlers
- `/scripts/generate_sitemap.mjs` - Script de génération
- `/supabase/functions/regenerate-sitemap` - Edge Function

## Besoin d'aide ?

Consultez :
- `/docs/SITEMAP_SEO_GUIDE.md` - Guide complet
- `/docs/GOOGLE_SEARCH_CONSOLE_SETUP.md` - Configuration Google
- `SITEMAP_README.md` - Documentation principale
