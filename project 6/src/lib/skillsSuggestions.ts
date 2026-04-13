/**
 * Dictionnaire d'auto-complétion des compétences par secteur
 * Utilisé dans les formulaires de candidature et de publication d'offres
 */

export type Sector = 'sante' | 'it' | 'education' | 'administration' | 'magasin' | 'autres';

export const skillsSuggestions: Record<Sector, string[]> = {
  sante: [
    'Soins infirmiers',
    'Assistance au fauteuil',
    'Asepsie et stérilisation',
    'Radiologie',
    'Prothèses dentaires',
    'Gestion agenda médical',
    'Urgences médicales',
    'Soins postopératoires',
    'Hygiène hospitalière',
    'Premiers secours',
    'Kinésithérapie',
    'Cardiologie',
    'Pédiatrie',
    'Pharmacologie',
    'Gériatrie',
  ],

  it: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'SQL',
    'MongoDB',
    'Docker',
    'Git',
    'AWS',
    'Azure',
    'REST API',
    'GraphQL',
    'CI/CD',
    'Kubernetes',
    'Microservices',
    'React Native',
    'Vue.js',
    'Angular',
  ],

  education: [
    'Pédagogie',
    'Gestion de classe',
    'Évaluation',
    'Mathématiques',
    'Français',
    'Anglais',
    'Sciences',
    'Histoire-Géographie',
    'Physique-Chimie',
    'Soutien scolaire',
    'Cours particuliers',
    'Préparation examens',
    'Méthodologie',
    'Accompagnement personnalisé',
    'Orientation scolaire',
  ],

  administration: [
    'Gestion administrative',
    'Comptabilité',
    'Facturation',
    'Secrétariat',
    'Accueil',
    'Téléphonie',
    'Excel avancé',
    'Gestion des stocks',
    'Ressources humaines',
    'Paie',
    'Droit du travail',
    'Gestion de projet',
    'Archivage',
    'Rédaction administrative',
    'Organisation événements',
  ],

  magasin: [
    'Vente',
    'Conseil clientèle',
    'Merchandising',
    'Caisse',
    'Gestion stock',
    'Réassort',
    'Service après-vente',
    'Fidélisation client',
    'Techniques de vente',
    'Animation commerciale',
    'Gestion rayons',
    'Mise en rayon',
    'Inventaire',
    'Produits alimentaires',
    'Textile mode',
  ],

  autres: [
    'Communication',
    'Travail en équipe',
    'Autonomie',
    'Rigueur',
    'Organisation',
    'Polyvalence',
    'Adaptabilité',
    'Sens du service',
    'Gestion du stress',
    'Esprit d\'initiative',
    'Résolution de problèmes',
    'Leadership',
    'Créativité',
    'Négociation',
    'Relationnel',
  ],
};

/**
 * Normalise une compétence pour la recherche et la comparaison
 */
export function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Filtre les suggestions de compétences basées sur une requête
 */
export function filterSkillSuggestions(
  sector: Sector,
  query: string,
  maxResults: number = 10
): string[] {
  if (!query || query.length < 2) {
    return skillsSuggestions[sector].slice(0, maxResults);
  }

  const normalizedQuery = normalizeSkill(query);

  return skillsSuggestions[sector]
    .filter(skill => normalizeSkill(skill).includes(normalizedQuery))
    .slice(0, maxResults);
}

/**
 * Obtient toutes les suggestions pour un secteur
 */
export function getAllSkillsForSector(sector: Sector): string[] {
  return skillsSuggestions[sector];
}
