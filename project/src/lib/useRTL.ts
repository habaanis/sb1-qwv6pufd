/**
 * Hook RTL pour gérer l'affichage en mode arabe (Right-to-Left)
 */

import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const useRTL = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    // Appliquer le mode RTL au document HTML
    if (isRTL) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', language);
    }
  }, [isRTL, language]);

  return {
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    // Classes utilitaires pour Tailwind
    flexDirection: isRTL ? 'flex-row-reverse' : 'flex-row',
    textAlign: isRTL ? 'text-right' : 'text-left',
    marginStart: isRTL ? 'mr' : 'ml',
    marginEnd: isRTL ? 'ml' : 'mr',
    paddingStart: isRTL ? 'pr' : 'pl',
    paddingEnd: isRTL ? 'pl' : 'pr',
    borderStart: isRTL ? 'border-r' : 'border-l',
    borderEnd: isRTL ? 'border-l' : 'border-r',
    roundedStart: isRTL ? 'rounded-r' : 'rounded-l',
    roundedEnd: isRTL ? 'rounded-l' : 'rounded-r',
    start: isRTL ? 'right' : 'left',
    end: isRTL ? 'left' : 'right',
  };
};

// Helper pour obtenir la classe RTL conditionnelle
export const rtl = (isRTL: boolean, rtlClass: string, ltrClass: string) => {
  return isRTL ? rtlClass : ltrClass;
};

// Helper pour les valeurs RTL numériques (ex: margins, padding)
export const rtlValue = (isRTL: boolean, rtlValue: any, ltrValue: any) => {
  return isRTL ? rtlValue : ltrValue;
};
