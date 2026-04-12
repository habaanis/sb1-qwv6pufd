/**
 * Module SEO complet pour Dalil Tounes
 * Export centralisé de toutes les fonctionnalités SEO
 */

// Keywords
export {
  seoKeywordsDictionary,
  getKeywordsForCategory,
  getAllKeywords,
  getKeywordsString,
  getLongTailPhrases,
  type SEOKeywords
} from './keywords';

// Meta Tags
export {
  generateMetaTags,
  generateBusinessMetaTags,
  type MetaTags
} from './metaTags';

// Alt Texts
export {
  commonAltTexts,
  getBusinessImageAlt,
  getEventImageAlt,
  getBusinessLogoAlt,
  getCommonAlt,
  getCategoryImageAlt,
  getProfileImageAlt,
  getGalleryImageAlt
} from './altTexts';

// Sitemap
export {
  staticPages,
  generateSitemap,
  generateBusinessURLs,
  generateEventURLs,
  generateJobURLs,
  buildCompleteSitemap,
  downloadSitemap,
  type SitemapURL
} from './sitemap';

/**
 * Hook personnalisé pour utiliser facilement le SEO dans les composants
 */
import { useLanguage } from '../../context/LanguageContext';
import { generateMetaTags } from './metaTags';
import { getCommonAlt } from './altTexts';

export function useSEO() {
  const { language } = useLanguage();

  return {
    language,
    generateMeta: (page: string, options?: any) => generateMetaTags(page, language, options),
    getAlt: (key: string) => getCommonAlt(key, language)
  };
}
