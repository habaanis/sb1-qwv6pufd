/**
 * Helper pour les alt-texts multilingues des images
 * Optimisation SEO pour l'accessibilité et le référencement
 */

import { Language } from '../i18n';

/**
 * Alt-texts communs pour les images du site
 */
export const commonAltTexts: Record<string, Record<Language, string>> = {
  // Logo
  logo: {
    fr: 'Logo Dalil Tounes - Guide des services en Tunisie',
    ar: 'شعار دليل تونس - دليل الخدمات في تونس',
    en: 'Dalil Tounes Logo - Services Guide in Tunisia',
    it: 'Logo Dalil Tounes - Guida ai servizi in Tunisia',
    ru: 'Логотип Dalil Tounes - Справочник услуг в Тунисе'
  },

  // Chéchia (symbole tunisien)
  chechia: {
    fr: 'Chéchia traditionnelle tunisienne - Symbole de l\'identité nationale',
    ar: 'الشاشية التونسية التقليدية - رمز الهوية الوطنية',
    en: 'Traditional Tunisian Chechia - Symbol of national identity',
    it: 'Chechia tradizionale tunisina - Simbolo dell\'identità nazionale',
    ru: 'Традиционная тунисская шешия - Символ национальной идентичности'
  },

  // Placeholder entreprise
  businessPlaceholder: {
    fr: 'Image de l\'entreprise',
    ar: 'صورة الشركة',
    en: 'Business image',
    it: 'Immagine dell\'azienda',
    ru: 'Изображение компании'
  },

  // Placeholder événement
  eventPlaceholder: {
    fr: 'Image de l\'événement',
    ar: 'صورة الحدث',
    en: 'Event image',
    it: 'Immagine dell\'evento',
    ru: 'Изображение мероприятия'
  },

  // Bannière santé
  healthBanner: {
    fr: 'Services de santé en Tunisie - Médecins, cliniques et pharmacies',
    ar: 'خدمات الصحة في تونس - الأطباء والعيادات والصيدليات',
    en: 'Health services in Tunisia - Doctors, clinics and pharmacies',
    it: 'Servizi sanitari in Tunisia - Medici, cliniche e farmacie',
    ru: 'Медицинские услуги в Тунисе - Врачи, клиники и аптеки'
  },

  // Bannière éducation
  educationBanner: {
    fr: 'Éducation en Tunisie - Écoles, collèges et universités',
    ar: 'التعليم في تونس - المدارس والإعداديات والجامعات',
    en: 'Education in Tunisia - Schools, colleges and universities',
    it: 'Istruzione in Tunisia - Scuole, collegi e università',
    ru: 'Образование в Тунисе - Школы, колледжи и университеты'
  },

  // Carte interactive
  mapMarker: {
    fr: 'Marqueur de localisation sur la carte interactive',
    ar: 'علامة الموقع على الخريطة التفاعلية',
    en: 'Location marker on interactive map',
    it: 'Marcatore di posizione sulla mappa interattiva',
    ru: 'Маркер местоположения на интерактивной карте'
  }
};

/**
 * Génère un alt-text pour une image d'entreprise
 */
export function getBusinessImageAlt(
  businessName: string,
  category: string,
  city: string,
  language: Language
): string {
  const templates = {
    fr: `${businessName} - ${category} à ${city}`,
    ar: `${businessName} - ${category} في ${city}`,
    en: `${businessName} - ${category} in ${city}`,
    it: `${businessName} - ${category} a ${city}`,
    ru: `${businessName} - ${category} в ${city}`
  };

  return templates[language];
}

/**
 * Génère un alt-text pour une image d'événement
 */
export function getEventImageAlt(
  eventTitle: string,
  eventType: string,
  city: string,
  language: Language
): string {
  const templates = {
    fr: `${eventTitle} - ${eventType} à ${city}`,
    ar: `${eventTitle} - ${eventType} في ${city}`,
    en: `${eventTitle} - ${eventType} in ${city}`,
    it: `${eventTitle} - ${eventType} a ${city}`,
    ru: `${eventTitle} - ${eventType} в ${city}`
  };

  return templates[language];
}

/**
 * Génère un alt-text pour un logo d'entreprise
 */
export function getBusinessLogoAlt(
  businessName: string,
  language: Language
): string {
  const templates = {
    fr: `Logo de ${businessName}`,
    ar: `شعار ${businessName}`,
    en: `${businessName} logo`,
    it: `Logo di ${businessName}`,
    ru: `Логотип ${businessName}`
  };

  return templates[language];
}

/**
 * Récupère un alt-text commun
 */
export function getCommonAlt(key: string, language: Language): string {
  return commonAltTexts[key]?.[language] || commonAltTexts[key]?.fr || '';
}

/**
 * Génère un alt-text pour une catégorie de service
 */
export function getCategoryImageAlt(
  categoryName: string,
  language: Language
): string {
  const templates = {
    fr: `Catégorie ${categoryName} - Services et établissements`,
    ar: `فئة ${categoryName} - الخدمات والمؤسسات`,
    en: `${categoryName} category - Services and establishments`,
    it: `Categoria ${categoryName} - Servizi e stabilimenti`,
    ru: `Категория ${categoryName} - Услуги и учреждения`
  };

  return templates[language];
}

/**
 * Génère un alt-text pour une photo de profil
 */
export function getProfileImageAlt(
  personName: string,
  profession: string,
  language: Language
): string {
  const templates = {
    fr: `Photo de ${personName} - ${profession}`,
    ar: `صورة ${personName} - ${profession}`,
    en: `Photo of ${personName} - ${profession}`,
    it: `Foto di ${personName} - ${profession}`,
    ru: `Фото ${personName} - ${profession}`
  };

  return templates[language];
}

/**
 * Génère un alt-text pour une galerie d'images
 */
export function getGalleryImageAlt(
  businessName: string,
  imageIndex: number,
  totalImages: number,
  language: Language
): string {
  const templates = {
    fr: `Photo ${imageIndex} sur ${totalImages} de ${businessName}`,
    ar: `صورة ${imageIndex} من ${totalImages} لـ ${businessName}`,
    en: `Photo ${imageIndex} of ${totalImages} from ${businessName}`,
    it: `Foto ${imageIndex} di ${totalImages} di ${businessName}`,
    ru: `Фото ${imageIndex} из ${totalImages} от ${businessName}`
  };

  return templates[language];
}
