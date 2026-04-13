/**
 * Catégories d'établissements d'éducation et formation
 * Utilisées dans la page Éducation
 *
 * IMPORTANT: Les values correspondent EXACTEMENT aux sous_categories en base de données
 */

export const EDUCATION_CATEGORIES = [
  { value: 'Ecole primaire', label: 'École primaire' },
  { value: 'Collège privée', label: 'Collège privé' },
  { value: 'Lycée privée', label: 'Lycée privé' },
  { value: 'Ecole privée', label: 'École privée' },
  { value: 'Universités & Instituts', label: 'Universités & Instituts' },
  { value: 'Centre de langues', label: 'Centre de langues' },
  { value: 'centre de soutien', label: 'Centre de soutien scolaire' },
  { value: 'Formation professionnelle', label: 'Formation professionnelle' },
  { value: 'prive', label: 'Établissement privé' },
  { value: 'publi', label: 'Établissement public' },
  { value: 'adultes', label: 'Formation pour adultes' },
];

/**
 * Helper pour obtenir le label d'une catégorie à partir de sa value
 */
export function getEducationCategoryLabel(value: string): string {
  const category = EDUCATION_CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
}
