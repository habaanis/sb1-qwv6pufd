export interface EntrepriseCategory {
  value: string;
  label: string;
}

export const FINANCE_SUBCATEGORIES = [
  'Banque',
  'Agence bancaire',
  'Microfinance',
  'Bureau de change',
  'Assurance',
  'Trésorerie',
] as const;

export const ENTREPRISE_CATEGORIES: EntrepriseCategory[] = [
  { value: 'finance', label: 'Finance & services bancaires' },
  { value: 'services_aux_entreprises', label: 'Services aux entreprises' },
  { value: 'transport_logistique', label: 'Transport & logistique' },
  { value: 'btp_construction', label: 'BTP / Construction' },
  { value: 'industrie', label: 'Industrie & fabrication' },
  { value: 'communication_marketing', label: 'Communication & marketing' },
  { value: 'informatique_telecom', label: 'Informatique & télécom' },
  { value: 'conseil_formation', label: 'Conseil & formation' },
  { value: 'evenementiel', label: 'Événementiel' },
  { value: 'agence_evenementielle', label: 'Agence événementielle' },
  { value: 'autre_activite_pro', label: 'Autre activité professionnelle' },
];

export function getCategoryLabel(value: string): string {
  const category = ENTREPRISE_CATEGORIES.find((cat) => cat.value === value);
  return category ? category.label : value;
}
