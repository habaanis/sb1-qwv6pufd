import React from 'react';
import BusinessDirectory from '../components/business/BusinessDirectory';

/**
 * Page BusinessList - Liste des entreprises côté CITOYENS
 *
 * Utilise le composant réutilisable BusinessDirectory en mode 'citizen'
 * pour afficher l'annuaire des établissements tunisiens.
 *
 * TODO: Ajouter plus tard des fonctionnalités spécifiques aux citoyens :
 * - Filtres par services / badges
 * - Tri par note / avis
 * - Tri par distance (géolocalisation)
 * - Affichage des avis clients
 * - Système de favoris pour les citoyens
 */

export default function BusinessList() {
  return <BusinessDirectory mode="citizen" />;
}
