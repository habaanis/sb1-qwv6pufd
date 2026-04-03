/**
 * Générateur de sitemap.xml multilingue
 * Pour améliorer l'indexation Google
 */

import { Language } from '../i18n';

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: { lang: Language; href: string }[];
}

/**
 * Pages statiques du site avec leurs configurations SEO
 */
export const staticPages: SitemapURL[] = [
  {
    loc: '/',
    changefreq: 'daily',
    priority: 1.0,
    alternates: [
      { lang: 'fr', href: 'https://dalil-tounes.com/' },
      { lang: 'ar', href: 'https://dalil-tounes.com/ar' },
      { lang: 'en', href: 'https://dalil-tounes.com/en' },
      { lang: 'it', href: 'https://dalil-tounes.com/it' },
      { lang: 'ru', href: 'https://dalil-tounes.com/ru' }
    ]
  },
  {
    loc: '/businesses',
    changefreq: 'daily',
    priority: 0.9,
    alternates: [
      { lang: 'fr', href: 'https://dalil-tounes.com/businesses' },
      { lang: 'ar', href: 'https://dalil-tounes.com/ar/businesses' },
      { lang: 'en', href: 'https://dalil-tounes.com/en/businesses' },
      { lang: 'it', href: 'https://dalil-tounes.com/it/businesses' },
      { lang: 'ru', href: 'https://dalil-tounes.com/ru/businesses' }
    ]
  },
  {
    loc: '/citizens/health',
    changefreq: 'weekly',
    priority: 0.8,
    alternates: [
      { lang: 'fr', href: 'https://dalil-tounes.com/citizens/health' },
      { lang: 'ar', href: 'https://dalil-tounes.com/ar/citizens/health' },
      { lang: 'en', href: 'https://dalil-tounes.com/en/citizens/health' },
      { lang: 'it', href: 'https://dalil-tounes.com/it/citizens/health' },
      { lang: 'ru', href: 'https://dalil-tounes.com/ru/citizens/health' }
    ]
  },
  {
    loc: '/citizens/admin',
    changefreq: 'weekly',
    priority: 0.8,
    alternates: [
      { lang: 'fr', href: 'https://dalil-tounes.com/citizens/admin' },
      { lang: 'ar', href: 'https://dalil-tounes.com/ar/citizens/admin' },
      { lang: 'en', href: 'https://dalil-tounes.com/en/citizens/admin' },
      { lang: 'it', href: 'https://dalil-tounes.com/it/citizens/admin' },
      { lang: 'ru', href: 'https://dalil-tounes.com/ru/citizens/admin' }
    ]
  },
  {
    loc: '/citizens/social',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    loc: '/education',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    loc: '/citizens/leisure',
    changefreq: 'daily',
    priority: 0.8
  },
  {
    loc: '/jobs',
    changefreq: 'daily',
    priority: 0.8
  },
  {
    loc: '/subscription',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    loc: '/concept',
    changefreq: 'monthly',
    priority: 0.6
  }
];

/**
 * Génère le XML pour une URL
 */
function generateURLElement(url: SitemapURL): string {
  let xml = '  <url>\n';
  xml += `    <loc>https://dalil-tounes.com${url.loc}</loc>\n`;

  if (url.lastmod) {
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
  }

  if (url.changefreq) {
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
  }

  if (url.priority !== undefined) {
    xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
  }

  // Alternates hreflang
  if (url.alternates && url.alternates.length > 0) {
    url.alternates.forEach(alt => {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />\n`;
    });
  }

  xml += '  </url>\n';
  return xml;
}

/**
 * Génère le sitemap.xml complet
 */
export function generateSitemap(dynamicUrls: SitemapURL[] = []): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  // Pages statiques
  staticPages.forEach(page => {
    xml += generateURLElement(page);
  });

  // URLs dynamiques (entreprises, événements, etc.)
  dynamicUrls.forEach(url => {
    xml += generateURLElement(url);
  });

  xml += '</urlset>';
  return xml;
}

/**
 * Génère des URLs dynamiques pour les entreprises
 */
export function generateBusinessURLs(
  businesses: Array<{ id: string; nom: string; ville: string; updated_at?: string }>
): SitemapURL[] {
  return businesses.map(business => ({
    loc: `/business/${business.id}`,
    lastmod: business.updated_at || new Date().toISOString().split('T')[0],
    changefreq: 'weekly' as const,
    priority: 0.7,
    alternates: [
      { lang: 'fr', href: `https://dalil-tounes.com/business/${business.id}` },
      { lang: 'ar', href: `https://dalil-tounes.com/ar/business/${business.id}` },
      { lang: 'en', href: `https://dalil-tounes.com/en/business/${business.id}` },
      { lang: 'it', href: `https://dalil-tounes.com/it/business/${business.id}` },
      { lang: 'ru', href: `https://dalil-tounes.com/ru/business/${business.id}` }
    ]
  }));
}

/**
 * Génère des URLs dynamiques pour les événements
 */
export function generateEventURLs(
  events: Array<{ id: string; titre: string; ville: string; created_at?: string }>
): SitemapURL[] {
  return events.map(event => ({
    loc: `/event/${event.id}`,
    lastmod: event.created_at || new Date().toISOString().split('T')[0],
    changefreq: 'weekly' as const,
    priority: 0.6
  }));
}

/**
 * Génère des URLs dynamiques pour les offres d'emploi
 */
export function generateJobURLs(
  jobs: Array<{ id: string; titre_poste: string; ville: string; created_at?: string }>
): SitemapURL[] {
  return jobs.map(job => ({
    loc: `/job/${job.id}`,
    lastmod: job.created_at || new Date().toISOString().split('T')[0],
    changefreq: 'weekly' as const,
    priority: 0.6
  }));
}

/**
 * Génère le fichier sitemap complet avec données dynamiques
 * À appeler depuis un script de build ou un endpoint API
 */
export async function buildCompleteSitemap(supabase: any): Promise<string> {
  const dynamicUrls: SitemapURL[] = [];

  try {
    // Récupérer les entreprises
    const { data: businesses } = await supabase
      .from('entreprise')
      .select('id, nom, ville, updated_at')
      .eq('status', 'approved')
      .limit(1000);

    if (businesses) {
      dynamicUrls.push(...generateBusinessURLs(businesses));
    }

    // Récupérer les événements
    const { data: events } = await supabase
      .from('evenements_locaux')
      .select('id, titre, localisation_ville, created_at')
      .eq('est_valide', true)
      .limit(500);

    if (events) {
      dynamicUrls.push(...generateEventURLs(events.map(e => ({
        id: e.id,
        titre: e.titre,
        ville: e.localisation_ville,
        created_at: e.created_at
      }))));
    }

    // Récupérer les offres d'emploi
    const { data: jobs } = await supabase
      .from('job_postings')
      .select('id, titre_poste, ville, created_at')
      .eq('statut', 'active')
      .limit(500);

    if (jobs) {
      dynamicUrls.push(...generateJobURLs(jobs));
    }

  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
  }

  return generateSitemap(dynamicUrls);
}

/**
 * Script d'exemple pour générer et sauvegarder le sitemap
 */
export function downloadSitemap(content: string) {
  const blob = new Blob([content], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
