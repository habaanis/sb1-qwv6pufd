/**
 * Générateur de meta-tags dynamiques multilingues pour SEO
 */

import { Language } from '../i18n';
import { getKeywordsForCategory, getKeywordsString } from './keywords';

/**
 * Interface pour les meta-tags
 */
export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}

/**
 * Templates de meta-tags par page et langue
 */
const metaTemplates: Record<string, Record<Language, { title: string; description: string }>> = {
  // === HOME ===
  home: {
    fr: {
      title: 'Dalil Tounes - Guide Complet des Établissements et Services en Tunisie',
      description: 'Trouvez facilement tous les établissements, services, commerces et professionnels en Tunisie. Santé, éducation, justice, loisirs - Votre guide tunisien complet en ligne.'
    },
    ar: {
      title: 'دليل تونس - الدليل الشامل للمؤسسات والخدمات في تونس',
      description: 'اعثر بسهولة على جميع المؤسسات والخدمات والتجارة والمهنيين في تونس. الصحة والتعليم والعدالة والترفيه - دليلك التونسي الشامل عبر الإنترنت.'
    },
    en: {
      title: 'Dalil Tounes - Complete Guide to Establishments and Services in Tunisia',
      description: 'Easily find all establishments, services, businesses and professionals in Tunisia. Health, education, justice, leisure - Your complete Tunisian guide online.'
    },
    it: {
      title: 'Dalil Tounes - Guida Completa a Stabilimenti e Servizi in Tunisia',
      description: 'Trova facilmente tutti gli stabilimenti, servizi, commerci e professionisti in Tunisia. Salute, istruzione, giustizia, svago - La tua guida tunisina completa online.'
    },
    ru: {
      title: 'Dalil Tounes - Полный Справочник Учреждений и Услуг в Тунисе',
      description: 'Легко найдите все учреждения, услуги, предприятия и специалистов в Тунисе. Здоровье, образование, правосудие, досуг - Ваш полный тунисский справочник онлайн.'
    }
  },

  // === SANTE ===
  health: {
    fr: {
      title: 'Santé en Tunisie - Médecins, Cliniques, Pharmacies de Garde | Dalil Tounes',
      description: 'Trouvez rapidement médecins, cliniques, hôpitaux, pharmacies de garde et services médicaux d\'urgence partout en Tunisie. Consultations, spécialistes, dentistes disponibles.'
    },
    ar: {
      title: 'الصحة في تونس - الأطباء والعيادات والصيدليات المناوبة | دليل تونس',
      description: 'ابحث بسرعة عن الأطباء والعيادات والمستشفيات والصيدليات المناوبة وخدمات الطوارئ الطبية في جميع أنحاء تونس. استشارات ومختصون وأطباء أسنان متاحون.'
    },
    en: {
      title: 'Health in Tunisia - Doctors, Clinics, Pharmacies on Duty | Dalil Tounes',
      description: 'Quickly find doctors, clinics, hospitals, pharmacies on duty and emergency medical services throughout Tunisia. Consultations, specialists, dentists available.'
    },
    it: {
      title: 'Salute in Tunisia - Medici, Cliniche, Farmacie di Turno | Dalil Tounes',
      description: 'Trova rapidamente medici, cliniche, ospedali, farmacie di turno e servizi medici di emergenza in tutta la Tunisia. Consulti, specialisti, dentisti disponibili.'
    },
    ru: {
      title: 'Здоровье в Тунисе - Врачи, Клиники, Дежурные Аптеки | Dalil Tounes',
      description: 'Быстро найдите врачей, клиники, больницы, дежурные аптеки и службы скорой медицинской помощи по всему Тунису. Консультации, специалисты, стоматологи доступны.'
    }
  },

  // === CITIZENS / SERVICES ===
  services: {
    fr: {
      title: 'Services Publics Tunisie - Démarches, Bureaux, Numéros d\'Urgence | Dalil Tounes',
      description: 'Accédez aux services publics en Tunisie : démarches administratives, bureaux gouvernementaux, numéros d\'urgence, services sociaux. Informations officielles et contacts directs.'
    },
    ar: {
      title: 'الخدمات العامة تونس - الإجراءات والمكاتب وأرقام الطوارئ | دليل تونس',
      description: 'الوصول إلى الخدمات العامة في تونس: الإجراءات الإدارية، المكاتب الحكومية، أرقام الطوارئ، الخدمات الاجتماعية. معلومات رسمية واتصالات مباشرة.'
    },
    en: {
      title: 'Public Services Tunisia - Procedures, Offices, Emergency Numbers | Dalil Tounes',
      description: 'Access public services in Tunisia: administrative procedures, government offices, emergency numbers, social services. Official information and direct contacts.'
    },
    it: {
      title: 'Servizi Pubblici Tunisia - Procedure, Uffici, Numeri di Emergenza | Dalil Tounes',
      description: 'Accedi ai servizi pubblici in Tunisia: procedure amministrative, uffici governativi, numeri di emergenza, servizi sociali. Informazioni ufficiali e contatti diretti.'
    },
    ru: {
      title: 'Государственные Услуги Тунис - Процедуры, Офисы, Номера Экстренных Служб | Dalil Tounes',
      description: 'Доступ к государственным услугам в Тунисе: административные процедуры, государственные офисы, номера экстренных служб, социальные услуги. Официальная информация и прямые контакты.'
    }
  },

  // === EDUCATION ===
  education: {
    fr: {
      title: 'Éducation en Tunisie - Écoles, Collèges, Lycées, Universités | Dalil Tounes',
      description: 'Trouvez tous les établissements d\'enseignement en Tunisie : écoles primaires, collèges, lycées, universités, formations professionnelles. Établissements publics et privés.'
    },
    ar: {
      title: 'التعليم في تونس - المدارس والإعداديات والثانويات والجامعات | دليل تونس',
      description: 'اعثر على جميع المؤسسات التعليمية في تونس: المدارس الابتدائية، الإعداديات، الثانويات، الجامعات، التكوين المهني. مؤسسات عامة وخاصة.'
    },
    en: {
      title: 'Education in Tunisia - Schools, Colleges, High Schools, Universities | Dalil Tounes',
      description: 'Find all educational establishments in Tunisia: primary schools, middle schools, high schools, universities, vocational training. Public and private institutions.'
    },
    it: {
      title: 'Istruzione in Tunisia - Scuole, Collegi, Licei, Università | Dalil Tounes',
      description: 'Trova tutti gli istituti scolastici in Tunisia: scuole primarie, scuole medie, licei, università, formazione professionale. Istituzioni pubbliche e private.'
    },
    ru: {
      title: 'Образование в Тунисе - Школы, Колледжи, Лицеи, Университеты | Dalil Tounes',
      description: 'Найдите все образовательные учреждения в Тунисе: начальные школы, средние школы, лицеи, университеты, профессиональное обучение. Государственные и частные учреждения.'
    }
  },

  // === JUSTICE ===
  justice: {
    fr: {
      title: 'Justice en Tunisie - Avocats, Notaires, Huissiers, Tribunaux | Dalil Tounes',
      description: 'Trouvez des professionnels du droit en Tunisie : avocats spécialisés, notaires, huissiers de justice, tribunaux. Services juridiques dans toutes les villes.'
    },
    ar: {
      title: 'العدالة في تونس - المحامون والموثقون والعدول المنفذون والمحاكم | دليل تونس',
      description: 'ابحث عن المهنيين القانونيين في تونس: محامون متخصصون، موثقون، عدول منفذون، محاكم. خدمات قانونية في جميع المدن.'
    },
    en: {
      title: 'Justice in Tunisia - Lawyers, Notaries, Bailiffs, Courts | Dalil Tounes',
      description: 'Find legal professionals in Tunisia: specialized lawyers, notaries, bailiffs, courts. Legal services in all cities.'
    },
    it: {
      title: 'Giustizia in Tunisia - Avvocati, Notai, Ufficiali Giudiziari, Tribunali | Dalil Tounes',
      description: 'Trova professionisti legali in Tunisia: avvocati specializzati, notai, ufficiali giudiziari, tribunali. Servizi legali in tutte le città.'
    },
    ru: {
      title: 'Правосудие в Тунисе - Адвокаты, Нотариусы, Судебные Приставы, Суды | Dalil Tounes',
      description: 'Найдите юридических специалистов в Тунисе: специализированные адвокаты, нотариусы, судебные приставы, суды. Юридические услуги во всех городах.'
    }
  },

  // === SOCIAL ===
  social: {
    fr: {
      title: 'Aide Sociale en Tunisie - CNSS, CNRPS, Allocations, Protection | Dalil Tounes',
      description: 'Accédez aux services d\'aide sociale en Tunisie : CNSS, CNRPS, allocations familiales, aide aux personnes en situation de handicap, protection de l\'enfance.'
    },
    ar: {
      title: 'المساعدة الاجتماعية في تونس - الصندوق الوطني والمنح والحماية | دليل تونس',
      description: 'الوصول إلى خدمات المساعدة الاجتماعية في تونس: الصندوق الوطني للضمان الاجتماعي، المنح العائلية، مساعدة ذوي الإعاقة، حماية الطفولة.'
    },
    en: {
      title: 'Social Assistance in Tunisia - CNSS, CNRPS, Allowances, Protection | Dalil Tounes',
      description: 'Access social assistance services in Tunisia: CNSS, CNRPS, family allowances, assistance for people with disabilities, child protection.'
    },
    it: {
      title: 'Assistenza Sociale in Tunisia - CNSS, CNRPS, Assegni, Protezione | Dalil Tounes',
      description: 'Accedi ai servizi di assistenza sociale in Tunisia: CNSS, CNRPS, assegni familiari, assistenza per persone con disabilità, protezione dell\'infanzia.'
    },
    ru: {
      title: 'Социальная Помощь в Тунисе - CNSS, CNRPS, Пособия, Защита | Dalil Tounes',
      description: 'Доступ к услугам социальной помощи в Тунисе: CNSS, CNRPS, семейные пособия, помощь людям с ограниченными возможностями, защита детей.'
    }
  },

  // === BUSINESSES ===
  businesses: {
    fr: {
      title: 'Entreprises en Tunisie - Annuaire Professionnel Complet | Dalil Tounes',
      description: 'Annuaire des entreprises tunisiennes : commerces, services, artisans, PME, industries. Trouvez des fournisseurs et partenaires B2B dans toutes les villes de Tunisie.'
    },
    ar: {
      title: 'الشركات في تونس - الدليل المهني الشامل | دليل تونس',
      description: 'دليل الشركات التونسية: التجارة، الخدمات، الحرفيون، المؤسسات الصغيرة، الصناعات. ابحث عن الموردين والشركاء B2B في جميع مدن تونس.'
    },
    en: {
      title: 'Businesses in Tunisia - Complete Professional Directory | Dalil Tounes',
      description: 'Directory of Tunisian businesses: commerce, services, craftsmen, SMEs, industries. Find suppliers and B2B partners in all cities of Tunisia.'
    },
    it: {
      title: 'Aziende in Tunisia - Elenco Professionale Completo | Dalil Tounes',
      description: 'Elenco delle aziende tunisine: commercio, servizi, artigiani, PMI, industrie. Trova fornitori e partner B2B in tutte le città della Tunisia.'
    },
    ru: {
      title: 'Предприятия в Тунисе - Полный Профессиональный Справочник | Dalil Tounes',
      description: 'Справочник тунисских предприятий: торговля, услуги, ремесленники, МСП, промышленность. Найдите поставщиков и B2B партнеров во всех городах Туниса.'
    }
  },

  // === LEISURE ===
  leisure: {
    fr: {
      title: 'Loisirs et Événements en Tunisie - Sorties, Culture, Activités | Dalil Tounes',
      description: 'Découvrez les événements, sorties et activités de loisirs en Tunisie : festivals, concerts, expositions, sports, tourisme. Agenda culturel complet.'
    },
    ar: {
      title: 'الترفيه والفعاليات في تونس - النزهات والثقافة والأنشطة | دليل تونس',
      description: 'اكتشف الأحداث والنزهات والأنشطة الترفيهية في تونس: المهرجانات، الحفلات، المعارض، الرياضة، السياحة. أجندة ثقافية كاملة.'
    },
    en: {
      title: 'Leisure and Events in Tunisia - Outings, Culture, Activities | Dalil Tounes',
      description: 'Discover events, outings and leisure activities in Tunisia: festivals, concerts, exhibitions, sports, tourism. Complete cultural agenda.'
    },
    it: {
      title: 'Svago ed Eventi in Tunisia - Uscite, Cultura, Attività | Dalil Tounes',
      description: 'Scopri eventi, uscite e attività di svago in Tunisia: festival, concerti, mostre, sport, turismo. Agenda culturale completa.'
    },
    ru: {
      title: 'Досуг и Мероприятия в Тунисе - Выходы, Культура, Активности | Dalil Tounes',
      description: 'Откройте для себя события, выходы и досуговые мероприятия в Тунисе: фестивали, концерты, выставки, спорт, туризм. Полная культурная программа.'
    }
  }
};

/**
 * Génère les meta-tags pour une page donnée
 */
export function generateMetaTags(
  page: string,
  language: Language,
  options?: {
    city?: string;
    category?: string;
    customTitle?: string;
    customDescription?: string;
  }
): MetaTags {
  const template = metaTemplates[page]?.[language];

  if (!template) {
    return {
      title: 'Dalil Tounes',
      description: 'Guide des services en Tunisie',
      keywords: ''
    };
  }

  let title = options?.customTitle || template.title;
  let description = options?.customDescription || template.description;

  // Ajouter la ville si fournie
  if (options?.city) {
    const cityText = {
      fr: ` - ${options.city}`,
      ar: ` - ${options.city}`,
      en: ` - ${options.city}`,
      it: ` - ${options.city}`,
      ru: ` - ${options.city}`
    }[language];

    title = title.replace(' | Dalil Tounes', `${cityText} | Dalil Tounes`);
  }

  // Générer les mots-clés
  const category = options?.category || page;
  const keywords = getKeywordsString(category, language, 25);

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description
  };
}

/**
 * Génère les meta-tags pour une fiche entreprise
 */
export function generateBusinessMetaTags(
  businessName: string,
  category: string,
  city: string,
  language: Language
): MetaTags {
  const templates = {
    fr: {
      title: `${businessName} - ${category} à ${city} | Dalil Tounes`,
      description: `Découvrez ${businessName}, spécialiste en ${category} à ${city}. Coordonnées, horaires, services et avis clients sur Dalil Tounes.`
    },
    ar: {
      title: `${businessName} - ${category} في ${city} | دليل تونس`,
      description: `اكتشف ${businessName}، متخصص في ${category} في ${city}. معلومات الاتصال، الساعات، الخدمات وآراء العملاء على دليل تونس.`
    },
    en: {
      title: `${businessName} - ${category} in ${city} | Dalil Tounes`,
      description: `Discover ${businessName}, specialist in ${category} in ${city}. Contact details, hours, services and customer reviews on Dalil Tounes.`
    },
    it: {
      title: `${businessName} - ${category} a ${city} | Dalil Tounes`,
      description: `Scopri ${businessName}, specialista in ${category} a ${city}. Dettagli di contatto, orari, servizi e recensioni dei clienti su Dalil Tounes.`
    },
    ru: {
      title: `${businessName} - ${category} в ${city} | Dalil Tounes`,
      description: `Откройте ${businessName}, специалист по ${category} в ${city}. Контактные данные, часы работы, услуги и отзывы клиентов на Dalil Tounes.`
    }
  };

  const template = templates[language];
  const keywords = getKeywordsString('businesses', language, 15) + `, ${businessName}, ${city}, ${category}`;

  return {
    title: template.title,
    description: template.description,
    keywords,
    ogTitle: template.title,
    ogDescription: template.description
  };
}
