/**
 * Hook étendu pour accéder aux traductions complètes
 * Utilise à la fois les traductions existantes (i18n.ts) et les extensions (i18nExtensions.ts)
 */

import { Language } from './i18n';
import { translationExtensions } from './i18nExtensions';

// Type pour l'accès sûr aux traductions étendues
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type ExtendedTranslations = typeof translationExtensions.fr;

/**
 * Hook pour utiliser les traductions étendues
 * @param language - La langue actuelle
 * @returns Un objet avec toutes les traductions
 */
export const useTranslationExtended = (language: Language) => {
  const t = translationExtensions[language] as DeepPartial<ExtendedTranslations>;

  return {
    // Spread des traductions pour accès direct
    ...t,

    // Fonction helper pour accès sécurisé avec fallback
    get: <T = string>(path: string, fallback?: T): T | string => {
      const keys = path.split('.');
      let value: any = t;

      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return fallback || path;
        }
      }

      return value || fallback || path;
    },

    // Helper pour interpolation de variables
    interpolate: (text: string, vars: Record<string, any>): string => {
      return text.replace(/\{(\w+)\}/g, (match, key) => {
        return vars[key] !== undefined ? String(vars[key]) : match;
      });
    },
  };
};

/**
 * Fonction utilitaire pour obtenir une traduction sans hook
 */
export const getTranslation = (
  language: Language,
  path: string,
  fallback?: string
): string => {
  const keys = path.split('.');
  let value: any = translationExtensions[language];

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return fallback || path;
    }
  }

  return typeof value === 'string' ? value : fallback || path;
};

/**
 * Hook combiné qui donne accès aux traductions originales ET étendues
 */
export const useAllTranslations = (language: Language) => {
  const extended = useTranslationExtended(language);

  return {
    ext: extended, // Traductions étendues sous "ext"
    t: extended,   // Alias court
  };
};
