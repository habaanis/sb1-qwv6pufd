/**
 * Utilitaire pour gérer le statut d'abonnement des entreprises
 * Remplace l'ancienne colonne `is_premium` par une logique basée sur `statut abonnement`
 */

export type SubscriptionTier = 'elite' | 'premium' | 'artisan' | 'decouverte';

/**
 * Détermine si une entreprise a un abonnement premium (Artisan, Premium ou Elite)
 * @param statutAbonnement - La valeur de la colonne "statut abonnement" (avec ou sans espace)
 * @returns true si l'entreprise est Artisan, Premium ou Elite
 */
export function isPremiumBusiness(statutAbonnement: string | null | undefined): boolean {
  if (!statutAbonnement) return false;

  const statut = statutAbonnement.toLowerCase().trim();
  return statut.includes('artisan') ||
         statut.includes('premium') ||
         statut.includes('elite');
}

/**
 * Détermine le tier d'abonnement exact
 * @param statutAbonnement - La valeur de la colonne "statut abonnement"
 * @returns Le tier de l'entreprise
 */
export function getSubscriptionTier(statutAbonnement: string | null | undefined): SubscriptionTier {
  if (!statutAbonnement) return 'decouverte';

  const statut = statutAbonnement.toLowerCase().trim();

  if (statut.includes('elite')) return 'elite';
  if (statut.includes('premium')) return 'premium';
  if (statut.includes('artisan')) return 'artisan';

  return 'decouverte';
}

/**
 * Obtient le nom d'affichage du tier
 * @param tier - Le tier de l'entreprise
 * @returns Le nom en français
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    elite: 'Elite',
    premium: 'Premium',
    artisan: 'Artisan',
    decouverte: 'Découverte'
  };
  return names[tier];
}

/**
 * Génère un score de priorité pour le tri (Elite = 4, Premium = 3, Artisan = 2, Découverte = 1)
 * @param statutAbonnement - La valeur de la colonne "statut abonnement"
 * @returns Un score numérique pour le tri
 */
export function getSubscriptionPriority(statutAbonnement: string | null | undefined): number {
  const tier = getSubscriptionTier(statutAbonnement);
  const priorities: Record<SubscriptionTier, number> = {
    elite: 4,
    premium: 3,
    artisan: 2,
    decouverte: 1
  };
  return priorities[tier];
}
