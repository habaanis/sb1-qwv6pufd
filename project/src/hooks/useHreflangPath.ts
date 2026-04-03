import { useEffect, useState } from 'react';

/**
 * Hook pour détecter le chemin actuel et gérer les URLs hreflang
 */
export const useHreflangPath = () => {
  const [currentPath, setCurrentPath] = useState<string>('#/');

  useEffect(() => {
    const updatePath = () => {
      const hash = window.location.hash || '#/';
      setCurrentPath(hash);
    };

    updatePath();

    window.addEventListener('hashchange', updatePath);

    return () => {
      window.removeEventListener('hashchange', updatePath);
    };
  }, []);

  return currentPath;
};

/**
 * Génère l'URL complète avec le paramètre de langue
 */
export const generateLanguageUrl = (path: string, lang: string): string => {
  const baseUrl = window.location.origin;
  const cleanPath = path.startsWith('#') ? path : `#${path}`;

  return `${baseUrl}?lang=${lang}${cleanPath}`;
};

/**
 * Extrait le paramètre de langue de l'URL
 */
export const getLanguageFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('lang');
};
