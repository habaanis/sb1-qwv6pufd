import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  canonical?: string;
  noindex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  currentPath?: string;
}

const SUPPORTED_LANGUAGES = ['fr', 'ar', 'it', 'ru', 'en'] as const;
const DEFAULT_LANGUAGE = 'fr';

/**
 * Génère les URLs hreflang pour toutes les langues supportées
 */
const generateHreflangUrls = (currentPath: string, baseUrl: string): Record<string, string> => {
  const urls: Record<string, string> = {};

  SUPPORTED_LANGUAGES.forEach(lang => {
    urls[lang] = `${baseUrl}?lang=${lang}${currentPath}`;
  });

  urls['x-default'] = `${baseUrl}?lang=${DEFAULT_LANGUAGE}${currentPath}`;

  return urls;
};

export const SEOHead = ({
  title,
  description,
  keywords,
  image = 'https://dalil-tounes.com/og-image.jpg',
  url = window.location.href,
  type = 'website',
  canonical,
  noindex = false,
  author = 'Dalil Tounes',
  publishedTime,
  modifiedTime,
  currentPath
}: SEOHeadProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = language;

    const metaTags = [
      // Basic meta tags
      { name: 'description', content: description },
      { name: 'author', content: author },
      { name: 'language', content: language },

      // Keywords
      ...(keywords ? [{ name: 'keywords', content: keywords }] : []),

      // Robots
      { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' },
      { name: 'googlebot', content: noindex ? 'noindex, nofollow' : 'index, follow' },

      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: canonical || url },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'Dalil Tounes' },
      { property: 'og:locale', content: language === 'ar' ? 'ar_TN' : language === 'fr' ? 'fr_TN' : `${language}_TN` },

      // Article specific
      ...(type === 'article' && publishedTime ? [{ property: 'article:published_time', content: publishedTime }] : []),
      ...(type === 'article' && modifiedTime ? [{ property: 'article:modified_time', content: modifiedTime }] : []),

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:site', content: '@daliltounes' },

      // Mobile
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },

      // Geographic targeting
      { name: 'geo.region', content: 'TN' },
      { name: 'geo.placename', content: 'Tunisia' },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let meta = document.querySelector(selector);

      if (!meta) {
        meta = document.createElement('meta');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', content);
    });

    // Canonical link
    const canonicalUrl = canonical || url;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // Nettoyer les anciennes balises hreflang
    const oldHreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    oldHreflangLinks.forEach(link => link.remove());

    // Générer les URLs hreflang dynamiques
    const baseUrl = window.location.origin;
    const path = currentPath || window.location.hash || '#/';
    const hreflangUrls = generateHreflangUrls(path, baseUrl);

    // Créer les balises hreflang pour chaque langue
    Object.entries(hreflangUrls).forEach(([hreflang, hrefUrl]) => {
      const linkAlternate = document.createElement('link');
      linkAlternate.setAttribute('rel', 'alternate');
      linkAlternate.setAttribute('hreflang', hreflang);
      linkAlternate.setAttribute('href', hrefUrl);
      document.head.appendChild(linkAlternate);
    });

    // Ajouter la balise auto-référencée pour la langue courante
    const selfUrl = `${baseUrl}?lang=${language}${path}`;
    const linkSelf = document.createElement('link');
    linkSelf.setAttribute('rel', 'alternate');
    linkSelf.setAttribute('hreflang', language);
    linkSelf.setAttribute('href', selfUrl);
    document.head.appendChild(linkSelf);

  }, [title, description, keywords, image, url, type, canonical, noindex, author, publishedTime, modifiedTime, language, currentPath]);

  return null;
};
