import React from 'react';
import BusinessDirectory from '../components/business/BusinessDirectory';

/**
 * Page PartnerDirectory - Annuaire des partenaires côté ENTREPRISES
 *
 * Utilise le composant réutilisable BusinessDirectory en mode 'partner'
 * pour permettre aux entreprises de trouver des partenaires, fournisseurs
 * et prestataires.
 *
 * TODO: Ajouter plus tard des fonctionnalités spécifiques au B2B :
 * - Filtres par type de relation (fournisseur, partenaire, prestataire, client potentiel)
 * - Système de favoris pour marquer les entreprises intéressantes (table business_favorites)
 * - Bouton "Contacter" qui envoie une demande sans afficher l'email (table business_contact_requests)
 * - Affichage du niveau de certification / labels
 * - Historique des collaborations (si disponible)
 * - Matching automatique basé sur le profil de l'entreprise connectée
 */

export default function PartnerDirectory() {
  return <BusinessDirectory mode="partner" />;
}
