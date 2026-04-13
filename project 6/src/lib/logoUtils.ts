/**
 * Utilitaires pour la gestion du logo par défaut Dalil Tounes
 */

// Logo par défaut - Sceau Luxe Dalil Tounes
export const DEFAULT_LOGO_URL = 'https://ik.imagekit.io/gfdpqvshw/Design_Assets_Dalil_Tounes/logos/logo_dalil_tounes_sceau_luxe.png?updatedAt=1773327267816';

// Version locale de secours (fallback)
export const DEFAULT_LOGO_LOCAL = '/images/logo_dalil_tounes_sceau_luxe.png';

/**
 * Obtient l'URL du logo avec fallback
 * Priorise le logo de l'entreprise, sinon utilise le logo Dalil Tounes
 */
export function getLogoUrl(logoUrl?: string | null): string {
  if (logoUrl && logoUrl.trim() !== '') {
    return logoUrl;
  }
  return DEFAULT_LOGO_URL;
}

/**
 * Détermine si le logo affiché est le logo par défaut
 * Utile pour appliquer des styles spécifiques (padding, etc.)
 */
export function isDefaultLogo(logoUrl?: string | null): boolean {
  if (!logoUrl || logoUrl.trim() === '') return true;
  return logoUrl === DEFAULT_LOGO_URL || logoUrl === DEFAULT_LOGO_LOCAL;
}

/**
 * Style CSS pour le CONTENEUR du logo
 * Le logo remplit ENTIÈREMENT le cercle sans fond blanc visible
 */
export function getLogoContainerStyle(borderColor: string = '#D4AF37', borderWidth: string = '3px'): React.CSSProperties {
  return {
    border: `${borderWidth} solid ${borderColor}`,
    borderRadius: '50%',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };
}

/**
 * Style CSS pour le logo dans un cercle
 * Le logo remplit ENTIÈREMENT le cercle - pas de fond blanc
 */
export function getLogoStyle(logoUrl?: string | null): React.CSSProperties {
  return {
    objectFit: 'cover' as const,
    objectPosition: 'center' as const,
    width: '100%',
    height: '100%',
    borderRadius: '50%'
  };
}
