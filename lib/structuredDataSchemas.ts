import { getSchemaTypeFromCategory, getPriceRangeFromTier, parseOpeningHours } from './schemaTypeMapping';

export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
  address?: {
    '@type': string;
    addressCountry: string;
  };
}

export interface WebSiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  potentialAction?: {
    '@type': string;
    target: {
      '@type': string;
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface LocalBusinessSchema {
  '@context': string;
  '@type': string;
  name: string;
  image?: string;
  address?: {
    '@type': string;
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    addressCountry: string;
  };
  telephone?: string;
  url?: string;
  priceRange?: string;
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  geo?: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: Array<{
    '@type': string;
    dayOfWeek: string[];
    opens?: string;
    closes?: string;
  }>;
}

export interface CollectionPageSchema {
  '@context': string;
  '@type': string;
  name: string;
  description?: string;
  url: string;
  mainEntity?: {
    '@type': string;
    itemListElement: Array<{
      '@type': string;
      position: number;
      name: string;
      url?: string;
    }>;
  };
}

export interface AboutPageSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  mainEntity?: {
    '@type': string;
    name: string;
    description: string;
  };
}

export interface ContactPageSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
}

export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dalil Tounes',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://daliltounes.com',
    logo: typeof window !== 'undefined' ? `${window.location.origin}/images/logo.png` : undefined,
    description: 'Plateforme tunisienne de référencement des entreprises, services et événements en Tunisie',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TN',
    },
    sameAs: [
      'https://www.facebook.com/daliltounes',
      'https://www.instagram.com/daliltounes',
      'https://www.linkedin.com/company/daliltounes',
    ],
  };
}

export function generateWebSiteSchema(): WebSiteSchema {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://daliltounes.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dalil Tounes',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/#/businesses?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateLocalBusinessSchema(business: {
  nom: string;
  ville?: string;
  gouvernorat?: string;
  adresse?: string;
  telephone?: string;
  site_web?: string;
  photo_url?: string;
  latitude?: number;
  longitude?: number;
  note_moyenne?: number;
  nombre_avis?: number;
  horaires?: string;
  categorie?: string;
  statut_abonnement?: string;
  description?: string;
}): LocalBusinessSchema {
  const schemaType = getSchemaTypeFromCategory(business.categorie || '');

  const schema: LocalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: business.nom,
  };

  if (business.description) {
    (schema as any).description = business.description;
  }

  if (business.photo_url) {
    schema.image = business.photo_url;
  }

  if (business.adresse || business.ville || business.gouvernorat) {
    schema.address = {
      '@type': 'PostalAddress',
      addressCountry: 'TN',
    };

    if (business.adresse) {
      schema.address.streetAddress = business.adresse;
    }
    if (business.ville) {
      schema.address.addressLocality = business.ville;
    }
    if (business.gouvernorat) {
      schema.address.addressRegion = business.gouvernorat;
    }
  }

  if (business.telephone) {
    schema.telephone = business.telephone;
  }

  if (business.site_web) {
    schema.url = business.site_web;
  }

  const priceRange = getPriceRangeFromTier(business.statut_abonnement || '', business.categorie || '');
  if (priceRange) {
    schema.priceRange = priceRange;
  }

  if (business.latitude && business.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    };
  }

  if (business.note_moyenne && business.nombre_avis && business.nombre_avis > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.note_moyenne,
      reviewCount: business.nombre_avis,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const openingHours = parseOpeningHours(business.horaires);
  if (openingHours) {
    schema.openingHoursSpecification = openingHours;
  }

  return schema;
}

export function generateCollectionPageSchema(
  title: string,
  description: string,
  items: Array<{ name: string; url?: string }> = []
): CollectionPageSchema {
  const baseUrl = typeof window !== 'undefined' ? window.location.href : 'https://daliltounes.com';

  const schema: CollectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: baseUrl,
  };

  if (items.length > 0) {
    schema.mainEntity = {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    };
  }

  return schema;
}

export function generateAboutPageSchema(): AboutPageSchema {
  const baseUrl = typeof window !== 'undefined' ? window.location.href : 'https://daliltounes.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'À propos de Dalil Tounes',
    description: 'Découvrez Dalil Tounes, la plateforme tunisienne de référencement des entreprises et services',
    url: baseUrl,
    mainEntity: {
      '@type': 'Organization',
      name: 'Dalil Tounes',
      description: 'Plateforme de référencement complète pour trouver des entreprises, services, événements et opportunités en Tunisie',
    },
  };
}

export function generateContactPageSchema(): ContactPageSchema {
  const baseUrl = typeof window !== 'undefined' ? window.location.href : 'https://daliltounes.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Dalil Tounes',
    description: 'Contactez l\'équipe Dalil Tounes pour toute question ou demande de partenariat',
    url: baseUrl,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
