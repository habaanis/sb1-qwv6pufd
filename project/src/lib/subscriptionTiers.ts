/**
 * Système de mapping des paliers d'abonnement
 * Convertit les valeurs de la base de données en tiers visuels
 */

export type SubscriptionTier = 'gratuit' | 'artisan' | 'premium' | 'elite' | 'custom';

export interface SubscriptionData {
  statut_abonnement?: string | null;
  'niveau priorité abonnement'?: number | null;
}

export interface MediaLimits {
  maxPhotos: number;
  maxVideos: number;
  showGallery: boolean;
  showVideos: boolean;
}

/**
 * Mappe le plan d'abonnement de la BDD vers le tier visuel
 * Plans: Gratuit, Artisan, Premium, Elite Pro, Pack personnalisé
 */
export function mapSubscriptionToTier(data: SubscriptionData): SubscriptionTier {
  const rawValue = data.statut_abonnement;

  if (!rawValue) {
    return 'gratuit';
  }

  const normalized = rawValue.toLowerCase().trim();

  if (normalized.includes('artisan')) {
    return 'artisan';
  }

  if (normalized.includes('premium')) {
    return 'premium';
  }

  if (normalized.includes('elite')) {
    return 'elite';
  }

  if (normalized.includes('custom') || normalized.includes('personnalis')) {
    return 'custom';
  }

  if (normalized.includes('gratuit') || normalized.includes('free') || normalized.includes('decouverte')) {
    return 'gratuit';
  }

  return 'gratuit';
}

/**
 * Obtient les limites médias selon le plan d'abonnement
 * - Gratuit: Pas de galerie
 * - Artisan: 3 photos max
 * - Premium: 5 photos max, 1 vidéo
 * - Elite Pro: 10 photos max, 3 vidéos
 * - Custom: 10 photos max, 3 vidéos
 */
export function getMediaLimits(tier: SubscriptionTier): MediaLimits {
  switch (tier) {
    case 'gratuit':
      return {
        maxPhotos: 0,
        maxVideos: 0,
        showGallery: false,
        showVideos: false,
      };
    case 'artisan':
      return {
        maxPhotos: 3,
        maxVideos: 0,
        showGallery: true,
        showVideos: false,
      };
    case 'premium':
      return {
        maxPhotos: 5,
        maxVideos: 1,
        showGallery: true,
        showVideos: true,
      };
    case 'elite':
      return {
        maxPhotos: 10,
        maxVideos: 3,
        showGallery: true,
        showVideos: true,
      };
    case 'custom':
      return {
        maxPhotos: 10,
        maxVideos: 3,
        showGallery: true,
        showVideos: true,
      };
    default:
      return {
        maxPhotos: 0,
        maxVideos: 0,
        showGallery: false,
        showVideos: false,
      };
  }
}

/**
 * Obtient le texte de couleur approprié selon le tier
 */
export function getTierTextColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'artisan':
    case 'premium':
      return 'text-white';
    case 'elite':
      return 'text-[#D4AF37]';
    case 'decouverte':
    case 'custom':
    default:
      return 'text-gray-900';
  }
}

/**
 * Obtient la couleur de texte secondaire selon le tier
 */
export function getTierSecondaryTextColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'artisan':
    case 'premium':
      return 'text-gray-200';
    case 'elite':
      return 'text-gray-300';
    case 'decouverte':
    case 'custom':
    default:
      return 'text-gray-600';
  }
}

/**
 * Obtient la couleur de texte tertiaire selon le tier
 */
export function getTierTertiaryTextColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'artisan':
    case 'premium':
      return 'text-gray-300';
    case 'elite':
      return 'text-gray-400';
    case 'decouverte':
    case 'custom':
    default:
      return 'text-gray-500';
  }
}

/**
 * Vérifie si un tier est premium (nécessite un effet shine)
 */
export function isPremiumTier(tier: SubscriptionTier): boolean {
  return tier === 'artisan' || tier === 'premium' || tier === 'elite';
}

/**
 * Obtient le label d'affichage du tier
 */
export function getTierLabel(tier: SubscriptionTier, language: string = 'fr'): string {
  const labels: Record<SubscriptionTier, Record<string, string>> = {
    gratuit: {
      fr: 'Gratuit',
      en: 'Free',
      ar: 'مجاني'
    },
    artisan: {
      fr: 'Artisan',
      en: 'Artisan',
      ar: 'حرفي'
    },
    premium: {
      fr: 'Premium',
      en: 'Premium',
      ar: 'بريميوم'
    },
    elite: {
      fr: 'Élite Pro',
      en: 'Elite Pro',
      ar: 'إيليت برو'
    },
    custom: {
      fr: 'Pack Personnalisé',
      en: 'Custom Pack',
      ar: 'حزمة مخصصة'
    }
  };

  return labels[tier]?.[language] || labels[tier]?.['fr'] || tier;
}

/**
 * Obtient le niveau de priorité selon le tier
 * Priorité 4 (Elite) > Priorité 3 (Premium) > Priorité 2 (Artisan) > Priorité 1 (Gratuit)
 */
export function getTierPriority(tier: SubscriptionTier): number {
  switch (tier) {
    case 'elite':
    case 'custom':
      return 4;
    case 'premium':
      return 3;
    case 'artisan':
      return 2;
    case 'gratuit':
    default:
      return 1;
  }
}

/**
 * Obtient le niveau de priorité depuis les données de la base
 * Utilise la colonne 'niveau priorité abonnement' si disponible, sinon calcule depuis le tier
 */
export function getPriorityLevel(data: SubscriptionData): number {
  if (data['niveau priorité abonnement'] && data['niveau priorité abonnement'] > 0) {
    return data['niveau priorité abonnement'];
  }

  const tier = mapSubscriptionToTier(data);
  return getTierPriority(tier);
}

/**
 * Obtient la palette de couleurs complète selon le statut d'abonnement
 * Retourne tous les codes couleurs nécessaires pour l'interface
 */
export function getTierColors(statut_abonnement: string | null) {
  const tier = mapSubscriptionToTier({ statut_abonnement });

  switch (tier) {
    case 'elite':
      return {
        cardBg: '#1A1A1A',
        text: '#FFFFFF',
        secondaryText: '#D1D5DB',
        border: '#D4AF37',
        primary: '#D4AF37',
        primaryText: '#1A1A1A',
        accent: '#D4AF37',
        badgeBg: '#2D2D2D',
        badgeText: '#D4AF37',
        divider: '#374151'
      };
    case 'premium':
      return {
        cardBg: '#047857',
        text: '#FFFFFF',
        secondaryText: '#D1FAE5',
        border: '#10B981',
        primary: '#10B981',
        primaryText: '#FFFFFF',
        accent: '#34D399',
        badgeBg: '#065F46',
        badgeText: '#D1FAE5',
        divider: '#059669'
      };
    case 'artisan':
      return {
        cardBg: '#4A1D43',
        text: '#FFFFFF',
        secondaryText: '#E5D4E4',
        border: '#D4AF37',
        primary: '#D4AF37',
        primaryText: '#4A1D43',
        accent: '#B8941F',
        badgeBg: '#5A2D53',
        badgeText: '#E5D4E4',
        divider: '#6B2D5C'
      };
    case 'gratuit':
    default:
      return {
        cardBg: '#FFFFFF',
        text: '#1F2937',
        secondaryText: '#6B7280',
        border: '#D4AF37',
        primary: '#D4AF37',
        primaryText: '#1A1A1A',
        accent: '#B8941F',
        badgeBg: '#F9FAFB',
        badgeText: '#4B5563',
        divider: '#E5E7EB'
      };
  }
}
