# Sitemap XML Automatique - Dalil Tounes

## Résumé rapide

Votre sitemap XML est maintenant généré automatiquement et inclut toutes vos pages pour un meilleur référencement Google.

## Fichiers créés

- `/public/sitemap.xml` - Sitemap XML avec 524 URLs
- `/public/robots.txt` - Guide pour les moteurs de recherche
- `/scripts/generate_sitemap.mjs` - Script de génération automatique
- `/scripts/submit_sitemap_to_google.sh` - Soumission à Google/Bing
- `/supabase/functions/regenerate-sitemap/index.ts` - Edge Function déployée
- `/docs/SITEMAP_SEO_GUIDE.md` - Documentation complète

## Contenu du sitemap (524 URLs)

- 13 pages statiques (accueil, entreprises, emploi, etc.)
- 495 fiches d'entreprises (/p/nom-entreprise-id)
- 5 événements locaux (/event/nom-evenement-id)
- 10 offres d'emploi (/job/titre-poste-id)
- 1 activité de loisirs (/loisir/nom-activite-id)

## Utilisation

### Générer le sitemap manuellement

```bash
npm run sitemap
```

### Build avec génération automatique

```bash
npm run build
```

Le sitemap est automatiquement régénéré à chaque build.

### Soumettre à Google

```bash
./scripts/submit_sitemap_to_google.sh
```

Ou directement via URL :
```
https://www.google.com/ping?sitemap=https://dalil-tounes.com/sitemap.xml
```

### Edge Function (déployée)

Votre Edge Function est déjà déployée et accessible :
```
https://[votre-projet].supabase.co/functions/v1/regenerate-sitemap
```

Elle génère le sitemap à la demande depuis la base de données.

## Google Search Console

1. Allez sur https://search.google.com/search-console
2. Sélectionnez votre propriété Dalil Tounes
3. Menu : **Sitemaps**
4. Ajoutez : `https://dalil-tounes.com/sitemap.xml`
5. Cliquez sur **Soumettre**

Google va crawler vos 524 URLs dans les prochaines 24-48h.

## Priorités SEO

Le sitemap utilise des priorités intelligentes :

- **1.0** : Page d'accueil
- **0.9** : Pages principales + Entreprises Premium
- **0.8** : Pages citoyens
- **0.7** : Entreprises normales, événements, emplois
- **0.6** : Concept

## Automatisation

Le sitemap se met à jour automatiquement :
- À chaque `npm run build`
- Manuellement avec `npm run sitemap`
- Via l'Edge Function déployée

## Vérification

```bash
# Voir le sitemap
curl https://dalil-tounes.com/sitemap.xml | head -50

# Compter les URLs
curl -s https://dalil-tounes.com/sitemap.xml | grep -c "<loc>"
```

## Support

Consultez `/docs/SITEMAP_SEO_GUIDE.md` pour la documentation complète.

---

**Statut** : Opérationnel
**URLs** : 524
**Dernière génération** : Avril 2026
