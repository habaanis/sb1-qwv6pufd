/**
 * Dictionnaire de mots-clés SEO multilingue
 * Pour optimiser le référencement dans les 5 langues
 */

import { Language } from '../i18n';

/**
 * Structure des mots-clés par catégorie et langue
 */
export interface SEOKeywords {
  primary: string[];      // Mots-clés principaux
  secondary: string[];    // Mots-clés secondaires/synonymes
  locations: string[];    // Villes et gouvernorats
  phrases: string[];      // Phrases longue traîne
}

/**
 * Dictionnaire complet des mots-clés par catégorie
 */
export const seoKeywordsDictionary: Record<string, Record<Language, SEOKeywords>> = {
  // === JUSTICE ===
  justice: {
    fr: {
      primary: ['avocat', 'notaire', 'huissier', 'tribunal', 'justice'],
      secondary: ['divorce', 'immobilier', 'droit', 'juridique', 'contentieux', 'succession', 'contrat', 'procès'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul', 'Ariana'],
      phrases: [
        'avocat divorce Sousse',
        'notaire immobilier Mahdia',
        'huissier de justice Tunis',
        'tribunal de première instance',
        'avocat droit immobilier Tunisie'
      ]
    },
    ar: {
      primary: ['محامي', 'عدل منفذ', 'موثق', 'محكمة', 'عدالة'],
      secondary: ['طلاق', 'عقارات', 'قانون', 'قضايا', 'نزاع', 'إرث', 'عقد', 'دعوى'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'بنزرت', 'نابل', 'أريانة'],
      phrases: [
        'محامي طلاق سوسة',
        'موثق عقارات المهدية',
        'عدل منفذ تونس',
        'محكمة ابتدائية',
        'محامي قانون عقاري تونس'
      ]
    },
    en: {
      primary: ['lawyer', 'notary', 'bailiff', 'court', 'justice'],
      secondary: ['divorce', 'real estate', 'law', 'legal', 'litigation', 'inheritance', 'contract', 'lawsuit'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul', 'Ariana'],
      phrases: [
        'divorce lawyer Sousse',
        'real estate notary Mahdia',
        'bailiff Tunis',
        'court of first instance',
        'real estate lawyer Tunisia'
      ]
    },
    it: {
      primary: ['avvocato', 'notaio', 'ufficiale giudiziario', 'tribunale', 'giustizia'],
      secondary: ['divorzio', 'immobiliare', 'diritto', 'legale', 'contenzioso', 'successione', 'contratto', 'processo'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul', 'Ariana'],
      phrases: [
        'avvocato divorzista Sousse',
        'notaio immobiliare Mahdia',
        'ufficiale giudiziario Tunisi',
        'tribunale di prima istanza',
        'avvocato immobiliare Tunisia'
      ]
    },
    ru: {
      primary: ['адвокат', 'нотариус', 'судебный пристав', 'суд', 'правосудие'],
      secondary: ['развод', 'недвижимость', 'право', 'юридический', 'спор', 'наследство', 'контракт', 'иск'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Бизерта', 'Набуль', 'Ариана'],
      phrases: [
        'адвокат по разводам Сус',
        'нотариус недвижимости Махдия',
        'судебный пристав Тунис',
        'суд первой инстанции',
        'адвокат по недвижимости Тунис'
      ]
    }
  },

  // === SOCIAL ===
  social: {
    fr: {
      primary: ['aide sociale', 'famille', 'CNSS', 'CNRPS', 'handicap', 'protection enfance'],
      secondary: ['allocation', 'assistance', 'solidarité', 'soutien', 'vulnerable', 'aide financière', 'pension', 'retraite'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Kairouan', 'Gabès', 'Bizerte'],
      phrases: [
        'aide sociale Tunis',
        'allocation familiale CNSS',
        'protection enfance Mahdia',
        'aide handicap Sousse',
        'pension retraite CNRPS'
      ]
    },
    ar: {
      primary: ['مساعدة اجتماعية', 'عائلة', 'الصندوق الوطني للضمان الاجتماعي', 'الصندوق الوطني للتقاعد', 'إعاقة', 'حماية الطفولة'],
      secondary: ['منحة', 'مساعدة', 'تضامن', 'دعم', 'ضعيف', 'مساعدة مالية', 'معاش', 'تقاعد'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'القيروان', 'قابس', 'بنزرت'],
      phrases: [
        'مساعدة اجتماعية تونس',
        'منحة عائلية الصندوق الوطني',
        'حماية الطفولة المهدية',
        'مساعدة ذوي الإعاقة سوسة',
        'معاش تقاعد'
      ]
    },
    en: {
      primary: ['social assistance', 'family', 'CNSS', 'CNRPS', 'disability', 'child protection'],
      secondary: ['allowance', 'assistance', 'solidarity', 'support', 'vulnerable', 'financial aid', 'pension', 'retirement'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Kairouan', 'Gabes', 'Bizerte'],
      phrases: [
        'social assistance Tunis',
        'family allowance CNSS',
        'child protection Mahdia',
        'disability support Sousse',
        'retirement pension CNRPS'
      ]
    },
    it: {
      primary: ['assistenza sociale', 'famiglia', 'CNSS', 'CNRPS', 'disabilità', 'protezione infanzia'],
      secondary: ['assegno', 'assistenza', 'solidarietà', 'sostegno', 'vulnerabile', 'aiuto finanziario', 'pensione', 'ritiro'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Kairouan', 'Gabes', 'Bizerte'],
      phrases: [
        'assistenza sociale Tunisi',
        'assegni familiari CNSS',
        'protezione infanzia Mahdia',
        'sostegno disabilità Sousse',
        'pensione di vecchiaia CNRPS'
      ]
    },
    ru: {
      primary: ['социальная помощь', 'семья', 'CNSS', 'CNRPS', 'инвалидность', 'защита детей'],
      secondary: ['пособие', 'помощь', 'солидарность', 'поддержка', 'уязвимый', 'финансовая помощь', 'пенсия', 'пенсионный'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Кайруан', 'Габес', 'Бизерта'],
      phrases: [
        'социальная помощь Тунис',
        'семейное пособие CNSS',
        'защита детей Махдия',
        'помощь инвалидам Сус',
        'пенсия CNRPS'
      ]
    }
  },

  // === SANTE ===
  health: {
    fr: {
      primary: ['médecin', 'pharmacie de garde', 'urgence', 'clinique', 'hôpital', 'dentiste'],
      secondary: ['santé', 'docteur', 'médical', 'soins', 'consultation', 'spécialiste', 'généraliste', 'pédiatre', 'gynécologue'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Bizerte', 'Gabès'],
      phrases: [
        'médecin généraliste Sousse',
        'pharmacie de garde Mahdia',
        'urgence médicale Tunis',
        'clinique privée Sfax',
        'dentiste Monastir',
        'hôpital régional',
        'consultation médicale'
      ]
    },
    ar: {
      primary: ['طبيب', 'صيدلية مناوبة', 'طوارئ', 'عيادة', 'مستشفى', 'طبيب أسنان'],
      secondary: ['صحة', 'دكتور', 'طبي', 'رعاية', 'استشارة', 'مختص', 'طبيب عام', 'طبيب أطفال', 'طبيب نساء'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'نابل', 'بنزرت', 'قابس'],
      phrases: [
        'طبيب عام سوسة',
        'صيدلية مناوبة المهدية',
        'طوارئ طبية تونس',
        'عيادة خاصة صفاقس',
        'طبيب أسنان المنستير',
        'مستشفى جهوي',
        'استشارة طبية'
      ]
    },
    en: {
      primary: ['doctor', 'pharmacy on duty', 'emergency', 'clinic', 'hospital', 'dentist'],
      secondary: ['health', 'physician', 'medical', 'care', 'consultation', 'specialist', 'general practitioner', 'pediatrician', 'gynecologist'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Bizerte', 'Gabes'],
      phrases: [
        'general practitioner Sousse',
        'pharmacy on duty Mahdia',
        'medical emergency Tunis',
        'private clinic Sfax',
        'dentist Monastir',
        'regional hospital',
        'medical consultation'
      ]
    },
    it: {
      primary: ['medico', 'farmacia di turno', 'emergenza', 'clinica', 'ospedale', 'dentista'],
      secondary: ['salute', 'dottore', 'medico', 'cure', 'consulto', 'specialista', 'medico generico', 'pediatra', 'ginecologo'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Bizerte', 'Gabes'],
      phrases: [
        'medico generico Sousse',
        'farmacia di turno Mahdia',
        'emergenza medica Tunisi',
        'clinica privata Sfax',
        'dentista Monastir',
        'ospedale regionale',
        'consulto medico'
      ]
    },
    ru: {
      primary: ['врач', 'дежурная аптека', 'скорая помощь', 'клиника', 'больница', 'стоматолог'],
      secondary: ['здоровье', 'доктор', 'медицинский', 'уход', 'консультация', 'специалист', 'терапевт', 'педиатр', 'гинеколог'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Набуль', 'Бизерта', 'Габес'],
      phrases: [
        'врач общей практики Сус',
        'дежурная аптека Махдия',
        'скорая медицинская помощь Тунис',
        'частная клиника Сфакс',
        'стоматолог Монастир',
        'региональная больница',
        'медицинская консультация'
      ]
    }
  },

  // === EDUCATION ===
  education: {
    fr: {
      primary: ['école', 'collège', 'lycée', 'université', 'formation', 'éducation'],
      secondary: ['enseignement', 'étude', 'diplôme', 'cours', 'primaire', 'secondaire', 'supérieur', 'privé', 'public'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Kairouan'],
      phrases: [
        'école privée Sousse',
        'lycée Mahdia',
        'université Tunis',
        'formation professionnelle',
        'cours particuliers',
        'enseignement primaire'
      ]
    },
    ar: {
      primary: ['مدرسة', 'إعدادية', 'ثانوية', 'جامعة', 'تكوين', 'تعليم'],
      secondary: ['تدريس', 'دراسة', 'شهادة', 'دروس', 'ابتدائي', 'ثانوي', 'عالي', 'خاص', 'عمومي'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'نابل', 'القيروان'],
      phrases: [
        'مدرسة خاصة سوسة',
        'ثانوية المهدية',
        'جامعة تونس',
        'تكوين مهني',
        'دروس خصوصية',
        'تعليم ابتدائي'
      ]
    },
    en: {
      primary: ['school', 'middle school', 'high school', 'university', 'training', 'education'],
      secondary: ['teaching', 'study', 'degree', 'course', 'primary', 'secondary', 'higher', 'private', 'public'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Kairouan'],
      phrases: [
        'private school Sousse',
        'high school Mahdia',
        'university Tunis',
        'vocational training',
        'private lessons',
        'primary education'
      ]
    },
    it: {
      primary: ['scuola', 'scuola media', 'liceo', 'università', 'formazione', 'istruzione'],
      secondary: ['insegnamento', 'studio', 'diploma', 'corso', 'primaria', 'secondaria', 'superiore', 'privata', 'pubblica'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Kairouan'],
      phrases: [
        'scuola privata Sousse',
        'liceo Mahdia',
        'università Tunisi',
        'formazione professionale',
        'lezioni private',
        'istruzione primaria'
      ]
    },
    ru: {
      primary: ['школа', 'средняя школа', 'лицей', 'университет', 'обучение', 'образование'],
      secondary: ['преподавание', 'учеба', 'диплом', 'курс', 'начальный', 'средний', 'высший', 'частный', 'государственный'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Набуль', 'Кайруан'],
      phrases: [
        'частная школа Сус',
        'лицей Махдия',
        'университет Тунис',
        'профессиональное обучение',
        'частные уроки',
        'начальное образование'
      ]
    }
  },

  // === BUSINESSES / ENTREPRISES ===
  businesses: {
    fr: {
      primary: ['entreprise', 'commerce', 'société', 'business', 'service', 'professionnel'],
      secondary: ['annuaire', 'directory', 'fournisseur', 'prestataire', 'artisan', 'PME', 'startup', 'industrie'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Ariana', 'Ben Arous'],
      phrases: [
        'entreprises Tunis',
        'annuaire professionnel Tunisie',
        'commerce local Sousse',
        'fournisseurs Sfax',
        'services professionnels Mahdia'
      ]
    },
    ar: {
      primary: ['شركة', 'تجارة', 'مؤسسة', 'أعمال', 'خدمة', 'محترف'],
      secondary: ['دليل', 'مورد', 'مقدم خدمة', 'حرفي', 'مؤسسة صغيرة', 'ناشئة', 'صناعة'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'نابل', 'أريانة', 'بن عروس'],
      phrases: [
        'شركات تونس',
        'دليل المهنيين تونس',
        'تجارة محلية سوسة',
        'موردون صفاقس',
        'خدمات مهنية المهدية'
      ]
    },
    en: {
      primary: ['business', 'commerce', 'company', 'enterprise', 'service', 'professional'],
      secondary: ['directory', 'supplier', 'provider', 'craftsman', 'SME', 'startup', 'industry'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Ariana', 'Ben Arous'],
      phrases: [
        'businesses Tunis',
        'professional directory Tunisia',
        'local commerce Sousse',
        'suppliers Sfax',
        'professional services Mahdia'
      ]
    },
    it: {
      primary: ['azienda', 'commercio', 'società', 'impresa', 'servizio', 'professionale'],
      secondary: ['elenco', 'fornitore', 'prestatore', 'artigiano', 'PMI', 'startup', 'industria'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul', 'Ariana', 'Ben Arous'],
      phrases: [
        'aziende Tunisi',
        'elenco professionale Tunisia',
        'commercio locale Sousse',
        'fornitori Sfax',
        'servizi professionali Mahdia'
      ]
    },
    ru: {
      primary: ['предприятие', 'торговля', 'компания', 'бизнес', 'услуга', 'профессионал'],
      secondary: ['справочник', 'поставщик', 'провайдер', 'ремесленник', 'МСП', 'стартап', 'промышленность'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Набуль', 'Ариана', 'Бен Арус'],
      phrases: [
        'предприятия Тунис',
        'профессиональный справочник Тунис',
        'местная торговля Сус',
        'поставщики Сфакс',
        'профессиональные услуги Махдия'
      ]
    }
  },

  // === LOISIRS / LEISURE ===
  leisure: {
    fr: {
      primary: ['loisir', 'événement', 'sortie', 'activité', 'divertissement', 'culture'],
      secondary: ['festival', 'concert', 'exposition', 'spectacle', 'animation', 'sport', 'vacances', 'tourisme'],
      locations: ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Tozeur', 'Carthage', 'Sidi Bou Said'],
      phrases: [
        'événements Tunis',
        'sorties Sousse',
        'activités culturelles Hammamet',
        'festivals Tunisie',
        'tourisme Djerba'
      ]
    },
    ar: {
      primary: ['ترفيه', 'حدث', 'نزهة', 'نشاط', 'تسلية', 'ثقافة'],
      secondary: ['مهرجان', 'حفلة', 'معرض', 'عرض', 'تحريك', 'رياضة', 'عطلة', 'سياحة'],
      locations: ['تونس', 'سوسة', 'الحمامات', 'جربة', 'توزر', 'قرطاج', 'سيدي بو سعيد'],
      phrases: [
        'أحداث تونس',
        'نزهات سوسة',
        'أنشطة ثقافية الحمامات',
        'مهرجانات تونس',
        'سياحة جربة'
      ]
    },
    en: {
      primary: ['leisure', 'event', 'outing', 'activity', 'entertainment', 'culture'],
      secondary: ['festival', 'concert', 'exhibition', 'show', 'animation', 'sport', 'vacation', 'tourism'],
      locations: ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Tozeur', 'Carthage', 'Sidi Bou Said'],
      phrases: [
        'events Tunis',
        'outings Sousse',
        'cultural activities Hammamet',
        'festivals Tunisia',
        'tourism Djerba'
      ]
    },
    it: {
      primary: ['svago', 'evento', 'uscita', 'attività', 'intrattenimento', 'cultura'],
      secondary: ['festival', 'concerto', 'mostra', 'spettacolo', 'animazione', 'sport', 'vacanza', 'turismo'],
      locations: ['Tunisi', 'Sousse', 'Hammamet', 'Djerba', 'Tozeur', 'Cartagine', 'Sidi Bou Said'],
      phrases: [
        'eventi Tunisi',
        'uscite Sousse',
        'attività culturali Hammamet',
        'festival Tunisia',
        'turismo Djerba'
      ]
    },
    ru: {
      primary: ['досуг', 'событие', 'выход', 'активность', 'развлечение', 'культура'],
      secondary: ['фестиваль', 'концерт', 'выставка', 'шоу', 'анимация', 'спорт', 'отпуск', 'туризм'],
      locations: ['Тунис', 'Сус', 'Хаммамет', 'Джерба', 'Тозер', 'Карфаген', 'Сиди-Бу-Саид'],
      phrases: [
        'события Тунис',
        'выходы Сус',
        'культурные мероприятия Хаммамет',
        'фестивали Тунис',
        'туризм Джерба'
      ]
    }
  },

  // === AUTOMOBILE ===
  automobile: {
    fr: {
      primary: ['garage', 'mécanique', 'automobile', 'voiture', 'réparation auto'],
      secondary: ['tôlerie', 'peinture', 'lavage auto', 'pièces de rechange', 'diagnostic électronique', 'vente de voitures'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'garage mécanique Sousse',
        'tôlerie peinture Tunis',
        'lavage auto Sfax',
        'pièces de rechange Mahdia',
        'diagnostic électronique automobile'
      ]
    },
    ar: {
      primary: ['ميكانيك', 'سيارات', 'إصلاح', 'ورشة'],
      secondary: ['حدادة', 'دهان', 'غسيل سيارات', 'قطع غيار', 'تشخيص إلكتروني', 'بيع سيارات'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'بنزرت', 'نابل'],
      phrases: [
        'ميكانيك سيارات سوسة',
        'حدادة ودهان تونس',
        'غسيل سيارات صفاقس',
        'قطع غيار المهدية',
        'تشخيص إلكتروني سيارات'
      ]
    },
    en: {
      primary: ['garage', 'mechanic', 'automotive', 'car', 'auto repair'],
      secondary: ['bodywork', 'paint', 'car wash', 'spare parts', 'electronic diagnostic', 'car sales'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'mechanic garage Sousse',
        'bodywork and paint Tunis',
        'car wash Sfax',
        'spare parts Mahdia',
        'electronic automotive diagnostic'
      ]
    },
    it: {
      primary: ['officina', 'meccanica', 'automobili', 'auto', 'riparazione'],
      secondary: ['carrozzeria', 'verniciatura', 'lavaggio auto', 'pezzi di ricambio', 'diagnosi elettronica', 'vendita auto'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'officina meccanica Sousse',
        'carrozzeria e verniciatura Tunisi',
        'lavaggio auto Sfax',
        'pezzi di ricambio Mahdia',
        'diagnosi elettronica auto'
      ]
    },
    ru: {
      primary: ['автосервис', 'механика', 'автомобили', 'ремонт авто'],
      secondary: ['кузовные работы', 'покраска', 'автомойка', 'запчасти', 'электронная диагностика', 'продажа авто'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Бизерта', 'Набуль'],
      phrases: [
        'автосервис Сус',
        'кузовные работы Тунис',
        'автомойка Сфакс',
        'запчасти Махдия',
        'электронная диагностика авто'
      ]
    }
  },

  // === ALIMENTATION ===
  alimentation: {
    fr: {
      primary: ['alimentation', 'épicerie', 'supermarché', 'produits alimentaires'],
      secondary: ['boulangerie', 'pâtisserie', 'boucherie', 'fruits et légumes', 'produits bio', 'supérette'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte'],
      phrases: [
        'supermarché Sousse',
        'boulangerie Tunis',
        'boucherie Sfax',
        'fruits et légumes Mahdia',
        'produits bio Tunisie'
      ]
    },
    ar: {
      primary: ['تغذية', 'بقالة', 'ماركت', 'مواد غذائية'],
      secondary: ['مخبزة', 'حلويات', 'قصابة', 'خضر وغلال', 'منتجات بيولوجية', 'حانوت'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'بنزرت'],
      phrases: [
        'ماركت سوسة',
        'مخبزة تونس',
        'قصابة صفاقس',
        'خضر وغلال المهدية',
        'منتجات بيولوجية تونس'
      ]
    },
    en: {
      primary: ['food', 'grocery', 'supermarket', 'food products'],
      secondary: ['bakery', 'pastry', 'butcher', 'fruits and vegetables', 'organic products', 'convenience store'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte'],
      phrases: [
        'supermarket Sousse',
        'bakery Tunis',
        'butcher Sfax',
        'fruits and vegetables Mahdia',
        'organic products Tunisia'
      ]
    },
    it: {
      primary: ['alimentazione', 'alimentari', 'supermercato', 'prodotti alimentari'],
      secondary: ['panetteria', 'pasticceria', 'macelleria', 'frutta e verdura', 'prodotti bio', 'minimarket'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte'],
      phrases: [
        'supermercato Sousse',
        'panetteria Tunisi',
        'macelleria Sfax',
        'frutta e verdura Mahdia',
        'prodotti bio Tunisia'
      ]
    },
    ru: {
      primary: ['продукты', 'бакалея', 'супермаркет', 'продовольственные товары'],
      secondary: ['пекарня', 'кондитерская', 'мясная лавка', 'фрукты и овощи', 'органические продукты', 'магазин'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Бизерта'],
      phrases: [
        'супермаркет Сус',
        'пекарня Тунис',
        'мясная лавка Сфакс',
        'фрукты и овощи Махдия',
        'органические продукты Тунис'
      ]
    }
  },

  // === ÉLECTRONIQUE & COMPOSANTS ===
  electronique: {
    fr: {
      primary: ['électronique', 'composants', 'circuits', 'maintenance électronique'],
      secondary: ['réparation', 'pièces électroniques', 'électricité', 'installation', 'diagnostic'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Nabeul'],
      phrases: [
        'maintenance électronique Tunis',
        'composants électroniques Sousse',
        'réparation électronique Sfax',
        'pièces électroniques Monastir'
      ]
    },
    ar: {
      primary: ['إلكترونيات', 'مكونات', 'دوائر', 'صيانة إلكترونية'],
      secondary: ['إصلاح', 'قطع إلكترونية', 'كهرباء', 'تركيب', 'تشخيص'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المنستير', 'نابل'],
      phrases: [
        'صيانة إلكترونية تونس',
        'مكونات إلكترونية سوسة',
        'إصلاح إلكتروني صفاقس',
        'قطع إلكترونية المنستير'
      ]
    },
    en: {
      primary: ['electronics', 'components', 'circuits', 'electronic maintenance'],
      secondary: ['repair', 'electronic parts', 'electricity', 'installation', 'diagnostic'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Nabeul'],
      phrases: [
        'electronic maintenance Tunis',
        'electronic components Sousse',
        'electronic repair Sfax',
        'electronic parts Monastir'
      ]
    },
    it: {
      primary: ['elettronica', 'componenti', 'circuiti', 'manutenzione elettronica'],
      secondary: ['riparazione', 'parti elettroniche', 'elettricità', 'installazione', 'diagnosi'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Monastir', 'Nabeul'],
      phrases: [
        'manutenzione elettronica Tunisi',
        'componenti elettronici Sousse',
        'riparazione elettronica Sfax',
        'parti elettroniche Monastir'
      ]
    },
    ru: {
      primary: ['электроника', 'компоненты', 'схемы', 'техобслуживание электроники'],
      secondary: ['ремонт', 'электронные детали', 'электричество', 'установка', 'диагностика'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Монастир', 'Набуль'],
      phrases: [
        'техобслуживание электроники Тунис',
        'электронные компоненты Сус',
        'ремонт электроники Сфакс',
        'электронные детали Монастир'
      ]
    }
  },

  // === ARTISANS & BTP ===
  artisans_btp: {
    fr: {
      primary: ['plomberie', 'électricité', 'maçonnerie', 'peinture', 'climatisation', 'menuiserie'],
      secondary: ['peintre en bâtiment', 'électricien', 'plombier', 'maçon', 'menuisier bois', 'menuisier alu', 'climatiseur'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'plombier Sousse',
        'électricien Tunis',
        'peintre en bâtiment Sfax',
        'maçonnerie Mahdia',
        'climatisation Monastir',
        'menuisier Bizerte'
      ]
    },
    ar: {
      primary: ['سباكة', 'كهرباء', 'بناء', 'دهان', 'تكييف', 'نجارة'],
      secondary: ['دهان مباني', 'كهربائي', 'سباك', 'بناء', 'نجار خشب', 'نجار ألمنيوم', 'مكيف'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'بنزرت', 'نابل'],
      phrases: [
        'سباك سوسة',
        'كهربائي تونس',
        'دهان مباني صفاقس',
        'بناء المهدية',
        'تكييف المنستير',
        'نجار بنزرت'
      ]
    },
    en: {
      primary: ['plumbing', 'electricity', 'masonry', 'painting', 'air conditioning', 'carpentry'],
      secondary: ['house painter', 'electrician', 'plumber', 'mason', 'wood carpenter', 'aluminum carpenter', 'AC installer'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'plumber Sousse',
        'electrician Tunis',
        'house painter Sfax',
        'masonry Mahdia',
        'air conditioning Monastir',
        'carpenter Bizerte'
      ]
    },
    it: {
      primary: ['idraulica', 'elettricità', 'muratura', 'imbianchino', 'climatizzazione', 'falegname'],
      secondary: ['imbianchino edile', 'elettricista', 'idraulico', 'muratore', 'falegname legno', 'falegname alluminio', 'installatore AC'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'idraulico Sousse',
        'elettricista Tunisi',
        'imbianchino Sfax',
        'muratura Mahdia',
        'climatizzazione Monastir',
        'falegname Bizerte'
      ]
    },
    ru: {
      primary: ['сантехника', 'электрика', 'каменные работы', 'маляр', 'кондиционирование', 'плотник'],
      secondary: ['маляр по дому', 'электрик', 'сантехник', 'каменщик', 'плотник по дереву', 'плотник по алюминию', 'установщик кондиционеров'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Бизерта', 'Набуль'],
      phrases: [
        'сантехник Сус',
        'электрик Тунис',
        'маляр Сфакс',
        'каменные работы Махдия',
        'кондиционирование Монастир',
        'плотник Бизерта'
      ]
    }
  },

  // === INFORMATIQUE & TÉLÉCOM ===
  informatique: {
    fr: {
      primary: ['informatique', 'télécom', 'ordinateur', 'téléphone', 'réparation PC'],
      secondary: ['vente téléphones', 'développement web', 'caméras surveillance', 'hébergement cloud', 'réparation laptop'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul'],
      phrases: [
        'réparation PC Sousse',
        'vente téléphones Tunis',
        'développement web Sfax',
        'caméras surveillance Mahdia',
        'hébergement cloud Tunisie'
      ]
    },
    ar: {
      primary: ['معلوماتية', 'اتصالات', 'حاسوب', 'هاتف', 'إصلاح حواسيب'],
      secondary: ['بيع هواتف', 'تطوير الويب', 'كاميرات مراقبة', 'استضافة سحابية', 'إصلاح لابتوب'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'نابل'],
      phrases: [
        'إصلاح حواسيب سوسة',
        'بيع هواتف تونس',
        'تطوير الويب صفاقس',
        'كاميرات مراقبة المهدية',
        'استضافة سحابية تونس'
      ]
    },
    en: {
      primary: ['IT', 'telecom', 'computer', 'phone', 'PC repair'],
      secondary: ['phone sales', 'web development', 'CCTV cameras', 'cloud hosting', 'laptop repair'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul'],
      phrases: [
        'PC repair Sousse',
        'phone sales Tunis',
        'web development Sfax',
        'CCTV cameras Mahdia',
        'cloud hosting Tunisia'
      ]
    },
    it: {
      primary: ['informatica', 'telecom', 'computer', 'telefono', 'riparazione PC'],
      secondary: ['vendita telefoni', 'sviluppo web', 'telecamere sorveglianza', 'hosting cloud', 'riparazione laptop'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Nabeul'],
      phrases: [
        'riparazione PC Sousse',
        'vendita telefoni Tunisi',
        'sviluppo web Sfax',
        'telecamere sorveglianza Mahdia',
        'hosting cloud Tunisia'
      ]
    },
    ru: {
      primary: ['IT', 'телеком', 'компьютер', 'телефон', 'ремонт ПК'],
      secondary: ['продажа телефонов', 'веб-разработка', 'камеры видеонаблюдения', 'облачный хостинг', 'ремонт ноутбуков'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Набуль'],
      phrases: [
        'ремонт ПК Сус',
        'продажа телефонов Тунис',
        'веб-разработка Сфакс',
        'камеры видеонаблюдения Махдия',
        'облачный хостинг Тунис'
      ]
    }
  },

  // === TOURISME & HÉBERGEMENT ===
  tourisme: {
    fr: {
      primary: ['tourisme', 'hôtel', 'maison d\'hôtes', 'agence de voyage', 'hébergement'],
      secondary: ['dar', 'hôtel typique', 'site archéologique', 'musée national', 'rooftops', 'terrasses'],
      locations: ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Tozeur', 'Carthage', 'Sidi Bou Said'],
      phrases: [
        'maison d\'hôtes Sidi Bou Said',
        'hôtel typique Djerba',
        'agence de voyage Tunis',
        'site archéologique Carthage',
        'rooftops Tunis'
      ]
    },
    ar: {
      primary: ['سياحة', 'فندق', 'دار ضيافة', 'وكالة أسفار', 'إقامة'],
      secondary: ['دار', 'فندق سياحي', 'موقع أثري', 'متحف وطني', 'أسطح', 'مناظر'],
      locations: ['تونس', 'سوسة', 'الحمامات', 'جربة', 'توزر', 'قرطاج', 'سيدي بو سعيد'],
      phrases: [
        'دار ضيافة سيدي بو سعيد',
        'فندق سياحي جربة',
        'وكالة أسفار تونس',
        'موقع أثري قرطاج',
        'أسطح تونس'
      ]
    },
    en: {
      primary: ['tourism', 'hotel', 'guest house', 'travel agency', 'accommodation'],
      secondary: ['dar', 'boutique hotel', 'archeological site', 'national museum', 'rooftops', 'terraces'],
      locations: ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Tozeur', 'Carthage', 'Sidi Bou Said'],
      phrases: [
        'guest house Sidi Bou Said',
        'boutique hotel Djerba',
        'travel agency Tunis',
        'archeological site Carthage',
        'rooftops Tunis'
      ]
    },
    it: {
      primary: ['turismo', 'hotel', 'casa vacanze', 'agenzia di viaggi', 'alloggio'],
      secondary: ['dar', 'hotel tipico', 'sito archeologico', 'museo nazionale', 'terrazze panoramiche'],
      locations: ['Tunisi', 'Sousse', 'Hammamet', 'Djerba', 'Tozeur', 'Cartagine', 'Sidi Bou Said'],
      phrases: [
        'casa vacanze Sidi Bou Said',
        'hotel tipico Djerba',
        'agenzia di viaggi Tunisi',
        'sito archeologico Cartagine',
        'terrazze Tunisi'
      ]
    },
    ru: {
      primary: ['туризм', 'отель', 'гостевой дом', 'турагентство', 'жилье'],
      secondary: ['дар', 'бутик-отель', 'археологические раскопки', 'национальный музей', 'крыши', 'террасы'],
      locations: ['Тунис', 'Сус', 'Хаммамет', 'Джерба', 'Тозер', 'Карфаген', 'Сиди-Бу-Саид'],
      phrases: [
        'гостевой дом Сиди-Бу-Саид',
        'бутик-отель Джерба',
        'турагентство Тунис',
        'археологические раскопки Карфаген',
        'крыши Тунис'
      ]
    }
  },

  // === BANQUE & ASSURANCE ===
  banque: {
    fr: {
      primary: ['banque', 'assurance', 'bureau de change', 'finance'],
      secondary: ['agence bancaire', 'change', 'crédit', 'assurance auto', 'assurance santé'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'agence bancaire Sousse',
        'bureau de change Tunis',
        'assurance auto Sfax',
        'crédit Mahdia',
        'assurance santé Tunisie'
      ]
    },
    ar: {
      primary: ['بنك', 'تأمين', 'مكتب صرف', 'مالية'],
      secondary: ['وكالة بنكية', 'صرف', 'قرض', 'تأمين سيارات', 'تأمين صحي'],
      locations: ['تونس', 'سوسة', 'صفاقس', 'المهدية', 'المنستير', 'بنزرت', 'نابل'],
      phrases: [
        'وكالة بنكية سوسة',
        'مكتب صرف تونس',
        'تأمين سيارات صفاقس',
        'قرض المهدية',
        'تأمين صحي تونس'
      ]
    },
    en: {
      primary: ['bank', 'insurance', 'currency exchange', 'finance'],
      secondary: ['bank branch', 'exchange', 'credit', 'car insurance', 'health insurance'],
      locations: ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'bank branch Sousse',
        'currency exchange Tunis',
        'car insurance Sfax',
        'credit Mahdia',
        'health insurance Tunisia'
      ]
    },
    it: {
      primary: ['banca', 'assicurazione', 'cambio valute', 'finanza'],
      secondary: ['filiale bancaria', 'cambio', 'credito', 'assicurazione auto', 'assicurazione sanitaria'],
      locations: ['Tunisi', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Bizerte', 'Nabeul'],
      phrases: [
        'filiale bancaria Sousse',
        'cambio valute Tunisi',
        'assicurazione auto Sfax',
        'credito Mahdia',
        'assicurazione sanitaria Tunisia'
      ]
    },
    ru: {
      primary: ['банк', 'страхование', 'обмен валюты', 'финансы'],
      secondary: ['банковское отделение', 'обмен', 'кредит', 'автострахование', 'медицинское страхование'],
      locations: ['Тунис', 'Сус', 'Сфакс', 'Махдия', 'Монастир', 'Бизерта', 'Набуль'],
      phrases: [
        'банковское отделение Сус',
        'обмен валюты Тунис',
        'автострахование Сфакс',
        'кредит Махдия',
        'медицинское страхование Тунис'
      ]
    }
  },

  // === IMMOBILIER ===
  immobilier: {
    fr: {
      primary: ['immobilier', 'agence immobilière', 'vente', 'location', 'appartement', 'maison'],
      secondary: ['terrain', 'villa', 'studio', 'promoteur immobilier', 'investissement'],
      locations: ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Sfax', 'Monastir', 'La Marsa'],
      phrases: [
        'agence immobilière Tunis',
        'vente appartement Sousse',
        'location maison Hammamet',
        'terrain à vendre Djerba',
        'promoteur immobilier Sfax'
      ]
    },
    ar: {
      primary: ['عقارات', 'وكالة عقارية', 'بيع', 'كراء', 'شقة', 'دار'],
      secondary: ['أرض', 'فيلا', 'ستوديو', 'مطور عقاري', 'استثمار'],
      locations: ['تونس', 'سوسة', 'الحمامات', 'جربة', 'صفاقس', 'المنستير', 'المرسى'],
      phrases: [
        'وكالة عقارية تونس',
        'بيع شقة سوسة',
        'كراء دار الحمامات',
        'أرض للبيع جربة',
        'مطور عقاري صفاقس'
      ]
    },
    en: {
      primary: ['real estate', 'real estate agency', 'sale', 'rental', 'apartment', 'house'],
      secondary: ['land', 'villa', 'studio', 'property developer', 'investment'],
      locations: ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Sfax', 'Monastir', 'La Marsa'],
      phrases: [
        'real estate agency Tunis',
        'apartment for sale Sousse',
        'house rental Hammamet',
        'land for sale Djerba',
        'property developer Sfax'
      ]
    },
    it: {
      primary: ['immobiliare', 'agenzia immobiliare', 'vendita', 'affitto', 'appartamento', 'casa'],
      secondary: ['terreno', 'villa', 'monolocale', 'promotore immobiliare', 'investimento'],
      locations: ['Tunisi', 'Sousse', 'Hammamet', 'Djerba', 'Sfax', 'Monastir', 'La Marsa'],
      phrases: [
        'agenzia immobiliare Tunisi',
        'vendita appartamento Sousse',
        'affitto casa Hammamet',
        'terreno in vendita Djerba',
        'promotore immobiliare Sfax'
      ]
    },
    ru: {
      primary: ['недвижимость', 'агентство недвижимости', 'продажа', 'аренда', 'квартира', 'дом'],
      secondary: ['земля', 'вилла', 'студия', 'застройщик', 'инвестиции'],
      locations: ['Тунис', 'Сус', 'Хаммамет', 'Джерба', 'Сфакс', 'Монастир', 'Ла Марса'],
      phrases: [
        'агентство недвижимости Тунис',
        'продажа квартиры Сус',
        'аренда дома Хаммамет',
        'земля на продажу Джерба',
        'застройщик Сфакс'
      ]
    }
  }
};

/**
 * Récupère les mots-clés pour une catégorie et langue donnée
 */
export function getKeywordsForCategory(category: string, language: Language): SEOKeywords | null {
  const categoryData = seoKeywordsDictionary[category.toLowerCase()];
  if (!categoryData) return null;
  return categoryData[language] || null;
}

/**
 * Génère une liste de mots-clés combinés (primaires + secondaires)
 */
export function getAllKeywords(category: string, language: Language): string[] {
  const keywords = getKeywordsForCategory(category, language);
  if (!keywords) return [];
  return [...keywords.primary, ...keywords.secondary];
}

/**
 * Génère une chaîne de mots-clés pour meta keywords
 */
export function getKeywordsString(category: string, language: Language, limit: number = 20): string {
  const keywords = getAllKeywords(category, language);
  return keywords.slice(0, limit).join(', ');
}

/**
 * Génère des phrases longue traîne pour le SEO
 */
export function getLongTailPhrases(category: string, language: Language): string[] {
  const keywords = getKeywordsForCategory(category, language);
  if (!keywords) return [];
  return keywords.phrases;
}
