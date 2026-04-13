import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/i18n';

export const categoryTranslations: Record<Language, Record<string, string>> = {
  fr: {
    // Entreprises
    finance: 'Finance & services bancaires',
    services_aux_entreprises: 'Services aux entreprises',
    transport_logistique: 'Transport & logistique',
    btp_construction: 'BTP / Construction',
    industrie: 'Industrie & fabrication',
    communication_marketing: 'Communication & marketing',
    informatique_telecom: 'Informatique & télécom',
    conseil_formation: 'Conseil & formation',
    evenementiel: 'Événementiel',
    agence_evenementielle: 'Agence événementielle',
    autre_activite_pro: 'Autre activité professionnelle',

    // Éducation
    ecole_primaire: 'École primaire',
    college_privee: 'Collège privé',
    lycee_privee: 'Lycée privé',
    ecole_privee: 'École privée',
    universites_instituts: 'Universités & Instituts',
    centre_langues: 'Centre de langues',
    centre_soutien: 'Centre de soutien scolaire',
    formation_professionnelle: 'Formation professionnelle',
    etablissement_prive: 'Établissement privé',
    etablissement_public: 'Établissement public',
    formation_adultes: 'Formation pour adultes',

    // Santé
    ambulance_privee: 'Ambulance privée',
    cabinet_dentaire: 'Cabinet dentaire',
    centre_bien_etre: 'Centre bien-être',
    centre_imagerie: 'Centre d\'imagerie',
    centre_medical: 'Centre médical',
    clinique: 'Clinique',
    hopital: 'Hôpital',
    kinesitherapie: 'Kinésithérapie',
    laboratoire_analyses: 'Laboratoire d\'analyses',
    ophtalmologie: 'Ophtalmologie',
    pharmacie: 'Pharmacie',
    pharmacie_nuit: 'Pharmacie de nuit',
    polyclinique: 'Polyclinique',
    veterinaire: 'Vétérinaire',

    // Magasins
    boutique_informatique: 'Boutique informatique',
    telephonie_mobile: 'Téléphonie mobile',
    pret_a_porter: 'Prêt-à-porter',
    vetements_homme: 'Vêtements homme',
    vetements_femme: 'Vêtements femme',
    chaussures: 'Chaussures',
    accessoires: 'Accessoires',
    parfumerie: 'Parfumerie',
    bijoux: 'Bijoux',
    electronique: 'Électronique',
    electromenager: 'Électroménager',
    quincaillerie: 'Quincaillerie',
    bricolage: 'Bricolage',
    jouets: 'Jouets',
    meubles: 'Meubles',
    articles_deco: 'Articles de déco',
    epicerie: 'Épicerie',
    magasin_sport: 'Magasin de sport',
    salon_coiffure: 'Salon de coiffure',
    coiffeur: 'Coiffeur',
    barbier: 'Barbier',
    esthetique: 'Esthétique',
    spa: 'Spa',
    cafe: 'Café',
    cuisine_locale: 'Cuisine locale',
    cafe_culturel: 'Café culturel',
    cafe_traditionnel: 'Café traditionnel',
    salon_the: 'Salon de thé',
    restaurant: 'Restaurant',
    cuisine_tunisienne: 'Cuisine tunisienne',

    // Loisirs
    saveurs_traditions: 'Saveurs & Traditions',
    musees_patrimoine: 'Musées & Patrimoine',
    escapades_nature: 'Escapades & Nature',
    festivals_artisanat: 'Festivals & Artisanat',
    sport_aventure: 'Sport & Aventure',
  },
  en: {
    // Entreprises
    finance: 'Finance & Banking Services',
    services_aux_entreprises: 'Business Services',
    transport_logistique: 'Transport & Logistics',
    btp_construction: 'Construction & Building',
    industrie: 'Industry & Manufacturing',
    communication_marketing: 'Communication & Marketing',
    informatique_telecom: 'IT & Telecoms',
    conseil_formation: 'Consulting & Training',
    evenementiel: 'Event Planning',
    agence_evenementielle: 'Event Agency',
    autre_activite_pro: 'Other Professional Activity',

    // Éducation
    ecole_primaire: 'Primary School',
    college_privee: 'Private Middle School',
    lycee_privee: 'Private High School',
    ecole_privee: 'Private School',
    universites_instituts: 'Universities & Institutes',
    centre_langues: 'Language Center',
    centre_soutien: 'Tutoring Center',
    formation_professionnelle: 'Professional Training',
    etablissement_prive: 'Private Institution',
    etablissement_public: 'Public Institution',
    formation_adultes: 'Adult Education',

    // Santé
    ambulance_privee: 'Private Ambulance',
    cabinet_dentaire: 'Dental Clinic',
    centre_bien_etre: 'Wellness Center',
    centre_imagerie: 'Imaging Center',
    centre_medical: 'Medical Center',
    clinique: 'Clinic',
    hopital: 'Hospital',
    kinesitherapie: 'Physiotherapy',
    laboratoire_analyses: 'Laboratory',
    ophtalmologie: 'Ophthalmology',
    pharmacie: 'Pharmacy',
    pharmacie_nuit: 'Night Pharmacy',
    polyclinique: 'Polyclinic',
    veterinaire: 'Veterinary',

    // Magasins
    boutique_informatique: 'Computer Shop',
    telephonie_mobile: 'Mobile Phone Store',
    pret_a_porter: 'Ready-to-Wear',
    vetements_homme: 'Men\'s Clothing',
    vetements_femme: 'Women\'s Clothing',
    chaussures: 'Shoes',
    accessoires: 'Accessories',
    parfumerie: 'Perfumery',
    bijoux: 'Jewelry',
    electronique: 'Electronics',
    electromenager: 'Home Appliances',
    quincaillerie: 'Hardware Store',
    bricolage: 'DIY Store',
    jouets: 'Toys',
    meubles: 'Furniture',
    articles_deco: 'Decoration Items',
    epicerie: 'Grocery Store',
    magasin_sport: 'Sports Store',
    salon_coiffure: 'Hair Salon',
    coiffeur: 'Hairdresser',
    barbier: 'Barber',
    esthetique: 'Beauty Salon',
    spa: 'Spa',
    cafe: 'Café',
    cuisine_locale: 'Local Cuisine',
    cafe_culturel: 'Cultural Café',
    cafe_traditionnel: 'Traditional Café',
    salon_the: 'Tea Room',
    restaurant: 'Restaurant',
    cuisine_tunisienne: 'Tunisian Cuisine',

    // Loisirs
    saveurs_traditions: 'Flavors & Traditions',
    musees_patrimoine: 'Museums & Heritage',
    escapades_nature: 'Nature Getaways',
    festivals_artisanat: 'Festivals & Crafts',
    sport_aventure: 'Sports & Adventure',
  },
  it: {
    // Entreprises
    finance: 'Finanza e Servizi Bancari',
    services_aux_entreprises: 'Servizi alle Imprese',
    transport_logistique: 'Trasporti e Logistica',
    btp_construction: 'Edilizia e Costruzioni',
    industrie: 'Industria e Produzione',
    communication_marketing: 'Comunicazione e Marketing',
    informatique_telecom: 'Informatica e Telecomunicazioni',
    conseil_formation: 'Consulenza e Formazione',
    evenementiel: 'Eventi',
    agence_evenementielle: 'Agenzia Eventi',
    autre_activite_pro: 'Altra Attività Professionale',

    // Éducation
    ecole_primaire: 'Scuola Primaria',
    college_privee: 'Scuola Media Privata',
    lycee_privee: 'Liceo Privato',
    ecole_privee: 'Scuola Privata',
    universites_instituts: 'Università e Istituti',
    centre_langues: 'Centro Lingue',
    centre_soutien: 'Centro di Supporto Scolastico',
    formation_professionnelle: 'Formazione Professionale',
    etablissement_prive: 'Istituzione Privata',
    etablissement_public: 'Istituzione Pubblica',
    formation_adultes: 'Formazione per Adulti',

    // Santé
    ambulance_privee: 'Ambulanza Privata',
    cabinet_dentaire: 'Studio Dentistico',
    centre_bien_etre: 'Centro Benessere',
    centre_imagerie: 'Centro di Imaging',
    centre_medical: 'Centro Medico',
    clinique: 'Clinica',
    hopital: 'Ospedale',
    kinesitherapie: 'Fisioterapia',
    laboratoire_analyses: 'Laboratorio di Analisi',
    ophtalmologie: 'Oftalmologia',
    pharmacie: 'Farmacia',
    pharmacie_nuit: 'Farmacia Notturna',
    polyclinique: 'Policlinico',
    veterinaire: 'Veterinario',

    // Magasins
    boutique_informatique: 'Negozio di Informatica',
    telephonie_mobile: 'Negozio di Telefonia',
    pret_a_porter: 'Prêt-à-porter',
    vetements_homme: 'Abbigliamento Uomo',
    vetements_femme: 'Abbigliamento Donna',
    chaussures: 'Scarpe',
    accessoires: 'Accessori',
    parfumerie: 'Profumeria',
    bijoux: 'Gioielli',
    electronique: 'Elettronica',
    electromenager: 'Elettrodomestici',
    quincaillerie: 'Ferramenta',
    bricolage: 'Fai da Te',
    jouets: 'Giocattoli',
    meubles: 'Mobili',
    articles_deco: 'Articoli per la Decorazione',
    epicerie: 'Drogheria',
    magasin_sport: 'Negozio Sportivo',
    salon_coiffure: 'Salone di Parrucchiere',
    coiffeur: 'Parrucchiere',
    barbier: 'Barbiere',
    esthetique: 'Estetica',
    spa: 'Spa',
    cafe: 'Caffè',
    cuisine_locale: 'Cucina Locale',
    cafe_culturel: 'Caffè Culturale',
    cafe_traditionnel: 'Caffè Tradizionale',
    salon_the: 'Sala da Tè',
    restaurant: 'Ristorante',
    cuisine_tunisienne: 'Cucina Tunisina',

    // Loisirs
    saveurs_traditions: 'Sapori e Tradizioni',
    musees_patrimoine: 'Musei e Patrimonio',
    escapades_nature: 'Escursioni nella Natura',
    festivals_artisanat: 'Festival e Artigianato',
    sport_aventure: 'Sport e Avventura',
  },
  ru: {
    // Entreprises
    finance: 'Финансы и Банковские Услуги',
    services_aux_entreprises: 'Бизнес-услуги',
    transport_logistique: 'Транспорт и Логистика',
    btp_construction: 'Строительство',
    industrie: 'Промышленность и Производство',
    communication_marketing: 'Коммуникации и Маркетинг',
    informatique_telecom: 'IT и Телекоммуникации',
    conseil_formation: 'Консалтинг и Обучение',
    evenementiel: 'Организация Мероприятий',
    agence_evenementielle: 'Агентство Мероприятий',
    autre_activite_pro: 'Другая Профессиональная Деятельность',

    // Éducation
    ecole_primaire: 'Начальная Школа',
    college_privee: 'Частная Средняя Школа',
    lycee_privee: 'Частный Лицей',
    ecole_privee: 'Частная Школа',
    universites_instituts: 'Университеты и Институты',
    centre_langues: 'Языковой Центр',
    centre_soutien: 'Центр Репетиторства',
    formation_professionnelle: 'Профессиональное Обучение',
    etablissement_prive: 'Частное Учреждение',
    etablissement_public: 'Государственное Учреждение',
    formation_adultes: 'Образование для Взрослых',

    // Santé
    ambulance_privee: 'Частная Скорая',
    cabinet_dentaire: 'Стоматологическая Клиника',
    centre_bien_etre: 'Велнес-центр',
    centre_imagerie: 'Центр Диагностики',
    centre_medical: 'Медицинский Центр',
    clinique: 'Клиника',
    hopital: 'Больница',
    kinesitherapie: 'Физиотерапия',
    laboratoire_analyses: 'Лаборатория',
    ophtalmologie: 'Офтальмология',
    pharmacie: 'Аптека',
    pharmacie_nuit: 'Ночная Аптека',
    polyclinique: 'Поликлиника',
    veterinaire: 'Ветеринар',

    // Magasins
    boutique_informatique: 'Компьютерный Магазин',
    telephonie_mobile: 'Магазин Мобильных Телефонов',
    pret_a_porter: 'Готовая Одежда',
    vetements_homme: 'Мужская Одежда',
    vetements_femme: 'Женская Одежда',
    chaussures: 'Обувь',
    accessoires: 'Аксессуары',
    parfumerie: 'Парфюмерия',
    bijoux: 'Ювелирные Изделия',
    electronique: 'Электроника',
    electromenager: 'Бытовая Техника',
    quincaillerie: 'Строительный Магазин',
    bricolage: 'Магазин Для Дома',
    jouets: 'Игрушки',
    meubles: 'Мебель',
    articles_deco: 'Предметы Декора',
    epicerie: 'Продуктовый Магазин',
    magasin_sport: 'Спортивный Магазин',
    salon_coiffure: 'Парикмахерская',
    coiffeur: 'Парикмахер',
    barbier: 'Барбершоп',
    esthetique: 'Салон Красоты',
    spa: 'Спа',
    cafe: 'Кафе',
    cuisine_locale: 'Местная Кухня',
    cafe_culturel: 'Культурное Кафе',
    cafe_traditionnel: 'Традиционное Кафе',
    salon_the: 'Чайная',
    restaurant: 'Ресторан',
    cuisine_tunisienne: 'Тунисская Кухня',

    // Loisirs
    saveurs_traditions: 'Вкусы и Традиции',
    musees_patrimoine: 'Музеи и Наследие',
    escapades_nature: 'Природные Маршруты',
    festivals_artisanat: 'Фестивали и Ремёсла',
    sport_aventure: 'Спорт и Приключения',
  },
  ar: {
    // Entreprises
    finance: 'المالية والخدمات المصرفية',
    services_aux_entreprises: 'خدمات الأعمال',
    transport_logistique: 'النقل واللوجستيات',
    btp_construction: 'البناء والتشييد',
    industrie: 'الصناعة والتصنيع',
    communication_marketing: 'الاتصالات والتسويق',
    informatique_telecom: 'المعلوماتية والاتصالات',
    conseil_formation: 'الاستشارات والتدريب',
    evenementiel: 'تنظيم الفعاليات',
    agence_evenementielle: 'وكالة الفعاليات',
    autre_activite_pro: 'نشاط مهني آخر',

    // Éducation
    ecole_primaire: 'مدرسة ابتدائية',
    college_privee: 'مدرسة إعدادية خاصة',
    lycee_privee: 'ثانوية خاصة',
    ecole_privee: 'مدرسة خاصة',
    universites_instituts: 'جامعات ومعاهد',
    centre_langues: 'مركز لغات',
    centre_soutien: 'مركز دعم مدرسي',
    formation_professionnelle: 'تكوين مهني',
    etablissement_prive: 'مؤسسة خاصة',
    etablissement_public: 'مؤسسة عمومية',
    formation_adultes: 'تكوين للبالغين',

    // Santé
    ambulance_privee: 'إسعاف خاص',
    cabinet_dentaire: 'عيادة أسنان',
    centre_bien_etre: 'مركز عافية',
    centre_imagerie: 'مركز تصوير طبي',
    centre_medical: 'مركز طبي',
    clinique: 'عيادة',
    hopital: 'مستشفى',
    kinesitherapie: 'علاج طبيعي',
    laboratoire_analyses: 'مخبر تحاليل',
    ophtalmologie: 'طب العيون',
    pharmacie: 'صيدلية',
    pharmacie_nuit: 'صيدلية ليلية',
    polyclinique: 'مستوصف',
    veterinaire: 'بيطري',

    // Magasins
    boutique_informatique: 'محل معلوماتية',
    telephonie_mobile: 'محل هواتف نقالة',
    pret_a_porter: 'ملابس جاهزة',
    vetements_homme: 'ملابس رجالية',
    vetements_femme: 'ملابس نسائية',
    chaussures: 'أحذية',
    accessoires: 'إكسسوارات',
    parfumerie: 'عطارة',
    bijoux: 'مجوهرات',
    electronique: 'إلكترونيات',
    electromenager: 'أجهزة منزلية',
    quincaillerie: 'بيع مواد البناء',
    bricolage: 'محل أعمال يدوية',
    jouets: 'ألعاب',
    meubles: 'أثاث',
    articles_deco: 'مواد ديكور',
    epicerie: 'بقالة',
    magasin_sport: 'محل رياضي',
    salon_coiffure: 'صالون حلاقة',
    coiffeur: 'حلاق',
    barbier: 'حلاق',
    esthetique: 'تجميل',
    spa: 'سبا',
    cafe: 'مقهى',
    cuisine_locale: 'مطبخ محلي',
    cafe_culturel: 'مقهى ثقافي',
    cafe_traditionnel: 'مقهى تقليدي',
    salon_the: 'صالون شاي',
    restaurant: 'مطعم',
    cuisine_tunisienne: 'مطبخ تونسي',

    // Loisirs
    saveurs_traditions: 'نكهات وتقاليد',
    musees_patrimoine: 'متاحف وتراث',
    escapades_nature: 'رحلات طبيعية',
    festivals_artisanat: 'مهرجانات وحرف يدوية',
    sport_aventure: 'رياضة ومغامرة',
  },
};

// Mapping des catégories Airtable vers les clés de traduction SEO
const AIRTABLE_TO_SEO_MAPPING: Record<string, string> = {
  // Automobile
  'Garage Mécanique': 'Garage Mécanique',
  'Tôlerie & Peinture': 'Tôlerie & Peinture',
  'Lavage Auto': 'Lavage Auto',
  'Pièces de rechange': 'Pièces de rechange',
  'Diagnostic électronique': 'Diagnostic électronique',
  'Vente de Voitures': 'Vente de Voitures',
  'Automobile': 'Automobile',

  // Alimentation
  'Alimentation': 'Alimentation',
  'Supermarché': 'Supermarché',
  'Boulangerie': 'Boulangerie',
  'Pâtisserie': 'Pâtisserie',
  'Boucherie': 'Boucherie',

  // Médical
  'Médecin Généraliste': 'Médecin Généraliste',
  'Dentiste': 'Dentiste',
  'Pharmacie': 'Pharmacie',
  'Laboratoire d\'analyses': 'Laboratoire d\'analyses',
  'Pédiatre': 'Pédiatre',
  'Ophtalmologue': 'Ophtalmologue',
  'Clinique': 'Clinique',

  // BTP
  'Plomberie': 'Plomberie',
  'Électricité': 'Électricité',
  'Peintre en bâtiment': 'Peintre en bâtiment',
  'Maçonnerie': 'Maçonnerie',
  'Climatisation': 'Climatisation',
  'Menuisier': 'Menuisier',

  // Informatique
  'Informatique & Télécom': 'Informatique & Télécom',
  'Réparation PC': 'Réparation PC',
  'Vente Téléphones': 'Vente Téléphones',
  'Développement Web': 'Développement Web',

  // Justice
  'Avocat': 'Avocat',
  'Notaire': 'Notaire',
  'Huissier de Justice': 'Huissier de Justice',
  'Expert Comptable': 'Expert Comptable',

  // Tourisme
  'Maison d\'Hôtes (Dar)': 'Maison d\'Hôtes',
  'Hôtel typique': 'Hôtel typique',
  'Agence de Voyage': 'Agence de Voyage',

  // Banque
  'Banque (Agence)': 'Banque',
  'Bureau de Change': 'Bureau de Change',

  // Immobilier
  'Agence Immobilière': 'Agence Immobilière',
  'Immobilier': 'Immobilier'
};

// Traductions des catégories SEO
const SEO_CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Catégories principales
  'Alimentation': { fr: 'Alimentation', en: 'Food & Grocery', ar: 'التغذية', it: 'Alimentazione', ru: 'Продукты питания' },
  'Automobile': { fr: 'Automobile', en: 'Automotive', ar: 'السيارات', it: 'Automobili', ru: 'Автомобили' },
  'Banque & Assurance': { fr: 'Banque & Assurance', en: 'Banking & Insurance', ar: 'البنوك والتأمين', it: 'Banche e Assicurazioni', ru: 'Банки и Страхование' },
  'Électronique & Composants': { fr: 'Électronique & Composants', en: 'Electronics & Components', ar: 'الإلكترونيات والمكونات', it: 'Elettronica e Componenti', ru: 'Электроника и компоненты' },
  'Artisans & BTP': { fr: 'Artisans & BTP', en: 'Trades & Construction', ar: 'الحرف والبناء', it: 'Artigiani e Edilizia', ru: 'Строительство' },
  'Informatique & Télécom': { fr: 'Informatique & Télécom', en: 'IT & Telecom', ar: 'المعلوماتية والاتصالات', it: 'Informatica e Telecom', ru: 'IT и Телеком' },
  'Justice & Juridique': { fr: 'Justice & Juridique', en: 'Law & Justice', ar: 'العدالة والقانون', it: 'Giustizia e Legale', ru: 'Юстиция и Право' },
  'Immobilier': { fr: 'Immobilier', en: 'Real Estate', ar: 'العقارات', it: 'Immobiliare', ru: 'Недвижимость' },
  'Médical': { fr: 'Médical', en: 'Medical', ar: 'الطب', it: 'Medico', ru: 'Медицина' },
  'Loisirs & Divertissement': { fr: 'Loisirs & Divertissement', en: 'Leisure & Fun', ar: 'الترفيه', it: 'Tempo libero', ru: 'Отдых и Развлечения' },

  // Sous-catégories Automobile
  'Garage Mécanique': { fr: 'Garage Mécanique', en: 'Mechanic Garage', ar: 'ميكانيك السيارات', it: 'Officina Meccanica', ru: 'Автосервис' },
  'Tôlerie & Peinture': { fr: 'Tôlerie & Peinture', en: 'Bodywork & Paint', ar: 'حدادة ودهان', it: 'Carrozzeria e Verniciatura', ru: 'Кузовные работы' },
  'Lavage Auto': { fr: 'Lavage Auto', en: 'Car Wash', ar: 'غسيل سيارات', it: 'Lavaggio Auto', ru: 'Автомойка' },
  'Pièces de rechange': { fr: 'Pièces de rechange', en: 'Spare Parts', ar: 'قطع غيار', it: 'Pezzi di ricambio', ru: 'Запчасти' },
  'Diagnostic électronique': { fr: 'Diagnostic électronique', en: 'Electronic Diagnostic', ar: 'تشخيص إلكتروني', it: 'Diagnosi Elettronica', ru: 'Диагностика' },
  'Vente de Voitures': { fr: 'Vente de Voitures', en: 'Car Sales', ar: 'بيع السيارات', it: 'Vendita Auto', ru: 'Продажа авто' },

  // Sous-catégories Médical
  'Médecin Généraliste': { fr: 'Médecin Généraliste', en: 'General Practitioner', ar: 'طبيب عام', it: 'Medico di Base', ru: 'Терапевт' },
  'Dentiste': { fr: 'Dentiste', en: 'Dentist', ar: 'طبيب أسنان', it: 'Dentista', ru: 'Стоматолог' },
  'Pharmacie': { fr: 'Pharmacie', en: 'Pharmacy', ar: 'صيدلية', it: 'Farmacia', ru: 'Аптека' },
  'Laboratoire d\'analyses': { fr: 'Laboratoire d\'analyses', en: 'Analysis Lab', ar: 'مخبر تحاليل', it: 'Laboratorio Analisi', ru: 'Лаборатория' },
  'Pédiatre': { fr: 'Pédiatre', en: 'Pediatrician', ar: 'طبيب أطفال', it: 'Pediatra', ru: 'Педиатр' },
  'Ophtalmologue': { fr: 'Ophtalmologue', en: 'Ophthalmologist', ar: 'طبيب عيون', it: 'Oculista', ru: 'Офтальмолог' },
  'Clinique': { fr: 'Clinique', en: 'Clinic', ar: 'مصحة', it: 'Clinica', ru: 'Клиника' },

  // Sous-catégories BTP
  'Plomberie': { fr: 'Plomberie', en: 'Plumbing', ar: 'سباكة', it: 'Idraulica', ru: 'Сантехника' },
  'Électricité': { fr: 'Électricité', en: 'Electricity', ar: 'كهرباء', it: 'Elettricità', ru: 'Электрика' },
  'Peintre en bâtiment': { fr: 'Peintre en bâtiment', en: 'House Painter', ar: 'دهان مباني', it: 'Imbianchino', ru: 'Маляр' },
  'Maçonnerie': { fr: 'Maçonnerie', en: 'Masonry', ar: 'بناء', it: 'Muratura', ru: 'Каменные работы' },
  'Climatisation': { fr: 'Climatisation', en: 'Air Conditioning', ar: 'تكييف', it: 'Climatizzazione', ru: 'Кондиционирование' },
  'Menuisier': { fr: 'Menuisier', en: 'Carpenter', ar: 'نجارة', it: 'Falegname', ru: 'Плотник' },

  // Alimentation
  'Supermarché': { fr: 'Supermarché', en: 'Supermarket', ar: 'ماركت', it: 'Supermercato', ru: 'Супермаркет' },
  'Boulangerie': { fr: 'Boulangerie', en: 'Bakery', ar: 'مخبزة', it: 'Panetteria', ru: 'Пекарня' },
  'Pâtisserie': { fr: 'Pâtisserie', en: 'Pastry', ar: 'حلويات', it: 'Pasticceria', ru: 'Кондитерская' },
  'Boucherie': { fr: 'Boucherie', en: 'Butcher', ar: 'قصابة', it: 'Macelleria', ru: 'Мясная лавка' },

  // Immobilier
  'Agence Immobilière': { fr: 'Agence Immobilière', en: 'Real Estate Agency', ar: 'وكالة عقارية', it: 'Agenzia Immobiliare', ru: 'Агентство' },

  // Banque
  'Banque': { fr: 'Banque', en: 'Bank', ar: 'بنك', it: 'Banca', ru: 'Банк' },
  'Bureau de Change': { fr: 'Bureau de Change', en: 'Currency Exchange', ar: 'مكتب صرف', it: 'Cambio valute', ru: 'Обмен валюты' },

  // Tourisme
  'Maison d\'Hôtes': { fr: 'Maison d\'Hôtes', en: 'Guest House', ar: 'دار ضيافة', it: 'Casa vacanze', ru: 'Гостевой дом' },
  'Hôtel typique': { fr: 'Hôtel typique', en: 'Boutique Hotel', ar: 'فندق سياحي', it: 'Hotel tipico', ru: 'Бутик-отель' },
  'Agence de Voyage': { fr: 'Agence de Voyage', en: 'Travel Agency', ar: 'وكالة أسفار', it: 'Agenzia di Viaggi', ru: 'Турагентство' },

  // Justice
  'Avocat': { fr: 'Avocat', en: 'Lawyer', ar: 'محامي', it: 'Avvocato', ru: 'Юрист' },
  'Notaire': { fr: 'Notaire', en: 'Notary', ar: 'عدل إشهاد', it: 'Notaio', ru: 'Нотариус' },
  'Huissier de Justice': { fr: 'Huissier de Justice', en: 'Bailiff', ar: 'عدل تنفيذ', it: 'Ufficiale Giudiziario', ru: 'Судебный пристав' },
  'Expert Comptable': { fr: 'Expert Comptable', en: 'Accountant', ar: 'خبير محاسب', it: 'Commercialista', ru: 'Бухгалтер' }
};

export function useCategoryTranslation() {
  const { language } = useLanguage();

  const getCategory = (key: string): string => {
    // D'abord, essayer la traduction SEO
    const seoKey = AIRTABLE_TO_SEO_MAPPING[key] || key;
    if (SEO_CATEGORY_TRANSLATIONS[seoKey]) {
      return SEO_CATEGORY_TRANSLATIONS[seoKey][language] || SEO_CATEGORY_TRANSLATIONS[seoKey].fr || seoKey;
    }

    // Fallback vers le système existant
    return categoryTranslations[language]?.[key] || categoryTranslations.fr[key] || key;
  };

  const getAllCategories = (keys: string[]): Array<{ value: string; label: string }> => {
    return keys.map(key => ({
      value: key,
      label: getCategory(key),
    }));
  };

  return {
    getCategory,
    getAllCategories,
    language,
  };
}
