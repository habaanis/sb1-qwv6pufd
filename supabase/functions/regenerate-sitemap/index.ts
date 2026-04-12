import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Fonction pour générer le slug SEO
function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[œ]/g, 'oe')
    .replace(/[æ]/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function generateBusinessUrl(name: string, id: string): string {
  const slug = generateSlug(name);
  const shortId = id.substring(0, 8);
  return `/p/${slug}-${shortId}`;
}

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/businesses', priority: '0.9', changefreq: 'daily' },
  { loc: '/jobs', priority: '0.9', changefreq: 'daily' },
  { loc: '/citizens/health', priority: '0.8', changefreq: 'weekly' },
  { loc: '/citizens/leisure', priority: '0.8', changefreq: 'daily' },
  { loc: '/citizens/admin', priority: '0.8', changefreq: 'weekly' },
  { loc: '/citizens/shops', priority: '0.8', changefreq: 'weekly' },
  { loc: '/citizens/services', priority: '0.8', changefreq: 'weekly' },
  { loc: '/education', priority: '0.8', changefreq: 'weekly' },
  { loc: '/culture-events', priority: '0.8', changefreq: 'daily' },
  { loc: '/subscription', priority: '0.7', changefreq: 'monthly' },
  { loc: '/concept', priority: '0.6', changefreq: 'monthly' },
  { loc: '/around-me', priority: '0.7', changefreq: 'daily' },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const domain = 'https://dalil-tounes.com';
    const today = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n';

    // Pages statiques
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${domain}${page.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n\n';
    });

    // Entreprises
    const { data: businesses } = await supabase
      .from('entreprise')
      .select('id, nom, updated_at, is_premium')
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (businesses) {
      businesses.forEach((business: any) => {
        const url = generateBusinessUrl(business.nom, business.id);
        const lastmod = business.updated_at
          ? new Date(business.updated_at).toISOString().split('T')[0]
          : today;

        let priority = '0.7';
        if (business.is_premium) priority = '0.9';

        xml += '  <url>\n';
        xml += `    <loc>${domain}${url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n\n';
      });
    }

    // Événements locaux
    const { data: events } = await supabase
      .from('evenements_locaux')
      .select('id, titre, created_at')
      .eq('est_valide', true)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (events) {
      events.forEach(event => {
        const slug = generateSlug(event.titre);
        const shortId = event.id.substring(0, 8);
        const url = `/event/${slug}-${shortId}`;
        const lastmod = event.created_at
          ? new Date(event.created_at).toISOString().split('T')[0]
          : today;

        xml += '  <url>\n';
        xml += `    <loc>${domain}${url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n\n';
      });
    }

    // Offres d'emploi
    const { data: jobs } = await supabase
      .from('job_postings')
      .select('id, titre_poste, created_at')
      .eq('statut', 'active')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (jobs) {
      jobs.forEach(job => {
        const slug = generateSlug(job.titre_poste);
        const shortId = job.id.substring(0, 8);
        const url = `/job/${slug}-${shortId}`;
        const lastmod = job.created_at
          ? new Date(job.created_at).toISOString().split('T')[0]
          : today;

        xml += '  <url>\n';
        xml += `    <loc>${domain}${url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n\n';
      });
    }

    // Activités de loisirs
    const { data: loisirs } = await supabase
      .from('inscriptions_loisirs')
      .select('id, titre_nom_evenement, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (loisirs) {
      loisirs.forEach((activite: any) => {
        const slug = generateSlug(activite.titre_nom_evenement);
        const shortId = activite.id.substring(0, 8);
        const url = `/loisir/${slug}-${shortId}`;
        const lastmod = activite.created_at
          ? new Date(activite.created_at).toISOString().split('T')[0]
          : today;

        xml += '  <url>\n';
        xml += `    <loc>${domain}${url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n\n';
      });
    }

    xml += '</urlset>';

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
