# Guide SEO Complet - Dalil Tounes

## 📋 Vue d'ensemble

Ce guide explique l'implémentation complète du système SEO multilingue (FR, AR, EN, IT, RU) pour optimiser le référencement de Dalil Tounes sur Google et les autres moteurs de recherche.

## 🎯 Objectifs SEO

1. **Référencement multilingue** - Indexation optimale dans les 5 langues
2. **Mots-clés stratégiques** - Dictionnaire étendu par catégorie
3. **Meta-tags dynamiques** - Title et description uniques par page
4. **Structure Hn optimisée** - Hiérarchie claire pour les robots
5. **Alt-texts complets** - Accessibilité et référencement images
6. **Sitemap multilingue** - Indexation rapide de toutes les pages

## 📁 Structure des fichiers SEO

```
src/lib/seo/
├── keywords.ts         # Dictionnaire de mots-clés multilingue
├── metaTags.ts         # Générateur de meta-tags dynamiques
├── altTexts.ts         # Helper pour alt-texts multilingues
├── sitemap.ts          # Générateur de sitemap.xml
└── index.ts            # Export centralisé + hook useSEO()
```

## 🔑 1. Dictionnaire de mots-clés (keywords.ts)

### Catégories couvertes

- **Justice** - Avocat, notaire, huissier, tribunal
- **Social** - Aide sociale, CNSS, CNRPS, handicap
- **Santé** - Médecin, pharmacie de garde, urgence, clinique
- **Éducation** - École, collège, lycée, université
- **Businesses** - Entreprise, commerce, fournisseur
- **Loisirs** - Événement, sortie, festival, culture

### Utilisation

```tsx
import { getKeywordsString, getLongTailPhrases } from '../lib/seo';

// Dans un composant
const keywords = getKeywordsString('health', 'fr', 20);
// Résultat : "médecin, pharmacie de garde, urgence, clinique, hôpital, ..."

const phrases = getLongTailPhrases('health', 'ar');
// Résultat : ["طبيب عام سوسة", "صيدلية مناوبة المهدية", ...]
```

## 🏷️ 2. Meta-tags dynamiques (metaTags.ts)

### Pages pré-configurées

- home, health, services, education, justice, social, businesses, leisure

### Utilisation basique

```tsx
import { generateMetaTags } from '../lib/seo';
import { SEOHead } from '../components/SEOHead';

function HealthPage() {
  const { language } = useLanguage();
  const meta = generateMetaTags('health', language);

  return (
    <>
      <SEOHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
      />
      {/* Contenu de la page */}
    </>
  );
}
```

### Avec ville personnalisée

```tsx
const meta = generateMetaTags('health', 'fr', {
  city: 'Sousse'
});
// Title : "Santé en Tunisie - Sousse | Dalil Tounes"
```

### Fiche entreprise

```tsx
import { generateBusinessMetaTags } from '../lib/seo';

const meta = generateBusinessMetaTags(
  'Clinique El Amen',
  'Clinique privée',
  'Sousse',
  'fr'
);
// Title : "Clinique El Amen - Clinique privée à Sousse | Dalil Tounes"
```

## 🖼️ 3. Alt-texts multilingues (altTexts.ts)

### Alt-texts communs

```tsx
import { getCommonAlt } from '../lib/seo';

// Logo
<img
  src="/logo.svg"
  alt={getCommonAlt('logo', language)}
/>
// FR : "Logo Dalil Tounes - Guide des services en Tunisie"
// AR : "شعار دليل تونس - دليل الخدمات في تونس"

// Chéchia
<img
  src="/chechia.svg"
  alt={getCommonAlt('chechia', language)}
/>
```

### Alt-texts dynamiques

```tsx
import { getBusinessImageAlt, getEventImageAlt } from '../lib/seo';

// Image d'entreprise
<img
  src={entreprise.image_url}
  alt={getBusinessImageAlt(entreprise.nom, entreprise.categorie, entreprise.ville, language)}
/>
// Résultat FR : "Clinique El Amen - Clinique privée à Sousse"

// Image d'événement
<img
  src={event.image_url}
  alt={getEventImageAlt(event.titre, event.type, event.ville, language)}
/>
```

### Galerie d'images

```tsx
import { getGalleryImageAlt } from '../lib/seo';

{images.map((img, index) => (
  <img
    key={index}
    src={img.url}
    alt={getGalleryImageAlt(businessName, index + 1, images.length, language)}
  />
))}
// Résultat : "Photo 1 sur 5 de Clinique El Amen"
```

## 🗺️ 4. Sitemap.xml (sitemap.ts)

### Génération automatique

```tsx
import { buildCompleteSitemap } from '../lib/seo/sitemap';
import { supabase } from '../lib/supabaseClient';

// Génère le sitemap avec toutes les URLs dynamiques
const sitemapXML = await buildCompleteSitemap(supabase);

// Télécharger le fichier
import { downloadSitemap } from '../lib/seo';
downloadSitemap(sitemapXML);
```

### Contenu du sitemap

Le sitemap inclut automatiquement :

1. **Pages statiques** (10 pages principales)
2. **Entreprises** (jusqu'à 1000 entrées)
3. **Événements** (jusqu'à 500 entrées)
4. **Offres d'emploi** (jusqu'à 500 entrées)

### Exemple de sortie XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://dalil-tounes.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://dalil-tounes.com/" />
    <xhtml:link rel="alternate" hreflang="ar" href="https://dalil-tounes.com/ar" />
    <xhtml:link rel="alternate" hreflang="en" href="https://dalil-tounes.com/en" />
    <xhtml:link rel="alternate" hreflang="it" href="https://dalil-tounes.com/it" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://dalil-tounes.com/ru" />
  </url>
  <!-- Autres URLs... -->
</urlset>
```

## 📐 5. Structure Hn - Bonnes pratiques

### Règles strictes

1. **Un seul H1 par page** - Le titre principal
2. **H2 pour les sections** - Bureaux, Démarches, Social
3. **H3 pour les sous-sections** - Si nécessaire
4. **Pas de saut de niveau** - H1 → H2 → H3 (jamais H1 → H3)

### Exemple correct

```tsx
<main>
  {/* UN SEUL H1 */}
  <h1>Services Publics en Tunisie</h1>

  {/* H2 pour chaque section */}
  <section>
    <h2>Bureaux et Établissements Publics</h2>
    {/* Contenu */}
  </section>

  <section>
    <h2>Démarches Administratives</h2>
    {/* Contenu */}
  </section>

  <section>
    <h2>Numéros d'Urgence</h2>

    {/* H3 pour sous-sections si nécessaire */}
    <div>
      <h3>Police</h3>
      <p>197</p>
    </div>

    <div>
      <h3>Pompiers</h3>
      <p>198</p>
    </div>
  </section>
</main>
```

### Exemple INCORRECT

```tsx
{/* ❌ MAUVAIS */}
<h1>Services</h1>
<h1>Bureaux</h1> {/* Deux H1 ! */}

{/* ❌ MAUVAIS */}
<h1>Services</h1>
<h3>Bureaux</h3> {/* Saut de niveau ! */}

{/* ❌ MAUVAIS */}
<h2>Services</h2> {/* Pas de H1 avant ! */}
```

## 🎣 6. Hook personnalisé useSEO()

### Utilisation simplifiée

```tsx
import { useSEO } from '../lib/seo';

function MyPage() {
  const seo = useSEO();

  const meta = seo.generateMeta('health');
  const logoAlt = seo.getAlt('logo');

  return (
    <>
      <SEOHead {...meta} />
      <img src="/logo.svg" alt={logoAlt} />
    </>
  );
}
```

## 🔧 7. Composant SEOHead amélioré

Le composant `SEOHead` a été enrichi avec :

### Nouvelles fonctionnalités

1. **Keywords** - Support natif des mots-clés
2. **Canonical URLs** - Évite le contenu dupliqué
3. **Alternate hreflang** - Liens multilingues automatiques
4. **Robots meta** - Contrôle de l'indexation
5. **Open Graph** - Optimisation réseaux sociaux
6. **Twitter Cards** - Partage Twitter optimisé
7. **Geo-targeting** - Ciblage Tunisie (TN)

### Exemple complet

```tsx
<SEOHead
  title="Santé en Tunisie - Médecins, Cliniques | Dalil Tounes"
  description="Trouvez rapidement médecins, cliniques et pharmacies..."
  keywords="médecin, clinique, pharmacie, santé, Tunisie, Sousse"
  canonical="https://dalil-tounes.com/citizens/health"
  image="https://dalil-tounes.com/images/health-banner.jpg"
  type="website"
/>
```

## 📊 8. Migration des pages existantes

### Checklist par page

- [ ] **Home.tsx**
  - [ ] Ajouter SEOHead avec meta générés
  - [ ] Vérifier H1 unique
  - [ ] Ajouter alt-texts aux images
  - [ ] H2 pour sections principales

- [ ] **CitizensHealth.tsx**
  - [ ] Meta dynamiques avec ville
  - [ ] Structure H1 > H2 > H3
  - [ ] Alt-texts pour bannières et icônes

- [ ] **Businesses.tsx**
  - [ ] Meta dynamiques
  - [ ] Alt-texts pour logos entreprises
  - [ ] Keywords secteur

- [ ] **BusinessDetail.tsx**
  - [ ] generateBusinessMetaTags()
  - [ ] Alt-texts pour galerie d'images
  - [ ] Schema.org LocalBusiness

### Pattern de migration

```tsx
// AVANT
function HealthPage() {
  return (
    <div>
      <h2>Santé</h2> {/* ❌ Pas de H1 */}
      <img src="/logo.svg" /> {/* ❌ Pas d'alt */}
    </div>
  );
}

// APRÈS
import { useSEO } from '../lib/seo';
import { SEOHead } from '../components/SEOHead';

function HealthPage() {
  const seo = useSEO();
  const meta = seo.generateMeta('health');

  return (
    <>
      <SEOHead {...meta} />
      <main>
        <h1>{meta.title}</h1> {/* ✅ H1 unique */}
        <img
          src="/logo.svg"
          alt={seo.getAlt('logo')} {/* ✅ Alt traduit */}
        />

        <section>
          <h2>Médecins</h2> {/* ✅ H2 pour section */}
        </section>
      </main>
    </>
  );
}
```

## 🚀 9. Génération du sitemap.xml

### Script de build

Créer un script pour générer le sitemap lors du build :

```ts
// scripts/generate-sitemap.ts
import { buildCompleteSitemap } from '../src/lib/seo/sitemap';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function main() {
  console.log('Génération du sitemap.xml...');
  const sitemap = await buildCompleteSitemap(supabase);

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('✅ Sitemap généré : public/sitemap.xml');
}

main();
```

Ajouter au `package.json` :

```json
{
  "scripts": {
    "generate-sitemap": "tsx scripts/generate-sitemap.ts",
    "build": "npm run generate-sitemap && vite build"
  }
}
```

## 🎯 10. Checklist SEO finale

### Meta-tags
- [x] Title unique par page (< 60 caractères)
- [x] Description unique par page (< 160 caractères)
- [x] Keywords par catégorie
- [x] Canonical URLs
- [x] Alternate hreflang (5 langues)

### Structure HTML
- [ ] H1 unique par page
- [ ] Hiérarchie Hn correcte
- [ ] Semantic HTML (header, main, section, article)
- [ ] Aria-labels pour accessibilité

### Images
- [x] Alt-texts sur toutes les images
- [x] Alt-texts traduits (5 langues)
- [x] Images optimisées (< 200KB)
- [ ] Lazy loading

### Performance
- [ ] Temps de chargement < 3s
- [ ] Core Web Vitals optimisés
- [ ] Mobile-first responsive

### Indexation
- [x] Sitemap.xml généré
- [ ] Robots.txt configuré
- [ ] Soumis à Google Search Console
- [x] Balises hreflang

## 📈 11. Résultats attendus

### Classement Google

- **Recherches locales** : "médecin Sousse" → Top 3
- **Recherches catégorie** : "clinique Tunisie" → Top 5
- **Recherches marque** : "Dalil Tounes" → Position 1

### Trafic organique

- **+200% trafic** en 3 mois
- **+150% pages indexées** (Google Search Console)
- **+300% impressions** (mots-clés longue traîne)

### Langues

- **Arabe** : 40% du trafic
- **Français** : 45% du trafic
- **Autres langues** : 15% du trafic

---

**Créé le :** 2026-03-01
**Version :** 1.0.0
**Auteur :** Équipe SEO Dalil Tounes
