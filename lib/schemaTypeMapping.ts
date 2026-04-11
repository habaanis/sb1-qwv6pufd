export function getSchemaTypeFromCategory(category: string = ''): string {
  const categoryLower = category.toLowerCase().trim();

  const typeMapping: Record<string, string> = {
    'restaurant': 'Restaurant',
    'restauration': 'Restaurant',
    'cafe': 'CafeOrCoffeeShop',
    'café': 'CafeOrCoffeeShop',
    'bar': 'BarOrPub',
    'hotel': 'Hotel',
    'hôtel': 'Hotel',
    'hébergement': 'LodgingBusiness',

    'magasin': 'Store',
    'boutique': 'Store',
    'commerce': 'Store',
    'supermarché': 'GroceryStore',
    'alimentation': 'GroceryStore',
    'vêtements': 'ClothingStore',
    'vetements': 'ClothingStore',
    'électronique': 'ElectronicsStore',
    'electronique': 'ElectronicsStore',
    'bijouterie': 'JewelryStore',
    'parfumerie': 'Store',
    'librairie': 'BookStore',

    'garage': 'AutoRepair',
    'mécanique': 'AutoRepair',
    'mecanique': 'AutoRepair',
    'automobile': 'AutomotiveBusiness',
    'concessionnaire': 'AutoDealer',

    'médecin': 'Physician',
    'medecin': 'Physician',
    'dentiste': 'Dentist',
    'pharmacie': 'Pharmacy',
    'hôpital': 'Hospital',
    'hopital': 'Hospital',
    'clinique': 'MedicalClinic',
    'santé': 'HealthAndBeautyBusiness',
    'sante': 'HealthAndBeautyBusiness',
    'beauté': 'BeautySalon',
    'beaute': 'BeautySalon',
    'coiffeur': 'HairSalon',
    'spa': 'DaySpa',

    'banque': 'BankOrCreditUnion',
    'assurance': 'InsuranceAgency',
    'finance': 'FinancialService',
    'comptable': 'AccountingService',

    'avocat': 'Attorney',
    'notaire': 'Notary',
    'juridique': 'LegalService',

    'immobilier': 'RealEstateAgent',
    'agence immobilière': 'RealEstateAgent',
    'agence immobiliere': 'RealEstateAgent',

    'école': 'EducationalOrganization',
    'ecole': 'EducationalOrganization',
    'université': 'CollegeOrUniversity',
    'universite': 'CollegeOrUniversity',
    'formation': 'EducationalOrganization',

    'architecte': 'ProfessionalService',
    'ingénieur': 'ProfessionalService',
    'ingenieur': 'ProfessionalService',
    'consultant': 'ProfessionalService',

    'gym': 'SportsActivityLocation',
    'fitness': 'SportsActivityLocation',
    'sport': 'SportsActivityLocation',

    'cinéma': 'MovieTheater',
    'cinema': 'MovieTheater',
    'théâtre': 'PerformingArtsTheater',
    'theatre': 'PerformingArtsTheater',
    'musée': 'Museum',
    'musee': 'Museum',

    'agence de voyage': 'TravelAgency',
    'voyage': 'TravelAgency',
    'tourisme': 'TouristInformationCenter',
  };

  for (const [key, value] of Object.entries(typeMapping)) {
    if (categoryLower.includes(key)) {
      return value;
    }
  }

  return 'LocalBusiness';
}

export function getPriceRangeFromTier(tier: string = '', category: string = ''): string | undefined {
  const tierLower = tier.toLowerCase();

  if (tierLower.includes('elite') || tierLower.includes('premium')) {
    return '$$$';
  }

  if (tierLower.includes('gold') || tierLower.includes('or')) {
    return '$$';
  }

  if (tierLower.includes('silver') || tierLower.includes('argent')) {
    return '$';
  }

  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('luxe') || categoryLower.includes('luxury')) {
    return '$$$';
  }

  return '$$';
}

export function parseOpeningHours(horaires: any): Array<{
  '@type': string;
  dayOfWeek: string[];
  opens?: string;
  closes?: string;
}> | undefined {
  if (!horaires) return undefined;

  try {
    const horairesData = typeof horaires === 'string' ? JSON.parse(horaires) : horaires;

    if (!horairesData || typeof horairesData !== 'object') {
      return undefined;
    }

    const dayMapping: Record<string, string> = {
      'lundi': 'Monday',
      'mardi': 'Tuesday',
      'mercredi': 'Wednesday',
      'jeudi': 'Thursday',
      'vendredi': 'Friday',
      'samedi': 'Saturday',
      'dimanche': 'Sunday',
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday',
    };

    const openingHours: Array<{
      '@type': string;
      dayOfWeek: string[];
      opens?: string;
      closes?: string;
    }> = [];

    Object.entries(horairesData).forEach(([day, hours]: [string, any]) => {
      const dayKey = day.toLowerCase();
      const englishDay = dayMapping[dayKey];

      if (!englishDay) return;

      if (hours && typeof hours === 'object') {
        if (hours.ouvert === true || hours.open === true) {
          openingHours.push({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [englishDay],
            opens: hours.ouverture || hours.opens || '09:00',
            closes: hours.fermeture || hours.closes || '18:00',
          });
        }
      } else if (typeof hours === 'string' && hours.toLowerCase() !== 'fermé' && hours.toLowerCase() !== 'closed') {
        const timeMatch = hours.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (timeMatch) {
          openingHours.push({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [englishDay],
            opens: timeMatch[1],
            closes: timeMatch[2],
          });
        }
      }
    });

    return openingHours.length > 0 ? openingHours : undefined;
  } catch (e) {
    console.warn('Could not parse horaires for structured data:', e);
    return undefined;
  }
}
