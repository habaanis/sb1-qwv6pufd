#!/usr/bin/env node

/**
 * Script de génération automatique du sitemap.xml
 * Scanne la base de données Supabase et crée un sitemap complet
 *
 * Usage:
 * node scripts/generate_sitemap.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour générer le slug SEO
function generateSlug(text) {
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

// Fonction pour générer l'URL d'une entreprise avec slug
function generateBusinessUrl(name, id) {
  const slug = generateSlug(name);
  const shortId = id.substring(0, 8);
  return `/p/${slug}-${shortId}`;
}

// Pages statiques - URLs PROPRES indexables par Google
const staticPages = [
  // Page d'accueil
  { loc: '/', priority: '1.0', changefreq: 'daily' },

  // Pages principales
  { loc: '/businesses', priority: '0.9', changefreq: 'daily' },
  { loc: '/entreprises', priority: '0.9', changefreq: 'daily' },
  { loc: '/jobs', priority: '0.9', changefreq: 'daily' },
  { loc: '/emploi', priority: '0.9', changefreq: 'daily' },
  { loc: '/emplois', priority: '0.9', changefreq: 'daily' },

  // Section Citoyens
  { loc: '/citizens', priority: '0.85', changefreq: 'daily' },
  { loc: '/citizens/health', priority: '0.85', changefreq: 'weekly' },
  { loc: '/citizens/sante', priority: '0.85', changefreq: 'weekly' },
  { loc: '/citizens/leisure', priority: '0.85', changefreq: 'daily' },
  { loc: '/citizens/loisirs', priority: '0.85', changefreq: 'daily' },
  { loc: '/citizens/admin', priority: '0.8', changefreq: 'weekly' },
  { loc: '/citizens/shops', priority: '0.85', changefreq: 'weekly' },
  { loc: '/citizens/magasins', priority: '0.85', changefreq: 'weekly' },
  { loc: '/citizens/services', priority: '0.85', changefreq: 'weekly' },
  { loc: '/citizens/tourism', priority: '0.85', changefreq: 'weekly' },
  { loc: '/citizens/tourisme', priority: '0.85', changefreq: 'weekly' },

  // Education
  { loc: '/education', priority: '0.85', changefreq: 'weekly' },

  // Culture & Evenements
  { loc: '/culture-events', priority: '0.85', changefreq: 'daily' },
  { loc: '/evenements', priority: '0.85', changefreq: 'daily' },

  // Marketplace
  { loc: '/marketplace', priority: '0.8', changefreq: 'daily' },
  { loc: '/marche-local', priority: '0.8', changefreq: 'daily' },

  // Geolocalisation
  { loc: '/around-me', priority: '0.8', changefreq: 'daily' },
  { loc: '/autour-de-moi', priority: '0.8', changefreq: 'daily' },

  // Pages institutionnelles
  { loc: '/subscription', priority: '0.75', changefreq: 'monthly' },
  { loc: '/abonnement', priority: '0.75', changefreq: 'monthly' },
  { loc: '/concept', priority: '0.7', changefreq: 'monthly' },
  { loc: '/notre-concept', priority: '0.7', changefreq: 'monthly' },

  // Partenaires
  { loc: '/partner-directory', priority: '0.7', changefreq: 'weekly' },
  { loc: '/annuaire-partenaires', priority: '0.7', changefreq: 'weekly' },

  // Autres sections
  { loc: '/transport-inscription', priority: '0.6', changefreq: 'monthly' },
  { loc: '/business-events', priority: '0.7', changefreq: 'weekly' },
];

async function generateSitemap() {
  console.log('🚀 Génération du sitemap.xml en cours...\n');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n';

  const domain = 'https://dalil-tounes.com';
  const today = new Date().toISOString().split('T')[0];

  // Ajouter les pages statiques
  console.log('📄 Ajout des pages statiques...');
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${domain}${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n\n';
  });
  console.log(`✓ ${staticPages.length} pages statiques ajoutées\n`);

  // Récupérer et ajouter les entreprises
  console.log('🏢 Récupération des entreprises...');
  try {
    const { data: businesses, error } = await supabase
      .from('entreprise')
      .select('id, nom, updated_at, is_premium')
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (error) {
      console.error('❌ Erreur lors de la récupération des entreprises:', error);
    } else if (businesses && businesses.length > 0) {
      businesses.forEach(business => {
        const url = generateBusinessUrl(business.nom, business.id);
        const lastmod = business.updated_at
          ? new Date(business.updated_at).toISOString().split('T')[0]
          : today;

        // Priorité basée sur le statut premium
        let priority = '0.7';
        if (business.is_premium) priority = '0.9';

        xml += '  <url>\n';
        xml += `    <loc>${domain}${url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n\n';
      });
      console.log(`✓ ${businesses.length} entreprises ajoutées\n`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }

  // Récupérer et ajouter les événements locaux
  console.log('🎉 Récupération des événements locaux...');
  try {
    const { data: events, error } = await supabase
      .from('evenements_locaux')
      .select('id, titre, created_at')
      .eq('est_valide', true)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Erreur lors de la récupération des événements:', error);
    } else if (events && events.length > 0) {
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
      console.log(`✓ ${events.length} événements ajoutés\n`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }

  // Récupérer et ajouter les offres d'emploi
  console.log('💼 Récupération des offres d\'emploi...');
  try {
    const { data: jobs, error } = await supabase
      .from('job_postings')
      .select('id, titre_poste, created_at')
      .eq('statut', 'active')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Erreur lors de la récupération des emplois:', error);
    } else if (jobs && jobs.length > 0) {
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
      console.log(`✓ ${jobs.length} offres d'emploi ajoutées\n`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }

  // Récupérer et ajouter les inscriptions loisirs (activités)
  console.log('🎭 Récupération des activités de loisirs...');
  try {
    const { data: loisirs, error } = await supabase
      .from('inscriptions_loisirs')
      .select('id, titre_nom_evenement, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Erreur lors de la récupération des activités:', error);
    } else if (loisirs && loisirs.length > 0) {
      loisirs.forEach(activite => {
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
      console.log(`✓ ${loisirs.length} activités de loisirs ajoutées\n`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }

  xml += '</urlset>';

  // Écrire le fichier
  const outputPath = join(__dirname, '../public/sitemap.xml');
  writeFileSync(outputPath, xml, 'utf-8');

  console.log('✅ Sitemap généré avec succès!');
  console.log(`📁 Fichier: ${outputPath}`);
  console.log(`🔗 URL: ${domain}/sitemap.xml\n`);
}

// Exécuter la génération
generateSitemap()
  .then(() => {
    console.log('🎉 Processus terminé avec succès!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
