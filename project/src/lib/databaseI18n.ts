/**
 * Helper pour gérer les colonnes multilingues de la base de données
 * Permet d'accéder automatiquement aux bonnes colonnes selon la langue
 */

import { Language } from './i18n';

/**
 * Suffixes de colonnes selon la langue
 */
const COLUMN_SUFFIXES: Record<Language, string> = {
  fr: '', // Pas de suffixe pour le français (colonne par défaut)
  ar: '_ar',
  en: '_en',
  it: '_it',
  ru: '_ru',
};

/**
 * Récupère la valeur d'un champ multilingue
 * @param data - L'objet contenant les données
 * @param baseField - Le nom du champ de base (ex: "nom", "description")
 * @param language - La langue souhaitée
 * @param fallbackToFrench - Si true, utilise la version française si la traduction n'existe pas
 * @returns La valeur traduite ou la valeur de fallback
 */
export function getMultilingualField<T = string>(
  data: any,
  baseField: string,
  language: Language,
  fallbackToFrench: boolean = true
): T | string {
  if (!data) return '';

  const suffix = COLUMN_SUFFIXES[language];
  const fieldName = `${baseField}${suffix}`;

  // Si la colonne traduite existe et n'est pas vide
  if (data[fieldName] && String(data[fieldName]).trim()) {
    return data[fieldName];
  }

  // Fallback vers le français si activé
  if (fallbackToFrench && language !== 'fr' && data[baseField]) {
    return data[baseField];
  }

  // Fallback vers n'importe quelle langue disponible
  for (const lang of Object.keys(COLUMN_SUFFIXES) as Language[]) {
    const altField = `${baseField}${COLUMN_SUFFIXES[lang]}`;
    if (data[altField] && String(data[altField]).trim()) {
      return data[altField];
    }
  }

  // Retour du champ de base ou chaîne vide
  return data[baseField] || '';
}

/**
 * Mappe un objet de base de données avec ses champs multilingues
 * @param data - L'objet source
 * @param fields - Liste des champs à traduire
 * @param language - La langue cible
 * @returns Un nouvel objet avec les champs traduits
 */
export function mapMultilingualData<T extends Record<string, any>>(
  data: T,
  fields: string[],
  language: Language
): T {
  const mapped = { ...data };

  for (const field of fields) {
    mapped[field] = getMultilingualField(data, field, language);
  }

  return mapped;
}

/**
 * Transforme un tableau d'objets avec leurs champs multilingues
 * @param items - Le tableau d'objets
 * @param fields - Les champs à traduire
 * @param language - La langue cible
 * @returns Le tableau avec les objets traduits
 */
export function mapMultilingualArray<T extends Record<string, any>>(
  items: T[],
  fields: string[],
  language: Language
): T[] {
  return items.map((item) => mapMultilingualData(item, fields, language));
}

/**
 * Champs standards à traduire pour les entreprises
 */
export const ENTREPRISE_MULTILINGUAL_FIELDS = [
  'nom',
  'description',
  'services',
  'sous_categories',
  'categorie',
];

/**
 * Champs standards à traduire pour les événements
 */
export const EVENT_MULTILINGUAL_FIELDS = [
  'titre',
  'nom',
  'description',
  'description_courte',
  'lieu',
  'adresse',
];

/**
 * Champs standards pour les démarches administratives
 */
export const PROCEDURE_MULTILINGUAL_FIELDS = [
  'titre',
  'description',
  'pieces_requises',
  'service_competent',
];

/**
 * Helper spécifique pour les entreprises
 */
export function translateEntreprise<T extends Record<string, any>>(
  entreprise: T,
  language: Language
): T {
  return mapMultilingualData(entreprise, ENTREPRISE_MULTILINGUAL_FIELDS, language);
}

/**
 * Helper spécifique pour les événements
 */
export function translateEvent<T extends Record<string, any>>(
  event: T,
  language: Language
): T {
  return mapMultilingualData(event, EVENT_MULTILINGUAL_FIELDS, language);
}

/**
 * Helper pour créer une requête Supabase multilingue
 * Retourne la liste des colonnes à sélectionner
 */
export function getMultilingualSelect(
  baseFields: string[],
  language: Language,
  includeAllLanguages: boolean = false
): string {
  if (includeAllLanguages) {
    // Retourne tous les champs dans toutes les langues
    const allFields: string[] = [];
    for (const field of baseFields) {
      allFields.push(field); // Version française (par défaut)
      for (const lang of Object.keys(COLUMN_SUFFIXES) as Language[]) {
        if (lang !== 'fr') {
          allFields.push(`${field}${COLUMN_SUFFIXES[lang]}`);
        }
      }
    }
    return allFields.join(', ');
  }

  // Retourne les champs dans la langue demandée + fallback français
  const fields: string[] = [];
  for (const field of baseFields) {
    fields.push(field); // Version française (fallback)
    if (language !== 'fr') {
      fields.push(`${field}${COLUMN_SUFFIXES[language]}`);
    }
  }
  return fields.join(', ');
}

/**
 * Exemple d'utilisation:
 *
 * // Dans un composant:
 * const { language } = useLanguage();
 * const { data } = await supabase
 *   .from('entreprise')
 *   .select(getMultilingualSelect(['nom', 'description'], language))
 *   .eq('id', entrepriseId)
 *   .single();
 *
 * const translated = translateEntreprise(data, language);
 * console.log(translated.nom); // Affiche le nom dans la bonne langue
 */
