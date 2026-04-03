# Guide d'intégration Google Search Console

## Étape 1 : Vérifier votre site

### Option A : Vérification par balise HTML

Ajoutez cette balise dans le `<head>` de votre site :

```html
<meta name="google-site-verification" content="VOTRE_CODE_ICI" />
```

Le code vous sera fourni par Google Search Console.

### Option B : Vérification par fichier

Téléchargez le fichier de vérification Google et placez-le dans `/public/`

### Option C : Vérification DNS

Ajoutez un enregistrement TXT dans votre DNS avec le code fourni par Google.

---

## Étape 2 : Soumettre le sitemap

1. Connectez-vous à [Google Search Console](https://search.google.com/search-console)
2. Sélectionnez votre propriété **dalil-tounes.com**
3. Dans le menu latéral, cliquez sur **Sitemaps**
4. Dans le champ "Ajouter un sitemap", entrez : `sitemap.xml`
5. Cliquez sur **Envoyer**

### URL complète du sitemap
```
https://dalil-tounes.com/sitemap.xml
```

---

## Étape 3 : Soumettre aussi à Bing

1. Allez sur [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Ajoutez votre site
3. Soumettez le sitemap : `https://dalil-tounes.com/sitemap.xml`

### Soumission automatique (optionnel)

```bash
./scripts/submit_sitemap_to_google.sh
```

---

## Étape 4 : Surveiller l'indexation

### Délais typiques

- **Première découverte** : 24-48 heures
- **Indexation complète** : 1-2 semaines
- **Mise à jour régulière** : 3-7 jours

### Vérifier le statut dans Search Console

1. **Couverture** : Voir les pages indexées/non indexées
2. **Performances** : Voir les clics et impressions
3. **Sitemaps** : Voir le nombre d'URLs soumises/indexées

### Commandes de vérification

```bash
# Vérifier si Google a lu le sitemap
site:dalil-tounes.com

# Vérifier une URL spécifique
site:dalil-tounes.com/p/votre-entreprise

# Forcer Google à recrawler une page (dans Search Console)
Inspection d'URL > Demander une indexation
```

---

## Étape 5 : Optimisations supplémentaires

### A. Robots.txt

Votre `robots.txt` est déjà configuré et pointe vers le sitemap.

URL : `https://dalil-tounes.com/robots.txt`

### B. Ajouter des métadonnées structurées

Chaque fiche entreprise devrait avoir des données Schema.org :

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Nom de l'entreprise",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tunis",
    "addressCountry": "TN"
  },
  "telephone": "+216...",
  "url": "https://dalil-tounes.com/p/entreprise"
}
```

### C. Open Graph pour les réseaux sociaux

```html
<meta property="og:title" content="Nom de l'entreprise" />
<meta property="og:description" content="Description courte" />
<meta property="og:image" content="https://dalil-tounes.com/images/entreprise.jpg" />
<meta property="og:url" content="https://dalil-tounes.com/p/entreprise" />
<meta property="og:type" content="business.business" />
```

### D. Balises hreflang (multilingue)

Pour chaque page avec plusieurs langues :

```html
<link rel="alternate" hreflang="fr" href="https://dalil-tounes.com/p/entreprise" />
<link rel="alternate" hreflang="ar" href="https://dalil-tounes.com/ar/p/entreprise" />
<link rel="alternate" hreflang="en" href="https://dalil-tounes.com/en/p/entreprise" />
```

---

## Étape 6 : Maintenance régulière

### Régénérer le sitemap

Le sitemap se régénère automatiquement :
- À chaque `npm run build`
- Manuellement avec `npm run sitemap`

### Soumettre les mises à jour

```bash
# Option 1 : Script automatique
./scripts/submit_sitemap_to_google.sh

# Option 2 : Ping manuel
curl "https://www.google.com/ping?sitemap=https://dalil-tounes.com/sitemap.xml"
```

### Fréquence recommandée

- **Nouveau contenu** : Immédiatement
- **Mises à jour** : Hebdomadaire
- **Vérification** : Mensuelle

---

## Étape 7 : Métriques à surveiller

### Dans Google Search Console

| Métrique | Objectif | Fréquence |
|----------|----------|-----------|
| Pages indexées | 500+ | Hebdomadaire |
| Erreurs d'exploration | 0 | Quotidien |
| Clics organiques | +20% / mois | Mensuel |
| Impressions | +50% / mois | Mensuel |
| Position moyenne | <10 | Mensuel |

### Requêtes de recherche populaires

Surveillez dans **Performances > Requêtes** :
- Quels mots-clés apportent du trafic
- Position moyenne par requête
- Taux de clics (CTR)

---

## Étape 8 : Résolution des problèmes courants

### Problème : URLs non indexées

**Causes possibles :**
1. Sitemap non soumis
2. Robots.txt bloque les URLs
3. Pages avec erreurs 404
4. Contenu dupliqué

**Solutions :**
```bash
# Vérifier le sitemap
curl https://dalil-tounes.com/sitemap.xml

# Vérifier robots.txt
curl https://dalil-tounes.com/robots.txt

# Forcer l'indexation dans Search Console
Inspection d'URL > Demander une indexation
```

### Problème : Sitemap avec des erreurs

**Erreurs courantes :**
- URLs en 404
- URLs redirigées (301/302)
- URLs bloquées par robots.txt

**Solution :**
Régénérez le sitemap :
```bash
npm run sitemap
```

### Problème : Indexation lente

**Causes :**
1. Site nouveau
2. Peu de backlinks
3. Faible fréquence de mise à jour

**Solutions :**
- Publiez du contenu régulièrement
- Partagez sur les réseaux sociaux
- Créez des backlinks de qualité
- Soumettez manuellement les URLs importantes

---

## Outils utiles

### Vérificateurs de sitemap en ligne

- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [Google Search Console - Test de sitemap](https://search.google.com/search-console)

### Vérificateurs de balises structurées

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### Outils de suivi SEO

- Google Search Console (gratuit)
- Google Analytics (gratuit)
- Bing Webmaster Tools (gratuit)

---

## Checklist finale

- [ ] Site vérifié dans Google Search Console
- [ ] Sitemap soumis à Google
- [ ] Sitemap soumis à Bing
- [ ] Robots.txt configuré correctement
- [ ] Métadonnées Schema.org ajoutées
- [ ] Open Graph configuré
- [ ] Surveillance configurée (hebdomadaire)
- [ ] Script de régénération testé
- [ ] Edge Function déployée

---

## Contact et support

Pour toute question :
1. Consultez `/docs/SITEMAP_SEO_GUIDE.md` pour plus de détails
2. Vérifiez les logs de génération du sitemap
3. Testez l'Edge Function manuellement

**Sitemap actuel** : 524 URLs indexables
**Dernière mise à jour** : Avril 2026
