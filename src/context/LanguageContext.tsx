import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '../lib/i18n';
import { getLanguageFromUrl } from '../hooks/useHreflangPath';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES: Language[] = ['fr', 'ar', 'it', 'ru', 'en'];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Détecte la langue depuis l'URL au chargement initial
    const urlLang = getLanguageFromUrl();
    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang as Language)) {
      return urlLang as Language;
    }

    // Sinon, utilise la langue sauvegardée ou 'fr' par défaut
    const savedLang = localStorage.getItem('dalilTounes_language');
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as Language)) {
      return savedLang as Language;
    }

    return 'fr';
  });

  useEffect(() => {
    // Sauvegarder la langue dans localStorage
    localStorage.setItem('dalilTounes_language', language);

    // Mettre à jour l'URL si nécessaire
    const urlLang = getLanguageFromUrl();
    if (urlLang !== language) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      window.history.replaceState({}, '', url.toString());
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
